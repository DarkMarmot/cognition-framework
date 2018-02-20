
function AlterDom(el) {

    this._el = el;
    this._display = this.style.display;
    this._visible = false;

}

// todo add getter for el (read only)

AlterDom.prototype.focus = function focus() {
    this._el.focus();
};

AlterDom.prototype.blur = function blur() {
    this._el.focus();
};

AlterDom.prototype.value = function value(value) {
    if(arguments.length === 0) {
        return this.el.value;
    }
    this.value = value;
};

AlterDom.prototype.toggleFocus = function toggleFocus(focus) {

    focus ? this._el.focus() : this._el.blur();

};

AlterDom.prototype.toggleDisplay = function toggleDisplay(visible) {

    if(arguments.length === 0) {
        this._visible = !this._visible;
    } else {
        this._visible = visible;
    }
    this._updateDisplay();

};

AlterDom.prototype.showDisplay = function showDisplay(display) {

    this._visible = true;
    if(arguments.length === 1) {
        this._display = display;
    }
    this._updateDisplay();

};

AlterDom.prototype.hideDisplay = function hideDisplay(display) {

    this._visible = false;
    if(arguments.length === 1) {
        this._display = display;
    }
    this._updateDisplay();

};


AlterDom.prototype._updateDisplay = function _updateDisplay() {

    const display = this._visible ? this._display || 'block' : 'none';
    this._el.style.display = display;

};

AlterDom.prototype.text = function text(text) {

    this._el.innerText = text;

};

AlterDom.prototype.setClasses = function(classes){
    this._el.className = classes; // todo more than string
};

AlterDom.prototype.toggleClasses = function(changes){

    const toHash = function(acc, v){ acc[v] = true; return acc;};
    const current = this._el.className.split(' ').reduce(toHash, {});

    for(const k in changes){
        current[k] = changes[k];
    }

    const result = [];
    for(const k in current) {
        if(current[k])
            result.push(k);
    }

    this._el.className = result.join(' ');
    return this;

};

AlterDom.prototype.toggleClass = function(name, present){
    const p = {};
    p[name] = present;
    return this.toggleClasses(p);
};

AlterDom.prototype.removeClass = function(name){
    const p = {};
    p[name] = false;
    return this.toggleClasses(p);
};

AlterDom.prototype.addClass = function(name){
    const p = {};
    p[name] = true;
    return this.toggleClasses(p);
};

AlterDom.prototype.attr = function(name, value) {
    if(value === undefined || value === null) {
        this._el.removeAttribute(name);
    } else {
        this._el.setAttribute(name, value);
    }
    return this;
};

AlterDom.prototype.attrs = function(changes) {
    for(const k in changes){
        this.attr(k, changes[k]);
    }
    return this;
};

AlterDom.prototype.prop = function(name, value) {
    this._el[name] = value;
    return this;
};

AlterDom.prototype.props = function(changes) {
    for(const k in changes){
        this.prop(k, changes[k]);
    }
    return this;
};

AlterDom.prototype.style = function(name, value) {
    this._el.style[name] = value;
    return this;
};

AlterDom.prototype.styles = function(changes) {
    for(const k in changes){
        this.style(k, changes[k]);
    }
    return this;
};

export default AlterDom;

