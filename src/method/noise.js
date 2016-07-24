var YI = require('../core');
YI.fn.noise = function(type, noiseCount, noiseRadius) {
    return this.process(workerBuilder, {
        type: type,
        noiseCount: noiseCount,
        noiseRadius: noiseRadius
    });
};
function workerBuilder(){

    self.onmessage = function(evt){
        var data = evt.data.data,
            width = evt.data.width,
            height = evt.data.height,
            noiseCount = evt.data.noiseCount,
            noiseRadius = evt.data.noiseRadius,
            type = evt.data.type;

        data.width = width;
        data.height = height;

        if (type == 'salt') {
            noiseCount = noiseCount || 100;
            noiseRadius = noiseRadius || 1;
            var offset = Math.floor(noiseRadius / 2);
            for (var i = 0; i < noiseCount; i++) {
                var x = offset + Math.floor(Math.random() * (width - offset));
                var y = offset + Math.floor(Math.random() * (height - offset));
                var salt = Math.random() > 0.5 ? 255 : 0;
                if (noiseRadius != 1) {

                    var offsetUpBound,
                        offsetBottomBound = -offset;
                    if (noiseRadius % 2 == 0) {
                        offsetUpBound = offset - 1;
                    } else {
                        offsetUpBound = offset;
                    }
                    for (var offsetX = offsetBottomBound; offsetX <= offsetUpBound; offsetX++) {
                        for (var offsetY = offsetBottomBound; offsetY <= offsetUpBound; offsetY++) {
                            YI.value(data, x + offsetX, y + offsetY, salt);
                        }
                    }
                } else {
                    YI.value(data, x, y, salt);
                }
            }
            if(i % Math.floor(noiseCount/10) === 0){
                YI.progress(i, noiseCount);
            }
        }
        YI.progress(100 ,100);
        self.postMessage({data:data, type:'data'});
    };
}
