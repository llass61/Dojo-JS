

require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/geometry/SpatialReference",
], function (WebMap, MapView, FeatureLayer, SpatialReference) {

    let cnt = 0;
    
    webmapids = [
        "e691172598f04ea8881cd2a4adaa45ba",
        "2dfaf8bdb45a4dcf8511a849e4583873",
        "b5cc864eeab34258baa30f8ff9cbfe9e",
    ]

    const webmaps = webmapids.map( (webmapid) => {
        return new WebMap({
            portalItem: {
                id: webmapid,
            }
        });
    });

    var view = new MapView({
        container: "viewDiv",
        ui: {
            components: ["zoom", "compass", "attribution"]
        },
        map: webmaps[cnt]
    });

    // webmaps[cnt].load().then( () => {
    //     console.log("loaded");
    //     // const layer = webMap.layers.find( ({ id }) => {
    //     //     console.log(id);
    //     //     return id.indexOf("CensusTractPoliticalAffiliationTotals") > -1;
    //     // });
    //     // layer.definitionExpression = "TOTPOP_CY > 15000";
    //     view.map = webmaps[cnt];
    // });

    view.on('click', (evt) => {
        if (cnt == webmaps.length) cnt = 0;
        view.map = webmaps[cnt];
        cnt++
        console.log("CLICKED");
    });

});