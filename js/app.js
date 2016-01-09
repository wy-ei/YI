$(document).ready(function() {
  var pp;
  $("#load-img").on("change", function() {
    if (!this.files) {
      return;
    }
    var fileReader = new FileReader();
    fileReader.readAsDataURL(this.files[0]);
    fileReader.onload = function() {
      $img = $("#source-img");
      $img.attr("src", fileReader.result);
      $img.on('load', function() {
        pp = new YI($img.get(0));
        $img.off('load');
        $img.trigger('resize');
      });
      $('#choose-operator').show();
    }
  });
  var img = $("#source-img").get(0);
  $("#select-process-method").on("click", 'li,button', function(event) {
    var method = $(event.target).data('method');
    $('#state').text('正在处理');
    setTimeout(function() {
      process(method);
      $('#state').text('处理完毕');
    }, 100);
  });

  function process(method) {
    switch (method) {
      case 'origin':
        pp.origin().replace(img);
        break;
      case 'gray':
        pp.gray().replace(img);
        break;
      case 'invert':
        pp.invert().replace(img);
        break;
      case 'pseudoColor':
        pp.pseudoColor().replace(img);
        break;
      case 'mr':
        pp.threshold('mr').replace(img);
        break;
      case 'otsu':
        pp.threshold('otsu').replace(img);
        break;
      case 'binary':
        var th = prompt('请输入分割阈值', 100);
        pp.threshold('binary', th).replace(img);
        break;
      case 'mean':
        pp.filter('mean').replace(img);
        break;
      case 'mid':
        pp.filter('mid').replace(img);
        break;
      case 'gaussianBlur':
        pp.filter('gaussian').replace(img);
        break;
      case 'knn':
        pp.filter('knn').replace(img);
        break;
      case 'horizontal':
        pp.differentialOperator('horizontal').replace(img);
        break;
      case 'vertical':
        pp.differentialOperator('vertical').replace(img);
        break;
      case 'soble':
        pp.differentialOperator('soble').replace(img);
        break;
      case 'laplace':
        pp.differentialOperator('laplace').replace(img);
        break;
      case 'priwitt':
        pp.differentialOperator('priwitt').replace(img);
        break;
      case 'roberts':
        pp.differentialOperator('roberts').replace(img);
        break;
      case 'wallis':
        pp.differentialOperator('wallis').replace(img);
        break;
      case 'canny':
        pp.differentialOperator('canny').replace(img);
        break;
      case 'sepia':
        pp.sepia().replace(img);
        break;
      case 'oilPainting':
        pp.oilPainting().replace(img);
        break;
      case 'posterize':
        pp.posterize().replace(img);
        break;
      case 'embossment':
        pp.embossment().replace(img);
        break;
      case 'gamma':
        pp.gamma().replace(img);
        break;
      case 'histogram':
        var histogram = pp.histogram();
        // draw chart
        // Chart.js
        var data = {
          labels: [],
          datasets: [{
            strokeColor: "rgba(0,0,0,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: histogram
          }]
        };
        for (var i = 0; i <= 255; i += 1) {
          if (i % 10 == 0) {
            data.labels.push('' + i);
          } else {
            data.labels.push('');
          }
        }

        var $histogram = $("#histogram");
        ctx = $histogram.get(0).getContext("2d");

        var c = new Chart(ctx).Line(data, {
          bezierCurve: false,
          pointDotRadius: 1,
          scaleShowVerticalLines: false,
          pointHitDetectionRadius: 1,
          datasetFill: false,
          datasetStrokeWidth: 1,
          tooltipTemplate: "<%= value %>"
        });
        $histogram.data('chart', c);
        $('#modalLabel').text('灰度分布直方图');
        break;
      case 'salt':
        var n = prompt('请输入噪声的数量', 500);
        n = parseInt(n, 10) || 500;
        var r = prompt('请输入噪声的大小(px)', 1);
        r = parseInt(r, 10) || 1;
        pp.noise('salt', n, r).replace(img);
        break;
      case 'flip-xy':
        pp.flip('xy').replace(img);
        break;
      case 'flip-x':
        pp.flip('x').replace(img);
        break;
      case 'flip-y':
        pp.flip('y').replace(img);
        break;
      default:
        break;
    }
  }


  $('#source-img').on('resize', function() {
    var $this = $(this),
      width = $this.width(),
      height = $this.height(),
      containerHeight = $(window).height() - $('#header').height();
    if (height > 　0.8 * containerHeight) {
      $this.height(　containerHeight * 0.8);
      $this.css('marginTop', containerHeight * 0.1);
    } else {
      $this.css('marginTop', (containerHeight - height) * 0.5);
    }
  });

  $('#modal').on('hide.bs.modal', function(e) {
    var $histogram = $("#histogram");
    if ($histogram.data('chart')) {
      $histogram.data('chart').destroy();
    }
  });
});
