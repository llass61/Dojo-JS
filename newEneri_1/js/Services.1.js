define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "esri/tasks/Geoprocessor"
    ],
    function (kernel, lang, declare, Geoprocessor) {
        
        let instance = null;
        return function(server, mapInstance) {
            if (instance) {
                return instance;
            }
            else {
                inst =  dojo.declare(null, {
                    constructor: function(server, mapInstance) {
                        this.baseUrl = window.protocol + "//" + server + "/arcgis/rest/services/";
                        this.mapInstance = mapInstance;
                        this.mapLayerUrlBase = this.baseUrl + mapInstance + "/MapServer/";
                        this.featureLayerUrlBase = this.baseUrl + mapInstance + "/FeatureServer/";
                        this.layInds = {};
                        this.mapLayers = [];
                    },
        
                    getMapLayerUrl: function(layerName) {
                        return this.baseUrl + mapInstance + "/MapServer/" + 
                                (layerName ? this.layInds[layerName] : '');
                    },
        
                    getFeatureLayerUrl: function(layerName) {
                        return this.baseUrl + mapInstance + "/FeatureServer/" + 
                                (layerName ? this.layInds[layerName] : '');
                    },
        
                    getGpUrl: function(geoSvc, tool) {
                        return this.baseUrl + geoSvc + "/GPServer/" + tool;
                    },
        
                    getGpUploadUrl: function(geoSvc) {
                        return this.baseUrl + geoSvc + "/GPServer/uploads/upload";
                    },
        
                    getAssetLayerInfo: function() {
                        let mapUrl = this.getMapLayerUrl();
                        if(esriConfig.defaults.io.proxyUrl){
                            mapUrl= esriConfig.defaults.io.proxyUrl + "?" + mapUrl;
                        }
                        console.log('Requesting layer info...', mapUrl);
                        return esri.request(//url, {handleAs: "json", method: "GET"}
                            { url: mapUrl, content: { f: "json" }, handleAs: "json", callbackParamName: "callback" }
                        ).then(dojo.hitch(this, function (data) {
                            console.log('Layer info received...');
                            console.log(data);
                            this.mapLayers = data.layers;
                            // this.layInds = Object();
                            // data.layers.forEach(function (layer) {
                            //     gs.layInds[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
                            // });
                            // data.tables.forEach(function (layer) {
                            //     gs.layInds[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
                            // });
                            //window.layInds = gs.layInds; 
                            //window.layerInfo= gs.layerInfo;
                        }), function (error) {
                            console.log("Could not load scenarios: " + error);
                        });
                    },
                });
                console.log(`inst(${server}, ${mapInstance})`)
                instance =  inst(server, mapInstance);
                return instance;
            }
        };
    });