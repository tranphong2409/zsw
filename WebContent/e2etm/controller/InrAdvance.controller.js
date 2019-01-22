sap.ui.controller("sap.ui.project.e2etm.controller.InrAdvance", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.InrAdvance
	 */
	onInit : function() {
		oThis = this;
		var model = new sap.ui.model.json.JSONModel();
		var data = {};
		data.payment = {
			expenses : [],
			footer : [],
			apfooter : []
		};
		data.worklist = {};
		data.fieldproperties = {};
		data.currtotal = [];
		data.advancehistory = [];
		data.traveldetails={};
		data.inradvance=[];
		model.setData(data);
		// model.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oThis.getView().setModel(model, "travelsettlement");
		var fileModel = new sap.ui.model.json.JSONModel();
		fileModel.setData({
			Files : []
		});
		oThis.getView().setModel(fileModel, "new");
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onRouteMatched : function(evt) {
		if (evt.getParameter("name") == "inradvance") {
			var view = evt.mParameters.view;
			oThis = view.getController();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
			oThis.fetchDetails();
		}
	},
	fetchDetails : function() {
		var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var global = sap.ui.getCore().getModel("global").getData();
		oThis.getView().setModel(sap.ui.getCore().getModel("global"), "general");
		if (currentRole == "GRM") {
			global.ZZ_REQ_TYP = global.ZZ_TRV_CAT;
		}
		if(global.ZZ_REQ_TYP == "SECO"&& (currentRole!="TRST"&&currentRole!="TRSD")){
			global.ZZ_TRV_REQ = global.ZZ_DEP_REQ; 
		}
		
		var general;
		oThis.setTravelPlan(global);
		oThis.getView().byId("comments").setValue("");
		var version = global.ZZ_VERSION.trim();
		var getWorklist = oDataModel.createBatchOperation("TrvStWorklistSet?$filter=EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+TravelPlan+eq+'" + global.ZZ_TRV_REQ + "'+and+Version+eq+'" + version + "'+and+TravelType+eq+'" + global.ZZ_REQ_TYP + "'+and+LoginRole+eq+'" + currentRole + "'+and+Module+eq+'INRA'", "GET");
		var getDocs = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + global.ZZ_TRV_REQ + "'+and+EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+DocType+eq+'INA'", "GET");
		var getComments = oDataModel.createBatchOperation("CardReloadComSet?$filter=Pernr+eq+'" + global.ZZ_DEP_PERNR + "'+and+Reinr+eq+'" + global.ZZ_TRV_REQ + "'+and+Trvky+eq+'" + global.ZZ_REQ_TYP + "'+and+Modid+eq+'INRA'", "GET");
		var getExpenses = oDataModel.createBatchOperation("TrvStdetailsSet?$filter=EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+TravelPlan+eq+'" + global.ZZ_TRV_REQ + "'+and+Version+eq+'" + version + "'+and+TravelType+eq+'" + global.ZZ_REQ_TYP + "'+and+LoginRole+eq+'" + currentRole + "'+and+Module+eq+'INRA'", "GET");
		oDataModel.addBatchReadOperations([ getWorklist, getDocs, getComments,getExpenses ]);
		
		oDataModel.submitBatch(function(oResult) {
			try {
				var data = oThis.getView().getModel("travelsettlement").getData();
				oThis.setTravelDetails(oResult.__batchResponses[0].data.results[0]);
				// Attachments
				oThis.getView().byId("UploadCollection").aItems = [];
				var filesAll = oResult.__batchResponses[1].data.results;
				var uploadData = oThis.getView().getModel("new").getData();
				uploadData.Files = filesAll;
				oThis.getView().getModel("new").setData(uploadData);
				oThis.getView().getModel("new").refresh(true);
				// Comments
				var commentsList = oThis.getView().byId(sap.ui.core.Fragment.createId("AppoveInfo", "idListApprove"));
				var commentModel = new sap.ui.model.json.JSONModel();
				commentModel.setData(oResult.__batchResponses[2].data.results);
				commentsList.bindItems("/", new sap.m.FeedListItem({
					text : "{Comnt}",
					sender : "{Dname}",
					timestamp : "Date: " + "{path:'Erdat',formatter: 'sap.ui.project.e2etm.util.Formatter.formatTicketCommentsDate'}",
				}));
				commentsList.setModel(commentModel);
				oThis.getView().getModel("travelsettlement").setData(data);
				oThis.setExpenseValues(oResult.__batchResponses[3].data.results,
						oResult.__batchResponses[0].data.results[0].Item);
				// data.payment.expenses =
				// oResult.__batchResponses[4].data.results;
				//oThis.setExpensesRows();
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			} catch (err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			}
		});
	},
	setTravelPlan:function(global){
		var fileurl;
		if (window.location.hostname == "localhost")
			 fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='" + global.ZZ_DEP_PERNR + "',TrNo='" + global.ZZ_TRV_REQ + "',TrvKey='" + global.ZZ_REQ_TYP + "',Module='REQ')/$value";
			else
				fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TravelPdfSet(EmpNo='" + global.ZZ_DEP_PERNR + "',TrNo='" + global.ZZ_TRV_REQ + "',TrvKey='" + global.ZZ_REQ_TYP + "',Module='REQ')/$value";
		
		var tppdf = oThis.getView().byId("travelplanpdf");
		tppdf.setHref(fileUrl);
	},
	setExpenseValues:function(results,item){
		
		var data = 	oThis.getView().getModel("travelsettlement").getData();
		data.inradvance = [];
		data.advancehistory = [];
			for(var i=0;i<results.length;i++){
				if(results[i].Item==item){
					data.inradvance.push(results[i]);					
				}
				else{
					data.advancehistory.push(results[i]);
				}
			}
			oThis.getView().getModel("travelsettlement").setData(data);
		},
	setFieldProperties:function(details){
		var loginrole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var role = details.Role;
		var data = oThis.getView().getModel("travelsettlement").getData();
		var action = details.Action;
		this.getView().byId("bankdetails").setVisible(false);
		if (loginrole == "EMP") {			
			//if ((role == "01" || role == "" || role == "02" || role == "11" || role == "12") && (action == "00" || action == "" || action == "02" || action == "16")){
			if ((role == "01" && action=="00") || (role == ""&&action=="") || (role == "02"&&action=="02")
					|| (role == "12"&&action=="02") || (role == "11"&&action=="02")){
				data.fieldproperties = {
					editable : true,
					savisible : true,
					smvisible : true,
					apvisible : false,
					revisible:false,
					sbvisible : false,
					clvisible:false,
					trsteditable:false
				};
				data.traveldetails.whichtab = "NEW";
				oThis.getView().byId("comments").setEditable(true);
			}
			else
				{
				data.fieldproperties = {
					editable : false,
					savisible : false,
					smvisible : false,
					apvisible : false,
					sbvisible : false,
					clvisible:false,
					revisible:false,
					trsteditable:false
				};
				data.traveldetails.whichtab = "";
				oThis.getView().byId("comments").setEditable(false);
				}
			var flag = sap.ui.project.e2etm.util.StaticUtility.checkTodayEndDate(details.EndDate);
			if(flag==false){
				data.fieldproperties = {
						editable : false,
						savisible : false,
						smvisible : false,
						apvisible : false,
						sbvisible : false,
						clvisible:false,
						revisible:false,
						trsteditable:false
					};
				oThis.getView().byId("comments").setEditable(false);
			}
			
		} else if (loginrole == "TRST") {//TRST
			var global = sap.ui.getCore().getModel("global").getData();
			if(global.whichtab == "NEW"){
			data.fieldproperties = {
					editable : false,
					savisible : false,
					smvisible : false,
					apvisible : false,
					sbvisible : false,
					clvisible:false,
					revisible:true,
					trsteditable:true
				};
			oThis.getView().byId("comments").setEditable(true);
			}
			else if(global.whichtab == "REV"){
				data.fieldproperties = {
						editable : false,
						savisible : false,
						smvisible : false,
						apvisible : true,
						sbvisible : false,
						clvisible:false,
						revisible:false,
						trsteditable:true
					};
				oThis.getView().byId("comments").setEditable(true);
				}
			else if(global.whichtab == "APP"){
				data.fieldproperties = {
						editable : false,
						savisible : false,
						smvisible : false,
						apvisible : false,
						sbvisible : false,
						clvisible:true,
						revisible:false,
						trsteditable:true
					};
				oThis.getView().byId("comments").setEditable(true);
				}
			else{
				data.fieldproperties = {
						editable : false,
						savisible : false,
						smvisible : false,
						apvisible : false,
						sbvisible : false,
						clvisible:false,
						revisible:false,
						trsteditable:false
					};
				oThis.getView().byId("comments").setEditable(false);
			}
		} 
		else if(loginrole == "TRSD"){
		
			data.fieldproperties = {
					editable : false,
					savisible : false,
					smvisible : false,
					apvisible : false,
					sbvisible : false,
					clvisible:false,
					revisible:false,
					trsteditable:false
		
				};
			oThis.getView().byId("comments").setEditable(false);
		}
		else {//Other Roles like Manager,DH
			data.fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : true,
				sbvisible : true,
				clvisible:false,
				revisible:false,
				trsteditable:false
			};
			oThis.getView().byId("comments").setEditable(true);
		}
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	setTravelDetails : function(odata) {
		var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var global = sap.ui.getCore().getModel("global").getData();
		var version = global.ZZ_VERSION.trim();
		oDataModel.read("TrvStGenDataSet(EmpNo='" + global.ZZ_DEP_PERNR + "',TravelPlan='" + global.ZZ_TRV_REQ + "',Version='" + version + "',TravelType='" + global.ZZ_REQ_TYP + "',LoginRole='" + currentRole + "',Module='INRA',Item='" + odata.Item + "')", null, null, false, function(oData, response) {
			var data = oThis.getView().getModel("travelsettlement").getData();
			data.traveldetails = oData;
			oThis.getView().getModel("travelsettlement").setData(data);
			oThis.setFieldProperties(oData);
			if(currentRole=="TRST" && oData.TravelType == "SECO" && oData.FromCountry!="IN"&&oData.ToCountry!="IN"){
				oThis.getBankDetails(oData);
			}
		}, function(error) {
			// table.setModel(null);
		});
	},
	getBankDetails:function(oData){
		this.getView().byId("bankdetails").setVisible(true);
		oDataModel.read("BankDetailsSet(EmpNo='" + oData.EmpNo + "',TravelPlan='" + oData.PrimaryTP + "',TravelType='DEPU')", null, null, false, function(oData, response) {
			var data = oThis.getView().getModel("travelsettlement").getData();
			data.bankadvice = oData;
			oThis.getView().getModel("travelsettlement").setData(data);
			//oThis.setFieldProperties(oData);
		}, function(error) {
			// table.setModel(null);
		});
	},
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf e2etm.view.InrAdvance
	 */
	// onBeforeRendering: function() {
	//
	// },
	onBack : function() {
		window.history.go(-1);
	},
	onSubmit : function() {
		// 01,01
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("01", "01", "SUB");
		});
	},
	onApprove : function() {
		// 02,03
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			var role = oThis.getView().getModel("travelsettlement").getData().traveldetails.Role;
			var action = oThis.getView().getModel("travelsettlement").getData().traveldetails.Action;
			var loginrole = sap.ui.getCore().getModel("profile").getData().currentRole;
			
			if(loginrole=="GRM")
				oThis.saveDetails("02", "03", "APP");
			else
				oThis.saveDetails("11", "03", "APP");
		
		});
	},
	onSendBack : function() {
		// 02,02
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			var role = oThis.getView().getModel("travelsettlement").getData().traveldetails.Role;
			var action = oThis.getView().getModel("travelsettlement").getData().traveldetails.Action;
			var loginrole = sap.ui.getCore().getModel("profile").getData().currentRole;
			if (loginrole == "TRST") {
				oThis.saveDetails("11", "02", "SEB");
			} else {
				if (role == "01" && action == "01")
					oThis.saveDetails("02", "02", "SEB");
				else if (role == "02" && action == "03")
					oThis.saveDetails("12", "02", "SEB");
			}
		});
	},
	onClose:function(){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("11", "14", "CLS");
		});	
	},
	onReview:function(){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("11", "16", "REV");
		});	
	},
	saveDetails : function(role, action, btype) {
		var oData = {};
		var property;
		var oDataModel1 = new sap.ui.model.odata.ODataModel(sServiceUrl);
		var data = oThis.getView().getModel("travelsettlement").getData();
		var traveldetails = data.traveldetails;
		var loginrole = sap.ui.getCore().getModel("profile").getData().currentRole;
			var comments = oThis.getView().byId("comments").getValue();
			oData = {
				TravelPlan : traveldetails.TravelPlan,
				TravelType : traveldetails.TravelType,
				EmpNo : traveldetails.EmpNo,
				Version : traveldetails.Version,
				DepuReq : traveldetails.DepuReq,
				LoginRole : loginrole,
				EmpName : traveldetails.EmpName,
				FromCountry : traveldetails.FromCountry,
				FromCountryText : traveldetails.FromCountryText,
				ToCountry : traveldetails.ToCountry,
				ToCountryText : traveldetails.ToCountryText,
				FromLoc : traveldetails.FromLoc,
				ToLoc : traveldetails.ToLoc,
				StartDate : traveldetails.StartDate,
				EndDate : traveldetails.EndDate,
				VisaType : traveldetails.VisaType,
				Action : action,
				Role : role,
				NextAction : traveldetails.NextAction,
				StatusText : traveldetails.StatusText,
				Department : traveldetails.Department,
				Duration : traveldetails.Duration,
				Level : traveldetails.Level,
				OfcEmailId : traveldetails.OfcEmailId,
				Comments : comments,
				ReceivedDt : traveldetails.ReceivedDt,
				Module : traveldetails.Module,
				Item : traveldetails.Item
			}
			oData.TrvStDetailsSet = [];
			for(var i=0;i<data.inradvance.length;i++){
				if(loginrole=="EMP"){
					data.inradvance[i].Apamt = data.inradvance[i].Paemp;
				}
				
				oData.TrvStDetailsSet.push({
					TravelPlan : traveldetails.TravelPlan,
					TravelType : traveldetails.TravelType,
					EmpNo : traveldetails.EmpNo,
					Module:traveldetails.Module,
					Item:traveldetails.Item,
					Seqno:(i+1),
					Paemp:data.inradvance[i].Paemp,
					Waers:data.inradvance[i].Waers,
					Begda:data.inradvance[i].Begda,
					Apamt:data.inradvance[i].Apamt,
					Apcur:data.inradvance[i].Apcur,
					Rmrks:data.inradvance[i].Rmrks,
					Tremr:data.inradvance[i].Tremr,
				});	
			}
			
				oDataModel1.create("TrvStGenDataSet", oData, null, function(oData, response) {
					// oController.uploadFiles(global.ZZ_TRV_REQ);
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
					if (btype != "SAV")
						window.history.go(-1);
					sap.m.MessageToast.show("Updated Successfully", {
						duration : 10000,
						closeOnBrowserNavigation : false
					});
				}, function(error) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
					sap.m.MessageToast.show("Internal Server Error");
				}, true);
	},
	onFileUpload : function(evt) {
		var file = evt.getParameters("files").files[0];
		var oData = evt.oSource.getParent().getModel("travelsettlement").getData();
		var sModule = "INA";
//		oThis.getView().byId("UploadCollection").aItems=[];
		sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(oThis, file, oData.traveldetails.TravelPlan, oData.traveldetails.EmpNo, sModule);
		// oThis.uploadCollectionFile(evt.oSource, oThis, file,
		// oData.traveldetails.TravelPlan, oData.traveldetails.EmpNo, sModule);
	},
	onFileDeleted : function(oEvent) {
		// prepare FileName
		var sFileName = oEvent.getParameters("item").item.getFileName();
		// prepare DocType
		var oData = oEvent.oSource.getParent().getModel("travelsettlement").getData();
		var sDocType;
		sDocType = "INA";
		// prepare travel request number
		var sDepReq = oData.traveldetails.TravelPlan;
		// prepare employee number
		var sEmpNo = oData.traveldetails.EmpNo;
		// prepare index
		var sIndex = 0;
		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(oThis, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex);
		// evt.oSource.fireUploadComplete();
	},
	onUploadComplete : function(oEvent) {
		oThis.getView().getModel("new").refresh(true);
		// oEvent.oSource.setUploadUrl("");
	},
	onAdd:function(){
		var data = 	oThis.getView().getModel("travelsettlement").getData();
		data.inradvance.push({Waers:"INR",Apcur:"INR"});
		oThis.getView().getModel("travelsettlement").setData(data);	
	},
	onDel:function(evt){
		var parent = evt.oSource.getParent().getParent();
		var data = oThis.getView().getModel("travelsettlement").getData();
		var index = parent.getSelectedItems();
		if (index.length == 0) {
			sap.m.MessageToast.show("Please select atleast one row");
		} else {
			
				data.inradvance = oThis.deleteRows(parent, index, data.inradvance);
				oThis.getView().getModel("travelsettlement").setData(data);		
		}
	
		// oThis.getView().getModel("travelsettlement").refresh(true);
		// oThis.calculateTotalValues();
	},
	deleteRows : function(table, index, expense) {
		for ( var i = index.length - 1; i >= 0; i--) {
			var tableIndex = table.indexOfItem(index[i]);
			expense.splice(tableIndex, 1);
		}
		return expense;
	},
	onDownload:function(){
		oThis.downloadPdf();
	},
	downloadPdf:function(){
		var fileUrl;
		var data = oThis.getView().getModel("travelsettlement").getData().traveldetails;
		
		var travelplan = data.TravelPlan;
		var empno = data.EmpNo;
		var traveltype = data.TravelType;
		var version = data.Version;
		//var version = 2;
		var item = data.Item.trim();
		if (window.location.hostname == "localhost")
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='INRA',Version='"+version+"',Item='"+item+"')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='INRA',Version='"+version+"',Item='"+item+"')/$value";
		
		window.open(fileUrl, "_blank");
	},
	onDownloadLink:function(evt){
		var fileUrl;
		var selecteditem = evt.oSource.getParent();
		var index =selecteditem.getParent().indexOfItem(selecteditem);	
		
		var data = oThis.getView().getModel("travelsettlement").getData();	
		
			var travelplan = data.traveldetails.TravelPlan;
			var empno = data.traveldetails.EmpNo;
			var traveltype = data.traveldetails.TravelType;
		    var version = data.traveldetails.Version;
			//var version = 2;
			var item = data.advancehistory[index].Item.trim();
			if (window.location.hostname == "localhost")
				fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='PYVR',Version='"+version+"',Item='"+item+"')/$value";
			else
				fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='PYVR',Version='"+version+"',Item='"+item+"')/$value";
			
			window.open(fileUrl, "_blank");
		}
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.InrAdvance
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.InrAdvance
 */
// onExit: function() {
//
// }
});