
Machine.cog({

    display:
        `<td name="cell">
            <gear url="renderer" config="column"></gear>
        </td>`
    ,

    calcs: {
        column: 'props',
        renderer: 'props * toRenderer',
    },

    toRenderer: function(props){
        return props.renderer || 'cells/text.js'
    }


});