define([
    "esri/map", 
    "esri/toolbars/draw",
    "esri/graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "dojo/parser", 
    "dijit/registry",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/layout/BorderContainer", 
    "dijit/layout/ContentPane", 
    "dijit/form/Button", 
    "dijit/WidgetSet", 
    "dojo/domReady!"
    ],
    function (Map, Draw, Graphic,
              SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol,
              parser, registry, declare, lang) {

        return declare(null, {

            constructor: function() {
                this.a = "5";
            },

            doIt: function() {
                console.log("in doIt:  " + this.a);
                this.doIt2();
            },

            doIt2: function() {
                console.log("in doIt2***:  " + this.a);
            }
        });
        
    });