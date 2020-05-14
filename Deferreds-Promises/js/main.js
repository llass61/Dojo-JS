// using the class elsewhere...
require([
    "dijit/registry", 
    "dojo/parser", 
    "dojo/json",
    "dojo/store/Memory",
    "dojo/domReady!"],
  function(registry, parser, JSON, Memory, config){
    
    parser.parse();
    console.log("In dojoStores/main.js");

    var employees = [
      {name:"Jim", department:"accounting"},
      {name:"Bill", department:"engineering"},
      {name:"Mike", department:"sales"},
      {name:"John", department:"sales"}
    ];
    
    var employeeStore = new Memory( {data: employees, idProperty: "name" } );
    console.log(employeeStore.get("Jim"));
    console.log(employeeStore.query({department: "sales"}));
    employeeStore.query({department: "sales"}).forEach( e => console.log(e.name));
    employeeStore.query({department: "sales"}).sort().forEach( e => console.log(e.name));

    mike = employeeStore.query({name: "Mike"});
    mike = employeeStore.get("Mike");
    for(var i in mike) {
      console.log(i, "=", mike[i]);
    }

    //
    // redefine for more testing
    //
    
    console.log("***********************\n\n");
    employees = [
      {name:"Jim1", department:"accounting"},
      {name:"Bill1", department:"engineering"},
      {name:"Mike1", department:"sales"},
      {name:"Jim2", department:"sales"},
      {name:"Bill2", department:"engineering"},
      {name:"Mike2", department:"engineering"},
      {name:"John", department:"sales"}
    ];
    
    employeeStore = new Memory( {data: employees, idProperty: "name" } );

    employeeStore.query({department: "sales"}, {
      sort: [{attribute: "name", descending: true}],
      start: 0,
      count: 2
    }).forEach(e => console.log(e));

  });
  