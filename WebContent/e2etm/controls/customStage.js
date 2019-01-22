jQuery.sap.declare("sap.ui.project.e2etm.controls.customStage");
//$.sap.includeStyleSheet("path/to/css/file");
 
sap.ui.core.Control.extend("sap.ui.project.e2etm.controls.customStage", {
 
    // the control API:
    metadata : { 
        properties : {
            /* Business Object properties */
            stage             : {type : "string"},
            zindex			  : {type : "int"},
            status			  : {type : "string"}
        },
        
        aggregations : {
            items      		: {type : "sap.ui.project.e2etm.controls.stageItem", multiple : true, visibility: "public"}
        },
    },
 
    init : function(){
    },
    
    removeSetAllIsSelectedProperty : function() {
    	for (var i = 0; i < this.getAggregation("items").length; i++) {
    		this.getAggregation("items")[i].setIsSelected("");
    	}
    },
    
    onAfterRendering: function (){
        //called after instance has been rendered (it's in the DOM)
    },
    
    renderer : {
        render : function(oRm, oControl) {
            oRm.write("<div");
            oRm.addClass("stage");
            oRm.writeClasses();
            oRm.addStyle("z-index", oControl.getZindex());
            oRm.writeStyles();
            oRm.writeControlData(oControl);
            oRm.write(">");
            
            var aChildren = oControl.getAggregation("items");
            var overlap = 0;
            if (aChildren.length > 1) {
            	overlap = (aChildren.length - 1) * 10;
            }
//            var width = 150 * aChildren.length - 14 - overlap;
            var width = 175 * aChildren.length - 14 - overlap - 2;
            var divStr = "";
            if (oControl.getStatus() == "1") {
            	divStr = "<div class='contentBlock' style='text-align: center; font-size: 16px; font-weight: bold; " +
        		"padding: 5px 0px; width: " + width + "px; border: 2px solid lightblue; border-bottom: 0;'>";
            } else if (oControl.getStatus() == "2") {
            	divStr = "<div class='contentBlock' style='text-align: center; font-size: 16px; font-weight: bold; " +
        		"padding: 5px 0px; width: " + width + "px; border: 2px solid lightgreen; border-bottom: 0;'>";
            } else if (oControl.getStatus() == "0") {
            	divStr = "<div class='contentBlock' style='text-align: center; font-size: 16px; font-weight: bold; " +
        		"padding: 5px 0px; width: " + width + "px; border: 2px solid lightgray; border-bottom: 0;'>";
            } else {
            	divStr = "<div class='contentBlock' style='text-align: center; font-size: 16px; font-weight: bold; " +
        		"padding: 5px 0px; width: " + width + "px; border: 2px solid lightgray; border-bottom: 0;'>";
            }
            oRm.write(divStr);
            oRm.write(oControl.getStage() + "</div>");
            
            var zindex = 999;
            for (var i = 0; i < aChildren.length; i++) {
            	if (i != 0) {
            		aChildren[i].addStyleClass("margin_left_minus10");
            	}
            	zindex = zindex - i;
            	oRm.renderControl(aChildren[i]);
            }
            oRm.write("<div style='clear: both;'></div>");
            
            oRm.write("</div>");
        }
    }
});