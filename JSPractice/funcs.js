
function myFunc() {

    let var1 = 5;
    let var2 = 10;

    return {
        getVar1: function() { return var1; },
        setVar1: function(v1) { var1 = v1 },
        getVar2: function() { return var2; }
    }
}

f = myFunc();
f2 = myFunc();

f.setVar1(3);
v = f.getVar1();
console.log(f.getVar1(), f2.getVar1());

f3 = myFunc().getVar1;
console.log(f3());

console.log("Finished");