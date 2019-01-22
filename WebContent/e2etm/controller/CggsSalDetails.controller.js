sap.ui.controller("sap.ui.project.e2etm.controller.CggsSalDetails", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.CggsSalDetails
*/
	onInit: function() {
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
		var properties = [];
		oModel.attachMetadataLoaded(null, jQuery.proxy(function() {
			var oMetadata = oModel.getServiceMetadata();
			var enitytypes = oMetadata.dataServices.schema[0].entityType;
			$.each(enitytypes, function(index, entity) {
				if (entity["name"] == "EmpSalDetlsCggs") {
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
				if (properties[i].name == "ZzRevFrm" || properties[i].name == "Upldt") {
					column = new sap.ui.table.Column({
						width : "150px",
						label : label,
						template : new sap.ui.commons.Label({
							text : {
								path : properties[i].name,
//								formatter : function(value) {
//									if (value != "" && value!=null) {
//									  var date = value.split("-");
//									  if(date.length!=0)
//											return date[2]+ "/" + date[1] + "/" + date[0];
//									}	
//								}
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
			oComponent.getModel().read("/EmpSalDetlsCggsSet", null, null, true, jQuery.proxy(function(oData, response) {
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(oData.results);
				table.setModel(oModel);	
				table.bindRows("/");

			},this), jQuery.proxy(function(error) {
				
				
			},this));
			
		},this));
		
		
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.CggsSalDetails
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.CggsSalDetails
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.CggsSalDetails
*/
//	onExit: function() {
//
//	}

});