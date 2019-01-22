sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var AdvanceMoney = BlockBase.extend("sap.ui.project.e2etm.view.travel.request.AdvanceMoney", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.project.e2etm.view.travel.request.AdvanceMoney",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.ui.project.e2etm.view.travel.request.AdvanceMoney",
					type: "XML"
				}
			}
		}
	});
	return AdvanceMoney;
}, true);