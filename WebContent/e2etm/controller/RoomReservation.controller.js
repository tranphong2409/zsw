jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
sap.ui.controller("sap.ui.project.e2etm.controller.RoomReservation", {

/**
 * Called when a controller is instantiated and its View controls (if available)
 * are already created. Can be used to modify the View before it is displayed,
 * to bind event handlers and do other one-time initialization.
 * 
 * @memberOf e2etm.view.RoomReservation
 */
	onInit: function() {

		gTop = 3;
		this.renderedObj = $.Deferred();
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(this.onRouteMatched, this);
		var resHtml = "<div class='resGreenColor'/><div class='resLine'/><div style='font-family:Arial;font-size:0.875rem'>Available</div>";
		this.getView().byId("resHtmlGreen").setContent(resHtml);
		resHtml = "<div class='resYellowColor'/><div class='resLine'/><div style='font-family:Arial;font-size:0.875rem'>Blocked</div>";
		this.getView().byId("resHtmlYellow").setContent(resHtml);
		resHtml = "<div class='resRedColor'/><div class='resLine'/><div style='font-family:Arial;font-size:0.875rem'>Booked</div>";
		this.getView().byId("resHtmlRed").setContent(resHtml);
		resHtml = "<div class='resGrayColor'/><div class='resLine'/><div style='font-family:Arial;font-size:0.875rem'>Blocked for Maintenance</div>";
		this.getView().byId("resHtmlGray").setContent(resHtml);
		this.afterRender = { "onAfterRendering": function (evt) {

//	    		var obj = $("[class*='resMLinks']");//[class='?<!colorGradient']"
//	    		for(var prop in obj){
//	    			var id = obj[prop].id;
//	    			if(id){
//	    				
//	    			  var status =  sap.ui.getCore().byId(id).data("Status");
//
//	    			  var time = sap.ui.getCore().byId(id).data("Time").results;
//	    			  if(time.length!=0){
//	    			  var diffTime = 0;
//	    			  for(var i=0;i<time.length;i++){
//	    				  var checkInDateTime = this.convertToDateObj(time[i].Date,time[i].Chkin);
//	    				  var checkOutDateTime = this.convertToDateObj(time[i].Date,time[i].Chkot);
//	    				  diffTime = diffTime + (Math.round((checkOutDateTime.getTime() - checkInDateTime.getTime()) / (1000 * 60 * 60)));
//	    			  }
//	    			  if(diffTime!=24){
//	    				  sap.ui.getCore().byId(id).data("Status",status+"_A");
//	    				   status =  sap.ui.getCore().byId(id).data("Status");
//	    			  }
//
//	    			  }
//	    			  var statArr = status.split("_");
//	    			  if(statArr.length!=0){
//	    				  statArr.sort();
//	    				  status = statArr.join("_");
//	    			  }
//	    			  sap.ui.getCore().byId(id).addStyleClass("colorGradient_"+status);
//	    			}
//	    		}
			var content = this.getView().byId("resView").getContent();
			for(var i=0;i<content.length;i++){
				var length = content[i].getHeaderToolbar().getContent().length;
				var box = content[i].getHeaderToolbar().getContent()[length - 1];
				var hcode = content[i].getBindingContext("resStatusModel").getModel().getProperty(
						content[i].getBindingContext("resStatusModel").sPath).Hcode;
				var aFilters = [new sap.ui.model.Filter({
					path : "Hcode",
					operator : "EQ",
					value1 : hcode})];
				box.bindItems({path:"reservation>/GetRoomDetlsSet",length:500,template:new sap.ui.core.Item({key:"{reservation>Romno}",text:"{reservation>Romno}"}),
					                                       filters:aFilters});
				
				
				
			}
	    		 this.renderedObj.resolve();
//	     }
	     }};
		

	},
	onRouteMatched:function(evt){
		if(evt.getParameter("name")=="reservation"){
			vSkip = 0;
			var oArgs = evt.getParameter("arguments");
			var model = new sap.ui.model.json.JSONModel();
			model.setData({Reinr:oArgs.reinr,Pernr:oArgs.pernr,DepType:this.getDepuType()});
			this.getView().setModel(model,"viewData");
			if(this.getView().byId("resView").getModel("resStatusModel")){
	    		this.getView().byId("resView").setModel(null,"resStatusModel");
	    	}
			if(oArgs.reinr!=""&&oArgs.reinr){
				this.fetchTrvData(oArgs.reinr);
			}
		}
	},
	fetchTrvData:function(reinr){
		oComponent.getModel("reservation").read("ManualTpListSet(Reinr='" + reinr + "',Pernr='',Trvky='')", null, null, true, 
				jQuery.proxy(function(oData, response) {
		this["Travel"] = oData;
		this.getView().byId("ipHcnty").setSelectedKey(oData.Tocnt);
		
		this.getView().byId("ipHcity").setSelectedKey(oData.Toloc);
		this.onCountryChange();
		this.onCityChange();
		this.getView().byId("ipBegda").setValue(oData.Begda);
		this.getView().byId("ipEndda").setValue(oData.Endda);
		
		this.onSearch();

		},this), function(error) {
			
		});
//		 this.getView().bindElement(
//					{
//					  path:"/ManualTpListSet(Reinr='" + reinr + "',Pernr='',Trvky='')",
//					  model : "reservation",
//					  events:{
//						  dataReceived:function(oEvent){
//							  console.log(oEvent);
//						  }
//					  }
//				    });
	},
	onCountryChange : function(evt) {
		var filter = new sap.ui.model.Filter({
			path : "MOLGA",
			operator : "EQ",
			value1 : this.getView().byId("ipHcnty").getSelectedKey()
		});
		this.getView().byId("ipHcity").getBinding("items").filter([ filter ]);
		
	},
	onCityChange:function(evt){
		var filter = new sap.ui.model.Filter({
			path : "Hcnty",
			operator : "EQ",
			value1 : this.getView().byId("ipHcnty").getSelectedKey()
		});
		
		var filter1 = new sap.ui.model.Filter({
			path : "Hcity",
			operator : "EQ",
			value1 : this.getView().byId("ipHcity").getSelectedKey()
		});
		
		var oFilter = [filter,filter1];
		this.getView().byId("ipHotel").bindAggregation("items",{path:"reservation>/HotelF4Set",
			                                      template:new sap.ui.core.Item({text:"{reservation>Hname}",key:"{reservation>Hcode}"}),
			                                      filters:oFilter});
		
	},
	onSearch:function(evt){
		var oView = this.getView();
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		jQuery.sap.delayedCall(200, this, jQuery.proxy(function() {
		var aInputs = [
			oView.byId("ipHcnty"),
			oView.byId("ipHcity"),
			oView.byId("ipBegda"),
			oView.byId("ipEndda")
		];
		var bError = false;

		jQuery.each(aInputs, function (i, oInput) {
			var value;
			oInput.setValueState("None");
			if(oInput.getId().indexOf("ipHcnty")!=-1 || oInput.getId().indexOf("ipHcity")!=-1)
			    value = oInput.getSelectedKey();
			else
				value = oInput.getValue();
			
			if(value==""){
				oInput.setValueState("Error");
				bError = true;				
				return false;
			}
		});
		if(bError){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageToast.show("Please enter all fields marked with *");
			return;
		}
		
//		jQuery.sap.delayedCall(500, this, jQuery.proxy(function() {
            this.getView().byId("resView").destroyContent();
//        	},this));
		
		var country = oView.byId("ipHcnty").getSelectedKey();
		var city = oView.byId("ipHcity").getSelectedKey();
		var begda = this.getView().byId("ipBegda").getValue();
		var endda = this.getView().byId("ipEndda").getValue();
		var hCode = this.getView().byId("ipHotel").getSelectedKey();
		var rSizeFrm = this.getView().byId("ipSizeFrm").getValue();
		var rSizeTo =  this.getView().byId("ipSizeTo").getValue();
		var rUnit = this.getView().byId("ipRunit").getSelectedKey();
		var noPers = this.getView().byId("ipNoP").getValue();
		
		
		
		var aFilters = [new sap.ui.model.Filter({path:"Hcnty",operator:"EQ",value1:country}),
         	new sap.ui.model.Filter({path:"Hcity",operator:"EQ",value1:city}),
         	new sap.ui.model.Filter({path:"HotelToRoomListNav/Begda",operator:"EQ",value1:begda}),
         	new sap.ui.model.Filter({path:"HotelToRoomListNav/Endda",operator:"EQ",value1:endda}),
         	new sap.ui.model.Filter({path:"HotelToRoomListNav/Rsize",operator:"BT",value1:rSizeFrm,value2:rSizeTo}),   
         	new sap.ui.model.Filter({path:"HotelToRoomListNav/Runit",operator:"EQ",value1:rUnit})
         	
         	];
		if(hCode!="")
			aFilters.push(new sap.ui.model.Filter({path:"Hcode",operator:"EQ",value1:hCode}));
		
		if(noPers !="")
			aFilters.push(new sap.ui.model.Filter({path:"HotelToRoomListNav/Nopers",operator:"EQ",value1:noPers}));
		
		var sUri = "/HotelDetailsSet?$filter=Hcnty eq '"+country+"' and Hcity eq '"+city+"' and RoomListToStatusNav/Begda eq '"+begda+"' and RoomListToStatusNav/Endda eq '"+endda+"'&$expand=HotelToRoomListNav,HotelToRoomListNav/RoomListToStatusNav";
	
	
        var vSkip = 0;
        
//        if(this.getView().byId("resView").getModel("resStatusModel"))
//        this.getView().byId("resView").getModel("resStatusModel").setData({});

        
		this.getView().getModel("reservation").read("/HotelDetailsSet", {urlParameters:{ "$top":gTop,"$skip":vSkip,
			           "$expand" : "HotelToRoomListNav/RoomListToMonthNav/RoomDetlsByDateNav/RoomDetlsByDateToTimeNav" },
		
			filters:aFilters,
			async:true,
			success: jQuery.proxy(function(oData, response) {
		    var results = oData.results;
		   
		 //  if(!(this.getView().byId("resView").getModel("resStatusModel"))){
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			this.getView().byId("resView").setModel(oModel,"resStatusModel");
//		    }else{
//		    	this.getView().byId("resView").getModel("resStatusModel").setData(oData.results);
//		 
//		    }
//		    }else{
//		    	var results= this.getView().byId("resView").getModel("resStatusModel").getData();
//		    	var bFound = false;
//		    	//var finalSet = jQuery.extend(results,oData.results);
//		    	for(var i=0;i<oData.results.length;i++){
//		    		for(var j=0;j<results.length;j++){
//		    			if(oData.results[i].Hcode == results[j].Hcode){
//		    			//	if(results[j].HotelToRoomListNav.results.length!=oData.results[i].HotelToRoomListNav.results.length)
//		    				     results[j].HotelToRoomListNav.results = results[j].HotelToRoomListNav.results.concat(oData.results[i].HotelToRoomListNav.results);
////		    				else
////		    					 results[j].HotelToRoomListNav.results = oData.results[i].HotelToRoomListNav.results;
//		    				bFound = true;
//		    			}
//		    		}
//		    		if(!(bFound)){
//		    			results.push(oData.results[i]);
//		    		}
//		    	}
//		  //  	this.getView().byId("resView").getModel("resStatusModel").setData(results);
//		    	this.getView().byId("resView").getModel("resStatusModel").updateBindings(false);
//		    //	this.getView().byId("resView").getModel("resStatusModel").refresh(true);
//		    }
			
			var aData = this.getView().getModel("viewData").getData();
			aData.DepType = this.getDepuType();
			this.getView().getModel("viewData").setData(aData);
			

			// this["render"] = true;
			 this.renderedObj = $.Deferred();
			// vSkip = vSkip + vTop;
			 sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			 this.getView().byId("resView").addEventDelegate(this.afterRender, this);
		        $.when(this.renderedObj).done(jQuery.proxy(function(){
		        
		        	 this.getView().byId("resView").removeEventDelegate(this.afterRender);
		        	
		          },this));
		

		},this),error: function(error) {
		
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
		}});
		
    	
		},this));
		
	},
	onMore:function(){
		vSkip = vSkip + vTop;
		this.onSearch();
	},
	onRoomPress:function(evt){
		var roomData = evt.getSource().getBindingContext("resStatusModel").getModel().getProperty(evt.getSource().getBindingContext("resStatusModel").sPath);
		var model = new sap.ui.model.json.JSONModel();
		model.setData(roomData);
		var roomPopover = this.getView().byId("roomPopover");
		if(!roomPopover){
			roomPopover = sap.ui.xmlfragment(this.getView().getId(),"sap.ui.project.e2etm.fragment.reservation.RoomPopover",
				this);
		}
		roomPopover.bindElement("/");
		roomPopover.setModel(model);
		roomPopover.openBy(evt.getSource());
		//roomPopover.open();
	},
	onNext:function(evt){
		var source = evt.getSource();
		var list = evt.getSource().getParent().getParent();
		var cData = source.getCustomData();
		var vSkip;
		
		if(list.data("Skip") == undefined){
			list.data("Skip",0);
			vSkip = 0;
		}
		
		if(list.data("Top") == undefined){
			list.data("Top",gTop);
		}
		
	
		var vTop = list.data("Top");
		vSkip = parseInt(list.data("Skip")) + parseInt(list.data("Top"));
		list.data("Skip",vSkip.toString());
		
		this.prepareData(list,vSkip,vTop,"NXT");
		
	},
	onRoomSelect:function(evt){
		var source = evt.getSource();
		var list = source.getParent().getParent();
	    var item = source.getSelectedItem();
	    var index = source.indexOfItem(item);
	  //  var totalItems = source.getItems().length

        list.data("Top",gTop);
        list.data("Skip",index);
		list.setBusy(true);
//		jQuery.sap.delayedCall(500, this, jQuery.proxy(function() {
//			this.prepareData(list,index,gTop);  
//        },this));
		this.prepareData(list,index,gTop); 
	},
	onPrevious:function(evt){
		var source = evt.getSource();
		var list = evt.getSource().getParent().getParent();
	
		var vSkip;
		
		if(list.data("Page") == undefined || list.data("Page") == 1)
			return;
		
		if(list.data("Skip") == undefined){
			list.data("Skip",0);
			vSkip = 0;
		}
		
		if(list.data("Top") == undefined){
			list.data("Top",gTop);
		}
		
		
	
		var vTop = list.data("Top");
		var pages = list.data("Page") - 1;
	    vSkip = (parseInt(list.data("Top")) * pages) - parseInt(list.data("Top"));
		
		//vSkip = parseInt(list.data("Skip")) - (parseInt(list.data("Top")) * pages);
		list.data("Skip",vSkip.toString());
		this.prepareData(list,vSkip,vTop,"PRE");
		
				
	},
	fetchPageData:function(evt){
		var list = this.oLink.getParent().getParent().getParent().getParent().getParent();
		var vTop = list.data("Top");		
	    var vSkip = list.data("Skip");	
	    if(vTop == undefined)
	    	vTop = gTop;
	    if(vSkip == undefined)
	    	vSkip = 0;
	    list.setBusy(true);
		this.prepareData(list,vSkip,vTop);
	},
	prepareData:function(list,vSkip,vTop,type){
		list.setBusy(true);
		var oCtx = list.getBindingContext("resStatusModel");
		var data = oCtx.getModel().getProperty(list.getBindingContext("resStatusModel").sPath);
		var oView = this.getView();
		var country = oView.byId("ipHcnty").getSelectedKey();
		var city = oView.byId("ipHcity").getSelectedKey();
		var begda = this.getView().byId("ipBegda").getValue();
		var endda = this.getView().byId("ipEndda").getValue();
	

		
		var aFilters = [new sap.ui.model.Filter({path:"Hcnty",operator:"EQ",value1:country}),
                    	new sap.ui.model.Filter({path:"Hcity",operator:"EQ",value1:city}),
                     	new sap.ui.model.Filter({path:"HotelToRoomListNav/Begda",operator:"EQ",value1:begda}),
                     	new sap.ui.model.Filter({path:"HotelToRoomListNav/Endda",operator:"EQ",value1:endda})];
	
			aFilters.push(new sap.ui.model.Filter({path:"Hcode",operator:"EQ",value1:data.Hcode}));
			
		list.data("deferred",$.Deferred());
	
		this.fetchData(aFilters,vSkip,vTop,list.data("deferred"));
		list.data("deferred").done(jQuery.proxy(function(results){
			var oCtx = list.getBindingContext("resStatusModel");
			var odata = oCtx.getModel().getProperty(list.getBindingContext("resStatusModel").sPath);
			if(results.length!=0){
			      odata.HotelToRoomListNav.results = results[0].HotelToRoomListNav.results;
			 if(type == "NXT"){  
			  	if(list.data("Page") == undefined){
			  		list.data("Page",1);
			  	}
			  		list.data("Page",list.data("Page") + 1);
			  
			}else if(type == "PRE"){
				list.data("Page",list.data("Page") - 1);
			}
			}

			list.getBinding("items").refresh(true);
			list.setBusy(false);
		},this));

	},
	fetchData:function(aFilters,vSkip,vTop,defObj){
		
		this.getView().getModel("reservation").read("/HotelDetailsSet", {urlParameters:{ "$top":vTop,"$skip":vSkip,
	           "$expand" : "HotelToRoomListNav/RoomListToMonthNav/RoomDetlsByDateNav/RoomDetlsByDateToTimeNav" },

	filters:aFilters,
	success: jQuery.proxy(function(oData, response) {
        
           defObj.resolve(oData.results);
 


},this),error: function(error) {

	sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
}});
	},
	

/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.RoomReservation
 */
// onBeforeRendering: function() {
//
// },

/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.RoomReservation
 */
	onDateSelect:function(evt){
		this.oLink = evt.getSource();
//		if(this.oLink.data("Status")=="A" || this.oLink.data("Status") == "B"){
		var dateSelect = this.getView().byId("dtRangeSelect");
		if(!dateSelect){
		 dateSelect = sap.ui.xmlfragment(this.getView().getId(),"sap.ui.project.e2etm.fragment.reservation.OnSelectDatePop",
				this);
		 this.getView().addDependent(dateSelect);
		}
		this.setProperties(this.oLink.data("Status"));
//		if(this.oLink.data("Status") == "A" && !(this.enableActions()))
//			return;
		
		var oData = {bookedDetails:[]};
		if(this.getDepuType()=="DOME"){
		var timeInfo = 	this.oLink.data("Time").results;
		for(var i=0;i<timeInfo.length;i++){
			oData.bookedDetails.push(timeInfo[i]);
		}
		}
		else{		
		var data = evt.getSource().getBindingContext("resStatusModel").getModel().getProperty(evt.getSource().getBindingContext("resStatusModel").sPath);
		oData.bookedDetails.push(data);
		}
		var model = new sap.ui.model.json.JSONModel();
		
		model.setData(oData);
		this.getView().byId("dtRangeSelect").bindElement("/");
		this.getView().byId("dtRangeSelect").setModel(model);
		this.getView().byId("dtRangeSelect").getModel().refresh(true);
		this.getView().byId("ipPopDtFrm").setValue(this.oLink.data("Date"));
		this.getView().byId("ipPopDtTo").setValue(this.oLink.data("Date"));
		this.getView().byId("txtRemarks").setValue("");
		
	//	dateSelect.openBy(evt.getSource());
		dateSelect.open();
//		}

	},
	onMouseOver:function(evt){
		var id = evt.currentTarget.id;
		var source = sap.ui.getCore().byId(id);
		var detls = sap.ui.getCore().byId("resFragmentDetls--detlsPages");
		if(!detls){
		 detls = sap.ui.xmlfragment("resFragmentDetls","sap.ui.project.e2etm.fragment.reservation.EmployeeDetails",
					this);
		
		this.getView().addDependent(detls);
		}
		
		this.pop = new sap.m.ResponsivePopover({showHeader:false,placement:"Top",content:[detls]});
		var oData = {bookedDetails:[]};
		
		if(this.getDepuType()=="DOME"){
		var timeInfo = 	source.data("Time").results;
		for(var i=0;i<timeInfo.length;i++){
			oData.bookedDetails.push(timeInfo[i]);
		}
		}
		else{		
		var data = source.getBindingContext("resStatusModel").getModel().getProperty(evt.getSource().getBindingContext("resStatusModel").sPath);
		oData.bookedDetails.push(data);
		}
		var model = new sap.ui.model.json.JSONModel();
		
		model.setData(oData);
		this.pop.bindElement("/");
		this.pop.setModel(model);
		this.pop.openBy(source);
		
	},
	onMouseLeave:function(evt){
		this.pop.close();
	},
	setProperties:function(status){

		this.getView().byId("btnRelease").setVisible(false);
		this.getView().byId("btnBlock").setVisible(false);
		this.getView().byId("btnMaint").setVisible(false);
		this.getView().byId("btnBook").setVisible(false);
		this.getView().byId("detlsPages").setVisible(false);
		this.getView().byId("ipTimeFrm").setVisible(false);
		this.getView().byId("ipTimeTo").setVisible(false);
		this.getView().byId("hAccType").setVisible(true);
//		if(this.enableActions()){
		if(status.indexOf("B")!=-1){		
			this.getView().byId("btnRelease").setVisible(true);
			this.getView().byId("btnBook").setVisible(true);
			this.getView().byId("btnBlock").setVisible(true);
			this.getView().byId("detlsPages").setVisible(true);
		} if(status.indexOf("A")!= -1){
			if(this.enableActions()){
			this.getView().byId("btnBlock").setVisible(true);
			this.getView().byId("btnBook").setVisible(true);
			
			}
			this.getView().byId("btnMaint").setVisible(true);
		}if(status.indexOf("C")!=-1){
			this.getView().byId("btnRelease").setVisible(true);
			this.getView().byId("btnBlock").setVisible(true);
			this.getView().byId("btnBook").setVisible(true);
			this.getView().byId("detlsPages").setVisible(true);
		}if(status.indexOf("M")!=-1){
			this.getView().byId("hAccType").setVisible(false);
			this.getView().byId("btnRelease").setVisible(true);
		//	this.getView().byId("btnBlock").setVisible(true);
			this.getView().byId("detlsPages").setVisible(true);
		}
//		}
		if(this.getDepuType()=="DOME"){
		    this.getView().byId("ipTimeFrm").setVisible(true);
		    this.getView().byId("ipTimeTo").setVisible(true);
		}
		
	},
	getDepuType:function(){
		if(this.getView().byId("ipHcnty").getSelectedKey()=="")
			return undefined;
		else{
		if(this.getView().byId("ipHcnty").getSelectedKey()=="IN")
			return "DOME";
		return "DOME";
		}
	},
	enableActions:function(){
		var reinr = this.getView().getModel("viewData").getData().Reinr;
		if(reinr!=""&&reinr){
			return true;
		}
		return false;
	},
	onClose:function(evt){
		this.getView().byId("dtRangeSelect").close();
	},
	onSubmit:function(evt){
		var errorMsg = "";	
		var createData = {};
		var source = evt.getSource();
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
		jQuery.sap.delayedCall(2000, this, function () {			
		
		var path = this.oLink.getBindingContext("resStatusModel").sPath;
		var oData = this.oLink.getBindingContext("resStatusModel").getModel().getProperty(path);
		createData.Hcode = oData.Hcode;
		createData.Romno = oData.Romno;
	    createData.Status = this.getStatus(source.getId());

   		createData.Reinr = this.getView().getModel("viewData").getData().Reinr;
    	createData.Pernr = this.getView().getModel("viewData").getData().Pernr;
    	var orgStatus = this.oLink.data("Status");
    	if((createData.Reinr==""||!(createData.Reinr))&&createData.Status != "M"){
    	  var path = sap.ui.getCore().byId(this.getView().byId("detlsPages").getActivePage()).getBindingContext().sPath;
    	  var data =  sap.ui.getCore().byId(this.getView().byId("detlsPages").getActivePage()).getModel().getProperty(path);
    	  createData.Reinr = data.Reinr;
    	  orgStatus = data.Status;
    	}
    	
    	if(createData.Status == "M"){
    		createData.Reinr = '9999999999';
    		createData.Pernr = '99999999';
    	}else if(createData.Status == "A"){
    		if(orgStatus == "M"){
    		createData.Reinr = '9999999999';
    		createData.Pernr = '99999999';
    		}
    	}	
		
	
		
			if(this.getDepuType()=="DOME"){
				 if(this.getView().byId("ipTimeFrm").getValue()==""){
					 this.getView().byId("ipTimeFrm").setValue("000000");
				 }
				 if(this.getView().byId("ipTimeTo").getValue()==""){
					 this.getView().byId("ipTimeTo").setValue("235959");
				 }
				 
				 createData.Chkin = this.getView().byId("ipTimeFrm").getValue();
				 createData.Chkot = this.getView().byId("ipTimeTo").getValue();	
			}else{
				 createData.Chkin = '000000';
				 createData.Chkot =  '235959';	
			}
			 createData.Begda = this.getView().byId("ipPopDtFrm").getValue();;
			 createData.Endda = this.getView().byId("ipPopDtTo").getValue();	
			
			
		errorMsg = this.validateDateRange(createData.Begda,createData.Endda,createData);	
		if(errorMsg.Message!=""){
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			sap.m.MessageBox.show(errorMsg.Message, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Error",
				actions: [sap.m.MessageBox.Action.OK],
				id: "messageBoxId2",
				defaultAction: sap.m.MessageBox.Action.OK,
				details: errorMsg.Details,
				styleClass:"sapUiSizeCompact",
				contentWidth: "100px"
			});
		}else{
			createData.AcType = "";
			if(this.getView().byId("rbtnOha").getSelected() && createData.Status!="M"){
				createData.AcType = "OHA";
			}
             this.updateRoomStatus(createData);
		}
		
		});
	
        		
	},
	getStatus:function(id){
		if(id.indexOf("btnBook")!=-1)
			return "C";
		else if(id.indexOf("btnBlock")!=-1)
			return "B";
		else if(id.indexOf("btnRelease")!=-1)
			return "A";
		else if(id.indexOf("btnMaint")!=-1)
		    return "M";
	},
	
	updateRoomStatus:function(odata){
		odata.Rmrks = this.getView().byId("txtRemarks").getValue();
		this.getView().getModel("reservation").create("/RoomStatusSet", odata, {
			success:jQuery.proxy(function(oData, response) {	
			if(odata.Status == "A")
			     sap.m.MessageToast.show("Room has been made available for booking");
			else if(odata.Status == "B")
			     sap.m.MessageToast.show("Room has been blocked successfully");
			else if(odata.Status == "C")
			     sap.m.MessageToast.show("Room has been booked successfully");
			else if(odata.Status == "M")
			     sap.m.MessageToast.show("Room has been blocked successfully");
			
			this.getView().byId("dtRangeSelect").close();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
		//	this.onSearch();
			this.fetchPageData();
			
		},this),
		error: jQuery.proxy(function(error) {
			sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
			var message,details;
			if(error.responseText){
				details = JSON.parse(error.responseText).error.message.value;	
				message = "Error";
			}else{
				details = JSON.parse(error.response.body).error.message.value;				
				message = "You already perform action on the below date.Please check";
			}
			sap.m.MessageBox.show(message, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Error",
				actions: [sap.m.MessageBox.Action.OK],
				id: "messageBoxId3",
				defaultAction: sap.m.MessageBox.Action.OK,
				details: details,
				styleClass:"sapUiSizeCompact",
				contentWidth: "100px"
			});
			
		},this)});
	},
	validateDateRange:function(begda,endda,createData){
		var index;
		var errorMsg = {Message:""};
//		var chckFrm = this.getView().byId("chckFrom");
//		var chckTo = this.getView().byId("chckTo");
		 this.getView().byId("ipPopDtTo").setValueState("None");
		 this.getView().byId("ipPopDtFrm").setValueState("None");
		 this.getView().byId("ipTimeTo").setValueState("None");
		 var reinr = this.getView().getModel("viewData").getData().Reinr;
        var message;
        var statusArr = [];
        var status1 = createData.Status;
		var bOha = this.getView().byId("rbtnOha").getSelected();
//		if(bOha){
//			statusArr = ["A","B","C"];
//		}else{
        if(status1 == "C"){
        	message = "Unable to book rooms on following dates.Please book the rooms individually";
        	statusArr = ["A","B"];
        }else if(status1 == "B"){
        	message = "Unable to block rooms on following dates.Please block the rooms individually";
        	statusArr = ["A","C"];
        }else if(status1 == "A"){
        	message = "Unable to release rooms on following dates.Please release the rooms individually";
        	statusArr = ["B","C","M"];
        }else if(status1 == "M"){
        	message = "Unable to block rooms on following dates.Please block the rooms individually";
        	statusArr = ["A"];
        }
//		}
		
		var obj = $(".resMLinks");
		var sourceId = this.oLink.getId();
		var status = this.oLink.data("Status");
		for(var prop in obj){
			if(obj[prop].id == sourceId){
					index = prop;
					break;
			}
		}	
		var startDate,trStartDate,startMsg,endMsg;
		var endDate,trEndDate;
		var domeFlag = false;
		if(this.getDepuType()=="DOME")
			{
			domeFlag = true;			
			}
		
		 startDate = this.convertToDateObj(begda);
		 endDate = this.convertToDateObj(endda);

		if(startDate == this.convertToDateObj(this.oLink.data("Date")) && 
		   endDate == this.convertToDateObj(this.oLink.data("Date"))){
			return errorMsg;
		}
		
		if(status1!="A"){
		if(reinr!=""&&reinr){
			trStartDate = this.convertToDateObj(this["Travel"].Begda);
			trEndDate = this.convertToDateObj(this["Travel"].Endda);
			startMsg = "Booking Start date should lie between Travel Start Date and End Date";
			endMsg = "Booking end date should lie between Travel Start Date and End Date";
			
		}else{			
			trStartDate = this.convertToDateObj(this.getView().byId("ipBegda").getValue());
			trEndDate = this.convertToDateObj(this.getView().byId("ipEndda").getValue());
			startMsg = "Booking Start date should lie between search Start Date and End Date";
			endMsg = "Booking end date should lie between search Start Date and End Date";
		}
		
		if(!(startDate>=trStartDate && startDate <=trEndDate)){
			errorMsg.Message = startMsg;
			return errorMsg;
		}
		if(!(endDate>=trStartDate && endDate <=trEndDate)){
			errorMsg.Message = endMsg;
			return errorMsg;
		}
		}
		
		
		
		if(domeFlag){
			var  startDateTime = this.convertToDateObj(begda,createData.Chkin);
			var  endDateTime = this.convertToDateObj(endda,createData.Chkot);
			 if(endDateTime<startDateTime){
				 this.getView().byId("ipPopDtTo").setValueState("Error");
				 this.getView().byId("ipTimeTo").setValueState("Error");
				 errorMsg = {Message:"Please enter End Date above Start Date",Details:""};
				 return errorMsg;
			 }
		}else{
		 if(endDate<startDate){
			 this.getView().byId("ipPopDtTo").setValueState("Error");
			 errorMsg = {Message:"Please enter End Date above Start Date",Details:""};
			 return errorMsg;
		 }
		}
		

		
		
		
		for(var i=0;i<obj.length;i++){
			var linkObj = sap.ui.getCore().byId(obj[i].id);
		
			var roomData = linkObj.getBindingContext("resStatusModel").getModel().getProperty(linkObj.getBindingContext("resStatusModel").sPath);
//			if(roomData.Hcode != createData.Hcode || roomData.Romno != createData.Romno){
//				continue;
//			}
			var date = this.convertToDateObj(linkObj.data("Date"));
			if(date>=startDate && date<=endDate){
				if(domeFlag){
					errorMsg.Message = "";
					var time = linkObj.data("Time").results;


					if(date.getTime() == startDate.getTime()){
						
						if(time.length!=0){
						time.sort(function(obj1,obj2){
							return obj2.Chkot - obj1.Chkot;
						});
						//var dateTime = this.convertToDateObj(linkObj.data("Date"),time[0].Chkot);
						var startDateTime = this.convertToDateObj(begda,this.getView().byId("ipTimeFrm").getValue());
						var endDateTime = this.convertToDateObj(endda,this.getView().byId("ipTimeTo").getValue());
						for(var j=0;j<time.length;j++){
							var checkInDateTime = this.convertToDateObj(time[j].Date,time[j].Chkin);
							var checkOutDateTime = this.convertToDateObj(time[j].Date,time[j].Chkot);					
							
						if(createData.Hcode == time[j].Hcode && createData.Romno == time[j].Romno){	
							
						    if(startDateTime >= checkInDateTime && startDateTime <= checkOutDateTime){
							
								if(createData.Reinr != time[j].Reinr && !bOha){
									errorMsg.Message = "The start date that you entered conflicts with other travel Plan Start Date and End Date."
								    errorMsg.Details = this.messageDetailsSameRoom(time[j]);
									
								}else{
									if(createData.Reinr == time[j].Reinr && statusArr.indexOf(time[j].Status)==-1){
										errorMsg.Message = "You already perform the action against this TP on below date and time."
									    errorMsg.Details = this.messageDetailsSameRoom(time[j]);
									}
								}							
							}else if(startDateTime <= checkInDateTime && endDateTime > checkInDateTime){
						
								if(createData.Reinr != time[j].Reinr && !bOha){
									errorMsg.Message = "The start date that you entered conflicts with other travel Plan Start Date and End Date."
								    errorMsg.Details = this.messageDetailsSameRoom(time[j]);
								
							    }
						    }
							}else if(createData.Status == "C" || createData.Status == "B"){//if hotel or room code dfiffers
								 if(createData.Reinr == time[j].Reinr){
								     	var currDateObj = this.convertToDateObj(time[j].Date,time[j].Chkot);										
								     	if(currDateObj>=startDateTime&&currDateObj<=endDateTime){
								     		errorMsg.Message = "You already perform action on the below date.Please check";
								     		errorMsg.Details = this.messageDetails(errorMsg,linkObj,roomData,time[j]);

								    	}
								}
							}
				        }

			         }
						if(errorMsg.Message!=""){
							return errorMsg;
						}
					}
					if(date.getTime() == endDate.getTime()){
						
						if(time.length!=0){
						time.sort(function(obj1,obj2){
							return obj1.Chkin - obj2.Chkin;
						});
						var checkInTime = this.convertToDateObj(linkObj.data("Date"),time[0].Chkin);
						var checkOutTime = this.convertToDateObj(linkObj.data("Date"),time[0].Chkot);
						var endDateTime = this.convertToDateObj(endda,this.getView().byId("ipTimeTo").getValue());
						var startDateTime = this.convertToDateObj(begda,this.getView().byId("ipTimeFrm").getValue());
						for(var j=0;j<time.length;j++){
							var checkInDateTime = this.convertToDateObj(time[j].Date,time[j].Chkin);
							var checkOutDateTime = this.convertToDateObj(time[j].Date,time[j].Chkot);
							
							
							if(createData.Hcode == time[j].Hcode && createData.Romno == time[j].Romno){		
							
							if(begda == endda){
								if(!((endDateTime<checkInDateTime&&startDateTime<checkInDateTime)||
									 (endDateTime>checkOutDateTime&&startDateTime>checkOutDateTime))){
									if(createData.Reinr != time[j].Reinr && !bOha){
										errorMsg.Message = "The end date that you entered conflicts with other travel Plan Start Date and End Date."
									    errorMsg.Details = this.messageDetailsSameRoom(time[j]);											
									 
									}else{
										if(createData.Reinr == time[j].Reinr && statusArr.indexOf(time[j].Status)==-1){
											errorMsg.Message = "You already perform the action against this TP on below date and time."
											errorMsg.Details = this.messageDetailsSameRoom(time[j]);
										
										}
									}
								}
							}else{
							if(!(endDateTime<checkInDateTime)){
								if(createData.Reinr != time[j].Reinr && !bOha){
									errorMsg.Message = "The end date that you entered conflicts with other travel Plan Start Date and End Date."
									errorMsg.Details = this.messageDetailsSameRoom(time[j]);										
								 
								}else{
									if(createData.Reinr == time[j].Reinr && statusArr.indexOf(time[j].Status)==-1){
										errorMsg.Message = "You already perform the action against this TP on below date and time."
										errorMsg.Details = this.messageDetailsSameRoom(time[j]);											
									
									}
								}
							}
							}
							}else if(createData.Status == "C" || createData.Status == "B"){//if hotel or room code dfiffers
								 if(createData.Reinr == time[j].Reinr){
								     	var currDateObj = this.convertToDateObj(time[j].Date,time[j].Chkot);										
								     	if(currDateObj>=startDateTime&&currDateObj<=endDateTime){
								     		errorMsg.Message = "You already perform action on the below date.Please check";
								     		errorMsg.Details = this.messageDetails(errorMsg,linkObj,roomData,time[j]);

								    	}
								}
							}

						}
						if(errorMsg.Message!=""){
							return errorMsg;
						}
					}
					}
					if(date>startDate && date<endDate){
						
					
							for(var j=0;j<time.length;j++){
							
							
								if(createData.Hcode == time[j].Hcode && createData.Romno == time[j].Romno){		
								
								if(createData.Reinr != time[j].Reinr && !bOha){
									errorMsg.Message = "Dates that you entered conflicts with other travel Plan Start Date and End Date.";
									errorMsg.Details = this.messageDetailsSameRoom(time[j]);
								   // errorMsg.Details = time[j].Date.substr(6, 2)+"."+time[j].Date.substr(4, 2)+"."+time[j].Date.substr(0, 4);
								}else{
									if(createData.Reinr == time[j].Reinr && statusArr.indexOf(time[j].Status)==-1){
										errorMsg.Message = "You already perform the action against this TP on below date and time.";
										errorMsg.Details = this.messageDetailsSameRoom(time[j]);
									//	errorMsg.Details = time[j].Date.substr(6, 2)+"."+time[j].Date.substr(4, 2)+"."+time[j].Date.substr(0, 4);
									}
								}
							}else if(createData.Status == "C" || createData.Status == "B"){//if hotel or room code dfiffers
									 if(createData.Reinr == time[j].Reinr){
									     	var currDateObj = this.convertToDateObj(time[j].Date,time[j].Chkot);										
									     	if(currDateObj>=startDateTime&&currDateObj<=endDateTime){
									     		errorMsg.Message = "You already perform action on the below date.Please check";
									     		errorMsg.Details = this.messageDetails(errorMsg,linkObj,roomData,time[j]);

									    }
									}
								}
								
							}
								
							
							if(errorMsg.Message!=""){
								return errorMsg;
							}
						
						}
						
						
				
					
				}
//				else{//International Travels
//					var currDate = linkObj.data("Date").substr(6, 2)+"."+linkObj.data("Date").substr(4, 2)+"."+linkObj.data("Date").substr(0, 4);
//				
//					
//			if(linkObj.data("Reinr")!="" && linkObj.data("Reinr")){
//				if(createData.Hcode == roomData.Hcode){
//				  if(createData.Reinr != linkObj.data("Reinr")){
//						errorMsg.Message = "Your Date conflicts with below travel plan Dates.";
//						errorMsg.Details = "Travel Plan:"+linkObj.data("Reinr")+","+this.messageDetails(errorMsg,linkObj,roomData);
//					    
//				  }else{
//						
//				       if(statusArr.indexOf(linkObj.data("Status"))==-1){
//				           errorMsg.Message = message;
//					       errorMsg.Details = this.messageDetails(errorMsg,linkObj,roomData);
//
//		        	}
//				  }
//				}else if(createData.Reinr == linkObj.data("Reinr")){
//					var currDateObj = this.convertToDateObj(linkObj.data("Date"));
//					var endDate = this.convertToDateObj(endda);
//					var startDate = this.convertToDateObj(begda);
//					if(currDateObj.getTime()>=startDate.getTime()&&currDateObj.getTime()<=endDate.getTime()){
//						errorMsg.Message = "You already perform action on the below dates.Please check";
//						errorMsg.Details = this.messageDetails(errorMsg,linkObj,roomData);
////						errorMsg.Details = "Apartment Code:"+roomData.Hcode+",Room No:"+roomData.Romno+","+"Start Date"+linkObj.data("Begda")+
////						","+"End Date"+linkObj.data("Endda");
//					}
//				}
//			}
//				
//
//		}
	}
}

	

		return errorMsg;
	},
	messageDetailsSameRoom:function(time){
		var checkIn = time.Chkin.substr(0,2)+":"+time.Chkin.substr(2,2)+":"+time.Chkin.substr(4,2);
		var checkOut = time.Chkot.substr(0,2)+":"+time.Chkot.substr(2,2)+":"+time.Chkot.substr(4,2);
		var details = "Travel Plan:"+time.Reinr+",Date:"+time.Date.substr(6, 2)+"."+time.Date.substr(4, 2)+"."+time.Date.substr(0, 4)+"" +
		",Check In:"+checkIn+" Check Out:"+checkOut;
		return details;
	},
	messageDetails:function(errorMsg,linkObj,roomData,time){
		if(time){
			var begda = time.Date.substr(6, 2)+"."+time.Date.substr(4, 2)+"."+time.Date.substr(0, 4);
			
			var details = "Travel Plan:"+time.Reinr+",Apartment Code:"+time.Hcode+",Room No:"+time.Romno+",Date:"+begda;
			
		}else{
		var begda = linkObj.data("Begda").substr(6, 2)+"."+linkObj.data("Begda").substr(4, 2)+"."+linkObj.data("Begda").substr(0, 4);
		var endda = linkObj.data("Endda").substr(6, 2)+"."+linkObj.data("Endda").substr(4, 2)+"."+linkObj.data("Endda").substr(0, 4);
		var details = "Travel Plan:"+linkObj.data("Reinr")+",Apartment Code:"+roomData.Hcode+",Room No:"+roomData.Romno+",From Date:"+begda+
		","+"To Date:"+endda;
		}
		if(errorMsg.Details == "" || !(errorMsg.Details)){
			errorMsg.Details = details;
		}else{
			//var detArr = errorMsg.Details.split("\n");
			
			if(errorMsg.Details.indexOf(details)==-1)
			    errorMsg.Details = errorMsg.Details +"\n"+details;
		}
		return errorMsg.Details;
	},
	onupdate:function(){
//		 this.getView().byId("resView").addEventDelegate(this.afterRender, this);
//	        $.when(this.renderedObj).done(jQuery.proxy(function(){
//	        
//	        	 this.getView().byId("resView").removeEventDelegate(this.afterRender);
//	        	
//	          },this));
	},
	onAfterRendering: function(evt) {
  //    evt.preventDefault();
		
//		this.getView().byId("resView").addEventDelegate({
//		     "onAfterRendering": function (evt) {
//		          // Your code ...
//		    	 if(this["render"]){
//		    	 this["render"] = false;
//		    		var obj = $(".resMLinks");
//		    		for(var prop in obj){
//		    			var id = obj[prop].id;
//		    			if(id){
//		    				
//		    			  var status =  sap.ui.getCore().byId(id).data("Status");
//
//		    			  var time = sap.ui.getCore().byId(id).data("Time").results;
//		    			  if(time.length!=0){
//		    			  var diffTime = 0;
//		    			  for(var i=0;i<time.length;i++){
//		    				  var checkInDateTime = this.convertToDateObj(time[i].Date,time[i].Chkin);
//		    				  var checkOutDateTime = this.convertToDateObj(time[i].Date,time[i].Chkot);
//		    				  diffTime = diffTime + (Math.round((checkOutDateTime.getTime() - checkInDateTime.getTime()) / (1000 * 60 * 60)));
//		    			  }
//		    			  if(diffTime!=24){
//		    				  sap.ui.getCore().byId(id).data("Status",status+"_A");
//		    				   status =  sap.ui.getCore().byId(id).data("Status");
//		    			  }
//	
//		    			  }
//		    			  var statArr = status.split("_");
//		    			  if(statArr.length!=0){
//		    				  statArr.sort();
//		    				  status = statArr.join("_");
//		    			  }
//		    			  sap.ui.getCore().byId(id).addStyleClass("colorGradient_"+status);
//		    			}
//		    		}
//		     }
//		     }
//		     
//		}, this);
	
		

	},

	convertToDateObj:function(yyyyMMdd,hhmmss){
		if(hhmmss)
		 return new Date(yyyyMMdd.substr(0, 4), yyyyMMdd.substr(4, 2) - 1, yyyyMMdd.substr(6, 2),
				         hhmmss.substr(0,2),hhmmss.substr(2,2),hhmmss.substr(4,2));
		else
			 return new Date(yyyyMMdd.substr(0, 4), yyyyMMdd.substr(4, 2) - 1, yyyyMMdd.substr(6, 2));
	}

/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.RoomReservation
 */
// onExit: function() {
//
// }

});