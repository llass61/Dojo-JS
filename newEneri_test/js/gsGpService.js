define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "esri/tasks/Geoprocessor"
    ],
    function (kernel, lang, declare, Geoprocessor) {

        var outageAnalyzer = dojo.declare("gs.gsGpService", null, {
            constructor: function (gsobj, layer, svc, params) {
                this.name = 'gsGpService';
                this.service = svc;
                this.state = 'uninitiated';
                this.gpJob = null;
                this.sde = null;
                this.pfx = null;
                this.gp = null;
                this.jobManager = null;

                this.gs = gsobj;
                this.startWaitFunc = null;
                this.stopWaitFunc = null;
                this.msgFunc = null;
                this.startWaitFuncUpload = null;
                this.stopWaitFuncUpload = null;
                this.form = null;
                this.cannedMessages = {
                    'start': '',
                    'progress': '',
                    'complete': '',
                    'success': '',
                    'failure': '',
                    'cancel': '',
                    'file_upload_start': '',
                    'file_upload_success': '',
                    'file_upload_failure': '',
                }
                if (params) {
                }
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
                    for (i = mc; i < jobInfo.messages.length; i++) {
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
                        this.outageMeterList = null;
                        this.state = 'done';
                        console.log("Outage analysis list outage meters complete.", result);
                        if (typeof this.results.value !== 'undefined') {
                            this.outageMeterList = this.results.value;
                            if (this.postMessage) {
                                this.postMessage({
                                    type: 'esriJobMessageTypeInformative',
                                    description: "Outage Meters: " + this.outageMeterList.join(', ')
                                });
                            }
                        }
                        this.getOutageCustomers();
                        //if (this.postSync) { this.postSync(); }
                    }));
                } else {
                }
                console.log("Outage analysis list outage meters job complete; requesting results...", jobInfo);
            },

            errorCallback: function (jobInfo) {
                console.log("Outage analysis list outage meters failed.", jobInfo);
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
                } else if (jobInfo.jobStatus === 'esriJobSucceeded') {
                    console.log("Outage analysis list OD meters completed successfully.");
                } else {
                    console.log("Outage analysis list OD meters completed with status: " + jobInfo.jobStatus);
                }
            },

            cancelCompleteCallback: function (jobInfo) {
                console.log("Customers sync cancelled successfully. Status: " + jobInfo.jobStatus);
            },

            cancelErrorCallback: function (jobInfo) {
                console.log("Customers sync cancellation failed.");
            },

            uploadFile: function () {
                if (!this.form) {
                    console.log('Customers Sync: No upload form assigned!');
                } else if (this.service === '') {
                    console.log('Customers Sync: No customer import service!');
                } else {
                    var gpUploadURL = this.service.substr(0, this.service.lastIndexOf('/')) + "/uploads/upload";
                    console.log('Uploading customers file...', gpUploadURL);
                    if (this.startWaitFuncUpload) this.startWaitFuncUpload();
                    esri.request({
                        url: gpUploadURL,
                        form: this.form,
                        content: {f: "json"},
                        handleAs: "json",
                    }, {
                        usePost: true
                    }).then(lang.hitch(this, this.uploadSucceeded), lang.hitch(this, this.uploadFailed));
                }
            },

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

            postCreate: function () {
                this.inherited(arguments);
                console.log('Outage analysis post create...');
            },

        });
        return outageAnalyzer;
    });