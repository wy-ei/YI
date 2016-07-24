(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * YI - You Image
	 * description:image process library
	 * author:wy
	 * e-mail:nameiswangyu@163.com
	 * License:MIT
	 */


	var YI = __webpack_require__(1);
	__webpack_require__(3);
	__webpack_require__(4);

	module.exports = YI;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var EP = __webpack_require__(2);

	function YI(img) {
	    var url = img.getAttribute('src'),
	        source = new Image;

	    source.src = url;

	    source.onload = function() {
	        var canvas = document.createElement('canvas'),
	            cxt = canvas.getContext('2d'),
	            width = source.width,
	            height = source.height;

	        canvas.setAttribute('width', width);
	        canvas.setAttribute('height', height);
	        cxt.drawImage(source, 0, 0);

	        this.source = source;
	        this.canvas = canvas;
	        this.width = width;
	        this.height = height;
	        this.cxt = cxt;
	        this.img = img;
	    }.bind(this);
	}

	YI.prototype = new EP;

	YI.fn = YI.prototype;

	YI.fn.getImageData = function() {
	    return this.cxt.getImageData(0, 0, this.width, this.height);
	};

	YI.fn.notify = function(progress) {
	    this.emit('progress', progress);
	};

	YI.fn.putImageData = function(imageData) {
	    //    this.cxt.clearRect(0, 0, this.width, this.height);
	    this.cxt.putImageData(imageData, 0, 0);
	};

	YI.fn.process = function(workerBuilder, data) {
	    var _this = this;
	    data = data || {};
	    var worker = YI.createWorker(workerBuilder);
	    var imageData = this.getImageData();
	    data.data = imageData.data;
	    data.width = imageData.width;
	    data.height = imageData.height;
	    return new Promise(function(resolve, reject) {
	        worker.postMessage(data);
	        worker.onmessage = function(evt) {
	            if (evt.data.type === 'data') {
	                var src = evt.data.data;
	                YI.copy(src, imageData.data);
	                _this.putImageData(imageData);
	                worker.terminate();
	                resolve(_this);
	            } else if (evt.data.type === 'progress') {
	                _this.notify(evt.data.progress);
	            }
	        };
	        worker.onerror = function(err) {
	            reject(err);
	        };
	    });
	};


	module.exports = YI;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {(function() {
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
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	            return EP;
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
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

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);

	YI.sum = function(arr) {
	    return arr.reduce(function(pre, val) {
	        return pre + val;
	    });
	};

	YI.mid = function(arr) {
	    arr = arr.concat();
	    arr.sort(function(a, b) {
	        return a - b;
	    });
	    var index = Math.floor(arr.length / 2);
	    return arr[index];
	};

	YI.copy = function(src, dst) {
	    for (var i = 0, len = dst.length; i < len; i += 4) {
	        dst[i] = src[i];
	        dst[i + 1] = src[i + 1];
	        dst[i + 2] = src[i + 2];
	    }
	};

	function addDependencies(content) {
	    var dependencies = [];
	    if (content.indexOf('YI.') === -1) {
	        return content;
	    } else {
	        findDependencies(content);
	        var dependenciesContents = ['var YI = {};'];

	        dependencies.forEach(function(method) {
	            dependenciesContents.push(
	                'YI.' + method + '=' + YI[method].toString()
	            );
	        });
	        dependenciesContents.push(content);
	        return dependenciesContents.join('\n');
	    }

	    function findDependencies(content) {
	        var rDep = /YI\.([a-zA-Z_$][\w_$]*)/g;
	        var methodName;
	        var match = rDep.exec(content);

	        while (match) {
	            methodName = match[1];
	            if (dependencies.indexOf(methodName) === -1) {
	                dependencies.push(methodName);
	                findDependencies(YI[methodName].toString());
	            }
	            match = rDep.exec(content);
	        }
	    }
	}

	// 使用一个函数来创建一个 Worker
	YI.createWorker = function(workerBuilder) {
	    // 用函数体来作为 Worker 的内容
	    var workerBuilderContent = workerBuilder.toString();
	    var firstBraceIndex = workerBuilderContent.indexOf('{');
	    var lastBraceIndex = workerBuilderContent.lastIndexOf('}');
	    workerBuilderContent = workerBuilderContent.slice(firstBraceIndex + 1, lastBraceIndex);

	    workerBuilderContent = addDependencies(workerBuilderContent);

	    var blob = new Blob([workerBuilderContent]);
	    var url = window.URL.createObjectURL(blob);
	    return new Worker(url);
	};

	YI.progress = function(currentIndex, totalCount) {
	    var currentProgress = (currentIndex / totalCount).toFixed(1);
	    self.postMessage({
	        progress: currentProgress,
	        type: 'progress'
	    });
	};

	YI.applyMatrix = function(data, matrix, gain) {
	    var retData = new Uint8ClampedArray(data.length);
	    var row = matrix.length,
	        col = matrix[0].length;
	    var width = data.width,
	        height = data.height;
	    retData.width = width;
	    retData.height = height;
	    if (typeof gain == 'function') {
	        var predicate = gain;
	    } else {
	        gain = gain || 1;
	    }
	    var rowOffset = Math.floor(row / 2),
	        colOffset = Math.floor(col / 2),
	        rowOffsetUpBound = rowOffset % 2 !== 0 ? rowOffset : rowOffset - 1,
	        rowOffsetBottomBound = -rowOffset,
	        colOffsetUpBound = colOffset % 2 !== 0 ? colOffset : colOffset - 1,
	        colOffsetBottomBound = -colOffset;

	    var val;
	    for (var rowIndex = rowOffset, rowLen = height - rowOffset; rowIndex < rowLen; rowIndex++) {
	        for (var colIndex = colOffset, colLen = width - colOffset; colIndex < colLen; colIndex++) {
	            val = [
	                [],
	                [],
	                []
	            ];
	            for (var x = rowOffsetBottomBound; x <= rowOffsetUpBound; x++) {
	                for (var y = colOffsetBottomBound; y <= colOffsetUpBound; y++) {
	                    var arr = YI.value(data, colIndex + y, rowIndex + x);
	                    var n = matrix[x + rowOffset][y + colOffset];
	                    val[0].push(arr[0] * n);
	                    val[1].push(arr[1] * n);
	                    val[2].push(arr[2] * n);
	                }
	            }
	            if (predicate) {
	                arr = predicate(val);
	            } else {
	                arr = [0, 0, 0];
	                arr[0] = gain * YI.sum(val[0]);
	                arr[1] = gain * YI.sum(val[1]);
	                arr[2] = gain * YI.sum(val[2]);
	            }
	            YI.value(retData, colIndex, rowIndex, arr);
	        }
	        if (rowIndex % Math.floor(rowLen / 10) === 0) {
	            YI.progress(rowIndex, rowLen);
	        }
	    }
	    return retData;
	};

	YI.value = function(data, x, y, value) {
	    var width = data.width,
	        index = (y * width + x) * 4;
	    //getter
	    if (value == null) {
	        var ret = [];
	        ret.push(data[index]);
	        ret.push(data[index + 1]);
	        ret.push(data[index + 2]);
	        return ret;
	    }
	    // setter
	    else {
	        if (Array.isArray(value)) {
	            data[index] = value[0];
	            data[index + 1] = value[1];
	            data[index + 2] = value[2];
	        } else {
	            data[index] = value;
	            data[index + 1] = value;
	            data[index + 2] = value;
	        }
	    }
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(8);
	__webpack_require__(9);
	__webpack_require__(7);
	__webpack_require__(10);
	__webpack_require__(11);
	__webpack_require__(12);
	__webpack_require__(13);
	__webpack_require__(14);
	__webpack_require__(15);
	__webpack_require__(16);
	__webpack_require__(17);


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	YI.fn.origin = function() {
	    return new Promise(function(resolve){
	        this.cxt.clearRect(0, 0, this.width, this.height);
	        this.cxt.drawImage(this.source, 0, 0);
	        resolve(this);
	    }.bind(this));
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	YI.fn.replace = function(img) {
	    var dataURL = this.canvas.toDataURL('image/jpeg');
	    img.setAttribute('src', dataURL);
	    return this;
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	YI.fn.gray = function() {
	    return this.process(workerBuilder);
	};
	function workerBuilder(){

	    self.onmessage = function(evt){
	        var data = evt.data.data,
	            average,
	            len = data.length;

	        for (var i = 0; i < len; i += 4) {
	            average = Math.floor(data[i] + data[i + 1] + data[i + 2]) / 3;
	            data[i] = average;
	            data[i + 1] = average;
	            data[i + 2] = average;

	            if(i % Math.floor(len/10) === 0){
	                YI.progress(i, len);
	            }
	        }
	        YI.progress(i ,len);
	        self.postMessage({data:data, type:'data'});
	    };
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	YI.fn.pseudoColor = function() {
	    return this.process(workerBuilder);
	};


	function workerBuilder() {

	    self.onmessage = function(evt) {
	        var data = evt.data.data,
	            len = data.length;

	        for (var i = 0; i < len; i += 4) {
	            var red = data[i];
	            if (red < 128) {
	                red = 0;
	            } else if (red < 192) {
	                red = (255 / 64) * (red - 128);
	            } else {
	                red = 255;
	            }

	            var green = data[i + 1];
	            if (green < 64) {
	                green = (255 / 64) * green;
	            } else if (green < 192) {
	                green = 255;
	            } else {
	                green = 255 - (255 / 64) * (green - 192);
	            }

	            var blue = data[i + 2];
	            if (blue < 64) {
	                blue = 255;
	            } else if (blue < 128) {
	                blue = 255 - (255 / 64) * (blue - 64);
	            } else {
	                blue = 0;
	            }
	            data[i] = red;
	            data[i + 1] = green;
	            data[i + 2] = blue;
	            if(i % Math.floor(len/10) === 0){
	                YI.progress(i, len);
	            }
	        }
	        YI.progress(100, 100);
	        self.postMessage({
	            data: data,
	            type: 'data'
	        });
	    };
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	YI.fn.gamma = function(g) {
	    return this.process(workerBuilder, {g: g});
	};
	function workerBuilder(){

	    self.onmessage = function(evt){
	        var data = evt.data.data,
	            g = evt.data.g || 10,
	            len = data.length,
	            normalizedArg = ((g + 100) / 200) * 2;
	        for (var i = 0; i < len; i += 4) {
	            data[i] = Math.pow(data[i], normalizedArg);
	            data[i + 1] = Math.pow(data[i + 1], normalizedArg);
	            data[i + 2] = Math.pow(data[i + 2], normalizedArg);

	            if(i % Math.floor(len/10) === 0){
	                YI.progress(i, len);
	            }
	        }
	        YI.progress(100 ,100);
	        self.postMessage({data:data, type:'data'});
	    };
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*
	* type:
	* "binary" --> value = value > th ? max_value : 0
	* "tozero"  -->  value = value > th ? value : 0
	* "otsu" --> use Otsu algorithm to choose the optimal th value
	*/
	var YI = __webpack_require__(1);

	YI.fn.threshold = function(type, th) {
	    return this.process(workerBuilder, {
	        type: type,
	        th: th
	    });
	};

	function workerBuilder() {

	    self.onmessage = function(evt) {
	        var data = evt.data.data,
	            type = evt.data.type,
	            th = evt.data.th;

	        switch (type) {
	            case 'binary':
	                data = binary(data, th);
	                break;
	            case 'tozero':
	                data = tozero(data, th);
	                break;
	            case 'otsu':
	                data = otsu(data);
	                break;
	            case 'mr':
	                data = mr(data);
	                break;
	            default:
	                data = otsu(data);
	        }

	        YI.progress(100, 100);
	        self.postMessage({
	            data: data,
	            type: 'data'
	        });
	    };


	    function binary(data, th) {
	        var len = data.length;
	        for (var i = 0; i < len; i += 4) {
	            if (data[i] > th) {
	                data[i] = 255;
	                data[i + 1] = 255;
	                data[i + 2] = 255;
	            } else {
	                data[i] = 0;
	                data[i + 1] = 0;
	                data[i + 2] = 0;
	            }
	            if(i % Math.floor(len/10) === 0){
	                YI.progress(i, len);
	            }
	        }
	        return data;
	    }

	    function tozero(data, th) {
	        var len = data.length;

	        for (var i = 0; i < len; i += 4) {
	            if (data[i] < th) {
	                data[i] = 0;
	                data[i + 1] = 0;
	                data[i + 2] = 0;
	            }
	            if(i % Math.floor(len/10) === 0){
	                YI.progress(i, len);
	            }
	        }
	        return data;
	    }

	    function otsu(data) {
	        var th,
	            i,
	            len,
	            histogram = new Array(256);

	        for (i = 0; i < 256; i++) {
	            histogram[i] = 0;
	        }
	        for (i = 0, len = data.length; i < len; i += 4) {
	            histogram[data[i]] += 1;
	        }
	        var size = data.length / 4;
	        for (i = 0; i < 256; i++) {
	            histogram[i] /= size;
	        }

	        //average pixel value
	        var avgValue = 0;
	        for (i = 0; i < 255; i++) {
	            avgValue += histogram[i] * i;
	        }
	        var maxVariance = 0,
	            w = 0,
	            u = 0;
	        for (i = 0; i < 256; i++) {
	            w += histogram[i];
	            u += i * histogram[i];

	            var t = avgValue * w - u;
	            var variance = t * t / (w * (1 - w));
	            if (variance > maxVariance) {
	                maxVariance = variance;
	                th = i;
	            }
	        }
	        return binary(data, th);
	    }

	    function mr(data) {
	        var th,
	            i,
	            len,
	            histogram = new Array(256);
	        for (i = 0; i < 256; i++) {
	            histogram[i] = 0;
	        }

	        // get distribution probability
	        for (i = 0, len = data.length; i < len; i += 4) {
	            histogram[data[i]] += 1;
	        }
	        var size = data.length / 4;
	        for (i = 0; i < 256; i++) {
	            histogram[i] /= size;
	        }
	        var max = -Infinity,
	            variance1 = 0,
	            variance2 = 0,
	            average1 = 0,
	            average2 = 0,
	            average = 0,
	            p = 0;
	        for (i = 0; i < 256; i++) {
	            average += histogram[i] * i;
	        }
	        for (i = 0; i < 256; i++) {
	            variance1 = 0,
	                variance2 = 0,
	                average1 = 0,
	                average2 = 0,
	                average = 0;

	            p += histogram[i];
	            var j;
	            for (j = 0; j < 256; j++) {
	                if (j <= i) {
	                    average1 += (histogram[j] / p) * j;
	                } else {
	                    average2 += (histogram[j] / (1 - p)) * j;
	                }
	            }
	            for (j = 0; j < 256; j++) {
	                if (j <= i) {
	                    variance1 += Math.pow(j - average1, 2) * size * histogram[j];
	                } else {
	                    variance2 += Math.pow(j - average2, 2) * size * histogram[j];
	                }
	            }

	            var a1 = p * Math.pow(average1 - average, 2) + (1 - p) * Math.pow(average2 - average, 2);
	            var a2 = p * variance1 + (1 - p) * variance2;
	            if (a1 / a2 > max) {
	                max = a1 / a2;
	                th = i;
	            }
	        }
	        return binary(data, th);
	    }
	}


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	YI.fn.invert = function() {
	    return this.process(workerBuilder);
	};
	function workerBuilder(){

	    self.onmessage = function(evt){
	        var data = evt.data.data,
	            len = data.length;

	        for (var i = 0; i < len; i += 4) {
	            data[i] = 255 - data[i];
	            data[i + 1] = 255 - data[i + 1];
	            data[i + 2] = 255 - data[i + 2];
	            if(i % Math.floor(len/10) === 0){
	                YI.progress(i, len);
	            }
	        }
	        YI.progress(i ,len);
	        self.postMessage({data:data, type:'data'});
	    };
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);

	YI.fn.filter = function(type) {
	    return this.process(workerBuilder, {
	        type: type,
	    });
	};

	function workerBuilder() {
	    function getKnnAverage(arr, n) {
	        var min = Infinity,
	            index = 0,
	            knnArr = [];

	        for (var i = 0; i < n; i++) {
	            for (var j = 0, len = arr.length; j < len; j++) {
	                var diff = Math.abs(arr[i] - min);
	                if (diff < min) {
	                    min = diff;
	                    index = j;
	                }
	            }
	            knnArr.push(arr[index]);
	            arr.splice(index, 1);
	            min = Infinity;
	        }
	        return YI.sum(knnArr) / knnArr.length;
	    }

	    self.onmessage = function(evt) {
	        var data = evt.data.data,
	            type = evt.data.type;

	        data.width = evt.data.width;
	        data.height = evt.data.height;

	        YI.progress(0, 100);

	        switch (type) {
	            case 'mean':
	                data = YI.applyMatrix(data, [
	                    [1, 1, 1],
	                    [1, 1, 1],
	                    [1, 1, 1]
	                ], 1 / 9);
	                break;
	            case 'mid':
	                data = YI.applyMatrix(data, [
	                    [1, 1, 1],
	                    [1, 1, 1],
	                    [1, 1, 1]
	                ], function(arr) {
	                    var ret = [0, 0, 0];
	                    ret[0] = YI.mid(arr[0]);
	                    ret[1] = YI.mid(arr[1]);
	                    ret[2] = YI.mid(arr[2]);
	                    return ret;
	                });
	                break;
	            case 'gaussian':
	                data = YI.applyMatrix(data, [
	                    [2, 4, 5, 4, 2],
	                    [4, 9, 12, 9, 4],
	                    [5, 12, 15, 12, 5],
	                    [4, 9, 12, 9, 4],
	                    [2, 4, 5, 4, 2]
	                ], 1 / 139);
	                break;
	            case 'knn':
	                data = YI.applyMatrix(data, [
	                    [1, 1, 1],
	                    [1, 1, 1],
	                    [1, 1, 1]
	                ], function(arr) {
	                    var ret = [0, 0, 0];
	                    ret[0] = getKnnAverage(arr[0], 5);
	                    ret[1] = getKnnAverage(arr[1], 5);
	                    ret[2] = getKnnAverage(arr[2], 5);
	                    return ret;
	                });
	                break;
	            default:
	                throw new Error('filter():must pass a type');
	        }
	        YI.progress(100, 100);
	        self.postMessage({
	            data: data,
	            type: 'data'
	        });
	    };
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	    YI.fn.flip = function(dir) {
	        return this.process(workerBuilder, {
	            width: this.width,
	            height: this.height,
	            dir:dir
	        });
	    };
	    function workerBuilder(){

	        self.onmessage = function(evt){
	            var data = evt.data.data,
	                dir = evt.data.dir,
	                width = evt.data.width,
	                height = evt.data.height;
	            data.width = width;
	            data.height = height;
	            var xDir = false,
	                yDir = false;

	            dir = dir.toLowerCase();
	            if (dir.indexOf('x') != -1) {
	                xDir = true;
	            }
	            if (dir.indexOf('y') != -1) {
	                yDir = true;
	            }
	            var x, y, xlen, ylen;
	            if (xDir && yDir) {
	                for (y = 0, ylen = height / 2; y < ylen; y++){
	                    for (x = 0; x < width; x++) {
	                        var leftTop = YI.value(data, x ,y);
	                        var rightBottom = YI.value(data, width - x -1, height - y -1);
	                        YI.value(data, x, y, rightBottom);
	                        YI.value(data, width - x -1, height - y -1, leftTop);
	                    }
	                }
	            } else if (xDir) {
	                for (x = 0, xlen = width / 2; x < xlen; x++) {
	                    for (y = 0; y < height; y++) {
	                        var left = YI.value(data, x, y);
	                        var right = YI.value(data, width - x - 1, y);
	                        YI.value(data, x, y, right);
	                        YI.value(data, width - x - 1, y, left);
	                    }
	                }

	            } else if (yDir) {
	                for (y = 0, ylen = height / 2; y < ylen; y++) {
	                    for (x = 0; x < width; x++) {
	                        var up = YI.value(data, x, y);
	                        var down = YI.value(data, x, height - y - 1);
	                        YI.value(data, x, y, down);
	                        YI.value(data, x, height - y - 1, up);
	                    }
	                }
	            }
	            YI.progress(100, 100);
	            self.postMessage({data:data, type:'data'});
	        };
	    }


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	YI.fn.sepia = function() {
	    return this.process(workerBuilder);
	};
	function workerBuilder(){

	    self.onmessage = function(evt){
	        var data = evt.data.data,
	            len = data.length,
	            r,
	            g,
	            b;
	        for (var i = 0; i < len; i += 4) {
	            r = data[i];
	            g = data[i + 1];
	            b = data[i + 2];
	            data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189); // red
	            data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168); // green
	            data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131); // blue
	            if(i % Math.floor(len/10) === 0){
	                YI.progress(i, len);
	            }
	        }
	        YI.progress(100 ,100);
	        self.postMessage({data:data, type:'data'});
	    };
	}


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	YI.fn.posterize = function() {
	    return this.process(workerBuilder);
	};
	function workerBuilder(){

	    self.onmessage = function(evt){
	        var data = evt.data.data,
	            len = data.length,
	            level = Math.floor(255 / 20);
	        for (var i = 0; i < len; i += 4) {
	            data[i] = Math.floor(data[i] / level) * level;
	            data[i + 1] = Math.floor(data[i + 1] / level) * level;
	            data[i + 2] = Math.floor(data[i + 2] / level) * level;
	            if(i % Math.floor(len/10) === 0){
	                YI.progress(i, len);
	            }
	        }
	        YI.progress(100 ,100);
	        self.postMessage({data:data, type:'data'});
	    };
	}


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	YI.fn.oilPainting = function() {
	    return this.process(workerBuilder);
	};
	function workerBuilder(){

	    self.onmessage = function(evt){
	        var data = evt.data.data,
	            len = data.length,
	            average;
	        for (var i = 0; i < len; i += 4) {
	            average = Math.floor(data[i] + data[i + 1] + data[i + 2]) / 3;
	            average = parseInt(average / 8) * 8;
	            data[i] = average;
	            data[i + 1] = average;
	            data[i + 2] = average;
	            if(i % Math.floor(len/10) === 0){
	                YI.progress(i, len);
	            }
	        }
	        YI.progress(100 ,100);
	        self.postMessage({data:data, type:'data'});
	    };
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var YI = __webpack_require__(1);
	YI.fn.noise = function(type, noiseCount, noiseRadius) {
	    return this.process(workerBuilder, {
	        type: type,
	        noiseCount: noiseCount,
	        noiseRadius: noiseRadius
	    });
	};
	function workerBuilder(){

	    self.onmessage = function(evt){
	        var data = evt.data.data,
	            width = evt.data.width,
	            height = evt.data.height,
	            noiseCount = evt.data.noiseCount,
	            noiseRadius = evt.data.noiseRadius,
	            type = evt.data.type;

	        data.width = width;
	        data.height = height;

	        if (type == 'salt') {
	            noiseCount = noiseCount || 100;
	            noiseRadius = noiseRadius || 1;
	            var offset = Math.floor(noiseRadius / 2);
	            for (var i = 0; i < noiseCount; i++) {
	                var x = offset + Math.floor(Math.random() * (width - offset));
	                var y = offset + Math.floor(Math.random() * (height - offset));
	                var salt = Math.random() > 0.5 ? 255 : 0;
	                if (noiseRadius != 1) {

	                    var offsetUpBound,
	                        offsetBottomBound = -offset;
	                    if (noiseRadius % 2 == 0) {
	                        offsetUpBound = offset - 1;
	                    } else {
	                        offsetUpBound = offset;
	                    }
	                    for (var offsetX = offsetBottomBound; offsetX <= offsetUpBound; offsetX++) {
	                        for (var offsetY = offsetBottomBound; offsetY <= offsetUpBound; offsetY++) {
	                            YI.value(data, x + offsetX, y + offsetY, salt);
	                        }
	                    }
	                } else {
	                    YI.value(data, x, y, salt);
	                }
	            }
	            if(i % Math.floor(noiseCount/10) === 0){
	                YI.progress(i, noiseCount);
	            }
	        }
	        YI.progress(100 ,100);
	        self.postMessage({data:data, type:'data'});
	    };
	}


/***/ }
/******/ ])
});
;