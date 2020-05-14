define(["dojo/_base/declare"
    ],
    function (declare) {
        
        return declare(null, {

            constructor: function() {
                console.log("constructing");
            },

            sayHello: function(vars){
                console.log(`Hello ${vars}`);
            }

        });
    }
);
