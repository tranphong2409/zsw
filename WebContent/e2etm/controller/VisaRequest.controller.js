var VisaPlanThis, oDataModel;
oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
var filesAll = [];
sap.ui.controller("sap.ui.project.e2etm.controller.VisaRequest", {
	onInit : function() {
		VisaPlanThis = this;
		if (this.oView.sViewName == "sap.ui.project.e2etm.view.VisaRequest") {
			VisaPlanThis.getView().byId("visaToolbar").setVisible(false);
			VisaPlanThis.getView().byId("flexBoxFundF02").setVisible(false);
			VisaPlanThis.getView().byId("flexBoxFundF03").setVisible(false);
			var dialog = sap.ui.xmlfragment("sap.ui.project.e2etm.fragment.visaplan.Dialog", this);
			sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
		} else {
			sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onAdminRouteMatched, this);
		}
	},
	onRouteMatched : function(evt) {
		var view = evt.mParameters.view;
		VisaPlanThis = view.getController();
		if (evt.getParameter("name") == "VisaRequest") {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, VisaPlanThis);
			var profileData = sap.ui.getCore().getModel("profile").getData();
			var globaldata = sap.ui.getCore().getModel("global").getData();
			VisaPlanThis.getView().byId("UploadCollection").aItems=[];
			uploadFile = [];
			filesAll = [];
			var visaData = {};
			if (globaldata.ZZ_VISA_REQ == "" || globaldata.ZZ_VISA_REQ == undefined) {
				visaData.ZZ_DEP_NAME = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_NAME;
				visaData.ZZ_DEP_PERNR = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
				visaData.ZZ_DEP_DEPT = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DEPT;
				visaData.ZZ_DEP_EMAIL = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_EMAIL;
				visaData.ZZ_DEP_DOB = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DOB;
				visaData.ZZ_CONTACT = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_CONTACT;
			} else {
				visaData.ZZ_DEP_NAME = globaldata.ZZ_DEP_NAME;
				visaData.ZZ_DEP_PERNR = globaldata.ZZ_DEP_PERNR;
				visaData.ZZ_DEP_DEPT = globaldata.ZZ_DEP_DEPT;
				visaData.ZZ_DEP_EMAIL = globaldata.ZZ_DEP_EMAIL;
				visaData.ZZ_DEP_DOB = globaldata.ZZ_DEP_DOB;
				// visaData.ZZ_CONTACT =
				// sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_CONTACT;
				visaData.ZZ_MOBILE = globaldata.ZZ_MOBILE;
			}
			VisaPlanThis.setProperties(profileData.currentRole);
			VisaPlanThis.setTravelPlanPdf();
			var date = new Date();
			// changing the Date to yyyyMMdd
			var yyyy = date.getFullYear().toString();
			var mm = (date.getMonth() + 1).toString();
			mm = ("0" + mm).slice(-2);
			var dd = date.getDate().toString();
			var date = yyyy + mm + dd;
			var sRequest = '';
			var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
			var batchOperation0 = oDataModel.createBatchOperation("WBSf4Help?" + "ZZ_REINR='" + sRequest + "'&ZZ_PERNR='" + visaData.ZZ_DEP_PERNR + "'&ZZ_TTYPE='BUSR'&ZZ_LAND1=''&$format=json", "GET");
			// var batchOperation2 =
			// oDataModel.createBatchOperation("GetF4Table?TableName='CSKT'&Col1='KOKRS'&Col2='KOSTL'&Col3='KTEXT'&Col4='LTEXT'&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''&$format=json",
			// "GET");
			var batchOperation1 = oDataModel.createBatchOperation("CostCenterF4Help?" + "ZZ_REINR='" + sRequest + "'&ZZ_TTYPE='" + VisaPlanThis.getView().getModel().oData.ZZ_TRV_TYP + "'&ZZ_PERNR='" + visaData.ZZ_DEP_PERNR + "'&ZZ_TTYPE='BUSR'&ZZ_LAND1=''&$format=json", "GET");
			var batchOperation2 = oDataModel.createBatchOperation("Fund_F4_Help?ZZ_BEGDA='" + date + "'&ZZ_ENDDA='" + date + "'&$format=json", "GET");
			var batchOperation3 = oDataModel.createBatchOperation("BudgetCenter_F4_Help?ZZ_BEGDA='" + date + "'&ZZ_ENDDA='" + date + "'&$format=json", "GET");
			var batchOperation4 = oDataModel.createBatchOperation("VKMNames?VKMName='DE'&$format=json", "GET");
			var batchOperation5 = oDataModel.createBatchOperation("ZE2E_REQ_LOGSet?$filter=ZZ_TRV_REQ+eq+'" + sap.ui.getCore().getModel("global").getData().ZZ_VISA_REQ + "'+and+ZZ_MODID+eq+'" + "VISA" + "'+and+ZZ_SMODID+eq+'" + "INTL'+and+ZZ_TRV_KEY+eq+'BUSR'", "GET");
			var batchOperation6 = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + sap.ui.getCore().getModel("global").getData().ZZ_VISA_REQ + "'+and+EmpNo+eq+'" + sap.ui.getCore().getModel("global").getData().ZZ_PERNR + "'+and+DocType+eq+'VIS'", "GET");
			var batchOperation7 = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + sap.ui.getCore().getModel("global").getData().ZZ_VISA_REQ + "'+and+EmpNo+eq+'" + sap.ui.getCore().getModel("global").getData().ZZ_PERNR + "'+and+DocType+eq+'INS'", "GET");
			var batchOperation8 = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + sap.ui.getCore().getModel("global").getData().ZZ_VISA_REQ + "'+and+EmpNo+eq+'" + sap.ui.getCore().getModel("global").getData().ZZ_PERNR + "'+and+DocType+eq+'ACC'", "GET");
			var batchOperation9 = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + sap.ui.getCore().getModel("global").getData().ZZ_VISA_REQ + "'+and+EmpNo+eq+'" + sap.ui.getCore().getModel("global").getData().ZZ_PERNR + "'+and+DocType+eq+'TCK'", "GET");
			oDataModel.addBatchReadOperations([ batchOperation0, batchOperation1, batchOperation2, batchOperation3, batchOperation4, batchOperation5, batchOperation6, batchOperation7, batchOperation8, batchOperation9 ]);
			// var ZZ_VISA_TOCNTRY =
			// this.getView().getModel("visa").getData().ZZ_VISA_TOCNTRY;
			oDataModel.submitBatch(function(oResult) {
				visaData.selectedCountry = "IN";
				// Search help for WBS element
				visaData.wbsElement = oResult.__batchResponses[0].data.results;
				// Search help for cost center
				visaData.costCenter = oResult.__batchResponses[1].data.results;
				// Search help for fund
				visaData.fund = oResult.__batchResponses[2].data.results;
				// Search help for budget center
				visaData.budgetCenter = oResult.__batchResponses[3].data.results;
				// Search help for VKM
				visaData.vkm = oResult.__batchResponses[4].data.results;
				sap.ui.project.e2etm.util.StaticUtility.showTooltipFund(visaData);
				sap.ui.project.e2etm.util.StaticUtility.showTooltipBudgetCode(visaData);
				sap.ui.project.e2etm.util.StaticUtility.showTooltipVKM(visaData);
				// sap.ui.project.e2etm.util.StaticUtility();
				visaModel.setData(visaData);
				VisaPlanThis.getView().setModel(visaModel, "visa");
				var commentModel = new sap.ui.model.json.JSONModel();
				var commentsList = VisaPlanThis.getView().byId(sap.ui.core.Fragment.createId("AppoveInfo", "idListApprove"));
				commentModel.setData(oResult.__batchResponses[5].data.results);
				commentsList.bindItems("/", new sap.m.FeedListItem({
					text : "{ZZ_COMMENTS}",
					sender : "{ZZ_NT_ID}",
					timestamp : "Date: " + "{path:'ZZ_RTIMESTAMP'," + "formatter: 'sap.ui.project.e2etm.util.Formatter.sapDate'}",
				}));
				commentsList.setModel(commentModel);
				// filesAll =
				// oResult.__batchResponses[6].data.results
			//	filesAll = oResult.__batchResponses[6].data.results;
				//filesAll = $.merge(oResult.__batchResponses[6].data.results, oResult.__batchResponses[7].data.results, oResult.__batchResponses[8].data.results, oResult.__batchResponses[9].data.results);
				filesAll = filesAll.concat(oResult.__batchResponses[6].data.results, oResult.__batchResponses[7].data.results, oResult.__batchResponses[8].data.results, oResult.__batchResponses[9].data.results);
				var uploadModel = new sap.ui.model.json.JSONModel();
				uploadModel.setData(filesAll);
				UploadCollection = VisaPlanThis.getView().byId("UploadCollection");
				UploadCollection.setModel(uploadModel);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			}, function(error) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			}, true);
			if (sap.ui.getCore().getModel("global").getData().ZZ_VISA_REQ == "" || sap.ui.getCore().getModel("global").getData().ZZ_VISA_REQ == undefined) { // for
				// creating
				// a
				// new
				// request
				var visaModel = new sap.ui.model.json.JSONModel();
				visaModel.setData(visaData);
				VisaPlanThis.getView().setModel(visaModel);
				VisaPlanThis.getView().bindElement("/");
				this.getView().setModel(sap.ui.getCore().getModel("global"), "global1");
				VisaPlanThis.visaData = {
					ZZ_VISA_REQ : ''
				};
				visaData.BVISA_HDR_TO_COST_ASGN = {}
				visaData.BVISA_HDR_TO_COST_ASGN.results = [];
				var oObject = {
					ZZ_PERCENT : '100'
				};
				visaData.BVISA_HDR_TO_COST_ASGN.results.push(oObject);
				visaData.view = {
					costLength : visaData.BVISA_HDR_TO_COST_ASGN.results.length,
					isFuture : true,
					emp : false,
					visaAdmin : false,
					visano : false
				};
				// VisaPlanThis.clearData();
			} else {
				// this.getView().setModel(sap.ui.getCore().getModel("global"));
				var visaModel = new sap.ui.model.json.JSONModel();
				visaData.ZZ_VISA_NO = sap.ui.getCore().getModel("global").getData().ZZ_VISA_NO;
				visaData.ZZ_VISA_SDATE = sap.ui.getCore().getModel("global").getData().ZZ_VISA_SDATE;
				visaModel.setData(visaData);
				visaData.ZZ_VISA_EDATE = sap.ui.getCore().getModel("global").getData().ZZ_VISA_EDATE;
				if (sap.ui.getCore().getModel("global").getData().ZZ_TKT == "X") {
					visaData.ZZ_TKT = true;
				} else {
					visaData.ZZ_TKT = false;
				}
				if (sap.ui.getCore().getModel("global").getData().ZZ_ACC == "X") {
					visaData.ZZ_ACC = true;
				} else {
					visaData.ZZ_ACC = false;
				}
				if (sap.ui.getCore().getModel("global").getData().ZZ_INS == "X") {
					visaData.ZZ_INS = true;
				} else {
					visaData.ZZ_INS = false;
				}
				VisaPlanThis.getView().setModel(visaModel);
				VisaPlanThis.getView().bindElement("/");
				VisaPlanThis.getView().byId("visaToolbar").setVisible(true);
				var linecount = sap.ui.getCore().getModel("global").getData().BVISA_HDR_TO_COST_ASGN.results.length
				visaData.view = {
					costLength : linecount,
					isFuture : true,
					emp : false,
					visano : true
				};
				VisaPlanThis.getView().setModel(sap.ui.getCore().getModel("global"), "global1");
				var global = sap.ui.getCore().getModel("global").getData();
				visaData.ZZ_OFF_NUM = global.ZZ_OFF_NUM;
				visaData.ZZ_VISA_TOCNTRY = global.ZZ_VISA_TOCNTRY;
				visaData.ZZ_VISA_PSDATE = global.ZZ_VISA_PSDATE;
				visaData.ZZ_VISA_PEDATE = global.ZZ_VISA_PEDATE;
				visaData.ZZ_VISA_PEDATE = global.ZZ_VISA_PEDATE;
				visaData.ZZ_VISA_REQ = global.ZZ_VISA_REQ;
				visaData.ZZ_VKM = global.ZZ_VKM;
				visaData.ZZ_CCNAME = global.ZZ_CCNAME;
				visaData.ZZ_CCDEPT = global.ZZ_CCDEPT;
				visaData.ZZ_EANO = global.ZZ_EANO;
				visaData.ZZ_CCOST = global.ZZ_CCOST;
				visaData.ZZ_PONO = global.ZZ_PONO;
				visaData.ZZ_CLENTY = global.ZZ_CLENTY;
				visaData.BVISA_HDR_TO_COST_ASGN = global.BVISA_HDR_TO_COST_ASGN;
				visaModel.setData(visaData);
				VisaPlanThis.getView().setModel(visaModel);
			}
		}
		// if(profileData.currentRole == "GRM"){//for GRM role
		// VisaPlanThis.getView().byId("visaToolbar").setVisible(true);
		// VisaPlanThis.getView().byId("visaadmin").setVisible(false);
		// if(sap.ui.getCore().getModel("global").getData().ZZ_VISA_NO
		// == "" ||
		// sap.ui.getCore().getModel("global").getData().ZZ_VISA_NO
		// == undefined){
		//								
		// }
		// else{
		//								
		// }
		// }
		// if(profileData.currentRole == "VISAADMIN"){//for GRM
		// role
		// VisaPlanThis.getView().byId("visaToolbar").setVisible(true);
		// VisaPlanThis.getView().byId("visaadmin").setVisible(true);
		// if(sap.ui.getCore().getModel("global").getData().ZZ_VISA_NO
		// == "" ||
		// sap.ui.getCore().getModel("global").getData().ZZ_VISA_NO
		// == undefined){
		//								
		// }
		// else{
		//								
		// }
		// }
	},
	setTravelPlanPdf:function(){
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		var panel = VisaPlanThis.getView().byId("panel_html");
		if(role=="VISA"){
			
	    panel.setVisible(true);		
		var html = VisaPlanThis.getView().byId("html1");
		
		var fileUrl;
		if (window.location.hostname == "localhost")
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='"+sap.ui.getCore().getModel("global").getData().ZZ_DEP_PERNR+"',TrNo='"+sap.ui.getCore().getModel("global").getData().ZZ_VISA_REQ+"',TrvKey='"+sap.ui.getCore().getModel("global").getData().ZZ_VISA_TYP+"',Module='VISA')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='"+sap.ui.getCore().getModel("global").getData().ZZ_DEP_PERNR+"',TrNo='"+sap.ui.getCore().getModel("global").getData().ZZ_VISA_REQ+"',TrvKey='"+sap.ui.getCore().getModel("global").getData().ZZ_VISA_TYP+"',Module='VISA')/$value";

		html.setContent(" ");
		html.setContent("<div><object data=\""
				+ fileUrl
				+ "\" type=\"application/pdf\" width=\"100%\" height=\"1250px\"></object></div>");
		
		}
		else{
			panel.setVisible(false);
		}
	},
	onAdminRouteMatched : function(evt) {
		var view = evt.mParameters.view;
		VisaPlanThis = view.getController();
		if (evt.getParameter("name") == "VisaAdmin") {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, VisaPlanThis);
			VisaPlanThis.getVisaDetails();
		}
	},
	getVisaDetails : function() {
		var iconTabVisaAdmin = VisaPlanThis.getView().byId("iconTabVisaAdmin");
		oDataModel.read("ZE2E_BVISA_ADMIN", null, null, true, function(oData, response) {
			var model = new sap.ui.model.json.JSONModel();
			model.setData(oData.results);
			VisaPlanThis.getView().setModel(model, "tablemodel");
			iconTabVisaAdmin.fireSelect({
				item : iconTabVisaAdmin.getItems()[0],
				key : "NEW",
			});
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
		}, function(error) {
			alert("Internal Server Error");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
		});
	},
	onIconTabSelect : function(evt) {
		var key = evt.oSource.getSelectedKey();
		// var key = evt.getParameter("item").getKey();
		var filter = [];
		var model1 = VisaPlanThis.getView().getModel("tablemodel");
		var table = VisaPlanThis.getView().byId("tablevisa");
		var item = evt.getParameter("item");
		var columns = table.getColumns();
		for ( var i = 0; i < columns.length; i++) {
			columns[i].getHeader().setIcon("sap-icon://sort");
		}
		// var table =
		// VisaPlanThis.getView().byId("iconTabVisaAdmin").getContent()[0];
		// evt.oSource.setSelectedKey(key);
		table.setModel(model1);
		switch (key) {
		case "NEW" || "":
			item = evt.oSource.getItems()[0];
			var oFilter = new sap.ui.model.Filter("ZZ_NACTION_BY", "EQ", "456789");
			filter.push(oFilter);
			var bindItems = table.getBinding("items");
			var filteredItems = bindItems.filter(filter);
			var model = VisaPlanThis.setBinding(filteredItems.aIndices, model1.getData());
			table.setModel(model);
			item.setCount(model.getData().length);
			break;
		case "CANCEL":
			item = evt.oSource.getItems()[1];
			var oFilter = new sap.ui.model.Filter("ZZ_ACTION", "EQ", "09");
			filter.push(oFilter);
			var bindItems = table.getBinding("items");
			var filteredItems = bindItems.filter(filter);
			var model = VisaPlanThis.setBinding(filteredItems.aIndices, model1.getData());
			table.setModel(model);
			item.setCount(filteredItems.getLength());
			break;
		case "CLOSE":
			item = evt.oSource.getItems()[1];
			var oFilter = new sap.ui.model.Filter("ZZ_NACTION_BY", "EQ", "");
			filter.push(oFilter);
			var bindItems = table.getBinding("items");
			var filteredItems = bindItems.filter(filter);
			var model = VisaPlanThis.setBinding(filteredItems.aIndices, model1.getData());
			table.setModel(model);
			item.setCount(filteredItems.getLength());
			break;
		}
	},
	setBinding : function(aindice, results) {
		var result = [];
		for ( var i = 0; i < aindice.length; i++) {
			var index = aindice[i];
			result.push(results[index]);
		}
		var model = new sap.ui.model.json.JSONModel();
		model.setData(result);
		return model;
	},
	setProperties : function(role) {
		var global = sap.ui.getCore().getModel("global").getData();
		var model = new sap.ui.model.json.JSONModel();
		VisaPlanThis.getView().byId("comments").setValue("");
		var properties;
		VisaPlanThis.getView().byId("visaadmin").setVisible(true);
		var icontab = VisaPlanThis.getView().byId("iconTabBarId");
		icontab.setSelectedKey(icontab.getItems()[0].getKey());
	//	icontab.fireSelect(icontab.getItems()[0]);
		if (role == "EMP") {
//			if(global.ZZ_NACTION_BY == global.ZZ_DEP_PERNR){
//				properties = {
//						savevisible : true,
//						cvisible : false,
//						submitvisible : true,
//						gvisible : false,
//						grmvisible : false,
//						editable : true,
//						uenable : true,
//						vaeditable : false,
//						vabeditable:false,
//						empvisible : false
//					};
//				VisaPlanThis.getView().byId("comments").setEditable(true);
//			}
//			else if (global.ZZ_NACTION_BY == "")// close
//				{
//					properties = {
//						savevisible : false,
//						submitvisible : false,
//						cvisible : false,
//						gvisible : false,
//						grmvisible : false,
//						editable : false,
//						uenable : false,
//						vaeditable : false,
//						empvisible : true,
//						vabeditable:false
//					};
//					VisaPlanThis.getView().byId("comments").setEditable(false);
//				}
//			else{
//				properties = {
//						savevisible : false,
//						submitvisible : false,
//						cvisible : false,
//						gvisible : false,
//						grmvisible : false,
//						editable : false,
//						uenable : false,
//						vaeditable : false,
//						empvisible : false,
//						vabeditable:false
//					};
//				VisaPlanThis.getView().byId("comments").setEditable(false);
//			}
			
			if (global.whichTab == "MT") {
				properties = {
					savevisible : true,
					cvisible : false,
					submitvisible : true,
					gvisible : false,
					grmvisible : false,
					editable : true,
					uenable : true,
					vaeditable : false,
					vabeditable:false,
					empvisible : false
				};
				// DURGA CODE STARTS HERE
				if (global.ZZ_NACTION_BY == "")// close
				{
					properties = {
						savevisible : false,
						submitvisible : false,
						cvisible : false,
						gvisible : false,
						grmvisible : false,
						editable : false,
						uenable : false,
						vaeditable : false,
						empvisible : true,
						vabeditable:false
					};
				}
				// DURGA CODE ENDS HERE
			} else {
				properties = {
					savevisible : false,
					submitvisible : false,
					cvisible : false,
					gvisible : false,
					grmvisible : false,
					editable : false,
					uenable : false,
					vaeditable : false,
					empvisible : false,
					vabeditable:false
				};
				// DURGA CODE STARTS HERE
				if (global.ZZ_NACTION_BY == "")// close
				{
					properties = {
						savevisible : false,
						submitvisible : false,
						cvisible : false,
						gvisible : false,
						grmvisible : false,
						editable : false,
						uenable : false,
						vaeditable : false,
						empvisible : true,
						vabeditable:false
					};
				}
				// DURGA CODE ENDS HERE
			}
			
		} else if (role == "GRM") {
			if (global.whichTab == "MT") {
				properties = {
					savevisible : false,
					submitvisible : false,
					cvisible : false,
					gvisible : true,
					grmvisible : true,
					vaeditable : false,
					uenable : false,
					editable : false,
					empvisible : false,
					vabeditable:false
				// Visa Admin panel disabled_durga
				};
			} else {
				properties = {
					savevisible : false,
					submitvisible : false,
					cvisible : false,
					gvisible : false,
					grmvisible : false,
					uenable : false,
					editable : false,
					vaeditable : false,
					empvisible : false,
					vabeditable:false
				// Panel
				};
			}
			VisaPlanThis.getView().byId("comments").setEditable(true);
			VisaPlanThis.getView().byId("visaadmin").setVisible(false);
		} else if (role == "VISA") {
			if (global.ZZ_NACTION_BY == "")// close
			{
				properties = {
					savevisible : false,
					submitvisible : false,
					cvisible : true,
					gvisible : false,
					grmvisible : false,
					editable : false,
					uenable : false,
					vaeditable : false,
					empvisible : true,
					vabeditable:false
				};
			} else {
				properties = {
					savevisible : false,
					submitvisible : true,
					cvisible : true,
					gvisible : true,
					grmvisible : false,
					editable : false,
					uenable : true,
					vaeditable : true,
					empvisible : true
				};
				var data = sap.ui.getCore().getModel("global").getData();
				if(data.ZZ_TKT == "X"&&data.ZZ_INS=="X"&&data.ZZ_ACC=="X"){
					properties.vabeditable = false;
				}
				else{
					properties.vabeditable = true;
				}
			}
			VisaPlanThis.getView().byId("visaadmin").setVisible(true);
		}
		model.setData(properties);
		VisaPlanThis.getView().setModel(model, "properties");
		// Fund check
		var fundF02 = false;
		var fundF03 = false;
		VisaPlanThis.getView().byId("flexBoxFundF02").setVisible(false);
		VisaPlanThis.getView().byId("flexBoxFundF03").setVisible(false);
		if (global.ZZ_VISA_REQ != "") {
			for ( var i = 0; i < global.BVISA_HDR_TO_COST_ASGN.results.length; i++) {
				if (global.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == "F02") {
					fundF02 = true;
					global.ZZ_VKM = global.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_VKM;
				} else if (global.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == "F03") {
					fundF03 = true;
					// global.ZZ_VKM = global.BVISA_HDR_TO_COST_ASGN[i].ZZ_VKM;
					global.ZZ_CCNAME = global.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCNAME;
					global.ZZ_CCDEPT = global.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCDEPT;
					global.ZZ_EANO = global.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_EANO;
					global.ZZ_CCOST = global.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCOST;
					global.ZZ_PONO = global.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PONO;
					global.ZZ_CLENTY = global.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CLENTY;
				}
			}
			if (fundF02) {
				VisaPlanThis.getView().byId("flexBoxFundF02").setVisible(true);
			} else {
				global.ZZ_VKM = '';
			}
			if (fundF03) {
				VisaPlanThis.getView().byId("flexBoxFundF03").setVisible(true);
			} else {
				global.ZZ_CCNAME = '';
				global.ZZ_CCDEPT = '';
				global.ZZ_EANO = '';
				global.ZZ_CCOST = '';
				global.ZZ_PONO = '';
				global.ZZ_CLENTY = '';
			}
		} else {
			global.ZZ_VKM = '';
			global.ZZ_CCNAME = '';
			global.ZZ_CCDEPT = '';
			global.ZZ_EANO = '';
			global.ZZ_CCOST = '';
			global.ZZ_PONO = '';
			global.ZZ_CLENTY = '';
		}
		sap.ui.getCore().getModel("global").setData(global);
	},
	clearData : function() {
		if (VisaPlanThis.getView().getModel("global1"))
			VisaPlanThis.getView().getModel("global1").setData(null);
	},
	AdminAction : function(evt) {
		var visadialog = sap.ui.getCore().byId("visadialog");
		sap.ui.getCore().byId("visafromdate").setValue("");
		sap.ui.getCore().byId("visatodate").setValue("");
		visadialog.open();
	},
	// onVisaDateChange:function(evt){
	// var id=evt.oSource.getId();
	// var date = new Date();
	// // changing the Date to yyyyMMdd
	// var yyyy = date.getFullYear().toString();
	// var mm = (date.getMonth() + 1).toString();
	// mm = ("0" + mm).slice(-2);
	// var dd = date.getDate().toString();
	// var date = yyyymmdd;
	// var visafromdate = sap.ui.getCore().byId("visafromdate").getValue();
	// var visatodate = sap.ui.getCore().byId("visatodate").getValue();
	// if(id=="visafromdate"){
	// if(visafromdate < date){
	// sap.m.MessageToast.show("Date should be above today's date");
	// }
	// }
	// else if(id=="visatodate"){
	// sap.m.MessageToast.show("Date should be below today's date");
	// }
	// },
	onDialogConfirm : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, VisaPlanThis);
		var visafromdate = sap.ui.getCore().byId("visafromdate").getValue();
		var visatodate = sap.ui.getCore().byId("visatodate").getValue();
//		var message = VisaPlanThis.onVisaDateChange(visafromdate, visatodate);
		var message = false;
		if (message) {
			sap.m.MessageToast.show(message);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
		} else {
			var data = VisaPlanThis.getView().getModel().getData();
			var tkt = "";
			var acc = "";
			var ins = "";
			if (data.ZZ_TKT) {
				tkt = "X";
			}
			if (data.ZZ_INS) {
				ins = "X";
			}
			if (data.ZZ_ACC) {
				acc = "X";
			}
			VisaPlanThis.sendDialog(tkt, ins, acc);
		}
	},
	sendDialog : function(tkt, ins, acc) {
		var data = sap.ui.getCore().getModel("global").getData();
		var visadialog = sap.ui.getCore().byId("visadialog");
		var startdate = sap.ui.getCore().byId("visafromdate").getValue();
		var enddate = sap.ui.getCore().byId("visatodate").getValue();
		var oDataModel1 = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		var odata;
		odata = {
			ZZ_PERNR : data.ZZ_PERNR,
			ZZ_VISA_REQ : data.ZZ_VISA_REQ,
			ZZ_VERSION : data.ZZ_VERSION,
			ZZ_BEGDA : startdate,
			ZZ_ENDDA : enddate,
			ZZ_TKT : tkt,
			ZZ_ACC : acc,
			ZZ_INS : ins
		};
		oDataModel1.callFunction("VisaAdminSend", "GET", odata, null, function(oData, response) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			sap.m.MessageToast.show("Updated Successfully", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			visadialog.close();
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			visadialog.close();
			sap.m.MessageToast.show("Error");
		}, true);
	},
	onDialogCancel : function(evt) {
		var visadialog = sap.ui.getCore().byId("visadialog");
		visadialog.close();
	},
	onChange : function(evt) {
		var oUploadCollection = evt.getSource();
		var url;
		// var file = evt.mParameters.mParameters.files[0];
		var file = evt.getParameter("files")[0];
		var sUrl = sServiceUrl + "DmsDocsSet";

		var blob = new Blob([ file ]);
		url = URL.createObjectURL(blob);
		// alert(url);
		var sUrl = sServiceUrl + "DmsDocsSet";
		var oItem = {
			Country : "",
			DepReq : "",
			DocType : "",
			EmpNo : "",
			FileContent : "",
			FileMimeType : "",
			FileName : file.name,
			FileUrl : url,
			Index : "",
			Module : "",
		};
		filesAll.push(oItem);
		uploadFile.push({
			File : file
		});
		// evt.oSource.setUploadUrl(url);
		if (window.navigator.msSaveOrOpenBlob) {
			evt.oSource.setUploadUrl(url);
		}
	},
	onFileDeleted : function(evt) {
		var index1;
		var item = evt.getParameter("item");
		var items = VisaPlanThis.getView().byId("UploadCollection").getItems();
		var index = evt.oSource.indexOfItem(item);
		var filedata = VisaPlanThis.getView().byId("UploadCollection").getModel().getData();
		filedata.splice(index, 1);
		var newItems = items.length - uploadFile.length;
		if (newItems != 0) {
			index1 = index - newItems;
		} else {
			index1 = index;
		}
		uploadFile.splice(index1, 1);
		evt.oSource.getModel().setData(filedata);
		var items = VisaPlanThis.getView().byId("UploadCollection").getItems();
		VisaPlanThis.setVisibleDelete(items);
	},
	onUploadComplete : function(evt) {
		evt.oSource.getModel().setData(filesAll);
		// evt.oSource.getModel().refresh(true);
		var items = VisaPlanThis.getView().byId("UploadCollection").getItems();
		VisaPlanThis.setVisibleDelete(items);
	},
	setVisibleDelete : function(items) {
		var newItems = items.length - uploadFile.length;
		for ( var i = newItems; i < items.length; i++) {
			items[i].setVisibleDelete(true);
		}
	},
	onItemPress : function(evt) {
		var itemSelected = evt.getParameter("listItem");
		// var items = evt.oSource.getBinding("items");
		var items = evt.oSource.getBinding("items").oList;
		var listIndex = evt.oSource.indexOfItem(itemSelected);
		var index = evt.oSource.getBinding("items").aIndices[listIndex];
		var aData = items[index];
		var lv_url = sServiceUrl + "ZE2E_BVISA_HDRSet(ZZ_PERNR='" + aData.ZZ_PERNR + "',ZZ_VERSION='" + aData.ZZ_VERSION + "'," + "ZZ_VISA_REQ='" + aData.ZZ_VISA_REQ + "')?$expand=BVISA_HDR_TO_COST_ASGN";
		/*
		 * var lv_url = sServiceUrl +
		 * "ZE2E_BVISA_HDRSet(ZZ_PERNR='"+aData.ZZ_DEP_PERNR+"',ZZ_VERSION='"+aData.ZZ_VERSION+"'," +
		 * "ZZ_VISA_REQ='"+oData.ZZ_DEP_REQ
		 * +"')?$expand=BVISA_HDR_TO_COST_ASGN";
		 */
		jQuery.ajax({
			url : lv_url,
			method : 'GET',
			dataType : 'json',
			success : function(data, statusText, xhr) {
				var globalData = sap.ui.getCore().getModel("global").getData();
				var empDetail = VisaPlanThis.getEmployeeDetails(data.d.ZZ_PERNR);
				globalData.BVISA_HDR_TO_COST_ASGN = data.d.BVISA_HDR_TO_COST_ASGN;
				globalData.ZZ_OFF_NUM = data.d.ZZ_OFF_NUM;
				globalData.ZZ_PERNR = data.d.ZZ_PERNR;
				globalData.ZZ_VERSION = data.d.ZZ_VERSION;
				globalData.ZZ_VISA_EDATE = data.d.ZZ_VISA_EDATE;
				globalData.ZZ_VISA_NO = data.d.ZZ_VISA_NO;
				globalData.ZZ_VISA_PEDATE = data.d.ZZ_VISA_PEDATE;
				globalData.ZZ_VISA_PSDATE = data.d.ZZ_VISA_PSDATE;
				globalData.ZZ_VISA_REQ = data.d.ZZ_VISA_REQ;
				globalData.ZZ_VISA_SDATE = data.d.ZZ_VISA_SDATE;
				globalData.ZZ_VISA_TOCNTRY = data.d.ZZ_VISA_TOCNTRY;
				globalData.ZZ_VISA_TYP = data.d.ZZ_VISA_TYP;
				globalData.ZZ_MOBILE = data.d.ZZ_MOBILE;
				if (empDetail) {
					globalData.ZZ_DEP_PERNR = empDetail.ZZ_DEP_PERNR;
					globalData.ZZ_DEP_NAME = empDetail.ZZ_DEP_NAME;
					globalData.ZZ_DEP_EMAIL = empDetail.ZZ_DEP_EMAIL;
					globalData.ZZ_DEP_DOB = empDetail.ZZ_DEP_DOB;
					globalData.ZZ_DEP_DEPT = empDetail.ZZ_DEP_DEPT;
				} else {
					globalData.ZZ_DEP_NAME = '';
					globalData.ZZ_DEP_EMAIL = '';
					globalData.ZZ_DEP_DOB = '';
					globalData.ZZ_DEP_DEPT = '';
				}
				globalData.ZZ_TKT = data.d.ZZ_TKT;
				globalData.ZZ_ACC = data.d.ZZ_ACC;
				globalData.ZZ_INS = data.d.ZZ_INS;
				/* Next action added to identify close */
				globalData.ZZ_NACTION_BY = aData.ZZ_NACTION_BY;
				/* Next action added to identify close */
				sap.ui.getCore().getModel("global").setData(globalData);
				sap.ui.core.routing.Router.getRouter("MyRouter").navTo("VisaRequest");
			},
		});
	},
	getEmployeeDetails : function(ntid) {
		var result;
		oDataModel.read("DEP_EMPSet('" + ntid + "')", null, null, false, function(oData, response) {
			result = oData;
		}, function(error) {
		});
		return result;
	},
	onMenu : function(evt) {
		menuRef = sap.ui.project.e2etm.util.StaticUtility.customMenuOpen(VisaPlanThis, evt);
	},
	onMenuItemSelect : function(evt) {
		var aFilters = [];
		var aSorters = [];
		var menu = VisaPlanThis.getView().byId("menu_settings");
		var table = VisaPlanThis.getView().byId("iconTabVisaAdmin").getContent()[0];
		var sPath = VisaPlanThis.findProperty();
		var oBinding = table.getBinding("items");
		sap.ui.project.e2etm.util.StaticUtility.customMenuItemSelect(VisaPlanThis, evt, menuRef, sPath, oBinding);
	},
	findProperty : function() {
		var sPath;
		switch (menuRef.getText()) {
		case "Travel Req":
			sPath = "ZZ_VISA_REQ";
			break;
		case "Employee No":
			sPath = "ZZ_PERNR";
			break;
		case "VISA Type":
			sPath = "ZZ_VISA_TYP";
			break;
		case "To Country":
			sPath = "ZZ_VISA_TOCNTRY";
			break;
		case "Start Date":
			sPath = "ZZ_VISA_PSDATE";
			break;
		case "End Date":
			sPath = "ZZ_VISA_PEDATE";
			break;
		}
		return sPath;
	},
	onValueHelpRequest : function(evt) {
		var oControl = evt.oSource;
		var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
			supportMultiselect : false,
			cancel : function(oControlEvent) {
				oValueHelpDialog.close();
			},
			change : function() {
				alert("changeDialog");
			},
			afterClose : function() {
				oValueHelpDialog.destroy();
			},
			ok : function(oControlEvent) {
				var sKey = oControlEvent.getParameter("tokens")[0].getProperty("key");
				oControl.setValue(sKey);
				oValueHelpDialog.close();
				if (oControl.getId().indexOf("costCenterId") != -1) {
					VisaPlanThis.showCostCenterMessage(sKey);
				}
				if (oControl.getId().indexOf("budgetCenterId") != -1) {
					VisaPlanThis.showBudgetCenterMessage(sKey);
				}
				if (oControl.getId().indexOf("customerId") != -1) {
					VisaPlanThis.getView().getModel().getData().ZZ_CCNAME = sKey;
				}
				if (oControl.getId().indexOf("budgetCodeId") != -1) {
					var oData = VisaPlanThis.getView().getModel().getData();
					var iIndex = oControl.getId().substring(oControl.getId().indexOf("row") + 3, oControl.getId().length);
					oData.BVISA_HDR_TO_COST_ASGN.results[iIndex].ZZ_FIPEX_ERROR = 'None';
					VisaPlanThis.getView().getModel().setData(oData);
				}
				if (oControl.getId().indexOf("fundId") != -1) { // To
					// set
					// VKM
					// and
					// Customer
					// at
					// actuals
					// field
					// visible
					var oData = VisaPlanThis.getView().getModel().getData();
					VisaPlanThis.checkfund(oData);
				}
			},
		});
		var oRowsModel = new sap.ui.model.json.JSONModel();
		oValueHelpDialog.setModel(oRowsModel);
		oValueHelpDialog.theTable.bindRows("/");
		// sidd code start
		if (oControl.getId().indexOf("vkmId") != -1) { // vkm
			VisaPlanThis.setVKMF4(oRowsModel, oValueHelpDialog);
		}
		if (oControl.getId().indexOf("customerId") != -1) { // Customer
			// search
			// help
			VisaPlanThis.setCustomerF4(oRowsModel, oValueHelpDialog);
			oValueHelpDialog.open();
		} else if (oControl.getId().indexOf("FromLocationId") != -1) {
			VisaPlanThis.setLocationF4(oRowsModel, oValueHelpDialog, VisaPlanThis.getView().getModel().getData().ZZ_FMCNTRY);
		} else if (oControl.getId().indexOf("ToLocationId") != -1) {
			VisaPlanThis.setLocationF4(oRowsModel, oValueHelpDialog, VisaPlanThis.getView().getModel().getData().ZZ_LAND1);
		} else { // Table columns search help
			var sControlId = oControl.getId().substr(oControl.getId().length - 9, 4);
			if (sControlId == "col5") {
				var iIndex = oControl.getId().substring(oControl.getId().indexOf("row") + 3, oControl.getId().length);
				if (VisaPlanThis.getView().getModel().getData().BVISA_HDR_TO_COST_ASGN.results[iIndex].ZZ_GEBER == undefined || VisaPlanThis.getView().getModel().getData().BVISA_HDR_TO_COST_ASGN.results[iIndex].ZZ_GEBER.trim() == "") {
					sap.m.MessageToast.show("Please enter Fund value");
				} else {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(true, VisaPlanThis);
					var get = $.ajax({
						cache : false,
						// url : sServiceUrl + "Commit_item_f4?" + "GEBER='" +
						// VisaPlanThis.getView().getModel().getData().BVISA_HDR_TO_COST_ASGN.results[iIndex].ZZ_GEBER
						// + "'&ZZ_SMODID='" +
						// VisaPlanThis.getView().getModel().getData().ZZ_SMODID
						// + "'&$format=json",
						url : sServiceUrl + "Commit_item_f4?" + "GEBER='" + VisaPlanThis.getView().getModel().getData().BVISA_HDR_TO_COST_ASGN.results[iIndex].ZZ_GEBER + "'&ZZ_SMODID='INTL'&$format=json",
						type : "GET"
					});
					get.fail(function(err) {
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
					});
					get.done(function(result, response, header) {
						VisaPlanThis.getView().getModel().getData().budgetCost = result.d.results;
						if (VisaPlanThis.getView().getModel().getData().budgetCost.length == 0) {
							sap.m.MessageToast.show("Invalid Fund");
						} else {
							VisaPlanThis.setColumnF4Table(sControlId, oRowsModel, oValueHelpDialog);
							oValueHelpDialog.open();
						}
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
					});
				}
			} else {
				VisaPlanThis.setColumnF4Table(sControlId, oRowsModel, oValueHelpDialog);
				oValueHelpDialog.open();
			}
		}
	},
	// Set columns for search help
	setColumnF4Table : function(sControlId, oRowsModel, oValueHelpDialog) {
		switch (sControlId) {
		case 'col1': // Fund
			oValueHelpDialog.setTitle("FUND");
			oValueHelpDialog.setKey("fincode");
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "FUND"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "fikrs"),
				sortProperty : "fikrs",
				filterProperty : "fikrs"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "NAME"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "fincode"),
				sortProperty : "fincode",
				filterProperty : "fincode"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "DESCRIPTION"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "beschr"),
				sortProperty : "beschr",
				filterProperty : "beschr"
			}));
			var fund = VisaPlanThis.getView().getModel().getData().fund;
			oRowsModel.setData(VisaPlanThis.getView().getModel().getData().fund);
			break;
		case 'col2': // Budget Center
			oValueHelpDialog.setTitle("BUDGET CENTER");
			oValueHelpDialog.setKey("fictr");
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "FMA"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "fikrs"),
				sortProperty : "fikrs",
				filterProperty : "fikrs"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "BUDGET CENTER"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "fictr"),
				sortProperty : "fictr",
				filterProperty : "fictr"
			}));
			oRowsModel.setData(VisaPlanThis.getView().getModel().getData().budgetCenter);
			break;
		case 'col3': // WBS Element
			oValueHelpDialog.setTitle("WBS ELEMENT");
			oValueHelpDialog.setKey("ZZ_POSKI");
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "WBS ELEMENT"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "ZZ_POSKI"),
				sortProperty : "ZZ_POSKI",
				filterProperty : "ZZ_POSKI"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "DESCRIPTION"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "ZZ_POST1"),
				sortProperty : "ZZ_POST1",
				filterProperty : "ZZ_POST1"
			}));
			oRowsModel.setData(VisaPlanThis.getView().getModel().getData().wbsElement);
			break;
		case 'col4': // Cost center
			oValueHelpDialog.setTitle("COST CENTER");
			oValueHelpDialog.setKey("KOSTL");
			oRowsModel.setData(VisaPlanThis.getView().getModel().getData().costCenter);
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "COST CENTER"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "KOSTL"),
				sortProperty : "KOSTL",
				filterProperty : "KOSTL"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "CONTROLLING AREA"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "KOKRS"),
				sortProperty : "KOKRS",
				filterProperty : "KOKRS"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "NAME"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "VERAK"),
				sortProperty : "VERAK",
				filterProperty : "VERAK"
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "DESCRIPTION"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "KTEXT"),
				sortProperty : "KTEXT",
				filterProperty : "KTEXT"
			}));
			break;
		case 'col5': // Budget cost
			oValueHelpDialog.setTitle("BUDGET CODE");
			oValueHelpDialog.setKey("FIPEX");
			oRowsModel.setData(VisaPlanThis.getView().getModel().getData().budgetCost);
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "BUDGET CODE"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "FIPEX"),
				sortProperty : "FIPEX",
				filterProperty : "FIPEX",
				width : "20%",
			}));
			oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
				label : new sap.ui.commons.Label({
					text : "DESCRIPTION"
				}),
				template : new sap.ui.commons.TextView().bindProperty("text", "ZZ_BUD_DESC"),
				sortProperty : "ZZ_BUD_DESC",
				filterProperty : "ZZ_BUD_DESC",
				width : "60%",
			}));
			break;
		}
	},
	VisaDateChange : function(oControlEvent) {
		if (oControlEvent.getParameters().id.indexOf("visaStartDate") != -1) {
			VisaPlanThis.getView().getModel().getData().ZZ_VISA_PSDATE = oControlEvent.getParameters().newValue;
		}
		if (oControlEvent.getParameters().id.indexOf("visaEndDate") != -1) {
			VisaPlanThis.getView().getModel().getData().ZZ_VISA_PEDATE = oControlEvent.getParameters().newValue;
		}
	},
	saveValidations : function() {
		var country = VisaPlanThis.getView().byId("VisaCountry").getProperty("selectedKey");
		if (country == null || country == "") {
			return VisaPlanThis.getView().getModel("i18n").getProperty("visa_country_error");
		}
		var visastartdate = VisaPlanThis.getView().byId("visaStartDate").getValue();
		if (visastartdate == null || visastartdate == "") {
			return "Please enter Visa Start Date";
		}
		var visaenddate = VisaPlanThis.getView().byId("visaEndDate").getValue();
		if (visaenddate == null || visaenddate == "") {
			return "Please enter Visa End Date";
		}
		return VisaPlanThis.onVisaDateChange(visastartdate, visaenddate);
	},

	convertToDate : function(year, month, date) {
		var date1 = new Date(year, month - 1, date);
		return date1;
	},
	onVisaDateChange : function(fromdate, todate) {
		var date = new Date();
		var syear = fromdate.substring(0, 4);
		var smonth = fromdate.substring(4, 6);
		var sdate = fromdate.substring(6, 8);
		var astartdate = VisaPlanThis.convertToDate(syear, smonth, sdate);
		var eyear = todate.substring(0, 4);
		var emonth = todate.substring(4, 6);
		var edate = todate.substring(6, 8);
		var aenddate = VisaPlanThis.convertToDate(eyear, emonth, edate);
		if (astartdate < date) {
			return "Visa From Date should be greater than  today's Date";
		}
		 else {
			if (astartdate > aenddate) {
				return "Visa End Date should be greater than or equal to Visa Start Date";
			}
		}
//		var date = new Date();
//		// changing the Date to yyyyMMdd
//		var yyyy = date.getFullYear().toString();
//		var mm = (date.getMonth() + 1).toString();
//		mm = ("0" + mm).slice(-2);
//		var dd = date.getDate().toString();
//		var date = yyyy + mm + dd;
//		if (fromdate < date) {
//			return "Visa From Date should be greater than or equal to today's Date";
//		}
//		 else {
//			if (fromdate > todate) {
//				return "Visa End Date should be greater than or equal to Visa Start Date";
//			}
//		}
		return false;
	},
	onCountryChange : function(oEvent) {
		// VisaPlanThis.getView().getModel().getData().ZZ_VISA_TOCNTRY
		// = oEvent.oSource.getSelectedItem().getText();
		// VisaPlanThis.getView().getModel().getData().ZZ_VISA_TOCNTRY
		// = oEvent.oSource.getSelectedItem().getText();
	},
	checkCostAssignment : function(oData) {
		var iPercent = 0;
		if (oData.BVISA_HDR_TO_COST_ASGN.results.length == 0) {
			return "Please enter cost assigment";
		}
		var country = VisaPlanThis.getView().byId("VisaCountry").getProperty("selectedKey");
		if (country == null || country == "") {
			return VisaPlanThis.getView().getModel("i18n").getProperty("visa_country_error");
		} else {
			oData.ZZ_VISA_TOCNTRY = country;
		}
		for ( var i = 0; i < oData.BVISA_HDR_TO_COST_ASGN.results.length; i++) {
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT == null || oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT == "" || oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT == "0") {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT_ERROR = 'Error';
				return VisaPlanThis.getView().getModel("i18n").getProperty("enter_required_field");
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT_ERROR = 'None';
			}
			iPercent += parseFloat(oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT);
			if (isNaN(iPercent)) {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT_ERROR = 'Error';
				return VisaPlanThis.getView().getModel("i18n").getProperty("Invalid Number");
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT_ERROR = 'None';
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == null || oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == "") {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER_ERROR = 'Error';
				return VisaPlanThis.getView().getModel("i18n").getProperty("enter_required_field");
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER_ERROR = 'None';
			}
			if (oData.ZZ_TRV_TYP == "SECO" && oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER != "F03") {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER_ERROR = 'Error';
				return "Please enter F03 for Secondary request";
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER_ERROR = 'None';
			}
			if (oData.fund && !sap.ui.project.e2etm.util.StaticUtility.checkExistingArray(oData.fund, "fincode", oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER)) {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER_ERROR = 'Error';
				return VisaPlanThis.getView().getModel("i18n").getProperty("Invalid Fund");
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER_ERROR = 'None';
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FISTL == null || oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FISTL == "") {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FISTL_ERROR = 'Error';
				return VisaPlanThis.getView().getModel("i18n").getProperty("enter_required_field");
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FISTL_ERROR = 'None';
			}
			if (oData.budgetCenter && !sap.ui.project.e2etm.util.StaticUtility.checkExistingArray(oData.budgetCenter, "fictr", oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FISTL)) {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FISTL_ERROR = 'Error';
				return VisaPlanThis.getView().getModel("i18n").getProperty("Invalid Budget Center");
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FISTL_ERROR = 'None';
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPEX_ERROR == 'Error') {
				return VisaPlanThis.getView().getModel("i18n").getProperty("Invalid Budget Code");
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPEX == null || oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPEX == "") {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPEX_ERROR = 'Error';
				return VisaPlanThis.getView().getModel("i18n").getProperty("enter_required_field");
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPEX_ERROR = 'None';
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS == undefined) {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS = "";
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL == undefined) {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL = "";
			}
			if (oData.wbsElement && !sap.ui.project.e2etm.util.StaticUtility.checkExistingArray(oData.wbsElement, "ZZ_POSKI", oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS) && oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS != "") {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS_ERROR = 'Error';
				return VisaPlanThis.getView().getModel("i18n").getProperty("Invalid WBS Element");
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS_ERROR = 'None';
			}
			if (oData.costCenter && !sap.ui.project.e2etm.util.StaticUtility.checkExistingArray(oData.costCenter, "KOSTL", oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL) && oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL != "") {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL_ERROR = 'Error';
				return VisaPlanThis.getView().getModel("i18n").getProperty("Invalid Cost Center");
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL_ERROR = 'None';
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL == "" && oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == "F01") {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL_ERROR = 'Error';
				return VisaPlanThis.getView().getModel("i18n").getProperty("Cost center is required for F01 Fund");
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL_ERROR = 'None';
			}
			// fund validation sidd code start
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == "F02") {
				if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS == "") {
					oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "Error";
					return "Please enter WBS Element for F02 Fund";
				} else {
					oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "None";
				}
				if (oData.ZZ_VKM == null || oData.ZZ_VKM == "") {
					VisaPlanThis.getView().byId("flexBoxFundF02").setVisible(true);
					oData.ZZ_VKM_ERROR = 'Error';
					return VisaPlanThis.getView().getModel("i18n").getProperty("Please Enter VKM Details");
				} else if (oData.vkm && !sap.ui.project.e2etm.util.StaticUtility.checkExistingArray(oData.vkm, "VKMCode", oData.ZZ_VKM)) {
					VisaPlanThis.getView().byId("flexBoxFundF02").setVisible(true);
					oData.ZZ_VKM_ERROR = 'Error';
					return VisaPlanThis.getView().getModel("i18n").getProperty("Invalid VKM");
				} else {
					oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_VKM_ERROR = 'None';
					oData.ZZ_VKM_ERROR = 'None';
					oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_VKM = oData.ZZ_VKM;
				}
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == "F03") {
				if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS == "") {
					oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "Error";
					return "Please enter WBS Element for F03 Fund";
				} else {
					oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS_ERROR = "None";
				}
				if (oData.ZZ_CCDEPT == undefined || oData.ZZ_CCDEPT == "") {
					VisaPlanThis.getView().byId("flexBoxFundF03").setVisible(true);
					oData.ZZ_CCDEPT_ERROR = 'Error';
					return VisaPlanThis.getView().getModel("i18n").getProperty("Please enter Customer Coordinator Department");
				} else {
					oData.ZZ_CCDEPT_ERROR = 'None';
				}
				if (oData.ZZ_CLENTY == undefined || oData.ZZ_CLENTY == "") {
					VisaPlanThis.getView().byId("flexBoxFundF03").setVisible(true);
					oData.ZZ_CLENTY_ERROR = 'Error';
					return VisaPlanThis.getView().getModel("i18n").getProperty("Please enter Customer Legal Entity");
				} else {
					oData.ZZ_CLENTY_ERROR = 'None';
				}
				VisaPlanThis.getView().getModel().getData().BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCNAME = oData.ZZ_CCNAME;
				VisaPlanThis.getView().getModel().getData().BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCDEPT = oData.ZZ_CCDEPT;
				VisaPlanThis.getView().getModel().getData().BVISA_HDR_TO_COST_ASGN.results[i].ZZ_EANO = oData.ZZ_EANO;
				VisaPlanThis.getView().getModel().getData().BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCOST = oData.ZZ_CCOST;
				VisaPlanThis.getView().getModel().getData().BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PONO = oData.ZZ_PONO;
				VisaPlanThis.getView().getModel().getData().BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CLENTY = oData.ZZ_CLENTY;
			}
			if ((oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS == "" && oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL == "") || (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS != "" && oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL != "")) {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS_ERROR = 'Error';
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL_ERROR = 'Error';
				return "Please enter either WBS Element or Cost Center";
			} else {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS_ERROR = 'None';
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL_ERROR = 'None';
			}
		}
		// sidd code ends
		if (iPercent != 100) {
			oData.BVISA_HDR_TO_COST_ASGN.results[0].ZZ_PERCENT_ERROR = 'Error';
			return "Total percent must be 100";
		} else {
			oData.BVISA_HDR_TO_COST_ASGN.results[0].ZZ_PERCENT_ERROR = 'None';
		}
		var visastartdate = VisaPlanThis.getView().byId("visaStartDate").getValue();
		var visaenddate = VisaPlanThis.getView().byId("visaEndDate").getValue();
		return VisaPlanThis.onVisaDateChange(visastartdate, visaenddate);
		// return "";
	},
	onCostAssignmentAddPress : function(evt) {
		var oData = VisaPlanThis.getView().getModel().getData();
		var oDataItem = {
		// ZZ_PERCENT : 100
		};
		if (oData.ZZ_TRV_TYP == "SECO") {
			oDataItem.ZZ_GEBER = "F03";
			VisaPlanThis.getView().byId("flexBoxFundF03").setVisible(true);
		}
		oData.BVISA_HDR_TO_COST_ASGN.results.push(oDataItem);
		oData.view.costLength++;
		VisaPlanThis.getView().getModel().setData(oData);
	},
	onCostAssignmentDeletePress : function(evt) {
		var iIndex = VisaPlanThis.getView().byId("tabCostAssignment").getSelectedIndex();
		if (iIndex != -1) {
			var oData = VisaPlanThis.getView().getModel().getData();
			if (oData.BVISA_HDR_TO_COST_ASGN.results[iIndex].ZZ_GEBER == "F02") {
				VisaPlanThis.getView().byId("flexBoxFundF02").setVisible(false);
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[iIndex].ZZ_GEBER == "F03") {
				VisaPlanThis.getView().byId("flexBoxFundF03").setVisible(false);
			}
			oData.BVISA_HDR_TO_COST_ASGN.results.splice(iIndex, 1);
			oData.view.costLength--;
			VisaPlanThis.getView().getModel().setData(oData);
		}
	},
	onChangeFund : function(oControlEvent) {
		VisaPlanThis.checkfund(VisaPlanThis.getView().getModel().getData());
	},
	checkfund : function(oData) {
		var fundF02, fundF03;
		fundF02 = false;
		fundF03 = false;
		for ( var i = 0; i < oData.BVISA_HDR_TO_COST_ASGN.results.length; i++) {
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == "F02") {
				fundF02 = true;
				oData.ZZ_VKM = oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_VKM;
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCDEPT = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCOST = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCNAME = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_EANO = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PONO = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CLENTY = "";
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == "F03") {
				fundF03 = true;
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_VKM = "";
				oData.ZZ_CCDEPT = oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCDEPT;
				oData.ZZ_CCOST = oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCOST;
				// oData.ZZ_CCNAME =
				// oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCNAME;
				oData.ZZ_EANO = oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_EANO;
				oData.ZZ_PONO = oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PONO;
				oData.ZZ_CLENTY = oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CLENTY;
			}
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER != "F02" && oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER != "F03") {
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_VKM = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCDEPT = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCOST = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CCNAME = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_EANO = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PONO = "";
				oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_CLENTY = "";
			}
		}
		VisaPlanThis.getView().byId("flexBoxFundF02").setVisible(fundF02);
		VisaPlanThis.getView().byId("flexBoxFundF03").setVisible(fundF03);
	},
	onVisaPlanSave : function(evt) { // We Business Visa Plan
		// is Save
		
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, VisaPlanThis);
		
		var sError;
		sError = VisaPlanThis.saveValidations();
		if (sError) {
			VisaPlanThis.displayErrorMessage(sError);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
		} else {
			var role = VisaPlanThis.findRole(sap.ui.getCore().getModel("profile").getData().currentRole);
			VisaPlanThis.saveVisaDetails(VisaPlanThis.getView().getModel().getData(), 0, VisaPlanThis.getView().getModel().getData().ZZ_VISA_REQ, role, "00", evt.oSource);
		}
		
		
	},
	onVisaPlanSubmitPress : function(evt) { // We Business Visa
		// Plan is Submited
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, VisaPlanThis);
		var role1 = sap.ui.getCore().getModel("profile").getData().currentRole;
		var sError, sError1;
		if (role1 == "EMP") {
			sError = VisaPlanThis.checkCostAssignment(VisaPlanThis.getView().getModel().getData());
		}
		if (role1 == "VISA") {
			sError1 = VisaPlanThis.checkVisaAdmin(VisaPlanThis.getView().getModel().getData());
		}
		if (sError1) {
			VisaPlanThis.displayErrorMessage(sError1);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			return;
		}
		if (sError) {
			VisaPlanThis.displayErrorMessage(sError);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			return;
		}
		var role = VisaPlanThis.findRole(sap.ui.getCore().getModel("profile").getData().currentRole);
		VisaPlanThis.saveVisaDetails(VisaPlanThis.getView().getModel().getData(), 1, VisaPlanThis.getView().getModel().getData().ZZ_VISA_REQ, role, "01", evt.oSource);
	},
	checkVisaAdmin : function(data) {
//		if (data.ZZ_VISA_NO == "" || data.ZZ_VISA_NO == null) {
//			return "Please enter Visa Number";
//		}
		if (data.ZZ_VISA_SDATE == "" || data.ZZ_VISA_SDATE == null) {
			return "Please enter Visa Start Date";
		} else if (data.ZZ_VISA_EDATE == "" || data.ZZ_VISA_EDATE == null) {
			return "Please enter Visa End Date";
		}
	//	return VisaPlanThis.onVisaDateChange(data.ZZ_VISA_SDATE, data.ZZ_VISA_EDATE);
	},
	onVisaPlanApprove : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, VisaPlanThis);
		var role1 = sap.ui.getCore().getModel("profile").getData().currentRole;
		var sError;
		if (role1 == "EMP") {
			sError = VisaPlanThis.checkCostAssignment(VisaPlanThis.getView().getModel().getData());
		}
		if (sError) {
			VisaPlanThis.displayErrorMessage(sError);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
		} else {
			var role = VisaPlanThis.findRole(sap.ui.getCore().getModel("profile").getData().currentRole);
			VisaPlanThis.saveVisaDetails(VisaPlanThis.getView().getModel().getData(), VisaPlanThis.getView().getModel("global1").getData().ZZ_VERSION, VisaPlanThis.getView().getModel().getData().ZZ_VISA_REQ, role, "03", evt.oSource);
		}
	},
	findRole : function(role1) {
		var role;
		if (role1 == "EMP") {
			role = "01";
		} else if (role1 == "GRM") {
			role = "02";
		} else if (role1 == "VISA") {
			role = "03";
		}
		return role;
	},
	onVisaPlanReject : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, VisaPlanThis);
		var role1 = sap.ui.getCore().getModel("profile").getData().currentRole;
		var sError;
		if (role1 == "EMP") {
			// sError =
			// VisaPlanThis.checkCostAssignment(VisaPlanThis.getView().getModel().getData());
		}
		if (sError) {
			VisaPlanThis.displayErrorMessage(sError);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
		} else {
			var role = VisaPlanThis.findRole(sap.ui.getCore().getModel("profile").getData().currentRole);
			VisaPlanThis.saveVisaDetails(VisaPlanThis.getView().getModel().getData(), VisaPlanThis.getView().getModel("global1").getData().ZZ_VERSION, VisaPlanThis.getView().getModel().getData().ZZ_VISA_REQ, role, "08", evt.oSource);
		}
	},
	onVisaPlanSendBack : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, VisaPlanThis);
		var role1 = sap.ui.getCore().getModel("profile").getData().currentRole;
		var sError;
		if (role1 == "EMP") {
			// sError =
			// VisaPlanThis.checkCostAssignment(VisaPlanThis.getView().getModel().getData());
		}
		if (sError) {
			VisaPlanThis.displayErrorMessage(sError);
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
		} else {
			var role = VisaPlanThis.findRole(sap.ui.getCore().getModel("profile").getData().currentRole);
			VisaPlanThis.saveVisaDetails(VisaPlanThis.getView().getModel().getData(), VisaPlanThis.getView().getModel("global1").getData().ZZ_VERSION, VisaPlanThis.getView().getModel().getData().ZZ_VISA_REQ, role, "02", evt.oSource);
		}
	},
	showBudgetCenterMessage : function(sValue) {
		if (sValue.trim() != "") {
			var index = sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(VisaPlanThis.getView().getModel().getData().budgetCenter, "fictr", sValue);
			if (index == -1 || sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DEPT.indexOf( // Budget
			// center
			// not
			// belong to department
			VisaPlanThis.getView().getModel().getData().budgetCenter[index].fictr) == -1) {
				sap.ca.ui.message.showMessageBox({
					type : sap.ca.ui.message.Type.WARNING,
					message : "Budget center does not belong to your department"
				});
			}
		}
	},
	showCostCenterMessage : function(sValue) {
		if (sValue.trim() != "") {
			var index = sap.ui.project.e2etm.util.StaticUtility.getArrayIndex(VisaPlanThis.getView().getModel().getData().costCenter, "KOSTL", sValue);
			if (index == -1 || sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_DEPT.indexOf( // CC
			// not
			// belong
			// to
			// department
			VisaPlanThis.getView().getModel().getData().costCenter[index].VERAK) == -1) {
				sap.ca.ui.message.showMessageBox({
					type : sap.ca.ui.message.Type.WARNING,
					message : "Cost center does not belong to your department"
				});
			}
		}
	},
	onBackPress : function() {
		sap.ca.ui.dialog.confirmation.open({
			question : "Unsaved data will be lost.Are you sure you want to exit?",
			showNote : false,
			title : "Confirm",
			confirmButtonLabel : "Yes"
		}, function(oResult) {
			if (oResult.isConfirmed) {
				sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			}
		});
	},
	displayErrorMessage : function(sError) {
		sap.ca.ui.message.showMessageBox({
			type : sap.ca.ui.message.Type.ERROR,
			message : sError,
			details : sError
		});
	},
	setVKMF4 : function(oRowsModel, oValueHelpDialog) {
		oValueHelpDialog.setTitle("VKM");
		oValueHelpDialog.setKey("VKMCode");
		oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "VKM NAME"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "VKMName"),
			sortProperty : "VKMName",
			filterProperty : "VKMName"
		}));
		oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "VKM CODE"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "VKMCode"),
			sortProperty : "VKMCode",
			filterProperty : "VKMCode"
		}));
		oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "DEPARTMENT"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "Department"),
			sortProperty : "Department",
			filterProperty : "Department"
		}));
		oValueHelpDialog.theTable.addColumn(new sap.ui.table.Column({
			label : new sap.ui.commons.Label({
				text : "BUSINESS UNIT"
			}),
			template : new sap.ui.commons.TextView().bindProperty("text", "BusinessUnit"),
			sortProperty : "BusinessUnit",
			filterProperty : "BusinessUnit"
		}));
		oRowsModel.setData(VisaPlanThis.getView().getModel().getData().vkm);
	},
	saveVisaDetails : function(oData, i_version, i_VISA_REQ, role, action, source) {
		var results = {};
		var visaReq;
		var comments = VisaPlanThis.getView().byId("comments").getValue();
		if (sap.ui.getCore().getModel("global").getData().ZZ_VISA_REQ != "")
			var pernr = VisaPlanThis.getView().getModel("global1").getData().ZZ_PERNR;
		else
			var pernr = VisaPlanThis.getView().getModel().getData().ZZ_DEP_PERNR;
		if (sap.ui.getCore().getModel("profile").getData().currentRole != "VISA") {
			results = {
				ZZ_PERNR : pernr,
				ZZ_VERSION : i_version, // save 0 Submit Sent
				// from back end
				ZZ_VISA_REQ : i_VISA_REQ, // from back end
				ZZ_OFF_NUM : oData.ZZ_OFF_NUM,//
				ZZ_VISA_TOCNTRY : oData.ZZ_VISA_TOCNTRY, //
				ZZ_VISA_TYP : '',//
				ZZ_VISA_PSDATE : oData.ZZ_VISA_PSDATE,// from
				// date
				ZZ_VISA_PEDATE : oData.ZZ_VISA_PEDATE,// end
				// date
				ZZ_VISA_NO : '',// entered by visa admin
				ZZ_VISA_SDATE : '',// entered by visa admin
				ZZ_VISA_EDATE : '', // entered by visa admin
				ZZ_COMMENTS : comments,
				ZZ_MOBILE : oData.ZZ_MOBILE
			};
		} else {
			results = {
				ZZ_PERNR : pernr,
				ZZ_VERSION : i_version, // save 0 Submit Sent
				// from back end
				ZZ_VISA_REQ : i_VISA_REQ, // from back end
				ZZ_OFF_NUM : oData.ZZ_OFF_NUM,//
				ZZ_VISA_TOCNTRY : oData.ZZ_VISA_TOCNTRY, //
				ZZ_VISA_TYP : oData.ZZ_VISA_TYP,//
				ZZ_VISA_PSDATE : oData.ZZ_VISA_PSDATE,// from
				// date
				ZZ_VISA_PEDATE : oData.ZZ_VISA_PEDATE,// end
				// date
				ZZ_VISA_NO : oData.ZZ_VISA_NO,// entered by
				// visa admin
				ZZ_VISA_SDATE : oData.ZZ_VISA_SDATE,// entered
				// by
				// visa
				// admin
				ZZ_VISA_EDATE : oData.ZZ_VISA_EDATE, // entered
				// by
				// visa
				// admin
				ZZ_COMMENTS : comments,
				ZZ_MOBILE : oData.ZZ_MOBILE,
				ZZ_TKT : oData.ZZ_TKT ? "X" : "",
				ZZ_ACC : oData.ZZ_ACC ? "X" : "",
				ZZ_INS : oData.ZZ_INS ? "X" : "",
			};
		}
		results.BVISA_HDR_TO_COST_ASGN = [];
		for ( var i = 0; i < oData.BVISA_HDR_TO_COST_ASGN.results.length; i++) {
			if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == "F02") {
				results.BVISA_HDR_TO_COST_ASGN.push({
					ZZ_PERNR : pernr,
					ZZ_DEP_REQ : oData.ZZ_DEP_REQ,
					ZZ_REINR : '',
					ZZ_VERSION : '',
					ZZ_PERCENT : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT,
					ZZ_KOSTL : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL,
					ZZ_FISTL : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FISTL,
					ZZ_FIPOS : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS,
					ZZ_WAERS : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_WAERS,
					ZZ_FIPEX : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPEX,
					ZZ_POSNR : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_POSNR,
					ZZ_GEBER : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER,
					ZZ_VKM : oData.ZZ_VKM,
					ZZ_CCNAME : "",
					ZZ_CCDEPT : "",
					ZZ_EANO : "",
					ZZ_CCOST : "",
					ZZ_PONO : "",
					ZZ_CLENTY : "",
				});
			} else if (oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER == "F03") {
				results.BVISA_HDR_TO_COST_ASGN.push({
					ZZ_PERNR : pernr,
					ZZ_DEP_REQ : oData.ZZ_DEP_REQ,
					ZZ_REINR : '',
					ZZ_VERSION : '',
					ZZ_PERCENT : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT,
					ZZ_KOSTL : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL,
					ZZ_FISTL : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FISTL,
					ZZ_FIPOS : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS,
					ZZ_WAERS : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_WAERS,
					ZZ_FIPEX : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPEX,
					ZZ_POSNR : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_POSNR,
					ZZ_GEBER : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER,
					ZZ_VKM : "",
					ZZ_CCNAME : oData.ZZ_CCNAME,
					ZZ_CCDEPT : oData.ZZ_CCDEPT,
					ZZ_EANO : oData.ZZ_EANO,
					ZZ_CCOST : oData.ZZ_CCOST,
					ZZ_PONO : oData.ZZ_PONO,
					ZZ_CLENTY : oData.ZZ_CLENTY,
				});
			} else {
				results.BVISA_HDR_TO_COST_ASGN.push({
					ZZ_PERNR : pernr,
					ZZ_DEP_REQ : oData.ZZ_DEP_REQ,
					ZZ_REINR : '',
					ZZ_VERSION : '',
					ZZ_PERCENT : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_PERCENT,
					ZZ_KOSTL : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_KOSTL,
					ZZ_FISTL : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FISTL,
					ZZ_FIPOS : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPOS,
					ZZ_WAERS : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_WAERS,
					ZZ_FIPEX : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_FIPEX,
					ZZ_POSNR : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_POSNR,
					ZZ_GEBER : oData.BVISA_HDR_TO_COST_ASGN.results[i].ZZ_GEBER,
				// ZZ_VKM : "",
				// ZZ_CCNAME : oData.ZZ_CCNAME,
				// ZZ_CCDEPT : oData.ZZ_CCDEPT,
				// ZZ_EANO : oData.ZZ_EANO,
				// ZZ_CCOST : oData.ZZ_CCOST,
				// ZZ_PONO :oData.ZZ_PONO,
				// ZZ_CLENTY : oData.ZZ_CLENTY,
				});
			}
		}
		if (i_version == "0") {
			oDataModel.setHeaders({
				role : "01",
				action : "00"
			});
		}
		if (i_version == "1") {
			oDataModel.setHeaders({
				role : "01",
				action : "01"
			});
		}
		oDataModel.setHeaders({
			role : role,
			action : action
		});
		oDataModel.create("ZE2E_BVISA_HDRSet", results, null, function(oData, response) {
			VisaPlanThis.uploadFiles(response.data.ZZ_VISA_REQ);
			VisaPlanThis.getView().byId("visaToolbar").setVisible(true);
			// var visano = "VISA NO -" +
			VisaPlanThis.getView().getModel().getData().ZZ_VISA_REQ = response.data.ZZ_VISA_REQ;
			VisaPlanThis.setMessage(source, response.data.ZZ_VISA_REQ);
			// return response.data.ZZ_VISA_REQ;
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			sap.m.MessageToast.show("Internal Server Error");
		}, true);
	},
	setMessage : function(source, visaReq) {
		var id = source.getId().split("--");
		var role1 = sap.ui.getCore().getModel("profile").getData().currentRole;
		switch (id[1]) {
		case "btnSave":
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			window.history.go(-1);
			sap.m.MessageToast.show("Request " + visaReq + " successfully created", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			break;
		case "btnsndback":
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			window.history.go(-1);
			sap.m.MessageToast.show("Request " + visaReq + " has been sent back for changes", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			break;
		case "btnSubmit":
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			if (role1 == "VISA") {
				window.history.go(-1);
				sap.m.MessageToast.show("Request " + visaReq + " has been closed", {
					duration : 10000,
					closeOnBrowserNavigation : false
				});
			} else {
				window.history.go(-1);
				sap.m.MessageToast.show("Request " + visaReq + " has been successfully sent for approval", {
					duration : 10000,
					closeOnBrowserNavigation : false
				});
			}
			break;
		case "approve":
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			window.history.go(-1);
			sap.m.MessageToast.show("Request " + visaReq + " has been successfully approved", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			break;
		case "reject":
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			window.history.go(-1);
			sap.m.MessageToast.show("Request " + visaReq + " has been  rejected", {
				duration : 10000,
				closeOnBrowserNavigation : false
			});
			break;
		}
	},
	uploadFiles : function(visareq) {
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
			for ( var i = 0; i < uploadFile.length; i++) {
				var sUrl = sServiceUrl + "DmsDocsSet";
				var post = VisaPlanThis.onFileUploadto(uploadFile[i].File, sUrl, visareq, header);
			}
		});
	},
	onFileUploadto : function(file, sUrl, visareq, header) {
		var gdata = sap.ui.getCore().getModel("global").getData();
		// gdata.ZZ_VISA_REQ = "0070000376";
		// var token = "";
		// var post;
		// var get = $.ajax({
		// cache : false,
		// async : false,
		// url : sServiceUrl + "EMP_PASSPORT_INFOSet",
		// type : "GET",
		// headers : {
		// 'Authorization' : token
		// },
		// beforeSend : function(xhr) {
		// xhr.setRequestHeader('X-CSRF-Token', 'Fetch');
		// }
		// });
		// get.done(function(result, response, header) {
		var sSlung = visareq + "," + gdata.ZZ_PERNR + "," + file.name + "," + "VIS";
		var oHeaders = {
			'X-Requested-With' : "XMLHttpRequest",
			'X-CSRF-Token' : header.getResponseHeader("X-CSRF-Token"),
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
	},
});
