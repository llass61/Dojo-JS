define([
    'dojo/_base/declare',
    'dojo/on',
    'dojo/Deferred',
    'esri/map',
    "esri/geometry/webMercatorUtils",
    "dojo/dom",
    "services/mapservices",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/tasks/query",    
    "esri/Color",  
    "esri/toolbars/draw",
    "esri/map",
    'dijit/_WidgetBase',
    'dojo/_base/lang',
], function(declare, on, Deferred, Map, webMercatorUtils, 
            dom, mapservices,
            FeatureLayer, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol,
            Query, Color, Draw, map, _WidgetBase,
            lang) {
    'use strict';

    return declare([_WidgetBase], {
        
        constructor: function(ctrl){
            this.map = null; //ctrl.map;
            this.layers = null; //ctrl.layers;
            this.selectionToolbar = null;
            this.defaultSymbol = new SimpleMarkerSymbol().setColor(new Color([0,0,255]));
            this.highlightSymbol = new SimpleMarkerSymbol().setColor(new Color([255,0,0]));
            console.log("in selectFeatures constructor");
        },

        setMap: function(map, layers) {             
            this.map = map;
            this.layers = layers;
            this.initSelectToolbar(map);
        },

        doEdits: function(layers) {
            //let selectionToolbar = initSelectToolbar();
            console.log('doEdits');
            let fieldsSelectionSymbol =
                new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.5]));
            
            //let layers = mapservices.loadServices();
            // layers[0].setSelectionSymbol(fieldsSelectionSymbol);
            // layers[0].on("selection-complete", function() {
            //     console.log("selection-complete")
            // });
            // layers[0].on("selection-clear", function () {
            //     // dom.byId('messages').innerHTML = "<i>No Selected Fields</i>";
            //     console.log("selection-clear")
            // });
            // console.log('AAA: ' + layers);

            on(dojo.byId('select'), "click", 
                lang.hitch(this, function() {
                this.selectionToolbar.activate(Draw.EXTENT);
            }));
            on(dojo.byId('clear'), "click", 
                lang.hitch(this, function() {
                this.layers[0].clearSelection();
            }));

        },

        initSelectToolbar: function(map) {
            this.selectionToolbar = new Draw(map);
            var selectQuery = new Query();
            on(this.selectionToolbar, "DrawEnd", 
                lang.hitch(this, function (geometry) {
                    this.selectionToolbar.deactivate();
                    selectQuery.geometry = geometry;
                    this.map.graphics.clear();
                    
                    this.layers.forEach(
                        lang.hitch(this, function (layer){
                        console.log(layer);
                        var tmp = layer.selectFeatures(selectQuery,
                            FeatureLayer.SELECTION_NEW);
                        console.log("feature allowGeometryUpdates?");
                        console.log(layer.allowGeometryUpdates);
                        var tmp2 = layer.getSelectedFeatures();
                        tmp2.forEach( grphic => { 
                                                    let g = grphic.clone();
                                                    g.setSymbol(this.highlightSymbol);
                                                    this.map.graphics.add(g);
                        });
                    }));
                    // tmp = this.featureLayer.selectFeatures(selectQuery,
                    // FeatureLayer.SELECTION_NEW);
                    // console.log(this.featureLayer.allowGeometryUpdates);
                    // tmp2 = this.featureLayer.getSelectedFeatures();
            }));
        },

        // initSelectToolbar: function(map) {
        //     this.selectionToolbar = new Draw(map);
        //     var selectQuery = new Query();
        //     // let featureLayer = this.layers[0];
            
        //     on(this.selectionToolbar, "DrawEnd", 
        //         lang.hitch(this, function (geometry) {
        //         this.selectionToolbar.deactivate();
        //         selectQuery.geometry = geometry;
        //         // featureLayer.selectFeatures(
        //         //     selectQuery, FeatureLayer.SELECTION_NEW);
        //         this.findPointsInExtent(geometry);
        //     }));
        // },

        // //find all points within argument extent
        // findPointsInExtent: function(extent) {
        //     var results = [];
        //     //initialize symbology
        //     var defaultSymbol = new SimpleMarkerSymbol().setColor(new Color([0,0,255]));
        //     var highlightSymbol = new SimpleMarkerSymbol().setColor(new Color([255,0,0]));
            
        //     dojo.forEach(this.map.graphics.graphics,function(graphic){
        //         if (extent.contains(graphic.geometry)) {
        //             graphic.setSymbol(highlightSymbol);
        //             results.push(graphic.getContent());
        //         }
        //         //else if point was previously highlighted, reset its symbology
        //         else if (graphic.symbol == highlightSymbol) {
        //             graphic.setSymbol(defaultSymbol);
        //         }
        //     });
        // }
    });
    
});