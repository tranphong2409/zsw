sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var BlockTrvlDetail = BlockBase.extend("sap.ui.project.e2etm.blocks.AccDetails", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.project.e2etm.view.BUSR.AdvDetails",
					type: "XML"
				}
			},
	
		}
	});
	return BlockTrvlDetail;
}, true);