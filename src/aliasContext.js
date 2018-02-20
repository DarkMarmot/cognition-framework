
import PathResolver from './pathResolver.js';
import ScriptLoader from './scriptLoader.js';

// whenever new aliases or valves (limiting access to aliases) are encountered,
// a new aliasContext is created and used to resolve urls and directories.
// it inherits the aliases from above and then extends or limits those.
//
// the resolveUrl and resolveRoot methods determine a path from a url and/or
// directory combination (either can be an alias). if no directory is
// given -- and the url or alias is not an absolute path -- then a relative path
// is generated from the current url (returning a new absolute path).
//
// (all method calls are cached here for performance reasons)

function AliasContext(sourceRoot, aliasMap, valveMap){

    this.sourceRoot = sourceRoot;
    this.aliasMap = aliasMap ? restrict(copy(aliasMap), valveMap) : {};
    this.urlCache = {}; // 2 level cache (first root, then url)
    this.rootCache = {}; // 2 level cache (first root, then url)
    this.shared = false; // shared once used by another lower cog

}



AliasContext.prototype.clone = function(newRoot){
    return new AliasContext(newRoot || this.sourceRoot, this.aliasMap);
};


AliasContext.prototype.restrictAliasList = function(valveMap){
    this.aliasMap = restrict(this.aliasMap, valveMap);
    return this;
};

AliasContext.prototype.injectAlias = function(alias){
    this.aliasMap[alias.name] = this.resolveUrl(alias.url, alias.root);
    return this;
};

AliasContext.prototype.injectAliasList = function(aliasList){


    for(let i = 0; i < aliasList.length; i++){
        this.injectAlias(aliasList[i]);
    }
    return this;
};

AliasContext.prototype.injectAliasHash = function(aliasHash){


    const list = [];
    const hash = {};

    for(const name in aliasHash){

        let url = '', root = '';
        const val = aliasHash[name];
        const parts = val.trim().split(' ');

        if(parts.length === 1){
            url = parts[0];
        } else {
            root = parts[0];
            url = parts[1];
        }

        const alias = {name: name, url: url, root: root, dependent: false, placed: false};
        hash[name] = alias;
        list.push(alias);

    }

    for(let i = 0; i < list.length; i++){
        const alias = list[i];
        if(alias.root && hash.hasOwnProperty(alias.root)){
            alias.dependent = true; // locally dependent on other aliases in this list
        }
    }

    const addedList = [];


    while(addedList.length < list.length) {

        let justAdded = 0;
        for (let i = 0; i < list.length; i++) {
            const alias = list[i];
            if(!alias.placed) {
                if (!alias.dependent || hash[alias.root].placed) {
                    justAdded++;
                    alias.placed = true;
                    addedList.push(alias);
                }
            }
        }

        if(justAdded === 0){
            throw new Error('Cyclic Alias Dependency!');
        }
    }

    for(let i = 0; i < addedList.length; i++){
        this.injectAlias(addedList[i]);
    }
    return this;

};


// given a list of objects with url and root, get urls not yet downloaded

AliasContext.prototype.freshUrls = function freshUrls(list) {

    const result = [];

    if(!list)
        return result;

    for(let i = 0; i < list.length; i++){
        const url = this.itemToUrl(list[i]);
        if(!ScriptLoader.has(url) && result.indexOf(url) === -1)
            result.push(url);
    }

    return result;

};




AliasContext.prototype.itemToUrl = function applyUrl(item) {
    return this.resolveUrl(item.url, item.root);
};


AliasContext.prototype.resolveUrl = function resolveUrl(url, root){

    const parts = url.trim().split(' ');

    if(parts.length === 1){
        url = parts[0];
    } else {
        root = parts[0];
        url = parts[1];
    }

    const cache = this.urlCache;
    root = root || this.sourceRoot || '';
    const baseCache = cache[root] = cache[root] || {};
    return baseCache[url] = baseCache[url] ||
        PathResolver.resolveUrl(this.aliasMap, url, root);

};

AliasContext.prototype.resolveRoot = function resolveRoot(url, base){

    const cache = this.rootCache;
    base = base || this.sourceRoot || '';
    const baseCache = cache[base] = cache[base] || {};
    return baseCache[url] = baseCache[url] ||
        PathResolver.resolveRoot(this.aliasMap, url, base);

};

AliasContext.applySplitUrl = function applySplitUrl(def){

    let url = def.url || '';

    const parts = url.trim().split(' ');

    if(parts.length === 1){
        def.url = parts[0];
        def.root = '';
    } else {
        def.root = parts[0];
        def.url = parts[1];
    }

};


// limits the source hash to only have keys found in the valves hash (if present)

function restrict(source, valves){

    if(!valves)
        return source;

    const result = {};
    for(const k in valves){
        result[k] = source[k];
    }

    return result;
}

// creates a shallow copy of the source hash

function copy(source, target){

    target = target || {};
    for(const k in source){
        target[k] = source[k];
    }
    return target;

}

export default AliasContext;