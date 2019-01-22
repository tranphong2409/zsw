sap.ui.controller("sap.ui.project.e2etm.controller.RoomRents", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.view.RoomRents
*/
//	onInit: function() {
//
//	},
	handleUploadPress:function(){
		//	sap.ui.project.e2etm.util.StaticUtility.setBusy(true,this);
			var file = this.getView().byId("fileUploader").oFileUpload.files[0];
			var importFile = $.Deferred();
			sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
			importFile = this.onXLSFileImport(file,"RoomRentSet","Rent",oComponent.getModel("reservation"))
			importFile.done(jQuery.proxy(function(response){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				sap.m.MessageToast.show("Uploaded Successfully");
				
			},this));
			
			importFile.fail(jQuery.proxy(function(response){
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
				sap.m.MessageToast.show("Please make use of template provided to upload the data");
				
			},this));
		
	},
	onXLSFileImport:function(file,entitySet,nav,model){
		var importFile = $.Deferred();
		var reader = new FileReader();
	
		var oData = {};
		oData[nav] = [];
		
		 reader.onload = jQuery.proxy(function(e) {

	           data = e.target.result;

	         var wb = XLSX.read(data, {type: 'binary'});

	         wb.SheetNames.forEach(jQuery.proxy(function(sheetName) {

	           var data = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);

	           for(var i=0;i<data.length;i++){
	        	   oData[nav].push({});	
	        	   delete data[i]["__rowNum__"];
	        	   
	        	   for(var prop in data[i]){
	        		   var column = prop.split("_");
	        		   var property = this.getProperty(prop);
	        		   oData[nav][i][property] = data[i][prop];	        		  
	        		 
	        			   if(property == "Begda" || property == "Endda"){
	        				   var aDate = oData[nav][i][property].split(".");
	        				   oData[nav][i][property] = aDate[2]+aDate[1]+aDate[0];
	        			   }
	        		   
	        		  

	        	   }
	           }
	           model.setHeaders({Action:"Create"});
	           model.create("/"+entitySet, oData, {success:jQuery.proxy(function(oData, response) {
				// oController.uploadFiles(global.ZZ_TRV_REQ);
	       		importFile.resolve();	
			},this), error:jQuery.proxy(function(error) {
				importFile.reject(error);	
	           
			},this)});

	         },this));

	         //return result;

	       },this);

	       reader.readAsBinaryString(file);
	       return importFile.promise();
	},
	getProperty:function(prop){
		var property = "";
		var columns = this.getTemplateColumns();
		for(var i=0;i<columns.length;i++){
			if(columns[i].name == prop){
				property = columns[i].template.content.substring(1,columns[i].template.content.length-1);
			}
		}
		return property;
	},
	onDownloadTemplate:function(){
		var columns = this.getTemplateColumns();
		sap.ui.project.e2etm.util.StaticUtility.exportCSV(null,new sap.ui.model.json.JSONModel(),"Room Rents List",columns);
	},
	getTemplateColumns:function(){
		var columns = [{
			name : "Apartment Code",
	        template : {
				content: "{Hcode}"	             
				       }
		},{
			name : "Room No",
			template : {
				content : "{Romno}"
			}
		}, {
			name : "Valid From",
			template : {
				content : "{Begda}"
			}
		},{
			name : "Valid Till",
			template : {
				content : "{Endda}"
			}
		},{
			name : "Monthly Rent",
			template : {
				content : "{Rcost}"
			}
		},{
			name : "Maintenance Fee",
			template : {
				content : "{Mfees}"
			}
		},{
			name : "Daily Rent",
			template : {
				content : "{Drent}"
			}
		},{
			name : "Monthly Rental Goods",
			template : {
				content : "{Mrgds}"
			}
		},{
			name : "JH service fee per month",
			template : {
				content : "{Srfee}"
			}
		},{
			name : "Tax(8%)",
			template : {
				content : "{Tax}"
			}
		},{
			name : "Insurance",
			template : {
				content : "{Insr}"
			}
		},{
			name : "One time charges",
			template : {
				content : "{Chrgs}"
			}
		},{
			name : "Refundable security deposit",
			template : {
				content : "{Rfscd}"
			}
		},{
			name : "Total monthly billing",
			template : {
				content : "{Mbill}"
			}
		}, {
			name : "Currency",
			template : {
				content : "{Waers}"
			
			}
		}
		
		];
		
		return columns;
	
	},
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.view.RoomRents
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.view.RoomRents
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.view.RoomRents
*/
//	onExit: function() {
//
//	}

});