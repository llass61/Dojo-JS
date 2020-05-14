// using the class elsewhere...

let mystore = null;
let employeeStore = null;
let myEmp = null;
require([
   "dijit/registry",
   "dojo",
   "dijit",
   "dojo/parser",
   "dojo/json",
   "dojo/store/Memory",
   "dojo/_base/lang",
   "dojo/when",
   "dojo/promise/all",
   "js/EneriStores",
   "js/TableRequest",
   "js/DataRequest",
   "js/AssetLayers",
   "dijit/form/ComboBox",
   "dijit/form/MultiSelect",
   "dojo/domReady!" ],
   function (registry, dojo, dijit, parser, JSON, Memory, lang, when, all, EneriStores, tableRequest, DataRequest, AssetLayers)  {

      parser.parse();
      console.log("In dojocircuitStore/main.js");

      var employees = [
         { name: "Jim", department: "accounting" },
         { name: "Bill", department: "engineering" },
         { name: "Mike", department: "sales" },
         { name: "John", department: "sales" }
      ];

      employeeStore = new Memory({ data: employees, idProperty: "name" });
      console.log(employeeStore.get("Jim"));
      console.log(employeeStore.query({ department: "sales" }));
      employeeStore.query({ department: "sales" }).forEach(e => console.log(e.name));
      employeeStore.query({ department: "sales" }).sort().forEach(e => console.log(e.name));

      mike = employeeStore.query({ name: "Mike" });
      mike = employeeStore.get("Mike");
      for (var i in mike) {
         console.log(i, "=", mike[i]);
      }

      //
      // redefine for more testing
      //

      console.log("***********************\n\n");
      employees = [
         { name: "Jim1", department: "accounting" },
         { name: "Bill1", department: "engineering" },
         { name: "Mike1", department: "sales" },
         { name: "Jim2", department: "sales" },
         { name: "Bill2", department: "engineering" },
         { name: "Mike2", department: "engineering" },
         { name: "John", department: "sales" }
      ];

      employeeStore = new Memory({ data: employees, idProperty: "name" });

      employeeStore.query({ department: "sales" }, {
         sort: [{ attribute: "name", descending: true }],
         start: 0,
         count: 2
      }).forEach(e => console.log(e));


      // circuitStore = new EneriStores("EneriStores", ['baysCB','baysMS','baysMS1'], 'name',
      //    'name', 'name');
      // circuitStore.connectControlToStore();

      // name="EneriStore", controls=[], idProp='id',
      //                        labelAttr='id', searchAttr='id', sortAttr='id',
      //                        data=[]

      // circuitStore = new EneriStores("EneriStores", ['baysCB','baysMS','baysMS1'], 'equipref',
      // 'equipref', 'equipref', 'equipref');
      // circuitStore = new EneriStores(name="EneriStores",
      //                          controls=['baysCB','baysMS1'],
      //                          idProp='equipref');

      // gridStore = new EneriStores(name="Gridloads",
      //                          controls=['baysCB','baysMS1','baysMS3'],
      //                          idProp='equipref');

      circStoreMS = new EneriStores(name="abc",
                               controls=['baysMS3'], idProp='equipref', 'equipref', 'equipref', 'equipref', [], true);


      // table data nd features are returned with different structures!
      // features have the attributes attrib!  Tables do not
      let url = "http://epedev002-ll:6080/arcgis/rest/services/Operations_Phase/MapServer?f=json";
      // let url = "http://epedev002-ll:6080/arcgis/rest/services/Operations_Phase/MapServer/20?f=json";
      // let url = "http://epedev002-ll:6080/arcgis/rest/services/Operations_Phase/MapServer/5?f=json";
      retData = [];
      // tableRequest.request(url).then(function(res) {
      //    console.log("in results");
      //    retData = res.map(function(r) {
      //       return r;
      //    });
      //    // circuitStore.setData(retData);
      //    // gridStore.setData(retData);
      //    circStoreMS.setData(retData);
      // }, function(err) {
      //    console.err(`error: ${err}`);
      // });


      console.log("done");

      // circuitStore.getStore().query({ department: "sales" }, {
      //    sort: [{ attribute: "name", descending: true }],
      //    start: 0,
      //    count: 2
      // }).forEach(e => console.log(e));


      // circuitStore.getStore().put({name: "Larry", department: "payroll"});

      // circuitStore.getStore().query({name: "Larry"})

      // mystore = circuitStore.getStore();
      // myEmp = circuitStore;


      // trying dojo request
      newUrl = "http://epedev002-ll:6080/arcgis/rest/services/Operations_Phase/MapServer/";
      // newUrl = 'http://epedev002-ll:6080/arcgis/rest/services/Operations_Phase/MapServer/20/query?f=json&where=1%3D1&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=';
      // DataRequest.dojoRequest(newUrl).then( data => {
      //       console.log(`Good return: ${data}`);
      //    }, err => {
      //       console.error(`Error return: ${err}`);
      //    }, evt => {
      //       console.log(`progress.... ${evt}`);
      //    });

      // DataRequest.dojoRequest(url, (data) => {console.log("DID IT");
                                             //  DataRequest.esriRequestErrorCallBack(data)});

      // trying dojo request
      // DataRequest.esriRequest(url).then( data => {
      //       console.log(`Good return: ${data}`);
      //    }, err => {
      //       console.error(`Error return: ${err}`);
      //    }, evt => {
      //       console.log(`progress.... ${evt}`);
      //    });

      // DataRequest.dojoRequest(url, (data) => {console.log("DID IT");
      //                                         DataRequest.esriRequestErrorCallBack(data)});

      url = "http://epedev002-ll:6080/arcgis/rest/services/Operations_Phase/MapServer?f=json";
      a1 = new AssetLayers(url);
      url = "http://epedev002-ll:6080/arcgis/rest/services/Operations_Phase/MapServer?f=json";
      a2 = new AssetLayers(url);
      // var layerIndex = null;
      // alg = al.getAssets();

      // console.log('sleeping');
      // for (var i=0; i < 500000000; i++) {;}
      // console.log('awake');

      all([a1.getAssets(),a2.getAssets]).then( res => {
         console.log(`Here it is: ${res}`);
      });

      // when(alg).then(function(data) {
      //    console.log(`getAssets Good return: ${data}`);
      //    al.loadAssets(data);
      //    console.log("HI");
      // }, err => {
      //    console.error(`getAssets Error return: ${err}`);
      // }, evt => {
      //    console.log(`getAssets progress.... ${evt}`);
      // });

      // al.getAssets().then(function(data) {
      //    console.log(`getAssets Good return: ${data}`);
      //    al.loadAssets(data);
      //    console.log("HI");
      // }, err => {
      //    console.error(`getAssets Error return: ${err}`);
      // }, evt => {
      //    console.log(`getAssets progress.... ${evt}`);
      // });
   });


   let putCnt = 0;
   function addToBaysCB() {
      console.log("addToBaysCB");
      putCnt++;
      var equipref = "ABCDE-" + putCnt;
      var myname = {objectid: 999, equipref: equipref, secname: "NE689", otype: "source"};
      console.log(`addToBaysCB ${myname}`);
      // mystore.put({name: myname});
      mystore.put(myname);
   }


   function addNewCtl() {
      console.log("addNewCtl");
      myEmp.addControl('baysMS2');
   }
