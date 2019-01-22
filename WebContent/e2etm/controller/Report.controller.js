jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");

sap.ui.controller("sap.ui.project.e2etm.controller.Report", {

/*------------------------CONTROLLER EVENT AREA BEGIN------------------------*/
	// This event is called only one time
	onInit : function(evt) {
		oReportThis = this;
		oReportThis.afterRenderDeffered = $.Deferred();
		var oTable = this.getView().byId("tableDialogBoxes");
		for (var i = 0; i < oTable.getColumns().length; i++) {
			var column = oTable.getColumns()[i];
			if (column.getLabel().getText() == "START DATE" || column.getLabel().getText() == "END DATE") {
				column.setFilterType(dateType);
			}
		}
		
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(oReportThis.onRouteMatched, oReportThis);
	},
	// This event is called only one time
	onAfterRendering: function(curEvt) {
		try {
			setTimeout(function() {
				oReportThis.afterRenderDeffered.resolve();
			}, 500);
		} catch(exc) {}
	},
	// This event is called everytime the URL route is matched
	onRouteMatched : function(curEvt) {
		var routeName = null;
		if (curEvt.mParameters != null) {
			routeName = curEvt.getParameter("name");
		}
		if (routeName == "report") {
			oReportThis.getView().byId("flexboxDeputationBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxECOBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxManagerBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxTAXBoxes").setVisible(false);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oReportThis);
			$.when(oReportThis.afterRenderDeffered).then(function() {
				setTimeout(function() {
					oReportThis.getReportData();
				}, 500);
			});
		}
	},
/*------------------------CONTROLLER EVENT AREA BEGIN------------------------*/

/*------------------------USER EVENT HANDLER AREA BEGIN------------------------*/	
	backPress : function(evt) {
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},

	bindDialogBoxesTable: function(sTitle,iBox, iOrder, sCountry){
		if (iOrder == "") {
			iOrder = "1";
		}
		var oTable = oReportThis.getView().byId("DialogBoxes").getItems()[1].getItems()[0];
		for (var i =0; i < oTable.getColumns().length; i++) {
			oTable.getColumns()[i].setFiltered(false);
			oTable.getColumns()[i].setFilterValue("");
			oTable.getColumns()[i].setSorted(false);
		}
		
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setSizeLimit(1500);
		var pernr = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
		if( iBox == 3 ){
			var sUrl = sServiceUrl + "GetDepDetails?Box='" + iBox + "'&Order='" + "" +"'&PERNR='" + pernr + "'&Role='" + 
			sap.ui.getCore().getModel("profile").getData().currentRole + "'&CntryID='" + sCountry + "'&$format=json";
		}else{
			var sUrl = sServiceUrl + "GetDepDetails?Box='" + iBox + "'&Order='" + iOrder +"'&PERNR='" + pernr + "'&Role='" + 
			sap.ui.getCore().getModel("profile").getData().currentRole + "'&CntryID='" + "" + "'&$format=json";
		}
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oReportThis);
		var post = $.ajax({
			url: sUrl,
			type: "GET",
			cache: false
		});
		post.done(function(result){
			if (result != null) {
				for (var i = 0; i < result.d.results.length; i++) {
					result.d.results[i].ZZ_DEP_DAYS = parseInt(result.d.results[i].ZZ_DEP_DAYS);
				}
				oModel.setData(result.d.results);
			}
		}).then(function(){
			oTable.setModel(oModel);
			oTable.bindRows("/");
			try {
				var oBox = oReportThis.getView().byId("DialogBoxes").getItems()[0].getItems()[1].getItems()[0];
				if (oBox.getItems().length > 0) {
					for (var i = 0; i < oBox.getItems().length; i++) {
						oBox.getItems()[i].removeStyleClass("box_selected");
					}
					oBox.getItems()[iOrder - 1].addStyleClass("box_selected");
				}

				if( sap.ui.getCore().getModel("profile").getData().currentRole == "GRM"  ){
					for (var i = 0; i < oReportThis.getView().byId("flexboxManagerBoxes").getItems().length; i++) {
						oReportThis.getView().byId("flexboxManagerBoxes").getItems()[i].removeStyleClass("selected");
					}
					oReportThis.getView().byId("flexboxManagerBoxes").getItems()[iBox - 1].addStyleClass("selected");
				}else if( sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU"  ){
					for (var i = 0; i < oReportThis.getView().byId("flexboxDeputationBoxes").getItems().length; i++) {
						oReportThis.getView().byId("flexboxDeputationBoxes").getItems()[i].removeStyleClass("selected");
					}
					oReportThis.getView().byId("flexboxDeputationBoxes").getItems()[iBox - 1].addStyleClass("selected");
				}else if( sap.ui.getCore().getModel("profile").getData().currentRole == "ECO"  ){
					for (var i = 0; i < oReportThis.getView().byId("flexboxECOBoxes").getItems().length; i++) {
						oReportThis.getView().byId("flexboxECOBoxes").getItems()[i].removeStyleClass("selected");
					}
					oReportThis.getView().byId("flexboxECOBoxes").getItems()[iBox - 1].addStyleClass("selected");
				}else if( sap.ui.getCore().getModel("profile").getData().currentRole == "TAX"  ){
					for (var i = 0; i < oReportThis.getView().byId("flexboxTAXBoxes").getItems().length; i++) {
						oReportThis.getView().byId("flexboxTAXBoxes").getItems()[i].removeStyleClass("selected");
					}
					oReportThis.getView().byId("flexboxTAXBoxes").getItems()[iBox - 1].addStyleClass("selected");
				}
			} catch(exc) {}
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oReportThis);
		});
	},

	onDialogBoxesPress: function(evt){
		var iBox = evt.getSource().getId().split("_")[1];
		var iOrder = evt.getSource().getId().split("_")[2];
		var sCountry = "";
		if (evt.getSource().getId().split("_")[3] != null) {
			sCountry = evt.getSource().getId().split("_")[3];
		}
		oReportThis.bindDialogBoxesTable(evt.getSource().getTitle(), iBox + "", (iOrder) + "", sCountry);
	},

	onManagerMorePress: function(evt){
		oReportThis.getView().byId("flexboxDialogBoxes").setVisible(true);
		var iBox = evt.getSource().getId().substr( evt.getSource().getId().length - 1, 1 );
		var oBox = oReportThis.getView().byId("DialogBoxes").getItems()[0].getItems()[1].getItems()[0];

		var oModel;
		if( sap.ui.getCore().getModel("profile").getData().currentRole == "GRM"  ){
			oModel = oReportThis.getView().byId("flexboxManagerBoxes").getModel();
		}else if( sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU"  ){
			oModel = oReportThis.getView().byId("flexboxDeputationBoxes").getModel();
		}else if( sap.ui.getCore().getModel("profile").getData().currentRole == "ECO"  ){
			oModel = oReportThis.getView().byId("flexboxECOBoxes").getModel();
		}else if( sap.ui.getCore().getModel("profile").getData().currentRole == "TAX"  ){
			oModel = oReportThis.getView().byId("flexboxTAXBoxes").getModel();
		}

		var oSettingFlexbox = {};
		oBox.destroyItems();
		var iId = 1;
		for(iIndex in oModel.getData()){
			if( oModel.getData()[iIndex].Box == iBox ){
				if (iBox == 3) {
					var oItem = new sap.m.StandardListItem("Box_" + iBox + "_" + iId + "_" + oModel.getData()[iIndex].Description);
				} else {
					var oItem = new sap.m.StandardListItem("Box_" + iBox + "_" + iId);
				}
				iId++;
				oItem.setTooltip(sap.ui.project.e2etm.util.Formatter.formatCountry(oModel.getData()[iIndex].Description));
				oItem.setTitle(sap.ui.project.e2etm.util.Formatter.formatCountry(oModel.getData()[iIndex].Description));
				oItem.setDescription(oModel.getData()[iIndex].TotalCount);
				oItem.setType("Navigation");
				oItem.attachPress({}, oReportThis.onDialogBoxesPress);
				oBox.addItem(oItem);
			}
		}
		if(evt.getSource().getTooltip() == "More"){
			var iOrder = "";
			var sTitle = "ALL REQUESTS";
		}else{
			var iOrder = evt.getSource().getParent().getId().substr( evt.getSource().getParent().getId().length - 1, 1 );
			var sTitle = evt.getSource().getTooltip();
		}
		try{
			if( iBox == 3 ){
				var ctry = "";
				try {
					ctry = evt.getSource().getAlt();
				} catch(exc) {
					for(iIndex in oModel.getData()){
						if( oModel.getData()[iIndex].Box == 3 ){
							ctry = oModel.getData()[iIndex].Description;
							break;
						}
					}
				}
				oReportThis.bindDialogBoxesTable(sTitle,iBox,iOrder,ctry);
			}else{
				oReportThis.bindDialogBoxesTable(sTitle,iBox,iOrder,"");
			}
		}catch(ex){}
	},
	
	onReportTableFilter : function(curEvt) {
		var tableTobeFiltered = this.getView().byId("tableDialogBoxes");
	    var filterVal = curEvt.mParameters.value;
	    var filterCol = curEvt.mParameters.column.getLabel().getText();
	    var filters = [];
	    var filter1 = null;
	    var date = null;
	    
	    var numberOfRows = 0;
	    if (this.getView().byId("tableDialogBoxes").getModel().getData() != null) {
	    	numberOfRows = this.getView().byId("tableDialogBoxes").getModel().getData().length;
	    }
	    
	    if (numberOfRows == 0) {
	    	if (filterVal == "") {
	    		curEvt.mParameters.column.setFiltered(false);
	    	} else {
	    		curEvt.mParameters.column.setFiltered(true);
	    	}
	    	throw new Error("There is no record to be filtered!");
	    }
	    
	    // Check which column is filtered
	    if (filterVal != "") {
	    	if (filterCol == "ST.DATE" || filterCol == "TRAVEL FROM" || filterCol == "START DATE") {
	    		// format value
	    		filterVal = sap.ui.project.e2etm.util.StaticUtility.convertStringToSAPPosibleValue(filterVal);
	    		filter1 = new sap.ui.model.Filter("ZZ_DEP_STDATE", sap.ui.model.FilterOperator.Contains, filterVal);
	    	} else if (filterCol == "E.DATE" || filterCol == "TRAVEL TO" || filterCol == "END DATE") {
	    		// format value
	    		filterVal = sap.ui.project.e2etm.util.StaticUtility.convertStringToSAPPosibleValue(filterVal);
	    		filter1 = new sap.ui.model.Filter("ZZ_DEP_ENDATE", sap.ui.model.FilterOperator.Contains, filterVal);
	    	} else if (filterCol == "RECEIVED DATE") {
	    		// format value
	    		filterVal = sap.ui.project.e2etm.util.StaticUtility.convertStringToSAPPosibleValue(filterVal);
	    		filter1 = new sap.ui.model.Filter("ZZ_DEPU_ASSG_DATE", sap.ui.model.FilterOperator.Contains, filterVal);
	    	}
	    	if (filter1 != null) {
	    		filters.push(filter1);
	    	}
	    } else {
	    	if (filterCol == "ST.DATE" || filterCol == "TRAVEL FROM" || filterCol == "START DATE") {
	    		curEvt.mParameters.column.setFiltered(false);
	    	} else if (filterCol == "E.DATE" || filterCol == "TRAVEL TO" || filterCol == "END DATE") {
	    		curEvt.mParameters.column.setFiltered(false);
	    	} else if (filterCol == "RECEIVED DATE") {
	    		curEvt.mParameters.column.setFiltered(false);
	    	}
	    }
	    for (var i = 0; i < tableTobeFiltered.getBinding("rows").aApplicationFilters.length; i++) {
	    	if (filterCol == "ST.DATE" || filterCol == "TRAVEL FROM" || filterCol == "START DATE") {
	    		if (filterVal == "") {
	    			if (tableTobeFiltered.getBinding("rows").aApplicationFilters[i].sPath == "ZZ_DEP_STDATE") {
	    				tableTobeFiltered.getBinding("rows").aApplicationFilters[i].oValue1 = "";
	    			}
	    		}
	    		if (tableTobeFiltered.getBinding("rows").aApplicationFilters[i].sPath == "ZZ_DEP_ENDATE") {
	    			filters.push(tableTobeFiltered.getBinding("rows").aApplicationFilters[i]);
	    		}
	    	} else if (filterCol == "E.DATE" || filterCol == "TRAVEL TO" || filterCol == "END DATE") {
	    		if (filterVal == "") {
	    			if (tableTobeFiltered.getBinding("rows").aApplicationFilters[i].sPath == "ZZ_DEP_ENDATE") {
	    				tableTobeFiltered.getBinding("rows").aApplicationFilters[i].oValue1 = "";
	    			}
	    		}
	    		if (tableTobeFiltered.getBinding("rows").aApplicationFilters[i].sPath == "ZZ_DEP_STDATE") {
	    			filters.push(tableTobeFiltered.getBinding("rows").aApplicationFilters[i]);
	    		}
	    	} else if (filterCol == "RECEIVED DATE") {
	    		if (filterVal == "") {
	    			if (tableTobeFiltered.getBinding("rows").aApplicationFilters[i].sPath == "ZZ_DEPU_ASSG_DATE") {
	    				tableTobeFiltered.getBinding("rows").aApplicationFilters[i].oValue1 = "";
	    			}
	    		}
	    	} else {
	    		continue;
	    	}
	    }
	    tableTobeFiltered.getBinding("rows").filter(filters, sap.ui.model.FilterType.Application);
	},

	getReportData : function() {
		// Display Fragment based on role
		if (sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU") {
			oReportThis.getView().byId("flexboxDeputationBoxes").setVisible(true);
			oReportThis.getView().byId("flexboxECOBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxManagerBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxTAXBoxes").setVisible(false);
		} else if (sap.ui.getCore().getModel("profile").getData().currentRole == "GRM") {
			oReportThis.getView().byId("flexboxDeputationBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxECOBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxManagerBoxes").setVisible(true);
			oReportThis.getView().byId("flexboxTAXBoxes").setVisible(false);
		} else if (sap.ui.getCore().getModel("profile").getData().currentRole == "ECO") {
			oReportThis.getView().byId("flexboxDeputationBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxECOBoxes").setVisible(true);
			oReportThis.getView().byId("flexboxManagerBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxTAXBoxes").setVisible(false);
		} else if (sap.ui.getCore().getModel("profile").getData().currentRole == "TAX") {
			oReportThis.getView().byId("flexboxDeputationBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxECOBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxManagerBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxTAXBoxes").setVisible(true);
		} else {
			oReportThis.getView().byId("flexboxDeputationBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxECOBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxManagerBoxes").setVisible(false);
			oReportThis.getView().byId("flexboxTAXBoxes").setVisible(false);
		}

		var get = $.ajax({
			url: sServiceUrl + "/GetDepCounts?PERNR='" + sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR + 
			"'&Role='" + sap.ui.getCore().getModel("profile").getData().currentRole + "'&$format=json",
			type: "GET",
			cache: false
		});
		get.fail(function(err) {
			alert("Error occurs");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oReportThis);
		});
		get.done(function(oData){
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setSizeLimit(1500);
			delete oData.d.results["__metadata"];
			oModel.setData(oData.d.results); 
			oReportThis.getView().byId("pageReport").setModel(oModel);
			oReportThis.getView().byId("flexboxDialogBoxes").setVisible(false);

			oReportThis.getView().byId("flexboxDialogBoxes").setVisible(true);
			var iBox = 1;
			var oBox = oReportThis.getView().byId("DialogBoxes").getItems()[0].getItems()[1].getItems()[0];
			var oModel;
			if( sap.ui.getCore().getModel("profile").getData().currentRole == "GRM"  ){
				oModel = oReportThis.getView().byId("flexboxManagerBoxes").getModel();
			}else if( sap.ui.getCore().getModel("profile").getData().currentRole == "DEPU"  ){
				oModel = oReportThis.getView().byId("flexboxDeputationBoxes").getModel();
			}else if( sap.ui.getCore().getModel("profile").getData().currentRole == "ECO"  ){
				oModel = oReportThis.getView().byId("flexboxECOBoxes").getModel();
			}else if( sap.ui.getCore().getModel("profile").getData().currentRole == "TAX"  ){
				oModel = oReportThis.getView().byId("flexboxTAXBoxes").getModel();
			}
			var oSettingFlexbox = {};
			oBox.destroyItems();
			var iId = 1;
			for(iIndex in oModel.getData()){
				if( oModel.getData()[iIndex].Box == iBox ){
					if (iBox == 3) {
						var oItem = new sap.m.StandardListItem("Box_" + iBox + "_" + iId + "_" + oModel.getData()[iIndex].Description);
					} else {
						var oItem = new sap.m.StandardListItem("Box_" + iBox + "_" + iId);
					}
					iId++;
					oItem.setTooltip(sap.ui.project.e2etm.util.Formatter.formatCountry(oModel.getData()[iIndex].Description));
					oItem.setTitle(sap.ui.project.e2etm.util.Formatter.formatCountry(oModel.getData()[iIndex].Description));
					oItem.setDescription(oModel.getData()[iIndex].TotalCount);
					oItem.setType("Navigation");
					oItem.attachPress({}, oReportThis.onDialogBoxesPress);
					oBox.addItem(oItem);
				}
			}
			oReportThis.bindDialogBoxesTable("ALL REQUESTS",1,1,"");

			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oReportThis);
		});
	},

	onDownloadExcel : function(evt) {
		var oTable = oReportThis.getView().byId("DialogBoxes").getItems()[1].getItems()[0];
		var jsonData = oTable.getModel().getData();
		var exportObj = oTable.exportData();
		exportObj.saveFile();
	},
/*------------------------USER EVENT HANDLER AREA BEGIN------------------------*/
});