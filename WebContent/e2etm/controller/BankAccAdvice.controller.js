jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
var oController;
var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
sap.ui.controller("sap.ui.project.e2etm.controller.BankAccAdvice", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.BankAccAdvice
*/
	onInit: function() {
		oController = this;
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatchedDetail, this);
	},
	onRouteMatchedDetail : function(evt) {		
		
		if (evt.getParameter("name") == "bnkadvfrm") {
			var view = evt.mParameters.view;
			oController = view.getController();
			var flag = oController.checkHomeView(evt);
			if (flag) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
				this.fetchDetails();
				this.setFieldProperties();
				this.getView().setModel(sap.ui.getCore().getModel("global"), "general");
			} else {
				sap.ui.core.routing.Router.getRouter("MyRouter").navTo("home");
			}
		}
		
	},
	checkHomeView:function(evt){
		var views = evt.oSource.getViews()._oViews;
		var flag = false;
		for ( var key in views) {
			if (key == "sap.ui.project.e2etm.view.Home") {
				flag = true;
				break;
			}
		}
		return flag;
	},
	setFieldProperties:function(){
		var odata = {};
		odata.editable=false;
		var model = new sap.ui.model.json.JSONModel();
		model.setData(odata);
		this.getView().setModel(model,"fieldproperties");
	},
	fetchDetails:function(){
		var global = sap.ui.getCore().getModel("global").getData();
		var batch1 = oDataModel.createBatchOperation("BankAdviceFormSet?$filter=Country+eq+'DE'", "GET");
		var batch2 = oDataModel.createBatchOperation("BankDetailsSet(EmpNo='"+global.ZZ_DEP_PERNR+"',TravelPlan='"+global.ZZ_TRV_REQ+"',TravelType='"+global.ZZ_REQ_TYP+"')", "GET");
		oDataModel.addBatchReadOperations([ batch1,batch2 ]);

		oDataModel.submitBatch(function(oResult) {
			try {

				oController.setClass(oResult.__batchResponses[0].data.results);
				var model = new sap.ui.model.json.JSONModel();
				model.setData(oResult.__batchResponses[1].data);
				oController.getView().setModel(model);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			} catch (err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			}
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		}, true);
	},
	setClass:function(results){
		var oData={};
		var model = new sap.ui.model.json.JSONModel();
		for(var i=0;i<results.length;i++){
			oData[results[i].Field] = results[i].Required;
			
			if(results[i].Required=="X")
				{
				oController.getView().byId("lbl"+results[i].Field).addStyleClass("required");
				}
			else{
				oController.getView().byId("lbl"+results[i].Field).removeStyleClass("required");
			}
			oController.getView().byId(results[i].Field).setValueState(sap.ui.core.ValueState.None);
		}
		model.setData(oData);
		oController.getView().setModel(model,"bankadv");
		
	},
	onBackPress : function() {

		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();

	},
	onEditPress:function(){
		var data = this.getView().getModel("fieldproperties").getData();
		data.editable=true;
		this.getView().getModel("fieldproperties").setData(data);
	},
	onSubmitPress:function(){
	var checkResult = oController.checkValidation();
	if(checkResult)
		{
		var data = oController.getView().getModel().getData();
		var global = sap.ui.getCore().getModel("global").getData();
		data.EmpNo = global.ZZ_DEP_PERNR;
		data.TravelPlan = global.ZZ_TRV_REQ;
		data.TravelType = global.ZZ_REQ_TYP;
		oDataModel.create("BankDetailsSet", data, null, function(oData, response) {

			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			var data = oController.getView().getModel("fieldproperties").getData();
			data.editable=false;
			oController.getView().getModel("fieldproperties").setData(data);
			// window.history.go(-1);
			sap.m.MessageToast.show("Updated Successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});

		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			sap.m.MessageToast.show("Internal Server Error");
		}, true);
		}
	},
	checkValidation:function(){
		var data = oController.getView().getModel("bankadv").getData();
		for ( var prop in data) { // enumerate its property names
			if (data[prop] == "X") {
				switch (prop) {
				case "NAIBK":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter Name");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}
					break;
				case "NOFBK":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter bank name");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}
					break;
				case "STARP":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter Street/Area/PostBox number");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}
					break;
				case "PORCT":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter Pin code");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}
					break;

				case "BKACT":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter Bank Account Number");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}
					break;
				case "RCODE":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter routing Code");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}
					break;
				case "SWBIC":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter Swift Code");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}
					break;
				case "IBANO":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter IBAN Number");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}
					break;
				case "SSNNO":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter SSN Number");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}
					break;

				case "BKCBR":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter Bank code");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}

					break;
				case "BRNCD":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter Branch code");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}

					break;
				case "CITY":
					var naibk = oController.getView().byId(prop);
					if (naibk.getValue() == "") {
						sap.m.MessageToast.show("Please enter City");
						naibk.setValueState(sap.ui.core.ValueState.Error);
						return false;
					}

					break;
				}
			}
			// prop is "Title", "Description" etc

		}
		return true;
		
	}
/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.BankAccAdvice
 */
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.BankAccAdvice
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.BankAccAdvice
*/
//	onExit: function() {
//
//	}

});