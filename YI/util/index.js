define(['../core', './ep'], function(YI, EP) {
    YI.EP = EP;
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

    function addDependencies(content){
        var dependencies = [];
        if(content.indexOf('YI.') === -1){
            return content;
        }else{
            findDependencies(content);
            var dependenciesContents = ['var YI = {};'];

            dependencies.forEach(function(method){
                dependenciesContents.push(
                    'YI.' + method + '=' + YI[method].toString()
                );
            });
            dependenciesContents.push(content);
            return dependenciesContents.join('\n');
        }

        function findDependencies(content){
            var rDep = /YI\.([a-zA-Z_$][\w_$]*)/g;
            var methodName;
            var match = rDep.exec(content);

            while(match){
                methodName = match[1];
                if(dependencies.indexOf(methodName) === -1){
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

    YI.progress = function(currentIndex, totalCount){
        var currentProgress = (currentIndex / totalCount).toFixed(1);
        self.postMessage({progress: currentProgress, type:'progress'});
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
                val = [[],[],[]];
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
            if(rowIndex % Math.floor(rowLen/10) === 0){
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
});
