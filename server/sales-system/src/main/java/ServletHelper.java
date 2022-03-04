import java.sql.*;

import java.io.PrintWriter;

import org.json.JSONObject;

/**
 * This class contains several helper methods that are used in the servlets of
 * the project, such as handling JSON objects, printing messages to the print
 * writer, and evaluating regular expressions.
 */
public class ServletHelper {
    // ========================= JSON Helper Methods =========================
    /**
     * Checks if the json object contains the attributes specified in the array
     * provided.
     * 
     * @param json      The json object to check.
     * @param attribute The array of attributes to check.
     * @return True if the json object contains all the attributes, false
     *         otherwise.
     */
    public boolean checkIfJsonContainsAttributes(JSONObject json, String[] attribute) {
        for (String attr : attribute) {
            if (!json.has(attr)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns a string concatenated with the attribute provided as a paramenter
     * with its correct data type.
     * 
     * @param json  The json object to get the attribute from.
     * @param index The index of the attribute.
     * @return The string concatenated with the attribute with its correct data
     *         type.
     */
    public String getJsonAttrString(JSONObject json, int index, String[] attributes, String[] types) {
        switch (types[index]) {
            case "INTEGER":
                return "'" + json.getInt(attributes[index]) + "'";
            case "FLOAT":
                return "'" + json.getDouble(attributes[index]) + "'";
            case "BOOLEAN":
                return "'" + json.getBoolean(attributes[index]) + "'";
            case "DATE":
                if (isDateWithTime(json.getString(attributes[index]))) {
                    return "TO_DATE('" + json.getString(attributes[index]) + "', 'YYYY-MM-DD HH24:MI:SS')";
                } else {
                    return "TO_DATE('" + json.getString(attributes[index]) + "', 'YYYY-MM-DD')";
                }
            default:
                return "'" + json.getString(attributes[index]) + "'";
        }
    }

    // ===================== Print Writer Helper Methods =====================
    /**
     * Prints a JSON message with the provided error.
     * 
     * @param out The print writer to print the error message to.
     * @param e   The exception to print the message from.
     */
    public void printErrorMessage(PrintWriter out, Exception e) {
        out.print("{\"success\":" + false + ",\"error\":" + "\""
                + e.getMessage().replace("\n", "").replace("\r", "") + "\"}");
    }

    /**
     * Prints the values from the result set matching the correct data type to
     * the provided print writer.
     * 
     * @param rs    The result set from which to print the value.
     * @param index The index of the value to print.
     * @param out   The print writer to print the value to.
     * @throws SQLException If there is an error while printing the value.
     */
    private void printAttributeValue(ResultSet rs, Integer index, String[] attributes, String[] types, PrintWriter out)
            throws SQLException {
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

    /**
     * Prints a JSON message to the print writer with the with the successful
     * attribute and string provided.
     * 
     * @param out     The print writer to print the message to.
     * @param success Wether the operation the message is alluding to was successful
     *                or not.
     * @param msgName The name of the message attribute.
     * @param msg     The message to print.
     */
    public void printJsonMessage(PrintWriter out, boolean success, String msgName, String msg) {
        out.print("{\"success\":" + success + ",\"" + msgName + "\":" + "\"" + msg + "\"}");
    }

    /**
     * Prints the record of the result set to the print writer.
     * 
     * @param rs  The result set to get the record from.
     * @param out The print writer to print the record to.
     * @throws SQLException If the result set is null.
     */
    public void printRow(ResultSet rs, PrintWriter out, String[] attributes, String[] types) throws SQLException {
        out.print("{");

        for (int i = 0; i < attributes.length; i++) {
            out.print("\"" + attributes[i] + "\":");
            printAttributeValue(rs, i, attributes, types, out);

            if (i < attributes.length - 1) {
                out.print(",");
            }
        }

        out.print("}");
    }

    // ================== Regular Expression Helper Methods ==================
    /**
     * Checks if a string matches a number regular expression.
     * 
     * @param str The string to check.
     * @return True if the string matches the regular expression, false
     *         otherwise.
     */
    public boolean isNumeric(String str) {
        return str.matches("-?\\d+(\\.\\d+)?");
    }

    /**
     * Check if the string provided is a date with the format yyyy-mm-dd hh:mm:ss
     * using a regular expression.
     * 
     * @param date The string to check.
     * @return True if the string is a date with the required format, false
     *         otherwise.
     */
    private boolean isDateWithTime(String date) {
        return date.matches("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}");
    }

    // ========================= SQL Helper Methods =========================
    /**
     * Gets the number of rows returned from an SQL query.
     * 
     * @param con   The connection to the database.
     * @param query The query to execute.
     * @return The number of rows returned.
     * @throws SQLException If there is an error while getting the number of rows.
     */
    public int getQueryRowCount(Connection con, String query) throws SQLException {
        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                ResultSet.CONCUR_READ_ONLY);
        ResultSet rowCount = stmt.executeQuery("SELECT COUNT(*) AS TOTAL FROM (" + query + ")");
        rowCount.next();
        int totalRows = rowCount.getInt("TOTAL");
        rowCount.close();

        return totalRows;
    }

    /**
     * Returns an insert query string based on the schema, table name, and json
     * object provided.
     * 
     * @param json The json object to get the attributes from.
     * @return The insert query string.
     */
    public String getInsertQuery(String schema, String table, String[] attrs, String[] types, boolean[] nullableAttrs,
            JSONObject json) {
        String query = "INSERT INTO " + schema + "." + table + " (";

        for (int i = 0; i < attrs.length; i++) {
            query += attrs[i] + getNeccessaryComma(i, attrs.length);
        }

        query += ") VALUES (";

        for (int i = 0; i < attrs.length; i++) {
            query += (nullableAttrs[i] && json.isNull(attrs[i]) ? "''"
                    : "" + (getJsonAttrString(json, i, attrs, types)) + "")
                    + getNeccessaryComma(i, attrs.length);
        }

        query += ")";

        return query;
    }

    // ========================= Misc Helper Methods ========================

    /**
     * Returns a comma if the index is not the last item of the array, based on
     * its length; otherwise, returns an empty string character.
     * 
     * @param index  The index of the item.
     * @param length The length of the array.
     * @return The comma or empty string character.
     */
    public String getNeccessaryComma(int index, int length) {
        return index < length - 1 ? ", " : "";
    }
}
