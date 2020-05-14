define([

], function() {

   let resList = null;

   return {

      request: function(url, name, outFields=["*"], whereClause="1=1",
                        orderByFields=[], returnGeometry=false) {
         console.log(`requesting ${name}: ${url}`);
         var qt = new esri.tasks.QueryTask(url);
         var query = new esri.tasks.Query();
         query.returnGeometry = returnGeometry;
         query.outFields = outFields;
         query.where = whereClause;
         query.orderByFields = orderByFields;

         return qt.execute(query).then(function (res) {
            let resList = [];
            if (res.features && res.features.length > 0) {
               resList = res.features.map( function (x) {
                  return x.attributes;
               });
            }
            console.log(`loaded ${resList.length} features`);
            return resList;
         }, function (error) {
            console.error(`Error loading ${url}: ` + error);
         });
      },
  };

});
