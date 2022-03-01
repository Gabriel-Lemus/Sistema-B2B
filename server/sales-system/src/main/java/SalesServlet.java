import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;

@WebServlet("/sales")
public class SalesServlet extends HttpServlet {
    // Attributes
    private SqlSchema sqlSchema;

    // Servlet initialization
    public void init() throws ServletException {
        String connectionUrl = "jdbc:oracle:thin:@localhost:1521/XEPDB1";
        String user = "Sales";
        String password = "adminsales";
        String localhostIp = "localhost";
        String schema = "Sales";

        sqlSchema = new SqlSchema(connectionUrl, user, password, localhostIp, schema,
                new String[] { "credenciales_usuarios", "clientes", "vendedores", "marcas" },
                new String[] { "id_credencial", "id_cliente", "id_vendedor", "id_marca" },
                new String[] { "email", null, "nombre", "nombre" },
                new String[][] {
                    { "id_credencial", "id_cliente", "id_vendedor", "tipo_usuario", "email", "salt", "hash" },
                    { "id_cliente", "nombre", "nit", "email", "telefono", "tipo_cliente", "tiene_suscripcion", "vencimiento_suscripcion" },
                    { "id_vendedor", "nombre" },
                    { "id_marca", "nombre" },
                },
                new String[][] {
                    { "INTEGER", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2", "VARCHAR2" },
                    { "INTEGER", "VARCHAR2", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2", "BOOLEAN", "VARCHAR2" },
                    { "INTEGER", "VARCHAR2" },
                    { "INTEGER", "VARCHAR2" },
                },
                new boolean[][] {
                    { false, true, true, false, false, false, false },
                    { false, false, true, true, true, true, false, true },
                    { false, false },
                    { false, false },
                },
                new int[] { 100, 100, 100, 100 });
    }
}
