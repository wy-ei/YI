var YI = require('../core');
YI.fn.replace = function(img) {
    var dataURL = this.canvas.toDataURL('image/jpeg');
    img.setAttribute('src', dataURL);
    return this;
};
