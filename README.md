## yi.js

学习《数字图像处理》课程时为了验证图像处理算法完成的一个基于 canvas 的数字图像处理库。

[查看 demo](https://wy-ei.github.io/YI/)

## 使用方法

1. 引入 YI

YI 采用了 UMD 的写法，因此你可以使用 AMD，CMD 或者直接用 JavaScript 标签包含的方式加载。

2. 处理图像

```javascript
// 得到一幅图片
var img = document.getElementByTagName('img')[0];

// 得到一个 YI 的实例，参数为一个 image 元素
var yi = new YI(img);

// 转换为灰度图像，再进行二值化处理，再替换原图像
yi.gray().then(function(){
    return yi.threshold('binary',100);
}).then(function(yi){
    yi.replace(img);
});
```

## 说明

YI 中除了 replace 方法外，其余方法均返回 Promise 对象。因为使用了 Web Worker 来处理图像，所以处理过程是异步的，不会阻塞 UI 。

## 示例

```javascript
var img = document.getElementById('target-image');
var yi = new YI(img);

// 进行高斯滤波
yi.filter('gaussian').then(function(yi){
    yi.replace(img);
});

// 恢复原图
yi.origin().then(function(yi){
    yi.replace(img);
});
```

## API

注：下列方法都返回对象本身，可以进行链式调用。

+ replace：用处理后的图片替换掉另一幅图片

+ origin：恢复为原始图像

+ gray：将图像转换为灰度图

+ invert：将图像进行反色

+ pseudoColor：伪彩色

+ threshold：图像分割处理。这个函数可以有多个参数：

```javascript
// 使用自定义阈值进行图像分割 ( 第二个参数为分割的阈值 )
yi.threshold('binary', 100);

// 使用 Otsu 算法进行图像分割
yi.threshold('otsu');

// 使用最大类间类内方差比法进行图像分割
yi.threshold('mr');

// 使用归零算法进行图像分割
yi.threshold('tozero');
```

+ filter：图像滤波处理。该函数有多个可选参数：

```javascript
// 均值滤波
yi.filter('mean');

// 中值滤波
yi.filter('mid');

// 高斯滤波
yi.filter('gaussian');

// K近邻(KNN)平滑滤波
yi.filter('knn');
```

+ sepia：复古效果

+ oilPainting：油画效果

+ posterize：色调分离

+ gamma：gamma 调节

+ flip：对图像进行翻转操作，该方法有多个可选参数：

```javascript
// 上下翻转 (Y轴镜像)
yi.flip('y');

// 左右翻转 (X轴镜像)
yi.flip('x');

// 上下、左右翻转
yi.flip('xy');
```
+ noise：添加噪声 (目前只能添加椒盐噪声，使用方法如下)

```javascript
// 添加椒盐噪声，数量为1000个，大小为边长为 2 像素的点
yi.noise('salt', 1000, 2);
```

## License

MIT
