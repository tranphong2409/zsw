sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockTrvlDetail = BlockBase.extend("sap.ui.project.e2etm.blocks.TravelDetails", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.project.e2etm.view.BUSR.TravelDetails",
					type: "XML",
					controllerName:"sap.ui.project.e2etm.view.BUSR.TravelDetails"
				}
			},
	
		}
	});
	return BlockTrvlDetail;
}, true);