jQuery.sap.require("sap.ui.project.e2etm.util.Formatter");
jQuery.sap.require("sap.ui.project.e2etm.util.StaticUtility");
sap.ui.controller("sap.ui.project.e2etm.controller.TrstReports", {
  /**
   * Called when a controller is instantiated and its View controls (if
   * available) are already created. Can be used to modify the View before it
   * is displayed, to bind event handlers and do other one-time
   * initialization.
   * 
   * @memberOf e2etm.view.TrstReports
   */
  onInit : function() {
    var oShell = oComponent.oContainer.getParent();
    oShell.setAppWidthLimited(false);
    this.getView().byId("masterlist").fireItemPress();
  },

//  onItemPress : function(evt) {
//    var item = evt.oSource.getSelectedItem();
//    var spApp = this.getView().byId("splitapp");
//    var id = "";
//    var page;
//    if (item)
//      id = item.getId().split("--")[1];
//    switch (id) {
//    case "setlUsetlRep":
//      //this.getView().byId("pgTitle").setText("Settled/Unsettled Reports");
//      page = spApp.getPage("setlUsetlView", false);
//      if (!(page)) {
//        page = sap.ui.view({
//          id : "setlUsetlView",
//          viewName : "sap.ui.project.e2etm.view.SetlUsetlReport",
//          type : sap.ui.core.mvc.ViewType.XML
//        });
//        spApp.addPage(page, false);
//      }
//      spApp.to(page);
//      break;
//    case "secoAdvRep":
//      //this.getView().byId("pgTitle").setText("Secondary Advance");
//      page = spApp.getPage("secoAdvView", false);
//      if (!(page)) {
//        page = sap.ui.view({
//          id : "secoAdvView",
//          viewName : "sap.ui.project.e2etm.view.TrstSecoAdvanceReport",
//          type : sap.ui.core.mvc.ViewType.XML
//        });
//        spApp.addPage(page, false);
//      }
//      spApp.to(page);
//      break;
//      
//    case "insRecRep":
//        //this.getView().byId("pgTitle").setText("Secondary Advance");
//        page = spApp.getPage("insRecView", false);
//        if (!(page)) {
//          page = sap.ui.view({
//            id : "insRecView",
//            viewName : "sap.ui.project.e2etm.view.InsSlaReport",
//            type : sap.ui.core.mvc.ViewType.XML
//          });
//          spApp.addPage(page, false);
//        }
//        spApp.to(page);
//        break;
//    case "accSetlRep":
//    	 page = spApp.getPage("accSetlViewPg", false);
//         if (!(page)) {
//           page = new sap.m.Page("accSetlViewPg",{content:sap.ui.view({
//             id : "accSetlView",
//             viewName : "sap.ui.project.e2etm.view.BookingSetlReport",
//             type : sap.ui.core.mvc.ViewType.XML
//           })});
//           spApp.addPage(page, false);
//         }
//         spApp.to(page);
//         break;
// 
//    }
//    if (!page) {
//      page = spApp.getPage("defaultPage", false);
//      if (!(page)) {
//        page = new sap.m.Page({showHeader:true,content:[
//               new sap.m.MessagePage({showHeader:false})
//               ]});
//        spApp.addPage(page, false);
//      }
//      spApp.to(page);
//    }
//  },
  onItemPress : function(evt) {
	    var item = evt.oSource.getSelectedItem();
	    var spApp = this.getView().byId("splitapp");
	    var id = "";
	    var page;
	    if (item)
	      id = item.getId().split("--")[1];
	    switch (id) {
	    case "setlUsetlRep":
	      //this.getView().byId("pgTitle").setText("Settled/Unsettled Reports");
	      page = spApp.getPage("setlUsetlView", false);
	      if (!(page)) {
	        page = sap.ui.view({
	          id : "setlUsetlView",
	          viewName : "sap.ui.project.e2etm.view.SetlUsetlReport",
	          type : sap.ui.core.mvc.ViewType.XML
	        });
	        spApp.addPage(page, false);
	      }
	      spApp.to(page);
	      break;
	    case "secoAdvRep":
	      //this.getView().byId("pgTitle").setText("Secondary Advance");
	    	sap.ui.core.routing.Router.getRouter("MyRouter").navTo("setlSecoAdvRep");
//	      page = spApp.getPage("secoAdvView", false);
//	      if (!(page)) {
//	        page = sap.ui.view({
//	          id : "secoAdvView",
//	          viewName : "sap.ui.project.e2etm.view.TrstSecoAdvanceReport",
//	          type : sap.ui.core.mvc.ViewType.XML
//	        });
//	        spApp.addPage(page, false);
//	      }
//	      spApp.to(page);
	      break;
	      
	    case "insRecRep":
	        //this.getView().byId("pgTitle").setText("Secondary Advance");
	    	sap.ui.core.routing.Router.getRouter("MyRouter").navTo("setlInsRecRep");
//	        page = spApp.getPage("insRecView", false);
//	        if (!(page)) {
//	          page = sap.ui.view({
//	            id : "insRecView",
//	            viewName : "sap.ui.project.e2etm.view.InsSlaReport",
//	            type : sap.ui.core.mvc.ViewType.XML
//	          });
//	          spApp.addPage(page, false);
//	        }
//	        spApp.to(page);
	        break;
	    case "accSetlRep":
	    	sap.ui.core.routing.Router.getRouter("MyRouter").navTo("setlAccRep");
//	    	 page = spApp.getPage("accSetlViewPg", false);
//	         if (!(page)) {
//	           page = new sap.m.Page("accSetlViewPg",{content:sap.ui.view({
//	             id : "accSetlView",
//	             viewName : "sap.ui.project.e2etm.view.BookingSetlReport",
//	             type : sap.ui.core.mvc.ViewType.XML
//	           })});
//	           spApp.addPage(page, false);
//	         }
//	         spApp.to(page);
	         break;
	    case "itmClDownload":
	    	sap.ui.core.routing.Router.getRouter("MyRouter").navTo("setlDownloadCL");
	 break;
	    }
//	    if (!page) {
//	      page = spApp.getPage("defaultPage", false);
//	      if (!(page)) {
//	        page = new sap.m.Page({showHeader:true,content:[
//	               new sap.m.MessagePage({showHeader:false})
//	               ]});
//	        spApp.addPage(page, false);
//	      }
//	      spApp.to(page);
//	    }
	  },
  onChangeMode : function(evt) {
    if (this.getView().byId("splitapp").getMode() != "HideMode"){
      this.getView().byId("splitapp").setMode("HideMode");
    //  evt.getSource().setVisible(false);
    }
    else
      this.getView().byId("splitapp").setMode("ShowHideMode");
    
//    var oShell = oComponent.oContainer.getParent();
//	oShell.setAppWidthLimited(false);	
  }
/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf e2etm.view.TrstReports
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.TrstReports
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.TrstReports
 */
// onExit: function() {
//
// }
});