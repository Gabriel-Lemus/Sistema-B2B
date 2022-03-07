import java.sql.*;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

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

    /**
     * Get the row count from the provided query.
     * @param con The connection to use.
     * @param countQuery The query to use.
     * @return The row count.
     * @throws SQLException If an error occurs.
     */
    private int getCountFromQuery(Connection con, String countQuery) throws SQLException {
        Statement stmt = con.createStatement();
        ResultSet rs = stmt.executeQuery(countQuery);
        rs.next();
        return rs.getInt(1);
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
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        boolean isSellerParamSet = request.getParameterMap().containsKey("seller");
        boolean isTableParamSet = request.getParameterMap().containsKey("table");

        // Check if the seller and table parameters are set
        if (isSellerParamSet && isTableParamSet) {
            // Check if the seller parameter is set
            if (request.getParameterMap().containsKey("seller")) {
                String seller = request.getParameter("seller").toUpperCase();

                // Chedk if the seller parameter is valid
                if (seller.length() > 0) {
                    user = seller + "_SELLER";
                    password = user + "_ADMIN_SALES";

                    // Check if the seller exists
                    try {
                        Class.forName("oracle.jdbc.driver.OracleDriver");
                        Connection con = DriverManager.getConnection(adminConUrl, adminUser,
                                adminPassword);
                        String sellerInTableQueryCount = "SELECT COUNT(*) FROM SALES.VENDEDORES WHERE UPPER(NOMBRE) = UPPER('" + seller + "')";
                        String sellerSchemaQueryCount = "SELECT COUNT(*) FROM all_users WHERE UPPER(username) = UPPER('" + seller + "_SELLER')";

                        int sellerInTableCount = getCountFromQuery(con, sellerInTableQueryCount);
                        int sellerSchemaCount = getCountFromQuery(con, sellerSchemaQueryCount);

                        if (sellerInTableCount == 1 && sellerSchemaCount == 1) {
                            setSchema(user, password, "localhost", user);
                            sqlSchema.handlePost(request, response);
                        } else {
                            helper.printJsonMessage(out, false, "error",
                                    "The seller " + request.getParameter("seller")
                                            + " does not exist.");
                        }
                    } catch (Exception e) {
                        out.print("Hubo un error abada");
                        helper.printErrorMessage(out, e);
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "The seller parameter you set is empty. Please provide a valid seller parameter.");
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "You didn't provide the seller parameter. Please set the 'seller' parameter.");
            }
        } else if (request.getParameterMap().containsKey("vendedor")) {
            // Check if the seller parameter is set
            String seller = request.getParameter("vendedor");
            String newSellerSchema = seller.toUpperCase() + "_SELLER";

            // Check if the seller schema does not already exist
            String sellerSchemaCheckQuery = "SELECT COUNT(*) FROM all_users WHERE UPPER(username) = UPPER('"
                    + newSellerSchema + "')";

            try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con = DriverManager.getConnection(adminConUrl, adminUser, adminPassword);
                Statement stmt = con.createStatement();
                ResultSet rs = stmt.executeQuery(sellerSchemaCheckQuery);
                int newId = helper.getQueryRowCount(con, "SELECT * FROM SALES.VENDEDORES") + 1;

                // New seller JSON
                JSONObject sellerJson = new JSONObject();
                sellerJson.put("id_vendedor", newId);
                sellerJson.put("nombre", seller);

                // If the seller schema does not exist, create it
                if (!rs.next() || rs.getInt(1) == 0) {
                    try {
                        // Start a transaction
                        con.setAutoCommit(false);

                        // Create the seller schema
                        stmt.executeUpdate("ALTER SESSION SET CONTAINER = XEPDB1");
                        stmt.executeUpdate("CREATE USER " + newSellerSchema + " IDENTIFIED BY "
                                + newSellerSchema
                                + "_ADMIN_SALES");
                        stmt.executeUpdate(
                                "ALTER USER " + newSellerSchema
                                        + " DEFAULT TABLESPACE USERS QUOTA UNLIMITED ON USERS");
                        stmt.executeUpdate("ALTER USER " + newSellerSchema
                                + " TEMPORARY TABLESPACE TEMP");
                        stmt.executeUpdate("GRANT CONNECT TO " + newSellerSchema);
                        stmt.executeUpdate(
                                "GRANT CREATE SESSION, CREATE VIEW, CREATE TABLE, ALTER SESSION, CREATE SEQUENCE TO "
                                        + newSellerSchema);
                        stmt.executeUpdate(
                                "GRANT CREATE SYNONYM, CREATE DATABASE LINK, RESOURCE, UNLIMITED TABLESPACE TO "
                                        + newSellerSchema);
                        stmt.executeUpdate("GRANT CONNECT TO Sales");

                        // Create the tables
                        stmt.executeUpdate("CREATE TABLE " + newSellerSchema + ".dispositivos ("
                                +
                                "id_dispositivo INTEGER NOT NULL, " +
                                "id_vendedor INTEGER NOT NULL, " +
                                "id_marca INTEGER NOT NULL, " +
                                "nombre VARCHAR2(100) NOT NULL, " +
                                "descripcion VARCHAR2(500) NOT NULL, " +
                                "existencias INTEGER NOT NULL, " +
                                "precio FLOAT NOT NULL, " +
                                "codigo_modelo VARCHAR2(100) NOT NULL, " +
                                "color VARCHAR2(100) NOT NULL, " +
                                "categoria VARCHAR2(100) NOT NULL, " +
                                "tiempo_garantia INTEGER NOT NULL, " +
                                "PRIMARY KEY (id_dispositivo))");

                        stmt.executeUpdate("CREATE TABLE " + newSellerSchema
                                + ".fotos_dispositivos (" +
                                "id_foto INTEGER NOT NULL, " +
                                "id_dispositivo INTEGER NOT NULL, " +
                                "foto BLOB NOT NULL, " +
                                "PRIMARY KEY (id_foto))");

                        stmt.executeUpdate("CREATE TABLE " + newSellerSchema + ".ventas (" +
                                "id_venta INTEGER NOT NULL, " +
                                "id_cliente INTEGER NOT NULL, " +
                                "id_vendedor INTEGER NOT NULL, " +
                                "id_dispositivo INTEGER NOT NULL, " +
                                "fecha_venta DATE NOT NULL, " +
                                "precio_venta FLOAT NOT NULL, " +
                                "cantidad_dispositivos INTEGER NOT NULL, " +
                                "impuestos FLOAT NOT NULL, " +
                                "descuentos FLOAT NOT NULL, " +
                                "total_venta FLOAT NOT NULL, " +
                                "PRIMARY KEY (id_venta))");

                        stmt.executeUpdate("CREATE TABLE " + newSellerSchema
                                + ".pedidos_futuros (" +
                                "id_pedido INTEGER NOT NULL, " +
                                "id_cliente INTEGER NOT NULL, " +
                                "id_vendedor INTEGER NOT NULL, " +
                                "fecha_pedido DATE NOT NULL, " +
                                "precio_pedido FLOAT NOT NULL, " +
                                "cantidad_dispositivos INTEGER NOT NULL, " +
                                "impuestos FLOAT NOT NULL, " +
                                "descuentos FLOAT NOT NULL, " +
                                "total_pedido FLOAT NOT NULL, " +
                                "PRIMARY KEY (id_pedido))");

                        stmt.executeUpdate("CREATE TABLE " + newSellerSchema + ".pagos (" +
                                "id_pago INTEGER NOT NULL, " +
                                "id_venta INTEGER NOT NULL, " +
                                "id_cliente INTEGER NOT NULL, " +
                                "id_vendedor INTEGER NOT NULL, " +
                                "fecha_pago DATE NOT NULL, " +
                                "total FLOAT NOT NULL, " +
                                "PRIMARY KEY (id_pago))");

                        stmt.executeUpdate("CREATE TABLE " + newSellerSchema
                                + ".dispositivos_x_ventas (" +
                                "id_dispositivo_x_venta INTEGER NOT NULL, " +
                                "id_venta INTEGER NOT NULL, " +
                                "id_dispositivo INTEGER NOT NULL, " +
                                "cantidad_dispositivos INTEGER NOT NULL, " +
                                "PRIMARY KEY (id_dispositivo_x_venta))");

                        stmt.executeUpdate("CREATE TABLE " + newSellerSchema
                                + ".dispositivos_x_pedidos_futuros (" +
                                "id_dispositivo_x_pedido INTEGER NOT NULL, " +
                                "id_pedido INTEGER NOT NULL, " +
                                "id_dispositivo INTEGER NOT NULL, " +
                                "cantidad_dispositivos INTEGER NOT NULL, " +
                                "PRIMARY KEY (id_dispositivo_x_pedido))");

                        // Grant select to the new schema tables to the Sales schema
                        stmt.executeUpdate("GRANT SELECT ON " + newSellerSchema
                                + ".dispositivos TO Sales");
                        stmt.executeUpdate("GRANT SELECT ON " + newSellerSchema
                                + ".fotos_dispositivos TO Sales");
                        stmt.executeUpdate("GRANT SELECT ON " + newSellerSchema
                                + ".ventas TO Sales");
                        stmt.executeUpdate("GRANT SELECT ON " + newSellerSchema
                                + ".pedidos_futuros TO Sales");
                        stmt.executeUpdate("GRANT SELECT ON " + newSellerSchema
                                + ".pagos TO Sales");
                        stmt.executeUpdate("GRANT SELECT ON " + newSellerSchema
                                + ".dispositivos_x_ventas TO Sales");
                        stmt.executeUpdate(
                                "GRANT SELECT ON " + newSellerSchema
                                        + ".dispositivos_x_pedidos_futuros TO Sales");

                        // Grant select to the new schema to the clients, sellers and brands
                        stmt.executeUpdate("GRANT SELECT, REFERENCES ON " + "Sales.clientes TO "
                                + newSellerSchema);
                        stmt.executeUpdate("GRANT SELECT, REFERENCES ON "
                                + "Sales.vendedores TO " + newSellerSchema);
                        stmt.executeUpdate("GRANT SELECT, REFERENCES ON " + "Sales.marcas TO "
                                + newSellerSchema);

                        // Add foreign keys
                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".dispositivos ADD CONSTRAINT fk_marcas_dispositivos FOREIGN KEY (id_marca) REFERENCES Sales.marcas (id_marca) ENABLE");
                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".dispositivos ADD CONSTRAINT fk_vendedores FOREIGN KEY (id_vendedor) REFERENCES Sales.vendedores (id_vendedor) ENABLE");

                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".fotos_dispositivos ADD CONSTRAINT fk_fotos_dispositivos FOREIGN KEY (id_dispositivo) REFERENCES "
                                + newSellerSchema
                                + ".dispositivos (id_dispositivo) ENABLE");

                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".ventas ADD CONSTRAINT fk_clientes_ventas FOREIGN KEY (id_cliente) REFERENCES Sales.clientes (id_cliente) ENABLE");
                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".ventas ADD CONSTRAINT fk_vendedores_ventas FOREIGN KEY (id_vendedor) REFERENCES Sales.vendedores (id_vendedor) ENABLE");
                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".ventas ADD CONSTRAINT fk_dispositivos_ventas FOREIGN KEY (id_dispositivo) REFERENCES "
                                + newSellerSchema
                                + ".dispositivos (id_dispositivo) ENABLE");

                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".pedidos_futuros ADD CONSTRAINT fk_clientes_pedidos FOREIGN KEY (id_cliente) REFERENCES Sales.clientes (id_cliente) ENABLE");
                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".pedidos_futuros ADD CONSTRAINT fk_vendedores_pedidos FOREIGN KEY (id_vendedor) REFERENCES Sales.vendedores (id_vendedor) ENABLE");

                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".pagos ADD CONSTRAINT fk_ventas_pagos FOREIGN KEY (id_venta) REFERENCES "
                                + newSellerSchema + ".ventas (id_venta) ENABLE");
                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".pagos ADD CONSTRAINT fk_clientes_pagos FOREIGN KEY (id_cliente) REFERENCES Sales.clientes (id_cliente) ENABLE");
                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".pagos ADD CONSTRAINT fk_vendedores_pagos FOREIGN KEY (id_vendedor) REFERENCES Sales.vendedores (id_vendedor) ENABLE");

                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".dispositivos_x_ventas ADD CONSTRAINT fk_dispositivos_x_ventas FOREIGN KEY (id_dispositivo) REFERENCES "
                                + newSellerSchema
                                + ".dispositivos (id_dispositivo) ENABLE");
                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".dispositivos_x_ventas ADD CONSTRAINT fk_ventas_x_ventas FOREIGN KEY (id_venta) REFERENCES "
                                + newSellerSchema + ".ventas (id_venta) ENABLE");

                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".dispositivos_x_pedidos_futuros ADD CONSTRAINT fk_dispositivos_x_pedidos_futuros FOREIGN KEY (id_dispositivo) REFERENCES "
                                + newSellerSchema
                                + ".dispositivos (id_dispositivo) ENABLE");
                        stmt.executeUpdate("ALTER TABLE " + newSellerSchema
                                + ".dispositivos_x_pedidos_futuros ADD CONSTRAINT fk_pedidos_futuros_x_pedidos_futuros FOREIGN KEY (id_pedido) REFERENCES "
                                + newSellerSchema
                                + ".pedidos_futuros (id_pedido) ENABLE");

                        // Add seller to the Sales schema
                        stmt.executeUpdate(
                                helper.getInsertQuery("Sales",
                                        "vendedores",
                                        new String[] { "id_vendedor",
                                                "nombre" },
                                        new String[] { "INTEGER", "VARCHAR2" },
                                        new boolean[] { false, false },
                                        sellerJson));

                        // Commit the transaction
                        con.commit();

                        helper.printJsonMessage(out, true, "message",
                                "The seller " + seller
                                        + " has been successfully created");
                    } catch (Exception e) {
                        // Rollback the transaction
                        con.rollback();
                        helper.printErrorMessage(out, e);
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "A seller with the provided name already exists.");
                }
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "The table name parameter is not set. Please set the parameter 'table' or 'tableName' to search a table inside the schema.");
        }
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
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Check if the seller parameter is set
        if (request.getParameterMap().containsKey("seller")) {
            String seller = request.getParameter("seller").toUpperCase();

            // Chedk if the seller parameter is valid
            if (seller.length() > 0) {
                user = seller + "_SELLER";
                password = user + "_ADMIN_SALES";

                // Check if the seller exists
                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(adminConUrl, adminUser,
                            adminPassword);
                    String sellerInTableQueryCount = "SELECT COUNT(*) FROM SALES.VENDEDORES WHERE UPPER(NOMBRE) = UPPER('"
                            + seller + "')";
                    String sellerSchemaQueryCount = "SELECT COUNT(*) FROM all_users WHERE UPPER(username) = UPPER('"
                            + seller + "_SELLER')";

                    int sellerInTableCount = getCountFromQuery(con, sellerInTableQueryCount);
                    int sellerSchemaCount = getCountFromQuery(con, sellerSchemaQueryCount);

                    if (sellerInTableCount == 1 && sellerSchemaCount == 1) {
                        setSchema(user, password, "localhost", user);
                        sqlSchema.handleGet(request, response);
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "The seller " + request.getParameter("seller")
                                        + " does not exist.");
                    }
                } catch (Exception e) {
                    out.print("Hubo un error abada");
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The seller parameter you set is empty. Please provide a valid seller parameter.");
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "You didn't provide the seller parameter. Please set the 'seller' parameter.");
        }
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
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Check if the seller parameter is set
        if (request.getParameterMap().containsKey("seller")) {
            String seller = request.getParameter("seller").toUpperCase();

            // Chedk if the seller parameter is valid
            if (seller.length() > 0) {
                user = seller + "_SELLER";
                password = seller + "_ADMIN_SALES";

                // Check if the seller exists
                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(adminConUrl, adminUser,
                            adminPassword);
                    String sellerInTableQueryCount = "SELECT COUNT(*) FROM SALES.VENDEDORES WHERE UPPER(NOMBRE) = UPPER('"
                            + seller + "')";
                    String sellerSchemaQueryCount = "SELECT COUNT(*) FROM all_users WHERE UPPER(username) = UPPER('"
                            + seller + "_SELLER')";

                    int sellerInTableCount = getCountFromQuery(con, sellerInTableQueryCount);
                    int sellerSchemaCount = getCountFromQuery(con, sellerSchemaQueryCount);

                    if (sellerInTableCount == 1 && sellerSchemaCount == 1) {
                        setSchema(user, password, "localhost", user);
                        sqlSchema.handlePut(request, response);
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "The seller " + seller + " does not exist.");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The seller parameter you set is empty. Please provide a valid seller parameter.");
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "You didn't provide the seller parameter. Please set the 'seller' parameter.");
        }
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
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Check if the seller parameter is set
        if (request.getParameterMap().containsKey("seller")) {
            String seller = request.getParameter("seller").toUpperCase();

            // Chedk if the seller parameter is valid
            if (seller.length() > 0) {
                user = seller + "_SELLER";
                password = seller + "_ADMIN_SALES";

                // Check if the seller exists
                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(adminConUrl, adminUser,
                            adminPassword);
                    String sellerInTableQueryCount = "SELECT COUNT(*) FROM SALES.VENDEDORES WHERE UPPER(NOMBRE) = UPPER('"
                            + seller + "')";
                    String sellerSchemaQueryCount = "SELECT COUNT(*) FROM all_users WHERE UPPER(username) = UPPER('"
                            + seller + "_SELLER')";

                    int sellerInTableCount = getCountFromQuery(con, sellerInTableQueryCount);
                    int sellerSchemaCount = getCountFromQuery(con, sellerSchemaQueryCount);

                    if (sellerInTableCount == 1 && sellerSchemaCount == 1) {
                        setSchema(user, password, "localhost", user);
                        sqlSchema.handleDelete(request, response);
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "The seller " + seller + " does not exist.");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The seller parameter you set is empty. Please provide a valid seller parameter.");
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "You didn't provide the seller parameter. Please set the 'seller' parameter.");
        }
    }
}
