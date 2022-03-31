import java.sql.*;
import java.util.ArrayList;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

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

    // Servlet initialization
    public void init() throws ServletException {
        conUrl = "jdbc:oracle:thin:@localhost:1521/XEPDB1";
        user = "Sales";
        password = "adminsales";
        localhostIp = "localhost";
        schema = "Sales";
        helper = new ServletHelper();
    }

    // ========================= Helper Methods =========================
    private void setSchema(String seller) {
        sqlSchema = new SqlSchema(conUrl, user, password, localhostIp, schema,
                new String[] { seller + "_dispositivos", seller + "_fotos_dispositivos", seller + "_ventas", seller + "_pagos", seller + "_pedidos_futuros", seller + "_dispositivos_x_ventas", seller + "_dispositivos_x_pedidos_futuros" },
                new String[] { "id_dispositivo", "id_foto", "id_venta", "id_pago", "id_pedido", "id_dispositivo_x_venta", "id_dispositivo_x_pedido" },
                new String[] { null, null, null, null, null, null, null },
                new String[][] {
                        { "id_dispositivo", "id_vendedor", "id_marca", "nombre", "descripcion", "existencias", "precio", "codigo_modelo", "color", "categoria", "tiempo_garantia" },
                        { "id_foto", "id_dispositivo", "foto" },
                        { "id_venta", "id_cliente", "id_vendedor", "fecha_venta", "precios_venta", "cantidad_dispositivos", "impuestos", "descuentos", "total_venta" },
                        { "id_pago", "id_venta", "id_cliente", "id_vendedor", "fecha_pago", "total" },
                        { "id_pedido", "id_cliente", "id_vendedor", "fecha_pedido", "precio_pedido", "cantidad_dispositivos", "impuestos", "descuentos", "total_pedido" },
                        { "id_dispositivo_x_venta", "id_venta", "id_dispositivo", "cantidad_dispositivos" },
                        { "id_dispositivo_x_pedido", "id_pedido", "id_dispositivo", "cantidad_dispositivos" },
                },
                new String[][] {
                        { "INTEGER", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER" },
                        { "INTEGER", "INTEGER", "VARCHAR" },
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
                if (currentDevice.getInt("id_dispositivo") == newDevice.getInt("id_dispositivo")
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
     * Format a string of purchases, joining each individual purchase made on the same date and time
     * 
     * @param devices the devices to format
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
                            devicesQuery += "SELECT d.*, f.foto FROM (SELECT * FROM " + (sellers.get(i)).replace(" ", "_") + "_dispositivos WHERE ";
                            
                            for (int j = 0; j < setFields.size(); j++) {
                                devicesQuery += setFields.get(j);
                                if (j < setFields.size() - 1) {
                                    devicesQuery += " OR ";
                                }
                            }

                            devicesQuery += ") d INNER JOIN " + (sellers.get(i)).replace(" ", "_") + "_fotos_dispositivos f ON d.id_dispositivo = f.id_dispositivo";

                            if (i < sellers.size() - 1) {
                                devicesQuery += " UNION ALL ";
                            }
                        }

                        devicesQuery += ") df INNER JOIN vendedores v ON df.id_vendedor = v.id_vendedor INNER JOIN marcas m ON df.id_marca = m.id_marca";
                        ResultSet rs2 = stmt.executeQuery(devicesQuery);
                        String jsonString = "{\"success\":true,\"dispositivos\":[";

                        if (rs2.next()) {
                            rs2.previous();

                            String[] attrs = { "id_dispositivo", "id_vendedor",
                            "id_marca", "nombre", "descripcion", "existencias",
                            "precio", "codigo_modelo", "color", "categoria",
                            "tiempo_garantia", "foto", "vendedor", "marca" };
                            String[] types = { "INTEGER", "INTEGER", "INTEGER",
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
                        devicesQuery = "SELECT * FROM " + sellers.get(0) + "_dispositivos WHERE ";
                        
                        for (int i = 0; i < setFields.size(); i++) {
                            devicesQuery += setFields.get(i);
                            if (i < setFields.size() - 1) {
                                devicesQuery += " AND ";
                            }
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
                    "codigo_modelo", "color", "categoria", "tiempo_garantia", "id_marca"};
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
                            devicesQuery += "SELECT d.*, f.foto FROM (SELECT * FROM " + (sellers.get(i)).replace(" ", "_") + "_dispositivos WHERE ";
                            
                            for (int j = 0; j < setFields.size(); j++) {
                                devicesQuery += setFields.get(j);
                                if (j < setFields.size() - 1) {
                                    devicesQuery += " AND ";
                                }
                            }

                            devicesQuery += ") d INNER JOIN " + (sellers.get(i)).replace(" ", "_") + "_fotos_dispositivos f ON d.id_dispositivo = f.id_dispositivo";

                            if (i < sellers.size() - 1) {
                                devicesQuery += " UNION ALL ";
                            }
                        }

                        devicesQuery += ") df INNER JOIN vendedores v ON df.id_vendedor = v.id_vendedor INNER JOIN marcas m ON df.id_marca = m.id_marca";
                        ResultSet rs2 = stmt.executeQuery(devicesQuery);
                        String jsonString = "{\"success\":true,\"dispositivos\":[";

                        if (rs2.next()) {
                            rs2.previous();

                            String[] attrs = { "id_dispositivo", "id_vendedor",
                            "id_marca", "nombre", "descripcion", "existencias",
                            "precio", "codigo_modelo", "color", "categoria",
                            "tiempo_garantia", "foto", "vendedor", "marca" };
                            String[] types = { "INTEGER", "INTEGER", "INTEGER",
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
                        devicesQuery = "SELECT * FROM " + sellers.get(0) + "_dispositivos WHERE ";
                        
                        for (int i = 0; i < setFields.size(); i++) {
                            devicesQuery += setFields.get(i);
                            if (i < setFields.size() - 1) {
                                devicesQuery += " AND ";
                            }
                        }
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "There are no sellers in the database.");
                }
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
                            + "_fotos_dispositivos f WHERE d.id_dispositivo = f.id_dispositivo AND d.id_dispositivo = "
                            + dispositivoId + ") df "
                            + "INNER JOIN vendedores v ON df.id_vendedor = v.id_vendedor INNER JOIN marcas m on df.id_marca = m.id_marca";
                    ResultSet rs = stmt.executeQuery(deviceQuery);

                    if (rs.next()) {
                        rs.previous();

                        String[] devicesAttrs = { "id_dispositivo", "nombre", "descripcion", "existencias", "precio",
                                "codigo_modelo", "color", "categoria", "tiempo_garantia", "vendedor", "marca", "foto" };
                        String[] devicesTypes = { "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2",
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
                    String getDevicesQuery = "SELECT * FROM " + schema + ".all_devices";
                    ResultSet rs = stmt.executeQuery(getDevicesQuery);
                    String[] devicesAttrs = { "id_dispositivo", "nombre", "descripcion", "existencias", "precio",
                            "codigo_modelo", "color", "categoria", "tiempo_garantia", "vendedor", "marca", "foto" };
                    String[] devicesTypes = { "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2",
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
    
                        if (sellers.size() > 1) {
                            for (int i = 0; i < sellers.size(); i++) {
                                salesQuery += "SELECT v.id_venta, v.id_cliente, dv.id_vendedor, v.fecha_venta, v.precios_venta, v.cantidad_dispositivos dispositivos_totales, v.impuestos, v.descuentos, v.total_venta, dv.id_dispositivo, dv.id_marca, dv.nombre, dv.descripcion, dv.existencias, dv.precio, dv.codigo_modelo, dv.color, dv.categoria, dv.tiempo_garantia, dv.cantidad_dispositivos dispositivos_adquiridos FROM " + sellers.get(i).replace(" ", "_") + "_ventas v, (SELECT d.*, dv.id_venta, dv.cantidad_dispositivos from " + sellers.get(i).replace(" ", "_") + "_dispositivos d, " + sellers.get(i).replace(" ", "_") + "_dispositivos_x_ventas dv WHERE d.id_dispositivo = dv.id_dispositivo) dv WHERE v.id_venta = dv.id_venta";
    
                                if (i < sellers.size() - 1) {
                                    salesQuery += " UNION ALL ";
                                }
                            }
    
                            salesQuery += ") s WHERE s.id_cliente = " + clientId + " ORDER BY s.fecha_venta ASC, s.id_venta ASC";
                            ResultSet rs2 = stmt.executeQuery(salesQuery);
                            String jsonString = "{\"success\":true,\"compras\":[";
    
                            if (rs2.next()) {
                                rs2.previous();
    
                                String[] attrs = { "id_venta", "id_cliente", "id_vendedor", "fecha_venta", "precios_venta",
                                        "dispositivos_totales", "impuestos", "descuentos", "total_venta", "id_dispositivo",
                                        "id_marca", "nombre", "descripcion", "existencias", "precio", "codigo_modelo",
                                        "color", "categoria", "tiempo_garantia", "dispositivos_adquiridos" };
                                String[] types = { "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT", "INTEGER", "FLOAT",
                                        "FLOAT", "FLOAT", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER",
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
                            salesQuery += "SELECT * FROM (";
                            salesQuery += "SELECT v.id_venta, v.id_cliente, dv.id_vendedor, v.fecha_venta, v.precios_venta, v.cantidad_dispositivos dispositivos_totales, v.impuestos, v.descuentos, v.total_venta, dv.id_dispositivo, dv.id_marca, dv.nombre, dv.descripcion, dv.existencias, dv.precio, dv.codigo_modelo, dv.color, dv.categoria, dv.tiempo_garantia, dv.cantidad_dispositivos dispositivos_adquiridos FROM " + sellers.get(0).replace(" ", "_") + "_ventas v, (SELECT d.*, dv.id_venta, dv.cantidad_dispositivos from " + sellers.get(0).replace(" ", "_") + "_dispositivos d, " + sellers.get(0).replace(" ", "_") + "_dispositivos_x_ventas dv WHERE d.id_dispositivo = dv.id_dispositivo) dv WHERE v.id_venta = dv.id_venta";
                            salesQuery += ") s WHERE s.id_cliente = " + clientId;
                        }
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "There are no sellers in the database.");
                    }
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
