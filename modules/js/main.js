
// have to use 'controllers' as defined in index.html doConfig package
// does not work with './js/controllers/mapcontroller'  - not sure why though

require([
    "dojo/parser",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "js/singleValueDefine.js",
    "js/objectDefine.js",
    "js/functionDefine.js",
    "js/newMod.js",
    "dijit/form/FilteringSelect",
    "dijit/form/Select",
    "dojox/grid/DataGrid",
    "dojo/domReady!"
], function(parser, Memory, ObjectStore, svd, objd, fd, nm) {
    // parser.parse();
    // console.log("in main");
    // console.log("single value define = " + svd);
    // console.log("obj value define:");
    // console.log(objd);
    
    fd.increment();
    console.log("main: " + fd.getValue());

    window.memStore = new Memory({
        idProperty: "label",
        data: [
            { label: 'foo', value: 'Foo', selected: true},
            { label: 'bar', value: 'Bar'}
        ]
    });
    
    window.osss = new ObjectStore({ objectStore: memStore });

    var sel = dijit.registry.byId('sel');
    // sel.store = memStore;

    var s = new dijit.form.Select({
        store: osss
    }, "target");
    s.startup();
});