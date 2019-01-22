sap.ui.jsview("sap.ui.project.e2etm.static-view.App", {

	createContent: function (oController) {
		// to avoid scroll bars on desktop the root view must be set to block display
		this.setDisplayBlock(true);
		
		// create app
		this.app = new sap.m.App("appID", { defaultTransitionName: "slide" });
		
		return this.app;
	},
});