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

    // ========================= Helper Methods =========================
    private void setSchema(String user, String password, String localhostIp, String schName) {
        sqlSchema = new SqlSchema("jdbc:oracle:thin:@localhost:1521/XEPDB1", user, password, localhostIp, schName,
            new String[] { "dispositivos", "fotos_dispositivos", "ventas", "pagos", "pedidos_futuros", "dispositivos_x_ventas", "dispositivos_x_pedidos_futuros" },
            new String[] { "id_dispositivo", "id_foto", "id_venta", "id_pago", "id_pedido", "id_dispositivo_x_venta", "id_dispositivo_x_pedido" },
            new String[] { null, null, null, null, null, null, null },
            new String[][] {
                    { "id_dispositivo", "id_vendedor", "id_marca", "nombre", "descripcion", "existencias", "precio", "codigo_modelo", "color", "categoria", "tiempo_garantia" },
                    { "id_foto", "id_dispositivo", "foto" },
                    { "id_venta", "id_cliente", "id_vendedor", "fecha_venta", "precio_venta", "cantidad_dispositivos", "impuestos", "descuentos", "total_venta" },
                    { "id_pago", "id_venta", "id_cliente", "id_vendedor", "fecha_pago", "total" },
                    { "id_pedido", "id_cliente", "id_vendedor", "fecha_pedido", "precio_pedido", "cantidad_dispositivos", "impuestos", "descuentos", "total_pedido" },
                    { "id_dispositivo_x_venta", "id_venta", "id_dispositivo", "cantidad_dispositivos" },
                    { "id_dispositivo_x_pedido", "id_pedido", "id_dispositivo", "cantidad_dispositivos" },
            },
            new String[][] {
                    { "INTEGER", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER" },
                    { "INTEGER", "INTEGER", "BLOB" },
                    { "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT", "INTEGER", "FLOAT", "FLOAT", "FLOAT" },
                    { "INTEGER", "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT" },
                    { "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT", "INTEGER", "FLOAT", "FLOAT", "FLOAT" },
                    { "INTEGER", "INTEGER", "INTEGER", "INTEGER" },
                    { "INTEGER", "INTEGER", "INTEGER", "INTEGER" },
            },
            new boolean[][] {
                    { false, false, false, false, false, false, false, false, false, false, false },
                    { false, false, false },
                    { false, false, false, false, false, false, false, false, false },
                    { false, false, false, false, false, false },
                    { false, false, false, false, false, false },
                    { false, false, false, false },
                    { false, false, false, false },
            },
            new int[] { 100, 100, 100, 100, 100, 100, 100 });
    }

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
