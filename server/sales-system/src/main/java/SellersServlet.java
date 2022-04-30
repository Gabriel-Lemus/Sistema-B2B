import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Servlet that manages the sellers of the system.
 */
@WebServlet("/sellers")
public class SellersServlet extends HttpServlet {
    // Attributes
    private SqlSchema sqlSchema;
    private ServletHelper helper;
    private String conUrl;
    private String user;
    private String password;
    private String localhostIp;
    private String schema;
    private Secrets secrets;

    // Servlet initialization
    public void init() throws ServletException {
        secrets = new Secrets();
        conUrl = secrets.getOracleConnectionString();
        user = "Sales";
        password = "adminsales";
        localhostIp = "localhost";
        schema = "Sales";
        helper = new ServletHelper();
    }

    // ========================= Helper Methods =========================
    private void setSchema(String seller) {
        sqlSchema = new SqlSchema(conUrl, user, password, localhostIp, schema,
                new String[] { seller + "_dispositivos", seller + "_fotos_dispositivos", seller + "_ventas",
                        seller + "_pagos", seller + "_pedidos_futuros", seller + "_dispositivos_x_ventas",
                        seller + "_dispositivos_x_pedidos_futuros" },
                new String[] { "id_dispositivo", "id_foto", "id_venta", "id_pago", "id_pedido",
                        "id_dispositivo_x_venta", "id_dispositivo_x_pedido" },
                new String[] { null, null, null, null, null, null, null },
                new String[][] {
                        { "id_dispositivo", "id_vendedor", "id_marca", "nombre", "descripcion", "existencias", "precio",
                                "codigo_modelo", "color", "categoria", "tiempo_garantia" },
                        { "id_foto", "id_dispositivo", "foto" },
                        { "id_venta", "id_cliente", "id_vendedor", "fecha_venta", "precio_venta",
                                "cantidad_dispositivos", "impuestos", "descuentos", "total_venta", "venta_mostrada",
                                "pagado" },
                        { "id_pago", "id_venta", "id_cliente", "id_vendedor", "fecha_pago", "total" },
                        { "id_pedido", "id_cliente", "id_vendedor", "fecha_pedido", "precio_pedido",
                                "cantidad_dispositivos", "impuestos", "descuentos", "total_pedido", "fecha_entrega" },
                        { "id_dispositivo_x_venta", "id_venta", "id_dispositivo", "cantidad_dispositivos" },
                        { "id_dispositivo_x_pedido", "id_pedido", "id_dispositivo", "cantidad_dispositivos",
                                "entregado" },
                },
                new String[][] {
                        { "VARCHAR2", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2",
                                "VARCHAR2", "VARCHAR2", "INTEGER" },
                        { "INTEGER", "VARCHAR2", "VARCHAR" },
                        { "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT", "INTEGER", "FLOAT", "FLOAT", "FLOAT",
                                "BOOLEAN", "BOOLEAN" },
                        { "INTEGER", "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT" },
                        { "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT", "INTEGER", "FLOAT", "FLOAT", "FLOAT",
                                "DATE" },
                        { "INTEGER", "INTEGER", "VARCHAR2", "INTEGER" },
                        { "INTEGER", "INTEGER", "VARCHAR2", "INTEGER", "VARCHAR2" },
                },
                new boolean[][] {
                        { false, false, false, false, false, false, false, false, false, false, false },
                        { false, false, false },
                        { false, false, false, false, false, false, false, false, false, false, false },
                        { false, false, false, false, false, false },
                        { false, false, false, false, false, false, false },
                        { false, false, false, false },
                        { false, false, false, false, false },
                },
                new int[] { 100, 100, 100, 100, 100, 100, 100 });
    }

    /**
     * Format the devices json string
     * 
     * @param devices the devices to format
     * @return the formatted devices json string
     */
    private String formatDevices(String devices) {
        JSONObject jsonObject = new JSONObject(devices);
        JSONArray devicesArray = new JSONArray();
        JSONObject currentDevice = new JSONObject();
        JSONObject newDevice = new JSONObject();
        JSONArray dispositivos = jsonObject.getJSONArray("dispositivos");
        jsonObject.remove("dispositivos");

        // Iterate through the dispositivos JSONArray
        for (int i = 0; i < dispositivos.length(); i++) {
            newDevice = dispositivos.getJSONObject(i);

            // Check if it's the first device
            if (i == 0) {
                currentDevice = newDevice;
                JSONArray fotos = new JSONArray();
                fotos.put(newDevice.getString("foto"));
                currentDevice.remove("foto");
                currentDevice.put("fotos", fotos);
            } else {
                if (currentDevice.getString("id_dispositivo").equals(newDevice.getString("id_dispositivo"))
                        && currentDevice.getString("vendedor").equals(newDevice.getString("vendedor"))
                        && currentDevice.getString("marca").equals(newDevice.getString("marca"))) {
                    JSONArray fotos = currentDevice.getJSONArray("fotos");
                    fotos.put(newDevice.getString("foto"));
                    currentDevice.remove("foto");
                    currentDevice.put("fotos", fotos);
                } else {
                    devicesArray.put(currentDevice);
                    currentDevice = newDevice;
                    JSONArray fotos = new JSONArray();
                    fotos.put(newDevice.getString("foto"));
                    currentDevice.remove("foto");
                    currentDevice.put("fotos", fotos);
                }
            }
        }

        devicesArray.put(currentDevice);
        jsonObject.put("dispositivos", devicesArray);

        return jsonObject.toString();
    }

    /**
     * Format a string of purchases, joining each individual purchase made on the
     * same date and time
     * 
     * @param purchases the devices to format
     * @return the formatted devices json string
     */
    private String formatPurchases(String purchases) {
        JSONObject jsonPurchases = new JSONObject(purchases);
        JSONArray purchasesArray = new JSONArray();
        JSONArray currPurchArray = new JSONArray();
        JSONObject currentPurchase = new JSONObject();
        JSONObject newPurchase = new JSONObject();
        JSONArray compras = jsonPurchases.getJSONArray("compras");
        jsonPurchases.remove("compras");

        // Iterate through the compras JSONArray
        for (int i = 0; i < compras.length(); i++) {
            newPurchase = compras.getJSONObject(i);

            if (i == 0) {
                currentPurchase = newPurchase;
                currPurchArray.put(currentPurchase);
            } else {
                if (currentPurchase.getInt("dispositivos_totales") == newPurchase.getInt("dispositivos_totales")
                        && currentPurchase.getString("fecha_venta").equals(newPurchase.getString("fecha_venta"))) {
                    currPurchArray.put(newPurchase);
                } else {
                    purchasesArray.put(currPurchArray);
                    currentPurchase = newPurchase;
                    currPurchArray = new JSONArray();
                    currPurchArray.put(currentPurchase);
                }
            }

            // Add the last purchase to the current array
            if (i == compras.length() - 1) {
                purchasesArray.put(currPurchArray);
            }
        }

        jsonPurchases.put("compras", purchasesArray);
        return jsonPurchases.toString();
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

        if (helper.requestContainsParameter(request, "vendedor")) {
            if (helper.requestContainsParameter(request, "crear")) {
                String vendedor = request.getParameter("vendedor").replace(" ", "_");

                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    String checkSellerExistsQuery = "SELECT * FROM " + schema
                            + ".vendedores WHERE UPPER(nombre) = UPPER('"
                            + vendedor + "')";
                    ResultSet rs = stmt.executeQuery(checkSellerExistsQuery);

                    if (rs.next()) {
                        helper.printJsonMessage(out, false, "error",
                                "A seller with the given name already exists.");
                    } else {
                        CallableStatement cs = con.prepareCall("{CALL " + schema + ".CREATE_SELLER_TABLES(?)}");
                        cs.setString(1, vendedor.replace("_", " "));
                        cs.execute();

                        int sellerId = -1;
                        String getSellerIdQuery = "SELECT id_vendedor FROM " + schema
                                + ".vendedores WHERE UPPER(nombre) = UPPER('"
                                + vendedor.replace("_", " ") + "')";
                        rs = stmt.executeQuery(getSellerIdQuery);

                        if (rs.next()) {
                            sellerId = rs.getInt("id_vendedor");
                        }

                        out.print("{\"success\":" + true + ",\"sellerId\":" + sellerId
                                + ",\"message\":\"Seller created successfully.\"}");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The request does not contain the required parameters.");
            }
        } else if (helper.requestContainsParameter(request, "verVendedor")) {
            String vendedor = request.getParameter("verVendedor").replace(" ", "_");
            setSchema(vendedor);
            sqlSchema.handlePost(request, response);
        } else if (helper.requestContainsParameter(request, "busquedaGeneralizada")) {
            String searchParam = request.getParameter("busquedaGeneralizada");
            String[] fields = { "nombre", "descripcion", "existencias", "precio",
                    "codigo_modelo", "color", "categoria", "tiempo_garantia" };
            ArrayList<String> setFields = new ArrayList<>();

            for (int i = 0; i < fields.length; i++) {
                setFields.add("LOWER(" + fields[i] + ") LIKE '%" + searchParam.toLowerCase() + "%'");
            }

            try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con = DriverManager.getConnection(conUrl, user, password);
                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                        ResultSet.CONCUR_READ_ONLY);
                String allSellersQuery = "SELECT * FROM " + schema + ".vendedores";
                ResultSet rs = stmt.executeQuery(allSellersQuery);
                ArrayList<String> sellers = new ArrayList<String>();
                String devicesQuery = "";

                while (rs.next()) {
                    sellers.add(rs.getString("nombre"));
                }

                if (sellers.size() > 0) {
                    devicesQuery += "SELECT df.*, v.nombre vendedor, m.nombre marca FROM (";

                    if (sellers.size() > 1) {
                        for (int i = 0; i < sellers.size(); i++) {
                            devicesQuery += "SELECT d.*, f.foto FROM (SELECT * FROM "
                                    + (sellers.get(i)).replace(" ", "_") + "_dispositivos WHERE ";

                            for (int j = 0; j < setFields.size(); j++) {
                                devicesQuery += setFields.get(j);
                                if (j < setFields.size() - 1) {
                                    devicesQuery += " OR ";
                                }
                            }

                            devicesQuery += ") d INNER JOIN " + (sellers.get(i)).replace(" ", "_")
                                    + "_fotos_dispositivos f ON d.id_dispositivo = f.id_dispositivo";

                            if (i < sellers.size() - 1) {
                                devicesQuery += " UNION ALL ";
                            }
                        }

                        devicesQuery += ") df INNER JOIN vendedores v ON df.id_vendedor = v.id_vendedor INNER JOIN marcas m ON df.id_marca = m.id_marca ORDER BY df.id_dispositivo ASC, df.id_vendedor ASC, df.id_marca ASC";
                        ResultSet rs2 = stmt.executeQuery(devicesQuery);
                        String jsonString = "{\"success\":true,\"dispositivos\":[";

                        if (rs2.next()) {
                            rs2.previous();

                            String[] attrs = { "id_dispositivo", "id_vendedor",
                                    "id_marca", "nombre", "descripcion", "existencias",
                                    "precio", "codigo_modelo", "color", "categoria",
                                    "tiempo_garantia", "foto", "vendedor", "marca" };
                            String[] types = { "VARCHAR2", "INTEGER", "INTEGER",
                                    "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT",
                                    "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER",
                                    "VARCHAR2", "VARCHAR2", "VARCHAR2" };

                            while (rs2.next()) {
                                jsonString += helper.getRow(rs2, out, attrs, types);

                                if (rs2.isLast()) {
                                    jsonString += "]}";
                                } else {
                                    jsonString += ",";
                                }
                            }

                            out.print(formatDevices(jsonString));
                            out.flush();
                            con.close();
                        }
                    } else {
                        devicesQuery = "SELECT d.id_dispositivo, d.nombre, d.descripcion, d.existencias, d.precio, d.codigo_modelo, d.color, d.categoria, d.tiempo_garantia, f.foto, v.id_vendedor, v.nombre vendedor, m.id_marca, m.nombre marca FROM (SELECT * FROM "
                                + sellers.get(0).replace(" ", "_") + "_dispositivos d WHERE ";

                        for (int i = 0; i < setFields.size(); i++) {
                            devicesQuery += setFields.get(i);
                            if (i < setFields.size() - 1) {
                                devicesQuery += " OR ";
                            }
                        }

                        devicesQuery += " ) d INNER JOIN " + sellers.get(0).replace(" ", "_")
                                + "_fotos_dispositivos f ON d.id_dispositivo = f.id_dispositivo INNER JOIN vendedores v ON d.id_vendedor = v.id_vendedor INNER JOIN marcas m ON d.id_marca = m.id_marca ORDER BY d.id_dispositivo ASC, d.id_vendedor ASC, d.id_marca ASC";
                        ResultSet rs2 = stmt.executeQuery(devicesQuery);
                        String jsonString = "{\"success\":true,\"dispositivos\":[";

                        if (rs2.next()) {
                            rs2.previous();

                            String[] attrs = { "id_dispositivo", "id_vendedor",
                                    "id_marca", "nombre", "descripcion", "existencias",
                                    "precio", "codigo_modelo", "color", "categoria",
                                    "tiempo_garantia", "foto", "vendedor", "marca" };
                            String[] types = { "VARCHAR2", "INTEGER", "INTEGER",
                                    "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT",
                                    "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER",
                                    "VARCHAR2", "VARCHAR2", "VARCHAR2" };

                            while (rs2.next()) {
                                jsonString += helper.getRow(rs2, out, attrs, types);

                                if (rs2.isLast()) {
                                    jsonString += "]}";
                                } else {
                                    jsonString += ",";
                                }
                            }

                            out.print(formatDevices(jsonString));
                            out.flush();
                            con.close();
                        }
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "There are no sellers in the database.");
                }
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }
        } else if (helper.requestContainsParameter(request, "busquedaEspecializada")) {
            String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONObject body = new JSONObject(bodyStr);
            String[] fields = { "nombre", "descripcion", "existencias", "precio",
                    "codigo_modelo", "color", "categoria", "tiempo_garantia", "id_marca" };
            ArrayList<String> setFields = new ArrayList<>();

            for (int i = 0; i < fields.length; i++) {
                if (!body.getString(fields[i]).equals("") && i != 8) {
                    setFields.add("LOWER(" + fields[i] + ") LIKE '%" + body.getString(fields[i]).toLowerCase() + "%'");
                }

                if (!body.getString(fields[i]).equals("") && i == 8) {
                    setFields.add("id_marca = " + body.getString(fields[i]));
                }
            }

            try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con = DriverManager.getConnection(conUrl, user, password);
                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                        ResultSet.CONCUR_READ_ONLY);
                String allSellersQuery = "SELECT * FROM " + schema + ".vendedores";
                ResultSet rs = stmt.executeQuery(allSellersQuery);
                ArrayList<String> sellers = new ArrayList<String>();
                String devicesQuery = "";

                while (rs.next()) {
                    sellers.add(rs.getString("nombre"));
                }

                if (sellers.size() > 0) {
                    devicesQuery += "SELECT df.*, v.nombre vendedor, m.nombre marca FROM (";

                    if (sellers.size() > 1) {
                        for (int i = 0; i < sellers.size(); i++) {
                            devicesQuery += "SELECT d.*, f.foto FROM (SELECT * FROM "
                                    + (sellers.get(i)).replace(" ", "_") + "_dispositivos WHERE ";

                            for (int j = 0; j < setFields.size(); j++) {
                                devicesQuery += setFields.get(j);
                                if (j < setFields.size() - 1) {
                                    devicesQuery += " AND ";
                                }
                            }

                            devicesQuery += ") d INNER JOIN " + (sellers.get(i)).replace(" ", "_")
                                    + "_fotos_dispositivos f ON d.id_dispositivo = f.id_dispositivo";

                            if (i < sellers.size() - 1) {
                                devicesQuery += " UNION ALL ";
                            }
                        }

                        devicesQuery += ") df INNER JOIN vendedores v ON df.id_vendedor = v.id_vendedor INNER JOIN marcas m ON df.id_marca = m.id_marca ORDER BY df.id_dispositivo ASC, df.id_vendedor ASC, df.id_marca ASC";
                        ResultSet rs2 = stmt.executeQuery(devicesQuery);
                        String jsonString = "{\"success\":true,\"dispositivos\":[";

                        if (rs2.next()) {
                            rs2.previous();

                            String[] attrs = { "id_dispositivo", "id_vendedor",
                                    "id_marca", "nombre", "descripcion", "existencias",
                                    "precio", "codigo_modelo", "color", "categoria",
                                    "tiempo_garantia", "foto", "vendedor", "marca" };
                            String[] types = { "VARCHAR2", "INTEGER", "INTEGER",
                                    "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT",
                                    "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER",
                                    "VARCHAR2", "VARCHAR2", "VARCHAR2" };

                            while (rs2.next()) {
                                jsonString += helper.getRow(rs2, out, attrs, types);

                                if (rs2.isLast()) {
                                    jsonString += "]}";
                                } else {
                                    jsonString += ",";
                                }
                            }

                            out.print(formatDevices(jsonString));
                            out.flush();
                            con.close();
                        }
                    } else {
                        devicesQuery = "SELECT d.id_dispositivo, d.nombre, d.descripcion, d.existencias, d.precio, d.codigo_modelo, d.color, d.categoria, d.tiempo_garantia, f.foto, v.id_vendedor, v.nombre vendedor, m.id_marca, m.nombre marca FROM (SELECT * FROM "
                                + sellers.get(0).replace(" ", "_") + "_dispositivos d WHERE ";

                        for (int i = 0; i < setFields.size(); i++) {
                            devicesQuery += setFields.get(i);
                            if (i < setFields.size() - 1) {
                                devicesQuery += " AND ";
                            }
                        }

                        devicesQuery += " ) d INNER JOIN " + sellers.get(0).replace(" ", "_")
                                + "_fotos_dispositivos f ON d.id_dispositivo = f.id_dispositivo INNER JOIN vendedores v ON d.id_vendedor = v.id_vendedor INNER JOIN marcas m ON d.id_marca = m.id_marca ORDER BY d.id_dispositivo ASC, d.id_vendedor ASC, d.id_marca ASC";
                        ResultSet rs2 = stmt.executeQuery(devicesQuery);
                        String jsonString = "{\"success\":true,\"dispositivos\":[";

                        if (rs2.next()) {
                            rs2.previous();

                            String[] attrs = { "id_dispositivo", "id_vendedor",
                                    "id_marca", "nombre", "descripcion", "existencias",
                                    "precio", "codigo_modelo", "color", "categoria",
                                    "tiempo_garantia", "foto", "vendedor", "marca" };
                            String[] types = { "VARCHAR2", "INTEGER", "INTEGER",
                                    "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT",
                                    "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER",
                                    "VARCHAR2", "VARCHAR2", "VARCHAR2" };

                            while (rs2.next()) {
                                jsonString += helper.getRow(rs2, out, attrs, types);

                                if (rs2.isLast()) {
                                    jsonString += "]}";
                                } else {
                                    jsonString += ",";
                                }
                            }

                            out.print(formatDevices(jsonString));
                            out.flush();
                            con.close();
                        }
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "There are no sellers in the database.");
                }
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }
        } else if (helper.requestContainsParameter(request, "sellerAsFactoriesClient")
                && helper.requestContainsParameter(request, "email")) {
            String sellerName = request.getParameter("sellerAsFactoriesClient").replace(" ", "%20");
            String email = request.getParameter("email");
            String localHostIP = secrets.getLocalHostIP();
            String webServerPort = secrets.getWebServerPort();
            HttpClient client = HttpClientBuilder.create().build();
            HttpPost postNewClient = new HttpPost("http://" + localHostIP + ":" + webServerPort
                    + "/?sellerAsFactoriesClient=" + sellerName + "&email=" + email);

            try {
                HttpResponse postNewClientresponse = client.execute(postNewClient);
                String postNewClientResponseBody = EntityUtils.toString(postNewClientresponse.getEntity());
                JSONObject postNewClientResponseJson = new JSONObject(postNewClientResponseBody);

                out.print(postNewClientResponseJson.toString());
            } catch (IOException e) {
                helper.printErrorMessage(out, e);
            }
        } else if (helper.requestContainsParameter(request, "addPaidOrderDevices")) {
            String sellerName = request.getParameter("addPaidOrderDevices").replace(" ", "_");
            String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONArray devices = new JSONArray(bodyStr);
            int id_vendedor = -1;

            // Get the id of the seller
            try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con = DriverManager.getConnection(conUrl, user, password);
                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                        ResultSet.CONCUR_READ_ONLY);
                String allSellersQuery = "SELECT id_vendedor FROM " + schema + ".vendedores WHERE nombre = '"
                        + sellerName.replace("_", " ") + "'";
                ResultSet rs = stmt.executeQuery(allSellersQuery);

                if (rs.next()) {
                    id_vendedor = rs.getInt("id_vendedor");
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "There is no seller with the name " + sellerName.replace("_", " ") + ".");
                }
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }

            if (id_vendedor != -1) {
                boolean couldModifyAllDevices = true;

                // Iterate through the devices array and insert them into the seller's devices
                // table
                for (int i = 0; i < devices.length(); i++) {
                    // Get the id of the brand/factory
                    int id_marca = -1;
                    try {
                        Class.forName("oracle.jdbc.driver.OracleDriver");
                        Connection con = DriverManager.getConnection(conUrl, user, password);
                        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                ResultSet.CONCUR_READ_ONLY);
                        String allBrandsQuery = "SELECT id_marca FROM " + schema + ".marcas WHERE nombre = '"
                                + devices.getJSONObject(i).getString("brand") + "'";
                        ResultSet rs = stmt.executeQuery(allBrandsQuery);

                        if (rs.next()) {
                            id_marca = rs.getInt("id_marca");
                        } else {
                            helper.printJsonMessage(out, false, "error",
                                    "There is no brand with the name " + devices.getJSONObject(i).getString("brand")
                                            + ".");
                        }
                    } catch (Exception e) {
                        couldModifyAllDevices = false;
                        helper.printErrorMessage(out, e);
                    }

                    // Check if the device already exists in the seller's devices table to update
                    // its existences or if it should be inserted
                    boolean deviceExists = false;
                    String id_dispositivo = devices.getJSONObject(i).getString("_id");
                    int currentExistences = 0;
                    try {
                        Class.forName("oracle.jdbc.driver.OracleDriver");
                        Connection con = DriverManager.getConnection(conUrl, user, password);
                        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                ResultSet.CONCUR_READ_ONLY);
                        String allDevicesQuery = "SELECT * FROM " + sellerName
                                + "_dispositivos WHERE id_dispositivo = '" + id_dispositivo + "'";
                        ResultSet rs = stmt.executeQuery(allDevicesQuery);

                        if (rs.next()) {
                            deviceExists = true;
                            currentExistences = rs.getInt("existencias");
                        }
                    } catch (Exception e) {
                        couldModifyAllDevices = false;
                        helper.printErrorMessage(out, e);
                    }

                    if (id_marca != -1) {
                        if (!deviceExists) {
                            // The device doesn't exist, insert it
                            try {
                                Class.forName("oracle.jdbc.driver.OracleDriver");
                                Connection con = DriverManager.getConnection(conUrl, user, password);
                                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                        ResultSet.CONCUR_READ_ONLY);
                                String insertDeviceQuery = "INSERT INTO " + sellerName
                                        + "_dispositivos (ID_DISPOSITIVO, ID_VENDEDOR, ID_MARCA, NOMBRE, DESCRIPCION, EXISTENCIAS, PRECIO, CODIGO_MODELO, COLOR, CATEGORIA, TIEMPO_GARANTIA) VALUES (";
                                insertDeviceQuery += "'" + id_dispositivo + "', '" + id_vendedor + "', '" + id_marca
                                        + "', '" + devices.getJSONObject(i).getString("name") + "', '"
                                        + devices.getJSONObject(i).getString("description") + "', '"
                                        + devices.getJSONObject(i).getInt("quantity") + "', '"
                                        + devices.getJSONObject(i).getFloat("price") + "', '"
                                        + devices.getJSONObject(i).getString("model_code") + "', '"
                                        + devices.getJSONObject(i).getString("color") + "', '"
                                        + devices.getJSONObject(i).getString("category") + "', '"
                                        + devices.getJSONObject(i).getInt("warranty_time") + "')";
                                con.setAutoCommit(false);
                                stmt.executeUpdate(insertDeviceQuery);
                                con.commit();

                                // Iterate through the photos of the device and insert them into the seller's
                                // photos table
                                JSONArray photos = devices.getJSONObject(i).getJSONArray("images");

                                for (int j = 0; j < photos.length(); j++) {
                                    int id_foto = -1;

                                    try {
                                        Class.forName("oracle.jdbc.driver.OracleDriver");
                                        Connection con2 = DriverManager.getConnection(conUrl, user, password);
                                        Statement stmt2 = con2.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                                ResultSet.CONCUR_READ_ONLY);
                                        String photosCountQuery = "SELECT COUNT(*) AS total FROM " + schema + "."
                                                + sellerName + "_fotos_dispositivos";
                                        ResultSet rs = stmt2.executeQuery(photosCountQuery);

                                        if (rs.next()) {
                                            id_foto = rs.getInt("total") + 1;
                                        } else {
                                            couldModifyAllDevices = false;
                                            helper.printJsonMessage(out, false, "error",
                                                    "There was an error while trying to get the id of the photo.");
                                        }
                                    } catch (Exception e) {
                                        couldModifyAllDevices = false;
                                        helper.printErrorMessage(out, e);
                                    }

                                    String insertPhotoQuery = "INSERT INTO " + sellerName
                                            + "_fotos_dispositivos (ID_FOTO, ID_DISPOSITIVO, FOTO) VALUES (";
                                    insertPhotoQuery += "'" + id_foto + "', '" + id_dispositivo + "', '"
                                            + photos.getString(j) + "')";
                                    stmt.executeUpdate(insertPhotoQuery);
                                    con.commit();
                                }
                            } catch (Exception e) {
                                couldModifyAllDevices = false;
                                helper.printErrorMessage(out, e);
                            }
                        } else {
                            // The device exists, update its existences
                            try {
                                Class.forName("oracle.jdbc.driver.OracleDriver");
                                Connection con = DriverManager.getConnection(conUrl, user, password);
                                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                        ResultSet.CONCUR_READ_ONLY);
                                String updateDeviceQuery = "UPDATE " + sellerName + "_dispositivos SET EXISTENCIAS = '"
                                        + (currentExistences + devices.getJSONObject(i).getInt("quantity"))
                                        + "' WHERE ID_DISPOSITIVO = '" + id_dispositivo + "'";
                                con.setAutoCommit(false);
                                stmt.executeUpdate(updateDeviceQuery);
                                con.commit();
                            } catch (Exception e) {
                                couldModifyAllDevices = false;
                                helper.printErrorMessage(out, e);
                            }
                        }
                    } else {
                        couldModifyAllDevices = false;
                        helper.printJsonMessage(out, false, "error",
                                "There is no brand with the name " + devices.getJSONObject(i).getString("brand") + ".");
                    }
                }

                if (couldModifyAllDevices) {
                    helper.printJsonMessage(out, true, "success", "The devices were successfully modified.");
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "There is no seller with the name " + sellerName + ".");
            }
        } else if (helper.requestContainsParameter(request, "newOrder")) {
            String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONObject order = new JSONObject(bodyStr);
            String localHostIP = secrets.getLocalHostIP();
            String webServerPort = secrets.getWebServerPort();
            HttpClient client = HttpClientBuilder.create().build();
            HttpPost postNewOrder = new HttpPost("http://" + localHostIP + ":" + webServerPort + "/?newOrder=true");

            try {
                // Add the order as the body of the request
                StringEntity entity = new StringEntity(order.toString());
                postNewOrder.setEntity(entity);
                postNewOrder.setHeader("Accept", "application/json");
                postNewOrder.setHeader("Content-type", "application/json");

                // Send the request
                HttpResponse postNewOrderResponse = client.execute(postNewOrder);
                String responseBody = EntityUtils.toString(postNewOrderResponse.getEntity());
                JSONObject postNewOrderResponseJson = new JSONObject(responseBody);

                out.println(postNewOrderResponseJson.toString());
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }
        } else if (helper.requestContainsParameter(request, "newClientOrder")) {
            String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONObject clientOrder = new JSONObject(bodyStr);
            JSONArray orders = clientOrder.getJSONArray("orders");
            int clientId = clientOrder.getInt("finalClientId");
            int sellerId = clientOrder.getInt("distributorId");
            String currentDate = LocalDateTime.now().toString();
            currentDate = currentDate.replace("T", " ");
            currentDate = currentDate.substring(0, currentDate.length() - 4);
            int orderId = -1;

            // Get the seller name based on the seller id of the first item in the order
            String sellerName = "";

            try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con = DriverManager.getConnection(conUrl, user, password);
                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
                String getSellerNameQuery = "SELECT nombre FROM " + schema + ".vendedores WHERE id_vendedor = '"
                        + sellerId + "'";
                ResultSet rs = stmt.executeQuery(getSellerNameQuery);

                if (rs.next()) {
                    sellerName = rs.getString("nombre");
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "There was an error while trying to get the name of the seller.");
                }
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }

            // Add the seller name to each item in the order
            for (int i = 0; i < orders.length(); i++) {
                orders.getJSONObject(i).put("sellerName", sellerName);
            }

            // Attempt to post the orders to the web server
            String localHostIP = secrets.getLocalHostIP();
            String webServerPort = secrets.getWebServerPort();
            HttpClient client = HttpClientBuilder.create().build();
            HttpPost postNewClientOrder = new HttpPost("http://" + localHostIP + ":" + webServerPort
                    + "/?newClientOrder=true");

            try {
                // Add the order as the body of the request
                StringEntity entity = new StringEntity(orders.toString());
                postNewClientOrder.setEntity(entity);
                postNewClientOrder.setHeader("Accept", "application/json");
                postNewClientOrder.setHeader("Content-type", "application/json");

                // Send the request
                HttpResponse postNewClientOrderResponse = client.execute(postNewClientOrder);
                String responseBody = EntityUtils.toString(postNewClientOrderResponse.getEntity());
                JSONObject postNewClientOrderResponseJson = new JSONObject(responseBody);
                postNewClientOrderResponseJson = postNewClientOrderResponseJson.getJSONObject("data");
                String maxDeliveryDate = postNewClientOrderResponseJson.getString("maxDeliveryDate");
                maxDeliveryDate = maxDeliveryDate.replace("T", " ");
                maxDeliveryDate = maxDeliveryDate.substring(0, maxDeliveryDate.length() - 5);
                boolean factoriesOrderSuccessful = postNewClientOrderResponseJson.getBoolean("success");

                if (factoriesOrderSuccessful) {
                    orderId = postNewClientOrderResponseJson.getInt("orderId");
                    int totalDevices = 0;
                    int devicesXOrder = 0;
                    double discount = 0.15;
                    double taxes = 0;
                    double total = 0;
                    double totalWithDiscount = 0;

                    // To get the total, reduce the product of the price and the quantity of each
                    // item in the order
                    for (int i = 0; i < orders.length(); i++) {
                        total += orders.getJSONObject(i).getDouble("price")
                                * orders.getJSONObject(i).getInt("quantity");
                        totalDevices += orders.getJSONObject(i).getInt("quantity");
                    }
                    totalWithDiscount = total * (1 - discount) + taxes;

                    // Add the order to the database
                    try {
                        Class.forName("oracle.jdbc.driver.OracleDriver");
                        Connection con = DriverManager.getConnection(conUrl, user, password);
                        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                ResultSet.CONCUR_READ_ONLY);
                        String addOrderQuery = "INSERT INTO " + schema + "." + sellerName.replaceAll(" ", "_")
                                + "_pedidos_futuros (id_pedido, id_cliente, id_vendedor, fecha_pedido, precio, cantidad_dispositivos, impuestos, descuentos, total_pedido, fecha_entrega) "
                                + "VALUES ('" + orderId + "', '" + clientId + "', '" + sellerId + "', TO_DATE('"
                                + currentDate
                                + "', 'YYYY-MM-DD HH24:MI:SS'), '" + total + "', '" + totalDevices + "', '" + taxes
                                + "', '"
                                + discount + "', '" + totalWithDiscount + "', TO_DATE('" + maxDeliveryDate
                                + "', 'YYYY-MM-DD HH24:MI:SS'))";
                        con.setAutoCommit(false);
                        stmt.executeUpdate(addOrderQuery);
                        con.commit();

                        // Iterate through the devices in the order and add the to the
                        // _dispositivos_x_pedidos_futuros table
                        for (int i = 0; i < orders.length(); i++) {
                            int newDeviceXOrderId = 1;
                            String getNewDeviceXOrderIdQuery = "SELECT COUNT(*) FROM " + schema + "."
                                    + sellerName.replaceAll(" ", "_") + "_dispositivos_x_pedidos_futuros";
                            ResultSet rs = stmt.executeQuery(getNewDeviceXOrderIdQuery);

                            if (rs.next()) {
                                newDeviceXOrderId = rs.getInt(1) + 1;
                            }

                            String addDeviceToOrderQuery = "INSERT INTO " + schema + "."
                                    + sellerName.replaceAll(" ", "_")
                                    + "_dispositivos_x_pedidos_futuros" +
                                    "(id_dispositivo_x_pedido, id_pedido, id_dispositivo, nombre_dispositivo, cantidad_dispositivos, precio, entregado, pagado) "
                                    + "VALUES ('" + newDeviceXOrderId + "', '" + orderId + "', '"
                                    + orders.getJSONObject(i).getString("deviceId") + "', '"
                                    + orders.getJSONObject(i).getString("deviceName") + "', '"
                                    + orders.getJSONObject(i).getInt("quantity") +
                                    "', '" + orders.getJSONObject(i).getDouble("price") +
                                    "', 'False', 'False')";
                            stmt.executeUpdate(addDeviceToOrderQuery);
                            con.commit();
                            devicesXOrder++;
                        }

                        if (devicesXOrder == orders.length()) {
                            helper.printJsonMessage(out, true, "success",
                                    "The order was successfully added to the database.");
                        } else {
                            helper.printJsonMessage(out, false, "error",
                                    "There was an error while trying to add the order to the database.");
                        }
                    } catch (Exception e) {
                        helper.printErrorMessage(out, e);
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "There was an error while trying to post the orders to the web server.");
                }
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }
        } else if (helper.requestContainsParameter(request, "actualizarPedido")) {
            String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONObject body = new JSONObject(bodyStr);
            JSONArray orders = body.getJSONArray("orders");

            // Send the order to the web server
            String localHostIP = secrets.getLocalHostIP();
            String webServerPort = secrets.getWebServerPort();
            HttpClient client = HttpClientBuilder.create().build();
            HttpPut putClientOrder = new HttpPut(
                    "http://" + localHostIP + ":" + webServerPort + "/?updateClientOrder=true");

            try {
                StringEntity entity = new StringEntity(orders.toString());
                putClientOrder.setEntity(entity);
                putClientOrder.setHeader("Content-type", "application/json");
                HttpResponse putUpdateClientOrderResponseJson = client.execute(putClientOrder);
                String putUpdateClientOrderResponseBody = EntityUtils
                        .toString(putUpdateClientOrderResponseJson.getEntity());
                JSONObject putUpdateClientOrderResponseJsonJson = new JSONObject(putUpdateClientOrderResponseBody);

                if (putUpdateClientOrderResponseJsonJson.getBoolean("success")) {
                    try {
                        Class.forName("oracle.jdbc.driver.OracleDriver");
                        Connection con = DriverManager.getConnection(conUrl, user, password);
                        con.setAutoCommit(false);
                        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                ResultSet.CONCUR_READ_ONLY);
                        int totalDevices = 0;
                        double total = 0;
                        double totalWithDiscount = 0;
                        double taxes = 0;
                        double discount = 0.15;
                        String sellerName = "";
                        int sellerId = orders.getJSONArray(0).getJSONObject(0).getInt("id_vendedor");

                        // Iterate through the orders and update them
                        for (int i = 0; i < orders.length(); i++) {
                            JSONArray order = orders.getJSONArray(i);
                            int cancelledDevices = 0;
                            int orderId = order.getJSONObject(i).getInt("id_pedido");

                            // Check if all the devices in the order were cancelled
                            for (int j = 0; j < order.length(); j++) {
                                if (order.getJSONObject(j).getBoolean("toDelete")) {
                                    cancelledDevices++;
                                }
                            }

                            if (cancelledDevices != order.length()) {
                                // Update the order
                                String sellerNameQuery = "SELECT nombre FROM " + schema + ".vendedores"
                                        + " WHERE id_vendedor = '" + sellerId + "'";
                                ResultSet rs = stmt.executeQuery(sellerNameQuery);

                                if (rs.next()) {
                                    sellerName = rs.getString("nombre");
                                }

                                // Iterate through the devices in the order and update them
                                for (int j = 0; j < order.length(); j++) {
                                    JSONObject device = order.getJSONObject(j);
                                    String updateDeviceQuery = "";

                                    // Check if the device was cancelled
                                    if (device.getBoolean("toDelete")) {
                                        updateDeviceQuery = "DELETE FROM " + schema + "."
                                                + sellerName.replaceAll(" ", " ") + "_dispositivos_x_pedidos_futuros"
                                                + " WHERE id_dispositivo = '"
                                                + device.getString("id_dispositivo") + "' AND id_pedido = '" + orderId
                                                + "'";
                                        totalDevices -= device.getInt("cantidad_dispositivos");
                                        total -= device.getInt("cantidad_dispositivos") * device.getDouble("precio");
                                    } else {
                                        updateDeviceQuery = "UPDATE " + schema + "." + sellerName.replaceAll(" ", "_")
                                                + "_dispositivos_x_pedidos_futuros"
                                                + " SET cantidad_dispositivos = '"
                                                + device.getInt("cantidad_dispositivos")
                                                + "' WHERE id_dispositivo = '" + device.getString("id_dispositivo")
                                                + "' AND id_pedido = '" + orderId + "'";
                                        totalDevices += device.getInt("cantidad_dispositivos");
                                        total += device.getInt("cantidad_dispositivos") * device.getDouble("precio");
                                    }

                                    stmt.executeUpdate(updateDeviceQuery);
                                    con.commit();
                                }
                                totalWithDiscount = total * (1 - discount) + taxes;

                                // Update the order
                                String updateOrderQuery = "UPDATE " + schema + "." + sellerName.replaceAll(" ", "_")
                                        + "_pedidos_futuros SET cantidad_dispositivos = '" + totalDevices
                                        + "', impuestos = '" + taxes
                                        + "', descuentos = '" + discount
                                        + "', total_pedido = '" + totalWithDiscount
                                        + "' WHERE id_pedido = '" + orderId + "'";
                                stmt.executeUpdate(updateOrderQuery);
                                con.commit();

                                // Success
                                JSONObject successResponse = new JSONObject();
                                successResponse.put("success", true);
                                successResponse.put("message", "El pedido ha sido actualizado correctamente.");

                                out.println(successResponse.toString());
                            } else {
                                // Cancel the order
                                // Delete the devices from the _dispositivos_x_pedidos_futuros table
                                String sellerNameQuery = "SELECT nombre FROM " + schema + ".vendedores"
                                        + " WHERE id_vendedor = '" + sellerId + "'";
                                ResultSet rs = stmt.executeQuery(sellerNameQuery);

                                if (rs.next()) {
                                    sellerName = rs.getString("nombre");
                                }

                                String deleteDevicesQuery = "DELETE FROM " + schema + "."
                                        + sellerName.replaceAll(" ", "_")
                                        + "_dispositivos_x_pedidos_futuros"
                                        + " WHERE id_pedido = '" + orderId + "'";
                                stmt.executeUpdate(deleteDevicesQuery);
                                con.commit();

                                // Delete the order from the _pedidos_futuros table
                                String deleteOrderQuery = "DELETE FROM " + schema + "."
                                        + sellerName.replaceAll(" ", "_")
                                        + "_pedidos_futuros"
                                        + " WHERE id_pedido = '" + orderId + "'";
                                stmt.executeUpdate(deleteOrderQuery);
                                con.commit();

                                // Success
                                JSONObject successResponse = new JSONObject();
                                successResponse.put("success", true);
                                successResponse.put("message", "El pedido ha sido cancelado correctamente.");

                                out.println(successResponse.toString());
                            }
                        }
                    } catch (Exception e) {
                        helper.printErrorMessage(out, e);
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "There was an error while trying to update the order in the database.");
                }
            } catch (IOException e) {
                helper.printErrorMessage(out, e);
            }
        } else if (helper.requestContainsParameter(request, "pagarPedido")) {
            String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONObject body = new JSONObject(bodyStr);
            int orderId = body.getInt("orderId");
            int sellerId = body.getInt("sellerId");
            int saleId = 0;
            int clientId = 0;
            double totalWithDiscount = 0;
            String sellerName = "";
            String deliveryDate = "";

            try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con = DriverManager.getConnection(conUrl, user, password);
                con.setAutoCommit(false);
                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);

                // Get the name of the seller
                String sellerNameQuery = "SELECT nombre FROM " + schema + ".vendedores"
                        + " WHERE id_vendedor = '" + sellerId + "'";
                ResultSet rs = stmt.executeQuery(sellerNameQuery);

                if (rs.next()) {
                    sellerName = rs.getString("nombre");
                }
                sellerName = sellerName.replaceAll(" ", "_");

                // Get the delivery date
                String deliveryDateQuery = "SELECT fecha_entrega FROM " + schema + "." + sellerName
                        + "_pedidos_futuros"
                        + " WHERE id_pedido = '" + orderId + "'";
                rs = stmt.executeQuery(deliveryDateQuery);

                if (rs.next()) {
                    deliveryDate = rs.getString("fecha_entrega");
                }

                // Pay the sale that has the same delivery date
                String paySaleQuery = "UPDATE " + schema + "." + sellerName
                        + "_ventas SET pagado = 'True'"
                        + " WHERE fecha_venta = TO_DATE('" + deliveryDate + "', 'YYYY-MM-DD HH24:MI:SS')";
                stmt.executeUpdate(paySaleQuery);

                // Get the sale id, client id and total_venta
                String saleIdQuery = "SELECT id_venta, id_cliente, total_venta FROM " + schema + "." + sellerName
                        + "_ventas"
                        + " WHERE fecha_venta = TO_DATE('" + deliveryDate + "', 'YYYY-MM-DD HH24:MI:SS')";
                rs = stmt.executeQuery(saleIdQuery);

                if (rs.next()) {
                    saleId = rs.getInt("id_venta");
                    clientId = rs.getInt("id_cliente");
                    totalWithDiscount = rs.getDouble("total_venta");
                }

                // Pay the devices that belong to the order in the
                // _dispositivos_x_pedidos_futuros table
                String payDevicesQuery = "UPDATE " + schema + "." + sellerName
                        + "_dispositivos_x_pedidos_futuros SET pagado = 'True'"
                        + " WHERE id_pedido = '" + orderId + "'";
                stmt.executeUpdate(payDevicesQuery);

                // Register the payment in the _pagos table
                int idPayment = 1;
                String getLastPaymentIdQuery = "SELECT COUNT(*) FROM " + schema + "." + sellerName
                        + "_pagos";
                rs = stmt.executeQuery(getLastPaymentIdQuery);

                if (rs.next()) {
                    idPayment = rs.getInt(1) + 1;
                }

                String registerPaymentQuery = "INSERT INTO " + schema + "." + sellerName + "_pagos"
                        + "(id_pago, id_venta, id_cliente, id_vendedor, fecha_pago, total) VALUES ("
                        + idPayment + ", " + saleId + ", " + clientId + ", " + sellerId + ", "
                        + "TO_DATE('" + deliveryDate + "', 'YYYY-MM-DD HH24:MI:SS'), " + totalWithDiscount + ")";
                stmt.executeUpdate(registerPaymentQuery);

                con.commit();

                // Success
                JSONObject successResponse = new JSONObject();
                successResponse.put("success", true);
                successResponse.put("message", "El pedido ha sido pagado correctamente.");

                out.println(successResponse.toString());
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "The request does not contain the required parameters.");
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

        if (helper.requestContainsParameter(request, "get")) {
            if (helper.requestContainsParameter(request, "verVendedor")) {
                String vendedor = request.getParameter("verVendedor").replace(" ", "_");
                setSchema(vendedor);
                sqlSchema.handleGet(request, response);
            } else if (helper.requestContainsParameter(request, "verDispositivo")) {
                String dispositivoId = request.getParameter("id");
                String vendedor = request.getParameter("vendedor").replace(" ", "_");

                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    String deviceQuery = "SELECT df.id_dispositivo, df.nombre, df.descripcion, df.existencias, df.precio, df.codigo_modelo, df.color, df.categoria, df.tiempo_garantia, v.nombre vendedor, m.nombre marca, df.foto from ("
                            + "SELECT d.id_dispositivo, d.id_vendedor, d.id_marca, d.nombre, d.descripcion, d.existencias, d.precio, d.codigo_modelo, d.color, d.categoria, d.tiempo_garantia, f.foto from "
                            + schema + "." + vendedor
                            + "_dispositivos d, "
                            + schema + "." + vendedor
                            + "_fotos_dispositivos f WHERE d.id_dispositivo = f.id_dispositivo AND d.id_dispositivo = '"
                            + dispositivoId + "') df "
                            + "INNER JOIN vendedores v ON df.id_vendedor = v.id_vendedor INNER JOIN marcas m on df.id_marca = m.id_marca";
                    ResultSet rs = stmt.executeQuery(deviceQuery);

                    if (rs.next()) {
                        rs.previous();

                        String[] devicesAttrs = { "id_dispositivo", "nombre", "descripcion", "existencias", "precio",
                                "codigo_modelo", "color", "categoria", "tiempo_garantia", "vendedor", "marca", "foto" };
                        String[] devicesTypes = { "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2",
                                "VARCHAR2", "VARCHAR2", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2" };
                        String jsonResponse = "";

                        jsonResponse += "{\"success\":" + true + ",\"dispositivos\":[";

                        while (rs.next()) {
                            jsonResponse += helper.getRow(rs, out, devicesAttrs, devicesTypes);

                            if (rs.isLast()) {
                                jsonResponse += "]}";
                            } else {
                                jsonResponse += ",";
                            }
                        }

                        out.print(formatDevices(jsonResponse));
                        // out.print(jsonResponse);
                        con.close();
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "The device with the given id does not exist.");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else if (helper.requestContainsParameter(request, "dispositivos")) {
                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    CallableStatement cs = con.prepareCall("{CALL " + schema + ".GET_ALL_DEVICES()}");
                    cs.execute();
                    String getDevicesQuery = "SELECT * FROM " + schema
                            + ".all_devices WHERE existencias > 0 ORDER BY id_dispositivo ASC";
                    ResultSet rs = stmt.executeQuery(getDevicesQuery);
                    JSONObject jsonResponse = new JSONObject();
                    JSONArray devices = new JSONArray();
                    JSONObject currentDevice = new JSONObject();
                    JSONArray currentDevicesImages = new JSONArray();
                    String currentDeviceId = "";
                    String prevDeviceId = "";
                    boolean firstDevice = true;
                    String[] devicesAttrs = { "id_dispositivo", "nombre", "descripcion", "existencias", "precio",
                            "codigo_modelo", "color", "categoria", "tiempo_garantia", "vendedor", "marca", "foto" };
                    String[] devicesTypes = { "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2",
                            "VARCHAR2", "VARCHAR2", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2" };

                    while (rs.next()) {
                        if (firstDevice) {
                            currentDeviceId = rs.getString("id_dispositivo");
                            prevDeviceId = currentDeviceId;
                            firstDevice = false;

                            for (int i = 0; i < devicesAttrs.length; i++) {
                                if (!"foto".equals(devicesAttrs[i])) {
                                    switch (devicesTypes[i]) {
                                        case "INTEGER":
                                            currentDevice.put(devicesAttrs[i], rs.getInt(devicesAttrs[i]));
                                            break;
                                        case "FLOAT":
                                            currentDevice.put(devicesAttrs[i], rs.getFloat(devicesAttrs[i]));
                                            break;
                                        default:
                                            currentDevice.put(devicesAttrs[i], rs.getString(devicesAttrs[i]));
                                            break;
                                    }
                                } else {
                                    currentDevicesImages.put(rs.getString(devicesAttrs[i]));
                                }
                            }
                        } else {
                            currentDeviceId = rs.getString("id_dispositivo");

                            if (!currentDeviceId.equals(prevDeviceId)) {
                                currentDevice.put("fotos", currentDevicesImages);
                                devices.put(currentDevice);
                                currentDevicesImages = new JSONArray();
                                currentDevice = new JSONObject();

                                for (int i = 0; i < devicesAttrs.length; i++) {
                                    if (!"foto".equals(devicesAttrs[i])) {
                                        switch (devicesTypes[i]) {
                                            case "INTEGER":
                                                currentDevice.put(devicesAttrs[i], rs.getInt(devicesAttrs[i]));
                                                break;
                                            case "FLOAT":
                                                currentDevice.put(devicesAttrs[i], rs.getFloat(devicesAttrs[i]));
                                                break;
                                            default:
                                                currentDevice.put(devicesAttrs[i], rs.getString(devicesAttrs[i]));
                                                break;
                                        }
                                    } else {
                                        currentDevicesImages.put(rs.getString(devicesAttrs[i]));
                                    }
                                }
                            } else {
                                currentDevicesImages.put(rs.getString("foto"));
                            }

                            prevDeviceId = currentDeviceId;
                        }

                        if (rs.isLast()) {
                            currentDevice.put("fotos", currentDevicesImages);
                            devices.put(currentDevice);
                            jsonResponse.put("dispositivos", devices);
                        }
                    }

                    if (devices.length() == 0) {
                        jsonResponse.put("dispositivos", devices);
                    }

                    jsonResponse.put("success", true);
                    out.print(jsonResponse.toString());
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else if (helper.requestContainsParameter(request, "dispositivosAgotados")) {
                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    CallableStatement cs = con.prepareCall("{CALL " + schema + ".GET_ALL_DEVICES()}");
                    cs.execute();
                    String getDevicesQuery = "SELECT * FROM " + schema
                            + ".all_devices WHERE existencias = 0 ORDER BY id_dispositivo ASC";
                    ResultSet rs = stmt.executeQuery(getDevicesQuery);
                    JSONObject jsonResponse = new JSONObject();
                    JSONArray devices = new JSONArray();
                    JSONObject currentDevice = new JSONObject();
                    JSONArray currentDevicesImages = new JSONArray();
                    String currentDeviceId = "";
                    String prevDeviceId = "";
                    boolean firstDevice = true;
                    String[] devicesAttrs = { "id_dispositivo", "nombre", "descripcion", "existencias", "precio",
                            "codigo_modelo", "color", "categoria", "tiempo_garantia", "vendedor", "marca", "foto" };
                    String[] devicesTypes = { "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2",
                            "VARCHAR2", "VARCHAR2", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2" };

                    while (rs.next()) {
                        if (firstDevice) {
                            currentDeviceId = rs.getString("id_dispositivo");
                            prevDeviceId = currentDeviceId;
                            firstDevice = false;

                            for (int i = 0; i < devicesAttrs.length; i++) {
                                if (!"foto".equals(devicesAttrs[i])) {
                                    switch (devicesTypes[i]) {
                                        case "INTEGER":
                                            currentDevice.put(devicesAttrs[i], rs.getInt(devicesAttrs[i]));
                                            break;
                                        case "FLOAT":
                                            currentDevice.put(devicesAttrs[i], rs.getFloat(devicesAttrs[i]));
                                            break;
                                        default:
                                            currentDevice.put(devicesAttrs[i], rs.getString(devicesAttrs[i]));
                                            break;
                                    }
                                } else {
                                    currentDevicesImages.put(rs.getString(devicesAttrs[i]));
                                }
                            }
                        } else {
                            currentDeviceId = rs.getString("id_dispositivo");

                            if (!currentDeviceId.equals(prevDeviceId)) {
                                currentDevice.put("fotos", currentDevicesImages);
                                devices.put(currentDevice);
                                currentDevicesImages = new JSONArray();
                                currentDevice = new JSONObject();

                                for (int i = 0; i < devicesAttrs.length; i++) {
                                    if (!"foto".equals(devicesAttrs[i])) {
                                        switch (devicesTypes[i]) {
                                            case "INTEGER":
                                                currentDevice.put(devicesAttrs[i], rs.getInt(devicesAttrs[i]));
                                                break;
                                            case "FLOAT":
                                                currentDevice.put(devicesAttrs[i], rs.getFloat(devicesAttrs[i]));
                                                break;
                                            default:
                                                currentDevice.put(devicesAttrs[i], rs.getString(devicesAttrs[i]));
                                                break;
                                        }
                                    } else {
                                        currentDevicesImages.put(rs.getString(devicesAttrs[i]));
                                    }
                                }
                            } else {
                                currentDevicesImages.put(rs.getString("foto"));
                            }

                            prevDeviceId = currentDeviceId;
                        }

                        if (rs.isLast()) {
                            currentDevice.put("fotos", currentDevicesImages);
                            devices.put(currentDevice);
                            jsonResponse.put("dispositivos", devices);
                        }
                    }

                    if (devices.length() == 0) {
                        jsonResponse.put("dispositivos", devices);
                    }

                    jsonResponse.put("success", true);
                    out.print(jsonResponse.toString());
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else if (helper.requestContainsParameter(request, "sellerId")) {
                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    String sellerName = request.getParameter("sellerId");
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    String sellerQuery = "SELECT GET_SELLER_ID('" + sellerName + "') FROM DUAL";
                    ResultSet rs = stmt.executeQuery(sellerQuery);

                    if (rs.next()) {
                        out.print("{\"success\":" + true + ",\"sellerId\":" + rs.getInt(1) + "}");
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "The seller with the given name does not exist.");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else if (helper.requestContainsParameter(request, "compras")) {
                int clientId = Integer.parseInt(request.getParameter("compras"));

                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    String allSellersQuery = "SELECT * FROM " + schema + ".vendedores";
                    ResultSet rs = stmt.executeQuery(allSellersQuery);
                    ArrayList<String> sellers = new ArrayList<String>();
                    String salesQuery = "";

                    while (rs.next()) {
                        sellers.add(rs.getString("nombre"));
                    }

                    if (sellers.size() > 0) {
                        salesQuery += "SELECT * FROM (";

                        for (int i = 0; i < sellers.size(); i++) {
                            salesQuery += "SELECT v.id_venta, v.id_cliente, dv.id_vendedor, v.fecha_venta, v.precio_venta, v.cantidad_dispositivos dispositivos_totales, v.impuestos, v.descuentos, v.total_venta, v.venta_mostrada, v.pagado, dv.id_dispositivo, dv.id_marca, dv.nombre, dv.descripcion, dv.existencias, dv.precio, dv.codigo_modelo, dv.color, dv.categoria, dv.tiempo_garantia, dv.cantidad_dispositivos dispositivos_adquiridos FROM "
                                    + sellers.get(i).replace(" ", "_")
                                    + "_ventas v, (SELECT d.*, dv.id_venta, dv.cantidad_dispositivos from "
                                    + sellers.get(i).replace(" ", "_") + "_dispositivos d, "
                                    + sellers.get(i).replace(" ", "_")
                                    + "_dispositivos_x_ventas dv WHERE d.id_dispositivo = dv.id_dispositivo) dv WHERE v.id_venta = dv.id_venta";

                            if (i < sellers.size() - 1) {
                                salesQuery += " UNION ALL ";
                            }
                        }

                        salesQuery += ") s WHERE s.id_cliente = " + clientId
                                + " ORDER BY s.fecha_venta ASC, s.id_venta ASC";
                        ResultSet rs2 = stmt.executeQuery(salesQuery);
                        JSONObject jsonResponse = new JSONObject();
                        JSONArray nonCreditSales = new JSONArray();
                        JSONArray creditSales = new JSONArray();
                        JSONArray currentSale = new JSONArray();

                        if (rs2.next()) {
                            rs2.previous();
                            int currentSaleId = -1;
                            int prevSaleId = -1;
                            boolean firstSale = true;

                            String[] attrs = { "id_venta", "id_cliente", "id_vendedor", "fecha_venta", "precio_venta",
                                    "dispositivos_totales", "impuestos", "descuentos", "total_venta", "venta_mostrada",
                                    "pagado", "id_dispositivo", "id_marca", "nombre", "descripcion", "existencias",
                                    "precio", "codigo_modelo", "color", "categoria", "tiempo_garantia",
                                    "dispositivos_adquiridos"
                            };
                            String[] types = { "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT", "INTEGER", "FLOAT",
                                    "FLOAT", "FLOAT", "BOOLEAN", "BOOLEAN", "VARCHAR2", "INTEGER", "VARCHAR2",
                                    "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER",
                                    "INTEGER"
                            };

                            // Iterate through the result set and check if each sale is credit or not based
                            // on the pagado field
                            while (rs2.next()) {
                                JSONObject sale = new JSONObject();
                                currentSaleId = rs2.getInt("id_venta");

                                for (int i = 0; i < attrs.length; i++) {
                                    switch (types[i]) {
                                        case "INTEGER":
                                            sale.put(attrs[i], rs2.getInt(attrs[i]));
                                            break;
                                        case "FLOAT":
                                            sale.put(attrs[i], rs2.getFloat(attrs[i]));
                                            break;
                                        case "BOOLEAN":
                                            sale.put(attrs[i], rs2.getString(attrs[i]).equals("True"));
                                            break;
                                        default:
                                            sale.put(attrs[i], rs2.getString(attrs[i]));
                                            break;
                                    }
                                }

                                // Group the different sales by id_venta
                                if (firstSale) {
                                    currentSale.put(sale);
                                    prevSaleId = currentSaleId;
                                    firstSale = false;
                                } else {
                                    if (currentSaleId == prevSaleId) {
                                        currentSale.put(sale);
                                    } else {
                                        if (currentSale.getJSONObject(0).getBoolean("pagado")) {
                                            nonCreditSales.put(currentSale);
                                        } else {
                                            creditSales.put(currentSale);
                                        }

                                        currentSale = new JSONArray();
                                        currentSale.put(sale);
                                        prevSaleId = currentSaleId;
                                    }
                                }
                            }

                            // Add the last sale to the array
                            if (currentSale.length() > 0) {
                                if (currentSale.getJSONObject(0).getBoolean("pagado")) {
                                    nonCreditSales.put(currentSale);
                                } else {
                                    creditSales.put(currentSale);
                                }
                            }

                            // Add the credit sales and non credit sales to the json response
                            jsonResponse.put("success", true);
                            jsonResponse.put("compras", nonCreditSales);
                            jsonResponse.put("cantidadCompras", nonCreditSales.length());
                            jsonResponse.put("comprasCredito", creditSales);
                            jsonResponse.put("cantidadComprasCredito", creditSales.length());

                            out.print(jsonResponse.toString());
                            out.flush();
                            con.close();
                        } else {
                            jsonResponse.put("success", true);
                            jsonResponse.put("compras", nonCreditSales);
                            jsonResponse.put("cantidadCompras", nonCreditSales.length());
                            jsonResponse.put("comprasCredito", creditSales);
                            jsonResponse.put("cantidadComprasCredito", creditSales.length());

                            out.print(jsonResponse.toString());
                            out.flush();
                            con.close();
                        }
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "There are no sellers in the database.");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else if (helper.requestContainsParameter(request, "ventas")) {
                int sellerId = Integer.parseInt(request.getParameter("ventas"));

                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    String checkSellerExistsQuery = "SELECT * FROM " + schema + ".vendedores WHERE id_vendedor = "
                            + sellerId;
                    ResultSet rs = stmt.executeQuery(checkSellerExistsQuery);
                    String salesQuery = "";

                    if (rs.next()) {
                        salesQuery += "SELECT v.id_venta, v.id_cliente, dv.id_vendedor, v.fecha_venta, v.precio_venta, v.cantidad_dispositivos dispositivos_totales, v.impuestos, v.descuentos, v.total_venta, dv.id_dispositivo, dv.id_marca, dv.nombre, dv.descripcion, dv.existencias, dv.precio, dv.codigo_modelo, dv.color, dv.categoria, dv.tiempo_garantia, dv.cantidad_dispositivos dispositivos_adquiridos FROM "
                                + rs.getString("nombre").replace(" ", "_")
                                + "_ventas v, (SELECT d.*, dv.id_venta, dv.cantidad_dispositivos from "
                                + rs.getString("nombre").replace(" ", "_") + "_dispositivos d, "
                                + rs.getString("nombre").replace(" ", "_")
                                + "_dispositivos_x_ventas dv WHERE d.id_dispositivo = dv.id_dispositivo) dv WHERE v.id_venta = dv.id_venta ORDER BY v.fecha_venta ASC, v.id_venta ASC";
                        ResultSet rs2 = stmt.executeQuery(salesQuery);
                        String jsonString = "{\"success\":true,\"compras\":[";

                        if (rs2.next()) {
                            rs2.previous();

                            String[] attrs = { "id_venta", "id_cliente", "id_vendedor", "fecha_venta", "precio_venta",
                                    "dispositivos_totales", "impuestos", "descuentos", "total_venta", "id_dispositivo",
                                    "id_marca", "nombre", "descripcion", "existencias", "precio", "codigo_modelo",
                                    "color", "categoria", "tiempo_garantia", "dispositivos_adquiridos" };
                            String[] types = { "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT", "INTEGER", "FLOAT",
                                    "FLOAT", "FLOAT", "VARCHAR2", "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER",
                                    "FLOAT", "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER", "INTEGER" };

                            while (rs2.next()) {
                                jsonString += helper.getRow(rs2, out, attrs, types);

                                if (rs2.isLast()) {
                                    jsonString += "]}";
                                } else {
                                    jsonString += ",";
                                }
                            }

                            // out.print(jsonString);
                            out.print(formatPurchases(jsonString));
                            out.flush();
                            con.close();
                        }
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "There is no seller with the specified id.");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else if (helper.requestContainsParameter(request, "getFactoriesDevices")) {
                String localHostIP = secrets.getLocalHostIP();
                String webServerPort = secrets.getWebServerPort();
                HttpClient client = HttpClientBuilder.create().build();
                HttpGet getFactoriesDevices = new HttpGet(
                        "http://" + localHostIP + ":" + webServerPort + "/?getFactoriesDevices=true");

                try {
                    HttpResponse getNewClientresponse = client.execute(getFactoriesDevices);
                    String getNewClientResponseBody = EntityUtils.toString(getNewClientresponse.getEntity());
                    JSONObject getNewClientResponseJson = new JSONObject(getNewClientResponseBody);

                    out.print(getNewClientResponseJson.toString());
                } catch (IOException e) {
                    helper.printErrorMessage(out, e);
                }
            } else if (helper.requestContainsParameter(request, "getFactoryDevice")) {
                String deviceId = request.getParameter("getFactoryDevice");
                String localHostIP = secrets.getLocalHostIP();
                String webServerPort = secrets.getWebServerPort();
                HttpClient client = HttpClientBuilder.create().build();
                HttpGet getFactoriesDevices = new HttpGet(
                        "http://" + localHostIP + ":" + webServerPort + "/?getFactoryDevice=" + deviceId);

                try {
                    HttpResponse getNewClientresponse = client.execute(getFactoriesDevices);
                    String getNewClientResponseBody = EntityUtils.toString(getNewClientresponse.getEntity());
                    JSONObject getNewClientResponseJson = new JSONObject(getNewClientResponseBody);

                    out.print(getNewClientResponseJson.toString());
                } catch (IOException e) {
                    helper.printErrorMessage(out, e);
                }
            } else if (helper.requestContainsParameter(request, "clientOrdersNoClientId")) {
                String clientName = request.getParameter("clientOrdersNoClientId").replaceAll(" ", "%20");
                String localHostIP = secrets.getLocalHostIP();
                String webServerPort = secrets.getWebServerPort();
                HttpClient client = HttpClientBuilder.create().build();
                HttpGet getFactoriesDevices = new HttpGet(
                        "http://" + localHostIP + ":" + webServerPort + "/?clientOrdersNoClientId=" + clientName);

                try {
                    HttpResponse getNewClientresponse = client.execute(getFactoriesDevices);
                    String getNewClientResponseBody = EntityUtils.toString(getNewClientresponse.getEntity());
                    JSONObject getNewClientResponseJson = new JSONObject(getNewClientResponseBody);

                    out.print(getNewClientResponseJson.toString());
                } catch (IOException e) {
                    helper.printErrorMessage(out, e);
                }
            } else if (helper.requestContainsParameter(request, "pedidosCliente")) {
                int clientId = Integer.parseInt(request.getParameter("pedidosCliente"));
                ArrayList<String> sellers = new ArrayList<String>();

                // Start the connection to oracle
                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    String sellersNamesQuery = "SELECT nombre FROM " + schema + ".vendedores";
                    ResultSet rs = stmt.executeQuery(sellersNamesQuery);

                    // Add the sellers to the sellers array
                    while (rs.next()) {
                        sellers.add(rs.getString("nombre"));
                    }

                    // Get the client's orders from the _dispositivos_x_pedidos_futuros table
                    String clientOrdersQuery = "";
                    for (int i = 0; i < sellers.size(); i++) {
                        String sellerName = sellers.get(i).replaceAll(" ", "_");

                        clientOrdersQuery += "SELECT dpf.id_dispositivo, pf.id_vendedor, dpf.nombre_dispositivo nombre, dpf.precio, pf.id_pedido, dpf.cantidad_dispositivos, dpf.entregado, dpf.pagado, pf.cantidad_dispositivos dispositivos_totales, pf.impuestos, pf.descuentos, pf.total_pedido, pf.fecha_entrega"
                                + " FROM " + sellerName
                                + "_pedidos_futuros pf, " + sellerName
                                + "_dispositivos_x_pedidos_futuros dpf WHERE pf.id_pedido = dpf.id_pedido and pf.id_cliente = '"
                                + clientId + "'";

                        if (i < sellers.size() - 1) {
                            clientOrdersQuery += " UNION ALL ";
                        } else {
                            clientOrdersQuery += " ORDER BY id_pedido";
                        }
                    }

                    rs = stmt.executeQuery(clientOrdersQuery);
                    JSONObject clientOrdersJson = new JSONObject();
                    JSONArray deliveredDevices = new JSONArray();
                    JSONArray notDeliveredDevices = new JSONArray();
                    JSONArray currentOrderDevices = new JSONArray();
                    int prevOrderId = -1;
                    int currentOrderId = 0;
                    boolean firstDevice = true;
                    String[] deviceAttrs = { "id_dispositivo", "id_vendedor", "nombre", "precio", "id_pedido",
                            "cantidad_dispositivos", "entregado", "pagado", "dispositivos_totales", "impuestos",
                            "descuentos", "total_pedido", "fecha_entrega" };
                    String[] deviceAttrsTypes = { "VARCHAR2", "INTEGER", "VARCHAR2", "FLOAT", "INTEGER",
                            "INTEGER", "BOOLEAN", "BOOLEAN", "INTEGER", "FLOAT", "FLOAT", "FLOAT", "DATE" };

                    // Iterate through the results and add the devices to the order
                    while (rs.next()) {
                        currentOrderId = rs.getInt("id_pedido");
                        JSONObject currentDevice = new JSONObject();

                        for (int j = 0; j < deviceAttrs.length; j++) {
                            switch (deviceAttrsTypes[j]) {
                                case "INTEGER":
                                    currentDevice.put(deviceAttrs[j], rs.getInt(deviceAttrs[j]));
                                    break;
                                case "FLOAT":
                                    currentDevice.put(deviceAttrs[j], rs.getFloat(deviceAttrs[j]));
                                    break;
                                case "BOOLEAN":
                                    currentDevice.put(deviceAttrs[j], rs.getString(deviceAttrs[j]).equals("True"));
                                    break;
                                default:
                                    currentDevice.put(deviceAttrs[j], rs.getString(deviceAttrs[j]));
                                    break;
                            }
                        }

                        if (firstDevice) {
                            firstDevice = false;
                            prevOrderId = currentOrderId;
                            currentOrderDevices.put(currentDevice);
                        } else {
                            if (currentOrderId == prevOrderId) {
                                currentOrderDevices.put(currentDevice);
                            } else {
                                boolean allDelivered = true;

                                for (int k = 0; k < currentOrderDevices.length(); k++) {
                                    if (!currentOrderDevices.getJSONObject(k).getBoolean("entregado")) {
                                        allDelivered = false;
                                        break;
                                    }
                                }

                                if (allDelivered) {
                                    deliveredDevices.put(currentOrderDevices);
                                } else {
                                    notDeliveredDevices.put(currentOrderDevices);
                                }

                                currentOrderDevices = new JSONArray();
                                currentOrderDevices.put(currentDevice);
                                prevOrderId = currentOrderId;
                            }
                        }
                    }

                    if (currentOrderDevices.length() > 0) {
                        boolean allDelivered = true;

                        for (int k = 0; k < currentOrderDevices.length(); k++) {
                            if (!currentOrderDevices.getJSONObject(k).getBoolean("entregado")) {
                                allDelivered = false;
                                break;
                            }
                        }

                        if (allDelivered) {
                            deliveredDevices.put(currentOrderDevices);
                        } else {
                            notDeliveredDevices.put(currentOrderDevices);
                        }
                    }

                    clientOrdersJson.put("deliveredOrders", deliveredDevices);
                    clientOrdersJson.put("nonDeliveredOrders", notDeliveredDevices);
                    clientOrdersJson.put("success", true);

                    con.close();
                    out.println(clientOrdersJson.toString());
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The request does not contain the required parameters.");
            }
        } else if (helper.requestContainsParameter(request, "post")) {
            doPost(request, response);
        } else if (helper.requestContainsParameter(request, "put")) {
            doPut(request, response);
        } else {
            doDelete(request, response);
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

        if (helper.requestContainsParameter(request, "verVendedor")) {
            String vendedor = request.getParameter("verVendedor").replace(" ", "_");
            setSchema(vendedor);
            sqlSchema.handlePut(request, response);
        } else if (helper.requestContainsParameter(request, "updateOrders")) {
            String localHostIP = secrets.getLocalHostIP();
            String webServerPort = secrets.getWebServerPort();
            String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONObject body = new JSONObject(bodyStr);
            HttpClient client = HttpClientBuilder.create().build();
            HttpPut updateOrders = new HttpPut("http://" + localHostIP + ":" + webServerPort + "/?updateOrders=true");
            updateOrders.setEntity(new StringEntity(body.toString()));
            updateOrders.setHeader("Accept", "application/json");
            updateOrders.setHeader("Content-type", "application/json");

            try {
                HttpResponse updateOrdersResponse = client.execute(updateOrders);
                String updateOrdersResponseBody = EntityUtils.toString(updateOrdersResponse.getEntity());
                JSONObject updateOrdersResponseJson = new JSONObject(updateOrdersResponseBody);

                out.print(updateOrdersResponseJson.toString());
            } catch (IOException e) {
                helper.printErrorMessage(out, e);
            }
        } else if (helper.requestContainsParameter(request, "payOrder")) {
            String orderId = request.getParameter("payOrder");
            String localHostIP = secrets.getLocalHostIP();
            String webServerPort = secrets.getWebServerPort();
            String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONObject body = new JSONObject(bodyStr);
            HttpClient client = HttpClientBuilder.create().build();
            HttpPut payOrders = new HttpPut("http://" + localHostIP + ":" + webServerPort + "/?payOrder=" + orderId);
            payOrders.setEntity(new StringEntity(body.toString()));
            payOrders.setHeader("Accept", "application/json");
            payOrders.setHeader("Content-type", "application/json");

            try {
                HttpResponse payOrdersResponse = client.execute(payOrders);
                String payOrdersResponseBody = EntityUtils.toString(payOrdersResponse.getEntity());
                JSONObject payOrdersResponseJson = new JSONObject(payOrdersResponseBody);

                out.print(payOrdersResponseJson.toString());
            } catch (IOException e) {
                helper.printErrorMessage(out, e);
            }
        } else if (helper.requestContainsParameter(request, "pagarComprasCredito")) {
            String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONArray creditPurchases = new JSONArray(bodyStr);
            int clientId = creditPurchases.getJSONArray(0).getJSONObject(0).getInt("id_cliente");
            String currentDate = LocalDateTime.now().toString();
            currentDate = currentDate.replace("T", " ");
            currentDate = currentDate.substring(0, currentDate.length() - 4);

            try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con = DriverManager.getConnection(conUrl, user, password);
                con.setAutoCommit(false);
                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                        ResultSet.CONCUR_READ_ONLY);

                try {
                    // Iterate through the credit purchases and pay them
                    for (int i = 0; i < creditPurchases.length(); i++) {
                        JSONArray creditPurchase = creditPurchases.getJSONArray(i);
                        for (int j = 0; j < creditPurchases.getJSONArray(i).length(); j++) {
                            int sellerId = creditPurchase.getJSONObject(j).getInt("id_vendedor");
                            int saleId = creditPurchase.getJSONObject(j).getInt("id_venta");
                            String getSellerNameQuery = "SELECT nombre FROM " + schema
                                    + ".vendedores WHERE id_vendedor = "
                                    + sellerId;
                            ResultSet sellerNameRS = stmt.executeQuery(getSellerNameQuery);

                            if (sellerNameRS.next()) {
                                // Update the order payment status
                                String sellerName = sellerNameRS.getString("nombre").replaceAll(" ", "_");
                                String payCreditPurchaseQuery = "UPDATE " + schema + "." + sellerName
                                        + "_ventas SET pagado = 'True' WHERE id_venta = " + saleId;
                                stmt.executeUpdate(payCreditPurchaseQuery);

                                // Register the payment in the seller's payments table
                                String newPaymentId = "SELECT id_pago FROM " + schema + "." + sellerName
                                        + "_pagos ORDER BY id_pago DESC";
                                ResultSet newPaymentIdRS = stmt.executeQuery(newPaymentId);
                                int newPaymentIdInt = 1;

                                if (newPaymentIdRS.next()) {
                                    newPaymentIdInt = newPaymentIdRS.getInt("id_pago") + 1;
                                }

                                // Register the payment
                                String registerPaymentQuery = "INSERT INTO " + schema + "." + sellerName
                                        + "_pagos (id_pago, id_venta, id_cliente, id_vendedor, fecha_pago, total) VALUES ("
                                        + newPaymentIdInt + ", " + saleId + ", " + clientId + ", " + sellerId
                                        + ", TO_DATE('"
                                        + currentDate + "', 'yyyy-MM-dd HH24:MI:SS'), "
                                        + creditPurchase.getJSONObject(i).getDouble("total_venta") + ")";
                                stmt.executeUpdate(registerPaymentQuery);

                                con.commit();
                            }
                        }
                    }

                } catch (Exception e) {
                    con.rollback();
                    helper.printErrorMessage(out, e);
                } finally {
                    con.close();
                }

                JSONObject responseJson = new JSONObject();
                responseJson.put("success", true);
                responseJson.put("message", "Las compras a crédito han sido pagadas correctamente.");

                out.print(responseJson.toString());
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }
        } else if (helper.requestContainsParameter(request, "payClientOrder")) {
            String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONObject body = new JSONObject(bodyStr);
            String sellerName = body.getString("clientName");
            String sellerNameNoSpaces = sellerName.replaceAll(" ", "_");
            int orderId = body.getInt("orderId");
            String today = LocalDateTime.now().toString();
            today = today.replace("T", " ");
            today = today.substring(0, today.length() - 4);

            try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con = DriverManager.getConnection(conUrl, user, password);
                con.setAutoCommit(false);
                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                        ResultSet.CONCUR_READ_ONLY);

                // Update the devices that belong to the order as delivered in the
                // _dispositivos_x_pedidos_futuros table
                String updateDevicesQuery = "UPDATE " + schema + "." + sellerNameNoSpaces
                        + "_dispositivos_x_pedidos_futuros SET entregado = 'True' WHERE id_pedido = '"
                        + orderId + "'";
                stmt.executeUpdate(updateDevicesQuery);

                // Update the order's delivery date as today in the _pedido_futuros table
                String updateOrderDeliveryDateQuery = "UPDATE " + schema + "." + sellerNameNoSpaces
                        + "_pedidos_futuros SET fecha_entrega = TO_DATE('" + today
                        + "', 'yyyy-MM-dd HH24:MI:SS') WHERE id_pedido = '"
                        + orderId + "'";
                stmt.executeUpdate(updateOrderDeliveryDateQuery);

                // Get the client's id, seller's id, devices amount, price, taxes, discount and
                // total
                // from the order
                int clientId = 0;
                int sellerId = 0;
                int devicesAmount = 0;
                double price = 0;
                double taxes = 0;
                double discount = 0;
                double total = 0;
                String getClientIdQuery = "SELECT id_cliente, id_vendedor, cantidad_dispositivos, impuestos, descuentos, total_pedido, precio FROM "
                        + schema + "." + sellerNameNoSpaces + "_pedidos_futuros WHERE id_pedido = " + orderId;
                ResultSet clientIdRS = stmt.executeQuery(getClientIdQuery);

                if (clientIdRS.next()) {
                    clientId = clientIdRS.getInt("id_cliente");
                    sellerId = clientIdRS.getInt("id_vendedor");
                    devicesAmount = clientIdRS.getInt("cantidad_dispositivos");
                    price = clientIdRS.getDouble("precio");
                    taxes = clientIdRS.getDouble("impuestos");
                    discount = clientIdRS.getDouble("descuentos");
                    total = clientIdRS.getDouble("total_pedido");
                }

                // Add the order as a new sale in the _ventas table
                int newSaleId = 1;
                String getNewSaleIdQuery = "SELECT COUNT(*) FROM " + schema + "." + sellerNameNoSpaces
                        + "_ventas";
                ResultSet newSaleIdRS = stmt.executeQuery(getNewSaleIdQuery);

                if (newSaleIdRS.next()) {
                    newSaleId = newSaleIdRS.getInt(1) + 1;
                }

                String registerSaleQuery = "INSERT INTO " + schema + "." + sellerNameNoSpaces
                        + "_ventas (id_venta, id_cliente, id_vendedor, fecha_venta, precio_venta, cantidad_dispositivos, impuestos, descuentos, total_venta, venta_mostrada, pagado) VALUES ("
                        + newSaleId + ", " + clientId + ", " + sellerId + ", TO_DATE('" + today
                        + "', 'yyyy-MM-dd HH24:MI:SS'), " + price + ", " + devicesAmount + ", " + taxes
                        + ", " + discount + ", " + total + ", 'True', 'False')";
                stmt.executeUpdate(registerSaleQuery);

                // Get the new dispositivo_x_venta id
                int newDeviceSaleId = 1;
                String getNewDeviceSaleIdQuery = "SELECT COUNT(*) FROM " + schema + "." + sellerNameNoSpaces
                        + "_dispositivos_x_ventas";
                ResultSet newDeviceSaleIdRS = stmt.executeQuery(getNewDeviceSaleIdQuery);

                if (newDeviceSaleIdRS.next()) {
                    newDeviceSaleId = newDeviceSaleIdRS.getInt(1) + 1;
                }

                // Add the order's devices as the devices of the sale in the
                // _dispositivos_x_ventas table
                String getDevicesQuery = "SELECT id_dispositivo, cantidad_dispositivos, nombre_dispositivo, precio FROM "
                        + schema + "." + sellerNameNoSpaces + "_dispositivos_x_pedidos_futuros WHERE id_pedido = '"
                        + orderId + "'";
                Statement getDevicesStmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                        ResultSet.CONCUR_READ_ONLY);
                ResultSet devicesRS = getDevicesStmt.executeQuery(getDevicesQuery);

                while (devicesRS.next()) {
                    String deviceId = devicesRS.getString("id_dispositivo");
                    int deviceAmount = devicesRS.getInt("cantidad_dispositivos");
                    String deviceName = devicesRS.getString("nombre_dispositivo");
                    double devicePrice = devicesRS.getDouble("precio");

                    String registerDeviceQuery = "INSERT INTO " + schema + "." + sellerNameNoSpaces
                            + "_dispositivos_x_ventas (id_dispositivo_x_venta, id_venta, id_dispositivo, nombre_dispositivo, precio, cantidad_dispositivos) VALUES ('"
                            + newDeviceSaleId + "', '" + newSaleId + "', '" + deviceId + "', '" + deviceName
                            + "', '" + devicePrice + "', '" + deviceAmount + "')";
                    stmt.executeUpdate(registerDeviceQuery);
                    newDeviceSaleId++;
                }

                con.commit();

                // Successful response
                JSONObject successResponse = new JSONObject();
                successResponse.put("success", true);
                successResponse.put("message", "The order was successfully delivered");

                out.println(successResponse.toString());
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "The request does not contain the required parameters.");
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

        if (helper.requestContainsParameter(request, "vendedor")) {
            if (helper.requestContainsParameter(request, "eliminar")) {
                String vendedor = request.getParameter("vendedor").replace(" ", "_");

                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    String checkSellerExistsQuery = "SELECT * FROM " + schema
                            + ".vendedores WHERE UPPER(nombre) = UPPER('"
                            + vendedor + "')";
                    ResultSet rs = stmt.executeQuery(checkSellerExistsQuery);

                    if (rs.next()) {
                        CallableStatement cs = con.prepareCall("{CALL " + schema + ".DROP_SELLER_TABLES(?)}");
                        cs.setString(1, vendedor);
                        cs.execute();
                        helper.printJsonMessage(out, true, "success", "Seller deleted successfully.");
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "A seller with the given name does not exist.");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The request does not contain the required parameters.");
            }
        } else if (helper.requestContainsParameter(request, "verVendedor")) {
            String vendedor = request.getParameter("verVendedor").replace(" ", "_");
            setSchema(vendedor);
            sqlSchema.handleDelete(request, response);
        } else {
            helper.printJsonMessage(out, false, "error",
                    "The request does not contain the required parameters.");
        }
    }
}
