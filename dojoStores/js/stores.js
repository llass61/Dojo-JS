// using the class elsewhere...
require([
    "dijit/registry",
    "dojox/grid/DataGrid",
    "dojo/data/ObjectStore",
    "dojo/parser",
    "dojo/json",
    "dojo/store/Memory",
    "dojo/store/JsonRest",
    "dojo/request",
    "esri/request",
    "esri/config",
    "dojo/domReady!"],
  function(registry, DataGrid, ObjectStore, parser, JSON, Memory, JsonRest, dojoRequest, esriRequest,esriConfig){

    var grid;
    parser.parse();
    console.log("In dojoStores/dataStores.js");
    esri.config.defaults.io.useCors= true;
    esri.config.defaults.io.corsEnabledServers.push('sampleserver1.arcgisonline.com');
    // esriConfig.defaults.io.corsEnabledServers.push('sampleserver1.arcgisonline.com');
    // esriConfig.defaults.io.alwaysUseProxy = false;
    // esriConfig.defaults.io.corsDetection = false;

    data = [
      {name:"Jim1", department:"accounting"},
      {name:"Bill1", department:"engineering"},
      {name:"Mike1", department:"sales"},
      {name:"Jim2", department:"sales"},
      {name:"Bill2", department:"engineering"},
      {name:"Mike2", department:"engineering"},
      {name:"John", department:"sales"}
    ];

    function memStore() {

      objectStore = new Memory({data: data});
      console.log(objectStore);

      grid = new DataGrid({
          store: ObjectStore({objectStore: objectStore}),
          structure: [
              {name:"First Name", field:"name"},
              {name:"Dept.", field:"department"}
          ]
      }, "grid");

      grid.startup();
    }

    function jsonStore() {

      url2 = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer?f=json"
      url3 = "https://epedev002-ll:6443/arcgis/rest/services/Operations_Phase/MapServer/14?f=json"
     
      // let empStore = new JsonRest({target: url2});
      // res = empStore.get("").then(function(results) {
      //   console.log(res);
      // });

      // dojoRequest(url2,
      //             { headers: {"X-Requested-With": null} }    
      // ).then(function(data){
      //   // do something with handled data
      // }, function(evt){
      //   console.log(evt.data)
      // }, function(err){
      //   console.log(err)
      // });

    }

    function jsonStore() {

      url2 = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer?f=json"
      url3 = "https://epedev002-ll:6443/arcgis/rest/services/Operations_Phase/MapServer/14?f=json"
     
      // let empStore = new JsonRest({target: url2});
      // res = empStore.get("").then(function(results) {
      //   console.log(res);
      // });
    }
 
    // memStore();
    jsonStore();

  });
