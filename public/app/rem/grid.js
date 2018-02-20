
Machine.cog({

    display: `<table name="table"><tbody>
        <tr name="r"></tr>
        <tr name="row"></tr>
        </tbody>
        </table>`
    ,

    cogs: {
      r: {url: 'REM row.js'}
    },

    chains: {
        row: { url: 'REM row.js', source: 'records'}
    },

    relays: {
        records: '.records',
        columns: '.columns',
    },

    calcs: {
        _config: 'props * toDefaults',
    },

    buses: [
        // '_config.tableClasses * render'
    ],

    toDefaults: function(config){

        config.records = config.records || '_records';
        config.columns = config.columns || '_columns';
        config.maxItems = config.maxItems || 20;

    },

    render: function(classes){

        this.dom.table.setClasses(classes || '');

    }

});