jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportType");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.controller("sap.ui.project.e2etm.controller.TrstSecoAdvanceReport", {
  /**
   * Called when a controller is instantiated and its View controls (if
   * available) are already created. Can be used to modify the View before it
   * is displayed, to bind event handlers and do other one-time
   * initialization.
   * 
   * @memberOf e2etm.view.TrstSecoAdvanceReport
   */
  // onInit: function() {
  //
  // },
  /**
   * Similar to onAfterRendering, but this hook is invoked before the
   * controller's View is re-rendered (NOT before the first rendering!
   * onInit() is used for that one!).
   * 
   * @memberOf e2etm.view.TrstSecoAdvanceReport
   */
  // onBeforeRendering: function() {
  //
  // },

  onSubmit : function(evt) {
    var table = this.getView().byId("tblSecoAdvRep");
    var frDate = this.getView().byId("fromdate").getValue();
    var toDate = this.getView().byId("todate").getValue();
    var filterString;
    if (frDate) {
      filterString = "Recdt ge datetime'" + frDate + "T00:00:00'";
    }
    if (toDate) {
      filterString = filterString ? filterString + " and Recdt le datetime'" + toDate + "T00:00:00'" : "Recdt le datetime'" + toDate + "T00:00:00'";
    }
    if (filterString) {
      oComponent.getModel().read("TrstSecoAdvanceRepSet?$filter=" + filterString, null, null, true,
      // success
      jQuery.proxy(function(oData, response) {
        var model = new sap.ui.model.json.JSONModel();
        model.setData(oData.results);
        table.setModel(model);
        // sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
      }, this), jQuery.proxy(function(error) {
        // error
        // sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
      }, this));
    } else {
      sap.m.MessageToast.show("Please enter any filter criteria");
    }
  },
  onExport : function(evt) {
    var columns = this.getColumns();
    var oExport = new sap.ui.core.util.Export({
      exportType : new sap.ui.core.util.ExportTypeCSV({
        separatorChar : ","
      }),
      models : this.getView().byId("tblSecoAdvRep").getModel(),
      rows : {
        path : "/"
      },
      columns : columns
    });
    // download exported file
    oExport.saveFile("Secondary Advance Report").always(function() {
      this.destroy();
    });
  },
  getColumns : function() {
    var columns = [];
    var table = this.getView().byId("tblSecoAdvRep");
    var cols = table.getColumns();
    for ( var i = 0; i < cols.length; i++) {
      if ((cols[i].getId().indexOf("txtDate1") != -1) || (cols[i].getId().indexOf("txtDate2") != -1)) {
        var path = cols[i].getTemplate().getBindingInfo("text").parts[0].path;
        // var path = cells[i].getBindingInfo("text").parts[0].path;
        columns.push({
          name : cols[i].getLabel().getText(),
          template : {
            content : {
              path : path,
              type : new sap.ui.model.type.DateTime({
                pattern : 'dd.MM.yyyy',
              })
            }
          }
        });
      } else if (cols[i].getId().indexOf("txtAmount") != -1) {
        var path = cols[i].getTemplate().getBindingInfo("text").parts[0].path;
        // var path = cells[i].getBindingInfo("text").parts[0].path;
        columns.push({
          name : cols[i].getLabel().getText(),
          template : {
            content : {
              parts : [ {
                path : path
              }, {
                path : 'Currency'
              } ],
              type : new sap.ui.model.type.Currency({
                currencyCode : false
              }),
            }
          }
        });
      }else if((cols[i].getId().indexOf("txtBkact")!=-1)||(cols[i].getId().indexOf("txtIbano")!=-1)
          ||(cols[i].getId().indexOf("txtSwbic")!=-1)||(cols[i].getId().indexOf("txtSsnno")!=-1)){
        var path = cols[i].getTemplate().getBindingInfo("text").parts[0].path;
        // var path = cells[i].getBindingInfo("text").parts[0].path;
        columns.push({
          name : cols[i].getLabel().getText(),
          template : {
            content : {
              path : path,
              formatter : function(value){
                if(value)
                  return "'" + value + "'";
              }
            }
          }
        });
      }
      else {
        var path = cols[i].getTemplate().getBindingInfo("text").parts[0].path;
        // var path = cells[i].getBindingInfo("text").parts[0].path;
        columns.push({
          name : cols[i].getLabel().getText(),
          template : {
            content : "{" + path + "}"
          }
        });
      }
    }
    return columns;
  },
  onProcess:function(){
    sap.ui.project.e2etm.util.StaticUtility.setBusy(true, this);
    var resultSet = {TrstSecoAdv:[]};
    var table = this.getView().byId("tblSecoAdvRep");
    var indices = table.getSelectedIndices();
    var data = table.getModel().getData();

    if (indices.length != 0) {
      var bindItems = table.getBinding("rows");
      var aIndices = bindItems.aIndices;
      for ( var i = 0; i < indices.length; i++) {
        var index = aIndices[indices[i]];
        var odata = data[index];
        if (odata.__metadata)
          odata.__metadata = undefined;
        resultSet.TrstSecoAdv.push(odata);

      }
      oComponent.getModel().create("TrstSecoAdvanceRepSet", resultSet, null, jQuery.proxy(function(oData, response) {
        // oController.uploadFiles(global.ZZ_TRV_REQ);
        sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
        this.getView().byId("btnSubmit").firePress();
        sap.m.MessageToast.show("Processed Successfully", {
          duration : 10000,
          closeOnBrowserNavigation : false
        });
      },this),jQuery.proxy(function(error) {
        sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
        sap.m.MessageToast.show("Internal Server Error");
      },this), true);

    } else {
      sap.ui.project.e2etm.util.StaticUtility.setBusy(false, this);
      sap.m.MessageToast.show("Please select atleast  one row");
    }

  },
  onChangeMode:function(evt){
    if (this.getView().getParent().getParent().getMode() != "HideMode"){
      this.getView().getParent().getParent().setMode("HideMode");
    //  evt.getSource().setVisible(false);
    }
    else
      this.getView().getParent().getParent().setMode("ShowHideMode");
  }
/**
 * , onExport Called when the View has been rendered (so its HTML is part of the
 * document). Post-rendering manipulations of the HTML could be done here. This
 * hook is the same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf e2etm.view.TrstSecoAdvanceReport
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf e2etm.view.TrstSecoAdvanceReport
 */
// onExit: function() {
//
// }
});