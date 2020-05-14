var legend_val = 0;
var msg_val = 0;
var edit_val = 0;
var measurement_val = 0;
var view_val = 0;
var assets_val = 0;
var first_appear_top = 60;

var windowStandardZIndex = 100;
var over_top_z_index = windowStandardZIndex+60;
var top_z_index = windowStandardZIndex+50;
var bottom_z_index = 95;
var modal_blocker_z_index = 500;
var modal_z_index = 505;
var modal_top_z_index = 1008;
var staticWindowIDList = [
  "msgTitlePane", "outageAnalysis", "measurementPane", "edit_hover", "symbol_hover", "downline_hover", "manage_case_hover",
  "grid_hover", "cursor_hover", "issue_hover", "analytics_hover", "backup_hover", "power_hover", "import_hover", "importBillingFileDialogDiv",
  "importBayLoadingFileDialogDiv", "addLoadProfileDialogDiv", "addLoadRecDialogDiv", "legend_hover", "attributeEditorContainer",
  "equipment_hover", "overlayInfoWindowContainer", "regModelRecDialogDiv", "condModelRecDialogDiv", "sourceModelRecDialogDiv",
  "transModelRecDialogDiv", "capModelRecDialogDiv", "deleteLoadProfileDialogDiv", "addIntervalLoadProfileDialogDiv",
  "manageIntCaseStudiesDialogDiv", "phaseSwitchDialogDiv", "intPowerFlowDialogDiv", "viewDialog"
];

var dynamicWindowIDList = ["dijit_Dialog_1", "dijit_Dialog_2", "dijit_Dialog_3", "dijit_Dialog_0"];
// ************************************************ Click to open and close modal *******************************

/**************************************** Ristricted  move of dialog **********************************************/
/*var Draggable = function (id) {
    var el = document.getElementById(id),
        isDragReady = false,
        dragoffset = {
            x: 0,
            y: 0
        };
    this.init = function () {
        //only for this demo
        this.initPosition();
        this.events();
    };
    //only for this demo
    this.initPosition = function () {
        el.style.position = "absolute";
        el.style.top = "0";
        el.style.left = "0";
    };
    //events for the element
    this.events = function () {
        var self = this;
        _on(el, 'mousedown', function (e) {
            isDragReady = true;
            //corssbrowser mouse pointer values
            e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
            e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
            dragoffset.x = e.pageX - el.offsetLeft;
            dragoffset.y = e.pageY - el.offsetTop;
        });
        _on(document, 'mouseup', function () {
            isDragReady = false;
        });
        _on(document, 'mousemove', function (e) {
            if (isDragReady) {
                e.pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
                e.pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
                // left/right constraint
                if (e.pageX - dragoffset.x < 0) {
                    offsetX = 0;
                } else if (e.pageX - dragoffset.x + 102 > document.body.clientWidth) {
                    offsetX = document.body.clientWidth - 102;
                } else {
                    offsetX = e.pageX - dragoffset.x;
                }
                 
                // top/bottom constraint   
                if (e.pageY - dragoffset.y < 0) {
                    offsetY = 0;
                } else if (e.pageY - dragoffset.y + 102 > document.body.clientHeight) {
                    offsetY = document.body.clientHeight - 102;
                } else {
                    offsetY = e.pageY - dragoffset.y;
                }   

                el.style.top = offsetY + "px";
                el.style.left = offsetX + "px";
            }
        });
    };
    //cross browser event Helper function
    var _on = function (el, event, fn) {
        document.attachEvent ? el.attachEvent('on' + event, fn) : el.addEventListener(event, fn, !0);
    };
    this.init();
}

new Draggable('legend_hover');*/
// *****************************************************************************************************************

function downAllWindows(level) {
  let index;
  for (index=0;index<staticWindowIDList.length;index++) {
    if (document.getElementById(staticWindowIDList[index]).style.zIndex >= level) {
      document.getElementById(staticWindowIDList[index]).style.zIndex--;
    }
  }

  // dynamically generated windows
  for (index=0;index<dynamicWindowIDList.length;index++) {
    if (document.getElementById(dynamicWindowIDList[index])) {
      if (document.getElementById(dynamicWindowIDList[index]).style.zIndex >= level) {
        document.getElementById(dynamicWindowIDList[index]).style.zIndex--;
      }
    }
  }
}

function legend_modal() {
  if (legend_val == 0) {
    dojo.style(myDialog.domNode, 'visibility', 'hidden');  
      myDialog.show(); 
      dojo.style(myDialog.domNode, 'top', first_appear_top+'px'); 
      dojo.style(myDialog.domNode, 'left', '10px');
      dojo.style(myDialog.domNode, 'position', 'absolute'); 
      dojo.style(myDialog.domNode, 'visibility', 'visible');

      downAllWindows(bottom_z_index);
      dojo.style(myDialog.domNode, 'z-index', top_z_index);
      legend_val = 1;
  }
  else{
    myDialog.hide();
    legend_val = 0;
  }
}

function msg_modal() {
  dojo.byId('msgTitlePanes').innerHTML = '';
  registry.byId('msgTitlePane').set('title', 'Messages');
  if (msg_val == 0) {
    dojo.style(msgDialog.domNode, 'visibility', 'hidden');  
    
    msgDialog.show().then(function () {  
      dojo.style(msgDialog.domNode, 'top', first_appear_top+'px'); 
        dojo.style(msgDialog.domNode, 'left', '68px');
        dojo.style(msgDialog.domNode, 'position', 'absolute'); 
        dojo.style(msgDialog.domNode, 'visibility', 'visible');

        downAllWindows(bottom_z_index);
        dojo.style(msgDialog.domNode, 'z-index', top_z_index);
    }); 
    msg_val = 1;
  }
  else{
    msgDialog.hide();
    msg_val = 0;
  }
}

function editMode_modal() {
  if (edit_val == 0) {
    dojo.style(editModeDialog.domNode, 'visibility', 'hidden');  
    editModeDialog.show().then(function () {  
        dojo.style(editModeDialog.domNode, 'top', first_appear_top+'px');  
        dojo.style(editModeDialog.domNode, 'left', '264px');
        dojo.style(editModeDialog.domNode, 'position', 'absolute'); 
        dojo.style(editModeDialog.domNode, 'visibility', 'visible');  
        
        downAllWindows(bottom_z_index);
        dojo.style(editModeDialog.domNode, 'z-index', top_z_index);
    });
    edit_val = 1;
  }
  else{
    editModeDialog.hide();
    edit_val = 0;
  }
}
 // New Assets dialogbox
function nclose_info(){
    attributeEditorContainer.hide();
    //assets_val = 0;
   
  }
//   function newAsset_modal() {
//   if (edit_val == 0) {
//     dojo.style(attributeEditorContainer.domNode, 'visibility', 'hidden');  
//      attributeEditorContainer.show().then(function () {  
//          dojo.style(attributeEditorContainer.domNode, 'top', '0px');  
//          dojo.style(attributeEditorContainer.domNode, 'left', '264px');
//          dojo.style(attributeEditorContainer.domNode, 'position', 'absolute'); 
//          dojo.style(attributeEditorContainer.domNode, 'visibility', 'visible');  
//          dojo.style(attributeEditorContainer.domNode, 'z-index', '1000');  
//           dojo.style(editModeDialog.domNode, 'z-index', '995'); 
//          dojo.style(myDialog.domNode, 'z-index', '995');  
//          dojo.style(msgDialog.domNode, 'z-index', '995');
//          dojo.style(measurementDialog.domNode, 'z-index', '995'); 
//          dojo.style(viewDialog.domNode, 'z-index', '995');
//          dojo.style(outageAnalysisDialog.domNode, 'z-index', '995');
//          dojo.style(advancedAnalyticsDialog.domNode, 'z-index', '995');  
//          dojo.style(importMembersDialog.domNode, 'z-index', '995'); 
//          dojo.style(powerFlowDialog.domNode, 'z-index', '995');
//          dojo.style(backupDialog.domNode, 'z-index', '995');  
//          dojo.style(equipmentParametersDialog.domNode, 'z-index', '995'); 
//          dojo.style(cursorSettingsDialog.domNode, 'z-index', '995');
//          dojo.style(gridSettingsDialog.domNode, 'z-index', '995');  
//          dojo.style(downlineSelectionSettingsDialog.domNode, 'z-index', '995'); 
//          dojo.style(issueHighlightsSettingsDialog.domNode, 'z-index', '995');
//          dojo.style(updateSymboliseSettingDialog.domNode, 'z-index', '995'); 
//          dojo.style(manageCaseStudiesDialog.domNode, 'z-index', '995'); 
// dojo.style(importBillingFileDialog.domNode, 'z-index', '995'); 
// dojo.style(importBayLoadingFileDialog.domNode, 'z-index', '995'); 
// dojo.style(addLoadProfileDialog.domNode, 'z-index', '995'); 
// dojo.style(addLoadRecDialog.domNode, 'z-index', '995');  
//     });
//     assets_val = 1;
//   }
//   else{
//     attributeEditorContainer.hide();
//     assets_val = 0;
//   }
// }

function measurement_modal() {
  if (measurement_val == 0) {
    dojo.style(measurementDialog.domNode, 'visibility', 'hidden');  
    measurementDialog.show().then(function () {  
        dojo.style(measurementDialog.domNode, 'top', first_appear_top+1+'px');  
        dojo.style(measurementDialog.domNode, 'left', '326px');
        dojo.style(measurementDialog.domNode, 'position', 'absolute'); 
        dojo.style(measurementDialog.domNode, 'visibility', 'visible');

        downAllWindows(bottom_z_index);
        dojo.style(measurementDialog.domNode, 'z-index', top_z_index);
    });
    measurement_val = 1;
  }
  else{
    measurementDialog.hide();
    measurement_val = 0;
  }
}

function view_close(){
	viewDialog.hide();
    view_val = 0;
	}
function view_modal() {
  if (view_val == 0) {
    dojo.style(viewDialog.domNode, 'visibility', 'hidden');  
    viewDialog.show().then(function () {  
      dojo.style(viewDialog.domNode, 'top', first_appear_top+'px');  
      dojo.style(viewDialog.domNode, 'right', '0px !impotant');
      dojo.style(viewDialog.domNode, 'position', 'absolute'); 
      dojo.style(viewDialog.domNode, 'visibility', 'visible');  

      downAllWindows(bottom_z_index);
      dojo.style(viewDialog.domNode, 'z-index', top_z_index);
    });
    view_val = 1;
  }
  else{
    viewDialog.hide();
    view_val = 0;
  }
}

function outageAnalysis_modal() {
  dojo.style(outageAnalysisDialog.domNode, 'visibility', 'hidden');  
  outageAnalysisDialog.show().then(function () {  
    dojo.style(outageAnalysisDialog.domNode, 'top', first_appear_top+'px');  
    dojo.style(outageAnalysisDialog.domNode, 'left', '133px');
    dojo.style(outageAnalysisDialog.domNode, 'position', 'absolute'); 
    dojo.style(outageAnalysisDialog.domNode, 'visibility', 'visible'); 

    downAllWindows(bottom_z_index);
    dojo.style(outageAnalysisDialog.domNode, 'z-index', top_z_index); 
  });
}

function advancedAnalytics_modal() {
  dojo.style(advancedAnalyticsDialog.domNode, 'visibility', 'hidden');  
  advancedAnalyticsDialog.show().then(function () {
    dojo.style(advancedAnalyticsDialog.domNode, 'top', first_appear_top+'px');
    dojo.style(advancedAnalyticsDialog.domNode, 'left', '133px');
    dojo.style(advancedAnalyticsDialog.domNode, 'position', 'absolute');
    dojo.style(advancedAnalyticsDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(advancedAnalyticsDialog.domNode, 'z-index', top_z_index);
  });
}

function importMembers_modal() {
  dojo.style(importMembersDialog.domNode, 'visibility', 'hidden');  
  importMembersDialog.show().then(function () {  
    dojo.style(importMembersDialog.domNode, 'top', first_appear_top+'px');
    dojo.style(importMembersDialog.domNode, 'left', '133px');
    dojo.style(importMembersDialog.domNode, 'position', 'absolute');
    dojo.style(importMembersDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(importMembersDialog.domNode, 'z-index', top_z_index);
  });
}

function intPowerFlow_modal() {
  dojo.style(intPowerFlowDialog.domNode, 'visibility', 'hidden');  
  intPowerFlowDialog.show().then(function () {  
    dojo.style(intPowerFlowDialog.domNode, 'top', first_appear_top+'px');
    dojo.style(intPowerFlowDialog.domNode, 'left', '133px');
    dojo.style(intPowerFlowDialog.domNode, 'position', 'absolute');
    dojo.style(intPowerFlowDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(intPowerFlowDialog.domNode, 'z-index', top_z_index);
  });
}


function powerFlow_modal() {
  dojo.style(powerFlowDialog.domNode, 'visibility', 'hidden');  
  powerFlowDialog.show().then(function () {  
    dojo.style(powerFlowDialog.domNode, 'top', first_appear_top+'px');
    dojo.style(powerFlowDialog.domNode, 'left', '133px');
    dojo.style(powerFlowDialog.domNode, 'position', 'absolute');
    dojo.style(powerFlowDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(powerFlowDialog.domNode, 'z-index', top_z_index);
  });
}

function backup_modal() {
  dojo.style(backupDialog.domNode, 'visibility', 'hidden');  
  backupDialog.show().then(function () {  
    dojo.style(backupDialog.domNode, 'top', first_appear_top+'px');
    dojo.style(backupDialog.domNode, 'left', '133px');
    dojo.style(backupDialog.domNode, 'position', 'absolute');
    dojo.style(backupDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(backupDialog.domNode, 'z-index', top_z_index);
  });
}

function equipmentParameters_modal() {
  dojo.style(equipmentParametersDialog.domNode, 'visibility', 'hidden');  
  equipmentParametersDialog.show().then(function () {
    dojo.style(equipmentParametersDialog.domNode, 'top', first_appear_top+'px');
    dojo.style(equipmentParametersDialog.domNode, 'left', '196px');
    dojo.style(equipmentParametersDialog.domNode, 'position', 'absolute');
    dojo.style(equipmentParametersDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(equipmentParametersDialog.domNode, 'z-index', top_z_index);
  });
}

function cursorSettings_modal() {
  dojo.style(cursorSettingsDialog.domNode, 'visibility', 'hidden');  
  cursorSettingsDialog.show().then(function () {
    dojo.style(cursorSettingsDialog.domNode, 'top', first_appear_top+'px');
    dojo.style(cursorSettingsDialog.domNode, 'left', '196px');
    dojo.style(cursorSettingsDialog.domNode, 'position', 'absolute');
    dojo.style(cursorSettingsDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(cursorSettingsDialog.domNode, 'z-index', top_z_index);
  });
}

function gridSettings_modal() {
  dojo.style(gridSettingsDialog.domNode, 'visibility', 'hidden');  
  gridSettingsDialog.show().then(function () {  
    dojo.style(gridSettingsDialog.domNode, 'top', first_appear_top+40+'px');  
    dojo.style(gridSettingsDialog.domNode, 'left', '236px');
    dojo.style(gridSettingsDialog.domNode, 'position', 'absolute'); 
    dojo.style(gridSettingsDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(gridSettingsDialog.domNode, 'z-index', top_z_index);  
  });
}
 
function downlineSelectionSettings_modal() {
  dojo.style(downlineSelectionSettingsDialog.domNode, 'visibility', 'hidden');  
  downlineSelectionSettingsDialog.show().then(function () {
    dojo.style(downlineSelectionSettingsDialog.domNode, 'top', first_appear_top+80+'px');
    dojo.style(downlineSelectionSettingsDialog.domNode, 'left', '276px');
    dojo.style(downlineSelectionSettingsDialog.domNode, 'position', 'absolute');
    dojo.style(downlineSelectionSettingsDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(downlineSelectionSettingsDialog.domNode, 'z-index', top_z_index);
  });
}

function issueHighlightsSettings_modal() {
  dojo.style(issueHighlightsSettingsDialog.domNode, 'visibility', 'hidden');  
  issueHighlightsSettingsDialog.show().then(function () {  
    dojo.style(issueHighlightsSettingsDialog.domNode, 'top', first_appear_top+120+'px');
    dojo.style(issueHighlightsSettingsDialog.domNode, 'left', '316px');
    dojo.style(issueHighlightsSettingsDialog.domNode, 'position', 'absolute');
    dojo.style(issueHighlightsSettingsDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(issueHighlightsSettingsDialog.domNode, 'z-index', top_z_index);
  });
}

function updateSymboliseSetting_modal() {
  dojo.style(updateSymboliseSettingDialog.domNode, 'visibility', 'hidden');  
  updateSymboliseSettingDialog.show().then(function () {  
    dojo.style(updateSymboliseSettingDialog.domNode, 'top', first_appear_top+'px');
    dojo.style(updateSymboliseSettingDialog.domNode, 'left', '196px');
    dojo.style(updateSymboliseSettingDialog.domNode, 'position', 'absolute');
    dojo.style(updateSymboliseSettingDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(updateSymboliseSettingDialog.domNode, 'z-index', top_z_index);
  });
}

function manageCaseStudies_modal() {
  dojo.style(manageCaseStudiesDialog.domNode, 'visibility', 'hidden');  
  manageCaseStudiesDialog.show().then(function () {  
    dojo.style(manageCaseStudiesDialog.domNode, 'top', first_appear_top+'px');
    // dojo.style(manageCaseStudiesDialog.domNode, 'right', '10px');
    // dojo.style(manageCaseStudiesDialog.domNode, 'left', '');
    dojo.style(manageCaseStudiesDialog.domNode, 'position', 'absolute');
    dojo.style(manageCaseStudiesDialog.domNode, 'visibility', 'visible');

    downAllWindows(bottom_z_index);
    dojo.style(manageCaseStudiesDialog.domNode, 'z-index', top_z_index);
  });
}


// **************************************************************************************************************************************
// **************************************************** navebar script ******************************************************************

function myFunction() {
  
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav-map") {
    x.className += " responsive";
  } else {
    x.className = "topnav-map";
  }
}

function myFunctionnew2() {
  document.getElementById("myDropdown-new2").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn-new2')) {
    var dropdowns = document.getElementsByClassName("dropdown-content-new2");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
//***************************************************************************************************************************************
function close_info(){
	overlayInfoWindowContainer.hide();
}

// ***************************************** Click to hover Modal ***********************************************************************
function outage_hover(){
  downAllWindows(document.getElementById("outageAnalysis").style.zIndex);
  document.getElementById("outageAnalysis").style.zIndex = top_z_index;
}

function msg_hover(){
  downAllWindows(document.getElementById("msgTitlePane").style.zIndex);
  document.getElementById("msgTitlePane").style.zIndex = top_z_index;
}

function measurement_hover(){
  downAllWindows(document.getElementById("measurementPane").style.zIndex);
  document.getElementById("measurementPane").style.zIndex = top_z_index;
}

function view_hover(){
  downAllWindows(document.getElementById("viewDialog").style.zIndex);
  document.getElementById("viewDialog").style.zIndex = top_z_index;
}

function edit_hover(){
  downAllWindows(document.getElementById("edit_hover").style.zIndex);
  document.getElementById("edit_hover").style.zIndex = top_z_index;
}
// change
// function assets_hover(){
//   // console.log('test');
//   document.getElementById("attributeEditorContainer").style.zIndex = 1000;
//    document.getElementById("edit_hover").style.zIndex = 995;
//   document.getElementById("msgTitlePane").style.zIndex = 995;
//   document.getElementById("outageAnalysis").style.zIndex = 995;
//   document.getElementById("measurementPane").style.zIndex = 995;
//   document.getElementById("symbol_hover").style.zIndex = 995;
//   document.getElementById("downline_hover").style.zIndex = 995;
//   document.getElementById("manage_case_hover").style.zIndex = 995;
//   document.getElementById("grid_hover").style.zIndex = 995;
//   document.getElementById("cursor_hover").style.zIndex = 995;
//   document.getElementById("equipment_hover").style.zIndex = 995;
//   document.getElementById("issue_hover").style.zIndex = 995;
//   document.getElementById("analytics_hover").style.zIndex = 995;
//   document.getElementById("backup_hover").style.zIndex = 995;
//   document.getElementById("power_hover").style.zIndex = 995;
//     document.getElementById("import_hover").style.zIndex = 995;
//   document.getElementById("importBillingFileDialogDiv").style.zIndex = 995;
//   document.getElementById("importBayLoadingFileDialogDiv").style.zIndex = 995;
//   document.getElementById("addLoadProfileDialogDiv").style.zIndex = 995;
//   document.getElementById("addLoadRecDialogDiv").style.zIndex = 995;
//   document.getElementById("legend_hover").style.zIndex = 995;
//   document.getElementById("attributeEditorContainer").style.zIndex = 995;
// }

function symbol_hover(){
  downAllWindows(document.getElementById("symbol_hover").style.zIndex);
  document.getElementById("symbol_hover").style.zIndex = top_z_index;
}

function downline_hover(){
  downAllWindows(document.getElementById("downline_hover").style.zIndex);
  document.getElementById("downline_hover").style.zIndex = top_z_index;
}

function grid_hover(){
  downAllWindows(document.getElementById("grid_hover").style.zIndex);
  document.getElementById("grid_hover").style.zIndex = top_z_index;
}
function cursor_hover(){
  downAllWindows(document.getElementById("cursor_hover").style.zIndex);
  document.getElementById("cursor_hover").style.zIndex = top_z_index;
}

function equipment_hover(){
  downAllWindows(document.getElementById("equipment_hover").style.zIndex);
  document.getElementById("equipment_hover").style.zIndex = top_z_index;
}
function dijit_Dialog1(){
  downAllWindows(document.getElementById("intPowerFlowDialogDiv").style.zIndex);
  document.getElementById("intPowerFlowDialogDiv").style.zIndex = top_z_index;
}
function phaseSwitchDialogDiv1(){
  downAllWindows(document.getElementById("phaseSwitchDialogDiv").style.zIndex);
  document.getElementById("phaseSwitchDialogDiv").style.zIndex = top_z_index;
}
function regModelRecDialogDiv(){
  downAllWindows(document.getElementById("regModelRecDialogDiv").style.zIndex);
  document.getElementById("regModelRecDialogDiv").style.zIndex = top_z_index;
}
function condModelRecDialogDiv(){
  downAllWindows(document.getElementById("condModelRecDialogDiv").style.zIndex);
  document.getElementById("condModelRecDialogDiv").style.zIndex = top_z_index;
}
function sourceModelRecDialogDiv(){
  downAllWindows(document.getElementById("sourceModelRecDialogDiv").style.zIndex);
  document.getElementById("sourceModelRecDialogDiv").style.zIndex = top_z_index;
}
function transModelRecDialogDiv(){
  downAllWindows(document.getElementById("transModelRecDialogDiv").style.zIndex);
  document.getElementById("transModelRecDialogDiv").style.zIndex = top_z_index;
}
function capModelRecDialogDiv(){
  downAllWindows(document.getElementById("capModelRecDialogDiv").style.zIndex);
  document.getElementById("capModelRecDialogDiv").style.zIndex = top_z_index;
}

function close_info1(){
  const infoWindowHandler = document.getElementById("overlayInfoWindowContainer");
  downAllWindows(infoWindowHandler.style.zIndex);
  infoWindowHandler.style.zIndex = top_z_index;
  if (parseInt(infoWindowHandler.style.top) < 0) {
    infoWindowHandler.style.top = "60px";
  }
}

function issue_hover(){
  downAllWindows(document.getElementById("issue_hover").style.zIndex);
  document.getElementById("issue_hover").style.zIndex = top_z_index;
}

function analytics_hover(){
  downAllWindows(document.getElementById("analytics_hover").style.zIndex);
  document.getElementById("analytics_hover").style.zIndex = top_z_index;
}

function backup_hover(){
  downAllWindows(document.getElementById("backup_hover").style.zIndex);
  document.getElementById("backup_hover").style.zIndex = top_z_index;
}

function power_hover(){
  downAllWindows(document.getElementById("power_hover").style.zIndex);
  document.getElementById("power_hover").style.zIndex = top_z_index;
}

function import_hover(){
  downAllWindows(document.getElementById("import_hover").style.zIndex);
  document.getElementById("import_hover").style.zIndex = top_z_index;
}

function legend_hover(){
  downAllWindows(document.getElementById("legend_hover").style.zIndex);
  document.getElementById("legend_hover").style.zIndex = top_z_index;
}

function import_billing(){
  downAllWindows(document.getElementById("importBillingFileDialogDiv").style.zIndex);
  document.getElementById("importBillingFileDialogDiv").style.zIndex = top_z_index;
}

function importBay(){
  downAllWindows(document.getElementById("importBayLoadingFileDialogDiv").style.zIndex);
  document.getElementById("importBayLoadingFileDialogDiv").style.zIndex = top_z_index;
}

function addload_profile(){
  downAllWindows(document.getElementById("addLoadProfileDialogDiv").style.zIndex);
  document.getElementById("addLoadProfileDialogDiv").style.zIndex = top_z_index;
}

function deleteload_profile(){
  downAllWindows(document.getElementById("deleteLoadProfileDialogDiv").style.zIndex);
  document.getElementById("deleteLoadProfileDialogDiv").style.zIndex = top_z_index;
}

function addLoadRec(){
  downAllWindows(document.getElementById("addLoadRecDialogDiv").style.zIndex);
  document.getElementById("addLoadRecDialogDiv").style.zIndex = top_z_index;
}

function intervalload_profile() {
  downAllWindows(document.getElementById("addIntervalLoadProfileDialogDiv").style.zIndex);
  document.getElementById("addIntervalLoadProfileDialogDiv").style.zIndex = top_z_index;
}

function manageintercase_studies() {
  downAllWindows(document.getElementById("manageIntCaseStudiesDialogDiv").style.zIndex);
  document.getElementById("manageIntCaseStudiesDialogDiv").style.zIndex = top_z_index;
}

function attribute_hover(){
  downAllWindows(document.getElementById("attributeEditorContainer").style.zIndex);
  document.getElementById("attributeEditorContainer").style.zIndex = top_z_index;
}
function manage_case_hover(){
  downAllWindows(document.getElementById("manage_case_hover").style.zIndex);
  document.getElementById("manage_case_hover").style.zIndex = top_z_index;
}
function dijit_Dialog_0_hover(){
  downAllWindows(document.getElementById("dijit_Dialog_0").style.zIndex);
  document.getElementById("dijit_Dialog_0").style.zIndex = top_z_index;
}
function dijit_Dialog_1_hover(){
  downAllWindows(document.getElementById("dijit_Dialog_1").style.zIndex);
  document.getElementById("dijit_Dialog_1").style.zIndex = top_z_index;
}
function dijit_Dialog_2_hover(){
  downAllWindows(document.getElementById("dijit_Dialog_2").style.zIndex);
  document.getElementById("dijit_Dialog_2").style.zIndex = top_z_index;
}
function dijit_Dialog_3_hover(){
  downAllWindows(document.getElementById("dijit_Dialog_3").style.zIndex);
  document.getElementById("dijit_Dialog_3").style.zIndex = top_z_index;
}

$(document).ready(function(){
  $('body').on("click", "#dijit_Dialog_1", function(){
    dijit_Dialog_1_hover();
  });
  $('body').on("click", "#dijit_Dialog_2", function(){
    dijit_Dialog_2_hover();
  });
  $('body').on("click", "#dijit_Dialog_3", function(){
    dijit_Dialog_3_hover();
  });
  setTimeout(function(){
    $('#overlayInfoWindow a').on("mousedown", function(e){
      e.stopPropagation();
    });
  }, 3000);


});

//***************************************************************************************************************************************