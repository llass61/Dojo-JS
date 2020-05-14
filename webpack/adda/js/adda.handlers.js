function enableAddNewAssets() {
    // switchEditing()
    if (!(dojo.byId('inserNewAssetsCB').checked)) {
        exitAdditionProcess();
        gs.state.templatePicker && gs.state.templatePicker.clearSelection();
        domStyle.set('templatePickerDiv', 'display', 'none');
    } else {
        setupGeometryAddition();
        domStyle.set('templatePickerDiv', 'display', '');
        gs.state.templatePicker && gs.state.templatePicker.update();
    }
    clearAllSelections();
}

function switchEditing() {
    editable = dojo.byId('editableCB').checked;
    if (!editable) {
        //exitAdditionProcess(); this will automatically happen when we uncheck inserNewAssetsCB
        registry.byId('inserNewAssetsCB').set('checked', false);
        registry.byId('inserNewAssetsCB').set('disabled', true);
        registry.byId('autoInserLoadRecordCB').set('disabled', true);
        //registry.byId('topoEditCB').set('checked', false );
    } else {
        registry.byId('inserNewAssetsCB').set('disabled', false);
        registry.byId('autoInserLoadRecordCB').set('disabled', false);
    }
    clearAllSelections();
    /*var fi=attInspector.layerInfos[0].fieldInfos;
    for(var i=0; i<fi.length; i++){
        if(editableFields.indexOf(fi[i].fieldName) > -1 ) {
            fi[i].isEditable=editable;
            //console.log('Switched editability for field '+fi[i].fieldName+' to '+fi[i].isEditable);
        }
    }*/
}

function delCaseStudyHandler() {
    cs = registry.byId('caseStudyManSel').value;
    if (cs !== '') {
        console.log('Deleting case Study: ' + cs);
        deleteCaseStudy(cs);
    }
}

function delIntCaseStudyHandler() {
    ics = registry.byId('intCaseStudyManSel').value;
    if (ics !== '') {
        console.log('Deleting interval case Study: ' + ics);
        deleteIntCaseStudy(ics);
    }
}

/* case study pane */

function caseStudyButtonHandler() {
    runCaseStudy();
}

function caseStudyButtonCancelButtonHandler() {
    cancelCaseStudy();
}
/* run Connectivity check*/
function connectivityCheckButtonHandler() {
    runConnectivityCheck();
}

function connectivityCheckButtonCancelHandler() {
    cancelConnectivityCheck();
}



/* messages pane */
function msgClearButtonHandler() {
    dojo.byId('msgRoll').innerHTML = '';
    unseenMessageCount = 0;
    dojo.byId('msgTitlePanes').innerHTML = '';
    registry.byId('msgTitlePane').set('title', 'Messages');
  

}

function updateMessagePaneTitle() {
    dojo.byId('msgTitlePanes').innerHTML = unseenMessageCount;
    var tp = registry.byId('msgTitlePane');
    if (tp.open) {
        dojo.byId('msgTitlePanes').innerHTML = '';
        //alert('test');
        unseenMessageCount = 0;
    }
    if (unseenMessageCount === 0) {
        tp.set('title', 'Messages');
        tp.titleNode.style.fontWeight = "";
    } else {
        registry.byId('msgTitlePane').set('title', 'Messages (' + unseenMessageCount + ')');
        tp.titleNode.style.fontWeight = "bold";
    }
}

// change
/* Feeder/source info  */

function showAddSourceModelRecordDialog() {
    //addSourceModelRecordDialog.show();
    //gs.state.addingNewSourceModel = true;
    //sourceModelRecDialog.show();
    //var tp = registry.byId('modelTabSel').value;
    var strUser = registry.byId('modelTabSel').value;
    if(strUser=='conductor')
    {
    gs.state.addingNewSourceModel = true;
    condModelRecDialog.show();

    }
    else if(strUser=='source')
    {
    gs.state.addingNewSourceModel = true;
    sourceModelRecDialog.show();
    }
     else if(strUser=='transformer')
    {
    gs.state.addingNewSourceModel = true;
    transModelRecDialog.show();  
    }
     else if(strUser=='cap')
    {
    gs.state.addingNewSourceModel = true;
    capModelRecDialog.show();  
    }
     else
    {
    gs.state.addingNewSourceModel = true;
    regModelRecDialog.show();
    document.getElementById("regModelName").style.zIndex = 2000; 
    }
}


function addCircModelRecord(f, forceUpdate) {
    forceUpdate = forceUpdate || false;
    if (f && typeof (f["attributes"]) !== 'undefined') {
        var a = f["attributes"];
        var circRec = getEquipment(a['circuit'], 'circuit');
        var isNew = true;
        if (circRec) {
            console.log('Circuit record exists.', circRec);
            if (forceUpdate) {
                circRec.attributes = lang.mixin(circRec.attributes, {
                    equipref: a['circuit'],
                    secname: a['secname'],
                    otype: a['otype'],
                });
                console.log('Force circuit record update.', circRec);
            }
            isNew = false;
        } else {
            console.log('Circuit record does not exists');
            circRec = {attributes: {equipref: a['circuit'], secname: a['secname'], otype: a['otype'],}};
        }
        return eqModelUpdate(circRec, 'circuit', isNew).then(circModelUpdateSuccess, circModelUpdateFailiur);
        /*
        circTab = new esri.layers.FeatureLayer(featureService + '/' + gs.layInds['model_circuit']);
        circRecord = { attributes: { equipref: a['equipref'], secname: a['secname'], otype: a['otype'],} };
        console.log('Checking if the circuit exists:', circRecord.attributes);
        var cq = new esri.tasks.Query();
        cq.outFields = [ "*" ];
        cq.where = "equipref = '" + circRecord.attributes['equipref'] + "'";
        console.log('Circuit record(s) query: ', cq);
        circTab.queryFeatures(cq, function(fs) {
            if (fs && typeof (fs.features) !== 'undefined' && fs.features) {
                var cr = null;
                if (fs.features.length > 0) {
                    console.log('Circuit record(s) exists, updating... ', fs);
                    cr = fs.features[0];
                    if (fs.features.length == 1) {
                        console.log('Unique circuit record exists, id: ' + cr.attributes['secname'] + ' updating...');
                    } else {
                        var rids = fs.features.map(function (f) { return f.attributes['secname']; });
                        console.log('Duplicate record for circuit info: ids: ' + rids.join(","));
                        addMessage('Duplicate record for circuit info: ids: ' + rids.join(","), 'warning');
                    }
                    lang.mixin(cr.attributes, circRecord.attributes);
                } else { console.log('Adding circuit record:', circRecord.attributes); }
                circTab.applyEdits(cr?null:[circRecord], cr?[fs.features[0]]:null, cr?fs.features.slice(1):null).then(circModelUpdateSuccess, circModelUpdateFailiur);
            }
        });
    */
    } else {
        console.log('Unable to add circuit record for ', f);
        return null;
    }
}

function circModelUpdateSuccess(add, upd, del) {
    console.log('Circuit model records updated successfully!', add, upd, del);
    addMessage('Circuit info added successfully.', 'success');
}

function circModelUpdateFailiur(e) {
    console.log('Circuit model update failed.');
    addMessage('Circuit model update failed.', 'error');
}

function updateEquipmentModel(id, fld) {
    var eqFldMap = gs.model.eqFldMap;
    var f= lastSelFeat;
    fld= fld || 'equipref';
    var idFld= 'equipref';
    console.log('Updating equipment model...');
    // try to obtain the equipment based on the last selected feature
    var attr = f.attributes;
    var ot = attr && attr.otype;
    if (typeof eqFldMap[ot] === 'undefined' && PROT_OTYPES.indexOf(ot) >= 0) {
        eqFldMap[ot] = eqFldMap['prot'];
    } // augment fieldmap to handle protection devices
    if(fld=='construction'){
        ot= 'construction';
    }
    if(fld=='conductor' || fld=='construction' || fld=='neutral'){
        idFld= 'id';
    }
    var eqid = attr && attr[fld];
    //var eq = typeof attr['equipref' + gs.conf.eqPfx] !== 'undefined' ? attr['equipref' + gs.conf.eqPfx] : null;
    var eq = getEquipment(eqid, ot, idFld);
    // if the equipmennt if found, use the field map (fmap) to set the values in the UI
    // Note, since each dialog element has its own perfix, no need to know which dialog as of now
    // if equipment is not found, create new equipment model
    if (typeof eqFldMap[ot] !== 'undefined') {
        if (eq) {
            eqFldMap[ot].fmap.forEach(function (f) {
                if (dojo.byId(f[0])) registry.byId(f[0]).set('value', typeof eq.attributes[f[1]] !== 'undefined' ? eq.attributes[f[1]] : '');
            });
        }
        else {
            var f = eqFldMap[ot].emap;
            if (dojo.byId(f[0])) registry.byId(f[0]).set('value', typeof attr[f[1]] !== 'undefined' ? attr[f[1]] : '');
        }
    }
    if (eqFldMap[ot] && typeof eqFldMap[ot]['dialog'] !== 'undefined' && eqFldMap[ot]['dialog']) {
        window[eqFldMap[ot]['dialog']].show();
    } else {
        console.log('Equipment type ', ot, 'does not have a dialog.');
    }
}

function getEquipment(eqid, ot, idFld) {
    idFld= idFld || 'equipref';
    var dbr = gs.model.eqdb.filter(function (db) {
        return (db && db.otypes &&  db.otypes.indexOf(ot) >= 0)? true : false;
    });
    var eqs = (dbr.length > 0) ? dbr[0] : null;
    var eqq = eqs ? eqs['features'].filter(function (f) {
        return f && f.attributes && f.attributes[idFld] === eqid? true : false;
    }) : null;
    return (eqq && eqq.length > 0) ? eqq[0] : null;
}

function sourceModelRecUpdate() {
    if (gs.state.addingNewSourceModel) {
        modelRecUpdate(null, null, null, 'source');
        gs.state.addingNewSourceModel = false;
    } else {
        modelRecUpdate();
    }
}

function modelRecUpdate(e, f, eqid, eqot) { // use eq and eqot for things like conductor, circuit
    f = f || lastSelFeat;
    var attr = (f && typeof f.attributes !== 'undefined') ? f.attributes : null;
    var eqot = eqot || ((attr && typeof attr.otype !== 'undefined') ? attr.otype : null);
    var dlgf = dojo.byId(gs.model.eqFldMap[eqot].id);
    eqid = eqid || (dlgf ? dlgf.value : null);
    var eq = getEquipment(eqid, eqot);
    var isNew = false;
    if (eq) {
        console.log('Equipment model found. Updating record with new values...');
    } else {
        console.log('Equipment model not found, Assuming new equipment model record...');
        eq = {attributes: {'otype': eqot}}; // not correct for conductors, etc. so better detection is needed
        isNew = true;
    }
    var otk = PROT_OTYPES.indexOf(eqot) >= 0 ? 'prot' : eqot;
    gs.model.eqFldMap[otk].fmap.forEach(function (fld) {
        if (registry.byId(fld[0])) eq.attributes[fld[1]] = (registry.byId(fld[0]).get('value') === '' ? null : registry.byId(fld[0]).get('value'));
    });
    return eqModelUpdate(eq, eqot, isNew);
}

function eqModelUpdate(eq, ot, isNew) {
    isNew = isNew || false;
    var fl = new esri.layers.FeatureLayer(featureService + '/' + gs.layInds[gs.model.eqdb[gs.model.otype2DbIndex[ot]].tab]);
    // we are not handling duplicate model records as we used to in the source models right now, so we need to
    // implemnt it later
    return fl.applyEdits(isNew ? [eq] : null, isNew ? null : [eq], null).then(function (add, upd, del) {
        console.log('Equipment model info updated.', eq);
        getEqModels();
    }, function (e) {
        console.log('Equipment model update failed.', e);
        getEqModels();
    });
}

function addSourceModelRecord() {
    var name = registry.byId('sourceModelName').value;
    var sourceRecord;
    if (name && name !== '') {
        //var sourceTab = new esri.layers.FeatureLayer(featureService + '/' + gs.layInds['model_source']);
        var insertedSourceEquipref = name;
        sourceRecord = {
            attributes: {
                equipref: name,
                vsource: registry.byId('sourceModelKv').value,
                ratio: registry.byId('sourceModelRatio').value,
                zero_r: registry.byId('sourceModelR0').value,
                zero_x: registry.byId('sourceModelX0').value,
                zero_l: registry.byId('sourceModelX0').value / (2 * Math.PI * sys_freq),
                pos_r: registry.byId('sourceModelR1').value,
                pos_x: registry.byId('sourceModelX1').value,
                pos_l: registry.byId('sourceModelX1').value / (2 * Math.PI * sys_freq),
                rating: registry.byId('sourceModelRating').value,
                otype: 'source',
            }
        };
        console.log('Adding source (feeder) record:', sourceRecord.attributes);
        var sq = new esri.tasks.Query();
        sq.outFields = ["*"];
        sq.where = "equipref = '" + sourceRecord.attributes['equipref'] + "'";
        console.log('Source record(s) query: ', sq);
        return sourceTab.queryFeatures(sq, function (fs) {
            if (fs && typeof (fs.features) !== 'undefined' && fs.features) {
                var sr = null;
                if (fs.features.length > 0) {
                    console.log('Source record(s) exists, updating... ', fs);
                    sr = fs.features[0];
                    if (fs.features.length === 1) {
                        console.log('Unique source record exists, id: ' + sr.attributes['equipref'] + ' updating...');
                    } else {
                        var rids = fs.features.map(function (f) {
                            return f.attributes['objectid'];
                        });
                        console.log('Duplicate record for source info: ids: ' + rids.join(","));
                    }
                    lang.mixin(sr.attributes, sourceRecord);

                } else {
                    console.log('Adding source model record:', sourceRecord.attributes);
                }
                return sourceTab.applyEdits(sr ? null : [sourceRecord], sr ? [fs.features[0]] : null, sr ? fs.features.slice(1) : null).then(sourceModelUpdateSuccess, sourceModelUpdateFailiur);
            }
        });
    } else {
        console.log('Unable to add source record for ', f);
        return null;
    }
    document.getElementById("sourceModelRecDialogDiv").style.zIndex = 2000;  
}

function sourceModelUpdateSuccess(add, upd, del) {
    console.log('Source model records updated successfully!', add, upd, del);
    //addMessage('Source info added successfully.', 'success');
}

function sourceModelUpdateFailiur(e) {
    console.log('Source model update failed.');
    //addMessage('Source model update failed.', 'error');
}

function showImportBayLoadingFileDialog() {
    dojo.style(importBayLoadingFileDialog.domNode, 'visibility', 'hidden');  
       importBayLoadingFileDialog.show().then(function () {  
       dojo.style(importBayLoadingFileDialog.domNode, 'top', '104px');  
       dojo.style(importBayLoadingFileDialog.domNode, 'left', '193px');
       dojo.style(importBayLoadingFileDialog.domNode, 'position', 'absolute'); 
       dojo.style(importBayLoadingFileDialog.domNode, 'visibility', 'visible'); 

       downAllWindows(bottom_z_index);
       dojo.style(importBayLoadingFileDialog.domNode, 'z-index', top_z_index);
       });
}

function submitImportBayLoadingFileDialog() {
    processBayLoadingFileOnServer();
}


/* Load Analytics */
function showAddLoadRecDialogButtonHandler() {

    showAddLoadRecDialog();
}

function showAddLoadRecDialog(meter) {
    if (!meter) {
        meter = registry.byId('meterNo').value;
    } else {
        registry.byId('meterNo').set('value', meter);
    }
    window.consumerLpStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "lscen", data: []}));
    if (validMeterNumber(meter, null)) {
        getConsumerLpInfo(meter).then(function (lpFs) {
            console.log('Load profile records received...');
            ReloadStoreWithFeatureSet(lpFs, consumerLpStore);
            console.log('Load profile store updated', consumerLpStore);
            var lp = registry.byId('loadProfileName').value;
            console.log('Query Load profile store for ' + lp);
            var q = consumerLpStore.query({lscen: lp});
            console.log('Query results: ', q);
            if (q.length > 0) {
                registry.byId('kw').set('value', q[0].kw_a);
                registry.byId('pf').set('value', q[0].pf);
                registry.byId('ok').set('label', 'Update');
            } else {
                registry.byId('kw').set('value', 0);
                registry.byId('pf').set('value', 0.85);
                registry.byId('ok').set('label', 'Add');
            }
            addLoadRecDialog.show();
        }, function (lpFs) {
            console.log('Error loading consumer profile info.', lpFs);
        });
    } else {
        dojo.style(addLoadRecDialog.domNode, 'visibility', 'hidden');  
        addLoadRecDialog.show().then(function () {  
            dojo.style(addLoadRecDialog.domNode, 'top', '184px');  
            dojo.style(addLoadRecDialog.domNode, 'left', '273px');
            dojo.style(addLoadRecDialog.domNode, 'position', 'absolute'); 
            dojo.style(addLoadRecDialog.domNode, 'visibility', 'visible');  
            downAllWindows(bottom_z_index);
            dojo.style(addLoadRecDialog.domNode, 'z-index', top_z_index); 
        });
        // addLoadRecDialog.show();
    }
}

function AddLoadRecDialogMeterChange() {
    console.log('Meter number changed...');
    var meter = registry.byId('meterNo').value;
    window.consumerLpStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "lscen", data: []}));
    if (validMeterNumber(meter, null)) {
        console.log('Valid meter numer, fetching load profile records...');
        getConsumerLpInfo(meter).then(function (lpFs) {
            console.log('Load profile records received...');
            ReloadStoreWithFeatureSet(lpFs, consumerLpStore);
            console.log('Load profile store updated', consumerLpStore);
            var lp = registry.byId('loadProfileName').value;
            console.log('Query Load profile store for ' + lp);
            var q = consumerLpStore.query({lscen: lp});
            console.log('Query results: ', q);
            if (q.length > 0) {
                registry.byId('kw').set('value', q[0].kw_a);
                registry.byId('pf').set('value', q[0].pf);
                registry.byId('ok').set('label', 'Update');
            } else {
                registry.byId('kw').set('value', 0);
                registry.byId('pf').set('value', 0.85);
                registry.byId('ok').set('label', 'Add');
            }
        }, function (lpFs) {
            console.log('Error loading consumer profile info.')
        });
    }
}

function AddLoadRecDialogLpChange() {
    var meter = registry.byId('meterNo').value;
    var lp;
    var q;
    if (validMeterNumber(meter, null)) {
        console.log('Load profile store updated', consumerLpStore);
        lp = registry.byId('loadProfileName').value;
        console.log('Query Load profile store for ' + lp);
        q = consumerLpStore.query({lscen: lp});
        if (q.length > 0) {
            registry.byId('kw').set('value', q[0].kw_a);
            registry.byId('pf').set('value', q[0].pf);
            registry.byId('ok').set('label', 'Update');
        } else {
            registry.byId('kw').set('value', 0);
            registry.byId('pf').set('value', 0.85);
            registry.byId('ok').set('label', 'Add');
        }
    }
}

function showImportBillingFileDialog() {
    dojo.style(importBillingFileDialog.domNode, 'visibility', 'hidden');  
    importBillingFileDialog.show().then(function () {  
        dojo.style(importBillingFileDialog.domNode, 'top', '64px');  
        dojo.style(importBillingFileDialog.domNode, 'left', '133px');
        dojo.style(importBillingFileDialog.domNode, 'position', 'absolute'); 
        dojo.style(importBillingFileDialog.domNode, 'visibility', 'visible');  
        downAllWindows(bottom_z_index);
        dojo.style(importBillingFileDialog.domNode, 'z-index', top_z_index); 
    });
}

function submitImportBillingFileDialog() {
    processBillingFileOnServer();
}

function showAddLoadProfileDialog() {
    dojo.style(addLoadProfileDialog.domNode, 'visibility', 'hidden');  
    addLoadProfileDialog.show().then(function () {  
        dojo.style(addLoadProfileDialog.domNode, 'top', '144px');  
        dojo.style(addLoadProfileDialog.domNode, 'left', '203px');
        dojo.style(addLoadProfileDialog.domNode, 'position', 'absolute'); 
        dojo.style(addLoadProfileDialog.domNode, 'visibility', 'visible');  
        downAllWindows(bottom_z_index);
        dojo.style(addLoadProfileDialog.domNode, 'z-index', top_z_index); 
    });
}

function showDeleteLoadProfileDialog() {
    dojo.style(deleteLoadProfileDialog.domNode, 'visibility', 'hidden');
    deleteLoadProfileDialog.show().then(function () {
        dojo.style(deleteLoadProfileDialog.domNode, 'top', '144px');
        dojo.style(deleteLoadProfileDialog.domNode, 'left', '203px');
        dojo.style(deleteLoadProfileDialog.domNode, 'position', 'absolute');
        dojo.style(deleteLoadProfileDialog.domNode, 'visibility', 'visible');
        downAllWindows(bottom_z_index);
        dojo.style(deleteLoadProfileDialog.domNode, 'z-index', top_z_index);
    });
}


function showAddIntLoadProfileDialog() {
    dojo.style(addIntLoadProfileDialog.domNode, 'visibility', 'hidden');
    addIntLoadProfileDialog.show().then(function () {
        dojo.style(addIntLoadProfileDialog.domNode, 'top', '144px');
        dojo.style(addIntLoadProfileDialog.domNode, 'left', '203px');
        dojo.style(addIntLoadProfileDialog.domNode, 'position', 'absolute');
        dojo.style(addIntLoadProfileDialog.domNode, 'visibility', 'visible');
        downAllWindows(bottom_z_index);
        dojo.style(addIntLoadProfileDialog.domNode, 'z-index', top_z_index);
    });
}


function showManageIntCaseStudiesDialog() {
    dojo.style(manageIntCaseStudiesDialog.domNode, 'visibility', 'hidden');
    manageIntCaseStudiesDialog.show().then(function () {
        dojo.style(manageIntCaseStudiesDialog.domNode, 'top', '144px');
        dojo.style(manageIntCaseStudiesDialog.domNode, 'left', '203px');
        dojo.style(manageIntCaseStudiesDialog.domNode, 'position', 'absolute');
        dojo.style(manageIntCaseStudiesDialog.domNode, 'visibility', 'visible');
        downAllWindows(bottom_z_index);
        dojo.style(manageIntCaseStudiesDialog.domNode, 'z-index', top_z_index);
    });
}


function runAddLoadProfile() {
    addLoadProfile(dojo.byId('newLoadProfileName').value, dojo.byId('bayLoadingTs').value, dojo.byId('meteringTs').value,
        dojo.byId('newLoadProfilePf').value, dojo.byId('newLoadProfileComments').value);
}

function runDeleteLoadProfile() {
    deleteLoadProfile(dojo.byId('deleteLoadProfileName').value);
}

function motorRecUpdate(e) {
    //console.log('Adv Motor Dialog:', e);
    lastSelFeat.attributes.pars = JSON.stringify({
        'load': dojo.byId('motorLoadName').value,
        'ratio': dojo.byId('motorLoadRatio').value
    });
    console.log('Adv Motor Params Updated.');
}


function transRecUpdate(e) {
    //console.log('Adv Motor Dialog:', e);
    lastSelFeat.attributes.pars = JSON.stringify({
        "wdgCode": dojo.byId('transWdgCode').value,
        "vInput": dojo.byId('transVin').value,
        "vOut": dojo.byId('transVout').value,
        "vOutNom": dojo.byId('transVoutNom').value
    });
    console.log('Adv Trans Params Updated.');
}

function regRecUpdate(e) { // "fhLo":"0.800000011920929","fhHi":"1.20000004768372","ldcX":"0","vOut":"1.04166662693024","ldcR":"0"
    //console.log('Adv Motor Dialog:', e);
    lastSelFeat.attributes.pars = JSON.stringify({
        "vOut": dojo.byId('regVout').value,
        "fhLo": dojo.byId('regFhLo').value,
        "fhHi": dojo.byId('regFhHi').value,
        "ldcR": dojo.byId('regLdcR').value,
        "ldcX": dojo.byId('regLdcX').value
    });
    console.log('Adv Trans Params Updated.');
}


function parsRecUpdate(e) {
    //console.log('Adv Motor Dialog:', e);
    lastSelFeat.attributes.pars = dojo.byId('parsField').value;
    console.log('Params Updated.');
}


function addUpdLoadRecord() {
    var meter = registry.byId('meterNo').value;
    var lp = registry.byId('loadProfileName').value;
    var allLp = registry.byId('allLoadProfilesCB').checked;
    var kw = registry.byId('kw').value;
    var pf = registry.byId('pf').value;


    console.log('Adding/updating load record(s), meter number:' + meter + ' kw: ' + kw + ', pf: ' + pf);
    var loadingProfileTab = new esri.layers.FeatureLayer(featureService + '/' + gs.layInds['model_loads']);
    var loadRecords;
    var loadRecord;
    if (allLp) {
        loadRecords = arrayUtils.map(arrayUtils.map(loadScenariosStore.query({}),
            function (s) {
                return s['name'];
            }),
            function (lp) {
                return {
                    attributes: {
                        lscen: lp,
                        equipref: meter,
                        kw_a: kw,
                        kw_b: kw,
                        kw_c: kw,
                        pf: pf
                    }
                };
            });
    } else {
        loadRecord = {
            attributes: {
                lscen: lp,
                equipref: meter,
                kw_a: kw,
                kw_b: kw,
                kw_c: kw,
                pf: pf
            }
        };
        loadRecords = [loadRecord];
    }
    //console.log(loadRecords);
    arrayUtils.forEach(loadRecords, function (loadRecord) {
        //console.log('Commiting load record for: ', loadRecord);
        var lrs = consumerLpStore.query({lscen: loadRecord.attributes['lscen']});
        //console.log('Lrs: ', lrs);
        if (lrs.length > 0) {
            //loadRecord.objectId = lrs[0].objectid;
            loadRecord.attributes.objectid = lrs[0].objectid;
            loadingProfileTab.applyEdits(null, [loadRecord], null).then(
                function (add, upd, del) {
                    console.log(upd);
                    addMessage('Load record updated successfully.', 'success');
                }, function (err) {
                    console.log(err);
                    addMessage('Load record update error!', 'error');
                });
        } else {
            insertedMeterNumber = loadRecord.attributes['equipref'];
            loadingProfileTab.applyEdits([loadRecord], null, null).then(
                function (add, upd, del) {
                    console.log(add);
                    addMessage('Load record added successfully.', 'success');
                }, function (err) {
                    console.log(err);
                    addMessage('Load record addition error!', 'error');
                });
        }
    });
}


function loadModelTabHandler() {
    var tp = registry.byId('modelTabSel').value;
    console.log('Loading models: ' + tp);
    showModel(tp);
}

function saveModelTabHandler() {
    console.log('Saving models...');
}

function showModel(type) {
    console.log(featureService + '/' + gs.layInds['model_' + type]);
    var eqTab = new esri.layers.FeatureLayer(featureService + '/' + gs.layInds['model_' + type]);
    var query = new esri.tasks.Query();
    query.where = "1 = 1";
    query.outFields = ['*'];
    eqTab.queryFeatures(query, function (fs) {
        console.log('Model table loaded: ', fs);
        dojo.byId('modelTab').innerHTML = '';
        var gdiv = domConstruct.create("div");
        domConstruct.place(gdiv, dojo.byId('modelTab'));
        var modelTabGrid = new (dojo.declare([dgrid.OnDemandGrid, dgrid.Keyboard, dgrid.CellSelection, dgrid.extensions.ColumnResizer]))({
            store: new dojo.store.Memory({
                idProperty: "objectid",
                data: fs.features.map(function (f) {
                    return f.attributes;
                })
            }),
            columns: fs.fields.filter(function (f) {
                return f.name !== 'otype';
            }).map(function (f) {
                var col = {
                    field: f.name,
                    label: f.name,
                    editor: dijit.form.TextBox,
                    editOn: "dgrid-cellfocusin",
                    resizable: true
                };
                return (f.name === 'objectid') ? col : dgrid.editor(col);
            })
        }, gdiv);
        modelTabGrid.startup();
    }, function (e) {
        console.log('Error loading model table ', type, e);
    });
}

function generateCurrentReportHandler() {
    if (vvFeatures) {
        populateReportPage();
    } else {
        addMessage('Please update your analysis before reporting!', 'warning');
    }
}

function generateReportHandler() {
    var csn = dojo.byId('reportCaseStudyName').value;
    if (csn) {
        gs.rg.caseStudyName = csn;
        gs.rg.renderReport();
    } else {
        console.log("Report generator: no case study seelected.");
    }
}

function addSelectedReportFieldsHandler() {
}

function removeSelectedReportFieldsHandler() {
}

function addReportTemplate() {
}


function toggleHeadsupDisplayButtonHandler() {
    if (window.siwVisible) {
        registry.byId('shortInfoWindowContainer').hide();
        window.siwVisible = false;
    } else {
        registry.byId('shortInfoWindowContainer').show();
        siwUpdate();
        window.siwVisible = true;
    }
}


function gotoMapLocButtonHandler() {
    gotoMapLocDialog.show();
}

function gotoMapLocHandler() {
    var mls = registry.byId('gotoMapLoc').value;
    window.rpt = ML.toCoordinates(mls);
    ML.getCoordinates(new esri.geometry.Point(rpt[0], rpt[1], new esri.SpatialReference(ML.wkid)), map.spatialReference.wkid, centerToCoordinates);
}

function rebuildNetworkButtonHandler() {
    wipeAndRebuild();
}

function searchButtonHandler() {
    var sb = registry.byId('searchTerm');
    var ss = sb.value;
    search(ss);
}

function use12DigitMaplocChangeHandler() {
    gs.conf.maplocPrecision = registry.byId('use12DigitMaploc').checked ? 15 : 12;
    ML.precision = gs.conf.maplocPrecision;
}


function showCreateVersionDialog() {
    dojo.byId('parName').value = gs.version;
    createVersionDialog.show();
}

function createVersionDlgHandler() {
    createVersion(dojo.byId('verName').value, dojo.byId('parName').value, 'Public', dojo.byId('verDesc').value);
}

function showDeleteVersionDialog() {
    dojo.byId('deleteVersionMessageDiv').innerHTML = 'Deleting version ' + gs.version + '. Are you sure?';
    deleteVersionDialog.show();
}

function deleteVersionDlgHandler() {
    deleteVersion(gs.version);
}


function restoreSessionCBHandler() {
 //alert("grtt :",gs.conf.loadEnv )
 //dojo.byId('drop_down').style.marginTop = "0px";
    gs.conf.loadEnv = registry.byId('restoreSessionCB').checked;
   
     // if(gs.conf.loadEnv == true){
        
     //    // dijit.byId("restoreSessionCB").set("label", "On");
     //     dojo.byId('drop_down').style.marginTop = "17px";
     //    }
     // else{
      
     //     dojo.byId('drop_down').style.marginTop =" 17px";
     //   //dijit.byId("restoreSessionCB").set("label", "Off");
     // }
    console.log("gs.conf.loadEnv",gs.conf.loadEnv);
    saveEnv();

}

function uploadRestoreFileHandler() {
    gs.backup.uploadRestoreFile();
}

function uploadCustomersSyncFileHandler() {
    gs.custSync.uploadCustomersFile();
}

function showPhaseSwitchDialog() {
    var phases = [];
    map.infoWindow.features.forEach(function (f) {
        if (typeof f.attributes['ophase'] !== 'undefined') {
            phases.push(f.attributes['ophase']);
        }
    });
    //console.log('L+G phase set: ', phases);
    if (phases.length === 1) {
        console.log('All L+G phases are the same, setting default: ', phases[0]);
        registry.byId('switchPhaseToPhase').setValue(phases[0]);
    }
    phaseSwitchDialog.show();
    downAllWindows(bottom_z_index);
    setTimeout(function(){
        document.getElementById("phaseSwitchDialogDiv").style.zIndex = top_z_index;
    }, 0);
}

function switchBillingInfoMode() {
    var mode = registry.byId('importBillingInfoMode').value;
    console.log('Metering mode switched to: ', mode);
    if (mode === 'file') {
        domStyle.set('billingFileForm', 'display', '');
        domStyle.set('meteringDaysBack', 'display', 'none');
        domStyle.set('meteringEffectiveTimeSpan', 'display', 'none');
        if (!billingFileItemId) {
            registry.byId('ibfok').set("disabled", true);
        }
    } else {
        domStyle.set('billingFileForm', 'display', 'none');
        domStyle.set('meteringDaysBack', 'display', '');
        domStyle.set('meteringEffectiveTimeSpan', 'display', '');
        registry.byId('ibfok').set("disabled", false);
    }
}

function billingTimeSpanKeypressUpdate(e) {
    if (e.charOrCode === dojo.keys.ENTER) billingTimeSpanUpdate();
}

function billingTimeSpanUpdate() {
    var nDays = parseInt(dojo.byId('meteringTimeSpan').value);
    if (!isNaN(nDays)) {
        var ed = new Date(dojo.byId('billingFileDate').value + ' 2:00');
        var sd = new Date(ed - (nDays - 1) * 24 * 3600000);
        console.log('Start and end dates: ', sd, ed)
        dojo.byId('meteringImportEffectiveTimeSpan').textContent = formatDate(sd, 'M/d/y', true) + ' to ' + formatDate(ed, 'M/d/y', true);
    } else {
        dojo.byId('meteringImportEffectiveTimeSpan').textContent = 'Invalid time span parameters.';
    }
}

function disableGmapTiltHandler() {
    gs.conf.gmapTiltDisabled = registry.byId('disableGmapTilt').checked;
    toggleGmapTilt(gs.conf.gmapTiltDisabled);
}

function detailedAssetsLayerHandler() {
    gs.conf.detailedAssetsLayer = registry.byId('detailedAssetsLayerCB').checked;
    //location.reload(true);
}


function toggleGmapTilt(v) {
    //console.log("Disabling gmap tilt: ", v);
    var gm = basemapGallery.getGoogleLayers();
    if (gm.length > 0 && gm[0].getGoogleMapInstance()) {
        if (v) {
            gm[0].getGoogleMapInstance().setTilt(0);
        }
        else {
            gm[0].getGoogleMapInstance().setTilt(45);
        }
    }
}

function findOutageMetersButtonHandler() {
    if (typeof gs.oa !== 'undefined') {
        gs.oa.getOutageMeters();
    }
}

function findOutageButtonHandler() {
    if (typeof gs.oa !== 'undefined') {
        gs.oa.groupMode = dijit.byId("outageGroupModeSelect").value;
        gs.oa.findOutagePath();
    }
}

function clearCurrentOutageSetButtonHandler() {
    if (typeof gs.oa !== 'undefined') {
        gs.oa.clearCurrentOutageSet();
    }
}

function clearCurrentOutagePathsButtonHandler() {
    if (typeof gs.oa !== 'undefined') {
        gs.oa.clearCurrentOutagePaths();
    }
}

function highlightCurrentOutagePathsButtonHandler() {
    if (typeof gs.oa !== 'undefined') {
        gs.oa.highlightCurrentOutagePaths();
    }
}

function printCurrentOutagePathsButtonHandler() {
    if (typeof gs.oa !== 'undefined') {
        gs.oa.printCurrentOutagePaths();
    }
}

function updateOutageSymbolsFromUI() {
    
    // commented out for now due to changes to OA - might implement later
    ;
    // var v = parseInt(dojo.byId("outageSymbolLineSize").value);
    // gs.state.oa.lineSize = isNumber(v) ? v : gs.state.oa.lineSize;
    // v = parseInt(dojo.byId("outageSymbolMarkerSize").value);
    // gs.state.oa.markerSize = isNumber(v) ? v : gs.state.oa.markerSize;
    // v = esri.Color.fromHex(dojo.byId("outageSymbolColor").value);
    // gs.state.oa.color = v ? v : gs.state.oa.color;
    // window.outColor = gs.state.oa.color;
    // window.outLine = new esri.symbol.CartographicLineSymbol("solid", outColor, gs.state.oa.lineSize, "round", "round");
    // window.outMarker = new esri.symbol.SimpleMarkerSymbol("square", gs.state.oa.markerSize, outLine, outColor);

    // window.outPathLine = outLine;

    // v = parseFloat(dojo.byId("outageSymbolMarkerScale").value);
    // gs.state.oa.markerScale = isNumber(v) ? v : gs.state.oa.markerScale;
    // var scale = gs.state.oa.markerScale, ratio = gs.state.oa.markerRatio;
    // window.outPathMarker = new esri.symbol.PictureMarkerSymbol(dangerMarker.url, Math.round(scale * ratio * dangerMarker.h), Math.round(scale * ratio * dangerMarker.w));
    // window.outProthMarker = new esri.symbol.PictureMarkerSymbol(dangerMarker.url, Math.round(scale * dangerMarker.h), Math.round(scale * dangerMarker.w));
}

function updateOutageSymbolButtonHandler() {
    // commented out for now due to changes to OA - might implement later
    ;
    // if (typeof gs.oa !== 'undefined') {
    //     updateOutageSymbolsFromUI();
    //     gs.oa.outColor = outColor;
    //     gs.oa.outLine = outLine;
    //     gs.oa.outMarker = outMarker;
    //     gs.oa.outPathMarker = outPathMarker;
    //     gs.oa.outPathLine = outPathLine;
    //     gs.oa.outProthMarker = outProthMarker;
    //     gs.oa.redrawCurrentOutageSet();
    //     gs.oa.highlightCurrentOutagePaths()
    // }
}

function importLpButtonHandler() {

}

function changeSBselection(rbv) {
    if (rbv === '*') {
        dojo.byId('aSubsBays').disabled = true;
        sbselection = '.*';
    } else {
        dojo.byId('aSubsBays').disabled = false;
        sbselection = translateSBselection(dojo.byId('aSubsBays'));
    }
}

function changeConnCheckSelection(rbv) {
    if (rbv === '*') {
        dojo.byId('connectivityCheck').disabled = true;
        connectivityCheckSelection = '.*';
    } else {
        dojo.byId('connectivityCheck').disabled = false;
        connectivityCheckSelection = translateSBselection(dojo.byId('connectivityCheck'));
    }
}

function changeRepCircSelection(rbv) {
    if (rbv === '*') {
        dojo.byId('reportCircs').disabled = true;
        gs.rg.subset = '.*';
    } else {
        dojo.byId('reportCircs').disabled = false;
        gs.rg.subset = translateSBselection(dojo.byId('reportCircs'));
    }
}

function updateDialogOpts(dialogPerfix, confKey, convOpts= {}) {
    //dialogPerfix='faultOpts_';
    //confKey = 'faultCalcSettings';
    var setDef = true;
    var defDefVal = 0;
    var defConvFunc = parseFloat;
    // e.g. convOpts= {'objective': {'convFunc': null}, 'method': {'convFunc': null}}
    Object.keys(gs.conf[confKey]).forEach(function (p) {
        var cnt = dijit.byId(dialogPerfix + p);
        if (cnt) {
            var convFunc= (convOpts[p] && convOpts[p].convFunc)? convOpts[p].convFunc: defConvFunc;  
            var defVal= (convOpts[p] && convOpts[p].defVal)? convOpts[p].defVal: null;
            // do not update if default value is null  
            gs.conf[confKey][p] = setDef ? (cnt.value === '' ? gs.conf[confKey][p] : (convFunc ? convFunc(cnt.value) : cnt.value)) : cnt.value;
        }
    });
    console.log('Dialog options updated for ', dialogPerfix, confKey);
}

function loadDialogOpts(dialogPerfix, confKey, convOpts= {}) {
    //var setDef = true;
    //var defDefVal = 0;
    //var defConvFunc = parseFloat;
    // e.g. convOpts= {'objective': {'convFunc': null}, 'method': {'convFunc': null}}
    Object.keys(gs.conf[confKey]).forEach(function (p) {
        var cnt = dijit.byId(dialogPerfix + p);
        if (cnt) {
            cnt.setValue(gs.conf[confKey][p]);
            //var convFunc= (convOpts[p] && convOpts[p].convFunc)? convOpts[p].convFunc: defConvFunc;  
            //var defVal= (convOpts[p] && convOpts[p].defVal)? convOpts[p].defVal: null;
            // do not update if default value is null  
            //gs.conf[confKey][p] = setDef ? (cnt.value === '' ? gs.conf[confKey][p] : (convFunc ? convFunc(cnt.value) : cnt.value)) : cnt.value;
        }
    });
    console.log('Dialog options loaded for ', dialogPerfix, confKey);
}


function loadLossAdjDialogOpts() {
    loadDialogOpts('adjLoss_', 'adjustForLossesSettings');
}

function updateLossAdjDialogOpts() {
    var pt= function(r){return r;};
    updateDialogOpts('adjLoss_', 'adjustForLossesSettings', {'objective': {'convFunc': pt}, 'method': {'convFunc': pt}} );
}


function issuesUpdateButtonHandler() {
    //console.log('issues button handler');
    if (caseStudyName !== registry.byId('resScenarioSel').value) {
        resNeedUpdate = true;
    }
    if (resNeedUpdate) {
        console.log('Updating the issues...');
        registry.byId('issuesRefereshBtn').set("disabled", true);
        // dojo.byId('issuesLoadingDiv').style.display = "inline";
        getIssues(getLoadingThereshold(), getVoltageThereshold(), registry.byId('resScenarioSel').value, dijit.byId('spAmpViolationsCB').checked, resUpdateHandler);
    } else {
        resUpdateHandler();
    }
}


function ipfLoadProfileHandler() {
    //console.log('issues button handler');
    selected = dijit.byId('ipfLoadProfileGrpName').get('value');

    if (selected) {
        getIntLoadProfileNames(selected)
    }
}


function ddLoadProfileHandler() {
    //console.log('issues button handler');
    selected = dijit.byId('ddLoadProfile').get('value');
    getIntLoadProfileNames(selected)
}


function ddCircuitSelHandler() {
    ddSBselection = translateSBselection(dojo.byId('ddSubsBays'))
    getParticipatingCustomers(['11A']);
}


function ddRunDivHandler() {
    getParticipatingCustomers(['11A']);
    ddLoadProfileHandler();
    console.log("in ddRunDivHandler!");
}