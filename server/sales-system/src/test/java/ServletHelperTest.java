import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.io.StringWriter;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
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
     * {@link ServletHelper#checkIfJsonContainsAttributes(JSONObject, String[])} to
     * check if a JSON object contains the given attributes.
     */
    @Test
    void testCheckIfJsonContainsAttributes() {
        JSONObject json = new JSONObject();
        json.put("name", "test");
        json.put("age", "20");
        json.put("height", "1.75");
        String[] attributes = { "name", "age", "height" };
        String[] attributes2 = { "name", "age", "height", "weight" };

        assertTrue(helper.checkIfJsonContainsAttributes(json, attributes));
        assertFalse(helper.checkIfJsonContainsAttributes(json, attributes2));
    }

    /**
     * Test the method
     * {@link ServletHelper#getInsertQuery(String, String, String[], String[], boolean[], JSONObject)}
     * to check if it returns the correct insert query.
     */
    @Test
    void testGetInsertQuery() {
        String schema = "Registry";
        String table = "Person";
        String[] attributes = { "name", "age", "height" };
        String[] types = { "VARCHAR", "INTEGER", "FLOAT" };
        boolean[] nullableAttrs = { false, false, false };
        JSONObject json = new JSONObject();
        json.put("name", "test");
        json.put("age", "20");
        json.put("height", "1.75");

        assertEquals("INSERT INTO Registry.Person (name, age, height) VALUES ('test', '20', '1.75')",
                helper.getInsertQuery(schema, table, attributes, types, nullableAttrs, json));
        assertNotEquals("INSERT INTO Registry.Person VALUES ('test', '20', '1.75')",
                helper.getInsertQuery(schema, table, attributes, types, nullableAttrs, json));
    }

    /**
     * Test the method
     * {@link ServletHelper#getJsonAttrString(JSONObject, int, String[], String[])}
     * to check if it returns the correct string.
     */
    @Test
    void testGetJsonAttrString() {
        JSONObject json = new JSONObject();
        json.put("name", "test");
        json.put("age", "20");
        json.put("height", "1.75");
        String[] attributes = { "name", "age", "height" };
        String[] types = { "VARCHAR", "INTEGER", "FLOAT" };

        assertEquals("'test'", helper.getJsonAttrString(json, 0, attributes, types));
        assertEquals("'20'", helper.getJsonAttrString(json, 1, attributes, types));
        assertEquals("'1.75'", helper.getJsonAttrString(json, 2, attributes, types));
        assertNotEquals("'test'", helper.getJsonAttrString(json, 2, attributes, types));
        assertNotEquals("'20'", helper.getJsonAttrString(json, 0, attributes, types));
        assertNotEquals("'1.75'", helper.getJsonAttrString(json, 1, attributes, types));
    }

    /**
     * Test the method
     * {@link ServletHelper#checkIfJsonContainsAttributes(JSONObject, String[])} to
     * check if it returns the comma when needed.
     */
    @Test
    void testGetNeccessaryComma() {
        assertEquals(", ", helper.getNeccessaryComma(0, 3));
        assertEquals(", ", helper.getNeccessaryComma(1, 3));
        assertEquals("", helper.getNeccessaryComma(2, 3));
        assertNotEquals(", ", helper.getNeccessaryComma(2, 3));
    }

    /**
     * Test the method
     * {@link ServletHelper#getNeccessaryComma(int, int)} to
     * check if it returns the correct row count.
     */
    @Test
    void testGetQueryRowCount() {
        String conURL = secrets.getOracleConnectionString();
        String user = "system";
        String password = "Oracle18c";

        try {
            Class.forName("oracle.jdbc.driver.OracleDriver");
            Connection con = DriverManager.getConnection(conURL, user, password);
            String testQuery = "SELECT LOWER('test') FROM DUAL";

            assertEquals(1, helper.getQueryRowCount(con, testQuery));
            assertNotEquals(2, helper.getQueryRowCount(con, testQuery));
        } catch (Exception e) {
            fail("Exception thrown: " + e.getMessage());
        }
    }

    /**
     * Test the method
     * {@link ServletHelper#getRow(ResultSet, PrintWriter, String[], String[])}
     * returns the row as a string.
     */
    @Test
    void testGetRow() {
        String conURL = secrets.getOracleConnectionString();
        String user = "system";
        String password = "Oracle18c";
        PrintWriter out = new PrintWriter(System.out);

        try {
            Class.forName("oracle.jdbc.driver.OracleDriver");
            Connection con = DriverManager.getConnection(conURL, user, password);
            Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
            String testQuery = "SELECT LOWER('test') test FROM DUAL";
            ResultSet rs = stmt.executeQuery(testQuery);

            while (rs.next()) {
                String row = helper.getRow(rs, out, new String[] { "test" }, new String[] { "VARCHAR" });

                assertEquals("{\"test\":\"test\"}", row);
                assertNotEquals("{\"test\":\"hola\"}", row);
            }
        } catch (Exception e) {
            fail("Exception thrown: " + e.getMessage());
        }
    }

    /**
     * Test the method
     * {@link ServletHelper#isDateWithTime(String)}
     * that checks if a string is a date with time (complete date).
     */
    @Test
    void testIsDateWithTimeComplete() {
        assertTrue(helper.isDateWithTime("2020-01-01 00:00:00"));
        assertTrue(helper.isDateWithTime("2020-01-01 23:59:59"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isDateWithTime(String)}
     * that checks if a string is a date without time.
     */
    @Test
    void testIsDateWithoutTime() {
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
        assertTrue(helper.isNumeric("0"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with a
     * positive integer)
     */
    @Test
    void testIsNumericWithPositiveInteger() {
        assertTrue(helper.isNumeric("123"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with a
     * negative integer)
     */
    @Test
    void testIsNumericWithNegativeInteger() {
        assertTrue(helper.isNumeric("-123"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with a
     * positive float)
     */
    @Test
    void testIsNumericWithPositiveFloat() {
        assertTrue(helper.isNumeric("123.45"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with a
     * negative float)
     */
    @Test
    void testIsNumericWithNegativeFloat() {
        assertTrue(helper.isNumeric("-123.45"));
    }

    /**
     * Test the method
     * {@link ServletHelper#isNumeric(String str)}
     * that checks if a string can be parsed as a number (with a
     * non-number string)
     */
    @Test
    void testIsNumericWithNonNumberString() {
        assertFalse(helper.isNumeric("Hola!"));
    }

    /**
     * Test the method
     * {@link ServletHelper#printErrorMessage(PrintWriter out, Exception e)}
     * that writes an error message to the print writer.
     */
    @Test
    void testPrintErrorMessage() {
        StringWriter sw = new StringWriter();
        PrintWriter out = new PrintWriter(sw);
        Exception e = new Exception("Error: Test");

        // Write the error message to the PrintWriter
        helper.printErrorMessage(out, e);

        String actualOutput = sw.toString();
        String expectedOutput = "{\"success\":false,\"error\":\"Error: Test\"}";
        String notExpectedOutput = "{\"success\":true,\"error\":\"Error: Test\"}";

        assertEquals(expectedOutput, actualOutput);
        assertNotEquals(notExpectedOutput, actualOutput);
    }

    /**
     * Test the method
     * {@link ServletHelper#printJsonMessage(PrintWriter out, boolean success, String msgName, String msg)}
     * that writes a message to the print writer in a json format.
     */
    @Test
    void testPrintJsonMessage() {
        StringWriter sw = new StringWriter();
        PrintWriter out = new PrintWriter(sw);
        String msgName = "message";
        String msg = "Test";

        // Write the message to the PrintWriter
        helper.printJsonMessage(out, true, msgName, msg);

        String actualOutput = sw.toString();
        String expectedOutput = "{\"success\":true,\"message\":\"Test\"}";
        String notExpectedOutput = "{\"success\":false,\"message\":\"Test\"}";

        assertEquals(expectedOutput, actualOutput);
        assertNotEquals(notExpectedOutput, actualOutput);
    }

    /**
     * Test the method
     * {@link ServletHelper#printRow(ResultSet rs, PrintWriter out, String[] attributes, String[] types)}
     * that prints a row from a query to the print writer.
     */
    @Test
    void testPrintRow() {
        String conURL = secrets.getOracleConnectionString();
        String user = "system";
        String password = "Oracle18c";
        StringWriter sw = new StringWriter();
        PrintWriter out = new PrintWriter(sw);

        try {
            Class.forName("oracle.jdbc.driver.OracleDriver");
            Connection con = DriverManager.getConnection(conURL, user, password);
            Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
            String testQuery = "SELECT LOWER('Test') Test FROM DUAL";
            ResultSet rs = stmt.executeQuery(testQuery);

            while (rs.next()) {
                helper.printRow(rs, out, new String[] { "Test" }, new String[] { "VARCHAR" });
            }

            String actualOutput = sw.toString();
            String expectedOutput = "{\"Test\":\"test\"}";
            String notExpectedOutput = "{\"test\":\"Test\"}";

            assertEquals(expectedOutput, actualOutput);
            assertNotEquals(notExpectedOutput, actualOutput);
        } catch (Exception e) {
            fail("Exception thrown: " + e.getMessage());
        }
    }

    /**
     * Test the method
     * {@link ServletHelper#boolean ServletHelper.requestContainsParameter(HttpServletRequest request, String param)} to
     * check if a request contains a given parameter.
     */
    @Test
    void testRequestContainsParameter() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getParameter("param")).thenReturn("value");

        assertTrue(helper.requestContainsParameter(request, "param"));
        assertFalse(helper.requestContainsParameter(request, "param2"));
    }

    /**
     * Test the method
     * {@link ServletHelper#round(float number, int places)}
     * that round a float to a given number of decimals.
     */
    @Test
    void testRound() {
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
        assertEquals("1,234,567,123.00", helper.formatNumber("1234567123"));
        assertEquals("21,598.27", helper.formatNumber("21598.27"));
        assertEquals("0.00", helper.formatNumber("0"));
        assertEquals("-1,234,567,123.00", helper.formatNumber("-1234567123"));
    }
}
