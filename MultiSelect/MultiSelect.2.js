define([
    "esri/map", 
    "esri/toolbars/draw",
    "esri/graphic",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/Color",
    "esri/tasks/query",
    "dojo/dom",
    "dojo/on",
    "dojo/parser", 
    "dojo/_base/array",
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
              FeatureLayer, SimpleMarkerSymbol, SimpleLineSymbol, 
              SimpleFillSymbol, Color, Query, dom, on, parser, 
              arrayUtil, registry, declare, lang) {

        return declare(null, {

            constructor: function(map, featureLayer) {
                this.map = map;
                this.featureLayer = featureLayer;
                this.toolbar = null;
                this.selectionToolbar = null;

                this.fieldsSelectionSymbol =
                        new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                            new Color([255, 0, 0]), 2), 
                            new Color([255, 255, 0, 0.5]));
                
                // this.featureLayer.setSelectionSymbol(this.fieldsSelectionSymbol);
                
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

            initSelectToolbar: function() {
                this.selectionToolbar = new Draw(this.map);
                var selectQuery = new Query();
                on(this.selectionToolbar, "DrawEnd", 
                    lang.hitch(this, function (geometry) {
                        dojo.forEach(this.map.layers)
                        this.selectionToolbar.deactivate();
                        selectQuery.geometry = geometry;
                        tmp = this.featureLayer.selectFeatures(selectQuery,
                        FeatureLayer.SELECTION_NEW);
                        console.log(this.featureLayer.allowGeometryUpdates);
                        tmp2 = this.featureLayer.getSelectedFeatures();
                }));

                on(dom.byId("pt"), "click", 
                    lang.hitch(this, function() {
                    this.selectionToolbar.activate(Draw.EXTENT);
                }));
            },

            // initSelectToolbar: function() {
            //     this.selectionToolbar = new Draw(this.map);
            //     var selectQuery = new Query();
            //     on(this.selectionToolbar, "DrawEnd", 
            //         lang.hitch(this, function (geometry) {
            //             this.selectionToolbar.deactivate();
            //             selectQuery.geometry = geometry;
            //             tmp = this.featureLayer.selectFeatures(selectQuery,
            //             FeatureLayer.SELECTION_NEW);
            //             console.log(this.featureLayer.allowGeometryUpdates);
            //             tmp2 = this.featureLayer.getSelectedFeatures();
            //     }));

            //     on(dom.byId("pt"), "click", 
            //         lang.hitch(this, function() {
            //         this.selectionToolbar.activate(Draw.EXTENT);
            //     }));
            // },

            activateTool: function(evt) {
                let btn = dijit.registry.byId('pt');
                var tool = btn.label.toUpperCase().replace(/ /g, "_");
                this.toolbar.activate(Draw[tool]);
                this.map.hideZoomSlider();
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

            myFunc: function() {
                console.log("myFunc");
            }
        });
    });