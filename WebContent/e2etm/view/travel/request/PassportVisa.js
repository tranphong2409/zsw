sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var PassportVisa = BlockBase.extend("sap.ui.project.e2etm.view.travel.request.PassportVisa", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.project.e2etm.view.travel.request.PassportVisa",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.ui.project.e2etm.view.travel.request.PassportVisa",
					type: "XML"
				}
			}
		}
	});
	return PassportVisa;
}, true);