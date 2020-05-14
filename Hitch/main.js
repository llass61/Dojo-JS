require([
    "dojo/domReady!"
], function(MapCtrl, mapServices, on) {
    
    function newFunc(){
        console.log("In newFunc");
    }

    var obj = {
        foo: "bar",
        handler: function(evt){
            console.log(`foo = ${this.foo}`);
        }
    }
    obj.foo2 = "bar2";
    console.log(`foo2 = ${obj.foo2}`);
    newFunc();
    var nfunc = newFunc;
    nfunc.foo = "bar";
    console.log(nfunc.foo);

    // losing 'this'
    var f = obj.handler;
    f(); // foo = undefined!

    // we can use a closure.  This will include the outer environment
    

    var btn1 = dojo.byId("btn1");
    var btn2 = dojo.byId("btn2");
    var btn3 = dojo.byId("btn3");

    btn1.onclick = obj.handler;
    btn2.onclick = function (evt){ return obj.handler.call(obj, evt);};
    btn3.onclick = dojo.hitch(obj, obj.handler);
    console.log("");
});