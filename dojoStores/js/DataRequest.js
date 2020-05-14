define([
   "esri/tasks/QueryTask",
   "esri/tasks/Task",
   "esri/request",
   "dojo/request",
   "dojo/store/JsonRest",

], function(QueryTask, Task, esriRequest, dojoRequest, JsonRest) {

   let resList = null;
   return {
      getBayList: function() {
         url = "https://epedev002-ll:6443/arcgis/rest/services/Operations_Phase/MapServer/20?f=json"
         console.log('Circuit list: ' + url);
         var qt = new esri.tasks.QueryTask(url);
         var query = new esri.tasks.Query();
         query.returnGeometry = false;
         query.outFields = ["*"];
         query.where = "1=1";
         query.orderByFields = ["equipref ASC"];
         return qt.execute(query).then(function (res) {
            resList = res;
            resList.features.forEach(function (f) {
               f.attributes['name'] = f.attributes['equipref'];
            });
            resList.features.sort(function (a, b) {
               var aa = a.attributes, ba = b.attributes;
               return (aa.name < ba.name) ? -1 : ((aa.name === ba.name) ? 0 : 1);
            });
            //  ReloadStoreWithFeatureSet(gs.state.bayList, gs.state.bayListStore);
            //  updateListControls(blControls);
            console.log(res.features.length + ' circuits loaded.');
            return res;
         }, function (error) {
            console.log("Could not load sub-bay combinations: " + error);
         });
      },

      taskRequest: function(url, outFields=["*"], whereClause="1=1",
                        orderByFields=["equipref ASC"], returnGeometry=false) {
         // url = "https://epedev002-ll:6443/arcgis/rest/services/Operations_Phase/MapServer/20?f=json"
         console.log('requesting: ' + url);
         var qt = new esri.tasks.QueryTask(url);
         var query = new esri.tasks.Query();
         query.returnGeometry = returnGeometry;
         query.outFields = outFields;
         query.where = whereClause;
         if (orderByFields != null) {
            query.orderByFields = orderByFields;
         }
         return qt.execute(query).then(function (res) {
            let resList = [];
            if (res.features && res.features.length > 0) {
               resList = res.features.map();
            }
            console.log(`loaded ${resList.length} features`);
            return resList;
         }, function (error) {
            console.log(`Error loading ${url}: ` + error);
         });
      },

      esriRequest: function(url, params=null, goodCallBack=null, errorCallBack=null, progressCallBack=null) {
         // url2 = "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer?f=json"
         // url3 = "http://epedev002-ll:6080/arcgis/rest/services/Operations_Phase/MapServer/14?f=json"

         // let empStore = new JsonRest({target: url2});
         // res = empStore.get("").then(function(results) {
         //   console.log(res);
         // });

         // dojoRequest(url3, {headers: {"X-Requested-With": null}}).then( data => {
         //    console.log(`Good return: ${data}`);
         // }, err => {
         //    console.error(`Error return: ${err}`);
         // }, evt => {
         //    console.log(`progress.... ${evt}`);
         // });

         // default params for call - always default to 'json'
         let esriParams = {
            url: url,
            handleAs: "json"
         };

         // add/update params if passed in
         if (params != null && Object.keys(params).length > 0) {
            for (var k in params) {
               esriParams[k] = params[k];
            }
         }

         if (goodCallBack == null &&
             errorCallBack == null &&
             progressCallBack == null) {

            return esriRequest(esriParams);
         }
         else {
            if (errorCallBack == null) errorCallBack = this.defaultErrorCallBack;
            if (progressCallBack == null) progressCallBack = this.defaultProgressCallBack;

            esriRequest(esriParams).then(data => {
               goodCallBack(data);
            }, err => {
               errorCallBack(err);
            }, evt => {
               progressCallBack(evt);
            });
         }

         // dojoRequest(url2,
         //             { headers: {"X-Requested-With": null} }
         // ).then(function(data){
         //   // do something with handled data
         // }, function(evt){
         //   console.log(evt.data)
         // }, function(err){
         //   console.log(err)
         // });

         return
      },

      dojoRequest: function(url, goodCallBack=null, errorCallBack=null, progressCallBack=null) {
         // url2 = "http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer?f=json"
         // url3 = "http://epedev002-ll:6080/arcgis/rest/services/Operations_Phase/MapServer/14?f=json"

         // let empStore = new JsonRest({target: url2});
         // res = empStore.get("").then(function(results) {
         //   console.log(res);
         // });

         // dojoRequest(url3, {headers: {"X-Requested-With": null}}).then( data => {
         //    console.log(`Good return: ${data}`);
         // }, err => {
         //    console.error(`Error return: ${err}`);
         // }, evt => {
         //    console.log(`progress.... ${evt}`);
         // });
         if (goodCallBack == null &&
             errorCallBack == null &&
             progressCallBack == null) {

            return dojoRequest(url, { headers: { "X-Requested-With": null } });
         }
         else {
            if (errorCallBack == null) errorCallBack = this.defaultErrorCallBack;
            if (progressCallBack == null) progressCallBack = this.defaultProgressCallBack;

            dojoRequest(url, { headers: { "X-Requested-With": null } }).then(data => {
               goodCallBack(data);
            }, err => {
               errorCallBack(err);
            }, evt => {
               progressCallBack(evt);
            });
         }

         // dojoRequest(url2,
         //             { headers: {"X-Requested-With": null} }
         // ).then(function(data){
         //   // do something with handled data
         // }, function(evt){
         //   console.log(evt.data)
         // }, function(err){
         //   console.log(err)
         // });

         return
      },

      defaultErrorCallBack: function(err) {
         console.log(`Error - Default Callback: ${err}`);
      },

      defaultProgressCallBack: function(evt) {
         console.log(`Progress - Default Callback: ${evt}`);
      }
  };

});
