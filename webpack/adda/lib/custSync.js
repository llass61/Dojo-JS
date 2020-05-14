define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/declare",
		"esri/tasks/Geoprocessor"
],
	function (
		kernel, lang, winUtil, declare, Geoprocessor
		) {

		var customersSync = dojo.declare("gs.customersSync", null, {
			constructor: function (svc) {
				this.service = svc;
				this.state = 'uninitiated';
				this.gpJob = null;
				this.sde = null;
				this.pfx = null;
				this.gp = null;
				this.startWaitFunc = null;
				this.stopWaitFunc = null;
				this.startWaitFuncUpload = null;
				this.stopWaitFuncUpload = null;
				this.jobManager = null;
				this.customersFile = null;
				this.form = null;
				this.postSync = null;
				this.results = this.newCust = this.noNear = this.coordinateMismatch = this.correctedPhasing = null;
				this.options = {
					'add_new': 1,
					'update_existing': 1,
					'update_coordinates': 1,
					'validate_coordinates': 1,
					'valid_distance': 12000, // in feet
					'delete_obsolete': 0,
					'delete_related_record': 1,
					'check_phase_mismatch': 1,
					'favor_parent_phase': 1,
					'clean_first': 0,
				};

			},

			sync: function () {
				if (this.customersFile) {
					this.gp = new Geoprocessor(this.service);
					var params = {'sde': this.sde, 'pfx': this.pfx, 'options': ((this.options)?json.stringify(this.options):''), 'customersfile': '{"itemID": "' + this.customersFile.itemID + '"}' };
					console.log("Customers sync started... Parameters: ", params);
					this.state = 'active';
					this.results = this.newCust = this.noNear = this.coordinateMismatch = this.correctedPhasing = null;
					if (this.startWaitFunc) this.startWaitFunc();
					//add the job to jobManager
					//run GP job
					this.gp.submitJob(params, lang.hitch(this, this.completeCallback), lang.hitch(this, this.statusCallback), lang.hitch(this, this.errorCallback));
				} else {
					console.log('Customers Sync: Customers file not ready!');
				}
			},

			cancel: function () {
				console.log("Cancelling customers sync...");
				if (this.state === 'active') {
					this.state = 'canceled';
					this.gp.cancelJob(this.gpJob.jobId, lang.hitch(this, this.cancelCompleteCallback), lang.hitch(this, this.cancelErrorCallback));
				} else {
					console.log("No active backup job");
				}
			},

			uploadCustomersFile: function () {
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
						content: { f: "json" },
						handleAs: "json",
					}, { usePost: true}).then(lang.hitch(this, this.uploadSucceeded), lang.hitch(this, this.uploadFailed));
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
					this.gp.getResultData(jobInfo.jobId, "result", lang.hitch(this, function (result, messages) {
						this.results = result;
						this.customersFile = null;
						this.state = 'done';
						console.log("Customers sync complete.", result);
						if (typeof this.results.value !== 'undefined') {
							this.newCust = this.results.value["new_customers"];
							this.noNear = this.results.value["no_near"];
							this.coordinateMismatch = this.results.value["coordinate_mismatch"];
							this.correctedPhasing = this.results.value["corrected_phasing"];
							if (this.postMessage) {
							    if (this.newCust.length > 0) {
							        this.postMessage({
							            type: 'esriJobMessageTypeInformative',
							            description: "New members: " + this.newCust.map(linkifySecname).join(', ')
							        });
							    } else {
							        this.postMessage({
							            type: 'esriJobMessageTypeInformative',
							            description: "No new members found."
							        });
							    }
							}
						}
						if (this.postSync) { this.postSync(); }
					}));
				} else { }
				console.log("Customers sync job complete; requesting results...", jobInfo);
			},

			errorCallback: function (jobInfo) {
				console.log("Customers sync failed.", jobInfo);
				this.state = 'error';
				this.parseGpCompletionMessage(jobInfo);
				if (this.stopWaitFunc) this.stopWaitFunc();
				this.gpJob = jobInfo;
			},

			postMessage: function (msg) {
				console.log("Customers sync: " + msg.type + " : " + msg.description);
			},

			parseGpCompletionMessage: function (jobInfo) {
				if (jobInfo.jobStatus === 'esriJobCancelled' || jobInfo.jobStatus === 'esriJobCancelling') {
					console.log("Customers sync completed (cancelled).");
				} else if (jobInfo.jobStatus === 'esriJobSucceeded') {
					console.log("Customers sync completed successfully.");
				} else {
					console.log("Customers sync completed with status: " + jobInfo.jobStatus);
				}
			},

			cancelCompleteCallback: function (jobInfo) {
				console.log("Customers sync cancelled successfully. Status: " + jobInfo.jobStatus);
			},

			cancelErrorCallback: function (jobInfo) {
				console.log("Customers sync cancellation failed.");
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
			},

		});

		return customersSync;
	});