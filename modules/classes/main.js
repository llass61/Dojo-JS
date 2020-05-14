
// have to use 'controllers' as defined in index.html doConfig package
// does not work with './js/controllers/mapcontroller'  - not sure why though

require([
    "dojo/parser",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "dojo/store/Observable",
    "dojo/store/JsonRest",
    "dojo/store/Cache",
    "DataStore.js"
], function(parser, Memory, ObjectStore, Observable, JsonRest, Cache, DataStore) {
    
    parser.parse();
    var ds = new DataStore();
    ds.sayHello("Larry");

    var employees = [
        {id:"Jim", department:"accounting"},
        {id:"Bill", department:"engineering"},
        {id:"Mike", department:"sales"},
        {id:"John", department:"sales"}
    ];

    esri.config.defaults.io.corsEnabledServers.push("localhost");
    esri.config.defaults.io.corsEnabledServers.push("localhost.epe.local");
    esri.config.defaults.io.corsEnabledServers.push("epe002-ll");
    esri.config.defaults.io.corsEnabledServers.push("epe002-ll.epe.local");


    // var empStore = new Memory({data: employees});
    var empStore = new Observable(new Memory({data: employees}));

    empStore.query({department:"sales"}).forEach(function(emp){
        console.log(emp.id);
    });

    empStore.add({id:"Larry", department:"goofOff"});
    empStore.query({department:"goofOff"}).forEach(function(emp){
        console.log(emp.id);
    });

    loadProfJson = new JsonRest({
        target: "http://localhost:6080/arcgis/rest/services/eneri/MapServer/16"
    })

    cacheStore = new Memory({});
    loadProfStore = new Cache(loadProfJson, cacheStore);
    var results = loadProfStore.query("");
    console.log("HI");
    // loadScenariosStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "name", data: []}));
});