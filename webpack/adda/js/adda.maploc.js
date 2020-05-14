function printMapLoc(ppts) {
    console.log('Projected points:', ppts);
    var ml = ML.convertToMapLoc(ppts);
    lastMapLoc = ml;
    if (registry.byId('showMaplocTextCB').checked) {
        placeMaplocText(lastPt, ML.formatMapLocStr(ML.formatMapLoc(ml)));
    }
    if (registry.byId('printMaplocTextCB').checked) {
        addMessage('Maploc: ' + ML.formatMapLoc(ml) + ', ' + ML.formatMapLocStr(ML.formatMapLoc(ml)), 'info');
    }
}

function drawCustGrid(ppts) {
    var ml = ML.convertToMapLoc(ppts);
    if (registry.byId('drawG2CB').checked) {
        if ((registry.byId('drawG2IfZoomCB').checked && map.getScale() < 2500) || !(registry.byId('drawG2IfZoomCB').checked)) {
            drawG2(ml);
        }
    }
}


function centerToCoordinates(ppts) {
    console.log('Centering map to: ', ppts[0]);
    maplocLayer.clear();
    maplocLayer.add(new esri.Graphic(ppts[0], flagSymbol));
    if (registry.byId('showMaplocTextCB').checked) {
        placeMaplocText(ppts[0], registry.byId('gotoMapLoc').value)
    }
    ;
    map.centerAt(ppts[0]);
    controlStopWaiting('searchLoadingDiv');
}


function placeMaplocText(pt, mls) {
    var sym = new esri.symbol.TextSymbol(mls).setAlign(esri.symbol.TextSymbol.ALIGN_START).setOffset(0, -10);
    maplocLayer.add(new esri.Graphic(pt, sym));
}

function drawG2(ml) {
    var refMls = [ml, ml];
    ML.getCoordinates(refMls.map(function (ml, i) {
            ml.g2 = i ? 1 : 100;
            ml.g3 = 1;
            //console.log(formatMapLocStr(formatMapLoc(ml, 12)));
            window.rpt = ML.toCoordinates(ML.formatMapLoc(ml, 12));
            //console.log(rpt);
            return esri.geometry.Point(rpt[0], rpt[1], new esri.SpatialReference(103160));
        }), map.spatialReference.wkid, function (g2pts) {
            //console.log('Projected g2 pts: ', g2pts);
            //window.g2pts=g2pts;
            var dx = (g2pts[1].x - g2pts[0].x) / 9;
            var dy = (g2pts[1].y - g2pts[0].y) / 9;
            var G2 = new esri.geometry.Polyline(map.spatialReference);
            for (var i = -1; i <= 9; i++) {
                G2.addPath([[g2pts[0].x + i * dx, g2pts[0].y - dy], [g2pts[0].x + i * dx, g2pts[0].y + 9 * dy]]);
                G2.addPath([[g2pts[0].x - dx, g2pts[0].y + i * dy], [g2pts[0].x + 9 * dx, g2pts[0].y + i * dy]]);
            }
            maplocLayer.add(new esri.Graphic(G2, g2Symbol));
        }
    );
}

function gotoMls(mls) {
    window.rpt = ML.toCoordinates(mls);
    ML.getCoordinates(new esri.geometry.Point(rpt[0], rpt[1], new esri.SpatialReference(ML.wkid)), map.spatialReference.wkid, centerToCoordinates);
}

function gotoMlExt(mls) {
    ML.getMlExt(mls, function (r) {
        console.log("Ext: ", r);
        map.setExtent(new esri.geometry.Extent(r[0].x, r[1].y, r[1].x, r[0].y, map.spatialReference)).then(function () {
            controlStopWaiting('searchLoadingDiv');
        });
    });
}
