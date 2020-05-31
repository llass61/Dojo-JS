

require([
  "esri/Map",
  "esri/views/MapView",
], function (Map, MapView, WebMap) {

  var map = new Map({
    basemap: "streets",
  });

  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-118, 34],
    // extent: setExtent(),
    zoom: 10,
    rotation: 30,
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