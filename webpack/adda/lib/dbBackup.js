define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/declare",
		"esri/tasks/Geoprocessor"
],
	function (
		kernel, lang, winUtil, declare, Geoprocessor
		) {

		var dbBackup = dojo.declare("gs.dbBackup", null, {
			constructor: function (svc) {
				this.service = svc;
				this.state = 'uninitiated';
				this.gpJob = null;
				this.server = 'localhost';
				this.db = null;
				this.gp = null;
				this.startWaitFunc = null;
				this.stopWaitFunc = null;
				this.startWaitFuncUpload = null;
				this.stopWaitFuncUpload = null;
				this.jobManager = null;
				this.restoreFile = null;
				this.form = null;
				this.backupFileUrl = null;
				this.postRestore = null;
			},

			backup: function(){
				this.gp = new Geoprocessor(this.service);
				var params = {'server': this.server, 'db': this.db, 'operation': 'backup'};
				console.log("Backup started... Parameters: ", params);
				this.state = 'backup';
				this.backupFileUrl = null;
				//gpJobName = "run_case_study";
				//gpMesCount = 0;
				//dojo.style("activityDiv", 'visibility', 'visible');
				if (this.startWaitFunc) this.startWaitFunc();
				//add the job to jobManager
				//run GP job
				this.gp.submitJob(params, lang.hitch(this, this.completeCallback), lang.hitch(this, this.statusCallback), lang.hitch(this, this.errorCallback));
			},

			restore: function(){
				if (this.restoreFile) {
					this.gp = new Geoprocessor(this.service);
					var params = { 'server': this.server, 'operation': 'restore', 'restorefile': '{"itemID": "' + this.restoreFile.itemID + '"}' };
					console.log("Restore started... Parameters: ", params);
					this.state = 'restore';
					//gpJobName = "run_case_study";
					//gpMesCount = 0;
					//dojo.style("activityDiv", 'visibility', 'visible');
					if (this.startWaitFunc) this.startWaitFunc();
					//add the job to jobManager
					//run GP job
					this.gp.submitJob(params, lang.hitch(this, this.completeCallback), lang.hitch(this, this.statusCallback), lang.hitch(this, this.errorCallback));
				} else {
					console.log('dbBackup: Restore file not ready!');
				}
			},

			cancel: function (){
				console.log("Cancelling backup job...");
				if (this.state === 'backup' || this.state === 'restore') {
					this.state = 'canceled';
					this.gp.cancelJob(this.gpJob.jobId, lang.hitch(this, this.cancelCompleteCallback), lang.hitch(this, this.cancelErrorCallback));
				} else {
					console.log("No active backup job");
				}
			},

			uploadRestoreFile: function () {
			    if (!this.form) {
			        console.log('Backup: No upload form assigned!');
			    } else if (this.service === '') {
			        console.log('Backup: No backup service!');
			    } else {
			        var gpUploadURL = this.service.substr(0, this.service.lastIndexOf('/')) + "/uploads/upload";
			        console.log('Uploading restore file...', gpUploadURL);
			        if (this.startWaitFuncUpload) this.startWaitFuncUpload();
			        esri.request({
			            url: gpUploadURL,
			            form: this.form,
			            content: { f: "json" },
			            handleAs: "json",
			        }, { usePost: true }).then(lang.hitch(this, this.uploadSucceeded), lang.hitch(this, this.uploadFailed));
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
				this.gpJob=jobInfo;
			},

			completeCallback: function (jobInfo) {
				this.parseGpCompletionMessage(jobInfo);
				if (this.stopWaitFunc) this.stopWaitFunc();
				this.gpJob = jobInfo;
				if (this.state === 'backup') {
			        // get the file
				    this.gp.getResultData(jobInfo.jobId, "backupfile", lang.hitch(this, function (bf) {
				        console.log('Backup file: ', bf);
				        this.backupFileUrl = bf.value.url;
				        if (this.backupFileUrl !== '') {
				            //window.open(this.backupFileUrl);
							//window.location.assign(this.backupFileUrl);
							var fileUrl= (esriConfig.defaults.io.proxyUrl?esriConfig.defaults.io.proxyUrl + "?":'') + this.backupFileUrl;
	                        this.postMessage({ type: 'success', description: 'Click <a target="_blank" href="' + fileUrl + '">here</a> to download the backup.' });
				        } else {
				            console.log('Invalid back up file URL');
				        }
				    }));
				} else if (this.state === 'restore') {
				    this.restorefile = null;
				    if (this.postRestore) { this.postRestore(); }
				} else { }

				this.state = 'done';
				console.log("Backup job complete.", jobInfo);
			},

			errorCallback: function (jobInfo) {
				console.log("Backup job failed.", jobInfo);
				this.state = 'error';
				this.parseGpCompletionMessage(jobInfo);
				if (this.stopWaitFunc) this.stopWaitFunc();
				this.gpJob = jobInfo;
			},

			postMessage: function (msg) {
			    console.log("Backup: " + msg.type + " : " + msg.description);
			},

			parseGpCompletionMessage: function (jobInfo){
				if (jobInfo.jobStatus === 'esriJobCancelled' || jobInfo.jobStatus === 'esriJobCancelling') {
					console.log("Backup completed (cancelled).");
				} else if (jobInfo.jobStatus === 'esriJobSucceeded') {
					console.log("Backup completed successfully.");
				} else {
					console.log("Backup completed with status: " + jobInfo.jobStatus);
				}
			},

			cancelCompleteCallback: function (jobInfo) {
				console.log("Backup job cancelled successfully. Status: " + jobInfo.jobStatus);
			},

			cancelErrorCallback: function (jobInfo) {
				console.log("Backup job cancellation failed.");
			},

			uploadSucceeded: function (response) {
			    this.restoreFile = response["item"];
			    if (this.stopWaitFuncUpload) this.stopWaitFuncUpload();
			    console.log('File uploaded successfully, item ID:', this.restoreFile.itemID);
			},

			uploadFailed: function (jobInfo) {
			    console.log('Upload failed: ', jobInfo);
			    this.restoreFile = null;
			    if (this.stopWaitFuncUpload) this.stopWaitFuncUpload();
			},

			postCreate: function () {
				this.inherited(arguments);
			},

			});

return dbBackup;
});