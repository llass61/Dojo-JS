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

            constructor: function(map) {
                this.map = map;
                this.toolbar = null;
                console.log("HI");
            },

            createToolbar: function() {
                this.toolbar = new Draw(this.map);
                this.toolbar.on("draw-end", lang.hitch(this, this.addToMap));

                registry.forEach(lang.hitch(this, function(d) {
					// d is a reference to a dijit
					// could be a layout container or a button
					if ( d.declaredClass === "dijit.form.Button" ) {
                        d.on("click", lang.hitch(this, "activateTool"));
					}
				}));
            },

            addToMap: function(evt){
                let symbol;
                this.toolbar.deactivate();
                this.map.showZoomSlider();
                switch (evt.geometry.type) {
                  case "point":
                  case "multipoint":
                    symbol = new SimpleMarkerSymbol();
                    break;
                  case "polyline":
                    symbol = new SimpleLineSymbol();
                    break;
                  default:
                    symbol = new SimpleFillSymbol();
                    break;
                }
                var graphic = new Graphic(evt.geometry, symbol);
                this.map.graphics.add(graphic);
            },

            activateTool: function(evt) {
                let btn = dijit.registry.byId('pt');
                var tool = btn.label.toUpperCase().replace(/ /g, "_");
                this.toolbar.activate(Draw[tool]);
                this.map.hideZoomSlider();
            },

            myFunc: function() {
                console.log("myFunc");
            }
        });
    });