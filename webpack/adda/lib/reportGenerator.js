define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare",
		"esri/tasks/Geoprocessor"
],
	function (
		kernel, lang, declare, Geoprocessor
		) {

	    var repGen = dojo.declare("gs.reportGenerator", null, {
	        constructor: function (gsobj, svc) {
	            this.service = svc;
	            this.state = 'uninitiated';
	            this.gpJob = null;
				this.sde = null;
				this.pfx = null;
	            this.gp = null;
	            this.gs = gsobj;
	            this.startWaitFunc = null;
	            this.stopWaitFunc = null;
	            this.startWaitFuncUpload = null;
	            this.stopWaitFuncUpload = null;
	            this.jobManager = null;
	            this.reportFileUrl = null;
	            this.postRestore = null;

	            this.subset = '.*';
	            this.caseStudyName = null;
	            this.opts = { 'report': { }} // file name, type, etc.

	        },

	        renderReport: function () {
	            if (this.caseStudyName) {
	                this.gp = new Geoprocessor(this.service);
	                var params = {'sde': this.sde, 'pfx': this.pfx, 'subset': this.subset, 'csname': this.caseStudyName,
	                               'opts': JSON.stringify(this.opts)};
	                console.log("Report generator started... Parameters: ", params);
	                this.state = 'report';
	                this.reportFileUrl = null;
	                if (this.startWaitFunc) this.startWaitFunc();
	                this.gp.submitJob(params, lang.hitch(this, this.completeCallback), lang.hitch(this, this.statusCallback), lang.hitch(this, this.errorCallback));
	            } else {
	                console.log("No case study name provided.");
	            }
	        },

	        cancel: function () {
	            console.log("Cancelling report job...");
	            if (this.state === 'report') {
	                this.state = 'canceled';
	                this.gp.cancelJob(this.gpJob.jobId, lang.hitch(this, this.cancelCompleteCallback), lang.hitch(this, this.cancelErrorCallback));
	            } else {
	                console.log("No active report jobs.");
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
	            if (this.state === 'report') {
	                // get the file
	                this.gp.getResultData(jobInfo.jobId, "reportfile", lang.hitch(this, function (rf) {
	                    console.log('Report file: ', rf);
	                    this.reportFileUrl = rf.value.url;
	                    if (this.reportFileUrl !== '') {
							//window.open(this.reportFileUrl);
							var fileUrl= (esriConfig.defaults.io.proxyUrl?esriConfig.defaults.io.proxyUrl + "?":'') + this.reportFileUrl
	                        this.postMessage({ type: 'success', description: 'Click <a target="_blank" download="' + this.caseStudyName + '.csv" href="' + fileUrl + '">here</a> to download the report.' });
	                        //window.location.assign(this.reportFileUrl);
	                    } else {
	                        console.log('Invalid report file URL.');
	                    }
	                }));
	            } else {
	                console.log('Invalid reportGenerator status.');
	            }

	            this.state = 'done';
	            console.log("Report generation job complete.", jobInfo);
	        },

	        errorCallback: function (jobInfo) {
	            console.log("Report generation job failed.", jobInfo);
	            this.state = 'error';
	            this.parseGpCompletionMessage(jobInfo);
	            if (this.stopWaitFunc) this.stopWaitFunc();
	            this.gpJob = jobInfo;
	        },

	        postMessage: function (msg) {
	            console.log("Report Generator: " + msg.type + " : " + msg.description);
	        },

	        parseGpCompletionMessage: function (jobInfo) {
	            if (jobInfo.jobStatus === 'esriJobCancelled' || jobInfo.jobStatus === 'esriJobCancelling') {
	                console.log("Report generation completed (cancelled).");
	            } else if (jobInfo.jobStatus === 'esriJobSucceeded') {
	                console.log("Report generation completed successfully.");
	            } else {
	                console.log("Report generation completed with status: " + jobInfo.jobStatus);
	            }
	        },

	        cancelCompleteCallback: function (jobInfo) {
	            console.log("Report generation job cancelled successfully. Status: " + jobInfo.jobStatus);
	        },

	        cancelErrorCallback: function (jobInfo) {
	            console.log("Report generation job cancellation failed.");
	        },

	        postCreate: function () {
	            this.inherited(arguments);
	        },

	    });

	    return repGen;
	});