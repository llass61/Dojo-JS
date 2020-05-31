



require([
  "esri/Map",
  "esri/views/MapView",
  "esri/WebMap",
  "esri/views/SceneView",
  "esri/WebScene",
], function (Map, MapView, WebMap, SceneView, WebScene) {
  
  // #1
  // var map = new WebMap({
  //   portalItem: {
  //     id: "b5cc864eeab34258baa30f8ff9cbfe9e",
  //   }
  // });

  // #2
  var map = new Map({
    basemap: "satellite",
    ground: "world-elevation",
  });

  // #3
  // var map = new WebScene({
  //   portalItem: {
  //     id: 'e18d908bacd440f6ab15b75e85f637b4'
  //   }
  // });


  var view = new SceneView({
    container: "viewDiv",
    map: map,
    ui: {
      components: ["zoom", "compass", "attribution"]
    }
  });

  view.when( () => {
      console.log("View is loaded");
      setTimeout( function() {
        var camera = view.camera.clone();
        camera.position = {
          x: -118,
          y: 34,
          z: 1000
        };
        view.goTo(camera);
      }, 5000);

  }, function() {
      console.log("View encountered an error");
  });

  view.watch('camera', (camera) => {
    console.log("camera position: ", camera.position.x, camera.position.y);
    console.log("camera tilt: ", camera.tilt);
  });

});