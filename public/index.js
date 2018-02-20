
Machine.cog({

    mount: function(){
console.log('index mount');
    },


    display:

        // '<div>' +
        //     'Welcome to the Machine' +
        // '</div>' +
        // '<cog url="LOVELACE"></cog>' +
        // // '<div class="tabs is-toggle"><ul><slot name="menu"></slot></ul></div>' +
        // '<slot name="button"></slot>' +
        // '<cog url="BULMA progress.js" config="_progress"></cog>' +
        // // '<cog url="BULMA_ITEMS anchor.js" config="_anchor"></cog>' +
        // '<cog url="BULMA_ITEMS icon_label.js" config="meowing"></cog>' +
        '<slot name="selectable"></slot>' +
        '<cog url="BULMA tabs.js" config="_tabsConfig"></cog>'
        // '<cog url="BULMA breadcrumb.js" config="_breadcrumbConfig"></cog>' +
    // '<slot name="grid"></slot>'
        // '<cog url="BULMA list.js" config="_breadcrumbConfig"></cog>'
    // '<div class="tabs is-toggle"><ul><slot name="chain"></slot></ul></div>',
,

    aliases: {

        APP: './app',
        REM: 'APP rem',
        REM_CELLS: 'REM cells',
        JS: './js',
        LOVELACE: 'APP lovelace.js',
        D3: 'JS d3.min.js',
        BULMA: 'APP bulma',
        BULMA_ITEMS: 'BULMA items',
        TRAIT: 'APP traits',
        // AUTH_API: 'http://apiv3.iucnredlist.org/api/v3/version'
        AUTH_API: './api/topology.json'

    },

    actions: {
      authResponse$: ' > _authResponse' // todo require verb
    },

    states: {

        _authResponse: 'cat',
        _anchor: function(){ return { label: 'Kitten Happy!'}},
        _progress: function(){ return { valueFrom: '_animalPct'}},

        others: function(){ return [
            {label: 'frog', value: 'x', icon: 'fa fa-home'},
            {label: 'salamander', value: 'y', icon: 'fa fa-cog'},
            {label: 'toad', value: 'b', icon: 'fa fa-space-shuttle'}
        ];},
        animal: '',
        _animalPct: .74,
        _animals: function(){ return [
                {label: 'cat', value: 'c', icon: 'fa fa-home'},
                {label: 'dog', value: 'd', icon: 'fa fa-cog'},
                {label: 'bunny', value: 'b', icon: 'fa fa-space-shuttle'}
            ];},

        _breadcrumbConfig: function(){ return {

                renderer: 'BULMA_ITEMS icon_label.js',
                items: '_animals',
                clickTo: 'animal$',
                activeFrom: 'animal',
                active: 'active',
                classes: '',

            }
        },

        _tabsConfig: function(){ return {

                renderer: 'BULMA_ITEMS icon_label.js',
                items: () => ([{label: 'moo', value: 'c', icon: 'fa fa-home'},
                    {label: 'puppy', value: 'd', icon: 'fa fa-cog'},
                    {label: 'car', value: 'b', icon: 'fa fa-space-shuttle'}
                ])
                ,
                clickTo: 'animal',
                activeFrom: 'animal',
                classes: {'is-right': true, 'is-toggle': true, 'is-boxed': true, 'is-large': true},

            }
        },

        _gridConfig: function(){ return {

                records: '_animals',
                columns: '_gridColumns'

            }
        },

        _gridColumns: function(){ return [{field: 'label', renderer: 'REM_CELLS text.js'},
            {field: 'icon', },
            {field: 'value', renderer: 'REM_CELLS text.js'}]
        },


        meowing: function(){
            return {
                label: 'meowowowo',
                icon: 'fa fa-edit'
            };
        }
    },

    traits: [
        {url: 'TRAIT fetch.js', api: 'AUTH_API', response$: 'authResponse$', auto: true}
    ],

    buses: [
        '_authResponse * log'
      // 'others > _animals'
    ],
    log: function(d, c){
      console.log('GOT LOG:', d, c);
    },
    // wires: {
    //     animal: 'bunny'
    // },


    libs: {
        d3: 'D3'
    },

    // chains: {
    //     chain: {
    //         url: 'BULMA selectable.js',
    //         renderer: 'BULMA_ITEMS icon_label.js',
    //         source: '_animals',
    //         clickTo: 'animal$',
    //         activeFrom: 'animal',
    //         active: 'active',
    //         classes: 'is-left is-toggle is-boxed is-large'
    //     }
    // },

    cogs: {
        // babbage: 'LOVELACE',

        // t: {
        //     url: 'BULMA tabs2.js',
        //     config: '_menuConfig'
        // },

        grid: {

            url: 'REM grid.js',
            config: '_gridConfig'

        },
        selectable: {
            url: 'BULMA tabs.js',
            renderer: 'BULMA_ITEMS icon_label.js',
            items: '_animals',
            clickTo: 'animal',
            activeFrom: 'animal',
            classes: 'is-large',
            // config: 'meow'
        },

        // progress: {
        //     url: 'BULMA progress.js',
        //     valueFrom: '_animalPct'
        // },
        // anchor: {
        //     url: 'BULMA anchor.js',
        //     label: 'Kitten Rage!'
        // },
        // icon_label: {
        //     url: 'BULMA renderers/icon_label.js',
        //     config: 'meowing'
        //     // icon: 'fa fa-dashboard',
        //     // label: 'Go Go Bunny Rangers!'
        // }
        // button: {url: './lever/cogs/button.js', renderer: './textButtonRenderer.js', label: 'Bunny', value: 'b',
        // clickTo: '$animal', activeFrom: 'animal'}
    }

    // addOne: function(msg) { return msg + 1; }

});