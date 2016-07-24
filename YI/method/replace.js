define(['../core'], function(YI) {
    YI.fn.replace = function(img) {
        var dataURL = this.canvas.toDataURL('image/jpeg');
        img.setAttribute('src', dataURL);
        return this;
    };
});
