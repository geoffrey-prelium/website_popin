/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.SharedBlock = publicWidget.Widget.extend({
    selector: '.s_shared_block',
    disabledInEditableMode: false,

    start: function () {
        var self = this;
        var blockId = this.$el.data('block-id');

        if (this.editableMode) {
            // In edit mode: show a selector UI
            this._showEditorUI(blockId);
        } else {
            // In public mode: load the block content
            if (blockId) {
                this._fetchContent(blockId);
            }
        }
        return this._super.apply(this, arguments);
    },

    /**
     * Clean up the editor UI before saving.
     * This is critical: without it, the dropdown HTML (option texts, preview)
     * gets saved into the page body and leaks into blog descriptions etc.
     */
    destroy: function () {
        if (this.editableMode) {
            // Leave the snippet empty so no text leaks into blog descriptions.
            // The data-block-id attribute on the <section> is preserved,
            // and the real content is loaded dynamically by JS on the public side.
            this.$el.empty();
        }
        this._super.apply(this, arguments);
    },

    /**
     * Show a selector dropdown in the editor so the user can pick a block
     */
    _showEditorUI: async function (currentBlockId) {
        var self = this;
        try {
            const blocks = await rpc('/website_popin/get_shared_blocks_list', {});

            // Build a simple selector UI
            var $container = $('<div class="container" contenteditable="false">');
            var $wrapper = $('<div class="p-3 bg-light border rounded text-center">');

            var $label = $('<label class="fw-bold d-block mb-2">').text('Shared Block: ');
            var $select = $('<select class="form-select form-select-sm d-inline-block w-auto" contenteditable="false">');
            // Prevent the Odoo editor from intercepting clicks on the select
            $select.on('mousedown click', function (e) {
                e.stopPropagation();
            });
            $select.append($('<option>').val('0').text('— Select a block —'));

            blocks.forEach(function (block) {
                var $opt = $('<option>').val(block.id).text(block.name);
                if (currentBlockId && parseInt(currentBlockId) === block.id) {
                    $opt.attr('selected', 'selected');
                }
                $select.append($opt);
            });

            $wrapper.append($label).append($select);
            $container.append($wrapper);

            // If a block is already selected, show a preview below
            if (currentBlockId) {
                var $preview = $('<div class="mt-2 border-top pt-2">');
                const content = await rpc('/website_popin/get_shared_content', {
                    block_id: parseInt(currentBlockId)
                });
                if (content) {
                    $preview.html(content);
                }
                $container.append($preview);
            }

            self.$el.empty().append($container);

            // On change: update data-block-id and refresh preview
            $select.on('change', async function () {
                var newId = $(this).val();
                self.$el.attr('data-block-id', newId);
                self.$el.data('block-id', newId);

                // Refresh preview
                if (newId && newId !== '0') {
                    const content = await rpc('/website_popin/get_shared_content', {
                        block_id: parseInt(newId)
                    });
                    $container.find('.mt-2').remove();
                    if (content) {
                        var $preview = $('<div class="mt-2 border-top pt-2">');
                        $preview.html(content);
                        $container.append($preview);
                    }
                } else {
                    $container.find('.mt-2').remove();
                }
            });
        } catch (e) {
            console.error("Error loading shared blocks list", e);
        }
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
