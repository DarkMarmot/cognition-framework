
Machine.cog({

    display: '<a name="anchor"></a>',

    buses: [
        '.label * render'
    ],

    render: function(label){

        this.dom.anchor.text(label);

    }

});