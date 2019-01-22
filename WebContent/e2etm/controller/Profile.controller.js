var oProfileThis, oDataModel; //eslint-disable-line

sap.ui.controller("sap.ui.project.e2etm.controller.Profile", {

	/*------------------------CONTROLLER EVENT AREA BEGIN------------------------*/
	// This event is called only one time
	onInit: function(evt) {

		oProfileThis = this;
		oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true); //eslint-disable-line
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis); //eslint-disable-line
		sap.ui.core.routing.Router.getRouter("MyRouter").attachRoutePatternMatched(oProfileThis.onRouteMatched, this); //eslint-disable-line

	},
	// This event is called everytime the URL route is matched
	onRouteMatched: function(curEvt) {
		var routeName = null;
		if (curEvt.mParameters != null) {
			routeName = curEvt.getParameter("name");
		}
		if (routeName === "profile") {
			//call init screen data
			this._initScreenData();
			setTimeout(function() {
				try {
					oProfileThis.getView().setModel(sap.ui.getCore().getModel("selectedProfile"));
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis); //eslint-disable-line
					var currentProfile = sap.ui.getCore().getModel("profile").getData().currentRole;
					if (currentProfile !== "DEPU") {
						oProfileThis.getView().byId("flexBoxCTC").setVisible(false);
					}
					if (sap.ui.getCore().getModel("profile").getData().employeeDetail.ZZ_DEP_PERNR ===
						sap.ui.getCore().getModel("selectedProfile").getData().employeeDetail.ZZ_DEP_PERNR &&
						sap.ui.getCore().getModel("global").getData().isProfileView === true) {
						if (sap.ui.getCore().getModel("selectedProfile").getData().dependentDetail != null) {
							if (sap.ui.getCore().getModel("selectedProfile").getData().dependentDetail.length === 0) {
								oProfileThis.getView().byId("btnSaveProfile").setVisible(false);
							} else {
								oProfileThis.getView().byId("btnSaveProfile").setVisible(true);
							}
						} else {
							oProfileThis.getView().byId("btnSaveProfile").setVisible(false);
						}
					} else {
						oProfileThis.getView().byId("btnSaveProfile").setVisible(false);
					}
				} catch (exc) {
					sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis); //eslint-disable-line
				}
			}, 500);
		}
	},
	/*------------------------CONTROLLER EVENT AREA END------------------------*/

	/*------------------------USER EVENT HANDLER AREA BEGIN------------------------*/
	backPress: function(evt) {
		sap.ui.core.routing.Router.getRouter("MyRouter").myNavBack();
	},
	onSaveEmployeeDialog: function(evt) {
		sap.ui.project.e2etm.util.StaticUtility.onSaveEmployeeDialog(evt, oProfileThis);
	},
	onNavigatePress: function(evt) {
		return false;
	},
	//TinhTD Start
	_initScreenData: function() {
		var oThis = this,
			oVModel = sap.ui.getCore().getModel("profile"),
			oData = oVModel.getData(),
			sPath = "",
			sUrlParams = "",
			oCountryDeferred = $.Deferred(),
			oFlightSeatDeferred = $.Deferred(),
			oVisaDeferred = $.Deferred(),
			oMealDeferred = $.Deferred(),
			oProfilePreDeferred = $.Deferred(),
			oCountryDeferred = $.Deferred();
		// var oDataModel = this.getView().getModel();
		//Set meal list
		sPath = "/GetDomain";
		sUrlParams = "DomainName='FTPD_MEALCODE'";
		oDataModel.read(sPath, {
			urlParameters: sUrlParams,
			success: function(oCData) {
				oData.aMeal = oCData.results;
				oMealDeferred.resolve();

			},
			error: function(err) {
				console.clear(); //eslint-disable-line
				console.info("Error" + err); //eslint-disable-line
			}
		});
		//Fligh seat list
		sPath = "/GetDomain";
		sUrlParams = "DomainName='FTPD_FLIGHT_PREF_SEAT'";
		oDataModel.read(sPath, {
			urlParameters: sUrlParams,
			success: function(oCData) {
				oData.aFlighSeat = oCData.results;
				oFlightSeatDeferred.resolve();

			},
			error: function(err) {
				console.clear(); //eslint-disable-line
				console.info("Error" + err); //eslint-disable-line
			}
		});

		// Get Country list
		sPath = "/DEP_LOCATION_COMBOSET";
		oDataModel.read(sPath, {
			success: function(oCData) {
				oData.aCountries = oCData.results;
				oCountryDeferred.resolve();

			},
			error: function(err) {
				console.clear(); //eslint-disable-line
				console.info("Error" + err); //eslint-disable-line
			}
		});
		// Get Country list
		sPath = "/DEP_LOCATION_COMBOSET";
		oDataModel.read(sPath, {
			success: function(oCData) {

				oData.aCountries = oCData.results;
				oCountryDeferred.resolve();
				oVModel.setData(oData);

			},
			error: function(err) {
				console.clear(); //eslint-disable-line
				console.info("Error" + err); //eslint-disable-line
			}
		});
		//Get visa detail 
		oDataModel.callFunction(
			"/GetVisaDetails", {
				method: "GET",
				urlParameters: {
					ZZ_CURR_VISA_TYP: "BUSR",
					ZZ_DEP_PERNR: oData.employeeDetail.ZZ_DEP_PERNR
				},
				success: function(oCData) {
					oData.aVisa = oCData.results;
					oVisaDeferred.resolve();
				},
				error: function(oError) {
					jQuery.sap.log.error(oError);
				}
			});

		// Get Additional Preference list
		sPath = "/Profile_preferencesSet('" + oData.employeeDetail.ZZ_DEP_PERNR + "')";
		oDataModel.read(sPath, {
			success: function(oAddData) {
				oData.aPrefer = oAddData;
				oProfilePreDeferred.resolve();
			},
			error: function(oError) {
				jQuery.sap.log.error(oError);
			}
		});

		$.when(oFlightSeatDeferred, oMealDeferred, oCountryDeferred, oVisaDeferred, oProfilePreDeferred, oCountryDeferred).done(
			function() {

				oVModel.setData(oData);
				oVModel.refresh();
				// Get Location list 
				this.byId("locationList").setBusy(true);
				this._updatedFrequentCountry(oData.employeeDetail.ZZ_DEP_PERNR, "i");
				this._updateVISACountry();
			}.bind(this));
	},
	//call backend
	_callBackend: function(sPath, oSaveData) {

	},
	//update additional information
	onSaveAdditionalInfo: function() {
		sap.ui.project.e2etm.util.StaticUtility.setBusy(true, oHomeThis); //eslint-disable-line
		var oVModel = sap.ui.getCore().getModel("profile"),
			oData = oVModel.getData();

		var oSaveData = {
			zz_dep_pernr: oData.employeeDetail.ZZ_DEP_PERNR,
			zz_mobile: oData.aPrefer.zz_mobile,
			zz_meal: oData.aPrefer.zz_meal,
			zz_seat: oData.aPrefer.zz_seat
		};
		oDataModel.callFunction("/UpdateProfilePreferences", {
			method: "GET",
			urlParameters: oSaveData,
			success: function(oResData) {
				sap.m.MessageToast.show("Updated successfully");
				sap.ui.project.e2etm.util.StaticUtility.setBusy(false, oHomeThis); //eslint-disable-line
				var oProfilePreferences = oResData.UpdateProfilePreferences;
				if (oProfilePreferences.zz_mobile_m) {

					sap.ui.commons.MessageBox.alert(oProfilePreferences.zz_mobile_m);
				} else if (oProfilePreferences.zz_flight_m) {
					sap.ui.commons.MessageBox.alert(oProfilePreferences.zz_flight_m);
				}
			}.bind(this),
			error: function(oError) {
				jQuery.sap.log.error(oError);
			}
		});

	},
	//add frequent locations
	onAddFrequentCountry: function() {
		var oDep = this.byId("dependentSelectBox");
		var sSelectedCountry = oDep.getSelectedKey();
		if (sSelectedCountry === "" || sSelectedCountry === undefined) {

			sap.m.MessageBox.alert(
				"Enter required field(s)", {
					icon: sap.m.MessageBox.Icon.sType,
					title: "Error"
				}
			);
		} else {
			var oVModel = sap.ui.getCore().getModel("profile"),
				oData = oVModel.getData();

			var sPERNR = oData.employeeDetail.ZZ_DEP_PERNR;
			this.byId("locationList").setBusy(true);
			var aLocation = sSelectedCountry.split("-");
			var oDataFrequent = {
				"ZZ_COUNTRY": aLocation[1],
				"ZZ_CITY": aLocation[0],
				"ZZ_DEP_PERNR": oData.employeeDetail.ZZ_DEP_PERNR
			};
			oDataModel.callFunction("/AddFrequentLocation", {
				method: "GET",
				urlParameters: oDataFrequent,
				success: function() {
					this._updatedFrequentCountry(sPERNR, "c");
				}.bind(this),
				error: function(oError) {
					jQuery.sap.log.error(oError);
				}
			});
		}

	},
	//Visa country
	checkExistingArray: function(aSArray, sColumn, sKeyVal) {
		var aFound = aSArray.filter(obj => {
			return obj[sColumn] === sKeyVal;
		});
		return aFound[0];
	},
	_updateVISACountry: function() {
		var oVModel = sap.ui.getCore().getModel("profile");
		var oData = oVModel.getData();
		//process visa
		for (var v = 0; v < oData.aVisa.length; v++) {
			var oV = this.checkExistingArray(oData.aCountries, "CITY", oData.aVisa[v].ZZ_VISA_TOCNTRY);
			if (oV !== undefined) {
				oData.aVisa[v].ZZ_VISA_TOCNTRY = oV.COUNTRYCODE;
			}
		}
		oVModel.setData(oData);
	},
	// update model frequent after add
	_updatedFrequentCountry: function(sPERNR, sType) {
		var oVModel = sap.ui.getCore().getModel("profile");
		oDataModel.callFunction("/GetFrequentLocations", {
			method: "GET",
			urlParameters: {
				"ZZ_DEP_PERNR": sPERNR
			},
			success: function(oData) {
				//oVModel.setProperty("/aLocation",oData.results);
				var aLocation = this._getLocationComboList(oData.results);
				setTimeout(function() {
					oVModel.setProperty("/aLocation", aLocation);
					this.byId("locationList").setBusy(false);
					this.byId("locationList").removeSelections(true);
					if (sType === "c") {

						sap.m.MessageToast.show("Add location successfully");
					} else if (sType === "d") {
						sap.m.MessageToast.show("Remove location successfully");
					}
				}.bind(this), 1000);

			}.bind(this),
			error: function(oError) {
				jQuery.sap.log.error(oError);
			}
		});
	},
	_getLocationComboList: function(oData) {
		var aListCountryCode = oData.map(function(oLocation) {
			var aZZList = oLocation.ZZ_LOCATION.split(",");
			var sNewList = aZZList[0] + "-" + aZZList[1].replace(" ", "");
			return sNewList;
		});
		var oVModel = sap.ui.getCore().getModel("profile");
		var oDataVModel = oVModel.getData().aCountries;
		var aCountryCombo = oDataVModel.filter(function(oCountry) {
			var oItemFiltered = "";
			if (aListCountryCode.indexOf(oCountry.CITY_COUNTRY_CODE) > -1) {
				oItemFiltered = oCountry;
			}
			return oItemFiltered;
		});
		return aCountryCombo;
	},
	// update model frequent after add
	onRemoveFrequentCountry: function() {

		var oVModel = sap.ui.getCore().getModel("profile");
		var oList = this.byId("locationList");
		var oSelectedItems = oList.getSelectedItems(),
			oData = oVModel.getData();

		var sPERNR = oData.employeeDetail.ZZ_DEP_PERNR;
		if (oSelectedItems.length === 0) {
			sap.m.MessageBox.alert(
				"Please select at least one record", {
					icon: sap.m.MessageBox.Icon.sType,
					title: "Error"
				}
			);
		} else {
			this.byId("locationList").setBusy(true);
			oSelectedItems.map(function(oItem) {
				var oLocationCode = oItem.getModel().getContext(oItem.getBindingContextPath()).getObject();
				var oItemRemove = {
					"ZZ_COUNTRY": oLocationCode.COUNTRYCODE,
					"ZZ_CITY": oLocationCode.CITYCODE,
					"ZZ_DEP_PERNR": sPERNR
				};
				this._removeFrequentCountry(oItemRemove, sPERNR);
			}.bind(this));
		}

	},
	_removeFrequentCountry: function(oData, sPERNR) {
		oDataModel.callFunction("/RemoveFrequentLocation", {
			method: "GET",
			urlParameters: oData,
			success: function() {
				this._updatedFrequentCountry(sPERNR, "d");
			}.bind(this),
			error: function(oError) {
				jQuery.sap.log.error(oError);
			}
		});
	},
	_onNavBackProfileReload: function() {
		sap.ui.project.e2etm.util.StaticUtility.openProfileDialog(this, this.getView()); //eslint-disable-line
	}
	//TinhTD End
	/*------------------------USER EVENT HANDLER AREA BEGIN------------------------*/
});