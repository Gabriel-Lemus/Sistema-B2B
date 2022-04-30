import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.io.StringWriter;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONObject;

/**
 * Unit testing for the class {@link ServletHelper}.
 */
public class ServletHelperTest {
    // Attributes
    private ServletHelper helper = new ServletHelper();
    private Secrets secrets = new Secrets();

    /**
     * Test the method
     * {@link ServletHelper#checkIfJsonContainsAttributes(JSONObject json, String[] attribute)}
     * to
     * check if a JSON object contains the given attributes.
     */
    @Test
    void testCheckIfJsonContainsAttributes() {
        // Arrange
        JSONObject json = new JSONObject();
        json.put("name", "test");
        json.put("age", "20");
        json.put("height", "1.75");
        String[] attributes = { "name", "age", "height" };

        // Act
        boolean result = helper.checkIfJsonContainsAttributes(json, attributes);

        // Assert
        assertTrue(result);
    }

    /**
     * Test the method
     * {@link ServletHelper#getInsertQuery(String schema, String table, String[] attrs, String[] types, boolean[] nullableAttrs, JSONObject json)}
     * to check if it returns the correct insert query.
     */
    @Test
    void testGetInsertQuery() {
        // Arrange
        String schema = "Registry";
        String table = "Person";
        String[] attributes = { "name", "age", "height" };
        String[] types = { "VARCHAR", "INTEGER", "FLOAT" };
        boolean[] nullableAttrs = { false, false, false };
        JSONObject json = new JSONObject();
        json.put("name", "test");
        json.put("age", "20");
        json.put("height", "1.75");
        String expected = "INSERT INTO Registry.Person (name, age, height) VALUES ('test', '20', '1.75')";

        // Act
        String actual = helper.getInsertQuery(schema, table, attributes, types, nullableAttrs, json);

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method
     * {@link ServletHelper#getJsonAttrString(JSONObject json, int index, String[] attributes, String[] types)}
     * to check if it returns the correct string.
     */
    @Test
    void testGetJsonAttrString() {
        // Arrange
        JSONObject json = new JSONObject();
        json.put("name", "test");
        json.put("age", "20");
        json.put("height", "1.75");
        String[] attributes = { "name", "age", "height" };
        String[] types = { "VARCHAR", "INTEGER", "FLOAT" };

        // Act & Assert
        assertEquals("'test'", helper.getJsonAttrString(json, 0, attributes, types));
        assertEquals("'20'", helper.getJsonAttrString(json, 1, attributes, types));
        assertEquals("'1.75'", helper.getJsonAttrString(json, 2, attributes, types));
        assertNotEquals("'test'", helper.getJsonAttrString(json, 2, attributes, types));
        assertNotEquals("'20'", helper.getJsonAttrString(json, 0, attributes, types));
        assertNotEquals("'1.75'", helper.getJsonAttrString(json, 1, attributes, types));
    }

    /**
     * Test the method
     * {@link ServletHelper#getNeccessaryComma(int index, int length)} to
     * check if it returns the comma when needed.
     */
    @Test
    void testGetNeccessaryComma() {
        // Act & Assert
        assertEquals(", ", helper.getNeccessaryComma(0, 3));
        assertEquals(", ", helper.getNeccessaryComma(1, 3));
        assertEquals("", helper.getNeccessaryComma(2, 3));
        assertNotEquals(", ", helper.getNeccessaryComma(2, 3));
    }

    /**
     * Test the method
     * {@link ServletHelper#getQueryRowCount(Connection con, String query)} to
     * check if it returns the correct row count.
     * 
     * @throws ClassNotFoundException if the driver class is not found
     * @throws SQLException           if a database access error occurs
     */
    @Test
    void testGetQueryRowCount() throws ClassNotFoundException, SQLException {
        // Arrange
        String conURL = secrets.getOracleConnectionString();
        String user = "system";
        String password = "Oracle18c";

        // Act
        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conURL, user, password);
        String testQuery = "SELECT LOWER('test') FROM DUAL";
        int expected = 1;
        int actual = helper.getQueryRowCount(con, testQuery);

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method
     * {@link ServletHelper#getRow(ResultSet rs, PrintWriter out, String[] attributes, String[] types)}
     * returns the row as a string.
     * 
     * @throws ClassNotFoundException if the driver class is not found
     * @throws SQLException           if a database access error occurs
     */
    @Test
    void testGetRow() throws ClassNotFoundException, SQLException {
        // Arrange
        String conURL = secrets.getOracleConnectionString();
        String user = "system";
        String password = "Oracle18c";
        PrintWriter out = new PrintWriter(System.out);

        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conURL, user, password);
        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
        String testQuery = "SELECT LOWER('test') test FROM DUAL";
        ResultSet rs = stmt.executeQuery(testQuery);
        String expected = "{\"test\":\"test\"}";

        while (rs.next()) {
            // Act
            String actual = helper.getRow(rs, out, new String[] { "test" }, new String[] { "VARCHAR" });

            // Assert
            assertEquals(expected, actual);
        }
    }

    /**
     * Test the method
     * {@link ServletHelper#isDateWithTime(String date)}
     * that checks if a string is a date with time (complete date).
     */
    @Test
    void testIsDateWithTimeComplete() {
        // Act & Assert
        assertTrue(helper.isDateWithTime("2020-01-01 00:00:00"));
        assertTrue(helper.isDateWithTime("2020-01-01 23:59:59"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isDateWithTime(String date)}
     * that checks if a string is a date without time.
     */
    @Test
    void testIsDateWithoutTime() {
        // Act & Assert
        assertFalse(helper.isDateWithTime("2020-01-01"));
        assertFalse(helper.isDateWithTime("2020-01-01 00:00"));
        assertFalse(helper.isDateWithTime("2020-01-01 00:00:00.123"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with 0)
     */
    @Test
    void testIsNumericWithZero() {
        // Act & Assert
        assertTrue(helper.isNumeric("0"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with a positive integer)
     */
    @Test
    void testIsNumericWithPositiveInteger() {
        // Act & Assert
        assertTrue(helper.isNumeric("123"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with a negative integer)
     */
    @Test
    void testIsNumericWithNegativeInteger() {
        // Act & Assert
        assertTrue(helper.isNumeric("-123"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with a positive float)
     */
    @Test
    void testIsNumericWithPositiveFloat() {
        // Act & Assert
        assertTrue(helper.isNumeric("123.45"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with a negative float)
     */
    @Test
    void testIsNumericWithNegativeFloat() {
        // Act & Assert
        assertTrue(helper.isNumeric("-123.45"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with a non-number string)
     */
    @Test
    void testIsNumericWithNonNumberString() {
        // Act & Assert
        assertFalse(helper.isNumeric("Hola!"));
    }

    /**
     * Test the method
     * {@link ServletHelper#printErrorMessage(PrintWriter out, Exception e)}
     * that writes an error message to the print writer.
     */
    @Test
    void testPrintErrorMessage() {
        // Arrange
        StringWriter sw = new StringWriter();
        PrintWriter out = new PrintWriter(sw);
        Exception e = new Exception("Error: Test");

        // Act
        helper.printErrorMessage(out, e);

        String actual = sw.toString();
        String expected = "{\"success\":false,\"error\":\"Error: Test\"}";

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method
     * {@link ServletHelper#printJsonMessage(PrintWriter out, boolean success, String msgName, String msg)}
     * that writes a message to the print writer in a json format.
     */
    @Test
    void testPrintJsonMessage() {
        // Arrange
        StringWriter sw = new StringWriter();
        PrintWriter out = new PrintWriter(sw);
        String msgName = "message";
        String msg = "Test";

        // Act
        helper.printJsonMessage(out, true, msgName, msg);

        String actual = sw.toString();
        String expected = "{\"success\":true,\"message\":\"Test\"}";

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method
     * {@link ServletHelper#printRow(ResultSet rs, PrintWriter out, String[] attributes, String[] types)}
     * that prints a row from a query to the print writer.
     * 
     * @throws ClassNotFoundException if the driver class is not found
     * @throws SQLException           if a database access error occurs
     */
    @Test
    void testPrintRow() throws ClassNotFoundException, SQLException {
        // Arrange
        String conURL = secrets.getOracleConnectionString();
        String user = "system";
        String password = "Oracle18c";
        StringWriter sw = new StringWriter();
        PrintWriter out = new PrintWriter(sw);

        Class.forName("oracle.jdbc.driver.OracleDriver");
        Connection con = DriverManager.getConnection(conURL, user, password);
        Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
        String testQuery = "SELECT LOWER('Test') Test FROM DUAL";
        ResultSet rs = stmt.executeQuery(testQuery);

        // Act
        while (rs.next()) {
            helper.printRow(rs, out, new String[] { "Test" }, new String[] { "VARCHAR" });
        }

        String actual = sw.toString();
        String expected = "{\"Test\":\"test\"}";

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method
     * {@link ServletHelper#requestContainsParameter(HttpServletRequest request, String param)}
     * to check if a request contains a given parameter.
     */
    @Test
    void testRequestContainsParameter() {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getParameter("param")).thenReturn("value");

        // Act & Assert
        assertTrue(helper.requestContainsParameter(request, "param"));
    }

    /**
     * Test the method
     * {@link ServletHelper#round(float number, int places)}
     * that round a float to a given number of decimals.
     */
    @Test
    void testRound() {
        // Act & Assert
        assertEquals("1.0", helper.round(1.0f, 1));
        assertEquals("2.00", helper.round(2.0f, 2));
    }

    /**
     * Test the method
     * {@link ServletHelper#formatNumber(String number)}
     * that formats a number.
     */
    @Test
    void testFormatNumber() {
        // Act & Assert
        assertEquals("1,234,567,123.00", helper.formatNumber("1234567123"));
        assertEquals("21,598.27", helper.formatNumber("21598.27"));
        assertEquals("0.00", helper.formatNumber("0"));
        assertEquals("-1,234,567,123.00", helper.formatNumber("-1234567123"));
    }
}
