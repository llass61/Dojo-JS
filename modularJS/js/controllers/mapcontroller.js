define([
    'dojo/_base/declare',
    'dojo/on',
    'dojo/Deferred',
    'esri/map',
    "esri/geometry/webMercatorUtils",
    'esri/layers/FeatureLayer',
    "dojo/dom",
    'dijit/_WidgetBase'
], function(declare, on, Deferred, Map, webMercatorUtils, FeatureLayer, dom, _WidgetBase) {
    'use strict';

    return declare([_WidgetBase], {
        
        constructor: function(args){
            console.log("in constructor");
            this.layers = args.layers;
        },

        load: function() {
            var deferred = new Deferred();
            var map = new Map(this.get('elem'), this.get('mapOptions'));

            on.once(map, 'layers-add-result', function() {
                deferred.resolve(map);
            });

            on(map, 'extent-change', function (evt) {
                var extent = evt.extent;
                var s = "";
                s = "XMin: "+ extent.xmin.toFixed(2) + " "
                   +"YMin: " + extent.ymin.toFixed(2) + " "
                   +"XMax: " + extent.xmax.toFixed(2) + " "
                   +"YMax: " + extent.ymax.toFixed(2);
                dojo.byId("info").innerHTML = s;
            });

            // map.on("load", function() {
                
            // });

            // map.on("mouse-move", doIt);
            on(map, 'click', function(evt){
                //the map is in web mercator but display coordinates in geographic (lat, long)
                let mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
                //display mouse coordinates
                dojo.byId("info").innerHTML = mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
            })

            // function doIt(evt) {
            //     //the map is in web mercator but display coordinates in geographic (lat, long)
            //     let mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
            //     //display mouse coordinates
            //     dom.byId("info").innerHTML = mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
            // }

            this.set('layers', [
                new FeatureLayer('http://localhost:6080/arcgis/rest/services/eneri/MapServer/5'),
                new FeatureLayer('http://localhost:6080/arcgis/rest/services/eneri/MapServer/6')
            ]);
            // map.addLayers(new FeatureLayer('http://localhost:6080/arcgis/rest/services/eneri/MapServer/5'));
            map.addLayers(this.get('layers'));
            this.set('map', map);

            return deferred.promise;
        }
    })
    
});