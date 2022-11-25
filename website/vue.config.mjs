import webpackConfig from './.webpack.config.mjs';

export default {
  transpileDependencies: true,
  configureWebpack: webpackConfig,
  css: {
    loaderOptions: {
      sass: {
        additionalData: '@import "@cosmo/components/variables.scss";',
      },
    },
  },
  lintOnSave: process.env.NODE_ENV !== 'production',
};
