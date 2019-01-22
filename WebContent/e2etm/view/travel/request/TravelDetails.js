sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var TravelDetails = BlockBase.extend("sap.ui.project.e2etm.view.travel.request.TravelDetails", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.project.e2etm.view.travel.request.TravelDetails",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.ui.project.e2etm.view.travel.request.TravelDetails",
					type: "XML"
				}
			}
		}
	});
	return TravelDetails;
}, true);