
Machine.cog({

    mount: function () {
        console.log('lovelace d3', this);
    },

    display:

        '<div name="ada" style="padding: 10px; font-size: 12px; opacity: .5;">' +
        'Ada has arrived... <span style="font-size: 24px; opacity: 0;">It\'s alright we told you what to dream.</span>' +
        'Count is: <span name="counter"></span>' +

        '</div>',


    libs: {
        d3: 'D3'
    }


});