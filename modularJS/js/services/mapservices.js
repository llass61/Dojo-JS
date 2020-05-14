define([
    'esri/layers/FeatureLayer',
    'esri/renderers/SimpleRenderer',
    'esri/request'
], function(FeatureLayer, SimpleRenderer, esriRequest) {

    function loadMapAssets(protocol, gisServer, mapInstance) {
        var mapUrl = "http://" + gisServer + "/arcgis/rest/services/" + mapInstance + "/MapServer";
        console.log('Requesting layer info...', mapUrl);

        esriRequest({
            url: mapUrl, content: { f: "json" }, handleAs: "json", 
            callbackParamName: "callback" 
        }).then(function(data) {
            console.log("Layer Info received...");
            console.log(data);
        });
    }

    function loadServices(protocol, gisServer, mapInstance) {
        // var mapUrl = protocol+"//" + gisServer + "/arcgis/rest/services/" + mapInstance + "/MapServer";
        var layers = [];
        var censusLayer = new FeatureLayer('https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/US_Esri_Census/FeatureServer/5');
        //var renderer = new SimpleRenderer(symbolUtil.renderSymbol());

        //censusLayer.setRenderer(renderer);
        //layers.push(censusLayer);
        fl = new FeatureLayer('http://localhost:6080/arcgis/rest/services/eneri/MapServer/5');
        // { 
        //     mode: FeatureLayer.MODE_SNAPSHOT 
        // });
        // fl.setDefinitionExpression("phasecode = 'A'");
        layers.push('http://localhost:6080/arcgis/rest/services/eneri/MapServer/5');
        return layers;
    }

    function allServices() {
        let layers = [];
        const epeLayersIndexes = {'Loads': 1, 'Equipment': 3, 'Power Lines': 5, 'Poles': 7};
        epeFeaturesServerBase = 'http://localhost:6080/arcgis/rest/services/eneri/FeatureServer/';
        fl = new FeatureLayer('http://localhost:6080/arcgis/rest/services/eneri/MapServer/1', 
        { 
            mode: FeatureLayer.MODE_SNAPSHOT 
        });
        layers.push(f1);
        return layers;
    }

   return {
       loadServices: loadServices,
       loadMapAssets: loadMapAssets
   };
    
});