function sleep(numberMillis) { 
    var now = new Date(); 
    var exitTime = now.getTime() + numberMillis; 
    while (true) { 
        now = new Date(); 
        if (now.getTime() > exitTime) 
            return; 
    } 
} 
 
let user = {
    firstName: "John",
    sayHi() {
        console.log(`Hello, ${this.firstName}`);
    }
};

function func() {
    console.log(`in func: ${user.firstName}`);
}

console.log(user.sayHi());

// losing 'this'
console.log("losing this");
setTimeout(user.sayHi,1);

// fix by wrapper (closure).  A closure includes the outer environment context
console.log("fix with closure");
setTimeout(function (){user.sayHi()}, 1);

// Possible bug, can change the value before timmer fires!
//   fix by wrapper (closure).  A closure includes the outer environment context
console.log("possible bug, can change");
setTimeout(function (){user.sayHi()}, 1);
user.firstName = "Changed Name";
user.firstName = "John";

// javascript solution (dojo provides hitch)
// use 'bind' to bind the function to an object context
// console.log("using bind");
// let sayHi = user.sayHi.bind(user);
// sayHi();
// user.firstName = "changed";
// sayHi();

// try rebinding
let sayHi2 = user.sayHi.bind({firstName: 'Larry'});
sayHi2();
