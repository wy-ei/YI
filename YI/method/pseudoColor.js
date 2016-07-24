define(['../core'], function(YI) {
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
});
