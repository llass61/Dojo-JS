
// have to use 'controllers' as defined in index.html doConfig package
// does not work with './js/controllers/mapcontroller'  - not sure why though

require([
    "dojo/parser",
    "controllers/mapcontroller",
    "services/mapservices",
    'dojo/on',
    "utils/selectFeatures",
    "dojo/domReady!"
], function(parser, MapCtrl, mapServices, on, selectFeatures) {
    parser.parse();
    let sf = null;
    

    let ctrl = new MapCtrl({
        elem: 'mapDiv',
        mapOptions: {
            basemap: 'streets',
            center: [-97.134, 31.550],
            zoom: 12,
            layers: mapServices.loadServices()
        },
        layers: mapServices.loadServices()
    });

    console.log("HI");
    //console.log(ctrl.map);

    ctrl.load().then(function() {
        console.log('map ready');
        mapServices.loadMapAssets("http", "localhost:6080", "eneri");
        sf = new selectFeatures();
        sf.setMap(ctrl.map, ctrl.layers);
        sf.doEdits(ctrl.layers);
    });

});