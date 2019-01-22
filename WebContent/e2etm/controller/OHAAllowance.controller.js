sap.ui.controller("sap.ui.project.e2etm.controller.OHAAllowance", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.OHAAllowance
*/
//	onInit: function() {
//
//	},
	handleUploadPress:function(){
		//	sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			var file = this.getView().byId("fileUploader").oFileUpload.files[0];
			var importFile = $.Deferred();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
			importFile = sap.ui.project.e2etm.util.StaticUtility.onXLSFileImport(file,"OhaAllowanceSet","OhaAllowanceNav",oComponent.getModel("reservation"))
			importFile.done(jQuery.proxy(function(response){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				sap.m.MessageToast.show("Uploaded Successfully");
				 this.fetchDetails();
			},this));
			
			importFile.fail(jQuery.proxy(function(response){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				sap.m.MessageToast.show("Please make use of template provided to upload the data");
				
			},this));
		
		},
	onDownloadTemplate:function(){
		var columns = this.getTemplateColumns();
		sap.ui.project.e2etm.util.StaticUtility.exportCSV(null,new sap.ui.model.json.JSONModel(),"OHA Allowance List",columns);
	},
	getTemplateColumns:function(){
		var columns = [{
			name : "Country Code_Land1",
	        template : {
				content: "{Land1}"	             
				       }
		}
		, {
			name : "City Code_City",
			template : {
				content : "{City}"
			}
		}, {
			name : "Valid From_Begda",
			template : {
				content : "{Begda}"
			}
		},{
			name : "Valid Till_Endda",
			template : {
				content : "{Endda}"
			}
		},{
			name : "Amount_Amount",
			template : {
				content : "{Amount}"
			}
		}, {
			name : "Currency_Waers",
			template : {
				content : "{Waers}"
			// "{Width} x {Depth} x {Height} {DimUnit}"
			}
		}, {
			name : "Frequency_Rfreq",
			template : {
				content : "{Rfreq}"
			}
		}
		];
		
		return columns;
	
	},
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.OHAAllowance
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.OHAAllowance
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.OHAAllowance
*/
//	onExit: function() {
//
//	}

});