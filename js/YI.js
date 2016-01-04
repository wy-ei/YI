/*
 * yi.js   
 * description:a little photo process library
 * author:wy
 * e-mail:nameiswangyu@163.com
 */


// gray --> 灰度图
// pseudoColor --> 伪彩色
// flip --> 反色
// threshold --> 图像分割

(function(window){
	var YI = function(img){
		var src = img.getAttribute('src');
		this.source = new Image();
		this.source.src = src;
		this.img = img;

		this.canvas = document.createElement('canvas');
		this.width = this.source.width;
		this.height = this.source.height;
		console.log(this.width);
		var canvas = this.canvas;
		canvas.setAttribute('width', this.width);
		canvas.setAttribute('height', this.height);
		this.cxt = canvas.getContext('2d');
		this.cxt.drawImage(this.img,0,0);
		document.body.appendChild(canvas);
		this._cache = {length:0};
	};

	YI.nArray = function(n,arr){
		arr = arr.map(function(value) {
			return n * value;
		});
		return arr;
	}
	YI.sum = function(arr){
		return arr.reduce(function(pre,val){
			return pre+val;
		});
	};

	YI.mid = function(arr){
    	var arr = arr.concat();
    	arr.sort(function(a,b){
    		return a-b;
    	});
    	var index = Math.floor(arr.length /2);
    	return arr[index];
    };


	YI.fn = YI.prototype;

	YI.processing = function(now,total){
		var current = Math.ceil((100 * now) / total);
		if(YI.fn.old == null){
			YI.fn.old = 0;
		}
		if(YI.fn.old > 99){
			YI.fn.old = -1;
		}
		if(YI.fn.old < current){
			YI.fn.old = current;
			YI.publish('process',current);
		}
	};	


	YI.fn.getData = function(){
		return this.cxt.getImageData(0,0,this.width,this.height);
	};
	YI.fn.setData = function(imageData){
		this.cxt.putImageData(imageData,0,0);
	};
	YI.fn.origin = function(){
		this.cxt.clearRect(0,0,this.width,this.height);
		this.cxt.drawImage(this.source,0,0);
		return this;
	};
	YI.fn.replace = function(img){
    	var dataURL = this.canvas.toDataURL("image/jpeg");
    	img.setAttribute('src', dataURL);
    	return this;
	};

	YI.fn.getBlankData = function(){
		var canvas = document.createElement('canvas'),
        	context =  canvas.getContext('2d'),
        	imageData = context.createImageData(this.width, this.height),
        	data = imageData.data;
        return data;
	}

	YI.fn.gray = function(type){
		var imageData = this.getData(),
			data = imageData.data;
		var average;
	    for (var i = 0, len = data.length; i < len; i += 4) {
	        average = Math.floor(data[i] + data[i+1] + data[i+2]) / 3;
	        data[i] = average;
	        data[i + 1] = average;
	        data[i + 2] = average;
	    }
	    this.setData(imageData);
		return this;
	};

	YI.fn.oilPainting = function(){
		var imageData = this.getData(),
			data = imageData.data;

		var red, blue, green, average;

	    for (var i = 0, len = data.length; i < len; i += 4) {
	        average = Math.floor(data[i] + data[i+1] + data[i+2]) / 3;
	        average = parseInt(average/16)*16;
	        data[i] = average;
	        data[i + 1] = average;
	        data[i + 2] = average;
	    }
	    this.setData(imageData);
		return this;
	}
	YI.fn.sharp = function(){
		var imageData = this.getData(),
			data = imageData.data,
			width = imageData.width,
			height = imageData.height,
			lamta =  1.6;
	    for (var i = 0, len = data.length; i < len; i += 4) {
			var ii = i / 4;
            var row = parseInt(ii / width);
            var col = ii % width;
            if(row == 0 || col == 0) continue;

            var A = ((row - 1) *  width + (col - 1)) * 4;
            var B = ((row - 1) * width + col) * 4;
            var E = (ii - 1) * 4;

            for(var j = 0;j < 3;j ++){
                var delta = data[i + j] - (data[B + j] + data[E + j] + data[A + j]) / 3;
                data[i + j] += delta * lamta;
            }
	    }
	    this.setData(imageData);
		return this;
	}

	YI.fn.posterize = function(){
		var imageData = this.getData(),
			data = imageData.data;
		var level = Math.floor(255/20);
		for (var i = 0, len = data.length; i < len; i += 4) {
	        data[i] = Math.floor(data[i]/level)*level;
	        data[i + 1] = Math.floor(data[i+1]/level)*level;
	        data[i + 2] = Math.floor(data[i+2]/level)*level;
	    }
	    this.setData(imageData);
		return this;
	};

	YI.fn.embossment = function(){
		var imageData = this.getData(),
			data = imageData.data,
			width = imageData.width,
			height = imageData.height;

        var outData = [];
        for(var i = 0,n = data.length;i < n;i += 4){

            var ii = i / 4;
            var row = parseInt(ii / width);
            var col = ii % width;
            var A = ((row - 1) *  width + (col - 1)) * 4;
            var G = (row + 1) * width * 4 + (col + 1) * 4;

            if(row == 0 || col == 0) continue;
            for(var j = 0;j < 3;j ++){
                outData[i + j] = data[A + j] - data[G + j] + 127.5;
            }
            outData[i + 4] = data[i + 4];
        }

        for(var i = 0,n = data.length;i < n;i ++){
            data[i] = outData[i] || data[i];
        }
        this.setData(imageData);
		return this;
	}

	YI.fn.gamma = function(g){
		var imageData = this.getData(),
			data = imageData.data,
			width = imageData.width,
			height = imageData.height;
		g = g || 10;
		var normalizedArg = ((g + 100) / 200) * 2;
		for (var i = 0, len = data.length; i < len; i += 4) {
			data[i] = Math.pow(data[i],normalizedArg);
	        data[i+1] = Math.pow(data[i+1],normalizedArg);
	        data[i+2] = Math.pow(data[i+2],normalizedArg);
	    }
        this.setData(imageData);
		return this;
	}

	YI.fn.pseudoColor = function(){
		var imageData = this.getData(),
			data = imageData.data;

		for (var i = 0, len = data.length; i < len; i += 4) {

			var red = data[i];
			if(red < 128){
				red = 0;
			}else if(red < 192){
				red = ( 255 / 64 ) * (red - 128);
			}else{
				red = 255;
			}

			var green = data[i+1];
			if(green < 64){
				green = ( 255 / 64 ) * green;
			}else if(green < 192){
				green = 255;
			}else{
				green = 255 - (255 / 64) * (green - 192);
			}

			var blue = data[i+2];
			if(blue < 64){
				blue = 255;
			}else if(blue < 128){
				blue = 255 - (255 / 64) * (blue - 64);
			}else{
				blue = 0;
			}
			data[i] = red;
	        data[i+1] = green;
	        data[i+2] = blue;
	    }
	    this.setData(imageData);
		return this;

	};
	YI.fn.flip = function(){
		var imageData = this.getData(),
			data = imageData.data;
		for (var i = 0, len = data.length; i < len; i += 4) {
			data[i] = 255-data[i];
	        data[i+1] = 255-data[i+1];
	        data[i+2] = 255-data[i+2];
	    }
	    this.setData(imageData);
	    return this;
	};



	/*
	 * type:
	 * "binary" --> value = value > th ? max_value : 0
     * "tozero"  -->  value = value > th ? value : 0
     * "otsu" --> use Otsu algorithm to choose the optimal th value
     */
	YI.fn.threshold = function(type,th){
		var imageData = this.getData(),
			data = imageData.data;
		function _threshold(type,th){
			if(typeof type == "number"){
				type = "binary";
			}
			if(type == "binary"){
				for (var i = 0, len = data.length; i < len; i += 4) {
					if(data[i] > th){
						data[i] = 255;
				        data[i+1] = 255;
				        data[i+2] = 255;
					}else{
						data[i] = 0;
				        data[i+1] = 0;
				        data[i+2] = 0;				
					}
				}
			}else if(type == "tozero"){
				for (var i = 0, len = data.length; i < len; i += 4) {
					if(data[i] < th){
						data[i] = 0;
				        data[i+1] = 0;
				        data[i+2] = 0;
				    }
				}
			}else if(type == "otsu"){
				var histogram = new Array(256);
				for(var i=0;i<256;i++){
					histogram[i] = 0;
				}
				for (var i = 0, len = data.length; i < len; i += 4) {
					histogram[data[i]] += 1;
				}
				var size = data.length / 4;
				for(var i=0;i<256;i++){
					histogram[i] /= size;
				}

				//average pixel value   
	    		var avgValue = 0;
	    		for(var i=0;i<255;i++){
					avgValue += histogram[i] * i;
				}
			    var maxVariance = 0,  
			    	w=0,
			    	u=0;  
			    for(var i=0;i<256;i++) {  
			        w += histogram[i];  
			        u += i*histogram[i];  
			  
			        var t=avgValue*w-u;  
			        var variance=t*t/(w*(1-w));  
			        if(variance>maxVariance) {  
			            maxVariance=variance;  
			            th=i;  
			        }  
			    }  
	  			_threshold("binary",th);
			}else if(type == "ml"){
				var histogram = new Array(256);
				for(var i=0;i<256;i++){
					histogram[i] = 0;
				}

				// get distribution probability
				for (var i = 0, len = data.length; i < len; i += 4) {
					histogram[data[i]] += 1;
				}
				var size = data.length / 4;
				for(var i=0;i<256;i++){
					histogram[i] /= size;
				}
				var max = -Infinity;
				for(i = 0;i<256;i++){
					var variance1 = 0,
						variance2 = 0,
						average1 = 0,
						average2 = 0,
						average = 0,
						p = 0;
					for(var j=0;j<256;j++){
						if(j<i){
							average1 += histogram[j] * j;
							p += histogram[j];
						}else{
							average2 += histogram[j] * j;
						}
					}
					for(var j=0;j<256;j++){
						if(j<i){
							variance1 += Math.pow(j - average1, 2) * size * histogram[j];
						}else{
							variance2 += Math.pow(j - average2, 2) * size * histogram[j];
						}
					}
					average = average1 + average2;

					var a1 = p * Math.pow( average1 - average , 2 ) 
							+ (1 - p) * Math.pow( average2 - average , 2 );
					var a2 = p * variance1 + (1 - p) * variance2;
					if(a1/a2 > max){
						max = a1/a2;
						th = i; 
					}
				}
				_threshold("binary",th);
			}else{
				_threshold("binary",th);
			}	
		}
		_threshold(type,th);
		this.setData(imageData);
	    return this;
	};

	// helper
	YI.fn._value = function(data,x,y,value){
		var width = this.width,
			index = (x*width+y)*4;
		//getter
		if(value == null){
			var ret = [];
			ret.push(data[index]);
			ret.push(data[index+1]);
			ret.push(data[index+2]);
			return ret;
		}
		// setter
		else{
			if(Array.isArray(value)){
				data[index] = value[0];
				data[index+1] = value[1];
				data[index+2] = value[2];
			}else{
				data[index] = value;
				data[index+1] = value;
				data[index+2] = value;
			}
		}
	};
	YI.fn.getMatrix = function(data,row,col,rowCount,colCount,channel){
		var rowOffset = Math.floor(rowCount/2),
			colOffset = Math.floor(colCount/2);
		var ret = [],
			red = [],
			grren = [],
			blue = [];
		if(channel == 'r'){
			for(var x = -rowOffset;x <= rowOffset;x++){
				var _red = [];
				for(var y = -colOffset;y<=colOffset;y++){
					var arr = this._value(data,row+x,col+y);
					_red.push(arr[0]);
				}
				red.push(_red);
			}
			return red;
		}else if(channel == 'g'){
			for(var x = -rowOffset;x <= rowOffset;x++){
				var _green = [];
				for(var y = -colOffset;y<=colOffset;y++){
					var arr = this._value(data,row+x,col+y);
					_green.push(arr[1]);
				}
				green.push(_green);
			}
		}else if(channel == 'b'){
			for(var x = -rowOffset;x <= rowOffset;x++){
				var _blue = [];
				for(var y = -colOffset;y<=colOffset;y++){
					var arr = this._value(data,row+x,col+y);
					_blue.push(arr[1]);
				}
				blue.push(_blue);
			}
			return blue;
		}else{
			for(var x = -rowOffset;x <= rowOffset;x++){
				var _red = [],
					_green = [],
					_blue = [];
				for(var y = -colOffset;y<=colOffset;y++){
					var arr = this._value(data,row+x,col+y);
					_red.push(arr[0]);
					_green.push(arr[1]);
					_blue.push(arr[2]);
				}
				red.push(_red);
				green.push(_green);
				blue.push(_blue);
			}
			ret.push(red);
			ret.push(green);
			ret.push(blue);
			return ret;
		}
	};

	YI.fn.applyMultiMatrix = function(data,matrixs,predicate){
		var retData = this.getBlankData();
		var row = matrixs[0].length,
			col = matrixs[0][0].length;
		var w = this.width,
			h = this.height;
		var rowOffset = Math.floor(row/2),
			colOffset = Math.floor(col/2);
		var val;
		var ret = [];
		for(var i=rowOffset,rowLen=h-rowOffset;i<rowLen;i++){
			for(var j=colOffset,colLen=w-colOffset;j<colLen;j++){
				var mVal = [];
				for(var n = 0;n<matrixs.length;n++){
					val = [[],[],[]];
					for(var x = -rowOffset;x <= rowOffset;x++){
						for(var y = -colOffset;y<=colOffset;y++){
							var arr = this._value(data,i+x,j+y);
							var m = matrixs[n][x+rowOffset][y+colOffset];
							val[0].push(arr[0]*m);
							val[1].push(arr[1]*m);
							val[2].push(arr[2]*m);
						}
					}
					mVal.push(val);
				}
				var arr = predicate(mVal);
				this._value(retData,i,j,arr);
			}
		}
		console.log(retData);
		return retData;
	}


	YI.fn.applyMatrix = function(data,matrix,k,predicate){
		var retData = this.getBlankData();
		if(typeof k == 'function'){
			predicate = k;
		}else{
			k = k||1;
		}

		var row = matrix.length,
			col = matrix[0].length;
		var w = this.width,
			h = this.height;
		var rowOffset = Math.floor(row/2),
			colOffset = Math.floor(col/2);
		var val;
		for(var i=rowOffset,rowLen=h-rowOffset;i<rowLen;i++){
			for(var j=colOffset,colLen=w-colOffset;j<colLen;j++){
				val = [[],[],[]];
				for(var x = -rowOffset;x <= rowOffset;x++){
					for(var y = -colOffset;y<=colOffset;y++){
						var arr = this._value(data,i+x,j+y);
						var n = matrix[x+rowOffset][y+colOffset];
						val[0].push(arr[0]*n);
						val[1].push(arr[1]*n);
						val[2].push(arr[2]*n);
					}
				}
				var arr;
				if(predicate){
					arr = predicate(val);
				}else{
					arr = [0,0,0];
					arr[0] = k * YI.sum(val[0]);
					arr[1] = k * YI.sum(val[1]);
					arr[2] = k * YI.sum(val[2]);
				}
				this._value(retData,i,j,arr);
			}
		}
		return retData;
	}


	YI.fn.filter = function(type,n){
		var imageData = this.getData(),
			data = imageData.data;
		if(type == 'mean'){
			var newData = this.applyMatrix(data,[
				[1,1,1],
				[1,1,1],
				[1,1,1]
			],1/9);
			for(var i=0,len=data.length;i<len;i+=4){
				data[i] = newData[i];
				data[i+1] = newData[i+1];
				data[i+2] = newData[i+2];
			}
		}else if(type == 'mid'){
			var newData = this.applyMatrix(data,[
				[1,1,1],
				[1,1,1],
				[1,1,1]
			],function(arr){
				var ret = [0,0,0];
				ret[0] = YI.mid(arr[0]);
				ret[1] = YI.mid(arr[1]);
				ret[2] = YI.mid(arr[2]);
				return ret;
			});
			for(var i=0,len=data.length;i<len;i+=4){
				data[i] = newData[i];
				data[i+1] = newData[i+1];
				data[i+2] = newData[i+2];
			}
		}else if(type == 'gaussian'){
			var newData = this.applyMatrix(data,[
				[2,4,5,4,2],  
				[4,9,12,9,4],
				[5,12,15,12,5],
				[4,9,12,9,4],
				[2,4,5,4,2]
			],1/139);
			for(var i=0,len=data.length;i<len;i+=4){
				data[i] = newData[i];
				data[i+1] = newData[i+1];
				data[i+2] = newData[i+2];
			}
		}
		this.setData(imageData);
		return this;
	};
	YI.fn.normalize = function(data){
		var min = Infinity;
		for(var i=0,len=data.length;i<len;i+=4){
			if(data[i]<min){
				min = data[i];
			}
			if(data[i+1]<min){
				min = data[i+1];
			}
			if(data[i+2]<min){
				min = data[i+2];
			}
		}
		console.log(min);
		if(min<0){
			min = Math.abs(min);
			for(var i=0,len=data.length;i<len;i+=4){
				data[i] += min;
				data[i+1] += min;
				data[i+2] += min;
			}
		}
	}
	var iiii =0;
	YI.fn.differentialOperator = function(type){
		var imageData = this.getData(),
			data = imageData.data;
		if(type == 'horizontal'){
			var newData = this.applyMatrix(data,[
				[1,2,1],
				[0,0,0],
				[-1,-2,-1]
			]);
			for(var i=0,len=data.length;i<len;i+=4){
				data[i] = newData[i];
				data[i+1] = newData[i+1];
				data[i+2] = newData[i+2];
			}
		}else if(type == 'vertical'){
			var newData = this.applyMatrix(data,[
				[1,0,-1],
				[2,0,-2],
				[1,0,-1]
			]);
			for(var i=0,len=data.length;i<len;i+=4){
				data[i] = newData[i];
				data[i+1] = newData[i+1];
				data[i+2] = newData[i+2];
			}
		}else if(type == 'soble'){
			var newData = this.applyMultiMatrix(data,[[
				[-1,-2,-1],
				[0,0,0],
				[1,2,1]
			],[
				[-1,0,1],
				[-2,0,2],
				[-1,0,1]
			]],function(arr){
				var m1 = arr[0],
					m2 = arr[1];
				var ret = [0,0,0];
				for(var i=0;i<3;i++){
					ret[i] = Math.sqrt(Math.pow(YI.sum(m1[i]),2) + 
						Math.pow(YI.sum(m2[i]),2));
				}
				return ret;
			});
			for(var i=0,len=data.length;i<len;i+=4){
				data[i] = newData[i];
				data[i+1] = newData[i+1];
				data[i+2] = newData[i+2];
			}
		}else if(type == 'laplace'){
			var newData = this.applyMatrix(data,[
				[0,1,0],
				[1,-4,1],
				[0,1,0]
			]);
			for(var i=0,len=data.length;i<len;i+=4){
				data[i] = newData[i];
				data[i+1] = newData[i+1];
				data[i+2] = newData[i+2];
			}
		}else if(type == 'canny'){
			var newData = this.applyMultiMatrix(data,[[
				[-1,0,1],
				[-2,0,2],
				[-1,0,1]
			],[
				[-1,-2,-1],
				[0,0,0],
				[1,2,1]
			]],function(arr){
				var m1 = arr[0],
					m2 = arr[1];
				var ret = [0,0,0];
				for(var i=0;i<3;i++){
					ret[i] = Math.sqrt(Math.pow(YI.sum(m1[i]),2) + 
						Math.pow(YI.sum(m2[i]),2));
				}
				return ret;
			});
			for(var i=0,len=data.length;i<len;i+=4){
				data[i] = newData[i];
				data[i+1] = newData[i+1];
				data[i+2] = newData[i+2];
			}
		}
		this.setData(imageData);
		return this;
	};

	YI.fn.sepia = function(){
		var imageData = this.getData(),
			data = imageData.data;
		for(var i=0,len=data.length;i<len;i+=4){
			var r = data[i];
			var g = data[i + 1];
			var b = data[i + 2];
			data[i]     = (r * 0.393)+(g * 0.769)+(b * 0.189); // red
			data[i + 1] = (r * 0.349)+(g * 0.686)+(b * 0.168); // green
			data[i + 2] = (r * 0.272)+(g * 0.534)+(b * 0.131); // blue
		}
		this.setData(imageData);
		return this;
	}

	window.YI = YI;
})(window); 