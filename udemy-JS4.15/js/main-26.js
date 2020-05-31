

require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/geometry/SpatialReference",
], function (WebMap, MapView, FeatureLayer, SpatialReference) {

    let ops_phase_fs = "https://localhost:6443/arcgis/rest/services/Operations_Phase/FeatureServer";
    let ops_phase_ms = "https://localhost:6443/arcgis/rest/services/Operations_Phase/MapServer";

    let defaultSpatialRef = new SpatialReference({ wkid: 3857 });

    var webMap = new WebMap({
        portalItem: {
            id: "2dfaf8bdb45a4dcf8511a849e4583873",
        }
    });

    var view = new MapView({
        container: "viewDiv",
        ui: {
            components: ["zoom", "compass", "attribution"]
        }
    });

    webMap.load().then( () => {
        console.log("loaded");
        const layer = webMap.layers.find( ({ id }) => {
            console.log(id);
            return id.indexOf("CensusTractPoliticalAffiliationTotals") > -1;
        });
        layer.definitionExpression = "TOTPOP_CY > 15000";
        view.map = webMap;
    });

});