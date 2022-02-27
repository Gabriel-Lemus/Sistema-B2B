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

    private void printAttributeValue(ResultSet rs, Integer index, PrintWriter out) throws SQLException {
        if (rs.getObject(attributes[index]) == null) {
            // Null attribute
            out.print("" + null + "");
        } else {
            // Non-null attribute
            switch (types[index]) {
                case "INTEGER":
                    out.print(rs.getInt(attributes[index]));
                    break;
                case "FLOAT":
                    out.print(rs.getFloat(attributes[index]));
                    break;
                case "BOOLEAN":
                    out.print(rs.getBoolean(attributes[index]));
                    break;
                default:
                    out.print("\"" + rs.getString(attributes[index]) + "\"");
                    break;
            }
        }
    }

    private int getQueryRowCount(Connection con, String query) throws SQLException {
        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                ResultSet.CONCUR_READ_ONLY);
        ResultSet rowCount = stmt.executeQuery("SELECT COUNT(*) AS TOTAL FROM (" + query + ")");
        rowCount.next();
        int totalRows = rowCount.getInt("TOTAL");
        rowCount.close();

        return totalRows;
    }

    private void printErrorMessage(PrintWriter out, Exception e) {
        out.print("{\"success\":" + false + ",\"error\":" + "\""
                + e.getMessage().replace("\n", "").replace("\r", "") + "\"}");
    }

    private String getSelectQuery() {
        return "SELECT * FROM " + schema + "." + tableName;
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

    private String getSelectOffsetQuery(int offset) {
        return "SELECT * FROM " + schema + "." + tableName + " ORDER BY " + primaryKey + " ASC OFFSET " + offset
                + " ROWS FETCH NEXT " + maxRows + " ROWS ONLY";
    }

    private void printRows(ResultSet rs, PrintWriter out) throws SQLException {
        out.print("{");

        for (int i = 0; i < attributes.length; i++) {
            out.print("\"" + attributes[i] + "\":");
            printAttributeValue(rs, i, out);

            if (i < attributes.length - 1) {
                out.print(",");
            }
        }

        out.print("}");
    }

    private String getUpdateQuery(JSONObject json, int item) {
        String updateQuery = "UPDATE " + schema + "." + tableName + " SET ";

        for (int i = 0; i < attributes.length; i++) {
            updateQuery += attributes[i] + " = "
                    + (nullableAttributes[i] && json.isNull(attributes[i]) ? "''"
                            : (getJsonAttrString(json, i)))
                    + getNeccessaryComma(i, attributes.length);
        }

        updateQuery += " WHERE " + primaryKey + " = " + item;

        return updateQuery;
    }

    private String getDeleteQuery(int item) {
        return "DELETE FROM " + schema + "." + tableName + " WHERE " + primaryKey + " = " + item;
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

    // Read
    protected void get(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Check if there are any parameters
        if (request.getParameterMap().size() == 0) {
            // Display all entries below or equal to the max rows limit
            try {
                Class.forName("oracle.jdbc.driver.OracleDriver");
                Connection con = DriverManager.getConnection(conUrl, user, password);
                Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
                String query = getSelectOffsetQuery(0);
                int rowCount = getQueryRowCount(con, query);
                ResultSet rs = stmt.executeQuery(query);

                out.print("{\"success\":" + true + ",\"rowCount\":" + rowCount + ",\"data\":[");

                while (rs.next()) {
                    printRows(rs, out);

                    if (rs.isLast()) {
                        if (rowCount < maxRows) {
                            out.print("]}");
                        } else {
                            out.print("],\"nextPage\":\"http://" + localhostIp
                                    + ":8080/sales-system/" + servletUrl +  "?page=2\"}");
                        }
                    } else {
                        out.print(",");
                    }
                }

                con.close();
            } catch (Exception e) {
                printErrorMessage(out, e);
            }
        } else {
            // Check if the page parameter is set
            if (request.getParameterMap().containsKey("page")) {
                String pageParam = request.getParameter("page");

                // Check if the page parameter can be parsed to an integer
                if (isNumeric(pageParam)) {
                    int page = Integer.parseInt(request.getParameter("page"));

                    // Check if the page is valid
                    if (page < 1) {
                        printJsonMessage(out, false, "error",
                                "The page number is invalid. Please provide a positive, non-zero number.");
                    } else {
                        try {
                            Class.forName("oracle.jdbc.driver.OracleDriver");
                            Connection con = DriverManager.getConnection(conUrl, user, password);
                            Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                    ResultSet.CONCUR_READ_ONLY);
                            String query = getSelectOffsetQuery((page - 1) * maxRows);
                            int rowCount = getQueryRowCount(con, query);
                            String maxCountQuery = getSelectQuery();
                            int maxRowCount = getQueryRowCount(con, maxCountQuery);
                            ResultSet rs = stmt.executeQuery(query);

                            if (rowCount == maxRows) {
                                out.print("{\"success\":" + true + ",\"rowCount\":" + rowCount + ",\"data\":[");

                                while (rs.next()) {
                                    printRows(rs, out);

                                    if (rs.isLast()) {
                                        if ((page - 1) * maxRows != maxRowCount - 1 && page - 1 != 0) {
                                            out.print(
                                                    "],\"previousPage\":\"http://" + localhostIp
                                                            + ":8080/sales-system/" + servletUrl +  "?page="
                                                            + (page - 1)
                                                            + "\",\"nextPage\":\"http://" + localhostIp
                                                            + ":8080/sales-system/" + servletUrl +  "?page="
                                                            + (page + 1)
                                                            + "\"}");
                                        } else {
                                            out.print(
                                                    "],\"nextPage\":\"http://" + localhostIp
                                                            + ":8080/sales-system/" + servletUrl +  "?page="
                                                            + (page + 1)
                                                            + "\"}");
                                        }
                                    } else {
                                        out.print(",");
                                    }
                                }
                            } else if (rowCount < maxRows && rowCount != 0) {
                                out.print("{\"success\":" + true + ",\"rowCount\":" + rowCount + ",\"data\":[");

                                while (rs.next()) {
                                    printRows(rs, out);

                                    if (rs.isLast()) {
                                        if (page != 1 && rowCount <= maxRows) {
                                            out.print(
                                                    "],\"previousPage\":\"http://" + localhostIp
                                                            + ":8080/sales-system/" + servletUrl +  "?page="
                                                            + (page - 1)
                                                            + "\"}");
                                        } else {
                                            out.print("]}");
                                        }
                                    } else {
                                        out.print(",");
                                    }
                                }
                            } else {
                                printJsonMessage(out, false, "error",
                                        "Invalid page number. No data corresponds to this page.");
                            }

                            con.close();
                        } catch (Exception e) {
                            printErrorMessage(out, e);
                        }
                    }
                } else {
                    printJsonMessage(out, false, "error",
                            "Invalid page parameter. Please provide a positive, non-zero number.");
                }
            } else if (request.getParameterMap().containsKey("id")
                    || request.getParameterMap().containsKey(primaryKey)) {
                // Correct parameter set
                String id;
                if (request.getParameterMap().containsKey("id")) {
                    id = request.getParameter("id");
                } else {
                    id = request.getParameter(primaryKey);
                }

                // Check if the id is empty
                if (id.length() > 0) {
                    // Check if the id is numeric
                    if (isNumeric(id)) {
                        // Valid id
                        int itemId = Integer.parseInt(id);
                        try {
                            Class.forName("oracle.jdbc.driver.OracleDriver");
                            Connection con = DriverManager.getConnection(conUrl, user, password);
                            Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                    ResultSet.CONCUR_READ_ONLY);
                            ResultSet rs = stmt.executeQuery(getCheckRowQuery(itemId));

                            // Check if the entry exists
                            if (rs.next()) {
                                // Entry exists
                                out.print("{\"success\":" + true + ",\"data\":");
                                printRows(rs, out);
                                out.print("}");
                            } else {
                                // The entry with the given ID does not exist
                                printJsonMessage(out, false, "error",
                                        "The entry with the id " + itemId + " does not exist.");
                            }
                        } catch (Exception e) {
                            printErrorMessage(out, e);
                        }
                    } else {
                        printJsonMessage(out, false, "error",
                                "The given id is not a number. Please provide a numeric id.");
                    }
                } else {
                    // Empty id
                    printJsonMessage(out, false, "error",
                            "The id you set is empty. Please provide one.");
                }
            } else {
                // Incorrect parameter set
                printJsonMessage(out, false, "error",
                        "An incorrect parameter was set. The valid parameters are 'id' or '" + primaryKey
                                + "', to search an entry by its id; or 'page', to see a set of entries in groups of "
                                + maxRows + ".");
            }
        }
    }

    // Update
    protected void put(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Check if the id parameter is set
        if (request.getParameterMap().containsKey("id") || request.getParameterMap().containsKey(primaryKey)) {
            // Correct parameter set
            String id = request.getParameter("id");

            if (id == "" || id == null) {
                id = request.getParameter(primaryKey);
            }

            // Check if the id is empty
            if (id.length() > 0) {
                // Check if the id is numeric
                if (isNumeric(id)) {
                    // Valid id
                    int itemId = Integer.parseInt(id);

                    try {
                        Class.forName("oracle.jdbc.driver.OracleDriver");
                        Connection con = DriverManager.getConnection(conUrl, user, password);
                        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                ResultSet.CONCUR_READ_ONLY);
                        ResultSet rs = stmt.executeQuery(getCheckRowQuery(itemId));

                        if (rs.next()) {
                            // Entry exists
                            JSONObject oldData = new JSONObject();

                            // Get the old data
                            for (int i = 0; i < attributes.length; i++) {
                                oldData.put(attributes[i], (types[i] == "INTEGER" ? rs.getInt(attributes[i])
                                        : types[i] == "FLOAT" ? rs.getFloat(attributes[i])
                                                : types[i] == "BOOLEAN" ? rs.getBoolean(attributes[i])
                                                        : rs.getString(attributes[i])));
                            }

                            String body = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
                            JSONObject newData = new JSONObject(body);

                            if (newData.has("id")) {
                                newData.remove("id");
                            }

                            if (newData.has(primaryKey)) {
                                newData.remove(primaryKey);
                            }

                            // Check if the new data is valid
                            for (int i = 0; i < attributes.length; i++) {
                                if (!newData.has(attributes[i])) {
                                    newData.put(attributes[i], (types[i] == "INTEGER" ? oldData.getInt(attributes[i])
                                            : types[i] == "FLOAT" ? oldData.getFloat(attributes[i])
                                                    : types[i] == "BOOLEAN" ? oldData.getBoolean(attributes[i])
                                                            : oldData.getString(attributes[i])));
                                }
                            }

                            // Update the data
                            String updateQuery = getUpdateQuery(newData, itemId);
                            stmt.executeUpdate(updateQuery);

                            out.print(
                                    "{\"success\":" + true + ",\"message\":\"The data of the entry with id " + itemId
                                            + " has been updated.\",\"dataAdded:\"" + body.toString() + "\"}");
                        } else {
                            printJsonMessage(out, false, "error",
                                    "The entry with the id " + id + " does not exist.");
                        }
                    } catch (Exception e) {
                        printErrorMessage(out, e);
                    }
                } else {
                    printJsonMessage(out, false, "error",
                            "The given id is not a number. Please provide a numeric id.");
                }
            } else {
                printJsonMessage(out, false, "error", "The id you set is empty. Please provide one.");
            }
        } else {
            printJsonMessage(out, false, "error",
                    "Incorrect parameter set. The valid parameters are 'id' or '" + primaryKey
                            + "', to update the entry's data by its id.");
        }
    }

    // Delete
    protected void delete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Check parameters
        if (request.getParameterMap().containsKey("id") || request.getParameterMap().containsKey(primaryKey)) {
            String id = request.getParameter("id");

            if (id == "" || id == null) {
                id = request.getParameter(primaryKey);
            }

            // Check if the id is empty
            if (id.length() > 0) {
                // Check if the id is numeric
                if (isNumeric(id)) {
                    // Valid id
                    int itemId = Integer.parseInt(id);

                    try {
                        Class.forName("oracle.jdbc.driver.OracleDriver");
                        Connection con = DriverManager.getConnection(conUrl, user, password);
                        Statement stmt = con.createStatement();
                        String entryCheckQuery = getCheckRowQuery(itemId);
                        ResultSet rs = stmt.executeQuery(entryCheckQuery);

                        if (rs.next()) {
                            // Entry exists
                            String deleteEntry = getDeleteQuery(itemId);
                            stmt.executeUpdate(deleteEntry);
                            printJsonMessage(out, true, "success", "Entry data deleted.");
                        } else {
                            // Entry does not exist
                            printJsonMessage(out, false, "error",
                                    "The entry with the given id does not exist.");
                        }
                    } catch (Exception e) {
                        printErrorMessage(out, e);
                    }
                } else {
                    printJsonMessage(out, false, "error",
                            "The given id is not a number. Please provide a numeric id.");
                }
            } else {
                printJsonMessage(out, false, "error", "The id you set is empty. Please provide one.");
            }
        } else {
            printJsonMessage(out, false, "error",
                    "Incorrect parameter set. The valid parameters are 'id' or '" + primaryKey
                            + "', to delete the entry's data by its id.");
        }
    }
}
