var layers = ['Loads', 'Equipment', 'Power Lines', 'Poles'];
var gs = {
    cVersion: "1.0.0.2017.04.10-1",
	user: remoteConf.user,
	server: remoteConf.dbServer,
	dbServer: remoteConf.dbServer,
	gisServer: remoteConf.gisServer,
	sdeInstance: remoteConf.sdeInstance,
	sdePfx: remoteConf.sdePfx,
	dbInstance: remoteConf.dbInstance,
	mapInstance: remoteConf.mapInstance,
    gridInstance: remoteConf.gridInstance,
    insetance: remoteConf,
    //imgRoot: window.location.origin+'/adda/img/',
    //iconRoot: window.location.origin+'/adda/img/icons/',
    imgRoot: remoteConf.staticRoot+'img/',
    iconRoot: remoteConf.staticRoot+'/img/icons/',
    //serverFullName: (serverFullName || serverFullName == "") ? serverFullName : server,
    layers: layers,
    netLayers: ['Loads', 'Equipment', 'Power Lines'],
    model: {
        eqdb: null,
        otype2DbIndex: {},
        eqFldMap: {
            motor: {
                id: 'motorModelId',
                dialog: 'motorModelRecDialog',
                emap: ['motorModelId', 'equipref'],
                fmap: [['motorModelId', 'equipref'], ['motorModelHp', 'hp'], ['motorModelLrKvaHp', 'lr_kva_hp'], ['motorModelNemaCode', 'nema_code'],
                    ['motorModelLrPf', 'lr_pf'], ['motorModelSrRatio', 'sr_ratio'], ['motorModelSrR', 'sr_r'], ['motorModelSrX', 'sr_x'],]
            },
            source: {
                id: 'sourceModelName',
                dialog: 'sourceModelRecDialog',
                emap: ['sourceModelName', 'equipref'],
                fmap: [['sourceModelName', 'equipref'], ['sourceModelKv', 'vsource'], ['sourceModelRatio', 'ratio'], ['sourceModelR0', 'zero_r'],
                    ['sourceModelX0', 'zero_x'], ['sourceModelR1', 'pos_r'], ['sourceModelX1', 'pos_x'], ['sourceModelRating', 'rating'],]
            },
            capacitor: {
                id: 'capModelName',
                dialog: 'capModelRecDialog',
                emap: ['capModelName', 'equipref'],
                fmap: [['capModelName', 'equipref'], ['capModelKvarA', 'kvar_a'],
                    ['capModelKvarB', 'kvar_b'], ['capModelKvarC', 'kvar_c'], ['capModelRating', 'rating'], ['capModelNomV', 'nom_v'], ['capModelMaxQ', 'max_q'],
                    ['capModelMaxC', 'max_x']]
            },
            prot: {
                id: 'protModelName',
                dialog: 'protModelRecDialog',
                emap: ['protModelName', 'equipref'],
                fmap: [['protModelName', 'equipref'], ['protModelType', 'otype'],
                    ['protModelRating', 'rating'], ['protModelNomV', 'nom_v'], ['protModelClass', 'cls'], ['protModelMaxP', 'max_p'], ['protModelMaxC', 'max_c'], ['protModelIntC', 'int_c']]
            },
            transformer: {
                id: 'transModelName',
                dialog: 'transModelRecDialog',
                emap: ['transModelName', 'equipref'],
                fmap: [['transModelName', 'equipref'],
                    ['transModelconnection', 'connection'], ['transModelpi_a', 'pi_a'], ['transModelpi_b', 'pi_b'], ['transModelpi_c', 'pi_c'],
                    ['transModelxr_a', 'xr_a'], ['transModelxr_b', 'xr_b'], ['transModelxr_c', 'xr_c'],
                    ['transModelkva_a', 'kva_a'], ['transModelkva_b', 'kva_b'], ['transModelkva_c', 'kva_c'],
                    ['transModelr_gp', 'r_gp'], ['transModelx_gp', 'x_gp'],
                    ['transModelr_gs', 'r_gs'], ['transModelx_gs', 'x_gs'],
                    ['transModelr_g', 'r_g'], ['transModelx_g', 'x_g'], ['transModelk_fac', 'k_fac'],
                    ['transModelnll_a', 'nll_a'], ['transModelnll_b', 'nll_b'], ['transModelnll_c', 'nll_c'],
                    ['transModelcat', 'cat'],
                    ['transModelmin_tap', 'min_tap'], ['transModelmax_tap', 'max_tap'], ['transModelbase_tap', 'base_tap'], ['transModeltap_bus', 'tap_bus'],
                    ['transModelampacity', 'ampacity']]
            },
            regulator: {
                id: 'regModelName',
                dialog: 'regModelRecDialog',
                emap: ['regModelName', 'equipref'],
                fmap: [['regModelName', 'equipref'],
                    ['regModelampacity', 'ampacity'],
                    ['regModelboost', 'boost'], ['regModelbuck', 'buck'], ['regModelstep_size', 'step_size'],
                    ['regModelbandwidth', 'bandwidth'], ['regModelrating', 'rating'], ['regModelout_volts', 'out_volts'], ['regModelloss', 'loss'],
                    ['regModelcategory', 'category']]
            },
            generator: {
                id: 'genModelName',
                dialog: 'genModelRecDialog',
                emap: ['genModelName', 'equipref'],
                fmap: [['genModelName', 'equipref'],
                    ['genModelKwMax', 'p_max'], ['genModelKwMin', 'p_min'],
                    ['genModelKvarMax', 'q_max'], ['genModelKvarMin', 'q_min'],
                    ['genModelVMax', 'v_max'], ['genModelVMin', 'v_min'],
                    ['genModelR', 'r'], ['genModelSyncX', 'sync_x'], ['genModelX0', 'x0'], ['genModelX2', 'x2'], ['genModelTrX', 'tr_x'],
                    ['genModelStrX', 'str_x']]
            },
            oh: {
                id: 'condModelName',
                dialog: 'condModelRecDialog',
                emap: ['condModelName', 'conductor'],
                fmap: [['condModelName', 'id'],
                    ['condModelMaterial', 'material'], ['condModelRating', 'rating'],
                    ['condModelRdc25', 'rdc25'], ['condModelRdc50', 'rdc50'],
                    ['condModelGmr', 'gmr'], ['condModelDiam', 'diam'],
                    ['condModelCategory', 'category'], ['condModelPrefNeut', 'pref_neut']]
            },
            ug: {
                id: 'ugModelName',
                dialog: 'ugModelRecDialog',
                emap: ['ugModelName', 'conductor'],
                fmap: [['ugModelName', 'id'],
                    ['ugModelType', 'ug_type'], ['ugModelRating', 'rating'],
                    ['ugModelPhaseCondR', 'phase_cond_r'], ['ugModelGmr', 'gmr'], ['ugModelCcnR', 'ccn_r'],
                    ['ugModelNstrandN', 'n_strand_n'], ['ugModelOdInsul', 'od_insul'], ['ugModelOdIncN', 'od_inc_n'], ['ugModelDconst', 'd_const'], 
                    ['ugModelDun', 'd_un'], ['ugModelGmrN', 'gmr_n'], ['ugModelDcond', 'd_cond'], ['ugModelDistCn', 'dist_cn'], ['ugModelCategory', 'cat']]
            },
            construction: {
                id: 'consModelName',
                dialog: 'consModelRecDialog',
                emap: ['consModelName', 'construction'],
                fmap: [['consModelName', 'id'],
                ['consModel_oh_1_gmdp', 'oh_1_gmdp'], ['consModel_oh_v_gmdp', 'oh_v_gmdp'], ['consModel_oh_3_gmdp', 'oh_3_gmdp'], 
                ['consModel_oh_1_gmdpn', 'oh_1_gmdpn'], ['consModel_oh_v_gmdpn', 'oh_v_gmdpn'], ['consModel_oh_3_gmdpn', 'oh_3_gmdpn'], 
                ['consModel_ug_gmcp', 'ug_gmcp'], ['consModel_height_ground', 'height_ground'], ['consModel_height_unit', 'height_unit'], ['consModel_dist_od', 'dist_od'], 
                ['consModel_dist_unit', 'dist_unit'], ['consModel_spacing', 'spacing'], ['consModel_v_rating', 'v_rating'], ['consModel_assume_full_transportation', 'assume_full_transportation'], 
                ['consModel_pos_1_ph', 'pos_1_ph'], ['consModel_pos_first_ph', 'pos_first_ph'], ['consModel_pos_second_ph', 'pos_second_ph'], ['consModel_vert_h_pos_a', 'vert_h_pos_a'], 
                ['consModel_vert_h_pos_b', 'vert_h_pos_b'], ['consModel_vert_h_pos_c', 'vert_h_pos_c'], ['consModel_vert_h_pos_n', 'vert_h_pos_n'], ['consModel_hor_d_pos_a', 'hor_d_pos_a'], 
                ['consModel_hor_d_pos_b', 'hor_d_pos_b'], ['consModel_hor_d_pos_c', 'hor_d_pos_c'], ['consModel_hor_d_pos_n', 'hor_d_pos_n'], ['consModel_cat', 'cat']]
            },
            //still need ug, oh and construction
        },
    },
    conf: {
        maplocPrecision: 15,
        maplocNormalized: true,
        weather: {showWeather: false, showRadar: false, showPercip: true},
        defaultSpatialRef: null,
        grid_wkid: 2277,
        saveEnv: true,
        loadEnv: false,
        engine: "rod",
        pfResField: "pf",
        pfResLayer: 'res_pf',
        eqPfx: '_ext',
        gmapTiltDisabled: 'true',
        proxy: {},
        faultCalcSettings: {'def_r': 0, 'oh_r': 0, 'ug_r': 0, 'def_x': 0, 'oh_x': 0, 'ug_x': 0},
        adjustForLossesSettings: {'objective': 'P', 'method': 'T', 'tol': 1E-6, 'max_iter': 1000, 'init': 1.0},
        capOptSettings: {
            'max_bank_size': 70.0,
            'min_bank_size': 0.0,
            'min_dist': 3500.0,
            'corrective_factor': 0.7,
            'add_single_ph': 0,
            'indep_switching': 0
        },
        motorStartSettings: {},
        basemap: "",
        manualPhaseOverride: true,
        overlayList: ['shortInfoWindowContainer', 'overlayInfoWindowContainer', 'attributeEditorContainer'],
        certMapsLayers: ['coop', 'muni', 'iou'],
        certMapLayerInfos: {
            'coop': {'url': 'https://services1.arcgis.com/r0GBst8Pgyny9qhA/ArcGIS/rest/services/PUC_Service_Boundaries_COOPDIST/FeatureServer/0'},
            'muni': {'url': 'https://services1.arcgis.com/r0GBst8Pgyny9qhA/ArcGIS/rest/services/PUC_Service_Boundaries_Municipal/FeatureServer/0'},
            'iou':  {'url': 'https://services1.arcgis.com/r0GBst8Pgyny9qhA/ArcGIS/rest/services/PUC_Service_Boundaries_IOU/FeatureServer/1'},
        },
        view:{
            extFactor: 2,
            showVdB: true,
            showVdU: true,
            showFc: true,
            showFi: true,
            showP: true,
            showPf: true,
            showCond: true,
            showNeut: true,
            showRt: true,
            showLen: true,
        },
        analysis: {baseV: 120, thV: 120, spAmpTh: 40},
    },
    state: {
        overlayLocations: [],
        lastExtent: null,
        mapLayersLoaded: false, featureLayersLoaded: false, dataLayersLoaded: false,
        loadedLayers: [],
        layersVisibility: [true, true, true, true, true, false, false],
        infoLayerWasVisible: true,
        assetsLayerVis: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        addingNewSourceModel: false,
        cVersion: null,
        oa: {lineSize: 10, markerSize: 10, color: "#BB0000", markerScale: 0.5, markerRatio: 0.5},
        loadScenarios : null, genScenarios : null, caseStudies : null, bayList : null, meteringTimeStamps : null, bayLoadingTimeStamps : null,
        loadScenariosStore : null, genScenariosStore : null, caseStudiesStore : null, bayListStore : null, 
        meteringTimeStampsStore : null, bayLoadingTimeStampsStore : null, reportFieldsStore: null,
        versions : null,
        certMapsLayers: [],
        templatePicker: null, drawToolbar: null,
    },
    layerInfo: null, layerInfo: null,
    version: 'DEFAULT',
};
var protocol = location.protocol;
var slashes = protocol.concat("//");
var host = slashes.concat(window.location.hostname);

gs.conf.proxy = {
    urlPrefix: gs.gisServer, 
    proxyUrl: null, //"/esri/php_1.0/proxy.php"
    //proxyUrl: window.protocol+"//"+gs.gisServer+"/esri/php/proxy.php"
};
var gisServer = gs.gisServer;
var dbServer = gs.dbServer;
var mapSvc = gs.mapInstance;
var gridSvc = gs.gridInstance; // TODO make this nullable
var proxyUrl = gs.conf.proxy.proxyUrl;
var geocoderUrl = window.protocol+"//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

var mapService = window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + gs.mapInstance + "/MapServer",
    gridService = window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + gs.gridInstance + "/MapServer",
    gridLayerIndex = '2',
    featureService = window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + gs.mapInstance + "/FeatureServer",
    printService = window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export Web Map Task";
gs.mapService = mapService;
var map, toc, tocLayerInfos, assetsFeatureLayers = [], bayHighlightingLayer, issueHighlightingLayer, outageLayer,
    dynamicLayer;
var dataFeatureLayers = [], loadModelTable;
var gpRes, gpMes, gpJobInfo, gpMesCount;
//var printTask, printParams;
var gpActive = 0, gpJob, gpJobName = "";
var unseenMessageCount = 0;
var loadinTimeout;
var popupTemplateLine, popupTemplateCustomer, popupTemplateEquipment, popupTemplateOL;
var showInfo = true, showResults = true;
window.siwVisible = true;
var attInspector = null, editable = false, drawing = false, adding = false, lastAdded = null, selectedTemplate,
    editLayerInfos, activeFeatures, dirtyFeatures = {}, lastSelFeat = null, insertedMeterNumber = null,
    insertedSourceEquipref = null, lastMapLoc = null, lastPt = null, lineOp = 0;
var billingFileItemId = null, bayLoadingFileItemId = null;
var sbselection = '.*';
var connectivityCheckSelection = ".*"
var chartDataSet, chart, chartLegend, resStructure;
var tvFeatures = null, vvFeatures = null, tvGFeatures = null, vvGFeatures = null, caseStudyName = null, resMode,
    resNeedUpdate = true;
var tvSymbol, vvSymbol;
var editableFields = ['equipref'], wireTypes;//, wireSelect;
var activeSubBay = [], oldDefExpr = '', gCount = 0, refocusCount = 0, refocusLimit = 20;
var codedDomains = {};
var focusTimer;
var measurement, measurementActive = false;
var lpControls = [], intLpControls, gpControls = [], csControls = [], icsControls = [], blControls = [];
var dataSource, qdataSource, layerSource;
var enableWatchdog = false;
var sys_freq = 60;
maxDistanceAddress = 1; // in mile
var PROTECTION_ELEMENTS = ['sectionalizer', 'fuse', 'recloser', 'breaker'],
    LINE_ELEMENTS = ['ug', 'oh'],
    EQ_BRANCH_ELEMENTS = ['transformer', 'regulator', 'source', 'generator'];
var BRANCH_ELEMENTS = [].concat(LINE_ELEMENTS).concat(EQ_BRANCH_ELEMENTS).concat(PROTECTION_ELEMENTS);
//
window.onerror = function () {
    alert("Something went wrong...\nPlease refresh the page.");
};

gpMesCount = 0;
require([
    // only the modules called in this line are used in the callback
    "dojo/parser", "dojo/dom", "dojo/dom-construct", "dojo/_base/connect", "dojo/keys", "dojo/on", "dojo/dom-attr", "dojo/dom-class", "dojo/has", "dojo/dom-geometry", "dojo/dom-style", "dojo/mouse", "dojo/_base/array", "dojo/_base/lang", "dojo/_base/event", "dijit/registry", "dojo/Deferred", "dojo/promise/all", "dojo/when", "dojo/request", "dojo/json", "dijit/ConfirmDialog", "dojo/_base/fx", "dojo/i18n!esri/nls/jsapi", "esri/layers/VectorTileLayer", "esri/IdentityManager", "dojo/touch",
    // everything below this isn't passed as a callback param
    "esri/urlUtils",
    "esri/config", "esri/graphicsUtils", "dojo/dnd/Moveable", "dojo/dnd/move", "dijit/Dialog", "esri/sniff", "esri/InfoTemplate", "esri/map", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer", "esri/layers/KMLLayer", "esri/layers/LayerDrawingOptions",
    //"esri/layers/TableDataSource","esri/layers/QueryDataSource","esri/layers/LayerDataSource",

    "esri/Color", "esri/SnappingManager", "esri/renderers/SimpleRenderer", "esri/renderers/ClassBreaksRenderer", "esri/symbols/SimpleLineSymbol", "esri/symbols/CartographicLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/TextSymbol", "esri/symbols/PictureMarkerSymbol", "esri/tasks/query", "esri/tasks/Geoprocessor", "esri/tasks/GeometryService", "esri/tasks/ProjectParameters", "esri/tasks/PrintTask", "esri/tasks/locator", "esri/geometry/Extent", "esri/geometry/Geometry", "esri/geometry/webMercatorUtils", "esri/dijit/AttributeInspector", "esri/dijit/Measurement", "esri/dijit/Scalebar", "esri/dijit/LocateButton", "esri/dijit/HomeButton", "esri/dijit/BasemapGallery", "esri/dijit/Popup", "esri/dijit/PopupTemplate", "esri/arcgis/utils", "esri/virtualearth/VETiledLayer",

    "esri/toolbars/edit", "esri/graphic", "esri/geometry/Point", "esri/geometry/Polyline", "esri/geometry/Polygon",
    "esri/styles/basic", "esri/styles/size", "esri/styles/type",
    "esri/dijit/editing/Editor", "esri/dijit/editing/TemplatePicker", "esri/dijit/SymbolStyler", "esri/toolbars/draw", "esri/dijit/analysis/FindNearest",

    "dojox/charting/Chart", "dojox/charting/axis2d/Default", "dojox/charting/plot2d/ClusteredColumns", "dojox/charting/plot2d/Grid", "dojox/charting/widget/SelectableLegend", "dojox/charting/widget/Chart2D", "dojox/charting/action2d/Tooltip", "dojox/charting/action2d/Highlight", "dojox/charting/action2d/Magnify",
    "dojox/charting/themes/Wetland", "dojox/charting/themes/Dollar", "dojox/charting/themes/Claro", "dojox/charting/themes/MiamiNice",
    "dojox/grid/DataGrid", "dojo/data/ItemFileReadStore", "dojox/data/CsvStore", "dojox/uuid/generateRandomUuid",
    "dgrid/Grid", "dgrid/Keyboard", "dgrid/Selection", "dgrid/OnDemandGrid", "dgrid/ColumnSet", "dgrid/extensions/CompoundColumns", "dgrid/extensions/Pagination", "dgrid/extensions/ColumnResizer", "dgrid/editor", "dojo/store/Observable", "dgrid/CellSelection", "dijit/InlineEditBox", "dojox/layout/ContentPane", "dojox/layout/ResizeHandle", "dojox/layout/FloatingPane",
    "dijit/layout/BorderContainer", "dijit/layout/ContentPane", "dijit/TitlePane", "dijit/layout/TabContainer", "dijit/Dialog",
    "dojo/store/Memory", "dijit/tree/ObjectStoreModel", "dijit/Tree", "dojo/data/ObjectStore", "dijit/form/ComboBox", "dijit/form/TextBox", "dijit/form/Select", "dijit/form/FilteringSelect", "dijit/form/Button", "dijit/form/RadioButton", "dijit/form/CheckBox", "dijit/form/MultiSelect", "dijit/form/ValidationTextBox", "dijit/form/NumberTextBox", "dijit/form/DateTextBox", "dijit/form/TimeTextBox", "dijit/form/ToggleButton", "dijit/form/DropDownButton", "dijit/CheckedMenuItem", "dojox/validate",
    "dojo/fx", "dojo/date/locale", "dojo/store/util/QueryResults", "dojo/request/iframe", "dojox/widget/Standby", "dojo/cookie",
    "gswgt/myInfoPane", "gswgt/FloatingPane/ParentConstrainedFloatingPane", "lib/Maploc", "lib/dbBackup", "lib/custSync", "lib/outageAnalysis", "lib/reportGenerator",
    "agsjs/layers/GoogleMapsLayer", "dojo/touch",
    "dojo/ready", "dojo/domReady!"
], function (parser, dom, domConstruct, connect, keys, on, domAttr, domClass, has, domGeom, domStyle, mouse, arrayUtils, lang, event, registry, Deferred, all, when, request, json, ConfirmDialog, fx, jsapiBundle, VectorTileLayer, esriId, touch) {

    // this runs before everything else, kicking all other stuff into motion
    parser.parse();

    // make modules global
    window.domConstruct = domConstruct;
    window.all = all;
    window.when = when;
    window.Promise = Promise;
    window.registry = registry;
    window.domGeom = domGeom;
    window.domStyle = domStyle;
    window.mouse = mouse;
    window.arrayUtils = arrayUtils;
    window.lang = lang;
    // noinspection JSAnnotator
    window.event = event;
    window.has = has;
    window.keys = keys;
    window.request = request;
    window.json = json;
    window.ConfirmDialog = ConfirmDialog;
    window.fx = fx;
    window.jsapiBundle = jsapiBundle;
    if (enableWatchdog) {
        window.loadingTimeout = setTimeout(function () {
            console.log('It took too much for the page to load...');
            location.reload(true);
        }, 10000);
    }
    /*
        esri.request.setRequestPreCallback(function(ioArgs) {
            console.log("pre-callback")

            if(ioArgs.url.includes(mapService)) {
                // check if it's the only argument in the URL and append the right delimiter
                if (ioArgs.url.includes('?')) {
                    ioArgs.url += '&'
                } else {
                    ioArgs.url += '?'
                }

                ioArgs.url += "token=dco66X41I8qZy0-orle3KpJ7EiRMMdXxO5WdvfMMQdQZ5Fy3QLZw7MnYJ-7TA66D"

                console.log("Sending this:")
                console.log(ioArgs)
            }

            return ioArgs
        })*/
    /*
        var imObject = {
            "serverInfos": [
                {
                    "server": hostname,
                    "tokenServiceUrl": hostname + "/arcgis/tokens/",
                    "adminTokenServiceUrl": hostname + "/arcgis/admin/generateToken",
                    "shortLivedTokenValidity": timeout,
                    "currentVersion": 10.22,//update necessary
                    "hasServer": true
                }
            ],
            "oAuthInfos": [],
            "credentials": [
                {
                    "userId": getCookieName('arcgisusername'),
                    "server": hostname,
                    "token": getCookieName('arcgistoken'),
                    "expires": expires,
                    "validity": timeout,
                    "ssl": false,
                    "creationTime": now,
                    "scope": "server",
                    "resources": [
                        hostname + '/arcgis/rest/services'
                    ]
                }
            ]
        };*/

    console.log(esriId)

    // addMsgClearButton(); // this function does nothing, everything is commented out

    // resource (?) structure
    window.resStructure = [
        {label: 'Section', field: 'secname'},
        {label: 'Feeder', field: 'circuit'},
        {label: 'Parent', field: 'parentsec'},
        {label: 'Equipment', field: 'equipref'},
        {label: 'Length (mi)', field: 'len'},
        {label: 'Nominal (kV)', field: 'nom_v'},
        /*{
         label: 'Voltage (kV)', children: [
         { label: 'A', field: 'v_a' },
         { label: 'B', field: 'v_b' },
         { label: 'C', field: 'v_c' }
         ]
         },*/
        {
            label: 'V drop (120V base)', children: [
            {label: 'A', field: 'vd_a'},
            {label: 'B', field: 'vd_b'},
            {label: 'C', field: 'vd_c'}
        ]
        },
        {label: 'Rating', field: 'rating'},
        {
            label: 'Current Loading (%)', children: [
            {label: 'A', field: 'ld_a'},
            {label: 'B', field: 'ld_b'},
            {label: 'C', field: 'ld_c'}
        ]
        },
        {
            label: 'Current (A)', children: [
            {label: 'A', field: 'c_a'},
            {label: 'B', field: 'c_b'},
            {label: 'C', field: 'c_c'}
        ]
        },
        {
            label: 'Loading (kW)', children: [
            {label: 'A', field: 'p_a'},
            {label: 'B', field: 'p_b'},
            {label: 'C', field: 'p_c'}
        ]
        },
        {
            label: 'Power Factor', children: [
            {label: 'A', field: 'pf_a'},
            {label: 'B', field: 'pf_b'},
            {label: 'C', field: 'pf_c'}
        ]
        },
        {
            label: 'Losses (kW)', children: [
            {label: 'A', field: 'l_a'},
            {label: 'B', field: 'l_b'},
            {label: 'C', field: 'l_c'}
        ]
        }
    ];

    // load in environment from cookie/conf
    cookieToVar(["restoreEnv", gs.conf, "loadEnv", json.parse]);
    cookieToVar(["cVersion", gs.state, "cVersion", json.parse]);

    // idk if this logic is doing what the console logs say
    if (gs.conf.loadEnv) {
        console.log('Session restore cookie found and loaded!');
    } else {
        console.log('Session restore cookie not found! Default restore behavior: ', gs.conf.loadEnv);
    }
    registry.byId('restoreSessionCB').set('checked', gs.conf.loadEnv);
    // dojo.byId('restoreSessionCB').style.width = "100%";
     //  dojo.byId('drop_down').style.marginTop = "0px";


     // if(gs.conf.loadEnv == true){
     //    alert("yaha :",gs.conf.loadEnv      //   dojo.byId('drop_down').style.marginTop = "0px !important";
     // } 



    if (gs.state.cVersion === gs.cVersion) {
        console.log("Matching version, cookie is still good. :-)");
        if (gs.conf.loadEnv) {
            var cpec = [
                ["mapExtent", gs.state, "lastExtent", json.parse],
                ["activeCaseStudy", gs.state, "caseStudyName", null],
                ["overlayLocations", gs.state, "overlayLocations", json.parse],
                // ["detailedAssetsLayer", gs.state, "detailedAssetsLayer", json.parse],
                ["gmapTiltDisabled", gs.conf, "gmapTiltDisabled", json.parse],
                ["basemap", gs.conf, "basemap", json.parse],
                ["layersVisibility", gs.state, "layersVisibility", json.parse],
                ["assetsLayersvisibility", gs.state, "assetsLayerVis", json.parse],
            ];
            cpec.forEach(cookieToVar);
            gs.state.lastExtent = new esri.geometry.Extent(gs.state.lastExtent);
            caseStudyName = typeof gs.state.caseStudyName !== 'undefined' ? gs.state.caseStudyName : null;
            // registry.byId('detailedAssetsLayerCB').set('checked', gs.conf.detailedAssetsLayer);
        }
    } else {
        console.log("Modified version detected, will not consume the cookie. :-)");
    }
    // end load environment

    //gs.conf.defaultSpatialRef = new esri.SpatialReference({ wkid: 2277 });
    //gs.conf.defaultSpatialRef = new esri.SpatialReference({ wkid: 4326 });
    gs.conf.defaultSpatialRef = new esri.SpatialReference({wkid: 3857});
    gs.conf.defaultExtent = new esri.geometry.Extent({
        //"xmin": -10906446, "ymin": 3679056, "xmax": -10790797, "ymax": 3728052, "spatialReference": gs.conf.defaultSpatialRef
        // xmin: -97.911550826, ymin: 31.165587624, xmax: -97.081418994, ymax: 31.861658633, "spatialReference": gs.conf.defaultSpatialRef
        xmin: -10919311.41681004,
        ymin: 3612806.5850415034,
        xmax: -10625793.228194851,
        ymax: 3748100.125106317,
        "spatialReference": gs.conf.defaultSpatialRef
    });
    gs.conf.lods = lods;

    if(gs.conf.proxy.proxyUrl) {
        esriConfig.defaults.io.proxyUrl = proxyUrl;
        esri.addProxyRule(gs.conf.proxy);
    }
    esri.config.defaults.io.useCors= true;
    esri.config.defaults.io.corsEnabledServers.push('tmservices1.esri.com');
    esri.config.defaults.io.corsEnabledServers.push('server.arcgisonline.com');
    esri.config.defaults.io.corsEnabledServers.push('gis.srh.noaa.gov');
    esri.config.defaults.io.corsEnabledServers.push(window.location.hostname);
    esri.config.defaults.io.corsEnabledServers.push(gs.gisServer);
    //esri.config.defaults.io.corsEnabledServers.push(gs.gisServer + ":6080");
    esriConfig.defaults.io.alwaysUseProxy = false;
    esri.config.defaults.geometryService = new esri.tasks.GeometryService(window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/Utilities/Geometry/GeometryServer");
    esriConfig.defaults.map.panDuration = 1; // time in milliseconds, default panDuration: 250
    esriConfig.defaults.map.panRate = 1; // default panRate: 25
    esriConfig.defaults.map.zoomDuration = 100; // default zoomDuration: 500
    esriConfig.defaults.map.zoomRate = 1; // default zoomRate: 25

    /*

        var oaInfo = new OAuthInfo({
            appId: "gsvm",
            portalUrl: window.protocol+"//gsdev.epeconsulting.local:6080/arcgis",
            popup: true
        })

        console.log("esriID", esriId)
        var idObject = JSON.parse('{"token":"jxTgz2_PTuE9zYsnu9A4j3tjSktbguUbztla-AuVBuU.","expires":1499977437424}')

        esriId.registerOAuthInfos([oaInfo])

        esriId.getCredential(oaInfo.portalUrl + "/sharing", {
              oAuthPopupConfirmation: false
            }
          ).then(function (){
              console.log("done")
        });
        */

    /*    esri.request({
            url: window.protocol+"//gsdev.epeconsulting.local:6080/arcgis/tokens",
            content: {
                request: "generateToken",
                username: "admin",
                password: "epe12345678",
            },
            handleAs: "text",
            load: function(response) {
                console.log("Success!")
                console.log(response)
            },
            error: function(error) {
                console.log("Failed!", error)
            }
        })*/


    /*var popupOptions = {
     highlight: true, keepHighlightOnHide: true,
     markerSymbol: selMarker,
     };*/
    //esri.config.defaults.map.slider = { right:"10px", top:"10px", width:"20px", height:null };

    map = new esri.Map("mapDiv", {
        extent: ((gs.state.lastExtent) ? gs.state.lastExtent : gs.conf.defaultExtent),
        basemap: "streets",
        infoWindow: new esri.dijit.Popup({}, dojo.create("div")),
        sliderPosition: "top-right",
        logo: false,
        fadeOnZoom: true,
        force3DTransforms: true,
        navigationMode: "css-transforms",
        optimizePanAnimation: true,
        lods: gs.conf.lods,
    });
    gs.map = map;

    window.addEventListener("beforeunload", function () {
        console.log("Before unload...");
        if (gs.conf.saveEnv) {
            saveEnv();
        }
    });

    //window.onunload = window.onbeforeunload = beforeUnload;

    // assign marker styles
    var vOpacity = 1; //0.6, 0.4, 0.3;
    window.tvSymbol = new esri.symbol.CartographicLineSymbol("solid", new esri.Color([255, 255, 0, vOpacity]), 10, "round", "round");
    window.vvSymbol = new esri.symbol.CartographicLineSymbol("solid", new esri.Color([255, 0, 0, vOpacity]), 10, "round", "round");
    var sbColor = new esri.Color([0, 255, 0, vOpacity]);
    window.sbLineSymbol = new esri.symbol.CartographicLineSymbol("solid", sbColor, 10, "round", "round");
    window.sbMarkerSymbol = new esri.symbol.SimpleMarkerSymbol("circle", 10, sbLineSymbol, sbColor);
    window.sbSourceSymbol = new esri.symbol.SimpleMarkerSymbol("circle", 30,
        new esri.symbol.CartographicLineSymbol("solid", new esri.Color([255, 0, 0, vOpacity]), 10, "round", "round"),
        new esri.Color([255, 0, 0, vOpacity]));

    var ldColor = new esri.Color([255, 0, 255, vOpacity]);
    window.ldLine = new esri.symbol.CartographicLineSymbol("solid", ldColor, 10, "round", "round");
    window.ldMarker = new esri.symbol.SimpleMarkerSymbol("circle", 10, ldLine, ldColor);

    window.dangerMarker = {url: "img/symb/elec-red.svg", h: 109, w: 97};
    var scale = gs.state.oa.markerScale, ratio = gs.state.oa.markerRatio;

    var outColor = new esri.Color([0, 0, 0, vOpacity]);
    outColor = new esri.Color([187, 0, 0, vOpacity]);
    window.outLine = new esri.symbol.CartographicLineSymbol("solid", outColor, 10, "round", "round");
    window.outMarker = new esri.symbol.SimpleMarkerSymbol("square", 20, outLine, outColor);
    //outMarker.setPath("M16,4.938c-7.732,0-14,4.701-14,10.5c0,1.981,0.741,3.833,2.016,5.414L2,25.272l5.613-1.44c2.339,1.316,5.237,2.106,8.387,2.106c7.732,0,14-4.701,14-10.5S23.732,4.938,16,4.938zM16.868,21.375h-1.969v-1.889h1.969V21.375zM16.772,18.094h-1.777l-0.176-8.083h2.113L16.772,18.094z");
    //outMarker.setColor(new Color("#00FFFF"));
    //window.outMarker = new esri.symbol.PictureMarkerSymbol("img/symb/warning-sing-pin.png", 25, 30);
    //window.outPathMarker = new esri.symbol.PictureMarkerSymbol("img/symb/warning-sing-pin.png", 30, 40);
    window.outPathMarker = new esri.symbol.PictureMarkerSymbol(dangerMarker.url, Math.round(scale * ratio * dangerMarker.h), Math.round(scale * ratio * dangerMarker.w));
    //outPathMarker.xoffset = 0;
    //outPathMarker.yoffset = 10;
    window.outPathLine = new esri.symbol.CartographicLineSymbol("solid", outColor, 15, "round", "round");
    //window.outProthMarker = new esri.symbol.PictureMarkerSymbol("img/symb/warning-sing-pin.png", 60, 80);
    window.outProthMarker = new esri.symbol.PictureMarkerSymbol(dangerMarker.url, Math.round(scale * dangerMarker.h), Math.round(scale * dangerMarker.w));
    //outProthMarker.xoffset = 0;
    //outProthMarker.yoffset = 30;

    var selColor = new esri.Color([0, 100, 100, 0.6]);
    window.selLine = new esri.symbol.CartographicLineSymbol("solid", selColor, 10, "round", "round");
    window.selMarker = new esri.symbol.SimpleMarkerSymbol("square", 10, new esri.symbol.CartographicLineSymbol("solid", selColor, 4, "round", "round"), selColor); //new esri.symbol.SimpleLineSymbol("solid", selColor, 10), selColor);
    window.g2Symbol = new esri.symbol.CartographicLineSymbol("solid", new esri.Color([0, 0, 0, 0.6]), 1, "round", "round");

    window.editColor = new esri.Color([255, 255, 0, 0.5]);
    window.editLine = new esri.symbol.CartographicLineSymbol("solid", editColor, 10, "round", "round");
    window.editMark = new esri.symbol.SimpleMarkerSymbol("cross", 20, editLine, editColor);
    window.editFill = new esri.symbol.SimpleFillSymbol("none", editLine, null);

    window.flagSymbol = new esri.symbol.PictureMarkerSymbol(gs.imgRoot+"flag.png", 24, 24);
    flagSymbol.xoffset = 8;
    flagSymbol.yoffset = 12;

    window.tornadoSymbol = new esri.symbol.PictureMarkerSymbol(gs.imgRoot+"tornado.png", 25, 30);
    window.hailymbol = new esri.symbol.PictureMarkerSymbol(gs.imgRoot+"hail.png", 25, 30);
    window.windSymbol = new esri.symbol.PictureMarkerSymbol(gs.imgRoot+"wind.png", 25, 30);

    window.snapLineSymbol = new esri.symbol.SimpleLineSymbol("solid", new esri.Color([255, 0, 0, 0.5]), 5);
    window.snapSymbol = new esri.symbol.SimpleMarkerSymbol("cross", 15, snapLineSymbol, null);
    //snapSymbol = tornadoSymbol;
    //selMarker = editMark;
    //selLine = editLine;
    //outMarker = tornadoSymbol;
    map.infoWindow.lineSymbol = selLine;
    map.infoWindow.markerSymbol = selMarker;
    // end assign marker styles

    // initialize stores
    gs.state.loadScenariosStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "name", data: []}));
    gs.state.intLoadScenariosStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "group_name", data: []}));
    gs.state.intLoadScenarioNamesStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "name", data: []}));
    gs.state.genScenariosStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "name", data: []}));
    gs.state.caseStudiesStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "name", data: []}));
    gs.state.intCaseStudiesStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "group_name", data: []}));
    gs.state.bayListStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "name", data: []}));
    gs.state.meteringTimeStampsStore = new dojo.store.Observable(new dojo.store.Memory({
        idProperty: "timestamp",
        data: []
    }));
    gs.state.bayLoadingTimeStampsStore = new dojo.store.Observable(new dojo.store.Memory({
        idProperty: "timestamp",
        data: []
    }));
    gs.state.reportFieldsStore = new dojo.store.Observable(new dojo.store.Memory({idProperty: "name", data: []}));
    // done initializing stores

    window.postLayerInfoLock = new dojo.Deferred(function (reason) {
    });

    // setup geocoder
    window.locator = new esri.tasks.Locator(geocoderUrl);
    locator.outSpatialReference = map.spatialReference;
    locator.countryCode = 'US';

    // connect stores
    console.log('Connecting stores...');
    gpControls = ['aGenScenario'];//, 'newLoadProfileName', 'loadProfileName', 'lpNameImport'];
    lpControls = ['aLoadScenario', 'newLoadProfileName', 'loadProfileName', 'lpNameImport', 'deleteLoadProfileName'];
    intLpControls = ['intLoadProfileGrpName', 'ipfLoadProfileGrpName', 'ddLoadProfile'];
    intLpNamesControls = ['ipfStartTs', 'ipfEndTs', 'ddStartTs', 'ddEndTs'];
    csControls = ['resScenarioSel', 'caseStudyManSel', 'aScenarioName', 'reportCaseStudyName'];
    icsControls = ['intCaseStudyManSel', 'ipfCaseStudyGrpName', 'ddCaseStudyName'];
    blControls = ['aSubsBays', 'ipfSubsBays', 'connectivityCheck', 'feederSelect',
                  'reportCircs', 'switchCircuitToCircuit', 'ddSubsBays'];
    window.mtsControls = ['meteringTs'];
    window.bltsControls = ['bayLoadingTs'];
    window.rfControls = ['availableReportFieldSelect'];
    intLpControls.forEach(function (c) {
        connectControlToStore(c, gs.state.intLoadScenariosStore, 'group_name', 'group_name')
    });
    intLpNamesControls.forEach(function (c) {
        connectControlToStore(c, gs.state.intLoadScenarioNamesStore, 'name', 'name')
    });
    lpControls.forEach(function (c) {
        connectControlToStore(c, gs.state.loadScenariosStore, 'name', 'name')
    });
    gpControls.forEach(function (c) {
        connectControlToStore(c, gs.state.genScenariosStore, 'name', 'name')
    });
    csControls.forEach(function (c) {
        connectControlToStore(c, gs.state.caseStudiesStore, 'name', 'name')
    });
    icsControls.forEach(function (c) {
        connectControlToStore(c, gs.state.intCaseStudiesStore, 'group_name', 'group_name')
    });
    blControls.forEach(function (c) {
        connectControlToStore(c, gs.state.bayListStore, 'name', 'name')
    });
    mtsControls.forEach(function (c) {
        connectControlToStore(c, gs.state.meteringTimeStampsStore, 'timestamp', 'timestamp')
    });
    bltsControls.forEach(function (c) {
        connectControlToStore(c, gs.state.bayLoadingTimeStampsStore, 'timestamp', 'timestamp')
    });
    rfControls.forEach(function (c) {
        connectControlToStore(c, gs.state.reportFieldsStore, 'field', 'name')
    });

    // setup LP import
    var cont = registry.byId("lpNameImport");
    cont.on("dragenter", function (event) {
        // If we don't prevent default behavior here, browsers will
        // perform the default action for the file being dropped i.e,
        // point the page to the file.
        event.preventDefault();
    });
    cont.on("dragover", function (event) {
        event.preventDefault();
    });
    cont.on("drop", handleCSVDrop(importLoadCSV));

    gs.layerInfo = getAssetLayerInfo();
    window.ML = new gs.MapLoc();
    ML.precision = gs.conf.maplocPrecision;
    ML.normalized = gs.conf.maplocNormalized;
    ML.wkid = gs.conf.grid_wkid;
    window.coordinateSystem = ML.getCoordinateSystem(gridService + '/' + gridLayerIndex);
    //when(layerInfo, postLayerInfoReceipt, 2000);
    when(gs.layerInfo, function (res) {
        console.log('layerInfo resolved, moving on to other requests...');
        if (typeof gs.layInds === "undefined") {
            dom.byId('loadingDivError').innerHTML = "Layer info failed to load. Please refresh the page or try again later."
            domStyle.set('loadingDivSpinner', 'display', 'none')
            return
        }

        gs.state.loadScenarios = getLoadProfiles();
        gs.state.intLoadScenarios = getIntLoadProfiles();
        gs.state.intLoadScenarioNames = []; // int load profile grp names
        gs.state.genScenarios = getGenProfiles();
        gs.state.bayList = getBayList();
        gs.state.meteringTimeStamps = getMeteringTimeStamps();
        gs.state.bayLoadingTimeStamps = getBayLoadingTimeStamps();
        gs.state.caseStudies = getCaseStudies();
        gs.state.intCaseStudies = getIntCaseStudies();
        gs.state.reportFields = getReportFieldList();
        getEqModels();
        buildModelLayerMapping();
        tocStarter(null);
        postLayerInfoLock.resolve(0);
        console.log('LayerInds:', gs.layInds);
    });


    map.on('load', function () {
        //dojo.connect(dijit.byId('map'), 'resize', map, map.resize);
        map.addLayers(mapLayers);
        when(gs.layerInfo, function (res) {
            all([postLayerInfoLock, gs.state.loadScenarios, gs.state.bayList, gs.state.caseStudies, coordinateSystem]).then(function (res) {
                console.log('Layer info received, moving on with the rest of initialization...');


                var dnd = new dojo.dnd.move.constrainedMoveable(dojo.byId("resizer"), {constraints: function(e){} }), popupTemplateConsumer;
                dojo.connect(registry.byId('resultsPane'), 'onShow', function (evt) {
                    dojo.byId('resizer').style.visibility = 'visible';
                    setTimeout(function () {
                        if (typeof grid !== 'undefined') {
                            grid.resize();
                        }
                    }, 100);
                });
                dojo.connect(registry.byId('resultsPane'), 'onHide', function (evt) {
                    dojo.byId('resizer').style.visibility = 'hidden';
                });
                dojo.connect(dnd, 'onMoveStop', function (evt) {
                    var dy = dojo.byId('resizer').style.top;
                    var dh = dojo.byId('resizer').style.height;
                    var h = dojo.byId('resultsContentPane').style.height;
                    var dw = parseInt(h.substr(0, h.length - 2)) - parseInt(dy.substr(0, dy.length - 2)) - parseInt(dh.substr(0, dh.length - 2));
                    dojo.byId('resultsContentPane').style.height = dw + 'px';
                    dojo.byId('resizer').style.top = '0px';
                    grid.resize();
                });

                // assign popup template
                popupTemplateEquipment = new esri.dijit.PopupTemplate({
                    title: "{otype}",
                    showAttachments: false
                });
                popupTemplateEquipment.setContent(function (f) {
                    var attr = f.attributes;
                    var sep = '<br>';
                    var pfr = typeof attr[gs.conf.pfResField] !== 'undefined' ? attr[gs.conf.pfResField] : null;
                    var eq = typeof attr['equipref' + gs.conf.eqPfx] !== 'undefined' ? attr['equipref' + gs.conf.eqPfx] : null;
                    var phase = (attr["phasecode"]) ? attr["phasecode"].toLowerCase() : '';
                    var out = '<table class="popupTable infoPaneContet">';
                    out += '<tr><td class="infoPaneLabelCell">Type</td><td>' + type2Name(attr["otype"]) + '</td></tr>';
                    out += infoWindowRow('ID', attr["secname"], 'focusOn');
                    out += infoWindowRow('Parent', attr["parentsec"], 'focusOn');
                    out += infoWindowRow('Feeder', attr["circuit"], 'focusOnBay', 'subBayInfoPane');
                    out += infoWindowRow('Equip. Ref.', attr["equipref"], gs.insetance.capabilities.model_editing?'updateEquipmentModel':null);
                    //out += '<tr><td class="infoPaneLabelCell">Equip. Ref.</td><td>' + attr["equipref"] + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Phase</td><td>' + attr["phasecode"] + '</td></tr>'; //domainDecoder(attr["phase"], 'phase', null)
                    out += '<tr><td class="infoPaneLabelCell">Status</td><td>' + attr["status"] + '</td></tr>';
                    if (attr["otype"] !== 'source') {
                        if (caseStudyName !== null && pfr !== null) {
                            out += '<tr><td class="infoPaneLabelCell">Nom. Voltage</td><td>' + pfr["nom_v"] / 1000 + ' kV (L-G)</td></tr>';
                        }
                    } else if (eq !== null) {
                        out += '<tr><td class="infoPaneLabelCell">Source Voltage</td><td>' + eq["vsource"] + ' kV (L-G)</td></tr>';
                    }
                    if (eq !== null) {
                        switch (attr["otype"]) {
                            case "transformer":
                                //out += '<tr><td class="infoPaneLabelCell">Ratio</td><td>' + eq['ratio'] + '</td></tr>';
                                out += '<tr><td class="infoPaneLabelCell">Single Phase Rating</td><td>' + toStr(eq['kva_a'], 1) + ' kVA</td></tr>';
                                out += '<tr><td class="infoPaneLabelCell">Single Phase PI,XR</td><td>' + toStr(eq['pi_a']) + ', ' + toStr(eq['xr_a']) + '</td></tr>';
                                break;
                            case "source":
                                /*
                                 out += '<tr><td class="infoPaneLabelCell">R<sub>0</sub>, X<sub>0</sub> [&Omega;]</td><td>' + toStr(eq['zero_r']) + ', ' + toStr(eq['zero_l'] * 2 * Math.PI * sys_freq) + '</td></tr>';
                                 out += '<tr><td class="infoPaneLabelCell">R<sub>1</sub>, X<sub>1</sub> [&Omega;]</td><td>' + toStr(eq['pos_r']) + ', ' + toStr(eq['pos_l'] * 2 * Math.PI * sys_freq) + '</td></tr>';*/
                                out += '<tr><td class="infoPaneLabelCell">R<sub>0</sub>, X<sub>0</sub> [&Omega;]</td><td>' + toStr(eq['zero_r'], 1e-4) + ', ' + toStr(eq['zero_x'], 1e-4) + '</td></tr>';
                                out += '<tr><td class="infoPaneLabelCell">R<sub>1</sub>, X<sub>1</sub> [&Omega;]</td><td>' + toStr(eq['pos_r'], 1e-4) + ', ' + toStr(eq['pos_x'], 1e-4) + '</td></tr>';
                                out += '<tr><td class="infoPaneLabelCell">Op. Volage (pu)</td><td>' + toStr(eq['ratio'], 1e-4) + '</td></tr>';
                                break;
                            case "capacitor":
                                break;
                            case "regulator":
                                out += '<tr><td class="infoPaneLabelCell">Rating (A)</td><td>' + toStr(eq['ampacity'], 1e-3) + '</td></tr>';
                                out += '<tr><td class="infoPaneLabelCell">Bandwidth</td><td>' + toStr(eq['bandwidth'], 1e-3) + '</td></tr>';
                                out += '<tr><td class="infoPaneLabelCell">Step size</td><td>' + toStr(eq['step_size'], 1e-3) + '</td></tr>';
                                out += '<tr><td class="infoPaneLabelCell">Boost, Buck</td><td>' + toStr(eq['boost']) + ', ' + toStr(eq['buck']) + '</td></tr>';
                                break;
                            case "motor":
                                out += '<tr><td class="infoPaneLabelCell">HP</td><td>' + toStr(eq['hp'], 1) + '</td></tr>';
                                if (eq['lr_kva_hp']) {
                                    out += '<tr><td class="infoPaneLabelCell">KVA/HP</td><td>' + toStr(eq['lr_kva_hp'], 1e-2) + '</td></tr>';
                                } else {
                                    out += '<tr><td class="infoPaneLabelCell">NEMA Code</td><td>' + eq['nema_code'] + '</td></tr>';
                                }
                                out += '<tr><td class="infoPaneLabelCell">Locked Rotor PF</td><td>' + toStr(eq['lr_pf'], 1e-3) + '</td></tr>';
                                out += '<tr><td class="infoPaneLabelCell">Soft Start Ratio</td><td>' + toStr(eq['sr_ratio'], 1e-3) + '</td></tr>';
                                break;
                            case "breaker":
                            case "fuse":
                            case "recloser":
                            case "sectionalizer":
                                out += '<tr><td class="infoPaneLabelCell">Rating (A)</td><td>' + toStr(eq['rating'], 1e-3) + '</td></tr>';
                                break;
                            case "generator":
                                break;
                        }
                    }
                    if (caseStudyName !== null && pfr !== null) {
                        out += '<tr><td class="infoPaneLabelCell">Study</td><td>' + caseStudyName + '</td></tr>';
                        if (eq !== null) {
                            switch (attr["otype"]) {
                                case "transformer":
                                    out += infoWindowLoading(f, 's', "kva_a", 1000, getLoadingThereshold(), sep);
                                    break;
                                case "regulator":
                                    out += infoWindowLoading(f, 'c', 'ampacity', 1, getLoadingThereshold(), sep);
                                    break;
                                case "source":
                                case "generator":
                                    //out += infoWindowLoading(f, 'p', 'p_max', 1000, getLoadingThereshold(), ', ');
                                    out += infoWindowPowerLoading(f, sep);
                                    break;
                            }
                        }
                        if(gs.conf.view.showVdU) out += infoWindowVoltage(f, gs.conf.analysis.baseV, getVoltageThereshold(), sep, gs.conf.analysis.thV);
                        if(gs.conf.view.showVdB) out += infoWindowVoltageBal(f, gs.conf.analysis.baseV, getVoltageThereshold(), sep, gs.conf.analysis.thV);
                        if(gs.conf.view.showFc||gs.conf.view.showFi) out += infoWindowFaultInfo(f, ', ');
                    }
                    out += '</table>';
                    var mkSelection;
                    if (BRANCH_ELEMENTS.indexOf(attr["otype"]) >= 0) {
                        mkSelection = registry.byId('selectDownStream').checked;
                        out += '<br><a onclick="countLoadsUnderLine(\'' + attr["secname"] + '\',\'' + attr["circuit"] + '\',' + mkSelection + ')"><span>Load Count and Distance from Bay</span></a>';
                    }
                    if (gs.insetance.capabilities.editing) out += '<br><a onclick="editSelection();"><span>Edit Selection</span></a> <a onclick="showPhaseSwitchDialog();"><span>Switch Phase</span></a>';
                    if (gs.oa && gs.insetance.capabilities.outage_mgmt) out += '<br><a onclick="gs.oa.toggleInclusionInOutageList();"><span>Toggle mark for Outage</span></a>';
                    if (attr["otype"] === 'source') {
                        out += '<br><a onclick="totalFeederLength(\'' + attr["circuit"] + '\')"><span>Measure Total Feeder Length</span></a>';
                    }
                    out += '<br><a onclick="showAuditInfo()"><span>History</span></a>';
                    out += '<br><a onclick="focusToSelection(gs.map.infoWindow.features, \'full\')"><span>Focus to Selection</span></a>';
                    dojo.empty(dojo.byId("overlayInfoWindow"));
                    dojo.place(out, dojo.byId("overlayInfoWindow"));
                    //dojo.byId("overlayInfoWindowButtons").innerHTML=map.infoWindow.domNode.getElementsByClassName("titlePane")[0].outerHTML;
                    //dojo.byId("overlayInfoWindow").innerHTML=map.infoWindow.domNode.children[0].innerHTML;
                });
                window.popupTemplateConsumer = new esri.dijit.PopupTemplate({
                    title: "Consumer",
                    showAttachments: false
                });
                window.popupTemplateConsumer.setContent(function (f) {
                    var attr = f.attributes;
                    var pfr = attr[gs.conf.pfResField] || null;
                    var ld = attr['equipref' + gs.conf.eqPfx] || null;
                    var phase = attr["phasecode"].toLowerCase();
                    var out = '<table class="popupTable infoPaneContet">';
                    out += '<tr><td class="infoPaneLabelCell">Type</td><td>' + type2Name(attr["otype"]) + '</td></tr>';
                    out += infoWindowRow('ID', attr["secname"], 'focusOn');
                    out += infoWindowRow('Parent', attr["parentsec"], 'focusOn', null, 'move');
                    out += infoWindowRow('Feeder', attr["circuit"], 'focusOnBay', 'subBayInfoPane');
                    out += infoWindowRow('Map. Loc.', attr["equipref"], 'showAddLoadRecDialog');
                    out += '<tr><td class="infoPaneLabelCell">Acct. No.</td><td>' + attr["account_no"] + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Meter No. (Cls.)</td><td>' + attr["meter_num"] + '(' + attr["cls"] + ')' + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Name</td><td class="infoPaneWrappingCell">' + attr["name"] + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Svc. Add.</td><td class="infoPaneWrappingCell">' + attr["svc_addr_no"] + ' ' + attr["svc_addr_st"] + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Desc.</td><td class="infoPaneWrappingCell">' + attr["description"] + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Phase</td><td>' + attr["phasecode"] + '</td></tr>'; //domainDecoder(attr["phase"], 'phase', null)
                    out += '<tr><td class="infoPaneLabelCell">L+G Phase</td><td>' + attr["ophase"] + '</td></tr>'; //domainDecoder(attr["phase"], 'phase', null)
                    out += '<tr><td class="infoPaneLabelCell">Status</td><td>' + attr["status"] + '</td></tr>';
                    out += infoWindowRow('Trans. ID', attr["maploc_xf"], 'searchForTrans');
                    out += '<tr><td class="infoPaneLabelCell">Trans. Spec.</td><td>' + attr["trans_type"] + ', ' + toStr(attr["trans_size"], 1) + ' KVA</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Rate Cls.</td><td><a href="http://hotec.coop/content/rate-schedule" target="_blank">' + attr["rateclass"] + '</a></td></tr>';
                    if (caseStudyName !== null) {
                        if (pfr !== null) {
                            out += '<tr><td class="infoPaneLabelCell">Nom. Voltage</td><td>' + pfr["nom_v"] / 1000 + ' kV (L-G)</td></tr>';
                            out += '<tr><td class="infoPaneLabelCell">Study</td><td class="infoPaneWrappingCell"><span class="infoPaneStudySpan">' + caseStudyName + '</span></td></tr>';
                            if(gs.conf.view.showVdU) out += infoWindowVoltage(f, gs.conf.analysis.baseV, getVoltageThereshold(), '<br>', gs.conf.analysis.thV);
                            if(gs.conf.view.showVdB) out += infoWindowVoltageBal(f, gs.conf.analysis.baseV, getVoltageThereshold(), '<br>', gs.conf.analysis.thV);
                        }
                        if (ld !== null) {
                            out += '<tr><td class="infoPaneLabelCell">Load Profile</td><td class="infoPaneWrappingCell"><span class="infoPaneLPSpan">' + getStudyProperty(caseStudyName, 'lscen') + '</span></td></tr>';
                            //out += '<tr><td class="infoPaneLabelCell">Power Demand<br>(kW)</td><td>' +
                            //    phase.split('').map(function (p) {
                            //    }).join(', ') + '</td></tr>';
                            out += infoWindowLoad(f, 'Power Demand<br>(kW)', 1.0, '<br>');
                            out += infoWindowLoad(f, 'Power Demand<br>(effective) (kW)', getStudyProperty(caseStudyName, 'lscaling'), '<br>');
                            //out += '<tr><td class="infoPaneLabelCell">Power Demand<br>(effective) (kW)</td><td>' + phase.split('').map(function (p) {
                            //}).join(', ') + '</td></tr>';
                            out += '<tr><td class="infoPaneLabelCell">Power Factor</td><td>' + toStr(ld['pf']) + '</td></tr>';
                        }
                    }
                    out += '</table>';
                    if (gs.insetance.capabilities.editing) out += '<br><a onclick="editSelection()"><span>Edit Selection</span></a><br><a onclick="showPhaseSwitchDialog();"><span>Switch Phase</span></a>';
                    if (gs.oa && gs.insetance.capabilities.outage_mgmt) out += '<br><a onclick="gs.oa.toggleInclusionInOutageList();"><span>Toggle mark for Outage</span></a>';
                    out += '<br><a onclick="showAuditInfo()"><span>History</span></a>';
                    out += '<br><a onclick="focusToSelection(gs.map.infoWindow.features, \'full\')"><span>Focus to Selection</span></a>';
                    dojo.empty(dojo.byId("overlayInfoWindow"));
                    dojo.place(out, dojo.byId("overlayInfoWindow"));
                    //dojo.byId("overlayInfoWindowButtons").innerHTML=map.infoWindow.domNode.getElementsByClassName("titlePane")[0].outerHTML;
                    //dojo.byId("overlayInfoWindow").innerHTML=map.infoWindow.domNode.children[0].innerHTML;
                });
                window.popupTemplateWire = new esri.dijit.PopupTemplate({
                    title: "Conductor",
                    showAttachments: false
                });
                popupTemplateWire.setContent(function (f) {
                    //window.f = f;
                    var sep = '<br>';
                    var mkSelection = registry.byId('selectDownStream').checked;
                    var attr = f.attributes; //it is a graphic not a feature
                    var pfr = typeof attr[gs.conf.pfResField] !== 'undefined' ? attr[gs.conf.pfResField] : null;
                    var cond = typeof attr['conductor' + gs.conf.eqPfx] !== 'undefined' ? attr['conductor' + gs.conf.eqPfx] : null;
                    var len = esri.geometry.geodesicLengths([esri.geometry.webMercatorToGeographic(f.geometry)], esri.Units.FEET)[0];
                    var impLen = typeof attr['imp_len'] !== 'undefined' ? attr['imp_len'] : null;
                    //var phase = attr["phasecode"] && attr["phasecode"].toLowerCase();
                    var vt = getVoltageThereshold(), ct = getLoadingThereshold();
                    //var out= dojo.create('table', {});
                    var out = '<table class="popupTable infoPaneContet">';
                    out += '<tr><td class="infoPaneLabelCell">Type</td><td>' + type2Name(attr["otype"]) + '</td></tr>';
                    out += infoWindowRow('ID', attr["secname"], 'focusOn');
                    out += infoWindowRow('Parent', attr["parentsec"], 'focusOn');
                    out += infoWindowRow('Feeder', attr["circuit"], 'focusOnBay', 'subBayInfoPane');
                    
                    //out += '<tr><td class="infoPaneLabelCell">Conductor</td><td>' + attr["conductor"] + '</td></tr>';
                    //out += '<tr><td class="infoPaneLabelCell">Neutral</td><td>' + attr["neutral"] + '</td></tr>';
                    //out += '<tr><td class="infoPaneLabelCell">Construction</td><td>' + attr["construction"] + '</td></tr>';
                    out += infoWindowRow('Conductor', attr["conductor"], gs.insetance.capabilities.model_editing?'updateEquipmentModel':null, 'infoPaneLabelCell', 'conductor');
                    out += infoWindowRow('Neutral', attr["neutral"], gs.insetance.capabilities.model_editing?'updateEquipmentModel':null, 'infoPaneLabelCell', 'neutral');
                    out += infoWindowRow('Construction', attr["construction"], gs.insetance.capabilities.model_editing?'updateEquipmentModel':null, 'infoPaneLabelCell', 'construction');
                    //out += '<tr><td class="infoPaneLabelCell">Neutral</td><td>' + attr["neutral"] + '</td></tr>';
                    //out += '<tr><td class="infoPaneLabelCell">Construction</td><td>' + attr["construction"] + '</td></tr>';
                    if (cond) {
                        out += '<tr><td class="infoPaneLabelCell">Rating</td><td>' + cond["rating"] + ' A</td></tr>';
                    }
                    out += '<tr><td class="infoPaneLabelCell">Length</td><td>' + toStr(len, 1, true) + ' ft' + (impLen ? (' (' + toStr(impLen, 1, true) + ' ft)') : '') + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Phase</td><td>' + attr["phasecode"] + '</td></tr>';
                    if (caseStudyName !== null && pfr !== null) {
                        out += '<tr><td class="infoPaneLabelCell">Nom. Voltage</td><td>' + pfr["nom_v"] / 1000 + ' kV (L-G)</td></tr>';
                        out += '<tr><td class="infoPaneLabelCell">Study</td><td>' + caseStudyName + '</td></tr>';
                        if(gs.conf.view.showVdU) out += infoWindowVoltage(f, gs.conf.analysis.baseV, vt, sep, gs.conf.analysis.thV);
                        if(gs.conf.view.showVdB) out += infoWindowVoltageBal(f, gs.conf.analysis.baseV, vt, sep, gs.conf.analysis.thV);
                        out += infoWindowLoading(f, 'c', 'rating', 1, ct, sep);
                        out += infoWindowLoadingBalanced(f, 'c', 'rating', 1, ct, sep);
                        if(gs.conf.view.showP) out += infoWindowPowerLoading(f, sep);
                        if(gs.conf.view.showFc||gs.conf.view.showFi) out += infoWindowFaultInfo(f, ', ');
                    }
                    out += '</table>';
                    out += '<br><a onclick="countLoadsUnderLine(\'' + attr["secname"] + '\',\'' + attr["circuit"] + '\',' + mkSelection + ')"><span>Load Count and Distance from Bay</span></a>';
                    if (gs.insetance.capabilities.editing) out += '<br><a onclick="editSelection()"><span>Edit Selection</span></a><br><a onclick="showPhaseSwitchDialog();"><span>Switch Phase</span></a>';
                    if (gs.oa && gs.insetance.capabilities.outage_mgmt) out += '<br><a onclick="gs.oa.toggleInclusionInOutageList();"><span>Toggle mark for Outage</span></a>';
                    out += '<br><a onclick="showAuditInfo()"><span>History</span></a>';
                    out += '<br><a onclick="focusToSelection(gs.map.infoWindow.features, \'full\')"><span>Focus to Selection</span></a>';
                    dojo.empty(dojo.byId("overlayInfoWindow"));
                    dojo.place(out, dojo.byId("overlayInfoWindow"));
                    //dojo.byId("overlayInfoWindowButtons").innerHTML=map.infoWindow.domNode.getElementsByClassName("titlePane")[0].outerHTML;
                    //dojo.byId("overlayInfoWindow").innerHTML=map.infoWindow.domNode.children[0].innerHTML;
                });
                window.popupTemplatePole = new esri.dijit.PopupTemplate({
                    title: "Pole",
                    showAttachments: false
                });
                popupTemplatePole.setContent(function (f) {
                    //window.f = f;
                    var poleg = esri.geometry.webMercatorToGeographic(f.geometry);
                    var attr = f.attributes; //it is a graphic not a feature
                    var out = '<table class="popupTable infoPaneContet">';
                    out += '<tr><td class="infoPaneLabelCell">Type</td><td>Pole</td></tr>';
                    out += infoWindowRow('Feeder', attr["circuit"], 'focusOnBay', 'subBayInfoPane');
                    out += '<tr><td class="infoPaneLabelCell">Attachments:</td><td class="infoPaneWrappingCell">' + ((attr["attachments"]) ? attr["attachments"] : '') + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Comments:</td><td class="infoPaneWrappingCell">' + ((attr["comments"]) ? attr["comments"] : '') + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Violations:</td><td class="infoPaneWrappingCell">' + ((attr["violations"]) ? attr["violations"] : '') + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Coordinates:</td><td>' + toStr(poleg.y, 1e-7) + ', ' + toStr(poleg.x, 1e-7) + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Technician:</td><td class="infoPaneWrappingCell">' + ((attr["tech_name"]) ? attr["tech_name"] : '') + '</td></tr>';
                    out += '<tr><td class="infoPaneLabelCell">Servic Order:</td><td class="infoPaneWrappingCell">' + ((attr["service_order"]) ? attr["service_order"] : '') + '</td></tr>';
                    if (attr["date"] && attr["time"]) {
                        out += '<tr><td class="infoPaneLabelCell">Timestamp:</td><td class="infoPaneWrappingCell">' + formatDate(new Date(attr["date"]), 'MMM d, yyyy') + " " + attr["time"] + '</td></tr>';
                    }
                    out += '</table>';
                    out += '<br><a onclick="showAuditInfo()"><span>History</span></a>';
                    out += '<br><a onclick="focusToSelection(gs.map.infoWindow.features, \'full\')"><span>Focus to Selection</span></a>';
                    dojo.empty(dojo.byId("overlayInfoWindow"));
                    dojo.place(out, dojo.byId("overlayInfoWindow"));
                    //dojo.byId("overlayInfoWindowButtons").innerHTML=map.infoWindow.domNode.getElementsByClassName("titlePane")[0].outerHTML;
                    //dojo.byId("overlayInfoWindow").innerHTML=map.infoWindow.domNode.children[0].innerHTML;
                });


                // connect event handlers
                //console.log('Connecting event handlers...');
                function updateOnEnter(e) {
                    if (e.charOrCode === dojo.keys.ENTER) issuesUpdateButtonHandler();
                }

                registry.byId('tvTh').on('keypress', updateOnEnter);
                registry.byId('vvTh1').on('keypress', updateOnEnter);
                registry.byId('vvTh2').on('keypress', updateOnEnter);
                registry.byId('searchTerm').on('keypress', function (e) {
                    //registry.byId('searchTerm').validator = function () {};
                    if (e.charOrCode === dojo.keys.ENTER) {
                        searchButtonHandler();
                    }
                });
                registry.byId('searchTerm').intermediateChanges = true;
                map.on('mouse-move', measureRollingDistance); // in edit
                map.on('extent-change', function (e) {
                    gs.state.lastExtent = map.extent;
                    toggleGmapTilt(gs.conf.gmapTiltDisabled);
                    //saveEnv();
                });
                assetsLayer.on('visibility-change', function (e) {
                    console.log('assets layer visibility change: ', e);
                    updateSnapLayers(gs.map, e.visible ? getVisibleFeatureLayers() : []);
                });
                assetsLayer.on('visible-layers-change', function (e) {
                    console.log('assets visibile layers changed: ', e);
                    updateSnapLayers(gs.map, getVisibleFeatureLayers());
                });
                mapLayers.forEach(function (l) {
                    l.on('visibility-change', function (e) {
                        console.log('Layer visibility change: ', e);
                        getVisibleMapLayers();
                        //saveEnv();
                    });
                });

                require(["dojo/touch"], function(touch){
                    touch.press(registry.byId("outageAnalysis").titleBar, function(e){
                        outage_hover();
                    });
                    touch.press(registry.byId("measurementPane").titleBar, function(e){
                        measurement_hover();
                    });
                    touch.press(registry.byId("legend_hover").titleBar, function(e){
                        legend_hover();
                    });
                    touch.press(registry.byId("import_hover").titleBar, function(e){
                        import_hover();
                    });
                    touch.press(registry.byId("power_hover").titleBar, function(e){
                        power_hover();
                    });
                    touch.press(registry.byId("backup_hover").titleBar, function(e){
                        backup_hover();
                    });
                    touch.press(registry.byId("msgTitlePane").titleBar, function(e){
                        msg_hover();
                    });
                    touch.press(registry.byId("issue_hover").titleBar, function(e){
                        issue_hover();
                    });
                    touch.press(registry.byId("equipment_hover").titleBar, function(e){
                        equipment_hover();
                    });
                    touch.press(registry.byId("cursor_hover").titleBar, function(e){
                        cursor_hover();
                    });
                    touch.press(registry.byId("grid_hover").titleBar, function(e){
                        grid_hover();
                    });
                    touch.press(registry.byId("downline_hover").titleBar, function(e){
                        downline_hover();
                    });
                    touch.press(registry.byId("symbol_hover").titleBar, function(e){
                        symbol_hover();
                    });
                    touch.press(registry.byId("edit_hover").titleBar, function(e){
                        edit_hover();
                    });
                    touch.press(registry.byId("manage_case_hover").titleBar, function(e){
                        manage_case_hover();
                    });
                    touch.press(registry.byId("overlayInfoWindowContainer").focusNode, function(e){
                        close_info1();
                    });
                    touch.press(registry.byId("attributeEditorContainer").focusNode, function(e){
                        attribute_hover();
                    });
                    touch.press(registry.byId("addLoadRecDialogDiv").titleBar, function(e){
                        addLoadRec();
                    });
                    touch.press(registry.byId("addLoadProfileDialogDiv").titleBar, function(e){
                        addload_profile();
                    });
                    touch.press(registry.byId("deleteLoadProfileDialogDiv").titleBar, function(e){
                        deleteload_profile();
                    });
                    touch.press(registry.byId("sourceModelRecDialogDiv").titleBar, function(e){
                        sourceModelRecDialogDiv();
                    });
                    touch.press(registry.byId("capModelRecDialogDiv").titleBar, function(e){
                        capModelRecDialogDiv();
                    });
                    touch.press(registry.byId("transModelRecDialogDiv").titleBar, function(e){
                        transModelRecDialogDiv();
                    });
                    touch.press(registry.byId("regModelRecDialogDiv").titleBar, function(e){
                        regModelRecDialogDiv();
                    });
                    touch.press(registry.byId("condModelRecDialogDiv").titleBar, function(e){
                        condModelRecDialogDiv();
                    });
                    touch.press(registry.byId("importBillingFileDialogDiv").titleBar, function(e){
                        import_billing();
                    });
                    touch.press(registry.byId("importBayLoadingFileDialogDiv").titleBar, function(e){
                        importBay();
                    });
                    touch.press(registry.byId("phaseSwitchDialogDiv").titleBar, function(e){
                        phaseSwitchDialogDiv1();
                    });
                    touch.press(registry.byId("addIntervalLoadProfileDialogDiv").titleBar, function(e){
                        intervalload_profile();
                    });
                    touch.press(registry.byId("intPowerFlowDialogDiv").titleBar, function(e){
                        dijit_Dialog1();
                    });
                    touch.press(registry.byId("analytics_hover").titleBar, function(e){
                        analytics_hover();
                    });
                    touch.press(registry.byId("manageIntCaseStudiesDialogDiv").titleBar, function(e){
                        manageintercase_studies();
                    });
                    touch.press(registry.byId("viewDialog").titleBar, function(e){
                        view_hover();
                    });
                    if (registry.byId("dijit_Dialog_0")) {
                        touch.press(registry.byId("dijit_Dialog_0").titleBar, function(e){
                            dijit_Dialog_0_hover();
                        });
                    }
                    if (registry.byId("dijit_Dialog_1")) {
                        touch.press(registry.byId("dijit_Dialog_1").titleBar, function(e){
                            dijit_Dialog_1_hover();
                        });
                    }
                    if (registry.byId("dijit_Dialog_2")) {
                        touch.press(registry.byId("dijit_Dialog_2").titleBar, function(e){
                            dijit_Dialog_2_hover();
                        });
                    }
                    if (registry.byId("dijit_Dialog_3")) {
                        touch.press(registry.byId("dijit_Dialog_3").titleBar, function(e){
                            dijit_Dialog_3_hover();
                        });
                    }
                });

                dojo.connect(registry.byId('msgTitlePane'), 'toggle', updateMessagePaneTitle);
                dojo.connect(registry.byId('msgTitlePane'), 'hide', function(){
                    unseenMessageCount = 0;
                    msg_val = 0;
                });
                dojo.connect(registry.byId('legend_hover'), 'hide', function(){
                    legend_val = 0;
                });
                dojo.connect(registry.byId('measurementPane'), 'hide', function(){
                    measurement_val = 0;
                });
                dojo.connect(registry.byId('edit_hover'), 'hide', function(){
                    edit_val = 0;
                });
                dojo.connect(registry.byId('viewDialog'), 'hide', function(){
                    view_val = 0;
                });
                dojo.connect(registry.byId('overlayInfoWindowContainer'), 'show', function(){
                    downAllWindows(bottom_z_index);
                    document.getElementById('overlayInfoWindowContainer').style.zIndex = top_z_index;
                });
                
                gs.conf.overlayList.forEach(function (o) {
                    dojo.connect(dojo.byId(o), 'pointerup', recordOverlayLocations);
                });
                /*
                 dojo.connect(dojo.byId('msgContentPane'),'onscroll',function(e){
                 d=dojo.byId('msgContentPane');
                 d.scrollTop=d.scrollTopMax;
                 domStyle.set(registry.byId('msgClearButton').domNode,'top',d.scrollTop+10+'px');
                 domStyle.set(registry.byId('msgResizeHandle').domNode,'top',d.scrollTop+domGeom.position(d).h-20+'px';
                 });
                 */
                //console.log('Done!');

                // start info window
                var ow = registry.byId('overlayInfoWindowContainer');
                ow.containerNode.style.display = 'none';
                var ib = domConstruct.create("span");
                ib.className = "infoPaneRoleInIcon";
                ib.id = "infoPaneRoleInIcon";
                dojo.connect(ib, 'onclick', function () {
                    ow = registry.byId('overlayInfoWindowContainer');
                    console.log('Role toggle... ' + ow.containerNode.style.display);
                    if (ow.containerNode.style.display === 'none') {
                        ow.containerNode.style.display = 'block';
                        dojo.byId('infoPaneRoleInIcon').style.backgroundPosition = "0px";
                    } else {
                        ow.containerNode.style.display = 'none';
                        dojo.byId('infoPaneRoleInIcon').style.backgroundPosition = "-21px";
                    }
                });
                domConstruct.place(ib, ow.focusNode.children[0], 'before');
                ib = domConstruct.create("span");
                ib.className = "infoPanePrevIcon";
                ib.id = "infoPanePrevIcon";
                dojo.connect(ib, 'onclick', function () {
                    if (map.infoWindow.count > 1) {
                        map.infoWindow.selectPrevious();
                        dojo.byId('infoPaneCount').innerHTML = (map.infoWindow.selectedIndex + 1) + ' of ' + map.infoWindow.count;
                    }
                });
                domConstruct.place(ib, ow.titleNode, 'after');
                ib = domConstruct.create("span");
                ib.id = "infoPaneCount";
                ib.className = "infoPaneCount";
                domConstruct.place(ib, dojo.byId("infoPanePrevIcon"), 'after');
                ib = domConstruct.create("span");
                ib.id = "infoPaneNextIcon";
                ib.className = "infoPaneNextIcon";
                dojo.connect(ib, 'onclick', function () {
                    if (map.infoWindow.count > 1) {
                        map.infoWindow.selectNext();
                        dojo.byId('infoPaneCount').innerHTML = (map.infoWindow.selectedIndex + 1) + ' of ' + map.infoWindow.count;
                    }
                });
                domConstruct.place(ib, dojo.byId("infoPaneCount"), 'after');
                //domConstruct.place(iDiv, ow.focusNode.children[0] ,'after');
                ib = domConstruct.create("span");
                ib.className = "infoPaneSpinner";
                ib.id = "infoPaneSpinner";
                domConstruct.place(ib, dojo.byId("infoPaneNextIcon"), 'after');
                dojo.query("#infoPaneRoleInIcon, #infoPanePrevIcon, #infoPaneCount, #infoPaneNextIcon, #infoPaneSpinner").addClass("infoPaneIcon");
                dojo.query("#infoPanePrevIcon, #infoPaneCount, #infoPaneNextIcon").addClass("infoPaneMulti");
                dojo.query("#infoPanePrevIcon, #infoPaneCount, #infoPaneNextIcon, #infoPaneSpinner").addClass("infoPaneHidden");
                owPatchStyle();

                //siwUpdate();
                ewHide();
                //listVersions();
                //getSubGriInfo();
            });
        }, function (err) {
            console.log('Error getting layer info...' + err);
        }, function (update) {
            console.log('Update...' + update);
        });
        window.editToolbar = createEditToolbar(map);
    });
    on(window, 'resize', function () {
        patchStyles();
    });
    patchStyles();
    ewHide();
    registry.byId("billingFileDate").set('value', formatDate(new Date(), 'y-MM-dd'));

    //getWireTypes();

    map.on('layers-add-result', function (evt) {
        console.log('map: layers-add-result', evt);
        return;
        if (evt.layers.every(function (l) {
                return l && typeof l.success !== 'undefined' && l.success;
            })) {
            var layers = evt.layers.map(function (l) {
                return l.layer
            });
            if (!gs.state.mapLayersLoaded && matchLayerSet(layers, mapLayers)) {
                gs.state.mapLayersLoaded = true;
                postMapLayerLoadOps();
            } else if (!gs.state.featureLayersLoaded && matchLayerSet(layers, assetsFeatureLayers)) {
                gs.state.featureLayersLoaded = true;
                postFeatureLayerLoadOperations();
            } else if (!gs.state.dataLayersLoaded && matchLayerSet(layers, dataFeatureLayers)) {
                gs.state.dataLayersLoaded = true;
                postDataLayersLoadOps();
            }
            if (gs.state.mapLayersLoaded && gs.state.featureLayersLoaded && gs.state.dataLayersLoaded) {
                postLayersLoadOps();
            }
        } else {
            console.log('Error loading layer set: ', evt);
        }
    });
    map.on('layer-add-result', function (evt) {
        console.log('map: layer-add-result', evt);
        if (evt.layer) {
            var layer = evt.layer;
            gs.state.loadedLayers.push(layer);
            if (layer.url) {
                if (!gs.state.mapLayersLoaded && layerSetLoaded(gs.state.loadedLayers, mapLayers)) {
                    gs.state.mapLayersLoaded = true;
                    postMapLayerLoadOps();
                } else if (!gs.state.featureLayersLoaded && layerSetLoaded(gs.state.loadedLayers, assetsFeatureLayers)) {
                    gs.state.featureLayersLoaded = true;
                    postFeatureLayerLoadOperations();
                } else if (!gs.state.dataLayersLoaded && layerSetLoaded(gs.state.loadedLayers, dataFeatureLayers)) {
                    gs.state.dataLayersLoaded = true;
                    postDataLayersLoadOps();
                }
                if (gs.state.mapLayersLoaded && gs.state.featureLayersLoaded && gs.state.dataLayersLoaded) {
                    postLayersLoadOps();
                }
            } else {
                console.log('Layer does not have a url.', layer);
            }
        } else {
            console.log('Error loading layer set: ', evt);
        }
    });
    map.on('layer-reorder', function (evt) {
        console.log('map: layer-reorder', evt);
    });
    map.on('click', function (evt) {
        console.log("Map click dispatcher", evt);
        //recordOverlayLocations();
        var markCoordinates = true;
        if (markCoordinates) {
            lastPt = evt.mapPoint;
            maplocLayer.clear();
            maplocLayer.add(new esri.Graphic(lastPt, flagSymbol));
            ML.getCoordinates(lastPt, gs.conf.defaultSpatialRef.grid_wkid, function (ppts) {
                printMapLoc(ppts);
                drawCustGrid(ppts);
            });
        }
        // reverse geocoding
        if (registry.byId("printAddressTextCB").checked) {
            console.log('Finding corresponding address...', evt.mapPoint, esri.geometry.webMercatorToGeographic(evt.mapPoint));
            locator.locationToAddress(evt.mapPoint, //esri.geometry.webMercatorToGeographic(evt.mapPoint),
                convLen(maxDistanceAddress, 'ml', 'm'), function (e) {
                    var address;
                    if (e.address) {
                        address = e.address;
                        console.log('Address: ', address);
                        addMessage('Closest address: ' + address.Address + ', ' + address.City + ', ' + address.Region + ' ' + address.Postal, 'info');
                    }
                }, function (e) {
                    console.log('Address lookup error: ', e);
                    addMessage('No address found in ' + maxDistanceAddress + ' mile vicinity', 'info');
                });
        }
        // editing mode
        if (!measurement.activeTool && !drawing && !adding) {
            editToolbar.deactivate();
            if (editable) {
                //if (lineOp == 0) {
                console.log('Calling the editing handler.');
                editSearchQuery(evt);
                //} else {

                //}
            } else {
                ewHide();
                //clearAllSelections();
                console.log('Calling the inspection handler.');
                searchLayers(evt);
            }
        }
    });
    map.on('mouse-move', function (evt) {
        //snapManager.getSnappingPoint(evt.screenPoint).then(function (e) { console.log('Snapping point:', e); });
    });
    map.on('pan', function () {
        patchStyles();
        map.resize();
    });
    map.infoWindow.on('hide', function () {
        assetsFeatureLayers.forEach(function (l) {
            l.clearSelection();
        });
    });
    map.infoWindow.onSetFeatures = map.infoWindow.onShow = function () {
        if (map.infoWindow.count <= 0 && !editable) map.infoWindow.hide();
    };

    bayHighlightingLayer = new esri.layers.GraphicsLayer({opacity: 0.3});
    issueHighlightingLayer = new esri.layers.GraphicsLayer({opacity: 0.5});
    outageLayer = new esri.layers.GraphicsLayer({opacity: 0.7});
    maplocLayer = new esri.layers.GraphicsLayer();
    
    // gp services
    window.caseStudyGPSvc = 'powerflowAnalysis';
    window.manageCaseStudiesGPSvc = 'manageCaseStudies';
    window.importBillingFileSvc = 'importBilling';
    window.importBayLoadingFileSvc = 'importBayLoading';
    window.manageLoadProfilesSvc = 'manageLoadProfiles';
    window.wipeAndRebuildSvc = 'rebuildModel';
    window.versionManagerSvc = 'VersionManagerGP';
    window.backupSvc = 'dbBackup';
    window.customersSyncSvc = 'importCustomers';
    window.outageAnalysisSvc = 'outageAnalysis';
    window.reportGeneratorSvc = 'reportGenerator';
    window.connectionCheckSvc = 'connectivityCheck';
    // end gpservices

    // setup map widgets
    window.basemapGallery = new esri.dijit.BasemapGallery({
        showArcGISBasemaps: true, toggleReference: true, map: map,
        google: {
            apiOptions: {v: '3.25', key: 'AIzaSyBA-n4yWXzmeBlGpjo9uBVRhngNcvHnF_4'},
            // apiOptions: {v: '3.25',},
            mapOptions: {streetViewControlOptions: {position: 4,}},
        },
    }, "basemapGallery");
    basemapGallery.on('error', function (msg) {
        console.log(msg);
    });
    basemapGallery.on('selection-change', function (e) {
        console.log('Basemap selection changed.', e);
        toggleGmapTilt(gs.conf.gmapTiltDisabled);
        //console.log('Selected basemap:', basemapGallery.getSelected().title);
        gs.conf.basemap = preTag(basemapGallery.getSelected().title);
    });
    basemapGallery.on('load', function (msg) {
        console.log('bm load', basemapGallery.basemaps);
        //var lastBasemapInd = 1;
        var bmind = 2; //((lastBasemapInd == -1) ? 2 : lastBasemapInd);
        basemapGallery.basemaps.forEach(function (r, i) {
            if (preTag(r.title) === gs.conf.basemap) bmind = i;
        });
        console.log("Last basemap index: ", bmind);
        basemapGallery.select(basemapGallery.basemaps[bmind].id);
    });
    basemapGallery.startup();
    var geoLocate = new esri.dijit.LocateButton({map: map}, "LocateButton");
    geoLocate.startup();
    var homeButton = new esri.dijit.HomeButton({map: map, extent: gs.conf.defaultExtent}, "HomeButton");
    homeButton.startup();
    var scalebar = new esri.dijit.Scalebar({map: map, attachTo: "bottom-right", scalebarUnit: "dual"});
    // end setup map widgets


    // setup measurement tool
    measurement = new esri.dijit.Measurement({map: map}, dojo.byId("measurementDiv"));
    measurement.startup();
    //dojo.addClass(measurement.unit.containerNode, "measurementUnitButton");
    registry.byId('measurementPane').on('show', function (evt) {
        measurement.resultLabel.domNode.innerHTML = "";
        //if(measurement.mouseCell.children.length>1){removeElement(measurement.mouseCell.children[1]);}
        //if(measurement.pinCell.children.length>1){removeElement(measurement.pinCell.children[1]);}
    });
    registry.byId('measurementPane').on('hide', function (evt) {
        if (measurement.activeTool) {
            measurement.clearResult();
            measurement.setTool(measurement.activeTool, false);
        }
    });
    // end setup measurement tool

    // setup print tool
    window.printTask = new esri.tasks.PrintTask(printService, {async: true});
    window.printParams = new esri.tasks.PrintParameters();
    printParams.map = map;
    // end setup print tool

    // setup backup, depends on GpServices
    gs.backup = new gs.dbBackup();
    gs.backup.service = getGpUrl(backupSvc, backupSvc);
    gs.backup.form = dojo.byId('restoreFileForm');
    gs.backup.server= gs.dbServer
    gs.backup.db= gs.dbInstance

    gs.backup.postMessage = function (msg) {
        console.log("Backup: " + msg.type + " : " + msg.description);
        addMessage("Backup: " + msg.description, msg.type);
    };

    gs.backup.postRestore = function () {
        location.reload(true);
        //assetsLayer.refresh();
    };
    gs.backup.startWaitFunc = function () {
        controlStartWaiting("restoreFileLoadingDiv");
        registry.byId('backupBtn').set("disabled", true);
        registry.byId('restoreBtn').set("disabled", true);
    };
    gs.backup.stopWaitFunc = function () {
        controlStopWaiting("restoreFileLoadingDiv");
        registry.byId('backupBtn').set("disabled", false);
        registry.byId('restoreBtn').set("disabled", false);
    };
    gs.backup.startWaitFuncUpload = function () {
        controlStartWaiting("restoreFileLoadingDiv");
        registry.byId('restoreBtn').set("disabled", true);
    };
    gs.backup.stopWaitFuncUpload = function () {
        controlStopWaiting("restoreFileLoadingDiv");
        registry.byId('restoreBtn').set("disabled", false);
    };
    // end setup backup

    // setup customer sync
    gs.custSync = new gs.customersSync();
    gs.custSync.sde = gs.sdeInstance;
    gs.custSync.pfx = gs.sdePfx;
    gs.custSync.service = getGpUrl(customersSyncSvc, customersSyncSvc);
    gs.custSync.form = dojo.byId('customersSyncFileForm');

    gs.custSync.postMessage = function (msg) {
        console.log("Customers sync: " + msg.type + " : " + msg.description);
        addMessage("Customers sync: " + msg.description, msg.type);
    };

    gs.custSync.postRestore = function () {
        //location.reload(true);
        assetsLayer.refresh();
    };
    gs.custSync.startWaitFunc = function () {
        controlStartWaiting("customersSyncFileLoadingDiv");
        registry.byId('custSyncBtn').set("disabled", true);
    };
    gs.custSync.stopWaitFunc = function () {
        controlStopWaiting("customersSyncFileLoadingDiv");
        registry.byId('custSyncBtn').set("disabled", false);
    };
    gs.custSync.startWaitFuncUpload = function () {
        controlStartWaiting("customersSyncFileLoadingDiv");
        registry.byId('custSyncBtn').set("disabled", true);
    };
    gs.custSync.stopWaitFuncUpload = function () {
        controlStopWaiting("customersSyncFileLoadingDiv");
        registry.byId('custSyncBtn').set("disabled", false);
    };
    // end setup customer sync

    // setup outage analysis
    gs.oa = new gs.outageAnalyzer(gs, outageLayer, getGpUrl(outageAnalysisSvc, outageAnalysisSvc), null);
    gs.oa.sde = gs.sdeInstance;
    gs.oa.pfx = gs.sdePfx;
    gs.oa.msgFunc = addMessage; //function (msg) { addMessage(msg); };
    gs.oa.linkify = linkifySecname;
    gs.oa.sourcePath = sourcePath;
    gs.oa.getLayerIndex = getLayerIndex;
    // gs.oa.outLine = outLine;
    // gs.oa.outMarker = outMarker;
    // gs.oa.outPathMarker = outPathMarker;
    // gs.oa.outPathLine = outPathLine;
    // gs.oa.outProthMarker = outProthMarker;
    // gs.oa.isProtectionDev = function (f) {
    // };
    gs.oa.startWaitFunc = function () {
        owStartWaiting();
    };
    gs.oa.stopWaitFunc = function () {
        owStopWaiting();
    };
    // end setup outage analysis

    // setup report generator
    gs.rg = new gs.reportGenerator(gs, getGpUrl(reportGeneratorSvc, reportGeneratorSvc));
    gs.rg.sde = gs.sdeInstance;
    gs.rg.pfx = gs.sdePfx;    
    gs.rg.postMessage = function (msg) {
        console.log("Report Generator: " + msg.type + " : " + msg.description);
        addMessage("Report Generator: " + msg.description, msg.type);
    };
    gs.rg.postRestore = function () {
        location.reload(true);
        //assetsLayer.refresh();
    };
    gs.rg.startWaitFunc = function () {
        controlStartWaiting("generateReportLoadingDiv");
        registry.byId('generateReportBtn').set("disabled", true);
    };
    gs.rg.stopWaitFunc = function () {
        controlStopWaiting("generateReportLoadingDiv");
        registry.byId('generateReportBtn').set("disabled", false);
    };
    // end setup report generator

    window.assetsLayer = new esri.layers.ArcGISDynamicMapServiceLayer(mapService, {opacity: 1, refreshInterval: 0.25});
    window.gridLayer = new esri.layers.ArcGISDynamicMapServiceLayer(gridService, {opacity: 0.5});
    gs.assetsLayer = assetsLayer;
    gs.gridLayer = gridLayer;
    //assetsLayer.setImageFormat('png24');

    // load assets feature layers
    when(gs.layerInfo, function () {
        console.log('Adding feature layers...');
        window.assetsFeatureLayers = gs.layers.map(function (l) {
            return new esri.layers.FeatureLayer(getFeatureLayerUrl(l), {
                mode: esri.layers.FeatureLayer.MODE_SELECTION,
                outFields: ["*"]
            });
        });
        window.aflLines = assetsFeatureLayers[gs.layers.indexOf('Power Lines')];
        window.aflEquips = assetsFeatureLayers[gs.layers.indexOf('Equipment')];
        window.aflLoads = assetsFeatureLayers[gs.layers.indexOf('Loads')];
        window.aflPoles = assetsFeatureLayers[gs.layers.indexOf('Poles')];
        // this gaurantees the feature layers used for editing fall on top of all the highlights and do not get blocked by  them while editing
        //assetsFeatureLayers.forEach(function (l, i) { map.addLayer(l, i) });
        map.addLayers(assetsFeatureLayers);

        aflLoads.setSelectionSymbol(editMark);
        aflEquips.setSelectionSymbol(editMark);
        aflLines.setSelectionSymbol(editLine);

        assetsFeatureLayers.forEach(function (l) {
            l.on('edits-complete', function (e) {
                l.refresh();
                assetsLayer.refresh();
            });
            l.on('selection-clear', function (e) {
                l.refresh();
                assetsLayer.refresh();
                //ewHide();
            });
        });
    });

    // load data feature layers
    when(gs.layerInfo, function () {
        window.loadModelTable = new esri.layers.FeatureLayer(getFeatureLayerUrl('model_loads'), {
            mode: esri.layers.FeatureLayer.MODE_SELECTION,
            outFields: ["*"]
        });
        window.dataFeatureLayers = [loadModelTable];
        map.addLayers(dataFeatureLayers);
    });

    //resize the map when the browser resizes - view the 'Resizing and repositioning the map' section in
    //the following help topic for more details http://help.esri.com/EN/webapi/javascript/arcgis/help/jshelp_start.htm#jshelp/inside_guidelines.htm

    var resizeTimer;
    dojo.connect(map, 'onLoad', function () {
        dojo.connect(dijit.byId('mapDiv'), 'resize', function () { //resize the map if the div is resized
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                map.resize();
                map.reposition();
                patchStyles();
            }, 100);
        });
    });


    //vtl = new VectorTileLayer("https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap/VectorTileServer");

    // creates layers, toggle these on/off for capabilities
    tocLayerInfos = [
        {layer: bayHighlightingLayer, title: "Info. High.", collapsed: true, slider: true},
        {layer: issueHighlightingLayer, title: "Issue", collapsed: false, slider: true},
        {layer: assetsLayer, title: "Network", collapsed: false, slider: true},
        {layer: gridLayer, title: "Grid", collapsed: false, slider: true},
    ];
    window.mapLayers = [bayHighlightingLayer, issueHighlightingLayer, assetsLayer, gridLayer, maplocLayer];

    /*
    var certColor = new esri.Color("#666");
    var certSymbol = new esri.symbol.TextSymbol().setColor(certColor);
    certSymbol.font.setSize("14pt");
    certSymbol.font.setFamily("arial");
    var labelRenderer = new esri.renderer.SimpleRenderer(certSymbol);
    var labelClass= new esri.layers.LabelClass({ "labelExpressionInfo": {"value": "{COMPID}"} });
    labelClass.symbol = certSymbol;    
    */
   gs.conf.certMapsLayers.forEach(function (lk) {
    var ln = lk + 'CertLayer';
    window[ln] = new esri.layers.FeatureLayer(gs.conf.certMapLayerInfos[lk].url, {
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: ["*"],
        opacity: 0.5,
        visible: false,
    });
    //window[ln].setLabelingInfo([labelClass]);
    //window[ln].setRenderer(labelRenderer);
    /*
    tocLayerInfos.push({
        layer: window[ln],
        title: lk.toUpperCase() + " certification map",
        collapsed: true,
        slider: true
    });
    */
    mapLayers.splice(0, 0, window[ln]);
    gs.state.certMapsLayers.push(window[ln]);
});

if (gs.insetance.capabilities.outage_mgmt) {
        tocLayerInfos.splice(2, 0, {layer: outageLayer, title: "Outages", collapsed: true, slider: true})
        window.mapLayers.splice(2, 0 , outageLayer)
    }

    if (gs.conf.weather.showPercip) {
        //this is the non https version var percipSvc = "https://epeconsulting.box.com/shared/static/4wsxyce9u00bimfkl4zur60oa6ybnoqa.kmz";
        var percipSvc = "https://epeconsulting.box.com/shared/static/6etwn7yok45v676c57ap6k1yru262qzs.kmz";
        window.percipLayer = new esri.layers.KMLLayer(percipSvc, {opacity: 0.5, visible: false});
        tocLayerInfos.push({
            layer: percipLayer,
            title: "Radar (Last Hour)",
            collapsed: false,
            slider: true
        });
        mapLayers.push(percipLayer);
    }
    if (gs.conf.weather.showWeather) {
        var weatherSvc = window.protocol+"//tmservices1.esri.com/arcgis/rest/services/LiveFeeds/NOAA_storm_reports/MapServer";
        window.weatherLayer = new esri.layers.ArcGISDynamicMapServiceLayer(weatherSvc, {opacity: 0.5, visible: false});
        tocLayerInfos.push({layer: weatherLayer, title: "Weather Watch", collapsed: false, slider: true});
        mapLayers.push(weatherLayer);
    }

    if (gs.conf.weather.showRadar) {
        var radarSvc = window.protocol+"//gis.srh.noaa.gov/ArcGIS/rest/services/Radar_warnings/MapServer";
        window.radarLayer = new esri.layers.ArcGISDynamicMapServiceLayer(radarSvc, {opacity: 0.5, visible: false});
        tocLayerInfos.push({layer: radarLayer, title: "Radar and Warnings", collapsed: true, slider: true});
        mapLayers.push(radarLayer);
    }

    window.weatherUpdateTimer = setInterval(function () {
        if (gs.conf.weather.showRadar) {
            radarLayer.refresh();
        }
        if (gs.conf.weather.showWeather) {
            weatherLayer.refresh();
        }
        if (gs.conf.weather.showPercip) {
            percipLayer.refresh();
        }
    }, 120000);


    // map.addLayers(mapLayers);
    //map.setBasemap('streets');
    if (typeof gs.conf.gmapTiltDisabled !== 'undefined' && typeof registry.byId('disableGmapTilt') !== 'undefined') {
        registry.byId('disableGmapTilt').set('checked', gs.conf.gmapTiltDisabled);
    }
    console.log("Init done")
}); // init