$(document).ready(function(){
    var photoProcessor;
    $("#chooseImg").on("change",function(){
        var fileReader = new FileReader();
        fileReader.readAsDataURL(this.files[0]);
        fileReader.onload = function(){
            $img = $("#main-img");
            $img.attr("src",fileReader.result);
             photoProcessor = new PhotoProcessor($("#main-img").get(0));
        }
    });
    $("#select-process-method").on("change",function(event){
        var processMethodName = this.value;
        var method = process[processMethodName];
         init();
        if(method){
            method();
        }
    });

    function init(){
        $("#binarization").hide();
        $("#LinTranLP").hide();
    }
    init();
    var  process = {
        "原图":function(){
            photoProcessor.origin();
        },
        "灰度图":function(){
            photoProcessor.grey();
            photoProcessor.setImg();
        },
        "8灰度级量化":function(){
            photoProcessor.greyn(8);
            photoProcessor.setImg();
        },
        "16灰度级量化":function(){
            photoProcessor.greyn(16);
            photoProcessor.setImg();
        },
        "32灰度级量化":function(){
            photoProcessor.greyn(32);
            photoProcessor.setImg();
        },
        "二值化":function(){
            $("#binarization").show("slow");
            $button = $("#binarization button");
            if( ! $button.attr("binded") ){
                $button.on("click",function(event){
                    value = parseInt($("#binarization input").val());
                    if( value >255 || value < 0 ){
                        alert("请输入0~255之间的数");
                    }else{
                        photoProcessor.binarization(value);
                        photoProcessor.setImg();
                    }
                    event.preventDefault();
                });
                $button.attr("bined",true);
            }
        },
        "灰度分布直方图":function(){
            photoProcessor.geryDistributionChart();
        },
        "线性对比度展宽":function(){
            $("#LinTranLP").show("slow");
            $button = $("#LinTranLP button");
            if( !$button.attr("binded") ){
                $button.on("click",function(event){
                    alert("click");
                    var a=100,b=180,ga=50,gb=220;
                    var inputs = $("#LinTranLP input");
                    inputs.each(function(){
                        var $this = $(this);
                        var id = $this.attr("id");
                        if(  isNaN( parseInt($this.val(),10)  )  ){
                            alert("请正确设置a,b,ga,gb的值");
                            return false;
                        }else if( id === "LinTranLP-a"){
                            a = $this.val();
                        }else if( id  === "LinTranLP-b"){
                            b = $this.val();
                        }else if( id === "LinTranLP-ga"){
                            ga = $this.val();
                        }else if( id === "LinTranLP-gb"){
                            gb = $this.val();
                        }
                    });
                    photoProcessor.LinTranLP(a,b,ga,gb);
                    photoProcessor.setImg();
                    event.preventDefault();
                });
                $button.attr("bined",true);
            }
            
        }
    }

});





var PhotoProcessor = function(img){
    this.originImg = new Image();
    this.originImg.src = img.getAttribute("src");
    this.img = img;
    var that = this;
    $("<img/>")
        .attr("src", $(img).attr("src"))
        .load(function() {
            that.size = {
                width:this.width,
                height:this.height
            };
            that.canvas = document.createElement("canvas");
            $(that.canvas).attr({
                width:that.size.width+"px",
                height:that.size.height+"px"
            });
            that.cxt = that.canvas.getContext('2d');
            that.cxt.drawImage(that.originImg,0,0);
            that.imgData = that.cxt.getImageData(0,0,that.size.width,that.size.height);
        });

};
PhotoProcessor.prototype.getData = function(){
    this.cxt.clearRect(0,0,this.size.width,this.size.height);
    this.cxt.drawImage(this.originImg,0,0);
    this.imgData = this.cxt.getImageData(0,0,this.size.width,this.size.height);
    return this.imgData.data;
};
PhotoProcessor.prototype.grey = function(){
    var data = this.getData();
    var red,blue,green,average;
    for(var i=0,len=data.length;i<len;i+=4){
        red = data[i];
        green = data[i+1];
        blue = data[i+2];
        average = Math.floor(red+green+blue)/3;
        data[i] = average;
        data[i+1] = average;
        data[i+2] = average;
    }
    this.imgData.data = data;
};
PhotoProcessor.prototype.greyn = function(n){
    var data = this.getData();
    var red,blue,green,average;
    for(var i=0,len=data.length;i<len;i+=4){
        red = data[i];
        green = data[i+1];
        blue = data[i+2];
        average = Math.floor(red+green+blue)/3;
        average = Math.floor((average /  255 ) * n) * 256/n ;
        data[i] = average;
        data[i+1] = average;
        data[i+2] = average;
    }
    this.imgData.data = data;
}
PhotoProcessor.prototype.binarization = function(n){
    var data = this.getData();
    var red,blue,green,average;
    for(var i=0,len=data.length;i<len;i+=4){
        red = data[i];
        green = data[i+1];
        blue = data[i+2];
        average = Math.floor(red+green+blue)/3;
        if(average > n){
            average = 255;
        }else{
            average = 0;
        }
        data[i] = average;
        data[i+1] = average;
        data[i+2] = average;
    }
    this.imgData.data = data;
};

PhotoProcessor.prototype.geryDistributionChart　= function(){
    var canvas = document.createElement("canvas");
    $(canvas).attr({width:256*3,height:500});
    var cxt = canvas.getContext('2d');
    cxt.fillStyle = "#fff";
    cxt.fillRect(0,0,256*3,500);
    this.grey();
    var data = this.imgData.data;
    var arr = new Array(256);
    for(var i=0;i<=255;i++){
        arr[i] = 0;
    }
    for(var i=0,len=data.length;i<len;i+=4){
        arr[data[i]] =arr[data[i]] + 1;
    }
    var pixCount = data.length / 4;
    var maxCount = Math.max.apply(null,arr);
    cxt.strokeStyle = "#000";
    cxt.lineWidth = "1px";
    cxt.beginPath();
    for(i=0;i<=256;i++){   
        cxt.moveTo(i*3,500);
        cxt.lineTo(i*3,Math.floor((1-(arr[i]/maxCount))*500+30));
    }
    //
    cxt.stroke();
    
    $(this.img).attr("src",canvas.toDataURL("image/jpeg"));
};

PhotoProcessor.prototype.LinTranLP = function(a,b,ga,gb){
    var data = this.getData();
    var red,blue,green,average;
    var f1 = (function(){
        var k = ga/a;
        return function(x){
            return Math.floor(x*k);
        }
    })();
    var f2 = (function(){
        var _k = (gb-ga) / (b-a);
        var _b = ga - _k * a;
        return function(x){
            return Math.floor(_k*x+_b);
        }
    })();
    var f3 = (function(){
         var _k = (255-gb) / (255-b);
        var _b = gb - _k * b;
        return function(x){
            return Math.floor(_k*x+_b);
        } 
    })();
    for(var i=0,len=data.length;i<len;i+=4){
        for(var j=0;j<3;j++){
            if(data[i+j]<a){
                data[i+j] = f1(data[i+j]);
            }else if(data[i+j]<b){
                data[i+j] = f2(data[i+j]);
            }else{
                data[i+j] = f3(data[i+j]);
            }
        }
    }
    this.imgData.data = data;
}

PhotoProcessor.prototype.setImg = function(){
    this.cxt.putImageData(this.imgData,0,0);
    var imgURL = this.canvas.toDataURL("image/jpeg");
    $(this.img).attr("src",imgURL);
};

PhotoProcessor.prototype.origin = function(){
    $(this.img).attr("src",$(this.originImg).attr("src"));
}
