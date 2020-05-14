//editing
/*
function getWireTypes(){
	var queryTask = new esri.tasks.QueryTask(modelsService+"/3");
	var query = new esri.tasks.Query();
	query.returnGeometry = false;
	query.where = "1=1";
	query.outFields = ["equipref"];
	query.orderByFields=["equipref"];
	queryTask.execute(query, function (res){
		wireTypes.data=[];
		for (var i = 0; i < res.features.length; i++) {
			wireTypes.data.push({name: res.features[i].attributes['equipref'], id: res.features[i].attributes['equipref']});
		}
		//console.log(wireTypes);
		// just in case attribute inspector misses the query
		grid.render();
		//attInspector.layerInfos[0].fieldInfos[1].stringFieldOption=wireTypes;
		
	});
}
*/


function buildSelectionQuery() {
    if (map.infoWindow.count > 0) {
        return gs.layers.map(function (l) {
            return map.infoWindow.features.filter(function (f) {
                return typeof f.layer !== 'undefined' ? (f.layer === l) : false;
            }).map(function (f) {
                return f.attributes['objectid'];
            });
        }).map(function (oids) {
            if (oids.length > 0) {
                var sq = new esri.tasks.Query();
                sq.where = "objectid in ('" + oids.join("','") + "')";
                return sq;
            } else {
                return null
            }
            ;
        });
    } else {
        return null;
    }

}

function editSelection() {
    var sq = buildSelectionQuery();
    if (sq) {
        editSearch(sq);
    }
}

function editSearchQuery(evt) {
    var sq = new esri.tasks.Query();
    sq.geometry = evt.mapPoint;
    var pad = map.extent.getWidth() / map.width * 10;
    var queryGeom = new esri.geometry.Extent(evt.mapPoint.x - pad, evt.mapPoint.y - pad, evt.mapPoint.x + pad, evt.mapPoint.y + pad, map.spatialReference);
    sq.geometry = queryGeom;
    editSearch(sq);
}

function editSearch(selectQuery, els) {
    if (!selectQuery) {
        console.log('Null edit search query...')
        return;
    }
    els = els || assetsFeatureLayers;
    attInspector = initAttInspector();
    ewShow();
    owHide();
    registry.byId('attributeEditorContainer').setTitle('Searching...');
    all(els.map(function (l, i) {
        var sq = selectQuery instanceof esri.tasks.Query ? selectQuery : (selectQuery.length > i ? selectQuery[i] : selectQuery[0]);
        return sq ? l.selectFeatures(sq, esri.layers.FeatureLayer.SELECTION_NEW) : []; // we no the query will be empty
    })).then(function (features) {
        registry.byId('attributeEditorContainer').setTitle('Search completed!');
        features.forEach(function (l, i) {
            l.forEach(function (f) {
                f.layer = l;
            });
        });
        var allFeatures = [].concat.apply([], features);
        //console.log(allFeatures);
        if (allFeatures.length > 0) {
            //console.log('Found the edit feature(s): '+features.length);
            highlightEdit(allFeatures[0]);
            registry.byId('attributeEditorContainer').setTitle(editTitle(allFeatures[0]));
            registry.byId('attributeEditorContainer').setContent(attInspector.domNode);
            checkAndActivateFlip(allFeatures[0]);
            checkAndActivateJoin();
            updateEqSelection(allFeatures[0], eqEqSelect);
            ewPatchStyle();
            lastSelFeat = allFeatures[0];
            activateToolbar(allFeatures[0]);//map.infoWindow.show(evt.screenPoint,map.getInfoWindowAnchor(evt.screenPoint));
            //owShow();
        } else {
            ewHide();
            //map.infoWindow.hide();
        }
    });
}


function updateSelectionsAttr(selectQuery, attr, val, regFunc, els) {
    var els = els || assetsFeatureLayers;
    if (selectQuery) {
        return all(els.map(function (l, i) {
            var sq = selectQuery instanceof esri.tasks.Query ? selectQuery : (selectQuery.length > i ? selectQuery[i] : selectQuery[0]);
            return sq ? l.selectFeatures(sq, esri.layers.FeatureLayer.SELECTION_NEW) : []; // we no the query will be empty
        })).then(function (fls) {
            console.log('sel res', fls);
            fls.forEach(function (l, i) {
                l.forEach(function (f) {
                    f._layer = assetsLayer;
                    f.layer = l;
                });
            });
            return all(fls.map(function (r, i) {
                var l = assetsFeatureLayers[i];
                console.log(r);
                if (r.length > 0) {
                    console.log("Switching ", attr, " to: ", val);
                    r.forEach(function (f) {
                        if (typeof f.attributes[attr] !== 'undefined') f.attributes[attr] = val;
                        if (regFunc) regFunc(f);
                    });
                    console.log("Saving updated attributes for layer: ", l.name);
                    return l.applyEdits(null, r, null); //.promise;
                } else {
                    return null;
                }
                
            })).then(function (l) {
                console.log("Attribute update finished successfully!", l);
                addMessage("Attribute update finished successfully!", 'success');
                clearAllSelections();
            }, function (e) {
                console.log("Error in attribute updates!", e);
                addMessage("Error in attribute updates!", 'warninig');
                clearAllSelections();
            });
        });
    } else return null;

}

function switchSelectionsPhase() {
    ewHide();
    owHide();
    var tph = registry.byId('switchPhaseToPhase').value.toUpperCase();
    console.log("Switching selections phase to: ", tph);
    if (PHASES.indexOf(tph) >= 0) {
        updateSelectionsAttr(buildSelectionQuery(), 'phasecode', tph, preSaveAttributeUpdate);
    } else {
        console.log("Bad to phase.");
    }
}

function switchSelectionCircuit() {
    ewHide();
    owHide();
    var tc = registry.byId('switchCircuitToCircuit').value;
    console.log("Switching selections circuit to: ", tc);
    updateSelectionsAttr(buildSelectionQuery(), 'circuit', tc, null).then(function (r) {
        console.log("Circuits updated successfully.");
    }, function (e) {
        console.log("Error updating circuits.", e);
    });
}

function assignLoadSymbol(f) {
    if (gs.conf.manualPhaseOverride || f.attributes['phasecode'] === f.attributes['ophase'] || f.attributes['ophase'] === '') {
        //if (gs.conf.manualPhaseOverride) { console.log("Load ", f.attributes['secname'], " manual phase override, switching its symbol to normal.");
        //} else { console.log("Load ", f.attributes['secname'], "now has consistent phase, switching its symbol to normal."); }
        f.attributes['sym'] = ((f.attributes['key_acct'] === 'Y') ? 'K' : 'N') + f.attributes['rateclass'];
    } else {
        f.attributes['sym'] = 'PMM' + ((f.attributes['phasecode'].length === 1 && f.attributes['ophase'].length === 1) ? '-' + f.attributes['ophase'] + '-' + f.attributes['phasecode'] : '');
    }
}

/*
function phaseSwitchReg(f) {
    if (LOAD_OTYPES.indexOf(f.attributes['otype']) >= 0) {
        assignLoadSymbol(f);
    } else if (LINE_OTYPES.indexOf(f.attributes['otype']) >= 0) {
        f.attributes['sym'] = f.attributes['otype'] + f.attributes['phasecode'];
    }
}*/

function applyEdits() {
    assetsFeatureLayers.forEach(function (l) {
        l.applyEdits(null, null, null);
    });
}

function postAttributeChangeAIupdate(e) {
    updateEqSelection(e.feature);
}

function AiSelPatGen() {
    var q = typeof this.store !== 'undefined' ? (this.store ? this.store.query({}) : null) : null;
    //console.log(q);
    return q && q.length ? q.map(function (i) {
        return i.name;
    }).join('|') : '.*';
}

function getEditLayerInfos() {
    //[aux_code,feeder_no, mtr_pt, user_def_code]
    var condTypeSelect = new dijit.form.Select({
        options: [
            {label: "Overhead", value: "oh", selected: true},
            {label: "Underground", value: "ug"},
        ],
    });

    var phaseSelect = new dijit.form.Select({
        options: [
            {label: "A", value: "A"},
            {label: "B", value: "B"},
            {label: "B", value: "C"},
            {label: "B", value: "AB"},
            {label: "B", value: "AC"},
            {label: "B", value: "BC"},
            {label: "B", value: "ABC"},
        ],
    });

    window.eqEqSelect = new dijit.form.ComboBox({});
    window.condSelect = new dijit.form.ComboBox({});
    window.neutSelect = new dijit.form.ComboBox({});
    window.consSelect = new dijit.form.ComboBox({});
    var parsButton = new dijit.form.Button({
        label: "Advanced Parameters",
        onClick: function (e) {
            console.log('advanced params...', e);
            var att = lastSelFeat.attributes;
            if (att['otype'] === 'motor') {
                dojo.byId('motorId').value = att['secname'];
                var pars = dojo.mixin({}, JSON.parse(att['pars']));
                dojo.byId('motorLoadName').value = (typeof pars['load'] !== 'undefined') ? pars['load'] : '';
                dojo.byId('motorLoadRatio').value = (typeof pars['ratio'] !== 'undefined') ? pars['ratio'] : '1.0';
                setTimeout(function(){
                    document.getElementById("motorRecDialogDiv").style.zIndex = modal_top_z_index;
                }, 0);
                motorRecDialog.show();
            } else if (att['otype'] === 'transformer') {
                dojo.byId('transRedId').value = att['secname'];
                var pars = dojo.mixin({}, JSON.parse(att['pars']));
                dojo.byId('transWdgCode').value = (typeof pars['wdgCode'] !== 'undefined') ? pars['wdgCode'] : 'Y-Y';
                dojo.byId('transVin').value = (typeof pars['vInput'] !== 'undefined') ? pars['vInput'] : '14.4';
                dojo.byId('transVout').value = (typeof pars['vOut'] !== 'undefined') ? pars['vOut'] : '7.2';
                dojo.byId('transVoutNom').value = (typeof pars['vOutNom'] !== 'undefined') ? pars['vOutNom'] : '7.2';
                setTimeout(function(){
                    document.getElementById("transRecDialogDiv").style.zIndex = modal_top_z_index;
                }, 0);
                transRecDialog.show();
            } else if (att['otype'] === 'regulator') {
                dojo.byId('regRedId').value = att['secname'];
                var pars = dojo.mixin({}, JSON.parse(att['pars']));
                dojo.byId('regVout').value = (typeof pars['vOut'] !== 'undefined') ? pars['vOut'] : '1.05';
                dojo.byId('regFhLo').value = (typeof pars['fhLo'] !== 'undefined') ? pars['fhLo'] : '0.8';
                dojo.byId('regFhHi').value = (typeof pars['fhHi'] !== 'undefined') ? pars['fhHi'] : '1.2';
                dojo.byId('regLdcR').value = (typeof pars['ldcR'] !== 'undefined') ? pars['ldcR'] : '0';
                dojo.byId('regLdcX').value = (typeof pars['ldcX'] !== 'undefined') ? pars['ldcX'] : '0';
                setTimeout(function(){
                    document.getElementById("regRecDialogDiv").style.zIndex = modal_top_z_index;
                }, 0);
                regRecDialog.show();
            } else {
                dojo.byId('parsField').value = att['pars'];
                setTimeout(function(){
                    document.getElementById("parsRecDialogDiv").style.zIndex = modal_top_z_index;
                }, 0);
                
                parsRecDialog.show();
                // change
                document.getElementById("attributeEditorContainer").style.zIndex = top_z_index;
            }
        }
    });
    return [
        {
            'featureLayer': aflLoads,
            'isEditable': true,
            'fieldInfos': [
                {
                    'fieldName': 'circuit',
                    'isEditable': true,
                    'tooltip': 'Circuit (Feeder)',
                    'label': 'Circuit (Feeder):'
                },
                //{'fieldName': 'otype', 'isEditable':false, 'tooltip': 'Type', 'label':'Type:'},
                {'fieldName': 'secname', 'isEditable': true, 'tooltip': 'ID', 'label': 'ID:'},
                {'fieldName': 'parentsec', 'isEditable': true, 'tooltip': 'Parent Section', 'label': 'Parent Sec.:'},
                {'fieldName': 'equipref', 'isEditable': true, 'tooltip': 'Maploc.', 'label': 'Maploc.:'},
                {'fieldName': 'meter_num', 'isEditable': true, 'tooltip': 'Meter No.', 'label': 'Meter No.:'},
                {'fieldName': 'sym', 'isEditable': true, 'tooltip': 'Symbol', 'label': 'Symbol:'},
                {'fieldName': 'rateclass', 'isEditable': true, 'tooltip': 'Rate Class', 'label': 'Rate Class:'},
                {'fieldName': 'revclass', 'isEditable': true, 'tooltip': 'Rev. Class', 'label': 'Rev. Class:'},
                {'fieldName': 'cls', 'isEditable': true, 'tooltip': 'Class', 'label': 'Class:'},
                {'fieldName': 'key_acct', 'isEditable': true, 'tooltip': 'Is Key Account?', 'label': 'Key:'},
                {
                    'fieldName': 'trans_size',
                    'isEditable': true,
                    'tooltip': 'Transformer Size',
                    'label': 'Trans. Size (KVA):'
                },
                {'fieldName': 'trans_type', 'isEditable': true, 'tooltip': 'Transformer Type', 'label': 'Trans. Type:'},
                {
                    'fieldName': 'maploc_xf',
                    'isEditable': true,
                    'tooltip': 'Transformer Maploc',
                    'label': 'Trans. Maploc:'
                },
                {'fieldName': 'phasecode', 'isEditable': true, 'label': 'Phasecode:', 'customField': phaseSelect},
                {'fieldName': 'status', 'isEditable': true, 'label': 'Status:'},
                {'fieldName': 'name', 'isEditable': true, 'label': 'Name:'},
                /*{ 'fieldName': 'account_no', 'isEditable': true, 'label': 'Account No.:' },
                { 'fieldName': 'billing_stat', 'isEditable': true, 'label': 'Billing Status:' },
                { 'fieldName': 'description', 'isEditable': true, 'label': 'Description:' },
                { 'fieldName': 'addr_1', 'isEditable': true, 'label': 'Address:' },
                { 'fieldName': 'addr_2', 'isEditable': true, 'label': ' ' },
                { 'fieldName': 'addr_3', 'isEditable': true, 'label': ' ' },
                { 'fieldName': 'zip', 'isEditable': true, 'label': 'Zip:' },
                { 'fieldName': 'county', 'isEditable': true, 'label': 'County:' },
                { 'fieldName': 'tel_res', 'isEditable': true, 'label': 'Tel (Res.):' },
                { 'fieldName': 'tel_cell', 'isEditable': true, 'label': 'Tel (Cell.):' },
                { 'fieldName': 'tel_cell', 'isEditable': true, 'label': 'Tel (Cell.):' },
                { 'fieldName': 'svc_addr_no', 'isEditable': true, 'label': 'Svc. Add. No.:' },
                { 'fieldName': 'svc_addr_st', 'isEditable': true, 'label': 'Svc. Add. St.:' },*/
                {
                    'fieldName': 'wo',
                    'isEditable': true,
                    'label': 'Work Order #:',
                    'tooltip': 'Work order associated with this element.'
                },
            ]
        }, {
            'featureLayer': aflEquips,
            'isEditable': true,
            'fieldInfos': [
                //{'fieldName': 'otype', 'isEditable':false, 'tooltip': 'Element Type', 'label':'Type:'},
                {
                    'fieldName': 'circuit',
                    'isEditable': true,
                    'tooltip': 'Circuit (Feeder)',
                    'label': 'Circuit (Feeder):'
                },
                {'fieldName': 'secname', 'isEditable': true, 'tooltip': 'ID', 'label': 'ID:'},
                {'fieldName': 'parentsec', 'isEditable': true, 'tooltip': 'Parent Section', 'label': 'Parent Sec.:'},
                {
                    'fieldName': 'equipref',
                    'isEditable': true,
                    'tooltip': 'Equipment Reference',
                    'label': 'Equipment Reference:',
                    'customField': eqEqSelect
                },
                {'fieldName': 'phasecode', 'isEditable': true, 'label': 'Phasecode:', 'customField': phaseSelect},
                {'fieldName': 'status', 'isEditable': true, 'label': 'Status:'},
                {
                    'fieldName': 'nom_v',
                    'isEditable': true,
                    'label': 'Nominal Voltage (L-G):',
                    'tooltip': 'Line to ground nominal voltage in V, e.g. 14400.'
                },
                {'fieldName': 'pars', 'isEditable': true, 'label': 'Advanced Pars.:', 'customField': parsButton},
                {
                    'fieldName': 'pole_id',
                    'isEditable': true,
                    'label': 'Pole Id.:',
                    'tooltip': 'Pole Identifier.'
                },
                {
                    'fieldName': 'wo',
                    'isEditable': true,
                    'label': 'Work Order #:',
                    'tooltip': 'Work order associated with this element.'
                },
            ]
        }, {
            'featureLayer': aflLines,
            'isEditable': true,
            'fieldInfos': [
                {
                    'fieldName': 'otype',
                    'isEditable': true,
                    'tooltip': 'Type',
                    'label': 'Type:',
                    'customField': condTypeSelect
                },
                {
                    'fieldName': 'circuit',
                    'isEditable': true,
                    'tooltip': 'Circuit (Feeder)',
                    'label': 'Circuit (Feeder):'
                },
                {'fieldName': 'secname', 'isEditable': true, 'tooltip': 'ID', 'label': 'ID:'},
                {'fieldName': 'parentsec', 'isEditable': true, 'tooltip': 'Parent Section', 'label': 'Parent Sec.:'},
                //{ 'fieldName': 'equipref', 'isEditable': true, 'tooltip': 'Equipment', 'label': 'Equipment:' },
                {
                    'fieldName': 'conductor',
                    'isEditable': true,
                    'tooltip': 'Conductor',
                    'label': 'Conductor:',
                    'customField': condSelect
                },
                {
                    'fieldName': 'neutral',
                    'isEditable': true,
                    'tooltip': 'Neutral',
                    'label': 'Neutral:',
                    'customField': neutSelect
                },
                {
                    'fieldName': 'construction',
                    'isEditable': true,
                    'tooltip': 'Construction',
                    'label': 'Construction:',
                    'customField': consSelect
                },
                {'fieldName': 'phasecode', 'isEditable': true, 'label': 'Phasecode:', 'customField': phaseSelect},
                {
                    'fieldName': 'nom_v',
                    'isEditable': true,
                    'label': 'Nominal Voltage (L-G):',
                    'tooltip': 'Line to ground nominal voltage in V, e.g. 14400.'
                },
                {
                    'fieldName': 'insul_kv',
                    'isEditable': true,
                    'label': 'Insulator kV:',
                    'tooltip': 'Insulation voltage in kV.'
                },
                {
                    'fieldName': 'imp_len',
                    'isEditable': true,
                    'label': 'Impedance Len.:',
                    'tooltip': 'Change will override the geometric length.'
                },
                {
                    'fieldName': 'pole_id',
                    'isEditable': true,
                    'label': 'Pole Id.:',
                    'tooltip': 'Pole Identifier.'
                },
                {
                    'fieldName': 'wo',
                    'isEditable': true,
                    'label': 'Work Order #:',
                    'tooltip': 'Work order associated with this element.'
                },
            ]
        }, {
            'featureLayer': aflPoles,
            'isEditable': true,
            /*
              date timestamp without time zone,
              "time" character varying(8000),
              tech_name character varying(8000),
              stub_topped_poles character varying(8000),
              service_order character varying(8000),
              comments character varying(8000),
              attachments character varying(2000),
              violations character varying(2000),
              otype character varying(50),
              */
            'fieldInfos': [
                {
                    'fieldName': 'circuit',
                    'isEditable': true,
                    'tooltip': 'Circuit (Feeder)',
                    'label': 'Circuit (Feeder):'
                },
                {
                    'fieldName': 'id',
                    'isEditable': true,
                    'label': 'Pole Id.:',
                    'tooltip': 'Pole Identifier.'
                },
                {
                    'fieldName': 'wo',
                    'isEditable': true,
                    'label': 'Work Order #:',
                    'tooltip': 'Work order associated with this element.'
                },
                {'fieldName': 'tech_name', 'isEditable': true, 'tooltip': 'Tech Name', 'label': 'Tech Name:'},
                {
                    'fieldName': 'service_order',
                    'isEditable': true,
                    'tooltip': 'Service Order',
                    'label': 'Service Order:'
                },
                {'fieldName': 'attachments', 'isEditable': true, 'tooltip': 'Attachments', 'label': 'Attachments:'},
                {'fieldName': 'violations', 'isEditable': true, 'tooltip': 'Violations', 'label': 'Violations:'},
                {'fieldName': 'comments', 'isEditable': true, 'label': 'Comments:'},
            ]
        }
    ];

}

// function closeEdit(){

//  var dismissButton = new dijit.form.Button({label: "Dismiss", "class": "dismissButton"});
//  var dismis = domStyle.set(registry.byId('editMde').domNode, 'display', 'none');


// }

// function editMe(){


//     document.getElementById("editMde").style.display = 'block';
// }

function initAttInspector() {
    var editLayerInfos = getEditLayerInfos();
    if (typeof attInspector === "object" && attInspector !== null) {
        attInspector.destroyRecursive();
    }
    attInspector = new esri.dijit.AttributeInspector({layerInfos: editLayerInfos}, dojo.create("div"));

    attInspector.deleteBtn.domNode.classList.remove("atiButton"); // This is to patch a bug in the attributeInspector's CSS
    attInspector.on("delete", confirmDelete);

    var deleteBtn = attInspector.deleteBtn;
    domStyle.set(deleteBtn.domNode, 'float', 'unset');

    var saveButton = new dijit.form.Button({label: "Save", "class": "saveButton"});
    dojo.place(saveButton.domNode, attInspector.editButtons, 'first');
    saveButton.domNode.classList = deleteBtn.domNode.classList; //Not perfect, but pretty close
    saveButton.on("click", saveAssetUpdates);

    var flipLineButton = new dijit.form.Button({label: "Flip", "class": "flipLineButton", id: 'flipLineBtn'});
    dojo.place(flipLineButton.domNode, saveButton.domNode, 'after');
    flipLineButton.domNode.classList = deleteBtn.domNode.classList; //Not perfect, but pretty close
    domStyle.set(registry.byId('flipLineBtn').domNode, 'display', 'none');
    flipLineButton.on("click", lineFlipHandler);

    var resetButton = new dijit.form.Button({label: "Reset", "class": "resetButton"});
    dojo.place(resetButton.domNode, flipLineButton.domNode, 'after');
    resetButton.domNode.classList = deleteBtn.domNode.classList; //Not perfect, but pretty close
    if (adding) {
        resetButton.set('disabled', true);
    }

    resetButton.on("click", resetAssetUpdates);

    
    var dismissButton = new dijit.form.Button({label: "Dismiss", "class": "dismissButton"});
    dojo.place(dismissButton.domNode, resetButton.domNode, 'after');
    dismissButton.domNode.classList = attInspector.deleteBtn.domNode.classList; //Not perfect, but pretty close
    if (adding) {
       
        dismissButton.set('disabled', true);
       
    }
    dismissButton.on("click", clearAllSelections);
    // dismissButton.on("click", closeEdit);
    
   

    var joinLineButton = new dijit.form.Button({label: "Join*", "class": "joinLineButton", id: 'joinLineBtn'});
    dojo.place(joinLineButton.domNode, deleteBtn.domNode, 'after');
    joinLineButton.domNode.classList = deleteBtn.domNode.classList; //Not perfect, but pretty close
    domStyle.set(registry.byId('joinLineBtn').domNode, 'display', 'none');
    joinLineButton.on("click", lineJoinHandler);

    dojo.place(dojo.create("br"), joinLineButton.domNode, 'after');

    attInspector.on("attribute-change", function (evt) {
        //if(adding){ // when adding, we do not really want to roll back
        //}else{
        //store the updates to apply when the save button is clicked
        if (typeof dirtyFeatures[evt.feature.attributes.objectid] === 'undefined') {
            dirtyFeatures[evt.feature.attributes.objectid] = {};
        }
        //console.log('old val: '+evt.feature.attributes[evt.fieldName]+', new val: '+evt.fieldValue);
        dirtyFeatures[evt.feature.attributes.objectid][evt.fieldName] = evt.feature.attributes[evt.fieldName];
        evt.feature.attributes[evt.fieldName] = evt.fieldValue;
        postAttributeChangeAIupdate(evt);
        //}
    });

    attInspector.on("next", function (evt) {
        attInspectorOnChangeSelectionCommon(evt);
    });

    attInspector.on("previous", function (evt) {
        attInspectorOnChangeSelectionCommon(evt);
    });

    function attInspectorOnChangeSelectionCommon(evt) {
        attInspector.currentFeature = evt.feature;
        highlightEdit(evt.feature);
        registry.byId('attributeEditorContainer').setTitle(editTitle(evt.feature));
        lastSelFeat = evt.feature;
        activateToolbar(evt.feature);
        checkAndActivateFlip(evt.feature);
        updateEqSelection(evt.feature, eqEqSelect);
        checkAndActivateJoin();
    }

    //attInspector.on('keypress', attInspectorKeyHandler);
    //map.infoWindow.setContent(attInspector.domNode);
    //map.infoWindow.resize(380, 500);
    return attInspector;
}

function editTitle(f) {
    var t = f.attributes['otype'];
    return type2Name(t);
}

function highlightEdit(f) {
    //if (typeof lastEditHighligh === 'object' && lastEditHighligh !== null) { map.graphics.remove(lastEditHighligh); }
    //lastEditHighligh = f;
    //map.graphics.add(f, selMarker);
}

function checkAndActivateJoin() {
    var allFeatures = [].concat.apply([], assetsFeatureLayers.map(function (l) {
        return l.getSelectedFeatures();
    }));
    var lines = allFeatures.filter(function (f) {
        return f.geometry.type === 'polyline';
    });
    if (allFeatures.length === lines.length && lines.length === 2) {
        domStyle.set(registry.byId('joinLineBtn').domNode, 'display', 'inline');
    } else {
        domStyle.set(registry.byId('joinLineBtn').domNode, 'display', 'none');
    }
}

function checkAndActivateFlip(f) {
    if (f.geometry.type === 'polyline') {
        domStyle.set(registry.byId('flipLineBtn').domNode, 'display', 'inline');
    } else {
        domStyle.set(registry.byId('flipLineBtn').domNode, 'display', 'none');
    }
}

function updateEqSelection(f) { // f: featurte, d: dijit responsible for selection options
    console.log(f);
    f = f || attInspector.currentFeature;
    var d;
    if (f && typeof f.attributes !== 'undefined' && typeof f.attributes.otype !== 'undefined') {
        var ot = f.attributes.otype;
        if (EQ_OTYPES.indexOf(ot) >= 0) {
            d = eqEqSelect;
            console.log('Updating selection...', ot);
            var dbr = gs.model.eqdb.filter(function (db) {
                return typeof db.otypes !== 'undefined' ? db.otypes.indexOf(ot) >= 0 : false;
            });
            if (dbr.length > 0 && dbr[0].store) {
                d.set('store', dbr[0].store);
            } else {
                d.set('store', new dojo.store.Memory());
            }
            d.set('value', f.attributes['equipref']);
        } else if (LINE_OTYPES.indexOf(ot) >= 0) {
            console.log('Updating selection...', ot);
            var dbrCond = gs.model.eqdb.filter(function (db) {
                return typeof db.otypes !== 'undefined' ? db.otypes.indexOf(ot) >= 0 : false;
            });
            var dbrCons = gs.model.eqdb.filter(function (db) {
                return typeof db.otypes !== 'undefined' ? db.otypes.indexOf('construction') >= 0 : false;
            });
            if (dbrCond.length > 0 && dbrCond[0].store) {
                condSelect.set('store', dbrCond[0].store);
                neutSelect.set('store', dbrCond[0].store);
            } else {
                condSelect.set('store', new dojo.store.Memory());
                neutSelect.set('store', new dojo.store.Memory());
            }
            if (dbrCons.length > 0 && dbrCons[0].store) {
                consSelect.set('store', dbrCons[0].store);
            } else {
                consSelect.set('store', new dojo.store.Memory());
            }
            condSelect.set('pattern', AiSelPatGen);
            neutSelect.set('pattern', AiSelPatGen);
            consSelect.set('pattern', AiSelPatGen);
        }
    }
}

function confirmDelete(evt) {
    window.deleteEvt = evt;
    var confirmDeleteDialog = new ConfirmDialog({
        title: "",
        content: "Are you sure you want to delete this asset?",
        style: "width: 300px; z-index: 2000 !important;"
    });
    confirmDeleteDialog.okButton.on('click', function () {
        deleteAsset(window.deleteEvt);
        document.getElementById('attributeEditorWindowBack').style.display = "none";
        document.getElementById('confirmWindowBack').style.display = "none";
    });
    confirmDeleteDialog.cancelButton.on('click', function () {
        document.getElementById('confirmWindowBack').style.display = "none";
    });
    confirmDeleteDialog.show();
    document.getElementById('confirmWindowBack').style.display = "block";
    // document.getElementById('mapDiv_gc').style.display="none";
    // document.getElementById("dijit_ConfirmDialog_0").style.zIndex = 2000;
    
    
    // change
    var dijit_ConfirmDialog_0 = document.getElementById("dijit_ConfirmDialog_0");
    if(dijit_ConfirmDialog_0){
        document.getElementById("dijit_ConfirmDialog_0").style.zIndex = 2000;
    }
    var dijit_ConfirmDialog_1 = document.getElementById("dijit_ConfirmDialog_1");
    if(dijit_ConfirmDialog_1){
        document.getElementById("dijit_ConfirmDialog_1").style.zIndex = 2000;
    }
    var dijit_ConfirmDialog_2 = document.getElementById("dijit_ConfirmDialog_2");
    if(dijit_ConfirmDialog_2){
        document.getElementById("dijit_ConfirmDialog_2").style.zIndex = 2000;
    }
    var dijit_ConfirmDialog_3 = document.getElementById("dijit_ConfirmDialog_3");
    if(dijit_ConfirmDialog_3){
        document.getElementById("dijit_ConfirmDialog_3").style.zIndex = 2000;
    }

    var dijit_ConfirmDialog_4 = document.getElementById("dijit_ConfirmDialog_4");
    if(dijit_ConfirmDialog_4){
        document.getElementById("dijit_ConfirmDialog_4").style.zIndex = 2000;
    }
    var dijit_ConfirmDialog_5 = document.getElementById("dijit_ConfirmDialog_5");
    if(dijit_ConfirmDialog_5){
        document.getElementById("dijit_ConfirmDialog_5").style.zIndex = 2000;
    }
    var dijit_ConfirmDialog_6 = document.getElementById("dijit_ConfirmDialog_6");
    if(dijit_ConfirmDialog_6){
        document.getElementById("dijit_ConfirmDialog_6").style.zIndex = 2000;
    }
    var dijit_ConfirmDialog_7 = document.getElementById("dijit_ConfirmDialog_7");
    if(dijit_ConfirmDialog_7){
        document.getElementById("dijit_ConfirmDialog_7").style.zIndex = 2000;
    }

    var dijit_ConfirmDialog_8 = document.getElementById("dijit_ConfirmDialog_8");
    if(dijit_ConfirmDialog_8){
        document.getElementById("dijit_ConfirmDialog_8").style.zIndex = 2000;
    }
    var dijit_ConfirmDialog_9 = document.getElementById("dijit_ConfirmDialog_9");
    if(dijit_ConfirmDialog_9){
        document.getElementById("dijit_ConfirmDialog_9").style.zIndex = 2000;
    }


   /* for(let i = 0; i<=15; i++){
        //var dijit_ConfirmDialog = "dijit_ConfirmDialog_"+i;
        var dijit_ConfirmDialog = document.getElementById("dijit_ConfirmDialog_"+i);
        if(dijit_ConfirmDialog){
            
            break;
        }
        document.getElementById(dijit_ConfirmDialog).style.zIndex = 2000;
    }*/


    //document.getElementById("dijit_ConfirmDialog_0").style.zIndex = 2000; 
}

function deleteAsset(evt) {
    if (evt && typeof evt.feature !== 'undefined') {
        var f = evt.feature;
        preFeatureDelete(f);
        evt.feature.getLayer().applyEdits(null, null, [f]).then(function (add, upd, del) {
            console.log('Back from deleting...', del);
            clearAllSelections();
            lastSelFeat = null;
            adding = false;
            lastAdded = null;
            window.deleteEvt = null;
            gs.state && gs.state.templatePicker && gs.state.templatePicker.clearSelection();
            getBayList();
        });
    } else {
        console.log("delete event is null");
    }
}

function createEditToolbar(mainMap) {
    var et = new esri.toolbars.Edit(mainMap);
    //et.on('vertex-click', lineOpsHandler);
    /*et.on('graphic-move', function (e) {
        console.log(e);
    });*/
    return et;
}

function activateToolbar(graphic) {
    var tool = esri.toolbars.Edit.EDIT_VERTICES | esri.toolbars.Edit.MOVE;
    /*
    if (registry.byId("tool_move").checked) {
    tool = tool | esri.toolbars.Edit.MOVE;
    }
    if (registry.byId("tool_vertices").checked) {
    tool = tool | esri.toolbars.Edit.EDIT_VERTICES;
    }
    if (registry.byId("tool_scale").checked) {
    tool = tool | esri.toolbars.Edit.SCALE;
    }
    if (registry.byId("tool_rotate").checked) {
    tool = tool | esri.toolbars.Edit.ROTATE;
    }
    // enable text editing if a graphic uses a text symbol
    if ( graphic.symbol.declaredClass === "esri.symbol.TextSymbol" ) {
    tool = tool | esri.toolbars.Edit.EDIT_TEXT;
    }
    //specify toolbar options
    var options = {
        allowAddVertices: registry.byId("vtx_ca").checked,
        allowDeleteVertices: registry.byId("vtx_cd").checked,
        uniformScaling: registry.byId("uniform_scaling").checked
    };
    */
    var options = {
        allowAddVertices: true,
        allowDeleteVertices: true
    };
    editToolbar.activate(tool, graphic, options);
    checkAndAddSplit();
}

function checkAndAddSplit() {
    if (typeof editToolbar._vertexEditor !== 'undefined' && editToolbar._vertexEditor) {
        if (editToolbar._vertexEditor._ctxMenu.getChildren().length < 2) {
            var split = new dijit.MenuItem({
                label: "Split*",
                iconClass: "dijitEditorIcon dijitEditorIconCut",
                onClick: lineSplitHandler
            });
            editToolbar._vertexEditor._ctxMenu.addChild(split);
        }

    }
}

function preSaveAttributeUpdate(f) {
    var a;
    if (f && f.attributes) {
        a = f.attributes;
        console.log('Applying pre-save updates on secname:', a['secname']);
        var d= new Date();
        a['update_ts']= d.getTime()- d.getTimezoneOffset() * 60000; 
        a['gi_user'] = gs.user;
        a['guid']= a['guid'] || dojox.uuid.generateRandomUuid();
        if (LOAD_OTYPES.indexOf(a['otype']) >= 0) {
            assignLoadSymbol(f);
        } else if (LINE_OTYPES.indexOf(a['otype']) >= 0) {
            a['sym'] = a['otype'] + a['phasecode'] + '_' + (a['nom_v']?toStr(a['nom_v'], 1):'');
        }
    } else {
        console.log('Error in presave for feature:', f);
    }
}

function preFeatureDelete(f) {
}

/*
function addCircModelRecord(f) {
    //get circuits and see if it does not exit 
    //   if it does, update the end point to here
    //   else, insert new
    //   

}
*/

function saveAssetUpdates() {
    var addCircDef = null;
    if (dojo.byId('autoInserLoadRecordCB').checked && adding //registry.byId('attributeEditorContainer').title=='New Asset'
    ) {
        if (LOAD_OTYPES.indexOf(lastSelFeat.attributes['otype']) >= 0) {
            showAddLoadRecDialog(lastSelFeat.attributes['equipref']);
        }
        if (lastSelFeat.attributes['otype'] === 'source') {
            addCircDef = addCircModelRecord(lastSelFeat);
        }
    }

    all([assetsFeatureLayers.map(function (l) {
        if (l.getSelectedFeatures().length > 0) {
            console.log('Applying pre-save updates on layer:', l.name);
            l.getSelectedFeatures().forEach(preSaveAttributeUpdate);
            console.log('Applying changes to ', l.name);
            return l.applyEdits(null, l.getSelectedFeatures(), null, function (add, upd, del) {
                console.log('Save response: ', add, upd, del);
                addMessage("Geometries updated successfully!", 'success');
                if (upd.length > 0) {
                    var l = findLayerFromSelection(upd[0].objectId);
                    var st = gs.state && gs.state.templatePicker && gs.state.templatePicker.getSelected();
                    if (st && idSelTemplate(st, 'fl') === l) { // upon saving the new asset successfully, we clear the template picker
                        adding = false;
                        lastAdded = null;
                        gs.state && gs.state.templatePicker && gs.state.templatePicker.clearSelection();
                        getBayList();
                    }
                    if (l) updateDirtyFeatures(l.getSelectedFeatures());
                }
            }, applyEditsFailiureHandler);
        } else return null;
    })] + [addCircDef]).then(function (r) {
            console.log('Asset updates finished successfully.', r);
        }, function (e) {
            console.log('Asset updates failed.', e);
        }
    );
}

function findLayerFromSelection(oid) {
    var fls = assetsFeatureLayers.filter(function (fl) {
        return (fl.getSelectedFeatures().filter(function (f) {
            return f.attributes.objectid === oid;
        }).length > 0);
    });
    return (fls.length > 0) ? fls[0] : null;
}

function updateDirtyFeatures(features) {
    var updIds = features.map(function (g) {
        return g.attributes.objectid
    });
    features.forEach(function(feature) {
        if (typeof dirtyFeatures[feature.attributes.objectid] !== 'undefined' &&
            updIds.indexOf(feature.attributes.objectid) >= 0) {
            addMessage('Feature: object id: ' + feature.attributes.objectid + ':', 'success');
            for (var a in dirtyFeatures[feature.attributes.objectid]) {
                addMessage('Attribute: ' + a + ' changed to ' + feature.attributes[a] + ' from ' + dirtyFeatures[feature.attributes.objectid][a] + ' successfully.');
                delete dirtyFeatures[feature.attributes.objectid][a];
            }
            if (Object.keys(dirtyFeatures[feature.attributes.objectid]).length === 0) {
                console.log('All the commits went through successfully for ' + feature.attributes.objectid);
                delete dirtyFeatures[feature.attributes.objectid];
            } else {
                console.log('Remaining changes for objectid: ' + feature.attributes.objectid + ' : ' + dirtyFeatures[feature.attributes.objectid]);
            }
        }
    });
    if (Object.keys(dirtyFeatures).length === 0) {
        console.log('All the commits went through successfully.');
        clearAllSelections();
    } else {
        console.log('Some changes still left: ', dirtyFeatures);
    }
}

function resetAssetUpdates() {
    var features = [].concat.apply([], arrayUtils.map(assetsFeatureLayers, function (l) {
        return l.getSelectedFeatures();
    }));
    features.forEach(function (feature) {
        if (typeof dirtyFeatures[feature.attributes.objectid] !== 'undefined') {
            for (var a in dirtyFeatures[feature.attributes.objectid]) {
                feature.attributes[a] = dirtyFeatures[feature.attributes.objectid][a];
            }
            delete dirtyFeatures[feature.attributes.objectid];
        }
    });
    if (Object.keys(dirtyFeatures).length !== 0) {
        console.log('Remaining dirty assets after reset!', dirtyFeatures);
    }
    attInspector.refresh();
}

function setupGeometryAddition() {
    console.log('Starting geometry additions...')
    gs.state.templatePicker = setupTemplatePicker(assetsFeatureLayers, "templatePickerDiv");
    gs.state.drawToolbar = setupDrawToolbar(map);
    //window.templatePicker = gs.state.TemplatePicker;
    //window.drawToolbar = gs.state.drawToolbar;
}

function setupTemplateItems() {
    var defMatchKey = 'value';
    var defSym = new esri.symbol.PictureMarkerSymbol("img/weather/tornado.png", 25, 30);
    var genAttributes = {};
    var items = [
        //  symKey: label key for the symbol in the feature layer symbols - assumes UniqueValueRenderer
        {
            label: "Overhead Line",
            symKey: 'value',
            value: 'ohABC',
            featureLayer: aflLines,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'oh',}), null),
            symbol: null,
            description: "Overhead Line",
        },
        {
            label: "Underground Line",
            symKey: 'value',
            value: 'ugABC',
            featureLayer: aflLines,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'ug',}), null),
            symbol: null,
            description: "Underground Line",
        },
        {
            label: "Load",
            symKey: 'value',
            value: 'N11A',
            featureLayer: aflLoads,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'load',}), null),
            symbol: null,
            description: "Load",
        },
        {
            label: "Transformer",
            symKey: 'otype',
            featureLayer: aflEquips,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'transformer',}), null),
            symbol: null,
            description: "Transformer",
        },
        {
            label: "Regulator",
            symKey: 'otype',
            featureLayer: aflEquips,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'regulator',}), null),
            symbol: null,
            description: "Regulator",
        },
        {
            label: "Capacitor",
            symKey: 'otype',
            featureLayer: aflEquips,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'capacitor',}), null),
            symbol: null,
            description: "Capacitor",
        },
        {
            label: "Motor",
            symKey: 'otype',
            featureLayer: aflEquips,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'motor',}), null),
            symbol: null,
            description: "Motor",
        },
        {
            label: "Source",
            symKey: 'otype',
            featureLayer: aflEquips,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'source',}), null),
            symbol: null,
            description: "Source",
        },
        {
            label: "Switch",
            symKey: 'otype',
            featureLayer: aflEquips,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'switch',}), null),
            symbol: null,
            description: "Switch",
        },
        {
            label: "Recloser",
            symKey: 'otype',
            featureLayer: aflEquips,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'recloser',}), null),
            symbol: null,
            description: "Recloser",
        },
        {
            label: "Breaker",
            symKey: 'otype',
            featureLayer: aflEquips,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'breaker',}), null),
            symbol: null,
            description: "Breaker",
        },
        {
            label: "Fuse",
            symKey: 'otype',
            featureLayer: aflEquips,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'fuse',}), null),
            symbol: null,
            description: "Fuse",
        },
        {
            label: "Generator",
            symKey: 'otype',
            featureLayer: aflEquips,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {otype: 'generator',}), null),
            symbol: null,
            description: "Generator",
        },
        {
            label: "Pole",
            symKey: 'otype',
            featureLayer: aflPoles,
            prototype: new esri.Graphic(null, null, dojo.mixin(dojo.clone(genAttributes), {
                otype: 'pole',
                tech_name: 'GRIDSIGHT'
            }), null),
            symbol: null,
            description: "Pole",
        },
    ];
    items.forEach(function (i) {
        var sym = null;
        if (i.featureLayer) {
            if (i.featureLayer.renderer instanceof esri.renderer.UniqueValueRenderer) {
                if (i.symKey) {
                    var syms = i.featureLayer.renderer.infos;
                    if (['label', 'value', 'describtion'].indexOf(i.symKey) >= 0 && typeof i[i.symKey] !== 'undefined') {
                        var fsy = syms.filter(function (s) {
                            return (typeof s[i.symKey] !== 'undefined' ? s[i.symKey] === i[i.symKey] : false);
                        });
                        sym = fsy.length ? (typeof fsy[0]['symbol'] !== 'undefined' ? fsy[0].symbol : null) : null;
                    } else if (i.symKey === 'otype') {
                        var ot = typeof i.prototype !== 'undefined' ? (typeof i.prototype.attributes !== 'undefined' ? (typeof i.prototype.attributes.otype !== 'undefined' ? i.prototype.attributes.otype : null) : null) : null;
                        var matchKey = (typeof i.matchKey !== 'undefined' && i.matchKey) ? i.matchKey : defMatchKey;
                        var fsy = syms.filter(function (s) {
                            return (typeof s[matchKey] !== 'undefined' ? s[matchKey] === ot : false);
                        });
                        sym = fsy.length ? (typeof fsy[0]['symbol'] !== 'undefined' ? fsy[0].symbol : null) : null;
                    }

                }
            } else if (i.featureLayer.renderer instanceof esri.renderer.SimpleRenderer) {
                sym = i.featureLayer.renderer.getSymbol();
            }
        }
        i.symbol = (typeof i.symbol !== 'undefined' && i.symbol) ? i.symbol : (sym ? sym : defSym);
    });
    return items;
}

function setupTemplatePicker(layers, div) {
    var tp= null;
    console.log('Setting up templatePicker...');
    if (! (gs.state && gs.state.templatePicker)) {
        console.log('need a new templatePicker...');
        tp = new esri.dijit.editing.TemplatePicker({
            //featureLayers: layers,
            items: setupTemplateItems(),
            rows: "auto",
            grouping: false,
            columns: 6,
            showTooltip: false,
            useLegend: true,
            style: "height: 200px; width: 95%; display:none;"
        }, div);
        tp.on("selection-change", templateChange);
        tp.startup();
    }else{
        console.log('We had a templatePicker, just passing along.');
        tp= gs.state.templatePicker;
    }
    //gs.state.templatePicker= templatePicker;
    return tp;
}

function idSelTemplate(st, key) {
    key = key || 'otype';
    var fl = null, prot = null;

    //feature layer
    fl = st.featureLayer !== 'undefined' ? st.featureLayer : null;
    if (!fl && typeof st.item !== 'undefined') {
        fl = typeof st.item.featureLayer !== 'undefined' ? st.item.featureLayer : null
    }
    // prototype
    if (typeof st.template !== 'undefined') {
        prot = st.template.prototype !== 'undefined' ? st.template.prototype : null;
    }
    if (!prot && typeof st.item !== 'undefined') {
        prot = st.item.prototype !== 'undefined' ? st.item.prototype : null;
    }
    if (key === 'fl') {
        return fl;
    } else if (key === 'prot') {
        return prot;
    } else if (key === 'otype') {
        if (prot && typeof prot.attributes !== 'undefined' && typeof prot.attributes.otype !== 'undefined') {
            return prot.attributes.otype;
        } else {
            if (fl === aflPoles) { // we can mix between feature layer, item and template based identification
                return 'pole';
            } else if (typeof st.type !== 'undefined' && typeof st.type.id !== 'undefined') {
                return st.type.id;
            }
        }
    } else if (key === 'gt') {
        if (fl) { // feature layer takes priority
            return fl.geometryType;
        } else if (typeof st.item !== 'undefined' && typeof st.item.geometryType !== 'undefined') {
            return st.item.geometryType;
        }
    } else if (key === 'name') {
        var name = null;
        if (typeof st.template !== 'undefined') {
            name = st.template.name !== 'undefined' ? st.template.name : null;
        }
        if (!name && typeof st.item !== 'undefined') {
            name = st.item.label !== 'undefined' ? st.item.label : null;
        }
        return name;
    }
    return null;
}

function templateChange(evt) {
    var otype;
    var st = gs.state && gs.state.templatePicker && gs.state.templatePicker.getSelected();
    console.log('Selected Template: ', st);
    var msg;
    if (st && !adding && !drawing) {
        ewHide();
        assetsFeatureLayers.forEach(function (l) {
            l && l.clearSelection();
        });
        otype = idSelTemplate(st, 'otype');
        console.log('Slected template type: ', otype);
        msg = "Click to add a new asset";
        switch (otype) {
            case "residential":
                msg = "Click to add a new residential consumer";
                break;
            case "smallconsumer":
                msg = "Click to add a new small consumer";
                break;
            case "largeconsumer":
                msg = "Click to add a new large consumer";
                break;
            case "load":
                msg = "Click to add a new load";
                break;
            case "transformer":
                msg = "Click to add a new transformer";
                break;
            case "capacitor":
                msg = "Click to add a new capacitor";
                break;
            case "regulator":
                msg = "Click to add a new regulator";
                break;
            case "source":
                msg = "Click to add a new source";
                break;
            case "oh":
                msg = "Click to add a new overhead conductor";
                break;
            case "ug":
                msg = "Click to add a new underground conductor";
                break;
            case "pole":
                msg = "Click to add a new pole";
                break;
            case "generator":
                msg = "Click to add a new generator";
                break;
        }
        jsapiBundle.toolbars.draw.addPoint = msg;
        jsapiBundle.toolbars.draw.addShape = msg;
        //if(!drawing && !adding){
        startDrawing(evt);
        //}
    } else {
         //console.log('nahi yaha aa raha hai ye')
        if (!adding && !drawing) {
            drawing = false;
            adding = false;
            lastAdded = null;
            gs.state.drawToolbar.deactivate();
        } else {
            //need to interrupt the ongoing process...
            exitAdditionProcess();
        }
    }
}

function startDrawing(evt) {
    //console.log('yaha aa raha hai ye')
    assetsFeatureLayers.forEach(function (l) {
        l && l.clearSelection();
    });
    var st = gs.state && gs.state.templatePicker && gs.state.templatePicker.getSelected();
    console.log('Selected Template: ', st)
    var otype = idSelTemplate(st, 'otype');
    var gt = idSelTemplate(st, 'gt');
    //if( st ) {
    drawing = true;
    adding = true;
    var msg = "Click to add a new asset";
    console.log(gt);

    switch (otype) {
        case "residential":
        case "smallconsumer":
        case "largeconsumer":
        case "load":
            //if(dojo.byId('autoInserLoadRecordCB').checked) showAddLoadRecDialog();
            break;
        case "transformer":
            break;
        case "capacitor":
            break;
        case "regulator":
            break;
        case "source":
            // if (dojo.byId('autoInserLoadRecordCB').checked) {
                showAddSourceModelRecordDialog();
            // }
            break;
    }
    switch (gt) {
        case "esriGeometryPoint":
            gs.state.drawToolbar.activate(esri.toolbars.Draw.POINT);
            break;
        case "esriGeometryPolyline":
            gs.state.drawToolbar.activate(esri.toolbars.Draw.POLYLINE);
            break;
        //case "esriGeometryPolygon":
        //	gs.state.drawToolbar.activate(Draw.POLYGON);
        //	break;
    }
}

function setupDrawToolbar(map) {
    //console.log('ab yaha aagaya');
    jsapiBundle.toolbars.draw.addPoint = "Click to add a new asset";
    jsapiBundle.toolbars.draw.addShape = "Click to add a new asset";
    var dtb = new esri.toolbars.Draw(map, {showTooltips: true,});
    dtb.on("draw-end", addNewAsset);
    return dtb;
}

function addNewAsset(evt) {
    console.log('Draw end, adding the new asset.', evt);
    gs.state.drawToolbar.deactivate();
    ML.getCoordinates(evt.geometry, 103160, function (res) {
        // console.log('Get Coordinates result',res);
        ML.convertToMapLoc(res);
        var geo = res[0];
        var st = gs.state && gs.state.templatePicker && gs.state.templatePicker.getSelected();
        if (st) {
            var prot = idSelTemplate(st, 'prot');
            var fl = idSelTemplate(st, 'fl');
            var newAttr = {};
            if (fl) {
                if (prot && typeof prot.attributes !== 'undefined') {
                    newAttr = dojo.mixin(newAttr, prot.attributes);
                }
                newAttr['status'] = '111';
                if (!newAttr['otype']) {
                    console.log('Warning: template had no otype.');
                    if (fl === aflLines) {
                        newAttr['otype'] = 'oh';
                    } else if (fl === aflEquips) {
                    } else if (fl === aflLoads) {
                        newAttr['otype'] = 'load';
                    } else if (fl === aflPoles) {
                        newAttr['otype'] = 'pole';
                    } else {
                        console.log('Cannot assign feature type... addition aborted.');
                        ewHide();
                        adding = false;
                        lastAdded = null;
                    }
                }
                //legacy type correction for wires
                newAttr['otype'] = newAttr['otype'] === 'wire' ? 'oh' : newAttr['otype'];

                //console.log('Last Selected Feature: ', lastSelFeat);
                
                var uuid= dojox.uuid.generateRandomUuid();
                newAttr['secname'] = newAttr['otype'].toUpperCase() + '-' + uuid.split('-')[0].toUpperCase();
                newAttr['guid'] = uuid;
                var d= new Date();
                newAttr['creation_ts'] = d.getTime()- d.getTimezoneOffset() * 60000;
                newAttr['gi_user'] = gs.user;
                newAttr['phasecode'] = null;
                newAttr['circuit'] = null;
                if (lastSelFeat) {
                    newAttr['circuit'] = lastSelFeat.attributes['circuit'];
                    newAttr['phasecode'] = lastSelFeat.attributes['phasecode'];
                    newAttr['wo'] = lastSelFeat.attributes['wo'];

                    if (['source', 'regulator', 'oh', 'ug'].indexOf(lastSelFeat.attributes['otype']) >= 0) {
                        newAttr['parentsec'] = lastSelFeat.attributes['secname'];
                    } else if (['residential', 'smallconsumer', 'largeconsumer', 'capacitor'].indexOf(lastSelFeat.attributes['otype']) >= 0) {
                        newAttr['parentsec'] = lastSelFeat.attributes['parentsec'];
                    }
                } else {
                    if (['residential', 'load'].indexOf(newAttr['otype']) === -1) {
                        newAttr['phasecode'] = 'A';
                    } else {
                        newAttr['phasecode'] = 'ABC';
                    }
                }

                switch (newAttr['otype']) {
                    case 'wire':
                    case 'oh':
                    case 'ug':
                        if (lastSelFeat && LINE_OTYPES.indexOf(lastSelFeat.attributes['otype']) != -1) {
                            newAttr['conductor'] = lastSelFeat.attributes['conductor'];
                            newAttr['neutral'] = lastSelFeat.attributes['neutral'];
                            newAttr['construction'] = lastSelFeat.attributes['construction'];
                        } else {
                            newAttr['conductor'] = '#4 Aluminum';
                            newAttr['neutral'] = '#4 Aluminum';
                            newAttr['construction'] = 'SystemCnstDefault';
                        }
                        break;
                    case 'regulator':
                        if (lastSelFeat && lastSelFeat.attributes['otype'] === 'regulator') {
                            newAttr['equipref'] = lastSelFeat.attributes['equipref'];
                            newAttr['pars'] = lastSelFeat.attributes['pars'];
                        } else {
                            newAttr['pars'] = '{"fhLo":"0.800000011920929","fhHi":"1.20000004768372","ldcX":"0","vOut":"1.04166662693024","ldcR":"0"}';
                            if (newAttr['phasecode'].length > 1) {
                                newAttr['equipref'] = '3PH 14.4V 100AMP';
                            } else {
                                newAttr['equipref'] = '1PH 7.2V 100AMP';
                            }
                        }
                        break;
                    case 'capacitor':
                        if (lastSelFeat && lastSelFeat.attributes['otype'] === 'capacitor') {
                            newAttr['equipref'] = lastSelFeat.attributes['equipref']
                        } else {
                            newAttr['equipref'] = '';
                            /*
		                    if (newAttr['phasecode'].length > 1) {
		                        newAttr['equipref'] = '300KVAR@14.4';
		                    } else {
		                        newAttr['equipref'] = '50KVAR@14.4';
		                    }*/
                        }
                        break;
                    case 'transformer':
                        if (lastSelFeat && lastSelFeat.attributes['otype'] === 'transformer') {
                            newAttr['equipref'] = lastSelFeat.attributes['equipref'];
                            newAttr['pars'] = lastSelFeat.attributes['pars'];
                        } else {
                            newAttr['pars'] = '{"wdgCode":"Y-Y","vInput":"14.4","vOut":"7.2","vOutNom":"7.2"}';
                            if (newAttr['phasecode'].length > 1) {
                                newAttr['equipref'] = '3PH 14.4:7.2 500KVA';
                            } else {
                                newAttr['equipref'] = '3PH 14.4:7.2 500KVA';
                            }
                        }
                        break;
                    case 'residential':
                    case 'smallconsumer':
                    case 'largeconsumer':
                    case 'load':
                        if (insertedMeterNumber) {
                            newAttr['ophase'] = '';
                            newAttr['equipref'] = insertedMeterNumber;
                        }
                        //For HOTEC, assing secname, equipref and meternum from maploc
                        console.log('Using maploc for attributes...', ML.formatMapLoc(lastMapLoc, 12));
                        newAttr['secname'] = ML.formatMapLoc(lastMapLoc, 12);
                        newAttr['equipref'] = ML.formatMapLoc(lastMapLoc, 12);
                        //newAttr['meter_num'] = ML.formatMapLoc(lastMapLoc, 12);
                        newAttr['rateclass'] = '11A';
                        newAttr['revclass'] = 1;
                        newAttr['trans_size'] = 25;
                        newAttr['status'] = phaseToStatus(newAttr['phasecode']);
                        newAttr['ophase'] = '';
                        break;
                    case 'source':
                        if (insertedSourceEquipref) {
                            newAttr['equipref'] = newFeederName;
                            newAttr['circuit'] = newFeederName;
                        }
                        newAttr['phasecode'] = 'ABC';
                        break;
                    case 'pole':
                        newAttr['id']= newAttr['guid'];
                        break;
                }

                var newGraphic = new esri.Graphic(geo, null, newAttr);
                console.log('New graphic: ', newGraphic);
                drawing = false;
                adding = true;
                fl.applyEdits([newGraphic]).then(function (add) {
                    console.log('Back from applying the geometry edits, here is what is sent back: ', add);
                    assetsLayer.refresh();

                    owHide();
                    console.log('Newly added feature: ', add);
                    var adding;
                    if (!add[0].success) {
                        console.log('Add Failed!');
                        ewHide();
                        adding = false;
                        lastAdded = null;
                    } else {
                        attInspector = initAttInspector();
                        lastAdded = add[0].objectId;
                        // selecting the newly added feature for editing attributes
                        var sq = new esri.tasks.Query();
                        sq.geometry = map.extent;
                        sq.objectIds = [lastAdded];
                        fl.selectFeatures(sq, esri.layers.FeatureLayer.SELECTION_NEW).then(function (features) {
                            console.log('Added feature selected:', features);
                            //st.featureLayer.clearSelection();
                            ewShow();
                            if (features.length > 0) {
                                //console.log('Found the edit feature(s): '+features.length);
                                registry.byId('attributeEditorContainer').setTitle('New Assets');
                                registry.byId('attributeEditorContainer').setContent(attInspector.domNode);
                                dojo.style(attributeEditorContainer.domNode, 'top', '116px');  
                                dojo.style(attributeEditorContainer.domNode, 'left', '156px');
                                dojo.style(attributeEditorContainer.domNode, 'position', 'absolute'); 
                                dojo.style(attributeEditorContainer.domNode, 'visibility', 'visible');
                                dojo.style(attributeEditorContainer.domNode, 'opacity', '1');
                                dojo.style(attributeEditorContainer.domNode, 'z-index', top_z_index); 
                            
                                lastSelFeat = features[0];
                                updateEqSelection(lastSelFeat);
                                // new consumer should be inserted now, so it is safe to reset the newly inserted meter number
                                if (insertedMeterNumber) {
                                    insertedMeterNumber = null;
                                }
                                if (insertedSourceEquipref) {
                                    insertedSourceEquipref = null;
                                }
                                activateToolbar(features[0]);
                            } else {
                                console.log('Lost the feature we just added...');
                                assetsFeatureLayers.forEach(function (l) {
                                    l && l.clearSelection();
                                });
                            }
                        });
                    }
                }, applyEditsFailiureHandler);
            }
        }
    });
}

function applyEditsFailiureHandler(e) {
    console.log('Apply edits failed: ', e);
    addMessage('Failed to apply changes!', 'error');
    adding = false;
    if (drawing) {
        exitAdditionProcess();
    }
    gs.state && gs.state.templatePicker && gs.state.templatePicker.clearSelection();
    getBayList();
}

function exitAdditionProcess() {
    console.log('Exit addition process...');
    if (drawing) {
        drawing = false;
        adding = false;
        lastAdded = null;
        gs.state.drawToolbar.deactivate();
    } else {
        // drawing finished but still not finished with adding
        if (lastAdded) {
            // delete the incompletely added object
            arrayUtils.forEach(assetsFeatureLayers, function (l) {
                var fs = arrayUtils.filter(l.getSelectedFeatures(), function (f) {
                    return f.attributes['objectid'] === lastAdded;
                });
                if (fs.length > 0) {
                    console.log('Found the premature feature...', fs[0]);
                    l.applyEdits(null, null, [fs[0]]).then(function (add, upd, del) {
                        console.log('Back from deleting the immaturely added asset...', del);
                        clearAllSelections();
                        lastSelFeat = null;
                        adding = false;
                        lastAdded = null;
                        assetsLayer.refresh();
                    }, applyEditsFailiureHandler);
                }
            });
        }
    }

}


function measureRollingDistance(e) {
    if (drawing) {
        //console.log(e);
        var t = dojo.query('.tooltip');
        if (t.length > 0) {
            if (gs.state.drawToolbar._points.length <= 0) {
                var pt = esri.geometry.webMercatorToGeographic(e.mapPoint);
                t[0].innerHTML = toStr(pt.y, 1e-4) + ', ' + toStr(pt.x, 1e-4);
            } else {
                var pl = new esri.geometry.Polyline();
                pl.addPath([gs.state.drawToolbar._points[gs.state.drawToolbar._points.length - 1], e.mapPoint]);
                t[0].innerHTML = toStr(esri.geometry.geodesicLengths([esri.geometry.webMercatorToGeographic(pl)], esri.Units.FEET)[0], 1, true) + ' ft';
            }
        }

    }
}


function lineSplitHandler(e) {
    console.log('Splitting!');
    //if (false && lineOp == 1) {
    var origLine;
    var ptIdx;
    var newLine;
    var uf;
    var otherQueries;
    if (typeof editToolbar._vertexEditor !== 'undefined') {
        /*snapManager.getSnappingPoint(evt.screenPoint).then(function (snapPt) {
            if (snapPt !== undefined) {
            console.log('Snap point: ', snapPt);
            }
        });*/
        //window.e = e;
        //origLine = e.graphic;
        //ptIdx = e.vertexinfo.pointIndex;
        origLine = editToolbar._vertexEditor._selectedMover.relatedGraphic;
        ptIdx = editToolbar._vertexEditor._selectedMover.ptIndex;
        if (!(ptIdx > 0 && ptIdx < origLine.geometry.paths[0].length - 1)) {
        } else {
            newLine = new esri.Graphic(origLine.toJson());
            origLine.geometry.paths[0].splice(ptIdx + 1);
            newLine.geometry.paths[0].splice(0, ptIdx);
            //console.log('Path pieces:', origLine.geometry.paths[0], newLine.geometry.paths[0]);
            // need to change the secname and parentsec
            newLine.attributes['parentsec'] = origLine.attributes['secname'];

            uf = new UniqueFinder(origLine.getLayer(), 'secname');
            var q = new esri.tasks.Query();
            q.where = "parentsec='" + origLine.attributes['secname'] + "'";
            otherQueries = assetsFeatureLayers.filter(function (l) {
                return l !== origLine.getLayer() && l.fields.map(function (f) {
                    return f.name;
                }).indexOf('parentsec') >= 0;
            }).map(function (l) {
                return l.queryFeatures(q);
            });
            all([origLine, newLine, uf.find(origLine.attributes['secname']), origLine.getLayer().queryFeatures(q)].concat(otherQueries)).then(function (res) {
                console.log('Results:', res);
                origLine = res[0];
                newLine = res[1];
                var newSecName = res[2];
                var childrenFS = res[3];
                newLine.attributes['secname'] = newSecName;
                newLine.attributes['objectid'] = null;
                window.cfs = childrenFS;
                childrenFS.features.forEach(function (f) {
                    f.attributes['parentsec'] = newSecName;
                });
                childrenFS.features.push(origLine);
                origLine.getLayer().applyEdits([newLine], childrenFS.features).then(function (add, upd) {
                    console.log('Back from applying split geometries:', add, upd);
                    //lineOp = 0;
                    //registry.byId('joinLineBtn').set("disabled", false);
                    assetsFeatureLayers.forEach(function (l) {
                        l && l.clearSelection();
                    });
                    ewHide();
                });
                res.slice(4).forEach(function (fs) {
                    if (fs.features.length > 0) {
                        fs.features.forEach(function (f) {
                            f.attributes['parentsec'] = newSecName;
                        });
                        fs.features[0].getLayer().applyEdits(null, fs.features).then(function (add, upd) {
                            console.log('Parents updated...', upd);
                        });
                    }
                });
            });
        }
    } else {
        console.log('Vertex editor is not active...');
    }
}


function lineJoinHandler() {
    var allFeatures = [].concat.apply([], assetsFeatureLayers.map(function (l) {
        return l.getSelectedFeatures();
    }));
    var lines = allFeatures.filter(function (f) {
        return f.geometry.type === 'polyline';
    });
    if (allFeatures.length === lines.length && lines.length === 2) {
        console.log('Checking geometries for join...');

        var pi = -1;
        if (lines[0].attributes['parentsec'] === lines[1].attributes['secname']) {
            pi = 1;
        }
        else if (lines[1].attributes['parentsec'] === lines[0].attributes['secname']) {
            pi = 0;
        }

        if (pi >= 0) {
            var ci = (pi) ? 0 : 1;
            var pend = lines[pi].geometry.paths[0][lines[pi].geometry.paths[0].length - 1];
            var cbeg = lines[ci].geometry.paths[0][0];
            if (pend[0] === cbeg[0] && pend[1] === cbeg[1]) {
                console.log('Lines are overlapping, ready for join...');
                lines[pi].geometry.paths[0] = lines[pi].geometry.paths[0].concat(lines[ci].geometry.paths[0].slice(1));
                // new geometry is ready, now going after parents
                var q = new esri.tasks.Query();
                q.where = "parentsec='" + lines[ci].attributes['secname'] + "'";
                var qs = assetsFeatureLayers.filter(function (l) {
                    return l.fields.map(function (f) {
                        return f.name;
                    }).indexOf('parentsec') >= 0;
                }).map(function (l) {
                    return l.queryFeatures(q);
                });
                all([lines[pi], lines[ci]].concat(qs)).then(function (res) {
                    var pl = res[0], cl = res[1];
                    pl.getLayer().applyEdits(null, [pl], [cl]).then(function (add, upd, del) {
                        console.log('Join complete!', upd, del);
                        assetsFeatureLayers.forEach(function (l) {
                            l && l.clearSelection();
                        });
                        ewHide();
                    });
                    res.slice(2).forEach(function (fs) {
                        console.log('Updating parents after join...', fs);
                        if (fs.features.length > 0) {
                            fs.features.forEach(function (f) {
                                f.attributes['parentsec'] = pl.attributes['secname'];
                            });
                            fs.features[0].getLayer().applyEdits(null, fs.features).then(function (add, upd) {
                                console.log('Parents updated...', upd);
                            });
                        }
                    });
                });
            } else {
                console.log('Lines are not overlapping...');
            }
        } else {
            console.log('Parent-child relationship not valid for join.');
        }

    } else {
        console.log('Invalid selection set for join.');
    }

}

function lineFlipHandler(e) {
    if (typeof editToolbar._vertexEditor !== 'undefined') {
        editToolbar._vertexEditor.graphic.geometry.paths[0].reverse();
    } else {
        console.log('Vertex editor is not active...');
    }
}

/*
function initEditor(evt) {

	// snapping is enabled for this sample - change the tooltip to reflect this
	jsapiBundle.toolbars.draw.start = jsapiBundle.toolbars.draw.start +  "<br>Press <b>CTRL</b> to enable snapping";
	//map.addLayers([waterbodies,rivers]);


	var templateLayers = arrayUtils.map(arrayUtils.filter(evt.layers, function(result){ 
		return (typeof result.layer.getEditCapabilities==='function'); }),function(result){
		return result.layer;
		});
	console.log(templateLayers);
	var templatePicker = new esri.dijit.editing.TemplatePicker({
		featureLayers: templateLayers,
		grouping: true,
		rows: "auto",
		columns: 3
		}, "templateDiv");
	templatePicker.startup();

	var layers = arrayUtils.map(arrayUtils.filter(evt.layers, function(result){ 
		return (typeof result.layer.getEditCapabilities==='function'); }),function(result){
		return result.layer;
		});
	var settings = {
		map: map,
		templatePicker: templatePicker,
		layerInfos: layers,
		toolbarVisible: true,
		createOptions: {
		  polylineDrawTools:[ esri.dijit.editing.Editor.CREATE_TOOL_FREEHAND_POLYLINE ]
		},
		toolbarOptions: {
		  reshapeVisible: true
		}
	};

	var params = {settings: settings};    
	var myEditor = new esri.dijit.editing.Editor(params,'editorDiv');
	//define snapping options
	var symbol = new esri.symbol.SimpleMarkerSymbol( esri.symbol.SimpleMarkerSymbol.STYLE_CROSS, 
		15,  new esri.symbol.SimpleLineSymbol( "solid",  new esri.Color([255, 0, 0, 0.5]), 5 ),  null
	);
	myEditor.startup();
}
*/
