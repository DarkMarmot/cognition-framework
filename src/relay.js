
function Relay(cog, name, remote){

    this.cog = cog;
    this.name = name;
    this.remote = remote;
    this.localData = cog.scope.demand(name);
    this.isAction = name.slice(-1) === '$';
    this.valueBus = null;
    this.nameBus =
        cog.scope.bus()
        .context(cog.script)
        .meow(remote)
        .msg(this.connect, this).pull()
    ;


}

Relay.prototype.connect = function(remoteName){


    //console.log('connect:', remoteName);

    if(this.valueBus)
        this.valueBus.destroy();

    if (typeof remoteName === 'function' && !this.isAction){
        this.localData.write(remoteName.call(this.cog.script));
        // todo -- support {value: blah} syntax
    } else if (typeof remoteName === 'string'){

        const tildaPos = remoteName.indexOf('~');
        if(tildaPos >= 0){
            remoteName = remoteName.substr(tildaPos + 1);
            remoteName = remoteName.trim();
        } else {
            console.log('RELAY NO ~', remoteName);
        }

        // remoteName must be data name at parent scope!
        const remoteData = this.cog.parent.scope.find(remoteName, true);

        if(this.isAction) {
            this.valueBus = this.cog.scope.bus()
                .addSubscribe(this.name, this.localData).write(remoteData);
        } else {
            this.valueBus = this.cog.scope.bus()
                .addSubscribe(remoteData.name, remoteData).write(this.localData).pull();
        }

    }
    else {
        throw new Error('argh!');
    }



};

export default Relay;


