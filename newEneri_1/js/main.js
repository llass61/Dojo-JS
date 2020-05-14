
window.protocol = "http:";
var layers = ['Loads', 'Equipment', 'Power Lines', 'Poles'];
var enriConfig = {
    cVersion: "1.0.0.2017.04.10-1",
	user: "gs",
	server: "epedev002-ll",
	dbServer: "epedev002-ll",
	gisServer: "epedev002-ll:6080",
	sdeInstance: "operations.sde",
	sdePfx: "",
	dbInstance: "hotec",
	mapInstance: "Operations_Phase",
   gridInstance: "Grid",
    // instance: remoteConf,
    //imgRoot: window.location.origin+'/adda/img/',
    //iconRoot: window.location.origin+'/adda/img/icons/',
    // imgRoot: remoteConf.staticRoot+'img/',
    // iconRoot: remoteConf.staticRoot+'/img/icons/',
    //serverFullName: (serverFullName || serverFullName == "") ? serverFullName : server,
    layers: layers,
    netLayers: ['Loads', 'Equipment', 'Power Lines'],
    conf: {
        defaultExtent: {},
        defaultSpatialRef: null
    }
}

require([
    // only the modules called in this line are used in the callback
    "dojo/parser",
    "dojo/on",
    "dojo/when",
    "dojo/promise/all",
    "esri/map",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/geometry/Point",
    "esri/graphic",
    "esri/SpatialReference",
    "esri/geometry/Extent",
    "services/MapServiceInfo",
    "services/EquipModelsService",
    "services/GpService",
    "services/EneriService",
    "dojo/domReady!"

], function( parser, on, when, all, Map, SimpleMarkerSymbol,
             Point, Graphic, SpatialReference, Extent,
             MapServiceInfo, EquipModelsService,
             GpService, EneriService) {

    let loadFuncType = 'no wait';
    let myPoints = [];
    let mapServiceLayers = null;
    let equipModelTbls = null;
    let map = null;

    // function defs
   //  function onMapLoad() {
   //      console.log(`map has loaded: ${loadFuncType}`);
   //  }

   //  function loadMapServiceInfo() {
   //      mapServiceLayers = new MapServiceInfo(enriConfig.gisServer, enriConfig.mapInstance);
   //      // mslmapServiceLayers.getAssetLayerInfo().then( function(results) {
   //      //     console.log("got it");
   //      // });

   //      // let mslDef = mapServiceLayers.getAssetLayerInfo();
   //      mapServiceLayers.getAssetLayerInfo().then(function() {
   //          console.log("MapServiceLayers are loaded...");
   //          console.log(mapServiceLayers);
   //          loadEquipModels();

   //          // try tasks
   //          task = "connectivityCheck"
   //          params = {};
   //          params.sde = "operations.sde";
   //          params.subset = "BARCLAY-2402";
   //          params.options = "10.0,True";
   //          gps = new GpService(mapServiceLayers, task, params);
   //          gps.submitJob(params);

   //      });

   //      // when(mslDef, function() {
   //      //     console.log("MapServiceLayers are loaded...");
   //      // });

   //      // all([mslDef]).then( function() {
   //      //     console.log("MapServiceLayers are loaded...");
   //      // });

   //      console.log("HERE");
   //  }

   //  function loadEquipModels() {
   //      equipModelTbls = new EquipModelsService(mapServiceLayers, map);
   //      equipModelTbls.getAllModels();
   //  }

   //  function createPoint(evt) {
   //      symb = SimpleMarkerSymbol();
   //      pt = new Point(evt.mapPoint);
   //      graphic = new Graphic(pt,symb);
   //      map.graphics.add(graphic);

   //      myPoints.push(graphic);
   //      console.log(`click event`);
   //  }

   //  function deletePoints(evt) {
   //     myPoints.forEach( pt => {
   //         console.log("deleting points");
   //         map.graphics.remove(pt);
   //      //    map.graphics.clear();
   //     });
   //     myPoints.splice(0, myPoints.length);
   //  }

    parser.parse();

    enriConfig.defaultSpatialRef = new esri.SpatialReference({wkid: 3857});
    enriConfig.defaultExtent = new esri.geometry.Extent({
        xmin: -10919311.41681004,
        ymin: 3612806.5850415034,
        xmax: -10625793.228194851,
        ymax: 3748100.125106317,
        "spatialReference": enriConfig.defaultSpatialRef
    });

    map = new esri.Map("mapDiv", {
        extent: enriConfig.defaultExtent,
        basemap: "streets",
        infoWindow: new esri.dijit.Popup({}, dojo.create("div")),
        sliderPosition: "top-right",
        logo: false,
        fadeOnZoom: true,
        force3DTransforms: true,
        navigationMode: "css-transforms",
        optimizePanAnimation: true
        // lods: enriConfig.conf.lods,
    });

   console.log("loading services");
   services = new EneriService(enriConfig.gisServer, enriConfig.mapInstance);
   services.loadServices();
   // ml = services.getMapLayer('grid_loads');
    // need to wait for map to load?
   //  loadMapServiceInfo();
    // loadEquipModels();

   //  map.on("click", createPoint);
   //  map.on("dbl-click", deletePoints);

   //  if (map.loaded) {
   //      onMapLoad();
   //  }
   //  else {
   //      loadFuncType = 'wait';
   //      map.on("load", onMapLoad);
   //  }

   // omsPushBtn.on("click", omsDataPushHdl);
   // clearBtn.on("click", omsDataPushHdl);

});

function omsDataPushHdl(event) {
   console.log('pushing OMS Data');
}
