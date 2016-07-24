var YI = require('../core');
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
