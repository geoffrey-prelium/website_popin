/** @odoo-module **/

import publicWidget from 'web.public.widget';
import options from 'website.editor.snippets.options';
import { jsonrpc } from "@web/core/network/rpc_service";

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
        jsonrpc('/website_popin/get_shared_content', {
            block_id: parseInt(blockId)
        }).then(function (content) {
            if (content) {
                // Replace content but keep the wrapper
                // If in edit mode, we might want to keep some handle, but usually replacement is fine if we wrap it.
                // Actually, replacing innerHTML is safer to keep snippet options working
                self.$el.html(content);
            }
        });
    },
});

// 2. Editor Option to Select Block
options.registry.SharedBlockOption = options.Class.extend({

    start: function () {
        this._super.apply(this, arguments);
        return this._loadBlocks();
    },

    _loadBlocks: function () {
        var self = this;
        return jsonrpc('/website_popin/get_shared_blocks_list', {}).then(function (blocks) {
            self.blocks = blocks;
            self._renderCustomXML();
        });
    },

    _renderCustomXML: function () {
        var self = this;
        var select = this.$el.find('we-select[data-attribute-name="blockId"]');

        // Clear existing except first
        // Note: Odoo standard widgets might be harder to manipulate directly via DOM like this 
        // because they use internal state.
        // A better way for 'we-select' is typically to define items in XML if static.
        // For dynamic, we might need a custom widget or rely on rerendering.

        // Let's try to append we-button items found in self.blocks
        // This is a bit hacky for the standard editor, but often works if done before the UI is fully instantiated.
        // If not, we might need to use the 'selectBlock' method pattern.

        // Actually, the standard way in newer Odoo versions is to override `_computeWidgetVisibility` or similar
        // or just use a custom widget that builds the UI.

        // Let's try a simpler approach: 
        // We will just use the `selectDataAttribute` standard mechanism but we need to inject the values.

        // In recent Odoo (16+), we can use `_renderOptions`.

    },

    // Override _computeWidgetState to ensure UI reflects data
    _computeWidgetState: function (methodName, params) {
        var self = this;
        if (methodName === 'blockId') {
            return this.$target.attr('data-block-id') || '0';
        }
        return this._super(...arguments);
    },

    // We need a way to populate the select. 
    // The `_renderCustomXML` above is not a standard method.
    // The standard `we-select` expects children in XML.
    // To make it dynamic, we might need to extend `select` widget or look at how `many2one` widgets work in snippets.

    // Alternative: Use a standard method to set the value.

    // Let's try this: 
    // We will build the <we-button> elements and append them to the select widget's menu *before* it opens?
    // No, `we-select` renders its items based on XML.

    // CORRECT APPROACH for Dynamic Options:
    // Override `start` and manually create the UI or use `_createOptionWidget`.
    // But `we-select` is declarative. 

    // Let's blindly try adding children to the `menu` if we can find it, or avoid `we-select` and use a custom UI interaction.
    // simpler: `selectBlock` method that opens a modal?

    // Let's try to stick to `we-select` but populate it.
    // In Odoo JS, `this.$el` in the option class refers to the snippet option DOM in the right panel.
    // We can manipulate it in `start`.

    _loadBlocks: function () {
        var self = this;
        return jsonrpc('/website_popin/get_shared_blocks_list', {}).then(function (blocks) {
            var $select = self.$el.find('we-select[data-attribute-name="blockId"]');
            // Remove all buttons except the placeholder
            $select.find('we-button').not('[data-select-data-attribute="0"]').remove();

            blocks.forEach(function (block) {
                var $button = $('<we-button/>')
                    .attr('data-select-data-attribute', block.id)
                    .text(block.name);
                $select.append($button);
            });
        });
    }

});
