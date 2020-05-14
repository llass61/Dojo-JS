function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function L2X(l) {
    return l * (2 * Math.PI * sys_freq);
}

function X2L(x) {
    return x / (2 * Math.PI * sys_freq);
}

if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
}

function phaseToStatus(ph) {
    return (ph ? ((ph.indexOf('A') < 0 ? '0' : '1') + (ph.indexOf('B') < 0 ? '0' : '1') + (ph.indexOf('C') < 0 ? '0' : '1')) : '000');
}

function unique(/* Array */ arr) {
    //var test = {};
    //return dojo.filter(arr, function (val) { return test[val] ? false : (test[val] = true); });
    return Array.from(new Set(arr));
}

function merge(arrs) {
    return [].concat.apply([], arrs);
}

function toStr(n, p, c) {
    p = p || 1e-2;
    c = c || false;
    var zero_th = 1e-5;

    if (typeof n === 'undefined' || n === null) {
        return null;
    } else var ind;
    if (typeof n === 'string') {
        return n;
    } else {
        if (Math.abs(n) < zero_th) {
            n = 0;
        }
        //outStr = (Math.floor(n / p) * p).toFixed(-Math.floor(Math.log10(p)));
        var precision = -Math.log10(p);
        var outStr = (+(Math.round(+(n + 'e' + precision)) + 'e' + -precision)).toFixed(precision)
        if (c) {
            ind = outStr.indexOf('.');
            var pos = ((ind === -1) ? outStr.length : ind) - 4;
            var leftoff = n < 0 ? 1 : 0;
            while (pos >= leftoff) {
                outStr = outStr.substr(0, pos + 1) + ',' + outStr.substr(pos + 1);
                pos -= 3;
            }
            if (ind !== -1) {
                ind = outStr.indexOf('.');
                pos = ind + 3;
                while (pos < outStr.length - 1) {
                    outStr = outStr.substr(0, pos + 1) + ',' + outStr.substr(pos + 1);
                    pos += 4;
                }
            }
        }
        return outStr;
    }
}

function validMeterNumber(val, con) {
    if (val.length === 12 || val.length === 9) {
        return true;
    } else {
        return false;
    }
}

function getMapLayerUrl(layerName){
    layerName= layerName||null;
    return window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + gs.mapInstance + "/MapServer/" + (layerName?gs.layInds[layerName]:'');
}
function getFeatureLayerUrl(layerName){
    layerName= layerName||null;
    return window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + gs.mapInstance + "/FeatureServer/" + (layerName?gs.layInds[layerName]:'');
}
function getGpUrl(svc, tool){
    return window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + svc + "/GPServer/" + tool;
}
function getGpUploadUrl(svc){
    return window.protocol+"//" + gs.gisServer + "/arcgis/rest/services/" + svc + "/GPServer/uploads/upload";
}


function buildModelLayerMapping() {
    var li= gs.layInds;
    var t2l = Object();
    Object.keys(li).filter(function (l) {
        return l.search(/model_.*/) === 0;
    }).forEach(function (l) {
        t2l[l.replace(/model_/, '')] = [li[l]];
    });

    var l2p = Object();
    Object.keys(t2l).forEach(function (e) {
        return l2p[t2l[e]] = 'equipref';
    });
    l2p[t2l['conductor']] = l2p[t2l['construction']] = l2p[t2l['ug']] = 'id';

    t2l['largeconsumer'] = t2l['smallconsumer'] = t2l['residential'] = t2l['loads'];
    t2l['capacitor'] = t2l['cap'];
    t2l['breaker'] = t2l['fuse'] = t2l['recloser'] = t2l['sectionalizer'] = t2l['protection']
    t2l['oh'] = [].concat(t2l['conductor']).concat(t2l['construction']);
    t2l['ug'] = [].concat(t2l['ug']).concat(t2l['conductor']).concat(t2l['construction']);

    window.l2p = l2p;
    window.t2l = t2l;

    var layerKeys = Object();
    Object.keys(li).filter(function (l) {
        return l.search(/model_.*/) === 0;
    }).forEach(function (l) {
        layerKeys[l] = 'equipref';
    });
    ['conductor', 'ug', 'construction'].forEach(function (l) {
        layerKeys['model_' + l] = 'id';
    });
    layerKeys[gs.conf.pfResLayer] = 'secname';

    attExp = {
        'oh': [
            {'attr': 'conductor', 'layer': 'model_conductor', 'lkey': layerKeys['model_conductor']},
            {'attr': 'neutral', 'layer': 'model_conductor', 'lkey': layerKeys['model_conductor']},
            {'attr': 'construction', 'layer': 'model_construction', 'lkey': layerKeys['model_construction']},
            {
                'attr': 'secname',
                'layer': gs.conf.pfResLayer,
                'lkey': layerKeys[gs.conf.pfResLayer],
                'ext_name': gs.conf.pfResField
            },
        ],
        'ug': [
            {'attr': 'conductor', 'layer': 'model_ug', 'lkey': layerKeys['model_ug']},
            {'attr': 'construction', 'layer': 'model_construction', 'lkey': layerKeys['model_construction']},
            {
                'attr': 'secname',
                'layer': gs.conf.pfResLayer,
                'lkey': layerKeys[gs.conf.pfResLayer],
                'ext_name': gs.conf.pfResField
            },
        ],
        'wire': [
            {'attr': 'equipref', 'layer': 'model_wire', 'lkey': layerKeys['model_wire']},
            {
                'attr': 'secname',
                'layer': gs.conf.pfResLayer,
                'lkey': layerKeys[gs.conf.pfResLayer],
                'ext_name': gs.conf.pfResField
            },
        ],
        'capacitor': [
            {'attr': 'equipref', 'layer': 'model_cap', 'lkey': layerKeys['model_cap']},
            {
                'attr': 'parentsec',
                'layer': gs.conf.pfResLayer,
                'lkey': layerKeys[gs.conf.pfResLayer],
                'ext_name': gs.conf.pfResField
            },
        ],
        'motor': [
            {'attr': 'equipref', 'layer': 'model_motor', 'lkey': layerKeys['model_motor']},
            {
                'attr': 'parentsec',
                'layer': gs.conf.pfResLayer,
                'lkey': layerKeys[gs.conf.pfResLayer],
                'ext_name': gs.conf.pfResField
            },
        ],
        'load': [
            {'attr': 'equipref', 'layer': 'model_loads', 'lkey': layerKeys['model_loads']},
            {
                'attr': 'parentsec',
                'layer': gs.conf.pfResLayer,
                'lkey': layerKeys[gs.conf.pfResLayer],
                'ext_name': gs.conf.pfResField
            },
        ],
        'generator': [
            {'attr': 'equipref', 'layer': 'model_generator', 'lkey': layerKeys['model_generator']},
            {
                'attr': 'parentsec',
                'layer': gs.conf.pfResLayer,
                'lkey': layerKeys[gs.conf.pfResLayer],
                'ext_name': gs.conf.pfResField
            },
        ],
    };
    ['transformer', 'regulator', 'source', 'protection'].forEach(function (l) { //'switch'
        attExp[l] = [
            {'attr': 'equipref', 'layer': 'model_' + l, 'lkey': layerKeys['model_' + l]},
            {
                'attr': 'secname',
                'layer': gs.conf.pfResLayer,
                'lkey': layerKeys[gs.conf.pfResLayer],
                'ext_name': gs.conf.pfResField
            },
        ];
    });
    attExp['breaker'] = attExp['fuse'] = attExp['recloser'] = attExp['sectionalizer'] = attExp['protection']
    attExp['largeconsumer'] = attExp['smallconsumer'] = attExp['residential'] = attExp['load'];

    gs.attExp = attExp;
    window.attExp = attExp;
    gs.layerKeys = layerKeys;
    window.layerKeys = layerKeys;
}

function type2Name(t) {
    var t2n = {
        "residential": "Residential",
        "smallconsumer": "Small Consumer",
        "largeconsumer": "Large Consumer",
        "load": "Load",
        "source": "Bay",
        "transformer": "Transformer",
        "capacitor": "Capacitor",
        "regulator": "Regulator",
        "switch": "Switch",
        "protection": "Protection",
        "wire": "Conductor",
        "oh": "Overhead Conductor",
        "ug": "Underground Conductor",
        "breaker": "Breaker",
        "fuse": "Fuse",
        "recloser": "Recloser",
        "sectionalizer": "Sectionalizer",
        "pole": "Pole",
        "motor": "Motor",
        "generator": "Generator",
    }
    return t2n[t];
}

function maxNz(array) {
    return Math.max.apply(Math, array.map(function (f) {
        return (f !== 0) ? f : Number.NEGATIVE_INFINITY;
    }))
};

function minNz(array) {
    return Math.min.apply(Math, array.map(function (f) {
        return (f !== 0) ? f : Number.POSITIVE_INFINITY;
    }))
};

function maxNzAttr(array, attr) {
    return Math.max.apply(Math, array.map(function (f) {
        return (f[attr] !== 0) ? f[attr] : Number.NEGATIVE_INFINITY;
    }))
};

function minNzAttr(array, attr) {
    return Math.min.apply(Math, array.map(function (f) {
        return (f[attr] !== 0) ? f[attr] : Number.POSITIVE_INFINITY;
    }))
};

function convLen(len, f, t) {
    var crt = {'ft': {}, 'm': {}, 'ml': {}}
    crt['m']['ft'] = 3.28084;
    crt['m']['ml'] = 0.000621371;
    crt['ft']['ml'] = 0.000189394;
    crt['ft']['m'] = 1 / crt['m']['f'];
    crt['ml']['m'] = 1 / crt['m']['ml'];
    crt['ml']['ft'] = 1 / crt['ft']['ml'];

    if (typeof crt[f][t] !== 'undefined') return crt[f][t] * len;
    else return 0;
}

function totalLength(features) {
    return features && features.length && esri.geometry.geodesicLengths(features.map(function (f) {
        return f && f.geometry && esri.geometry.webMercatorToGeographic(f.geometry);
    }).filter(function(f){return f?true:false;}), esri.Units.MILES).reduce(function (p, c) {
        return p + c;
    }, 0);
}

function cAbs(x, y) {
    var xx = x, yy = y;
    if (typeof x === 'undefined' || x === null) return null;
    if (x !== null && x.constructor === Array) {
        xx = x[0];
        yy = x[1];
    } else {
        if (typeof y === 'undefined' || y === null) return null;
    }
    return (Math.sqrt(Math.pow(xx, 2) + Math.pow(yy, 2)));
}

function ccMult(a, b) { // calculates a*b^* (a multiplied by b conjugate)
    if (a === null || b === null || a.constructor !== Array || b.constructor !== Array || a.length !== 2 || b.length !== 2) return null;
    else return [a[0] * b[0] + a[1] * b[1], a[1] * b[0] - a[0] * b[1]];
};

/* unique finder class */
var UniqueFinder = function (featureLayer, fieldName) {
    this.featureLayer = featureLayer;
    this.fieldName = fieldName;
    this.finder = null;
    this.attempts = 0;
}

UniqueFinder.prototype.find = function (initialVal) {
    initialVal = initialVal || '';
    this.finder = new dojo.Deferred(function (reason) {
    });
    this.currentVal = initialVal;
    this.procRes([this, 1]);
    return this.finder;
}

UniqueFinder.prototype.procRes = function (count) {
    if (count === 0) {
        this.finder.resolve(this.currentVal);
    } else {
        this.currentVal += (Math.round(Math.random() * 10) % 10);
        this.attempts += 1;
        console.log('New current val: ', this.currentVal, ' attempts: ', this.attempts);
        var q = new esri.tasks.Query();
        q.where = this.fieldName + "='" + this.currentVal + "'";
        this.featureLayer.queryCount(q).then(lang.hitch(this, this.procRes));
    }
}


/* complex calc */
function cm(a, b) {
    return [a[0] * b[0] - a[1] * b[1], -a[0] * b[1] + a[1] * b[0]];
}

function cc(a) {
    return [a[0], -a[1]];
}

function ca(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function cs(a, s) {
    return [s * a[0], s * a[1]];
}

/* Math helpers*/
function nz(a) {
    return Math.sign(a.va) + Math.sign(a.vb) + Math.sign(a.vc);
}

function sum(a) {
    return a.va + a.vb + a.vc;
}

function sorter(a, b) {
    return (sum(a) / nz(a) > sum(b) / nz(b)) ? 1 : -1;
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}