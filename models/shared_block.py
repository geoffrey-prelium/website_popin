from odoo import models, fields

class WebsiteSharedBlock(models.Model):
    _name = 'website.shared.block'
    _description = 'Shared Content Block'
    _inherit = ['website.published.mixin']

    name = fields.Char(string='Name', required=True)
    active = fields.Boolean(default=True)
    content = fields.Html(string='Content', sanitize=False, help="HTML content of the block")
    
    # Optional: Grouping or categorization if needed later
