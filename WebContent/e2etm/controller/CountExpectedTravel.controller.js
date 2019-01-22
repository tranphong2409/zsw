jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
jQuery.sap.require('sap.ui.project.e2etm.controls.customStage');
jQuery.sap.require('sap.ui.project.e2etm.controls.stageItem');
jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("sap.ui.project.e2etm.controller.CountExpectedTravel", {

	onInit : function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
		 d = new Date();
		 sYear = d.getFullYear();
	},

//	=======================================EVENT==============================================
	onRouteMatched: function(evt){

		if(evt.getParameter("name")=="home"){ 
//			this.clearData();		
		} else if(evt.getParameter("name")=="countexpectedtravel") {
			var oModel = this.getView().getModel();
//			oModel.setHeaders({REPORTFOREXTYPE:REPORTFOREXTYPE});
//			this.onSearch();			
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel,"json");
			this.getData("",sYear);
			this.getSection();
		}
	},
	onNavPress: function(){
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	onExportExcel : function(oEvent) {
		var id = "#" + this.getView().byId("idItemTable").getTableDomRef().id;
		$(id).tableExport({type:'excel',escape:'false'});
	},
	getSection: function(){
		var sUrl = "/COUNT_TRVSet?$filter=SECTION+eq+'{0}'+and+THISYEAR+eq+'{1}'";
		sUrl = sUrl.replace("{0}", "");
		sUrl = sUrl.replace("{1}", "");
		
		oThis = this;
		oComponent.getModel().read(sUrl,{
			success : jQuery.proxy(function(mResponse) {

				aData = mResponse.results;
				aData.pop();
				oThis.getView().getModel("json").setProperty("/SECTIONList",mResponse.results);
				
			}, this),
			error : jQuery.proxy(function(error) {
				jQuery.sap.require("sap.m.MessageToast");
			}, this)
		});
	},
	
	getData: function(sSection,sYear){
		var sUrl = "/COUNT_TRVSet?$filter=SECTION+eq+'{0}'+and+THISYEAR+eq+'{1}'";
		sUrl = sUrl.replace("{0}", sSection);
		sUrl = sUrl.replace("{1}", sYear+"0000");
		
		oThis = this;
		oComponent.getModel().read(sUrl,{
			success : jQuery.proxy(function(mResponse) {
//				oThis.getView().getModel("json").setProperty("/SECTIONList",mResponse.results);
				if(oThis.getView().byId("idItemTable").getItems().length == 1){
					//do for the first time
					oThis.createTable(mResponse.results, oThis);
				}else{
					mResponse.results.shift();
					oThis.getView().getModel("json").setProperty("/COUNT_TRVSet",mResponse.results);
				}
			}, this),
			error : jQuery.proxy(function(error) {
				jQuery.sap.require("sap.m.MessageToast");
			}, this)
		});
	},
	onSectionSelect: function(){
		var sSection = this.getView().byId("idSectionSelect").getSelectedKey();
		this.getData(sSection,sYear);
	},
//	build table structure 	
	createTable: function(oData, oController){
		var Stemp =	oData[0];
		
		var oColumnListItem = new sap.m.ColumnListItem();
		
		var oSectionId = new sap.m.Text({
			text: "{json>SECTION}",
			tooltip: "{json>SECTION}"
		});
		
		var oThisYearId = new sap.m.Text({
			text: "{json>THISYEAR}",
			tooltip: "{json>THISYEAR}"
		});
		var oNextYearId = new sap.m.Text({
			text: "{json>NEXTYEAR}",
			tooltip: "{json>NEXTYEAR}"
		});
		var oNextTowYearId = new sap.m.Text({
			text: "{json>TWOYEARLATTER}",
			tooltip: "{json>TWOYEARLATTER}"
		});


		var oNextThreeYearId = new sap.m.Text({
			text: "{json>THREEYEARLATTER}"
		});
		
		var oTotal = new sap.m.Text({
			text: "{json>SECTION_TOTAL}"
		});
		var oSection=  new sap.m.Column("SECTION",{header: new sap.m.Label({text:"SECTION"}),
			mergeDuplicates: false,
			visible: true,
		});
		
		oController.getView().byId("idItemTable").addColumn(oSection);
		oColumnListItem.addCell(oSectionId);
		var sThisYear= false;
		if(Stemp.THISYEAR != '0 '){
			
			 sThisYear = true;
				var oThisYear =  new sap.m.Column("Thisyear",{header: new sap.m.Label({text:"Associate can trave in " + Stemp.THISYEAR}),
					mergeDuplicates: false,
					visible: true,
				});
				oController.getView().byId("idItemTable").addColumn(oThisYear);
				oColumnListItem.addCell(oThisYearId);	
		}
		
		var sNextYear= false;
		if(Stemp.NEXTYEAR != '0 '){
			
			 sNextYear = true;
				var oNextYear =  new sap.m.Column("Nextyear",{header: new sap.m.Label({ text:"Associate can trave in "+Stemp.NEXTYEAR}),
					mergeDuplicates: false,
					visible: true,
				});
				oController.getView().byId("idItemTable").addColumn(oNextYear);

				oColumnListItem.addCell(oNextYearId);
		}
		
		var sNext2Year= false;
		if(Stemp.TWOYEARLATTER != '0 '){
			
			 sNext2Year = true;
				var oNext2Year =  new sap.m.Column("Next2Year",{header: new sap.m.Label({text:"Associate can trave in "+ Stemp.TWOYEARLATTER}),
					mergeDuplicates: false,
					visible: true,
				});
				
				oController.getView().byId("idItemTable").addColumn(oNext2Year);
				oColumnListItem.addCell(oNextTowYearId);


		}



		var sThreeYear= false;
		if(Stemp.THREEYEARLATTER != '0 '){
			
			 sThreeYear = true;
			var oNext3Year =  new sap.m.Column("Next3Year",{header: new sap.m.Label({text:"Associate can trave in "+Stemp.THREEYEARLATTER}),
				mergeDuplicates: true,
				visible: true,
			});
			oController.getView().byId("idItemTable").addColumn(oNext3Year);
			oColumnListItem.addCell(oNextThreeYearId);
		}
		
		
		var oTotalCl=  new sap.m.Column("Total",{header: new sap.m.Label({text:"TOTAL"}),
			mergeDuplicates: false,
			visible: true,
		});

		oController.getView().byId("idItemTable").addColumn(oTotalCl);
		oColumnListItem.addCell(oTotal);

		oData.shift();
		
		oController.getView().getModel("json").setProperty("/COUNT_TRVSet",oData);
		
		oController.getView().byId("idItemTable").bindItems({path:"json>/COUNT_TRVSet", 
			template:oColumnListItem
			}
		);
	},
	

	
//	====================================END OF FUNCTION=========================================


});