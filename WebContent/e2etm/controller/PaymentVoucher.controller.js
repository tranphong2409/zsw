jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");

var oThis;
sap.ui.controller("sap.ui.project.e2etm.controller.PaymentVoucher", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.PaymentVoucher
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
		data.paymenthistory = [];
		model.setData(data);
		// model.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
		oThis.getView().setModel(model, "travelsettlement");
		var fileModel = new sap.ui.model.json.JSONModel();
		fileModel.setData({
			Files : []
		});
		oThis.getView().setModel(fileModel, "new");
		// oThis.getView().setModel(model,"lodgeexpense");
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onRouteMatched : function(evt) {
		if (evt.getParameter("name") == "paymentvoucher") {
			var view = evt.mParameters.view;
			oThis = view.getController();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
			oThis.getView().byId("comments").setValue("");
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
		oThis.getView().byId("comments").setValue("");
		var getCurr = oDataModel.createBatchOperation("GetF4Help?Srch_help='F4_TCURC_ISOCD'&$format=json", "GET");
		var version = global.ZZ_VERSION.trim();
		var getWorklist = oDataModel.createBatchOperation("TrvStWorklistSet?$filter=EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+TravelPlan+eq+'" + global.ZZ_TRV_REQ + "'+and+Version+eq+'" + version + "'+and+TravelType+eq+'" + global.ZZ_REQ_TYP + "'+and+LoginRole+eq+'" + currentRole + "'+and+Module+eq+'PYVR'", "GET");
		var getDocs = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + global.ZZ_TRV_REQ + "'+and+EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+DocType+eq+'PYV'", "GET");
		var getComments = oDataModel.createBatchOperation("CardReloadComSet?$filter=Pernr+eq+'" + global.ZZ_DEP_PERNR + "'+and+Reinr+eq+'" + global.ZZ_TRV_REQ + "'+and+Trvky+eq+'" + global.ZZ_REQ_TYP + "'+and+Modid+eq+'PYVR'", "GET");
		var getExpenses = oDataModel.createBatchOperation("TrvStdetailsSet?$filter=EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+TravelPlan+eq+'" + global.ZZ_TRV_REQ + "'+and+Version+eq+'" + version + "'+and+TravelType+eq+'" + global.ZZ_REQ_TYP + "'+and+LoginRole+eq+'" + currentRole + "'+and+Module+eq+'PYVR'", "GET");
		oDataModel.addBatchReadOperations([ getCurr, getWorklist, getDocs, getComments, getExpenses ]);
		oDataModel.submitBatch(function(oResult) {
			try {
				// Currency
				var curModel = new sap.ui.model.json.JSONModel();
				curModel.setSizeLimit(oResult.__batchResponses[0].data.results.length);
				curModel.setData(oResult.__batchResponses[0].data.results);
				oThis.getView().setModel(curModel, "curModel");
				// Accounting Assignment Details
				var data = oThis.getView().getModel("travelsettlement").getData();
				oThis.setTravelDetails(oResult.__batchResponses[1].data.results[0]);
				// Attachments
				oThis.getView().byId("UploadCollection").aItems = [];
				var filesAll = oResult.__batchResponses[2].data.results;
				var uploadData = oThis.getView().getModel("new").getData();
				uploadData.Files = filesAll;
				oThis.getView().getModel("new").setData(uploadData);
				oThis.getView().getModel("new").refresh(true);
				// Comments
				var commentsList = oThis.getView().byId(sap.ui.core.Fragment.createId("AppoveInfo", "idListApprove"));
				var commentModel = new sap.ui.model.json.JSONModel();
				commentModel.setData(oResult.__batchResponses[3].data.results);
				commentsList.bindItems("/", new sap.m.FeedListItem({
					text : "{Comnt}",
					sender : "{Dname}",
					timestamp : "Date: " + "{path:'Erdat',formatter: 'sap.ui.project.e2etm.util.Formatter.formatTicketCommentsDate'}",
				}));
				commentsList.setModel(commentModel);
				oThis.getView().getModel("travelsettlement").setData(data);
				//data.payment.expenses = oResult.__batchResponses[4].data.results;
				oThis.setExpenseValues(oResult.__batchResponses[4].data.results,
						oResult.__batchResponses[1].data.results[0].Item);
				oThis.setExpensesRows();	
				oThis.setFooter();
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			} catch (err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			}
		});
	},
	setExpenseValues:function(results,item){
	var data = 	oThis.getView().getModel("travelsettlement").getData();
	data.payment.expenses = [];
	data.paymenthistory = [];
		for(var i=0;i<results.length;i++){
			if(results[i].Item==item){
				data.payment.expenses.push(results[i]);
			}
			else{
				data.paymenthistory.push(results[i]);
			}
		}
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	setTravelDetails : function(odata) {
		var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var global = sap.ui.getCore().getModel("global").getData();
		var version = global.ZZ_VERSION.trim();
		oDataModel.read("TrvStGenDataSet(EmpNo='" + global.ZZ_DEP_PERNR + "',TravelPlan='" + global.ZZ_TRV_REQ + "',Version='" + version + "',TravelType='" + global.ZZ_REQ_TYP + "',LoginRole='" + currentRole + "',Module='PYVR',Item='" + odata.Item + "')", null, null, false, function(oData, response) {
			var data = oThis.getView().getModel("travelsettlement").getData();
			data.traveldetails = oData;
			oThis.setFieldProperties(oData);
			oThis.getView().getModel("travelsettlement").setData(data);
		}, function(error) {
			// table.setModel(null);
		});
	},
	setFooter : function() {
		var data = oThis.getView().getModel("travelsettlement").getData();
		data.payment = oThis.calculateSubTotals(data.payment);
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	onBackPress : function() {
		window.history.go(-1);
	},
	setFieldProperties : function(details) {
		var loginrole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var role = details.Role;
		var data = oThis.getView().getModel("travelsettlement").getData();
		var action = details.Action;
		if (loginrole == "EMP") {
			// if ((role == "01" || role == "" || role == "02" || role == "11"
			// || role == "12") && (action == "00" || action == "" || action ==
			// "02" || action == "16")){
			if ((role == "01" && action == "00") || (role == "" && action == "") || (role == "02" && action == "02") || (role == "12" && action == "02") || (role == "11" && action == "02")) {
				data.fieldproperties = {
					editable : true,
					savisible : true,
					smvisible : true,
					apvisible : false,
					sbvisible : false,
					accountvisible : false,
					trvlvisible : true,
					rvvisible : false,
					awfvisible : false,
					trsteditable : false,
					enabled : true,
					inrreceivable : false,
					clvisible : false,
					surfvisible : false,
					sfvisible : false,
					conveditable : true
				};
				data.traveldetails.whichtab = "NEW";
				oThis.getView().byId("comments").setEditable(true);
			} else {
				data.fieldproperties = {
					editable : false,
					savisible : false,
					smvisible : false,
					apvisible : false,
					sbvisible : false,
					awfvisible : false,
					clvisible : false,
					sfvisible : false,
					surfvisible : false,
					inrreceivable : false,
					rvvisible : false,
					accountvisible : false,
					trvlvisible : true,
					trsteditable : false,
					enabled : true,
					conveditable : false
				};
				data.traveldetails.whichtab = "";
				oThis.getView().byId("comments").setEditable(false);
			}
		} else if (loginrole == "TRST") {// TRST
			var global = sap.ui.getCore().getModel("global").getData();
			if (global.parentKey == "PYVR") {
				data.fieldproperties = oThis.setDomFieldProperties(global);
			}
			var prop = {
				sureditable : false,
				surineditable : false
			};
			var model = new sap.ui.model.json.JSONModel();
			model.setData(prop);
			oThis.getView().setModel(model, "fieldproperties");
			oThis.getView().byId("comments").setEditable(true);
		} 
		else if(loginrole == "TRSD"){
		
			data.fieldproperties = {
					editable : false,
					savisible : false,
					smvisible : false,
					apvisible : false,
					sbvisible : false,
					rvvisible : false,
					awfvisible:false,
					accountvisible : false,
					trvlvisible : true,
					trsteditable : false,
					enabled : true,
					inrreceivable:false,
					clvisible:false,
					sfvisible:false,
					surfvisible:false,
					sbcvisible:false,
					conveditable:false
				};
		}
		else {// Other Roles like Manager,DH
			data.fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : true,
				sbvisible : true,
				rvvisible : false,
				awfvisible : false,
				accountvisible : false,
				trvlvisible : false,
				trsteditable : false,
				enabled : true,
				inrreceivable : false,
				clvisible : false,
				sfvisible : false,
				surfvisible : false,
				conveditable : false
			};
			oThis.getView().byId("comments").setEditable(true);
		}
		if ((role == "01" && action == "00") || (role == "" && action == "")||
			(role=="02"&&action=="03")||(role=="02"&&action=="02")||
			(role=="12"&&action=="02")||(role=="01"&&action=="01")) {
			data.fieldproperties.trvlvisible = false;
		}
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	setDomFieldProperties:function(global){
		var fieldproperties={};
		if (global.whichtab == "NEW") {
			fieldproperties = {
				editable : false,
				savisible : true,
				smvisible : false,
				apvisible : false,
				sbvisible : true,
				clvisible:false,
				sfvisible:false,
				rvvisible : true,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : true,
				enabled : true,				
				conveditable:false,
				inrreceivable:false,
			};
			oThis.getView().byId("comments").setEditable(true);
		} else if (global.whichtab == "REV") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : true,
				sbvisible : true,
				clvisible:false,
				sfvisible:false,
				inrreceivable:false,
				rvvisible : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : true,
				enabled : true,
				conveditable:true
			};
			oThis.getView().byId("comments").setEditable(true);
		} else if (global.whichtab == "APP") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : false,
				rvvisible : false,
				clvisible:true,
				sfvisible:false,
				sbvisible : false,
				inrreceivable:false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : false,
				enabled : true,
				conveditable:true
			};
			oThis.getView().byId("comments").setEditable(true);
		}
		else if(global.whichtab=="PAYB"){
			fieldproperties = {
					editable : false,
					savisible : false,
					smvisible : false,
					apvisible : false,
					rvvisible : false,
					clvisible:true,
					sfvisible:false,
					sbvisible : false,
					inrreceivable:false,
					accountvisible : true,
					trvlvisible : true,
					trsteditable : false,
					enabled : true,//Buttons enabled,
					conveditable:false
				};
		}
		else if(global.whichtab=="CLSR"){
			fieldproperties = {
					editable : false,
					savisible : false,
					smvisible : false,
					apvisible : false,
					rvvisible : false,
					clvisible:false,
					sfvisible:false,
					sbvisible : false,
					inrreceivable:false,
					accountvisible : true,
					trvlvisible : true,
					trsteditable : false,
					enabled : true,//Buttons enabled,
					conveditable:false
				};
		}
		fieldproperties.awfvisible=false;
		fieldproperties.surfvisible=false;
		return fieldproperties;
	},
	setExpensesRows : function() {
		var data = oThis.getView().getModel("travelsettlement").getData();
		if (data.payment.expenses.length == 0) {
			data.payment.expenses.push({});
		}
		if(data.paymenthistory.length==0){
			oThis.getView().byId("payhistory").setVisible(false);
		}
		else
			oThis.getView().byId("payhistory").setVisible(true);
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	onAdd : function(evt) {
		var bid = evt.oSource.getId();
		var id = bid.split("--");
		var data = oThis.getView().getModel("travelsettlement").getData();
		var parent = evt.oSource.getParent().getParent();
		switch (id[1]) {
		case "paymentAdd":
			data.payment.expenses.push({});
			// data.travel = oThis.calculateSubTotal(data.travel);
			break;
		}
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	onDel : function(evt) {
		var bid = evt.oSource.getId();
		var id = bid.split("--");
		var parent = evt.oSource.getParent().getParent();
		var data = oThis.getView().getModel("travelsettlement").getData();
		var index = parent.getSelectedItems();
		if (index.length == 0) {
			sap.m.MessageToast.show("Please select atleast one row");
		} else {
			switch (id[1]) {
			case "paymentDel":
				data.payment.expenses = oThis.deleteRows(parent, index, data.payment.expenses);
				data.payment = oThis.calculateSubTotals(data.payment);
				// oThis.setAmountValues(evt.oSource.getParent().getParent().getParent(),
				// data.travel);
				break;
			}
		}
		oThis.getView().getModel("travelsettlement").setData(data);
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
	onCalculate1 : function(evt) {
		// var source = evt.slice();
		// oThis.getView().getContent()[0].setBusy(true);
		var bid = evt.getSource().getParent().getParent().getId();
		var panel = evt.getSource().getParent().getParent().getParent();
		var table = evt.getSource().getParent().getParent();
		var index = table.indexOfItem(evt.getSource().getParent());
		var id = bid.split("--");
		var data = oThis.getView().getModel("travelsettlement").getData();
		switch (id[1]) {
		case "paymentexp":
			data.payment.expenses[index].Apamt = data.payment.expenses[index].Paemp;
			data.payment.expenses[index].Apcur = data.payment.expenses[index].Waers;
			data.payment = oThis.calculateSubTotals(data.payment);
			// data.travel =
			// oThis.onSubtotalCalculateChange(data.travel.expenses[index].Wears,data.travel);
			break;
		}
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	onCalculateAdvance : function(evt) {
	//	oThis.getView().getContent()[0].setBusy(true);
		var bid = evt.getSource().getParent().getParent().getId();
		var panel = evt.getSource().getParent().getParent().getParent();
		var table = evt.getSource().getParent().getParent();
		var index = table.indexOfItem(evt.getSource().getParent());
		var id = bid.split("--");
		var data = oThis.getView().getModel("travelsettlement").getData();
		switch (id[1]) {
		case "paymentexp":
			data.payment = oThis.calculateSubTotals(data.payment);
			//data.travel = oThis.onSubtotalCalculateChange(data.travel.expenses[index].Wears,data.travel);
			break;
		}
		oThis.getView().getModel("travelsettlement").setData(data);
		//oThis.getView().getModel("travelsettlement").refresh(true);
	//	oThis.calculateTotalValues();
	},
	calculateSubTotals : function(exptype) {
		exptype.footer = [];
		exptype.apfooter = [];
		var data = oThis.getView().getModel("travelsettlement").getData();
		var flag = false;
		var currencyList = [];
		var apcurList = [];
		var totalemp = 0;
		var totalcmp = 0;
		var totalapp = 0;
		var expenses = exptype.expenses;
		for ( var i = 0; i < expenses.length; i++) {
			if (currencyList.indexOf(expenses[i].Waers) == -1) {
				currencyList.push(expenses[i].Waers);
			}
			if (apcurList.indexOf(expenses[i].Apcur) == -1) {
				apcurList.push(expenses[i].Apcur);
			}
		}
		// Paid by emp,paid by cmp,currency
		for ( var i = 0; i < currencyList.length; i++) {
			totalemp = 0;
			totalcmp = 0;
			totalapp = 0;
			flag = false;
			for ( var j = 0; j < expenses.length; j++) {
				if (expenses[j].Waers == currencyList[i]) {
					if (expenses[j].Paemp != undefined)
						totalemp = totalemp + oThis.formatAmountValue(expenses[j].Paemp);
					// totalcmp = totalcmp +
					// oThis.formatAmountValue(expenses[j].Pacmp);
					// totalapp = totalapp +
					// oThis.formatAmountValue(expenses[j].Apamt);
					flag = true;
				}
			}
			if (flag) {
				if (totalemp != 0 || totalcmp != 0) {
					exptype.footer.push({
						Paemp : totalemp,
						// Pacmp : totalcmp,
						// Apamt : totalapp,
						Waers : currencyList[i]
					});
				}
			}
		}
		// Approved Amount,currency
		for ( var i = 0; i < apcurList.length; i++) {
			totalapp = 0;
			flag = false;
			for ( var j = 0; j < expenses.length; j++) {
				if (expenses[j].Apcur == apcurList[i]) {
					if (expenses[j].Apamt != undefined)
						totalapp = totalapp + oThis.formatAmountValue(expenses[j].Apamt);
					flag = true;
				}
			}
			if (flag) {
				if (totalapp != 0) {
					exptype.apfooter.push({
						Apamt : totalapp,
						Apcur : apcurList[i]
					});
				}
			}
		}
		return exptype;
	},
	formatAmountValue : function(value) {
		if (isNaN(parseFloat(value)))
			return 0.00;
		else
			return parseFloat(parseFloat(value).toFixed(2));
	},
	onSubmit : function() {
		// 01,01
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("01", "01", "SUB");
		});
	},
	onSave : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			var role = sap.ui.getCore().getModel("profile").getData().currentRole;
			if (role == "EMP")
				oThis.saveDetails("01", "00", "SAV");
			else
				oThis.saveDetails("11", "00", "SAV");
		});
	},
	onApprove : function() {
		// 02,03
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			var role = oThis.getView().getModel("travelsettlement").getData().traveldetails.Role;
			var action = oThis.getView().getModel("travelsettlement").getData().traveldetails.Action;
			var loginrole = sap.ui.getCore().getModel("profile").getData().currentRole;
			if (loginrole == "TRST") {
				oThis.saveDetails("11", "03", "APP");
			} else {
				if (role == "01" && action == "01")
					oThis.saveDetails("02", "03", "APP");
				else if (role == "02" && action == "03")
					oThis.saveDetails("12", "03", "APP");
			}
		});
	},
	onClose : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("11", "14", "CLS");
		});
	},
	onSendtoForex : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("11", "22", "STF");
		});
	},
	onSurrender : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("11", "20", "SUR");
		});
	},
	onForexChange : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("11", "23", "FXC");
		});
	},
	onINRReceivable : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("11", "21", "INR");
		});
	},
	onReview : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("11", "16", "REV");
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
	saveDetails : function(role, action, btype) {
		var oData = {};
		var property;
		var oDataModel1 = new sap.ui.model.odata.ODataModel(sServiceUrl);
		var data = oThis.getView().getModel("travelsettlement").getData();
		var traveldetails = data.traveldetails;
		var declaration = oThis.getView().byId("declaration").getSelected();
		var loginrole = sap.ui.getCore().getModel("profile").getData().currentRole;
		if (!declaration && btype != "SAV" && loginrole == "EMP") {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			sap.ca.ui.message.showMessageBox({
				type : sap.ca.ui.message.Type.WARNING,
				message : "Please accept the declaration"
			});
		} else {
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
				Declaration : declaration ? "X" : "",
				ReceivedDt : traveldetails.ReceivedDt,
				Module : traveldetails.Module,
				Item : traveldetails.Item
			}
			oData.TrvStDetailsSet = [];
			try {
				for ( var prop in data) {
					property = prop;
					switch (prop) {
					case "payment":
						oData.TrvStDetailsSet = oThis.appendRows(data[prop], data.traveldetails, oData.TrvStDetailsSet, "TRVL", btype, prop);
						break;
					}
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
			} catch (exc) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				if (exc == "Currency") {
					oThis.setFocus(property);
				}
				if (exc == "Distance") {
					sap.m.MessageToast.show("Please enter Distance in Conveyance Expense");
					oThis.getView().byId("convexp").focus();
				}
			}
		}
	},
	setFocus : function(property) {
		switch (property) {
		case "travel":
			sap.m.MessageToast.show("Please enter currency in Travel Expense");
			oThis.getView().byId("travelexp").focus();
			break;
		}
	},
	appendRows : function(exptype, traveldetails, trvdetset, etype, btype, prop) {
		var flag = false;
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		for ( var i = 0; i < exptype.expenses.length; i++) {
			trvdetset.push({
				TravelPlan : traveldetails.TravelPlan,
				TravelType : traveldetails.TravelType,
				EmpNo : traveldetails.EmpNo,
//				EType : etype,
				Version : traveldetails.Version,
				LoginRole : role,
				Seqno : (i + 1),
				// Trvlr:,
				Trvlr : exptype.expenses[i].Trvlr,
				Frmpl : exptype.expenses[i].Frmpl == undefined ? "" : exptype.expenses[i].Frmpl,
				Begda : exptype.expenses[i].Begda,
				Begur : exptype.expenses[i].Begur,
				toplc : exptype.expenses[i].toplc,
				Endda : exptype.expenses[i].Endda,
				Enduz : exptype.expenses[i].Enduz,
				Modet : exptype.expenses[i].Modet,
				Pvisi : exptype.expenses[i].Pvisi,
				Pstay : exptype.expenses[i].Pstay,
				Ndays : exptype.expenses[i].Ndays,
				Dates : exptype.expenses[i].Dates,
				Cmode : exptype.expenses[i].Cmode == undefined ? "" : exptype.expenses[i].Cmode,
				Entkm : exptype.expenses[i].Entkm,
				Entkl : exptype.expenses[i].Entkl,
				Otype : exptype.expenses[i].Otype,
				Paemp : exptype.expenses[i].Paemp,
				Pacmp : exptype.expenses[i].Pacmp,
				Waers : exptype.expenses[i].Waers,
				Descr : exptype.expenses[i].Descr,
				Rmrks : exptype.expenses[i].Rmrks,
				Apamt : exptype.expenses[i].Apamt,
				Apcur : exptype.expenses[i].Apcur,
				Tremr : exptype.expenses[i].Tremr,
				Module : traveldetails.Module,
				Item : traveldetails.Item
			});
		}
		return trvdetset;
	},
	onFileUpload : function(evt) {
		var file = evt.getParameters("files").files[0];
		var oData = evt.oSource.getParent().getModel("travelsettlement").getData();
		var sModule = "PYV";
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
		sDocType = "PYV";
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
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='PYVR',Version='"+version+"',Item='"+item+"')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='PYVR',Version='"+version+"',Item='"+item+"')/$value";
		
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
		var item = data.paymenthistory[index].Item.trim();
		if (window.location.hostname == "localhost")
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='PYVR',Version='"+version+"',Item='"+item+"')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='PYVR',Version='"+version+"',Item='"+item+"')/$value";
		
		window.open(fileUrl, "_blank");
	}
/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.PaymentVoucher
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.PaymentVoucher
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.PaymentVoucher
 */
// onExit: function() {
//
// }
});