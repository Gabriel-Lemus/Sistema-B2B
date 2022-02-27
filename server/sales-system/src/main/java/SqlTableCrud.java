import java.sql.*;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

public class SqlTableCrud {
    // Attributes
    private String conUrl;
    private String user;
    private String password;
    private String localhostIp;
    private String servletUrl;
    private String schema;
    private String tableName;
    private String primaryKey;
    private String[] attributes;
    private String[] types;
    private boolean[] nullableAttributes;
    private int maxRows;

    // Constructor
    public SqlTableCrud(String conUrl, String user, String password,
            String localhostIp, String servletUrl, String schema,
            String tableName, String primaryKey, String[] attributes,
            String[] types, boolean[] nullableAttributes, int maxRows) {
        super();

        this.conUrl = conUrl;
        this.user = user;
        this.password = password;
        this.localhostIp = localhostIp;
        this.servletUrl = servletUrl;
        this.schema = schema;
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.attributes = attributes;
        this.types = types;
        this.nullableAttributes = nullableAttributes;
        this.maxRows = maxRows;
    }

    // ========================= Helper Methods =========================

    private boolean isNumeric(String str) {
        return str.matches("-?\\d+(\\.\\d+)?");
    }

    private void printErrorMessage(PrintWriter out, Exception e) {
        out.print("{\"success\":" + false + ",\"error\":" + "\""
                + e.getMessage().replace("\n", "").replace("\r", "") + "\"}");
    }

    private String getCheckRowQuery(int item) {
        return "SELECT * FROM " + schema + "." + tableName + " WHERE " + primaryKey + " = " + item;
    }

    private String getNeccessaryComma(int i, int length) {
        return i < length - 1 ? "," : "";
    }

    private boolean checkIfJsonContainsAttributes(JSONObject json, String[] attribute) {
        for (String attr : attribute) {
            if (!json.has(attr)) {
                return false;
            }
        }
        return true;
    }

    private String getJsonAttrString(JSONObject json, int index) {
        switch (types[index]) {
            case "INTEGER":
                return "'" + json.getInt(attributes[index]) + "'";
            case "FLOAT":
                return "'" + json.getDouble(attributes[index]) + "'";
            case "BOOLEAN":
                return "'" + json.getBoolean(attributes[index]) + "'";
            case "DATE":
                return "TO_DATE('" + json.getString(attributes[index]) + "', 'YYYY-MM-DD')";
            default:
                return "'" + json.getString(attributes[index]) + "'";
        }
    }

    private String getInsertQuery(JSONObject json) {
        String query = "INSERT INTO " + schema + "." + tableName + " (";

        for (int i = 0; i < attributes.length; i++) {
            query += attributes[i] + getNeccessaryComma(i, attributes.length);
        }

        query += ") VALUES (";

        for (int i = 0; i < attributes.length; i++) {
            query += (nullableAttributes[i] && json.isNull(attributes[i]) ? "''"
                    : "" + (getJsonAttrString(json, i)) + "")
                    + getNeccessaryComma(i, attributes.length);
        }

        query += ")";

        return query;
    }

    private void printJsonMessage(PrintWriter out, boolean success, String msgName, String error) {
        out.print("{\"success\":" + success + ",\"" + msgName + "\":" + "\"" + error + "\"}");
    }

    // ========================= CRUD Methods =========================
    // Create
    protected void post(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Check if the id parameter is set
        if (request.getParameterMap().containsKey("id") || request.getParameterMap().containsKey(primaryKey)) {
            // Get the id of the request
            String id = request.getParameter("id");

            if (id == "" || id == null) {
                id = request.getParameter(primaryKey);
            }

            // Check if the id is numeric and is positive
            if (isNumeric(id) && Integer.parseInt(id) > 0) {
                int itemId = Integer.parseInt(id);

                // Get the body of the request
                String body = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);

                // Check if the body is empty
                if (body.length() > 0) {
                    // Get body as JSON object
                    JSONObject json = new JSONObject(body);
                    json.put(primaryKey, itemId);

                    // Check if all the attributes are set
                    if (checkIfJsonContainsAttributes(json, attributes)) {
                        try {
                            // Establish the connection to the DB and prepare the statement
                            Class.forName("oracle.jdbc.driver.OracleDriver");
                            Connection con = DriverManager.getConnection(conUrl, user, password);
                            String entryCheckQuery = getCheckRowQuery(itemId);
                            String query = getInsertQuery(json);

                            // Check if the entry already exists
                            Statement checkStmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                    ResultSet.CONCUR_READ_ONLY);
                            ResultSet rs = checkStmt.executeQuery(entryCheckQuery);

                            if (rs.next()) {
                                // Entry already exists; cannot be inserted
                                printJsonMessage(out, false, "error",
                                        "An entry with the id " + id + " already exists.");
                            } else {
                                // Entry does not exist
                                Statement stmt = con.createStatement();

                                // Execute the query and close the connection
                                stmt.executeUpdate(query);
                                stmt.close();
                                con.close();

                                out.print("{\"success\":" + true + ",\"message\":\"Row data entry with id " + id
                                        + " created.\",\"dataAdded\":" + json.toString() + "}");
                            }
                        } catch (Exception e) {
                            printErrorMessage(out, e);
                        }
                    } else {
                        printJsonMessage(out, false, "error",
                                "There are missing attributes. Please make sure to add all of the attributes of the entry.");
                    }
                } else {
                    printJsonMessage(out, false, "error",
                            "The body of the request is empty. Please set the attributes of the entry.");
                }
            } else {
                printJsonMessage(out, false, "error",
                        "The id provided is not a number or is a negative number or zero. Please provide a positive number as the id.");
            }
        } else {
            printJsonMessage(out, false, "error",
                    "The entry id is not set. Please set the paramter 'id' or '" + primaryKey
                            + "' to add the new entry's data.");
        }
    }
}
