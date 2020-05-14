
require([
    "dojo/dom",
    "dojo/query",
    "dojo/domReady!",
], function (dom,query) {

    var list = query("li.odd a.odd");
    console.log(list);
    console.log(dom.byId("list"));
});