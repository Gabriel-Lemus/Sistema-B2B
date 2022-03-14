import java.sql.*;

import java.io.IOException;
import java.io.PrintWriter;

import java.util.ArrayList;
import java.util.Base64;

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
                new String[] { "dispositivos", "fotos_dispositivos", "ventas", "pagos", "pedidos_futuros",
                        "dispositivos_x_ventas", "dispositivos_x_pedidos_futuros" },
                new String[] { "id_dispositivo", "id_foto", "id_venta", "id_pago", "id_pedido",
                        "id_dispositivo_x_venta", "id_dispositivo_x_pedido" },
                new String[] { null, null, null, null, null, null, null },
                new String[][] {
                        { "id_dispositivo", "id_vendedor", "id_marca", "nombre", "descripcion", "existencias", "precio",
                                "codigo_modelo", "color", "categoria", "tiempo_garantia" },
                        { "id_foto", "id_dispositivo", "foto" },
                        { "id_venta", "id_cliente", "id_vendedor", "id_dispositivo", "fecha_venta", "precio_venta",
                                "cantidad_dispositivos", "impuestos", "descuentos", "total_venta" },
                        { "id_pago", "id_venta", "id_cliente", "id_vendedor", "fecha_pago", "total" },
                        { "id_pedido", "id_cliente", "id_vendedor", "fecha_pedido", "precio_pedido",
                                "cantidad_dispositivos", "impuestos", "descuentos", "total_pedido" },
                        { "id_dispositivo_x_venta", "id_venta", "id_dispositivo", "cantidad_dispositivos" },
                        { "id_dispositivo_x_pedido", "id_pedido", "id_dispositivo", "cantidad_dispositivos" },
                },
                new String[][] {
                        { "INTEGER", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2",
                                "VARCHAR2", "VARCHAR2", "INTEGER" },
                        { "INTEGER", "INTEGER", "BLOB" },
                        { "INTEGER", "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT", "INTEGER", "FLOAT", "FLOAT",
                                "FLOAT" },
                        { "INTEGER", "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT" },
                        { "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT", "INTEGER", "FLOAT", "FLOAT", "FLOAT" },
                        { "INTEGER", "INTEGER", "INTEGER", "INTEGER" },
                        { "INTEGER", "INTEGER", "INTEGER", "INTEGER" },
                },
                new boolean[][] {
                        { false, false, false, false, false, false, false, false, false, false, false },
                        { false, false, false },
                        { false, false, false, false, false, false, false, false, false, false },
                        { false, false, false, false, false, false },
                        { false, false, false, false, false, false },
                        { false, false, false, false },
                        { false, false, false, false },
                },
                new int[] { 100, 100, 100, 100, 100, 100, 100 });
    }

    /**
     * Returns the url for the records that belong to the next page.
     * 
     * @param request The http request object.
     * @param page    The page number.
     * @return The url for the next page.
     */
    private String getNextPageUrl(HttpServletRequest request, int page) {
        String[] params = request.getParameterMap().keySet().toArray(new String[0]);
        String schemaStr = "sellers";
        String localhostIp = "localhost";

        // Check if the schema matches the regex "something"_seller; if so, change the
        // schema name to "sellers"
        if (schemaStr.matches("^[a-zA-Z]*_seller")) {
            schemaStr = "sellers";
        }

        String nextPageUrl = "\"http://" + localhostIp + ":8080/sales-system/" + schemaStr;

        if (params.length > 0) {
            nextPageUrl += "?";
        }

        for (int i = 0; i < params.length; i++) {
            if (!params[i].equals("page")) {
                nextPageUrl += params[i] + "=" + request.getParameter(params[i]) + "&";
            }
        }

        nextPageUrl += "page=" + (page + 1) + "\"";

        return nextPageUrl;
    }

    /**
     * Get the maximum number of pages based on the row count and the set max rows.
     * 
     * @param rowCount The number of rows.
     * @return The maximum number of pages.
     */
    private int getMaxNumberOfPages(int rowCount, int maxRows) {
        return (rowCount - (rowCount % maxRows)) / maxRows + (rowCount % maxRows == 0 ? 0 : 1);
    }

    /**
     * Get the row count from the provided query.
     * 
     * @param con        The connection to use.
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

    /**
     * Concatenate a JSON string representation to form an array of pictures in
     * base64 format.
     * 
     * @param deviceJson The JSON string representation of the device.
     * @return The JSON string representation of the device with the pictures in
     *         base64 format.
     */
    private String concatenateDeviceInfo(String deviceJson) {
        String deviceInfo = deviceJson.substring(0, deviceJson.indexOf("\"foto\":"));
        deviceInfo += "\"fotos\":[";

        // Iterate through the string and get the values of the foto attributes
        // There may be more than one foto, so we need to get the values of all of them
        while (deviceJson.contains("\"foto\":")) {
            deviceJson = deviceJson.substring(deviceJson.indexOf("\"foto\":") + 8);
            deviceInfo += "\"" + deviceJson.substring(0, deviceJson.indexOf("\"")) + "\"";
            deviceJson = deviceJson.substring(deviceJson.indexOf("\"") + 1);
            if (deviceJson.contains("\"foto\":")) {
                deviceInfo += ",";
            }
        }

        deviceInfo += "]}]}";

        return deviceInfo;
    }

    // TODO: work on the delete method

    // TODO: work on the get implementations for the DB views

    // TODO: Check if there are no devices to display in the current selected page

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
                        String sellerInTableQueryCount = "SELECT COUNT(*) FROM SALES.VENDEDORES WHERE UPPER(NOMBRE) = UPPER('"
                                + seller + "')";
                        String sellerSchemaQueryCount = "SELECT COUNT(*) FROM all_users WHERE UPPER(username) = UPPER('"
                                + seller + "_SELLER')";

                        int sellerInTableCount = getCountFromQuery(con,
                                sellerInTableQueryCount);
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
                        out.print("Hubo un error");
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

                        out.print("{\"success\":" + true + ",\"message\": \"The seller " + seller
                                + " has been successfully created\", \"seller_id\":" + newId + "}");
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
                    out.print("Hubo un error");
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The seller parameter you set is empty. Please provide a valid seller parameter.");
            }
        } else if (request.getParameterMap().containsKey("dispositivos")) {
            int maxDevices = 100;

            if (request.getParameterMap().containsKey("page")) {
                String possiblePage = request.getParameter("page");

                if (helper.isNumeric(possiblePage)) {
                    int page = Integer.parseInt(possiblePage);

                    if (page > 0) {
                        try {
                            Class.forName("oracle.jdbc.driver.OracleDriver");
                            Connection con = DriverManager.getConnection(connectionUrl, "Sales", "adminsales");
                            Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                    ResultSet.CONCUR_READ_ONLY);
                            String allSellersQuery = "SELECT username FROM all_users WHERE username LIKE '%_SELLER'";

                            // Start transaction
                            con.setAutoCommit(false);

                            // Get all the sellers
                            ResultSet rs = stmt.executeQuery(allSellersQuery);

                            // Save the sellers in an array
                            ArrayList<String> sellers = new ArrayList<String>();
                            String devicesQuery = "";

                            while (rs.next()) {
                                sellers.add(rs.getString("username"));
                            }

                            // Build the devices query from all the sellers
                            if (sellers.size() > 0) {
                                devicesQuery += "WITH s AS (";

                                if (sellers.size() > 1) {
                                    for (int i = 0; i < sellers.size(); i++) {
                                        devicesQuery += "SELECT * FROM " + sellers.get(i)
                                                + ".dispositivos";

                                        if (i < sellers.size() - 1) {
                                            devicesQuery += " UNION ALL ";
                                        }
                                    }

                                    devicesQuery += ") SELECT s.id_dispositivo, s.nombre as dispositivo, descripcion, existencias, precio, codigo_modelo, color, categoria, tiempo_garantia, vendedores.nombre AS vendedor, marcas.nombre AS marca FROM s INNER JOIN VENDEDORES ON s.ID_VENDEDOR = VENDEDORES.ID_VENDEDOR INNER JOIN MARCAS ON s.ID_MARCA = MARCAS.ID_MARCA OFFSET "
                                            + (page - 1) * maxDevices + " ROWS FETCH NEXT " + maxDevices + " ROWS ONLY";
                                } else {
                                    devicesQuery = "SELECT * FROM " + sellers.get(0)
                                            + ".dispositivos OFFSET " + (page - 1) * maxDevices + " ROWS FETCH NEXT "
                                            + maxDevices + " ROWS ONLY";
                                }

                                // Get the row count and execute the query
                                int rowCount = helper.getQueryRowCount(con, devicesQuery);
                                String maxCountQuery = devicesQuery.substring(0, devicesQuery.indexOf("OFFSET"));
                                int maxRowCount = helper.getQueryRowCount(con, maxCountQuery);
                                ResultSet rs2 = stmt.executeQuery(devicesQuery);

                                out.print("{\"success\":" + true + ",\"rowCount\":" + rowCount + ",\"data\":[");

                                // Check if there are any devices
                                if (rs2.next()) {
                                    // Return the first device
                                    rs2.beforeFirst();

                                    // There are records; print them
                                    while (rs2.next()) {
                                        helper.printRow(rs2, out,
                                                new String[] { "id_dispositivo", "dispositivo", "descripcion",
                                                        "existencias", "precio", "codigo_modelo", "color", "categoria",
                                                        "tiempo_garantia", "vendedor", "marca" },
                                                new String[] { "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT",
                                                        "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER", "VARCHAR2",
                                                        "VARCAHR2" });

                                        if (rs2.isLast()) {
                                            if (page == getMaxNumberOfPages(maxRowCount, maxDevices) && page != 1) {
                                                out.print("],\"previousPage\":" + getNextPageUrl(request, page - 2)
                                                        + "}");
                                            } else if (page != 1) {
                                                out.print(
                                                        "],\"previousPage\":" + getNextPageUrl(request, page - 2)
                                                                + ",\"nextPage\":"
                                                                + getNextPageUrl(request, page) + "}");
                                            } else if (page == 1 && rowCount != maxRowCount) {
                                                out.print("],\"nextPage\":" + getNextPageUrl(request, page) + "}");
                                            } else {
                                                out.print("]}");
                                            }
                                        } else {
                                            out.print(",");
                                        }
                                    }
                                } else {
                                    out.print("]}");
                                }
                            } else {
                                out.print("{\"success\":" + true + ",\"rowCount\":" + 0 + ",\"data\":[]}");
                            }

                            // Commit the transaction
                            con.commit();

                            // Close the connection
                            con.close();
                        } catch (Exception e) {
                            helper.printErrorMessage(out, e);
                        }
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "The page number is invalid. Please provide a positive, non-zero number.");
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "The page parameter you set is not a number. Please provide a valid page parameter.");
                }
            } else if (request.getParameterMap().containsKey("dispositivo")) {
                int deviceId = Integer.parseInt(request.getParameter("dispositivo"));

                try {
                    String seller = request.getParameter("vendedor") + "_SELLER";
                    String devicesQuery = "WITH s AS (SELECT " + seller
                            + ".dispositivos.ID_DISPOSITIVO ID_DISPOSITIVO, " + seller
                            + ".dispositivos.NOMBRE NOMBRE, " + seller
                            + ".dispositivos.DESCRIPCION DESCRIPCION, " + seller
                            + ".dispositivos.EXISTENCIAS EXISTENCIAS, " + seller
                            + ".dispositivos.PRECIO PRECIO, " + seller
                            + ".dispositivos.CODIGO_MODELO CODIGO_MODELO, " + seller
                            + ".dispositivos.COLOR COLOR, " + seller
                            + ".dispositivos.CATEGORIA CATEGORIA, " + seller
                            + ".dispositivos.TIEMPO_GARANTIA TIEMPO_GARANTIA, " + seller
                            + ".fotos_dispositivos.FOTO FOTO FROM "
                            + seller + ".dispositivos, " + seller + ".fotos_dispositivos WHERE " + seller
                            + ".dispositivos.id_dispositivo = " + seller
                            + ".fotos_dispositivos.id_dispositivo) SELECT s.* FROM s WHERE s.id_dispositivo = "
                            + deviceId;
                    String devicesQueryAlt = "SELECT " + seller
                            + ".dispositivos.ID_DISPOSITIVO ID_DISPOSITIVO, " + seller
                            + ".dispositivos.NOMBRE NOMBRE, " + seller
                            + ".dispositivos.DESCRIPCION DESCRIPCION, " + seller
                            + ".dispositivos.EXISTENCIAS EXISTENCIAS, " + seller
                            + ".dispositivos.PRECIO PRECIO, " + seller
                            + ".dispositivos.CODIGO_MODELO CODIGO_MODELO, " + seller
                            + ".dispositivos.COLOR COLOR, " + seller
                            + ".dispositivos.CATEGORIA CATEGORIA, " + seller
                            + ".dispositivos.TIEMPO_GARANTIA TIEMPO_GARANTIA FROM "
                            + seller + ".dispositivos WHERE id_dispositivo = "
                            + deviceId;

                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(connectionUrl, "Sales", "adminsales");
                    int queryCount = helper.getQueryRowCount(con, devicesQuery);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    
                    if (queryCount == 0) {
                        ResultSet rs = stmt.executeQuery(devicesQueryAlt);
                        String deviceStr = "{\"success\":" + true + ",\"data\":[";
                        String[] attributes = new String[] { "id_dispositivo", "nombre", "descripcion", "existencias",
                                "precio", "codigo_modelo", "color", "categoria", "tiempo_garantia" };
                        String[] types = new String[] { "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT",
                                "VARCHAR2",
                                "VARCHAR2", "VARCHAR2", "VARCHAR2" };

                        while (rs.next()) {
                            deviceStr += ("{");

                            for (int i = 1; i < attributes.length; i++) {
                                deviceStr += ("\"" + attributes[i] + "\":");

                                switch (types[i]) {
                                    case "INTEGER":
                                        deviceStr += (rs.getInt(attributes[i]));
                                        break;
                                    case "FLOAT":
                                        deviceStr += (rs.getFloat(attributes[i]));
                                        break;
                                    case "BOOLEAN":
                                        deviceStr += (rs.getBoolean(attributes[i]));
                                        break;
                                    default:
                                        deviceStr += ("\"" + rs.getString(attributes[i]) + "\"");
                                        break;
                                }

                                if (i < attributes.length - 1) {
                                    deviceStr += (",");
                                }
                            }

                            deviceStr += ("}");

                            if (rs.isLast()) {
                                deviceStr += ("]}");
                            } else {
                                deviceStr += (",");
                            }
                        }

                        out.print(deviceStr);
                        // out.print(concatenateDeviceInfo(deviceStr));
                    } else {
                        ResultSet rs = stmt.executeQuery(devicesQuery);
                        String deviceStr = "{\"success\":" + true + ",\"data\":[";
                        String[] attributes = new String[] { "id_dispositivo", "nombre", "descripcion", "existencias",
                                "precio", "codigo_modelo", "color", "categoria", "tiempo_garantia", "foto" };
                        String[] types = new String[] { "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT",
                                "VARCHAR2",
                                "VARCHAR2", "VARCHAR2", "VARCHAR2", "BLOB" };

                        while (rs.next()) {
                            deviceStr += ("{");

                            for (int i = 1; i < attributes.length; i++) {
                                deviceStr += ("\"" + attributes[i] + "\":");

                                switch (types[i]) {
                                    case "INTEGER":
                                        deviceStr += (rs.getInt(attributes[i]));
                                        break;
                                    case "FLOAT":
                                        deviceStr += (rs.getFloat(attributes[i]));
                                        break;
                                    case "BOOLEAN":
                                        deviceStr += (rs.getBoolean(attributes[i]));
                                        break;
                                    case "BLOB":
                                        deviceStr += ("\"" +
                                                Base64.getEncoder().encodeToString(rs.getBytes(attributes[i]))
                                                + "\"");
                                        break;
                                    default:
                                        deviceStr += ("\"" + rs.getString(attributes[i]) + "\"");
                                        break;
                                }

                                if (i < attributes.length - 1) {
                                    deviceStr += (",");
                                }
                            }

                            deviceStr += ("}");

                            if (rs.isLast()) {
                                deviceStr += ("]}");
                            } else {
                                deviceStr += (",");
                            }
                        }

                        // out.print(deviceStr);
                        out.print(concatenateDeviceInfo(deviceStr));
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The page parameter you set is empty. Please provide a valid page parameter.");
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
