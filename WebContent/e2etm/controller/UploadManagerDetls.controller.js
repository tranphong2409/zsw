sap.ui.controller("sap.ui.project.e2etm.controller.UploadManagerDetls", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.UploadManagerDetls
*/
//	onInit: function() {
//
//	},
	handleUploadPress:function(){
		var file = this.getView().byId("fileUploader").oFileUpload.files[0];
		var reader = new FileReader();
		var nav = "EmpMgrToMgrNav";
		var oData = {};
		oData[nav] = [];
		
		 reader.onload = function(e) {

	           data = e.target.result;

	         var wb = XLSX.read(data, {type: 'binary'});

	         wb.SheetNames.forEach(function(sheetName) {

	           var data = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);

	           for(var i=0;i<data.length;i++){
	        	   oData[nav].push({});	
	        	   delete data[i]["__rowNum__"];
	        	   for(var prop in data[i]){
	        		   var column = prop.split("_");
	        		   
	        		   oData[nav][i][column[1]] = data[i][prop];
	        		
	        	   }
	           }
	  //      oComponent.getModel().setHeaders({Action:"Create"});
	       	oComponent.getModel().create("/EmpMgrDetlsSet", oData, {success:jQuery.proxy(function(oData, response) {

			},this), error:jQuery.proxy(function(error) {
		
			},this)});
	           

	         });


	       }

	       reader.readAsBinaryString(file);
	}
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.UploadManagerDetls
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.UploadManagerDetls
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.UploadManagerDetls
*/
//	onExit: function() {
//
//	}

});