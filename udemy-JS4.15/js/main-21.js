

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


    var map = new WebMap({
        portalItem: {
            id: "b5cc864eeab34258baa30f8ff9cbfe9e",
        }
    });

    var view = new MapView({
        container: "viewDiv",
        map: map,
        ui: {
            components: ["zoom", "compass", "attribution"]
        }
    });

    // changed in new version to when???
    // view.then( () => {
    //     console.log("Completed loading of view");
    // });

    // view.when(() => {
    //     console.log("View is loaded");
    //     map.layers.forEach((layer) =>
    //         console.log(layer.id));
        

    // }, function () {
    //     console.log("View encountered an error");
    // });

    var layer = 'Enriched Requests_2790';
    view.when(() => {
        map.layers.forEach((layer) =>
            console.log(layer.id));
        return view.whenLayerView(layer);
    })
    .then(() => {
        layerView = val.target;
        return layerView.queryFeatures()
    })
    .then((features) => {
        return view.goTo(features)
    });


    function setExtent() {
        let def = new Extent({
            xmin: -10919311.41681004,
            ymin: 3612806.5850415034,
            xmax: -10625793.228194851,
            ymax: 3748100.125106317,
            "spatialReference": defaultSpatialRef
        });
        return def;
    }

});