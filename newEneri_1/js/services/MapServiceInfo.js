define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", 
        "esri/tasks/Geoprocessor", "dojo/_base/lang"
    ],
    function (kernel, lang, declare, Geoprocessor,
              lang) {

        return dojo.declare("Services", null, {

            constructor: function (server, mapInstance) {
                this.baseUrl = window.protocol + "//" + server + "/arcgis/rest/services/";
                this.mapInstance = mapInstance;
                this.mapLayerUrlBase = this.baseUrl + mapInstance + "/MapServer/";
                this.featureLayerUrlBase = this.baseUrl + mapInstance + "/FeatureServer/";
                this.layInds = Object();
                this.layerInfo = null;
                this.mapServiceInfo = null;
            },

            getMapLayerUrl: function (layerName) {
                return this.mapLayerUrlBase +
                        (layerName?this.layInds[layerName]:'');
            },

            getFeatureLayerUrl: function (layerName) {
                return this.featureLayerUrlBase +
                        (layerName?gs.layInds[layerName]:'');
            },

            getGpUrl: function (geoSvc, tool) {
                return this.baseUrl + geoSvc + "/GPServer/" + tool;
            },

            getGpUploadUrl: function (geoSvc) {
                return this.baseUrl + geoSvc + "/GPServer/uploads/upload";
            },

            getAssetLayerInfo: function () {
                // let mapUrl = this.getMapLayerUrl();
                let mapUrl = this.mapLayerUrlBase;
                // if(esriConfig.defaults.io.proxyUrl){
                //     mapUrl= esriConfig.defaults.io.proxyUrl + "?" + mapUrl;
                // }
                console.log('Requesting layer info...', mapUrl);
                return esri.request(//url, {handleAs: "json", method: "GET"}
                    { url: mapUrl, content: { f: "json" }, 
                      handleAs: "json", 
                      callbackParamName: "callback" }
                ).then(lang.hitch(this, function (data) {
                    console.log('Map service info received...');
                    console.log(data);
                    this.layerInfo = data;
                    // this.mapServiceInfo = data;
                    this.layInds = Object();
                    data.layers.forEach(function (layer) {
                        this.layInds[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
                    }, this);
                    data.tables.forEach(function (layer) {
                        this.layInds[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
                    }, this);
                }), function (error) {
                    console.log("Could not load map service info: " + error);
                });
            },

        });
    });