
// the PathResolver is a namespace that uses a browser hack to generate an
// absolute path from a url string -- using an anchor tag's href.
// it combines the aliasMap with a url and possible root directory.


const PathResolver = {};
const ANCHOR = document.createElement('a');


PathResolver.resolveUrl = function resolveUrl(aliasMap, url, root) {

    url = aliasMap ? (aliasMap[url] || url) : url;

    if(!url){
        console.log('argh',url);
    }
    if(root && url.indexOf('http') !== 0)  {

            root = aliasMap ? (aliasMap[root] || root) : root;
            const lastChar = root.substr(-1);
            url = (lastChar !== '/') ? root + '/' + url : root + url;

    }

    ANCHOR.href = url;
    return ANCHOR.href;

};


PathResolver.resolveRoot = function resolveRoot(aliasMap, url, root){

    return toRoot(PathResolver.resolveUrl(aliasMap, url, root));

};


function toRoot(path){

    const i = path.lastIndexOf('/');
    return path.substring(0, i + 1);

}


export default PathResolver;