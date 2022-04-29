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
            int clientId = clientOrder.getInt("clientId");
            String currentDate = LocalDateTime.now().toString();
            currentDate = currentDate.replace("T", " ");
            currentDate = currentDate.substring(0, currentDate.length() - 4);
            int[] orderIds = new int[orders.length()];
            String[] sellerNames = new String[orders.length()];

            // Iterate through the orders and create a new order for each one
            for (int i = 0; i < orders.length(); i++) {
                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    con.setAutoCommit(false);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
                    int sellerId = orders.getJSONObject(i).getInt("id_vendedor");
                    String sellerName = "SELECT nombre FROM " + schema + ".vendedores WHERE id_vendedor = '" + sellerId
                            + "'";
                    ResultSet rs = stmt.executeQuery(sellerName);
                    rs.next();
                    sellerName = rs.getString("nombre").replaceAll(" ", "_");
                    sellerNames[i] = sellerName;
                    orders.getJSONObject(i).put("sellerName", sellerName.replaceAll("_", " "));
                    int newOrderId = 1;
                    String getNewOrderIdQuery = "SELECT COUNT(*) AS total FROM " + schema + "." + sellerName
                            + "_pedidos_futuros";
                    rs = stmt.executeQuery(getNewOrderIdQuery);
                    double price = orders.getJSONObject(i).getDouble("price");
                    double taxes = 0;
                    double discounts = 0.15;
                    double total = price + taxes - (price * discounts);
                    total = total * (1 - discounts);
                    long factor = (long) Math.pow(10, 2);
                    total = (double) ((long) (Math.round(total * factor))) / factor;

                    if (rs.next()) {
                        newOrderId = rs.getInt("total") + 1;
                    }
                    orderIds[i] = newOrderId;

                    String newSellerOrder = "INSERT INTO " + schema + "." + sellerName + "_pedidos_futuros (ID_PEDIDO, "
                            + "ID_CLIENTE, ID_VENDEDOR, FECHA_PEDIDO, PRECIO, CANTIDAD_DISPOSITIVOS, IMPUESTOS, DESCUENTOS, TOTAL_PEDIDO, FECHA_ENTREGA) VALUES (";
                    newSellerOrder += "'" + newOrderId + "', '" + clientId + "', '" + sellerId + "', TO_DATE('"
                            + currentDate
                            + "', 'YYYY-MM-DD HH24:MI:SS'), '" + price + "', '"
                            + orders.getJSONObject(i).getInt("quantity")
                            + "', '" + taxes + "', '" + discounts + "', '" + total + "', NULL)";
                    stmt.executeUpdate(newSellerOrder);
                    con.commit();

                    int newDeviceXOrderId = 1;
                    String getNewDeviceXOrderIdQuery = "SELECT COUNT(*) AS total FROM " + schema + "." + sellerName
                            + "_dispositivos_x_pedidos_futuros";
                    rs = stmt.executeQuery(getNewDeviceXOrderIdQuery);

                    if (rs.next()) {
                        newDeviceXOrderId = rs.getInt("total") + 1;
                    }

                    String newDeviceXOrder = "INSERT INTO " + schema + "." + sellerName
                            + "_dispositivos_x_pedidos_futuros (ID_DISPOSITIVO_X_PEDIDO, ID_PEDIDO, ID_DISPOSITIVO, CANTIDAD_DISPOSITIVOS, ENTREGADO) VALUES ";
                    newDeviceXOrder += "('" + newDeviceXOrderId + "', '" + newOrderId + "', '"
                            + orders.getJSONObject(i).getString("deviceId") + "', '"
                            + orders.getJSONObject(i).getInt("quantity") + "', 'False')";
                    stmt.executeUpdate(newDeviceXOrder);
                    con.commit();
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
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

                boolean factoriesOrderSuccessful = postNewClientOrderResponseJson.getBoolean("success");

                // If the order was successfully posted to the web server and to the factories
                // backend, then register the estimated delivery date
                if (factoriesOrderSuccessful) {
                    JSONObject responseData = postNewClientOrderResponseJson.getJSONObject("data");
                    String deliveryDate = responseData.getString("maxDeliveryDate").replace("T", " ");
                    deliveryDate = deliveryDate.substring(0, deliveryDate.length() - 5);

                    // Iterate through the orderIds array and update each order with the estimated
                    // delivery date
                    for (int i = 0; i < orderIds.length; i++) {
                        try {
                            Class.forName("oracle.jdbc.driver.OracleDriver");
                            Connection con = DriverManager.getConnection(conUrl, user, password);
                            con.setAutoCommit(false);
                            Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                    ResultSet.CONCUR_READ_ONLY);
                            String updateOrderDeliveryDate = "UPDATE " + schema + "." + sellerNames[i]
                                    + "_pedidos_futuros SET FECHA_ENTREGA = TO_DATE('" + deliveryDate
                                    + "', 'YYYY-MM-DD HH24:MI:SS') WHERE ID_PEDIDO = '" + orderIds[i] + "'";
                            stmt.executeUpdate(updateOrderDeliveryDate);
                            con.commit();
                        } catch (Exception e) {
                            helper.printErrorMessage(out, e);
                        }
                    }
                }

                out.println(postNewClientOrderResponseJson.toString());
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

                    // Get the client's orders as a join between de _dispositivos,
                    // _dispositivos_x_pedidos_futuros and _pedidos_futuros tables of each seller
                    // and as a union of all
                    String clientOrdersQuery = "";
                    for (int i = 0; i < sellers.size(); i++) {
                        String sellerName = sellers.get(i).replaceAll(" ", "_");

                        clientOrdersQuery += "SELECT ddpf.id_dispositivo, ddpf.id_vendedor, ddpf.nombre, ddpf.descripcion, ddpf.precio, ddpf.codigo_modelo, ddpf.color, ddpf.categoria, ddpf.tiempo_garantia, ddpf.id_pedido, ddpf.cantidad_dispositivos, ddpf.entregado, pf.fecha_pedido, pf.cantidad_dispositivos dispositivos_totales, pf.impuestos, pf.descuentos, pf.total_pedido, pf.fecha_entrega FROM ";
                        clientOrdersQuery += sellerName
                                + "_pedidos_futuros pf, (SELECT dpf.id_dispositivo, d.id_vendedor, d.nombre, d.descripcion, d.precio, d.codigo_modelo, d.color, d.categoria, d.tiempo_garantia, dpf.id_pedido, dpf.cantidad_dispositivos, dpf.entregado FROM ";
                        clientOrdersQuery += sellerName + "_dispositivos d, " + sellerName
                                + "_dispositivos_x_pedidos_futuros dpf WHERE d.id_dispositivo = dpf.id_dispositivo) ddpf WHERE pf.id_pedido = ddpf.id_pedido AND pf.id_cliente = '"
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
                    String prevOrderDate = "";
                    String currentOrderDate = "";
                    boolean firstDevice = true;
                    String[] deviceAttrs = { "id_dispositivo", "id_vendedor", "nombre", "descripcion", "precio",
                            "codigo_modelo", "color", "categoria", "tiempo_garantia", "id_pedido",
                            "cantidad_dispositivos", "entregado", "fecha_pedido", "dispositivos_totales", "impuestos",
                            "descuentos", "total_pedido", "fecha_entrega" };
                    String[] deviceAttrsTypes = { "VARCHAR2", "INTEGER", "VARCHAR2", "VARCHAR2", "FLOAT",
                            "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER", "INTEGER",
                            "INTEGER", "BOOLEAN", "DATE", "INTEGER", "FLOAT",
                            "FLOAT", "FLOAT", "DATE" };

                    // Iterate through the results and add the devices to the order
                    while (rs.next()) {
                        currentOrderDate = rs.getString("fecha_pedido");
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
                            prevOrderDate = currentOrderDate;
                            currentOrderDevices.put(currentDevice);
                        } else {
                            if (currentOrderDate.equals(prevOrderDate)) {
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
                                prevOrderDate = currentOrderDate;
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
            String deviceId = body.getString("deviceId");
            int quantity = body.getInt("quantity");
            String estimatedDeliveryDate = body.getString("estimatedDeliveryDate").replace("T", " ");
            estimatedDeliveryDate = estimatedDeliveryDate.substring(0, estimatedDeliveryDate.length() - 5);

            try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con = DriverManager.getConnection(conUrl, user, password);
                con.setAutoCommit(false);
                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                        ResultSet.CONCUR_READ_ONLY);

                // Get the seller's id from the seller's name
                String getSellerIdQuery = "SELECT id_vendedor FROM " + schema + ".vendedores WHERE nombre = '"
                        + sellerName + "'";
                ResultSet sellerIdRS = stmt.executeQuery(getSellerIdQuery);
                int sellerId = 0;

                if (sellerIdRS.next()) {
                    sellerId = sellerIdRS.getInt("id_vendedor");
                }

                // Get the id of the order from the join of the _pedidos_futuros and
                // _dispositivos_x_pedidos_futuros tables where the device id and quantity match
                // and the estimated delivery date is less than the fecha_entrega column
                String getOrderIdQuery = "SELECT pf.id_pedido FROM " + schema + "." + sellerNameNoSpaces
                        + "_pedidos_futuros pf, "
                        + schema + "." + sellerNameNoSpaces
                        + "_dispositivos_x_pedidos_futuros dpf WHERE pf.id_pedido = dpf.id_pedido "
                        + "AND dpf.id_dispositivo = '" + deviceId + "' AND dpf.cantidad_dispositivos = " + quantity
                        + " AND id_vendedor = " + sellerId
                        + " AND TO_DATE('" + estimatedDeliveryDate + "', 'yyyy-MM-dd HH24:MI:SS') <= pf.fecha_entrega";
                ResultSet orderIdRS = stmt.executeQuery(getOrderIdQuery);
                int orderId = 0;

                if (orderIdRS.next()) {
                    orderId = orderIdRS.getInt("id_pedido");
                }

                // Set the device as delivered on the _dispositivos_x_pedidos_futuros table
                String setDeviceAsDeliveredQuery = "UPDATE " + schema + "." + sellerNameNoSpaces
                        + "_dispositivos_x_pedidos_futuros SET entregado = 'True' WHERE id_pedido = " + orderId
                        + " AND id_dispositivo = '" + deviceId + "'";
                stmt.executeUpdate(setDeviceAsDeliveredQuery);
                con.commit();

                JSONObject jsonResponse = new JSONObject();
                jsonResponse.put("success", true);
                jsonResponse.put("message", "El pedido ha sido entregado correctamente.");

                con.close();
                out.print(jsonResponse.toString());
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
