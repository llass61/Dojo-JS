

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/WebMap",
    "esri/widgets/Search",
    "esri/widgets/LayerList",
    "esri/widgets/Expand",
    "esri/widgets/Print",
    "esri/widgets/Legend",
    "esri/widgets/Home",
    "esri/widgets/BasemapGallery",
    "esri/widgets/BasemapToggle",
], function (Map, MapView, WebMap, Search, LayerList, Expand, Print) {


    var webMap = new WebMap({
        portalItem: {
            id: "2dfaf8bdb45a4dcf8511a849e4583873",
        }
    });
    
    var layerId = 'CensusTractPoliticalAffiliationTotals';
    webMap.load().then( () => {

        const layer = webMap.layers.find(({id}) => {
            return id.indexOf(layerId) > -1;
        })
        layer.definitionExpression = "TOTPOP_CY <25000";
    });

    var view = new MapView({
        container: "viewDiv",
        map: webMap,
        ui: {
          components: ["zoom", "compass", "attribution"]
        }
      });


});