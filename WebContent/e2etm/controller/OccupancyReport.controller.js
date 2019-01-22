sap.ui.controller("sap.ui.project.e2etm.controller.OccupancyReport", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.OccupancyReport
*/
	onInit: function() {
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onRouteMatched : function(evt) {
			
			
	},
	onCountryChange : function(evt) {
		var filter = new sap.ui.model.Filter({
			path : "MOLGA",
			operator : "EQ",
			value1 : evt.getSource().getSelectedKey()
		});

		
		
		this.getView().byId("ipHcity").getBinding("items").filter([ filter ]);
	},
	onSearch:function(){
		//sap.ui.project.e2etm.util.StaticUtility.onOccCostReportSearch(this,"OccupancyReportSet");	
		var country = this.getView().byId("ipHcnty").getSelectedKey();
		var city = this.getView().byId("ipHcity")?this.getView().byId("ipHcity").getSelectedKey():"";
		var month = this.getView().byId("ipMonth").getSelectedKey();
		var year = this.getView().byId("ipYear").getValue();
		var hcode = this.getView().byId("ipHcode").getSelectedKey();
		this.getView().byId("ipHcnty").setValueState("None");
		this.getView().byId("ipHcity").setValueState("None");
		this.getView().byId("ipYear").setValueState("None");
		
//		if(country == ""){
//			sap.m.MessageToast.show("Please enter Country");
//			oController.getView().byId("ipHcnty").setValueState("Error");
//			return;
//		}
//		if(city == ""){
//			sap.m.MessageToast.show("Please enter City");
//			oController.getView().byId("ipHcity").setValueState("Error");
//			return;
//		}
		if(year == ""){
			sap.m.MessageToast.show("Please enter Year");
			this.getView().byId("ipYear").setValueState("Error");
			return;
		}
		var filterString = "/OccByCountrySet?$filter=Country eq '"+country+"' and City eq '"+city+"' and Month eq '"+month+"'" +
				" and Year eq '"+year+"' and Hcode eq '"+hcode+"'&$expand=OccCity,OccCity/OccReport";
		this.fetchDetails(filterString);
		
	},
	fetchDetails:function(filterString){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
		oComponent.getModel("reservation").read(filterString, null, null, true, jQuery.proxy(function(oData, response) {
			var oModel = new sap.ui.model.json.JSONModel();
			
			for(var i=0;i<oData.results.length;i++){
				oData.results[i].Days = "--";
        		var aItems = oData.results[i].OccCity.results;
        		
        		oData.results[i].results = aItems;
						for (var j = 0; j < aItems.length; j++) {
							aItems[j].Days = "--";
							var bItems = aItems[j].OccReport.results;
							aItems[j].results = bItems;
						}
					}
			oModel.setData(oData.results);
        	
        //	oModel.setData(oData.results);
			this.getView().byId("tblOccList").setModel(oModel,"occReport");
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
		//	this.calculateTotalValues(oData.results);

		},this), jQuery.proxy(function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
			
		},this));
	
	//	this.getView().byId("tblHotelList").bindRows("reservation>/HotelDetailsSet");
	},
	calculateTotalValues:function(results){
		var currencyList = [];
		var oData = [];
	
		for ( var i = 0; i < results.length; i++) {
			if (currencyList.indexOf(results[i].Waers) == -1) {
				currencyList.push(results[i].Waers);
			}
		
		}
		// Paid by emp,paid by cmp,currency
		for ( var i = 0; i < currencyList.length; i++) {
           var totalrent = 0;
			for ( var j = 0; j < results.length; j++) {
				if (results[j].Waers == currencyList[i]) {
					if (results[j].TotalRent != undefined)
						totalrent = totalrent + parseFloat(results[j].TotalRent);
				
				}
				
			}
			oData.push({TotalRent:totalrent,Waers:currencyList[i]});
		}
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData(oData);
		this.getView().byId("tblFooter").setModel(oModel,"footer")
	},
	onLiveSearch:function(evt){
		var value = evt.getSource().getValue();
		
		var aFilters = [new sap.ui.model.Filter({path:"Hname",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Nrooms",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Days",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Rnight",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Notocc",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Occupied",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Percentage",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"TotalRent",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"MonthTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Waers",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Country",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"City",operator:"Contains",value1:value}),
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("tblOccList").getBinding("rows").filter(oFilter);
	},
	onEntriesDisplay:function(evt){
		this.getView().byId("tblOccList").setVisibleRowCount(parseInt(evt.getSource().getSelectedKey()));
	},
//	onExportCSV:function(){			
//		var table = this.getView().byId("tblOccList");
//		var model = table.getModel("occReport");
//		var columns = sap.ui.project.e2etm.util.StaticUtility.getAccReportsExcelColumns(this.getView().byId("tblOccList"));
//		sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Occupancy Report",columns);		
//	},
	onExportCSV:function(){			
		var table = this.getView().byId("tblOccList");	
	
		
	    var aData = table.getModel("occReport").getData();	
		var aHead = this.prepareTableData(aData,"C");
		var aItems=[],bItems = [];
		for(var i=0;i<aData.length;i++){
			aItems = aItems.concat(aData[i].results);
			for(var j=0;j<aData[i].results.length;j++){
				bItems = bItems.concat(aData[i].results[j].results);
			}
		}
		var aItm = this.prepareTableData(aItems,"L");
		var bItm = this.prepareTableData(bItems);
		
		
        var blob,
        wb = {SheetNames:[], Sheets:{}};

        
        var ws1 = XLSX.read(aHead.join(""), {type:"binary"}).Sheets.Sheet1;
        wb.SheetNames.push("Country Wise"); wb.Sheets["Country Wise"] = ws1;
        
      
        var ws2 = XLSX.read(aItm.join(""), {type:"binary"}).Sheets.Sheet1;
        wb.SheetNames.push("City Wise"); wb.Sheets["City Wise"] = ws2;
    //console.log(ws1); console.log(ws2); console.log(wb);
        var ws3 = XLSX.read(bItm.join(""), {type:"binary"}).Sheets.Sheet1;
        wb.SheetNames.push("Apartment Wise"); wb.Sheets["Apartment Wise"] = ws3;
    	blob = new Blob([this.s2ab(XLSX.write(wb, {bookType:'xlsx', type:'binary'}))], {
    	    type: "application/octet-stream"
    	});
    	
    	saveAs(blob, "Occupancy Report.xlsx");
        
	},
	prepareTableData:function(aData,sheet){
		var table = this.getView().byId("tblOccList");
		var columns = table.getColumns();
		var aBuffer = [];
		aBuffer.push("<html><head><style>td{font-weight:900;}</style></head><body><table>");
        aBuffer.push("<tr>");
        $.each(columns,function(index,column){
        	
        var path = column.getTemplate().getBindingInfo("text").parts[0].path;
        	if(sheet == "C"){//Country Sheet
        		if(path == "Hname" || path == "City" || path == "MonthTxt" ||  path == "Days"){
        			return true;
        		}
        	}else if(sheet == "L"){//City Sheet
        		if(path == "Hname" || path == "MonthTxt" || path == "Days"){
        			return true;
        		}
        	}
        	aBuffer.push("<td width='450px' style='font-weight:bold'><div><b>" + column.getLabel().getText() + "</b></div></td>");
        });

        aBuffer.push("</tr>");

 
        for(var i=0;i<aData.length;i++){
        	aBuffer.push("<tr>");
        	for(var j=0;j<columns.length;j++){
        		var property = columns[j].getTemplate().getBindingInfo("text").parts[0].path;
        		if(sheet == "C"){//Country Sheet
            		if(property == "Hname" || property == "City" || property == "MonthTxt" || 
            		   property == "Days"){
            			continue;
            		}
            	}else if(sheet == "L"){
            		if(property == "Hname" || property == "MonthTxt" || property == "Days"){
            			continue;
            		}
            	}
        		aBuffer.push("<td width='450px'>" + aData[i][property] + "</td>");
        	}
        	aBuffer.push("</tr>");
        }
        aBuffer.push("</table></body></html>");
        return aBuffer;
	},
	s2ab:function(s) {
		  var buf = new ArrayBuffer(s.length);
		  var view = new Uint8Array(buf);
		  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		  return buf;
		},


/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.OccupancyReport
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.OccupancyReport
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.OccupancyReport
*/
//	onExit: function() {
//
//	}

});