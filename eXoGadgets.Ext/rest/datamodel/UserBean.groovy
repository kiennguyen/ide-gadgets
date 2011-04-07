 package rest.datamodel
 
 import org.json.JSONObject;
 import java.lang.reflect.Field;
 import org.exoplatform.services.organization.User;
 
class UserBean implements RESTBean {
   String userName;
   String firstName;
   String lastName;
   String email;
   
   public UserBean(String _userName, String _firstName, String _lastName, String _email)
   {
      this.userName = _userName;
      this.firstName = _firstName;
      this.lastName = _lastName;
      this.email = _email;
   }
   
   public static UserBean build(User userData)
   {      
      return new UserBean(userData.getUserName(), userData.getFirstName(), userData.getLastName(), userData.getEmail());
   }
   
   public JSONObject toJSONObject() {
      JSONObject o = new JSONObject();
      try {
         o.put("userName", userName.toString());
         o.put("firstName", firstName.toString());
         o.put("lastName", lastName.toString());
         o.put("email", email.toString());
      } catch (Exception e) {
         System.out.println("PageBin has JSON error: " + e.getMessage());
      }
      return o;
   }
}
