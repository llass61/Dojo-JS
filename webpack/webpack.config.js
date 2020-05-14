var path = require('path');
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');

module.exports = {
   context: __dirname,
   entry: './adda/js/adda.readytmp.js',
   //   externals: {
   //      esri: '/esri',
   //      dijit: '/dijit',
   //      dojo: '/dojo',
   //    },
   output: {
      path: path.resolve('dist/'),
      filename: "bundle.js"
   },
   watch: true,

   plugins: [
      new BundleTracker({ filename: './webpack-stats.json' })
   ],

   build: {
      assetsRoot: path.resolve(__dirname, '../dist/'),
      assetsSubDirectory: '',
      assetsPublicPath: '/static/',
   },
   dev: {
      assetsPublicPath: 'http://localhost:8080/',

   }
}

console.log(module.exports['context'])
