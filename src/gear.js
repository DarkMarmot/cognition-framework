

import Placeholder from './placeholder.js';
import Cog from './cog.js';
import PartBuilder from './partBuilder.js';

let _id = 0;

function Gear(url, slot, parent, def, data){

    this.type = 'gear';
    this.id = ++_id;
    this.placeholder = slot;
    this.head = null;

    this.elements = [];
    this.children = [];
    this.parent = parent;
    this.scope = parent.scope.createChild();
    this.root = parent.root;

    this.aliasContext = parent.aliasContext;
    this.def = def || {};

    //this.defineProps(def, data);

    // todo add err url must be data pt! not real url (no dots in dp)


    const meow = url + ' * createCog';
    this.bus = this.scope.bus().context(this).meow(meow).pull();

}

// Gear.prototype.defineProps = PartBuilder.defineProps;
// Gear.prototype.subscribeToParentSource = PartBuilder.subscribeToParentSource;
// Gear.prototype.extendDefToConfig = PartBuilder.extendDefToConfig;
// Gear.prototype.extendConfigAndSourceToProps = PartBuilder.extendConfigAndSourceToProps;

// Gear.prototype.buildSource = function(){
//
//     const name = this.sourceName;
//
//     if(!name)
//         return;
//
//     const localSource = this.source = this.scope.demand('source');
//     const remoteSource = this.parent.scope.find(name, true);
//
//     this.scope.bus()
//         .addSubscribe(name, remoteSource)
//         .write(localSource);
//
// };

Gear.prototype.killPlaceholder = function() {

    if(!this.placeholder)
        return;

    Placeholder.give(this.placeholder);
    this.placeholder = null;

};



Gear.prototype.createCog = function createCog(msg){


    const children = this.children;
    const aliasContext = this.aliasContext;
    const url = aliasContext.resolveUrl(msg, this.root);

    if(children.length){

        const oldCog = children[0];
        const el = oldCog.getFirstElement(); //oldCog.elements[0]; // todo recurse first element for virtual cog
        const slot = Placeholder.take();
        el.parentNode.insertBefore(slot, el);
        const cog = new Cog(url, slot, this, this.def);
        children.push(cog);
        children.shift();
        oldCog.destroy();

    } else {

        const cog = new Cog(url, this.placeholder, this, this.def);
        children.push(cog);

    }



};

Gear.prototype.hasDisplayElement = function hasDisplayElement(){
    return !!(this.placeholder || this.elements.length > 0);
};


Gear.prototype.getFirstElement = function(){

    let c = this;
    while(c && !c.placeholder && c.elements.length === 0){
        c = c.head;
    }
    return c.placeholder || c.elements[0];

};


Gear.prototype.destroy =  function(){

    this.dead = true;

    const len = this.children.length;
    for(let i = 0; i < len; ++i){
        const c = this.children[i];
        c.destroy();
    }

    if(this.placeholder){
        this.killPlaceholder();
    }

    this.scope.destroy();
    this.children = [];

};

export default Gear;
