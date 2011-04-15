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

function UserManagement() {
  this.USER_QUERY_URL = "http://localhost:8080/rest/private/user/query";  
  this.USER_DELETE_URL = "http://localhost:8080/rest/private/user/delete";
}

UserManagement.prototype.init = function() {
  var userManagement = eXo.gadget.UserManagement;
  userManagement.registerHandler();
  userManagement.getUsers();
};

UserManagement.prototype.getUsers = function() {
  var userManagement = eXo.gadget.UserManagement; 
  
  var usersURL = userManagement.USER_QUERY_URL;
  var filterString = $("#SearchInput").val();
  var searchType = $("#SearchType").val();

  if(searchType && $.trim(filterString) != "") {
    filterString = encodeURIComponent($.trim(filterString));
    
    if(searchType == "User Name") {
      usersURL += "?userName=" + filterString;
    } else if(searchType == "Last Name") {
      usersURL += "?lastName=" + filterString;
    } else if(searchType == "First Name") {
      usersURL += "?firstName=" + filterString;
    } else if(searchType == "Email") {
      usersURL += "?email=" + filterString;
    }
  }
  
  var currView = gadgets.views.getCurrentView().getName();
  var callBack;
  if (currView == "home") {    
    callBack = userManagement.renderUsersForHome;
  } else {    
    callBack = userManagement.renderUsersForCanvas;
  }
  userManagement.makeRequest(usersURL, callBack);
};

UserManagement.prototype.renderUsersForHome = function(userData) {  
  var usersHtml = "";
  if (userData && userData.user) {
    for (var i = 0; i < userData.user.length; i++) {
      var rowClass = i % 2 == 0 ? "EvenRow" : "OddRow";
      var userName = gadgets.util.escapeString(userData.user[i].userName);
      
      usersHtml += "<tr style='width: 100%;' class='" + rowClass + "'>" +
      "<td style='width: 50%;'>" + userName + "</td>" +
      "<td style='width: 50%;'><img id='" + userName + 
      "' src='./images/Blank.gif' class='DeleteIcon' title='Delete user'>" +
      "</td></tr>";                  
    }
  }
  $("#UserList").html(usersHtml);  
};

UserManagement.prototype.renderUsersForCanvas = function(userData) {  
  var usersHtml = "";
  if (userData && userData.user) {
    for (var i = 0; i < userData.user.length; i++) {
      var user = userData.user[i];
      var rowClass = i % 2 == 0 ? "EvenRow" : "OddRow";
      
      usersHtml += "<tr style='width: 100%;' class='" + rowClass + "'>" +
      "<td style='width: 20%;'>" + gadgets.util.escapeString(user.userName) + "</td>" +
      "<td style='width: 20%;'>" + gadgets.util.escapeString(user.lastName) + "</td>" +
      "<td style='width: 20%;'>" + gadgets.util.escapeString(user.firstName) + "</td>" +
      "<td style='width: 20%;'>" + gadgets.util.escapeString(user.email) + "</td>" +
      "<td style='width: 20%;'><img src='./images/Blank.gif' " +
      "id = " + gadgets.util.escapeString(user.userName) + " class='DeleteIcon' title='Delete user'></td></tr>";              
    }
  }
  $("#UserList").html(usersHtml);
};

eXo.gadget.UserManagement = new UserManagement();
