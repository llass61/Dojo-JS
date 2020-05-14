define(["dojo/_base/lang", "dojo/_base/declare", "esri/tasks/Geoprocessor"
    ],
    function (lang, declare, Geoprocessor, services) {

        return dojo.declare("GpService", null, {

            constructor: function (services, task, params) {
                this.isActive = false;
                this.services = services;
                this.task = task;
                // this.params = params;
                this.messageCnt = 0;
                this.jobName = "";
                this.jobInfo = null;
                this.gp = new Geoprocessor(this.services.getGpUrl(task, task));
            },

            init: function() {
                this.isActive = false;
                this.messageCnt = 0;
                this.jobName = "";
                this.jobInfo = null;
            },
            
            submitJob: function(task,params) {
                console.log("Begin geoprocessor: ");
                this.init();
                
                this.isActive = true;
                // gp = new Geoprocessor(this.services.getGpUrl(service, task));
                this.gp.submitJob(params, 
                    lang.hitch(this, function (jobInfo) {
                        console.log(`${task} completed: ${jobInof}`);
                        this.jobInfo = jobInfo;
                        this.isActive = false;
                        // parseGpCompletionMessage(jobInfo);
                        // getBayLoadingTimeStamps();
                    }), 
                    lang.hitch(this, this.statusCallback), 
                    lang.hitch(this, function (jobInfo) {
                        console.log('Import failed: ', jobInfo);
                        this.jobInfo = jobInfo;
                        this.isActive = false;
                        // parseGpCompletionMessage(jobInfo);
                    })
                );
            },

            statusCallback: function (jobInfo) {

                if (this.messageCnt !== jobInfo.messages.length) {
                    for (var i = this.messageCnt; i < jobInfo.messages.length; i++) {
                        if (jobInfo.messages.slice(0, i).filter(function (m) {
                                return m.type === jobInfo.messages[i].type && m.description === jobInfo.messages[i].description;
                            }).length <= 0) {
                            console.log(jobInfo.messages[i].type + " : " + jobInfo.messages[i].description);
                            // addMessage(jobInfo.messages[i].type + " : " + jobInfo.messages[i].description);
                        } else {
                            console.log('Duplicate message: ', jobInfo.messages[i]);
                        }
                    }
                }

                this.messageCnt = jobInfo.messages.length;
                if (this.gpMes !== jobInfo.jobStatus) {
                    this.gpJobInfo = jobInfo;
                    this.gpMes = jobInfo.jobStatus;
                    console.log(jobInfo.jobStatus);
                    // addMessage(jobInfo.jobStatus);
                }
            },
        });
    });

            

            //         if (bayLoadingFileItemId) {
            //             console.log('Upload successful')
            //             gp = new esri.tasks.Geoprocessor(this.services.getGpUrl(importBayLoadingFileSvc, importBayLoadingFileSvc));
            //             params = {'sde': gs.sdeInstance, 'pfx': gs.sdePfx, 'blfile': "{'itemID':" + bayLoadingFileItemId + "}"};
            //             console.log('Import bay loading file parameters: ', params);
            //             isActive = 1;
            //             gpJobName = "process_bay_loading_file";
            //             messageCnt = 0;
            //             gp.submitJob(params, function (jobInfo) {
            //                 console.log('Bay loading file import completed: ', jobInfo);
            //                 gpJobInfo = jobInfo;
            //                 isActive = 0;
            //                 gpJob = 0;
            //                 parseGpCompletionMessage(jobInfo);
            //                 getBayLoadingTimeStamps();
            //             }, statusCallback, function (jobInfo) {
            //                 console.log('Bay loading file import failed: ', jobInfo);
            //                 gpJobInfo = jobInfo;
            //                 isActive = 0;
            //                 gpJob = 0;
            //                 parseGpCompletionMessage(jobInfo);
            //             });
            
            //         } else {
            //             console.log('Null bay loading file...');
            //         }
            //     }
            // },

            // cancel: function () {
            //     console.log("Outage Analysis: Cancelling outage meter list...");
            //     if (this.state === 'active') {
            //         this.state = 'canceled';
            //         this.gp.cancelJob(this.gpJob.jobId, lang.hitch(this, this.cancelCompleteCallback), lang.hitch(this, this.cancelErrorCallback));
            //     } else {
            //         console.log("No active backup job");
            //     }
            // },

        //     statusCallback: function (jobInfo) {
        //         var mc = (this.gpJob) ? this.gpJob.messages.length : 0;
        //         if (mc !== jobInfo.messages.length) {
        //             for (i = mc; i < jobInfo.messages.length; i++) {
        //                 this.postMessage(jobInfo.messages[i]);
        //             }
        //         }
        //         if (!this.gpJob || this.gpJob.jobStatus !== jobInfo.jobStatus) {
        //             console.log(jobInfo.jobStatus);
        //         }
        //         this.gpJob = jobInfo;
        //     },

        //     completeCallback: function (jobInfo) {
        //         this.parseGpCompletionMessage(jobInfo);
        //         if (this.stopWaitFunc) this.stopWaitFunc();
        //         this.gpJob = jobInfo;
        //         if (this.state === 'active') {
        //             this.state = 'gettingresults';
        //             this.gp.getResultData(jobInfo.jobId, "output", lang.hitch(this, function (result, messages) {
        //                 this.results = result;
        //                 this.outageMeterList = null;
        //                 this.state = 'done';
        //                 console.log("Outage analysis list outage meters complete.", result);
        //                 if (typeof this.results.value !== 'undefined') {
        //                     this.outageMeterList = this.results.value;
        //                     if (this.postMessage) {
        //                         this.postMessage({
        //                             type: 'esriJobMessageTypeInformative',
        //                             description: "Outage Meters: " + this.outageMeterList.join(', ')
        //                         });
        //                     }
        //                 }
        //                 this.getOutageCustomers();
        //                 //if (this.postSync) { this.postSync(); }
        //             }));
        //         } else {
        //         }
        //         console.log("Outage analysis list outage meters job complete; requesting results...", jobInfo);
        //     },

        //     errorCallback: function (jobInfo) {
        //         console.log("Outage analysis list outage meters failed.", jobInfo);
        //         this.state = 'error';
        //         this.parseGpCompletionMessage(jobInfo);
        //         if (this.stopWaitFunc) this.stopWaitFunc();
        //         this.gpJob = jobInfo;
        //     },

        //     postMessage: function (msg) {
        //         console.log("Outage analysis, List outage meters: " + msg.type + " : " + msg.description);
        //     },

        //     parseGpCompletionMessage: function (jobInfo) {
        //         if (jobInfo.jobStatus === 'esriJobCancelled' || jobInfo.jobStatus === 'esriJobCancelling') {
        //             console.log("Outage analysis list OD meters completed (cancelled).");
        //         } else if (jobInfo.jobStatus === 'esriJobSucceeded') {
        //             console.log("Outage analysis list OD meters completed successfully.");
        //         } else {
        //             console.log("Outage analysis list OD meters completed with status: " + jobInfo.jobStatus);
        //         }
        //     },

        //     cancelCompleteCallback: function (jobInfo) {
        //         console.log("Customers sync cancelled successfully. Status: " + jobInfo.jobStatus);
        //     },

        //     cancelErrorCallback: function (jobInfo) {
        //         console.log("Customers sync cancellation failed.");
        //     },

        //     uploadFile: function () {
        //         if (!this.form) {
        //             console.log('Customers Sync: No upload form assigned!');
        //         } else if (this.service === '') {
        //             console.log('Customers Sync: No customer import service!');
        //         } else {
        //             var gpUploadURL = this.service.substr(0, this.service.lastIndexOf('/')) + "/uploads/upload";
        //             console.log('Uploading customers file...', gpUploadURL);
        //             if (this.startWaitFuncUpload) this.startWaitFuncUpload();
        //             esri.request({
        //                 url: gpUploadURL,
        //                 form: this.form,
        //                 content: {f: "json"},
        //                 handleAs: "json",
        //             }, {
        //                 usePost: true
        //             }).then(lang.hitch(this, this.uploadSucceeded), lang.hitch(this, this.uploadFailed));
        //         }
        //     },

        //     uploadSucceeded: function (response) {
        //         this.customersFile = response["item"];
        //         if (this.stopWaitFuncUpload) this.stopWaitFuncUpload();
        //         console.log('File uploaded successfully, item ID:', this.customersFile.itemID);
        //     },

        //     uploadFailed: function (jobInfo) {
        //         console.log('Upload failed: ', jobInfo);
        //         this.customersFile = null;
        //         if (this.stopWaitFuncUpload) this.stopWaitFuncUpload();
        //     },

        //     postCreate: function () {
        //         this.inherited(arguments);
        //         console.log('Outage analysis post create...');
        //     },

        // });
        // return outageAnalyzer;
    //});