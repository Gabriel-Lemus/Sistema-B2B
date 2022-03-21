import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
                    { "id_cliente", "nombre", "nit", "email", "telefono", "patente_comercio", "tipo_cliente", "tiene_suscripcion", "vencimiento_suscripcion" },
                    { "id_vendedor", "nombre" },
                    { "id_marca", "nombre" },
                },
                new String[][] {
                    { "INTEGER", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2", "VARCHAR2" },
                    { "INTEGER", "VARCHAR2", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2", "VARCHAR2", "VARCHAR2", "DATE" },
                    { "INTEGER", "VARCHAR2" },
                    { "INTEGER", "VARCHAR2" },
                },
                new boolean[][] {
                    { false, true, true, false, false, false, false },
                    { false, false, true, true, true, true, true, false, true },
                    { false, false },
                    { false, false },
                },
                new int[] { 100, 100, 100, 100 });
    }

    // ========================= CRUD Methods =========================
    /**
     * Method to allow the handling of the post request to the schema instance.
     * 
     * @param request  The request to be handled.
     * @param response The response to be handled.
     * @throws ServletException If the request could not be handled.
     * @throws IOException      If the request could not be handled.
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        sqlSchema.handlePost(request, response);
    }

    /**
     * Method to allow the handling of the get request to the schema instance.
     * 
     * @param request  The request to be handled.
     * @param response The response to be handled.
     * @throws ServletException If the request could not be handled.
     * @throws IOException      If the request could not be handled.
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        sqlSchema.handleGet(request, response);
    }

    /**
     * Method to allow the handling of the put request to the schema instance.
     * 
     * @param request  The request to be handled.
     * @param response The response to be handled.
     * @throws ServletException If the request could not be handled.
     * @throws IOException      If the request could not be handled.
     */
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        sqlSchema.handlePut(request, response);
    }

    /**
     * Method to allow the handling of the delete request to the schema instance.
     * 
     * @param request  The request to be handled.
     * @param response The response to be handled.
     * @throws ServletException If the request could not be handled.
     * @throws IOException      If the request could not be handled.
     */
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        sqlSchema.handleDelete(request, response);
    }
}
