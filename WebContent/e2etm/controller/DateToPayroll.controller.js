//Booking Details Report
sap.ui.controller("sap.ui.project.e2etm.controller.DateToPayroll", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.DateToPayroll
*/
	onInit: function() {
		this.getView().byId("ipHcnty").setVisible(false);
		
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
	},
	onRouteMatched : function(evt) {
		
	//	this.fetchDetails();
//		if(evt.getParameter("name") == "payrollteamreport")
//		sap.ui.project.e2etm.util.StaticUtility.fetchBookingDetails(this,"RPDP",this.getView().byId("tblPayroll"));
	},
	onSearch:function(){
		//sap.ui.project.e2etm.util.StaticUtility.fetchBookingDetails(this,"RPDP",this.getView().byId("tblPayroll"));
		var repType = "RPDP";
		var table = this.getView().byId("tblPayroll");
		var pernr = this.getView().byId("ipEmpno").getValue();
		var reinr = this.getView().byId("ipReinr").getValue();
		var begda = this.getView().byId("ipBegda").getValue();
		var endda = this.getView().byId("ipEndda").getValue();
		var tocnty = this.getView().byId("ipHcnty")?this.getView().byId("ipHcnty").getSelectedKey():"";
		if(begda!=""&&endda==""){
			sap.m.MessageToast.show("Please enter End Date");
			return;
		}else if(begda==""&&endda!=""){
			sap.m.MessageToast.show("Please enter Start Date");
			return;
		}
		var filterString = "RepType eq '"+repType+"' and Pernr eq '"+pernr+"' and Reinr eq '"+reinr+"' and Begda eq '"+begda+"' and Endda eq '"+endda+"'";
		filterString = filterString + " and Country eq '"+tocnty+"'";
		
		var aFilters = [new sap.ui.model.Filter({path:"RepType",operator:"EQ",value1:repType}),
        	new sap.ui.model.Filter({path:"Pernr",operator:"EQ",value1:pernr}),
         	new sap.ui.model.Filter({path:"Reinr",operator:"EQ",value1:reinr}),
         	new sap.ui.model.Filter({path:"Begda",operator:"EQ",value1:begda}),
         	new sap.ui.model.Filter({path:"Endda",operator:"EQ",value1:endda})];
		
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		oComponent.getModel("reservation").read("/BookingSummarySet",{urlParameters:{
	           "$expand" : "BookingDetailsNav"},async: true, 
	            filters:aFilters,
				success:jQuery.proxy(function(oData, response) {

			
			var oModel = new sap.ui.model.json.JSONModel();
            if(repType == "RPDP"){
            	for(var i=0;i<oData.results.length;i++){
            		var aItems = oData.results[i].BookingDetailsNav.results;
            		oData.results[i].BookingDetailsNav = aItems;
            	}
            		
            	
            	oModel.setData(oData.results);
		    }else{
		    	oModel.setData(oData.results);
		    }			
			table.setModel(oModel,"bookReport");	
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			if(repType == "RPBD"){
				this.calculateTotalValues(oData.results);
			}
			

		},this), error:jQuery.proxy(function(error) {
			
			
		},this)});
	},
	fetchDetails:function(){
		oComponent.getModel("reservation").read("/BookingDetailsSet?$filter=RepType eq 'RPDP'", null, null, true, jQuery.proxy(function(oData, response) {

			
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			this.getView().byId("tblPayroll").setModel(oModel,"bookReport");	

		},this), jQuery.proxy(function(error) {
			
			
		},this));
	},
	onLiveSearch:function(evt){
		var value = evt.getSource().getValue();
	
		var aFilters = [new sap.ui.model.Filter({path:"Pernr",operator:"Contains",value1:value}),
			            new sap.ui.model.Filter({path:"Romno",operator:"Contains",value1:value}),		             
		             	new sap.ui.model.Filter({path:"BegdaTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"EnddaTxt",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Reinr",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Waers",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Days",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Mrent",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"MonthTxt",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Rsize",operator:"Contains",value1:value}),
		             	new sap.ui.model.Filter({path:"Runit",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Drent",operator:"Contains",value1:value}),
		              	new sap.ui.model.Filter({path:"ActRent",operator:"Contains",value1:value}),
		              	new sap.ui.model.Filter({path:"TotalRent",operator:"Contains",value1:value}),
		            	new sap.ui.model.Filter({path:"Waers",operator:"Contains",value1:value}),
		           
		             	];
		
		var oFilter = new sap.ui.model.Filter(aFilters,false);
		this.getView().byId("tblPayroll").bindRows({
			path: "bookReport>/",
		
			parameters: {					
				arrayNames:['BookingDetailsNav']
			},
			filters: oFilter
		});
	//	this.getView().byId("tblPayroll").getBinding("rows").filter(oFilter);
	},
	onEntriesDisplay:function(evt){
		this.getView().byId("tblPayroll").setVisibleRowCount(parseInt(evt.getSource().getSelectedKey()));
	},
	onExportCSV:function(){			
		var table = this.getView().byId("tblPayroll");	
		var model = table.getModel("bookReport");
	//	var columns = sap.ui.project.e2etm.util.StaticUtility.getAccReportsExcelColumns(table);
		//sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Booking Details",columns);		
		
	    var aData = table.getModel("bookReport").getData();	
		var aHead = this.prepareTableData(aData);
		var aItems = [];
		for(var i=0;i<aData.length;i++){
			aItems = aItems.concat(aData[i].BookingDetailsNav);
		}
		var aItm = this.prepareTableData(aItems);
		
        var blob,
        wb = {SheetNames:[], Sheets:{}};
//        var ws1 = XLSX.read(aHead.join(""), {type:"binary"}).Sheets.Sheet1;
//        wb.SheetNames.push("Summary"); wb.Sheets["Summary"] = ws1;
        
        var ws1 = XLSX.read(aHead.join(""), {type:"binary"}).Sheets.Sheet1;
        wb.SheetNames.push("Summary"); wb.Sheets["Summary"] = ws1;
        
      
        var ws2 = XLSX.read(aItm.join(""), {type:"binary"}).Sheets.Sheet1;
        wb.SheetNames.push("Details"); wb.Sheets["Details"] = ws2;
    //console.log(ws1); console.log(ws2); console.log(wb);
    	blob = new Blob([this.s2ab(XLSX.write(wb, {bookType:'xlsx', type:'binary'}))], {
    	    type: "application/octet-stream"
    	});
    	
    	saveAs(blob, "Booking Details.xlsx");
        
	},
	prepareTableData:function(aData){
		var table = this.getView().byId("tblPayroll");
		var columns = table.getColumns();
		var aBuffer = [];
		aBuffer.push("<html><head><style>td{font-weight:900;}</style></head><body><table>");
        aBuffer.push("<tr>");
        $.each(columns,function(index,column){
        	aBuffer.push("<td width='450px' style='font-weight:bold'><div><b>" + column.getLabel().getText() + "</b></div></td>");
        });

        aBuffer.push("</tr>");

 
        for(var i=0;i<aData.length;i++){
        	aBuffer.push("<tr>");
        	for(var j=0;j<columns.length;j++){
        		var property = columns[j].getTemplate().getBindingInfo("text").parts[0].path;
        		aBuffer.push("<td width='450px'>" + aData[i][property] + "</td>");
        	}
        	aBuffer.push("</tr>");
        }
        aBuffer.push("</table></body></html>");
        return aBuffer;
	},
//	onExportCSV:function(){			
//		var table = this.getView().byId("tblPayroll");
//		var columns = table.getColumns();
//		var model = table.getModel("bookReport");
//	//	var columns = sap.ui.project.e2etm.util.StaticUtility.getAccReportsExcelColumns(table);
//		//sap.ui.project.e2etm.util.StaticUtility.exportCSV(table,model,"Booking Details",columns);		
//		var aBuffer = [];
////		aBuffer.push("<html><body><table>");
//        aBuffer.push("<columns>");
//        $.each(columns,function(index,column){
//        	aBuffer.push("<column>"+column.getLabel().getText() + "</column>");
//        });
////        while (!(oColumn = oColumns.next()).done) {
////            aBuffer.push("<th>" + jQuery.sap.encodeXML(oColumn.value.name) + "</th>");
////        }
//
//        aBuffer.push("</columns>");
//        aBuffer.push("<rows>");
//        var aData = table.getModel("bookReport").getData();	
//        for(var i=0;i<aData.length;i++){
//        	aBuffer.push("<row>");
//        	for(var j=0;j<columns.length;j++){
//        		var property = columns[j].getTemplate().getBindingInfo("text").parts[0].path;
//        		aBuffer.push("<cell>" + aData[i][property] + "</cell>");
//        	}
//        	aBuffer.push("</row>");
//        }
//        aBuffer.push("</rows>");
//        
//        
//        var blob,
//      	wb = {SheetNames:[], Sheets:{}};
//      var ws1 = XLSX.read(aBuffer.join(""), {type:"binary"}).Sheets.Sheet1;
//      wb.SheetNames.push("Sheet1"); wb.Sheets["Sheet1"] = ws1;
//      
//      var ws2 = XLSX.read(aBuffer.join(""), {type:"binary"}).Sheets.Sheet1;
//      wb.SheetNames.push("Sheet2"); wb.Sheets["Sheet2"] = ws2;
//    //console.log(ws1); console.log(ws2); console.log(wb);
//    	blob = new Blob([this.s2ab(XLSX.write(wb, {bookType:'xlsx', type:'binary'}))], {
//    	    type: "application/xml"
//    	});
//    	
//    	saveAs(blob, "test.xlsx");
//        
//	},
	s2ab:function(s) {
		  var buf = new ArrayBuffer(s.length);
		  var view = new Uint8Array(buf);
		  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		  return buf;
		},


    onExpandFirstLevel: function () {
        var oTreeTable = this.getView().byId("tblPayroll");
        var rows = oTreeTable.getModel("bookReport").getData();	;
        for(var i=0;i<rows.length;i++){
        	 oTreeTable.expand(i);
        }
       
	},
	onCollapse:function(){
        var oTreeTable = this.getView().byId("tblPayroll");
        oTreeTable.collapseAll();
	}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.DateToPayroll
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.DateToPayroll
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.DateToPayroll
*/
//	onExit: function() {
//
//	}

});