
import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';
import Catbus from './catbus.es.js';
import Gear from './gear.js';
import Chain from './chain.js';
import PartBuilder from './partBuilder.js';
import AlterDom from './alterDom.js';
import Placeholder from './placeholder.js';


let _id = 0;

const validTags = {COG: true, CHAIN: true, GEAR: true, SLOT: true};

function Cog(url, slot, parent, def, key){

    def = def || {};

    this.id = ++_id;
    this.type = 'cog';
    this.dead = false;

    this.head = null;
    this.tail = null;
    this.first = null;
    this.last = null;
    this.virtual = !slot;
    this.placeholder = slot;
    this.elements = [];
    this.namedSlots = {};
    this.namedElements = {};
    this.children = [];
    this.parent = parent || null;
    this.scope = parent ? parent.scope.createChild() : Catbus.createChild();
    this.url = url;
    this.root = '';
    this.script = null;
    this.def = def;


    this.defineProps(def);

    //this.index = index;
    this.key = key;
    this.scriptMonitor = null;
    this.aliasValveMap = null;
    this.aliasContext = null;

    this.load();

}



Cog.prototype.mountDisplay = function() {

    if(!this.script.display) // check for valid html node
        return;

    let frag = this.script.__frag.cloneNode(true);

    const named = frag.querySelectorAll('[name]');
    const len = named.length;
    const hash = this.namedElements;
    const scriptEls = this.script.els = {};
    const scriptDom = this.script.dom = {};

    for(let i = 0; i < len; ++i){
        const el = named[i];
        const name = el.getAttribute('name');
        const tag = el.tagName;
        //  if(validTags[tag]){
        // //     console.log('tag is:', tag);
        // // if(tag === 'SLOT'){
        //     this.namedSlots[name] = el;
        // } else {
            hash[name] = el;
            scriptEls[name] = el;
            scriptDom[name] = new AlterDom(el);
        // }
    }

    this.elements = [].slice.call(frag.childNodes, 0);
    this.placeholder.parentNode.insertBefore(frag, this.placeholder);
    Placeholder.give(this.placeholder);
    this.placeholder = null;

};


Cog.prototype.load = function() {

    if(ScriptLoader.has(this.url)){
        this.onScriptReady();
    } else {
        ScriptLoader.request(this.url, this.onScriptReady.bind(this));
    }

};

Cog.prototype.onScriptReady = function() {

    const def = ScriptLoader.read(this.url);
    this.script = Object.create(def);
    this.script.id = this.id;
    this.script.config = this.config;
    this.script.cog = this;
    this.root = this.script.root;
    this.prep();

};


Cog.prototype.prep = function(){

    const parent = this.parent;
    const aliasValveMap = parent ? parent.aliasValveMap : null;
    // const aliasList = this.script.alias;
    const aliasHash = this.script.aliases;

    if(parent && parent.root === this.root && !aliasHash && !aliasValveMap){
        // same relative path, no new aliases and no valves, reuse parent context
        this.aliasContext = parent.aliasContext;
        this.aliasContext.shared = true;
    } else {
        // new context, apply valves from parent then add aliases from cog
        this.aliasContext = parent
            ? parent.aliasContext.clone(this.root)
            : new AliasContext(this.root); // root of application
        this.aliasContext.restrictAliasList(aliasValveMap);
        //this.aliasContext.injectAliasList(aliasList);
        this.aliasContext.injectAliasHash(aliasHash);
    }

    this.script.prep();
    this.loadLibs();

};


Cog.prototype.loadLibs = function loadLibs(){

    const defs = [];
    const script = this.script;

    for(const name in script.libs){
        const def = script.libs[name];
        defs.push(def);
    }

    const urls = this.libUrls = this.aliasContext.freshUrls(defs);

    if (urls.length) {
        this.scriptMonitor = new ScriptMonitor(urls, this.buildLibs.bind(this));
    } else {
        this.buildLibs();
    }

};

Cog.prototype.buildLibs = function buildLibs() {

    const script = this.script;
    const libs = script.libs;
    const context = this.aliasContext;

    for (const name in libs) {
        const def = libs[name];
        const url = context.resolveUrl(def.url);
        const lib = ScriptLoader.read(url);
        script[name] = lib;

    }

    this.build();
};

//
// Cog.prototype.loadTraits = function loadTraits(){
//
//     const urls = this.traitUrls = this.aliasContext.freshUrls(this.script.traits);
//
//     if(urls.length){
//         this.scriptMonitor = new ScriptMonitor(urls, this.build.bind(this));
//     } else {
//         this.build();
//     }
//
// };

Cog.prototype.subscribeToParentSource = PartBuilder.subscribeToParentSource;
Cog.prototype.extendDefToConfig = PartBuilder.extendDefToConfig;
Cog.prototype.extendConfigAndSourceToProps = PartBuilder.extendConfigAndSourceToProps;
Cog.prototype.buildStates = PartBuilder.buildStates;
Cog.prototype.buildWires = PartBuilder.buildWires;
Cog.prototype.buildRelays = PartBuilder.buildRelays;
Cog.prototype.buildActions = PartBuilder.buildActions;
Cog.prototype.output = PartBuilder.output;
Cog.prototype.buildConfig = PartBuilder.buildConfig;
Cog.prototype.defineProps = PartBuilder.defineProps;

Cog.prototype.buildEvents = function buildEvents(){

    // todo add compile check -- 'target el' not found in display err!

    const nodes = this.script.nodes;
    const scope = this.scope;

    for(const name in nodes){

        const value = nodes[name];
        const el = this.script.els[name];

        _ASSERT_HTML_ELEMENT_EXISTS(name, el);

        if(Array.isArray(value)){
            for(let i = 0; i < value.length; ++i){
                const bus = scope.bus().context(this.script).target(el).meow(value[i]);
                bus.pull();
            }
        } else {
            const bus = scope.bus().context(this.script).target(el).meow(value);
            bus.pull();
        }

    }

};

Cog.prototype.buildBuses = function buildBuses(){

    const buses = this.script.buses;
    const scope = this.scope;

    const len = buses.length;

    for(let i = 0; i < len; ++i){

        const def = buses[i];
        const bus = scope.bus().context(this.script).meow(def); // todo add function support not just meow str
        bus.pull();

    }

};

Cog.prototype.buildTraits = function buildTraits(){

    const traits = this.script.traits;
    const children = this.children;

    for(let i = 0; i < traits.length; i++) {

        const def = traits[i] || null;
        const url = this.aliasContext.resolveUrl(def.url, def.root);
        let trait = new Cog(url, null, this, def);
        children.push(trait);

    }

};


Cog.prototype.buildCogs = function buildCogs(){

    const cogs = this.script.cogs;
    const children = this.children;
    const aliasContext = this.aliasContext;
    // todo work this out in script load for perf
    const count = this.elements.length;

    this.first = count ? this.elements[0] : null;
    this.last = count ? this.elements[count - 1] : null;

    for(const slotName in cogs){

        const def = cogs[slotName] || null;

        const slot = this.namedElements[slotName];
        let cog;

        if(def.type === 'gear') {
            cog = new Gear(def.url, slot, this, def);
        } else if (def.type === 'chain') {
            const url = aliasContext.resolveUrl(def.url, def.root);
            cog = new Chain(url, slot, this, def, def.source);
        } else {
            const url = aliasContext.resolveUrl(def.url, def.root);
            cog = new Cog(url, slot, this, def);
        }

        children.push(cog);

        if(slot === this.first)
            this.head = cog;

        if(slot === this.last)
            this.tail = cog;

    }


};

Cog.prototype.buildGears = function buildGears(){

    const gears = this.script.gears;
    const children = this.children;
    const count = this.elements.length;

    this.first = count ? this.elements[0] : null;
    this.last = count ? this.elements[count - 1] : null;

    for(const slotName in gears){

        const def = gears[slotName];

        const slot = this.namedElements[slotName];
        const gear = new Gear(def.url, slot, this, def);

        children.push(gear);

        if(slot === this.first)
            this.head = gear;

        if(slot === this.last)
            this.tail = gear;

    }


};

Cog.prototype.buildChains = function buildChains(){

    const chains = this.script.chains;
    const children = this.children;
    const aliasContext = this.aliasContext;
    // todo work this out in script load for perf
    const count = this.elements.length;

    this.first = count ? this.elements[0] : null;
    this.last = count ? this.elements[count - 1] : null;

    for(const slotName in chains){

        const def = chains[slotName];

        const slot = this.namedElements[slotName];

        const url = aliasContext.resolveUrl(def.url, def.root);
        const chain = new Chain(url, slot, this, def, def.source);

        children.push(chain);

        if(slot === this.first)
            this.head = chain;

        if(slot === this.last)
            this.tail = chain;

    }


};


Cog.prototype.getNamedElement = function getNamedElement(name){

    if(!name)
        return null;

    const el = this.namedElements[name];

    if(!el)
        throw new Error('Named element ' + name + ' not found in display!');

    return el;

};




Cog.prototype.build = function build(){ // urls loaded

    // script.prep is called earlier

    // todo make relays dynamic to config/source changes
    // currently: hack on first data

    this.script.init();

    this.buildStates();
    this.buildWires();
    this.buildRelays();
    this.buildActions();

    if(!this.virtual)
        this.mount(); // mounts display, calls script.mount, then mount for all traits

    // todo possibly init/refresh states and wires here?


    this.buildBuses();
    this.buildEvents();

    if(!this.virtual) {
        this.buildCogs(); // placeholders for direct children, async loads possible
        this.buildGears();
        this.buildChains();
    }

    this.buildTraits(); // virtual cogs

    this.start(); // calls start for all traits

};

Cog.prototype.getFirstElement = function(){

    let c = this;
    while(c && !c.placeholder && c.elements.length === 0){
        c = c.head;
    }

    return c.placeholder || c.elements[0];

};

Cog.prototype.getLastElement = function(){

    let c = this;
    while(c && !c.placeholder && c.elements.length === 0){
        c = c.tail;
    }
    return c.placeholder || c.elements[c.elements.length - 1];

};

Cog.prototype.mount = function mount(){

    this.mountDisplay();
    this.script.mount();

};

Cog.prototype.start = function start(){

    this.script.start();

};

Cog.prototype.restorePlaceholder = function restorePlaceholder(){

};

Cog.prototype.destroy = function(){

    this.dead = true;


    for(let i = 0; i < this.children.length; ++i){
        const c = this.children[i];
        c.destroy();
    }

    for(let i = 0; i < this.elements.length; ++i){
        const e = this.elements[i];
        if(e.parentNode)
            e.parentNode.removeChild(e);
    }

    this.script.destroy();
    this.scope.destroy();
    this.children = [];

};

function _ASSERT_HTML_ELEMENT_EXISTS(name, el){
    if(!el){
        throw new Error('HTML Element + named [' + name + '] not found in display!' )
    }
}

export default Cog;
