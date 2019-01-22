sap.ui.controller("sap.ui.project.e2etm.controller.Login", {

	onInit : function(evt) {
		
	},
	
	handleLogin : function(evt) {
		var oThis = this;
        // Check the use's role. If employee, setup employee route. 
        // Otherwise, setup appropriate route.
		var txtUsername = this.getView().byId("txtUsername").getValue();
		var txtPassword = this.getView().byId("txtPassword").getValue();
		
		if (txtUsername == '' || txtPassword == '') {
			alert("Please input username and / or password");
		} else {
			var profileModel = new sap.ui.model.json.JSONModel();
			var aData = {};
			var post = $.ajax({
				cache: false,
			    url: sServiceUrl + "DEP_EMPSet",
			    dataType: 'json',
			    async: false,
			    type: "GET",
			    beforeSend : function(xhr) {
			    	xhr.setRequestHeader ("Authorization", "Basic " + Base64.encode(txtUsername + ":" + txtPassword));
			    },
			});
			post.done(function(result){
				if (result != null) {
					aData.employeeDetail = result.d.results[0];
					aData.currentRole = "EMP";
					aData.myAction = "";
					// Check if this account has manager role and set it to model Profile
					var role = result.d.results[0].ZZ_POSITION;
					var roles = role.split(";");
					for(var i = 0; i < roles.length; i++) {
						var curRole = roles[i];
						if (curRole == "MGR") {
							aData.currentRole = curRole;
							break;
						}
					}
					profileModel.setData(aData);
					sap.ui.getCore().setModel(profileModel, "profile");
					oThis.getView().byId("txtUsername").setValue("");
					oThis.getView().byId("txtPassword").setValue("");
				}
			}).then(function(){
				sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
			});
		}
	},
	
});