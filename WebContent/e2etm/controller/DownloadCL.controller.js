jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");

sap.ui.controller("sap.ui.project.e2etm.controller.DownloadCL", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.DownloadCL
*/
	onInit: function() {
		var role = sap.ui.getCore().getModel("profile").getData().currentRole;
		var pernr = sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR;
		oComponent.getModel().read("/DepartmentF4Set?$filter=Role eq '"+role+"' and Pernr eq '"+pernr+"'", null, null, true, jQuery.proxy(function(oData, response) {
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(oData.results);
			oModel.setSizeLimit(oData.results.length);
			this.getView().byId("ipDept").setModel(oModel,"deptF4");	

		},this), jQuery.proxy(function(error) {
			
			
		},this));
	},
onSearch:function(){
	
	var aFilters = []
	var pernr = this.getView().byId("ipPernr").getValue();
	var begda = this.getView().byId("ipBegda").getValue();
	var endda = this.getView().byId("ipEndda").getValue();
	var depreq = this.getView().byId("ipDepreq").getValue();
	var asgtype = this.getView().byId("ipAsgtyp").getSelectedKey();
	var department = this.getView().byId("ipDept").getSelectedKey();
	var lType = this.getView().byId("ipLtype").getSelectedKey();
	var role = sap.ui.getCore().getModel("profile").getData().currentRole;
	if(lType!="")
		aFilters.push(new sap.ui.model.Filter({path:"LType",operator:"EQ",value1:lType}));
	else{
		sap.m.MessageToast.show("Please select letter type");
		return;
	}
	if(pernr!="")
		aFilters.push(new sap.ui.model.Filter({path:"Pernr",operator:"EQ",value1:pernr}));
	if(begda!="")
		aFilters.push(new sap.ui.model.Filter({path:"Begda",operator:"EQ",value1:begda}));
	if(endda!="")
		aFilters.push(new sap.ui.model.Filter({path:"Endda",operator:"EQ",value1:endda}));
	if(depreq!="")
		aFilters.push(new sap.ui.model.Filter({path:"DepReq",operator:"EQ",value1:depreq}));
	if(asgtype!="")
		aFilters.push(new sap.ui.model.Filter({path:"AsgType",operator:"EQ",value1:asgtype}));
	if(department!="")
		aFilters.push(new sap.ui.model.Filter({path:"Department",operator:"EQ",value1:department}));
	else{
		if(role == "GRM"){
			var deptF4 = this.getView().byId("ipDept").getModel("deptF4").getData();
			for(var i=0;i<deptF4.length;i++){
				aFilters.push(new sap.ui.model.Filter({path:"Department",operator:"EQ",value1:deptF4[i].Id}));
			}
		}
	}

	
if(aFilters.length == 0){
	sap.m.MessageToast.show("Please enter atleast one search criteria");
	return;
}

var oTemplate = new sap.m.ColumnListItem({cells:[new sap.m.Label({text:"{Pernr}"}),
	                                             new sap.m.Label({text:"{DepReq}"}),
	                                             new sap.m.Label({text:"{Version}"}),
	                                             new sap.m.Label({text:"{Department}"}),
	                                             new sap.m.Label({text:"{AsgType}"}),
//	                                             new sap.m.Label({text:"{path:'Begda',formatter: 'sap.ui.project.e2etm.util.Formatter.sapDate'}"}),
//	                                             new sap.m.Label({text:"{path:'Endda',formatter: 'sap.ui.project.e2etm.util.Formatter.sapDate'}"}),
	                                             new sap.m.Link({text:"Download",emphasized:true
	                                            	  ,press:this.onFileDownload,
	                                            	  customData:[new sap.ui.core.CustomData({key:"Url",value:"{Url}"}),	                                            		  
	                                            		          new sap.ui.core.CustomData({key:"Name",value:"{Filename}"}),
	                                            		          new sap.ui.core.CustomData({key:"FileContent",value:"{Filecontent}"})]}),
	                                             
	                                          //   new sap.ui.core.HTML()
	                                             ]});
//var model = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {json:true,defaultOperationMode:"Client",useBatch:false});
//model.setDefaultCountMode("None");
//model.setDefaultBindingMode("TwoWay");
//this.getView().byId("tblPdf").setModel(model);

this.getView().byId("tblPdf").bindItems({path:"/DownloadCLSet",template:oTemplate,filters:aFilters});
},
onFileDownload : function(evt) {
	
	var url = evt.getSource().getHref();
	var customData = evt.getSource().getCustomData();
	var url = customData[0].getValue();
	var name = customData[1].getValue();
	var content =  customData[2].getValue();
	//Response.addHeader("Content-disposition", "attachment; filename=" + name);
	var idown = document.createElement("a");

	idown.setAttribute("style", {"display":"none"});

	  if(typeof idown.download == 'undefined'){
		  idown.href = url;
		  idown.target = "_blank";
	     
	  }else{
		  idown.setAttribute('href', 'data:text/octet-stream;base64,'+content);
		  idown.download = name;
	  }

//	
	document.body.appendChild(idown);
	idown.click();
	document.body.removeChild(idown);
//	  }
	},
onDownload:function(){
	var deferreds = [];
	var vFilename = "";
	sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
	var zip = new JSZip();
	var items = this.getView().byId("tblPdf").getSelectedItems();
	if(items.length == 0){
		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
		sap.m.MessageToast.show("Please select atleast one request");
		return;
	}
	var lType = this.getView().byId("ipLtype").getSelectedKey();
	if(lType == "CL"){
		vFilename = "Contract Letters";
	}else if(lType == "CS"){
		vFilename = "Salary Slips";
	}
	for(var i=0;i<items.length;i++){
		var odata = items[i].getBindingContext().getModel().getProperty(
				items[i].getBindingContext().sPath);
		var url = "DmsDocsSet(DepReq='" + odata.DepReq + "',EmpNo='" + odata.Pernr + "',DocType='',FileName='" + odata.Filename+ "',Index=1,Module='',Country='')?$format=json";
		//deferreds.push(this.downloadContent(url, "SWIFT/" + odata.FileName, zip));
		zip.file(vFilename+"/"+odata.Filename, odata.Filecontent, {
			base64 : true
		});
	}
	
	var blob = zip.generate({
		type : "blob"
	});
	saveAs(blob, "SWIFT.zip");
	sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
	
//	$.when.apply($, deferreds).done(jQuery.proxy(function() {
//		var blob = zip.generate({
//			type : "blob"
//		});
//		// see FileSaver.js
//		saveAs(blob, "SWIFT.zip");
//		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
//	},this)).fail(jQuery.proxy(function(err) {
//		sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
//		alert('Browser does not support cross origin resource sharing, please try in Chrome');
//	},this));
    	
	
},
downloadContent:function(url,fileName,zip){
	var content = $.Deferred();
	oComponent.getModel().read(url, null, null, true, jQuery.proxy(function(oData, response) {
		content.resolve(oData);

	},this), jQuery.proxy(function(error) {
		content.reject()
		
	},this));
	return content;
},
onLiveSearch:function(evt){
	var value = this.getView().byId("ipSearch").getValue();
	var aFilters = [new sap.ui.model.Filter({path:"Pernr",operator:"Contains",value1:value}),
		            new sap.ui.model.Filter({path:"DepReq",operator:"Contains",value1:value}),
		            new sap.ui.model.Filter({path:"Begda",operator:"Contains",value1:value}),];
	                new sap.ui.model.Filter({path:"Endda",operator:"Contains",value1:value})
	
},
onViewPdf:function(evt){
	var fileUrl = evt.getSource().getParent().getBindingContext().getModel().getProperty(
			evt.getSource().getParent().getBindingContext().sPath).Url;
	var dialog = new sap.m.Dialog({
		title: 'Contract Letter',
		type: 'Message',
		stretch : true,
		type : 'Standard',		
		content: [new sap.ui.core.HTML({
			content: "<div><object data=\""
				+ fileUrl
				+ "\" type=\"application/pdf\" width=\"100%\" height=\"1250px\"></object></div>"
		})],
		beginButton: new sap.m.Button({
			text: 'OK',
			press: function () {
				dialog.close();
			}
		}),
		afterClose: function() {
			dialog.destroy();
		}
	});

	dialog.open();
}
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.DownloadCL
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.DownloadCL
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.DownloadCL
*/
//	onExit: function() {
//
//	}

});