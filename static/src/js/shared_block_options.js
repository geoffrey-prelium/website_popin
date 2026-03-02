/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";
import { rpc } from "@web/core/network/rpc";

options.registry.SharedBlockOptions = options.Class.extend({

    start: async function () {
        await this._super(...arguments);
        return this._fetchBlocks();
    },

    /**
     * Fetch blocks to populate the dropdown
     */
    _fetchBlocks: async function () {
        const blocks = await rpc('/website_popin/get_shared_blocks_list', {});

        const $select = this.$el.find('we-select');
        // Clear old dynamically added options, keep "None"
        $select.find('we-button[data-set-shared-block]:not([data-set-shared-block="0"])').remove();

        blocks.forEach(block => {
            $select.append(`<we-button data-set-shared-block="${block.id}">${block.name}</we-button>`);
        });
    },

    /**
     * Method called when an option is selected
     */
    setSharedBlock: function (previewMode, widgetValue, params) {
        this.$target.attr('data-block-id', widgetValue);

        // Force reload the content in the editor if a block is selected
        if (widgetValue !== "0") {
            rpc('/website_popin/get_shared_content', {
                block_id: parseInt(widgetValue)
            }).then(content => {
                if (content) {
                    this.$target.html(content);
                } else {
                    this.$target.html('<div class="container"><div class="alert alert-info text-center mb-0">Empty Shared Block</div></div>');
                }
            });
        } else {
            this.$target.html('<div class="container"><div class="alert alert-info text-center mb-0">Shared Block: Select a block in options</div></div>');
        }
    },
});
