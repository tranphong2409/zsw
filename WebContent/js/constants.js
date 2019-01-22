// If we have new date column with a new title, please add that title into this list.
// This list will contain all the columns with given titles that are going to be formatted for filter function. 
var dateColumnList = ["S.DATE", "ST.DATE", "TRAVEL FROM", "START DATE",
	"E.DATE", "TRAVEL TO", "END DATE", "RECEIVED DATE"
];
var dateType = new sap.ui.model.type.Date({
	source: {
		pattern: "yyyyMMdd"
	},
	pattern: "dd/MM/yyyy"
});

// Variable to store the relative path to E2ETM web service
var sServiceUrl = getServiceUrl("/sap/opu/odata/sap/ZE2E_DEP_NWGS_SRV/");
var resServiceUrl = getServiceUrl("/sap/opu/odata/sap/ZE2E_RES_NWGS_SRV/");

// Global variable to keep the Odata model with respect to E2ETM web service
var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl);

// FOR TESTING LOGOUT FUNCTION LOCALLY
var di0Cookie = "SAP_SESSIONID_DI0_300";

function getServiceUrl(sServiceUrl) {
	// for local testing prefix with proxy
	// if you and your team use a special host name or IP like 127.0.0.1 for
	// localhost please adapt the if statement below
	if (window.location.hostname == "localhost") {
		//			return "proxy" + sServiceUrl; //for launchpad
		return sServiceUrl; //for local
	} else {
		return sServiceUrl;
	}
}

function createCookie(name, value, days) {
	var expires;

	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	} else {
		expires = "";
	}
	document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = escape(name) + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1, c.length);
		}

		if (c.indexOf(nameEQ) === 0) {

			return unescape(c.substring(nameEQ.length, c.length));
		}
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name, "", -1);
}
// FOR TESTING LOGOUT FUNCTION LOCALLY

var oStaticRoutes = {
	"ReimbursementReport": {
		"pattern": "ReimbursementReport",
		"name": "ReimbursementReport",
		"view": "ReimbursementReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"cargoReport": {
		"pattern": "CargoReport",
		"name": "CargoReport",
		"view": "CargoReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"accommodation": {
		"pattern": "Accommodation",
		"name": "accommodation",
		"view": "Accommodation",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"accommodationAdmin": {
		"pattern": "AccommodationAdmin/{user}",
		"name": "accommodationAdmin",
		"view": "AccommodationAdmin",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"ticketingAdmin": {
		"pattern": "Ticketing/{user}",
		"name": "ticketingAdmin",
		"view": "TicketingAdmin",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"ticketing": {
		"pattern": "Ticketing",
		"name": "ticketing",
		"view": "Ticketing",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"forexAdmin": {
		"pattern": "ForexAdmin",
		"name": "forexAdmin",
		"view": "ForexAdmin",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"forex": {
		"pattern": "Forex",
		"name": "forex",
		"view": "Forex",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"forexsalesreport": {
		"pattern": "ForexSalesReport",
		"name": "forexsalesreport",
		"view": "ForexSalesReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"forexencashmentreport": {
		"pattern": "ForexEncashmentReport",
		"name": "forexencashmentreport",
		"view": "ForexEncashmentReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"forexmasterreport": {
		"pattern": "ForexMasterReport",
		"name": "forexmasterreport",
		"view": "ForexMasterReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"chplemployeetraveldetailsreport": {
		"pattern": "CHPLEmployeeTravelDetailsReport",
		"name": "chplemployeetraveldetailsreport",
		"view": "CHPLEmployeeTravelDetailsReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"cardreloadreport": {
		"pattern": "CardReloadReport",
		"name": "cardreloadreport",
		"view": "CardReloadReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"onsiteaddressreport": {
		"pattern": "OnsiteAddressReport",
		"name": "onsiteaddressreport",
		"view": "OnsiteAddressReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"insuranceAdmin": {
		"pattern": "InsuranceAdmin",
		"name": "insuranceAdmin",
		"view": "InsuranceAdmin",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"insurance": {
		"pattern": "Insurance",
		"name": "insurance",
		"view": "Insurance",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"reimbursement": {
		"pattern": "Reimbursement",
		"name": "reimbursement",
		"view": "Reimbursement",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"reimbursementAdmin": {
		"pattern": "ReimbursementAdmin/:role:",
		"name": "reimbursementAdmin",
		"view": "ReimbursementAdmin",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"taxclearance": {
		"pattern": "TaxClearance",
		"name": "taxclearance",
		"view": "TaxClearance",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"taxclearanceAdmin": {
		"pattern": "TaxClearanceAdmin",
		"name": "taxclearanceAdmin",
		"view": "TaxClearanceAdmin",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"cargoAdmin": {
		"pattern": "CargoAdmin",
		"name": "cargoAdmin",
		"view": "CargoAdmin",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"cargo": {
		"pattern": "Cargo",
		"name": "cargo",
		"view": "Cargo",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"deputation": {
		"pattern": "Deputation/:depId:",
		"name": "deputation",
		"view": "DeputationRequest",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"report": {
		"pattern": "Reports",
		"name": "report",
		"view": "Report",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"taxReport": {
		"pattern": "TaxReports",
		"name": "taxReport",
		"view": "TaxReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"profile": {
		"pattern": "Profile",
		"name": "profile",
		"view": "Profile",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"cardrld": {
		"pattern": "CardReload",
		"name": "card",
		"view": "CardReload",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"cardrlddbrd": {
		"pattern": "CardReloadDashboard/:role:",
		"name": "cardDashBoard",
		"view": "CardReloadDashboard",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"businessVisaRequest": {
		"pattern": "Portal/VisaRequest",
		"name": "VisaRequest",
		"view": "VisaRequest",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"businessVisaAdmin": {
		"pattern": "Portal/VisaAdmin",
		"name": "VisaAdmin",
		"view": "VisaAdmin",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"monthrem": {
		"pattern": "Portal/Monthly Remittance",
		"name": "monthrem",
		"view": "MonthRemitanceDetls",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"onsiteaddress": {
		"pattern": "Portal/Onsite Address",
		"name": "onsiteaddress",
		"view": "OnsiteAddress",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"bnkadvfrm": {
		"pattern": "Portal/Bank Advice Form",
		"name": "bnkadvfrm",
		"view": "BankAccAdvice",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"mrreports": {
		"pattern": "Portal/MRReports",
		"name": "mrreports",
		"view": "MRReports",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"trsettle": {
		"pattern": "Portal/TravelSettlement",
		"name": "trsettle",
		"view": "TravelSettlement",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"trsettlelist": {
		"pattern": "Portal/TravelSettlementDashboard",
		"name": "trsettlelist",
		"view": "TRSettlementDashboard",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"trnsrep": {
		"pattern": "Portal/Transfer Reports",
		"name": "trnsrep",
		"view": "TransferReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"paymentvoucher": {
		"pattern": "Portal/Payment Voucher",
		"name": "paymentvoucher",
		"view": "PaymentVoucher",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"inradvance": {
		"pattern": "Portal/INR Advance",
		"name": "inradvance",
		"view": "InrAdvance",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"countexpectedtravel": {
		"pattern": "countexpectedtravel",
		"name": "countexpectedtravel",
		"view": "CountExpectedTravel",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"travelestimate": {
		"pattern": "travelestimate",
		"name": "travelestimate",
		"view": "TravelEstimate",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"dailyreport": {
		"pattern": "DailyReport",
		"name": "dailyreport",
		"view": "TrstDailyReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"ticketreport": {
		"pattern": "TicketingReport",
		"name": "ticketreport",
		"view": "TcktReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"airsavingsreport": {
		"pattern": "AirSavings",
		"name": "airsavingsreport",
		"view": "AirSavingsReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"qmmreport": {
		"pattern": "Report/{name}",
		"name": "qmmreport",
		"view": "TrstQmmReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"modifyclose": {
		"pattern": "Modify",
		"name": "modifyclose",
		"view": "ModifyClose",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"secoadvancereport": {
		"pattern": "Secondary Advance",
		"name": "secoadvancereport",
		"view": "SecoAdvanceReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"setlusetlreport": {
		"pattern": "Settled/Unsettled Report",
		"name": "setlusetlreport",
		"view": "SetlUsetlReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"moretrstreport": {
		"pattern": "TrstReports",
		"name": "moretrstreport",
		"view": "TrstReports",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages",
		"subroutes": [{
			"pattern": "Secondary Travel Advance",
			"name": "setlSecoAdvRep",
			"view": "TrstSecoAdvanceReport",
			"viewType": "XML",
			"viewPath": "sap.ui.project.e2etm.view",
			"clearTarget": true,
			"targetControl": "splitapp",
			"targetAggregation": "detailPages"
		}, {
			"pattern": "INS Recovery Report",
			"name": "setlInsRecRep",
			"view": "InsSlaReport",
			"viewType": "XML",
			"viewPath": "sap.ui.project.e2etm.view",
			"clearTarget": true,
			"targetControl": "splitapp",
			"targetAggregation": "detailPages"

		}, {
			"pattern": "Accommodation Settlement Report",
			"name": "setlAccRep",
			"view": "BookingSetlReport",
			"viewType": "XML",
			"viewPath": "sap.ui.project.e2etm.view",
			"clearTarget": true,
			"targetControl": "splitapp",
			"targetAggregation": "detailPages"

		}, {
			"pattern": "Download Contract Letters",
			"name": "setlDownloadCL",
			"view": "DownloadCL",
			"viewType": "XML",
			"viewPath": "sap.ui.project.e2etm.view",
			"clearTarget": true,
			"targetControl": "splitapp",
			"targetAggregation": "detailPages"

		}]
	},

	"InsSlaReport": {
		"pattern": "InsSlaReport",
		"name": "InsSlaReport",
		"view": "InsSlaReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"MISReport": {
		"pattern": "MISReport",
		"name": "MISReport",
		"view": "MISReport",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"SimCard": {
		"pattern": "SimCard",
		"name": "SimCard",
		"view": "SimCard",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"AccmTool": {
		"pattern": "ReservationOverview",
		"name": "AccmTool",
		"view": "AccmTool",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages",
		"subroutes": [{
				"pattern": "ReservationOverview/Hotels",
				"name": "hotelsList",
				"view": "HotelsList",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabHotelList",
				"targetAggregation": "content"
			}, {
				"pattern": "ReservationOverview/Hotel-{type}/:code:",
				"name": "hotelCreate",
				"view": "HotelCreation",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabHotelList",
				"targetAggregation": "content"

			}, {
				"pattern": "ReservationOverview/Hotel/{code}/RoomsList:?query:",
				"name": "hotelRoomsList",
				"view": "RoomList",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabHotelList",
				"targetAggregation": "content"

			}, {
				"pattern": "ReservationOverview/Hotel/{code}/Location:?query:",
				"name": "officeLocation",
				"view": "OfficeLocation",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabHotelList",
				"targetAggregation": "content"

			}, {
				"pattern": "ReservationOverview/Hotel/{code}/Room/{type}:?query:",
				"name": "roomCreate",
				"view": "RoomCreation",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabHotelList",
				"targetAggregation": "content"

			}, {
				"pattern": "ReservationOverview/Reservation/:pernr:/:reinr:",
				"name": "reservation",
				"view": "RoomReservation",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabRooms",
				"targetAggregation": "content"

			}, {
				"pattern": "ReservationOverview/TravelPlan",
				"name": "manualtp",
				"view": "ManualTPList",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabTravelplan",
				"targetAggregation": "content"

			}, {
				"pattern": "ReservationOverview/TravelPlan-{type}/:reinr:",
				"name": "manualtpcreate",
				"view": "ManualTPCreation",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabTravelplan",
				"targetAggregation": "content"

			}, {
				"pattern": "ReservationOverview/OHA Allowance",
				"name": "ohaallowance",
				"view": "OHAAllowance",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabOhaAll",
				"targetAggregation": "content"

			}, {
				"pattern": "ReservationOverview/Monthly Room Rents",
				"name": "monthlyroomrent",
				"view": "RoomRents",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabRomRnt",
				"targetAggregation": "content"

			}, {
				"pattern": "ReservationOverview/Reports/Occupancy",
				"name": "occupancy",
				"view": "OccupancyReport",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabOccRep",
				"targetAggregation": "content"
			}, {
				"pattern": "ReservationOverview/Reports/Monthly Rent",
				"name": "bookingdetails",
				"view": "BookingDetails",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabBookDetls",
				"targetAggregation": "content"
			}, {
				"pattern": "ReservationOverview/Reports/Booking Details",
				"name": "payrollteamreport",
				"view": "DateToPayroll",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabPayroll",
				"targetAggregation": "content"
			}, {
				"pattern": "ReservationOverview/Reports/Settlement Report",
				"name": "booksetlreport",
				"view": "BookingSetlReport",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabSetlRep",
				"targetAggregation": "content"
			}, {
				"pattern": "ReservationOverview/Reports/Cost Analysis",
				"name": "costanlrep",
				"view": "CostAnalysis",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabCost",
				"targetAggregation": "content"
			}, {
				"pattern": "ReservationOverview/Reports/OHA Allowance Report",
				"name": "ohaallwreport",
				"view": "OhaAllowanceReport",
				"viewType": "XML",
				"viewPath": "sap.ui.project.e2etm.view",
				"clearTarget": true,
				"targetControl": "tabOhaRep",
				"targetAggregation": "content"
			},

		]
	},

	"SimCardRequest": {
		"pattern": "SimCardRequest/{reinr}/{pernr}:?query:",
		"name": "SimCardRequest",
		"view": "SimCardRequest",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"DownloadCL": {
		"pattern": "Download CL",
		"name": "cldownload",
		"view": "DownloadCL",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"IssueCL": {
		"pattern": "Issue CL",
		"name": "issuecl",
		"view": "IssueCL",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"DepuMonthRep": {
		"pattern": "STVA Monthly Report",
		"name": "depumonthrep",
		"view": "DepuMonthlyRep",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	//	"UploadMgr":{		
	//		"pattern" : "Upload Manager Details",
	//		"name" : "UploadMgr", 
	//		"view" : "UploadManagerDetls",
	//		"viewType" : "XML",
	//		"viewPath" : "sap.ui.project.e2etm.view",
	//		"targetControl" : "appID",
	//		"targetAggregation" : "pages",
	//	}

	"DepuNotifications": {
		"pattern": "DepuNotifications",
		"name": "DepuNotifications",
		"view": "DepuNotifications",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},

	"PreDepartureCalender": {
		"pattern": "PreDepartureCalender",
		"name": "PreDepartureCalender",
		"view": "PreDepartureCalender",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"csgenerate": {
		"pattern": "Generation of Calculation Sheet",
		"name": "csgenerate",
		"view": "CSGeneration",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"cggssaldetails": {
		"pattern": "Salary Details",
		"name": "cggssaldetails",
		"view": "CggsSalDetails",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	"BusinessTravel": {
		"pattern": "Business Travel",
		"name": "busrtravel",
		"view": "BusinessTravel",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	},
	//*TinhTD 
	"businessTravelRequest": {
		"pattern": "Portal/TravelRequest/:reqId:",
		"name": "TravelRequest",
		"view": "TravelRequest",
		"viewType": "XML",
		"viewPath": "sap.ui.project.e2etm.view",
		"targetControl": "appID",
		"targetAggregation": "pages"
	}
	//End TinhTD 

};
//-------------------------------------tinhtd 09/2018
var nReqNew = 70025229; //Q: 70025229
var TravelRequestThis;
var PassportVisaThis;
var TravelRequestDtlThis;
var SponsorshipThis;
var TrvSimCardThis;

//-------------------------------------end TinhTD

/////// IF YOU HAVE GLOBAL VARIABLES AT THE TOP OF YOUR CONTROLLER, MAINTAIN THEM HERE 
// GLOBAL VARIABLES IN HOME PAGE
var oHomeThis;
var eTagHome = "";

// GLOBAL VARIABLES IN MENU PAGE
var oMenuThis;

// GLOBAL VARIABLES IN DETAILS PAGE
var view;
var sDeputationNo = '';
var sVersion = '1';
var eForm;
var oDeputationThis;
var eTagDeputation = "";

// GLOBAL VARIABLES IN PROFILE PAGE
var oProfileThis;

// GLOBAL VARIABLES IN REPORT PAGE
var oReportThis;

// GLOBAL VARIABLES IN TRAVEL PAGE
var TravelPlanThis;
var view;
var backup = {};
var tabIndex = 0;

//GLOBAL VARIABLES IN CARGO PAGE
var oCargoThis;

// GLOBAL VARIABLES IN TICKETING PAGE
var filesAll = [];
var uploadFile = [];
var oThis, itemSelected, issueFile;
var ticket, menuRef;
var admManRole;

//GLOBAL VARIABLES IN BUSINESS VISA REQUEST
var VisaReqThis;