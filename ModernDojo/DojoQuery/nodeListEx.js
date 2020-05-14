require([
    "dojo/query",
    "dojo/dom-class",
    "dojo/NodeList-dom",
    "dojo/domReady!"],
    function(query,domClass) {

    query(".odd").forEach( function(node, index, nodelist) {
        domClass.add(node,"red");

    // using NodeList-dom extension
    query(".even").addClass("blue");

    query(".even").toggleClass("even");

    // empties the list id (everything under id="list"
    // query("#list").empty();
    });
});