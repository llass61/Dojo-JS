define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "esri/tasks/Geoprocessor"
    ],
    function (kernel, lang, declare, Geoprocessor) {

        return function (server, mapInstance) {
            let baseUrl = window.protocol + "//" + server + "/arcgis/rest/services/";
            let mapLayerUrlBase = this.baseUrl + mapInstance + "/MapServer/";
            let featureLayerUrlBase = this.baseUrl + mapInstance + "/FeatureServer/";

            return {
                getMapLayerUrl: function (layerName) {
                    return this.mapLayerUrlBase + (layerName?gs.layInds[layerName]:'');
                },

                getFeatureLayerUrl: function (layerName) {
                    return this.featureLayerUrlBase + (layerName?gs.layInds[layerName]:'');
                }
            }
        };
        // let Services = dojo.declare("Services", null, {

            // constructor: function (server, mapInstance) {
            //     this.baseUrl = window.protocol + "//" + server + "/arcgis/rest/services/";
            //     this.mapInstance = mapInstance;
            //     this.mapLayerUrlBase = this.baseUrl + mapInstance + "/MapServer/";
            //     this.featureLayerUrlBase = this.baseUrl + mapInstance + "/FeatureServer/";
        //     },

        //     getMapLayerUrl: function (layerName, mapInstance) {
        //         return this.baseUrl + mapInstance + "/MapServer/" + 
        //                 (layerName?gs.layInds[layerName]:'');
        //     },

            // getFeatureLayerUrl: function (layerName, mapInstance) {
            //     return this.baseUrl + mapInstance + "/FeatureServer/" + 
            //             (layerName?gs.layInds[layerName]:'');
            // },

        //     getGpUrl: function (geoSvc, tool) {
        //         return this.baseUrl + geoSvc + "/GPServer/" + tool;
        //     },

        //     getGpUploadUrl: function (geoSvc) {
        //         return this.baseUrl + geoSvc + "/GPServer/uploads/upload";
        //     },

        //     getAssetLayerInfo: function () {
        //         let mapUrl = getMapLayerUrl();
        //         if(esriConfig.defaults.io.proxyUrl){
        //             mapUrl= esriConfig.defaults.io.proxyUrl + "?" + mapUrl;
        //         }
        //         console.log('Requesting layer info...', mapUrl);
        //         return esri.request(//url, {handleAs: "json", method: "GET"}
        //             { url: mapUrl, content: { f: "json" }, handleAs: "json", callbackParamName: "callback" }
        //         ).then(function (data) {
        //             console.log('Layer info received...');
        //             console.log(data);
        //             gs.layerInfo = data;
        //             gs.layInds = Object();
        //             data.layers.forEach(function (layer) {
        //                 gs.layInds[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
        //             });
        //             data.tables.forEach(function (layer) {
        //                 gs.layInds[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
        //             });
        //             //window.layInds = gs.layInds; 
        //             //window.layerInfo= gs.layerInfo;
        //         }, function (error) {
        //             console.log("Could not load scenarios: " + error);
        //         });
        //     },

        // });
    });