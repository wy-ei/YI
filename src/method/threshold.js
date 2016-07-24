/*
* type:
* "binary" --> value = value > th ? max_value : 0
* "tozero"  -->  value = value > th ? value : 0
* "otsu" --> use Otsu algorithm to choose the optimal th value
*/
var YI = require('../core');

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
