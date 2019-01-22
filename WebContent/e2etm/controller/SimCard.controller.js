jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require("sap.ui.ux3.NotificationBar");


var oController;
var firstTab;
var subTab;
var subSubTab;
sap.ui.controller("sap.ui.project.e2etm.controller.SimCard", {

	onInit: function() {
		oController = this;
		
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(oController.onRouteMatched, oController); 
		
	
	},
	
	
	onRouteMatched:function(evt){
		
		if(evt.getParameter("name")=="SimCard"){
			firstTab = oController.getView().byId("IconIssueSim").getSelectedKey();	
				if(firstTab=='I'){
					subTab = oController.getView().byId("IconIssueNewSim").getSelectedKey();	
				switch(subTab){
				case 'N':
				subSubTab = oController.getView().byId("IconIssueNew").getSelectedKey();
				break;
				case 'D':
				subSubTab = oController.getView().byId("IconDateChangeApprove").getSelectedKey();
				break;
				default:
					subSubTab='';
					break;
				}	
		
			}else{
					subSubTab="";
					subTab = oController.getView().byId("IconReturnSim").getSelectedKey();
		}
		
		oController.getSImCardData(firstTab,subTab,subSubTab);
		}
		},

	
		
	OnIssueNewSelect:function(evt){
		subSubTab = oController.getView().byId("IconIssueNew").getSelectedKey();		
		subTab	 = oController.getView().byId("IconIssueNewSim").getSelectedKey();
		firstTab = oController.getView().byId("IconIssueSim").getSelectedKey();
		oController.getSImCardData(firstTab,subTab,subSubTab);
	
	},
	
	
	
	OnDateChangeApproveSelect:function(evt){
		subSubTab = oController.getView().byId("IconDateChangeApprove").getSelectedKey();
		subTab = oController.getView().byId("IconIssueNewSim").getSelectedKey();
		firstTab = oController.getView().byId("IconIssueSim").getSelectedKey();
		oController.getSImCardData(firstTab,subTab,subSubTab);
		
	},
	
	
	OnIssueNewSimSelect:function(evt){
		
		subTab = oController.getView().byId("IconIssueNewSim").getSelectedKey();
		firstTab = oController.getView().byId("IconIssueSim").getSelectedKey();
		
		if(subTab=='N'){
			
			subSubTab = oController.getView().byId("IconIssueNew").getSelectedKey();;
			
		}else if(subTab=='D'){
			
			subSubTab = oController.getView().byId("IconDateChangeApprove").getSelectedKey();;
			
		}else if(subTab=="R" || subTab=="E" || subTab=="C"){
			
			subSubTab="";
		}
		
		oController.getSImCardData(firstTab,subTab,subSubTab);
	},
	
	
	OnReturnSimOnSelect:function(evt){
		subSubTab="";
		this.getView().byId("reminderbtn").setVisible(false);
		this.getView().byId("SimCardreturnTable--SimCardDataTable").setMode("None");
		subTab = oController.getView().byId("IconReturnSim").getSelectedKey();
		firstTab = oController.getView().byId("IconIssueSim").getSelectedKey();
		oController.getSImCardData(firstTab,subTab,subSubTab);
		if(firstTab=='R' && subTab=='N'){
			this.getView().byId("SimCardreturnTable--SimCardDataTable").setMode("MultiSelect");
			this.getView().byId("reminderbtn").setVisible(true);
			
		}
		
	},
	
	IssueSimOnSelect:function(evt){
		firstTab = oController.getView().byId("IconIssueSim").getSelectedKey();
		if(firstTab=="I"){
			subTab = oController.getView().byId("IconIssueNewSim").getSelectedKey();
			if(subTab== 'N' || subTab=='D'){
				subSubTab = oController.getView().byId("IconIssueNew").getSelectedKey();	
			}else{
				subSubTab="";
				
			}
			
			oController.getSImCardData(firstTab,subTab,subSubTab);		
		}else if(firstTab=="R"){
			this.getView().byId("reminderbtn").setVisible(false);
			this.getView().byId("SimCardreturnTable--SimCardDataTable").setMode("None");
			subTab = oController.getView().byId("IconReturnSim").getSelectedKey();
			subSubTab="";
			if(subTab=='N'){
				this.getView().byId("SimCardreturnTable--SimCardDataTable").setMode("MultiSelect");
				this.getView().byId("reminderbtn").setVisible(true);
			}	
			oController.getSImCardData(firstTab,subTab,subSubTab);
		}else if(firstTab=='Rep'){
			subTab = oController.getView().byId("simrep").getSelectedKey();
			subSubTab='';
			var repTable;
			if(subTab=='simcard_rep'){
			repTable = this.getView().byId("SimCardDataRepTable");
			}else {	
			 repTable = this.getView().byId("SimCardDataUsageRepTable");	
			}
		
			var odata={RepName:subTab};
			this.getRepData(repTable,odata);
			
		}
		
	//	oController.getSImCardData(firstTab,subTab,subSubTab);
		
	},

	getSImCardData :function(firstTab,subTab,subSubTab){	
		var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		oDataModel.read("SimCardDataSet?$filter=FirstTab eq '" + firstTab + "' and FsubTab eq '" + subTab + "' and FssubTab eq '" + subSubTab + "'", null, null, true, jQuery.proxy(function(oData, response) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			var oTable= oController.getTable(firstTab,subTab,subSubTab);
			  oTable.setModel(oModel,'SimCardDataSet'); 
			  this.getView().setModel(oModel,'SimCardDataSet');
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		},this), function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		});
	
		},

		getTable:function(firstTab,subTab,subSubTab){
			
			if(firstTab=="I"){			
			switch(subTab){
			case "N":
			return	this.getView().byId("SimCardDataTable");
			case "D":
			return this.getView().byId("SimCardDatechangeTable--SimCardDataTable");
			default :
			return this.getView().byId("SimCardnewrejecttable--SimCardDataTable");
			
			}	
				
			}else {
				
				return this.getView().byId("SimCardreturnTable--SimCardDataTable");
				
			}
			
		},


		onItemPress:function(evt){
			var itemData = this.getView().getModel("SimCardDataSet").getProperty(evt.getParameter("listItem").getBindingContext("SimCardDataSet").sPath);
			
			sap.ui.core.routing.Router.getRouter("MyRouter").navTo("SimCardRequest",{reinr:itemData.reinr,pernr:itemData.pernr,query:{
				Tab:firstTab,
				subTab:subTab,
				subSubTab:subSubTab
			}});
			
			
		},

		onMailSent:function(evt){
			  var selItems = oController.getView().byId("SimCardreturnTable--SimCardDataTable").getSelectedItems();
		        if(selItems.length==0){
		        	sap.m.MessageToast.show("Please select atleast one row");
		        
		        	return;
		        }
			
			oDataModel.read("SimPopUpMailSet(TravelPlan='',Pernr='',FormName='ZE2E_RETUNR_SIM_ALERT_MAIL_TXT')", null, null, true, jQuery.proxy(function(oData, response) {
			
				
				var dialog = new sap.m.Dialog ({
					title: 'Send Mail',
					type: 'Message',
					contentWidth:'auto',					
					content: [						
						new sap.m.TextArea("simFormText",{
							value:oData.FormText,
							height: '200px',
							width:'100%'
						})						
					],
					beginButton: new sap.m.Button({
						text: 'Submit',
						enabled: true,
						press: jQuery.proxy(function(){
							this.sendMailToEmp(sap.ui.getCore().byId("simFormText").getValue(),dialog);
						},this)					
					}),
					endButton: new sap.m.Button({
						text: 'Cancel',
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				dialog.open();
					  
				 sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			},this), function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			});
			
			

			
		},
		sendMailToEmp:function(text,dialog){
			    var batch = [];
				sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		        var selItems = oController.getView().byId("SimCardreturnTable--SimCardDataTable").getSelectedItems();
		       
		        for(var i = 0;i<selItems.length;i++){
		        	var data = selItems[i].getBindingContext("SimCardDataSet").getModel().getProperty(
		        			   selItems[i].getBindingContext("SimCardDataSet").sPath);
		        	var odata = {FormName:"ZE2E_RETUNR_SIM_ALERT_MAIL_TXT",FormText:text,TravelPlan:data.reinr,Pernr:data.pernr}
		        	batch.push(oDataModel.createBatchOperation("SimPopUpMailSet", "POST", odata));
		        }
		        oComponent.getModel().addBatchChangeOperations(batch);
		        oComponent.getModel().submitBatch(jQuery.proxy(function(oResult) {
					try {
						dialog.close();
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
						sap.m.MessageToast.show("Mail has been sent Successfully");
						
					} catch (err) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
					}
				},this), jQuery.proxy(function(error) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				},this), true);
		        
		        
		},
		
		
	getRepData:function(repTable,odata){
		
		var oModel = new sap.ui.model.json.JSONModel();
//		var odata={RepName:subTab};
		oComponent.getModel().callFunction("SIMCardDataRep",{method:"GET",urlParameters:odata,success:jQuery.proxy(function(oData, response) {
			oModel.setData(oData.results);
			repTable.setModel(oModel,'SimcardRepModel');
			this.getView().setModel(oModel,'SimcardRepModel');	
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		},this), error:function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController); },async:true});
		
	},	
	
	OnSimcardRepSelect:function(){
		
		var selectedRep = oController.getView().byId("simrep").getSelectedKey();
		var repTable;
		if(selectedRep=='simcard_rep'){
		repTable = this.getView().byId("SimCardDataRepTable");
		}else {	
		 repTable = this.getView().byId("SimCardDataUsageRepTable");	
		}
	
		var odata={RepName:selectedRep};
		this.getRepData(repTable,odata);
				
	},

})