
const pool = [];

function createSlot(){
    const d = document.createElement('slot');
    d.style.display = 'none';
    return d;
}

const Placeholder = {};

Placeholder.take = function(){
    return pool.length ? pool.shift() : createSlot();
};

Placeholder.give = function(el){

    if(el.parentNode)
        el.parentNode.removeChild(el);

    if(el.tagName === 'SLOT') {

        if (el.hasAttribute('name'))
            el.removeAttribute('name');

        pool.push(el);

    }

};

export default Placeholder;
