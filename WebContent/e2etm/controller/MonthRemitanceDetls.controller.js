var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
var oController;
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("sap.ui.project.e2etm.controller.MonthRemitanceDetls", {
	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf e2etm.view.MonthRemitanceDetls
	 */
	onInit : function() {
		oController = this;
		var model = new sap.ui.model.json.JSONModel();
		model.setData([]);
		this.getView().byId("cardtable").setModel(model);
		var fileModel = new sap.ui.model.json.JSONModel();
		fileModel.setData({
			Files : []
		});
		this.getView().setModel(fileModel, "new");
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatchedDetail, this);
	},
	/**
	 * Similar to onAfterRendering, but this hook is invoked before the
	 * controller's View is re-rendered (NOT before the first rendering!
	 * onInit() is used for that one!).
	 * 
	 * @memberOf e2etm.view.MonthRemitanceDetls
	 */
	// onBeforeRendering: function() {
	//
	// },
	onRouteMatchedDetail : function(evt) {
		if (evt.getParameter("name") == "monthrem") {
			var view = evt.mParameters.view;
			oController = view.getController();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
			var data;
			var travelReq = sap.ui.getCore().getModel("global").getData().ZZ_TRV_REQ;
			// var depData =
			// sap.ui.getCore().getModel("global").getData().deputationList;
			// for ( var i = 0; i < depData.length; i++) {
			// if (depData[i].ZZ_TRV_REQ == travelReq) {
			// data = depData[i];
			// break;
			// }
			// }
			oController.clearData();
			var pdata = sap.ui.getCore().getModel("profile").getData();
			var data1 = pdata;
			// data1.mrdetails = [];
			this.getView().byId("cardtable").setVisibleRowCount(0);
			var model = new sap.ui.model.json.JSONModel();
			model.setData(data1);
			this.getView().setModel(model, "traveldetails");
			oController.fetchDetails();
			
			var sError = "Your address details are not up to date. Please update the same at the earliest."; 
			var sUrl = "ZE2E_ONSITE_ADDRSet(ZZ_TRV_REQ='{0}',ZZ_EMP_NO='{1}',ZZ_VALID_FROM={2})";
			sUrl = sUrl.replace("{0}", travelReq);
			sUrl = sUrl.replace("{1}", sap.ui.getCore().getModel("global").getData().ZZ_DEP_PERNR);
			sUrl = sUrl.replace("{2}", sap.ui.project.e2etm.util.StaticUtility.formatDateOnsite(new Date()));
			oDataModel.read(sUrl, {
				success : function(oData) {
					sap.ui.project.e2etm.util.StaticUtility
					.setBusy(false, oController);						
				},
				error : function(err) {
					sap.ui.project.e2etm.util.StaticUtility
					.setBusy(false, oController);
					sap.ca.ui.message.showMessageBox({
						type : sap.ca.ui.message.Type.ERROR,
						message : sError,
						details : sError
					});
				}
			});
		}
	},
	fetchDetails : function() {
		var global = sap.ui.getCore().getModel("global").getData();
		var currentRole = sap.ui.getCore().getModel("profile").getData().currentRole;
		var batch4, batch5;
		var batch1 = oDataModel.createBatchOperation("MRExpensesSet?$filter=Pernr+eq+'" + global.ZZ_DEP_PERNR + "'+and+Reinr+eq+'" + global.ZZ_TRV_REQ + "'+and+Trvky+eq+'" + global.ZZ_REQ_TYP + "'", "GET");
		var batch2 = oDataModel.createBatchOperation("DmsDocsSet?$filter=DepReq+eq+'" + global.ZZ_TRV_REQ + "'+and+EmpNo+eq+'" + global.ZZ_DEP_PERNR + "'+and+DocType+eq+'MR'", "GET");
		var batch3 = oDataModel.createBatchOperation("CardReloadComSet?$filter=Pernr+eq+'" + global.ZZ_DEP_PERNR + "'+and+Reinr+eq+'" + global.ZZ_TRV_REQ + "'+and+Trvky+eq+'" + global.ZZ_REQ_TYP + "'+and+Modid+eq+'REMI'", "GET");
		if (currentRole != "EMP") {
			batch4 = oDataModel.createBatchOperation("BankDetailsSet(EmpNo='" + global.ZZ_DEP_PERNR + "',TravelPlan='" + global.ZZ_TRV_REQ + "',TravelType='" + global.ZZ_REQ_TYP + "')", "GET");
			batch5 = oDataModel.createBatchOperation("MRGeneralDataSet(EmpNo='" + global.ZZ_DEP_PERNR + "',TravelPlan='" + global.ZZ_TRV_REQ + "',TravelType='" + global.ZZ_REQ_TYP + "',LoginRole='" + currentRole + "')", "GET");
			oDataModel.addBatchReadOperations([ batch1, batch2, batch3, batch4, batch5 ]);
		} else {
			oDataModel.addBatchReadOperations([ batch1, batch2, batch3 ]);
		}
		oDataModel.submitBatch(function(oResult) {
			try {
				var model = new sap.ui.model.json.JSONModel();
				if (currentRole == "EMP") {
					var bankDet = sap.ui.getCore().getModel("monthrem").getData().bankDet;
					model.setData(bankDet);
				} else {
					model.setData(oResult.__batchResponses[3].data);
				}
				oController.getView().setModel(model, "bankadvice");
				var tdata = oController.getView().getModel("traveldetails").getData();
				var generalDet;
				if (currentRole == "EMP") {
					generalDet = sap.ui.getCore().getModel("monthrem").getData().generalDet;
					tdata = $.extend({}, tdata, generalDet);
				} else {
					generalDet = oResult.__batchResponses[4].data;
					tdata = $.extend({}, tdata, oResult.__batchResponses[4].data);
				}
				oController.getView().getModel("traveldetails").setData(tdata);
				oController.setFieldProperties(generalDet);
				var modelData = oController.getView().getModel("traveldetails").getData();
				modelData.mrdetails = [];
				modelData.mrdetails = oResult.__batchResponses[0].data.results;
				oController.getView().getModel("traveldetails").setData(modelData);
				oController.getView().getModel("traveldetails").refresh(true);
				oController.getView().byId("cardtable").setVisibleRowCount(modelData.mrdetails.length);
				// oController.setMRTableRows(modelData.mrdetails);
				// Attachments
				filesAll = oResult.__batchResponses[1].data.results;
				var uploadModel = oController.getView().getModel("new");
				uploadModel.setData({
					Files : filesAll
				});
				// Comments
				var commentsList = oController.getView().byId(sap.ui.core.Fragment.createId("AppoveInfo", "idListApprove"));
				var commentModel = new sap.ui.model.json.JSONModel();
				commentModel.setData(oResult.__batchResponses[2].data.results);
				commentsList.bindItems("/", new sap.m.FeedListItem({
					text : "{Comnt}",
					sender : "{Dname}",
					timestamp:"{Erdat}"
					//timestamp : "Date: " + "{path:'Erdat',formatter: 'sap.ui.project.e2etm.util.Formatter.formatTicketCommentsDate'}",
				}));
				commentsList.setModel(commentModel);
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			} catch (err) {
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			}
		}, function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
		}, true);
	},
	setMRTableRows : function(mrtable) {
		var table = oController.getView().byId("cardtable");
		var rows = table.getRows();
		for ( var i = 0; i < mrtable.length; i++) {
			if (mrtable[i].Chck == "X") {
				var cells = rows[i].getCells();
				for ( var i = 0; i < cells.length; i++) {
					cells[i].setEditable(false);
				}
			} else {
				var cells = rows[i].getCells();
				for ( var i = 0; i < cells.length; i++) {
					cells[i].setEditable(true);
				}
			}
		}
	},
	setFieldProperties : function(data) {
		var model = new sap.ui.model.json.JSONModel();
		var properties = {};
		var pe;
		var cardflag=false;
		var bankflag=false;
		
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		if (role == "EMP") {
			var monthrem = sap.ui.getCore().getModel("monthrem").getData();
			
			pe = monthrem.generalDet.PeOrNpe;
			if(monthrem.bankDet.Bkact!=""&&monthrem.generalDet.CardNo!=""){
				bankflag = true;
			}else if(monthrem.bankDet.Bkact!=""){
				bankflag = true;
			}else if(monthrem.generalDet.CardNo!=""){
				cardflag = true;
			}
			if((data.Action=="00"&&data.Role=="01")||(data.Action=="02"&&data.Role=="04"))
				{
				properties = {
						editable : true,
						visible : true,
						sbvisible : false,
						revisible : false,
						ohvisible : false,
						apvisible : false,
						faeditable : false,
						liveditable : false,
						areditable : false,
						chvisible : false,
						relvisible : false,
						bckpopup:true,
						tbvisible:true
					};
				}
			else if(pe=="PE"){
				if((data.Action=="03"&&data.Role=="04")){
					properties = {
							editable : true,
							visible : true,
							sbvisible : false,
							revisible : false,
							ohvisible : false,
							apvisible : false,
							faeditable : false,
							liveditable : false,
							areditable : false,
							chvisible : false,
							relvisible : false,
							bckpopup:true,
							tbvisible:true
						};
				}
				else{
					properties = {
							editable : false,
							visible : false,
							sbvisible : false,
							revisible : false,
							ohvisible : false,
							apvisible : false,
							faeditable : false,
							liveditable : false,
							areditable : false,
							chvisible : false,
							relvisible : false,
							bckpopup:false,
							tbvisible:true
						};
					
				}
			}
			else if(pe=="NPE"){
				if((data.Action=="03"&&data.Role=="09"&&cardflag)){
					properties = {
							editable : true,
							visible : true,
							sbvisible : false,
							revisible : false,
							ohvisible : false,
							apvisible : false,
							faeditable : false,
							liveditable : false,
							areditable : false,
							chvisible : false,
							relvisible : false,
							bckpopup:true,
							tbvisible:true
						};
				}			
				
				else if((data.Action=="03"&&data.Role=="06"&&bankflag)){
					properties = {
							editable : true,
							visible : true,
							sbvisible : false,
							revisible : false,
							ohvisible : false,
							apvisible : false,
							faeditable : false,
							liveditable : false,
							areditable : false,
							chvisible : false,
							relvisible : false,
							bckpopup:true,
							tbvisible:true
						};
				}
				else{
					properties = {
							editable : false,
							visible : false,
							sbvisible : false,
							revisible : false,
							ohvisible : false,
							apvisible : false,
							faeditable : false,
							liveditable : false,
							areditable : false,
							chvisible : false,
							relvisible : false,
							bckpopup:false,
							tbvisible:true
						};
					
				}
			}
			//if ((data.Role == "01" || data.Role == "04" || data.Role == "06") && (data.Action == "00" || data.Action == "02" || data.Action == "03")) {
			
			 else {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					apvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : false,
					relvisible : false,
					bckpopup:false,
					tbvisible:true
				};
				// role=01or04 and action=00 or 02{true}
			}
			
			var flag = sap.ui.project.e2etm.util.StaticUtility.checkTodayEndDate(data.EndDate);
			if(flag==false){
				properties = {
						editable : false,
						visible : false,
						sbvisible : false,
						revisible : false,
						ohvisible : false,
						apvisible : false,
						faeditable : false,
						liveditable : false,
						areditable : false,
						chvisible : false,
						relvisible : false,
						bckpopup:false,
						tbvisible:true
					};
			}
			
		} else if (role == "FINA") {
			var tab = sap.ui.getCore().getModel("global").getData().tabkey;
			if (tab == "NEW") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : false,
					apvisible : true,
					bckpopup:false
				};
			} else if (tab == "APP") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : false,
					apvisible : false,
					bckpopup:true
				};
			}
		} else if (role == "DEPM") {
			properties = {
				editable : false,
				visible : false,
				sbvisible : true,
				revisible : false,
				ohvisible : false,
				faeditable : false,
				liveditable : false,
				areditable : false,
				chvisible : true,
				relvisible : false,
				apvisible : true,
				tbvisible:false
			};
		} else if(role == "MRCR") {//Approver
			var tab = sap.ui.getCore().getModel("global").getData().tabkey;
			if (tab == "NEW" || tab == "SBAP") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					apvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : false,
					tbvisible:false//Add row,Delete rows button
				};
			} else if (tab == "APP") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					apvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : false,
					tbvisible:false
				};
			} else if (tab == "REV") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : true,
					revisible : false,
					ohvisible : true,
					apvisible : true,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : false,
					tbvisible:false
				};
			} else if (tab == "ONH") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					apvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : true,
					tbvisible:false
				};
			} else if (tab == "SBRW") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					apvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : false,
					tbvisible:false
				};
			}
		}else if(role == "MRCA") {//Reviewer
			var tab = sap.ui.getCore().getModel("global").getData().tabkey;
			if (tab == "NEW" || tab == "SBAP") {
				properties = {
					editable : true,
					visible : false,
					sbvisible : true,
					revisible : true,
					ohvisible : false,
					apvisible : false,
					faeditable : true,
					liveditable : true,
					areditable : true,
					chvisible : true,
					relvisible : false,
					tbvisible:true//Add row,Delete rows button
				};
			} else if (tab == "APP") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					apvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : false,
					tbvisible:false
				};
			} else if (tab == "REV") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					apvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : false,
					tbvisible:false
				};
			} else if (tab == "ONH") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					apvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : true,
					tbvisible:false
				};
			} else if (tab == "SBRW") {
				properties = {
					editable : false,
					visible : false,
					sbvisible : false,
					revisible : false,
					ohvisible : false,
					apvisible : false,
					faeditable : false,
					liveditable : false,
					areditable : false,
					chvisible : true,
					relvisible : false,
					tbvisible:false
				};
			}
		}
		model.setData(properties);
		oController.getView().setModel(model, "fieldproperties");
	},
	clearData : function() {
		oController.getView().byId("UploadCollection").aItems = [];
		this.getView().byId("comments").setValue("");
		uploadFile = [];
	},
	onFileUpload : function(evt) {
		var file = evt.getParameters("files").files[0];
		var oData = evt.oSource.getParent().getModel("traveldetails").getData();
		var sModule = "MR";
		sap.ui.project.e2etm.util.StaticUtility.uploadCollectionFile(oController, file, oData.TravelPlan, oData.EmpNo, sModule);
	},
	onFileDeleted : function(oEvent) {
		// prepare FileName
		var sFileName = oEvent.getParameters("item").item.getFileName();
		// prepare DocType
		var oData = oEvent.oSource.getParent().getModel("traveldetails").getData();
		var sDocType;
		sDocType = "MR";
		// prepare travel request number
		var sDepReq = oData.TravelPlan;
		// prepare employee number
		var sEmpNo = oData.EmpNo;
		// prepare index
		var sIndex = 0;
		sap.ui.project.e2etm.util.StaticUtility.deleteUploadCollectionFile(oController, oEvent, sDepReq, sFileName, sDocType, sEmpNo, sIndex);
	},
	onUploadComplete : function(oEvent) {
		this.getView().getModel("new").refresh(true);
		// oEvent.oSource.setUploadUrl("");
	},
	onAddCard : function() {
		var tableData = this.getView().getModel("traveldetails").getData();
		var global = sap.ui.getCore().getModel("global").getData();
		var index = tableData.mrdetails.length;
		var ctotal;
		if (index == 1 || index == 2 || index == 3) {
			var preCumul = parseFloat(tableData.mrdetails[index - 1].Cumul);
			var total = -(tableData.AdvRecover);
			var nxttotal = parseFloat(tableData.mrdetails[index - 1].Ctotal) + parseFloat(total);
			if (nxttotal < 0) {
				// ctotal = nxttotal;
				ctotal = nxttotal + parseFloat(tableData.mrdetails[index - 1].Ctotal);
				total = 0;
			} else {
				ctotal = 0;
				total = nxttotal;
			}
			tableData.mrdetails.push({
				Pernr : global.ZZ_DEP_PERNR,
				Reinr : global.ZZ_TRV_REQ,
				Trvky : global.ZZ_REQ_TYP,
				Advrc : tableData.AdvRecover,
				Total : total,
				Ctotal : ctotal,
				Cumul : parseFloat(total) + parseFloat(preCumul),
				Chck : ""
			});
		} else if (index == 0) {
			tableData.mrdetails.push({
				Pernr : global.ZZ_DEP_PERNR,
				Reinr : global.ZZ_TRV_REQ,
				Trvky : global.ZZ_REQ_TYP,
				Advrc : 0.00,
				Chck : ""
			});
		} else {
			var preCumul = tableData.mrdetails[index - 1].Cumul;
			var nxttotal = parseFloat(tableData.mrdetails[index - 1].Ctotal) + 0;
			if (nxttotal < 0) {
				ctotal = nxttotal;
				total = 0;
			} else {
				ctotal = 0;
				total = nxttotal;
				// total = 0;
			}
			tableData.mrdetails.push({
				Pernr : global.ZZ_DEP_PERNR,
				Reinr : global.ZZ_TRV_REQ,
				Trvky : global.ZZ_REQ_TYP,
				Advrc : 0.00,
				Cumul : parseFloat(preCumul) + parseFloat(total),
				Total : total,
				Ctotal : ctotal,
				Chck : ""
			});
		}
		oController.setTableNavigation(tableData.mrdetails);
		this.getView().getModel("traveldetails").setData(tableData);
		oController.getView().getModel("traveldetails").refresh(true);
	},
	// delete row from card table
	onDelCard : function(evt) {
		var index = this.getView().byId("cardtable").getSelectedIndices();
		if (index.length == 0) {
			sap.m.MessageToast.show("Please select atleast one row");
		} else {
			var tableData = this.getView().getModel("traveldetails").getData();
			for ( var i = index.length - 1; i >= 0; i--) {
				if (tableData.mrdetails[index[i]].Chck == "") {
					tableData.mrdetails.splice(index[i], 1);
				}
			}
			oController.setTableNavigation(tableData.mrdetails);
			// this.getView().byId("cardtable").setVisibleRowCount(tableData.length);
			this.getView().getModel("traveldetails").setData(tableData);
		}
		// evt.oSource.removeItem(item);
	},
	setTableNavigation : function(tableData) {
		// if (tableData.length >= 10) {
		// this.getView().byId("cardtable").setNavigationMode(sap.ui.table.NavigationMode.Paginator);
		// } else {
		this.getView().byId("cardtable").setVisibleRowCount(tableData.length);
		// }
	},
	onBackPress : function() {
		// this.clearData();
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	onValueHelpRequest : function(evt) {
		var yearpick, res;
		if (!(sap.ui.getCore().byId("yearpick"))) {
			yearpick = new sap.ui.unified.calendar.YearPicker("yearpick", {
				select : oController.onYearSelect
			});
		}
		if (!(sap.ui.getCore().byId("resp"))) {
			res = new sap.m.ResponsivePopover("resp", {
				showHeader : true,
				customHeader : new sap.m.Bar({
					contentLeft : [ new sap.m.Button({
						icon : "sap-icon://slim-arrow-left",
						press : oController.left
					}) ],
					contentRight : [ new sap.m.Button({
						icon : "sap-icon://slim-arrow-right",
						press : oController.right
					}) ]
				}),
				content : [ yearpick ]
			});
		} else
			res = sap.ui.getCore().byId("resp");
		// evt.getSource().addDependent(res);
		res.openBy(evt.getSource());
	},
	onMonthHelpRequest : function(evt) {
		var monthpick, res;
		if (!(sap.ui.getCore().byId("monthpick"))) {
			monthpick = new sap.ui.unified.calendar.MonthPicker("monthpick", {
				select : oController.onMonthSelect
			});
		}
		if (!(sap.ui.getCore().byId("monthresp"))) {
			res = new sap.m.ResponsivePopover("monthresp", {
				showHeader : false,
				content : [ monthpick ]
			});
		} else
			res = sap.ui.getCore().byId("monthresp");
		// evt.getSource().addDependent(res);
		res.openBy(evt.getSource());
	},
	left : function(evt) {
		var yearpick = sap.ui.getCore().byId("yearpick");
		yearpick.previousPage();
	},
	right : function(evt) {
		var yearpick = sap.ui.getCore().byId("yearpick");
		yearpick.nextPage();
	},
	onYearSelect : function(evt) {
		var year = evt.oSource.getYear();
		var inputc = sap.ui.getCore().byId("resp").getAggregation("_popup")._oOpenBy;
		var table = oController.getView().byId("cardtable");
		var index = table.indexOfRow(inputc.getParent());
		var tableData = oController.getView().getModel("traveldetails").getData().mrdetails;
		var flag = oController.checkYearChange(year, tableData, index);
		// var flag = true;
		if (flag) {
			sap.ui.getCore().byId("resp").getAggregation("_popup")._oOpenBy.setValue(year);
			sap.ui.getCore().byId("resp").getAggregation("_popup")._oOpenBy.setValueState("None");
		} else {
			sap.m.MessageToast.show("Please enter valid year above start date");
			sap.ui.getCore().byId("resp").getAggregation("_popup")._oOpenBy.setValueState("Error");
			sap.ui.getCore().byId("resp").getAggregation("_popup")._oOpenBy.setValue("");
		}
		oController.setLivingAllowance(tableData[index].Zmnth, year, index);
		sap.ui.getCore().byId("resp").close();
	},
	checkYearChange : function(value, tableData, index) {
		var flag = true;
		var startdate = oController.getView().getModel("traveldetails").getData().StartDate;
		var year = startdate.substring(0, 4);
		var smonth = startdate.substring(4, 6);
		if (value < year) {
			flag = false;
		} else if (value == year) {
			if (parseInt(tableData[index].Zmnth) < parseInt(smonth)) {
				tableData[index].Zmnth = "";
				oController.getView().getModel("traveldetails").getData().mrdetails = tableData;
				oController.getView().getModel("traveldetails").refresh(true);
				flag = true;
			}
		}
		return flag;
	},
	onMonthSelect : function(evt) {
		var inputc = sap.ui.getCore().byId("monthresp").getAggregation("_popup")._oOpenBy;
		var table = oController.getView().byId("cardtable");
		var index = table.indexOfRow(inputc.getParent());
		var tableData = oController.getView().getModel("traveldetails").getData().mrdetails;
		var flag = oController.checkMonthChange(evt.oSource.getMonth(), tableData[index].Zyear);
		// var flag = true;
		if (flag) {
			tableData[index].Zmnth = (evt.oSource.getMonth() + 1).toString();
			oController.getView().getModel("traveldetails").getData().mrdetails = tableData;
			oController.getView().getModel("traveldetails").refresh(true);
			inputc.setValueState("None");
		} else {
			sap.m.MessageToast.show("Please enter Month above start date");
			sap.ui.getCore().byId("monthresp").getAggregation("_popup")._oOpenBy.setValueState("Error");
			tableData[index].Zmnth = "";
			oController.getView().getModel("traveldetails").getData().mrdetails = tableData;
			oController.getView().getModel("traveldetails").refresh(true);
		}
		oController.setLivingAllowance(tableData[index].Zmnth, tableData[index].Zyear, index);
		sap.ui.getCore().byId("monthresp").close();
	},
	setLivingAllowance : function(month, year, index) {
		var mrGeneralData = oController.getView().getModel("traveldetails").getData();
		if(mrGeneralData.ToCountry=="DE" && mrGeneralData.TravelType=="DEPU" && mrGeneralData.AsgType == "STA"){
			return;
		}
		var startdate = oController.getView().getModel("traveldetails").getData().StartDate;
		var enddate = oController.getView().getModel("traveldetails").getData().EndDate;
		var data = oController.getView().getModel("traveldetails").getData();
		var syear = startdate.substring(0, 4);
		var smonth = parseInt(startdate.substring(4, 6));
		var eyear = enddate.substring(0, 4);
		var emonth = parseInt(enddate.substring(4, 6));
		month = parseInt(month);
		var tableData = oController.getView().getModel("traveldetails").getData().mrdetails;
		if (month == smonth && year == syear) {
			tableData[index].Lival = data.Sliving;
		} else if (month == emonth && year == eyear) {
			tableData[index].Lival = data.Eliving;
		} else {
			tableData[index].Lival = data.LivingAllw;
		}
		oController.getView().getModel("traveldetails").getData().mrdetails = tableData;
		oController.getView().getModel("traveldetails").refresh(true);
		oController.calculateTotal(tableData, index);
	},
	calculateTotal : function(tableData, index) {
		// var table = oController.getView().byId("cardtable");
		// var cells = table.getRows()[index].getAggregation("cells");
		// var livall = oController.formatAmountValue(cells[3].getValue());
		// var lodall = oController.formatAmountValue(cells[4].getValue());
		// var cauall = oController.formatAmountValue(cells[6].getValue());
		// var traall = oController.formatAmountValue(cells[7].getValue());
		// var othall = oController.formatAmountValue(cells[8].getValue());
		// var adrall = oController.formatAmountValue(cells[11].getValue());
		// var total = livall + lodall + cauall + traall + othall - adrall;
		// if ((index - 1) != -1) {
		// total = total + parseFloat(tableData[index - 1].Ctotal);
		// }
		// tableData[index].Total = total;
		// if (tableData[index].Total < 0) {
		// tableData[index].Ctotal = tableData[index].Total;
		// tableData[index].Total = 0;
		// total = 0;
		// } else {
		// tableData[index].Ctotal = 0;
		// }
		// if ((index - 1) != -1) {
		// var items = table.getRows();
		// var preCumul = items[index - 1].getCells()[14].getValue();
		// tableData[index].Cumul = total +
		// oController.formatAmountValue(preCumul);
		// } else {
		// tableData[index].Cumul = total + 0;
		// }
		// tableData[index].Lival = livall;
		// tableData[index].Lodal = lodall;
		// tableData[index].Cdpal = cauall;
		// tableData[index].Traal = traall;
		// tableData[index].Advrc = adrall;
		// tableData[index].Othal = othall;
		oController.changeNextRows(tableData, index);
		for ( var i = index + 1; i < tableData.length; i++) {
			oController.changeNextRows(tableData, i);
			tableData[i].Cumul = parseFloat(tableData[i].Total) + parseFloat(tableData[i - 1].Cumul);
		}
		oController.getView().getModel("traveldetails").getData().mrdetails = tableData;
		oController.getView().getModel("traveldetails").refresh(true);
	},
	changeNextRows : function(tableData, index) {
		var table = oController.getView().byId("cardtable");
		var cells = table.getRows()[index].getAggregation("cells");
		// var cells = tableData[index].getAggregation("cells");
		var livall = oController.formatAmountValue(cells[3].getValue());
		var lodall = oController.formatAmountValue(cells[4].getValue());
		// var ohaall = oController.formatAmountValue(cells[5].getValue());
		var cauall = oController.formatAmountValue(cells[6].getValue());
		var traall = oController.formatAmountValue(cells[7].getValue());
		var othall = oController.formatAmountValue(cells[8].getValue());
		var adrall = oController.formatAmountValue(cells[11].getValue());
		var total = livall + lodall + cauall + traall + othall - adrall;
		if ((index - 1) != -1) {
			total = total + parseFloat(tableData[index - 1].Ctotal);
		}
		tableData[index].Total = total;
		if (tableData[index].Total < 0) {
			tableData[index].Ctotal = tableData[index].Total;
			tableData[index].Total = 0;
			total = 0;
		} else {
			tableData[index].Ctotal = 0;
		}
		if ((index - 1) != -1) {
			var items = table.getRows();
			var preCumul = items[index - 1].getCells()[14].getValue();
			tableData[index].Cumul = total + oController.formatAmountValue(preCumul);
		} else {
			tableData[index].Cumul = total + 0;
		}
		tableData[index].Lival = livall;
		tableData[index].Lodal = lodall;
		// tableData[index].Ohaal = ohaall;
		tableData[index].Cdpal = cauall;
		tableData[index].Traal = traall;
		tableData[index].Advrc = adrall;
		tableData[index].Othal = othall;
	},
	onSave : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		oController.saveDetails("01", "00");
	},
	onSubmit : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		oController.saveDetails("01", "01");
	},
	onSendback : function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var tab = sap.ui.getCore().getModel("global").getData().tabkey;
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		if(role=="MRCR" || role == "MRCA"){
		if (tab == "NEW" || tab == ""||tab=="SBAP")
			oController.saveDetails("04", "02");
		else if (tab == "REV")
			oController.saveDetails("04", "18");
		}
		else if(role=="DEPM"){
			oController.saveDetails("09", "02");
		}
	},
	onHold : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		oController.saveDetails("04", "17");
	},
	onReview : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		oController.saveDetails("04", "16");
	},
	onApprove : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		if (role == "MRCR" || role=="MRCA")
			oController.saveDetails("04", "03");
		else if (role == "FINA")
			oController.saveDetails("06", "03");
		else if (role == "DEPM")
			oController.saveDetails("09", "03");
	},
	onRelease : function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oController);
		oController.saveDetails("04", "19");
	},
	validateMonthYear : function(mrdetails) {
		var flag = true;
		for ( var i = 0; i < mrdetails.length; i++) {
			if (mrdetails[i].Zmnth == "" || mrdetails[i].Zyear == "") {
				flag = false;
				break;
			} else if (mrdetails[i].Zmnth == "00" || mrdetails[i].Zyear == "0000") {
				flag = false;
				break;
			}
		}
		return flag;
	},
	saveDetails : function(role, action) {
		var oDataModel1 = new sap.ui.model.odata.ODataModel(sServiceUrl);
		var mrdetails = oController.getView().getModel("traveldetails").getData().mrdetails;
		var flag = oController.validateMonthYear(mrdetails);
		if (flag) {
			var traveldetails = oController.getView().getModel("traveldetails").getData();
			var bankdetails = oController.getView().getModel("bankadvice").getData();
			// var carddetails =
			// oController.getView().getModel("advancecarddet").getData();
			var comments = oController.getView().byId("comments").getValue();
			var odata = {};
			var global = sap.ui.getCore().getModel("global").getData();
			var profileRole = sap.ui.getCore().getModel("profile").getData().currentRole;
			if (profileRole == "EMP") {
				odata = {
					TravelPlan : global.ZZ_TRV_REQ,
					TravelType : global.ZZ_REQ_TYP,
					EmpNo : global.ZZ_DEP_PERNR,
					Role : role,
					Action : action,
					Comments : comments,
					Bank : bankdetails.Bkact ? "X" : "",
					Card : traveldetails.CardNo ? "X" : "",
					Country : traveldetails.ToCountry,
					PeOrNpe : traveldetails.PeOrNpe,
					CardNo:traveldetails.CardNo,
					CardValidity:traveldetails.CardValidity,
					IssuedBanker:traveldetails.IssuedBanker,
					Currency:traveldetails.Currency
					
					
				};
			} else {
				var changedreq = oController.getView().byId("changedreq").getChecked();
				odata = {
					TravelPlan : global.ZZ_TRV_REQ,
					TravelType : global.ZZ_REQ_TYP,
					
					EmpNo : global.ZZ_DEP_PERNR,
					Role : role,
					Action : action,
					Comments : comments,
					Bank : bankdetails.Bkact ? "X" : "",
					Card : traveldetails.CardNo ? "X" : "",
					Country : traveldetails.ToCountry,
					FamilyAcc : traveldetails.FamilyAcc,
					FamilySpons : traveldetails.FamilySpons,
					DepuReq : traveldetails.DepuReq,
					ChangedReq : changedreq ? "X" : "",
					PeOrNpe : traveldetails.PeOrNpe,
					CardNo:traveldetails.CardNo,
					CardValidity:traveldetails.CardValidity,
					IssuedBanker:traveldetails.IssuedBanker,
					Currency:traveldetails.Currency
				};
			}
			odata.MRExpenses = [];
			// odata.MRExpenses = mrdetails;
		
			for ( var i = 0; i < mrdetails.length; i++) {
				if (mrdetails[i].Chck == ""||mrdetails[i].Chck == undefined) {
					if(isNaN(parseFloat(mrdetails[i].Lival))){
						mrdetails[i].Lival = 0;
					}
					odata.MRExpenses.push({
						Pernr : mrdetails[i].Pernr,
						Reinr : mrdetails[i].Reinr,
						Trvky : mrdetails[i].Trvky,
						Zmnth : mrdetails[i].Zmnth,
						Zyear : mrdetails[i].Zyear,
						Nofmb : mrdetails[i].Nofmb,
						Lival : mrdetails[i].Lival,
						Lodal : mrdetails[i].Lodal,
						Ohaal : mrdetails[i].Ohaal,
						Cdpal : mrdetails[i].Cdpal,
						Traal : mrdetails[i].Traal,
						Othal : mrdetails[i].Othal,
						Curr : traveldetails.AdvanceCur,
						Advrc : mrdetails[i].Advrc,
						Total : mrdetails[i].Total,
						Ctotal : mrdetails[i].Ctotal,
						Cumul : mrdetails[i].Cumul,
						Rmrks : mrdetails[i].Rmrks,
						Chck : "",
						Item:(i+1),
						Changed:mrdetails[i].Changed
//						Reved:mrdetails[i].Reved,
//						Revedd:mrdetails[i].Revedd,
//						Revedt:mrdetails[i].Revedt,
//						Apprvd:mrdetails[i].Apprvd,
//						Apprvdd:mrdetails[i].Apprvdd,
//						Apprvdt:mrdetails[i].Apprvdt,
//						Apprmgr:mrdetails[i].Apprmgr,
//						Apprmgrd:mrdetails[i].Apprmgrd,
//						Apprmgrt:mrdetails[i].Apprmgrt
						
					});
				}
			}
			if (odata.MRExpenses.length == 0) {
				sap.m.MessageToast.show("Please add some Monthly Remittance details");
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
			} else {
				oDataModel1.create("MRTransSet", odata, null, function(oData, response) {
					// oController.uploadFiles(global.ZZ_TRV_REQ);
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
					window.history.go(-1);
					sap.m.MessageToast.show("Updated Successfully", {
						duration : 10000,
						closeOnBrowserNavigation : false
					});
				}, function(error) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
					sap.m.MessageToast.show("Internal Server Error");
				}, true);
			}
		} else {
			sap.m.MessageToast.show("Please enter month and year in all rows");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oController);
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
				var post = oController.onFileUploadto(uploadFile[i].File, sUrl, visareq, header);
			}
		});
	},
	onFileUploadto : function(file, sUrl, visareq, header) {
		var global = sap.ui.getCore().getModel("global").getData();
		var sSlung = global.ZZ_TRV_REQ + "," + global.ZZ_DEP_PERNR + "," + file.name + "," + "MR";
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
	onCalculate : function(evt) {
		var table = oController.getView().byId("cardtable");
		var index = table.indexOfRow(evt.getSource().getParent());
		var tableData = oController.getView().getModel("traveldetails").getData().mrdetails;
		oController.calculateTotal(tableData, index);
		/*
		 * var cells = evt.getSource().getParent().getAggregation("cells"); var
		 * livall = oController.formatAmountValue(cells[3].getValue()); var
		 * lodall = oController.formatAmountValue(cells[4].getValue()); //var
		 * ohaall = oController.formatAmountValue(cells[5].getValue()); var
		 * cauall = oController.formatAmountValue(cells[6].getValue()); var
		 * traall = oController.formatAmountValue(cells[7].getValue()); var
		 * othall = oController.formatAmountValue(cells[8].getValue()); var
		 * adrall = oController.formatAmountValue(cells[11].getValue());
		 * //oController.formatAmountValue(livall);
		 * 
		 * var total = livall + lodall + cauall + traall + othall - adrall;
		 * 
		 * 
		 * 
		 * var index = table.indexOfRow(evt.getSource().getParent());
		 *  // var prevcal =
		 * oController.formatAmountValue(items[index-1].getCells()[11].getValue());
		 * var tableData =
		 * oController.getView().getModel("traveldetails").getData().mrdetails;
		 * 
		 * tableData[index].Total = total; if((index-1)!=-1) { var items =
		 * evt.getSource().getParent().getParent().getRows(); var preCumul =
		 * items[index-1].getCells()[13].getValue(); tableData[index].Cumul =
		 * total + oController.formatAmountValue(preCumul); } else{
		 * tableData[index].Cumul = total + 0; } tableData[index].Lival =
		 * livall; tableData[index].Lodal = lodall; //tableData[index].Ohaal =
		 * ohaall; tableData[index].Cdpal = cauall; tableData[index].Traal =
		 * traall; tableData[index].Advrc = adrall; tableData[index].Othal =
		 * othall;
		 * 
		 * for(var i=index+1;i<tableData.length;i++){ tableData[i].Cumul =
		 * tableData[i].Total + tableData[i-1].Cumul; }
		 * if(tableData[index].Total<0) { tableData[index].Ctotal =
		 * tableData[index].Total; tableData[index].Total = 0; } else{
		 * tableData[index].Ctotal = tableData[index].Total; }
		 * oController.getView().getModel("traveldetails").getData().mrdetails =
		 * tableData;
		 * oController.getView().getModel("traveldetails").refresh(true);
		 */
	},
	checkMonthChange : function(month, year) {
		// var value = evt.getSource().getSelectedKey();
		var flag = true;
		var startdate = oController.getView().getModel("traveldetails").getData().StartDate;
		var smonth = startdate.substring(4, 6);
		var syear = startdate.substring(0, 4);
		if (year != "") {
			if (year == syear) {
				if ((month + 1) < smonth) {
					flag = false;
				}
			} else if (year > syear) {
				flag = true;
			}
		} else {
			flag = true;
		}
		return flag;
	},
	formatAmountValue : function(value) {
		var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
			maxFractionDigits : 2,
			groupingEnabled : true,
			groupingSeparator : ",",
			decimalSeparator : "."
		});
		// return oNumberFormat.format(value);
		if (isNaN(oNumberFormat.parse(value)))
			return 0.00;
		else
			return oNumberFormat.parse(value);
	},
	onOHAChange:function(evt){
		var key = evt.oSource.getSelectedKey();
		var row = evt.getSource().getParent();
		var table = row.getParent();
		var index = table.indexOfRow(row);
		var data = oController.getView().getModel("traveldetails").getData();
		data.mrdetails[index].Ohaal = key;
		oController.getView().getModel("traveldetails").setData(data);
		
	},
	
	onAddressPress:function(oEvent){
		var globalData = sap.ui.getCore().getModel("global").getData();
		globalData.Travel_Request = this.getView().getModel("traveldetails").getData().TravelPlan;
		globalData.Requester = this.getView().getModel("traveldetails").getData().EmpNo;
		sap.ui.getCore().getModel("global").setData(globalData);
		sap.ui.core.routing.Router.getRouter("MyRouter").navTo("onsiteaddress");
	}
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.MonthRemitanceDetls
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.MonthRemitanceDetls
 */
// onExit: function() {
//
// }
});