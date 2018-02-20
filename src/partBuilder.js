
import Relay from './relay.js';

const PartBuilder = {};


// this.source = scope.demand('__source');
// if(data)
//     this.source.write(data);

function copyWithoutUrlOrConfig(props){
    const result = {};
    for(const k in props){
        if(k !== 'url' && k !== 'config'){
            result[k] = props[k];
        }
    }
    return result;
}

PartBuilder.defineProps = function(def){ // for gears and cogs

    const scope = this.scope;
    this.props = scope.demand('props');

    const defConfig = def.config;
    const finalDef = copyWithoutUrlOrConfig(def);

    if(defConfig && typeof defConfig === 'string'){ // subscribe to named config, overriding def
        const namedConfigData = this.parent.scope.find(defConfig, true);
        scope.bus().context(this)
            .addSubscribe('config', namedConfigData)
            .msg(this.extendDefToConfig)
            .write(this.props).pull();
    } else {
        // props doesn't subscribe to a dynamic config point
        this.props.write(finalDef);
    }

    // scope.bus().context(this)
    //     .meow('~ config, __source * extendConfigAndSourceToProps > props')
    //     .pull();

};


const urlOrConfigHash = {url: true, config: true};



// override def sans url and config with config hash
PartBuilder.extendDefToConfig = function(config){

    const def = this.def;
    const result = {};

    // reversed this to make def win
    for(const k in config){
        result[k] = config[k];
    }

    for(const k in def){
        if(!urlOrConfigHash.hasOwnProperty(k)){
            result[k] = def[k];
        }
    }

    // for(const k in config){
    //     result[k] = config[k];
    // }

    return result;

};



// override config sans source and config with config hash
PartBuilder.extendConfigAndSourceToProps = function(msg){

    const source = msg.__source;
    const config = msg.config;
    const result = {};

    // const parentIsChain = this.parent && this.parent.type === 'chain';
    for(const k in config){
        if(k !== 'source'){
            result[k] = config[k];
        }
    }

    if(source && typeof source === 'object') {
        for (const k in source) {
            result[k] = source[k];
        }
    }

    return result;

};

PartBuilder.buildConfig = function buildConfig(def){

    if(!def && !this.parent) // empty root config
        def = {};

    let baseConfig = {};

    if(def){

        const defConfig = def.config;
        if(defConfig){

            let inheritConfig;

            if(typeof defConfig === 'string'){
                inheritConfig = this.parent.scope.find(defConfig).read();
            } else if (typeof defConfig === 'object'){
                inheritConfig = defConfig;
            }

            for(const name in inheritConfig){
                baseConfig[name] = inheritConfig[name];
            }

        }

        for(const name in def){
            if(name !== 'config')
                baseConfig[name] = def[name];
        }

        this.scope.demand('config').write(baseConfig);

    }

    this.config = this.scope.find('config').read();

};



PartBuilder.output = function output(name, value){

    const d = this.scope.find(name);
    d.write(value);

};

PartBuilder.buildStates = function buildStates(){

    const script = this.script;
    const scope  = this.scope;
    const states = script.states;

    for(const name in states){

        const def = states[name];
        const state = scope.demand(name);

        if(def.hasValue) {

            const value = typeof def.value === 'function'
                ? def.value.call(script)
                : def.value;

            state.write(value, true);
        }

    }

    for(const name in states){

        const state = scope.grab(name);
        state.refresh();

    }

};


PartBuilder.buildWires = function buildWires(){

    const wires = this.script.wires;
    const scope = this.scope;
    const script = this.script;

    // todo add initial state values

    for(const name in wires) {

        const def = wires[name];
        const state = scope.demand(def.stateName);
        const action = scope.demand(def.actionName);

        if(def.hasValue) {

            const value = typeof def.value === 'function'
                ? def.value.call(script)
                : def.value;

            state.write(value, true);
        }

        const meow = def.actionName + def.transform + ' > ' + def.stateName; // todo assert def has cmd at start
        scope.bus().context(script).meow(meow);

    }

    for(const name in wires){

        const def = wires[name];
        const state = scope.grab(def.stateName);
        state.refresh();

    }

};

PartBuilder.buildRelays = function buildRelays(){


    const relays = this.script.relays;
    this.relays = {};

    for(const name in relays) {

        const remote = relays[name];
        this.relays[name] = new Relay(this, name, remote);

    }

};

PartBuilder.buildActions = function buildActions(){

    const actions = this.script.actions;
    const scope = this.scope;

    for(const name in actions){

        const def = actions[name]; // name in hash might not have leading $
        this.scope.demand(def.name); // name in def always has leading $

        if(def.to){
            const meow = def.name + def.to; // todo assert def has cmd at start
            scope.bus().context(this.script).meow(meow);
        }
    }

};




export default PartBuilder;
