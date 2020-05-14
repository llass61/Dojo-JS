define(["dojo/_base/kernel","dojo/_base/lang","dojo/_base/window","dojo/_base/declare",
		"dojo/_base/fx","dojo/_base/connect","dojo/_base/array","dojo/_base/sniff",
		"dojo/window","dojo/dom","dojo/dom-class","dojo/dom-geometry","dojo/dom-construct",
		"dijit/_TemplatedMixin","dijit/_Widget","dijit/BackgroundIframe","dojo/dnd/Moveable",
		"dojox/layout/ContentPane","dojo/text!./myInfoPane.html"], 
	function(
		kernel, lang, winUtil, declare, baseFx, connectUtil, arrayUtil, 
		has, windowLib, dom, domClass, domGeom, domConstruct, TemplatedMixin, Widget, BackgroundIframe, 
		Moveable, ContentPane, template){
	
var myInfoPane = declare("gridsight.gsInfoPane", [ ContentPane, TemplatedMixin ],{
	// summary:
	//		A non-modal Floating window.
	// description:
	//		Makes a `dojox.layout.ContentPane` float and draggable by it's title [similar to TitlePane]
	//		and over-rides onClick to onDblClick for wipeIn/Out of containerNode

	// closable: Boolean
	//		Allow closure of this Node
	closable: true,

	// maxable: Boolean
	//		Horrible param name for "Can you maximize this floating pane?"
	maxable: false,

	

	// title: String
	//		Title to use in the header
	title: "",

	// duration: Integer
	//		Time is MS to spend toggling in/out node
	duration: 400,
	
	map: null,

	/*=====
	// iconSrc: String
	//		[not implemented yet] will be either icon in titlepane to left
	//		of Title, and/or icon show when docked in a fisheye-like dock
	//		or maybe dockIcon would be better?
	iconSrc: null,
	=====*/

	// contentClass: String
	//		The className to give to the inner node which has the content
	contentClass: "infoPaneContent",

	// animation holders for toggle
	_showAnim: null,
	_hideAnim: null,

	// privates:
	_restoreState: {},
	_allFPs: [],
	_startZ: 100,

	templateString: template,
	
	attributeMap: lang.delegate(Widget.prototype.attributeMap, {
		title: { type:"innerHTML", node:"titleNode" }
	}),
	
	postCreate: function(){
		this.inherited(arguments);
		
		new Moveable(this.domNode,{ handle: this.focusNode });
		//this._listener = dojo.subscribe("/dnd/move/start",this,"bringToTop");

		if(!this.closable){ this.closeNode.style.display = "none"; }
		if(!this.maxable){
			this.maxNode.style.display = "none";
			this.restoreNode.style.display = "none";
		}
		this._allFPs.push(this);
		this.domNode.style.position = "absolute";
		
		this.bgIframe = new BackgroundIframe(this.domNode);
		this._naturalState = domGeom.position(this.domNode);
	},
	
	startup: function(){
		if(this._started){ return; }
		
		this.inherited(arguments);

		this.connect(this.focusNode,"onmousedown","bringToTop");
		this.connect(this.domNode,	"onmousedown","bringToTop");

		// Initial resize to give child the opportunity to lay itself out
		this.resize(domGeom.position(this.domNode));
		
		this._started = true;
	},

	setTitle: function(/* String */ title){
		// summary:
		//		Update the Title bar with a new string
		kernel.deprecated("pane.setTitle", "Use pane.set('title', someTitle)", "2.0");
		this.set("title", title);
	},
		
	close: function(){
		// summary:
		//		Close and destroy this widget
		if(!this.closable){ return; }
		connectUtil.unsubscribe(this._listener);
		this.hide(lang.hitch(this,function(){
			this.destroyRecursive();
		}));
	},

	hide: function(/* Function? */ callback){
		// summary:
		//		Close, but do not destroy this FloatingPane
		baseFx.fadeOut({
			node:this.domNode,
			duration:this.duration,
			onEnd: lang.hitch(this,function() {
				this.domNode.style.display = "none";
				this.domNode.style.visibility = "hidden";
				if(callback){
					callback();
				}
			})
		}).play();
	},

	show: function(/* Function? */callback){
		// summary:
		//		Show the FloatingPane
		var anim = baseFx.fadeIn({node:this.domNode, duration:this.duration,
			beforeBegin: lang.hitch(this,function(){
				this.domNode.style.display = "";
				this.domNode.style.visibility = "visible";
				if (typeof callback === "function") { callback(); }
			})
		}).play();
		// use w / h from content box dimensions and x / y from position
		var contentBox = domGeom.getContentBox(this.domNode)
		this.resize(lang.mixin(domGeom.position(this.domNode), {w: contentBox.w, h: contentBox.h}));
		this._onShow(); // lazy load trigger
	},

	maximize: function(){
		// summary:
		//		Make this FloatingPane full-screen (viewport)
		if(this._maximized){ return; }
		this._naturalState = domGeom.position(this.domNode);
		domClass.add(this.focusNode,"floatingPaneMaximized");
		this.resize(windowLib.getBox());
		this._maximized = true;
	},
	
	prev: function(){
		// summary:
		//		goes to the previous info from map
		if(this.map.infoWindow.count>1){this.map.infoWindow.selectPrevious();}
	},
	
	next: function(){
		// summary:
		//		goes to the next info from map
		if(this.map.infoWindow.count>1){this.map.infoWindow.selectNext();}
	},

	toggleRoll: function(){
		// summary:
		//		Make this info pane toggle between rolled in and rolled out
		console.log('info Window: '+this.containerNode.style.display)
		if(this.containerNode.style.display==='none'){
			this.containerNode.style.display='block';
		}else{
			this.containerNode.style.display='none';
		}
	},	
	
	_restore: function(){
		if(this._maximized){
			this.resize(this._naturalState);
			domClass.remove(this.focusNode,"floatingPaneMaximized");
			this._maximized = false;
		}
	},
	
	bringToTop: function(){
		// summary:
		//		bring this FloatingPane above all other panes
		var windows = arrayUtil.filter(
			this._allFPs,
			function(i){
				return i !== this;
			},
		this);
		windows.sort(function(a, b){
			return a.domNode.style.zIndex - b.domNode.style.zIndex;
		});
		windows.push(this);
		
		arrayUtil.forEach(windows, function(w, x){
			w.domNode.style.zIndex = this._startZ + (x * 2);
			domClass.remove(w.domNode, "dojoxFloatingPaneFg");
		}, this);
		domClass.add(this.domNode, "dojoxFloatingPaneFg");
	},
	
	destroy: function(){
		// summary:
		//		Destroy this FloatingPane completely
		this._allFPs.splice(arrayUtil.indexOf(this._allFPs, this), 1);
		this.inherited(arguments);
	}
});

return myInfoPane;
});