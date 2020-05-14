// this will execute as soon as it is imported - it is an object value
// its value will propagate for all files loading, it does not create 
// a separate instance for each module that loads it.  Change it in one, 
// and all will see the change.
define({
    var1: "5",
    var2: "7",
});