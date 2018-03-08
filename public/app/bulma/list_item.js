
Machine.cog({

    display: '<li name="item"><gear url="renderer" config="props"></gear></li>',

    relays: {
        clickTo$: '.clickTo',
        activeFrom: '.activeFrom'
    },

    nodes: {
        item: [
            '@ click * preventDefault | .value, .toggle, activeFrom * toClickValue > clickTo$',
            'active * toActiveClass # TO_CLASS'
        ]
    },

    preventDefault: function(e){
        e.preventDefault();
        return e;
    },

    calcs: {

        active: '.value, .toggle?, activeFrom * isActive',
        renderer: '.renderer * toRenderer'

    },

    toRenderer: function(renderer){

        return renderer || './items/anchor.js';

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

    toActiveClass(active){
        return active ? 'is-active' : '';
    },

    defaultClickTo(msg){
        return msg.clickTo || msg.activeFrom;
    }



});