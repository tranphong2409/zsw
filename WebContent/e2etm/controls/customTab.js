sap.ui.define([
	"sap/ui/commons/TabStrip",
	"sap/ui/commons/Tab"
], function(TabStrip, Tab) {
	"use strict";
	return TabStrip.extend("sap.ui.project.e2etm.controls.customTab", {
		metadata: {
			properties: {
				editModeEnabled: {
					type: "boolean",
					defaultValue: true
				}
			},
			defaultAggregation: "tabs",
			aggregations: {
				tabs: {
					type: "sap.ui.commons.Tab",
					multiple: true,
					singularName: "tab"
				}
			}
		},

		init: function() {

		},
		onBeforeRendering: function(oControl) {
			//set content data
			var aControls = this.getAggregation("tabs");
			for (var item = 0; item < aControls.length; item++) {
				var oTab = aControls[item];
				oControl.srcControl.addTab(oTab);
			}
		},
		onAfterRendering: function(oControl) {

	

		},
		renderer: function(oRM, oControl) {

			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.writeClasses();
			oRM.write(">");

			//show or hide footer
			if (oControl.getEditModeEnabled() === true) {
				oControl.addStyleClass("cccc");
			}
			oRM.write("</div>");

		}
	});
});