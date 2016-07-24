var YI = require('../core');
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
