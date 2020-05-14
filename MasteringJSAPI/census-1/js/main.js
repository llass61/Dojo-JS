
let map;
require(["esri/map", 
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/tasks/IdentifyParameters",
    "esri/tasks/IdentifyTask",
    "esri/InfoTemplate",
    "dojo/_base/array",
    "esri/SimpleRenderer",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "dojo/domReady!"
    ], function (
    Map, ArcGISDynamicMapServiceLayer,
    IdentifyParameters, IdentifyTask,
    InfoTemplate, arrayUtils, 
    SimpleRenderer, SimpleLineSymbol, Color) {

    let censusUrl = "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/";
    let layer = new ArcGISDynamicMapServiceLayer(censusUrl);
    let iTask = IdentifyTask(censusUrl);
    let defResults = null;

    map = new Map("map", {
        // basemap: "topo",
        // center: [-122.45, 37.75],
        basemap: "national-geographic",
        center: [-95,45],
        zoom: 3
    });

    map.addLayer(layer);
    
    function onMapLoad() {
        console.log("in onMapLoad...");
        map.on("click", onMapClick);
    }

    function onMapClick(event) {
        var params = new IdentifyParameters();
        params.geometry = event.mapPoint;
        params.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
        params.mapExtent = map.extent;
        params.returnGeometry = true;
        params.width = map.width;
        params.height = map.height;
        params.spatialReference = map.spatialReference;
        params.tolerance = 3;
        defResults = iTask.execute(params).addCallback(onIdentifyComplete);
        map.infoWindow.setFeatures([defResults]);
        map.infoWindow.show(event.mapPoint);

        console.log("in onMapClick...");
    }

    function onIdentifyComplete(results) {
        console.log("in onIdentifyComplete...");
        return arrayUtils.map(results, function(result) {
            let feature = result.feature;
            let title = result.layerName;
            let content = null;

            switch(title) {
                case "Census Block Points":
                    content = "Population: ${POP2000}<br\>Households ${HOUSEHOLDS}<br\> Housing Units: ${HSE_UNITS} ";
                    break;
                default:
                    content = "${*}";
            }
            feature.infoTemplate = new InfoTemplate(title, content);
            return feature;
        });
    }

    map.on("load", onMapLoad);
});
