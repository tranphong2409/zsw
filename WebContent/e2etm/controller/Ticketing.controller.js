jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.project.e2etm.util.FileUpload");
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
sap.ui.controller("sap.ui.project.e2etm.controller.Ticketing",{

	onInit : function(tickt) {
		oThis = this;
		if (this.oView.sViewName == "sap.ui.project.e2etm.view.TicketingAdmin") {
			sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(
					this.onRouteMatchedAdmin, this);
		} else {
			var fileModel = new sap.ui.model.json.JSONModel();
			fileModel.setData({Files:[]});
			this.getView().setModel(fileModel,"new");
			var dialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.ticketing.TcktFileDialog",
					oThis);
			oThis.getView().addDependent(dialog);
			sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
		}
	},
	onRouteMatchedAdmin : function(event) {
		
		if (event.getParameter("name") == "ticketingAdmin") {
			var view = event.mParameters.view;
			oThis = view.getController();
			//sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);			
			var profileData = sap.ui.getCore().getModel("profile").getData();
			oThis.getView().setModel(sap.ui.getCore().getModel("profile"),"profile");			
			admManRole = profileData.currentRole;//TKAD OR TKM
			this.getCount();
		
		}

	},
	onRefresh:function(){
		//this.onIconTabSelect();
		this.getCount();
	
	},
	getCount:function(){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		var batch = [];
		var tab;
		var model = new sap.ui.model.odata.ODataModel(sServiceUrl);
		var items = oThis.getView().byId("idIconTabBarTcktAdmin").getItems();
		for ( var i = 0; i < items.length; i++) {
            if(items[i].getKey()!="CLOS"&&items[i].getKey()!="BUPL"&&items[i].getKey()!="VPDF"){
            
            	tab = items[i].getKey();
            }else{
            	tab = 'NA';
            }
            	 batch.push(model.createBatchOperation("TicketWorklistSet/$count?$filter=LoginRole+eq+'"+admManRole+"'+and+Tab+eq+'"+tab+"'","GET")); 
           
			
		}	
		 	
	
		model.addBatchReadOperations(batch);
		model.submitBatch(jQuery.proxy(function(oResult) {      
			for ( var i = 0; i < items.length; i++) {
	            if(items[i].getKey()!="CLOS"&&items[i].getKey()!="BUPL"&&items[i].getKey()!="VPDF"){            	
	            	 items[i].setCount(oResult.__batchResponses[i].data); 
	           }          	
				
			}
			
			this.onIconTabSelect();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
        		
	},this),function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
	},true);
//	
		
		//model.setDefaultCountMode("Request");
		//oThis.getView().byId("idIconTabBarTcktAdmin").getItems()[0].setModel(model);
	},
	setDataTable : function(result) {
		var items = oThis.getView().byId("idIconTabBarTcktAdmin").getItems();
		var jsModel = new sap.ui.model.json.JSONModel();
		var content;
		jsModel.setData(result);
		this["ticketingData"] = result;
		for ( var i = 0; i < items.length - 4; i++) {

			content = items[i].getContent()[0];
			content.setModel(jsModel);
			var filter = oThis.getFilter(i);
			var bindItems = content.getBinding("items");
			var filteredItems = bindItems.filter(filter);
			var model = oThis.setBinding(filteredItems.aIndices, result.d.results);
			content.setModel(model);
			items[i].setCount(filteredItems.getLength());
		}
	},
	getFilter : function(index) {
		var oFilter;
		var aFilters = [];
		switch (index) {
		case 0://New
		var	oFilter1 = new sap.ui.model.Filter("Action", "EQ", "00");
		var oFilter2 = new sap.ui.model.Filter("VersionReason", "EQ", "");
		var oFilter3 = new sap.ui.model.Filter("TravelType", "NE", "VISA");
		var oFilter4 = new sap.ui.model.Filter("TravelType", "NE", "HOME");
		oFilter = new sap.ui.model.Filter([oFilter1,oFilter2,oFilter3,oFilter4],true);
			aFilters.push(oFilter);
			break;

		case 1://Sent Itenary
			oFilter = new sap.ui.model.Filter("Action", "EQ", "10");
			aFilters.push(oFilter);
			break;

		case 2://Accepted Itenary
			oFilter = new sap.ui.model.Filter("Action", "EQ", "11");
			aFilters.push(oFilter);
			break;

		case 3://Sent Back
//			var oFilter1 = new sap.ui.model.Filter("Action", "EQ", "02");

//			aFilters.push(oFilter);
			aFilters = this.getSentBackFilter();
			break;

		case 4://Change IN dATES
			var oFilter1 = new sap.ui.model.Filter("Action", "EQ", "00");
			var oFilter2 = [new sap.ui.model.Filter("VersionReason", "EQ", "DA"),
			                new sap.ui.model.Filter("VersionReason", "EQ", "DB")];
			var oFilter3 = new sap.ui.model.Filter(oFilter2,false);
			oFilter = new sap.ui.model.Filter([oFilter1,oFilter3],true);
			aFilters.push(oFilter);
			break;
			
		case 5://Family Accompanied
			var oFilter1 = new sap.ui.model.Filter("Action", "EQ", "00");
			var oFilter2 = [new sap.ui.model.Filter("VersionReason", "EQ", "DE"),
			                new sap.ui.model.Filter("VersionReason", "EQ", "DF"),
			                new sap.ui.model.Filter("VersionReason", "EQ", "DG"),
			                new sap.ui.model.Filter("VersionReason", "EQ", "DH")];
			var oFilter3 = new sap.ui.model.Filter(oFilter2,false);
			oFilter = new sap.ui.model.Filter([oFilter1,oFilter3],true);
			aFilters.push(oFilter);
			break;

		case 6://Cancelled
			var oFilter1 = new sap.ui.model.Filter("Action", "EQ", "00");
			var oFilter2 = new sap.ui.model.Filter("VersionReason", "EQ", "DC");
			oFilter = new sap.ui.model.Filter([oFilter1,oFilter2],true);
			aFilters.push(oFilter);
			break;
		case 7://Visa Plan
			
			oFilter = new sap.ui.model.Filter("TravelType","EQ","VISA");
			aFilters.push(oFilter);
			break;	
		case 8://Home Trip
			var oFilter1 = new sap.ui.model.Filter("Action", "EQ", "00");
			var oFilter2 = new sap.ui.model.Filter("TravelType", "EQ", "HOME");

			//var oFilter3 = new sap.ui.model.Filter(oFilter2,false);
			oFilter = new sap.ui.model.Filter([oFilter1,oFilter2],true);
			aFilters.push(oFilter);
			break;

		case 9://Secondary Trip
			var oFilter1 = new sap.ui.model.Filter("Action", "EQ", "00");
			var oFilter2 = new sap.ui.model.Filter("TravelType", "EQ", "SECO");
			oFilter = new sap.ui.model.Filter([oFilter1,oFilter2],true);
			aFilters.push(oFilter);
			break;
			
		case 10:
			break;

		}
		return aFilters;
	},
	onSentBackRbSelect:function(evt){
            this.onIconTabSelect();
		
		
	},
	getSentBackFilter:function(table,role){
		//var tab = this.getView().byId("tabSBACK");
		var rbGrp = table.getInfoToolbar().getContent()[0];
		var index = rbGrp.getSelectedIndex();
		//var aFilters = [];
		var filterString="";
		//var oFilter1 = new sap.ui.model.Filter("Action", "EQ", "02");
		if(index == 0){			
		  //  oFilter2 = new sap.ui.model.Filter("Role","EQ","01");
		    filterString = "LoginRole eq '"+role+"' and Tab eq 'SBEM'";
		}else if(index == 1){
			//oFilter2 = new sap.ui.model.Filter("Role","EQ","03");
			filterString = "LoginRole eq '"+role+"' and Tab eq 'SBMG'";
		}
		//oFilter = new sap.ui.model.Filter([oFilter1,oFilter2],true);
		//aFilters.push(oFilter);
		return filterString;
		
	},
	setBinding:function(aindice,results){
		var result={d:{results:[]}};
		for(var i=0;i<aindice.length;i++)
		{
			var index = aindice[i];
			result.d.results.push(results[index]);							
		}
		var model = new sap.ui.model.json.JSONModel();
		model.setData(result);
		return model;
	},
	getWorklistTab : function() {
		var key = this.getView().byId("idIconTabBarTcktAdmin").getSelectedKey();
		var table = this.getView().byId("tblTicketing");
		if (key == "DTCK") {
			return "D";
		} else if (key == "SBAK") {
			var rbGrp = table.getInfoToolbar().getContent()[0];
			var index = rbGrp.getSelectedIndex();
			if (index == 0) {
				return "SBEM";
			} else if (index == 1) {
				return "SBMG";
			}
		} else {
			return key;
		}
	},
	onIconTabSelect : function(evt) {
		this.getView().byId("idIconTabBarTcktAdmin").setBusy(true);
		var key = this.getView().byId("idIconTabBarTcktAdmin").getSelectedKey();
		var table = this.getView().byId("tblTicketing");
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		table.setVisible(true);
		oThis.setTableProperties(role);
		this.getView().byId("tlbCloseSearch").setVisible(false);
		var filterString = "";
		
		if(key == ""){
			key = "NEWT";
		}		
			switch(key){			
				
			case "CLOS":		
				table.setMode("SingleSelectMaster");
				table.getHeaderToolbar().setVisible(false);
				table.getInfoToolbar().setVisible(false);
				this.getView().byId("tlbCloseSearch").setVisible(true);	
				this.getView().byId("idIconTabBarTcktAdmin").setBusy(false);	
				table.setModel(null);
			  break;
			case "DTCK":			
				filterString = "LoginRole eq '"+role+"' and Tab eq 'D'";
				this.getTcktWorklist(filterString,table);				
			//	content[0].getInfoToolbar().setVisible(false);
			break;
			case "SBAK":			   
			   table.getInfoToolbar().setVisible(true);
			   filterString =  this.getSentBackFilter(table,role);	
			   
			   this.getTcktWorklist(filterString,table);
			break;			
			case "BUPL":
				table.setVisible(false);
				break;
			case "VPDF":
				table.setVisible(false);
				break;
			default:
			
			   filterString = "LoginRole eq '"+role+"' and Tab eq '"+key+"'";
			   this.getTcktWorklist(filterString,table);
			
			}
			
			
		

	},
	getTcktWorklist:function(filterString,table){
		oDataModel.read("TicketWorklistSet?$filter="+filterString, null, null, true,
				// success
				jQuery.proxy(function(oData, response) {					
					var worklistModel = new sap.ui.model.json.JSONModel();
					worklistModel.setData(oData.results);
					table.setModel(worklistModel);
					if(this.getView().byId("idIconTabBarTcktAdmin").getBusy())
					this.getView().byId("idIconTabBarTcktAdmin").setBusy(false);
				},this),jQuery.proxy(function(error) {
					// error
					
				},this));
	},

	getClsDmyTck:function(filter){
		var results;
		var profile = sap.ui.getCore().getModel("profile").getData();
		var get = $.ajax({
			cache : false,
			async:false,
			url : sServiceUrl
			+ "TicketWorklistSet()?$filter=LoginRole eq '"+profile.currentRole+"' and Tab eq '"+filter+"'&$format=json",
			type : "GET"
		});
		get.done(function(result) {
			try {
				results = result;
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			} catch (err) {
				oThis = view.getController();
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, view.getController());
			}
		});
		get.fail(function(err) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
		});
		return results;
	},
	onCloseChange:function(evt){//close tab filter
		this.getView().byId("idIconTabBarTcktAdmin").setBusy(true);
		var profile = sap.ui.getCore().getModel("profile").getData();
		var table = this.getView().byId("tblTicketing");
        var travelplan = evt.oSource.getValue();
        var filterString = "LoginRole eq '"+profile.currentRole+"' and TravelPlan eq '"+travelplan+"' and Tab eq 'SR'";
        this.getTcktWorklist(filterString,table);	

	},
	onRouteMatched : function(event) {
		
		if (event.getParameter("name") == "ticketing") {
			var view = event.mParameters.view;
			oThis = view.getController();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
			oThis.clearModels();
			var globalData = sap.ui.getCore().getModel("global").getData();
			var profile = sap.ui.getCore().getModel("profile").getData();
			if (profile.currentRole == "EMP") {
				ticket = {};
				var model = new sap.ui.model.json.JSONModel();
				
				model.setData(ticket);
				
				if(globalData.ZZ_REQ_TYP == "SECO"){
					globalData.ZZ_TRV_REQ = globalData.ZZ_DEP_REQ; 
				}
				
				sap.ui.getCore().setModel(model, "ticketModel");
				var get = $.ajax({
					cache : false,
					async : false,
					url : sServiceUrl
					+ "TicketWorklistSet()?$filter=LoginRole eq '"
					+ profile.currentRole
					+ "' and EmpNo eq '"
					+ globalData.ZZ_DEP_PERNR
					+ "'"
					+ " and TravelType eq '"
					+ globalData.ZZ_REQ_TYP
					+ "' and TravelPlan eq '"
					+ globalData.ZZ_TRV_REQ
					+ "'&$format=json",
					type : "GET"
				});
				get.done(function(result) {
					if (result.d.results.length != 0) {
						ticket = result.d.results[0];
						var model = new sap.ui.model.json.JSONModel();
						model.setData(ticket);
						sap.ui.getCore().setModel(model, "ticketModel");
					} else {
						ticket = {};
						var model = new sap.ui.model.json.JSONModel();
						model.setData(ticket);
						sap.ui.getCore().setModel(model, "ticketModel");
					}
				});
			}

			var html = view.byId("html1");
			var panel = oThis.getView().byId("panel_html");
			var fileUrl;
			if (window.location.hostname == "localhost")
				fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='"+ticket.EmpNo+"',TrNo='"+ticket.TravelPlan+"',TrvKey='"+ticket.TravelType+"',Module='REQ')/$value";
			else
				fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='"+ticket.EmpNo+"',TrNo='"+ticket.TravelPlan+"',TrvKey='"+ticket.TravelType+"',Module='REQ')/$value";

			html.setContent(" ");
			html.setContent("<div><object data=\""
					+ fileUrl
					+ "\" type=\"application/pdf\" width=\"100%\" height=\"1250px\"></object></div>");

			oThis.getView().byId("v1").getContent()[0].getContent()[0].setSelected(false);
			oThis.getView().byId("v2").getContent()[0].getContent()[0].setSelected(false);
			oThis.getView().byId("v3").getContent()[0].getContent()[0].setSelected(false);
			oThis.setButtonProperties(profile.currentRole);
			oThis.setProperties(profile.currentRole);
			oThis.fetchGeneralData();
		}
	},
	clearModels:function() {
		var data = {
			Optionstxt : "",
			Optionpnr : "",
			Tfare : "",
			Tlimit : "",
			Spnotes : ""
		};
		var data1 = {
			Optionstxt : "",
			Optionpnr : "No PNR",
			Tfare : "",
			Tlimit : "",
			Spnotes : ""
		};
		var data2 = {
			Optionstxt : "",
			Optionpnr : "No PNR",
			Tfare : "",
			Tlimit : "",
			Spnotes : ""
		};
		var data3 = {
			Optionstxt : "",
			Optionpnr : "No PNR",
			Tfare : "",
			Tlimit : "",
			Spnotes : ""
		};
		var model1 = new sap.ui.model.json.JSONModel();
		model1.setData({
			collection1 : data
		});
		var model2 = new sap.ui.model.json.JSONModel();
		model2.setData({
			collection2 : data1
		});
		var model3 = new sap.ui.model.json.JSONModel();
		model3.setData({
			collection3 : data2
		});
		var model4 = new sap.ui.model.json.JSONModel();
		model4.setData({
			collection4 : data3
		});

		oThis.getView().setModel(model1, "itenary1");
		oThis.getView().setModel(model2, "itenary2");
		oThis.getView().setModel(model3, "itenary3");
		oThis.getView().setModel(model4, "itenary4");

		oThis.getView().byId("txtarea5").setValue("");
		oThis.getView().byId("c4").setSelected(false);
		oThis.getView().byId("v4").setVisible(false);
		filesAll=[];
		uploadFile=[];
//		var UploadCollection = oThis.getView().byId(
//				"UploadCollection");
//		var uploadmodel = new sap.ui.model.json.JSONModel();
//		uploadmodel.setData({
//			collection : filesAll
//		});
//		UploadCollection.setModel(uploadmodel);
//        var uploadproperties = new sap.ui.model.json.JSONModel();
//		
//		uploadproperties.setData({updelete:false});
//		UploadCollection.setModel(uploadproperties,"uploadcollection");
	},
	setButtonProperties : function(myRole) {
		var profileRole, role, nxtAction;
		var ticket = sap.ui.getCore().getModel("ticketModel").getData();
		oThis.getView().byId("submit").setVisible(false);
		oThis.getView().byId("senditenary").setVisible(false);
		oThis.getView().byId("sendback").setVisible(false);
		oThis.getView().byId("accept").setVisible(false);
		oThis.getView().byId("issuetickets").setVisible(false);
		oThis.getView().byId("btnCloseTckt").setVisible(false);

		if (myRole == "EMP") {
			profileRole = "01";
			nxtAction = ticket.EmpNo;
			if (nxtAction == ticket.NextAction) {
				switch (ticket.Action) {
				case '10':
					oThis.getView().byId("sendback").setVisible(true);
					oThis.getView().byId("accept").setVisible(true);
					break;
					
				case '02':
					oThis.getView().byId("sendback").setVisible(true);
					oThis.getView().byId("accept").setVisible(true);
					break;
					
				case '':
				}
			}

		} else if (myRole == admManRole) {
			profileRole = "03";
			nxtAction = "00012349";
			if (nxtAction == ticket.NextAction) {
				switch (ticket.Action) {
				case '00'://New
					oThis.getView().byId("submit").setVisible(true);
					oThis.getView().byId("senditenary").setVisible(true);
					oThis.getView().byId("issuetickets").setVisible(true);
					break;
					
				case '02':
					oThis.getView().byId("senditenary").setVisible(true);
					break;

				case '11':
					oThis.getView().byId("sendback").setVisible(true);
					oThis.getView().byId("issuetickets").setVisible(true);
					break;
					
				}
			} else if(ticket.NextAction == "" && ticket.tab=="X") {
				oThis.getView().byId("submit").setVisible(
						true);
				oThis.getView().byId("senditenary")
				.setVisible(true);
			}
			
			if(ticket.Tab=="VISA"){
				oThis.getView().byId("issuetickets").setVisible(true);
			}else if(ticket.Tab == "CANC"){
				oThis.getView().byId("submit").setVisible(false);
				oThis.getView().byId("senditenary").setVisible(false);
				oThis.getView().byId("sendback").setVisible(false);
				oThis.getView().byId("accept").setVisible(false);
				oThis.getView().byId("issuetickets").setVisible(false);
				oThis.getView().byId("btnCloseTckt").setVisible(true);
			}
			
		}
	},
	setTableProperties:function(role){
		var table = this.getView().byId("tblTicketing");
		if(role == "TKM") {				
			
					table.getHeaderToolbar().setVisible(true);
					table.getHeaderToolbar().getContent()[1].setValue("");
					table.getInfoToolbar().setVisible(false);
					table.setMode("MultiSelect");
				
			
		} else{	

			
				table.getHeaderToolbar().setVisible(false);
				table.getInfoToolbar().setVisible(false);
				table.setMode("SingleSelectMaster");
				
			
		}
	},
	onSubmitPDF:function(evt){
		var pdflink = oThis.getView().byId("linkPdf");
		var fileUrl;
		var empno = oThis.getView().byId("linkempno").getValue();
		var tpno =  oThis.getView().byId("linktpno").getValue();
	    var ttype = oThis.getView().byId("linkttype").getValue();
	    
		if (window.location.hostname == "localhost")
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='"+empno+"',TrNo='"+tpno+"',TrvKey='"+ttype+"',Module='REQ')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='"+empno+"',TrNo='"+tpno+"',TrvKey='"+ttype+"',Module='REQ')/$value";

		//pdflink.setHref(fileUrl);
		window.open(fileUrl, "_blank");
	},
	setProperties : function(myRole) {
		if(myRole == "EMP" && ticket.Role == "03" && 
				(ticket.Action == "10" || ticket.Action == "02")) {
			oThis.getView().byId("empinfo").setVisible(true);
		} else {
			oThis.getView().byId("empinfo").setVisible(false);
		}

		var properties = {};

		if (myRole == "EMP") {
			properties = {
				txteditable : false,
				radeditable : true,
				swteditable:false,
				comtxteditbl:true
			};
			oThis.getView().byId("c4").setVisible(false);
			oThis.getView().byId("v4").setVisible(false);
		} else {
			properties = {
				txteditable : true,
				radeditable : false,
				swteditable:true,
				comtxteditbl:true
			};
			oThis.getView().byId("v4").setVisible(true);
			oThis.getView().byId("c4").setVisible(true);			
			oThis.getView().byId("empinfo").setVisible(false);
		}
//		Accept						
		if(ticket.Action == "12") {
			properties = {
				txteditable : false,
				radeditable : false,
				chkeditable:false,
				swteditable:false,
				comtxteditbl:false
			};
		}
		var propertyModel = new sap.ui.model.json.JSONModel();
		propertyModel.setData(properties);
		oThis.getView().setModel(propertyModel, "properties");

	},
	fetchGeneralData : function() {
		var aBatch = [];
		var UploadCollection;
		var model = sap.ui.getCore().getModel("ticket");
		var globalData = sap.ui.getCore().getModel("global").getData();
		var profile = sap.ui.getCore().getModel("profile").getData();

		ticket = sap.ui.getCore().getModel("ticketModel").getData();
		var objhdr = oThis.getView().byId("objhdr");

		objhdr.setTitle('Travel Plan : ' + ticket.TravelPlan);
		objhdr.setNumber("");
		var status = oThis.getView().byId("status1");
		status.setText("");
		var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);

		var generalModel = new sap.ui.model.json.JSONModel();
		generalModel.setData(ticket);
		oThis.getView().setModel(generalModel, "generalmodel");
		if (ticket.AgreeToPay == 'X') {
			oThis.getView().byId("c5").setSelected(true);
		} else {
			oThis.getView().byId("c5").setSelected(false);
		}
		oThis.getView().setModel(generalModel, "generalmodel");
		if (ticket.RequestAppr == 'X') {
			oThis.getView().byId("switch").setState(true);
		} else {
			oThis.getView().byId("switch").setState(false);
		}
		if (ticket.TravelType == "DEPU" || ticket.TravelType == "HOME") {
			var batchOperation3 = oDataModel.createBatchOperation(
					"DmsDocsSet?$filter=DepReq+eq+'"
					+ ticket.DepuReq + "'+and+EmpNo+eq+'"
					+ ticket.EmpNo
					+ "'+and+Module+eq+'TCKT'"
					+ "+and+Country+eq+'"
					+ ticket.ToCountry + "'", "GET");
		} else {
			var batchOperation3 = oDataModel.createBatchOperation(
					"DmsDocsSet?$filter=DepReq+eq+'"
					+ ticket.TravelPlan + "'+and+EmpNo+eq+'"
					+ ticket.EmpNo
					+ "'+and+Module+eq+'TCKT'"
					+ "+and+Country+eq+'"
					+ ticket.ToCountry + "'", "GET");
		}
		
		var tpno = "";
		
		if(ticket.TravelType=="VISA"){
			tpno = "00"+ticket.TravelPlan;
		}
		else{
			tpno = ticket.TravelPlan;
		}

		var batchOperation4 = oDataModel.createBatchOperation(
				"DmsDocsSet?$filter=DepReq+eq+'"
				+ tpno
				+ "'+and+EmpNo+eq+'" + ticket.EmpNo
				+ "'+and+DocType+eq+'TCK'", "GET");
		var batchOperation5 = oDataModel.createBatchOperation(
				"TravelItenarySet?$filter=Pernr+eq+'"
				+ ticket.EmpNo
				+ "'+and+TravelPlan+eq+'"
				+ ticket.TravelPlan
				+ "'+and+Trvltype+eq+'"
				+ ticket.TravelType + "'", "GET");
		var batchOperation6 = oDataModel.createBatchOperation(
				"TicketingCommSet?$filter=Pernr+eq+'"
				+ ticket.EmpNo + "'+and+Reinr+eq+'"
				+ ticket.TravelPlan
				+ "'+and+Trvky+eq+'"
				+ ticket.TravelType + "'", "GET");

		oDataModel.addBatchReadOperations([batchOperation3, batchOperation4, batchOperation5, batchOperation6 ]);

		oDataModel.submitBatch(
			function(oResult) {
				try {
					//attachments
					oThis.getView().byId("UploadCollection").aItems=[];
					filesAll = $.merge(oResult.__batchResponses[0].data.results,
									   oResult.__batchResponses[1].data.results);
					var uploadData = oThis.getView().getModel("new").getData();
					uploadData.Files = filesAll;					
					oThis.getView().getModel("new").setData(uploadData);					
					oThis.getView().getModel("new").refresh(true);
				//	oThis.getView().byId("icontabbar").getItems()[1].setCount(filesAll.length);

					for ( var i = 0; i < oResult.__batchResponses[2].data.results.length; i++) {

						// itenaryModel.setData(oResult.__batchResponses[2].data.results[i]);
						if (i == 0) {
							var v1 = oThis.getView().byId("v1");
							var itenaryModel = new sap.ui.model.json.JSONModel();

							itenaryModel.setData({
								collection1 : oResult.__batchResponses[2].data.results[i]
							});
							oThis.getView().setModel(itenaryModel, "itenary1");
							if (oResult.__batchResponses[2].data.results[i].Options == "X") {
								oThis.getView().byId("c1").setSelected(true);
								objhdr.setNumber(oResult.__batchResponses[2].data.results[i].Tfare);
								var status = oThis.getView().byId("status1");
								status.setText("Option1");
							}
						} else if (i == 1) {
							var v2 = oThis.getView().byId("v2");
							var itenaryModel = new sap.ui.model.json.JSONModel();
							if (oResult.__batchResponses[2].data.results[i].Optionpnr == "")
								oResult.__batchResponses[2].data.results[i].Optionpnr = "No PNR";
							itenaryModel.setData({
								collection2 : oResult.__batchResponses[2].data.results[i]
							});
							oThis.getView().setModel(itenaryModel,"itenary2");

							if (oResult.__batchResponses[2].data.results[i].Options == "X") {
								oThis.getView().byId("c2").setSelected(true);
								objhdr.setNumber(oResult.__batchResponses[2].data.results[i].Tfare);
								var status = oThis.getView().byId("status1");
								status.setText("Option2");
							}
						} else if (i == 2) {
							var v2 = oThis.getView().byId("v3");
							var itenaryModel = new sap.ui.model.json.JSONModel();
							if (oResult.__batchResponses[2].data.results[i].Optionpnr == "")
								oResult.__batchResponses[2].data.results[i].Optionpnr = "No PNR";
							itenaryModel.setData({
								collection3 : oResult.__batchResponses[2].data.results[i]
							});
							oThis.getView().setModel(itenaryModel,"itenary3");

							if (oResult.__batchResponses[2].data.results[i].Options == "X") {
								oThis.getView().byId("c3").setSelected(true);
								objhdr.setNumber(oResult.__batchResponses[2].data.results[i].Tfare);
								var status = oThis.getView().byId("status1");
								status.setText("Option3");
							}
						} else if (i == 3) {
							var itenaryModel = new sap.ui.model.json.JSONModel();
							itenaryModel.setData({
								collection4 : oResult.__batchResponses[2].data.results[i]
							});
							oThis.getView().setModel(itenaryModel, "itenary4");
							if (oResult.__batchResponses[2].data.results[i].Options == "X"
								&& oResult.__batchResponses[2].data.results[i].Seqno == "4") {
								var status = oThis.getView().byId("status1");
								status.setText("Option4");
								objhdr.setNumber(oResult.__batchResponses[2].data.results[i].Tfare);
								oThis.getView().byId("c4").setSelected(true);
								oThis.getView().byId("c4").setVisible(true);
								oThis.getView().byId("v4").setVisible(true);
							}
						}
					}
					var commentModel = new sap.ui.model.json.JSONModel();
					commentModel.setData(oResult.__batchResponses[3].data.results);
					var commentsList = oThis.getView().byId(sap.ui.core.Fragment.createId("AppoveInfo",
							"idListApprove"));

//					commentsList.bindItems("/", new sap.m.ObjectListItem({
//						title : "{Comnt}",
//						attributes : [ 
//						    new sap.m.ObjectAttribute({
//								text : "{Dname}"
//							}),
//							new sap.m.ObjectAttribute({
//									text :"Date: "+"{path:'Erdat',formatter: 'sap.ui.project.e2etm.util.Formatter.formatTicketCommentsDate'}"
//							}) ]
//					}));
					
					commentsList.bindItems("/", new sap.m.FeedListItem({
						text : "{Comnt}",
						sender : "{Dname}",
						timestamp : "Date: " + "{path:'Erdat',formatter: 'sap.ui.project.e2etm.util.Formatter.formatTicketCommentsDate'}",
					}));

					
					commentsList.setModel(commentModel);
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				} catch (err) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				}
			},
			function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			}, true);
	},

	onAttachChange : function(evt) {
		var view = xthis.getView();
		var file = evt.mParameters.files[0];
		var url1 = URL.createObjectURL(file);
		var m = view.byId("matrix");
		m.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
			cells : [
		         new sap.ui.commons.layout.MatrixLayoutCell({
        			 content : [ new sap.m.Link({
						 text : file.name,
						 href : url1
					 }) ]
        		 }),
        		 new sap.ui.commons.layout.MatrixLayoutCell({
					 content : [ new sap.m.Button({
						 icon : "sap-icon://sys-cancel"
					 }).addStyleClass("button_class") ]
				 }) ]
		}).addStyleClass("row"));

	},
	onBack : function() {
		oThis.getView().byId("submit").setVisible(false);
		oThis.getView().byId("senditenary").setVisible(false);
		oThis.getView().byId("sendback").setVisible(false);
		oThis.getView().byId("accept").setVisible(false);
		oThis.getView().byId("issuetickets").setVisible(false);
		window.history.go(-1);
	},

	onNavButton : function() {
		var oData = sap.ui.getCore().getModel("profile")
		.getData();
		oData.currentRole = "EMP";
		sap.ui.getCore().getModel("profile").setData(oData);
		window.history.go(-1);
	},

	onSave : function(evt) {
		var source = evt.oSource;
		var text = source.getText();
		if(text=="Send Back")
			{
			sap.ca.ui.dialog.confirmation.open({
				question : "Are you sure you want to send back?",
				showNote : false,
				title : "Confirm",
				confirmButtonLabel : "Ok"
			}, function(oResult) {
				if (oResult.isConfirmed) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);
					jQuery.sap.delayedCall(1000,oThis,function(){
						oThis.onSaveAccept(source);
					});
				}
			});
			}
		else{
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);
			jQuery.sap.delayedCall(1000,oThis,function(){
				oThis.onSaveAccept(source);
			});
		}
		

	},
	uploadFiles:function(){
		for(var i=0;i<uploadFile.length;i++) {
			var sUrl = sServiceUrl + "DmsDocsSet";
			var post = oThis.onFileUploadto(uploadFile[i].File, sUrl);
		}
	},
	onAccept : function(evt) {
		var source = evt.oSource;
		var c1 = oThis.getView().byId("c1").getSelected();
		var c2 = oThis.getView().byId("c2").getSelected();
		var c3 = oThis.getView().byId("c3").getSelected();
		var c4 = oThis.getView().byId("c4").getSelected();
		if (!c1 && !c2 && !c3 && !c4)
			sap.m.MessageBox.alert("Please select any one option");
		else {
			if(c3||c2) {
				sap.m.MessageBox.show("Information mail will go to manager. Are you sure you want to continue? ",
						sap.m.MessageBox.Icon.NONE,"Confirm",[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],
						function(event){
							if(event=="YES") {
								oThis.onSaveAccept(source);
							}
						});
			} else {
				oThis.onSaveAccept(source);
			}

		}
		//

	},
	onSaveAccept:function(source){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		var profileData = sap.ui.getCore().getModel("profile").getData();

		var role = profileData.currentRole;
		var view = oThis.getView().byId("lwfre");
		var txtarea1 = oThis.getView().byId("txtarea1").getValue();

		var txtarea2 = oThis.getView().byId("txtarea2").getValue();

		var txtarea3 = oThis.getView().byId("txtarea3").getValue();

		var txtarea4 = oThis.getView().byId("txtarea4").getValue();

		var txtarea5 = oThis.getView().byId("txtarea5").getValue();

		var t1 = oThis.getView().byId("t1").getValue();

		var t2 = oThis.getView().byId("t2").getValue();

		var t3 = oThis.getView().byId("t3").getValue();

		var t4 = oThis.getView().byId("t4").getValue();

		var t5 = oThis.getView().byId("t5").getValue();

		var t6 = oThis.getView().byId("t6").getValue();

		var t7 = oThis.getView().byId("t7").getValue();

		var t8 = oThis.getView().byId("t8").getValue();
		var t9 = oThis.getView().byId("t9").getValue();

		var t10 = oThis.getView().byId("t10").getValue();

		var t11 = oThis.getView().byId("t11").getValue();
		var t12 = oThis.getView().byId("t12").getValue();
		var t13 = oThis.getView().byId("t13").getValue();

		var t14 = oThis.getView().byId("t14").getValue();

		var t15 = oThis.getView().byId("t15").getValue();

		var t16 = oThis.getView().byId("t16").getValue();

		var t17 = oThis.getView().byId("t17").getValue();

		var c1, c2, c3, c4, c5;

		if (oThis.getView().byId("c1").getSelected()) {
			c1 = "X";
		} else {
			c1 = "";
		}
		if (oThis.getView().byId("c2").getSelected()) {
			c2 = "X";
		} else {
			c2 = "";
		}

		if (oThis.getView().byId("c3").getSelected()) {
			c3 = "X";
		} else {
			c3 = "";
		}

		if (oThis.getView().byId("c4").getSelected()) {
			c4 = "X";
		} else {
			c4 = "";
		}

		if (oThis.getView().byId("c5").getSelected()) {
			c5 = "X";
		} else {
			c5 = "";
		}

		if (t17 == "") {
			t17 = 0.00;
		}
		if (t2 == "") {
			t2 = 0.00;
		}
		if (t6 == "") {
			t6 = 0.00;
		}
		if (t10 == "") {
			t10 = 0.00;
		}
		if (t14 == "") {
			t14 = 0.00;
		}
		ticket = sap.ui.getCore().getModel("ticketModel").getData();
		var result = {};
		result.Pernr = ticket.EmpNo;
		result.TravelPlan = ticket.TravelPlan;
		result.Trvltype = ticket.TravelType;
		result.Ryamt = t17;// t17;
		result.Ryamc = "";
		result.Comments = txtarea5;

		result.Appry = "";
		result.Agrpy = "";
		result.Status = "";
		result.Rfamt = "0.00";
		result.Rfamc = "";
		result.Vresn = ticket.VersionReason;
		result.Tckno = ticket.Tckno;
		result.Dummy = ticket.Dummy;
		result.Rtdat = ticket.Rtdat;

		if (source.getText() == "Save") {
			result.Action = "00";
			result.Role = "03";
			result.Comments = "";
		} else if (source.getText() == "Send Itinerary") {
			result.Action = "10";
			result.Role = "03";
		} else if (source.getText() == "Accept") {
			result.Action = "11";
			result.Role = "01";
		} else if (source.getText() == "Send Back") {
			result.Action = "02";
			if (role == "EMP")
				result.Role = "01";
			else if (role == admManRole)
				result.Role = "03";
		} else if (source.getText() == "Confirm") {
			result.Action = "12";
			result.Role = "03";
			var sUrl = sServiceUrl + "DmsDocsSet";
			var url = oThis.onFileUploadto(issueFile, sUrl);
		}else if (source.getText() == "Close") {
			result.Action = "32";
			result.Role = "03";
		}
		result.TravelItenarySet = [];
		result.TravelItenarySet.push({
			Pernr : ticket.EmpNo,
			TravelPlan : ticket.TravelPlan,
			Trvltype : ticket.TravelType,
			Optiontxt : txtarea1,
			Optionpnr : t1,
			Tfare : t2,
			Tlimit : t3,
			Spnotes : t4,
			Options : c1,
			Tfarec : "",
			Seqno : "1"
		});

		result.TravelItenarySet.push({
			Pernr : ticket.EmpNo,
			TravelPlan : ticket.TravelPlan,
			Trvltype : ticket.TravelType,
			Optiontxt : txtarea2,
			Optionpnr : t5,
			Tfare : t6,
			Tlimit : t7,
			Spnotes : t8,
			Options : c2,
			Tfarec : "",
			Seqno : "2"
		});

		result.TravelItenarySet.push({
			Pernr : ticket.EmpNo,
			TravelPlan : ticket.TravelPlan,
			Trvltype : ticket.TravelType,
			Optiontxt : txtarea3,
			Optionpnr : t9,
			Tfare : t10,
			Tlimit : t11,
			Spnotes : t12,
			Options : c3,
			Tfarec : "",
			Seqno : "3"
		});

		if (c4 == "X") {
			var switchState;
			var switch1 = oThis.getView().byId("switch");
			if (switch1.getState())
				switchState = "X";
			else
				switchState = "";
			var c5;
			if (oThis.getView().byId("c5").getSelected())
				c5 = "X";
			else
				c5 = "";

			result.TravelItenarySet.push({
				Pernr : ticket.EmpNo,
				TravelPlan : ticket.TravelPlan,
				Trvltype : ticket.TravelType,
				Optiontxt : txtarea4,
				Optionpnr : t13,
				// Appry : switchState,
				// Agrpy : c5,
				Tfare : t14,
				Tlimit : t15,
				Spnotes : t16,
				Options : c4,
				Tfarec : "",
				Seqno : "4"
			});

			result.Appry = switchState;
			result.Agrpy = c5;
			if (switch1) {

			}
		}
		// result.Comments = content;
		var saveModel = new sap.ui.model.odata.ODataModel(sServiceUrl);

		saveModel.create(
				"/TicketingTrnsSet", result, null,
				function(oData, response) {
					//oThis.uploadFiles();
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
					if (source.getText() == "Send Itinerary") {
						oThis.getView().byId("submit").setVisible(false);
						oThis.getView().byId("senditenary").setVisible(false);
						oThis.getView().byId("sendback").setVisible(false);
						oThis.getView().byId("accept").setVisible(false);
						oThis.getView().byId("issuetickets").setVisible(false);
						window.history.go(-1);
					} else if (source.getText() == "Accept") {
						oThis.getView().byId("submit").setVisible(false);
						oThis.getView().byId("senditenary").setVisible(false);
						oThis.getView().byId("sendback").setVisible(false);
						oThis.getView().byId("accept").setVisible(false);
						oThis.getView().byId("issuetickets").setVisible(false);
						window.history.go(-1);
					} else if (source.getText() == "Send Back") {
						oThis.getView().byId("submit").setVisible(false);
						oThis.getView().byId("senditenary").setVisible(false);
						oThis.getView().byId("sendback").setVisible(false);
						oThis.getView().byId("accept").setVisible(false);
						oThis.getView().byId("issuetickets").setVisible(false);
						window.history.go(-1);
					} else if (source.getText() == "Confirm") {
						oThis.getView().byId("submit").setVisible(false);
						oThis.getView().byId("senditenary").setVisible(false);
						oThis.getView().byId("sendback").setVisible(false);
						oThis.getView().byId("accept").setVisible(false);
						oThis.getView().byId("issuetickets").setVisible(false);
						window.history.go(-1);
					}else if (source.getText() == "Close"){
						sap.m.MessageToast.show("Request has been closed successfully")
						window.history.go(-1);
					}
					else {
						alert("Saved Successfully");
					}

				}, function(error) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
					alert("Failed to update data");
				});
	},
	onIssueTicket : function(evt) {
		var dialog = sap.ui.getCore().byId("fileUploadDialog");
		dialog.open();
	},
	onDialogClose : function(evt) {
		var dialog = sap.ui.getCore().byId("fileUploadDialog");
		dialog.close();
	},
	onAfterClose : function() {
		var dialog = sap.ui.getCore().byId("fileUploadDialog");

		var vlayout = sap.ui.getCore().byId("add_ver");

		var content = vlayout.getContent();

		sap.ui.getCore().byId("datePick").setValue("");
		for ( var i = 0; i < content.length; i++) {
			var item = content[i].getItems()[1];
			item.setValue("");

		}

		sap.ui.getCore().byId("dialogupload").setValue("");
		sap.ui.getCore().byId("uploadLink").setVisible(false);
	},

	onTitlePress : function() {

	},
	onActionSettings : function() {
		var viewDialog = oThis.getView().byId("viewDialog");
		viewDialog.open();
	},
	onItemPress : function(event) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		itemSelected = event.getParameter("listItem");
		if(itemSelected.getAggregation("cells"))
		{
		var items = event.oSource.getBinding("items");

		var index1 = event.oSource.indexOfItem(itemSelected);
		var index = items.aIndices[index1];
		var source = event.oSource;
		var items = event.oSource.getBinding("items");
		var bindingItem = event.oSource.getBinding("items").oList;
		var ticketAdminData;
		ticketAdminData = bindingItem[index];

		var iconTab = oThis.getView().byId("idIconTabBarTcktAdmin");
		var key = iconTab.getSelectedKey();
		if(key!="CLOS") {
			if(ticketAdminData.TcktRespUpdateSet)
				delete ticketAdminData.TcktRespUpdateSet;
			if(ticketAdminData.__metadata)
				delete ticketAdminData.__metadata;
			//ticketAdminData = JSON.stringify(ticketAdminData);
            oDataModel.update("TicketWorklistSet(TravelPlan='"
					+ bindingItem[index].TravelPlan
					+ "',TravelType='"+bindingItem[index].TravelType+"',EmpNo='"
					+ bindingItem[index].EmpNo
					+ "')", ticketAdminData, null, jQuery.proxy(function(oData, response,headers) {
						var error = response.headers.error;
						if (error) {
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
							sap.m.MessageBox.alert(error);
						} else{					
							itemSelected.getCells()[11].setText(response.headers.tcktrespname);						 
							//itemSelected.getCells()[9].setText(header.getResponseHeader("TcktRespName"));
						
							sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
							oThis.bindAdminTable(itemSelected, bindingItem, index);
						}
			},this), function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				sap.m.MessageToast.show("Internal Server Error");
			});
			
			
//			var token = "";
//			var get = $.ajax({
//				cache : false,
//				url : sServiceUrl + "EMP_PASSPORT_INFOSet",
//				type : "GET",
//				headers : {
//					'Authorization' : token
//				},
//				beforeSend : function(xhr) {
//					xhr.setRequestHeader('X-CSRF-Token',
//					'Fetch');
//				}
//			});
//			get.done(function(result, response, header) {
//				token = header
//				.getResponseHeader("X-CSRF-Token");
//				var put = $.ajax({
//					cache : false,
//					url : sServiceUrl
//					+ "TicketWorklistSet(TravelPlan='"
//					+ bindingItem[index].TravelPlan
//					+ "',TravelType='"+bindingItem[index].TravelType+"',EmpNo='"
//					+ bindingItem[index].EmpNo
//					+ "')",
//					type : "PUT",
//					data : JSON
//					.stringify(ticketAdminData),
//					dataType : "json",
//					beforeSend : function(xhr) {
//						xhr.setRequestHeader('X-Requested-With', "XMLHttpRequest");
//						xhr.setRequestHeader('X-CSRF-Token', token);
//						xhr.setRequestHeader('Accept',"application/json");
//						xhr.setRequestHeader('DataServiceVersion', "2.0");
//						xhr.setRequestHeader('Content-Type', "application/json");
//					},
//				});
//				put.done(function(result, response, header) {
//					var error = header.getResponseHeader("error");
//					if (error) {
//						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
//						sap.m.MessageBox.alert(error);
//					} else{					
//					 
//						itemSelected.getCells()[9].setText(header.getResponseHeader("TcktRespName"));
//					
//						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
//						oThis.bindAdminTable(itemSelected, bindingItem, index);
//					}
//				});
//				put.fail(function(err) {
//					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
//					sap.m.MessageBox.alert("Internal Server error occured");
//				});
//			});
//			get.fail(function(error) {
//				alert("unable to load data");
//			});
		} else {
			var binding = event.oSource.getBinding("items");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			oThis.bindAdminTable(itemSelected, bindingItem, index);
		}
		}
	},
	bindAdminTable : function(itemSelected, bindingItem, index) {
		ticket = bindingItem[index];
		var model = new sap.ui.model.json.JSONModel();
		model.setData(ticket);
		sap.ui.getCore().setModel(model, "ticketModel");
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("ticketing");
	},
	onMenu : function(evt) {
		menuRef = sap.ui.project.e2etm.util.StaticUtility.customMenuOpen(oThis,evt);

	},
	onMenuItemSelect : function(evt) {
		
		var menu = oThis.getView().byId("menu_settings");
		var table = this.getView().byId("tblTicketing");
		var sPath = oThis.findProperty();
		var oBinding = table.getBinding("items");
		
		var requestFlag = sap.ui.project.e2etm.util.StaticUtility.customMenuItemSelect(oThis,evt,menuRef,sPath,oBinding);
		if(requestFlag){
			var tab = this.getWorklistTab();	
			var role = sap.ui.getCore().getModel("profile").getData().currentRole;
			
			filterString = sPath+" eq '"+evt.getParameter("item").getValue()+"' and LoginRole eq '"+role+"' and Tab eq '"+tab+"'";  
			
		    this.getTcktWorklist(filterString,table);
		}
		

	},
	getItembyKey:function(){
		var item;
		var iconTab = oThis.getView().byId("idIconTabBarTcktAdmin");
		var key = iconTab.getSelectedKey();
		var items = iconTab.getItems();
		$.each(items,function(index,value){
			if(value.getKey()==key){
				found=index;
				item = value;
				return false;
			}
		});
		if(!item) {
			item = iconTab.getItems()[0];
		}
		return item;
	},

	findProperty : function() {
		var sPath;
		switch (menuRef.getText()) {
		case "Travel Req":
			sPath = "TravelPlan";
			break;
		case "Employee No":
			sPath = "EmpNo";
			break;
		case "Name":
			sPath = "EmpName";
			break;
		case "From Country":
			sPath = "FromCountryText";
			break;
		case "To Country":
			sPath = "ToCountryText";
			break;
		case "From Date":
			sPath = "StartDate";
			break;
		case "To Date":
			sPath = "EndDate";
			break;
		case "Request With":
			sPath = "TcktRespName";
			break;
		case "Category":
			sPath = "TrvCat";
			break;
		case "Level":
			sPath = "Level";
			break;
		case "Date&Time":
			sPath = "CrDateTime";
			break;

		}
		return sPath;
	},
	onUnifiedChange : function(evt) {
		var url;
		issueFile = evt.mParameters.files[0];
		if(window.navigator.msSaveOrOpenBlob) {
			 var reader = new FileReader();
		       reader.onloadend = function() {
		    	     url = reader.result;
		    	     var uploadLink = sap.ui.getCore().byId("uploadLink");
		    			uploadLink.setVisible(true);
		    			uploadLink.setText(issueFile.name);
		    			uploadLink.setHref(url);
   		    	   };
	         reader.readAsDataURL(issueFile);
		}
		else{
			url = URL.createObjectURL(issueFile);
			var uploadLink = sap.ui.getCore().byId("uploadLink");
			uploadLink.setVisible(true);
			uploadLink.setText(issueFile.name);
			uploadLink.setHref(url);
		}
		
		
	},
	onLinkPress:function(){
		if(window.navigator.msSaveOrOpenBlob) {
			var filedata = [issueFile];
			var blob = new Blob(filedata);
			 window.navigator.msSaveOrOpenBlob(blob, issueFile.name);
		}
		else{
			url = URL.createObjectURL(issueFile);
			window.open(url);
		}
		
	},
	onDialogconfirm : function(evt) {
		var vlayout = sap.ui.getCore().byId("add_ver");
		var uploadValue = sap.ui.getCore().byId("dialogupload").getValue();
		var datePick = sap.ui.getCore().byId("datePick").getValue();
		var ticketNo;
		var content = vlayout.getContent();

		if(datePick==""){
			sap.m.MessageToast
			.show("Please enter some date");
		} else {
			var endDate = oThis.getView().getModel("generalmodel").getData().EndDate;
			var ticket = sap.ui.getCore().getModel("ticketModel").getData();

			if(endDate==datePick){
				ticket.Dummy = '';
			}
			else{
				ticket.Dummy = 'X';
			}

			var str = "/Date("+datePick+"00000)/";
			ticket.Rtdat = datePick;
			sap.ui.getCore().getModel("ticketModel").setData(ticket);
		}
		for ( var i = 0; i < content.length; i++) {
			var item = content[i].getItems()[1];
			var value = item.getValue();
			if (value != "") {
				if(ticketNo)
					ticketNo = ticketNo+";"+value;
				else
					ticketNo = value;
			} else {
				item.setValueState(sap.ui.core.ValueState.Error);
				sap.m.MessageToast.show("Please enter ticket number");
				return;
			}
		}
		if (uploadValue == "") {
			sap.m.MessageToast.show("Please upload ticket file");
		} else {
			var ticket = sap.ui.getCore().getModel(
					"ticketModel").getData();
			ticket.Tckno = ticketNo;
			sap.ui.getCore().getModel("ticketModel").setData(ticket);
			oThis.onSave(evt);
		}
	},
	onFileUpload:function(evt){
		var file = evt.getParameters("files").files[0];
		var oData =  evt.oSource.getParent().getModel("generalmodel").getData();
		var sModule = "TCK";
		var tpno;
        
		if(oData.TravelType == "VISA")
			tpno="00"+oData.TravelPlan;
		else
			tpno= oData.TravelPlan;
		
    	sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(oThis,file,tpno,oData.EmpNo,sModule);
		
    	
	
	},
	onFileDeleted: function(oEvent){
		// prepare FileName
		var sFileName = oEvent.getParameters("item").item.getFileName();

		// prepare DocType
		var oData =  oEvent.oSource.getParent().getModel("generalmodel").getData();
		var sDocType;
		sDocType = "TCK";

		// prepare travel request number
		var sDepReq = oData.TravelPlan;

		// prepare employee number
		var sEmpNo = oData.EmpNo;

		// prepare index
		var sIndex = 0;

		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(oThis, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex);

	},
	onUploadComplete:function(oEvent){
		
		oThis.getView().getModel("new").refresh(true);
	//	oEvent.oSource.setUploadUrl("");
	},
	onBatchSubmit:function(evt){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);
		var travelplan = oThis.getView().byId("batchtravel").getValue();
		var empno = oThis.getView().byId("batchemp").getValue();
		var filedata = {};
		
		
		oDataModel.read("DmsDocsSet?$filter=DepReq eq '"
				+ travelplan
				+ "' and EmpNo eq '" + empno+"' and DocType eq 'ICP'",null,null,true,
				function(oData,response){
					if(!(oThis.getView().getModel("batchupload")))
					{
					filedata ={Files:oData.results};
					var model = new sap.ui.model.json.JSONModel();
					model.setData(filedata);				
					oThis.getView().setModel(model,"batchupload");
					}
				else{
					filedata = oThis.getView().getModel("batchupload").getData();
					filedata.Files = oData.results;
					oThis.getView().getModel("batchupload").setData(filedata);
				}
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
					
				},function(error){
					sap.m.MessageToast.show("Internal Server Error");
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
				});
	},
	onBatchUpload:function(evt){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,oThis);
		if(!(oThis.getView().getModel("batchupload")))
		{
		oData={Files:[]};
		var model = new sap.ui.model.json.JSONModel();
		model.setData(oData);
		oThis.getView().setModel(model,"batchupload");
		}
	else{
	     oData = oThis.getView().getModel("batchupload").getData();
	     oData.Files = [];
	     oThis.getView().getModel("batchupload").setData(oData);
	}
		var token = "";
		var source = evt;
	    var files = evt.getParameters("files").files;
	    var get = $.ajax({
		cache: false,
		async:true,
		url: sServiceUrl + "EMP_PASSPORT_INFOSet",
		type: "GET",
		headers: {
			'Authorization': token
		},
		beforeSend: function(xhr){
			xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
		},
	});
	get.done(function(result, response, header){
		//var sFileName = fFile.name;
		var sUrl = sServiceUrl +  "DmsDocsSet";
		for(var i=0;i<files.length;i++){
		var filename =  files[i].name.split("_");
		if(filename.length==3){
		var sSlung = filename[0] + "," + filename[1] + "," + filename[2] + ",ICP" ;
		var oHeaders = {
				'X-Requested-With': "XMLHttpRequest",
				'X-CSRF-Token': header.getResponseHeader("X-CSRF-Token"),
				'Accept': "application/json",
				'DataServiceVersion': "2.0",
				'Content-Type': "application/json",
				"slug": sSlung,						  
			
		};
		oThis.batchUploadTo(oHeaders,sUrl,files[i]);
		
		}
	
		}
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false,oThis);
//	busy=false;	     
	});		
	},

	onBatchUploadComplete:function(evt){
		evt.oSource.aItems = [];
	//	oThis.getView().getModel("batchupload").refresh(true);
	},
	batchUploadTo:function(oHeaders,sUrl,fFile){
		var oItem = {};
		var post = jQuery.ajax({
			cache: false,
			type: 'POST',
			url: sUrl,
			headers: oHeaders,
			cache: false,
			async:true,
			contentType: fFile.type,
			processData: false,
			data: fFile,
		});

		post.success(function(data){
			
			var oData = oThis.getView().getModel("batchupload").getData();
			
			oItem = {				
					FileMimeType: data.d.FileMimeType,
					FileName: data.d.FileName,
					FileUrl: data.d.FileUrl,			
			};

			oData.Files.unshift(oItem);
			oThis.getView().getModel("batchupload").setData(oData);
			oThis.getView().getModel("batchupload").refresh(true);
		});
		
	},
	onDialogComplete : function(evt) {

	},
	onFileUploadto : function(file, sUrl) {
		var tpno;
		if(ticket.TravelType=="VISA"){
			tpno = "00"+ticket.TravelPlan;	
		}
		else{
			tpno = ticket.TravelPlan;	
		}
		var token = "";
		var post;
		var get = $.ajax({
			cache : false,
			async : false,
			url : sServiceUrl + "EMP_PASSPORT_INFOSet",
			type : "GET",
			headers : {
				'Authorization' : token
			},
			beforeSend : function(xhr) {
				xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
			}
		});
		get.done(function(result, response, header) {
			var sSlung = tpno + "," + ticket.EmpNo
			+ "," + file.name + "," + "TCK";
			var oHeaders = {
					'X-Requested-With' : "XMLHttpRequest",
					'X-CSRF-Token' : header
					.getResponseHeader("X-CSRF-Token"),
					'Accept' : "application/json",
					'DataServiceVersion' : "2.0",
					'Content-Type' : "application/json",
					"slug" : sSlung
			};

			post = jQuery.ajax({
				cache : false,
				async : false,
				type : 'POST',
				url : sUrl,
				headers : oHeaders,
				cache : false,
				contentType : file.type,
				processData : false,
				data : file
			});
			post.done(function(data) {
				url = data.d.FileUrl;
				filesAll.push(data.d);
			});
		});
		return post;						
	},
	onRadioSelect : function(evt) {
		var bool = evt.oSource.getSelected();
		if (!(evt.oSource.getSelected()))
			evt.oSource.setSelected(false);
	},
	onCheckSelect1 : function(evt) {
		oThis.getView().byId("v2").getContent()[0].getContent()[0].setSelected(false);
		oThis.getView().byId("v3").getContent()[0].getContent()[0].setSelected(false);
	},
	onCheckSelect2 : function(evt) {
		oThis.getView().byId("v1").getContent()[0].getContent()[0].setSelected(false);
		oThis.getView().byId("v3").getContent()[0].getContent()[0].setSelected(false);
	},
	onCheckSelect3 : function(evt) {
		oThis.getView().byId("v1").getContent()[0].getContent()[0].setSelected(false);
		oThis.getView().byId("v2").getContent()[0].getContent()[0].setSelected(false);
	},
	
	onExpand : function(evt) {
		var mydiv = $("#divPdf").contents().find("div");
		var h = mydiv.height();
		$(this).height(h);
		var h1 = $("#divPdf").height();
	},
	onCheckSelect4 : function(evt) {
//		var v4 = oThis.getView().byId("v4");
		var v4 = oThis.getView().byId("optionv4");
		if (evt.oSource.getSelected())
			v4.setVisible(true);
		else {
			v4.setVisible(false);
		}
	},
	onAdd : function(evt) {
		var addVer = sap.ui.getCore().byId("add_ver");
		var length = addVer.getContent().length;
		if (length <= 2)
			addVer.addContent(new sap.m.FlexBox({
				width : "405px",
				direction : "Row",
				justifyContent : "SpaceBetween",
				alignItems : "Center",
				items : [ new sap.m.Label({
					text : "Ticket Number",
					required : true
				}), new sap.ui.commons.TextField({
					width : "200px"
				}), new sap.ui.commons.Button({
					id:"button"+(length+1),
					icon : "sap-icon://delete",
					press : oThis.onDelete
				}) ]
			}));
	},
	onDelete:function(evt){
		var id = evt.oSource.sId;
		var addVer = sap.ui.getCore().byId("add_ver");
		var content = addVer.getContent();
		for(var i =0;i<content.length;i++){
			var items = content[i].getItems();
			if(items[2].getId()==id){
				content[i].destroy();
				break;
			}
		}
		if(i<=3&&content.length==3)
			content[i+1].getItems()[2].setId("button"+(i-1));
	},

	onLive:function(evt){
		evt.preventDefault();
	},
	onAssign:function(evt){
		var tableModel = new sap.ui.model.json.JSONModel();
		var content;
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);

		var found,item,content;
		var iconTab = oThis.getView().byId("idIconTabBarTcktAdmin");
		var key = iconTab.getSelectedKey();
		var items = iconTab.getItems();
		$.each(items,function(index,value){
			if(value.getKey()==key){
				found=index;
				item = value;
				return false;
			}
		});
		if(!item) {
			item = items[0];
		}
		content =  this.getView().byId("tblTicketing");
		var empValue= content.getHeaderToolbar().getContent()[1].getValue();
		if(empValue=="") {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			sap.m.MessageBox.alert("Please enter employee number");
		} else {
			var itemSelected = content.getSelectedItems();
			if(itemSelected.length==0) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(
						false, oThis);
				sap.m.MessageBox.alert("Please select atleast one row");
			} else {
				var results={};
				var globalData = sap.ui.getCore().getModel("global").getData();
				var profileData = sap.ui.getCore().getModel("profile").getData();

				var items = content.getBinding("items").oList;
				var itemsAll = content.getItems();


				results.TcktRespUpdateSet=[];

				for(var i=0;i<itemSelected.length;i++)
				{				
					var index1 = itemsAll.indexOf(itemSelected[i]);
					var index = content.getBinding("items").aIndices[index1];
					results.TcktRespUpdateSet.push({TravelPlan:items[index].TravelPlan,TravelType:items[index].TravelType,
						EmpNo:items[index].EmpNo,Tcktresp:empValue,Tcktrespname:""});
					if(i==0) {
						results.EmpNo = items[index].EmpNo
						results.TravelPlan = items[index].TravelPlan;
						results.TravelType = items[index].TravelType;
					}
				}
				var saveModel = new sap.ui.model.odata.ODataModel(
						sServiceUrl);

				saveModel.create("/TicketWorklistSet", results, null,
					function(oData, response) {
						for(var i=0;i<itemSelected.length;i++) {				
							var index = itemsAll.indexOf(itemSelected[i]);
							items[index].TcktResp = oData.TcktResp;
							items[index].TcktRespName = oData.TcktRespName;
						}
						tableModel.setData(items);				
						content.setModel(tableModel);
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
						sap.m.MessageBox.alert("Assigned Successfully");
					},
					function(error){
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
						sap.m.MessageBox.alert("Internal server error occured");
					});
			}	

		}
	},
	handleLinkEmailPress: function(evt){
		var emailId = evt.oSource.getText();
		sap.m.URLHelper.triggerEmail(emailId, "Ticketing", "Dear ,");
	}
});