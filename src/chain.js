
import AliasContext from './aliasContext.js';
import ScriptMonitor from './scriptMonitor.js';
import ScriptLoader from './scriptLoader.js';
import Placeholder from './placeholder.js';
import Catbus from './catbus.es.js';
import Cog from './cog.js';
import PartBuilder from './partBuilder.js';

let _id = 0;

function Chain(url, slot, parent, def, sourceName, keyField){

    def = def || {};

    this.type = 'chain';
    this.id = ++_id;
    this.head = null;
    this.placeholder = slot;

    this.elements = [];
    this.namedElements = {};
    this.children = [];
    this.parent = parent || null;
    this.scope = parent ? parent.scope.createChild() : Catbus.createChild();
    this.url = url;
    this.root = '';
    this.script = null;
    this.config = null; //(def && def.config) || def || {};
    this.scriptMonitor = null;
    this.aliasValveMap = null;
    this.aliasContext = null;
    this.sourceName = sourceName;
    this.keyField = keyField;
    this.bus = null;
    this.def = def;
    this.parentSourceBus = null;

    this.source = this.scope.demand('__source');
    this.defineProps(def);

    // subscribe source name to get source
    this.scope.bus()
        .context(this)
        .addSubscribe('props', this.props)
        .msg(this.subscribeToParentSource).pull(); // forwards to localSourceData

    this.load();

}

Chain.prototype.subscribeToParentSource = function(props){

    if(this.parentSourceBus)
        this.parentSourceBus.destroy();

    const parentSourceName = props.source;
    const localSourceData = this.source;

    if(!props.source){ // no source defined
        localSourceData.write([]);
        return;
    }

    if(parentSourceName && typeof parentSourceName === 'string'){

        const parentSourceData = this.parent.scope.find(parentSourceName, true);

        this.parentSourceBus = this.scope.bus().context(this)
            .addSubscribe(parentSourceName, parentSourceData)
            .write(localSourceData)
            .pull();

        return;

    }

    throw new Error('invalid source -- must be string or function');

};



Chain.prototype.defineProps = PartBuilder.defineProps;
Chain.prototype.extendDefToConfig = PartBuilder.extendDefToConfig;
Chain.prototype.extendConfigAndSourceToProps = PartBuilder.extendConfigAndSourceToProps;
Chain.prototype.defineProps = PartBuilder.defineProps;



Chain.prototype.killPlaceholder = function() {

    if(!this.placeholder)
        return;

    Placeholder.give(this.placeholder);
    this.placeholder = null;

};


Chain.prototype.load = function() {

    if(ScriptLoader.has(this.url)){
        this.onScriptReady();
    } else {
        ScriptLoader.request(this.url, this.onScriptReady.bind(this));
    }

};

Chain.prototype.onScriptReady = function() {

    this.script = Object.create(ScriptLoader.read(this.url));
    this.script.id = this.id;
    this.script.config = this.config;
    this.root = this.script.root;
    this.prep();

};


Chain.prototype.prep = function(){

    const parent = this.parent;
    const aliasValveMap = parent ? parent.aliasValveMap : null;
    //const aliasList = this.script.alias;
    const aliasHash = this.script.aliases;

    if(parent && parent.root === this.root && !aliasHash && !aliasValveMap){
        // same relative path, no new aliases and no valves, reuse parent context
        this.aliasContext = parent.aliasContext;
        this.aliasContext.shared = true;
    } else {
        // new context, apply valves from parent then add aliases from cog
        this.aliasContext = parent
            ? parent.aliasContext.clone()
            : new AliasContext(this.root); // root of application
        this.aliasContext.restrictAliasList(aliasValveMap);
        //this.aliasContext.injectAliasList(aliasList);
        this.aliasContext.injectAliasHash(aliasHash);
    }

    this.loadBooks();

};



Chain.prototype.loadBooks = function loadBooks(){

    if(this.script.books.length === 0) {
        this.loadTraits();
        return;
    }

    const urls = this.aliasContext.freshUrls(this.script.books);

    if (urls.length) {
        this.scriptMonitor = new ScriptMonitor(urls, this.readBooks.bind(this));
    } else {
        this.readBooks()
    }



};




Chain.prototype.readBooks = function readBooks() {

    const urls = this.script.books;

    if(this.aliasContext.shared) // need a new context
        this.aliasContext = this.aliasContext.clone();

    for (let i = 0; i < urls.length; ++i) {

        const url = urls[i];
        const book = ScriptLoader.read(url);
        if(book.type !== 'book')
            console.log('EXPECTED BOOK: got ', book.type, book.url);

        this.aliasContext.injectAliasList(book.alias);

    }

    this.loadTraits();

};


Chain.prototype.loadTraits = function loadTraits(){

    const urls = this.aliasContext.freshUrls(this.script.traits);

    if(urls.length){
        this.scriptMonitor = new ScriptMonitor(urls, this.build.bind(this));
    } else {
        this.build();
    }

};



Chain.prototype.getNamedElement = function getNamedElement(name){

    if(!name)
        return null;

    const el = this.namedElements[name];

    if(!el)
        throw new Error('Named element ' + name + ' not found in display!');

    return el;

};

Chain.prototype.build = function build(){ // urls loaded


    this.scope.bus().context(this).meow('__source, props * buildCogsByIndex').pull();


};

function copyWithoutSourceOrConfig(props){
    const result = {};
    for(const k in props){
        if(k !== 'source' && k !== 'config'){
            result[k] = props[k];
        }
    }
    return result;
}

function extendObject(base, overrider){
    const result = {};
    for(const k in base){
        result[k] = base[k];
    }
    for(const k in overrider){
        result[k] = overrider[k];
    }
    return result;
}

Chain.prototype.buildCogsByIndex = function buildCogsByIndex(msg){

    const sourceData = msg.__source || [];
    const propsData = copyWithoutSourceOrConfig(msg.props);
    const listData = sourceData.map(function(d){ return extendObject(propsData, d);});

    const len = listData.length;
    const children = this.children;
    const childCount = children.length;
    const updateCount = len > childCount ? childCount : len;

    // update existing
    for(let i = 0; i < updateCount; ++i){
        const d = listData[i];
        const c = children[i];
        c.props.write(d);
    }

    if(len === 0 && childCount > 0){

        // restore placeholder as all children will be gone
        const el = this.getFirstElement(); // grab first child element
        this.placeholder = Placeholder.take();
        el.parentNode.insertBefore(this.placeholder, el);

    }

    if(childCount < len) { // create new children

        const lastEl = this.getLastElement();
        const nextEl = lastEl.nextElementSibling;
        const parentEl = lastEl.parentNode;
        const before = !!nextEl;
        const el = nextEl || parentEl;

        for (let i = childCount; i < len; ++i) {
            // create cogs for new data
            const slot = Placeholder.take();
            if (before) {
                el.parentNode.insertBefore(slot, el);
            } else {
                el.appendChild(slot);
            }
            const d = listData[i];
            const cog = new Cog(this.url, slot, this, d, i);


            children.push(cog);

        }

    } else {

        for (let i = childCount - 1; i >= len; --i) {
            // remove cogs without corresponding data
            children[i].destroy();
            children.splice(i, 1);
        }
    }

    if(len > 0)
        this.killPlaceholder();

    this.tail = children.length > 0 ? children[children.length - 1] : null;
    this.head = children.length > 0 ? children[0] : null;


};

Chain.prototype.getFirstElement = function(){

    let c = this;
    while(c && !c.placeholder && c.elements.length === 0){
        c = c.head;
    }
    return c.placeholder || c.elements[0];

};

Chain.prototype.getLastElement = function(){

    let c = this;
    while(c && !c.placeholder && c.elements.length === 0){
        c = c.tail;
    }
    return c.placeholder || c.elements[c.elements.length - 1];

};


Chain.prototype.destroy = function(){

    this.dead = true;

    const len = this.children.length;
    for(let i = 0; i < len; ++i){
        const c = this.children[i];
        c.destroy();
    }

    if(this.placeholder){
        this.killPlaceholder();
    } else {

        const len = this.elements.length;
        for(let i = 0; i < len; ++i){
            const e = this.elements[i];
            e.parentNode.removeChild(e);
        }
    }


    this.scope.destroy();
    this.children = [];

};

export default Chain;
