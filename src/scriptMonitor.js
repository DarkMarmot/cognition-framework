
import ScriptLoader from './scriptLoader.js';

// todo add ability to share this among cogs, add additional paths with new callback
// thus entire trees can mount at once

function ScriptMonitor(paths, callback){

    this.callback = callback;
    this.needs = notReady(paths);
    this.needs.length === 0 ? this.callback() : requestNeeds(this);

}

function requestNeeds(monitor){

    const callback = onNeedReady.bind(monitor);

    const paths = monitor.needs;
    const len = paths.length;

    for (let i = 0; i < len; i++) {
        const path = paths[i];
        ScriptLoader.request(path, callback);
    }

}


function onNeedReady(path){

    const needs = this.needs;
    const i = needs.indexOf(path);
    needs.splice(i, 1);

    if(!needs.length)
        this.callback();

}


function notReady(arr){

    const remaining = [];

    for(let i = 0; i < arr.length; i++){
        const path = arr[i];
        if(!ScriptLoader.has(path))
            remaining.push(path);
    }

    return remaining;

}


export default ScriptMonitor;
