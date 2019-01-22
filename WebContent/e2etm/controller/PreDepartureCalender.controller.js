jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
sap.ui.controller("sap.ui.project.e2etm.controller.PreDepartureCalender", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.PreDepartureCalender
*/
	onInit: function() {


		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	
	},


	onRouteMatched:function(evt){
		var globalData = sap.ui.getCore().getModel("global").getData()
		var country = globalData.country;
		var cntryModel = new sap.ui.model.json.JSONModel();
		cntryModel.setData(country);
		this.getView().setModel(cntryModel,"frmCntry");
		this.getView().byId("AsgModel").setSelectedKey("");
		this.getTableData(this.getView().byId("Year").getSelectedKey(),this.getView().byId("AsgModel").getSelectedKey());
		this.setButtonsVisible(sap.ui.getCore().getModel("profile").getData().currentRole);
	},
	
	getTableData:function(year,AsgModel){
	
		var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
		var oModel = new sap.ui.model.json.JSONModel();
		oDataModel.read("DepuPDMSet?$filter=ZZ_YEAR eq '" + year + "' and ZZ_ASG_TYP eq '" + AsgModel + "'", null, null, true, jQuery.proxy(function(oData, response) {
			
		oModel.setData(oData.results);
		this.getView().setModel(oModel,"pdmData");
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
	},this), function(error) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
	});
				
		
	},
	
	onSelectChange:function(evt){
		this.setTableEditable(false);
		this.getTableData(this.getView().byId("Year").getSelectedKey(),this.getView().byId("AsgModel").getSelectedKey());
		
	},
	
	onAdd:function(evt){
	
	var data = this.getView().getModel("pdmData").getData();
		data.push({ 
			LAND1:"",
			NAME:"",
			JAN:"",
			FEB:"",
			MAR:"",
			APR:"",
			MAY:"",
			JUN:"",
			JUL:"",
			AUG:"",
			SEP:"",
			OCT:"",
			NOV:"",
			DECE:""
		});
		
		this.getView().getModel("pdmData").setData(data);
	
	},
	
	
	onDel:function(evt){
		
		var parent = evt.oSource.getParent().getParent();
		var index = parent.getSelectedItems();
		var pdmdata = this.getView().getModel("pdmData").getData();
		if (index.length == 0){
			sap.m.MessageToast.show("Please select atleast one row");
		}else{
			
			data = this.deleteRows(parent, index, pdmdata);
			this.getView().getModel("pdmData").setData(data);		
		}
		
	},


	deleteRows:function(table, index,data){
		for ( var i = index.length - 1; i >= 0; i--) {
			var tableIndex = table.indexOfItem(index[i]);
			data.splice(tableIndex, 1);
		}
		return data;
		
	},
	
	onSave:function(evt){
		
		var saveData = {};
		var ODataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
		saveTabelData = this.getView().getModel("pdmData").getData();
		saveData = { ZZ_YEAR:this.getView().byId("Year").getSelectedKey(),  
					ZZ_ASG_TYP:this.getView().byId("AsgModel").getSelectedKey(),
					BUKRS:'6520'};
		
		saveData.DepuPDMToYear=[];
		
		if(this.getView().getModel("tableDisplay").getData().isEnable==false){
			sap.m.MessageToast.show("Please Edit Data before Save");	
			return;
		}
		
		if(this.getView().byId("AsgModel").getSelectedKey()==""){
			sap.m.MessageToast.show("Please Select Assignement Model Before Save");
			return;
		}
		
		if(saveTabelData.length==0){
			sap.m.MessageToast.show("Please Enter Atleast one Row to Save");
			return;
		}else{
			
			for(var i=0;i<saveTabelData.length;i++){
			saveData.DepuPDMToYear.push({ 	ZZ_YEAR:this.getView().byId("Year").getSelectedKey(),  
											ZZ_ASG_TYP:this.getView().byId("AsgModel").getSelectedKey(),
											LAND1:saveTabelData[i].LAND1,
											BUKRS:'6520',
											NAME:saveTabelData[i].NAME,
											JAN:saveTabelData[i].JAN,
											FEB:saveTabelData[i].FEB,
											MAR:saveTabelData[i].MAR,
											APR:saveTabelData[i].APR,
											MAY:saveTabelData[i].MAY,
											JUN:saveTabelData[i].JUN,
											JUL:saveTabelData[i].JUL,
											AUG:saveTabelData[i].AUG,
											SEP:saveTabelData[i].SEP,
											OCT:saveTabelData[i].OCT,
											NOV:saveTabelData[i].NOV,
											DECE:saveTabelData[i].DECE  })
			
			}
		}
	
		oDataModel.create("DepuPDMYearSet", saveData, null, function(oData, response) {		
				sap.m.MessageToast.show("Data has been saved");	
//				this.setTableEditable(false);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Internal Server Error");
		}, true);	

	
	},
	
	
	setButtonsVisible:function(role){
		this.getView().byId("save").setVisible(false);
		this.getView().byId("edit").setVisible(false);
		this.getView().byId("pdmTableAdd").setVisible(false);
		this.getView().byId("pdmTableDel").setVisible(false);
		
		if(role =='DEPU'){
			this.getView().byId("save").setVisible(true);
			this.getView().byId("edit").setVisible(true);
			this.getView().byId("pdmTableAdd").setVisible(true);
			this.getView().byId("pdmTableDel").setVisible(true);
		}
		
		
	},
	
	setTableEditable:function(boolean){
	
	var displayData = {};
	var displayDataModel = new sap.ui.model.json.JSONModel();
	displayData.isEnable = boolean;
	displayDataModel.setData(displayData);
	this.getView().setModel(displayDataModel,"tableDisplay");
	
	},
	
	
	onEdit:function(evt){
	
	if(this.getView().byId("AsgModel").getSelectedKey()==""){
		
		sap.m.MessageToast.show("Please select Assignment Model");

		return;
	}
		
		this.setTableEditable(true);
	
	
	},
	
	
	onBack:function(evt){
		
	sap.ui.core.routing.Router.getRouter("MyRouter").navTo("Menu");
	
		
	},
	
});