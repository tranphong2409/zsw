jQuery.sap.require("sap.m.UploadCollectionParameter");
jQuery.sap.require("sap.m.MessageToast");

sap.ui.project.e2etm.util.FileUpload = {
		onChange: function(oEvent, oController) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name : "x-csrf-token",
				value : "securityTokenFromModel"
			});
			// Header Slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name : "slug",
				value : oEvent.getParameter("files")[0].name
			});

			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
			oUploadCollection.addHeaderParameter(oCustomerHeaderSlug);
			sap.m.MessageToast.show("Event change triggered");
		},

		onFileDeleted: function(oEvent,oController) {
			var oData = oController.oView.getModel().getData();
			var aItems = oData.items;
			var sDocumentId = oEvent.getParameter("documentId");
			var bSetData = false;

			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sDocumentId) {
					aItems.splice(index, 1);
					bSetData = true;
				};
			});
			if (bSetData === true) {
				oController.oView.getModel().setData(oData);
			};
			sap.m.sap.m.MessageToast.show("Event fileDeleted triggered");
		},

		onFilenameLengthExceed : function(oEvent,oController) {
			sap.m.MessageToast.show("Event filenameLengthExceed triggered");
		},

		onFileRenamed: function(oEvent,oController) {
			var oData = oController.oView.getModel().getData();
			var aItems = oData.items;
			var sDocumentId = oEvent.getParameter("documentId");
			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sDocumentId) {
					aItems[index].fileName = oEvent.getParameter("item").getFileName();
				};
			});
			oController.oView.getModel().setData(oData);
			sap.m.MessageToast.show("Event fileRenamed triggered");
		},

		onFileSizeExceed : function(oEvent,oController) {
			sap.m.MessageToast.show("Event fileSizeExceed triggered");
		},

		onTypeMissmatch : function(oEvent) {
			sap.m.MessageToast.show("Event typeMissmatch triggered");
		},

		onUploadComplete: function(oEvent, sDepReq, sModule) {
			var fnCurrentDate = function() {
				var date = new Date();
				var day = date.getDate();
				var month = date.getMonth() + 1;
				var year = date.getFullYear();

				if (day < 10) {
					day = '0' + day
				};
				if (month < 10) {
					month = '0' + month
				}
				return year + '-' + month + '-' + day;
			};

			if (oEvent) {
				var sUploadedFile = oEvent.getParameters().getParameter("fileName");
				var oData =  oEvent.oSource.getParent().getModel("new").getData();
				var oItem = {};
				oItem = {
						Country: "",
							DepReq: sDepReq,
							DocType: sModule,
							EmpNo: "",
							FileContent: "",
							FileMimeType: "",
							FileName: sUploadedFile,
							FileUrl: "myUrl",
							Index: "",
							Module: "",
				};
				oData.Files.unshift(oItem);
			}
		},
		
		onPress: function (oEvent,oController) {
			sap.m.MessageToast.show(oEvent.getSource().getId() + " Pressed");
		},

		onSelectChange:  function(oEvent,oController) {
			var oUploadCollection=sap.ui.getCore().byId(oController.getView().getId() + "--UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		}
};