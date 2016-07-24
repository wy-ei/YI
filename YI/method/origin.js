define(['../core'], function(YI) {
    YI.fn.origin = function() {
        return new Promise(function(resolve){
            this.cxt.clearRect(0, 0, this.width, this.height);
            this.cxt.drawImage(this.source, 0, 0);
            resolve(this);
        }.bind(this));
    };
});
