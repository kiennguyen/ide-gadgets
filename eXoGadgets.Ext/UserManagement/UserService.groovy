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
import org.exoplatform.services.organization.User;
import org.exoplatform.services.organization.OrganizationService;
import org.exoplatform.portal.config.Query;
import org.exoplatform.commons.utils.PageList;

@Path("/user")
public class UserService {
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
   @Path("query")
   public Response query(@QueryParam("userName") String userName, @QueryParam("lastName") String lastName, @QueryParam("firstName") String firstName, @QueryParam("email") String email)
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
         responseContent = buildResponse(results);
      } catch(Exception ex) {
         responseContent = "Exception in executing the query \n" + ex.toString();
      }
      
      return Response.created(UriBuilder.fromUri("user/query").build()).entity(responseContent).type(MediaType.TEXT_PLAIN).status(Response.Status.OK).build();
   }   
  
  /**
    * Delete a object as pages, users, groups, membership, navigations, etc
    * @param dataType
    * @param objectId
    * @return
    */
   @GET
   @Path("delete")
   public Response delete(@QueryParam("objectId") String objectId)
   {
      PortalContainer portalContainer = PortalContainer.getInstance();
      DataStorage dataStorage = (DataStorage)portalContainer.getComponentInstanceOfType(DataStorage.class);
      String responseContent = "none";
      
      try {
         OrganizationService service = (OrganizationService)portalContainer.getComponentInstance(OrganizationService.class);
         service.getUserHandler().removeUser(objectId, true);
         responseContent = "success";
      } catch(Exception ex) {
         responseContent = "Exception in executing delete user \n" + ex.toString();
      }
      
      return Response.created(UriBuilder.fromUri("user/delete").build()).entity(responseContent).type(MediaType.TEXT_PLAIN).status(Response.Status.OK).build();
   }
   
   private String buildFilter(String name) {
      if (name.indexOf("*") < 0) {
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
   private String buildResponse(List<?> results) throws Exception {
      JSONObject buffer = new JSONObject();
      List<User> users = (List<User>)results;
      JSONArray array = new JSONArray();
      for (User u : users) {
         UserBean bean = UserBean.build(u);
         array.put(bean.toJSONObject());  
      }
      buffer.put("user", array);
      return buffer.toString();
   }
}
