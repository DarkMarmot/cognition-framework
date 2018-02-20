
Machine.cog({

    display: '<div name="text"></div>',

    buses: [
        'column, record * render'
    ],

    render: function(msg){
        const text = msg.record[msg.column.field];
        this.dom.text.text(text);
    }
    
});