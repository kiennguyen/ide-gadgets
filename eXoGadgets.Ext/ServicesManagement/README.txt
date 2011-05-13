##########################################
### Services Management gadget (Gadget : Manage eXo REST services)
### version      : 1
### title        : Services Management
### gadgets url  : 
###    http://int.exoplatform.org/rest/jcr/repository/dev-monit/ServicesManagement/ServicesManagement.xml
### preferences  : serviceURL
###    Indecate service url of server, user can change it in User's preference
###    External service url doesn't be supported because eXo Platform must support OAuth for authentication
### roles	 : *:/platform/administrators
###    Only users belong to group "/platform/administrators" have permission to view and execute action of eXo REST services
##########################################

 # Home view: Show all information of eXo REST services
	- Contain two tables for listing methods and properties of service
 # Canvas view: Show all information of eXo REST services and support user ability to execute action to interact with Server
	- Contain two tables for listing methods and properties of service
	- In method table, every method has "Run" button to help execute action to interact with Server
