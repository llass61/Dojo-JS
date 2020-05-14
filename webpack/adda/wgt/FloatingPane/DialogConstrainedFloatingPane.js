define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/declare",
		"dojox/layout/FloatingPane", "dojo/touch"],
function (
	kernel, lang, winUtil, declare, FloatingPane, k) {

	var DialogConstrainedFloatingPane = dojo.declare(dijit.Dialog, {

		postCreate: function () {
			this.inherited(arguments);
			this.moveable = new dojo.dnd.move.parentConstrainedMoveable(
				this.domNode, {
					handle: this.focusNode,
					area: "content",
					within: true
				}
			);
		},
		startup:function() {
			if (!this._started) {
				this.inherited(arguments);
				
				this.connect(this.focusNode, k.press, "bringToTop");
				this.connect(this.domNode, k.press, "bringToTop");
				this._started = !0
			}
		},
		bringToTop: function() {

		}
	});

	return DialogConstrainedFloatingPane;
});
