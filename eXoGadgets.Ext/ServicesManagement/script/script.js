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

function ServicesManagement() {
}

ServicesManagement.prototype.init = function() {
	var monitor = eXo.gadget.ServicesManagement;
	var prefs = new _IG_Prefs();
	monitor.SERVICES_URL = prefs.getString("servicesURL");
	
	monitor.registerHandler();
	monitor.makeRequest(monitor.SERVICES_URL, monitor.renderServiceSelector);
};

ServicesManagement.prototype.renderServiceSelector = function(services) {
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

ServicesManagement.prototype.renderMethodSelector = function(methodData) {
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

ServicesManagement.prototype.renderMethodDetail = function(method) {
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
	eXo.gadget.ServicesManagement.resetHeight();
};

ServicesManagement.prototype.renderServiceDetailForCanvas = function(data) {
	if (data) {
		if(data.methods) {
			eXo.gadget.ServicesManagement.renderMethodsForCanvas(data);
		}
		
		if(data.properties) {
			eXo.gadget.ServicesManagement.renderPropertiesForCanvas(data);
		}
	}
}

ServicesManagement.prototype.renderMethodsForCanvas = function(methodData) {
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
				+ "<div class='MethodActionButton GadgetStyle FL'>"
				+ "<div class='ButtonLeft'>" + "<div class='ButtonRight'>"
				+ "<div class='ButtonMiddle'>" + "<a href='#'>Run</a>" + "</div>"
				+ "</div>" + "</div>" + "</div>" + "</td></tr>";

	}
	$("#methodsForCanvas").html(methodForCanvas);
	eXo.gadget.ServicesManagement.resetHeight();
};

/**
 * data is not null
 */
ServicesManagement.prototype.renderPropertiesForCanvas = function(data) {
	var props = data.properties;
	var propertyForCanvas = "";
	var util = gadgets.util;

	for ( var i = 0; i < props.length; i++) {
		var prop = props[i];
		var propName = util.escapeString(prop.name);
		var propDescription = util.escapeString(prop.description);

		var rowClass = i % 2 == 0 ? "EvenRow" : "OddRow";
		propertyForCanvas += "<tr class='" + rowClass + "'>"
				+ "<td><div class='Text propName'>" + propName + "</div></td>"
				+ "<td><div class='Text propDescription'>" + propDescription + "</div></td>";

		propertyForCanvas += "<td>"
				+ "<div class='PropertyActionButton GadgetStyle FL'>"
				+ "<div class='ButtonLeft'>" + "<div class='ButtonRight'>"
				+ "<div class='ButtonMiddle'>" + "<a href='#'>Get</a>" + "</div>"
				+ "</div>" + "</div>" + "</div>" + "</td></tr>";

	}
	$("#propertiesForCanvas").html(propertyForCanvas);
	eXo.gadget.ServicesManagement.resetHeight();
};

ServicesManagement.prototype.showMinimessage = function(jsonMessage) {
    var msgObj = document.getElementById("resultMessage");
    msgObj.innerHTML = "";
  
	var parsedObj;
	try {
		parsedObj = gadgets.json.parse(jsonMessage);
	} catch (e) {
		parsedObj = jsonMessage;
	}
	var htmlTable = $.trim(eXo.gadget.ServicesManagement.objToTable(parsedObj));
	if (htmlTable == "" || htmlTable == "empty object") {
		htmlTable = "Method's executed, return no result";
	}

	var msg = new gadgets.MiniMessage("ServicesManagement", msgObj);
	var executeMsg = msg.createDismissibleMessage(htmlTable, function() {
		window.setTimeout(eXo.gadget.ServicesManagement.resetHeight, 500);
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
	
	eXo.gadget.ServicesManagement.resetHeight();
	
	//animation
    msgObj.style.width = "0%";
    msgObj.style.marginLeft = "2in";
    msgObj.style.marginRight = "2in";
    $("#resultMessage").animate({width: "100%", marginLeft: "0", marginRight: "0"}, 1000);
};

ServicesManagement.prototype.objToTable = function(obj) {
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
			str += eXo.gadget.ServicesManagement.objToTable(obj[i]);
			str += "</div></td></tr>";
		}
	} else {
		str += "<tr>";
		for ( var prop in obj) {
			str += "<th>";
			str += eXo.gadget.ServicesManagement.objToTable(prop);
			str += "</th>";
		}
		str += "</tr>";

		str += "<tr>";
		for ( var prop in obj) {
			str += "<td>";
			str += eXo.gadget.ServicesManagement.objToTable(obj[prop]);
			str += "</td>";
		}
		str += "</tr>";
	}

	str += "</table>";
	return str;
};

ServicesManagement.prototype.resetHeight = function() {
	if ($.browser.safari) {
		gadgets.window.adjustHeight($(".UIGadget").height());
	} else {
		gadgets.window.adjustHeight();
	}
};

eXo.gadget.ServicesManagement = new ServicesManagement();
