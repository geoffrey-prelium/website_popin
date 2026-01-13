{
    'name': 'Website Popin & Banner Builder',
    'version': '1.0',
    'category': 'Website/Marketing',
    'summary': 'Create and manage marketing popins, modals, and banners on your website.',
    'description': """
        Manage all your marketing popups in one place:
        - Create Popins with HTML content
        - Target specific pages or URL patterns
        - Trigger on load, scroll, delay, or exit intent
        - Track views and clicks
    """,
    'depends': ['website', 'website_blog', 'utm'],
    'data': [
        'security/ir.model.access.csv',
        'views/website_popin_views.xml',
        'views/website_blog_views.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'website_popin/static/src/js/website_popin.js',
        ],
    },
    'demo': [],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
