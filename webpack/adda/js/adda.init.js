window.LOAD_OTYPES = ['residential', 'smallconsumer', 'largeconsumer', 'load'];
window.LINE_OTYPES = ['oh', 'ug'];
window.PROT_OTYPES = ['breaker', 'fuse', 'recloser', 'sectionalizer'];
window.EQ_OTYPES = ['source', 'transformer', 'regulator', 'capacitor', 'motor', 'generator'].concat(PROT_OTYPES);
window.PHASES = ['A', 'B', 'C', 'AB', 'AC', 'BC', 'ABC'];

window.lods = [
    {level: 0, resolution: 156543.033928, scale: 591657527.591555},
    {level: 1, resolution: 78271.5169639999, scale: 295828763.795777},
    {level: 2, resolution: 39135.7584820001, scale: 147914381.897889},
    {level: 3, resolution: 19567.8792409999, scale: 73957190.948944},
    {level: 4, resolution: 9783.93962049996, scale: 36978595.474472},
    {level: 5, resolution: 4891.96981024998, scale: 18489297.737236},
    {level: 6, resolution: 2445.98490512499, scale: 9244648.868618},
    {level: 7, resolution: 1222.99245256249, scale: 4622324.434309},
    {level: 8, resolution: 611.49622628138, scale: 2311162.217155},
    {level: 9, resolution: 305.748113140558, scale: 1155581.108577},
    {level: 10, resolution: 152.874056570411, scale: 577790.554289},
    {level: 11, resolution: 76.4370282850732, scale: 288895.277144},
    {level: 12, resolution: 38.2185141425366, scale: 144447.638572},
    {level: 13, resolution: 19.1092570712683, scale: 72223.819286},
    {level: 14, resolution: 9.55462853563415, scale: 36111.909643},
    {level: 15, resolution: 4.77731426794937, scale: 18055.954822},
    {level: 16, resolution: 2.38865713397468, scale: 9027.977411},
    {level: 17, resolution: 1.19432856685505, scale: 4513.988705},
    {level: 18, resolution: 0.597164283559817, scale: 2256.994353},
    {level: 19, resolution: 0.298582141647617, scale: 1128.497176},
    {level: 20, resolution: 0.149291070823808, scale: 564.248588}
]

/*[
 {"level" : 0, "scale" : 3000000, "resolution" : 793.75158750317507},
 {"level" : 1, "scale" : 2000000, "resolution" : 529.16772500211675},
 {"level" : 2, "scale" : 1000000, "resolution" : 264.58386250105838},
 {"level" : 3, "scale" :  500000, "resolution" : 132.29193125052919},
 {"level" : 4, "scale" :  250000, "resolution" : 66.145965625264594},
 {"level" : 5, "scale" :  125000, "resolution" : 33.072982812632297},
 {"level" : 6, "scale" :   50000, "resolution" : 13.229193125052918},
 {"level" : 7, "scale" :   30000, "resolution" : 7.9375158750317505},
 {"level" : 8, "scale" :   12500, "resolution" : 3.3072982812632294},
 {"level" : 9, "scale" :    5000, "resolution" : 1.3229193125052918},
 {"level" :10, "scale" :    2500, "resolution" : 0.66145965625264591},
 {"level" :11, "scale" :    1000, "resolution" : 0.26458386250105836},
 {"level" :12, "scale" :     500, "resolution" : 0.13229193125052918},
 {"level" :13, "scale" :     250, "resolution" : 0.066145965625264591},
 {"level" :14, "scale" :     100, "resolution" : 0.026458386250105836},
 ]*/
;

function getAssetLayerInfo() {
    //var url = esriConfig.defaults.io.proxyUrl + "?http://" + gisServer + "/arcgis/rest/services/" + mapSvc + "/MapServer?f=pjson";
    var mapUrl = window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + gs.mapInstance + "/MapServer";
    var mapUrl = getMapLayerUrl();
    if(esriConfig.defaults.io.proxyUrl){
        mapUrl= esriConfig.defaults.io.proxyUrl + "?" + mapUrl;
    }
    //url = window.protocol+"//" + gisServer + "/arcgis/rest/services/" + mapSvc + "/MapServer?f=pjson";
    console.log('Requesting layer info...', mapUrl);
    return esri.request(//url, {handleAs: "json", method: "GET"}
        { url: mapUrl, content: { f: "json" }, handleAs: "json", callbackParamName: "callback" }
    ).then(function (data) {
        console.log('Layer info received...');
        console.log(data);
        gs.layerInfo = data;
        gs.layInds = Object();
        data.layers.forEach(function (layer) {
            gs.layInds[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
        });
        data.tables.forEach(function (layer) {
            gs.layInds[layer.name.replace(/[^.]*\.[^.]*\.([^.]*)/, '$1')] = layer.id;
        });
        //window.layInds = gs.layInds; 
        //window.layerInfo= gs.layerInfo;
    }, function (error) {
        console.log("Could not load scenarios: " + error);
    });
}

function getEqModels() {
    var sm = [
        {otypes: ['oh'], tab: 'model_conductor', id: 'id',},
        {otypes: ['ug'], tab: 'model_ug', id: 'id',},
        {otypes: ['construction'], tab: 'model_construction', id: 'id',},
        {otypes: ['transformer'], tab: 'model_transformer', id: 'equipref',},
        {otypes: ['regulator'], tab: 'model_regulator', id: 'equipref',},
        {otypes: ['capacitor'], tab: 'model_cap', id: 'equipref',},
        {otypes: ['motor'], tab: 'model_motor', id: 'equipref',},
        {otypes: ['source'], tab: 'model_source', id: 'equipref',},
        {otypes: ['generator'], tab: 'model_generator', id: 'equipref',},
        {otypes: PROT_OTYPES, tab: 'model_protection', id: 'equipref',},
        {otypes: ['circuit'], tab: 'model_circuit', id: 'equipref',}
    ];
    console.log('Getting equipment list...');
    gs.model.otype2DbIndex = {};
    all(sm.map(function (et, i) {
        et.otypes.forEach(function (ot) {
            gs.model.otype2DbIndex[ot] = i;
        });
        if (typeof gs.layInds[et.tab] !== 'undefined') {
            var qt = new esri.tasks.QueryTask(getMapLayerUrl(et.tab));
            var q = new esri.tasks.Query();
            q.returnGeometry = false;
            q.where = "1=1";
            q.outFields = ["*"];
            q.orderByFields = [sm[i].id];
            //console.log('Querying table:',et.tab, 'Q: ', q);
            return qt.execute(q);
        } else {
            console.log('layer index not found:', et.tab);
            return null;
        }
    })).then(function (rs) {
        //console.log('Got all the eq results.', rs);
        rs.forEach(function (r, i) {
            if (r && typeof r.features !== 'undefined' && r.features.length > 0) {
                sm[i]['list'] = r.features.map(function (f) {
                    return (f && typeof f.attributes !== 'undefined' && f.attributes[sm[i].id] !== 'undefined') ? f.attributes[sm[i].id] : null;
                }).filter(function (f) {
                    return f !== null;
                });
                sm[i]['features'] = r.features;
            }
            else {
                sm[i]['list'] = [];
                sm[i]['features'] = [];
            }
            sm[i]['store'] = new dojo.store.Memory({
                data: sm[i]['list'].map(function (i) {
                    return {name: i, id: i}
                })
            });
        });
        gs.model.eqdb = sm;

    }, function (e) {
        console.log('Error in one of the equipment queries.');
    });
}

function getBayList() {
    console.log('Circuit list: ' + getMapLayerUrl('model_circuit'));
    var qt = new esri.tasks.QueryTask(getMapLayerUrl('model_circuit'));
    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    query.outFields = ["*"];
    query.where = "1=1";
    query.orderByFields = ["equipref ASC"];
    return qt.execute(query).then(function (res) {
        gs.state.bayList = res;
        gs.state.bayList.features.forEach(function (f) {
            f.attributes['name'] = f.attributes['equipref'];
        });
        gs.state.bayList.features.sort(function (a, b) {
            var aa = a.attributes, ba = b.attributes;
            return (aa.name < ba.name) ? -1 : ((aa.name === ba.name) ? 0 : 1);
        });
        ReloadStoreWithFeatureSet(gs.state.bayList, gs.state.bayListStore);
        updateListControls(blControls);
        console.log(res.features.length + ' circuits loaded.');
        return res;
    }, function (error) {
        console.log("Could not load sub-bay combinations: " + error);
    });
}

function getLoadProfiles() {
    getMapLayerUrl()
    console.log('Load profiles: ' + getMapLayerUrl('data_load_profiles'));
    var queryTask = new esri.tasks.QueryTask(getMapLayerUrl('data_load_profiles'));
    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    //query.outSpatialReference = map.spatialReference;
    query.where = "1=1";
    query.outFields = ["*"];
    query.orderByFields = ["last_update DESC", "creation_date DESC", "name ASC"];
    return queryTask.execute(query).then(
        function (res) {
            gs.state.loadScenarios = res;
            ReloadStoreWithFeatureSet(gs.state.loadScenarios, gs.state.loadScenariosStore);
            updateListControls(lpControls);
            console.log(gs.state.loadScenarios.features.length + " load profiles loaded.");
            return res;
        },
        function (error) {
            console.log("Could not load load profiles: " + error);
        });
}

function getIntLoadProfileNames(groupName) {
    getMapLayerUrl()
    console.log('Interval Load profile Names: ' + getMapLayerUrl('int_data_load_profile'));
    var queryTask = new esri.tasks.QueryTask(getMapLayerUrl('int_data_load_profile'));
    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    //query.outSpatialReference = map.spatialReference;
    query.where = `group_name = '${groupName}'`
    query.outFields = ['name']
    // query.returnDistinctValues = true;
    // query.outFields = ["*"];
    // query.orderByFields = ["last_update DESC", "creation_date DESC", "name ASC"];
    return queryTask.execute(query).then(
        function (res) {
            gs.state.intLoadScenarioNames = res;
            
            // convert to timestamp only
            gs.state.intLoadScenarioNames.features.forEach(function (f) {
                let nm = f.attributes['name'].slice(-18);
                f.attributes['name'] = nm;
            });

            // sort
            gs.state.intLoadScenarioNames.features.sort(function (a, b) {
                let ts1 = a.attributes['name'].split(' ')
                let ts2 = b.attributes['name'].split(' ');
                let ts1AM = ts1[0].slice(-2);
                let ts2AM = ts2[0].slice(-2);
                
                let ts1Time = ts1[0].slice(0,-2).split(':');
                let ts2Time = ts2[0].slice(0,-2).split(':');
                if (ts1AM == 'PM') ts1Time[0] = Number(ts1Time[0]) + 12;
                if (ts2AM == 'PM') ts2Time[0] = Number(ts2Time[0]) + 12;

                ts1Date = ts1[1].split('/');
                ts2Date = ts2[1].split('/');

                let date1 = new Date(ts1Date[2], ts1Date[0]-1, ts1Date[1], ts1Time[0], ts1Time[1]);
                let date2 = new Date(ts2Date[2], ts2Date[0]-1, ts2Date[1], ts2Time[0], ts2Time[1]);

                return (date1 < date2) ? -1 : ((date1 === date2) ? 0 : 1);
            });

            ReloadStoreWithFeatureSet(gs.state.intLoadScenarioNames, gs.state.intLoadScenarioNamesStore);
            updateListControls(intLpNamesControls);
            console.log(gs.state.intLoadScenarioNames.features.length + " interval load profiles names loaded.");
            return res;
        },
        function (error) {
            console.log("Could not load interval load profile names: " + error);
        });
}

function getIntLoadProfiles() {
    getMapLayerUrl()
    console.log('Interval Load profiles: ' + getMapLayerUrl('int_data_load_profile'));
    var queryTask = new esri.tasks.QueryTask(getMapLayerUrl('int_data_load_profile'));
    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    //query.outSpatialReference = map.spatialReference;
    query.where = "1=1";
    query.outFields = ['group_name']
    query.returnDistinctValues = true;
    // query.outFields = ["*"];
    // query.orderByFields = ["last_update DESC", "creation_date DESC", "name ASC"];
    return queryTask.execute(query).then(
        function (res) {
            gs.state.intLoadScenarios = res;
            ReloadStoreWithFeatureSet(gs.state.intLoadScenarios, gs.state.intLoadScenariosStore);
            updateListControls(intLpControls);
            console.log(gs.state.intLoadScenarios.features.length + " interval load profiles loaded.");
            return res;
        },
        function (error) {
            console.log("Could not load interval load profiles: " + error);
        });
}

function getGenProfiles() {
    console.log('Load profiles: ' + getMapLayerUrl('data_gen_profiles'));
    var queryTask = new esri.tasks.QueryTask(getMapLayerUrl('data_gen_profiles'));
    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    //query.outSpatialReference = map.spatialReference;
    query.where = "1=1";
    query.outFields = ["*"];
    query.orderByFields = ["last_update DESC", "creation_date DESC", "name ASC"];
    return queryTask.execute(query).then(
        function (res) {
            gs.state.genScenarios = res;
            ReloadStoreWithFeatureSet(gs.state.genScenarios, gs.state.genScenariosStore);
            updateListControls(gpControls);
            console.log(gs.state.genScenarios.features.length + " gen profiles loaded.");
            return res;
        },
        function (error) {
            console.log("Could not load load profiles: " + error);
        });
}


function getCaseStudies(refreshCaseStudies) {
    refreshCaseStudies = refreshCaseStudies || true;
    //console.log('Case studies: '+mapService+"/"+layInds['res_study']);
    var queryTask = new esri.tasks.QueryTask(getMapLayerUrl('res_study'));
    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    //query.outSpatialReference = map.spatialReference;
    query.where = "1=1";
    query.outFields = ["*"];
    query.orderByFields = ["last_update DESC"];
    return queryTask.execute(query).then(function (res) {
        gs.state.caseStudies = res;
        ReloadStoreWithFeatureSet(gs.state.caseStudies, gs.state.caseStudiesStore);
        updateListControls(csControls);
        //var caseStudyName;
        if (gs.state.caseStudiesStore.query({name: caseStudyName}).length === 0) {
            console.log('Current cases study name, ' + caseStudyName + ', not found, resetting to null.');
            caseStudyName = null;
        }

        if (caseStudyName == null && gs.state.caseStudiesStore.query({})[0]) {
            caseStudyName = gs.state.caseStudiesStore.query({})[0][gs.state.caseStudiesStore.idProperty];
        }

        if (refreshCaseStudies) {
            getIssues(getLoadingThereshold(), getVoltageThereshold(), caseStudyName, dijit.byId('spAmpViolationsCB').checked, resUpdateHandler);
            registry.byId('resScenarioSel').setValue(caseStudyName);
        }
        console.log("Current case study: ", caseStudyName);
        console.log(res.features.length + " case studies loaded.");
        return res;
    }, function (error) {
        console.log("Could not load case studies: " + error);
    });
}

function getIntCaseStudies(refreshIntCaseStudies) {
    refreshIntCaseStudies = refreshIntCaseStudies || true;
    //console.log('Case studies: '+mapService+"/"+layInds['res_study']);
    var queryTask = new esri.tasks.QueryTask(getMapLayerUrl('int_res_study'));
    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    //query.outSpatialReference = map.spatialReference;
    query.where = "1=1";
    query.outFields = ['group_name'];
    query.returnDistinctValues = true;
    // query.outFields = ["*"];
    // query.orderByFields = ["last_update DESC"];
    return queryTask.execute(query).then(function (res) {
        gs.state.intCaseStudies = res;
        ReloadStoreWithFeatureSet(gs.state.intCaseStudies, gs.state.intCaseStudiesStore);
        updateListControls(icsControls);
        var intCaseStudyName;
        let icsDelBtn = dijit.registry.byId('delIntCaseStudyBtn');
        // if (gs.state.intCaseStudiesStore.query({name: intCaseStudyName}).length === 0) {
        //     console.log('Current interval cases study name, ' + intCaseStudyName + ', not found, resetting to null.');
        //     intCaseStudyName = null;
        //     icsDelBtn.setAttribute('disabled', true);
        // }

        // if (intCaseStudyName == null && gs.state.intCaseStudiesStore.query({})[0]) {
        if (gs.state.intCaseStudiesStore.query({})[0]) {
            intCaseStudyName = gs.state.intCaseStudiesStore.query({})[0][gs.state.intCaseStudiesStore.idProperty];
        }
        
        if (intCaseStudyName) {
            icsDelBtn.setAttribute('disabled', false);
        }

        // if (refreshIntCaseStudies) {
        //     getIssues(getLoadingThereshold(), getVoltageThereshold(), intCaseStudyName, dijit.byId('spAmpViolationsCB').checked, resUpdateHandler);
        //     registry.byId('resScenarioSel').setValue(intCaseStudyName);
        // }
        console.log("Current interval case study: ", intCaseStudyName);
        console.log(res.features.length + " case studies loaded.");
        return res;
    }, function (error) {
        console.log("Could not load interval case studies: " + error);
    });
}

function getMeteringTimeStamps() {
    console.log('Metering table: ' + getMapLayerUrl('data_metering'));
    var queryTask = new esri.tasks.QueryTask(getMapLayerUrl('data_metering'));
    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    //query.outSpatialReference = map.spatialReference;
    query.where = "1=1";
    query.outFields = ["timestamp"];
    query.orderByFields = ["timestamp DESC"];
    query.returnDistinctValues = true;
    return queryTask.execute(query).then(
        function (res) {
            gs.state.meteringTimeStamps = res;
            convertTimeStamps(gs.state.meteringTimeStamps, 'timestamp');
            ReloadStoreWithFeatureSet(gs.state.meteringTimeStamps, gs.state.meteringTimeStampsStore);
            updateListControls(mtsControls);
            console.log(gs.state.meteringTimeStamps.features.length + " metering timestamps loaded.");
            return res;
        },
        function (error) {
            console.log("Could not load metering timestamps: " + error);
        });
}

function getBayLoadingTimeStamps() {
    console.log('Bay loading table: ' + getMapLayerUrl('data_bay_loading'));
    var queryTask = new esri.tasks.QueryTask(getMapLayerUrl('data_bay_loading'));
    var query = new esri.tasks.Query();
    query.returnGeometry = false;
    //query.outSpatialReference = map.spatialReference;
    query.where = "1=1";
    query.outFields = ["timestamp"];
    query.orderByFields = ["timestamp DESC"];
    query.returnDistinctValues = true;
    return queryTask.execute(query).then(
        function (res) {
            gs.state.bayLoadingTimeStamps = res;
            convertTimeStamps(gs.state.bayLoadingTimeStamps, 'timestamp');
            ReloadStoreWithFeatureSet(gs.state.bayLoadingTimeStamps, gs.state.bayLoadingTimeStampsStore);
            updateListControls(bltsControls);
            console.log(gs.state.bayLoadingTimeStamps.features.length + " metering timestamps loaded.");
            return res;
        },
        function (error) {
            console.log("Could not load metering timestamps: " + error);
        });
}

// function getIntDataProfileTimesteps() {
//     console.log('Interval data load profile table: ' + getMapLayerUrl('int_data_load_profile'));
//     var queryTask = new esri.tasks.QueryTask(getMapLayerUrl('int_data_load_profile'));
//     var query = new esri.tasks.Query();
//     query.returnGeometry = false;
//     //query.outSpatialReference = map.spatialReference;
//     query.where = "1=1";
//     query.outFields = ["name"];
//     query.orderByFields = ["name DESC"];
//     query.returnDistinctValues = true;
//     return queryTask.execute(query).then(
//         function (res) {
//             gs.state.bayLoadingTimeStamps = res;
//             convertTimeStamps(gs.state.bayLoadingTimeStamps, 'timestamp');
//             ReloadStoreWithFeatureSet(gs.state.bayLoadingTimeStamps, gs.state.bayLoadingTimeStampsStore);
//             updateListControls(bltsControls);
//             console.log(gs.state.bayLoadingTimeStamps.features.length + " metering timestamps loaded.");
//             return res;
//         },
//         function (error) {
//             console.log("Could not load metering timestamps: " + error);
//         });
// }

function getReportFieldList() {
    console.log('Getting report field list');
    var phases = ['a', 'b', 'c'];
    var spec = [
        {label: 'Voltage ', q1: 'v', q2: 'm'},
        {label: 'Current ', q1: 'c', q2: 'm'},
        {label: 'Power (kW) ', q1: 's', q2: 'r'},
    ];
    var repFiels = [];
    spec.forEach(function (s) {
        phases.forEach(function (p) {
            repFiels.push({name: s.label + p.toUpperCase(), field: s.q1 + s.q2 + '_' + p});
        });
    });
    gs.state.reportFieldsStore.setData(repFiels);
    updateListControls(rfControls);
    console.log(repFiels.length + ' report fields loaded.');
    return repFiels;
}

function handleCSVDrop(handler) {
    return function (event) {
        console.log("Drop: ", event);
        controlStartWaiting('lpImportLoadingIcon');
        event.preventDefault();
        // Reference
        // http://www.html5rocks.com/tutorials/file/dndfiles/
        // http://developer.mozilla.org/en/Using_files_from_web_applications
        var dataTransfer = event.dataTransfer,
            files = dataTransfer.files,
            types = dataTransfer.types;

        // File drop?
        if (files && files.length === 1) {
            console.log("[ FILES ]");
            var file = files[0]; // that's right I'm only reading one file
            console.log("type = ", file.type);
            if (file.name.indexOf(".csv") !== -1) {
                handleCSV(file, handler);
            }
        }
    }
}

function handleCSV(file, handler) {
    console.log("Processing CSV: ", file, ", ", file.name, ", ", file.type, ", ", file.size);
    if (file.data) {
        var decoded = bytesToString(base64.decode(file.data));
        handler(decoded);
    }
    else {
        var reader = new FileReader();
        reader.onload = function () {
            console.log("Finished reading CSV data");
            handler(reader.result);
        };
        reader.readAsText(file);
    }
}

function getSeparator(string) {
    var separators = [",", "      ", ";", "|"];
    var maxSeparatorLength = 0;
    var maxSeparatorValue = "";
    arrayUtils.forEach(separators, function (separator) {
        var length = string.split(separator).length;
        if (length > maxSeparatorLength) {
            maxSeparatorLength = length;
            maxSeparatorValue = separator;
        }
    });
    return maxSeparatorValue;
}

function importLoadCSV(data) {
    console.log("Processing CSV data.")
    var newLineIndex = data.indexOf("\n");
    var firstLine = lang.trim(data.substr(0, newLineIndex)); //remove extra whitespace, not sure if I need to do this since I threw out space delimiters
    var separator = getSeparator(firstLine);
    var csvStore = new dojox.data.CsvStore({
        data: data,
        separator: separator
    });

    csvStore.fetch({
        onComplete: function (items) {
            var loadingProfileTab = new esri.layers.FeatureLayer(getFeatureLayerUrl('model_loads'));
            /*
             var featureCollection = generateFeatureCollectionTemplateCSV(csvStore, items);
             var popupInfo = generateDefaultPopupInfo(featureCollection);
             var infoTemplate = new InfoTemplate(buildInfoTemplate(popupInfo));
             */
            var idFieldStr = 'secname', kwFieldStr = 'kw', pfFieldStr = 'pf';
            var idField, kwField, pfField;
            var fieldNames = csvStore.getAttributes(items[0]);
            var cols = [['secname', null], ['kw', null], ['pf', null]];
            cols.forEach(function (c) {
                var mt = fieldNames.filter(function (cn) {
                    return c[0] === cn.toLowerCase();
                });
                if (mt.length > 0) {
                    c[1] = mt[0];
                }
            });

            if (!cols.every(function (c) {
                    return c[1];
                })) {
                console.log('Expected columns not found.', cols);
            } else {
                var recs = [];
                // Add records in this CSV store as graphics
                arrayUtils.forEach(items, function (item) {
                    var attrs = csvStore.getAttributes(item),
                        attributes = {};
                    // Read all the attributes for  this record/item
                    arrayUtils.forEach(attrs, function (attr) {
                        var value = Number(csvStore.getValue(item, attr));
                        attributes[attr] = isNaN(value) ? csvStore.getValue(item, attr) : value;
                    });
                    recs.push(attributes);
                });
                console.log(recs);

                var lp = registry.byId('lpNameImport').value;
                var lrecs = recs.map(function (lr) {
                    return {
                        attributes: {
                            lscen: lp, equipref: lr.secname,
                            kw_a: lr.kw, kw_b: lr.kw, kw_c: lr.kw, pf: lr.pf
                        }
                    };
                });
                all(lrecs.map(function (lr) {
                    var q = new esri.tasks.Query();
                    q.where = "equipref='" + lr.attributes.equipref + "' and lscen='" + lr.attributes.lscen + "'";
                    q.outFields = ["*"];
                    //console.log(q);
                    return loadingProfileTab.queryFeatures(q).then(function (fs) {
                        var addFs = null, updFs = null, delFs = null;
                        fs = fs.features;
                        if (fs.length > 0) {
                            //console.log(fs);
                            lang.mixin(fs[0].attributes, lr.attributes);
                            updFs = [fs[0]];
                            if (fs.length > 1) {
                                delFs = fs.slice(1);
                            }
                        } else {
                            console.log('No record for ' + lr.attributes.equipref + ' in ' + lr.attributes.lscen);
                            addFs = [lr];
                        }
                        //console.log('Final FS', fs);
                        return loadingProfileTab.applyEdits(addFs, updFs, delFs).then(
                            function (add, upd, del) {
                                //console.log(add, upd);
                                if (add.length > 0) {
                                    //addMessage('Load record updated successfully.', 'success');
                                }
                                if (upd.length > 0) {
                                    //addMessage('Load record added successfully.', 'success');
                                }
                            }, function (err) {
                                console.log(err);
                                addMessage('Load record update error!', 'error');
                            });
                    }, function (e) {
                        console.log("Error finding record!");
                    });
                })).then(function (allRes) {
                    console.log('Load records processed: ', allRes.length);
                    addMessage(allRes.length.toString() + ' load records added/updated.', 'success');
                    controlStopWaiting('lpImportLoadingIcon');
                }, function (e) {
                    addMessage('Error loading records...', 'error');
                    controlStopWaiting('lpImportLoadingIcon');

                });
            }

        },
        onError: function (error) {
            console.error("Error fetching items from CSV store: ", error);
        }
    });
}

function connectControlToStore(controlId, store, searchAttr, labelAttr) {
    if (!store) return;
    var list = registry.byId(controlId);
    if (typeof list !== 'undefined') {
        list.searchAttr = searchAttr;
        list.labelAttr = labelAttr;
        list.set('store', store);
    } else {
        console.log('Control not found', controlId);
    }
}

function updateListControls(controls) {
    controls.forEach(function (controlId) {
        var list = registry.byId(controlId);
        if (typeof list !== 'undefined') {
            if (list.declaredClass === 'dijit.form.MultiSelect') {
                reloadOptionsFromStore(list);
            } else {
                len = list.store.query({}).length;
                if (len > 0) {
                    if (controlId == 'ipfEndTs' || controlId == 'ddEndTs') {
                        list.set('value', list.store.query({})[len - 1][list.labelAttr]);
                    }
                    else {
                        list.set('value', list.store.query({})[0][list.labelAttr]);
                    }
                } else {
                    list.set('value', '');
                }
            }
        }
    });
}

function reloadOptionsFromStore(l) { // need arrayUtils here
    arrayUtils.forEach(l.domNode.childNodes, domConstruct.destroy);
    arrayUtils.forEach(l.store.query({}, {sort: [{attribute: l.labelAttr, descending: false}]}), function (e) {
        var opt = document.createElement('option');
        opt.value = e[l.labelAttr];
        opt.innerHTML = e[l.labelAttr];
        l.domNode.appendChild(opt);
    });
}

function populateBayListLegend() {
}


function preTag(s) {
    var i = s.indexOf('<');
    return i > 0 ? s.substr(0, i) : s;
}

function printButtonHandler() {
    dojo.byId("printLoadingDiv").style.display = "inline";
    registry.byId('printToolBtn').set("disabled", true);
    console.log('Printing...');
    var ptemplate = new esri.tasks.PrintTemplate();
    // use the extent of the webmap in the output PDF
    ptemplate.preserveScale = false;
    ptemplate.format = 'PDF';
    ptemplate.exportOptions.dpi = 400;
    ptemplate.exportOptions.height = 3000;
    ptemplate.exportOptions.width = 4000;
    printParams.template = ptemplate;
    printParams.Layout_Template = 'A3 Landscape';
    printParams.Format = 'PDF';

    printParams.Output_File = 'ADDA_Map';
    printTask.execute(printParams).then(function (result) {
        dojo.byId("printLoadingDiv").style.display = "none";
        registry.byId('printToolBtn').set("disabled", false);
        console.log('Printing completed.');
        window.open(esriConfig.defaults.io.proxyUrl + '?' + result.url);
    }, function (err) {
        console.log('Error: ', err);
    });
}


function matchLayerSet(layers, ls) { // this is very loose, but pretty quick
    return layers.length === ls.length;
}

function layerSetLoaded(loadedLayers, layerSet) {
    //var ldUrls= loadedLayers.filter(function (ll) { return typeof ll.url !== 'undefined' && ll.url; }).map(function (ll) { return ll.url; });
    //return layerSet.every(function (l) { return (typeof l.url !== 'undefined') && l.url && (ldUrls.indexOf(l.url) >= 0); });
    return layerSet.every(function (l) {
        return loadedLayers.indexOf(l) >= 0;
    });
}


function postDataLayersLoadOps() {
    console.log('All data layers are loaded.');
}

function postLayersLoadOps() {
    console.log('All layers are loaded.');
    fx.fadeOut({
        node: 'loadingDiv', duration: 5000, onEnd: function () {
            domStyle.set('loadingDiv', 'display', 'none');
            map.resize();
            if (gs.state.lastExtent) {
                map.setExtent(gs.state.lastExtent).then(appStopWaiting);
            }
            else {
                appStopWaiting();
            }
        }
    }).play();

    setupSnapManager();
    if (enableWatchdog) {
        clearTimeout(loadingTimeout);
    }
    map.resize();
    loadLayerVisibilities();
}

function postMapLayerLoadOps() {
    console.log('All map layers are loaded.');
}

function postFeatureLayerLoadOperations() {
    console.log('All feature layers are in...');
    setupGeometryAddition();
    //setupSymbolEditor("outageMarkerSymbolStylerDiv");
}

/*
 function setupSymbolEditor(div) {
 gs.styler = new esri.dijit.SymbolStyler({}, "div");
 //Must call startup
 gs.styler.startup();
 return gs.styler();
 }

 function editSymbol() {
 //var symbol = createSymbol(symbolType);
 gs.styler.edit(outMarker, getStylerOptions(outMarker));

 }

 function getGeometryType(symbol) {
 var type = symbol.type;
 return type === "picturefillsymbol" || type === "simplefillsymbol" ? "polygon" :
 type === "cartographiclinesymbol" || type === "simplelinesymbol" ? "line" :
 "point";
 }

 function getStylerOptions(symbol) {
 var style = "basic";
 var styleModule = style === "size" ? esri.styles.size :
 style === "type" ? esri.styles.type :
 esri.styles.basic;
 return {
 schemes: styleModule.getSchemes({
 theme: "default",
 geometryType: getGeometryType(symbol)
 })
 };
 }

 function createSymbol(type) {
 var SFS = esri.symbol.SimpleFillSymbol,
 SLS = esri.symbol.SimpleLineSymbol,
 SMS = esri.symbol.SimpleMarkerSymbol;
 if (type === "simplefill") {
 return new SFS("solid", createSymbol("simpleline"), outColor);
 }
 if (type === "simpleline") {
 return new SLS("solid", outColor, 10);
 }
 return new SMS("circle", 20, createSymbol("simpleline"), outColor);
 }
 */
function loadLayerVisibilities() {
    if (mapLayers.length === gs.state.layersVisibility.length) {
        //if (0 < gs.state.layersVisibility.length) {
        mapLayers.forEach(function (l, i) {
            gs.state.layersVisibility[i] ? l.show() : l.hide();
        });
        console.log("Layer visibilities reloaded.");
    }
    //if (gs.state.assetsLayerVis.length > 0) {
    assetsLayer.setVisibleLayers(gs.state.assetsLayerVis);
    console.log("Assets Layer visibilities reloaded.");
    //}
}

function getVisibleMapLayers() {
    gs.state.layersVisibility = mapLayers.map(function (l) {
        return l.visible;
    });
    return gs.state.layersVisibility;
}

function getVisibleFeatureLayers() {
    // we are going to go by index but probably id should be better
    return unique(assetsLayer.visibleLayers.map(function (id) {
        return assetsLayer.layerInfos[id];
    }).filter(function (li) {
        return !((li.maxScale && li.maxScale > map.getScale()) || (li.minScale && li.minScale < map.getScale())); // note that scale works backwards
    }).map(function (li) {
        if (li.name === 'Loads') return aflLoads;
        else if (li.name === 'Equipment') return aflEquips;
        else if (li.name === 'Power Lines') return aflLines;
        else if (li.name === 'Poles') return aflPoles;
        else return null;
    }).filter(function (l) {
        return l;
    }));
}

/*
 function getVisibleFeatureLayers() { // note that map scales are tricky
 var vl = unique(assetsLayer.layerInfos.filter(function (i) {
 return i.visible && (i.minScale == 0 || map.getScale() < i.minScale) && (i.maxScale == 0 || map.getScale() > i.maxScale);
 }).map(function (i) { return i.name; }));
 return assetsLayer.visible ? assetsFeatureLayers.filter(function (l, i) { return vl.indexOf(gs.layers[i]) >= 0; }) : [];
 }
 */

function setupSnapManager() {
    window.snapManager = gs.map.enableSnapping({
        //alwaysSnap: true,
        snapPointSymbol: snapSymbol,
        //tollerance: 20,
        //snapKey: has("mac") ? keys.META : keys.CTRL,
        //layerInfos: snapLayerInfos(),
    });

    updateSnapLayers(map, assetsFeatureLayers);
    console.log('Snap manager setup complete.');
}

function snapLayerInfos(layers) {
    layers = gs.layers.map(function (l) {
        return new esri.layers.FeatureLayer(getFeatureLayerUrl(l), {
            mode: esri.layers.FeatureLayer.MODE_SELECTION,
            outFields: ["*"]
        });
    });

    function li(l) {
        return {layer: l, snapToEdge: false, snapToPoint: true, snapToVertex: true};
    }

    function vl(l) {
        return (l instanceof esri.layers.GraphicsLayer || l instanceof esri.layers.FeatureLayer);
    }

    return (Array.isArray(layers) ? layers : [layers]).filter(vl).map(li);
}

function updateSnapLayers(layers) {
    //layers = layers || assetsFeatureLayers;
    ewHide();
    clearAllSelections();
    snapManager.setLayerInfos(snapLayerInfos(layers));
}

function clearBayHighlighingButtonHandler() {
    bayHighlightingLayer.clear();
}

function clearAnalysisResultsButtonHandler() {
    issueHighlightingLayer.clear();
}

function toggleHeadsupDisplayButtonHandler() {
    if (registry.byId('shortInfoWindowContainer').style.visibility === 'visible') {
        registry.byId('shortInfoWindowContainer').hide();
        registry.byId('toggleHeadsupDisplayBtn').containerNode.innerHTML = 'Turn Study Info Pane On'
    } else {
        registry.byId('toggleHeadsupDisplayBtn').containerNode.innerHTML = 'Turn Study Info Pane Off';
        registry.byId('shortInfoWindowContainer').show();
    }
}


function tocStarter(evt) {
    require(["agsjs/dijit/TOC"], function (TOC) {
        toc = new TOC({
            map: map,
            layerInfos: tocLayerInfos,
        }, 'tocDiv');

        toc.startup();
    });
}

function formatForSQLIn(arr) {
    var sqlIn = [];
    for (var i = 0; i < arr.length; i++) {
        sqlIn.push( `'${arr[i]}'` );
    }

    return sqlIn.join(",");
}

function getParticipatingCustomers(rateclasses){    
	var queryTask = new esri.tasks.QueryTask(getMapLayerUrl('Loads'));
	var query = new esri.tasks.Query();
    query.returnGeometry = false;

    rc = formatForSQLIn(rateclasses)
    sqlInRateClass = `rateclass in (${rc})`;

    circuits = registry.byId('ddSubsBays').value;
    sqlInCircuits = "";
    if (circuits.length > 0) {
        circs = formatForSQLIn(circuits);
        sqlInCircuits = `circuit in (${circs})`;
        query.where = `${sqlInCircuits} AND ${sqlInRateClass}`;
    }
    else
    {
        query.where = sqlInRateClass;
    }

    // sqlInRateclass = formatForSQLIn(rateclasses)
	// query.where = `${sqlInCircuits} rateclass in (${sqlInRateclass})`;
	query.outFields = ["*"];
	query.orderByFields=["secname"];
	queryTask.execute(query, function (res){
        console.log(res);
        ddParticipatingCustCnt = res.features.length;
        dojo.byId('partCustNum').innerHTML = ddParticipatingCustCnt;
	});
}
