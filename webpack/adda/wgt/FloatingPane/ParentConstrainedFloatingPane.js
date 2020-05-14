define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/declare",
		"dojox/layout/FloatingPane"],
function (
	kernel, lang, winUtil, declare, FloatingPane) {

	var ParentConstrainedFloatingPane = dojo.declare(dojox.layout.FloatingPane, {

		postCreate: function () {
			this.inherited(arguments);
			this.moveable = new dojo.dnd.move.parentConstrainedMoveable(
				this.domNode, {
					handle: this.focusNode,
					area: "content",
					within: true
				}
			);
		}

	});

	return ParentConstrainedFloatingPane;
});
