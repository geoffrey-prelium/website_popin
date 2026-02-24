/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

// 1. Public Widget to Render the Block
publicWidget.registry.SharedBlock = publicWidget.Widget.extend({
    selector: '.s_shared_block',
    disabledInEditableMode: false,

    start: function () {
        var self = this;
        var blockId = this.$el.data('block-id');

        if (blockId && blockId !== 0) {
            this._fetchContent(blockId);
        }
        return this._super.apply(this, arguments);
    },

    _fetchContent: function (blockId) {
        var self = this;
        rpc('/website_popin/get_shared_content', {
            block_id: parseInt(blockId)
        }).then(function (content) {
            if (content) {
                self.$el.html(content);
            }
        });
    },
});
