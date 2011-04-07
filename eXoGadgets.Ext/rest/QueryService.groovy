package rest

// simple groovy script
import javax.ws.rs.Path
import javax.ws.rs.GET
import javax.ws.rs.PathParam
import javax.ws.rs.QueryParam
import javax.ws.rs.core.UriBuilder;
import javax.ws.rs.DefaultValue
import javax.ws.rs.core.Response;
import javax.ws.rs.core.MediaType;

import org.json.JSONArray
import org.json.JSONObject
import java.net.URLEncoder
import org.exoplatform.container.PortalContainer;
import org.exoplatform.portal.config.DataStorage;
import org.exoplatform.portal.config.model.Page;
import org.exoplatform.services.organization.User;
import org.exoplatform.portal.config.model.PageNavigation;
import org.exoplatform.commons.utils.LazyPageList;
import org.exoplatform.commons.utils.PageList;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.portal.config.Query;
import rest.datamodel.PageBean;
import rest.datamodel.PageNavigationBean;
import rest.datamodel.UserBean;

@Path("/dataManager")
public class QueryService {
  final public static String WILDCARD = "*";
  
  /**
    * find users
    * @param userName
    * @param lastName
    * @param firstName
    * @param email
    * @return response in json formatting
    */
   @GET
   @Path("/find/users/")
   public Response queryUser(@QueryParam("userName") String userName, @QueryParam("lastName") String lastName, @QueryParam("firstName") String firstName, @QueryParam("email") String email)
   {
      String responseContent = "";
      PortalContainer portalContainer = PortalContainer.getInstance();
      OrganizationService service = (OrganizationService)portalContainer.getComponentInstance(OrganizationService.class);
      org.exoplatform.services.organization.Query query = new org.exoplatform.services.organization.Query();
      if(userName != null) {
         userName = buildFilter(userName);
         query.setUserName(userName);
      }
      if(lastName != null) {
         lastName = buildFilter(lastName);
         query.setLastName(lastName);
      }
      if(firstName != null) {
         firstName = buildFilter(firstName);
         query.setFirstName(firstName);
      }
      if(email != null) {
         email = buildFilter(email);
         query.setEmail(email);
      }

      try {
         PageList<?> pageList  = service.getUserHandler().findUsers(query);
         List<?> results = pageList.getAll();
         responseContent = buildResponse("users", results);
      } catch(Exception ex) {
         responseContent = "Exception in executing the query \n" + ex.toString();
      }
      
      return Response.created(UriBuilder.fromUri("dataManager/find").build()).entity(responseContent).type(MediaType.TEXT_PLAIN).status(Response.Status.OK).build();
   }   
   
  @GET
  @Path("/query/pages/")
  public Response queryPage(@QueryParam("ownerType") String ownerType, @QueryParam("ownerId") String ownerId) {
      String dataType = "pages";
      
      PortalContainer portalContainer = PortalContainer.getInstance();
      DataStorage dataStorage = (DataStorage)portalContainer.getComponentInstanceOfType(DataStorage.class);
      
      String responseContent = "";
      Query<?> query = buildQuery(dataType, ownerType, ownerId);
      
      try{
         LazyPageList<?> lazyPageList = dataStorage.find(query);
         List<?> results = lazyPageList.getAll();
         responseContent = buildResponse(dataType, results);
      }catch(Exception ex)
      {
         responseContent = "Exception in executing the query \n" + ex.toString();
      }
      
      return Response.created(UriBuilder.fromUri("dataManager/query").build()).entity(responseContent).type(MediaType.TEXT_PLAIN).status(Response.Status.OK).build();
  }
  
  /**
    * Delete a object as pages, users, groups, membership, navigations, etc
    * @param dataType
    * @param objectId
    * @return
    */
   @GET
   @Path("/delete/{dataType}/")
   public Response deleteObject(@PathParam("dataType") String dataType, @QueryParam("objectId") String objectId)
   {
      PortalContainer portalContainer = PortalContainer.getInstance();
      DataStorage dataStorage = (DataStorage)portalContainer.getComponentInstanceOfType(DataStorage.class);
      
      String responseContent = "none";
      
      try{
         if("pages".equalsIgnoreCase(dataType) && objectId != null)
         {
            Page page = dataStorage.getPage(objectId);
            if(page != null) {
               dataStorage.remove(page);
               responseContent = "success";
            } else {
               responseContent = "Page not found!";
            }
         }
         else if("users".equalsIgnoreCase(dataType) && objectId != null)
         {
            OrganizationService service = (OrganizationService)portalContainer.getComponentInstance(OrganizationService.class);
            service.getUserHandler().removeUser(objectId, true);
            responseContent = "success";
         }
      }catch(Exception ex)
      {
         responseContent = "Exception in executing delete page \n" + ex.toString();
      }
      
      return Response.created(UriBuilder.fromUri("dataManager/query").build()).entity(responseContent).type(MediaType.TEXT_PLAIN).status(Response.Status.OK).build();
   }
   
   private Query<?> buildQuery(String dataType, String ownerType, String ownerId)
   {
      //Hardcode here to parse the ownerId
      if(WILDCARD.equals(ownerId.trim()))
      {
         ownerId = null;
      }
      else if(ownerId != null)
      {
         ownerId = ownerId.replace('_', '/');
      }
      
      if(WILDCARD.equals(ownerType.trim()))
      {
         ownerType = null;
      }
      
      if("pages".equalsIgnoreCase(dataType))
      {
         return new Query<Page>(ownerType, ownerId, Page.class);
      }
      else{
         return null;
      }
   }
   
   private String buildFilter(String name) {
      if (name.indexOf("*") < 0)
      {
         if (name.charAt(0) != '*')
            name = "*" + name;
         if (name.charAt(name.length() - 1) != '*')
            name += "*";
      }
      return name.replace('?', '_');
   }
   
   /**
    * Build response with json format, example for user listing response:
    *
    * {"user":[
    *           {"lastName":"gtn","email":"demo@localhost","userName":"demo","firstName":"Demo"},
    *           {"lastName":"Anthony","email":"john@localhost","userName":"john","firstName":"John"}
    *         ]
    * }
    *
    * @param dataType
    * @param results
    * @return
    * @throws Exception
    */
   private String buildResponse(String dataType, List<?> results) throws Exception
   {
      JSONObject buffer = new JSONObject();

      if ("pages".equalsIgnoreCase(dataType))
      {
         List<Page> pages = (List<Page>)results;
         JSONArray array = new JSONArray();
         for (Page page : pages)
         {
            PageBean  bean = PageBean.build(page);            
            array.put(bean.toJSONObject());            
         }
         
         buffer.put("page", array);
      }
      else if("users".equalsIgnoreCase(dataType)) 
      {
         List<User> users = (List<User>)results;
         JSONArray array = new JSONArray();
         for (User usr : users)
         {
            UserBean bean = UserBean.build(usr);
            
            array.put(bean.toJSONObject());  
         }
         buffer.put("user", array);
      }
      
      return buffer.toString();
   }
}
