

require([
    // only the modules called in this line are used in the callback
    "dojo/parser",
    "esri/map",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/geometry/Point",
    "esri/graphic",

    "dijit/form/MultiSelect",
    "dijit/form/ComboBox",
    "dijit/form/RadioButton",
    "dijit/layout/ContentPane",
    "dojo/domReady!"

], function( parser, Map, SimpleMarkerSymbol, Point, Graphic ) {

    parser.parse();

    let loadFuncType = 'no wait';
    let myPoints = [];
    
    let map = new Map("map", {
        basemap: "topo",
        center: [-122.45, 37.75],
        zoom: 13
      });

    map.on("click", createPoint);
    map.on("dbl-click", deletePoints);

    if (map.loaded) {
        onMapLoad();
    }
    else {
        loadFuncType = 'wait';
        map.on("load", onMapLoad);
    }

    function onMapLoad() {
        console.log(`map has loaded: ${loadFuncType}`);
    }

    function createPoint(evt) {
        symb = SimpleMarkerSymbol();
        pt = new Point(evt.mapPoint);
        graphic = new Graphic(pt,symb);
        map.graphics.add(graphic);

        myPoints.push(graphic);
        console.log(`click event`);
    }

    function deletePoints(evt) {
       myPoints.forEach( pt => {
           console.log("deleting points");
           map.graphics.remove(pt);
        //    map.graphics.clear();
       });
    }
});
