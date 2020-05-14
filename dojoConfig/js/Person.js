// in "js/Person.js"
define(["dojo/_base/declare", "dojo/_base/lang"], function(declare, lang) {
    return declare(null, {
        name: "Anonymous",
        age: 57,
        residence: "Universe A",

        constructor: function( /*Object*/ kwArgs) {
            lang.mixin(this, kwArgs);
        },

        moveTo: function( /*String*/ residence) {
            this.residence = residence;
        }
    });
});
