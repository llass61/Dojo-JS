

define(["dojo/_base/kernel", 
        "dojo/_base/lang", 
        "dojo/_base/window", 
        "dojo/_base/declare",
        "dojo/on",
        "dojo/dom-construct",
        "dijit/popup",
        "dijit/TooltipDialog",
        "esri/tasks/QueryTask", 
        "esri/tasks/query", 
        "esri/tasks/Geoprocessor", 
        "esri/geometry/screenUtils",
        "esri/Color",
        "dojo/domReady!",
],
	function (
        kernel, lang, winUtil, declare, on, domConstruct,
        Popup, TooltipDialog, QueryTask, Query, 
        Geoprocessor, screenUtils, Color) { 

	    return dojo.declare("gs.outageAnalyzer", null, {
	        constructor: function (gsobj, layer, svc, params) {
	            this.service = svc;
	            this.state = 'uninitiated';
	            this.gpJob = null;
				this.sde = null;
                this.pfx = null;
                this.excludeGids= ['43'];
	            this.gp = null;
	            this.jobManager = null;

	            this.gs = gsobj;
                this.outageLayer= layer;
                
                // this.outagePathLayer = new esri.layers.GraphicsLayer({opacity: 0.7});
                // this.outageLayer = new esri.layers.GraphicsLayer({opacity: 0.7});

                this.currentSet = this.gs.layers.map(function () { return [] });
                this.outageLoadsByCircuit = {};
                this.sharedOutagePathByCircuit= [];
                this.allFeaturesByCircuit = {};
	            this.sourcePath = null;
	            this.getLayerIndex = null;
	            this.startWaitFunc = null;
	            this.stopWaitFunc = null;
	            // this.outLine = null;
	            // this.outMarker = null;
	            // this.outPathMarker = null;
	            // this.outPathLine = null;
	            // this.outProthMarker = null;
                this.outageMeterList = [];
                // How to merge paths to source: circ: by circuit, dev1: by first protection device
	            this.groupMode = 'circ';
                
                this.dangerMarker = {url: "img/symb/elec-red.svg", h: 109, w: 97};
                this.vOpacity = 1;
                this.ratio = .5;
                this.scale = .5;
                // #ff0000 (dark red)
                this.outageLoadColor = new Color([153, 0, 0, this.vOpacity]);
                // #ffb866  (light orange)
                this.outagePathColor = new esri.Color([255, 184, 102, this.vOpacity]);
                // #ff0000 (red)
                this.outageFirstSectionalizerColor = new esri.Color([255, 0, 0, this.vOpacity]);
                // #cc6d00 (darker orange)
                this.outageSectionalizerColor = new esri.Color([204, 109, 0, this.vOpacity]);

                this.outagePath = new esri.symbol.CartographicLineSymbol(
                    "solid",
                    this.outagePathColor,
                    10, 
                    "round", "round");
                
                this.outageLoads = new esri.symbol.SimpleMarkerSymbol(
                    esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,
                    20, 
                    new esri.symbol.CartographicLineSymbol(esri.symbol.CartographicLineSymbol.STYLE_SOLID, 
                                                           this.outageLoadColor, 10, "round", "round"), 
                    this.outageLoadColor);

                this.outFirstSectionalizer = new esri.symbol.SimpleMarkerSymbol(
                    esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 
                    20, 
                    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, 
                                                     this.outageFirstSectionalizerColor), 
                    this.outageFirstSectionalizerColor);

                this.outSectionalizer = new esri.symbol.SimpleMarkerSymbol(
                    esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND,
                    20, 
                    new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, 
                                                     this.outageSectionalizerColor), 
                    this.outageSectionalizerColor);
                
                // inline functions
                this.msgFunc = function (msg) { console.log('Outage Analyzer: ', msg);};

                // this.dangerMarker = {url: "img/symb/elec-red.svg", h: 109, w: 97};
                // this.scale = gs.state.oa.markerScale, ratio = gs.state.oa.markerRatio;
                // this.outColor = new esri.Color([187, 0, 0, vOpacity])
                // this.outLine = new esri.symbol.CartographicLineSymbol("solid", outColor, 10, "round", "round");
                // this.outPathLine = new esri.symbol.CartographicLineSymbol("solid", outColor, 15, "round", "round");
                // this.outMarker = new esri.symbol.SimpleMarkerSymbol("square", 20, outLine, outColor);
                // this.outPathMarker = new esri.symbol.PictureMarkerSymbol(dangerMarker.url, Math.round(scale * ratio * dangerMarker.h), Math.round(scale * ratio * dangerMarker.w));
                // this.outProthMarker = new esri.symbol.PictureMarkerSymbol(dangerMarker.url, Math.round(scale * dangerMarker.h), Math.round(scale * dangerMarker.w));
                
                this.overageTooltipDialog = new TooltipDialog({
                    id: "tooltipDialog",
                });
                this.overageTooltipDialog.startup();

                // defaults
                this.outageTooltipZommLevel = 13;
                this.isTooltipDiplayed = false;

                this.protPath = [];
                this.SECTIONALIZER_OUTAGE_THRESHOLD = 80;
                this.toolTipTimeout = null;
            },

	        isProtectionDev: function (f) { 
                if (f.attributes.otype === "breaker" ||
                    f.attributes.otype === "fuse" ||
                    f.attributes.otype === "sectionalizer" ||
                    f.attributes.otype === "recloser" || 
                    f.attributes.otype === "source")
                      return true;
                else
                      return false; 
            },

	        linkify: function(s){return s},
	        _validateSymbols: function(){
	            return true; //this.outLine && this.outMarker && this.outPathMarker && this.outPathLine && this.outProthMarker;
	        },

	        redrawCurrentOutageSet: function() {
	            if (this._validateSymbols()) {
	                // this.outageLayer.clear();
	                this.currentSet.forEach(lang.hitch(this, l => {
	                    l.forEach(lang.hitch(this, f => {
	                        //f._layer = this.gs.assetsLayer;
	                        f.setSymbol(f.geometry.type === 'polyline' ? this.outagePath : this.outageLoads);
	                        this.outageLayer.add(f);
	                    }));
	                }));
	            } else { console.log('Outage Analyzer Error: Symbols are not set correctly.'); }
            },

	        toggleInclusionInOutageList: function (fs) {
	            if (this._validateSymbols()) {
	                var f = fs || lastSelFeat;
	                var li = this.getLayerIndex(f);
	                if (li !== null && li >= 0) {
	                    console.log('Feature ', f, 'marked for toggling.');
	                    var ex = this.currentSet[li].filter(function (fi) { return f.attributes.objectid === fi.attributes.objectid; });
	                    if (ex.length > 0) {
	                        console.log('Feature already marked as outage, removing.');
	                        this.currentSet[li] = this.currentSet[li].filter(function (fi) { return fi.attributes.objectid !== f.attributes.objectid; });
	                        this.outageLayer.remove(ex[0]);
	                    } else {
	                        console.log('Feature not marked as outage, adding.');
	                        this.currentSet[li].push(f);
	                        f._layer = this.gs.assetsLayer;
	                        f.setSymbol(f.geometry.type === 'polyline' ? this.outagePath : this.outageLoads);
	                        this.outageLayer.add(f);
	                    }
	                }
	            } else { console.log('Outage Analyzer Error: Symbols are not set correctly.');}

	        },

	        clearCurrentOutageSet: function () {
	            this.clearCurrentOutagePaths();
                this.currentSet.forEach(lang.hitch(this, function (l) { l.forEach(lang.hitch(this, function (f) { this.outageLayer.remove(f); })); }));
                this.currentSet = this.gs.layers.map(function () { return []; });
                this.sharedOutagePathByCircuit = [];
            },


            clearCurrentOutagePaths: function(){
                this.outageLayer.clear();
                if (this._validateSymbols()) {
                    this.currentSet.forEach(lang.hitch(this, function (l) {
                        l.forEach(lang.hitch(this, function (f) {
                            f.setSymbol(f.geometry.type === 'polyline' ? this.outagePath : this.outageLoads);
                            this.outageLayer.add(f);
                        }));
                })); } else { console.log('Outage Analyzer Error: Symbols are not set correctly.');}

            },

            highlightCurrentOutagePaths: function () {
                this.outageLayer.clear();

                on(this.outageLayer, "mouse-over", lang.hitch(this, (evt) => {
                    if (evt.graphic.hasOwnProperty('totLoads') && gs.map.getLevel() > 13) {
                        
                        this.toolTipTimeout = 
                            setTimeout( lang.hitch( () => {
                                console.log("hovering for: " + evt.graphic.outageLoadCnt);                            

                                // console.log("Zoom-level = " + gs.map.getLevel());
                                let content = 
                                    "<pre>" + 
                                        "Outage Loads: " + evt.graphic.outageLoadCnt + "/" +
                                                        evt.graphic.totLoads + "</pre>";
                                this.overageTooltipDialog.setContent(content);
                                // let sc = screenUtils.toScreenGeometry(gs.map.extent, gs.map.width, gs.map.height, evt.graphic.geometry);
                                
                                Popup.open({
                                    popup: this.overageTooltipDialog,
                                    x: evt.x,
                                    y: evt.y
                                });
                            }), 1000);
                    }
                }));

                on(this.outageLayer, "mouse-out", lang.hitch(this, (evt) => {
                    if (evt.graphic.hasOwnProperty('totLoads')) {
                        clearTimeout(this.toolTipTimeout);
                        Popup.close(this.overageTooltipDialog);
                    }
                }));

                if (this._validateSymbols()) {

                    // for each circuit
                    Object.keys(this.outageLoadsByCircuit).forEach( circ => {

                        let addOutagePaths = new Set();
                        let addOutageLoads = new Set();
                        let addOutageSectionalizers = new Set();
                        let addOutageFirstSectionalizers = new Set();
                        let addOutageSectionalizersHighConfidence = null;
                        
                        // only need Loads - rest should be empty
                        this.outageLoadsByCircuit[circ][0].forEach( fs => {

                            // special highlight those sectionalizers that
                            // meet confidence level.  Only highlight highest one 
                            // that is on outage path.
                            let outageProtDev = null;

                            // add as outage load
                            addOutageLoads.add(fs);

                            // find first protection device for feature
                            let firstProcDev = this.findLastProt(fs.path);

                            // if protection device is not found, then highlight entire
                            // path from load to source.  If found, we do not highlight
                            // the path from load to first protection device, need to set
                            // later.
                            let highlightPath = (firstProcDev ? false : true);

                            // start from customer load and work way up to source
                            // have to reverse the path for each feature
                            fs.path.slice().reverse().forEach(lang.hitch(this, (f) => {
                                let outageRatio = 0;

                                // only highlight path past the first protection device 
                                if (f.geometry.type === 'polyline' && highlightPath) {
                                    addOutagePaths.add(f);
                                }

                                else if (f.geometry.type !== 'polyline') {
                                    
                                    // only process protection devices for outage path
                                    if (this.isProtectionDev(f)) {
                                        
                                        // add to protection device cnt
                                        // if (f.hasOwnProperty('outageLoadCnt')) 
                                        //     f.outageLoadCnt++;
                                        // else
                                        //     f.outageLoadCnt = 1;
                                        
                                        // the color for first protection device is different
                                        if (firstProcDev &&  
                                            f.attributes.secname == firstProcDev.attributes.secname) {
                                            
                                            highlightPath = true;
                                            // addOutageFirstSectionalizers.add(f);
                                        }
                                        // else {
                                        //     addOutageSectionalizers.add(f);
                                        // }

                                        outageRatio = f.outageLoadCnt / f.totLoads * 100;
                                        if (outageRatio >= this.SECTIONALIZER_OUTAGE_THRESHOLD) {
                                            // 
                                            if (addOutageSectionalizersHighConfidence) {
                                                addOutageSectionalizers.add(addOutageSectionalizersHighConfidence);
                                            }
                                            addOutageSectionalizersHighConfidence = f;
                                        }
                                        else {
                                            addOutageSectionalizers.add(f);
                                        }
                                    }
                                }

                            }));
                        });
                            
                        // now add - had to separate adds so protection devices show on top of paths
                        addOutagePaths.forEach(lang.hitch(this,  f => {
                            f.setSymbol(this.outagePath);
                            this.outageLayer.add(f);
                        }));

                        // redraw the loads so they are on top of Path!
                        this.redrawCurrentOutageSet();

                        addOutageSectionalizers.forEach(lang.hitch(this,  f => {
                            f.totLoads = getNumLoadsDownLine(f.attributes.secname, 
                                                            this.allFeaturesByCircuit[f.attributes.circuit]);
                            f.setSymbol(this.outSectionalizer);
                            this.outageLayer.add(f);
                            
                        }));

                        if (addOutageSectionalizersHighConfidence) {
                            addOutageSectionalizersHighConfidence.setSymbol(this.outFirstSectionalizer);
                            this.outageLayer.add(addOutageSectionalizersHighConfidence);
                        }

                        // addOutageFirstSectionalizers.forEach(lang.hitch(this,  f => {
                        //     // f.totLoads = getNumLoadsDownLine(f.attributes.secname, 
                        //     //                                  this.allFeaturesByCircuit[f.attributes.circuit]);
                        //     f.setSymbol(this.outFirstSectionalizer);
                        //     this.outageLayer.add(f);
                        // }));
                    });

                    // clean up - remove all sectionalizers that are in firstSectionalizers
                    // addOutageFirstSectionalizers.forEach(lang.hitch(this,  f => {
                    //     if (addOutageSectionalizers.has(f))
                    //         addOutageSectionalizers.delete(f);
                    // }));

                } 
                else { 
                    console.log('Outage Analyzer Error: Symbols are not set correctly.'); 
                }
            },

            printCurrentOutagePaths: function () {
                this.sharedOutagePathByCircuit.forEach(function (p, pi) {
                    this.msgFunc("Path index: " + pi);
                    p.forEach(function (f) {
                        f && f.attributes && this.msgFunc(f.attributes.secname);
                    }, this);
                }, this);
            },

            findLastProt: function(path) {
                var p = null;
                // path.forEach(lang.hitch(this, function (f) { if (this.isProtectionDev(f)) p = f; }));
                
                let pathReversed = path.slice().reverse();
                for (let i = 0; i < pathReversed.length; i++) {
                    if (this.isProtectionDev(pathReversed[i])) {
                        p = pathReversed[i];
                        break;
                    }
                }
                return p;
            },

            groupOutagesByCircuit: function() {
                this.outageLoadsByCircuit = {};

                // each feature type ('Loads', 'Equipment', ...)
                for (let i = 0; i < this.currentSet.length; i++) {
                    
                    let features = this.currentSet[i];
                    for (let j = 0; j < features.length; j++) {

                        let circ = features[j].attributes['circuit'];
                        if (! (circ in this.outageLoadsByCircuit)) {
                            this.outageLoadsByCircuit[circ] = this.currentSet.map(function () { return []; });
                        }
                        this.outageLoadsByCircuit[circ][i].push(features[j]);
                    }
                }
            },

            findOutagePath: function(makeSelection) {
                makeSelection = makeSelection || false;
                this.clearCurrentOutagePaths();
                this.sharedOutagePathByCircuit= [];
                if (this.startWaitFunc) this.startWaitFunc();
                console.log('Finding outage paths for set', this.currentSet);
                var circs = [], cfgs = [];
                this.groupOutagesByCircuit();
                
                if (Object.keys(this.outageLoadsByCircuit).length === 0) {
                    console.log('Empty outage circuit set.');
                    this.msgFunc('Outage Analysis: Empty outage set.', 'warning');
                    if (this.stopWaitFunc) this.stopWaitFunc();
                    if(dojo.byId('msgTitlePanes').innerHTML == 0)
                        {
                           dojo.byId('msgTitlePanes').innerHTML = ''; 
                        }
                    return;
                }
            
                all(Object.keys(this.outageLoadsByCircuit).map(lang.hitch(this, function (circ) {
                    console.log('Finding outage path on circuit ', circ, ' set: ', this.outageLoadsByCircuit[circ]);
                    var q = new Query();
                    q.returnGeometry = true;
                    q.outSpatialReference = this.gs.map.spatialReference;
                    //q.where = "circuit in ('" + circs.join("','") + "')";
                    q.where = "circuit ='" + circ + "'";
                    q.outFields = ['objectid', 'secname', 'parentsec', 'otype', 'circuit'];

                    return all(this.gs.layers.map(lang.hitch(this, function (ln, i) {
                        if (ln !== 'Poles') {
                            var qt = new QueryTask(this.gs.mapService + "/" + this.gs.layInds[ln]);
                            return qt.execute(q);
                        } else { return null;}
                    }))).then(lang.hitch(this, function (r) {
                        
                        var allFs = merge(r.map(function (fs) { return fs ? fs.features : []; }));

                        // create 'children' property - has all children of an element used for
                        // counting number of loads downstream
                        setChildrenForEachFeature(allFs);
                        this.allFeaturesByCircuit[circ] = allFs;

                        // create a 'path' property and total/Outage cnts for each outage.
                        this.outageLoadsByCircuit[circ].forEach(lang.hitch(this, function (l) {
                            l.forEach(lang.hitch(this, function (f) { 
                                
                                // create path property.  Contains the path of secnames from source to outage
                                f.path = this.sourcePath(f, allFs).reverse();
                                
                                // now lets create each protection device's cnt of
                                // outage loads and total loads
                                f.path.forEach(lang.hitch(this, pathFeat => {
                                    
                                    if (this.isProtectionDev(pathFeat)) {
                                        
                                        // add to protection device cnt
                                        if (pathFeat.hasOwnProperty('outageLoadCnt')) {
                                            pathFeat.outageLoadCnt++;
                                        } 
                                        else {
                                            pathFeat.outageLoadCnt = 1;
                                        }
                                        
                                        // only get sectionalizer total loads if not set
                                        if (! pathFeat.hasOwnProperty('totLoads')) {
                                            pathFeat.totLoads = getNumLoadsDownLine(pathFeat.attributes.secname, allFs);
                                        }
                                    }
                                }));
                            }));
                        }));

                        // Now merge paths
                        if(dojo.byId('msgTitlePanes').innerHTML == 0)
                        {
                           dojo.byId('msgTitlePanes').innerHTML = ''; 
                        }
                        console.log('Grouping paths. Group mode: ', this.groupMode);
                        var paths = [];
                        if (this.groupMode === 'circ') {
                            this.msgFunc('Outage Analysis: Grouping outages by circuit.', 'info');
                            var path = [], els = [], i = 0;
                            while (true) {
                                els = unique(merge(this.outageLoadsByCircuit[circ].map(function (l) {
                                    return l.map(function (f) { 
                                        return (typeof f.path !== 'undefined' && f.path.length) > i ? f.path[i] : null; }).filter(function (it) { 
                                            return it ? true : false; });
                                })));
                                //console.log('i, els ', i, els);
                                if (els.length !== 1 || !els[0]) { break; }
                                else {
                                    path.push(els[0]);
                                    i += 1;
                                }
                            }
                            console.log('shared path: ', path);
                            paths.push(path);
                            this.sharedOutagePathByCircuit.push(path);
                            var firstDsProt = this.findLastProt(path);
                            if (firstDsProt) {
                                this.msgFunc('Outage Analysis: First common protection devices on circuit ' + circ + ' is ' + this.linkify(firstDsProt.attributes.secname), 'info');
                            } else {
                                this.msgFunc('Outage Analysis: No common protection device found, circuit: ' + circ + '.', 'info');
                            }
                        } else if (this.groupMode === 'dev1') {
                            this.msgFunc('Outage Analysis: Grouping outages by their immidiate protection device.', 'info');
                            if(dojo.byId('msgTitlePanes').innerHTML == 0)
                        {
                           dojo.byId('msgTitlePanes').innerHTML = ''; 
                        }
                            devs = [];
                            this.outageLoadsByCircuit[circ].forEach(lang.hitch(this, function (l) {
                                l.forEach(lang.hitch(this, function (f) {
                                    f.dev = (f.path && f.path.length > 0) ? this.findLastProt(f.path) : null;
                                    if (f.dev && devs.indexOf(f.dev) < 0) {
                                        devs.push(f.dev);
                                        path = f.path.slice(0, f.path.indexOf(f.dev) + 1);
                                        paths.push(path);
                                        this.currentPaths.push(path);
                                        this.msgFunc('Outage Analysis: Potential immidiate protection device out: circuit ' + circ + ', device: ' + this.linkify(f.dev.attributes.secname), 'info');
                                    }
                                }));
                            }));

                        } else {
                            console.log("Invalid grouping method.");
                        }
                        if(dojo.byId('msgTitlePanes').innerHTML == 0)
                        {
                           dojo.byId('msgTitlePanes').innerHTML = ''; 
                        }
                        return paths;
                    }));
                }))).then(lang.hitch(this, function (ps) {
                    console.log('All paths resolved...', ps);
                    this.highlightCurrentOutagePaths();
                    if (this.stopWaitFunc) this.stopWaitFunc();
                }), lang.hitch(this, function (e) {
                    console.log('Error finding outage paths.');
                    this.msgFunc('Outage Analysis: Error in finding outage paths.', 'error');
                    if (this.stopWaitFunc) this.stopWaitFunc();
                }));
            },
            // change

            getOutageCustomers: function(){
               // dojo.byId('msgTitlePanes').innerHTML = this.outageMeterList.length;
                if (this.outageMeterList && this.outageMeterList.length > 0) {
                    var q = new Query();
                    q.returnGeometry = true;
                    q.outSpatialReference = this.gs.map.spatialReference;
                    q.where = "meter_num in ('" + this.outageMeterList.join("','") + "')";
                    q.outFields = ['*'];
                    var qt = new QueryTask(this.gs.mapService + "/" + this.gs.layInds['Loads']);
                    return qt.execute(q).then(lang.hitch(this, function (fs) {
                        if(fs && typeof fs.features !== 'undefined' && fs.features.length > 0){
                            this.clearCurrentOutageSet();
                            fs.features.forEach(lang.hitch(this, function (f) {
                                f.layer = 'Loads';
                                f._layer = this.gs.assetsLayer;
                                this.toggleInclusionInOutageList(f);
                            }));
                        }
                    }));
                } else { return null;}
            },

            getOutageMeters: function () {
                //dojo.byId('msgTitlePanes').innerHTML = this.outageMeterList.length;  
                this.gp = new Geoprocessor(this.service);
                var params = {'sde': this.sde, 'pfx': this.pfx, 'operation': 'list', 'opts': '{"excludeGids": ["'+this.excludeGids.join('","')+'"]}' };
                console.log("Outage Analysis: listing outage meters started... Parameters: ", params);
                this.state = 'active';
                this.results = null;
                if (this.startWaitFunc) this.startWaitFunc();
                //add the job to jobManager
                //run GP job
                this.gp.submitJob(params, lang.hitch(this, this.completeCallback), lang.hitch(this, this.statusCallback), lang.hitch(this, this.errorCallback));
            },

            cancel: function () {
                console.log("Outage Analysis: Cancelling outage meter list...");
                if (this.state === 'active') {
                    this.state = 'canceled';
                    this.gp.cancelJob(this.gpJob.jobId, lang.hitch(this, this.cancelCompleteCallback), lang.hitch(this, this.cancelErrorCallback));
                } else {
                    console.log("No active backup job");
                }
            },
            
            statusCallback: function (jobInfo) {
                var mc = (this.gpJob) ? this.gpJob.messages.length : 0;
                if (mc !== jobInfo.messages.length) {
                    for (var i = mc; i < jobInfo.messages.length; i++) {
                        this.postMessage(jobInfo.messages[i]);
                    }
                }
                if (!this.gpJob || this.gpJob.jobStatus !== jobInfo.jobStatus) {
                    console.log(jobInfo.jobStatus);
                }
                this.gpJob = jobInfo;
            },

            completeCallback: function (jobInfo) {
                this.parseGpCompletionMessage(jobInfo);
                if (this.stopWaitFunc) this.stopWaitFunc();
                this.gpJob = jobInfo;
                if (this.state === 'active') {
                    this.state = 'gettingresults';
                    this.gp.getResultData(jobInfo.jobId, "output", lang.hitch(this, function (result, messages) {
                        this.results = result;
                        // this.outageMeterList = [];
                        let outageDesc = "Outage Meters: ";
                        this.state = 'done';
                        console.log("Outage analysis list outage meters complete.", result);
                        if (typeof this.results.value !== 'undefined') {

                            this.outageMeterList = this.results.value !== "" ? this.results.value : [];
                            // testing
                            // this.outageMeterList.push.apply(this.outageMeterList(['139757989', '145412976', '136591591']);
                            // this.outageMeterList.push.apply(this.outageMeterList, 
                            //                         ['92082611','140260879','133358503','135824765',
                            //                         '140260523','140260849','139757973','140260837',
                            //                         '138029534','140260863','140260851','140260522',
                            //                         '140260877','143057128','140260853','134555561',
                            //                         '139757987','140260856','139757971','140260850',
                            //                         '139757972','139757989','140260878','140260911',
                            //                         '140260846','140260880','135177576','140260864',
                            //                         '140260847','140260854','134555617','136591459',
                            //                         '140260862','138363370','143964547','144327247',
                            //                         '140260521','139757974','135824364','140260861',
                            //                         '140260845','135991995','140260852','140260524']);
                            if (this.postMessage) {
                                
                                // when no meters returned
                                if (this.outageMeterList.length == 0) {
                                    outageDesc += "No outage meters returned";
                                }
                                else {
                                    outageDesc += this.outageMeterList.join(', ');
                                }

                                this.postMessage({
                                    type: 'esriJobMessageTypeInformative',
                                    description: outageDesc
                                });
                            }
                        }
                        // dojo.byId('msgTitlePanes').innerHTML = '';
                        this.msgFunc(outageDesc + '.');
                        if(dojo.byId('msgTitlePanes').innerHTML == 0)
                        {
                           dojo.byId('msgTitlePanes').innerHTML = ''; 
                        }
                        this.getOutageCustomers();
                        //if (this.postSync) { this.postSync(); }
                    }));
                } else { }
                console.log("Outage analysis list outage meters job complete; requesting results...", jobInfo);
            },

            errorCallback: function (jobInfo) {
                console.log("Outage analysis list outage meters failed.", jobInfo);
                this.msgFunc("Outage analysis list outage meters failed.", jobInfo);
                this.state = 'error';
                this.parseGpCompletionMessage(jobInfo);
                if (this.stopWaitFunc) this.stopWaitFunc();
                this.gpJob = jobInfo;
            },

            postMessage: function (msg) {
                console.log("Outage analysis, List outage meters: " + msg.type + " : " + msg.description);
            },

            parseGpCompletionMessage: function (jobInfo) {
                if (jobInfo.jobStatus === 'esriJobCancelled' || jobInfo.jobStatus === 'esriJobCancelling') {
                    console.log("Outage analysis list OD meters completed (cancelled).");
                    this.msgFunc("Outage analysis list OD meters completed (cancelled).");
                } else if (jobInfo.jobStatus === 'esriJobSucceeded') {
                    console.log("Outage analysis list OD meters completed (cancelled).");
                    this.msgFunc("Outage analysis list OD meters completed successfully.");
                } else {
                    console.log("Outage analysis list OD meters completed (cancelled).");
                    this.msgFunc("Outage analysis list OD meters completed with status: " + jobInfo.jobStatus);
                }
            },

            cancelCompleteCallback: function (jobInfo) {
                console.log("Customers sync cancelled successfully. Status: " + jobInfo.jobStatus);
            },

            cancelErrorCallback: function (jobInfo) {
                console.log("Customers sync cancellation failed.");
            },
            /*
            uploadSucceeded: function (response) {
                this.customersFile = response["item"];
                if (this.stopWaitFuncUpload) this.stopWaitFuncUpload();
                console.log('File uploaded successfully, item ID:', this.customersFile.itemID);
            },

            uploadFailed: function (jobInfo) {
                console.log('Upload failed: ', jobInfo);
                this.customersFile = null;
                if (this.stopWaitFuncUpload) this.stopWaitFuncUpload();
            },
            */
	        postCreate: function () {
	            this.inherited(arguments);
	            console.log('Outage analysis post create...');
	        },

	    });
	});