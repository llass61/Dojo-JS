
define([
   "dijit/registry",
   "dojo/_base/declare",
   "dojo/store/Memory",
   "dojo/store/Observable",
   "dojo/_base/array",
   "dojo/dom-construct"

], function (registry, declare, Memory, Observable, arrayUtils, domConstruct) {

   return declare(null, {

      constructor: function (name="EneriStore", controls=[], idProp='id',
                             labelAttr=null, searchAttr=null, sortAttr=null,
                             data=[], multiSelect=true) {
         this.name = name;
         this.controls = controls;
         this.idProp = idProp;
         this.labelAttr = (labelAttr) ? labelAttr : idProp;
         this.searchAttr = (searchAttr) ? searchAttr : idProp;
         this.sortAttr = (sortAttr) ? sortAttr : idProp;
         this.data = data;
         this.multiSelect = multiSelect;

         this.store = new Observable(new Memory({ idProperty: idProp, data: [] }));

         // connect controls to store
         if (controls.length > 0) {
            this.connectControlToStore();
         }

         // setup observable result set for receiving
         // notifications if data/rows added/removed
         this.results = this.store.query();

         this.results.observe( (object, removedFrom, insertedInto) => {
            console.log(`rem = ${removedFrom}; ins = ${insertedInto}`);
            this.sortData();
         });

         // have to check if data is from table or feature class
         // which return data in different structures.
         if (this.data.length > 0)
            this.setData(this.data);
      },

      sortData: function() {
         if (this.data.length > 0 && this.sortAttr) {
             this.data.sort( (a,b) => {
               if ( a[this.sortAttr] > b[this.sortAttr]) return 1;
               if ( a[this.sortAttr] < b[this.sortAttr]) return -1;
               return 0;
            });
         }
         this.setFirstIndex();
      },

      // this method will handle data returned back from both
      // tables and features.  The structure is different depending
      // on data returned.
      setData: function (data) {

         // assume data is from table and is correct structure (array)
         var modData = data;

         // check if data exists and if from feature
         if (data) {

            // data is from a feature.  Data is wrapped in the
            // 'features' attribute
            if (data.features) {
               modData = data.features.map(function (f) {
                  return f.attributes;
               });
            }
            this.data = modData;
            this.sortData();
            this.store.setData(this.data);
            this.connectControlToStore();
            this.setFirstIndex();
         }
         else {
            console.warn(`Empty data set for ${this.name}`);
         }
      },

      connectControlToStore: function () {
         for(let i=0; i<this.controls.length; i++) {

            // set attribs and store to control
            var list = registry.byId(this.controls[i]);
            if (typeof list !== 'undefined') {
               list.searchAttr = this.searchAttr;
               list.labelAttr = this.labelAttr;
               list.set('store', this.store);

               // if multiSelect, have to add options
               // manually - setData does not work
               if (this.multiSelect) {
                  this.setMultiSelectOptions(list);
               }

            } else {
               console.error('Control not found', this.controls[i]);
            }
         }

      },

      setFirstIndex(ctlId=null) {
         var controls = [];
         if (ctlId != null) {
            controls = [ctlId];
         }
         else {
            controls = this.controls;
         }

         for(let i=0; i<controls.length; i++) {
            // set attribs and store to control
            var list = registry.byId(controls[i]);

            if (typeof list !== 'undefined') {

               if (this.store.data.length > 0) {

                  // MultiSelect wijits require an array when
                  // setting value (because there can be more than one),
                  // Combobox, FilterSelect is a single value - not array
                  if (!this.multiSelect) {
                     list.set('value', this.store.data[0][this.labelAttr]);
                  }
                  else {
                     list.set('value', [this.store.data[0][this.labelAttr]]);
                  }
               }
            }
            else {
               console.error('Control not found', controls[i]);
            }
         }
      },

      getControls: function () {
         return this.controls;
      },

      addControl: function (ctlId) {
         if (ctlId) {
            this.controls.push(ctlId);
            this.connectControlToStore(); //reset all
         }
         else {
            console.error("control is null");
         }

         this.setFirstIndex(ctlId)
      },

      getStore: function () {
         return this.store;
      },

      // The control should already have it's store value set,
      // so we can use either this.store or control.store
      setMultiSelectOptions: (ctlId) => { // need arrayUtils here

         // remove all Option nodes
         arrayUtils.forEach(ctlId.domNode.childNodes, domConstruct.destroy);

         // need to create a new Option for each data element
         arrayUtils.forEach(ctlId.store.query({}, {sort: [{attribute: ctlId.labelAttr, descending: false}]}), function (e) {
         // ctlId.store.query({}).forEach( elem => {
         // this.data.forEach( elem => {
            var opt = document.createElement('option');
            opt.value = e[ctlId.labelAttr];
            opt.innerHTML = e[ctlId.labelAttr];
            ctlId.domNode.appendChild(opt);
         });

         // select first element
         // if (ctlId.store.data[0] && ctlId.store.data.length > 0)
         //    ctlId.set('value', [ctlId.store.data[0][ctlId.labelAttr]]);

     }

   });

});
