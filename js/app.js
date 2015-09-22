$(document).ready(function() {
    var photoProcessor;
    $("#chooseImg").on("change", function() {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(this.files[0]);
        fileReader.onload = function() {
            $img = $("#main-img");
            $img.attr("src", fileReader.result);
            photoProcessor = new PhotoProcessor($("#main-img").get(0));
        }
    });
    $("#select-process-method").on("change", function(event) {
        init();
        var processMethodName = this.value;
        var method = process[processMethodName];

        if (method) {
            method();
        }
    });

    function init() {
        $("#binarization").hide();
        $("#LinTranLP").hide();
    }
    init();
    var process = {
        "原图": function() {
            photoProcessor.origin();
        },
        "灰度图": function() {
            photoProcessor.grey();
            photoProcessor.setImg();
        },
        "8灰度级量化": function() {
            photoProcessor.greyn(8);
            photoProcessor.setImg();
        },
        "16灰度级量化": function() {
            photoProcessor.greyn(16);
            photoProcessor.setImg();
        },
        "32灰度级量化": function() {
            photoProcessor.greyn(32);
            photoProcessor.setImg();
        },
        "二值化": function() {
            $("#binarization").show("slow");
            $button = $("#binarization button");
            if (!$button.attr("binded")) {
                $button.on("click", function(event) {
                    value = parseInt($("#binarization input").val());
                    if (value > 255 || value < 0) {
                        alert("请输入0~255之间的数");
                    } else {
                        photoProcessor.binarization(value);
                        photoProcessor.setImg();
                    }
                    event.preventDefault();
                });
                $button.attr("bined", true);
            }
        },
        "灰度分布直方图": function() {
            photoProcessor.geryDistributionChart();
        },
        "对比度线性展宽": function() {
            $("#LinTranLP").show("slow");
            $button = $("#LinTranLP button");
            if (!$button.attr("binded")) {
                $button.on("click", function(event) {
                    event.preventDefault();
                    var a = 100,
                        b = 180,
                        ga = 50,
                        gb = 220;
                    var inputs = $("#LinTranLP input");
                    inputs.each(function() {
                        var $this = $(this);
                        var id = $this.attr("id");
                        var nan = false;
                        if (isNaN(parseInt($this.val(), 10))) {
                            nan = true;
                        }
                        if (id === "LinTranLP-a") {
                            if (nan) {
                                $this.val(a);
                            } else {
                                a = $this.val();
                            }
                        } else if (id === "LinTranLP-b") {
                            if (nan) {
                                $this.val(b);
                            } else {
                                b = $this.val();
                            }
                        } else if (id === "LinTranLP-ga") {
                            if (nan) {
                                $this.val(ga);
                            } else {
                                ga = $this.val();
                            }
                        } else if (id === "LinTranLP-gb") {
                            if (nan) {
                                $this.val(gb);
                            } else {
                                gb = $this.val();
                            }
                        }
                    });
                    var canvas = $("#LinTranLPCanvas").show().get(0);
                    $(canvas).attr({
                        width: 300,
                        height: 300
                    });
                    var cxt = canvas.getContext('2d');
                    cxt.clearRect(0, 0, 300, 300);

                    cxt.moveTo(0, 300 - 0);
                    cxt.lineTo(a, 300 - ga);
                    cxt.lineTo(b, 300 - gb);
                    cxt.lineTo(255, 300 - 255);
                    // cxt.moveTo(20, 20);
                    // cxt.lineTo(20,300);
                    // cxt.moveTo(20,20);
                    // cxt.lineTo(300,20);
                    cxt.stroke();

                    cxt.fillText("0", 0, 300);
                    cxt.fillText("" + a + "," + ga, a, 300 - ga);
                    cxt.fillText("" + b + "," + gb, b, 300 - gb);
                    cxt.textAlign = "center";
                    cxt.fillText("对比度线性展宽映射关系", 150, 30);
                    $(this).hide();
                    photoProcessor.LinTranLP(a, b, ga, gb);
                    photoProcessor.setImg();
                    $(this).show();
                });
                $button.attr("bined", true);
            }
        },
        "伪彩色": function() {
            photoProcessor.pseudoColor();
            photoProcessor.setImg();
        }
    };


});





var PhotoProcessor = function(img) {
    this.originImg = new Image();
    this.originImg.src = img.getAttribute("src");
    this.img = img;
    var that = this;
    $("<img/>")
        .attr("src", $(img).attr("src"))
        .load(function() {
            that.size = {
                width: this.width,
                height: this.height
            };
            that.canvas = document.createElement("canvas");
            $(that.canvas).attr({
                width: that.size.width + "px",
                height: that.size.height + "px"
            });
            that.cxt = that.canvas.getContext('2d');
            that.cxt.drawImage(that.originImg, 0, 0);
            that.imgData = that.cxt.getImageData(0, 0, that.size.width, that.size.height);
        });

};
PhotoProcessor.prototype.getData = function() {
    this.cxt.clearRect(0, 0, this.size.width, this.size.height);
    this.cxt.drawImage(this.originImg, 0, 0);
    this.imgData = this.cxt.getImageData(0, 0, this.size.width, this.size.height);
    return this.imgData.data;
};
PhotoProcessor.prototype.grey = function() {
    var data = this.getData();
    var red, blue, green, average;
    for (var i = 0, len = data.length; i < len; i += 4) {
        red = data[i];
        green = data[i + 1];
        blue = data[i + 2];
        average = Math.floor(red + green + blue) / 3;
        data[i] = average;
        data[i + 1] = average;
        data[i + 2] = average;
    }
    this.imgData.data = data;
};
PhotoProcessor.prototype.greyn = function(n) {
    var data = this.getData();
    var red, blue, green, average;
    for (var i = 0, len = data.length; i < len; i += 4) {
        red = data[i];
        green = data[i + 1];
        blue = data[i + 2];
        average = Math.floor(red + green + blue) / 3;
        average = Math.floor((average / 255) * n) * 256 / n;
        data[i] = average;
        data[i + 1] = average;
        data[i + 2] = average;
    }
    this.imgData.data = data;
}
PhotoProcessor.prototype.binarization = function(n) {
    var data = this.getData();
    var red, blue, green, average;
    for (var i = 0, len = data.length; i < len; i += 4) {
        red = data[i];
        green = data[i + 1];
        blue = data[i + 2];
        average = Math.floor(red + green + blue) / 3;
        if (average > n) {
            average = 255;
        } else {
            average = 0;
        }
        data[i] = average;
        data[i + 1] = average;
        data[i + 2] = average;
    }
    this.imgData.data = data;
};

PhotoProcessor.prototype.geryDistributionChart　 = function() {
    var canvas = document.createElement("canvas");
    $(canvas).attr({
        width: 256 * 3 + 20,
        height: 500
    });
    var cxt = canvas.getContext('2d');
    cxt.fillStyle = "#fff";
    cxt.fillRect(0, 0, 256 * 3 + 20, 500);
    this.grey();
    var data = this.imgData.data;
    var arr = new Array(256);
    for (var i = 0; i <= 255; i++) {
        arr[i] = 0;
    }
    for (var i = 0, len = data.length; i < len; i += 4) {
        arr[data[i]] = arr[data[i]] + 1;
    }
    var pixCount = data.length / 4;
    var maxCount = Math.max.apply(null, arr);
    cxt.strokeStyle = "#000";
    cxt.lineWidth = "1px";
    cxt.beginPath();
    for (i = 0; i <= 256; i++) {
        cxt.moveTo(i * 3, 490);
        cxt.lineTo(i * 3, Math.floor((1 - (arr[i] / maxCount)) * 490));
    }
    cxt.font = "bold 16px Arial";
    cxt.fillStyle = "#000";
    for (i = 0; i < 255; i += 50) {
        cxt.fillText("" + i, 3 * i, 500);
    }
    cxt.textAlign = 'center';
    cxt.fillText("灰度分布直方图", 256 * 3 / 2, 30);

    //
    cxt.stroke();

    $(this.img).attr("src", canvas.toDataURL("image/jpeg"));
};

PhotoProcessor.prototype.LinTranLP = function(a, b, ga, gb) {
    var data = this.getData();
    var red, blue, green, average;
    var f1 = (function() {
        var k = ga / a;
        return function(x) {
            return Math.floor(x * k);
        }
    })();
    var f2 = (function() {
        var _k = (gb - ga) / (b - a);
        var _b = ga - _k * a;
        return function(x) {
            return Math.floor(_k * x + _b);
        }
    })();
    var f3 = (function() {
        var _k = (255 - gb) / (255 - b);
        var _b = gb - _k * b;
        return function(x) {
            return Math.floor(_k * x + _b);
        }
    })();
    for (var i = 0, len = data.length; i < len; i += 4) {
        for (var j = 0; j < 3; j++) {
            if (data[i + j] < a) {
                data[i + j] = f1(data[i + j]);
            } else if (data[i + j] < b) {
                data[i + j] = f2(data[i + j]);
            } else {
                data[i + j] = f3(data[i + j]);
            }
        }
    }
    this.imgData.data = data;
}

PhotoProcessor.prototype.setImg = function() {
    this.cxt.putImageData(this.imgData, 0, 0);
    var imgURL = this.canvas.toDataURL("image/jpeg");
    $(this.img).attr("src", imgURL);
};

PhotoProcessor.prototype.origin = function() {
    $(this.img).attr("src", $(this.originImg).attr("src"));
};


PhotoProcessor.prototype.pseudoColor = function(){
    var gR =  (function (){
        var 
            k = 255 / (192-128),
            b = 255  - 192 * k;
        return function(n){
            var ret = 0;
            if(n<=128){
                ret = 0;
            }else if(n<=192){
                ret = k*n + b;
            }else{
                ret = 255;
            }
            return ret;
        };
    })();
    var gG = (function(){
        var
            k1 = 255 / 64,
            b1 = 255 - 64*k1,
            k2 = -255 / (255-192),
            b2 = 255 - 192*k2;
        return function(n){
            var ret = 0;
            if(n<=64){
                ret = k1 * n +b1;
            }else if(n<=192){
                ret = 255;
            }else{
                ret = k2 * n + b2;
            }
            return ret;
        };
    })();
    var gB = (function(){
        var 
            k = -255 / (128-64);
            b = 255 - 64*k;
        return function(n){
            var ret = 0;
            if(n<=64){
                ret = 255;
            }else if(n<=128){
                ret = k * n + b;
            }else{
                ret = 0;
            }
            return ret;
        };
    })();
    var data = this.getData();
    var red,blue,green,average;
    for(var i=0,len=data.length;i<len;i+=4){
        red = data[i];
        green = data[i+1];
        blue = data[i+2];
        average = Math.floor(red+green+blue)/3;
        
        data[i] = gR(average);
        data[i+1] = gG(average);
        data[i+2] = gB(average);
    }
    this.imgData.data = data;
};

PhotoProcessor.prototype.LinearDynamicRangeAdjustment = function(){

};