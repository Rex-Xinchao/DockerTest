const webpack = require('webpack')
const path = require('path');
const SOURCE_MAP = !(process.argv.indexOf('release') !== -1)
const CROSSORIGIN = process.argv.indexOf('release') !== -1 ? 'anonymous' : undefined
module.exports = {
    outputDir: '../web/dist',
    crossorigin: CROSSORIGIN,
    integrity: true,
    productionSourceMap: SOURCE_MAP,
    configureWebpack: {
        resolve: {
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@': path.resolve(__dirname, './src'),
                '@components': path.resolve(__dirname, './src/components'),
                '@assets': path.resolve(__dirname, './src/assets'),
                '@views': path.resolve(__dirname, './src/views'),
                '@images': path.resolve(__dirname, './src/assets/imgs'),
                '@styles': path.resolve(__dirname, './src/assets/styles'),
            }
        },
        plugins: [
            new webpack.ProvidePlugin({
                jQuery: 'jquery',
                $: 'jquery'
            })
        ]
    },
    chainWebpack: config => {
        config.output.filename('[name].[hash].js').end();
    },
    css: {
        extract: false, // 强制把css并入js
        loaderOptions: {
            // 配置全局sass变量
            sass: {
                prependData: `@import "@/assets/styles/common.scss";`
            }
        }
    },
    devServer: {
        proxy: {
            '/init': {
                // target: 'http://52.81.17.77:10090/sam_mgt/init/',// product
                // target: 'http://192.168.250.213:10090/sam_mgt/init/',// qa
                // target: 'http://192.168.100.42:10090/sam_mgt/init/',// dev
                target: 'http://192.168.1.52:10090/sam_mgt/init/',// eden
                changeOrigin: true,
                pathRewrite: {
                    '^/init': ''
                }
            },
            '/api': {
                // target: 'http://52.81.17.77:10090/sam_mgt/client/',// product
                // target: 'http://192.168.250.213:10090/sam_mgt/client/',// qa
                // target: 'http://192.168.100.42:10090/sam_mgt/client/',// dev
                target: 'http://192.168.1.52:10090/sam_mgt/client/',// eden
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            },
            '/platform': {
                // target: 'http://52.81.17.77:10090/sam_mgt/platform/',// product
                // target: 'http://192.168.250.213:10090/sam_mgt/platform/',// qa
                // target: 'http://192.168.100.42:10090/sam_mgt/platform/',// dev
                target: 'http://192.168.1.52:10090/sam_mgt/platform/',// eden
                changeOrigin: true,
                pathRewrite: {
                    '^/platform': ''
                }
            }, 
            '/csf-permission/oauth': {
                // target: 'http://52.81.61.151:7074/csf-permission/oauth',// product
                target: 'http://192.168.250.111:8011/csf-permission/oauth',// qa
                // target: 'http://192.168.100.44:8011/csf-permission/oauth',// dev
                changeOrigin: true,
                pathRewrite: {
                    '^/csf-permission/oauth': ''
                }
            },
            '/csf-permission': {
                // target: 'http://52.81.61.151:7074/csf-permission',// product
                target: 'http://192.168.250.111:8011/csf-permission',// qa
                // target: 'http://192.168.100.44:8011/csf-permission',// dev
                changeOrigin: true,
                pathRewrite: {
                    '^/csf-permission': ''
                }
            },
        }
    }
}
