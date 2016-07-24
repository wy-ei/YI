(function() {
    var EP = function() {
        this._callbacks = {};
    };

    // store callback infomation

    // native toString
    var toString = Object.prototype.toString;

    function isFunction(value) {
        return toString.call(value) === '[object Function]';
    };

    var isArray = Array.isArray || function(value) {
        return toString.call(value) === '[object Array]';
    };

    EP.prototype.addCallback = function(events, callback, type) {
        var group,
            event;

        if (!isFunction(callback)) {
            return;
        }
        if (typeof events === 'string') {
            events = [events];
        }
        if (!isArray(events)) {
            return;
        }

        // if add callback via `all`,recode the group of event
        group = type === 'all' ? events.slice(0) : [];

        for (var i = 0; i < events.length; i++) {
            event = events[i];
            if (!this._callbacks[event]) {
                this._callbacks[event] = {
                    callbacks: [{
                        callback: callback,
                        group: group,
                        type: type
                    }],
                    status: 'wait',
                    ret: null
                };
            } else {
                this._callbacks[event].callbacks.push({
                    callback: callback,
                    group: group,
                    type: type
                });
            }
        }
    };

    EP.prototype.on = function(event, callback) {
        this.addCallback(event, callback, 'on');
        return this;
    }

    EP.prototype.all = function(events, callback) {
        this.addCallback(events, callback, 'all');
        return this;
    }
    EP.prototype.any = function(events, callback) {
        this.addCallback(events, callback, 'any');
        return this;
    }
    EP.prototype.once = function(events, callback) {
        this.addCallback(events, callback, 'once');
        return this;
    }

    EP.prototype.remove = function(event, func) {
        // get callbacks via event name
        var callbacks = this._callbacks[event] && this._callbacks[event].callbacks,
            index;
        if (callbacks) {
            // if give function as second argument
            // remove this function from callback list
            if (isFunction(func)) {
                index = callbacks.indexOf(func);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            }
            // remove all the callbacks if call remove by a single event name
            else {
                callbacks.length = 0;
            }
        }
        return this;
    };

    // emit event
    EP.prototype.emit = function(event, args, context) {
        var event = this._callbacks[event],
            isReady,
            i,
            len,
            otherEvent,
            isReady,
            group,
            callbacks;
        // event don't exist
        if (!event) {
            return;
        }
        callbacks = event.callbacks;
        event.status = 'done';
        event.args = args;
        if (!isArray(args)) {
            args = [args];
        }
        // must get length of callbacks before
        // because can add callback during emit phase
        for (i = 0, len = callbacks.length; i < len; i++) {

            if (callbacks[i].type !== 'all') {
                callbacks[i].callback.apply(context, args);
            }

            if (callbacks[i].type === 'once') {
                callbacks.splice(i, 1);
            }

            if (callbacks[i] && callbacks[i].type === 'all') {
                args = [];
                isReady = true;
                group = callbacks[i].group;
                for (var j = 0; j < group.length; j++) {
                    otherEvent = group[j];
                    if (this._callbacks[otherEvent].status === 'done') {
                        args.push(this._callbacks[otherEvent].args);
                    } else {
                        isReady = false;
                        break;
                    }
                }
                if (isReady) {
                    callbacks[i].callback.call(null, args);
                }
            }
        };
        return this;
    }


    var root = typeof self == 'object' && self.self === self && self ||
        typeof global == 'object' && global.global === global && global ||
        this;

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define([], function() {
            return EP;
        });
    }
    // Node.js
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = EP;
    }
    // included directly via <script> tag
    else {
        root.EP = EP;
    }
})();
