$(document).ready(function() {
    var pp;
    $("#load-img").on("change", function() {
    	if(!this.files){
    		return;
    	}
        var fileReader = new FileReader();
        fileReader.readAsDataURL(this.files[0]);
        fileReader.onload = function() {
            $img = $("#source-img");
            $img.attr("src", fileReader.result);

            $img.on('load',function(){
            	pp = new YI($img.get(0));
            	$img.off('load');
            });
        }
    });
    var img = $("#source-img").get(0);
    $("#select-process-method").on("click",'li,button', function(event) {
    	var method = $(event.target).data('method');
    	console.log(method);
    	if(method == 'origin'){
    		pp.origin().replace(img);
    	}else if(method == 'gray'){
    		pp.gray().replace(img);
    	}else if(method == 'flip'){
    		pp.flip().replace(img);
    	}else if(method == 'pseudoColor'){
    		pp.pseudoColor().replace(img);
    	}else if(method =="ml"){
    		pp.threshold("ml").replace(img);
    	}else if(method == "otsu"){
    		pp.threshold("otsu").replace(img);
    	}else if(method == "binary"){
    		var th = prompt('请输入分割阈值', 100);
    		pp.threshold("binary",th).replace(img);
    	}else if(method == "mean"){
    		pp.filter("mean").replace(img);
    	}else if(method == "mid"){
    		pp.filter("mid").replace(img);
    	}else if(method == "gaussianBlur"){
    		pp.filter('gaussian').replace(img);
    	}else if(method == "horizontal"){
    		pp.differentialOperator('horizontal').replace(img);
    	}else if(method == "vertical"){
    		pp.differentialOperator('vertical').replace(img);
    	}else if(method == 'soble'){
    		pp.differentialOperator('soble').replace(img);
    	}else if(method == 'laplace'){
    		pp.differentialOperator('laplace').replace(img);
    	}else if(method == 'canny'){
    		pp.differentialOperator('canny').replace(img);
    	}else if(method == "sepia"){
    		pp.sepia().replace(img);
    	}else if(method == 'oilPainting'){
    		pp.oilPainting().replace(img);
    	}else if(method == 'sharp'){
    		pp.sharp().replace(img);
    	}else if(method == 'posterize'){
    		pp.posterize().replace(img);
    	}else if(method == 'embossment'){
    		pp.embossment().replace(img);
    	}else if(method == 'gamma'){
    		pp.gamma().replace(img);
    	}
    	// 组合效果
    	else if(method == 'sketch'){
    		pp.filter('gaussian').gray().sharp().replace(img);
    	}
    });	
}); 