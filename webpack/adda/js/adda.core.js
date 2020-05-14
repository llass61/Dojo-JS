function ReloadStoreWithFeatureSet(fs, store) {
    if (fs && store) {
        store.setData(fs.features.map(function (f) {
            return f.attributes;
        }));
    }
}

function convertTimeStamps(fs, tsa) {
    if (fs) {
        fs.features.forEach(function (f) {
            f.attributes[tsa] = formatDate(new Date(f.attributes[tsa]), 'M/d/y');
        });
    }
}

function controlStartWaiting(wd) {
    domStyle.set(dojo.byId(wd), 'display', 'inline');
}

function controlStopWaiting(wd) {
    domStyle.set(dojo.byId(wd), 'display', 'none');
}

function translateSBselection(e) {
    return arrayUtils.map(e.selectedOptions, function (v) {
        return v.value;
    }).join('|');
}

function showAuditInfo(f){
    f= f || lastSelFeat;
    var fmt= "EEEE, M/d/yyyy  h:m:s a";
    if(f && f.attributes){
        var a= f.attributes;
        var h = new dijit.Dialog({
            title: "History",
            content: "UUID: <strong>"+(a['guid']?a['guid']:'N/A')+"</strong><br>"
            +"User: <strong>"+a['gi_user']+"</strong><br>"
            +"Last update: <strong>"+formatDate(new Date(a['update_ts']), fmt)+"</strong><br>"
            +"Created at: <strong>"+formatDate(new Date(a['creation_ts']), fmt)+"</strong><br>"
            ,
            style: "width: 400px; z-index:"+top_z_index+"px;"
        });
        var d = h.show();
        downAllWindows(bottom_z_index);
        setTimeout(function() {
            h.domNode.style.zIndex = top_z_index;
        }, 0);
        require(["dojo/touch"], function(touch){
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
    }
}

function toggleCertMapLayersVisibility(){
    gs.state.certMapsLayers && gs.state.certMapsLayers.forEach(function(l){
        l.setVisibility(!l.visible);
    }) 
}

function focusSubBaySelection() {
    console.log('re focus fired.');
    if (dynamicLayer.graphics.length !== gCount && dynamicLayer.graphics.length > 0) {
        var newExt = esri.graphicsExtent(dynamicLayer.graphics);
        var dx = newExt.xmax - newExt.xmin;
        var dy = newExt.ymax - newExt.ymin;
        newExt.xmin -= dx / 2;
        newExt.xmax += dx / 2;
        newExt.ymin -= dy / 2;
        newExt.ymax += dy / 2;
        map.setExtent(newExt);
        var oldDefExpr = dynamicLayer.getDefinitionExpression();
        var gCount = dynamicLayer.graphics.length;
        var refocusCount = 0;
        if (focusTimer) clearTimeout(focusTimer);
    } else {
        refocusCount += 1;
        if (refocusCount > refocusLimit) {
            console.log('Refocus count expired!');
            refocusCount = 0;
        } else {
            focusTimer = setTimeout(focusSubBaySelection, 1000);
        }
    }
}

function getStudyProperty(cs, p) {
    var csf= cs && gs.state.caseStudies && gs.state.caseStudies.features && gs.state.caseStudies.features.filter(function(f){return f.attributes['name'] === cs});
    return csf && csf.length && csf[0].attributes && csf[0].attributes[p];
}

function getIntStudyProperty(cs, p) {
    var icsf= cs && gs.state.intCaseStudies && gs.state.intCaseStudies.features && 
              gs.state.intCaseStudies.features.filter(function(f){return f.attributes['name'] === cs});
    return icsf && icsf.length && icsf[0].attributes && icsf[0].attributes[p];
}

function calcQuant(f, ph, a) {
    f= f || null;
    ph= ph || null;
    //if (typeof f === 'undefined' || f === null || typeof ph === 'undefined' || ph === null) return null;
    if(f && ph && a && f.attributes &&f.attributes['phasecode'] && f.attributes[gs.conf.pfResField]){
        //var attr = typeof f.attributes[gs.conf.pfResField] !== 'undefined' ? f.attributes[gs.conf.pfResField] : null;
        var attr = f.attributes[gs.conf.pfResField];
        var phs = f.attributes['phasecode'].toLowerCase();
        ph = ph.toLowerCase();
        if (ph === 't') {
            var tq = null;
            phs.split('').forEach(function (p) {
                var qu = calcQuant(f, p, a);
                if (qu !== null) {
                    tq = (tq === null ? qu : tq + qu);
                }
            });
            return tq;
        } else if (ph === 'm') {
            var mq = calcQuant(f, 't', a);
            return (mq !== null) ? mq / phs.length : null;
        } else if (attr && (phs.indexOf(ph) >= 0 || ph === '' || ph === 'l')) {
            var valV = (attr["vr_" + ph] !== null && attr["vi_" + ph] !== null);
            var valC = (attr["cr_" + ph] !== null && attr["ci_" + ph] !== null);
            var valL = (attr["lr_" + ph] !== null && attr["li_" + ph] !== null);
            if (a === 'v') {
                return valV ? cAbs(attr["vr_" + ph], attr["vi_" + ph]) : null;
            } else if (a === 'vc') {
                return valV ? [attr["vr_" + ph], attr["vi_" + ph]] : null;
            } else if (a === 'c') {
                return valC ? cAbs(attr["cr_" + ph], attr["ci_" + ph]) : null;
            } else if (a === 'cc') {
                return valC ? [attr["cr_" + ph], attr["ci_" + ph]] : null;
            } else if (a === 'l') {
                return valL ? attr["lr_" + ph] : null;
            } else if (a === 'lc') {
                return valL ? [attr["lr_" + ph], attr["li_" + ph]] : null;
            } else if (a === 'fc1' || a === 'fc3' || a === 'fc2' || a === 'fclll' || a === 'fcll' || a === 'fir' || a === 'fii') {
                return (attr[a + "_" + ph] !== null) ? attr[a + "_" + ph] : null;
            } else if (a === 'p' || a === 'q' || a === 'pf' || a === 's' || a === 'sc') {
                var p = null, q = null;
                if (valV && valC) {
                    var s = ccMult(calcQuant(f, ph, 'vc'), calcQuant(f, ph, 'cc'));
                    //var p = ((attr["vr_" + ph] * attr["cr_" + ph] + attr["vi_" + ph] * attr["ci_" + ph]));
                    //var q = ((attr["vi_" + ph] * attr["cr_" + ph] - attr["vr_" + ph] * attr["ci_" + ph]));
                } else {
                    return null;
                }
                if (a === 'sc') {
                    return s;
                }
                else if (a === 's') {
                    return s ? cAbs(s) : null;
                }
                else if (a === 'p') {
                    return s ? s[0] : null;
                }
                else if (a === 'q') {
                    return s ? s[1] : null;
                }
                else if (a === 'pf') {
                    return s ? (cAbs(s) ? ((s[0] / cAbs(s)) * (s[1] < 0 ? -1 : 1)) : 1) : null;
                }
                else if (a === 'pfs') {
                    return s ? (s[1] < 0 ? '-' : '+') : null;
                }
                else {
                    return null;
                }
            } else if (a === 'fi0r' || a === 'fi0i' || a === 'fi1r' || a === 'fi1i' || a === 'z0r' || a === 'z0i' || a === 'z1r' || a === 'z1i') {
                return (attr[a] !== null) ? attr[a] : null;
            } else if (a === 'fi0' || a === 'fi1' || a === 'z0' || a === 'z1') { // complex impedances
                var qr = calcQuant(f, '', a + 'r');
                var qi = calcQuant(f, '', a + 'i');
                return (qr !== null || qi !== null) ? [qr, qi] : null;
            } else if (a === 'nom_v' || a === 'c_rating') {
                return (attr[a] !== null) ? attr[a] : 1;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }else{
        return null;
    }
}

function formatVoltage(p, v, vt, base_v, th_v) {
    return '<span style="color:' + ((v === null || (1 + vt < v) || (1 - vt > v)) ? 'red' : 'green') + ';">' +
        (p ? p.toUpperCase() + ': ' : '') + (v === null ? 'N/A' : (toStr(v * base_v, 0.01) + ' (' + toStr(th_v- base_v * v, 0.01) + ')')) + '</span>';
}

function infoWindowLoad(f, ttl, scale, sep) {
    var attr = f.attributes;
    var pfr = attr[gs.conf.pfResField] || null;
    var ld = attr['equipref' + gs.conf.eqPfx] || null;
    var phase = (attr["phasecode"]||'').toLowerCase();
    return attr ? '<tr class="loadInfo"><td class="infoPaneLabelCell">'+ ttl +'</td><td>' + phase.split('').map(function (p) {
        return '<span>'+(phase.length>1?(p.toUpperCase()+' : '):'')+toStr(ld['kw_'+p] * scale) +'</span>';
    }).join(sep + ' ') + '</td></tr>' : '';
}


function infoWindowVoltage(f, base_v, vt, sep, th_v) {
    th_v= th_v || base_v;
    var attr = f.attributes[gs.conf.pfResField] || null;
    var phase = (f.attributes["phasecode"]) ? f.attributes["phasecode"].toLowerCase() : '';
    return attr ? '<tr class="voltageInfo voltageUnbalanced"><td class="infoPaneLabelCell">V-drop (' + toStr(base_v, 1) + 'V base)</td><td>' + phase.split('').map(function (p) {
        var vo = calcQuant(f, p, 'v'), vn = calcQuant(f, p, 'nom_v');
        var v = ((vo !== null && vn) ? vo / vn : null);
        //puvdp = (cAbs(attr["vr_" + p], attr["vi_" + p]) / attr["nom_v"] - 1) * 100;
        return formatVoltage(p, v, vt, base_v, th_v);
    }).join(sep + ' ') + '</td></tr>' : '';
}

function infoWindowVoltageBal(f, base_v, vt, sep, th_v) {
    th_v= th_v || base_v;
    var attr = typeof f.attributes[gs.conf.pfResField] !== 'undefined' ? f.attributes[gs.conf.pfResField] : null;
    var vo = calcQuant(f, 'l', 'v'), vn = calcQuant(f, 'l', 'nom_v');
    var v = ((vo !== null && vn) ? vo / vn : null);
    return attr ? '<tr class="voltageInfo voltageBalanced"><td class="infoPaneLabelCell">V-drop (balanced)</td><td>' + formatVoltage(null, v, vt, base_v, th_v) + '</td></tr>' : '';
}


function formatFc(fct) {
    var f = fct[0], key = fct[1], phase = fct[2], ttl = fct[3], sep = fct[4];
    var fcs = phase.split('').map(function (p) {
        return calcQuant(f, p, key);
    });
    if (fcs.filter(function (e) {
            return e !== null;
        }).length > 0) {
        return '<tr class="faultCurrentsInfo faultCurrentRow"><td class="infoPaneLabelCell">' + ttl + '</td><td>' + phase.split('').map(function (p) {
            return '<span>' + p.toUpperCase() + ':' + toStr(calcQuant(f, p, key), 0.1, true) + '</span>';
        }).join(sep + ' ') + '</td></tr>'
    }
}

function infoWindowFaultInfo(f, sep) {
    var curs = '', imps = '';
    var res = '<tr class="faultCurrentsInfo faultCurrentHeader"><td class="infoPaneLabelCell">Fault Cur. [A]</td><td></td></tr>';
    var attr = typeof f.attributes[gs.conf.pfResField] !== 'undefined' ? f.attributes[gs.conf.pfResField] : null;
    var phase = (f.attributes["phasecode"]) ? f.attributes["phasecode"].toLowerCase() : '';
    if (attr) {
        var lgFaultCurrents = phase.split('').map(function (p) {
            return calcQuant(f, p, 'fc1');
        });
        var llgFaultCurrents = phase.split('').map(function (p) {
            return calcQuant(f, p, 'fc2');
        });
        var llFaultCurrents = phase.split('').map(function (p) {
            return calcQuant(f, p, 'fcll');
        });
        var lllFaultCurrents = phase.split('').map(function (p) {
            return calcQuant(f, p, 'fclll');
        });
        var tpCurrents = phase.split('').map(function (p) {
            return calcQuant(f, p, 'fc3');
        });
        var faultSq = '01'.split('').map(function (x) {
            return calcQuant(f, '', 'fi' + x);
        });
        curs = [[f, 'fc1', phase, 'L-G ', sep],
            [f, 'fc3', phase, '3PH', sep],
            [f, 'fc2', phase, 'LLG', sep],
            [f, 'fcll', phase, 'LL', sep],
            [f, 'fclll', phase, 'LLL', sep],
        ].map(formatFc).join('');

        if (faultSq.filter(function (e) {
                return e !== null;
            }).length > 0) {
            imps = '<tr class="faultSeqInfo"><td class="infoPaneLabelCell">Fault Seq. Imp. [&Omega;]</td><td>' + '01'.split('').map(function (p) {
                return '<span>R' + p + ', X' + p + ': ' + toStr(calcQuant(f, '', 'fi' + p + 'r'), 0.001, true) +
                    ', ' + toStr(calcQuant(f, '', 'fi' + p + 'i'), 0.001, true) + '</span>';
            }).join('<br>') + '</td></tr>';
        }
    }
    return (curs !== '' || imps !== '') ? res + curs + imps : '';
}

function formatLoading(p, q, c, threshold, att) {
    return '<span style="color:' + ((q === null || threshold < c) ? 'red' : 'green') + ';">' + (p ? p.toUpperCase() + ': ' : '') + (q === null ? 'NA' : (toStr(100 * c, 0.01) + (att === 'c' ? ' / ' + toStr(q, 0.01) : ''))) + '</span>';
}

function infoWindowLoading(f, att, capAttr, scale, threshold, sep, msg) {
    var attr = f.attributes;
    var eqKey = ['oh', 'ug', 'wire'].indexOf(attr['otype']) >= 0 ? 'conductor' : 'equipref';
    var pfr = typeof attr[gs.conf.pfResField] !== 'undefined' ? attr[gs.conf.pfResField] : null;
    var eq = typeof attr[eqKey + gs.conf.eqPfx] !== 'undefined' ? attr[eqKey + gs.conf.eqPfx] : null;
    var phase = (f.attributes["phasecode"]) ? f.attributes["phasecode"].toLowerCase() : '';
    sep = sep || ', ';
    msg = msg || 'Loading<br>[%/A]';
    return (pfr && eq) ? '<tr class="loadingInfo loadingUnbalanced"><td>' + msg + '</td><td>' + phase.split('').map(function (p) {
        var q = calcQuant(f, p, att);
        var c = q / (eq[capAttr] * scale);
        return formatLoading(p, q, c, threshold, att);
    }).join(sep + ' ') + '</td></tr>' : '';
}

function infoWindowLoadingBalanced(f, att, capAttr, scale, threshold, sep, msg) {
    var attr = f.attributes;
    var eqKey = ['oh', 'ug', 'wire'].indexOf(attr['otype']) >= 0 ? 'conductor' : 'equipref';
    var pfr = typeof attr[gs.conf.pfResField] !== 'undefined' ? attr[gs.conf.pfResField] : null;
    var eq = typeof attr[eqKey + gs.conf.eqPfx] !== 'undefined' ? attr[eqKey + gs.conf.eqPfx] : null;
    var phase = (f.attributes["phasecode"]) ? f.attributes["phasecode"].toLowerCase() : '';
    sep = sep || ', ';
    msg = msg || '(Balanced) Loading<br>[%/A]';
    var q = calcQuant(f, 'l', att);
    var c = q / (eq[capAttr] * scale);
    return (pfr && eq) ? '<tr class="loadingInfo loadingBalanced"><td>' + msg + '</td><td>' + formatLoading(null, q, c, threshold, att) + '</td></tr>' : '';
}

function formatComplex(p, q, pc) {
    var pc = pc || 0.01;
    return toStr(p, pc, true) + ((q > 0) ? '+j' : '-j') + toStr(Math.abs(q), pc, true);
}

function formatPower(s, scale) {
    return s === null ? 'NA' : formatComplex(s[0] / scale, s[1] / scale);
}

function formatPowerFactor(pf) {
    return pf === null ? 'NA' : (((pf < 0) ? '(' : '') + toStr(Math.abs(pf), 0.01, true) + ((pf < 0) ? ')' : ''));
}

function infoWindowPowerLoading(f, sep) {
    var phase = (f.attributes["phasecode"]) ? f.attributes["phasecode"].toLowerCase() : '';
    sep = sep || ', ';

    var vals = '', valspf = '', valsls = '';
    var vals = [], valspf = [], valsls = [];
    //var tp = 0, tq = 0;
    phase.split('').forEach(function (ph, i) {
        var PH = ph.toUpperCase(), s = calcQuant(f, ph, 'sc');
        vals.push(PH + ': ' + formatPower(s, 1000));
        valspf.push(PH + ': ' + formatPowerFactor(calcQuant(f, ph, 'pf')));
        valsls.push(PH + ': ' + (!s ? 'NA' : toStr(calcQuant(f, ph, 'l') / 1000, null, true)));
    });
    if (phase.length > 1) {
        vals.push('Tot: ' + formatComplex(calcQuant(f, 't', 'p') / 1000, calcQuant(f, 't', 'q') / 1000, 0.1));
    }
    return '<tr  class="powerInfo"><td class="infoPaneLabelCell">Power [kW/kVAR]</td><td>' + vals.join(sep) + '</td></tr>' +
        '<tr  class="powerInfo"><td class="infoPaneLabelCell">Power Factor</td><td>' + valspf.join(', ') + '</td></tr>' +
        '<tr  class="powerInfo"><td class="infoPaneLabelCell">Losses [kW]</td><td>' + valsls.join(', ') + '</td></tr>';
}

function linkFunc(v, func, val, fpar){
    return (func && val)?('<a onclick="' + func + '(\'' + val + (fpar?('\', \''+fpar+'\''):'\'')+');">' + v + '</a>'):v;
}

function infoWindowRow(name, val, func, cls, fpar) {
    //func = func || null;
    cls = cls || null;
    fpar = fpar || null;
    var v = Array.isArray(val)? val[0]:val;
    return '<tr' + (cls?(' class="' + cls + '"'):'') + '><td class="infoPaneLabelCell">'+
    linkFunc(name, func, val, fpar)+ '</td><td>'+linkFunc(v, func, val, fpar)+ '</td></tr>';
}


/*require(["dojo/on"], function(on){
    function infoWindowRowN(name, val, func, cls, a2) {
        func = func || focusOn;
        cls = cls || '';
        var v = Array.isArray(val)? val[0]:val;
        var r= dojo.create('tr', cls===''?null:{"class": cls});
        var td1= domConstruct.create('td',{"class": "infoPaneLabelCell"}, r);
        var a1= domConstruct.create('a', {id: 'infoWindowNameLink_'+name, innerHTML: name}, td1);
        var td2= domConstruct.create('td',{"class": "infoPaneLabelCell"}, r);
        var a2= domConstruct.create('a', {id: 'infoWindowValueLink_'+name, innerHTML: val}, td2);
        ev(a1, 'click', func);
        ev(a2, 'click', func);
        return r;
        return '<tr' + ((cls === '') ? ('') : (' class="' + cls + '"')) + '><td class="infoPaneLabelCell"><a onclick="' + 
            func + '(\'' + val + '\', \''+v2+'\');">' + name + '</a></td><td><a onclick="' + 
            func + '(\'' + val + '\', \''+v2+'\');">' + v + '</a></td></tr>';
    }
//});
*/

function getVoltageThereshold() {
        return ['1', '2'].map(function(i){ //vvTh0 and vvTh1
            var v= dojo.byId('vvTh'+i).value;
            return isNumber(v)?(parseFloat(v)/(registry.byId('vvUnit').value === 'v'?gs.conf.analysis.baseV:100)): null; // base v or percent
        });
}

function getLoadingThereshold() {
    return parseFloat(dojo.byId('tvTh').value) * 0.01;
}

function searchForTrans(t) {
    selectByAttr('maploc_xf', t, ['Loads']).then(postSearch);
}

function formatMsg(msg, icon) {
    icon = icon || '';
    if (msg.search(/Asset (\w+) \(/) >= 0) {
        msg = msg.replace(/Asset (\w+) \(/, 'Asset ' + linkifySecname('$1') + ' \(');
    } else if (msg.search(/(The following assets are not connected: )([\w,]+)/) >= 0) {
        var p = msg.match(/(The following assets are not connected: )([\w,]+)/)
        msg = p[1] + p[2].split(',').map(linkifySecname).join(', ');
    }
    return '<tr><td class="MsgIcn">' + ((icon === '') ? '' : '<img width="12px" src="'+ gs.iconRoot + icon + '.png">') + '</td><td class="MsgTxt"><p class="MsgTxt">' + msg + '</p></td></tr>';
}

function addMessage(msg, type) {
    type = type || '';
    if (!registry.byId('msgTitlePane').open) {
        unseenMessageCount += 1;
    }
    //var span = dojo.byId('msg');
    //span.appendChild( document.createTextNode(msg) );
    if (type === 'error' || type === 'esriJobMessageTypeError') {
        msg = formatMsg(msg, 'error');
    }
    else if (type === 'warning' || type === 'esriJobMessageTypeWarning') {
        msg = formatMsg(msg, 'alert');
    }
    else if (type === 'info' || type === 'esriJobMessageTypeInformative') {
        msg = formatMsg(msg, 'blank');
    }
    else if (type === 'success') {
        msg = formatMsg(msg, 'check');
    }
    else if (type === 'progress') {
        msg = formatMsg(msg, 'gear');
    }
    else { // handling arcgis job messages
        if (msg === 'esriJobSubmitted') {
            msg = null;
        }// msg = formatMsg('Job submitted.', 'check'); }
        else if (msg === 'esriJobExecuting') {
            msg = null;
        }// msg = formatMsg('Job executing...', 'gear'); }
        else if (msg === 'esriJobSucceeded') {
            msg = null;
        }// msg = formatMsg('Job succeeded!', 'check'); }
        else if (msg === 'esriJobFailed') {
            msg = null;
        }// msg = formatMsg('Job failed!', 'error'); }
        else if (msg === 'esriJobCancelled' || msg === 'esriJobCancelling') {
            msg = null;
        }// msg = formatMsg('Job cancelled.', 'alert'); }
        else if (msg.match(/^esriJobMessageTypeError \w*: (.*)/)) {
            msg = formatMsg(msg.match(/^.*esriJobMessageTypeError \w*: (Error: |)(.*)/)[2], 'error');
        }
        else if (msg.match(/^esriJobMessageTypeAbort \w*: (.*)/)) {
            msg = formatMsg(msg.match(/^.*esriJobMessageTypeAbort \w*: (Warning: |)(.*)/)[2], 'alert');
        }
        else if (msg.match(/^esriJobMessageTypeWarning \w*: (.*)/)) {
            msg = formatMsg(msg.match(/^.*esriJobMessageTypeWarning \w*: (Warning: |)(.*)/)[2], 'alert');
        }
        else if (msg.match(/^esriJobMessageTypeInformative \w*: (.*)/)) {
            msg = formatMsg(msg.match(/^.*esriJobMessageTypeInformative \w*: (Info: |)(.*)/)[2], 'blank');
        }
        else msg = formatMsg(msg);
    }

    var d= dojo.byId('msgContentPane');
    if (msg) {
        var shouldRoll=(d.scrollHeight - (d.scrollTop + d.getBoundingClientRect().height) <= 0);
        dojo.byId('msgRoll').innerHTML += msg;
        if(shouldRoll) d.scrollTop = d.scrollHeight;
        updateMessagePaneTitle();
    }
}

function getConsumerLpInfo(meter) {
    if (!meter) return null;
    var qt = new esri.tasks.QueryTask(getMapLayerUrl('model_loads'));
    var q = new esri.tasks.Query();
    q.returnGeometry = false;
    q.where = "equipref='" + meter + "'";
    ;
    q.outFields = ["*"];
    return qt.execute(q).promise;
}

function focusToSelection(fs= gs.map.infoWindow.features, refocus= 'move'){
    var r= null;
    if(refocus=='full'){
        r= fs && esri.graphicsExtent(fs) && gs.map.setExtent(esri.graphicsExtent(fs).expand(gs.conf.view.extFactor));
    }else if(refocus=='move'){
        r= fs && esri.graphicsExtent(fs) && gs.map.centerAt(esri.graphicsExtent(fs).getCenter());
    }else{
        r= fs;
    }
    return Promise.resolve(r);
}

function focusOn(secname, refocus= 'move') {
    var p= null;
    if(secname){
        p=selectByAttr(['secname'], secname, ['Power Lines', 'Equipment', 'Loads']).then(function(qr){focusToSelection(qr, refocus);});
        /*
        if(refocus=='full'){
            p= p.then(function(qr){qr && esri.graphicsExtent(qr) && gs.map.setExtent(esri.graphicsExtent(qr).expand(gs.conf.view.extFactor));});
        }else if(refocus=='move'){
            p= p.then(function(qr){qr && esri.graphicsExtent(qr) && gs.map.centerAt(esri.graphicsExtent(qr).getCenter());});
        }
        */
    }
    return Promise.resolve(p);
}

function postSearch(res= null) {
    console.log('postSearch ', res);
    var sb = registry.byId('searchTerm');
    //gs.map.setExtent(esri.graphicsExtent(res).expand(1.5));
    if (res && res.length) {
        sb.validator = function () { return true; }
    }else{
        sb.validator = function () { return false; }
    }
    sb.validate();
    controlStopWaiting('searchLoadingDiv');
}

function postSearchWithFocusOn(qr){
    console.log('Pre focusOn', qr);
    //var sn= qr.length>0 && qr[0] && qr[0].attributes && qr[0].attributes['secname'];
    // need to call post searh on the q and not through focusOn
    //sn?focusOn(sn).then(function(r){postSearch(qr);}):postSearch(qr);
    focusToSelection(qr).then(function(r){postSearch(qr);});
}

function selectByAttr(a, v, qls, strict= true) {
    var q = new esri.tasks.Query();
    q.returnGeometry = true;
    q.outSpatialReference = map.spatialReference;
    q.outFields = ['*'];
    var vs = v instanceof Array ? v: [v]; //v.join("','") : v;
    var attrs = a instanceof Array ? a : [a];
    q.where = attrs.map(function (attr) {
        //return attr + " in ('" + vs + "')";
        return vs.map(function(v){return attr + (strict?" = '":" LIKE '%") + v + (strict?"'":"%'")}).join(' OR ');
    }).join(' OR ');
    return queryLayers(q, qls);
}

function parseAndSearch(ss, kw, fields, layers, postFunc, strict= true) {
    if (ss.search(new RegExp('^' + kw + '\\s*\:*')) >= 0) {
        var sp = ss.replace(new RegExp('^' + kw + '\\s*\:|\\s', 'g'), '').split(',').map(Function.call, String.prototype.trim);
        var p=selectByAttr(fields, sp, layers, strict);
        if(isFunction(postFunc)){
            p.then(postFunc);
        }else{
            for (var i=0; i<postFunc.length; i++){
                p=p.then([postFunc[i]]);
            }
        }
        return true;
    } else return false;
}

function search(ss) {
    controlStartWaiting('searchLoadingDiv');
    if (ML && ML.validMaploc(ss) || (ss.search(/^maploc\s*\:*/) >= 0 && ML.validMaploc(ss.replace(/^maploc\s*\:|\s/g, '')))) {
        if (ss.search(/^maploc\s*\:*/) >= 0) ss = ss.replace(/^maploc\s*\:|\s/g, '');
        gotoMls(ss);
    } else if (ss.search(/^ext\s*\:*/) >= 0) {
        console.log("Setting extent to: ", ss);
        ss = ss.replace(/^ext\s*\:|\s/g, '');
        gotoMlExt(ss);
    } else if (ss.search(/\s*\(\s*-{0,1}\d{1,2}(\.\d+){0,1}\s*,\s*-{0,1}\d{1,2}(\.\d+){0,1}\s*\)\s*/) >= 0) { // lat, lon search
        gotoLatLon(ss.replace(/\)|\(|\s/g, '').split(',').map(parseFloat).reverse());
    } else if (ss.search(/^gps\s*\:\s*-{0,1}\d{1,2}(\.\d+){0,1}\s*,\s*-{0,1}\d{1,2}(\.\d+){0,1}\s*/) >= 0) { // lat, lon search
        gotoLatLon(ss.replace(/^gps\s*\:|\s/g, '').split(',').map(parseFloat).reverse());
    //} else if (ss.search(/^id\s*\:*/) >= 0) { // search by secname (id)
    //    var secname = ss.replace(/^id\s*\:|\s/g, '');
    //    console.log('Searching for:', secname);
    //    focusOn(secname).then(postSearch);
    } else if (parseAndSearch(ss, 'id', ['secname'], ['Power Lines', 'Equipment', 'Loads'], postSearchWithFocusOn, false)) { // parent
    } else if (parseAndSearch(ss, 'equipment', ['equipref'], ['Equipment', 'Loads'], postSearchWithFocusOn, false)) { // parent
    } else if (parseAndSearch(ss, 'wire', ['conductor', 'neutral', 'construction'], ['Power Lines'], postSearchWithFocusOn, false)) { // parent
    } else if (parseAndSearch(ss, 'uuid', ['guid'], ['Loads', 'Equipment', 'Power Lines'], postSearch)) { // uuid
    } else if (parseAndSearch(ss, 'user', ['gi_user'], ['Loads', 'Equipment', 'Power Lines'], postSearch)) { // user
    } else if (parseAndSearch(ss, 'workorder', ['wo'], ['Power Lines','Poles','Loads', 'Equipment'], postSearch, false)) { // work order
    } else if (parseAndSearch(ss, 'wo', ['wo'], ['Power Lines','Poles','Loads', 'Equipment'], postSearch, false)) { // work order
    } else if (parseAndSearch(ss, 'parent', ['parentsec'], ['Loads', 'Equipment', 'Power Lines'], postSearch)) { // parent
    } else if (parseAndSearch(ss, 'meter', ['meter_num'], ['Loads'], postSearch, false)) { // meter
    } else if (parseAndSearch(ss, 'account', ['account_no'], ['Loads'], postSearch, false)) { // account no
    } else if (parseAndSearch(ss, 'trans', ['maploc_xf'], ['Loads'], postSearch)) { // transformer
    } else if (parseAndSearch(ss, 'phone', ['tel_res', 'tel_cell'], ['Loads'], postSearch, false)) { // phone number
    } else {
        locator.addressToLocations({address: {"SingleLine": ss}}, function (e) {
            console.log('Location found: ', e);
            if (e.length > 0) {
                var m = 0;
                for (var i = 0; i < e.length; i++) {
                    if (e[i].score > e[m].score) m = i;
                }
                var pt = esri.geometry.project(e[m].location, map.spatialReference);
                centerToCoordinates([pt]);
            } else {
                controlStopWaiting('searchLoadingDiv');
            }
        }, function (e) {
            console.log('Address lookup failed: ', e);
            controlStopWaiting('searchLoadingDiv');
        });
    }
}



/* Inspection tool */
function assignFeatureTemplate(f) {
    if (typeof f.attributes['otype'] === 'undefined') {
        console.log('Feature does not have otype');
    } else {
        if (f.attributes['otype'] === 'oh' || f.attributes['otype'] === 'ug' || f.attributes['otype'] === 'wire') {
            f.setInfoTemplate(popupTemplateWire);
            f.setSymbol(selLine);
        }
        else if (f.attributes['otype'] === 'pole') {
            f.setInfoTemplate(popupTemplatePole);
            f.setSymbol(selMarker);
        }
        else if (['residential', 'smallconsumer', 'largeconsumer', 'load'].indexOf(f.attributes['otype']) >= 0) {
            f.setInfoTemplate(popupTemplateConsumer);
            f.setSymbol(selMarker);
        }
        else {
            f.setInfoTemplate(popupTemplateEquipment);
            f.setSymbol(selMarker);
        }
    }
    return f;
}


function assignInfoTemplate(result) {
    return ((typeof result.features !== 'undefined') ? result.features : result).map(assignFeatureTemplate);
}

function appendInfo(features) {
    features = ((typeof features.features !== 'undefined') ? features.features : features);

    if (features.length === 0) return features;

    var pfQT = new esri.tasks.QueryTask(getMapLayerUrl(gs.conf.pfResLayer));
    var pfQ = new esri.tasks.Query();
    pfQ.returnGeometry = false;
    var rexList = ['objectid', 'phasecode', 'phase', 'otype', 'secname', 'equipref', 'status', 'parentsec']; // not sure if we need this at all
    features.forEach(function (f) {
        if (typeof f.attributes['otype'] !== 'undefined') {
            if (f.attributes.otype === 'pole') {
                f['rpivot'] = null;
            } else {
                f['rpivot'] = (BRANCH_ELEMENTS.indexOf(f.attributes.otype) >= 0 || f.attributes.otype === 'generator') ? 'secname' : 'parentsec';
            }
        } else {
            f['rpivot'] = null;
        }
    });
    var rpivot = features.map(function (f) {
        return f['rpivot'];
    });
    var nonNullFeatures = features.filter(function (f, i) {
        return f['rpivot'] !== null;
    });
    var wcc = nonNullFeatures.length;
    var wc = "scenario='" + caseStudyName + "' AND secname IN ('" + nonNullFeatures.map(function (f) {
        return f.attributes[f['rpivot']];
    }).join("','") + "')";
    pfQ.where = wc;
    console.log("pf wc: ", pfQ.where);
    pfQ.outFields = ["*"];

    var mexList = ['objectid'];
    var mpivot = 'equipref';
    // grouping the features by model layer
    var featureGroups = Object();
    features.forEach(function (f) {
        if (typeof f.attributes.otype !== 'undefined' && typeof attExp[f.attributes.otype] !== 'undefined') {
            attExp[f.attributes.otype].forEach(function (ae) {
                if (typeof gs.layInds[ae['layer']] !== 'undefined') {
                    if (!featureGroups.hasOwnProperty(ae['layer'])) {
                        featureGroups[ae['layer']] = [];
                    }
                    featureGroups[ae['layer']].push(f.attributes[ae['attr']]);
                }
            });
        }
    });
    console.log('featureGroups', featureGroups);
    //building the query tasks and queries
    var featureGroupList = Object.keys(featureGroups);
    var mQs = [features, mpivot, mexList, rpivot, rexList, (wcc === 0) ? null : pfQT.execute(pfQ).promise, featureGroupList]; //
    featureGroupList.forEach(function (g) {
        var qt = new esri.tasks.QueryTask(getMapLayerUrl(g));
        var q = new esri.tasks.Query();
        q.returnGeometry = false;
        var wc = layerKeys[g] + " IN ('";
        wc += unique(featureGroups[g]).join("','");
        wc += "')";
        if (g === 'model_loads') {
            wc += " AND lscen='" + getStudyProperty(caseStudyName, 'lscen') + "'";
        }
        if (g === 'model_gen_profiles') {
            wc += " AND gscen='" + getStudyProperty(caseStudyName, 'gscen') + "'";
        }
        if (g === gs.conf.pfResLayer) {
            wc += " AND scenario='" + caseStudyName + "'";
        }
        q.where = wc;
        q.outFields = ["*"];
        console.log("models wc: ", q.where);
        mQs.push(qt.execute(q).promise);
    });
    console.log(mQs);
    return all(mQs).then(function (r) {
        console.log('Info results:', r);
        var mRes;
        if (r.length > 7) {
            mRes = [].concat.apply([], r.slice(7).map(function (fs) {
                return fs.features;
            }));
            //mRes = r[6];
        } else {
            mRes = null;
        }
        var attExpRes = r.slice(7);
        console.log('Info results, post merge:', r, r.length);
        var originalFeatures = r[0];
        mpivot = r[1];
        mexList = r[2];
        var pfpivot = r[3];
        var pfexList = r[4];
        var pfRes = r[5];
        featureGroupList = r[6];
        return appendAttributes(originalFeatures, featureGroupList, attExpRes, '_ext');
    });
}

function appendAttributes(originalFeatureSet, featureGroupList, attExpRes, pfx) {
    if (!originalFeatureSet) {
        console.log('Null original feature set.');
        return originalFeatureSet;
    }
    var fa1 = (typeof originalFeatureSet.features !== 'undefined') ? originalFeatureSet.features : originalFeatureSet;
    fa1.forEach(function (f) {
        if (typeof f.attributes['otype'] !== 'undefined' && typeof attExp[f.attributes['otype']] !== 'undefined') {
            attExp[f.attributes['otype']].forEach(function (ae) {
                var fs = featureGroupList.indexOf(ae.layer) >= 0 ? attExpRes[featureGroupList.indexOf(ae.layer)].features : null;
                if (fs) {
                    var match = fs.filter(function (ef) {
                        return ef.attributes[ae['lkey']] === f.attributes[ae['attr']];
                    });
                    if (match.length > 0) {
                        var ext = typeof ae['ext_name'] === 'undefined' ? ae['attr'] + pfx : ae['ext_name'];
                        //console.log('ext, match', ext, match);
                        f.attributes[ext] = match[0].attributes;
                    }
                }
            });
        }
    });
    console.log('Attributes appended:', originalFeatureSet);
    return originalFeatureSet;
}

function queryLayers(q, qls) {
    owStartWaiting();
    console.log("Query: ", q, " Query layers: ", qls);
    q.outFields = ['*'];
    qls = qls || gs.layers;
    var infoWindowFeatures = [];
    if (assetsLayer.visible && qls.length > 0) {
        var qts = qls.map(function (ln) {
            return new esri.tasks.QueryTask(getMapLayerUrl(ln));
        });
        var defs = qts.map(function (qt) {
            return qt.execute(q);
        });
        return all(defs).then(function (res) {
            res.forEach(function (r, i) {
                if (r && typeof r.features !== 'undefined' && r.features.length) r.features.forEach(function (f) {
                    f._layer = assetsLayer;
                    f.layer = qls.length > i ? qls[i] : null;
                });
            });
            var allFeatures = [].concat.apply([], res.map(function (fs) {
                return fs.features;
            })).map(assignFeatureTemplate);
            console.log('All features: ', allFeatures);
            if (allFeatures.length > 0) {
                //return appendInfo(allFeatures).then(assignInfoTemplate).then(function (fs) {
                return appendInfo(allFeatures).then(function (fs) {
                    console.log('Full feature set received (check map.infoWindow.features), length: ', fs.length);
                    var d = map.infoWindow.setFeatures(fs);
                    owStopWaiting();
                    owShow();
                    return fs;
                });
            } else {
                owStopWaiting();
                return [];
            }
        });
    } else {
        return [];
    }
}

function searchLayers(e) {
    // build an extent around the click point
    var pad = map.extent.getWidth() / map.width * 10;
    var queryGeom = new esri.geometry.Extent(e.mapPoint.x - pad, e.mapPoint.y - pad, e.mapPoint.x + pad, e.mapPoint.y + pad, map.spatialReference);
    var q = new esri.tasks.Query();
    q.returnGeometry = true;
    q.outSpatialReference = map.spatialReference;
    q.outFields = ['*'];
    q.geometry = queryGeom;
    return queryLayers(q);
}

function findCoincidentGeometries(f) {
    var pad = 0;
    var pt = f.geometry.type === 'polyline' ? f.geometry.getPoint(0, f.geometry.paths[0].length - 1) : f.geometry;
    var queryGeom = new esri.geometry.Extent(pt.x - pad, pt.y - pad, pt.x + pad, pt.y + pad, map.spatialReference);
    var q = new esri.tasks.Query();
    q.returnGeometry = true;
    q.outSpatialReference = map.spatialReference;
    q.outFields = ['*'];
    q.geometry = queryGeom;
    return queryLayers(q);
}

function gotoLatLon(pt) {
    if (map.spatialReference.wkid !== 3857) { // if not Web Mercator, we need to project
        ML.getCoordinates(new esri.geometry.Point(pt[0], pt[1], new esri.SpatialReference(4326)), map.spatialReference.wkid, centerToCoordinates);
    } else { // if Web Mercator, we can shortcut the projection
        centerToCoordinates([esri.geometry.geographicToWebMercator(new esri.geometry.Point(pt[0], pt[1], new esri.SpatialReference(4326)))]);
    }
}


function formatDate(date, fmt, noadj) {
    noadj = noadj || false;
    var hd = noadj ? 0 : (date.getUTCHours() + 24 - date.getHours());
    var d= new Date(date.getTime()+ date.getTimezoneOffset() * 60000 * (noadj?0:1));
    //return dojo.date.locale.format(dojo.date.add(date, "hour", hd), {selector: "date", datePattern: fmt});
    return dojo.date.locale.format(d, {selector: "date", datePattern: fmt});
}

function removeTz(es) {
    return dojo.date.add(es, 'minute', -es.getTimezoneOffset());
}

function validateLayer(url) {
    return request(url);
}

function updateCaseStudyInfo() {
    when(gs.caseStudies, function () {
        var cs = registry.byId('caseStudyManSel').value;

        var tb = dojo.byId('csInfo');
        dojo.byId('csName').innerHTML = getStudyProperty(cs, 'name');
        dojo.byId('csCreationDate').innerHTML = ((cs !== '') ? formatDate(new Date(getStudyProperty(cs, 'creation_date')), 'MMM d, yyyy h:m a') : '');
        dojo.byId('csLastUpdate').innerHTML = ((cs !== '') ? formatDate(new Date(getStudyProperty(cs, 'last_update')), 'MMM d, yyyy h:m a') : '');
        dojo.byId('csLoadProfile').innerHTML = getStudyProperty(cs, 'lscen');
        dojo.byId('csLoadScaling').innerHTML = getStudyProperty(cs, 'lscaling');
        dojo.byId('csGenProfile').innerHTML = getStudyProperty(cs, 'gscen');
        dojo.byId('csGenScaling').innerHTML = getStudyProperty(cs, 'gscaling');
        dojo.byId('csComments').innerHTML = getStudyProperty(cs, 'comments');
    });
}

function updateIntCaseStudyInfo() {
    when(gs.intCaseStudies, function () {
        var ics = registry.byId('intCaseStudyManSel');
        var icsName = ics.value;
        let icsDelBtn = registry.byId('delIntCaseStudyBtn');

        if (gs.state.intCaseStudiesStore.query({name: icsName}).length === 0) {
            console.log('Current interval cases study name, ' + icsName + ', not found, resetting to null.');
            icsName = null;
            icsDelBtn.setAttribute('disabled', true);
        }

        if (!icsName && gs.state.intCaseStudiesStore.query({}).length > 0) {
            icsName = gs.state.intCaseStudiesStore.query({})[0][gs.state.intCaseStudiesStore.idProperty];
            // ics.selectedIndex = 0;
        }

        if (icsName) {            
            icsDelBtn.setAttribute('disabled', false);
        }
        
        var tb = dojo.byId('icsInfo');
        // dojo.byId('icsName').innerHTML = getIntStudyProperty(icsName, 'group_name');
        // dojo.byId('icsCreationDate').innerHTML = ((icsName !== '') ? formatDate(new Date(getIntStudyProperty(icsName, 'creation_date')), 'MMM d, yyyy h:m a') : '');
        // dojo.byId('icsLastUpdate').innerHTML = ((icsName !== '') ? formatDate(new Date(getIntStudyProperty(icsName, 'last_update')), 'MMM d, yyyy h:m a') : '');
        // dojo.byId('icsLoadProfile').innerHTML = getIntStudyProperty(icsName, 'lscen');
        // dojo.byId('icsLoadScaling').innerHTML = getIntStudyProperty(icsName, 'lscaling');
        // dojo.byId('icsGenProfile').innerHTML = getIntStudyProperty(icsName, 'gscen');
        // dojo.byId('icsGenScaling').innerHTML = getIntStudyProperty(icsName, 'gscaling');
        // dojo.byId('icsComments').innerHTML = getIntStudyProperty(icsName, 'comments');
    });
}

function getImp() {
    if (lastSelFeat) {
        var pf = lastSelFeat.attributes.pf;
        return "Z1: " + pf.z1r + '+j' + pf.z1i + ", Z0: " + pf.z0r + '+j' + pf.z0i;
    } else {
        console.log('No selected feature found.');
    }
}

function getAmps() {
    if (lastSelFeat) {
        var f = lastSelFeat;
        var amps = f.attributes['phasecode'].split('').map(function (p) {
            return p + ": " + toStr(calcQuant(f, p.toLowerCase(), 'c'));
        });
        return "Currents: " + amps.join(', ');
    } else {
        console.log('No selected feature found.');
    }
}

// getting results data
function getVs(th1, th2, scen, vt, incSPAV= false) {
    var resQT = new esri.tasks.QueryTask(getMapLayerUrl(gs.conf.pfResLayer));
    var resQ = new esri.tasks.Query();
    resQ.returnGeometry = false;
    resQ.outSpatialReference = map.spatialReference || gs.conf.defaultSpatialRef;
    var rnd = (new Date()).getTime();
    var tth1, tth2, ampLimQ='';
    switch (vt) {
        case ('vv'):
            if(th2==null){ th2= 2-th1; }
            tth1 = Math.pow(th1, 2);
            tth2 = Math.pow(th2, 2);
            resQ.where = "( ((vr_a^2+vi_a^2)/nom_v^2 > " + tth2 + ")"+
                       " OR ((vr_a^2+vi_a^2)/nom_v^2 < " + tth1 + ")"+
                       " OR ((vr_b^2+vi_b^2)/nom_v^2 > " + tth2 + ")"+
                       " OR ((vr_b^2+vi_b^2)/nom_v^2 < " + tth1 + ")"+
                       " OR ((vr_c^2+vi_c^2)/nom_v^2 > " + tth2 + ")"+
                       " OR ((vr_c^2+vi_c^2)/nom_v^2 < " + tth1 + ")"+
                        ") AND (scenario='" + scen + "')";
            break;
        case ('tv'):
            var tth = Math.pow(th1, 2);
            var ampTh= gs.conf.analysis.spAmpTh;
            if(incSPAV){
                console.log("Single phase amp violations violations enabled. Threshold: ", ampTh);
                ampLimQ= "OR ((cr_a^2+ci_a^2) > " + Math.pow(ampTh, 2) +" AND cr_b is NULL and cr_c is NULL)"+
                         "OR ((cr_b^2+ci_b^2) > " + Math.pow(ampTh, 2) +" AND cr_a is NULL and cr_c is NULL)"+
                         "OR ((cr_c^2+ci_c^2) > " + Math.pow(ampTh, 2) +" AND cr_a is NULL and cr_b is NULL)";
            }
            resQ.where = "( ((cr_a^2+ci_a^2) / c_rating^2> " + tth + " )" +
                       " OR ((cr_b^2+ci_b^2) / c_rating^2> " + tth + " )" +
                       " OR ((cr_c^2+ci_c^2) / c_rating^2> " + tth + " )" +
                       ampLimQ +
                       ") AND scenario='" + scen + "'";
            break;
        /*case ('av'): // will work on this later
            var ampTh= th1, ampLimQ;
            resQ.where = "( ((cr_a^2+ci_a^2) > " + Math.pow(ampTh, 2) +" AND cr_b is NULL and cr_c is NULL)"+
                        "OR ((cr_b^2+ci_b^2) > " + Math.pow(ampTh, 2) +" AND cr_a is NULL and cr_c is NULL)"+
                        "OR ((cr_c^2+ci_c^2) > " + Math.pow(ampTh, 2) +" AND cr_a is NULL and cr_b is NULL)"+
                        ") AND scenario='" + scen + "'";
            break;
        */
    }
    console.log(resQ.where);
    resQ.outFields = ["secname"];
    return resQT.execute(resQ).promise;
}

function getVFs(fs) {
    var q = new esri.tasks.Query();
    q.returnGeometry = true;
    q.outSpatialReference = map.spatialReference || gs.conf.defaultSpatialRef;
    var wc = " secname IN ('" + fs.features.map(function (f) {
        return f.attributes['secname'];
    }).join("','") + "')";
    q.where = (fs.features.length) ? wc : "1=0"; //this would ensure an empty response for an empty orig fs
    q.outFields = ["*"];
    var qls = ['Loads', 'Equipment', 'Power Lines'];
    var qts = qls.map(function (ln) {
        return new esri.tasks.QueryTask(getMapLayerUrl(ln));
    });
    return qts.map(function (qt) {
        return qt.execute(q).promise;
    });
}

function getVFs(fs) {
    var q = new esri.tasks.Query();
    q.returnGeometry = true;
    q.outSpatialReference = map.spatialReference || gs.conf.defaultSpatialRef;
    var wc = " secname IN ('" + fs.features.map(function (f) {
        return f.attributes['secname'];
    }).join("','") + "')";
    q.where = (fs.features.length) ? wc : "1=0"; //this would ensure an empty response for an empty orig fs
    q.outFields = ["*"];
    var qls = ['Loads', 'Equipment', 'Power Lines'];
    var qts = qls.map(function (ln) {
        return new esri.tasks.QueryTask(getMapLayerUrl(ln));
    });
    return qts.map(function (qt) {
        return qt.execute(q).promise;
    });
}

function getIssues(tth, vth, scen, reportSPAV, updateHandler) { // vth: array of length 2
    if(tth !== null && vth.length == 2 && vth[0] !== null){
        tvFeatures = null;
        vvFeatures = null;
        all([getVs(vth[0], vth[1], scen, 'vv'), getVs(tth, tth, scen, 'tv', reportSPAV)]).then(function (res) {
            var vvRecs = res[0];
            var tvRecs = res[1];
            if(tvRecs && tvRecs.features && vvRecs && vvRecs.features){
                console.log('Got the results, tv: ' + tvRecs.features.length + ' vv: ' + vvRecs.features.length);
                all([all(getVFs(tvRecs)), all(getVFs(vvRecs))]).then(function (res) {
                    tvGFeatures = [].concat.apply([], arrayUtils.map(res[0], function (fs) {
                        return fs.features;
                    }));
                    vvGFeatures = [].concat.apply([], arrayUtils.map(res[1], function (fs) {
                        return fs.features;
                    }));
                    console.log('Got geometries, tv: ' + tvGFeatures.length + ' vv: ' + vvGFeatures.length);
                    all([appendInfo(tvGFeatures), appendInfo(vvGFeatures)]).then(function (res) {
                        window.tvFeatures = {'features': res[0].filter(issuesFilter)};
                        window.vvFeatures = {'features': res[1].filter(issuesFilter)};
                        console.log('Got issue features, tv: ' + tvFeatures.length + ' vv: ' + vvFeatures.length);
                    }).then(updateHandler);
                });
            }else{
                console.log('Error in tvRecs or vvRecs: ', tvRecs, vvRecs);
            }
        }, function(e){
            console.log('Error recieving issues: ', e);
        });
    }else{
        console.log('Invalid analysis parameters.');        
    }

}

function issuesFilter(f) {
    return f.attributes.otype !== 'source';
}

function resUpdateHandler() {
    console.log('res update handler');
    caseStudyName = (gs.state.caseStudiesStore.query({}).length > 0) ? registry.byId('resScenarioSel').value : null;
    siwUpdate();
    issueHighlightingLayer.clear();
    resNeedUpdate = false;

    // if (registry.byId('plotResultsCB').checked) {
    //     dojo.byId('chartNode').style.display = "";
    //     dojo.byId('chartLegendHost').style.display = '';
    // }
    issueHighlightingLayer.clear();
    // dojo.byId("vvLabel").innerHTML = 'Voltage (' + vvFeatures.features.length + ' issues, ' + toStr(totalLength(vvFeatures.features), 0.1, true) + ' miles)';
    // dojo.byId("tvLabel").innerHTML = 'Thermal (' + tvFeatures.features.length + ' issues, ' + toStr(totalLength(tvFeatures.features), 0.1, true) + ' miles)';
    highlightViolations();
    // if (dojo.byId('radioVV').checked) {
    //     resMode = 'voltage';
    //     processResults();
    //     if (registry.byId('plotResultsCB').checked) {
    //         populateChart(vvFeatures);
    //     }
    //     populateResultsGrid();
    //     if (registry.byId('reportResultsCB').checked) {
    //         populateReportPage();
    //     }
    // } else {
    //     resMode = 'thermal';
    //     processResults();
    //     if (registry.byId('plotResultsCB').checked) {
    //         populateChart(tvFeatures);
    //     }
    //     populateResultsGrid();
    //     if (registry.byId('reportResultsCB').checked) {
    //         populateReportPage();
    //     }
    // }

    registry.byId('issuesRefereshBtn').set("disabled", false);
    // dojo.byId('issuesLoadingDiv').style.display = "none";
    console.log('Issues updated.');
}


function prepDS() {
    var f, pf, norm, out, ph;
    if (resMode === 'voltage') {
        f = vvFeatures;
        pf = 'v';
        norm = 'nom_v';
    } else if (resMode === 'thermal') {
        f = tvFeatures;
        pf = 'c';
        norm = 'c_rating';
    }
    if (!f) return [];
    var ds = f.features.map(function (f) {
        out = {'secname': f.attributes['secname']};
        ph = ['a', 'b', 'c'];
        ph.forEach(function (p) {
            out[p] = calcQuant(f, p, pf) / calcQuant(f, p, norm);
        });
        return out;
    });
    return ds;
}

function processResults() {
    chartDataSet = prepDS();
}

function populateChart() {
    var ttl, ylab, minVal, maxVal
    if (resMode === 'voltage') {
        ttl = "Voltage Violation Profile";
        ylab = "Normalized Voltage";
    } else if (resMode === 'thermal') {
        ttl = "Thermal Violation Profile";
        ylab = "Normalized Current";
    }
    console.log('Charting ' + chartDataSet.length + ' items.');
    minVal = Math.min(minNzAttr(chartDataSet, 'a'), minNzAttr(chartDataSet, 'b'), minNzAttr(chartDataSet, 'c'));
    maxVal = Math.max(maxNzAttr(chartDataSet, 'a'), maxNzAttr(chartDataSet, 'b'), maxNzAttr(chartDataSet, 'c'));

    dojo.byId('chartNode').innerHTML = '';

    chart = new dojox.charting.Chart2D("chartNode", {
        //title: ttl,
        titlePos: "top",
        titleGap: 5,
        titleFont: "normal normal normal 10pt Arial",
        titleFontColor: "black"
    });
    chart.setTheme(dojox.charting.themes.MiamiNice);
    chart.addPlot("default", {
        type: "ClusteredColumns",
        markers: true,
        gap: 5,
        hAxis: "x", vAxis: "y",
        animate: {duration: 2000}
    });
    chart.addPlot("Grid", {
        type: "Grid", hAxis: "other x", vAxis: "other y",
        hMajorLines: true, hMinorLines: false, vMajorLines: true, vMinorLines: false
    });
    var tooltip = new dojox.charting.action2d.Tooltip(chart, "default", {
        font: "normal normal normal 10pt Arial",
        text: function (point) {
            return "Sec. Name: " + chartDataSet[point.x]['secname'];
        }
    });

    chart.addAxis("x", {fixLower: "minor", fixUpper: "minor", natural: true});
    chart.addAxis("y", {
        vertical: true,
        fixLower: "major",
        fixUpper: "major",
        title: ylab,
        titleFont: "normal normal normal 8pt Arial",
        from: minVal * 0.99,
        to: maxVal * 1.01
    });
    chart.addAxis("other x", {fixLower: "minor", fixUpper: "minor", leftBottom: false, natural: true});
    chart.addAxis("other y", {
        vertical: true,
        fixLower: "major",
        fixUpper: "major",
        leftBottom: false,
        from: minVal * 0.99,
        to: maxVal * 1.01
    });
    chart.addSeries("Phase A", chartDataSet.map(function (f) {
        return f['a'];
    }));
    chart.addSeries("Phase B", chartDataSet.map(function (f) {
        return f['b'];
    }));
    chart.addSeries("Phase C", chartDataSet.map(function (f) {
        return f['c'];
    }));
    chart.render();
    chart.connectToPlot("default", function (evt) {
        if (evt.type === "onclick" && !editable) {
            console.log(evt.run.name);
            console.log(chartDataSet[evt.x].secname);
            // noinspection JSUndeclaredVariable
            focusOn(chartDataSet[evt.x].secname, popupLoc = '');
        }
    });

    if (chartLegend) {
        chartLegend.destroyRecursive();
        dojo.byId('chartLegendHost').innerHTML = '<div id="chartLegend"></div>';
    }
    chartLegend = new dojox.charting.widget.SelectableLegend({chart: chart, horizontal: true}, "chartLegend");
}


function tagIt(c, i, l) {
    // nr and nc will be index and full list
    console.log(c);
    i = i || 0;
    l = l || 0;
    var nc = 0;
    var nr = 0;
    if (typeof c['children'] !== 'undefined') {
        //console.log(c['children']);
        nc = c['children'].length;
        //console.log(nc);
    } else {
        if (l && arrayUtils.some(l, function (t) {
                return (typeof t['children'] !== 'undefined');
            })) {
            nr = 2;
        } else {
            nr = 0;
        }
    }
    return '<th class="reportTab"' + (nc ? (' colspan="' + nc + '"') : '') +
        ' ' + (nr ? (' rowspan="' + nr + '"') : '') +
        '>' + c['label'] + '</th>';
}

function renderLevel(s, lvl) {
    if (lvl === 1) {
        cc = ''.concat.apply('', arrayUtils.map(s, tagIt));
    } else if (lvl === 2) {
        cc = ''.concat.apply('', arrayUtils.map(s, function (c) {
            if (typeof c['children'] !== 'undefined') {
                return ''.concat.apply('', arrayUtils.map(c['children'], tagIt));
            } else {
                return '';
            }
        }));
    }
    return '<tr class="reportTab">' + cc + '</tr>';
}

function getFieldName(c) {
    return c['field'];
}

function populateReportPage() {
    var features, title;
    
    if (resMode === 'voltage') {
        features = vvFeatures.features; //pf='v'; norm='nom_v';
        title = "Voltage Issues Report";
    } else if (resMode === 'thermal') {
        features = tvFeatures.features; //pf='c'; norm='c_rating';
        title = "Thermal Issues Report";
    } else {
        features = [];
        return;
    }

    console.log('Reporting ' + features.length + ' items.');

    var qr = new dojo.store.util.QueryResults({data: features.map(resultRowMaker), idProperty: 'secname'});
    console.log("QR:")
    console.log(qr);
    var content = '<table class="reportTab">';
    content += renderLevel(resStructure, 1);
    content += renderLevel(resStructure, 2);
    var fn = [].concat.apply([], arrayUtils.map(resStructure, function (c) {
        if (typeof c['children'] !== 'undefined') {
            return [].concat.apply([], arrayUtils.map(c['children'], getFieldName));
        } else {
            return getFieldName(c);
        }
    }));
    qr.data.forEach(function (element) {
        var d = element;
        var r = '<tr class="reportTab">';
        fn.forEach(function (element) {
            r += '<td class="reportTab">' + ((d[element]) ? d[element] : '') + '</td>';
        });
        r += '</tr>';
        content += r;
    });
    content += '</table>';

    var w = open("");
    w.document.head.innerHTML = '<TITLE>' + title + '</TITLE>';
    w.document.head.innerHTML += '<style> .reportTab{ border-spacing: 0px; empty-cells: show; border-collapse: collapse;  vertical-align: top; text-align: center; border: 1px solid black; padding: 5px 10px 5px 10px; } .reportTab th{ background-color: gray;} .reportTab tr{ } .reportTab td{  } </style>';
    w.document.body.innerHTML = content;
}

function populateResultsGrid() {
    var features;
    if (resMode === 'voltage') {
        features = vvFeatures.features; //pf='v'; norm='nom_v';
    } else if (resMode === 'thermal') {
        features = tvFeatures.features; //pf='c'; norm='c_rating';
    }
    if (!features) features = [];
    console.log('Tabulating ' + features.length + ' items.');

    var resStore = new dojo.store.Memory({data: arrayUtils.map(features, resultRowMaker), idProperty: 'secname'});

    var grid;
    if (typeof grid === 'undefined') {
        var CustomGrid = dojo.declare([dgrid.OnDemandGrid, dgrid.Keyboard, dgrid.Selection, dgrid.extensions.CompoundColumns]); //, dgrid.extensions.Pagination
        grid = new CustomGrid({
            columns: resStructure,
            store: resStore,
            selectionMode: 'single', // for Selection; only select a single row at a time
            cellNavigation: false // for Keyboard; allow only row-level keyboard navigation
        }, "gridNode");
    } else {
        grid.setStore(resStore);
    }
    grid.startup();
    grid.resize();
    grid.on(".dgrid-row:click", onRowClickHandler);
}

function highlightViolations() {
    issueHighlightingLayer.clear();
    if (tvFeatures !== null) tvFeatures.features.forEach(function (f) {
        f.setSymbol(tvSymbol);
        issueHighlightingLayer.add(f);
    });
    if (vvFeatures !== null) vvFeatures.features.forEach(function (f) {
        f.setSymbol(vvSymbol);
        issueHighlightingLayer.add(f);
    });
}

function onRowClickHandler(evt) {
    //console.log(grid.row(evt));
    focusOn(grid.row(evt).data.secname, '');
}


function focusOnO(secname, popupLoc, refocus) {
    owStartWaiting();
    popupLoc = popupLoc || 'auto';
    refocus = refocus || 'full';
    window.focusSecName = secname;
    return all(gs.netLayers.map(function (l) {
        var qt = new esri.tasks.QueryTask(getMapLayerUrl(l));
        var q = new esri.tasks.Query();
        q.returnGeometry = true;
        q.outSpatialReference = map.spatialReference;
        q.where = "secname ='" + focusSecName + "'";
        q.outFields = ["*"];
        return qt.execute(q).promise;
    })).then(function (res) {
        console.log('All query results are in...', res);
        var match = null;
        var found = false;
        res.forEach(function (r, i) {
            r.features.forEach(function (f) {
                f._layer = assetsLayer;
                f.layer = gs.layers[i]
            });
            if (typeof r.features !== 'undefined' && r.features.length > 0 && r.features[0].attributes['secname'] === focusSecName) {
                match = r;
            }
            ;
        });
        if (!match) {
            console.log('Feature ' + focusSecName + ' was not found!');
        }
        return match ? match : new esri.tasks.FeatureSet();
    }).then(appendInfo).then(assignInfoTemplate).then(function (res) {
        //console.log(res);
        if (res.length > 0) {
            map.infoWindow.setFeatures(res);
            map.setExtent(niceExtent(res[0], 15, refocus));
        }
        return res;
    }).then(function (res) {
        console.log(res);
        if (res.length > 0 && popupLoc !== '') {
            arrayUtils.forEach(map.infoWindow.domNode.getElementsByClassName('contentPane'), function (f) {
                f.style.maxHeight = "";
            });
            var p, adjX, adjY
            if (popupLoc === 'auto') {
                //map.infoWindow.show(myFeature.geometry.getExtent().getCenter());
            } else {
                if (map.infoWindow.features[0].geometry.type === 'point') {
                    p = map.infoWindow.features[0].geometry;
                    adjX = 0.1 * map.extent.getWidth();
                    adjY = 0.1 * map.extent.getHeight();
                } else {
                    p = map.infoWindow.features[0].geometry.getExtent().getCenter();
                    adjX = 0.1 * map.infoWindow.features[0].geometry.getExtent().getWidth();
                    adjY = 0.1 * map.infoWindow.features[0].geometry.getExtent().getHeight();
                }
                switch (popupLoc) {
                    case 'LL_CORNER':
                        p.x = map.extent.xmin + adjX;
                        p.y = map.extent.ymin + adjY;
                        break;
                    case 'UL_CORNER':
                        p.x = map.extent.xmin + adjX;
                        p.y = map.extent.ymax - adjY;
                        break;
                    case 'UR_CORNER':
                        p.x = map.extent.xmax - adjX;
                        p.y = map.extent.ymax - adjY;
                        break;
                    case 'LR_CORNER':
                        p.x = map.extent.xmax - adjX;
                        p.y = map.extent.ymin + adjY;
                        break;
                }
                //map.infoWindow.show(p);
            }
        }
        owShow();
        owStopWaiting();
        return res;
    });
}

function linkifySecname(s) {
    return '<a class="mlsLink" onclick="focusOn(\'' + s + '\');">' + s + '</a>';
}

function niceExtent(f, factor, mode) {
    mode = mode || 'full';
    var newExt;
    if (f.geometry.type === 'point') {
        newExt = map.extent.centerAt(f.geometry);
    } else {
        switch (mode) {
            case 'move':
                newExt = map.extent.centerAt(f.geometry.getExtent().getCenter());
                break;
            case 'full':
                newExt = f.geometry.getExtent();
                newExt.xmin -= f.geometry.getExtent().getWidth() * factor;
                newExt.xmax += f.geometry.getExtent().getWidth() * factor;
                newExt.ymin -= f.geometry.getExtent().getHeight() * factor;
                newExt.ymax += f.geometry.getExtent().getHeight() * factor;
                //newExt= newExt.offset(-newExt.getWidth(), 0);
                break;
        }
    }
    return newExt;
}

function focusOnBay(sb) {
    owStartWaiting();
    console.log('Focusing on ', sb);
    all(['Loads', 'Equipment', 'Power Lines'].map(function (l) {
        var qt = new esri.tasks.QueryTask(getMapLayerUrl(l));
        var q = new esri.tasks.Query();
        q.returnGeometry = true;
        q.outSpatialReference = map.spatialReference;
        q.where = "circuit ='" + sb + "'";
        q.outFields = ["*"];
        return qt.execute(q).promise;
    })).then(function (res) {
        console.log('All query results are in...', res);
        map.infoWindow.hide();
        bayHighlightingLayer.clear();
        var allfs = ([].concat.apply([], res.map(function (fs) {
            return fs.features;
        })));
        allfs.forEach(function (f) {
            f.setSymbol((f.geometry.type === 'polyline') ? sbLineSymbol : ((f.attributes['otype'] === 'source') ? sbSourceSymbol : sbMarkerSymbol));
            bayHighlightingLayer.add(f);
        });
        //console.log('Circuit all features: ', allfs);
        if (allfs.length) {
            map.setExtent(esri.graphicsExtent(allfs));
        }
        owStopWaiting();
    });
}

function findChildren(f) {
    if (f.children.length === 0) {
        return [];
    } else {
        return ([].concat.apply([], f.children.map(findChildren))).concat(f.children);
    }
}

function getLayerIndex(f) {
    if (f) {
        if (typeof f.layer !== 'undefined') {
            return gs.layers.indexOf(f.layer);
        } else if (typeof f.attributes !== 'undefined' && typeof f.attributes.otype !== 'undefined') {
            var ot = f.attributes.otype;
            if (LINE_OTYPES.indexOf(ot) >= 0) {
                var li = gs.layers.indexOf('Power Lines');
            } else if (LOAD_OTYPES.indexOf(ot) >= 0) {
                var li = gs.layers.indexOf('Loads');
            } else if (ot === 'pole') {
                var li = gs.layers.indexOf('Poles');
            } else { // equipment
                var li = gs.layers.indexOf('Equipment');
            }
            return li;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function sourcePath(f, fs) {
    var pars = [f], par;
    while (1) {
        par = fs.filter(function (ff) {
            return (ff && typeof ff.attributes['secname'] !== 'undefined' && typeof f.attributes['parentsec'] !== 'undefined') ? ff.attributes['secname'] === f.attributes['parentsec'] : false;
        });
        if (par.length > 0) {
            par = par[0];
            if (pars.filter(function (p) {
                    return p.attributes['objectid'] === par.attributes['objectid']
                }).length > 0) {
                console.log('Loop found at ', pars, par);
                break;
            }
        } else {
            break;
        }
        pars.push(par);
        f = par;
    }
    return pars;
}


function sourceDist(f, fs) {
    // note that the first elememnt of source path is the feature itself so it needs to be excluded.
    return convLen(totalLength(sourcePath(f, fs).slice(1)), 'ml', 'ft');
}

function totalFeederLength(circ) {
    owStartWaiting();
    console.log('Measuring total length of feeder ', circ);
    var resQT1 = new esri.tasks.QueryTask(getMapLayerUrl('Power Lines'));
    var resQ1 = new esri.tasks.Query();
    resQ1.returnGeometry = true;
    resQ1.outSpatialReference = map.spatialReference;
    resQ1.where = "circuit ='" + circ + "'";
    resQ1.outFields = ['objectid'];
    resQT1.execute(resQ1).then(function (res) {
        var feederTotalConductorLength = totalLength(res.features);
        console.log('Feeder geometries received, total length: ', feederTotalConductorLength);
        addMessage('Total conductor length for feeder ' + circ + ': ' + toStr(feederTotalConductorLength, 0.1, true) + ' miles.', 'info');
        owStopWaiting();
    }, function (e) {
        console.log('Error measuring feeder total length. ', e)
        owStopWaiting();
    });
}

// set children for each feature - used to find all downstream 
// secnames from a starting secname.
function setChildrenForEachFeature(features) {
    
    // console.log('setChildrenForEachFeature...');
    features.forEach(function (f) {
        f.children = features.filter(function (f2) {
            return f2.attributes['parentsec'] === f.attributes['secname'];
        });
    });
}

function getNumLoadsDownLine(secname, features) {
    let filteredLoads = [];
    // console.log('getNumLoadsDownLine...');

    // get the feature for the secname passed in
    var l = features.filter(function (f) {
        return f.attributes['secname'] === secname;
    });

    if (l.length > 0) {
        l = l[0];
        // setChildrenForEachFeature(features);
        var fs = findChildren(l).concat(l);

        let LOAD_TYPES = ["residential","largeconsumer","load"];
        filteredLoads = fs.filter(lang.hitch(this, f => { 
            return LOAD_TYPES.includes(f.attributes.otype);
        }));
        if(dojo.byId('msgTitlePanes').innerHTML == 0)
                        {
                           dojo.byId('msgTitlePanes').innerHTML = ''; 
                        }
        console.log("filteredLoads = " + filteredLoads.length);
    } else {
        console.log('Line section not found for counting...');
        return;
    }

    return filteredLoads.length;
}

function countLoadsUnderLine(secname, circ, makeSelection) {
    makeSelection = makeSelection | false;
    owStartWaiting();
    console.log('Counting under on ', secname, circ);
    var resQT1 = new esri.tasks.QueryTask(getMapLayerUrl('Power Lines'));
    var resQT2 = new esri.tasks.QueryTask(getMapLayerUrl('Equipment'));
    var resQ1 = new esri.tasks.Query();
    resQ1.returnGeometry = true;
    resQ1.outSpatialReference = map.spatialReference;
    resQ1.where = "circuit ='" + circ + "'";
    resQ1.outFields = ['objectid', 'secname', 'parentsec', 'otype'];
    all([resQT1.execute(resQ1), resQT2.execute(resQ1)]).then(function (res) {
        var feederTotalConductorLength = totalLength(res[0].features);
        var features = res[0].features.concat(res[1].features);
        console.log('Feeder geometries received (counting)...');
        var l = features.filter(function (f) {
            return f.attributes['secname'] === secname;
        });
        if (l.length === 0) {
            console.log('Line section not found for counting...');
            owStopWaiting();
            return;
        } else {
            l = l[0];
        }
        if (registry.byId('printDistanceFromSource').checked) {
            addMessage('Distance of line start point from bay: ' + toStr(sourceDist(l, features), 1, true) + ' ft.', 'info');
        }
        features.forEach(function (f) {
            f.children = features.filter(function (f2) {
                return f2.attributes['parentsec'] === f.attributes['secname'];
            });
        });

        var fs = findChildren(l).concat(l);
        if (registry.byId('highlightDownStreamLines').checked) {
            bayHighlightingLayer.clear();
            fs.forEach(function (f) {
                f.setSymbol((f.geometry.type === 'polyline') ? ldLine : ldMarker);
                bayHighlightingLayer.add(f);
            });
        }


        var resQT1 = new esri.tasks.QueryTask(getMapLayerUrl('Loads'));
        var resQ1 = new esri.tasks.Query();
        resQ1.returnGeometry = true;
        resQ1.outSpatialReference = map.spatialReference;
        var ls = fs.map(function (f) {
            return f.attributes['secname'];
        }).join("','");
        resQ1.where = "parentsec in ('" + ls + "')";
        resQ1.outFields = ['objectid', 'secname', 'parentsec', 'equipref'];
        resQT1.execute(resQ1).then(function (res) {
            var c = 0;
            if (typeof res.features.length !== 'undefined') {
                c = res.features.length;
                console.log('Received load under desired lines, count:', c);
                var msg = 'There are ' + c + ' consumer(s) served by the selected line section.';
                if (c > 0) {
                    if (registry.byId('highlightDownStreamLoads').checked) {
                        if (!registry.byId('highlightDownStreamLines').checked) bayHighlightingLayer.clear();
                        res.features.forEach(function (f) {
                            f.setSymbol(ldMarker);
                            bayHighlightingLayer.add(f);
                        });
                    }
                    if (registry.byId('printDownStreamLoads').checked) {
                        msg += '<br>Consumer list: ' + res.features.map(function (f) {
                            return f.attributes['equipref'];
                        }).map(linkifySecname).join(', ') + '.';
                    }
                    if (registry.byId('printDownStreamLoadCoordinates').checked) {
                        msg += '<br>';
                        res.features.map(function (f) {
                            msg += (f.attributes['equipref'] + ',' + f.geometry.getLatitude() + ',' + f.geometry.getLongitude() + '<br>');
                        });
                    }
                }
                addMessage(msg, 'info');

                if (makeSelection) {
                    var selsecnames = secname + "','" + ls + "','" + res.features.map(function (f) {
                        return f.attributes['secname'];
                    }).join("','");
                    var selQ = new esri.tasks.Query();
                    selQ.returnGeometry = true;
                    selQ.outSpatialReference = map.spatialReference;
                    selQ.where = "secname in ('" + selsecnames + "')";
                    selQ.outFields = ['*']
                    queryLayers(selQ, ['Loads', 'Equipment', 'Power Lines']).then(function (r) {
                        if (registry.byId('reportLoadValuesDownStream').checked) {
                            var fs = map.infoWindow.features;
                            msg = '';
                            var totalLoad = 0, loadCount = 0;
                            fs.forEach(function (f) {
                                if (LOAD_OTYPES.indexOf(f.attributes['otype']) >= 0) {
                                    var p = f.attributes['phasecode'];
                                    var lr = f.attributes['equipref_ext'];
                                    var lt = 0, pf = 0;
                                    if (lr) {
                                        p.toLowerCase().split('').forEach(function (p) {
                                            lt += lr['kw_' + p];
                                        });
                                        pf = lr['pf'];
                                    }
                                    msg += [f.attributes['equipref'], f.attributes['phasecode'], toStr(lt), pf].join(',') + '<br>';
                                    totalLoad += lt;
                                    loadCount += 1;
                                }
                            });
                            msg += 'Total ' + loadCount.toString() + ' loads, total load: ' + toStr(totalLoad) + '.';
                            addMessage(msg, 'info');
                        }
                        owStopWaiting();
                    }, function(e){
                        console.log('Error selecting down stream loads.', e);
                        owStopWaiting();
                    });
                }else{
                    owStopWaiting();
                }
            } else {
                console.error('Error receiving loads under selected line section.');
                owStopWaiting();
            }
        });

        if (registry.byId('printTotalLosses').checked) {
            owStartWaiting();
            var resQT1 = new esri.tasks.QueryTask(getMapLayerUrl(gs.conf.pfResLayer));
            var retruesQ1 = new esri.tasks.Query();
            resQ1.returnGeometry = false;
            resQ1.where = "scenario= '" + caseStudyName + "' and secname in ('" + ls + "')";
            resQ1.outFields = ['secname', 'lr_a', 'lr_b', 'lr_c'];
            resQT1.execute(resQ1).then(function (res) {
                var tl_a = 0, tl_b = 0, tl_c = 0;
                if (typeof res.features.length !== 'undefined') {
                    console.log('Received losses for child line sections. Count: ', res.features.length);
                    res.features.forEach(function (f) {
                        tl_a += f.attributes['lr_a'];
                        tl_b += f.attributes['lr_b'];
                        tl_c += f.attributes['lr_c'];
                    });
                    var tl = tl_a + tl_b + tl_c;
                    var msg = 'Total loss for child line sections: ' + toStr(tl / 1000, 0.1, true) + 'kW, (A: ' + toStr(tl_a / 1000, 0.1, true) + ', B: ' + toStr(tl_b / 1000, 0.1, true) + ', C: ' + toStr(tl_c / 1000, 0.1) + ').'
                    addMessage(msg, 'info');
                } else {
                    console.error('Error receiving loss results for child line sections.');
                }
                owStopWaiting();
            });
        }
    });
}


function resultRowMaker(f, i) {
    if (!(f&&f.attributes&&f.geometry&&f.geometry.type)){
        return {};
    }
    var vb = gs.conf.analysis.baseV;
    var phases = ['a', 'b', 'c'];
    var att = f && f.attributes;
    att['len'] = f && f.geometry && f.geometry.type && f.geometry.type === 'polyline' ? toStr(esri.geometry.geodesicLengths([esri.geometry.webMercatorToGeographic(f.geometry)], esri.Units.MILES)[0], 1e-2, true) : 'NA';
    var t = att && att.otype?att.otype:null;
    var directCopy = ['secname', 'circuit', 'parentsec', 'len'];
    var mapped = directCopy.map(function (e) {
        return [e, e]
    });
    mapped.push(['nom_v', gs.conf.pfResField + '.nom_v']);
    if (['oh', 'ug'].indexOf(t) >= 0) { // conductor
        mapped.push(['rating', 'conductor' + gs.conf.eqPfx + '.rating']);
        mapped.push(['equipref', 'conductor']);
    } else { // equipment
        mapped.push(['rating', 'equipref' + gs.conf.eqPfx + '.rating']);
        mapped.push(['equipref', 'equipref']);
    }
    //var scaled = ['nom_v'];
    var comp2abs = ['v', 'c', 'l', 'p', 'pf'];
    var scaler = {'v': 1000, 'c': 1, 'l': 1000, 'p': 1000, 'nom_v': 1000, 'pf': 1};
    var acc = {'v': 0.001, 'c': 0.1, 'l': 0.1, 'p': 0.1, 'nom_v': 0.1, 'pf': 0.01, 'rating': 1};
    var ret = {};
    mapped.forEach(function (e) {
        ret[e[0]] = toStr(typeof scaler[e[0]] !== 'undefined' ? getAttr(att, e[1], null) / scaler[e[0]] : getAttr(att, e[1], null), typeof acc[e[0]] !== 'undefined' ? acc[e[0]] : null, true);
    });
    comp2abs.forEach(function (e) {
        phases.forEach(function (p) {
            var v = calcQuant(f, p, e);
            ret[e + '_' + p] = v === null ? null : toStr(v / scaler[e], acc[e], true);
        });
    });
    phases.forEach(function (p) { // need to replace parseFloat
        ret['vd' + '_' + p] = ret['v_' + p] === null ? null : toStr(vb * (1 - calcQuant(f, p, 'v') / calcQuant(f, p, 'nom_v')), 0.1, true);
        ret['ld' + '_' + p] = ret['c_' + p] === null ? null : toStr(calcQuant(f, p, 'c') / calcQuant(f, p, 'c_rating') * 100, 1, true);
    });
    return ret;
}

function getAttr(obj, attr, dv) {
    var p = attr.split('.');
    var res = obj;
    for (var i = 0; i < p.length; i++) {
        if (typeof res[p[i]] === 'undefined') return dv; else res = res[p[i]];
    }
    return res;
}


function clearAllSelections() {
    // should we also clear highlightings?
    ewHide();
    map.infoWindow.clearFeatures();
    owHide();
}

function ewShow() {
    // downAllWindows(bottom_z_index);
    var ew = registry.byId('attributeEditorContainer');
    var tw = document.getElementById('attributeEditorContainer');
    if (bayHighlightingLayer) {
        gs.state.infoLayerWasVisible = bayHighlightingLayer.visible;
        bayHighlightingLayer.setVisibility(false);
    }
    if ((dojo.byId('inserNewAssetsCB').checked)) {
        document.getElementById('attributeEditorWindowBack').style.display = "block";
        // add class meaning new
        tw.classList.add("new_asset_dialog");
    }
    else {
        tw.classList.remove("new_asset_dialog");
        downAllWindows(bottom_z_index);
        tw.style.zIndex = top_z_index;
    }
    ew.show();
    if (map.infoWindow.isShowing) {
        map.infoWindow.hide();
    }
    ewPatchStyle();
    setTimeout(function() {
        tw.style.left = "60px";
        tw.style.top = "60px";
        tw.classList.remove("fixedPositionForEditor");
    }, 100);
}

function ewHide() {
    console.log('In hide');
    if (bayHighlightingLayer) {
        bayHighlightingLayer.setVisibility(gs.state.infoLayerWasVisible);
    }
    assetsFeatureLayers.forEach(function (l) {
        l && l.clearSelection();
    });
    registry.byId('attributeEditorContainer').hide();
    document.getElementById('attributeEditorWindowBack').style.display = "none";
    if (typeof editToolbar !== 'undefined') {
        editToolbar.deactivate();
    }
}

function ewPatchStyle() {
    var ew = registry.byId('attributeEditorContainer');
    dojo.removeClass(ew.titleNode, "dijitInline");
    dojo.addClass(ew.titleNode, "infoPaneCount infoPaneIcon");
    dojo.removeClass(ew.domNode, "dijitContentPane");
    ew.domNode.style.width = "auto";
    ew.domNode.style.height = "auto";
    ew.canvas.removeAttribute("style");
    replyOverlayLocations();
}

function owStartWaiting() {
    dojo.removeClass('infoPaneSpinner', "infoPaneHidden");
}

function owStopWaiting() {
    dojo.addClass('infoPaneSpinner', "infoPaneHidden");
}

function owShow() {
    //dojo.byId("overlayInfoWindow").style.display="initial";
    //if (map.infoWindow.isShowing) { map.infoWindow.hide(); }
    // dojo.style(overlayInfoWindowContainer.domNode, 'visibility', 'hidden');  
    // overlayInfoWindowContainer.show().then(function () {  
    // dojo.style(overlayInfoWindowContainer.domNode, 'top', '64px');  
    // dojo.style(overlayInfoWindowContainer.domNode, 'left', '196px');
    // dojo.style(overlayInfoWindowContainer.domNode, 'position', 'absolute'); 
    // dojo.style(overlayInfoWindowContainer.domNode, 'visibility', 'visible'); 
    // });
    // downAllWindows(bottom_z_index);
    overlayInfoWindowContainer.domNode.style.zIndex = top_z_index;
    overlayInfoWindowContainer.show();
    lastSelFeat = null || map.infoWindow.getSelectedFeature();
    overlayInfoWindowContainer.containerNode.style.display = 'block';
    if (map.infoWindow.count <= 1) {
        dojo.query(".infoPaneMulti").addClass("infoPaneHidden");
    } else {
        dojo.byId('infoPaneCount').innerHTML = (map.infoWindow.selectedIndex + 1) + ' of ' + map.infoWindow.count;
        dojo.query(".infoPaneMulti").removeClass("infoPaneHidden");
    }
    owPatchStyle();
}

function owHide() {
    overlayInfoWindowContainer.hide();
    map.infoWindow.hide();
}

function owNext() {
    if (map.infoWindow.count > 1) {
        map.infoWindow.selectNext();
        lastSelFeat = map.infoWindow.getSelectedFeature();
    }
}

function owPerv() {
    if (map.infoWindow.count > 1) {
        map.infoWindow.selectPrevious();
        lastSelFeat = map.infoWindow.getSelectedFeature();
    }
}

function patchStyles() {
    siwUpdate();
    owPatchStyle();
}

function replyOverlayLocations() {
    gs.state.overlayLocations = gs.state.overlayLocations || [];
    gs.state.overlayLocations.forEach(function (o) {
        dojo.style(dojo.byId(o.id), {left: o.x + 'px', top: o.y + 'px'});
    });
}

function recordOverlayLocations() {
    var cpos = gs.conf.overlayList.map(function (o) {
        var op = domGeom.position(o);
        return {id: o, x: op.x, y: op.y};
    });
    if (!gs.state.overlayLocations || gs.state.overlayLocations.length !== gs.conf.overlayList.length) {
        gs.state.overlayLocations = cpos;
    }
    gs.conf.overlayList.forEach(function (o, i) {
        if (domStyle.get(o, "display") !== "none") gs.state.overlayLocations[i] = cpos[i];
    });
}

function owPatchStyle() {
    var ow = registry.byId('overlayInfoWindowContainer');
    dojo.removeClass(ow.titleNode, "dijitInline");
    dojo.addClass(ow.titleNode, "infoPaneCount infoPaneIcon");
    dojo.removeClass(ow.domNode, "dijitContentPane");
    dojo.addClass(ow.containerNode, "infoPaneContent");
    dojo.removeClass(ow.containerNode, "dojoxFloatingPaneContent");
    ow.domNode.style.width = "";
    ow.domNode.style.height = "";
    ow.domNode.getElementsByClassName('dojoxFloatingPaneCanvas')[0].removeAttribute("style");
    replyOverlayLocations();
}

function siwPatchStyle() {
    var g = registry.byId('shortInfoWindowContainer');
    dojo.removeClass(g.titleNode, "dijitInline");
    dojo.addClass(g.titleNode, "shortInfoWindowTitle");
    dojo.removeClass(g.domNode, "dijitContentPane");
    dojo.addClass(g.containerNode, "shortInfoWindowContent");
    dojo.removeClass(g.containerNode, "dojoxFloatingPaneContent");
    g.domNode.style.width = "";
    g.domNode.style.height = "";
    g.domNode.getElementsByClassName('dojoxFloatingPaneCanvas')[0].removeAttribute("style");

    g = registry.byId('attributeEditorContainer');
    dojo.removeClass(g.titleNode, "dijitInline");
    dojo.addClass(g.titleNode, "infoPaneCount infoPaneIcon");
    dojo.removeClass(g.domNode, "dijitContentPane");
    g.domNode.style.width = "";
    g.domNode.style.height = "";
    g.domNode.getElementsByClassName('dojoxFloatingPaneCanvas')[0].removeAttribute("style");
    replyOverlayLocations()
}

function siwUpdate() {
    when(gs.state.caseStudies, function () {
        // console.log(caseStudies);
        var g = registry.byId('shortInfoWindowContainer');
        if (gs.state.caseStudies && caseStudyName !== null) {
            var cont = [];
            if (getStudyProperty(caseStudyName, 'lscen')) {
                cont.push('<b>Load Profile:</b> ' + getStudyProperty(caseStudyName, 'lscen') + ', ' +
                    '<b>Scaling:</b> ' + toStr(getStudyProperty(caseStudyName, 'lscaling')));
            }
            if (getStudyProperty(caseStudyName, 'gscen')) {
                cont.push('<b>Gen Profile:</b> ' + getStudyProperty(caseStudyName, 'gscen') + ', ' +
                    '<b>Scaling:</b> ' + toStr(getStudyProperty(caseStudyName, 'gscaling')));
            }
            cont.push('<b>Voltage Thresholds:</b> ' + dojo.byId('vvTh1').value + ((registry.byId('vvUnit').value === 'v') ? 'V' : '%') + ', '+
                dojo.byId('vvTh2').value + ((registry.byId('vvUnit').value === 'v') ? 'V' : '%') +
                ', <b>Thermal Threshold:</b> ' + parseFloat(dojo.byId('tvTh').value) + '%');
            g.set('title', 'Study: ' + caseStudyName);
            g.set('content', '<div style="padding: 3px; border: 1px; border-color:black;">' + cont.join('<br>') + '</div>');
        } else {
            g.set('title', 'No Case Studies Available');
            g.set('content', '<div style="padding: 3px; border: 1px; border-color:black;"> </div>');
        }
        siwPatchStyle();
    });
}

function appStartWaiting(id, cls) {
    id = id || 'busyButton';
    cls = cls || "biActive";
    dojo.addClass(id, cls);
}

function appStopWaiting(id, cls) {
    id = id || 'busyButton';
    cls = cls || "biActive";
    dojo.removeClass(id, cls);
}

function saveEnv() {
    console.log('Saving the environment...'); // i thought this was a joke at first
    dojo.cookie("cVersion", json.stringify(gs.cVersion), {expires: 999999});
    dojo.cookie("restoreEnv", json.stringify(gs.conf.loadEnv), {expires: 999999});
    dojo.cookie("mapExtent", json.stringify(gs.state.lastExtent), {expires: 999999});
    //dojo.cookie("mapExtent", (map && map.extent)?json.stringify(map.extent):"", { expires: (map && map.extent)? 999999: -1 });
    dojo.cookie("activeCaseStudy", caseStudyName, {expires: 999999});
    if (gs.state.overlayLocations) dojo.cookie("overlayLocations", json.stringify(gs.state.overlayLocations), {expires: 999999});
    //var bm = basemapGallery.getSelected();
    //dojo.cookie("basemap", json.stringify(((bm) ? preTag(bm.title) : "")), { expires: 999999 });
    dojo.cookie("basemap", json.stringify(gs.conf.basemap), {expires: 999999});
    dojo.cookie("assetsLayersvisibility", (typeof assetsLayer !== 'undefined' && assetsLayer) ? json.stringify(assetsLayer.visibleLayers) : "", {expires: assetsLayer ? 999999 : -1});
    dojo.cookie("layersVisibility", json.stringify(gs.state.layersVisibility), {expires: 999999});
    dojo.cookie("gmapTiltDisabled", json.stringify(gs.conf.gmapTiltDisabled), {expires: 999999});
    dojo.cookie("detailedAssetsLayer", json.stringify(gs.conf.detailedAssetsLayer), {expires: 999999});
}

function cookieToVar(p) { // [cookie name, parent object, attr name, parser]
    var c = dojo.cookie(p[0]);
    if (typeof c !== 'undefined') {
        try {
            p[1][p[2]] = p[3] ? p[3](c) : c;
        } catch (e) {
            console.log("Error loading cookie ", p[0]);
        }
    }
}

function loadEnv() {
    cookieToVar(["restoreEnv", gs.conf, "loadEnv", json.parse]);
    cookieToVar(["cVersion", gs.state, "cVersion", json.parse]);

    // idk if this logic is doing what the console logs say
    if (gs.conf.loadEnv) {
        console.log('Session restore cookie found and loaded!');
    } else {
        console.log('Session restore cookie not found! Default restore behavior: ', gs.conf.loadEnv);
    }
    registry.byId('restoreSessionCB').set('checked', gs.conf.loadEnv);
    if (gs.state.cVersion === gs.cVersion) {
        console.log("Matching version, cookie is still good. :-)");
        if (gs.conf.loadEnv) {
            var cpec = [
                ["mapExtent", gs.state, "lastExtent", json.parse],
                ["activeCaseStudy", gs.state, "caseStudyName", null],
                ["overlayLocations", gs.state, "overlayLocations", json.parse],
                ["detailedAssetsLayer", gs.state, "detailedAssetsLayer", json.parse],
                ["gmapTiltDisabled", gs.conf, "gmapTiltDisabled", json.parse],
                ["basemap", gs.conf, "basemap", json.parse],
                ["layersVisibility", gs.state, "layersVisibility", json.parse],
                ["assetsLayersvisibility", gs.state, "assetsLayerVis", json.parse],
            ];
            cpec.forEach(cookieToVar);
            gs.state.lastExtent = new esri.geometry.Extent(gs.state.lastExtent);
            caseStudyName = typeof gs.state.caseStudyName !== 'undefined' ? gs.state.caseStudyName : null;
            registry.byId('detailedAssetsLayerCB').set('checked', gs.conf.detailedAssetsLayer);
        }
    } else {
        console.log("Modified version detected, will not consume the cookie. :-)");
    }
}
