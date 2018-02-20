
Machine.cog({

    display: '<div name="tabs" class="tabs"><ul>' +
        '<slot name="list"></slot>' +
    '</ul></div>',

    relays: {
        items: '.items',
        clickTo$: 'props * toEither'
    },

    nodes: {
        tabs: '.classes # CLASSES'
    },


    chains: {
          list: {url: 'BULMA list_item.js', config: 'props', source: 'items', clickTo: 'clickTo$'}
    },

    toEither: function(msg){
        return msg.clickTo || msg.activeFrom;
    }


});