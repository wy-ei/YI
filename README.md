## yi.js

一个基于 HTML5 Canvas 的图像处理库

## 使用方法

1. 引入 yi.js

```html
<script type="text/javascript" src='yi.js'></script>>
```

2. 处理图像 

```javascript
// 得到一幅图片
var img = document.getElementByTagName('img')[0];

// 得到一个 YI 的实例，参数为一个 image 元素
var yi = new YI(img);

// 转换为灰度图像，再进行二值化处理，再替换原图像
yi.gray().threshold().replace(img);
```

## 示例

```
var img = document.getElementById('target-image');
var yi = new YI(img);

// 进行高斯滤波
yi.filter('gaussian').replace(img);

// 使用 Sobel 微分算子
yi.differentialOperator('soble').replace(img);

// 恢复原图
yi.origin().replace(img);
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
yi.threshold('binary',100).replace(img);

// 使用 Otsu 算法进行图像分割
yi.threshold('otsu').replace(img);

// 使用最大类间类内方差比法进行图像分割
yi.threshold('mr').replace(img);
```

+ filter：图像滤波处理。该函数有多个可选参数：

```javascript
// 均值滤波
yi.filter('mean').replace(img);

// 中值滤波
yi.filter('mid').replace(img);

// 高斯滤波
yi.filter('gaussian').replace(img);

// K近邻(KNN)平滑滤波
yi.filter('knn').replace(img);
```

+ differentialOperator：对图像运用微分算子。该函数有多个可选的微分算子。

```javascript
// 水平微分算子
yi.differentialOperator('horizontal').replace(img);

// 垂直微分算子
yi.differentialOperator('vertical').replace(img);

// soble 算子
yi.differentialOperator('soble').replace(img);

// laplace 算子
yi.differentialOperator('laplace').replace(img);

// priwitt 算子
yi.differentialOperator('priwitt').replace(img);

// roberts 算子
yi.differentialOperator('roberts').replace(img);

// wallis 算子
yi.differentialOperator('wallis').replace(img);

// canny 算子
yi.differentialOperator('canny').replace(img);
```

+ sepia：复古效果

+ oilPainting：油画效果

+ posterize：色调分离

+ embossment：浮雕效果

+ gamma：gamma 调节

+ flip：对图像进行翻转操作，该方法有多个可选参数：

```javascript
// 上下翻转 (Y轴镜像)
yi.flip('y').replace(img);

// 左右翻转 (X轴镜像)
yi.flip('x').replace(img);

// 上下、左右翻转
yi.flip('xy').replace(img);
```
+ noise：添加噪声 (目前只能添加椒盐噪声，使用方法如下)

```javascripe
// 添加椒盐噪声，数量为1000个，大小为边长为 2 像素的点
yi.noise('salt',1000,2).replace(img);
```

### 一个特殊的方法

+ histogram:得到图像的灰度分布。返回值为一个256个元素的数组，数值中的值为对应的灰度级的概率。


## License

MIT