
function packAnalysisParam() {
    var gpPars = {};
    gpPars.sde = gs.sdeInstance;
    gpPars.pfx = gs.sdePfx;
    //gpPars.engine = gs.conf.engine;
    gpPars.subset = sbselection;
    gpPars.csname = registry.byId("aScenarioName").value;
    gpPars.lsname = registry.byId("aLoadScenario").value;
    gpPars.gsname = registry.byId("aGenScenario").value;
    var ldscaling = registry.byId("aLoadScaling").value;
    var genscaling = registry.byId("aGenScaling").value;
    var opts = Object();
    opts.loadScaling = registry.byId("aLoadScaling").value;
    opts.genScaling = registry.byId("aGenScaling").value;
    if (registry.byId("adjForLossCB").checked) {
        opts['adjustForLosses'] = gs.conf.adjustForLossesSettings;
    }
    if (registry.byId("faultCalcCB").checked) {
        opts['fault_calc'] = gs.conf.faultCalcSettings;
    }
    if (registry.byId("capOptCB").checked) {
        opts['cap_opt'] = gs.conf.capOptSettings;
    }
    if (registry.byId("motorStartCB").checked) {
        opts['motor_start'] = gs.conf.motorStartSettings;
    }
    var fpts = registry.byId("faultPoints").value.trim();
    if (fpts !== "") {
        opts['fault_flow'] = {"fault_points": fpts.split(';').map(Function.call, String.prototype.trim)};
    }
    //"fault_flow": {"fault_points": ["NB9CC5"]}
    gpPars.opts = json.stringify(opts);
    return gpPars;
}

function validateAnalysisParams(p) {
    if (p.csname === '') {
        return false;
    }
    return true;
}

// new status callback for submitJob that prints
// all messages (even if duplicates)
// did not want to update all gridi processes
// until were sure there would be no bad effects.

function statusCallbackCC(jobInfo) {
    gpJob = jobInfo;

    // call status can be called multiple times 
    // (default is every second) until job is complete.
    var msgStartIdx = 0
    if (gpMesCount > 0) {
        msgStartIdx = gpMesCount - 2;
    }

    // console.log(`statusCallback: ${jobInfo.status};  ${jobInfo.messages.length}  ${gpMesCount}  ${msgStartIdx}`)
    // printMsgs(jobInfo);

    if (gpMesCount !== jobInfo.messages.length) {
        for (var i = msgStartIdx; i < jobInfo.messages.length; i++) {
            // put a line break between each new circuit run for clarity
            if (jobInfo.messages[i].description.startsWith("Checking connections on "))
            {
                addMessage("<BR>");
            }
            console.log(jobInfo.messages[i].type + " : " + jobInfo.messages[i].description);
            addMessage(jobInfo.messages[i].type + " : " + jobInfo.messages[i].description);
            // if (jobInfo.messages.slice(0, i).filter(function (m) {
            //     return m.type === jobInfo.messages[i].type && m.description === jobInfo.messages[i].description;
            // }).length <= 0) {
            //     console.log(jobInfo.messages[i].type + " : " + jobInfo.messages[i].description);
            //     addMessage(jobInfo.messages[i].type + " : " + jobInfo.messages[i].description);
            // } else {
            //     console.log('Duplicate message: ', jobInfo.messages[i]);
            // }
        }
    }
    gpMesCount = jobInfo.messages.length;
    if (gpMes !== jobInfo.jobStatus) {
        gpJobInfo = jobInfo;
        gpMes = jobInfo.jobStatus;
        console.log(jobInfo.jobStatus);
        addMessage(jobInfo.jobStatus);
    }
}

function statusCallback(jobInfo) {
    gpJob = jobInfo;

    // console.log(`statusCallback: ${jobInfo.status};  ${jobInfo.messages.length}  ${gpMesCount}`)
    // printMsgs(jobInfo);

    // call status can be called multiple times 
    // (default is every second) until job is complete.
    if (gpMesCount !== jobInfo.messages.length) {
        for (var i = gpMesCount; i < jobInfo.messages.length; i++) {
            if (jobInfo.messages.slice(0, i).filter(function (m) {
                    return m.type === jobInfo.messages[i].type && m.description === jobInfo.messages[i].description;
                }).length <= 0) {
                console.log(jobInfo.messages[i].type + " : " + jobInfo.messages[i].description);
                addMessage(jobInfo.messages[i].type + " : " + jobInfo.messages[i].description);
            } else {
                console.log('Duplicate message: ', jobInfo.messages[i]);
            }
        }
    }
    gpMesCount = jobInfo.messages.length;
    if (gpMes !== jobInfo.jobStatus) {
        gpJobInfo = jobInfo;
        gpMes = jobInfo.jobStatus;
        console.log(jobInfo.jobStatus);
        addMessage(jobInfo.jobStatus);
    }
}

// helper function for testing only
function printMsgs(jobInfo) {
    if (jobInfo.messages.length > 0) {
        
        for (var i = 0; i < jobInfo.messages.length; i++) {
            console.log("*** " + jobInfo.messages[i].description)
        }
    }
}

function parseGpCompletionMessage(jobInfo) {
    if (jobInfo.jobStatus === 'esriJobCancelled' || jobInfo.jobStatus === 'esriJobCancelling') {
        console.log("Job completed (cancelled).");
    } else if (jobInfo.jobStatus === 'esriJobSucceeded') {
        console.log("Job completed successfully.");
    } else {
        console.log("Job completed with status: " + jobInfo.jobStatus);
    }
}



function runCaseStudy() {
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        var params = packAnalysisParam();
        if (validateAnalysisParams(params)) {
            var gpurl = getGpUrl(caseStudyGPSvc, caseStudyGPSvc);
            console.log("Case study started... url: ", gpurl);
            gp = new esri.tasks.Geoprocessor(gpurl);
            console.log("Parameters: ", params);
            gpActive = 1;
            gpJobName = "run_case_study";
            gpMesCount = 0;
            //dojo.style("activityDiv", 'visibility', 'visible');
            controlStartWaiting('caseStudyLoadingDiv');
            domStyle.set(registry.byId('caseStudyButton').domNode, 'display', 'none');
            domStyle.set(registry.byId('caseStudyButtonCancelButton').domNode, 'display', '');
            gp.submitJob(params, caseStudyCompleteCallback, statusCallback, caseStudyErrorCallback);

        } else {
            console.log('Invalid Study Params.');
            addMessage('Invalid Study Params.');
        }
    }
}

function caseStudyCompleteCallback(jobInfo) {
    console.log("Case study job completed.", jobInfo);
    gpJobInfo = jobInfo;
    gpActive = 0;
    gpJob = 0;
    //parseGpCompletionMessage(jobInfo);
    getCaseStudies();
    controlStopWaiting('caseStudyLoadingDiv');
    domStyle.set(registry.byId('caseStudyButton').domNode, 'display', '');
    domStyle.set(registry.byId('caseStudyButtonCancelButton').domNode, 'display', 'none');
    //gp.getResultData(jobInfo.jobId, "report").then(downloadFile, function (e) { console.log("Error in obtaining gp resutls."); });
}

function caseStudyErrorCallback(jobInfo) {
    console.log("Case study job failed.", jobInfo);
    gpJobInfo = jobInfo;
    gpActive = 0;
    gpJob = 0;
    parseGpCompletionMessage(jobInfo);
    controlStopWaiting('caseStudyLoadingDiv');
    domStyle.set(registry.byId('caseStudyButton').domNode, 'display', '');
    domStyle.set(registry.byId('caseStudyButtonCancelButton').domNode, 'display', 'none');
    // gp.getResultData(jobInfo.jobId, "message", displayResult);
}

function runIntCaseStudy() {
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        var gpPars = {};
        gpPars.sde = gs.sdeInstance;
        gpPars.pfx = gs.sdePfx;
        gpPars.subset = intSBselection;
        gpPars.csname = registry.byId("ipfCaseStudyGrpName").value;
        gpPars.startTs = registry.byId("ipfStartTs").value;
        gpPars.endTs = registry.byId("ipfEndTs").value;
        gpPars.lsname = registry.byId("ipfLoadProfileGrpName").value;
        // gpPars.gsname = registry.byId("aGenScenario").value;
        var ldscaling = registry.byId("ipfLoadScaling").value;
        // var genscaling = registry.byId("aGenScaling").value;
        var opts = Object();
        opts.loadScaling = registry.byId("ipfLoadScaling").value;
        gpPars.opts = json.stringify(opts);

        //var params = packAnalysisParam();
        //if (validateAnalysisParams(params)) {
        var gpurl = getGpUrl(intCaseStudyGPSvc, intCaseStudyGPSvc);
        console.log("Interval Case study started... url: ", gpurl);
        gp = new esri.tasks.Geoprocessor(gpurl);
        console.log("Parameters: ", gpPars);
        gpActive = 1;
        gpJobName = "run_int_case_study";
        gpMesCount = 0;
        //dojo.style("activityDiv", 'visibility', 'visible');
        controlStartWaiting('intCaseStudyLoadingDiv');
        domStyle.set(registry.byId('intCaseStudyButton').domNode, 'display', 'none');
        domStyle.set(registry.byId('intCaseStudyCancelButton').domNode, 'display', '');
        gp.submitJob(gpPars, intCaseStudyCompleteCallback, statusCallback, intCaseStudyErrorCallback);

        // } else {
        //     console.log('Invalid Study Params.');
        //     addMessage('Invalid Study Params.');
        // }
    }
}

function intCaseStudyCompleteCallback(jobInfo) {
    console.log("Interval Case study job completed.", jobInfo);
    gpJobInfo = jobInfo;
    gpActive = 0;
    gpJob = 0;
    //parseGpCompletionMessage(jobInfo);
    getCaseStudies();
    controlStopWaiting('intCaseStudyLoadingDiv');
    domStyle.set(registry.byId('intCaseStudyButton').domNode, 'display', '');
    domStyle.set(registry.byId('intCaseStudyCancelButton').domNode, 'display', 'none');
    //gp.getResultData(jobInfo.jobId, "report").then(downloadFile, function (e) { console.log("Error in obtaining gp resutls."); });
}

function intCaseStudyErrorCallback(jobInfo) {
    console.log("Interval Case study job failed.", jobInfo);
    gpJobInfo = jobInfo;
    gpActive = 0;
    gpJob = 0;
    parseGpCompletionMessage(jobInfo);
    controlStopWaiting('intCaseStudyLoadingDiv');
    domStyle.set(registry.byId('intCaseStudyButton').domNode, 'display', '');
    domStyle.set(registry.byId('intCaseStudyCancelButton').domNode, 'display', 'none');
    // gp.getResultData(jobInfo.jobId, "message", displayResult);
}

function getParticipantNum(appl, applNum) {
    // appl = dojo.byId(controlId).value;
    // applNum = dojo.byId(appCntId).value;
    if (appl !== "Choose Appliance" && applNum != "Number" && applNum > 0) {
        return applNum;
    }
    else {
        return 0;
    }
}

// function getCustParticipants() {
//     cnt = 0;
//     ddACNum = dojo.byId('ddACNum');
//     ddSHNum = dojo.byId('ddSHNum');
//     ddSWHNum = dojo.byId('ddSWHNum');
//     ddFWHNum = dojo.byId('ddFWHNum');
//     ddRefNum = dojo.byId('ddRefNum');
//     ddPPNum = dojo.byId('ddPPNum');
//     ddHBNum = dojo.byId('ddHBNum');
//     cnt += getParticipantNum(appl1.value, ddAppl1Num.value);
//     cnt += getParticipantNum(appl2.value, ddAppl2Num.value);
//     cnt += getParticipantNum(appl3.value, ddAppl3Num.value);

//     return cnt;
// }

function getApplValue(id) {
    value = dojo.byId(id).value;
    return value === '' ? 0 : value
}

function getApplCounts() {
    
    appl = {};
    appl['Air Conditioners'] = getApplValue('ddACNum1');
    appl['Space Heaters'] = dojo.byId('ddSHNum2').value;
    appl['Slow Water Heaters'] = dojo.byId('ddSWHNum3').value;
    appl['Fast Water Heaters'] = dojo.byId('ddFWHNum4').value;
    appl['Refrigerators'] = dojo.byId('ddRefNum5').value;
    appl['Pool Pumps'] = dojo.byId('ddPPNum6').value;
    appl['Home Batteries'] = dojo.byId('ddHBNum7').value;

    return appl;
}

function runDemandDispatch() {
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        var gpPars = {};
        applCounts = JSON.stringify(getApplCounts());
        gpPars.sde = gs.sdeInstance;
        gpPars.ddCaseStudy = dijit.registry.byId("ddCaseStudyName").value;
        gpPars.intProfileGrpName = dijit.registry.byId("ddLoadProfile").value;
        gpPars.subset = ddSBselection;
        gpPars.applCounts = applCounts;
        gpPars.startTs = registry.byId("ddStartTs").value;
        gpPars.endTs = registry.byId("ddEndTs").value;
        gpPars.ddRunPowerFlow = registry.byId("ddRunPowerFlowCB").checked;
        gpPars.ddFullSysOptimize = registry.byId("ddFullSysOptimizeCB").checked;

        var gpurl = getGpUrl(demandDispatchGPSvc, demandDispatchGPSvc);
        console.log("Demand Dispatch started... url: ", gpurl);
        gp = new esri.tasks.Geoprocessor(gpurl);
        console.log("Parameters: ", gpPars);
        gpActive = 1;
        gpJobName = "run_demand_dispatch";
        gpMesCount = 0;
        
        controlStartWaiting('ddRunLoadingDiv');
        domStyle.set(registry.byId('ddRunBtn').domNode, 'display', 'none');
        domStyle.set(registry.byId('ddRunCancelBtn').domNode, 'display', '');
        gp.submitJob(gpPars, demandDispatchCompleteCallback, statusCallback, demandDispatchErrorCallback);

        // } else {
        //     console.log('Invalid Study Params.');
        //     addMessage('Invalid Study Params.');
        // }
    }
}


function demandDispatchCompleteCallback(jobInfo) {
    console.log("Demand Dispatch job completed.", jobInfo);
    gpJobInfo = jobInfo;
    gpActive = 0;
    gpJob = 0;
    //parseGpCompletionMessage(jobInfo);
    //getCaseStudies();
    controlStopWaiting('ddRunLoadingDiv');
    domStyle.set(registry.byId('ddRunBtn').domNode, 'display', '');
    domStyle.set(registry.byId('ddRunCancelBtn').domNode, 'display', 'none');
    //gp.getResultData(jobInfo.jobId, "report").then(downloadFile, function (e) { console.log("Error in obtaining gp resutls."); });
}


function demandDispatchErrorCallback(jobInfo) {
    console.log("Demand Dispatch job failed.", jobInfo);
    gpJobInfo = jobInfo;
    gpActive = 0;
    gpJob = 0;
    parseGpCompletionMessage(jobInfo);
    controlStopWaiting('ddRunLoadingDiv');
    domStyle.set(registry.byId('ddRunBtn').domNode, 'display', '');
    domStyle.set(registry.byId('ddRunCancelBtn').domNode, 'display', 'none');
    // gp.getResultData(jobInfo.jobId, "message", displayResult);
}


function cancelDemandDispatch() {
    console.log("Cancelling demand dispatch...");
    if (gpActive === 1 && gpJobName === "run_demand_dispatch") {
        gp.cancelJob(gpJob.jobId, cancelCompleteCallback, cancelErrorCallback);
    } else {
        console.log("No active job...");
    }
}


// format the baylist selection. If '.*' is returned,
// then all are being selected and will need to get 
// from baylist store
function formatBaylistSelectons(baylistSels)
{
    baylist = "";
    if (baylistSels === ".*")
    {
        baylistNames = gs.state.bayListStore.data.map(
                                function(e){return e.name});
        baylist = baylistNames.join("|");
    }
    else
    {
        baylist = baylistSels;
    }
    return baylist;
}

function runConnectivityCheck() {
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        var gpPars = {};
        gpPars.sde = gs.sdeInstance + ".sde";
        gpPars.subset = formatBaylistSelectons(connectivityCheckSelection);
        gpPars.opts = registry.byId("connCheckradialDist").value;
        if (registry.byId("connCheckShowFuse").value)
        gpPars.opts = gpPars.opts + "," + registry.byId("connCheckShowFuse").checked;
        // requires service name and task name for constructing
        // url for rest service
        var gpurl = getGpUrl(connectionCheckSvc, connectionCheckSvc);
        console.log("Connectivity check started... url: ", gpurl);
        gp = new esri.tasks.Geoprocessor(gpurl);
        console.log("Parameters: ", gpPars);
        gpActive = 1;
        gpJobName = "connectivity_check";
        gpMesCount = 0;
        gp.submitJob(gpPars, connectivityCheckCompleteCallback, 
                     statusCallbackCC, connectivityCheckErrorCallback);
    }
}

function cancelConnectivityCheck() {
    console.log("Cancelling connectivity check...");
    if (gpActive === 1 && gpJobName === "connectivity_check") {
        gp.cancelJob(gpJob.jobId, cancelCompleteCallback, cancelErrorCallback);
    } else {
        console.log("No active job...");
    }
}

function connectivityCheckCompleteCallback(jobInfo) {
    console.log("Connectivity check job completed.", jobInfo);
    gpJobInfo = jobInfo;
    gpActive = 0;
    gpJob = 0;
    parseGpCompletionMessage(jobInfo);
    // gp.getResultData(jobInfo.jobId, "geoConnection", displayResult);
}

function connectivityCheckErrorCallback(jobInfo) {
    console.log("Connectivity check job failed.", jobInfo);
    gpJobInfo = jobInfo;
    gpActive = 0;
    gpJob = 0;
    parseGpCompletionMessage(jobInfo);
    // gp.getResultData(jobInfo.jobId, "geoConnection", displayResult);
}

function displayResult(result, messages) {
    gpRes = result;
    gpMes = messages;
    //downloadFile(result);
    //addMessage(result.value);
}

function downloadFile(report, messages) {
    if (report && report.value && report.value.url && report.value.url !== '') {
        var theurl = (esriConfig.defaults.io.proxyUrl?esriConfig.defaults.io.proxyUrl + "?":'') + report.value.url;
        addMessage('You can download the <a href="' + theurl + '">report.</a>', 'success');
    } else {
        addMessage('Report was not produced.', 'error');
    }
    //owPatchStyle();
    //window.location = theurl;
}

function displayResultPlot(report) {
    var theurl = esriConfig.defaults.io.proxyUrl + '?' + report.value.url;
    console.log(theurl);
    if (theurl !== '') {
        addMessage('You can download the <a href="' + theurl + '">report.</a>');
        //addMessage('<img src="'+theurl+'">');
    } else {
        addMessage('No issue observed!');
    }
}

function cancelCaseStudy() {
    console.log("Cancelling case study...");
    if (gpActive === 1 && gpJobName === "run_case_study") {
        gp.cancelJob(gpJob.jobId, cancelCompleteCallback, cancelErrorCallback);
    } else {
        console.log("No active job...");
    }
}

function cancelCompleteCallback(info) {
    //addMessage("Job cancelled successfully!");
    //console.log("Job cancelled successfully. Status: "+info.jobStatus);
}

function cancelErrorCallback() {
    addMessage("Job cancellation failed!");
    console.log("Job cancellation failed.");
}

function deleteCaseStudy(cs) {
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        gp = new esri.tasks.Geoprocessor(getGpUrl(manageCaseStudiesGPSvc, manageCaseStudiesGPSvc));
        var gpPars = {'sde': gs.sdeInstance, 'pfx': gs.sdePfx, 'operation': 'delete', 'csname': cs};
        gpMesCount = 0;
        gpActive = 1;
        gpJobName = "delete_case_study";
        controlStartWaiting('delCSLoadingDiv');
        gp.submitJob(gpPars, function (jobInfo) {
            console.log('Case study delete complete!', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
            controlStopWaiting('delCSLoadingDiv');
            getCaseStudies();

        }, statusCallback, function (jobInfo) {
            console.log('Case study delete error!', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
            controlStopWaiting('delCSLoadingDiv');
            getCaseStudies();
            console.log("Job completed with error: " + jobInfo.jobStatus);
        });
    }
}

function deleteIntCaseStudy(cs) {
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        gp = new esri.tasks.Geoprocessor(getGpUrl(manageIntCaseStudiesGPSvc, manageIntCaseStudiesGPSvc));
        var gpPars = {'sde': gs.sdeInstance, 'pfx': gs.sdePfx, 'operation': 'delete', 'csname': cs};
        gpMesCount = 0;
        gpActive = 1;
        gpJobName = "delete_int_case_study";
        controlStartWaiting('delIntCaseStudyLoadingDiv');
        gp.submitJob(gpPars, function (jobInfo) {
            console.log('Interval Case study delete complete!', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
            controlStopWaiting('delIntCaseStudyLoadingDiv');
            getIntCaseStudies();

        }, statusCallback, function (jobInfo) {
            console.log('Interval Case study delete error!', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
            controlStopWaiting('delIntCaseStudyLoadingDiv');
            getIntCaseStudies();
            console.log("Job completed with error: " + jobInfo.jobStatus);
        });
    }
}

/* version manager*/

function listVersions() {
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        window.gp = new esri.tasks.Geoprocessor(window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + versionManagerSvc + "/GPServer/" + versionManagerSvc);
        var gpPars = {'server': 'hotec_' + server + '.sde', 'operation': 'list'};
        gpMesCount = 0;
        gpActive = 1;
        gpJobName = "list_versions";
        controlStartWaiting('versionOperationLoadingDiv');
        gp.submitJob(gpPars, function (jobInfo) {
            console.log('List versions complete!', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            //parseGpCompletionMessage(jobInfo);
            gp.getResultData(jobInfo.jobId, "result", function (result, messages) {
                gpRes = result;
                gpMes = messages;
                if (versions && versions.tree) {
                    versions.tree.destroy();
                }
                versions = {list: result.value.list};
                // remoding "sde." from the beginning of names
                arrayUtils.forEach(versions.list, function (v) {
                    v.name = v.name.substr(4);
                    v.parentVersionName = (v.parentVersionName) ? v.parentVersionName.substr(4) : null;
                });
                versions.mem = new dojo.store.Memory({
                    data: versions.list, idProperty: 'name',
                    getChildren: function (object) {
                        return this.query({parentVersionName: object.name});
                    },
                });

                versions.mod = new dijit.tree.ObjectStoreModel({store: versions.mem, query: {name: 'DEFAULT'}});
                versions.tree = new dijit.Tree({
                    model: versions.mod, autoExpand: true,
                    getIconClass: function (item, opened) {
                        if (item === this.model.root) {
                            return "dijitIconDatabase";
                        } else {
                            return "dijitIconFile";
                        }
                    },
                    onClick: function (item, node, evt) {
                        changeVersion(item.name);
                    }
                });
                versions.tree.placeAt(dojo.byId("versionsDiv")).startup();

                if (versions.mem.query({name: gs.version}).length <= 0) {
                    gs.version = 'DEFAULT';
                }
                versions.tree.set('paths', [findPathTo(versions.mem, gs.version, "parentVersionName")]);
                controlStopWaiting('versionOperationLoadingDiv');
            });

        }, function () {
        }, function (jobInfo) {
            console.log('List versions error!', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
            controlStopWaiting('versionOperationLoadingDiv');
            //getCaseStudies();
            console.log("Job completed with error: " + jobInfo.jobStatus);
        });
    }
}


function createVersion(name, par, perm, desc) {
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        gp = new esri.tasks.Geoprocessor(window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + versionManagerSvc + "/GPServer/" + versionManagerSvc);
        var gpPars = {
            'server': 'hotec_' + server + '.sde',
            'operation': 'create',
            'verName': name,
            'parName': par,
            'verPerm': perm,
            'verDesc': desc
        };
        gpMesCount = 0;
        gpActive = 1;
        gpJobName = "create_version";
        controlStartWaiting('versionOperationLoadingDiv');
        gp.submitJob(gpPars, function (jobInfo) {
            console.log('Create version complete!', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            //parseGpCompletionMessage(jobInfo);
            controlStopWaiting('versionOperationLoadingDiv');
            gs.version = name;
            listVersions();

        }, function () {
        }, function (jobInfo) {
            console.log('Version creation failed!', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
            controlStopWaiting('versionOperationLoadingDiv');
            listVersions();
            console.log("Job completed with error: " + jobInfo.jobStatus);
        });
    }
}

function deleteVersion(name) {
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        gp = new esri.tasks.Geoprocessor(window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + versionManagerSvc + "/GPServer/" + versionManagerSvc);
        var gpPars = {'server': 'hotec_' + server + '.sde', 'operation': 'delete', 'verName': name};
        gpMesCount = 0;
        gpActive = 1;
        gpJobName = "delete_version";
        controlStartWaiting('versionOperationLoadingDiv');
        gp.submitJob(gpPars, function (jobInfo) {
            console.log('Delete version complete!', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            //parseGpCompletionMessage(jobInfo);
            controlStopWaiting('versionOperationLoadingDiv');
            listVersions();

        }, function () {
        }, function (jobInfo) {
            console.log('Version deletion failed!', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
            controlStopWaiting('versionOperationLoadingDiv');
            listVersions();
            console.log("Job completed with error: " + jobInfo.jobStatus);
        });
    }
}


/* file upload */

function uploadFile(svcName, form, uploadSucceeded, uploadFailed, jobName) {
    var gpUploadURL = getGpUploadUrl(svcName);
    console.log('Uploading file...', gpUploadURL);
    gpActive = 1;
    gpJobName = jobName;
    gpMesCount = 0;
    esri.request({
        url: gpUploadURL,
        form: dojo.byId(form),
        content: {f: "json"},
        //handleAs : "json",
    }, {
        //usePost: true, 
        //useProxy: true
    }).then(uploadSucceeded, uploadFailed);
}

function uploadIntervalLoadFile() {
    console.log('Importing interval load file...');
    registry.byId('ilfok').set("disabled", true);
    intervalLoadFileItemId = null;
    uploadFile(importIntervalLoadFileSvc, 'importIntervalLoadFileForm', 
                uploadIntervalLoadFileSucceeded, uploadFailed, "upload_interval_load_file");
}

function uploadIntervalLoadFileSucceeded(response) {
    intervalLoadFileItemId = response["item"].itemID;
    registry.byId('ilfok').set("disabled", false);
    gpActive = 0;
    console.log('File uploaded successfully, item ID:', billingFileItemId);
    processIntervalLoadFileOnServer();
}

function processIntervalLoadFileOnServer() {
    var params;
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        if (intervalLoadFileItemId) {
            console.log('Upload successful')
            gp = new esri.tasks.Geoprocessor(getGpUrl(importIntervalLoadFileSvc, importIntervalLoadFileSvc));
            
            intLoadProfileGrpName = registry.byId('intLoadProfileGrpName').value;
            pf = registry.byId('ipfPf').value;
            // might enter back in later?
            meterStartTs = null; //registry.byId('ipfStartTs').value;  
            meterEndTs = null; //registry.byId('ipfEndTs').value;
            method = 'create'; //registry.byId('');
            comments = registry.byId('ipfComments').value;

            params = {'sde': gs.sdeInstance, 
                      'intervalLoadFile': "{'itemID':" + intervalLoadFileItemId + "}",
                      'intervalProfileName': intLoadProfileGrpName,
                      'pf': pf,
                      'startTs': meterStartTs,
                      'endTs': meterEndTs,
                      'method': method,
                      'comments': comments
                    };
                    
            console.log('Import interval load file parameters: ', params);
            gpActive = 1;
            gpJobName = "process_interval_load_file";
            gpMesCount = 0;
            gp.submitJob(params, function (jobInfo) {
                console.log('Interval Load file import completed: ', jobInfo);
                gpJobInfo = jobInfo;
                gpActive = 0;
                gpJob = 0;
                parseGpCompletionMessage(jobInfo);
                getIntLoadProfiles();
            }, statusCallback, function (jobInfo) {
                console.log('Interval Load file import failed: ', jobInfo);
                gpJobInfo = jobInfo;
                gpActive = 0;
                gpJob = 0;
                parseGpCompletionMessage(jobInfo);
            });

        } 
        else {
            console.log('Null bay Interval Load file...');
        }
    }
}

function uploadBayLoadingFile() {
    console.log('Importing bay loading file...');
    registry.byId('iblfok').set("disabled", true);
    bayLoadingFileItemId = null;
    uploadFile(importBayLoadingFileSvc, 'importBayLoadingFileForm', bayLoadingFileUploadSucceeded, uploadFailed, "upload_bay_loading_file");
}

function bayLoadingFileUploadSucceeded(response) {
    bayLoadingFileItemId = response["item"].itemID;
    registry.byId('iblfok').set("disabled", false);
    gpActive = 0;
    console.log('File uploaded successfully, item ID:', billingFileItemId);
}

function processBayLoadingFileOnServer() {
    var params;
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        if (bayLoadingFileItemId) {
            console.log('Upload successful')
            gp = new esri.tasks.Geoprocessor(getGpUrl(importBayLoadingFileSvc, importBayLoadingFileSvc));
            params = {'sde': gs.sdeInstance, 'pfx': gs.sdePfx, 'blfile': "{'itemID':" + bayLoadingFileItemId + "}"};
            console.log('Import bay loading file parameters: ', params);
            gpActive = 1;
            gpJobName = "process_bay_loading_file";
            gpMesCount = 0;
            gp.submitJob(params, function (jobInfo) {
                console.log('Bay loading file import completed: ', jobInfo);
                gpJobInfo = jobInfo;
                gpActive = 0;
                gpJob = 0;
                parseGpCompletionMessage(jobInfo);
                getBayLoadingTimeStamps();
            }, statusCallback, function (jobInfo) {
                console.log('Bay loading file import failed: ', jobInfo);
                gpJobInfo = jobInfo;
                gpActive = 0;
                gpJob = 0;
                parseGpCompletionMessage(jobInfo);
            });

        } else {
            console.log('Null bay loading file...');
        }
    }
}

function uploadBillingFile() {
    console.log('Importing billing file...');
    registry.byId('ibfok').set("disabled", true);
    billingFileItemId = null;
    uploadFile(importBillingFileSvc, 'importBillingFileForm', billingFileUploadSucceeded, uploadFailed, "upload_billing_file");
}


function billingFileUploadSucceeded(response) {
    billingFileItemId = response["item"].itemID;
    registry.byId('ibfok').set("disabled", false);
    gpActive = 0;
    console.log('File uploaded successfully, item ID:', billingFileItemId);
}

function processBillingFileOnServer() {
    var params;
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        var mode = registry.byId('importBillingInfoMode').value;
        var ts = dojo.byId('billingFileDate').value;// + ' ' + dojo.byId('billingFileTime').value;
        //ts = new Date(dojo.byId('billingFileDate').value +' '+ dojo.byId('billingFileTime').value).getTime();
        params = {'sde': gs.sdeInstance, 'pfx': gs.sdePfx, 'mode': mode, 'timestamp': ts};
        var allGood = false, nDays = 30;
        if (mode === 'file') {
            if (billingFileItemId) {
                params['bfile'] = "{'itemID':" + billingFileItemId + "}";
                allGood = true;
            }
            else {
                console.log('Null billing file...');
            }
        } else if (mode === 'multispeak') {
            nDays = parseInt(dojo.byId('meteringTimeSpan').value);
            if (!isNaN(nDays)) {
                params['opts'] = '{"nDays":' + nDays + '}';
                allGood = true;
            }
        }
        if (allGood) {
            gp = new esri.tasks.Geoprocessor(getGpUrl(importBillingFileSvc, importBillingFileSvc));
            console.log('Import billing/metering info parameters: ', params);
            gpActive = 1;
            gpJobName = "process_billing_file";
            gpMesCount = 0;
            gp.submitJob(params, function (jobInfo) {
                console.log('Billing file import completed: ', jobInfo);
                gpJobInfo = jobInfo;
                gpActive = 0;
                gpJob = 0;
                parseGpCompletionMessage(jobInfo);
                getMeteringTimeStamps();
            }, statusCallback, function (jobInfo) {
                console.log('Billing file import failed: ', jobInfo);
                gpJobInfo = jobInfo;
                gpActive = 0;
                gpJob = 0;
                parseGpCompletionMessage(jobInfo);
            });
        }
    }
}

function uploadFailed(jobInfo) {
    console.log('Upload failed: ', jobInfo);
    gpJobInfo = jobInfo;
    gpActive = 0;
    gpJob = 0;
    parseGpCompletionMessage(jobInfo);
}

function addLoadProfile(lp, blTs, mTs, defPf, comments) {
    var params;
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        console.log('Adding load profile: ', lp)
        gp = new esri.tasks.Geoprocessor(getGpUrl(manageLoadProfilesSvc, manageLoadProfilesSvc));
        params = {
            'sde': gs.sdeInstance, 'pfx': gs.sdePfx, 'operation': 'create',
            'lpname': lp, 'bayloadingts': blTs, 'meteringts': mTs,
            'defaultpf': defPf, 'comments ': comments
        };
        console.log('Manage load profile parameters: ', params);
        gpActive = 1;
        gpJobName = "create_load_profile";
        gpMesCount = 0;
        gp.submitJob(params, function (jobInfo) {
            console.log('Manage load profile completed: ', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
            getLoadProfiles();
        }, statusCallback, function (jobInfo) {
            console.log('Manage load profile failed: ', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
        });
    }
}

function deleteLoadProfile(lp) {
    var params;
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        console.log('Deleting load profile: ', lp)
        gp = new esri.tasks.Geoprocessor(getGpUrl(manageLoadProfilesSvc, manageLoadProfilesSvc));
        params = {
            'sde': gs.sdeInstance, 'pfx': gs.sdePfx, 'operation': 'delete',
            'lpname': lp, 'bayloadingts': '', 'meteringts': '',
            'defaultpf': '', 'comments ': ''
        };
        console.log('Delete load profile parameters: ', params);
        gpActive = 1;
        gpJobName = "delete_load_profile";
        gpMesCount = 0;
        gp.submitJob(params, function (jobInfo) {
            console.log('Delete load profile completed: ', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
            getLoadProfiles();
        }, statusCallback, function (jobInfo) {
            console.log('Delete load profile failed: ', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
        });
    }
}

function wipeAndRebuild() {
    var params;
    if (gpActive === 1) {
        console.log("A job is already active...");
        addMessage("A job is already active...");
    } else {
        console.log('Rebuilding Network...');
        addMessage('Rebuilding Network...');
        window.gp = new esri.tasks.Geoprocessor(getGpUrl(wipeAndRebuildSvc,wipeAndRebuildSvc));
        params = {};
        //console.log('Manage load profile parameters: ',params);
        gpActive = 1;
        gpJobName = "wipe_and_rebuild";
        gpMesCount = 0;
        gp.submitJob(params, function (jobInfo) {
            console.log('Wipe and rebuild completed: ', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
            //getLoadProfiles();
            location.reload(true);
        }, statusCallback, function (jobInfo) {
            console.log('Wipe and rebuild failed: ', jobInfo);
            gpJobInfo = jobInfo;
            gpActive = 0;
            gpJob = 0;
            parseGpCompletionMessage(jobInfo);
        });
    }
}