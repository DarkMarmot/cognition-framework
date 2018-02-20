
import ScriptLoader from './scriptLoader.js';
import PartBuilder from './partBuilder.js';


function Trait(cog, def){

    this.cog = cog;
    this.config = def.config || def;
    this.url = cog.aliasContext.resolveUrl(def.url, def.root);
    this.script = Object.create(ScriptLoader.read(this.url));
    this.script.cog = cog;
    this.script.trait = this;
    this.script.config = this.config;
    this.script.api = cog.api;
    this.scope = cog.scope.createChild();

   this.buildRelays();
   this.buildBuses();

}

Trait.prototype.buildRelays = PartBuilder.buildRelays;
Trait.prototype.output = PartBuilder.output;

Trait.prototype.buildBuses = function buildBuses(){

    const buses = this.script.buses || [];
    const wires = this.script.wires || [];
    const scope = this.scope;

    const len = buses.length;

    for(const name in wires){
        const bus = this.scope._wires[name];
        bus.pull();
    }

    for(let i = 0; i < len; ++i){

        const def = buses[i];
        const bus = scope.bus().context(this.script).meow(def); // todo add function support not just meow str
        bus.pull();

    }

};

//
// Trait.prototype.buildBusFromNyan = function buildBusFromNyan(nyanStr, el){
//     return this.scope.bus(nyanStr, this.script, el);
// };


export default Trait;