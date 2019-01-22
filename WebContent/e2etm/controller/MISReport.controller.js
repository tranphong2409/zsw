jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.controller("sap.ui.project.e2etm.controller.MISReport", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.MISReport
	 */
	onInit : function() {
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
		var properties = [];
		oModel.attachMetadataLoaded(null, jQuery.proxy(function() {
			var oMetadata = oModel.getServiceMetadata();
			var enitytypes = oMetadata.dataServices.schema[0].complexType;
			$.each(enitytypes, function(index, entity) {
				if (entity["name"] == "MIS_DATA") {
					properties = entity["property"];
					return false;
				}
			});
			var table = this.getView().byId("tableMis");
			for ( var i = 0; i < properties.length; i++) {
				var label = "";
				$.each(properties[i].extensions, function(index, extension) {
					if (extension["name"] == "label") {
						label = extension["value"];
						return false;
					}
				});
				if (label == "") {
					label = properties[i].name;
				}
				var column;
				if (properties[i].name == "EMP_DOB" || properties[i].name == "ZZ_DEP_STDATE"
					||properties[i].name == "ZZ_DEP_ENDATE" || properties[i].name == "EMP_PASS_VALID"
					|| properties[i].name == "SPOUSE_DOB" || properties[i].name == "CHILD1_DOB"
					|| properties[i].name == "CHILD2_DOB" || properties[i].name == "CHILD3_DOB"
					||properties[i].name=="RTDAT"||properties[i].name=="ENDDA"
					|| (properties[i].name.indexOf("DATE")!=-1)) {
					column = new sap.ui.table.Column({
						width : "150px",
						label : label,
						template : new sap.ui.commons.Label({
							text : {
								path : properties[i].name,
								formatter : function(value) {
									if (value != "" && value!=null) {
									  var date = value.split("-");
									  if(date.length!=0)
											return date[2]+ "/" + date[1] + "/" + date[0];
									}	
								}
							}
						})
					});
				}else{
				column = new sap.ui.table.Column({
					width : "150px",
					sorted:true,
					sortProperty : properties[i].name,
					filterProperty : properties[i].name,
					label : label,
					template : new sap.ui.commons.Label({
						text : "{" + properties[i].name + "}"
					})
				});
				}
				table.addColumn(column);
			}
			this.onSelect();
			// table.bindRows("/MIS_REP");
			// table.setModel(oModel);
		}, this), null);
	},
	onSelect : function(evt) {
		//var id = this.getView().byId("btnMisGrp").getSelectedButton().getId();
	//	this.getView().byId("tableMis").setBusy(true);
		//var visaRep;
		if (this.getView().byId("btnBefore").getSelected()) {
			this.getView().byId("btnBefore").fireSelect({selected:true});
		} else if (this.getView().byId("btnAfter").getSelected() ) {
			this.getView().byId("btnAfter").fireSelect({selected:true});
		}
	//	this.getDetails(visaRep);
	},
	onSelect1:function(evt){
		var visaRep = 'X';
		if(evt.getParameter("selected")){
			//this.getView().byId("tableMis").setBusy(true);
			this.getDetails(visaRep);
		}
	},
	onSelect2:function(evt){
		var visaRep = '';
		if(evt.getParameter("selected")){
			//this.getView().byId("tableMis").setBusy(true);
			this.getDetails(visaRep);
		}
	},
	getDetails : function(visaRep) {
		this.getView().byId("tableMis").setBusy(true);
		var odata = {
			PERNR : sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR,
			ROLE : sap.ui.getCore().getModel("profile").getData().currentRole,
			VISA_REP : visaRep
		}
		oComponent.getModel().callFunction("MIS_REP", "GET", odata, null, jQuery.proxy(function(oData, response) {
			var table = this.getView().byId("tableMis");
			var model = new sap.ui.model.json.JSONModel();
			model.setData(oData.results);
			table.bindRows("/");
			table.setModel(model);
			table.setBusy(false);
		}, this), jQuery.proxy(function(error) {
			this.getView().byId("tableMis").setBusy(false);
		}, this), true);
	},
	onExport : function() {
		var table = this.getView().byId("tableMis");
		var model = table.getModel();
		// model.setDefaultCountMode(sap.ui.model.odata.CountMode.None);
		// var sFilterParams = table.getBinding("items").sFilterParams;
		var columns = this.getExcelColumns(table);
		oExport = new sap.ui.core.util.Export({
			exportType : new sap.ui.core.util.ExportTypeCSV({
				separatorChar : ","
			}),
			models : model,
			rows : {
				path : "/"
			},
			columns : columns
		});
	//	var id = this.getView().byId("btnMisGrp").getSelectedButton().getId();
		if (this.getView().byId("btnBefore").getSelected()) {
			text = "MIS-Before Travel Report";
		} else if (this.getView().byId("btnAfter").getSelected()) {
			text = "MIS-On Travel Report";
		}
		oExport.saveFile(text).always(function() {
			this.destroy();
		});
	},
	getExcelColumns : function(table) {
		var columns = [];
		var table;
		// table = this.getView().byId("idItemTable");
		// var cells = table.getBindingInfo("items").template.getCells();
		var cols = table.getColumns();
		for ( var i = 0; i < cols.length; i++) {
			var cells = cols[i].getTemplate();
			if (cells.getBindingInfo("text")) {
				var path = cells.getBindingInfo("text").parts[0].path;
				if (path == "EMP_DOB" || path == "ZZ_DEP_STDATE"
					||path == "ZZ_DEP_ENDATE" || path == "EMP_PASS_VALID"
					|| path == "SPOUSE_DOB" || path == "CHILD1_DOB"
					|| path == "CHILD2_DOB" || path == "CHILD3_DOB"||path=="RTDAT"||path=="ENDDA"
					|| (path.indexOf("DATE")!=-1)) {
					columns.push({
						name : cols[i].getLabel().getText(),
						template : {
							content : {path:path,formatter:function(value){
								if (value != "" && value!=null) {
									  var date = value.split("-");
									  if(date.length!=0)
											return date[2]+ "/" + date[1] + "/" + date[0];
									}
							}}
						}
					});
					
				}else{
				columns.push({
					name : cols[i].getLabel().getText(),
					template : {
						content : { 
							path:path,formatter:function(value){
								if(value!=""&&value){
									//value = JSON.stringify(value);
									value = value.replace(/"/g, '');
									//value = value.replace(/"$/, '');
									value = "\""+value+"\"";
									return value;
								}
							} 
						}
					}
				});
				}
				// }
			}
		}
		return columns;
	},
	onSubmit:function(evt){
		//var frmdate = evt.getSource().getValue();
		var frmDate = this.getView().byId("frmDate").getValue();
		var toDate = this.getView().byId("toDate").getValue();
		if(frmDate!=""&&toDate!=""){
		var table = this.getView().byId("tableMis");
		var aFilters = [];
		var oDateFilter = new sap.ui.model.Filter({ path: "ZZ_DEP_STDATE", operator: "BT", value1: frmDate, value2: toDate });
		aFilters.push(oDateFilter);
		table.getBinding("rows").filter(aFilters);
		}else{
			sap.m.MessageToast.show("Please enter From Date and To Date");
		}
	},
	onReset:function(){
		this.getView().byId("frmDate").setValue("");
		this.getView().byId("toDate").setValue("");
		this.onSelect();
	},
/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.MISReport
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.MISReport
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.MISReport
 */
// onExit: function() {
//
// }
});