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
import org.exoplatform.commons.utils.LazyPageList;
import org.exoplatform.commons.utils.PageList;
import org.exoplatform.portal.config.Query;

@Path("/page")
public class PageService {
  public static final String WILDCARD = "*";
  
  @GET
  @Path("query")
  public Response query(@QueryParam("ownerType") String ownerType, @QueryParam("ownerId") String ownerId) {     
      PortalContainer portalContainer = PortalContainer.getInstance();
      DataStorage dataStorage = (DataStorage)portalContainer.getComponentInstanceOfType(DataStorage.class);
      
      String responseContent = "";
      Query<?> query = buildQuery(ownerType, ownerId);
      
      try{
         LazyPageList<?> lazyPageList = dataStorage.find(query);
         List<?> results = lazyPageList.getAll();
         responseContent = buildResponse(results);
      } catch(Exception ex) {
         responseContent = "Exception in executing the query page \n" + ex.toString();
      }
      
      return Response.created(UriBuilder.fromUri("page/query").build()).entity(responseContent).type(MediaType.TEXT_PLAIN).status(Response.Status.OK).build();
  }
  
  /**
    * Delete a object as pages, users, groups, membership, navigations, etc
    * @param dataType
    * @param objectId
    * @return
    */
   @GET
   @Path("delete")
   public Response delete(@PathParam("dataType") String dataType, @QueryParam("objectId") String objectId)
   {
      PortalContainer portalContainer = PortalContainer.getInstance();
      DataStorage dataStorage = (DataStorage)portalContainer.getComponentInstanceOfType(DataStorage.class);
      
      String responseContent = "none";
      
      try {
         Page page = dataStorage.getPage(objectId);
         if(page != null) {
            dataStorage.remove(page);
            responseContent = "success";
         } else {
            responseContent = "Page not found!";
         }
      } catch(Exception ex) {
         responseContent = "Exception in executing delete page \n" + ex.toString();
      }
      
      return Response.created(UriBuilder.fromUri("pagemanagement/delete").build()).entity(responseContent).type(MediaType.TEXT_PLAIN).status(Response.Status.OK).build();
   }
   
   private Query<?> buildQuery(String ownerType, String ownerId)
   {
      if(WILDCARD.equals(ownerId.trim())) {
         ownerId = null;
      }
      else if(ownerId != null) {
         ownerId = ownerId.replace('_', '/');
      }
      
      if(WILDCARD.equals(ownerType.trim())) {
         ownerType = null;
      }
      
      return new Query<Page>(ownerType, ownerId, Page.class);
   }
   
   /**
    * Build response with json format, example for user listing response:
    *
    * @param dataType
    * @param results
    * @return String
    * @throws Exception
    */
   private String buildResponse(List<?> results) throws Exception
   {
      JSONObject buffer = new JSONObject();
      List<Page> pages = (List<Page>)results;
      JSONArray array = new JSONArray();
      
      for (Page page : pages) {
         PageBean  bean = PageBean.build(page);            
         array.put(bean.toJSONObject());            
      }
        
      buffer.put("page", array);     
      return buffer.toString();
   }
}
