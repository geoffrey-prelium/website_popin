from odoo import models, fields

class BlogPost(models.Model):
    _inherit = 'blog.post'

    popin_ids = fields.Many2many(
        'website.popin', 
        'website_popin_blog_post_rel', 
        'post_id', 
        'popin_id', 
        string='Linked Popins'
    )
