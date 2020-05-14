function changeVersion(v) {
    v = v || 'sde.DEFAULT';
    gs.version = v;
    assetsLayer.setGDBVersion(v);
    arrayUtils.forEach(assetsFeatureLayers, function (l) { l.setGDBVersion(v); });
}

function getVersion() {
    return gs.version;
}

function findPathTo(mem, name, parId) {
    var qr, path = [], q = {};
    do {
        q[mem.idProperty] = name;
        qr = mem.query(q);
        if (qr.length > 0) {
            path.push(name);
            name = qr[0][parId];
        } else {
            name = null;

        }

    } while (name);
    return path.reverse();
}