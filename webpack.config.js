module.exports = {
    entry: {
        yi : './src/index.js'
    },
    output: {
        path: 'dist/',
        filename: '[name].js',
        libraryTarget: 'umd',
        umdNamedDefine: true
    }
};
