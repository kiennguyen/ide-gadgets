/**
 * Copyright (C) 2009 eXo Platform SAS.
 * 
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 * 
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this software; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 * site: http://www.fsf.org.
 */
eXo = {
	gadget : {}
};

function GateInMonitoring() {
}

GateInMonitoring.prototype.init = function() {
	var monitor = eXo.gadget.GateInMonitoring;
	var prefs = new _IG_Prefs();
	monitor.SERVICES_URL = prefs.getString("servicesURL");
	
	monitor.registerHandler();
	monitor.makeRequest(monitor.SERVICES_URL, monitor.renderServiceSelector);
};

GateInMonitoring.prototype.renderServiceSelector = function(services) {
	var servicesSelector = $("#servicesSelector");
	var optionsHtml = "";

	if (services && services.value) {
		var serviceNames = services.value;

		for ( var i = 0; i < serviceNames.length; i++) {
			optionsHtml += "<option>" + gadgets.util.escapeString(serviceNames[i])
					+ "</option>";
		}
	}

	servicesSelector.html(optionsHtml);
	servicesSelector.change();
};

GateInMonitoring.prototype.renderMethodSelector = function(methodData) {
	var methodSelector = $("#methodsSelector");
	var optionsHtml = "";
	var methods = null;

	if (methodData && methodData.methods) {
		methods = methodData.methods;

		for ( var i = 0; i < methods.length; i++) {
			optionsHtml += "<option>" + gadgets.util.escapeString(methods[i].name)
					+ "</option>";
		}
	}

	if (optionsHtml == "") {
		optionsHtml = "<option></option>";
	}

	methodSelector.html(optionsHtml);
	methodSelector.data('methods', methods);
	methodSelector.change();
};

GateInMonitoring.prototype.renderMethodDetail = function(method) {
	if (!method) {
		method = {
			name : "",
			description : "",
			method : "",
			parameters : []
		};
	}
	var util = gadgets.util;

	$("#methodName").html(util.escapeString(method.name));
	$("#methodDescription").html(util.escapeString(method.description));
	$("#reqMethod").html(util.escapeString(method.method));

	var paramTable = "<table>";
	for ( var i = 0; i < method.parameters.length; i++) {
		paramTable += "<tr><td>" + util.escapeString(method.parameters[i].name)
				+ "</td></tr>";
	}

	if (paramTable == "<table>") {
		paramTable += "<tr><td>[]</td></tr>";
	}
	paramTable += "</table>";
	$("#parametersTable").html(paramTable);
	eXo.gadget.GateInMonitoring.resetHeight();
};

GateInMonitoring.prototype.renderMethodsForCanvas = function(methodData) {
	if (!methodData || !methodData.methods) {
		return;
	}

	var methods = methodData.methods;
	var methodForCanvas = "";
	var util = gadgets.util;

	for ( var i = 0; i < methods.length; i++) {
		var method = methods[i];
		var methodName = util.escapeString(method.name);
		var reqMethod = util.escapeString(method.method);

		var rowClass = i % 2 == 0 ? "EvenRow" : "OddRow";
		methodForCanvas += "<tr class='" + rowClass + "'>"
				+ "<td><div class='Text methodName'>" + methodName + "</div></td>"
				+ "<td><div class='Text reqMethod'>" + reqMethod + "</div></td>"
				+ "<td><form style='margin-bottom: 0px;'>";
		for ( var j = 0; j < method.parameters.length; j++) {
			methodForCanvas += "<div class='SkinID'>"
					+ util.escapeString(method.parameters[j].name) + " "
					+ "<input type='text' name='"
					+ util.escapeString(method.parameters[j].name) + "'>" + "</div>";
		}
		methodForCanvas += "</form></td>" + "<td>"
				+ "<div class='ActionButton GadgetStyle FL'>"
				+ "<div class='ButtonLeft'>" + "<div class='ButtonRight'>"
				+ "<div class='ButtonMiddle'>" + "<a href='#'>Execute</a>" + "</div>"
				+ "</div>" + "</div>" + "</div>" + "</td></tr>";

	}
	$("#methodsForCanvas").html(methodForCanvas);
	eXo.gadget.GateInMonitoring.resetHeight();
};

GateInMonitoring.prototype.showMinimessage = function(jsonMessage) {
	var parsedObj;
	try {
		parsedObj = gadgets.json.parse(jsonMessage);
	} catch (e) {
		parsedObj = jsonMessage;
	}
	var htmlTable = $.trim(eXo.gadget.GateInMonitoring.objToTable(parsedObj));
	if (htmlTable == "" || htmlTable == "empty object") {
		htmlTable = "Method's executed, return no result";
	}

	var msg = new gadgets.MiniMessage("GateInMonitoring", document
			.getElementById("resultMessage"));
	var executeMsg = msg.createDismissibleMessage(htmlTable, function() {
		window.setTimeout(eXo.gadget.GateInMonitoring.resetHeight, 500);
		return true;
	});
	
	executeMsg.style.height = "100px";
	executeMsg.style.overflow = "auto";
	$(".mmlib_xlink").each(function() {
		$(this.parentNode).attr("style", "vertical-align: top");
		$(this).html("");
	});
	$(".mmlib_table .UIGrid").each(function() {
		$(this.parentNode).attr("style", "vertical-align: top");
	});
	
	eXo.gadget.GateInMonitoring.resetHeight();
};

GateInMonitoring.prototype.objToTable = function(obj) {
	var type = typeof (obj);
	if (type != "object") {
		return gadgets.util.escapeString(obj + "");
	}

	if (!obj || $.isEmptyObject(obj)
			|| (obj.constructor == Array && obj.length == 0)) {
		return "empty object";
	}

	var str = "<table cellspacing='0' class='UIGrid'>";
	if (obj.constructor == Array) {
		for ( var i = 0; i < obj.length; i++) {
			var rowClass = i % 2 == 0 ? "EvenRow" : "OddRow";
			str += "<tr class='" + rowClass + "'><td><div class='Text'>";
			str += eXo.gadget.GateInMonitoring.objToTable(obj[i]);
			str += "</div></td></tr>";
		}
	} else {
		str += "<tr>";
		for ( var prop in obj) {
			str += "<th>";
			str += eXo.gadget.GateInMonitoring.objToTable(prop);
			str += "</th>";
		}
		str += "</tr>";

		str += "<tr>";
		for ( var prop in obj) {
			str += "<td>";
			str += eXo.gadget.GateInMonitoring.objToTable(obj[prop]);
			str += "</td>";
		}
		str += "</tr>";
	}

	str += "</table>";
	return str;
};

GateInMonitoring.prototype.resetHeight = function() {
	if ($.browser.safari) {
		gadgets.window.adjustHeight($(".UIGadget").height());
	} else {
		gadgets.window.adjustHeight();
	}
};

eXo.gadget.GateInMonitoring = new GateInMonitoring();
