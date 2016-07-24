define(['../core'], function(YI) {
    YI.fn.invert = function() {
        return this.process(workerBuilder);
    };
    function workerBuilder(){

        self.onmessage = function(evt){
            var data = evt.data.data,
                len = data.length;
                
            for (var i = 0; i < len; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
                if(i % Math.floor(len/10) === 0){
                    YI.progress(i, len);
                }
            }
            YI.progress(i ,len);
            self.postMessage({data:data, type:'data'});
        };
    }
});
