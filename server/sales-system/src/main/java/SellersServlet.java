import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
@WebServlet("/sellers")
public class SellersServlet extends HttpServlet {
    // Attributes
    private SqlSchema sqlSchema;
    private ServletHelper helper;
    private String connectionUrl;
    private String user;
    private String password;
    private String adminConUrl;
    private String adminUser;
    private String adminPassword;

    // Servlet initialization
    public void init() throws ServletException {
        helper = new ServletHelper();

        // Standard connection
        connectionUrl = "jdbc:oracle:thin:@localhost:1521/XEPDB1";

        // Admin connection
        adminConUrl = connectionUrl;
        adminUser = "SYS as SYSDBA";
        adminPassword = "Oracle18c";
    }
}
