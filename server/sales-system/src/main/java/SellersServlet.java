import java.sql.*;

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
                        { "id_venta", "id_cliente", "id_vendedor", "id_dispositivo", "fecha_venta", "precio_venta", "cantidad_dispositivos", "impuestos", "descuentos", "total_venta" },
                        { "id_pago", "id_venta", "id_cliente", "id_vendedor", "fecha_pago", "total" },
                        { "id_pedido", "id_cliente", "id_vendedor", "fecha_pedido", "precio_pedido", "cantidad_dispositivos", "impuestos", "descuentos", "total_pedido" },
                        { "id_dispositivo_x_venta", "id_venta", "id_dispositivo", "cantidad_dispositivos" },
                        { "id_dispositivo_x_pedido", "id_pedido", "id_dispositivo", "cantidad_dispositivos" },
                },
                new String[][] {
                        { "INTEGER", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "INTEGER", "FLOAT", "VARCHAR2", "VARCHAR2", "VARCHAR2", "INTEGER" },
                        { "INTEGER", "INTEGER", "BLOB" },
                        { "INTEGER", "INTEGER", "INTEGER", "INTEGER", "DATE", "FLOAT", "INTEGER", "FLOAT", "FLOAT", "FLOAT" },
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
                        cs.setString(1, vendedor);
                        cs.execute();

                        int sellerId = -1;
                        String getSellerIdQuery = "SELECT id_vendedor FROM " + schema
                                + ".vendedores WHERE UPPER(nombre) = UPPER('"
                                + vendedor + "')";
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
            String vendedor = request.getParameter("seller").replace(" ", "_");
            setSchema(vendedor);
            sqlSchema.handlePost(request, response);
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
                String vendedor = request.getParameter("seller").replace(" ", "_");
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
            String vendedor = request.getParameter("seller").replace(" ", "_");
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
            String vendedor = request.getParameter("seller").replace(" ", "_");
            setSchema(vendedor);
            sqlSchema.handleDelete(request, response);
        } else {
            helper.printJsonMessage(out, false, "error",
                    "The request does not contain the required parameters.");
        }
    }
}
