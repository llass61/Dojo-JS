
define([
   "dijit/registry",
   "dojo/_base/declare",
   "dojo/_base/lang",
   "js/DataRequest"

], function (registry, declare, lang, DataRequest) {

   return declare(null, {

      constructor: function (url) {
         this.layerIndex = {};
         this.url = url;
      },

      getAssets: function () {

         return DataRequest.esriRequest(this.url);
         // return DataRequest.esriRequest(this.url).then( data => {
         //    console.log('Layer info received...');
         //    console.log(data);
         //    data.layers.forEach(function (layer) {
         //       this.layerIndex[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
         //    }, this);
         //    console.log('done with AssetLayers load');
         //    return this.layerIndex;
         // }, err => {
         //    console.error(err);
         //    return err;
         // }, evt => {
         //    console.log(evt);
         //    return evt;
         // });
      },

      loadAssets: function(data) {

         data.tables.forEach(function (layer) {
               this.layerIndex[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
         }, this);
         // for(var i=0; i < data.tables.length; i++) {
         //       var layer = data.tables[i];
         //       var layerNm = layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1');
         //       this.layerIndex[layerNm] = layer.id;
         // }
      },

      getAsset: function(name) {
         return
      }

   });

});
