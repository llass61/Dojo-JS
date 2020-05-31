

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/WebMap",
    "esri/widgets/Search",
    "esri/widgets/LayerList",
    "esri/widgets/Expand",
    "esri/widgets/Print",
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

    view.when(() => {
        console.log("View is loaded");
        map.layers.forEach((layer) =>
            console.log(layer.id));


        
        // widgets

        search = new Search({
            view: view,
            container: document.createElement("div"),
        });

        // Printing map
        var print = new Print({
            view: view,
            printServiceUrl: "https://localhost:6443/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
            container: document.createElement("div"),
        });

        // // Expanding 
        // layerList = new LayerList({
        //     view: view,
        //     container: document.createElement("div"),
        // });


        // Expands
        var searchExpand = new Expand({
            view: view,
            content: search.domNode,
            expandIconClass: 'esri-icon-search',
        });

        var printExpand = new Expand({
            view: view,
            content: print.domNode,
            expandIconClass: 'esri-icon-printer',
        });

        // Adds widget below other elements in the top left corner of the view
        view.ui.add(searchExpand, "top-right");
        view.ui.add(printExpand, "top-right");

    }, function () {
        console.log("View encountered an error");
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