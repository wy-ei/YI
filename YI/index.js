/*
 * YI - You Image
 * description:image process library
 * author:wy
 * e-mail:nameiswangyu@163.com
 * License:MIT
 */



define(['require', './core'], function(require, YI) {
    require(['./util/index']);
    require(['./method/index']);

    window.YI = YI;

    return YI;
});
