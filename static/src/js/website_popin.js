/** @odoo-module **/

import { rpc as jsonrpc } from "@web/core/network/rpc";
import { cookie } from "@web/core/browser/cookie";
import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.WebsitePopin = publicWidget.Widget.extend({
    selector: '#wrapwrap',

    start: function () {
        this._fetchPopins();
        return this._super.apply(this, arguments);
    },

    _fetchPopins: async function () {
        const url = window.location.pathname;
        try {
            const popins = await jsonrpc('/website_popin/get_popins', {
                url: url,
            });
            popins.forEach(popin => this._processPopin(popin));
        } catch (e) {
            console.error("Error fetching popins", e);
        }
    },

    _processPopin: function (popin) {
        // 1. Frequency Check
        if (this._shouldSuppress(popin)) {
            return;
        }

        // 2. New Visitor Check
        if (popin.visitor_type === 'new') {
            if (cookie.get('website_popin_returning')) {
                return; // Is returning
            }
        }

        // 3. Setup Trigger
        this._setupTrigger(popin);
    },

    _shouldSuppress: function (popin) {
        const key = 'website_popin_freq_' + popin.id;
        const lastView = localStorage.getItem(key);

        if (popin.frequency === 'always') return false;

        if (popin.frequency === 'session') {
            const sessionKey = key + '_sess_' + odoo.session_info.session_id; // Simple session proxy
            // Easier: use sessionStorage
            return sessionStorage.getItem(key);
        }

        if (popin.frequency === 'days' && lastView) {
            const lastTime = parseInt(lastView, 10);
            const now = Date.now();
            const daysMs = popin.frequency_days * 24 * 60 * 60 * 1000;
            if (now - lastTime < daysMs) {
                return true;
            }
        }

        return false;
    },

    _markSeen: function (popin) {
        const key = 'website_popin_freq_' + popin.id;
        const now = Date.now();

        localStorage.setItem(key, now); // For days check
        if (popin.frequency === 'session') {
            sessionStorage.setItem(key, 'true');
        }

        // Mark as returning visitor globally
        cookie.set('website_popin_returning', 'true', 365 * 24 * 60 * 60);

        // Track View in Backend
        jsonrpc('/website_popin/track_view', {
            popin_id: popin.id,
            url: window.location.href, // Pass full URL or path
        });
    },

    _setupTrigger: function (popin) {
        const show = () => this._showPopin(popin);

        if (popin.trigger_type === 'load') {
            show();
        } else if (popin.trigger_type === 'delay') {
            setTimeout(show, popin.trigger_delay * 1000);
        } else if (popin.trigger_type === 'scroll') {
            const onScroll = () => {
                const scrollPercent = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
                if (scrollPercent >= popin.trigger_scroll) {
                    window.removeEventListener('scroll', onScroll);
                    show();
                }
            };
            window.addEventListener('scroll', onScroll);
        } else if (popin.trigger_type === 'exit') {
            const onExit = (e) => {
                if (e.clientY < 10) { // Mouse leaves top
                    document.removeEventListener('mouseleave', onExit);
                    show();
                }
            };
            document.addEventListener('mouseleave', onExit);
        } else if (popin.trigger_type === 'click') {
            if (popin.trigger_selector) {
                $(document).on('click', popin.trigger_selector, (e) => {
                    e.preventDefault(); // Optional?
                    show();
                });
            }
        }
    },

    _showPopin: function (popin) {
        // Prevent double showing if multiple triggers fire
        if ($('#website_popin_' + popin.id).length) return;

        // Mark seen
        this._markSeen(popin);

        // Build HTML
        let containerClass = 'website_popin_container';
        let contentClass = 'website_popin_content';

        if (popin.type === 'modal') {
            containerClass += ' d-flex align-items-center justify-content-center fixed-top w-100 h-100 bg-black-50';
            contentClass += ' bg-white p-4 rounded shadow position-relative';
        } else if (popin.type === 'slide_in') {
            containerClass += ' position-fixed bottom-0 end-0 m-3';
            contentClass += ' bg-white p-3 rounded shadow border';
        } else if (popin.type === 'banner_top') {
            containerClass += ' position-fixed top-0 start-0 w-100';
            contentClass += ' bg-white p-2 shadow-sm d-flex justify-content-between align-items-center';
        } else if (popin.type === 'banner_bottom') {
            containerClass += ' position-fixed bottom-0 start-0 w-100';
            contentClass += ' bg-white p-2 shadow-sm d-flex justify-content-between align-items-center';
        }

        const closeBtn = '<button type="button" class="btn-close position-absolute top-0 end-0 m-2" aria-label="Close"></button>';
        const html = `
            <div id="website_popin_${popin.id}" class="${containerClass}" style="z-index: 9999;">
                <div class="${contentClass}" style="max-width: ${popin.type === 'modal' ? '600px' : '100%'}; position: relative;">
                    ${closeBtn}
                    <div class="website_popin_body">
                        ${popin.content}
                    </div>
                </div>
            </div>
        `;

        $('body').append(html);

        const $el = $('#website_popin_' + popin.id);
        $el.find('.btn-close').on('click', () => {
            $el.remove();
        });

        // Close modal on backdrop click
        if (popin.type === 'modal') {
            $el.on('click', (e) => {
                if (e.target === $el[0]) {
                    $el.remove();
                }
            });
        }
    }
});
