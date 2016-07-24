define(['../core'], function(YI) {
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
});
