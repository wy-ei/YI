module.exports = {
    entry: {
        yi : './src/index.js'
    },
    output: {
        path: 'dist/',
        filename: '[name].js',
        library:'YI',
        libraryTarget: 'umd',
        umdNamedDefine: true
    }
};
