var YI = require('../core');
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
