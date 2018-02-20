
Machine.cog({

    display: '<progress name="progress"></progress>',

    relays:
        {valueFrom: '.valueFrom'}
    ,

    buses: [
        '~ valueFrom, .classes, .max * render',
    ],

    render: function(msg){

        const value = msg.valueFrom;
        const classes = msg.classes || '';
        const max = msg.max || 1;

        this.dom.progress.setClasses(classes);
        this.dom.progress.attrs({
            value: value,
            max: max
        });

    }

});