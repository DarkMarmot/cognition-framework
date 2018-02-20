
Machine.cog({

    display: '<li name="item"><gear url="renderer" config="props"></gear></li>',

    buses: [
        'active * renderActive'
    ],

    relays: {
        clickTo$: '.clickTo',
        activeFrom: '.activeFrom'
    },

    nodes: {
        item: '@ click * preventDefault | .value, .toggle, activeFrom * toClickValue > clickTo$',
    },

    preventDefault: function(e){
        e.preventDefault();
        return e;
    },

    calcs: {

        active: '~ .value, .toggle, activeFrom * isActive',
        renderer: '.renderer * toRenderer'

    },

    toRenderer: function(renderer){

        return renderer || './renderers/anchor.js';

    },

    toClickValue: function(msg){

        const currentValue = msg.activeFrom;
        const clickValue = msg.value;

        return msg.toggle ? !currentValue : clickValue;

    },

    isActive: function(msg){

        const currentValue = msg.activeFrom;

        if(msg.toggle)
            return !!currentValue;

        return msg.value === currentValue;

    },

    renderActive: function(active){

        this.dom.item.toggleClasses({
            'is-active': active
        });

    },

    defaultClickTo(msg){
        return msg.clickTo || msg.activeFrom;
    }



});