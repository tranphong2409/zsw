jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
sap.ui.controller("sap.ui.project.e2etm.controller.IssueCL", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf e2etm.controller.IssueCL
*/
//  onInit: function() {
//
//  },
  onSearch:function(){
    var aFilters = []
    var pernr = this.getView().byId("ipPernr").getValue();
    var depreq = this.getView().byId("ipDepreq").getValue();
    var asgtype = this.getView().byId("ipAsgtyp").getSelectedKey();
    var tocnty = this.getView().byId("ipTocnty").getSelectedKey();
    var depType = this.getView().byId("ipDepType").getSelectedKey();
    var trvcat = this.getView().byId("ipTrvcat").getSelectedKey();
    var begda = this.getView().byId("ipBegda").getValue();
    var endda = this.getView().byId("ipEndda").getValue();
    var begdaTo = this.getView().byId("ipStartDateTo").getValue();
    var enddaTo = this.getView().byId("ipEnddaFrom").getValue();
    var lType   = this.getView().byId("ipLtype").getSelectedKey();

//    this.getView().byId("lbLtype").setVisible(false);
//    this.getView().byId("ipLtype").setVisible(false);
//    this.getView().byId("lbFormat").setVisible(false);
//    this.getView().byId("ipFormat").setVisible(false);

    if(pernr!="")
      aFilters.push(new sap.ui.model.Filter({path:"Pernr",operator:"EQ",value1:pernr}));
    if(tocnty!=""){
      aFilters.push(new sap.ui.model.Filter({path:"Tocnty",operator:"EQ",value1:tocnty}));
    }else{
      sap.m.MessageToast.show("Please enter To country");
      return;
    }
    if(trvcat!="")
      aFilters.push(new sap.ui.model.Filter({path:"Trvcat",operator:"EQ",value1:trvcat}));
    else{
      sap.m.MessageToast.show("Please enter Travel Category");
      return;
    }
    if(depreq!="")
      aFilters.push(new sap.ui.model.Filter({path:"DepReq",operator:"EQ",value1:depreq}));
    if(asgtype!="")
      aFilters.push(new sap.ui.model.Filter({path:"AsgType",operator:"EQ",value1:asgtype}));
    else{
      sap.m.MessageToast.show("Please enter Assignment Model");
      return;
    }
    if(depType!="")
      aFilters.push(new sap.ui.model.Filter({path:"Trvky",operator:"EQ",value1:depType}));
    
    if(lType!=""){
    	aFilters.push(new sap.ui.model.Filter({path:"LType",operator:"EQ",value1:lType}));
    }
    
    if(begda!=""){
//    	var oBegda = this.getView().byId("ipBegda").getDateValue();
//    	var oCurda = new Date(new Date().toDateString());
//    	if(oBegda > oCurda){
//    		  sap.m.MessageToast.show("Start date must be in past.Please correct");
//    	      return;
//    	}
    	aFilters.push(new sap.ui.model.Filter({path:"Begda",operator:"EQ",value1:begda}));
    }
    
    if(endda!=""){
//    	var oEndda = this.getView().byId("ipEndda").getDateValue();
//    	var oCurda = new Date(new Date().toDateString());
//    	if(oEndda < oCurda){
//    		  sap.m.MessageToast.show("End date must be in future.Please correct");
//    	      return;
//    	}
    	aFilters.push(new sap.ui.model.Filter({path:"Endda",operator:"EQ",value1:endda}));
    }

    //dye5kor
    if(begdaTo!=""){
    	
    	aFilters.push(new sap.ui.model.Filter({path:"BegdaTo",operator:"EQ",value1:begdaTo}));
    }
    
    if(enddaTo!=""){
    	
    aFilters.push(new sap.ui.model.Filter({path:"EnddaTo",operator:"EQ",value1:enddaTo}));
    
    }
    
    
    //dye5kor
    
    
  if(aFilters.length == 0){
    sap.m.MessageToast.show("Please enter atleast one search criteria");
    return;
  }

//  if(tocnty == "DE" && )

  var oTemplate = new sap.m.ColumnListItem({cells:[new sap.m.Label({text:"{Pernr}"}),
                                                 new sap.m.Label({text:"{DepReq}"}),
                                                 new sap.m.Label({text:"{AsgType}"}),  
                                                 new sap.m.Label({text:"{Tocnty}"}), 
                                                 new sap.m.Label({text:"{path:'Begda',formatter: 'sap.ui.project.e2etm.util.Formatter.sapDate'}"}),
                                                 new sap.m.Label({text:"{path:'Endda',formatter: 'sap.ui.project.e2etm.util.Formatter.sapDate'}"}),
                                                 new sap.m.Text({wrapping:true,text:"{path:'LastChanged',type:'sap.ui.model.type.DateTime',formatOptions:{style:'medium'}}"}),
 
                                                 ]});

  this.getView().byId("tblIssue").bindItems({path:"/CLGenerationSet",template:oTemplate,filters:aFilters});	
  
  },

  
  onFilterLetterValues:function(){
	    var tocnty = this.getView().byId("ipTocnty").getSelectedKey();
	    var depType = this.getView().byId("ipDepType").getSelectedKey();
	    var trvcat = this.getView().byId("ipTrvcat").getSelectedKey();
	    var asgtype = this.getView().byId("ipAsgtyp").getSelectedKey();
	    //dye5kor
	    var LetterData = [];
	    var LetterDataModel = new sap.ui.model.json.JSONModel();
	    //dye5kor

	     if(sap.ui.project.e2etm.util.StaticUtility.checkCggs(tocnty,asgtype,trvcat)){

	        	LetterData.push({text:"Please Select", key:""});
	        	LetterData.push({text:"Contract Letter", key:"CL"});
	        	LetterData.push({text:"Calculation Sheet", key:"CS"});
	        	LetterData.push({text:"Both" , key:"CC"});
	        	LetterDataModel.setData(LetterData);
	        	this.getView().byId("ipLtype").setModel(LetterDataModel,"LetterModelData");

	        }else if((asgtype=='STA' || asgtype=='STAPP' || asgtype=='TRNG')&& trvcat == "WRKP"&&tocnty != 'DE' ){        		 
	        		
	        	LetterData.push({text:"Please Select", key:""});
	        	LetterData.push({text:"Contract Letter", key:"CL"});
	            LetterData.push({text:"STA Allowance Letter", key:"CA"});           	        
	        	
	        }else if(trvcat=='TRNG'){
	        	LetterData.push({text:"Please Select", key:""});
	        	LetterData.push({text:"Contract Letter", key:"CL"});
	            LetterData.push({text:"STA Allowance Letter", key:"CA"});
	        	
	        }else{
	        	LetterData.push({text:"Please Select", key:""});
	        	LetterData.push({text:"Contract Letter", key:"CL"});
	        }	    	
	        LetterDataModel.setData(LetterData);
	    	this.getView().byId("ipLtype").setModel(LetterDataModel,"LetterModelData");
	    	this.getView().byId("ipLtype").setSelectedKey("");  
	    	this.resetLetterFields();	 
  },
  resetLetterFields:function(){
	    this.getView().byId("lbFormat").setVisible(false);
	    this.getView().byId("ipFormat").setVisible(false);
		this.getView().byId("ipAllowanceAmt").setVisible(false);
	
		this.getView().byId("lbFormat").setVisible(false);
        this.getView().byId("ipFormat").setVisible(false);
  },
  onLetterSelect:function(){

	this.resetLetterFields();	 
    
	var lType = this.getView().byId("ipLtype").getSelectedKey();
    
	if((lType == "CL" || lType == "CC")&&this.getView().byId("ipTocnty").getSelectedKey()=='DE'){
      this.getView().byId("lbFormat").setVisible(true);
      this.getView().byId("ipFormat").setVisible(true);
      }else if(lType=="CA") {
    	//dye5kor
    	    
    	  var yearData = [];
    	  var endYear   = '2030';
    	  var yearModel = new sap.ui.model.json.JSONModel();
    	  var currencyJsonModel = new sap.ui.model.json.JSONModel();

    	 this.getView().byId("ipAllowanceAmt").setVisible(true);  
    	 this.getView().byId("ipLYear").setSelectedKey("");
    	 this.getView().byId("ipAllowanceTyp").setSelectedKeys([]);
    	      	 
    	 yearData.push({text:'Please Select',key:""});
    	 for(i=2015;i<=endYear;i++){
    		 yearData.push({text:i,key:i}); 	 
    	 }
    	 
    	 yearModel.setData(yearData);
    	 this.getView().byId("ipLYear").setModel(yearModel,"yearModelData");
    	 
    	 var odata = {Srch_help:'F4_TCURC_ISOCD' };
    	 oComponent.getModel().callFunction("GetF4Help", "GET", odata, null, jQuery.proxy(function(oData, response) {
    	 currencyJsonModel.setSizeLimit(oData.results.length);
    	 currencyJsonModel.setData(oData.results);
    	 this.getView().setModel(currencyJsonModel,"currencyModelData");
    		}, this), jQuery.proxy(function(error) {
    			this.getView().byId("tableMis").setBusy(false);
    		}, this), true);
    	    
    	 //dye5kor  	  
    	  
      }
  
  
  },
  
  onCountryChange:function(){
 	 this.getView().byId("ipAllowanceAmt").setVisible(false);

	  
	if(this.getView().byId("ipTocnty").getSelectedKey()!= 'DE'){
		
		if(this.getView().byId("ipLtype").getSelectedKey() == 'CA'){		

		 	 this.getView().byId("ipAllowanceAmt").setVisible(true);

		 	 this.onAllowanceChange();
		
		
		}
	
	}
	var aFilters = [];
    aFilters.push(new sap.ui.model.Filter({path:"ToCountry",operator:"EQ",
    	                                   value1:this.getView().byId("ipTocnty").getSelectedKey()}));    

    var oTemplate = new sap.ui.core.Item({key:"{Key}",text:"{AsgType}"});

    this.getView().byId("ipAsgtyp").bindItems({path:"/AsgModelsF4Set",template:oTemplate,filters:aFilters});	
	
	this.onFilterLetterValues();
	
	  
  },
  
  onAllowanceChange:function(){
	  
	var toCntry 		= this.getView().byId("ipTocnty").getSelectedKey();  
	var year    		= this.getView().byId("ipLYear").getSelectedKey();
	var allowanceType   = this.getView().byId("ipAllowanceTyp").getSelectedItems();
	
//	this.getView().byId("ipAllowanceAmt").setValue("");
//	this.getView().byId("ipCurrency").setSelectedKey("");

	
		if(allowanceType.length!=0){
		//sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oThis);
	    if(toCntry == 'US'){
	    	 var aData1 = []; 
	    	 var vIndex = 1;
	    	 for(var i=0;i<allowanceType.length;i++){
        		 var index = i%2;
        		 if(index == 0){
        			 aData1.push({});
        			 vIndex = 1;        			 
        		 }else{
        			 vIndex = 2;
        		 }
        		
        	 var lastIndex = aData1.length-1;	 
        	 aData1[lastIndex]["AllowanceTyp"+vIndex] = allowanceType[i].getText();
        	// aData1[lastIndex]["AllowanceAmount"+vIndex] = ""; 
        	 aData1[lastIndex]["AllowanceKey"+vIndex] = allowanceType[i].getKey();        		
        	 }
	    	 var staAllowanceamountModel = new sap.ui.model.json.JSONModel();
	    	 staAllowanceamountModel.setData(aData1);
        	 this.getView().byId("ipAllowanceAmt").setModel(staAllowanceamountModel,"allwAmounts");
	    }else{
         var batch = allowanceType.map(function(item,index){
				return oComponent.getModel().createBatchOperation("STAAllowanceAmountSet(AllowanceTyp='" + item.getKey() + "',Year='" + year + "',ToCountry='" + toCntry + "')", "GET");
			});
         oComponent.getModel().addBatchReadOperations(batch);
         oComponent.getModel().submitBatch(jQuery.proxy(function(oResult) {	
        	 var staAllowanceamountModel = new sap.ui.model.json.JSONModel();
        	 var aData = oResult.__batchResponses.map(function(item,index){
        		 return {AllowanceTyp:allowanceType[index].getText(),AllowanceAmount:item.data.AllowanceAmount,Currency:item.data.AllowanceCurrency,AllowanceKey:allowanceType[index].getKey()};
        	 });
        	 var vIndex = 1;
        	 var aData1 = []; 
        	 for(var i=0;i<aData.length;i++){
        		 var index = i%2;
        		 if(index == 0){
        			 aData1.push({});
        			 vIndex = 1;        			 
        		 }else{
        			 vIndex = 2;
        		 }
        		
        	 var lastIndex = aData1.length-1;	 
        	 aData1[lastIndex]["AllowanceTyp"+vIndex] = aData[i].AllowanceTyp;
        	 aData1[lastIndex]["AllowanceAmount"+vIndex] = aData[i].AllowanceAmount;
        	 aData1[lastIndex]["AllowanceKey"+vIndex] = aData[i].AllowanceKey;
        	 aData1[lastIndex]["Currency"+vIndex] = aData[i].Currency;
        		
        	 }
        	 staAllowanceamountModel.setData(aData1);
        	 this.getView().byId("ipAllowanceAmt").setModel(staAllowanceamountModel,"allwAmounts");
	
     	},this));
	    }
	}else{
		if(this.getView().byId("ipAllowanceAmt").getModel("allwAmounts"))
	     	this.getView().byId("ipAllowanceAmt").getModel("allwAmounts").setData([]);
	}
  },
  
  
  onGenerateCL:function(){
    var batch = [];
    this["errorDetls"] = [];
    var oCl = [];
    var oCs = [];
    var oCa = [];
    var logDef = $.Deferred();
    var message;

    var lType = this.getView().byId("ipLtype").getSelectedKey();
    var format = this.getView().byId("ipFormat").getSelectedKey();
    var items = this.getView().byId("tblIssue").getSelectedItems();
    if(items.length==0)
      {
      sap.m.MessageToast.show("Please select atleast one row");
      return;
      }else{
        var asgtype = this.getView().byId("ipAsgtyp").getSelectedKey();
        var tocnty = this.getView().byId("ipTocnty").getSelectedKey();

        var trvcat = this.getView().byId("ipTrvcat").getSelectedKey();
        
       if(tocnty!='DE'){
        message =   this.checkSTAAlowance(tocnty,asgtype,trvcat,lType);
        if(message!="") {
        	if(typeof(message)!="undefined"){
        	sap.m.MessageToast.show(message);	
        	return;	
        }}
       }
        if(sap.ui.project.e2etm.util.StaticUtility.checkCggs(tocnty,asgtype,trvcat)){
        if(lType == ""){
          sap.m.MessageToast.show("Please select Letter Type");
          return;
        }
        
        if(format == "" && (lType == "CL" || lType == "CC")){
          sap.m.MessageToast.show("Please select Contract Letter Format");
          return;
        }
        }


      }
    sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
    jQuery.sap.delayedCall(1000,this,function(){
    for(var i=0;i<items.length;i++){
      var rowData = items[i].getBindingContext().getModel().getProperty(items[i].getBindingContext().sPath);

      if(sap.ui.project.e2etm.util.StaticUtility.checkCggs(tocnty,asgtype,trvcat)){
      if(lType == "CL"){
           var oData = {};
         oData.ZZ_DEP_REQ = rowData.DepReq;
         oData.ZZ_DEP_PERNR = rowData.Pernr;
         oData.ZZ_ASG_TYP = rowData.AsgType;
         oData.ZZ_AUTOMATIC = 'I';
         oData.ZZ_HOSTENTITY = '';
         oData.ZZ_JOB = '';
         oData.ZZ_MENTOR = '';
         oData.ZZ_STADECL_MODE = format;
        // batch.push(oDataModel.createBatchOperation("ZE2E_DOCS_DETAILSSet", "POST", oData));
         var oDef1 = this.postCL(oData);
         oCl.push(oDef1);
             
      } else if(lType == "CS"){
        var oData = {};
        oData.DepReq = rowData.DepReq;
        oData.Pernr = rowData.Pernr;
        oData.AsgTyp = rowData.AsgType;
        oData.Version = rowData.Version;
        oData.SeqNo   = rowData.SeqNo;
        oData.Tab = 'I';
      //  batch.push(oDataModel.createBatchOperation("CggsCalcSheetSet", "POST", oData));
        var oDef2 = this.postCS(oData);
        oCs.push(oDef2);
      }else if(lType == "CC"){
    	  if(rowData.ShStatus == "E"){
    		  var errorMsg = "Revised Salary slip is not available for the employee"+ rowData.Pernr;
    		  this.errorDetls.push({type:'Error',
                                    title:errorMsg,
                                    description:errorMsg});
    	  }else if(rowData.ShStatus == "G" || rowData.ShStatus == "R"){
    		  var errorMsg = "Salary slip for the employee "+ rowData.Pernr +"is not yet signed by Reviewer and Approver";
    	  
    		  this.errorDetls.push({type:'Error',
                                    title:errorMsg,
                                    description:errorMsg});
    	  }else if(rowData.ShStatus == ""){
    		  var errorMsg = "Salary slip for the employee "+ rowData.Pernr +"is not generated";
        	  
    		  this.errorDetls.push({type:'Error',
                                    title:errorMsg,
                                    description:errorMsg});
    	  }
    	  else{   		  
    	  

            var oData = {};
            oData.ZZ_DEP_REQ = rowData.DepReq;
            oData.ZZ_DEP_PERNR = rowData.Pernr;
            oData.ZZ_ASG_TYP = rowData.AsgType;
            oData.ZZ_AUTOMATIC = 'I';
            oData.ZZ_HOSTENTITY = '';
            oData.ZZ_JOB = '';
            oData.ZZ_MENTOR = '';
            oData.ZZ_STADECL_MODE = format;
            var oDef1 = this.postCL(oData);
            oCl.push(oDef1);

            oData = {};
            oData.DepReq = rowData.DepReq;
            oData.Pernr = rowData.Pernr;
            oData.AsgTyp = rowData.AsgType;
            oData.Version = rowData.Version;
            oData.Tab = 'I';
            var oDef2 = this.postCS(oData);
            oCs.push(oDef2);
      }
      }
      }else{
    	  if(lType=='CL'){
    	lType = "CL";
        var oData = {};
        oData.ZZ_DEP_REQ = rowData.DepReq;
        oData.ZZ_DEP_PERNR = rowData.Pernr;
        oData.ZZ_ASG_TYP = rowData.AsgType;
        oData.ZZ_AUTOMATIC = 'I';
        oData.ZZ_HOSTENTITY = '';
        oData.ZZ_JOB = '';
        oData.ZZ_MENTOR = '';
        var oDef1 = this.postCL(oData);
        oCl.push(oDef1);
     //   batch.push(oDataModel.createBatchOperation("ZE2E_DOCS_DETAILSSet", "POST", oData));
      }else if(lType=='CA'){
    	  var oData = {};
          oData.ZzEmpno = rowData.Pernr;
          oData.ZzYear =  this.getView().byId("ipLYear").getSelectedKey() ;          
          oData.ZzDepReq = rowData.DepReq;;
          oData.ZzVersion = parseInt(rowData.Version);
          oData.ZzTrvReq = '';
          oData.Emessage = '';
          oData.EffcDate = this.getView().byId("ipEffDate").getValue();
          oData.LetterToAllwNav = [];
          var aAmounts = this.getView().byId("ipAllowanceAmt").getModel("allwAmounts").getData();

          for(var i=0;i<aAmounts.length;i++){
        	  if(aAmounts[i].AllowanceTyp1){
        		  oData.LetterToAllwNav.push({ZzEmpno: oData.ZzEmpno,ZzDepReq:oData.ZzDepReq,ZzVersion:oData.ZzVersion,
        			                          ZzTrvReq:oData.ZzTrvReq,ZzAllwcTyp:aAmounts[i].AllowanceTyp1,ZzAmount:aAmounts[i].AllowanceAmount1,
        			                          ZzCurr:aAmounts[i].Currency1});
        		  
        	  }
        	  if(aAmounts[i].AllowanceTyp2){
        		  oData.LetterToAllwNav.push({ZzEmpno: oData.ZzEmpno,ZzDepReq:oData.ZzDepReq,ZzVersion:oData.ZzVersion,
        			                          ZzTrvReq:oData.ZzTrvReq,ZzAllwcTyp:aAmounts[i].AllowanceTyp2,ZzAmount:aAmounts[i].AllowanceAmount2,
        			                          ZzCurr:aAmounts[i].Currency2});
        		  
        	  }
          }
          var oDef1 = this.postCA(oData);
          oCa.push(oDef1);
    	  
      }
     }
    }
   
    
    if(lType == "CC"){
      $.when.apply($,oCs).done(
			jQuery.proxy(function(csData){
				$.when.apply($,oCl).done(jQuery.proxy(function(clData) {  
			    	
					 sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);                 
				     sap.m.MessageToast.show("Transaction complete.Please check the log for error details(if any)");
			        
			    },this))
			    .fail(jQuery.proxy(function(){
			       sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
			       sap.m.MessageToast.show("Transaction complete.Please check the log for error details(if any)");
			    //   sap.m.MessageToast.show("Internal Server Error");
			    },this));
//				 sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);                 
//			     sap.m.MessageToast.show("Transaction complete.Please check the log for error details(if any)");
			},this));
    }else if(lType == "CL"){
		$.when.apply($,oCl).done(jQuery.proxy(function(clData) {  
	    	
			 sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);                 
		     sap.m.MessageToast.show("Transaction complete.Please check the log for error details(if any)");
	        
	    },this))
	    .fail(jQuery.proxy(function(){
	       sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);
	       sap.m.MessageToast.show("Transaction complete.Please check the log for error details(if any)");
	    //   sap.m.MessageToast.show("Internal Server Error");
	    },this));
    }else if(lType == "CS"){
    	 $.when.apply($,oCs).done(
    				jQuery.proxy(function(csData){   					
    				    	sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);                 
    					    sap.m.MessageToast.show("Transaction complete.Please check the log for error details(if any)");
    				        
    				    
    				    },this));
    }else if(lType == "CA"){
    	 $.when.apply($,oCa).done(
 				jQuery.proxy(function(caData){   					
 				    	sap.ui.project.e2etm.util.StaticUtility.setBusy(false,this);                 
 					    sap.m.MessageToast.show("Transaction complete.Please check the log for error details(if any)");
 				        
 				    
 				    },this));
    	
    }

//    if(batch.length!=0){
//      oComponent.getModel().addBatchChangeOperations(batch);
//          oComponent.getModel().submitBatch(jQuery.proxy(function(oResult) {
//        try {
//          sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
//          if(lType == "CS"){
//        	  for(var i=0;i<oResult.__batchResponses[0].__changeResponses.length;i++){
//					if(oResult.__batchResponses[0].__changeResponses[i].data.EMessage!=""){
//						this.errorDetls.push({type:'Error',
//			                  title:oResult.__batchResponses[0].__changeResponses[i].data.EMessage,
//			              description:oResult.__batchResponses[0].__changeResponses[i].data.EMessage});
//					}
//        	  }
//        	  sap.m.MessageToast.show("Transaction complete.Please check the log for error details(if any)");
//          }else
//             sap.m.MessageToast.show("Letter(s) generated successfully");
//          
//         
//
//        } catch (err) {
//          sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
//        }
//      },this), jQuery.proxy(function(error) {
//        sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
//      },this), true);
//    }

    });

  },
  
  checkSTAAlowance:function(tocnty,asgtype,trvcat,lType,message){
	  
	  if((asgtype=='STA' || asgtype=='STAPP' || asgtype=='TRNG')&& trvcat == "WRKP"&&tocnty != 'DE'){
	 
		  	if(lType==""){
		  		return "Please select Letter Type" ;	
		  	}else if(lType=="CA"){
		  		
		  		var alowtype = this.getView().byId("ipAllowanceTyp").getSelectedKeys();
		  		var Year	=  this.getView().byId("ipLYear").getSelectedKey();
		  		var amount =  this.getView().byId("ipAllowanceAmt").getModel("allwAmounts").getData();
//		  		this.getView().byId("ipAllowanceAmt").setModel(staAllowanceamountModel,"allwAmounts");
	  		
		  	
		  	if(alowtype.length == 0){	  		
		          return  "Please select Allowance Type";		
		  		
		  	}
		  
			if(Year == ""){
		  		sap.m.MessageToast.show("Please Select Year");
		  			return  "Please Select Year";		
		  		
		  	}
			
			var bAllw = amount.some(function(item,index){
				if(item.AllowanceAmount1=="" || !(item.AllowanceAmount1)){
					return true;
				}
				if(item.Currency1 == "" || !(item.Currency1)){
					return true;
				}
				if(item.AllowanceTyp2){
				if(item.AllowanceAmount2=="" || !(item.AllowanceAmount2)){
					return true;
				}
				if(item.Currency2 == "" || !(item.Currency2)){
					return true;
				}
				}
			});
			
			if(bAllw){
				return  "Please enter Allowances and currencies";		
			}
			
			var effDate = this.getView().byId("ipEffDate").getValue();
			if(effDate == ""){
				return  "Please enter Effective Date";
			}
			
			
//			if(amount == ""){
//		  			return  "Please Enter Amount";		
//		  		
//		  	}
//			
//			if(currency == ""){ 
//		  		return  "Please Enter Currency";		
//		  		
//		  	}
		  
		  	
		  	}
	  
	  }
	 },
  
  
  postCA:function(oData){
	  var oDef = $.Deferred();
      oComponent.getModel().create("AllwcLetterSet", oData, {success:jQuery.proxy(function(oData, response) { 
    	  if(oData.Emessage!=""){
    		  this.errorDetls.push({type:'Error',
                  title:oData.Emessage,
                  description:oData.Emessage});
    	  }
     	oDef.resolve();
  },this), error:jQuery.proxy(function(error) {
	  var title = "";
	   var message = "";
	   title = "Error in STA Allowance Letter generation for Dep Req No:"+JSON.parse(error.request.body).DepReq;
	   if(error.responseText){
			message = JSON.parse(error.responseText).error.message.value;					
		}else{
			message = JSON.parse(error.response.body).error.message.value;
		}
	   this.errorDetls.push({type:'Error',
          title:title,
          description:message});
	   oDef.resolve();
  },this), async:true});
      
      return oDef;
	  
	  
  },
  postCS:function(oData){
	  var oDef = $.Deferred();
      oComponent.getModel().create("CggsCalcSheetSet", oData, {success:jQuery.proxy(function(oData, response) { 
    	  if(oData.EMessage!=""){
    		  this.errorDetls.push({type:'Error',
                  title:oData.EMessage,
                  description:oData.EMessage});
    	  }
     	oDef.resolve();
  },this), error:jQuery.proxy(function(error) {
	  var title = "";
	   var message = "";
	   title = "Error in Salary slip generation for Dep Req No:"+JSON.parse(error.request.body).DepReq;
	   if(error.responseText){
			message = JSON.parse(error.responseText).error.message.value;					
		}else{
			message = JSON.parse(error.response.body).error.message.value;
		}
	   this.errorDetls.push({type:'Error',
          title:title,
          description:message});
	  oDef.resolve();
  },this), async:true});
      
      return oDef;
  },
  postCL:function(oData){
	  var oDef = $.Deferred();
      oComponent.getModel().create("ZE2E_DOCS_DETAILSSet", oData, {success:function(oData, response) {
         //oCl[defPos].resolve();      
      	   oDef.resolve();      	
       }, error:jQuery.proxy(function(error) {
    	   var title = "";
    	   var message = "";
    	   title = "Error in CL generation for Dep Req No:"+JSON.parse(error.request.body).ZZ_DEP_REQ;
    	   if(error.responseText){
				message = JSON.parse(error.responseText).error.message.value;					
			}else{
				message = JSON.parse(error.response.body).error.message.value;
			}
    	   this.errorDetls.push({type:'Error',
               title:title,
               description:message});
    	   oDef.resolve();
       },this), async:true});
      
      return oDef;
  },
  onLogPress:function(evt){
    var pop;
    if (!sap.ui.getCore().byId("msgPopOver")) {
      var oMessageTemplate = new sap.m.MessagePopoverItem({
        type : '{type}',
        title : '{title}',
        description : '{description}'
      });
      pop = new sap.m.MessagePopover("msgPopOver", {
        items : {
          path : '/',
          template : oMessageTemplate
        }
      });
    } else {
      pop = sap.ui.getCore().byId("msgPopOver");
    }
    var oModel = new sap.ui.model.json.JSONModel();
    oModel.setData(this["errorDetls"]);
    pop.setModel(oModel);
    pop.openBy(evt.getSource());
  }
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf e2etm.controller.IssueCL
*/
//  onBeforeRendering: function() {
//
//  },

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf e2etm.controller.IssueCL
*/
//  onAfterRendering: function() {
//
//  },

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf e2etm.controller.IssueCL
*/
//  onExit: function() {
//
//  }

});