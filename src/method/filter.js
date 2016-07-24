var YI = require('../core');

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
