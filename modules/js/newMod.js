require([
    "dojo/parser",
    "js/singleValueDefine.js",
    "js/objectDefine.js",
    "js/functionDefine.js",
    "dojo/domReady!"
], function(parser, svd, objd, fd) {
    parser.parse();
    console.log("in newMod");
    console.log("newMod: single value define = " + svd);
    console.log("newMod: obj value define:");
    console.log(objd);
    console.log("newMod changeing values");
    objd.var1 = "99"
    objd.var2 = "-37"
    console.log(objd);

    // also changing single value define/ will have no effect
    // its a single value so if you change its value, you change
    // its location.  Unlike an object, you can change the interval
    // values of an object and the object location stays the same.
    svd = "-1000";

    // function define
    fd.increment();
    fd.increment();
    fd.increment();
    console.log("newMod: " + fd.getValue());
});