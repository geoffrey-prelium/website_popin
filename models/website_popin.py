from odoo import models, fields, api
from lxml import html
import werkzeug.urls

class WebsitePopin(models.Model):
    _name = 'website.popin'
    _description = 'Website Popin'
    _inherit = ['website.published.mixin']

    name = fields.Char(string='Name', required=True)
    active = fields.Boolean(default=True)
    type = fields.Selection([
        ('modal', 'Center Modal'),
        ('slide_in', 'Slide In (Bottom-Right)'),
        ('banner_top', 'Top Banner'),
        ('banner_bottom', 'Bottom Banner'),
    ], string='Display Type', default='modal', required=True)
    
    content = fields.Html(string='Content', sanitize=False, help="HTML content of the popin")
    
    # Targeting
    website_ids = fields.Many2many('website', string='Websites', help="Limit to specific websites. Leave empty for all.")
    page_ids = fields.Many2many('website.page', 'website_popin_page_rel', 'popin_id', 'page_id', string='Target Pages')
    blog_post_ids = fields.Many2many('blog.post', 'website_popin_blog_post_rel', 'popin_id', 'post_id', string='Target Blog Posts')
    target_url_patterns = fields.Text(string='URL Patterns', help="One pattern per line. e.g. /shop/* \n wildcard * supported.")
    
    # Triggers
    trigger_type = fields.Selection([
        ('load', 'On Page Load'),
        ('delay', 'After Delay'),
        ('scroll', 'After Scroll %'),
        ('exit', 'On Exit Intent'),
        ('click', 'On Click (Selector)'),
    ], string='Trigger', default='load', required=True)
    
    trigger_delay = fields.Integer(string='Delay (seconds)', default=5)
    trigger_scroll = fields.Integer(string='Scroll (%)', default=50)
    trigger_selector = fields.Char(string='CSS Selector', help="e.g. #my-button or .cta-class")
    
    # Frequency & Constraints
    frequency = fields.Selection([
        ('always', 'Every Visit'),
        ('session', 'Once per Session'),
        ('days', 'Once every X Days'),
    ], string='Frequency', default='always', required=True)
    
    frequency_days = fields.Integer(string='Days', default=7)
    
    visitor_type = fields.Selection([
        ('all', 'All Visitors'),
        ('new', 'New Visitors Only'),
        ('logged_in', 'Logged In Users'),
        ('anonymous', 'Anonymous Users'),
    ], string='Visitor Type', default='all', required=True)
    
    # Marketing / Tracking
    campaign_id = fields.Many2one('utm.campaign', string='Campaign')
    
    # Stats
    view_count = fields.Integer(string='Views', readonly=True, default=0)
    click_count = fields.Integer(string='Total Clicks', readonly=True, default=0)
    link_ids = fields.One2many('website.popin.link', 'popin_id', string='Tracked Links')
    page_stat_ids = fields.One2many('website.popin.page.stat', 'popin_id', string='Page Statistics')
    
    def action_view_analytics(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Analytics',
            'res_model': 'website.popin',
            'view_mode': 'form',
            'res_id': self.id,
            'view_id': False, # Force default view or specific if created
            'target': 'current',
        }
# ... (create/write/process methods same as before, preserving them if not replaced by range)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if 'content' in vals and vals['content']:
                vals['content'] = self._process_content_links(vals['content'], vals.get('id', 0))
        records = super().create(vals_list)
        for record in records:
            if record.content:
                new_content = record._process_content_links(record.content, record.id)
                if new_content != record.content:
                    record.write({'content': new_content})
        return records

    def write(self, vals):
        if 'content' in vals and vals['content']:
            if len(self) == 1:
                vals['content'] = self._process_content_links(vals['content'], self.id)
        return super().write(vals)

    def _process_content_links(self, content, popin_id):
        if not content or not popin_id:
            return content
        
        try:
            tree = html.fromstring(content)
        except Exception:
            return content # Failed to parse
            
        changed = False
        base_url = self.get_base_url()
        
        for node in tree.xpath('//a'):
            href = node.get('href')
            if not href:
                continue
                
            # Skip if already tracked or internal anchor
            if '/website_popin/click' in href or href.startswith('#'):
                continue
            
            # Label
            label = node.text_content().strip() or href
            
            # Create Link Record
            link = self.env['website.popin.link'].search([
                ('popin_id', '=', popin_id),
                ('url', '=', href)
            ], limit=1)
            
            if not link:
                link = self.env['website.popin.link'].create({
                    'popin_id': popin_id,
                    'url': href,
                    'name': label,
                })
            
            # Rewrite URL
            new_href = f'/website_popin/click?popin_id={popin_id}&url={werkzeug.urls.url_quote(href)}&link_id={link.id}'
            node.set('href', new_href)
            changed = True
            
        if changed:
            return html.tostring(tree, encoding='unicode')
        return content


class WebsitePopinLink(models.Model):
    _name = 'website.popin.link'
    _description = 'Website Popin Link'
    
    popin_id = fields.Many2one('website.popin', string='Popin', ondelete='cascade')
    url = fields.Char(string='Original URL', required=True)
    name = fields.Char(string='Link Text')
    click_count = fields.Integer(string='Clicks', default=0)

class WebsitePopinPageStat(models.Model):
    _name = 'website.popin.page.stat'
    _description = 'Popin Stats per Page'
    _order = 'view_count desc'
    
    popin_id = fields.Many2one('website.popin', string='Popin', ondelete='cascade')
    page_url = fields.Char(string='Page URL', required=True)
    view_count = fields.Integer(string='Views', default=0)
    click_count = fields.Integer(string='Clicks', default=0)


