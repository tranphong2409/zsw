jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
var oThis;
sap.ui.controller("sap.ui.project.e2etm.controller.TravelSettlement", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.TravelSettlement
	 */
	onInit : function() {
		oThis = this;
		var model = new sap.ui.model.json.JSONModel();
		var data = {};
		data.travel = {
			expenses : [],
			footer : [],
			apfooter : []
		};
		data.lodging = {
			expenses : [],
			footer : [],
			apfooter : []
		};
		data.boarding = {
			expenses : [],
			footer : [],
			apfooter : []
		};
		data.conv = {
			expenses : [],
			footer : [],
			apfooter : []
		};
		data.entr = {
			expenses : [],
			footer : [],
			apfooter : []
		};
		data.cargo = {
			expenses : [],
			footer : [],
			apfooter : []
		};
		data.other = {
			expenses : [],
			footer : [],
			apfooter : []
		};
		data.accass = [];
		data.advance = {
			expenses : [],
			footer : [],
			apfooter : []
		};
		data.credit = {
			expenses : [],
			footer : [],
			apfooter : []
		};
		data.traveldetails = {
		// expenses : [],
		// emptotal : "",
		// comtotal : "",
		// currency : ""
		};
		data.fieldproperties = {};
		data.currtotal = [];
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
		if (evt.getParameter("name") == "trsettle") {
			var view = evt.mParameters.view;
			oThis = view.getController();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
			var oShell = oComponent.oContainer.getParent();
			oShell.setAppWidthLimited(false);
			var global = sap.ui.getCore().getModel("global").getData();
			oThis.clearData();
			if(this.getView().byId("idIconTabBar").getSelectedKey()!="DTLS")
			 {
			    this.getView().byId("idIconTabBar").setSelectedKey("DTLS");
			 }
			oThis.fetchDetails();
		} else {
			var oShell = oComponent.oContainer.getParent();
			oShell.setAppWidthLimited(true);
		}
	},
	clearData : function() {
		oThis.getView().byId("comments").setValue("");
		var data = oThis.getView().getModel("travelsettlement").getData();
		data.fieldproperties = {
			savisible : false,
			smvisible : false,
			apvisible : false,
			sbvisible : false,
			accountvisible : false,
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
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	setFieldProperties : function(details) {
		var loginrole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var role = details.Role;
		var data = oThis.getView().getModel("travelsettlement").getData();
		var action = details.Action;
		oThis.getView().byId("texcrate").setVisible(false);
		oThis.getView().byId("ttotal").setVisible(false);
		oThis.getView().byId("texccur").setVisible(false);
		oThis.getView().byId("tcurrency").setVisible(false);
		oThis.getView().byId("btnTrstPdf").setVisible(false);
		oThis.getView().byId("btnShowRmrks").setVisible(false);
		oThis.getView().byId("btnSaveRmrks").setVisible(false);
		oThis.getView().byId("hBoxCurrency").setVisible(false);
		this.getView().byId("btnTrstClose").setText("Close");
//		data.fieldproperties = {			
//				savisible : false,
//				sbvisible: false,
//				sfvisible: false,
//				inrreceivable: false,
//				awfvisible: false,
//				surfvisible: false,
//				smvisible: false,
//				apvisible: false,
//				rvvisible: false,
//				clvisible: false,			
//			};
		
		
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
					sbcvisible : false,
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
				// Newly added
				if ((role == "01" && action == "00") || (role == "" && action == "")) {
					var subflag = oThis.enableSubmitButton(data.traveldetails);
					if (subflag) {
						data.fieldproperties.smvisible = true;
					} else {
						data.fieldproperties.smvisible = false;
					}
				}
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
					sbcvisible : false,
					accountvisible : false,
					trvlvisible : true,
					trsteditable : false,
					enabled : true,
					conveditable : false
				};
				data.traveldetails.whichtab = "";
				oThis.getView().byId("comments").setEditable(false);
			}
			// PDF button Visible&Invisible
			if (data.traveldetails.NextAction == 'Travel settlement team' || data.traveldetails.NextAction == 'Forex team') {
				oThis.getView().byId("btnTrstPdf").setVisible(true);
			} else if (data.traveldetails.NextAction == '' || data.traveldetails.NextAction == ' ') {
				if (action == '14') {
					oThis.getView().byId("btnTrstPdf").setVisible(true);
				} else if (role == '12' && action == '03') {
					oThis.getView().byId("btnTrstPdf").setVisible(true);
				}
			}
			// PDF button Visible&Invisible
		} else if (loginrole == "TRST") {// TRST
			var global = sap.ui.getCore().getModel("global").getData();
			oThis.getView().byId("btnTrstPdf").setVisible(true);
			this.getView().byId("ipAddCurrency").setValueState("None");
			if (global.parentKey == "INTL") {
				oThis.getView().byId("texcrate").setVisible(true);
				oThis.getView().byId("ttotal").setVisible(true);
				oThis.getView().byId("texccur").setVisible(true);
				oThis.getView().byId("tcurrency").setVisible(true);
				data.fieldproperties = oThis.setIntlFieldProperties(global);
			} else {
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
		} else if (loginrole == "TRSD") {
			oThis.getView().byId("texcrate").setVisible(true);
			oThis.getView().byId("ttotal").setVisible(true);
			oThis.getView().byId("texccur").setVisible(true);
			oThis.getView().byId("tcurrency").setVisible(true);
			oThis.getView().byId("btnTrstPdf").setVisible(true);
			data.fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : false,
				sbvisible : false,
				rvvisible : false,
				awfvisible : false,
				accountvisible : false,
				trvlvisible : true,
				trsteditable : false,
				enabled : true,
				inrreceivable : false,
				clvisible : false,
				sfvisible : false,
				surfvisible : false,
				sbcvisible : false,
				conveditable : false
			};
		} else {// Other Roles like Manager,DH
			oThis.getView().byId("btnTrstPdf").setVisible(true);
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
				sbcvisible : false,
				conveditable : false
			};
			oThis.getView().byId("comments").setEditable(true);
		}
		if ((role == "01" && action == "00") || (role == "" && action == "")) {
			data.fieldproperties.trvlvisible = false;
		}
		data.fieldproperties.accountvisible = true;
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	enableSubmitButton : function(data) {
		// var flag = false;
		var status = sap.ui.getCore().getModel("global").getData().ZZ_STAT_FLAG;
		var enddate = data.EndDate;
		var today = new Date();
		var eyear = enddate.substring(0, 4);
		var emonth = enddate.substring(4, 6);
		var edate = enddate.substring(6, 8);
		var aenddate = oThis.convertToDate(eyear, emonth, edate);
		if (aenddate < today && status == "FF001") {
			return true;
		}
		return false;
	},
	setDomFieldProperties : function(global) {
		var fieldproperties = {};
		if (global.whichtab == "NEW") {
			fieldproperties = {
				editable : false,
				savisible : true,
				smvisible : false,
				apvisible : false,
				sbcvisible : false,
				sbvisible : true,
				clvisible : false,
				sfvisible : false,
				rvvisible : true,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : true,
				enabled : true,
				conveditable : false,
				inrreceivable : false,
			};
			oThis.getView().byId("comments").setEditable(true);
			oThis.getView().byId("btnShowRmrks").setVisible(true);
			oThis.getView().byId("btnSaveRmrks").setVisible(true);
			oThis.getView().byId("hBoxCurrency").setVisible(true);
		} else if (global.whichtab == "REV") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				sbcvisible : false,
				apvisible : true,
				sbvisible : true,
				clvisible : false,
				sfvisible : false,
				inrreceivable : false,
				rvvisible : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : true,
				enabled : true,
				conveditable : true
			};
			oThis.getView().byId("btnShowRmrks").setVisible(true);
			oThis.getView().byId("btnSaveRmrks").setVisible(true);
			oThis.getView().byId("comments").setEditable(true);
		} else if (global.whichtab == "APP") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : false,
				rvvisible : false,
				clvisible : true,
				sbcvisible : false,
				sfvisible : false,
				sbvisible : false,
				inrreceivable : true,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : false,
				enabled : true,
				conveditable : true
			};
			oThis.getView().byId("comments").setEditable(true);
		} else if (global.whichtab == "INRE") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : false,
				rvvisible : false,
				clvisible : true,
				sbcvisible : false,
				sfvisible : false,
				sbvisible : false,
				inrreceivable : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : false,
				enabled : true,// Buttons enabled,
				conveditable : false
			};
		} else if (global.whichtab == "CLSR") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : false,
				rvvisible : false,
				clvisible : false,
				sbcvisible : true,
				sfvisible : false,
				sbvisible : false,
				inrreceivable : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : false,
				enabled : true,// Buttons enabled,
				conveditable : false
			};
		}
		fieldproperties.awfvisible = false;
		fieldproperties.surfvisible = false;
		return fieldproperties;
	},
	setIntlFieldProperties : function(global) {
		var fieldproperties = {};
		if (global.whichtab == "NEW") {
			fieldproperties = {
				editable : false,
				savisible : true,
				smvisible : false,
				apvisible : false,
				sbvisible : true,
				sbcvisible : false,
				clvisible : false,
				inrreceivable : false,
				sfvisible : false,
				surfvisible : false,
				rvvisible : true,
				awfvisible : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : true,
				enabled : true,
				conveditable : false
			};
			oThis.getView().byId("btnShowRmrks").setVisible(true);
			oThis.getView().byId("btnSaveRmrks").setVisible(true);
			oThis.getView().byId("comments").setEditable(true);
			oThis.getView().byId("hBoxCurrency").setVisible(true);
		} else if (global.whichtab == "REV") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : true,
				sbvisible : true,
				clvisible : false,
				sbcvisible : false,
				sfvisible : false,
				inrreceivable : false,
				rvvisible : false,
				surfvisible : false,
				awfvisible : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : true,
				enabled : true,
				conveditable : true
			};
			oThis.getView().byId("btnShowRmrks").setVisible(true);
			oThis.getView().byId("btnSaveRmrks").setVisible(true);
			oThis.getView().byId("comments").setEditable(true);
		} else if (global.whichtab == "APP") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : false,
				rvvisible : false,
				clvisible : false,
				inrreceivable : false,
				sfvisible : false,
				surfvisible : true,
				sbvisible : false,
				sbcvisible : false,
				awfvisible : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : false,
				enabled : true,
				conveditable : true
			};
			var txClsFlg = this.setCloseButtonVisible();
			if(txClsFlg){
				fieldproperties.clvisible = true;
				this.getView().byId("btnTrstClose").setText("Taxables");
			}
			oThis.getView().byId("comments").setEditable(true);
		} else if (global.whichtab == "AWF") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : false,
				rvvisible : false,
				awfvisible : true,
				sbcvisible : false,
				clvisible : false,
				surfvisible : false,
				sfvisible : false,
				inrreceivable : false,
				sbvisible : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : false,
				enabled : true,// Buttons enabled,
				conveditable : false
			};
		} else if (global.whichtab == "PSUR") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : false,
				rvvisible : false,
				awfvisible : false,
				clvisible : true,
				sbcvisible : false,
				sfvisible : true,
				surfvisible : false,
				inrreceivable : false,
				sbvisible : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : false,
				enabled : true,// Buttons enabled,
				conveditable : false
			};
		} else if (global.whichtab == "SURR") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : false,
				rvvisible : false,
				awfvisible : false,
				clvisible : true,
				sbcvisible : false,
				sfvisible : false,
				surfvisible : false,
				inrreceivable : false,
				sbvisible : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : false,
				enabled : true,// Buttons enabled,
				conveditable : false
			};
		} else if (global.whichtab == "CLSR") {
			fieldproperties = {
				editable : false,
				savisible : false,
				smvisible : false,
				apvisible : false,
				rvvisible : false,
				clvisible : false,
				sfvisible : false,
				awfvisible : false,
				sbcvisible : true,
				surfvisible : false,
				sbvisible : false,
				inrreceivable : false,
				accountvisible : true,
				trvlvisible : true,
				trsteditable : false,
				enabled : true,// Buttons enabled,
				conveditable : false
			};
		}else if (global.whichtab == "TAXB") {
			fieldproperties = {
					editable : false,
					savisible : false,
					smvisible : false,
					apvisible : false,
					rvvisible : false,
					awfvisible : false,
					clvisible : true,
					sbcvisible : false,
					sfvisible : false,
					surfvisible : false,
					inrreceivable : false,
					sbvisible : false,
					accountvisible : true,
					trvlvisible : true,
					trsteditable : false,
					enabled : false,// Buttons enabled,
					conveditable : false
				};
			}
		return fieldproperties;
	},
	setCloseButtonVisible:function(){
		var total = oThis.getView().getModel("travelsettlement").getData().currtotal;
		var count = 0;
        for(var i=0;i<total.length;i++){
        	if(total[i].payable!=0){
        		count++;
        	}
        }
        if(count!=0 && count == total.length){
        	return true;
        }else{
        	return false;
        }
	},
	setExpensesRows : function() {
		var data = oThis.getView().getModel("travelsettlement").getData();
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		this.getView().byId("panelboarding").setVisible(true);
		this.getView().byId("panellodging").setVisible(true);
		this.getView().byId("panelconv").setVisible(true);
		this.getView().byId("panelentr").setVisible(true);
		this.getView().byId("panelother").setVisible(true);
		this.getView().byId("panelcargo").setVisible(true);
		var currency = data.traveldetails.DefaultCurr;
		if (data.travel.expenses.length == 0) {			
			data.travel.expenses.push({
				Begda : "",
				Endda : "",
				Waers : currency,
				Trvlr : "00"
			});			
		}
		if (data.boarding.expenses.length == 0) {
			if(role == "TRST" || role == "TRSD"){
				this.getView().byId("panelboarding").setVisible(false);
			}else{
			data.boarding.expenses.push({
				Begda : data.traveldetails.StartDate,
				Endda : data.traveldetails.EndDate,
				Waers : currency
			});
			data.boarding = oThis.calculateNumberofDays(data.traveldetails.StartDate, data.traveldetails.EndDate, data.boarding, 0);
			}
		}
		if (data.lodging.expenses.length == 0) {
			if(role == "TRST" || role == "TRSD"){
				this.getView().byId("panellodging").setVisible(false);
			}else{
			data.lodging.expenses.push({
				Begda : "",
				Endda : "",
				Waers : currency
			});
			}
		}
		if (data.conv.expenses.length == 0) {
			if(role == "TRST" || role == "TRSD"){
				this.getView().byId("panelconv").setVisible(false);
			}else{
			data.conv.expenses.push({
				Dates : "",
				Waers : currency,
				Entkm : 0
			});
			}
		}
		if (data.entr.expenses.length == 0) {
			if(role == "TRST" || role == "TRSD"){
				this.getView().byId("panelentr").setVisible(false);
			}else{
			data.entr.expenses.push({
				Waers : currency
			});
			}
		}
		if (data.other.expenses.length == 0) {
			if(role == "TRST" || role == "TRSD"){
				this.getView().byId("panelother").setVisible(false);
			}else{
			data.other.expenses.push({
				Waers : currency
			});
			}
		}
		if (data.advance.expenses.length == 0) {

			data.advance.expenses.push({
				Dates : "",
				Waers : currency,
				Rmrks : "Advance/Allowance received"
			});
			
		}
		if (data.cargo.expenses.length == 0) {
			if(role == "TRST" || role == "TRSD"){
				this.getView().byId("panelcargo").setVisible(false);
			}else{
			data.cargo.expenses.push({
				Waers : currency
			});
			}
		}
		if (data.credit.expenses.length == 0) {
			
			data.credit.expenses.push({
				Waers : currency
			});
			
		}
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	fetchDetails : function() {
		var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var global = sap.ui.getCore().getModel("global").getData();
		oThis.getView().setModel(sap.ui.getCore().getModel("global"), "general");
		if (currentRole == "GRM") {
			global.ZZ_REQ_TYP = global.ZZ_TRV_CAT;
		}
		if (global.ZZ_REQ_TYP == "SECO" && (currentRole != "TRST" && currentRole != "TRSD")) {
			global.ZZ_TRV_REQ = global.ZZ_DEP_REQ;
		}
		var general;
		var getCurr = oDataModel.createBatchOperation("GetF4Help?Srch_help='F4_TCURC_ISOCD'&$format=json", "GET");
		var version = global.ZZ_VERSION.trim();
//		if (currentRole == "TRST")
			general = oDataModel.createBatchOperation("TrvStGenDataSet(EmpNo='" + global.ZZ_DEP_PERNR + "',TravelPlan='" + global.ZZ_TRV_REQ + "',Version='" + version + "',TravelType='" + global.ZZ_REQ_TYP + "',LoginRole='" + currentRole + "',Module='TRST',Item='1')?$expand=TRV_COST_ASGNSet", "GET");
//		else
//			general = oDataModel.createBatchOperation("TrvStGenDataSet(EmpNo='" + global.ZZ_DEP_PERNR + "',TravelPlan='" + global.ZZ_TRV_REQ + "',Version='" + version + "',TravelType='" + global.ZZ_REQ_TYP + "',LoginRole='" + currentRole + "',Module='TRST',Item='1')", "GET");
		var getModes = oDataModel.createBatchOperation("GetDomain?DomainName='ZINF_MODE'&$format=json", "GET");
		var getDocs = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + global.ZZ_TRV_REQ + "'+and+EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+DocType+eq+'TRS'", "GET");
		
		var getComments = oDataModel.createBatchOperation("CardReloadComSet?$filter=Pernr+eq+'" + global.ZZ_DEP_PERNR + "'+and+Reinr+eq+'" + global.ZZ_TRV_REQ + "'+and+Trvky+eq+'" + global.ZZ_REQ_TYP + "'+and+Modid+eq+'TRST'", "GET");
		var getExpenses = oDataModel.createBatchOperation("TrvStdetailsSet?$filter=EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+TravelPlan+eq+'" + global.ZZ_TRV_REQ + "'+and+Version+eq+'" + version + "'+and+TravelType+eq+'" + global.ZZ_REQ_TYP + "'+and+LoginRole+eq+'" + currentRole + "'+and+Module+eq+'TRST'+and+Item+eq+'1'", "GET");
		var getConvModes = oDataModel.createBatchOperation("GetDomain?DomainName='ZSLFDPD'&$format=json", "GET");
		var getCardSur = oDataModel.createBatchOperation("ForexCradSet?$filter=TravelPlan+eq+'" + global.ZZ_TRV_REQ + "'+and+EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+TravelType+eq+'" + global.ZZ_REQ_TYP + "'+and+Module+eq+'TRST'+and+SeqNo+eq+1", "GET");
		var getCashSur = oDataModel.createBatchOperation("ForexCashSet?$filter=TravelPlan+eq+'" + global.ZZ_TRV_REQ + "'+and+EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+TravelType+eq+'" + global.ZZ_REQ_TYP + "'+and+Module+eq+'TRST'", "GET");
		var getInrSur = oDataModel.createBatchOperation("ForexInrSet?$filter=TravelPlan+eq+'" + global.ZZ_TRV_REQ + "'+and+EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+TravelType+eq+'" + global.ZZ_REQ_TYP + "'", "GET");
		var getF4 = oDataModel.createBatchOperation("GetF4Table?TableName='ZE2E_FOREX_MAS'&Col1='CONST'&Col2='SELPAR'&Col3='VALUE'&Col4=''&Col5=''&Col6=''&Col7=''&Col8=''&Col9=''&Col10=''&$format=json", "GET");
		var getTotal;
		getTotal = oDataModel.createBatchOperation("TrvStTotalSet?$filter=EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+TravelPlan+eq+'" + global.ZZ_TRV_REQ + "'+and+TravelType+eq+'" + global.ZZ_REQ_TYP + "'+and+LoginRole+eq+'TRST'", "GET");
		if (currentRole != "TRST")
			oDataModel.addBatchReadOperations([ getCurr, general, getModes, getDocs, getComments, getExpenses, getConvModes, getTotal ]);
		else
			oDataModel.addBatchReadOperations([ getCurr, general, getModes, getDocs, getComments, getExpenses, getConvModes, getTotal, getCardSur, getCashSur, getInrSur, getF4 ]);
		oDataModel.submitBatch(function(oResult) {
			try {
				// Currency
				var curModel = new sap.ui.model.json.JSONModel();
				curModel.setSizeLimit(oResult.__batchResponses[0].data.results.length);
				curModel.setData(oResult.__batchResponses[0].data.results);
				oThis.getView().setModel(curModel, "curModel");
				// Accounting Assignment Details
				var data = oThis.getView().getModel("travelsettlement").getData();
				data.traveldetails = oResult.__batchResponses[1].data;
				data.accass = oResult.__batchResponses[1].data.TRV_COST_ASGNSet.results;
				var totalmodel = new sap.ui.model.json.JSONModel();
				totalmodel.setData(oResult.__batchResponses[7].data.results);
				oThis.getView().setModel(totalmodel, "totalModel");
//				oThis.setFieldProperties(data.traveldetails);
				// Expense Type Values
				oThis.setExpensesValues(oResult.__batchResponses[5].data.results);
				oThis.setExpensesRows();
				oThis.setFooter();
				oThis.setFieldProperties(data.traveldetails);
				// Modes
				var modeModel = new sap.ui.model.json.JSONModel();
				modeModel.setSizeLimit(oResult.__batchResponses[2].data.results.length);
				modeModel.setData({
					typeMode : oResult.__batchResponses[2].data.results
				});
				oThis.getView().setModel(modeModel, "modeModel");
				// Attachments
				oThis.getView().byId("UploadCollection").aItems = [];
				var filesAll = oResult.__batchResponses[3].data.results;
				var uploadData = oThis.getView().getModel("new").getData();
				uploadData.Files = filesAll;
				oThis.getView().getModel("new").setData(uploadData);
				oThis.getView().getModel("new").refresh(true);
				// Comments
				var commentsList = oThis.getView().byId(sap.ui.core.Fragment.createId("AppoveInfo", "idListApprove"));
				var commentModel = new sap.ui.model.json.JSONModel();
				commentModel.setData(oResult.__batchResponses[4].data.results);
				commentsList.bindItems("/", new sap.m.FeedListItem({
					text : "{Comnt}",
					sender : "{Dname}",
					timestamp : "Date: " + "{path:'Erdat',formatter: 'sap.ui.project.e2etm.util.Formatter.formatTicketCommentsDate'}",
				}));
				commentsList.setModel(commentModel);
				oThis.setCommentTable(commentModel);
				// Conveyance modes
				modeModel.setData({
					trvlrMode : oResult.__batchResponses[6].data.results
				}, true);
				oThis.getView().setModel(modeModel, "modeModel");
				//dye5kor
				if(currentRole=="EMP"){
				var advAmt = oThis.getView().getModel("travelsettlement").getData().advance.apfooter;
				if(advAmt.length==0){
					oThis.getView().byId("lbl_trstnote").setVisible(true);	
					
				}else{
					oThis.getView().byId("lbl_trstnote").setVisible(false);
					
				}
				//Start of change UEA6KOR_17.10.2018
				oThis.getView().byId("text1").setVisible(true);
				oThis.getView().byId("text2").setVisible(true);
				oThis.getView().byId("text3").setVisible(true);
				oThis.getView().byId("text4").setVisible(true);

				}
				//End of change UEA6KOR_17.10.2018
				//dye5kor
				
				
				// Total Values
				if (currentRole == "TRST") {
					oThis.setForexSurrender(oResult.__batchResponses[8].data.results, oResult.__batchResponses[9].data.results, oResult.__batchResponses[10].data.results);
					oThis.setF4Help(oResult.__batchResponses[11].data.results);
				}
				
		
                if(currentRole=="EMP"){					
					if(sap.ui.project.e2etm.util.StaticUtility.checkTrvlDatesOverlapping()){
						var iMsg = "Note: There are other overlapping travel plans available. Please check the expenses to be claimed."
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
						sap.ui.require(['sap/m/MessageBox'], function(MessageBox) {
							MessageBox.show(
								      iMsg, {
							          icon: sap.m.MessageBox.Icon.INFORMATION,
							          title: "Information",
							          actions: [sap.m.MessageBox.Action.OK],
							      }
							    );		
						});										
					}else{
						sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
					}
					
				}else{
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
				}
				
			} catch (err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
			}
		});
	},
	setF4Help : function(results) {
		var vendor = [];
		var vendormodel = new sap.ui.model.json.JSONModel();
		for ( var i = 0; i < results.length; i++) {
			if (results[i].FIELD1 == "VENDOR") {
				vendor.push(results[i]);
			}
		}
		vendormodel.setData(vendor);
		oThis.getView().setModel(vendormodel, "Vendor");
	},
	setForexSurrender : function(cardSur, cashSur, inrdata) {
		var data = {};
		if (oThis.getView().getModel("forexsurrender")) {
			data = oThis.getView().getModel("forexsurrender").getData();
			data.cardtable = [];
			data.cashtable = [];
			data.inrtable = [];
		} else {
			data.cardtable = [];
			data.cashtable = [];
			data.inrtable = [];
			var surrenderModel = new sap.ui.model.json.JSONModel();
			surrenderModel.setData(data);
			oThis.getView().setModel(surrenderModel, "forexsurrender");
		}
		data.cardtable = cardSur;
		data.cashtable = cashSur;
		data.inrtable = inrdata;
		// data.amount = amount;
		oThis.getView().byId("forexsurrcard").setVisibleRowCount(data.cardtable.length);
		oThis.getView().byId("forexsurrcash").setVisibleRowCount(data.cashtable.length);
		oThis.getView().byId("forexsurrinr").setVisibleRowCount(data.inrtable.length);
		oThis.getView().byId("forexsurramount").getParent().setVisible(false);
		oThis.getView().getModel("forexsurrender").setData(data);
	},
	setExpensesValues : function(results) {
		var data = oThis.getView().getModel("travelsettlement").getData();
		data.travel.expenses = [];
		data.lodging.expenses = [];
		data.boarding.expenses = [];
		data.conv.expenses = [];
		data.other.expenses = [];
		data.advance.expenses = [];
		data.cargo.expenses = [];
		data.entr.expenses = [];
		data.credit.expenses = [];
		for ( var i = 0; i < results.length; i++) {
			switch (results[i].EType) {
			case "TRVL":
				data.travel.expenses.push(results[i]);
				break;
			case "LODG":
				data.lodging.expenses.push(results[i]);
				break;
			case "BORD":
				data.boarding.expenses.push(results[i]);
				break;
			case "CONV":
				data.conv.expenses.push(results[i]);
				break;
			case "CARG":
				data.cargo.expenses.push(results[i]);
				break;
			case "ENTA":
				data.entr.expenses.push(results[i]);
				break;
			case "OTHC":
				data.other.expenses.push(results[i]);
				break;
			case "ADVC":
				data.advance.expenses.push(results[i]);
				break;
			case "CRED":
				data.credit.expenses.push(results[i]);
				break;
			}
		}
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	setFooter : function() {
		var data = oThis.getView().getModel("travelsettlement").getData();
		// for ( var prop in data) {
		// var panel = oThis.getView().byId("panel" + prop);
		// if (panel) {
		// oThis.calculateFooterValues(panel, data[prop]);
		// }
		// }
		// var advancePanel = oThis.getView().byId("advanceexp").getParent();
		// var panel = oThis.calculateAdvanceFooter(advancePanel, data.advance);
		// oThis.calculateTotalValues();
		for ( var prop in data) {
			switch (prop) {
			case "travel":
				data[prop] = oThis.calculateSubTotals(data[prop]);
				break;
			case "lodging":
				data[prop] = oThis.calculateSubTotals(data[prop]);
				break;
			case "boarding":
				data[prop] = oThis.calculateSubTotals(data[prop]);
				break;
			case "conv":
				data[prop] = oThis.calculateSubTotals(data[prop]);
				break;
			case "entr":
				data[prop] = oThis.calculateSubTotals(data[prop]);
				break;
			case "cargo":
				data[prop] = oThis.calculateSubTotals(data[prop]);
				break;
			case "other":
				data[prop] = oThis.calculateSubTotals(data[prop]);
				break;
			case "advance":
				data[prop] = oThis.calculateSubTotals(data[prop]);
				break;
			case "credit":
				data[prop] = oThis.calculateSubTotals(data[prop]);
				break;
			}
		}
		// data.currtotal = [];
		// var totalvalues = oThis.getView().getModel("totalModel").getData();
		// for(var i=0;i<totalvalues.length;i++){
		// data.currtotal.push({
		// emppaid : totalvalues[i].PaidEmp,
		// advance : totalvalues[i].Advance,
		// receivable : totalvalues[i].PayBack,
		// payable : totalvalues[i].RBEIReim,
		// currency : totalvalues[i].ECurrency,
		// Rate : totalvalues[i].ExchangeRate,
		// Ratecur : totalvalues[i].Currency,
		// Total : totalvalues[i].Total,
		// Tocur : totalvalues[i].TotalCurrency
		// });
		//			
		//			
		// }
		// oThis.getView().getModel("travelsettlement").setData(data);
		oThis.calculateTotalValues();
		data = oThis.getView().getModel("travelsettlement").getData();
		var totalvalues = oThis.getView().getModel("totalModel").getData();
		for ( var i = 0; i < totalvalues.length; i++) {
			if (i < data.currtotal.length) {
				data.currtotal[i].Rate = totalvalues[i].ExchangeRate;
				data.currtotal[i].Ratecur = totalvalues[i].Currency;
				// data.currtotal[i].Total = totalvalues[i].Total;
				data.currtotal[i].Tocur = totalvalues[i].TotalCurrency;
				data.currtotal[i].Total = (data.currtotal[i].advance - data.currtotal[i].emppaid);
				if (data.currtotal[i].Total < 0) {
					data.currtotal[i].Total = data.currtotal[i].Total * -1;
				}
				data.currtotal[i].Total = data.currtotal[i].Total * data.currtotal[i].Rate;
			}
		}
		oThis.getView().getModel("travelsettlement").setData(data);
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
					totalcmp = totalcmp + oThis.formatAmountValue(expenses[j].Pacmp);
					// totalapp = totalapp +
					// oThis.formatAmountValue(expenses[j].Apamt);
					flag = true;
				}
			}
			if (flag) {
				if (totalemp != 0 || totalcmp != 0) {
					exptype.footer.push({
						Paemp : totalemp,
						Pacmp : totalcmp,
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
	onAddReplace:function(){
		var currency = this.getView().byId("ipAddCurrency").getValue();
		if (currency != "") {
			var travelexp = this.getView().byId("travelexp");
			var items = travelexp.getSelectedItems();
			var data = oThis.getView().getModel("travelsettlement").getData();
			var checkSelectedItems = false;
			if (items.length != 0) {
				for ( var i = 0; i < items.length; i++) {
					var index = travelexp.indexOfItem(items[i]);
					data.travel.expenses[index].Apcur = currency;
				}
				data.travel = this.calculateSubTotals(data.travel);
				checkSelectedItems = true;
			}
			// Boarding
			table = this.getView().byId("boardexp");
			items = table.getSelectedItems();
			if (items.length != 0) {
				for ( var i = 0; i < items.length; i++) {
					var index = table.indexOfItem(items[i]);
					data.boarding.expenses[index].Apcur = currency;
				}
				data.boarding = this.calculateSubTotals(data.boarding);
				checkSelectedItems = true;
			}
			// Lodging
			table = this.getView().byId("lodgingexp");
			items = table.getSelectedItems();
			if (items.length != 0) {
				for ( var i = 0; i < items.length; i++) {
					var index = table.indexOfItem(items[i]);
					data.lodging.expenses[index].Apcur = currency;
				}
				data.lodging = this.calculateSubTotals(data.lodging);
				checkSelectedItems = true;
			}
			// Conveyance
			table = this.getView().byId("convexp");
			items = table.getSelectedItems();
			if (items.length != 0) {
				for ( var i = 0; i < items.length; i++) {
					var index = table.indexOfItem(items[i]);
					data.conv.expenses[index].Apcur = currency;
				}
				data.conv = this.calculateSubTotals(data.conv);
				checkSelectedItems = true;
			}
			// Other
			table = this.getView().byId("otherexp");
			items = table.getSelectedItems();
			if (items.length != 0) {
				for ( var i = 0; i < items.length; i++) {
					var index = table.indexOfItem(items[i]);
					data.other.expenses[index].Apcur = currency;
				}
				data.other = this.calculateSubTotals(data.other);
				checkSelectedItems = true;
			}
			// Entertainment
			table = this.getView().byId("entrexp");
			items = table.getSelectedItems();
			if (items.length != 0) {
				for ( var i = 0; i < items.length; i++) {
					var index = table.indexOfItem(items[i]);
					data.entr.expenses[index].Apcur = currency;
				}
				data.entr = this.calculateSubTotals(data.entr);
				checkSelectedItems = true;
			}
			// Cargo
			table = this.getView().byId("cargoexp");
			items = table.getSelectedItems();
			if (items.length != 0) {
				for ( var i = 0; i < items.length; i++) {
					var index = table.indexOfItem(items[i]);
					data.cargo.expenses[index].Apcur = currency;
				}
				data.cargo = this.calculateSubTotals(data.cargo);
				checkSelectedItems = true;
			}
			if (!(checkSelectedItems)) {
				sap.m.MessageToast.show("Please select atleast one row from a expense;")
			} else {
				oThis.getView().getModel("travelsettlement").setData(data);
				oThis.calculateTotalValues();
			}
		} else {
			this.getView().byId("ipAddCurrency").setValueState("Error");
			sap.m.MessageToast.show("Please enter approved currency")
		}
	},
	onModeChange : function(evt) {
		var key = evt.getParameter("selectedItem").getKey();
		var table = evt.oSource.getParent().getParent();
		var tableItem = evt.oSource.getParent();
		var index = table.indexOfItem(tableItem);
		var data = oThis.getView().getModel("travelsettlement").getData();
		data.travel.expenses[index].Trvlr = key;
		oThis.getView().getModel("travelsettlement").setData(data);
		oThis.getView().getModel("travelsettlement").refresh(true);
	},
	onTransportChange : function(evt) {
		// var key = evt.getParameter("selectedItem").getKey();
		var key = evt.getParameter("selectedItem") ? evt.getParameter("selectedItem").getKey() : evt.getParameter("newValue");
		var valid = this.checkValidValue(this.getView().getModel("modeModel").getData().typeMode, "DOMVALUE_L", key);
		if (!valid) {
			key = "";
			evt.oSource.setValue("");
			evt.oSource.setSelectedKey("");
		}
		// var table = evt.oSource.getParent().getParent();
		// var tableItem = evt.oSource.getParent();
		// var index = table.indexOfItem(tableItem);
		// var data = oThis.getView().getModel("travelsettlement").getData();
		// data.travel.expenses[index].Modet = key;
		// oThis.getView().getModel("travelsettlement").setData(data);
		// oThis.getView().getModel("travelsettlement").refresh(true);
	},
	onConvModeChange : function(evt) {
		var key = evt.getParameter("selectedItem") ? evt.getParameter("selectedItem").getKey() : evt.getParameter("newValue");
		var valid = false;
		var items = evt.getSource().getItems();
		for ( var i = 0; i < items.length; i++) {
			if (items[i].getKey() == key) {
				valid = true;
			}
		}
		if (!valid) {
			key = "";
			evt.oSource.setValue("");
			evt.oSource.setSelectedKey("");
		}
	},
	onAdd : function(evt) {
		var bid = evt.oSource.getId();
		var id = bid.split("--");
		var data = oThis.getView().getModel("travelsettlement").getData();
		var parent = evt.oSource.getParent().getParent();
		var currency = data.traveldetails.DefaultCurr;
		switch (id[1]) {
		case "travelAdd":
			data.travel.expenses.push({
				Waers : currency,
				Trvlr : "00"
			});
			// data.travel = oThis.calculateSubTotal(data.travel);
			break;
		case "lodgeAdd":
			data.lodging.expenses.push({
				Waers : currency
			});
			break;
		case "boardAdd":
			data.boarding.expenses.push({
				Waers : currency
			});
			// data.boarding =
			// oThis.calculateNumberofDays(data.traveldetails.StartDate,
			// data.traveldetails.EndDate, data.boarding,
			// data.boarding.expenses.length-1);
			break;
		case "convAdd":
			
			//dye5kor
			
			if(oThis.getView().getModel("travelsettlement").getData().conv.expenses.length==11){
				var dialog = new sap.m.Dialog({
					title: 'Message',
					type: 'Message',
						content: new sap.m.Text({
							text: 'You may please update summary of all conveyance expenses of this travel in one line item and detailed line items updated in an excel sheet can be attached along with bills to Travel Claim Box'
						}),beginButton: new sap.m.Button({
							text: 'OK',
							press: function () {
								dialog.close();
							
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}  })
				dialog.open();
				
				
			}else{
				
				data.conv.expenses.push({
					Waers : currency,
					Entkm : 0
				});
			}
			
			//dye5kor
			
			
			
			
			break;
		case "otherAdd":
				
			//dye5kor
			
			if(oThis.getView().getModel("travelsettlement").getData().other.expenses.length==11){
				var dialog = new sap.m.Dialog({
					title: 'Message',
					type: 'Message',
						content: new sap.m.Text({
							text: 'You may please update summary of all others expenses of this travel in one line item and detailed line items updated in an excel sheet can be attached along with bills to Travel Claim Box'
						}),beginButton: new sap.m.Button({
							text: 'OK',
							press: function () {
								dialog.close();
							
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}  })
				dialog.open();
				
				
			}else{
				
				data.other.expenses.push({
					Waers : currency
				});
			}
			
			//dye5kor
			
			break;
		case "entrAdd":
			data.entr.expenses.push({
				Waers : currency
			});
			break;
		case "cargoAdd":
			data.cargo.expenses.push({
				Waers : currency
			});
			break;
		case "costAdd":
			data.accass.push({});
			break;
		case "advanceAdd":
			data.advance.expenses.push({
				Waers : currency,
				Rmrks : "Advance/Allowance received"
			});
			break;
		case "creditAdd":
			data.credit.expenses.push({
				Waers : currency
			});
			break;
		}
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	onCalculate1 : function(evt) {
		// var source = evt.slice();
		//var parseValue = evt.getSource().getValue().split(',').join('');
		if (evt.getSource().getBindingInfo("value").type && (isNaN(parseFloat(evt.getSource().getValue())) || evt.getSource().getValue() == "")) {
			if (evt.getSource().getValue() == "") {
				evt.getSource().setValue(0);
				evt.getSource().fireChange();
			} else {
				oThis.getView().getModel("travelsettlement").refresh(true);
			}
		} else {
			oThis.getView().getContent()[0].setBusy(true);
			// jQuery.sap.delayedCall(100, oThis, function () {
			// oThis.onCalculateSubtotal1(source);
			// });
			var bid = evt.getSource().getParent().getParent().getId();
			var panel = evt.getSource().getParent().getParent().getParent();
			var table = evt.getSource().getParent().getParent();
			var index = table.indexOfItem(evt.getSource().getParent());
			var id = bid.split("--");
			var data = oThis.getView().getModel("travelsettlement").getData();
			switch (id[1]) {
			case "travelexp":
				data.travel.expenses[index].Apamt = data.travel.expenses[index].Paemp;
				data.travel.expenses[index].Apcur = data.travel.expenses[index].Waers;
				data.travel = oThis.calculateSubTotals(data.travel);
				// data.travel =
				// oThis.onSubtotalCalculateChange(data.travel.expenses[index].Wears,data.travel);
				break;
			case "lodgingexp":
				data.lodging.expenses[index].Apamt = data.lodging.expenses[index].Paemp;
				data.lodging.expenses[index].Apcur = data.lodging.expenses[index].Waers;
				data.lodging = oThis.calculateSubTotals(data.lodging);
				break;
			case "boardexp":
				data.boarding.expenses[index].Apamt = data.boarding.expenses[index].Paemp;
				data.boarding.expenses[index].Apcur = data.boarding.expenses[index].Waers;
				data.boarding = oThis.calculateSubTotals(data.boarding);
				break;
			case "convexp":
				data.conv.expenses[index].Apamt = data.conv.expenses[index].Paemp;
				data.conv.expenses[index].Apcur = data.conv.expenses[index].Waers;
				data.conv = oThis.calculateSubTotals(data.conv);
				break;
			case "otherexp":
				data.other.expenses[index].Apamt = data.other.expenses[index].Paemp;
				data.other.expenses[index].Apcur = data.other.expenses[index].Waers;
				data.other = oThis.calculateSubTotals(data.other);
				break;
			case "entrexp":
				data.entr.expenses[index].Apamt = data.entr.expenses[index].Paemp;
				data.entr.expenses[index].Apcur = data.entr.expenses[index].Waers;
				data.entr = oThis.calculateSubTotals(data.entr);
				break;
			case "cargoexp":
				data.cargo.expenses[index].Apamt = data.cargo.expenses[index].Paemp;
				data.cargo.expenses[index].Apcur = data.cargo.expenses[index].Waers;
				data.cargo = oThis.calculateSubTotals(data.cargo);
				break;
			case "advanceexp":
				// data.advance.expenses[index].Apamt =
				// data.advance.expenses[index].Pacmp;
				// data.advance.expenses[index].Apcur =
				// data.advance.expenses[index].Waers;
				data.advance = oThis.calculateSubTotals(data.advance);
				break;
			case "creditexp":
				// data.advance.expenses[index].Apamt =
				// data.advance.expenses[index].Pacmp;
				// data.advance.expenses[index].Apcur =
				// data.advance.expenses[index].Waers;
				data.credit = oThis.calculateSubTotals(data.credit);
				break;
			}
			oThis.getView().getModel("travelsettlement").setData(data);
			// oThis.getView().getModel("travelsettlement").refresh(true);
			oThis.calculateTotalValues();
			// var bindItems =
			// oThis.getView().byId("totalexp").getBinding("items");
			//		
			// bindItems.sort(new sap.ui.model.Sorter("currency", false));
		}
	},
	onCalculateAdvance : function(evt) {
		oThis.getView().getContent()[0].setBusy(true);
		var bid = evt.getSource().getParent().getParent().getId();
		var panel = evt.getSource().getParent().getParent().getParent();
		var table = evt.getSource().getParent().getParent();
		var index = table.indexOfItem(evt.getSource().getParent());
		var id = bid.split("--");
		var data = oThis.getView().getModel("travelsettlement").getData();
		switch (id[1]) {
		case "travelexp":
			data.travel = oThis.calculateSubTotals(data.travel);
			// data.travel =
			// oThis.onSubtotalCalculateChange(data.travel.expenses[index].Wears,data.travel);
			break;
		case "lodgingexp":
			data.lodging = oThis.calculateSubTotals(data.lodging);
			break;
		case "boardexp":
			data.boarding = oThis.calculateSubTotals(data.boarding);
			break;
		case "convexp":
			data.conv = oThis.calculateSubTotals(data.conv);
			break;
		case "otherexp":
			data.other = oThis.calculateSubTotals(data.other);
			break;
		case "entrexp":
			data.entr = oThis.calculateSubTotals(data.entr);
			break;
		case "cargoexp":
			data.cargo = oThis.calculateSubTotals(data.cargo);
			break;
		case "advanceexp":
			// oThis.calculateFooterValues(panel, data.advance);
			data.advance = oThis.calculateSubTotals(data.advance);
			break;
		}
		oThis.getView().getModel("travelsettlement").setData(data);
		oThis.getView().getModel("travelsettlement").refresh(true);
		oThis.calculateTotalValues();
	},
	calculateTotalValues : function() {
		var totalData = [];
		var totalemp, advance, totalamt, totalcmp;
		var flag;
		// var oControls = controls;
		var result = [];
		var currencyList = [];
		var apcurrencyList = [];
		var data = oThis.getView().getModel("travelsettlement").getData();
		data.currtotal = [];
		var amtData = [];
		for ( var prop in data) {
			if (prop != "advance" && prop != "credit") {
				var content = data[prop];
				if (content.footer) {
					for ( var j = 0; j < content.apfooter.length; j++) {
						amtData.push({
							Paemp : content.apfooter[j].Apamt,
							Apamt : 0,
							Apcur : content.apfooter[j].Apcur
						});
						// }
					}
				}
			} else if (prop == "advance") {
				var content = data[prop];
				for ( var i = 0; i < content.footer.length; i++) {
					amtData.push({
						Apcur : content.footer[i].Waers,
						Paemp : 0,
						Apamt : content.footer[i].Pacmp,
					});
				}
			}
		}
		result = amtData;
		// for ( var i = 0; i < result.length; i++) {
		// if (currencyList.indexOf(result[i].Waers) == -1)
		// currencyList.push(result[i].Waers);
		// }
		for ( var i = 0; i < result.length; i++) {
			if (result[i].Apcur != undefined) {
				if (apcurrencyList.indexOf(result[i].Apcur) == -1)
					apcurrencyList.push(result[i].Apcur);
			}
		}
		// Approved Amount,Approved Currency
		for ( var i = 0; i < apcurrencyList.length; i++) {
			var oCurrency = apcurrencyList[i];
			totalemp = 0;
			totalcmp = 0;
			totalamt = 0;
			flag = false;
			for ( var j = 0; j < result.length; j++) {
				if (result[j].Apcur != "") {
					var scurrency = result[j].Apcur;
					if (scurrency == oCurrency) {
						totalamt = totalamt + oThis.formatAmountValue(result[j].Apamt);
						totalemp = totalemp + oThis.formatAmountValue(result[j].Paemp);
						flag = true;
					}
				}
			}
			if (flag) {
				if (totalamt != 0 || totalemp != 0) {
					data.currtotal.push({
						emppaid : totalemp,
						advance : totalamt,
						receivable : (totalamt - totalemp) > 0 ? (totalamt - totalemp) : 0,
						Rate : 1,
						Ratecur : oCurrency,
						currency : oCurrency,
						payable : (totalamt - totalemp) < 0 ? (totalamt - totalemp) : 0,
						Total : (totalamt - totalemp) * 1,
						Tocur : oCurrency
					});
				}
			}
		}
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		var global = sap.ui.getCore().getModel("global").getData();
		for ( var i = 0; i < data.currtotal.length; i++) {
			var value = data.currtotal[i].advance - data.currtotal[i].emppaid;
			if (value < 0) {
				value = value * -1;
				data.currtotal[i].payable = value;
			} else {
				data.currtotal[i].receivable = value;
			}
			data.currtotal[i].Total = data.currtotal[i].Rate * value;
			data.currtotal[i].Tocur = data.currtotal[i].Ratecur;
			if (role == "TRST") {
				if (global.whichtab == "APP" && global.parentKey == "DOME") {
					if (data.currtotal[i].payable != 0) {
						data.fieldproperties.clvisible = true;
						data.fieldproperties.inrreceivable = false;
					} else if (data.currtotal[i].receivable != 0) {
						data.fieldproperties.inrreceivable = true;
						data.fieldproperties.clvisible = false;
					} else {
						data.fieldproperties.clvisible = true;
						data.fieldproperties.inrreceivable = false;
					}
				}
			}
		}
		oThis.getView().getModel("travelsettlement").setData(data);
		var bindItems = oThis.getView().byId("totalexp").getBinding("items");
		bindItems.sort(new sap.ui.model.Sorter("currency", false));
		oThis.getView().getContent()[0].setBusy(false);
	},
	onDownload : function() {
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		if(role !="TRST"){
			oThis.displayPopUpMessage();
		}else{
			oThis.downloadPdf();
		}
	},
	displayPopUpMessage:function(){
		var odata;
		odata = {			
			Selpar :oThis.getView().getModel("travelsettlement").getData().traveldetails.TravelType			
		};
		
		if(oThis.getView().getModel("travelsettlement").getData().traveldetails.ToCountry == "IN"){
			odata["Constant"] = "TRST_PDF_MSG_"+"DOME";
		}else{
			odata["Constant"] = "TRST_PDF_MSG_"+"INTL";
		}
		oComponent.getModel().callFunction("GetTrstPdfMsg", "GET", odata, null, function(oData, response) {
			var content = oData.GetTrstPdfMsg.Message;
			var html = new sap.ui.core.HTML({
				content : content
			});
			var dialog = new sap.m.Dialog({
				title : 'Information',
				type : 'Message',
				content : html,
				beginButton : new sap.m.Button({
					text : 'OK',
					press : function() {
						dialog.close();
						oThis.downloadPdf();
					}
				}),
				afterClose : function() {
					dialog.destroy();
				}
			});
			dialog.open();	
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, VisaPlanThis);
			
		}, true);
	},
	downloadPdf : function() {
		var fileUrl;
		var data = oThis.getView().getModel("travelsettlement").getData().traveldetails;
		var travelplan = data.TravelPlan;
		var empno = data.EmpNo;
		var traveltype = data.TravelType;
		var version = data.Version;
		// var version = 2;
		var item = data.Item.trim();
		if (window.location.hostname == "localhost")
			fileUrl = "proxy/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='TRST',Version='" + version + "',Item='" + item + "')/$value";
		else
			fileUrl = "/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/TrstPdfSet(EmpNo='" + empno + "',TrNo='" + travelplan + "',TrvKey='" + traveltype + "',Module='TRST',Version='" + version + "',Item='" + item + "')/$value";
		window.open(fileUrl, "_blank");
	},
	// onSubtotalCalculateChange:function(exptype,currency){
	// var subtotal = exptype.footer;
	// var footerIndex=-1;
	// var totalemp,totalcmp = 0;
	//		
	// for(var i=0;i<subtotal.length;i++){
	// if(exptype.footer[i].Waers==currency){
	// footerIndex = i;
	// break;
	//
	// }
	// }
	// //
	// for(var i=0;i<exptype.expenses.length;i++){
	// if(exptype.expenses[i].Waers==currency){
	// totalemp = totalemp + oThis.formatAmountValue(exptype.expenses[i].Paemp);
	// totalcmp = totalcmp + oThis.formatAmountValue(exptype.expenses[i].Pacmp);
	//	                
	// }
	//	
	// }
	// if(footerIndex!=-1)
	// {
	// exptype.footer[footerIndex].Paemp = totalemp;
	// exptype.footer[footerIndex].Pacmp = totalcmp;
	// }
	// else{
	// exptype.footer.push({Paemp:totalemp,Pacmp:totalcmp,Waers:currency})
	// }
	// return exptype;
	// },
	// onTotalCalculateChange:function(currency){
	// var subtotal = data.currtotal;
	// var footerIndex=-1;
	// var totalemp,totalcmp = 0;
	//	
	// for(var i=0;i< data.currtotal.length;i++){
	// if( data.currtotal.currency==currency){
	// footerIndex = i;
	// break;
	// }
	// }
	//	
	// for(var i=0;i<exptype.footer.length;i++){
	// if(exptype.footer[i].Waers==currency){
	// totalemp = totalemp + oThis.formatAmountValue(exptype.footer[i].emppaid);
	//
	//                
	// }
	// }
	// if(footerIndex!=-1)
	// {
	// data.currtotal[footerIndex].emppaid = totalemp;
	// data.currtotal[footerIndex].advance = advance;
	// }
	// else{
	// data.currtotal.push({empaid:totalemp,advance:totalcmp,currency:currency,})
	// }
	//    
	// },
	onTotalCal : function(evt) {
		var data = oThis.getView().getModel("travelsettlement").getData();
		var parent = evt.oSource.getParent().getParent();
		var index = parent.indexOfItem(evt.oSource.getParent());
		var bindItems = parent.getBinding("items").aIndices;
		var actualIndex = bindItems[index];
		if (data.currtotal[actualIndex].payable != 0) {
			data.currtotal[actualIndex].Total = data.currtotal[actualIndex].payable * data.currtotal[actualIndex].Rate;
		} else if (data.currtotal[actualIndex].receivable != 0) {
			data.currtotal[actualIndex].Total = data.currtotal[actualIndex].receivable * data.currtotal[actualIndex].Rate;
		} else {
			data.currtotal[actualIndex].Total = 0;
		}
		data.currtotal[actualIndex].Tocur = data.currtotal[actualIndex].Ratecur;
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	setAmountValues : function(panel, exptype) {
		var delflag = false;
		var expcontent = panel.getContent();
		for ( var i = expcontent.length - 1; i >= 1; i--) {
			var scurrency = expcontent[i].getContent()[2].getText();
			var totalemp = 0;
			var totalcmp = 0;
			for ( var j = 0; j < exptype.expenses.length; j++) {
				if (exptype.expenses[j].Waers == scurrency) {
					// var scurrency = expcontent[i].getContent()[4].getText();
					var semppaid = exptype.expenses[j].Paemp;
					var scompaid = exptype.expenses[j].Pacmp;
					totalemp = totalemp + oThis.formatAmountValue(semppaid);
					totalcmp = totalcmp + oThis.formatAmountValue(scompaid);
					expcontent[i].getContent()[3].setText(totalemp);
					expcontent[i].getContent()[4].setText(totalcmp);
					delflag = true;
				}
			}
			if (!(delflag)) {
				panel.removeContent(i);
			}
			delflag = false;
		}
	},
	formatAmountValue : function(value) {
		if (isNaN(parseFloat(value)))
			return 0.00;
		else
			return parseFloat(parseFloat(value).toFixed(2));
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
			case "travelDel":
				data.travel.expenses = oThis.deleteRows(parent, index, data.travel.expenses);
				data.travel = oThis.calculateSubTotals(data.travel);
				// oThis.setAmountValues(evt.oSource.getParent().getParent().getParent(),
				// data.travel);
				break;
			case "lodgeDel":
				data.lodging.expenses = oThis.deleteRows(parent, index, data.lodging.expenses);
				data.lodging = oThis.calculateSubTotals(data.lodging);
				// oThis.setAmountValues(evt.oSource.getParent().getParent().getParent(),
				// data.lodging);
				break;
			case "boardDel":
				data.boarding.expenses = oThis.deleteRows(parent, index, data.boarding.expenses);
				data.boarding = oThis.calculateSubTotals(data.boarding);
				// oThis.setAmountValues(evt.oSource.getParent().getParent().getParent(),
				// data.boarding);
				break;
			case "convDel":
				data.conv.expenses = oThis.deleteRows(parent, index, data.conv.expenses);
				data.conv = oThis.calculateSubTotals(data.conv);
				// oThis.setAmountValues(evt.oSource.getParent().getParent().getParent(),
				// data.conv);
				break;
			case "otherDel":
				data.other.expenses = oThis.deleteRows(parent, index, data.other.expenses);
				data.other = oThis.calculateSubTotals(data.other);
				// oThis.setAmountValues(evt.oSource.getParent().getParent().getParent(),
				// data.other);
				break;
			case "entrDel":
				data.entr.expenses = oThis.deleteRows(parent, index, data.entr.expenses);
				data.entr = oThis.calculateSubTotals(data.entr);
				// oThis.setAmountValues(evt.oSource.getParent().getParent().getParent(),
				// data.entr);
				break;
			case "cargoDel":
				data.cargo.expenses = oThis.deleteRows(parent, index, data.cargo.expenses);
				data.cargo = oThis.calculateSubTotals(data.cargo);
				// oThis.setAmountValues(evt.oSource.getParent().getParent().getParent(),
				// data.cargo);
				break;
			case "costDel":
				data.accass = oThis.deleteRows(parent, index, data.accass);
				// parent.setVisibleRowCount(data.accass.length);
				break;
			case "advanceDel":
				data.advance.expenses = oThis.deleteRows(parent, index, data.advance.expenses);
				data.advance = oThis.calculateSubTotals(data.advance);
				// oThis.calculateAdvanceFooter(evt.oSource.getParent().getParent().getParent(),
				// data.advance);
				// parent.setVisibleRowCount(data.advance.length);
				break;
			case "creditDel":
				data.credit.expenses = oThis.deleteRows(parent, index, data.credit.expenses);
				data.credit = oThis.calculateSubTotals(data.credit);
				// oThis.calculateAdvanceFooter(evt.oSource.getParent().getParent().getParent(),
				// data.advance);
				// parent.setVisibleRowCount(data.advance.length);
				break;
			}
		}
		oThis.getView().getModel("travelsettlement").setData(data);
		// oThis.getView().getModel("travelsettlement").refresh(true);
		oThis.calculateTotalValues();
	},
	deleteRows : function(table, index, expense) {
		for ( var i = index.length - 1; i >= 0; i--) {
			var tableIndex = table.indexOfItem(index[i]);
			if (expense[tableIndex].Flag != "X") {
				expense.splice(tableIndex, 1);
			}
		}
		return expense;
	},
	onFileUpload : function(evt) {
		var file = evt.getParameters("files").files[0];
		var oData = evt.oSource.getParent().getModel("travelsettlement").getData();
		var sModule = "TRS";
		// oThis.getView().byId("UploadCollection").aItems=[];
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
		sDocType = "TRS";
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
	checkExistingArray : function(aArray, sColumn, sValue) {
		try {
			for ( var i = 0; i < aArray.length; i++) {
				if (aArray[i][sColumn] == sValue) {
					return true;
				}
			}
		} catch (ex) {
			return false;
		}
		return false;
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
			//oThis.saveDetails("11", "14", "CLS");
			var global = sap.ui.getCore().getModel("global").getData();
			if(global.parentKey == "INTL" && global.whichtab == "APP"){
				var txClsFlg = oThis.setCloseButtonVisible();
				if(txClsFlg){
					oThis.saveDetails("11", "30", "CLS");
				}else{
					oThis.saveDetails("11", "28", "CLS");
				}
			}else{
			oThis.saveDetails("11", "28", "CLS");
			}
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
	onSendBackChanges : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
		jQuery.sap.delayedCall(500, oThis, function() {
			oThis.saveDetails("11", "26", "SEBC");
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
			// var commentarea = oThis.getView().byId("comments");
			var comments = oThis.getView().byId("comments").getValue();
			// var commentdata;
			// if(!(commentarea.data("comments"))){
			//			
			// commentarea.data("comments",'');
			// commentdata = commentarea.data("comments");
			// }
			// else
			// commentdata = commentarea.data("comments");
			//			
			//		
			// if(commentdata == comments)
			// {
			// comments = undefined;
			// }
			// else{
			// commentdata = commentarea.data("comments");
			// }
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
					case "travel":
						oData.TrvStDetailsSet = oThis.appendRows(data[prop], data.traveldetails, oData.TrvStDetailsSet, "TRVL", btype, prop);
						break;
					case "lodging":
						oData.TrvStDetailsSet = oThis.appendRows(data[prop], data.traveldetails, oData.TrvStDetailsSet, "LODG", btype, prop);
						break;
					case "boarding":
						oData.TrvStDetailsSet = oThis.appendRows(data[prop], data.traveldetails, oData.TrvStDetailsSet, "BORD", btype, prop);
						break;
					case "conv":
						oData.TrvStDetailsSet = oThis.appendRows(data[prop], data.traveldetails, oData.TrvStDetailsSet, "CONV", btype, prop);
						break;
					case "entr":
						oData.TrvStDetailsSet = oThis.appendRows(data[prop], data.traveldetails, oData.TrvStDetailsSet, "ENTA", btype, prop);
						break;
					case "cargo":
						oData.TrvStDetailsSet = oThis.appendRows(data[prop], data.traveldetails, oData.TrvStDetailsSet, "CARG", btype, prop);
						break;
					case "other":
						oData.TrvStDetailsSet = oThis.appendRows(data[prop], data.traveldetails, oData.TrvStDetailsSet, "OTHC", btype, prop);
						break;
					case "advance":
						oData.TrvStDetailsSet = oThis.appendRows(data[prop], data.traveldetails, oData.TrvStDetailsSet, "ADVC", btype, prop);
						break;
					case "credit":
						oData.TrvStDetailsSet = oThis.appendRows(data[prop], data.traveldetails, oData.TrvStDetailsSet, "CRED", btype, prop);
						break;
					}
				}
				// if(loginrole=="TRST"){
				oData.TrvStTotalSet = [];
				for ( var i = 0; i < data.currtotal.length; i++) {
					if (loginrole == "EMP") {
						data.currtotal[i].Ratecur = data.currtotal[i].currency;
						data.currtotal[i].Rate = 1;
					}
					oData.TrvStTotalSet.push({
						TravelPlan : data.traveldetails.TravelPlan,
						TravelType : data.traveldetails.TravelType,
						Module : data.traveldetails.Module,
						Item : data.traveldetails.Item,
						EmpNo : data.traveldetails.EmpNo,
						Version : "",
						LoginRole : "",
						Seqno : (i + 1),
						ExchangeRate : data.currtotal[i].Rate,
						Currency : data.currtotal[i].Ratecur,
						Total : data.currtotal[i].Total,
						TotalCurrency : data.currtotal[i].Tocur,
						Advance : data.currtotal[i].advance,
						PaidEmp : data.currtotal[i].emppaid,
						RBEIReim : data.currtotal[i].payable,
						PayBack : data.currtotal[i].receivable,
						ECurrency : data.currtotal[i].currency,
					});
					// }
				}
				// }
				if (oData.TrvStTotalSet.length == 0) {
					oData.TrvStTotalSet.push({});
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
				if (exc == "Distance") {
					sap.m.MessageToast.show("Please enter Distance in Conveyance Expense");
					oThis.getView().byId("convexp").focus();
				}
				if (exc == "Dates" || exc == "Currency" || exc == "Valid Currency" || exc == "Arrival Date" ||
					exc == "Departure Date") {
					oThis.setFocus(property, exc);
				}
			}
		}
	},
	setFocus : function(property, exc) {
		switch (property) {
		case "travel":
			if (exc == "Currency") {
				sap.m.MessageToast.show("Please enter currency in Travel Expense");
			} else if (exc == "Valid Currency") {
				sap.m.MessageToast.show("Please enter valid currency in Travel Expense");
			}else if (exc == "Arrival Date") {
				sap.m.MessageToast.show("Please enter Arrival Date in Travel Expense");
			}else if(exc == "Departure Date"){
				sap.m.MessageToast.show("Please enter Departure Date in Travel Expense");
			}
			else{
				sap.m.MessageToast.show("Please enter Dates in Travel Expense");
			}
			    oThis.getView().byId("travelexp").focus();
			break;
		case "lodging":
			if (exc == "Currency") {
				sap.m.MessageToast.show("Please enter currency in Lodging Expense");
			} else if (exc == "Valid Currency") {
				sap.m.MessageToast.show("Please enter valid currency in Lodging Expense");
			} else
				sap.m.MessageToast.show("Please enter Dates in Lodging Expense");
			oThis.getView().byId("lodgingexp").focus();
			break;
		case "boarding":
			if (exc == "Currency") {
				sap.m.MessageToast.show("Please enter currency in Boarding Expense");
			} else if (exc == "Valid Currency") {
				sap.m.MessageToast.show("Please enter valid currency in Boarding Expense");
			} else
				sap.m.MessageToast.show("Please enter Dates in Boarding Expense");
			oThis.getView().byId("boardexp").focus();
			break;
		case "conv":
			if (exc == "Currency") {
				sap.m.MessageToast.show("Please enter currency in Conveyance Expense");
			} else if (exc == "Valid Currency") {
				sap.m.MessageToast.show("Please enter valid currency in Conveyance Expense");
			} else
				sap.m.MessageToast.show("Please enter Dates in Conveyance Expense");
			oThis.getView().byId("convexp").focus();
			break;
		case "entr":
			if (exc == "Currency") {
				sap.m.MessageToast.show("Please enter currency in Entertainment Expense");
			} else if (exc == "Valid Currency") {
				sap.m.MessageToast.show("Please enter valid currency in Entertainment Expense");
			} else
				sap.m.MessageToast.show("Please enter Dates in Entertainment Expense");
			oThis.getView().byId("entrexp").focus();
			break;
		case "cargo":
			if (exc == "Currency") {
				sap.m.MessageToast.show("Please enter currency in Cargo Expense");
			} else if (exc == "Valid Currency") {
				sap.m.MessageToast.show("Please enter valid currency in Cargo Expense");
			} else
				sap.m.MessageToast.show("Please enter Dates in Cargo Expense");
			oThis.getView().byId("cargoexp").focus();
			break;
		case "other":
			if (exc == "Currency") {
				sap.m.MessageToast.show("Please enter currency in Other Expense");
			} else if (exc == "Valid Currency") {
				sap.m.MessageToast.show("Please enter valid currency in Other Expense");
			} else
				sap.m.MessageToast.show("Please enter Dates in Other Expense");
			oThis.getView().byId("otherexp").focus();
			break;
		case "advance":
			if (exc == "Currency") {
				sap.m.MessageToast.show("Please enter currency in Advance");
			} else if (exc == "Valid Currency") {
				sap.m.MessageToast.show("Please enter valid currency in Advance Expense");
			}
			oThis.getView().byId("advanceexp").focus();
			break;
		}
	},
	appendRows : function(exptype, traveldetails, trvdetset, etype, btype, prop) {
		var flag = false;
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		for ( var i = 0; i < exptype.expenses.length; i++) {
           if (exptype.expenses[i].Apcur != "" && exptype.expenses[i].Apcur != undefined) {
				
				var valid = this.checkValidValue(this.getView().getModel("curModel").getData(), "FIELD1", exptype.expenses[i].Apcur);
				if (!valid) {
					throw "Valid Currency";
				}
			}
           
			if ((exptype.expenses[i].Apamt != 0 && exptype.expenses[i].Apamt != undefined)&& exptype.expenses[i].Apcur == "") {
				throw "Currency";
			}			

		    if (prop == "conv" && (exptype.expenses[i].Cmode != "" && exptype.expenses[i].Cmode != undefined) && (exptype.expenses[i].Entkm == "" || parseFloat(exptype.expenses[i].Entkm) == 0)) {
				throw "Distance";
			}
		    if(prop=="travel"){
		    	if(btype == "SUB" && (exptype.expenses[i].Endda == "" ||!(exptype.expenses[i].Endda)))
		    	throw "Arrival Date";
		    	if(btype == "SUB" && (exptype.expenses[i].Begda == "" ||!(exptype.expenses[i].Begda)))
		    		throw "Departure Date";
		    }
			//else{
			trvdetset.push({
				TravelPlan : traveldetails.TravelPlan,
				TravelType : traveldetails.TravelType,
				EmpNo : traveldetails.EmpNo,
				EType : etype,
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
//	}
		return trvdetset;
	},
	checkValidValue : function(data, property, value) {
		// var data = this.getView().getModel("modeModel").getData().typeMode;
		for ( var i = 0; i < data.length; i++) {
			if (data[i][property] == value) {
				return true;
			}
		}
		return false;
	},
	checkDates : function(entrdate) {
		var data = oThis.getView().getModel("travelsettlement").getData();
		var startdate = data.traveldetails.StartDate;
		var enddate = data.traveldetails.EndDate;
		if (entrdate != "") {
			var entryear = entrdate.substring(0, 4);
			var entrmonth = entrdate.substring(4, 6);
			var entrdate = entrdate.substring(6, 8);
			var aentrdate = oThis.convertToDate(entryear, entrmonth, entrdate);
			var syear = startdate.substring(0, 4);
			var smonth = startdate.substring(4, 6);
			var sdate = startdate.substring(6, 8);
			var astartdate = oThis.convertToDate(syear, smonth, sdate);
			var eyear = enddate.substring(0, 4);
			var emonth = enddate.substring(4, 6);
			var edate = enddate.substring(6, 8);
			var aenddate = oThis.convertToDate(eyear, emonth, edate);
			if (aentrdate >= astartdate) {
				if (aentrdate <= aenddate) {
					return false;
				} else {
					return "Please enter date below End date";
				}
			} else {
				return "Please enter date above Start date";
			}
		}
	},
	checkValidStartEndDate : function(startdate, enddate) {
		if ((startdate != "" && enddate != "") && (startdate != undefined && enddate != undefined)) {
			var syear = startdate.substring(0, 4);
			var smonth = startdate.substring(4, 6);
			var sdate = startdate.substring(6, 8);
			var astartdate = oThis.convertToDate(syear, smonth, sdate);
			var eyear = enddate.substring(0, 4);
			var emonth = enddate.substring(4, 6);
			var edate = enddate.substring(6, 8);
			var aenddate = oThis.convertToDate(eyear, emonth, edate);
			if (aenddate < astartdate) {
				return false;
			} else {
				return true;
			}
		}
		return true;
	},
	onTravelEndDate : function(evt) {
		var entrdate = evt.oSource.getValue();
		var data = oThis.getView().getModel("travelsettlement").getData();
		var flag = oThis.checkDates(entrdate);
		if (flag) {
			data.fieldproperties.enabled = false;
			sap.ca.ui.message.showMessageBox({
				type : sap.ca.ui.message.Type.WARNING,
				message : flag
			});
			evt.oSource.setValueState("Error");
			// evt.oSource.setValue("");
		} else {
			var table = evt.oSource.getParent().getParent();
			var index = table.indexOfItem(evt.oSource.getParent());
			var startdate = data.travel.expenses[index].Begda;
			var flag = oThis.checkValidStartEndDate(startdate, entrdate);
			if (!flag) {
				data.fieldproperties.enabled = false;
				evt.oSource.setValueState("Error");
				sap.ca.ui.message.showMessageBox({
					type : sap.ca.ui.message.Type.WARNING,
					message : "Please enter arrival date above departure date"
				});
				// sap.m.MessageToast.show("Please enter arrival date above
				// departure date",{duration : 10000,closeOnBrowserNavigation :
				// false});
			} else {
				// var dupflag =
				// oThis.checkDuplicateDates(evt.oSource.getValue(),
				// evt.oSource.getParent().getParent().getBinding("items").oList,
				// index,"E");
				var dupflag = true;
				if (dupflag) {
					data.fieldproperties.enabled = true;
					evt.oSource.setValueState("None");
				} else {
					data.fieldproperties.enabled = false;
					oThis.getView().getModel("travelsettlement").setData(data);
					evt.oSource.setValue("");
					evt.oSource.setValueState("Error");
					// evt.oSource.setValue("");
					sap.ca.ui.message.showMessageBox({
						type : sap.ca.ui.message.Type.WARNING,
						message : "Please enter unique date"
					});
				}
			}
		}
		oThis.getView().getModel("travelsettlement").setData(data);
	},
	onBoardEndDate : function(evt) {
		var entrdate = evt.oSource.getValue();
		var flag = oThis.checkDates(entrdate);
		var data = oThis.getView().getModel("travelsettlement").getData();
		if (flag) {
			data.fieldproperties.enabled = false;
			oThis.getView().getModel("travelsettlement").setData(data);
			sap.ca.ui.message.showMessageBox({
				type : sap.ca.ui.message.Type.WARNING,
				message : flag
			});
			evt.oSource.setValueState("Error");
			// evt.oSource.setValue("");
		} else {
			var table = evt.oSource.getParent().getParent();
			var index = table.indexOfItem(evt.oSource.getParent());
			var startdate = data.boarding.expenses[index].Begda;
			var flag = oThis.checkValidStartEndDate(startdate, entrdate);
			if (!flag) {
				data.fieldproperties.enabled = false;
				oThis.getView().getModel("travelsettlement").setData(data);
				evt.oSource.setValueState("Error");
				sap.ca.ui.message.showMessageBox({
					type : sap.ca.ui.message.Type.WARNING,
					message : "Please enter to date above from date"
				});
			} else {
				// var dupflag =
				// oThis.checkDuplicateDates(evt.oSource.getValue(),
				// evt.oSource.getParent().getParent().getBinding("items").oList,
				// index,"E");
				var dupflag = true;
				if (dupflag) {
					data.boarding = oThis.calculateNumberofDays(startdate, entrdate, data.boarding, index);
					data.fieldproperties.enabled = true;
					oThis.getView().getModel("travelsettlement").setData(data);
					evt.oSource.setValueState("None");
				} else {
					data.fieldproperties.enabled = false;
					oThis.getView().getModel("travelsettlement").setData(data);
					evt.oSource.setValueState("Error");
					evt.oSource.setValue("");
					// evt.oSource.setValue("");
					sap.ca.ui.message.showMessageBox({
						type : sap.ca.ui.message.Type.WARNING,
						message : "Please enter unique date"
					});
				}
			}
		}
	},
	calculateNumberofDays : function(startdate, entrdate, exptype, index) {
		if ((startdate != "" && entrdate != "") && (startdate != undefined && entrdate != undefined)) {
			var syear = startdate.substring(0, 4);
			var smonth = startdate.substring(4, 6);
			var sdate = startdate.substring(6, 8);
			var astartdate = oThis.convertToDate(syear, smonth, sdate);
			var eyear = entrdate.substring(0, 4);
			var emonth = entrdate.substring(4, 6);
			var edate = entrdate.substring(6, 8);
			var aenddate = oThis.convertToDate(eyear, emonth, edate);
			// var ndays = aenddate.getDate() - astartdate.getDate();
			var ndays = Math.round((aenddate - astartdate) / (1000 * 60 * 60 * 24));
			exptype.expenses[index].Ndays = ndays + 1;
		} else {
			exptype.expenses[index].Ndays = 0;
		}
		return exptype;
	},
	onLodgingEndDate : function(evt) {
		var entrdate = evt.oSource.getValue();
		var data = oThis.getView().getModel("travelsettlement").getData();
		var flag = oThis.checkDates(entrdate);
		if (flag) {
			data.fieldproperties.enabled = false;
			oThis.getView().getModel("travelsettlement").setData(data);
			sap.ca.ui.message.showMessageBox({
				type : sap.ca.ui.message.Type.WARNING,
				message : flag
			});
			evt.oSource.setValueState("Error");
			// evt.oSource.setValue("");
		} else {
			var table = evt.oSource.getParent().getParent();
			var index = table.indexOfItem(evt.oSource.getParent());
			var startdate = data.lodging.expenses[index].Begda;
			var flag = oThis.checkValidStartEndDate(startdate, entrdate);
			if (!flag) {
				evt.oSource.setValueState("Error");
				data.fieldproperties.enabled = false;
				oThis.getView().getModel("travelsettlement").setData(data);
				sap.ca.ui.message.showMessageBox({
					type : sap.ca.ui.message.Type.WARNING,
					message : "Please enter to date above from date"
				});
			} else {
				// data.lodging.expenses[index].Ndays = convertToDate
				// var dupflag =
				// oThis.checkDuplicateDates(evt.oSource.getValue(),
				// evt.oSource.getParent().getParent().getBinding("items").oList,
				// index,"E");
				var dupflag = true;
				if (dupflag) {
					data.lodging = oThis.calculateNumberofDays(startdate, entrdate, data.lodging, index);
					data.fieldproperties.enabled = true;
					oThis.getView().getModel("travelsettlement").setData(data);
					evt.oSource.setValueState("None");
				} else {
					data.fieldproperties.enabled = false;
					oThis.getView().getModel("travelsettlement").setData(data);
					evt.oSource.setValue("");
					evt.oSource.setValueState("Error");
					// evt.oSource.setValue("");
					sap.ca.ui.message.showMessageBox({
						type : sap.ca.ui.message.Type.WARNING,
						message : "Please enter unique date"
					});
				}
			}
		}
	},
	onValidDateChange : function(evt) {
		var entrdate = evt.oSource.getValue();
		var flag = oThis.checkDates(entrdate);
		var data = oThis.getView().getModel("travelsettlement").getData();
		if (flag) {
			data.fieldproperties.enabled = false;
			oThis.getView().getModel("travelsettlement").setData(data);
			evt.oSource.setValueState("Error");
			// evt.oSource.setValue("");
			sap.ca.ui.message.showMessageBox({
				type : sap.ca.ui.message.Type.WARNING,
				message : flag
			});
		} else {
			var index = (evt.oSource.getParent().getParent()).indexOfItem(evt.oSource.getParent());
			// var dupflag = oThis.checkDuplicateDates(evt.oSource.getValue(),
			// evt.oSource.getParent().getParent().getBinding("items").oList,
			// index,"S");
			var dupflag = true;
			if (dupflag) {
				data.fieldproperties.enabled = true;
				oThis.getView().getModel("travelsettlement").setData(data);
				evt.oSource.setValueState("None");
				var id = evt.oSource.getParent().getParent().getId();
				var sid = id.split("--");
				switch (sid[1]) {
				case "lodgingexp":
					var startdate = data.lodging.expenses[index].Begda;
					var enddate = data.lodging.expenses[index].Endda;
					data.lodging = oThis.calculateNumberofDays(startdate, enddate, data.lodging, index);
					oThis.getView().getModel("travelsettlement").setData(data);
					break;
				case "boardexp":
					var startdate = data.boarding.expenses[index].Begda;
					var enddate = data.boarding.expenses[index].Endda;
					data.boarding = oThis.calculateNumberofDays(startdate, enddate, data.boarding, index);
					oThis.getView().getModel("travelsettlement").setData(data);
					break;
				break;
			}
		} else {
			data.fieldproperties.enabled = false;
			oThis.getView().getModel("travelsettlement").setData(data);
			evt.oSource.setValue("");
			evt.oSource.setValueState("Error");
			// evt.oSource.setValue("");
			sap.ca.ui.message.showMessageBox({
				type : sap.ca.ui.message.Type.WARNING,
				message : "Please enter unique date"
			});
		}
	}
},
checkStartPreviousEndDate : function(entrdate, index, exptyp) {
	if (entrdate != "" && index != 0) {
		var entryear = entrdate.substring(0, 4);
		var entrmonth = entrdate.substring(4, 6);
		var entrdate = entrdate.substring(6, 8);
		var aentrdate = oThis.convertToDate(entryear, entrmonth, entrdate);
		var enddate = exptyp.expenses[index - 1].Endda;
		if (enddate != "") {
			var eyear = enddate.substring(0, 4);
			var emonth = enddate.substring(4, 6);
			var edate = enddate.substring(6, 8);
			var aenddate = oThis.convertToDate(eyear, emonth, edate);
			if (aentrdate >= aenddate) {
				return true;
			} else {
				return false;
			}
		}
	}
	return true;
},
checkDuplicateDates : function(date, results, index, type) {
	var flag = true;
	if (date != "") {
		if (type == "S") {
			for (i = 0; i < results.length; i++) {
				if (i != index) {
					if (date == results[i].Begda) {
						flag = false;
						break;
					}
				}
			}
		} else {
			for (i = 0; i < results.length; i++) {
				if (i != index) {
					if (date == results[i].Endda) {
						flag = false;
						break;
					}
				}
			}
		}
	}
	return flag;
},
convertToDate : function(year, month, date) {
	var date1 = new Date(year, month - 1, date);
	return date1;
},
onBackPress : function() {
	window.history.go(-1);
},
checkValidCurrency : function(currency) {
	var curData = this.getView().getModel("curModel").getData();
	for ( var i = 0; i < curData.length; i++) {
		if (curData[i].FIELD1 == currency) {
			return true;
		}
	}
	return false;
},
onKmKgChange : function(evt) {
	// var index =
	if (isNaN(evt.getSource().getValue())) {
		oThis.getView().getModel("travelsettlement").refresh(true);
	}
},
onNumberofDays : function(evt) {
	if (isNaN(evt.getSource().getValue())) {
		oThis.getView().getModel("travelsettlement").refresh(true);
	} else {
		if (parseInt(evt.getSource().getValue()) != evt.getSource().getValue())
			oThis.getView().getModel("travelsettlement").refresh(true);
	}
},
onShowRemarks:function(evt){
	var pop;
	if(!(sap.ui.getCore().byId("trstRemarksDialog"))){
		var oMessageTemplate = new sap.m.FeedListItem({
//			type : 'Information',
			sender : '{Dname}',
			timestamp:"Date: " + "{path:'Erdat',formatter: 'sap.ui.project.e2etm.util.Formatter.formatTicketCommentsDate'}",		
			text :'{Comnt}'
		});
		pop = new sap.m.Popover("trstRemarksDialog", {title:"Remarks",
			content : {
				path : '/',
				template : oMessageTemplate
			}
		});
	} else {
		pop = sap.ui.getCore().byId("trstRemarksDialog");
	}
	
	
	pop.openBy(evt.getSource());
	pop.setBusy(true);
	
	var data = oThis.getView().getModel("travelsettlement").getData();
	oDataModel.read("TrstRemarksSet?$filter=Pernr eq '" + data.traveldetails.EmpNo + "' and Reinr eq '"+data.traveldetails.TravelPlan+"' and Trvky eq '"+data.traveldetails.TravelType+"' and Modid eq 'TRST'", null, null, true, function(oData, response) {
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oData.results);
		pop.setModel(oModel);
		pop.setBusy(false);	
		//sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);

	}, function(error) {
		pop.setBusy(false);
		//sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oForex);
	});
},
onSaveRemarks:function(){
	if(oThis.getView().byId("comments").getValue()!=""){
	var data = oThis.getView().getModel("travelsettlement").getData();
	var oData = {Pernr:data.traveldetails.EmpNo,
			     Reinr:data.traveldetails.TravelPlan,
			     Trvky:data.traveldetails.TravelType,
			     Modid:'TRST',
			     Comnt:oThis.getView().byId("comments").getValue()};
	oDataModel.create("TrstRemarksSet", oData, null, function(oData, response) {
		// oController.uploadFiles(global.ZZ_TRV_REQ);
		
		sap.m.MessageToast.show("Remarks Saved Successfully", {
			duration : 10000,
			closeOnBrowserNavigation : false
		});
	}, function(error) {
		//sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oThis);
		sap.m.MessageToast.show("Internal Server Error");
	}, true);
	}else{
		sap.m.MessageToast.show("Please enter Remarks in the comment box");
	}
},
setCommentTable:function(model){
	var comment = this.getView().byId("commentTable");	
	comment.setModel(model);
	if(model.getData().length==0){
		comment.setVisible(false);
	}else{
		comment.setVisible(true);
	}
//	var str;
//	str = "<Table><tr><th>Username</th><th></th>"
},
onIconTabBarSelect:function(evt){
	var key = this.getView().byId("idIconTabBar").getSelectedKey();
	
	switch (key){
	
	case "ATCH":
		this.getAttachments();
		break;	
	case "LETS":
		this.getView().byId("pnlSalSlip").setVisible(false);
		var data = oThis.getView().getModel("travelsettlement").getData().traveldetails;
		if(data.TravelType == "DEPU"){	
		this.getLetters(data.DepuReq,"CL"); 

		if(data.ToCountry == "DE" && data.AsgType == "STA"){
			this.getView().byId("pnlSalSlip").setVisible(true);
			this.getLetters(data.DepuReq,"CGS"); 
		}
		}
		//this.getView().byId("contractList").bindItems({path:"/ZE2E_DOCS_DETAILSSet",template:cTemplate});
		break;
	}
},
getAttachments:function(){
	var data = oThis.getView().getModel("travelsettlement").getData().traveldetails;
	var uploadData = oThis.getView().getModel("new").getData();
	var travelPlan = '';
	var bItem = uploadData.Files.some(function(item,index){
		return item.DocType == "TCK";
	});
	if(!bItem){
	   travelPlan = parseInt(data.TravelPlan).toString();
	oDataModel.read("DmsDocsSet?$filter=DepReq eq '" + travelPlan + "' and EmpNo eq '" + data.EmpNo + "' and DocType eq 'TCK'", null, null, true, 
	jQuery.proxy(function(oData, response) {		
		uploadData.Files = uploadData.Files.concat(oData.results);
		oThis.getView().getModel("new").setData(uploadData);
		oThis.getView().getModel("new").refresh(true);		

	},this), function(error) {

	});
	}
},
getLetters:function(depReq,docType){
	 oComponent.getModel().read("ZE2E_DOCS_DETAILSSet?$filter=ZZ_DEP_REQ eq '" + depReq + "' and ZZ_DOKTL eq '"+docType+"'", null, null, true, 
		        jQuery.proxy(function(oData, response) {
					
		        	if(docType == "CL"){
		        	 var cLetter =  [];
		        	 cLetter = oData.results;
		        	 cLetter = cLetter.reverse();
		             // modify the contract list value
		             for (var i = 0; i < cLetter.length; i++) {
		               if ( i == 0) {
		            	   cLetter[i].ZZ_DOC_NAME = "Contract Letter (Latest version)";
		               } else {
		            	   cLetter[i].ZZ_DOC_NAME = 
		                   "Contract Letter version " + (cLetter.length - i);
		               }
		               cLetter[i].FileName = cLetter[i].ZZ_DOC_NAME;
		               cLetter[i].Extension = ".pdf";
		               cLetter[i].Checked = true;
		             }
		             if(cLetter.length>0){
		                 this.getView().byId("lblContractLetter").setVisible(false);
		                 this.getView().byId("flexBoxContractLetter").setVisible(true);
		             }else{
		            	 this.getView().byId("lblContractLetter").setVisible(true);
			             this.getView().byId("flexBoxContractLetter").setVisible(false);
		             }
		        	 var model = new sap.ui.model.json.JSONModel();
		             model.setData(cLetter);
		             this.getView().byId("flexBoxContractLetter").setModel(model,"contractList");
		        	}else{//Salary Slips
		        		var salaryList =  [];
		        		salaryList = oData.results;
		                salaryList = salaryList.reverse();
		        		
				          for (var i = 0; i < salaryList.length; i++) {
				            if ( i == 0) {
				              salaryList[i].ZZ_DOC_NAME = "Salary Slip (Latest version)";
				            } else {
				              salaryList[i].ZZ_DOC_NAME = 
				                "Salary Slip version " + (salaryList.length - i);
				            }
				            salaryList[i].FileName = salaryList[i].ZZ_DOC_NAME;
				            salaryList[i].Extension = ".pdf";
				            salaryList[i].Checked = true;
				          }
		    
		                if(salaryList.length>0){
		                   this.getView().byId("lblSalSlip").setVisible(false);
		                   this.getView().byId("flexBoxSalSlip").setVisible(true);
		                }else{
		                	 this.getView().byId("lblSalSlip").setVisible(true);
			                 this.getView().byId("flexBoxSalSlip").setVisible(false);
		                }	  
		         
		                var model = new sap.ui.model.json.JSONModel();
		                model.setData(salaryList);
		                this.getView().byId("flexBoxSalSlip").setModel(model,"salaryList");
		        }
		             
		        	 
					
				},this), function(error) {
		    });
},
onDownloadCL:function(evt){
	//if(evt.getParameter("id")=="btnCggsFormsDownload"){
	var data = oThis.getView().getModel("travelsettlement").getData().traveldetails;
	var sModule = "CL";

//	sap.ui.project.e2etm.util.StaticUtility.downloadCggsForms(this.getView().byId("flexBoxContractLetter").getModel("contractList").getData(),
//			                                                  data.DepuReq,
//			                                                  data.EmpNo,
//			                                                  sModule);
	var zip = new JSZip();
	var cData = this.getView().byId("flexBoxContractLetter").getModel("contractList").getData();
	for(var i=0;i<cData.length;i++){
		var filename = cData[i].ZZ_DOC_NAME;
	    JSZipUtils.getBinaryContent(cData[i].ZZ_DOC_PATH, function (err, data) {
	     if(err) {
	       
	     }
	     zip.file("Contract Letters/"+filename, data, {binary:true});
	  });	  
	 }
	   var blob = zip.generate({
	 		type : "blob"
	 	});
	 	saveAs(blob, "SWIFT.zip");
},
onDownloadSal:function(){
	var data = oThis.getView().getModel("travelsettlement").getData().traveldetails;
	var sModule = "CGS";

	sap.ui.project.e2etm.util.StaticUtility.downloadCggsForms(this.getView().byId("flexBoxSalSlip").getModel("salaryList").getData(),
			                                                  data.DepuReq,
			                                                  data.EmpNo,
			                                                  sModule);
},

/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.TravelSettlement
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.TravelSettlement
 */
 onAfterRendering: function() {
	 if(oThis.getView().byId("UploadCollection")){
		oThis.getView().byId("UploadCollection").onAfterRendering = jQuery.proxy(function() {
			if (sap.m.UploadCollection.prototype.onAfterRendering) {
				sap.m.UploadCollection.prototype.onAfterRendering.apply(oThis.getView().byId("UploadCollection"), arguments);
			}
			var items = oThis.getView().byId("UploadCollection").getItems();
			for(var i=0;i<items.length;i++){
				if(items[i].getBindingContext("new")){
				var mData = items[i].getBindingContext("new").getModel().getProperty(items[i].getBindingContext("new").sPath);
				if(mData.DocType == "TCK"){
					items[i].setVisibleDelete(false);
				}
			  }
			}
		}, this);
	 }
 },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.TravelSettlement
 */
// onExit: function() {
//
// }
});