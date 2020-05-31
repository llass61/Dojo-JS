

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/WebMap"
  ], function (Map, MapView, WebMap) {
    
    
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

    view.when( () => {
        console.log("View is loaded");
        map.layers.forEach( (layer) => 
            console.log(layer.id));
    }, function() {
        console.log("View encountered an error");
    });

  });