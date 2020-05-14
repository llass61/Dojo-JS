define(["dojo/_base/declare",
        "services/DataRequest"
],
   function (declare, DataRequest) {

      return dojo.declare(null, {

         constructor: function (server, mapInstance) {
            this.baseUrl = window.protocol + "//" + server + "/arcgis/rest/services/";
            this.mapInstance = mapInstance;
            this.mapLayerUrlBase = this.baseUrl + mapInstance + "/MapServer?f=json";
            this.featureLayerUrlBase = this.baseUrl + mapInstance + "/FeatureServer/";
            this.layerIndex = Object();
            this.layerInfo = null;
            this.mapServiceInfo = null;

            omsPushBtn.on("click", omsDataPushHdl);
            clearBtn.on("click", omsDataPushHdl);
         },

         getMapLayerUrl: function(layerName) {
            return this.mapLayerUrlBase +
               (layerName ? this.layInds[layerName] : '');
         },

         getFeatureLayerUrl: function(layerName) {
            return this.featureLayerUrlBase +
               (layerName ? gs.layInds[layerName] : '');
         },

         getGpUrl: function(geoSvc, tool) {
            return this.baseUrl + geoSvc + "/GPServer/" + tool;
         },

         getGpUploadUrl: function(geoSvc) {
            return this.baseUrl + geoSvc + "/GPServer/uploads/upload";
         },

         loadServices: function() {

            return DataRequest.esriRequest(this.mapLayerUrlBase).then(data => {
               console.log('Layer info received...');
               console.log(data);
               this.loadAssets(data);
               console.log('done with AssetLayers load');
               return this.layerIndex;
            }, err => {
               console.error(err);
            }, evt => {
               console.log(evt);
            });
         },

         loadAssets: function(data) {

            // set indexs for all feature layers
            data.layers.forEach(function (layer) {
                  this.layerIndex[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
            }, this);

            // set indexs for all tables
            data.tables.forEach(function (layer) {
               this.layerIndex[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
         }, this);
         },

      });
   });
