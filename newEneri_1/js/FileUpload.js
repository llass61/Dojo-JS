define(["dojo/_base/declare", "esri/tasks/Geoprocessor",
        "lib/Services"
    ],
    function (declare) {

        return dojo.declare("FileUpload", null, {
            isActive: false,

            constructor: function (services) {
                this.services = services;
                this.fileItemId = "";
            },

            uploadFile: function (svcName, formId) {
                var gpUploadURL = services.getGpUploadUrl(svcName);
                console.log('Uploading file...', gpUploadURL);
                isActive = true;
                esri.request({
                    url: gpUploadURL,
                    form: dojo.byId(formId),
                    content: {f: "json"},
                }).then(dojo.hitch(this, this.uploadSucceeded), this.uploadFailed);
            },

            uploadSucceeded: function (jobInfo) {
                isActive = false;
                this.fileItemId = jobInfo["item"].itemID;
                registry.byId('ilfok').set("disabled", false);
                console.log('File uploaded successfully, item ID:', this.fileItemId);
            },

            uploadFailed: function (jobInfo) {         
                isActive = false;
                this.fileItemId = "";
                console.log('Upload failed: ', jobInfo);
                parseGpCompletionMessage(jobInfo);
            },
        });
    });