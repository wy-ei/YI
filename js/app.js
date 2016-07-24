requirejs.config({
    baseUrl:'./js',
    paths: {
        jquery: 'jquery-2.1.4.min',
        bootstrap: '../assets/bootstrap/js/bootstrap.min'
    },
    shim: {
        'bootstrap': ['jquery']
    }
});

require(['./yi', 'jquery', 'bootstrap'], function(YI, $) {
    $(document).ready(function() {
        var yi,
            img;
        $('#load-img').on('change', function() {
            if (!this.files) {
                return;
            }
            var fileReader = new FileReader();
            fileReader.readAsDataURL(this.files[0]);
            fileReader.onload = function() {
                var $img = $('#source-img');
                $img.attr('src', fileReader.result);
                $img.on('load', function() {
                    img = $img.get(0);
                    yi = new YI(img);
                    $img.off('load');
                    var progressBar = $('.progress-bar');
                    yi.on('progress', function(progress) {
                        progressBar.css('width', progress * 100 + '%');
                    });
                });
                $('.hide-when-no-img').show();
            };
        });

        $('#download').on('click', function(){
            var link = document.createElement('a'),
                event = document.createEvent('Event');
            event.initEvent('click', true, true);
            link.href = img.src;
            link.download = 'yi';
            link.dispatchEvent(event);
        });

        $('#select-process-method').on('click', 'li,button', function(event) {
            var method = $(event.target).data('method');
            process(method);
        });

        function process(method) {
            switch (method) {
            case 'origin':
                yi.origin().then(function(yi) {
                    yi.replace(img);
                });
                break;
            case 'gray':
                yi.gray().then(function(yi) {
                    yi.replace(img);
                });
                break;
            case 'invert':
                yi.invert().then(function(yi) {
                    yi.replace(img);
                });
                break;
            case 'pseudoColor':
                yi.pseudoColor().then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'mr':
                yi.threshold('mr').then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'otsu':
                yi.threshold('otsu').then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'binary':
                var th = prompt('请输入分割阈值', 100);
                yi.threshold('binary', th).then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'tozero':
                var th = prompt('请输入分割阈值', 100) || 100;
                yi.threshold('tozero', th).then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'mean':
                yi.filter('mean').then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'mid':
                yi.filter('mid').then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'gaussianBlur':
                yi.filter('gaussian').then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'knn':
                yi.filter('knn').then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'oilPainting':
                yi.oilPainting().then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'posterize':
                yi.posterize().then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'gamma':
                yi.gamma().then(function(yi) {
                    yi.replace(img);
                });
                break;
            case 'salt':
                var noiseCount = prompt('请输入噪声的数量', 500);
                noiseCount = parseInt(noiseCount, 10) || 500;
                var noiseRadius = prompt('请输入噪声的大小(px)', 1);
                noiseRadius = parseInt(noiseRadius, 10) || 1;
                yi.noise('salt', noiseCount, noiseRadius).then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'flip-xy':
                yi.flip('xy').then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'flip-x':
                yi.flip('x').then(function(yi){
                    yi.replace(img);
                });
                break;
            case 'flip-y':
                yi.flip('y').then(function(yi){
                    yi.replace(img);
                });
                break;
            default:
                break;
            }
        }
    });
});
