// using the class elsewhere...
require(["dojo", "dojo/parser", "dijit/registry", "dojo/domReady!"], 
    function(dojo, parser, registry){
   
        parser.parse();
        console.log("in declarative.js");

        // someDialog = registry.byId("someDialog");
        // console.log(someDialog);
  });
  