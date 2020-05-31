

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/geometry/SpatialReference",
], function (Map, MapView, FeatureLayer, SpatialReference) {

    let ops_phase_fs = "https://localhost:6443/arcgis/rest/services/Operations_Phase/FeatureServer";
    let ops_phase_ms = "https://localhost:6443/arcgis/rest/services/Operations_Phase/MapServer";

    let defaultSpatialRef = new SpatialReference({ wkid: 3857 });

    pl_layer = new FeatureLayer({
        url: ops_phase_fs += '/11',
        // url: "https://services1.arcgis.com/QKasy5M2L9TAQ7gs/arcgis/rest/services/At_Risk_CT2010_pts/FeatureServer/0",
    });

    map = new Map({
        basemap: "streets",
        layers: [pl_layer]
    });
    // map.add(pl_layer);

    mapView = new MapView({
        container: "viewDiv",
        // center: [-10772552.32245, 3680453.35505],
        center: [-97.42552, 31.20453],
        zoom: 9.5,
        map: map
    });

    

  mapView.watch('camera', (camera) => {
    console.log("camera position: ", camera.position.x, camera.position.y);
    console.log("camera tilt: ", camera.tilt);
  });

});