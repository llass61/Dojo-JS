define(["dojo/_base/lang",
        "dojo/_base/declare",
        "dojo/_base/array",
        "esri/tasks/QueryTask",
        "esri/tasks/query",
        "dojo/promise/all",
    ],
    function (lang, declare, array,
              QueryTask, Query, all) {
        
        return dojo.declare("EquipModelsService", null, {

            PROT_OTYPES: ['breaker', 'fuse', 'recloser', 'sectionalizer'],

            // not part of class?  Need to define inside of constructor?
            MODEL_DEFS: [
                {otypes: ['oh'], tab: 'model_conductor', id: 'id',},
                {otypes: ['ug'], tab: 'model_ug', id: 'id',},
                {otypes: ['construction'], tab: 'model_construction', id: 'id',},
                {otypes: ['transformer'], tab: 'model_transformer', id: 'equipref',},
                {otypes: ['regulator'], tab: 'model_regulator', id: 'equipref',},
                {otypes: ['capacitor'], tab: 'model_cap', id: 'equipref',},
                {otypes: ['motor'], tab: 'model_motor', id: 'equipref',},
                {otypes: ['source'], tab: 'model_source', id: 'equipref',},
                {otypes: ['generator'], tab: 'model_generator', id: 'equipref',},
                {otypes: this.PROT_OTYPES, tab: 'model_protection', id: 'equipref',},
                {otypes: ['circuit'], tab: 'model_circuit', id: 'equipref',},
                {otypes: ['switch'], tab: 'model_switch', id: 'equipref',}
            ],

            constructor: function (mapServiceInfo, map) {
                this.mapServiceInfo = mapServiceInfo;
                this.map = map;
            },

            validate: function (tab) {
                return array.some(MODEL_DEFS, function(ot) {
                    if (ot.otypes == tab) {
                        console.log("ug found!");
                    }
                });
            },

            getAllModels: function () {

                all(this.MODEL_DEFS.map(function (et, i) {
                    // et.otypes.forEach(function (ot) {
                    //     gs.model.otype2DbIndex[ot] = i;
                    // });

                    if (this.mapServiceInfo.layInds &&
                        this.mapServiceInfo.layInds[et.tab]) {

                        console.log(`et: ${et};   i: ${i}`);
                        let qt = new QueryTask(this.mapServiceInfo.getMapLayerUrl(et.tab));
                        let q = new Query();
                        q.returnGeometry = false;
                        q.where = "1=1";
                        q.outFields = ["*"];
                        q.orderByFields = [this.MODEL_DEFS[i].id];
                        //console.log('Querying table:',et.tab, 'Q: ', q);
                        return qt.execute(q);
                    }
                    else {
                        console.log('layer index not found:', et.tab);
                        return null;
                    }
                
                    // maybe want to create an event to fire this off when complete?
                    // or put the 'then' logic in a diff function and return the 
                    //   promise - the new func can be called after return.
                    // the MODEL_DEFS.map needs access to 'this' and
                    // the then function needs access to 'this'
                },this)).then(lang.hitch(this,function (results) {
                    console.log("EquipModeService returned results...");
                    results.forEach((result, idx) => {
                        // let result = results[idx];
                        if (result.features && result.features.length > 0) {
                            this.MODEL_DEFS[idx]['list'] = result.features.map(function (f) {
                                return (f.attributes ? f.attributes[this.MODEL_DEFS[idx].id] : null);
                            }, this);

                            this.MODEL_DEFS[idx]['features'] = result.features;
                        }
                        else {
                            this.MODEL_DEFS[idx]['list'] = [];
                            this.MODEL_DEFS[idx]['features'] = []
                        }
                    }, this);
                }));
            },
        }); // return
    }  // function
); //define