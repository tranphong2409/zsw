sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var AccmINTL = BlockBase.extend("sap.ui.project.e2etm.view.travel.request.AccmINTL", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.project.e2etm.view.travel.request.AccmINTL",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.ui.project.e2etm.view.travel.request.AccmINTL",
					type: "XML"
				}
			}
		}
	});
	return AccmINTL;
}, true);