import org.json.JSONObject;
import java.lang.reflect.Field;
import org.exoplatform.portal.config.model.Page;

class PageBean {
   String pageId;
   String pageTitle;
   String accessPermissions;
   String editPermission;
   
   public PageBean(String _pageId, String _pageTitle, String _accessPermissions, String _editPermission) {
      this.pageId = _pageId;
      this.pageTitle = _pageTitle;
      this.accessPermissions = _accessPermissions;
      this.editPermission = _editPermission;
   }
   
   public static PageBean build(Page pageData) {
      String accessPermissions = "";
      String[] dataAccessPermissions = pageData.getAccessPermissions();
      if(dataAccessPermissions != null) {
         StringBuffer buffer = new StringBuffer();
         for(String permission : dataAccessPermissions) {
            buffer.append(permission + ",");
         }
         accessPermissions = buffer.toString();
      }
      return new PageBean(pageData.getPageId(), pageData.getTitle(), accessPermissions, pageData.getEditPermission());
   }
   
   public JSONObject toJSONObject() {
      JSONObject o = new JSONObject();
      try {
         o.put("pageId", pageId.toString());
         o.put("pageTitle", pageTitle.toString());
         o.put("accessPermissions", accessPermissions.toString());
         o.put("editPermission", editPermission.toString());
      } catch (Exception e) {
         System.out.println("PageBean has JSON error: " + e.getMessage());
      }
      return o;
   }
}
