(function(global) {
    'use strict';
//#################################################################
// CONSTANTS
//#################################################################
    var GET = 'get',
        SET = 'set';
	//#################################################################
	// METHOD ADDED ON YOUR CLASS FOR SET ATTRIBUTES
	//#################################################################
    var setAttr = function(key, val) {
        var oldVal;
        oldVal = this.attrs[key];
        if (oldVal === val) {
            return;
        }
        if (val === undefined || val === null) {
            delete this.attrs[key];
        } else {
            this.attrs[key] = val;
        }
        this._fireChangeEvent(key, oldVal, val);
    };
	//#################################################################
	// METHOD ADDED ON YOUR CLASS FOR GET ATTRIBUTES
	//#################################################################
    var getAttr = function(attr) {
        var method = GET + Factory._private_capitalize(attr);

        var isf = !!(this[method] && this[method].constructor && this[method].call && this[method].apply);
        if (isf) {
            return this[method]();
        }
        // otherwise get directly
        return this.attrs[attr];
    }
	//#################################################################
	// DEFAULT FIRE CHANGE TRIGGER for overload this add on your class a method 
	// _fireChangeEvent
	//#################################################################
    var defaultFireChangeTrigger = function(key, oldVal, val) {
        console.log("CHANGE TRIGGER (key :" + key + ", oldVal :" + oldVal + ", newVal :" + val + ")");
    };
	//#################################################################
	//CALL YOUR METHOD DESTRUCTOR BEGIN delete create a method ___destructor on your class
	//#################################################################
    var destroy = function() {
		if (this.__proto__.__proto__ !== undefined && this.__proto__.__proto__.__proto__ !== undefined && this.__proto__.__proto__.__proto__.___destructor !== undefined)
			this.__proto__.__proto__.__proto__.___destructor();
		if (this.__proto__.__proto__ !== undefined && this.__proto__.__proto__.___destructor !== undefined)
			this.__proto__.__proto__.___destructor();
		if (this.__proto__.___destructor !== undefined)
			this.__proto__.___destructor();
    }
	//#################################################################
	//#################################################################
	
	
//#################################################################
//FACTORY LIBRARY
//#################################################################
    var Factory = {
		//#################################################################
		//CALL THIS FOR CREATE NEW CLASS
		//#################################################################
        newClass: function(constructor) {
            constructor.prototype.attrs = [];
            if (constructor.prototype._fireChangeEvent === undefined)
                constructor.prototype._fireChangeEvent = defaultFireChangeTrigger;
            constructor.prototype._setAttr = setAttr;
            constructor.prototype._getAttr = getAttr;
            constructor.prototype.destroy = destroy;
        },
		//#################################################################
		//CALL THIS FOR ADD get(attr) and set(attr)
		//#################################################################
        addGetterSetter: function(constructor, attr, def, validator, after) {
            this.addGetter(constructor, attr, def);
            this.addSetter(constructor, attr, validator, after);
        },
		//#################################################################
		//CALL THIS FOR ADD get(attr)
		//#################################################################
        addGetter: function(constructor, attr, def) {
            var method = GET + this._private_capitalize(attr);

            constructor.prototype.attrs[attr] = def == undefined ? undefined : def;

            constructor.prototype[method] = function() {
                var val = this.attrs[attr];
                return val === undefined ? def : val;
            };
        },
		//#################################################################
		//CALL THIS FOR ADD set(attr)
		//#################################################################
        addSetter: function(constructor, attr, validator, after) {
            var method = SET + this._private_capitalize(attr);

            constructor.prototype[method] = function(val) {
                if (validator) {
                    val = validator.call(this, val);
                }
                this._setAttr(attr, val);

                if (after) {
                    after.call(this);
                }

                return this;
            };
        },
		//#################################################################
		//CALL THIS FOR ADD new Object var
		//#################################################################
        addComponentsGetterSetter: function(constructor, attr, components, def) {
            var len = components.length,
                capitalize = this._private_capitalize,
                getter = GET + capitalize(attr),
                setter = SET + capitalize(attr),
                n,
                component;

            // var
            constructor.prototype[attr] = {};
            for (n = 0; n < len; n++) {
                component = components[n];

                constructor.prototype[attr][component] = undefined;
            }

            constructor.prototype[getter] = function() {
                return constructor.prototype[attr];
            }
            constructor.prototype[setter] = function(values) {
                var vals = Object.values(values);
                var keys = Object.keys(values);
                var len = Object.values(values).length;
                for (n = 0; n < len; n++) {
                    var key = keys[n];
                    var val = vals[n];
                    constructor.prototype[attr][key] = val;
                }
            }

            if (def !== undefined) {
                constructor.prototype[setter](def);
            }

        },
		//#################################################################
		// CALL THIS FOR ADD overloadedgetterandsetter
		//#################################################################
        addOverloadedGetterSetter: function(constructor, attr) {
            var capitalizedAttr = this._private_capitalize(attr),
                setter = SET + capitalizedAttr,
                getter = GET + capitalizedAttr;

            constructor.prototype[attr] = function() {
                // setting
                if (arguments.length) {
                    this[setter](arguments[0]);
                    return this;
                }
                // getting
                return this[getter]();
            };
        },
		//#################################################################
		//CALL THIS FOR ADD DEPRECATED GETTER SETTER
		//#################################################################
        addDeprecatedGetterSetter: function(constructor, attr, def, validator) {
            var method = GET + this._private_capitalize(attr);
            var message = attr +
                ' property is deprecated and will be removed soon. Look at documentation change log for more information.';
            constructor.prototype[method] = function() {
                console.error(message);
                var val = this.attrs[attr];
                return val === undefined ? def : val;
            };
            this.addSetter(constructor, attr, validator, function() {
                console.error(message);
            });
            this.addOverloadedGetterSetter(constructor, attr);
        },
		//#################################################################
		//
		//#################################################################
        backCompat: function(constructor, methods) {

            var func = function(oldMethodName, newMethodName) {
                var method = constructor.prototype[newMethodName];
                constructor.prototype[oldMethodName] = function() {
                    method.apply(this, arguments);
                    console.error(
                        oldMethodName +
                        ' method is deprecated and will be removed soon. Use ' +
                        newMethodName +
                        ' instead'
                    );
                };
            }
            for (var key in methods) {
                func(key, methods[key]);
            }
        },
		//#################################################################
		//CALL THIS FOR ADD METHODS ON YOUR CLASS
		//#################################################################
        addMethods: function(constructor, methods) {
            var key;

            for (key in methods) {
                constructor.prototype[key] = methods[key];
            }
        },
		//#################################################################
		//CALL THIS FOR EXTENDS YOUR CLASS WITH OTHER CLASS
		//#################################################################
        extend: function(child, parent) {
            function Ctor() {
                this.constructor = child;
            }
            Ctor.prototype = parent.prototype;
            var oldProto = child.prototype;
            child.prototype = new Ctor();
            for (var key in oldProto) {
                if (oldProto.hasOwnProperty(key)) {
                    child.prototype[key] = oldProto[key];
                }
            }
            child.__super__ = parent.prototype;
            // create reference to parent
            child.super = parent;
        },
		//#################################################################
		//private method capitalise first character after set and get
		//#################################################################
        _private_capitalize: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    };
	//#################################################################
	
	
	//#################################################################
	// SET TO GLOBAL VAR
	//#################################################################
	var glob = typeof global !== 'undefined' ?
        global :
        typeof window !== 'undefined' ?
        window :
        typeof WorkerGlobalScope !== 'undefined' ? self : {};

    glob.Factory = Factory;
    Factory.global = glob;
	//#################################################################
})();