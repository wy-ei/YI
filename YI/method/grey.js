define(['../core'], function(YI) {
    YI.fn.gray = function() {
        return this.process(workerBuilder);
    };
    function workerBuilder(){
        
        self.onmessage = function(evt){
            var data = evt.data.data,
                average,
                len = data.length;

            for (var i = 0; i < len; i += 4) {
                average = Math.floor(data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = average;
                data[i + 1] = average;
                data[i + 2] = average;

                if(i % Math.floor(len/10) === 0){
                    YI.progress(i, len);
                }
            }
            YI.progress(i ,len);
            self.postMessage({data:data, type:'data'});
        };
    }
});
