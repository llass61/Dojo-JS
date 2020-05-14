define(["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/declare",
		"dojox/layout/FloatingPane"],
	function (
		kernel, lang, winUtil, declare, FloatingPane) {

		var BoxConstrainedFloatingPane = dojo.declare(dojox.layout.FloatingPane, {

			postCreate: function () {
				this.inherited(arguments);
				this.moveable = new dojo.dnd.move.boxConstrainedMoveable(
					this.domNode, {
						handle: this.focusNode,
						box: { l: 10, t: 10, w: 400, h: 400 },
						within: true
					}
				);
			}

		});

		return BoxConstrainedFloatingPane;
	});