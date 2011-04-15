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
eXo = {
    gadget : {}
};

function PageManagement() {
  this.PAGE_QUERY_URL = "http://localhost:8080/rest/private/page/query";  
  this.PAGE_DELETE_URL = "http://localhost:8080/rest/private/page/delete";
}

PageManagement.prototype.init = function() {
  var pageManagement = eXo.gadget.PageManagement;
  pageManagement.registerHandler();
  pageManagement.getPages();
};

PageManagement.prototype.getPages = function() {
  var pageManagement = eXo.gadget.PageManagement; 

  var filterString = $("#SearchInput").val();
  var searchType = $("#SearchType").val();
  var sendData;
  if(searchType && $.trim(filterString) != "") {
    filterString = encodeURIComponent($.trim(filterString));

    if(searchType == "Owner id") {
      sendData = "ownerType=*&" + "ownerId=" + filterString;
    } else {
      sendData = "ownerType=" + filterString + "&ownerId=*";
    }
  } else {
    sendData = "ownerType=*&ownerId=*";
  }
  
  var currView = gadgets.views.getCurrentView().getName();
  var callBack;
  if (currView == "home") {    
    callBack = pageManagement.renderPagesForHome; 
  } else {    
    callBack = pageManagement.renderPagesForCanvas;
  }
  
  pageManagement.makeRequest(pageManagement.PAGE_QUERY_URL, callBack, sendData);
};

PageManagement.prototype.renderPagesForHome = function(pageData) {  
  var pagesHtml = "";
  if (pageData && pageData.page) {
    for (var i = 0; i < pageData.page.length; i++) {
      var rowClass = i % 2 == 0 ? "EvenRow" : "OddRow";
      var pageTitle = gadgets.util.escapeString(pageData.page[i].pageTitle);
      var pageId = gadgets.util.escapeString(pageData.page[i].pageId);
      
      pagesHtml += "<tr style='width: 100%;' class='" + rowClass + "'>" +
      "<td style='width: 50%;'>" + pageTitle + "</td>" +
      "<td style='width: 50%;'><img id='" + pageId + 
      "' src='./images/Blank.gif' class='DeleteIcon' title='Delete page'>" +
      "</td></tr>";                      
    }
  }
  $("#PageList").html(pagesHtml);  
};

PageManagement.prototype.renderPagesForCanvas = function(pageData) {  
  var pagesHtml = "";
  if (pageData && pageData.page) {
    for (var i = 0; i < pageData.page.length; i++) {
      var page = pageData.page[i];
      var rowClass = i % 2 == 0 ? "EvenRow" : "OddRow";
      
      pagesHtml += "<tr style='width: 100%;' class='" + rowClass + "'>" +
      "<td style='width: 20%;'>" + gadgets.util.escapeString(page.pageId) + "</td>" +
      "<td style='width: 20%;'>" + gadgets.util.escapeString(page.pageTitle) + "</td>" +
      "<td style='width: 20%;'>" + gadgets.util.escapeString(page.accessPermissions) + "</td>" +
      "<td style='width: 20%;'>" + gadgets.util.escapeString(page.editPermission) + "</td>" +
      "<td style='width: 20%;'><img src='./images/Blank.gif' " +
      "id = " + gadgets.util.escapeString(page.pageId) + " class='DeleteIcon' title='Delete page'></td></tr>";              
    }
  }
  $("#PageList").html(pagesHtml);
};

eXo.gadget.PageManagement = new PageManagement();
