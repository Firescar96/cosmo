module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-transform-classes',
    '@babel/plugin-proposal-optional-chaining',
  ],
  env: {
    test: { plugins: ['transform-require-context'] },
  },
};
