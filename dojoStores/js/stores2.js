

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

      var stateStore1 = new Memory({
        data: [
            {name:"Alabama", id:"AL"},
            {name:"Alaska", id:"AK"},
            {name:"American Samoa", id:"AS"},
            {name:"Arizona", id:"AZ"},
            {name:"Arkansas", id:"AR"},
            {name:"Armed Forces Europe", id:"AE"},
            {name:"Armed Forces Pacific", id:"AP"},
            {name:"Armed Forces the Americas", id:"AA"},
            {name:"California", id:"CA"},
            {name:"Colorado", id:"CO"},
            {name:"Connecticut", id:"CT"},
            {name:"Delaware", id:"DE"}
        ]
    });

    var stateStore2 = new Memory({ id: "abbr", labelAttr: "abbr",
        data: [
            {name:"Alabama", abbr:"AL"},
            {name:"Alaska", abbr:"AK"},
            {name:"American Samoa", abbr:"AS"},
            {name:"Arizona", abbr:"AZ"},
            {name:"Arkansas", abbr:"AR"},
            {name:"Armed Forces Europe", abbr:"AE"},
            {name:"Armed Forces Pacific", abbr:"AP"},
            {name:"Armed Forces the Americas", abbr:"AA"},
            {name:"California", abbr:"CA"},
            {name:"Colorado", abbr:"CO"},
            {name:"Connecticut", abbr:"CT"},
            {name:"Delaware", abbr:"DE"}
        ]
    });

    
    esri.config.defaults.io.useCors= true;
    let url1 = "https://epedev002-ll:6443/arcgis/rest/services/Operations_Phase/MapServer/16"
    let url2 = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer?f=json"
    let url3 = "https://epedev002-ll:6443/arcgis/rest/services/Operations_Phase/MapServer/14?f=json"
    
    let eRequest = esriRequest({
        url: url3,
        handleAs: "json"
    });

    eRequest.then(
        function(data) {
            console.log(data);
        },
        function(error) {
            console.log(error);
        }
    );
    // var results = loadProfJson.query("").then(function(rec){
    //     console.log("HI");
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
