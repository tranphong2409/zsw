jQuery.sap.declare("sap.ui.project.e2etm.controls.stageItem");
jQuery.sap.require("sap.ui.commons.Link");
//$.sap.includeStyleSheet("path/to/css/file");
 
sap.ui.core.Control.extend("sap.ui.project.e2etm.controls.stageItem", {
 
    // the control API:
    metadata : { 
        properties : {
            /* Business Object properties */
        	isSelected		  : {type : "string"}, // X
        	stage			  : {type : "string"},
        	item			  : {type : "string"},
            itemName          : {type : "string"},
            status			  : {type : "string"}, // PROCESS, DONE, NOT_STARTED
            zindex			  : {type : "int"},
            /* other (configuration) properties */
            width             : {type : "sap.ui.core.CSSSize", defaultValue : "175px"},
            height            : {type : "sap.ui.core.CSSSize", defaultValue : "30px"},
        },
        
        events : {
            press : {enablePreventDefault : true}
        }
    },
    
    curID : 1,
    itemLink : null,
    
    init : function(){
    	var oControl = this;
    },
                    
    onAfterRendering: function (){
        //called after instance has been rendered (it's in the DOM)
    },
    
    renderer : {
        render : function(oRm, oControl) {
            oRm.write("<div");
            oRm.addClass("commonItem");
            oRm.writeClasses();
            oRm.addStyle("width", oControl.getWidth());
            oRm.addStyle("height", oControl.getHeight());
            if (oControl.getStatus() == "2") {
            	oRm.addStyle("background", "url('./images/process_green.png') no-repeat");
            } else if (oControl.getStatus() == "1") {
            	oRm.addStyle("background", "url('./images/process_blue.png') no-repeat");
            } else if (oControl.getStatus() == "0") {
            	oRm.addStyle("background", "url('./images/process_grey.png') no-repeat");
            }
            oRm.addStyle("color", "white");
        	oRm.addStyle("font-weight", "bold");
            oRm.addStyle("z-index", oControl.getZindex());
            oRm.addStyle("background-size", "contain");
            oRm.writeStyles();
            oRm.writeControlData(oControl);
            oRm.write(">");
            
            itemLink = new sap.ui.commons.Link({
        		text : oControl.getItemName(),
        		press: function (oEvent) {
                    oControl.firePress({
                        item : oControl.getItemName(),
                        status : oControl.getStatus()
                    });
                }
        	});
            itemLink.setText(oControl.getItemName());
            itemLink.addStyleClass("stageItemLink");
            
            oRm.renderControl(itemLink);
        	if (oControl.getIsSelected() == "X") {
        		oRm.write("<div style='position: absolute; border-bottom: 15px solid #003B6A; width: 0px; height: 0px; " +
        				"top: 26px; left: 80px; border-left: 10px solid transparent; border-right: 10px solid transparent;'></div>");
        	}
            
            oRm.write("</div>");
        }
    }
});