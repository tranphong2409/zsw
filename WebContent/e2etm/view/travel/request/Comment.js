sap.ui.define(['sap/uxap/BlockBase'], function (BlockBase) {
	"use strict";

	var Comment = BlockBase.extend("sap.ui.project.e2etm.view.travel.request.Comment", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.project.e2etm.view.travel.request.Comment",
					type: "XML"
				},
				Expanded: {
					viewName: "sap.ui.project.e2etm.view.travel.request.Comment",
					type: "XML"
				}
			}
		}
	});
	return Comment;
}, true);