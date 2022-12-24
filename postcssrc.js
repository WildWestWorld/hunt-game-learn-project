module.exports = {
    plugins: {
        autoprefixer: {},
        'postcss-px2rem-exclude': {
            remUnit: 75,//1rem = 75px(iphone6的设计稿如此设置)
            exclude: /node_modules/i //忽略node_modules目录下的文件
        }
    }
}
