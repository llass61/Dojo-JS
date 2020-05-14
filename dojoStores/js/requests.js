

require([
    // only the modules called in this line are used in the callback
    "dojo/parser",
    "dojo/store/JsonRest",
    "esri/request",
    "dojo/store/Cache",
    "dojo/store/Memory",
    "dojo/store/Observable",
    "dijit/registry",
    "esri/map",
    "dijit/form/MultiSelect",
    "dijit/form/ComboBox",
    "dijit/form/RadioButton",
    "dijit/layout/ContentPane",
    "dojo/domReady!"

], function( parser, JsonRest, esriRequest, Cache, Memory, Observable, registry, Map) {

    parser.parse();
    let map = new Map("map", {
        basemap: "topo",
        center: [-122.45, 37.75],
        zoom: 13
      });

    
    esri.config.defaults.io.useCors= true;
    let url1 = "https://epedev002-ll:6443/arcgis/rest/services/Operations_Phase/FeatureServer/16?f=json"
    let url2 = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer?f=json"
    let url3 = "https://epedev002-ll:6443/arcgis/rest/services/Operations_Phase/MapServer/14?f=json"
    
    var earthquakes = esriRequest({
        url: url1,
        handleAs: "json"
      });

    earthquakes.then(
        function (data) {
          console.log("Data: ", data);
        },
        function (error) {
          console.log("Error: ", error.message);
        }
    );

    // let eRequest = esriRequest({
    //     url: url3,
    //     handleAs: "json"
    // });

    // eRequest.then(
    //     function(data) {
    //         console.log(data);
    //     },
    //     function(error) {
    //         console.log(error);
    //     }
    // );

    // dojoRequest(url2,
    //             { headers: {"X-Requested-With": null} }    
    // ).then(function(data){
    //   // do something with handled data
    // }, function(evt){
    //   console.log(evt.data)
    // }, function(err){
    //   console.log(err)
    // });

    
    // turn case info off
    let mydata = [{id: "1", name: "BARCLAY-2401"}, {id:"2", name: "BARCLAY-2402"}];
    let mydataStore = new Memory({idPropery: "id", data: mydata});


    let baysCB = registry.byId('pfCaseStudyNm');
    // let myStore = new dojo.store.Observable(new Memory({idPropery: "id", name: "name", data: []}));
    // nSubs.searchAttr = "name";
    // nSubs.labelAttr = "name";
    // nSubs.set('store', myStore);
    baysCB.store = stateStore2;
    baysCB.set("value", stateStore2.data[0].name);

    

});
