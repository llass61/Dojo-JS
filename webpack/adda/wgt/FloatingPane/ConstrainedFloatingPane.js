define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/declare",
        "dojox/layout/FloatingPane"],
function (
    kernel, lang, winUtil, declare, FloatingPane) {

    var ConstrainedFloatingPane = dojo.declare(dojox.layout.FloatingPane, {

        postCreate: function () {
            this.inherited(arguments);
            this.moveable = new dojo.dnd.move.constrainedMoveable(
                this.domNode, {
                    handle: this.focusNode,
                    constraints: function () {
                        var coordsBody = dojo.coords(dojo.body());
                        // or
                        var coordsWindow = {
                            l: 0,
                            t: 0,
                            w: window.innerWidth,
                            h: window.innerHeight
                        };

                        return coordsWindow;
                    },
                    within: true
                }
            );
        }
    });

    return ConstrainedFloatingPane;
});