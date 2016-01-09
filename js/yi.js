/*
 * yi.js   
 * description:image process library
 * author:wy
 * e-mail:nameiswangyu@163.com
 * License:MIT
 */

(function(window) {
  var YI = function(img) {
    var src = img.getAttribute('src');
    this.source = new Image();
    this.source.src = src;
    this.img = img;

    this.canvas = document.createElement('canvas');
    this.width = this.source.width;
    this.height = this.source.height;
    var canvas = this.canvas;
    canvas.setAttribute('width', this.width);
    canvas.setAttribute('height', this.height);
    this.cxt = canvas.getContext('2d');
    this.cxt.drawImage(this.img, 0, 0);
  };

  YI.sum = function(arr) {
    return arr.reduce(function(pre, val) {
      return pre + val;
    });
  };

  YI.mid = function(arr) {
    var arr = arr.concat();
    arr.sort(function(a, b) {
      return a - b;
    });
    var index = Math.floor(arr.length / 2);
    return arr[index];
  };

  YI.fn = YI.prototype;

  YI.fn.getData = function() {
    return this.cxt.getImageData(0, 0, this.width, this.height);
  };
  YI.fn.setData = function(imageData) {
    this.cxt.putImageData(imageData, 0, 0);
  };
  YI.fn.origin = function() {
    this.cxt.clearRect(0, 0, this.width, this.height);
    this.cxt.drawImage(this.source, 0, 0);
    return this;
  };
  YI.fn.replace = function(img) {
    var dataURL = this.canvas.toDataURL("image/jpeg");
    img.setAttribute('src', dataURL);
    return this;
  };

  YI.fn.getBlankData = function() {
    var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      imageData = context.createImageData(this.width, this.height),
      data = imageData.data;
    return data;
  };

  YI.fn.histogram = function() {
    var imageData = this.getData(),
      data = imageData.data,
      histogram = new Array(256);
    for (var i = 0; i < 256; i++) {
      histogram[i] = 0;
    }
    // get distribution probability
    for (var i = 0, len = data.length; i < len; i += 4) {
      histogram[data[i]] += 1;
    }
    var size = data.length / 4;
    for (var i = 0; i < 256; i++) {
      histogram[i] /= size;
    }
    return histogram;
  };

  YI.fn.gray = function(type) {
    var imageData = this.getData(),
      data = imageData.data;
    var average;
    for (var i = 0, len = data.length; i < len; i += 4) {
      average = Math.floor(data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = average;
      data[i + 1] = average;
      data[i + 2] = average;
    }
    this.setData(imageData);
    return this;
  };

  YI.fn.oilPainting = function() {
    var imageData = this.getData(),
      data = imageData.data;

    var red, blue, green, average;

    for (var i = 0, len = data.length; i < len; i += 4) {
      average = Math.floor(data[i] + data[i + 1] + data[i + 2]) / 3;
      average = parseInt(average / 16) * 16;
      data[i] = average;
      data[i + 1] = average;
      data[i + 2] = average;
    }
    this.setData(imageData);
    return this;
  }

  YI.fn.posterize = function() {
    var imageData = this.getData(),
      data = imageData.data;
    var level = Math.floor(255 / 20);
    for (var i = 0, len = data.length; i < len; i += 4) {
      data[i] = Math.floor(data[i] / level) * level;
      data[i + 1] = Math.floor(data[i + 1] / level) * level;
      data[i + 2] = Math.floor(data[i + 2] / level) * level;
    }
    this.setData(imageData);
    return this;
  };



  YI.fn.gamma = function(g) {
    var imageData = this.getData(),
      data = imageData.data,
      width = imageData.width,
      height = imageData.height;
    g = g || 10;
    var normalizedArg = ((g + 100) / 200) * 2;
    for (var i = 0, len = data.length; i < len; i += 4) {
      data[i] = Math.pow(data[i], normalizedArg);
      data[i + 1] = Math.pow(data[i + 1], normalizedArg);
      data[i + 2] = Math.pow(data[i + 2], normalizedArg);
    }
    this.setData(imageData);
    return this;
  }

  YI.fn.pseudoColor = function() {
    var imageData = this.getData(),
      data = imageData.data;

    for (var i = 0, len = data.length; i < len; i += 4) {

      var red = data[i];
      if (red < 128) {
        red = 0;
      } else if (red < 192) {
        red = (255 / 64) * (red - 128);
      } else {
        red = 255;
      }

      var green = data[i + 1];
      if (green < 64) {
        green = (255 / 64) * green;
      } else if (green < 192) {
        green = 255;
      } else {
        green = 255 - (255 / 64) * (green - 192);
      }

      var blue = data[i + 2];
      if (blue < 64) {
        blue = 255;
      } else if (blue < 128) {
        blue = 255 - (255 / 64) * (blue - 64);
      } else {
        blue = 0;
      }
      data[i] = red;
      data[i + 1] = green;
      data[i + 2] = blue;
    }
    this.setData(imageData);
    return this;

  };
  YI.fn.invert = function() {
    var imageData = this.getData(),
      data = imageData.data;
    for (var i = 0, len = data.length; i < len; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    this.setData(imageData);
    return this;
  };

  /*
   * type:
   * "binary" --> value = value > th ? max_value : 0
   * "tozero"  -->  value = value > th ? value : 0
   * "otsu" --> use Otsu algorithm to choose the optimal th value
   */
  YI.fn.threshold = function(type, th) {
    var imageData = this.getData(),
      data = imageData.data;

    function _threshold(type, th) {
      if (typeof type == "number") {
        type = "binary";
      }
      if (type == "binary") {
        for (var i = 0, len = data.length; i < len; i += 4) {
          if (data[i] > th) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
          }
        }
      } else if (type == "tozero") {
        for (var i = 0, len = data.length; i < len; i += 4) {
          if (data[i] < th) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
          }
        }
      } else if (type == "otsu") {
        var histogram = new Array(256);
        for (var i = 0; i < 256; i++) {
          histogram[i] = 0;
        }
        for (var i = 0, len = data.length; i < len; i += 4) {
          histogram[data[i]] += 1;
        }
        var size = data.length / 4;
        for (var i = 0; i < 256; i++) {
          histogram[i] /= size;
        }

        //average pixel value   
        var avgValue = 0;
        for (var i = 0; i < 255; i++) {
          avgValue += histogram[i] * i;
        }
        var maxVariance = 0,
          w = 0,
          u = 0;
        for (var i = 0; i < 256; i++) {
          w += histogram[i];
          u += i * histogram[i];

          var t = avgValue * w - u;
          var variance = t * t / (w * (1 - w));
          if (variance > maxVariance) {
            maxVariance = variance;
            th = i;
          }
        }
        _threshold("binary", th);
      } else if (type == "mr") {
        var histogram = new Array(256);
        for (var i = 0; i < 256; i++) {
          histogram[i] = 0;
        }

        // get distribution probability
        for (var i = 0, len = data.length; i < len; i += 4) {
          histogram[data[i]] += 1;
        }
        var size = data.length / 4;
        for (var i = 0; i < 256; i++) {
          histogram[i] /= size;
        }
        var max = -Infinity,
          variance1 = 0,
          variance2 = 0,
          average1 = 0,
          average2 = 0,
          average = 0,
          p = 0;
        for (var i = 0; i < 256; i++) {
          average += histogram[i] * i;
        }
        for (i = 0; i < 256; i++) {
          variance1 = 0,
            variance2 = 0,
            average1 = 0,
            average2 = 0,
            average = 0;

          p += histogram[i];

          for (var j = 0; j < 256; j++) {
            if (j <= i) {
              average1 += (histogram[j] / p) * j;
            } else {
              average2 += (histogram[j] / (1 - p)) * j;
            }
          }
          for (var j = 0; j < 256; j++) {
            if (j <= i) {
              variance1 += Math.pow(j - average1, 2) * size * histogram[j];
            } else {
              variance2 += Math.pow(j - average2, 2) * size * histogram[j];
            }
          }

          var a1 = p * Math.pow(average1 - average, 2) + (1 - p) * Math.pow(average2 - average, 2);
          var a2 = p * variance1 + (1 - p) * variance2;
          if (a1 / a2 > max) {
            max = a1 / a2;
            th = i;
            console.log(th, a1, a2);
          }
        }
        _threshold("binary", th);
      } else {
        _threshold("otsu");
      }
    }
    _threshold(type, th);
    this.setData(imageData);
    return this;
  };

  // helper
  YI.fn._value = function(data, x, y, value) {
    var width = this.width,
      index = (y * width + x) * 4;
    //getter
    if (value == null) {
      var ret = [];
      ret.push(data[index]);
      ret.push(data[index + 1]);
      ret.push(data[index + 2]);
      return ret;
    }
    // setter
    else {
      if (Array.isArray(value)) {
        data[index] = value[0];
        data[index + 1] = value[1];
        data[index + 2] = value[2];
      } else {
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
      }
    }
  };
  YI.fn.getMatrix = function(data, row, col, rowCount, colCount, channel) {
    var rowOffset = Math.floor(rowCount / 2),
      colOffset = Math.floor(colCount / 2);
    var ret = [],
      red = [],
      grren = [],
      blue = [];
    if (channel == 'r') {
      for (var x = -rowOffset; x <= rowOffset; x++) {
        var _red = [];
        for (var y = -colOffset; y <= colOffset; y++) {
          var arr = this._value(data, row + x, col + y);
          _red.push(arr[0]);
        }
        red.push(_red);
      }
      return red;
    } else if (channel == 'g') {
      for (var x = -rowOffset; x <= rowOffset; x++) {
        var _green = [];
        for (var y = -colOffset; y <= colOffset; y++) {
          var arr = this._value(data, row + x, col + y);
          _green.push(arr[1]);
        }
        green.push(_green);
      }
    } else if (channel == 'b') {
      for (var x = -rowOffset; x <= rowOffset; x++) {
        var _blue = [];
        for (var y = -colOffset; y <= colOffset; y++) {
          var arr = this._value(data, row + x, col + y);
          _blue.push(arr[1]);
        }
        blue.push(_blue);
      }
      return blue;
    } else {
      for (var x = -rowOffset; x <= rowOffset; x++) {
        var _red = [],
          _green = [],
          _blue = [];
        for (var y = -colOffset; y <= colOffset; y++) {
          var arr = this._value(data, row + x, col + y);
          _red.push(arr[0]);
          _green.push(arr[1]);
          _blue.push(arr[2]);
        }
        red.push(_red);
        green.push(_green);
        blue.push(_blue);
      }
      ret.push(red);
      ret.push(green);
      ret.push(blue);
      return ret;
    }
  };

  YI.fn.applyMultiMatrix = function(data, matrixs, predicate) {
    var retData = this.getBlankData();
    var row = matrixs[0].length,
      col = matrixs[0][0].length;
    var w = this.width,
      h = this.height;
    var rowOffset = Math.floor(row / 2),
      colOffset = Math.floor(col / 2);
    _rowOffset = rowOffset,
      _colOffset = colOffset;
    if (rowOffset % 2 == 0) {
      _rowOffset = rowOffset - 1;
    }
    if (colOffset % 2 == 0) {
      _colOffset = colOffset - 1;
    }
    var val;
    var ret = [];
    for (var i = rowOffset, rowLen = h - rowOffset; i < rowLen; i++) {
      for (var j = colOffset, colLen = w - colOffset; j < colLen; j++) {
        var mVal = [];
        for (var n = 0; n < matrixs.length; n++) {
          val = [
            [],
            [],
            []
          ];

          for (var x = -rowOffset; x <= _rowOffset; x++) {
            for (var y = -colOffset; y <= _colOffset; y++) {
              var arr = this._value(data, i + x, j + y);
              var m = matrixs[n][x + rowOffset][y + colOffset];
              val[0].push(arr[0] * m);
              val[1].push(arr[1] * m);
              val[2].push(arr[2] * m);
            }
          }
          mVal.push(val);
        }
        var arr = predicate(mVal);
        this._value(retData, i, j, arr);
      }
    }
    return retData;
  }


  YI.fn.applyMatrix = function(data, matrix, k, predicate) {
    var retData = this.getBlankData();
    if (typeof k == 'function') {
      predicate = k;
    } else {
      k = k || 1;
    }

    var row = matrix.length,
      col = matrix[0].length;
    var w = this.width,
      h = this.height;
    var rowOffset = Math.floor(row / 2),
      colOffset = Math.floor(col / 2),
      _rowOffset = rowOffset,
      _colOffset = colOffset;
    if (rowOffset % 2 == 0) {
      _rowOffset = rowOffset - 1;
    }
    if (colOffset % 2 == 0) {
      _colOffset = colOffset - 1;
    }
    var val;
    for (var i = rowOffset, rowLen = h - rowOffset; i < rowLen; i++) {
      for (var j = colOffset, colLen = w - colOffset; j < colLen; j++) {
        val = [
          [],
          [],
          []
        ];
        for (var x = -rowOffset; x <= _rowOffset; x++) {
          for (var y = -colOffset; y <= _colOffset; y++) {
            var arr = this._value(data, i + x, j + y);
            var n = matrix[x + rowOffset][y + colOffset];
            val[0].push(arr[0] * n);
            val[1].push(arr[1] * n);
            val[2].push(arr[2] * n);
          }
        }
        var arr;
        if (predicate) {
          arr = predicate(val);
        } else {
          arr = [0, 0, 0];
          arr[0] = k * YI.sum(val[0]);
          arr[1] = k * YI.sum(val[1]);
          arr[2] = k * YI.sum(val[2]);
        }
        this._value(retData, i, j, arr);
      }
    }
    return retData;
  }

  function getKnnAverage(arr, n) {
    var mid = arr[Math.floor(arr.length / 2)];
    min = Infinity,
      index = 0,
      knnArr = [];

    for (var i = 0; i < n; i++) {
      for (var j = 0, len = arr.length; j < len; j++) {
        var diff = Math.abs(arr[i] - min);
        if (diff < min) {
          min = diff;
          index = j;
        }
      }
      knnArr.push(arr[index]);
      arr.splice(index, 1);
      min = Infinity;
    }
    return YI.sum(knnArr) / knnArr.length;
  }

  function copyData(src, dst) {
    for (var i = 0, len = dst.length; i < len; i += 4) {
      dst[i] = src[i];
      dst[i + 1] = src[i + 1];
      dst[i + 2] = src[i + 2];
    }
  }


  YI.fn.filter = function(type, n) {
    var imageData = this.getData(),
      data = imageData.data,
      newData;
    if (type == 'mean') {
      newData = this.applyMatrix(data, [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ], 1 / 9);

    } else if (type == 'mid') {
      newData = this.applyMatrix(data, [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ], function(arr) {
        var ret = [0, 0, 0];
        ret[0] = YI.mid(arr[0]);
        ret[1] = YI.mid(arr[1]);
        ret[2] = YI.mid(arr[2]);
        return ret;
      });

    } else if (type == 'gaussian') {
      newData = this.applyMatrix(data, [
        [2, 4, 5, 4, 2],
        [4, 9, 12, 9, 4],
        [5, 12, 15, 12, 5],
        [4, 9, 12, 9, 4],
        [2, 4, 5, 4, 2]
      ], 1 / 139);

    } else if (type == 'knn') {
      newData = this.applyMatrix(data, [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ], function(arr) {
        var ret = [0, 0, 0];
        ret[0] = getKnnAverage(arr[0], 5);
        ret[1] = getKnnAverage(arr[1], 5);
        ret[2] = getKnnAverage(arr[2], 5);
        return ret;
      });

    }
    copyData(newData, data);
    this.setData(imageData);
    return this;
  };

  YI.fn.differentialOperator = function(type) {
    var imageData = this.getData(),
      data = imageData.data,
      newData;
    if (type == 'horizontal') {
      newData = this.applyMatrix(data, [
        [1, 2, 1],
        [0, 0, 0],
        [-1, -2, -1]
      ]);

    } else if (type == 'vertical') {
      newData = this.applyMatrix(data, [
        [1, 0, -1],
        [2, 0, -2],
        [1, 0, -1]
      ]);

    } else if (type == 'soble') {
      newData = this.applyMultiMatrix(data, [
        [
          [-1, -2, -1],
          [0, 0, 0],
          [1, 2, 1]
        ],
        [
          [-1, 0, 1],
          [-2, 0, 2],
          [-1, 0, 1]
        ]
      ], function(arr) {
        var m1 = arr[0],
          m2 = arr[1];
        var ret = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
          ret[i] = Math.sqrt(Math.pow(YI.sum(m1[i]), 2) +
            Math.pow(YI.sum(m2[i]), 2));
        }
        return ret;
      });

    } else if (type == 'laplace') {
      newData = this.applyMatrix(data, [
        [0, -1, 0],
        [-1, 4, -1],
        [0, -1, 0]
      ]);

    } else if (type == 'canny') {
      newData = this.applyMultiMatrix(data, [
        [
          [-1, 0, 1],
          [-2, 0, 2],
          [-1, 0, 1]
        ],
        [
          [-1, -2, -1],
          [0, 0, 0],
          [1, 2, 1]
        ]
      ], function(arr) {
        var m1 = arr[0],
          m2 = arr[1];
        var ret = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
          ret[i] = Math.sqrt(Math.pow(YI.sum(m1[i]), 2) +
            Math.pow(YI.sum(m2[i]), 2));
        }
        return ret;
      });

    } else if (type == 'roberts') {
      newData = this.applyMultiMatrix(data, [
        [
          [-1, 0, 0],
          [0, 1, 0],
          [0, 0, 0]
        ],
        [
          [0, -1, 0],
          [1, 0, 0],
          [0, 0, 0]
        ]
      ], function(arr) {
        var ret = [0, 0, 0],
          m1 = arr[0],
          m2 = arr[1];
        for (var i = 0; i < 3; i++) {
          ret[i] = Math.abs(YI.sum(m1[i])) + Math.abs(YI.sum(m2[i]));
        }
        return ret;
      });
    } else if (type == 'wallis') {
      newData = this.applyMatrix(data, [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ], function(arr) {
        var ret = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
          ret[i] = 46 * arr[i].reduce(function(pre, current, index) {
            if (current != 0) {
              if (index == 4) {
                current = 4 * Math.log(current + 1);
              } else {
                current = -Math.log(Math.abs(current) + 1);
              }
            }
            return pre + current;
          }, 0);
        }
        return ret;
      });
    } else if (type == 'priwitt') {
      newData = this.applyMultiMatrix(data, [
        [
          [-1, 0, 1],
          [-1, 0, 1],
          [-1, 0, 1]
        ],
        [
          [-1, -1, -1],
          [0, 0, 0],
          [1, 1, 1]
        ]
      ], function(arr) {
        var m1 = arr[0],
          m2 = arr[1];
        var ret = [0, 0, 0];
        for (var i = 0; i < 3; i++) {
          ret[i] = Math.sqrt(Math.pow(YI.sum(m1[i]), 2) +
            Math.pow(YI.sum(m2[i]), 2));
        }
        return ret;
      });
    }
    copyData(newData, data);
    this.setData(imageData);
    return this;
  };
  YI.fn.noise = function(type, n, r) {
    var imageData = this.getData(),
      data = imageData.data,
      width = this.width,
      height = this.height;
    if (type == 'salt') {
      n = n || 100;
      r = r || 1;
      var offset = Math.floor(r / 2);
      for (var i = 0; i < n; i++) {
        var x = offset + Math.floor(Math.random() * (height - offset));
        var y = offset + Math.floor(Math.random() * (width - offset));
        var salt = Math.random() > 0.5 ? 255 : 0;
        if (r != 1) {

          var k;
          if (r % 2 == 0) {
            k = offset - 1;
          } else {
            k = offset;
          }
          for (var xo = -offset; xo <= k; xo++) {
            for (var yo = -offset; yo <= k; yo++) {
              this._value(data, x + xo, y + yo, salt);
            }
          }
        } else {
          this._value(data, x, y, salt);
        }
      }
    }
    this.setData(imageData);
    return this;
  };
  YI.fn.sepia = function() {
    var imageData = this.getData(),
      data = imageData.data;
    for (var i = 0, len = data.length; i < len; i += 4) {
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189); // red
      data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168); // green
      data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131); // blue
    }
    this.setData(imageData);
    return this;
  };

  // 浮雕
  YI.fn.embossment = function() {
    var imageData = this.getData(),
      data = imageData.data,
      newData;
    newData = this.applyMatrix(data, [
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, -1]
    ], function(arr) {
      var ret = [0, 0, 0];
      for (var i = 0; i < 3; i++) {
        ret[i] = YI.sum(arr[i]) + 127.5;
      }
      return ret;
    });
    copyData(newData, data);
    this.setData(imageData);
    return this;
  }

  YI.fn.flip = function(dir) {
    var imageData = this.getData(),
      data = imageData.data,
      width = imageData.width,
      height = imageData.height;

    var x = false,
      y = false;
    dir = dir.toLowerCase();
    if (dir.indexOf('x') != -1) {
      x = true;
    }
    if (dir.indexOf('y') != -1) {
      y = true;
    }

    if (x && y) {
      for (var x = 0, xlen = width / 2; x < xlen; x++) {
        for (var y = 0, ylen = height / 2; y < ylen; y++) {
          var topLeft = this._value(data, x, y);
          var bottomRight = this._value(data, width - x - 1, height - y - 1);
          this._value(data, width - x - 1, height - y - 1, topLeft);
          this._value(data, x, y, bottomRight);
        }
      }
      for (var x = width - 1, xlen = width / 2; x >= xlen; x--) {
        for (var y = 0, ylen = height / 2; y < ylen; y++) {
          var topRight = this._value(data, x, y);
          var bottomLeft = this._value(data, width - x - 1, height - y - 1);
          this._value(data, width - x - 1, height - y - 1, topRight);
          this._value(data, x, y, bottomLeft);
        }
      }
    } else if (x) {
      for (var x = 0, xlen = width / 2; x < xlen; x++) {
        for (var y = 0; y < height; y++) {
          var left = this._value(data, x, y);
          var right = this._value(data, width - x - 1, y);
          this._value(data, x, y, right);
          this._value(data, width - x - 1, y, left);
        }
      }

    } else if (y) {
      for (var y = 0, ylen = height / 2; y < ylen; y++) {
        for (var x = 0; x < width; x++) {
          var up = this._value(data, x, y);
          var down = this._value(data, x, height - y - 1);
          this._value(data, x, y, down);
          this._value(data, x, height - y - 1, up);
        }
      }
    }

    this.setData(imageData);
    return this;
  };



  window.YI = YI;
  // AMD
  if (typeof define == 'function' && define.amd) {
    define('YI', [], function() {
      return YI;
    });
  }

})(window);
