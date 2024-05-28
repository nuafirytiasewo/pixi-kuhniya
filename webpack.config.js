const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './src/js/index.js'),
  output: { 
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  devServer: {
    static: {
      directory: path.join(__dirname), // Указываем корневую директорию проекта
    },
    //compress: true,
    port: 9000,
    open: true,
  },
}
