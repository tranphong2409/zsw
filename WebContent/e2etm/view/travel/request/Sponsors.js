sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var Sponsors = BlockBase.extend("sap.ui.project.e2etm.view.travel.request.Sponsors", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.project.e2etm.view.travel.request.Sponsors",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.ui.project.e2etm.view.travel.request.Sponsors",
					type: "XML"
				}
			}
		}
	});
	return Sponsors;
}, true);