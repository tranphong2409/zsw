sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var AccmDOM = BlockBase.extend("sap.ui.project.e2etm.view.travel.request.AccmDOM", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.project.e2etm.view.travel.request.AccmDOM",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.ui.project.e2etm.view.travel.request.AccmDOM",
					type: "XML"
				}
			}
		}
	});
	return AccmDOM;
}, true);