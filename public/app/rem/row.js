
Machine.cog({

    display: '<tr>' +
    '<td name="cells"></td>' +
        '</tr>'
    ,

    chains: {
        cells: {url: 'REM cell.js', source: 'columns'}
    },

    calcs: {
        record: 'props',
    }

});