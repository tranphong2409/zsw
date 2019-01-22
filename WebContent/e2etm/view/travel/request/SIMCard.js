sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var SIMCard = BlockBase.extend("sap.ui.project.e2etm.view.travel.request.SIMCard", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.project.e2etm.view.travel.request.SIMCard",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.ui.project.e2etm.view.travel.request.SIMCard",
					type: "XML"
				}
			}
		}
	});
	return SIMCard;
}, true);