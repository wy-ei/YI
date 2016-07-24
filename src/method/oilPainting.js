var YI = require('../core');
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
