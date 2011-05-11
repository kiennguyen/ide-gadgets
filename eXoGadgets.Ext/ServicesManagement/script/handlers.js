/**
 * Copyright (C) 2009 eXo Platform SAS.
 * 
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 * 
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
ServicesManagement.prototype.registerHandler = function() {
	
	//======================Handler======================================//
	$("#servicesSelector").change(function () {
	  var serviceName = $(this).val();
	  serviceName = gadgets.util.unescapeString(!serviceName ? "" : serviceName);
	  var methodsURL = eXo.gadget.ServicesManagement.SERVICES_URL + "/" + encodeURIComponent(serviceName);
	  
	  var currView = gadgets.views.getCurrentView().getName();
	  if (currView == "home") {
	  	eXo.gadget.ServicesManagement.makeRequest(methodsURL, eXo.gadget.ServicesManagement.renderMethodSelector);
	  } else {
	  	eXo.gadget.ServicesManagement.makeRequest(methodsURL, eXo.gadget.ServicesManagement.renderMethodsForCanvas);
	  }
	});

	$("#methodsSelector").change(function () {
	  var methodName = $(this).val();
	  methodName = gadgets.util.unescapeString(!methodName ? "" : methodName);

	  var methodData = $(this).data('methods');
	  var method = null;
	  if (methodData) {
		  for (var i = 0; i < methodData.length; i++) {
		  	if (methodData[i].name == methodName) {
		  		method = methodData[i];
		  	}
		  }
	  }

	  eXo.gadget.ServicesManagement.renderMethodDetail(method);
	});
	
	$('.ActionButton').live('click', function(event) {
		event.preventDefault();
		var tr = this.parentNode.parentNode;		
		var methodName = gadgets.util.unescapeString($(".methodName", tr).text());
	  var reqMethod = gadgets.util.unescapeString($(".reqMethod", tr).text());
	  var serviceName = $("#servicesSelector").val();
	  serviceName = gadgets.util.unescapeString(!serviceName ? "" : serviceName);
	  var param = $("form", tr).serialize();
	  
		var execLink = eXo.gadget.ServicesManagement.SERVICES_URL + "/" + 
												encodeURIComponent(serviceName) + "/" + 
												encodeURIComponent(methodName);
		eXo.gadget.ServicesManagement.makeRequest(execLink, eXo.gadget.ServicesManagement.showMinimessage, param, "text", reqMethod);
	});
};

/**
 * @param reqUrl - String
 * @param callback - Function
 * @param sendData - Data that will be send to server 
 * @param returnType - String html/xml/json/script
 * @param reqMethod - GET/POST/PUT...
 * @return XMLHttpRequest object
 */
ServicesManagement.prototype.makeRequest = function(reqUrl, callback, sendData, returnType, reqMethod) {	
	if (reqUrl == "") {
		return;
	}
	reqMethod = reqMethod ? reqMethod : "GET";
	returnType = returnType ? returnType : "json";
	
	return $.ajax({
					  url: reqUrl,
					  type: reqMethod,					  
					  success: callback,
					  contentType: "application/x-www-form-urlencoded",
					  error: function() {},
					  data: sendData,
					  dataType: returnType,
					  beforeSend: function(xhr) {
					  	xhr.setRequestHeader("If-Modified-Since", "Thu, 1 Jan 1970 00:00:00 GMT");
					  } 
					});	
};
