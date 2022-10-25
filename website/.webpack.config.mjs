import path from 'path';

function resolve(dir) {
  return path.join(path.resolve(), dir);
}


export default {
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@cosmo': resolve('src'),
    },
  },
};
