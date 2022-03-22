import java.sql.*;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

/**
 * This class represents a table from the Oracle database. It is used to
 * create, read, update, and delete records from the table.
 */
public class SqlTableCrud {
    // Attributes
    private String conUrl;
    private String user;
    private String password;
    private String localhostIp;
    private String schema;
    private String tableName;
    private String primaryKey;
    private String[] attributes;
    private String[] types;
    private boolean[] nullableAttributes;
    private String nonRepeatableField;
    private int maxRows;
    private ServletHelper helper;

    // Constructor
    public SqlTableCrud(String conUrl, String user, String password,
            String localhostIp, String schema, String tableName,
            String primaryKey, String[] attributes, String[] types,
            boolean[] nullableAttributes, String nonRepeatableField,
            int maxRows) {
        this.conUrl = conUrl;
        this.user = user;
        this.password = password;
        this.localhostIp = localhostIp;
        this.schema = schema;
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.attributes = attributes;
        this.types = types;
        this.nullableAttributes = nullableAttributes;
        this.nonRepeatableField = nonRepeatableField;
        this.maxRows = maxRows;
        this.helper = new ServletHelper();
    }

    // ========================= Helper Methods =========================
    /**
     * Returns a select everything query string based on the schema and table
     * name of the table that this class represents.
     * 
     * @return The select everything query string.
     */
    private String getSelectQuery() {
        return "SELECT * FROM " + schema + "." + tableName;
    }

    /**
     * Returns a select everything query string based on the schema, table name,
     * and primary key of the table that this class represents.
     * 
     * @param recordKey The primary key of the record to select.
     * @return The select query everything string.
     */
    private String getCheckRowQuery(int recordKey) {
        return "SELECT * FROM " + schema + "." + tableName + " WHERE " + primaryKey + " = " + recordKey;
    }

    /**
     * Returns a select everything query with an offset and limit.
     * 
     * @param offset The offset to start at.
     * @return The offset and limit query string.
     */
    private String getSelectOffsetQuery(int offset) {
        return "SELECT * FROM " + schema + "." + tableName + " ORDER BY " + primaryKey + " ASC OFFSET " + offset
                + " ROWS FETCH NEXT " + maxRows + " ROWS ONLY";
    }

    /**
     * Gets the update query string based on the schema, table name, and json object
     * provided.
     * 
     * @param json      The json object to get the attributes from.
     * @param recordKey The primary key of the record to update.
     * @return The update query string.
     */
    private String getUpdateQuery(JSONObject json, int recordKey) {
        String updateQuery = "UPDATE " + schema + "." + tableName + " SET ";

        for (int i = 0; i < attributes.length; i++) {
            updateQuery += attributes[i] + " = "
                    + (nullableAttributes[i] && json.isNull(attributes[i]) ? "''"
                            : (helper.getJsonAttrString(json, i, attributes, types)))
                    + helper.getNeccessaryComma(i, attributes.length);
        }

        updateQuery += " WHERE " + primaryKey + " = " + recordKey;

        return updateQuery;
    }

    /**
     * Returns a delete query string based on the schema, table name, and primary
     * key of the record to delete.
     * 
     * @param recordKey The primary key of the record to delete.
     * @return The delete query string.
     */
    private String getDeleteQuery(int recordKey) {
        return "DELETE FROM " + schema + "." + tableName + " WHERE " + primaryKey + " = " + recordKey;
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
        String schemaStr = schema.toLowerCase();

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
    private int getMaxNumberOfPages(int rowCount) {
        return (rowCount - (rowCount % maxRows)) / maxRows + (rowCount % maxRows == 0 ? 0 : 1);
    }

    // ========================= CRUD Methods =========================
    /**
     * Post method helper that attempts to insert a record into the database.
     * 
     * @param json     The json object to get the attributes from.
     * @param out      The print writer to print the message to.
     * @param recordId The primary key of the record to insert.
     * @throws Exception If the insert operation fails.
     */
    private void attemptToInsertRecord(JSONObject json, PrintWriter out, int recordId) throws Exception {
        // Establish the connection to the DB and prepare the statement
        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conUrl, user, password);
        String recordCheckQuery = getCheckRowQuery(recordId);
        String insertQuery = helper.getInsertQuery(schema, tableName, attributes, types, nullableAttributes, json);

        // Check if the record already exists
        Statement checkStmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                ResultSet.CONCUR_READ_ONLY);
        ResultSet rs = checkStmt.executeQuery(recordCheckQuery);

        if (rs.next()) {
            // Record already exists; cannot be inserted
            helper.printJsonMessage(out, false, "error",
                    "A record with the id " + recordId + " already exists.");
        } else {
            // Record does not exist
            Statement stmt = con.createStatement();

            // Execute the query and close the connection
            stmt.executeUpdate(insertQuery);
            stmt.close();
            con.close();

            out.print("{\"success\":" + true + ",\"message\":\"Record with id " + recordId
                    + " created.\",\"dataAdded\":" + json.toString() + "}");
        }
    }

    /**
     * Attempt to insert a record without providing a primary key.
     * 
     * @param request  The request to get the json object from.
     * @param response The response to print the message to.
     * @throws Exception If the insert operation fails.
     */
    private void attemptToInsertRecord(String body, PrintWriter out)
            throws Exception {
        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conUrl, user, password);
        String maxCountQuery = getSelectQuery();
        int newId = helper.getQueryRowCount(con, maxCountQuery) + 1;

        // Get body as JSON object
        JSONObject json = new JSONObject(body);
        json.put(primaryKey, newId);

        // Check if the non-repeatable field has to be checked
        String nonRepeatFieldQuery;
        int count = -1;

        if (nonRepeatableField != null) {
            // Check if there is a record with the same value in the non-repeatable field
            nonRepeatFieldQuery = "SELECT * FROM " + schema + "." + tableName + " WHERE "
                    + nonRepeatableField + " = '" + json.get(nonRepeatableField) + "'";
            count = helper.getQueryRowCount(con, nonRepeatFieldQuery);
        }

        // Check if there are no records with the same value in the non-repeatable field
        if (count == 0 || nonRepeatableField == null) {
            // Check if all the attributes are set
            if (helper.checkIfJsonContainsAttributes(json, attributes)) {
                try {
                    attemptToInsertRecord(json, out, newId);
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "There are missing attributes. Please make sure to add all of the attributes of the record.");
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "A record with the unique value " + json.get(nonRepeatableField) + " already exists.");
        }
    }

    /**
     * Post method of the CRUD operations.
     * 
     * @param request  The request object.
     * @param response The response object.
     * @throws ServletException If the servlet throws an exception.
     * @throws IOException      If there is an error with the input or output.
     */
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
            if (helper.isNumeric(id) && Integer.parseInt(id) > 0) {
                int recordId = Integer.parseInt(id);

                // Get the body of the request and make all the attributes lowercase
                String body = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);

                // Check if the body is empty
                if (body.length() > 0) {
                    // Get body as JSON object
                    JSONObject json = new JSONObject(body);
                    json.put(primaryKey, recordId);

                    // Check if all the attributes are set
                    if (helper.checkIfJsonContainsAttributes(json, attributes)) {
                        try {
                            attemptToInsertRecord(json, out, recordId);
                        } catch (Exception e) {
                            helper.printErrorMessage(out, e);
                        }
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "There are missing attributes. Please make sure to add all of the attributes of the record.");
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "The body of the request is empty. Please set the attributes of the record.");
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The id provided is not a number or is a negative number or zero. Please provide a positive number as the id.");
            }
        } else {
            // Get the body of the request and make all the attributes lowercase
            String body = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);

            // Check if the body is empty
            if (body.length() > 0) {
                try {
                    attemptToInsertRecord(body, out);
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The body of the request is empty. Please set the attributes of the record.");
            }
        }
    }

    /**
     * Get method helper that attempts to display all the records in the database.
     * 
     * @param out The print writer to print the message to.
     * @throws Exception If the select operation fails.
     */
    private void attemptToDisplayAllRecords(HttpServletRequest request, PrintWriter out) throws Exception {
        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conUrl, user, password);
        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
        String query = getSelectOffsetQuery(0);
        int rowCount = helper.getQueryRowCount(con, query);
        String maxCountQuery = getSelectQuery();
        int maxRowCount = helper.getQueryRowCount(con, maxCountQuery);
        ResultSet rs = stmt.executeQuery(query);

        out.print("{\"success\":" + true + ",\"rowCount\":" + rowCount + ",\"data\":[");

        // Check if there are any records
        if (rs.next()) {
            // Return the first record
            rs.beforeFirst();

            // There are records; print them
            while (rs.next()) {
                helper.printRow(rs, out, attributes, types);

                if (rs.isLast()) {
                    if (rowCount < maxRows || rowCount == maxRowCount) {
                        out.print("]}");
                    } else {
                        out.print("],\"nextPage\":" + getNextPageUrl(request, 1) + "}");
                    }
                } else {
                    out.print(",");
                }
            }
        } else {
            // There are no records; print an empty array
            out.print("{}]}");
        }

        con.close();
    }

    /**
     * Get method helper to get a page of records.
     * 
     * @param out  The print writer to print the message to.
     * @param page The page to get.
     * @throws Exception If the select operation fails.
     */
    private void attemptToGetPageOfRecords(HttpServletRequest request, PrintWriter out, int page) throws Exception {
        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conUrl, user, password);
        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                ResultSet.CONCUR_READ_ONLY);
        String query = getSelectOffsetQuery((page - 1) * maxRows);
        int rowCount = helper.getQueryRowCount(con, query);
        String maxCountQuery = getSelectQuery();
        int maxRowCount = helper.getQueryRowCount(con, maxCountQuery);
        ResultSet rs = stmt.executeQuery(query);

        if (rowCount == maxRows) {
            out.print("{\"success\":" + true + ",\"rowCount\":" + rowCount + ",\"data\":[");

            while (rs.next()) {
                helper.printRow(rs, out, attributes, types);

                if (rs.isLast()) {
                    if (page == getMaxNumberOfPages(maxRowCount) && page != 1) {
                        out.print("],\"previousPage\":" + getNextPageUrl(request, page - 2) + "}");
                    } else if (page != 1) {
                        out.print(
                                "],\"previousPage\":" + getNextPageUrl(request, page - 2) + ",\"nextPage\":"
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
        } else if (rowCount < maxRows && rowCount != 0) {
            out.print("{\"success\":" + true + ",\"rowCount\":" + rowCount + ",\"data\":[");

            while (rs.next()) {
                helper.printRow(rs, out, attributes, types);

                if (rs.isLast()) {
                    if (page != 1 && rowCount <= maxRows) {
                        out.print(
                                "],\"previousPage\":" + getNextPageUrl(request, page - 2) + "}");
                    } else {
                        out.print("]}");
                    }
                } else {
                    out.print(",");
                }
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "Invalid page number. No data corresponds to this page.");
        }

        con.close();
    }

    /**
     * Get method helper to get a record by its id.
     * 
     * @param out      The print writer to print the message to.
     * @param recordId The id of the record to get.
     * @throws Exception If the select operation fails.
     */
    private void attemptToGetRecordById(PrintWriter out, int recordId) throws Exception {
        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conUrl, user, password);
        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                ResultSet.CONCUR_READ_ONLY);
        ResultSet rs = stmt.executeQuery(getCheckRowQuery(recordId));

        // Check if the record exists
        if (rs.next()) {
            // Record exists
            out.print("{\"success\":" + true + ",\"data\":");
            helper.printRow(rs, out, attributes, types);
            out.print("}");
        } else {
            // The record with the given ID does not exist
            helper.printJsonMessage(out, false, "error",
                    "The record with the id " + recordId + " does not exist.");
        }
    }

    /**
     * Get method of the CRUD operations.
     * 
     * @param request  The request object.
     * @param response The response object.
     * @throws ServletException If the servlet throws an exception.
     * @throws IOException      If there is an error with the input or output.
     */
    protected void get(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Get the number of parameters
        int paramCount = request.getParameterMap().size();
        boolean isTableParamSet = request.getParameterMap().containsKey("table")
                || request.getParameterMap().containsKey("tableName");
        boolean isSellerParamSet = request.getParameterMap().containsKey("verVendedor");
        boolean isPageParamSet = request.getParameterMap().containsKey("page");
        boolean isIdParamSet = request.getParameterMap().containsKey("id");

        // Check if there are any parameters
        if (paramCount == 0 || paramCount == 1 && isTableParamSet
                || isSellerParamSet && isTableParamSet && !isPageParamSet & !isIdParamSet) {
            // Display all records below or equal to the max rows limit
            try {
                attemptToDisplayAllRecords(request, out);
            } catch (Exception e) {
                helper.printErrorMessage(out, e);
            }
        } else {
            // Check if the page parameter is set
            if (isPageParamSet) {
                String pageParam = request.getParameter("page");

                // Check if the page parameter can be parsed to an integer
                if (helper.isNumeric(pageParam)) {
                    int page = Integer.parseInt(request.getParameter("page"));

                    // Check if the page is valid
                    if (page < 1) {
                        helper.printJsonMessage(out, false, "error",
                                "The page number is invalid. Please provide a positive, non-zero number.");
                    } else {
                        // Display the page of records
                        try {
                            attemptToGetPageOfRecords(request, out, page);
                        } catch (Exception e) {
                            helper.printErrorMessage(out, e);
                        }
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
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
                    if (helper.isNumeric(id)) {
                        // Valid id
                        int recordId = Integer.parseInt(id);

                        // Display a record by its id
                        try {
                            attemptToGetRecordById(out, recordId);
                        } catch (Exception e) {
                            helper.printErrorMessage(out, e);
                        }
                    } else {
                        helper.printJsonMessage(out, false, "error",
                                "The given id is not a number. Please provide a numeric id.");
                    }
                } else {
                    // Empty id
                    helper.printJsonMessage(out, false, "error",
                            "The id you set is empty. Please provide one.");
                }
            } else if (request.getParameterMap().containsKey("exists")) {
                String value = request.getParameter("exists");
                String existanceQuery = "SELECT COUNT(*) FROM " + tableName + " WHERE ";
                boolean setFirstValue = false;

                for (int i = 0; i < attributes.length; i++) {
                    if (types[i].equals("VARCHAR2")) {
                        if (!setFirstValue) {
                            setFirstValue = true;
                            existanceQuery += attributes[i] + " = '" + value + "'";
                        } else {
                            existanceQuery += " OR " + attributes[i] + " = '" + value + "'";
                        }
                    }
                }

                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    ResultSet rs = stmt.executeQuery(existanceQuery);

                    // Check if the count is greater than 0
                    rs.next();
                    if (rs.getInt(1) > 0) {
                        // The value exists
                        out.print("{\"success\":" + true + ",\"exists\":" + true + "}");
                    } else {
                        // The value does not exist
                        out.print("{\"success\":" + true + ",\"exists\":" + false + "}");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else if (helper.requestContainsParameter(request, "getEmail")) {
                try {
                    Class.forName("oracle.jdbc.driver.OracleDriver");
                    Connection con = DriverManager.getConnection(conUrl, user, password);
                    Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                            ResultSet.CONCUR_READ_ONLY);
                    ResultSet rs = stmt.executeQuery("SELECT * FROM CREDENCIALES_USUARIOS WHERE EMAIL = '"
                            + request.getParameter("getEmail") + "'");

                    // Check if the count is greater than 0
                    if (rs.next()) {
                        // rs.previous();
                        helper.printRow(rs, out,
                                new String[] { "id_credencial", "id_cliente", "id_vendedor", "tipo_usuario", "email", "salt", "hash" },
                                new String[] { "INTEGER", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2", "VARCHAR2" });
                    } else {
                        helper.printJsonMessage(out, false, "message", "The email is not registered.");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else {
                // Incorrect parameter set
                helper.printJsonMessage(out, false, "error",
                        "An incorrect parameter was set. The valid parameters are 'id' or '" + primaryKey
                                + "', to search a record by its id; or 'page', to get a set of records in pages of up to "
                                + maxRows + " records.");
            }
        }
    }

    private void insertNewRecord(PrintWriter out, HttpServletRequest request, int recordId) throws Exception {
        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conUrl, user, password);
        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                ResultSet.CONCUR_READ_ONLY);
        ResultSet rs = stmt.executeQuery(getCheckRowQuery(recordId));

        if (rs.next()) {
            // Record exists
            JSONObject oldData = new JSONObject();

            // Get the old data
            for (int i = 0; i < attributes.length; i++) {
                oldData.put(attributes[i], (types[i] == "INTEGER" ? rs.getInt(attributes[i])
                        : types[i] == "FLOAT" ? rs.getFloat(attributes[i])
                                : types[i] == "BOOLEAN" ? rs.getBoolean(attributes[i])
                                        : types[i] == "BLOB" ? rs.getBlob(attributes[i])
                                                : rs.getString(attributes[i])));
            }

            // Get the request body and parse it to a JSON object
            String body = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
            JSONObject newData = new JSONObject(body);

            // Remove the id or primary key attribute from the new data if it exists
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

            // Execute the query to update the record
            String updateQuery = getUpdateQuery(newData, recordId);
            stmt.executeUpdate(updateQuery);

            out.print(
                    "{\"success\":" + true + ",\"message\":\"The data of the record with id " + recordId
                            + " has been updated.\",\"dataModified\":" + body.toString() + "}");
        } else {
            helper.printJsonMessage(out, false, "error",
                    "The record with the id " + recordId + " does not exist.");
        }
    }

    /**
     * Put method of the CRUD operations.
     * 
     * @param request  The request object.
     * @param response The response object.
     * @throws ServletException If the servlet throws an exception.
     * @throws IOException      If there is an error with the input or output.
     */
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
                if (helper.isNumeric(id)) {
                    // Valid id
                    int recordId = Integer.parseInt(id);

                    // Insert a new record
                    try {
                        insertNewRecord(out, request, recordId);
                    } catch (Exception e) {
                        helper.printErrorMessage(out, e);
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "The given id is not a number. Please provide a numeric id.");
                }
            } else {
                helper.printJsonMessage(out, false, "error", "The id you set is empty. Please provide one.");
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "Incorrect parameter set. The valid parameters are 'id' or '" + primaryKey
                            + "', to update the record's data by its id.");
        }
    }

    /**
     * Delete method helper to attempt to delete a record by its id.
     * 
     * @param out      The output writer.
     * @param recordId The id of the record.
     * @throws Exception If there is an error.
     */
    private void attemptToDeleteRecordById(PrintWriter out, int recordId) throws Exception {
        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conUrl, user, password);
        Statement stmt = con.createStatement();
        String recordCheckQuery = getCheckRowQuery(recordId);
        ResultSet rs = stmt.executeQuery(recordCheckQuery);

        if (rs.next()) {
            // Record exists
            String deleteRecordQuery = getDeleteQuery(recordId);
            stmt.executeUpdate(deleteRecordQuery);
            helper.printJsonMessage(out, true, "success", "Record data with id " + recordId + " has been deleted.");
        } else {
            // Record does not exist
            helper.printJsonMessage(out, false, "error",
                    "The record with the given id does not exist.");
        }
    }

    /**
     * Delete method of the CRUD operations.
     * 
     * @param request  The request object.
     * @param response The response object.
     * @throws ServletException If the servlet throws an exception.
     * @throws IOException      If there is an error with the input or output.
     */
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
                if (helper.isNumeric(id)) {
                    // Valid id
                    int recordId = Integer.parseInt(id);

                    // Delete the record
                    try {
                        attemptToDeleteRecordById(out, recordId);
                    } catch (Exception e) {
                        helper.printErrorMessage(out, e);
                    }
                } else {
                    helper.printJsonMessage(out, false, "error",
                            "The given id is not a number. Please provide a numeric id.");
                }
            } else {
                helper.printJsonMessage(out, false, "error", "The id you set is empty. Please provide one.");
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "Incorrect parameter set. The valid parameters are 'id' or '" + primaryKey
                            + "', to delete the record's data by its id.");
        }
    }
}
