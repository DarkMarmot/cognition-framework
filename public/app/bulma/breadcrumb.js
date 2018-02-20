
Machine.cog({

    display: '<div name="breadcrumb"><ul>' +
    '<slot name="list_items" config="props" source="items"></slot>' +
    '</ul></div>',

    relays: {
        items: '.items'
    },

    buses: [
        '.classes * render'
    ],

    render: function(classes){

        this.dom.breadcrumb.setClasses('breadcrumb ' + (classes || ''));

    },

    chains: {
        list_items: {url:'BULMA list_item.js', config:'props', source:'items'}
    }

});