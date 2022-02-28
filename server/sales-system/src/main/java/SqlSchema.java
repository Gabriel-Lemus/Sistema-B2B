import java.sql.*;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * This class represents a schema from the Oracle database. It is used to handle
 * the requests for the CRUD operations of the tables in the schema.
 */
public class SqlSchema {
    // Attributes
    private String conUrl;
    private String user;
    private String password;
    private String[] schemaTables;
    private SqlTableCrud[] tableCruds;
    private ServletHelper helper;

    // Constructor
    public SqlSchema(String conUrl, String user, String password,
            String localhostIp, String schema, String[] tableServletUrls,
            String[] tableNames, String[] primaryKeys, String[][] tableAttrs,
            String[][] tableAttrTypes, boolean[][] tableAttrNulls, int[] tablesMaxRows) {
        this.conUrl = conUrl;
        this.user = user;
        this.password = password;
        this.schemaTables = tableNames;
        this.helper = new ServletHelper();
        this.tableCruds = new SqlTableCrud[tableServletUrls.length];

        // Initialize the table cruds
        for (int i = 0; i < tableServletUrls.length; i++) {
            tableCruds[i] = new SqlTableCrud(conUrl, user,
                    password, localhostIp, tableServletUrls[i], schema,
                    tableNames[i], primaryKeys[i], tableAttrs[i], tableAttrTypes[i],
                    tableAttrNulls[i], tablesMaxRows[i]);
        }
    }

    // ========================= Helper Methods =========================
    /**
     * Checks if the table exists in the schema.
     * 
     * @param table The name of the table to check.
     * @return True if the table exists, false otherwise.
     * @throws Exception If there is a problem with the database.
     */
    private boolean tableExists(String table) throws Exception {
        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conUrl, user, password);
        Statement stmt = con.createStatement();
        String tableExistsQuery = "SELECT table_name FROM all_tables WHERE UPPER(table_name) = UPPER('" + table + "')";
        ResultSet rs = stmt.executeQuery(tableExistsQuery);
        boolean exists = false;

        if (rs.next()) {
            exists = true;
        }

        rs.close();
        stmt.close();
        con.close();

        return exists;
    }

    private int getTableIndexFromName(String table) {
        for (int i = 0; i < schemaTables.length; i++) {
            if (schemaTables[i].equalsIgnoreCase(table)) {
                return i;
            }
        }

        return -1;
    }

    // ====================== CRUD Operations Handlers ======================
    /**
     * Handle the POST requests for the CRUD operations of the tables.
     * 
     * @param request    The request object.
     * @param response   The response object.
     * @param tableIndex The index of the table in the tableCruds array.
     * @throws ServletException If the servlet throws an exception.
     * @throws IOException      If there is an error with the input or output.
     */
    protected void handlePost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        // Check if the table name parameter is set
        if (request.getParameterMap().containsKey("tableName")
                || request.getParameterMap().containsKey("table")) {
            String tableName = request.getParameter("tableName");

            if (tableName == "" || tableName == null) {
                tableName = request.getParameter("table");
            }

            // Check if the table name is valid
            if (tableName != "" && tableName != null) {
                // Check if the table exists
                try {
                    if (tableExists(tableName)) {
                        int tableIndex = getTableIndexFromName(tableName);

                        if (tableIndex != -1) {
                            // Handle post request
                            tableCruds[tableIndex].post(request, response);
                        } else {
                            helper.printJsonMessage(out, false, "error", "The table was not found.");
                        }
                    } else {
                        helper.printJsonMessage(out, false, "error", "The table does not exist.");
                    }
                } catch (Exception e) {
                    helper.printErrorMessage(out, e);
                }
            } else {
                helper.printJsonMessage(out, false, "error",
                        "The table name you set is empty, please provide one.");
            }
        } else {
            helper.printJsonMessage(out, false, "error",
                    "The table name parameter is not set. Please set the parameter 'table' or 'tableName' to search a table inside the schema.");
        }
    }
}
