define([
   "esri/tasks/QueryTask",
   "esri/tasks/Task",
   "esri/request",
   "dojo/request",
   "dojo/store/JsonRest",

], function(QueryTask, Task, esriRequest, dojoRequest, JsonRest) {

   let resList = null;
   return {

      taskRequest: function(url, outFields=["*"], whereClause="1=1",
                        orderByFields=[], returnGeometry=false) {
         console.log('taskRequest: ' + url);
         var qt = new esri.tasks.QueryTask(url);
         var query = new esri.tasks.Query();
         query.returnGeometry = returnGeometry;
         query.outFields = outFields;
         query.where = whereClause;
         query.orderByFields = orderByFields;

         return qt.execute(query).then(function (res) {
            let resList = [];
            if (res.features && res.features.length > 0) {
               resList = res.features.map();
            }
            console.log(`loaded ${resList.length} features`);

         }, function (error) {
            console.log(`Error loading ${url}: ` + error);
         });
      },

      esriRequest: function(url, params=null) {
         console.log('esriRequest: ' + url);

         // default params for call - always default to 'json'
         let esriParams = {
            url: url,
            content: { f: "json" },
            handleAs: "json"
         };

         // add/update params if passed in
         if (params != null && Object.keys(params).length > 0) {
            for (var k in params) {
               esriParams[k] = params[k];
            }
         }

         return esriRequest(esriParams).then(data => {
            console.log(`esriRequest recieved: ${url}`);
            console.log(data);
            return data;
            }, err => {
               console.error(`Error - esriRequest: ${url}`);
               console.error(err);
            }, evt => {
               console.log(`Progress for: ${url}`);
               console.log(evt);
            });
      },
  };

});
