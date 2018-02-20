
// holds a cache of all scripts loaded by url

const ScriptLoader = {};
const status = { loaded: {}, failed: {}, fetched: {}};
const cache = {};

const listenersByUrl = {}; // loaded only, use init timeouts to request again


function cleanup(e){

    const target = e.target;
    target.onload = target.onerror = null;

}

ScriptLoader.currentScript = null;

ScriptLoader.onError = function onError(e){

    const src = e.target.src;
    const f = status.failed[src] || 0;
    status.failed[src] = f + 1;
    status.fetched[src] = false;
    cleanup(e);

    if(f < 3) {
        setTimeout(ScriptLoader.load, f * 1000, src);
    }

    console.log('script err', e);

};

ScriptLoader.onLoad = function onLoad(e){

    const src = e.target.src;
    status.loaded[src] = true;

    cache[src] = ScriptLoader.currentScript;

    if(ScriptLoader.currentScript.__machine) { // to avoid modifying AMD libs
        ScriptLoader.currentScript.url = src;
        ScriptLoader.currentScript.root = toRoot(src);
    }

    //console.log(cache);
    cleanup(e);

    const listeners = listenersByUrl[src] || [];
    const len = listeners.length;
    for(let i = 0; i < len; ++i){
        const f = listeners[i];
        f.call(null, src);
    }

    listenersByUrl[src] = [];

};

ScriptLoader.read = function read(path){
    return cache[path];
};

ScriptLoader.has = function has(path){
    return !!status.loaded[path];
};

ScriptLoader.request = function request(path, callback){

    if(status.loaded[path])
        return callback.call(null, path);

    const listeners = listenersByUrl[path] = listenersByUrl[path] || [];
    const i = listeners.indexOf(callback);
    if(i === -1){
        listeners.push(callback);
    }

    ScriptLoader.load(path);

};

ScriptLoader.load = function(path){

    if(status.fetched[path]) // also true if loaded, this only clears on error
        return;

    const script = document.createElement("script");

    script.onerror = ScriptLoader.onError;
    script.onload = ScriptLoader.onLoad;
    script.async = true;
    script.charset = "utf-8";
    script.src = path;

    status.fetched[path] = true;
    document.head.appendChild(script);

};

function toRoot(path){
    const i = path.lastIndexOf('/');
    return path.substring(0, i + 1);
}

export default ScriptLoader;
