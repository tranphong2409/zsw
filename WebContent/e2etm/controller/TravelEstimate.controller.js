jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.Dialog");
sap.ui.controller("sap.ui.project.e2etm.controller.TravelEstimate", {

	onInit : function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},

	onRouteMatched : function(oEvent){
		if(oEvent.getParameter("name")=="travelestimate") {
			var oThis = this;
			var sURL0 = "TravelEstimateSet?$expand=TravelEstimateDetailSet";
			var oBatch0 = oComponent.getModel().createBatchOperation(sURL0, "GET");
			oComponent.getModel().addBatchReadOperations([oBatch0]);
			oComponent.getModel().submitBatch(
					function(oResult){
						var oData = $.extend({}, oResult.__batchResponses[0].data);
						
						if (oThis.getView().getModel("json") == undefined){
							var jsonModel =  new sap.ui.model.json.JSONModel();
							oThis.getView().setModel(jsonModel,"json");
						}
						var jsonData = oThis.getView().getModel("json").getData();
						var TravelEstimate = oData.results;
						var iSum = 0;
						
						for (var i=0; i<TravelEstimate.length; i++){
							iSum = iSum + Number(TravelEstimate[i].Count);
							
							TravelEstimate[i].__metadata = "";
							var TravelEstimateDetail = TravelEstimate[i].TravelEstimateDetailSet.results;
							for (var j=0; j<TravelEstimateDetail.length; j++){
								TravelEstimateDetail[j].TravelEstimate01 = "";
								TravelEstimateDetail[j].__metadata = "";
							}
							TravelEstimate[i].TravelEstimateDetailSet = TravelEstimateDetail;
							
						}
						jsonData.TravelEstimate = TravelEstimate;
						
						var oGrandTotal = {};
						oGrandTotal.Label = "Grand Total";
						oGrandTotal.Count = iSum;
						jsonData.TravelEstimate.push(oGrandTotal);
						oThis.getView().getModel("json").setData(jsonData);
					},
					function(error){
					});
		}
	},
	onExportExcel : function(){
		var id = "#" + this.getView().byId("idTravelEstimateTable").getDomRef().id;
		$(id).tableExport({type:'excel',escape:'false'});
	},
	onNavPress: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	onPersoButtonPressed:function(evt){

		this.table.openDialog();		

	},
	onSearch:function(){
	},
	
});