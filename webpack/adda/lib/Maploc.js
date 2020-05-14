define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/declare",
		"esri/tasks/QueryTask", "esri/geometry/Point", "esri/SpatialReference", "esri/tasks/ProjectParameters"
],
	function (
		kernel, lang, winUtil, declare, QueryTask, Point, SpatialReference, ProjectParameters
		) {

	    var MapLoc = dojo.declare("gs.MapLoc", null, {
	        constructor: function () {
	            this.state = 'uninitiated';
	            this.precision = 15;
	            this.normalized = true;
	            this.geometryService = esri.config.defaults.geometryService;
	            this.dm = { 'dx': 5912.4, 'dy': 4937.5, 'ddx': 2312.4, 'ddy': 2937.5 };
	            this.wkid = 2277;
	            this.hid = 18;
	            this.vid = 2;
	            var dm = this.dm;
	            var n = { 'key': { 'x': 6, 'y': 8 }, 'det': { 'x': 8, 'y': 8 } };
	            this.gspec = {
	                'n': n,
	                'det': {
	                    'tx': dm['ddx'] / (n['det']['x'] * dm['dx'] + 2 * dm['ddx']),
	                    'ty': dm['ddy'] / (n['det']['y'] * dm['dy'] + 2 * dm['ddy']),
	                    'dx': dm['dx'] / (n['det']['x'] * dm['dx'] + 2 * dm['ddx']),
	                    'dy': dm['dy'] / (n['det']['y'] * dm['dy'] + 2 * dm['ddy'])
	                },
	                'L': [[n['key']['x'], 0], [0, n['key']['y']]],
	                'Li': [[1 / n['key']['x'], 0], [0, 1 / n['key']['y']]],
	                's': 1e6
	            };
	        },

	        getCoordinateSystem: function (gridService) { //gridService+"/0"
	            this.state = 'working';
	            var qt = new QueryTask(gridService);
	            var q = new esri.tasks.Query();
	            q.returnGeometry = true;
	            q.where = "objectid in ('" + this.hid + "','" + this.vid + "')";
	            q.outFields = ["*"];
	            q.outSpatialReference = new esri.SpatialReference(this.wkid);
	            return qt.execute(q).then(lang.hitch(this, function (res) {
	                //console.log('coordinate system basis: ', res);
	                var vind = (res.features[0].attributes.objectid === this.vid) ? 0 : 1;
	                var hind = (vind === 0) ? 1 : 0;
	                var va = res.features[vind].geometry.paths[0];
	                var dv = [va[1][0] - va[0][0], va[1][1] - va[0][1]];
	                var ha = res.features[hind].geometry.paths[0];
	                var dh = [ha[1][0] - ha[0][0], ha[1][1] - ha[0][1]];

	                var t = 0.5;
	                var center = [ha[0][0] + t * dh[0], ha[0][1] + t * dh[1]];
	                var north = numeric.sub(va[0][1] > va[1][1] ? va[0] : va[1], center);
	                var east = numeric.sub(ha[0][1] > ha[1][1] ? ha[0] : ha[1], center);

	                //var gspec=mapLocGetGridSpec();
	                //Ti = [numeric.div(east, numeric.norm2(east)), numeric.div(north, numeric.norm2(north))];
	                if (numeric) {
	                    var Ti = numeric.div([east, north], this.gspec.s);
	                    var T = numeric.inv(Ti);
	                    this.state = 'ready';
	                    this.coordinateSystem = { 'T': T, 'Ti': Ti, 'center': center, 'north': north, 'east': east, 'gspec': this.gspec };
	                    this.getSubGriInfo();
	                    //console.log('Coordinate basis loaded!');
	                    return 'ready';
	                } else {
	                    this.state = 'error';
	                    console.log('Numeric.js not loaded!');
	                    return 'error';
	                }
	            }), lang.hitch(this, function (error) {
	                this.state = 'error';
	                console.log("Could not load coordinate basis: " + error);
	                return 'error';
	            }));
	        },

	        getSubGriInfo: function () {
	            var refmls = ['15-64-15-001-001', '15-64-15-012-001'];
	            this.getCoordinates(refmls.map(lang.hitch(this, function (mls) {
	            	window.rpt = this.toCoordinates(mls);
	                return Point(rpt[0], rpt[1], new SpatialReference(103160));
	            })), this.wkid, lang.hitch(this, function (pts) {
	                console.log('Subgrid info received.');
	                this.coordinateSystem.dgx = pts[1].x - pts[0].x;
	                this.coordinateSystem.dgy = pts[1].y - pts[0].y;
	            })
				);
	        },

	        getCoordinates: function (pt, targetWKID, f) {
	            //console.log('Getting coordinates for: ', pt);
	            targetWKID = targetWKID || this.wkid;
	            //f = f || printMapLoc;
	            var mpt = !(typeof pt.length === 'undefined');

	            var params = new ProjectParameters();
	            params.geometries = mpt ? pt : [pt];
	            params.outSR = new SpatialReference(targetWKID);
	            //console.log('Projection params: ', params);
	            return this.geometryService.project(params, f);
	        },

	        getXY: function (ml) {
                var dx;
                var dy;
                if (this.state === 'uninitiated') {
                    console.log('Please initiate with getCoordinateSystem().');
                    return null;
                } else if (this.state === 'error') {
                    console.log('getCoordinateSystem has resulted in error, please clear the error and try again.');
                    return null;
                } else if (this.state === 'ready') {
                    var x, y, g, gx, gy;
                    var det = this.gspec['det'], n = this.gspec['n'];
                    var det_tx = det['tx'], det_dx = det['dx'], det_ty = det['ty'], det_dy = det['dy'];

                    //x = (ml['g'] % 10 - 5.0) * n['key']['x'];
                    //y = (4.0 - Math.floor(ml['g'] / 10)) * n['key']['y'];
                    x = ((ml['g'] === 44 || ml['g'] === 57) ? -1 : 0) * n['key']['x'];
                    y = ((ml['g'] === 44 || ml['g'] === 45) ? 0 : -1) * n['key']['y'];
                    x += (ml['key'] - 1) % n['key']['x'];
                    y += n['key']['y'] - Math.floor((ml['key'] - 1) / n['key']['x']) - 1;

                    dx = ((ml['det'] - 1) % 10.0);
                    dy = 10 - Math.floor((ml['det'] - 1) / 10.0) - 1;
                    x += dx * det_dx - (det_dx - det_tx);
                    y += dy * det_dy - (det_dy - det_ty);

                    for (var i = 1; i <= 3; i++) {
                        g = 'g' + i;
                        gx = (ml[g] - 1) % 10.0;
                        gy = 10 - Math.floor((ml[g] - 1) / 10.0) - 1;
                        x += gx * det_dx / Math.pow(10, i);
                        y += gy * det_dy / Math.pow(10, i);
                    }
                    return numeric.mul([x / n['key']['x'], y / n['key']['y']], this.gspec.s);
                }
	        },

	        getMapLoc: function (pt) {
                var gx;
                var gy;
                if (this.state === 'uninitiated') {
                    console.log('Please initiate with getCoordinateSystem().');
                    return null;
                } else if (this.state === 'error') {
                    console.log('getCoordinateSystem has resulted in error, please clear the error and try again.');
                    return null;
                } else if (this.state === 'ready') {
                    var ml, x, y, kx, ky, dx, dy, g;
                    var det = this.gspec['det'], n = this.gspec['n'];
                    x = pt[0] / this.gspec.s * n['key']['x'];
                    y = pt[1] / this.gspec.s * n['key']['y'];

                    var det_tx = det['tx'], det_dx = det['dx'], det_ty = det['ty'], det_dy = det['dy'];

                    var mlg = 44;
                    if (y < 0) mlg += 13;
                    if (x >= 0) mlg += 1;

                    var kx = Math.floor(x);
                    var ky = Math.floor(y);
                    var mlk = (n['key']['y'] - (ky + n['key']['y']) % n['key']['y'] - 1) * n['key']['x'] + (kx + n['key']['x']) % n['key']['x'] + 1;
                    ml = {'g': mlg, 'key': mlk};

                    ml['det'] = 0;
                    dx = x - kx;
                    dy = y - ky;
                    if (dx < det_tx) {
                        ml['det'] += 1;
                        gx = (dx + (det_dx - det_tx)) / det_dx;
                    } else {
                        ml['det'] += Math.floor((dx - det_tx) / det_dx) + 2;
                        gx = ((dx - det_tx) / det_dx) % 1;
                    }
                    if (dy < det_ty) {
                        ml['det'] += 90;
                        gy = (det_ty - dy) / det_dy;
                    } else {
                        ml['det'] += 10 * (n['det']['y'] - Math.floor((dy - det_ty) / det_dy));
                        gy = 1 - ((dy - det_ty) / det_dy) % 1;
                    }
                    ml['det'] = Math.round(ml['det']);

                    for (var i = 1; i <= 3; i++) {
                        g = 'g' + i;
                        ml[g] = 0.0;
                        ml[g] += Math.floor((gx % Math.pow(10, -(i - 1)) * Math.pow(10, i))) + 1;
                        ml[g] += 10 * Math.floor((gy % Math.pow(10, -(i - 1)) * Math.pow(10, i)));
                        ml[g] = Math.floor(ml[g]);
                    }
                    return ml;
                }
	        },

	        convertToMapLoc: function (ppts) {
	            //if (ppts[0].SpatialReference.wkid != this.wkid) {
	            //    console.log("Basis and point have different spatial references.");
	            //}
	            var pt = [ppts[0].x, ppts[0].y];
	            var ml = this.getMapLoc(numeric.dot(numeric.sub(pt, this.coordinateSystem.center), this.coordinateSystem.T));
	            lastMapLoc = ml;
	            //console.log('Projected point:', pt, formatMapLocStr(formatMapLoc(ml)));
	            return ml;
	        },

	        toCoordinates: function (mls) {
	            var ml = (typeof mls === 'string') ? this.toMapLoc(mls) : mls;
	            return numeric.add(numeric.dot(this.getXY(ml), this.coordinateSystem.Ti), this.coordinateSystem.center);
	        },

	        addDashes: function (a, l) {
                var aa = [];
	            for (var i = 0; i < a.length; i += l) aa.push(a.slice(i, i + l));
	            return aa.join('-');
	        },

	        formatMapLocStr: function (mls) {
	            return this.addDashes(mls.slice(0, 6), 2) + ((mls.length>2)?'-':'') + this.addDashes(mls.slice(6), 3);
	        },

	        formatMapLoc: function (ml, l, normalized) {
	            l = l || this.precision;
	            normalized = this.normalized || true;
	            if(normalized && l<12) console.log('Warning: Normalized Maploc precision too low.');
	            if (ml['g'] === 44 && !normalized) {
	                return ('0' + ml['key']).substr(-2) + ('0' + ml['det']).substr(-2) + ('0' + ml['g1']).substr(-2) + ('00' + ml['g2']).substr(-3) +
			           ((l === 12) ? ('00' + ml['g3']).substr(-3) : '');
	            } else {
	                return ('0' + ml['g']).substr(-2) + ('0' + ml['key']).substr(-2) + ('0' + ml['det']).substr(-2) + ('00' + ml['g1']).substr(-3) +
			           ((l >= 12) ? ('00' + ml['g2']).substr(-3) : '') + ((l >= 15) ? ('00' + ml['g3']).substr(-3) : '');
	            }
	        },

	        toMapLoc: function (mls) {
	            if (mls.indexOf('-') < 0) { mls = this.formatMapLocStr(mls); }
	            var mla = mls.split('-');
	            if (mla.length === 6 && ([44, 45, 57, 58].indexOf(parseInt(mla[0])) >= 0)) {
	                return {
	                    'g': parseInt(mla[0]), 'key': parseInt(mla[1]), 'det': (parseInt(mla[2]) ? parseInt(mla[2]) : 100),
	                    'g1': (parseInt(mla[3]) ? parseInt(mla[3]) : 100), 'g2': parseInt(mla[4]), 'g3': parseInt(mla[5])
	                };
	            } else if (mla.length === 5) {
	                if ([44, 45, 57, 58].indexOf(parseInt(mla[0])) >= 0) {
	                    return {
	                        'g': parseInt(mla[0]), 'key': parseInt(mla[1]), 'det': (parseInt(mla[2]) ? parseInt(mla[2]) : 100),
	                        'g1': (parseInt(mla[3]) ? parseInt(mla[3]) : 100), 'g2': parseInt(mla[4]), 'g3': 1
	                    };
	                } else {
	                    return {
	                        'g': 44, 'key': parseInt(mla[0]), 'det': (parseInt(mla[1]) ? parseInt(mla[1]) : 100),
	                        'g1': (parseInt(mla[2]) ? parseInt(mla[2]) : 100), 'g2': parseInt(mla[3]), 'g3': parseInt(mla[4])
	                    };
	                }
	            } else if (mla.length === 4) {
	                if ([44, 45, 57, 58].indexOf(parseInt(mla[0])) >= 0) {
	                    return {
	                        'g': parseInt(mla[0]), 'key': parseInt(mla[1]), 'det': (parseInt(mla[2]) ? parseInt(mla[2]) : 100),
	                        'g1': (parseInt(mla[3]) ? parseInt(mla[3]) : 100), 'g2': 1, 'g3': 1
	                    };
	                } else {
	                    return {
	                        'g': 44, 'key': parseInt(mla[0]), 'det': (parseInt(mla[1]) ? parseInt(mla[1]) : 100),
	                        'g1': (parseInt(mla[2]) ? parseInt(mla[2]) : 100), 'g2': parseInt(mla[3]), 'g3': 1
	                    };
	                }
	            } else if (mla.length === 3) {
	                if ([44, 45, 57, 58].indexOf(parseInt(mla[0])) >= 0) {
	                    return {
	                        'g': parseInt(mla[0]), 'key': parseInt(mla[1]), 'det': (parseInt(mla[2]) ? parseInt(mla[2]) : 100),
	                        'g1': 1, 'g2': 1, 'g3': 1
	                    };
	                } else {
	                    return {
	                        'g': 44, 'key': parseInt(mla[0]), 'det': (parseInt(mla[1]) ? parseInt(mla[1]) : 100),
	                        'g1': (parseInt(mla[2]) ? parseInt(mla[2]) : 100), 'g2': 1, 'g3': 1
	                    };
	                }
	            } else if (mla.length === 2) {
	                if ([44, 45, 57, 58].indexOf(parseInt(mla[0])) >= 0) {
	                    return {
	                        'g': parseInt(mla[0]), 'key': parseInt(mla[1]), 'det': 1,
	                        'g1': 1, 'g2': 1, 'g3': 1
	                    };
	                } else {
	                    return {
	                        'g': 44, 'key': parseInt(mla[0]), 'det': (parseInt(mla[1]) ? parseInt(mla[1]) : 100),
	                        'g1': 1, 'g2': 1, 'g3': 1
	                    };
	                }
	            } else if (mla.length === 1) {
	                if ([44, 45, 57, 58].indexOf(parseInt(mla[0])) >= 0) {
	                    return {
	                        'g': parseInt(mla[0]), 'key': 1, 'det': 1,
	                        'g1': 1, 'g2': 1, 'g3': 1
	                    };
	                } else {
	                    return {
	                        'g': 44, 'key': parseInt(mla[0]), 'det': 1,
	                        'g1': 1, 'g2': 1, 'g3': 1
	                    };
	                }
	            } else {
	                console.error("Invalid Maploc string.");
	                return { 'g': 1, 'key': 1, 'det': 1, 'g1': 1, 'g2': 1, 'g3': 1 };
	            }
	        },

	        validMaploc: function (val) {
	            return (val.search(/^\d{2}(-{0,1})\d{2}\1\d{2}\1[0-1]\d{2}$|^\d{2}(-{0,1})\d{2}\2\d{2}\2[0-1]\d{2}\2[0-1]\d{2}$|^\d{2}(-{0,1})\d{2}\3\d{2}\3[0-1]\d{2}\3[0-1]\d{2}\3[0-1]\d{2}$/) >= 0);
	        },

	        validMaplocExt: function (val) {
	            return (val.search(/^\d{2}$|^\d{2}(-{0,1})\d{2}$|^\d{2}(-{0,1})\d{2}\1\d{2}$|^\d{2}(-{0,1})\d{2}\1\d{2}\1[0-1]\d{2}$|^\d{2}(-{0,1})\d{2}\2\d{2}\2[0-1]\d{2}\2[0-1]\d{2}$|^\d{2}(-{0,1})\d{2}\3\d{2}\3[0-1]\d{2}\3[0-1]\d{2}\3[0-1]\d{2}$/) >= 0);
	        },

	        getMlExt: function(mls, func){
	            if (mls.indexOf('-') < 0) { mls = this.formatMapLocStr(mls); }
	            var mla= mls.split('-');
	            var len = mla.length;
	            if(['44', '45', '57', '58'].indexOf(mla[0]) <0) len+=1;
	            var ml1= this.toMapLoc(mls);
	            var ml2= this.toMapLoc(mls);
	            if (len === 1) { ml2['key'] = 48; }
	            if (len === 2) { ml2['det'] = 100; }
	            if (len === 3) { ml2['g1'] = 100; }
	            if (len === 4) { ml2['g2'] = 100; }
	            if (len === 5) { ml2['g3'] = 100; }
	            console.log("ML Ext: ", ml1, ml2);
	            var pt1 = this.toCoordinates(ml1);
	            var pt2 = this.toCoordinates(ml2);
	            this.getCoordinates([Point(pt1[0], pt1[1], new esri.SpatialReference(this.wkid)),
                                     Point(pt2[0], pt2[1], new esri.SpatialReference(this.wkid))],
                                    map.spatialReference.wkid, func);
	        },

	        postCreate: function () {
	            this.inherited(arguments);
	            console.log('MapLocHelper post create...');
	            //this.getCoordinateSystem();
	        },

	    });

	    //MapLocHelper= MapLocHelper;
	    return MapLoc;
	});