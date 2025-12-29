from odoo import http
from odoo.http import request
import re
import werkzeug

class WebsitePopinController(http.Controller):

    @http.route('/website_popin/get_popins', type='json', auth="public", website=True)
    def get_popins(self, url, **kwargs):
        """ Fetch matching popins for the current URL. """
        
        domain = ['|', ('website_ids', '=', False), ('website_ids', 'in', [request.website.id])]
        domain += [('active', '=', True)]
        
        # We fetch potential candidates and filter in python for complex matching
        popins = request.env['website.popin'].search(domain)
        matching_popins = []
        
        user_is_logged = not request.env.user._is_public()

        # Attempt to identify current page/blog
        # This is approximated by URL
        # Ideally, we would need the record ID passed from JS if possible, but URL is decent
        
        current_page_id = None
        
        for popin in popins:
            # 1. Visitor Type Check
            if popin.visitor_type == 'logged_in' and not user_is_logged:
                continue
            if popin.visitor_type == 'anonymous' and user_is_logged:
                continue
            # 'new' visitor check is done in JS (cookie matches)
            
            # 2. Targeting Check
            match = False
            
            # 2a. Global targeting (no constraints) - if explicit targets match, good. if patterns match, good.
            # If NO targeting criteria set? Assuming it applies to all pages?
            # Let's say if no pages/blogs/patterns matched, it might be global if intended.
            # But usually it's safer to require at least one target or empty means all?
            # Let's assume empty target_url_patterns AND empty page_ids = ALL PAGES? 
            # Or safer: if specific pages defined, must match.
            
            has_targeting = bool(popin.page_ids or popin.blog_post_ids or popin.target_url_patterns)
            
            if not has_targeting:
                match = True
            
            # 2b. URL Pattern Matching
            if not match and popin.target_url_patterns:
                patterns = popin.target_url_patterns.split('\n')
                for pattern in patterns:
                    pattern = pattern.strip()
                    if not pattern: continue
                    # Transform wildcard * to regex .*
                    regex = '^' + re.escape(pattern).replace('\\*', '.*') + '$'
                    if re.search(regex, url):
                        match = True
                        break
            
            # 2c. Page/Blog Matching
            # Try to resolve page from URL
            if not match and (popin.page_ids or popin.blog_post_ids):
                # Optimize: only search once
                if current_page_id is None:
                     # Match standard page
                     page = request.env['website.page'].search([
                        ('url', '=', url), 
                        ('website_id', 'in', [False, request.website.id])
                     ], limit=1)
                     current_page_id = page.id if page else False
                     
                     # Match Blog Post (URL usually /blog/blog-name/post-slug)
                     # This is harder to reverse strictly from URL without routing map.
                     # But if we are on a blog post, the controller usually sets main_object.
                     # request.env['website'].get_current_website().get_current_page()?
                     # Cleaner: use request.env.context.get('main_object')? 
                     # RPC doesn't have the context of the rendered page unfortunately.
                     # So we rely on URL matching for Blog Post?
                     # Or we trust that Odoo routing keeps URL consistent.
                     # Let's try to match Blog Post by URL field if it exists or computed path.
                     # popin.blog_post_ids is M2M.
                
                if current_page_id and current_page_id in popin.page_ids.ids:
                    match = True
                
                # For blog posts, we might be out of luck with just URL in vanilla RPC
                # unless we do regex on the blog post URLs.
                # Alternative: The JS sends the main_object ID if available (data-main-object).
                # But let's leave it for now or implement a basic check if blog module active.
            
            if match:
                matching_popins.append({
                    'id': popin.id,
                    'type': popin.type,
                    'content': popin.content,
                    'trigger_type': popin.trigger_type,
                    'trigger_delay': popin.trigger_delay,
                    'trigger_scroll': popin.trigger_scroll,
                    'trigger_selector': popin.trigger_selector,
                    'frequency': popin.frequency,
                    'frequency_days': popin.frequency_days,
                    'visitor_type': popin.visitor_type,
                })
        
        return matching_popins

    @http.route('/website_popin/track_view', type='json', auth="public", website=True)
    def track_view(self, popin_id, url=None):
        popin = request.env['website.popin'].browse(popin_id).exists()
        if popin:
            popin.sudo().view_count += 1
            if url:
                # Update Page Stats
                # Clean URL (remove query params for grouping?) - keeping raw for now or path only
                # Usually we want path.
                parsed_url = werkzeug.urls.url_parse(url)
                path = parsed_url.path
                
                stat = request.env['website.popin.page.stat'].sudo().search([
                    ('popin_id', '=', popin.id),
                    ('page_url', '=', path)
                ], limit=1)
                
                if not stat:
                    stat = request.env['website.popin.page.stat'].sudo().create({
                        'popin_id': popin.id,
                        'page_url': path,
                    })
                stat.view_count += 1
        return True

    @http.route('/website_popin/click', type='http', auth="public", website=True)
    def track_click(self, popin_id, url, link_id=None, **kwargs):
        popin = request.env['website.popin'].browse(int(popin_id)).exists()
        if popin:
            popin.sudo().click_count += 1
            
            # Track Link Specific
            if link_id:
                link = request.env['website.popin.link'].sudo().browse(int(link_id))
                if link and link.popin_id.id == popin.id:
                    link.click_count += 1
            
            # Track Page Click (Need Referer or passed param? Referer is unreliable)
            # We don't easily know which page generated the click unless we pass it in query.
            # But the rewrite didn't add page url.
            # We can rely on Referer for this basic stat.
            referer = request.httprequest.referrer
            if referer:
                 parsed = werkzeug.urls.url_parse(referer)
                 path = parsed.path
                 stat = request.env['website.popin.page.stat'].sudo().search([
                    ('popin_id', '=', popin.id),
                    ('page_url', '=', path)
                ], limit=1)
                 if stat:
                     stat.click_count += 1
        
        return werkzeug.utils.redirect(url or '/')
