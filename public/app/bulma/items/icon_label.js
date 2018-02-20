
Machine.cog({

    display: '<a name="anchor"><span class="icon"><i name="icon"></i></span><span name="label"></span></a>',

    buses: [
        '.icon, .label * renderParts'
    ],

    renderParts: function(msg){

        this.dom.label.text(msg.label);
        this.dom.icon.setClasses(msg.icon || '');

    }


});