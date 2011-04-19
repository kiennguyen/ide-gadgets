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

PageManagement.prototype.registerHandler = function() { 
  
  //======================Handler======================================//
  $("#SearchPage").click(function () {
    eXo.gadget.PageManagement.getPages();
  });
  
  $('img.DeleteIcon').live('click', function() {
    if (!confirm("Are you sure ?")) {
      return;
    }
    var pageManagement = eXo.gadget.PageManagement;
    var id = gadgets.util.unescapeString(this.id);
    
    pageManagement.makeRequest(pageManagement.PAGE_DELETE_URL, pageManagement.getPages, 
        "objectId=" + encodeURIComponent(id), "text");
    alert("Page is deleted");
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
PageManagement.prototype.makeRequest = function(reqUrl, callback, sendData, returnType, reqMethod) {  
  reqMethod = reqMethod ? reqMethod : "GET";
  returnType = returnType ? returnType : "json";
  
  return $.ajax({
            url: reqUrl,
            type: reqMethod,            
            success: callback,
            contentType: "application/x-www-form-urlencoded",
            error: function() {$("#PageList").html("Cannot load Page data from service!");},
            data: sendData,
            dataType: returnType                              
          });
};
