import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

// import java.io.PrintWriter;
// import java.io.StringWriter;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class SqlTableCrudTest {
    // Attributes
    private SqlTableCrud tableCrud;

    @BeforeEach
    public void setUp() {
        String connectionUrl = "jdbc:oracle:thin:@localhost:1521/XEPDB1";
        String user = "Sales";
        String password = "adminsales";
        String localhostIp = "localhost";
        String schema = "Sales";

        String tableName = "credenciales_usuarios";
        String primaryKey = "id_credencial";
        String nonRepeatableField = "email";
        String[] fields = { "id_credencial", "id_cliente", "id_vendedor", "tipo_usuario", "email", "salt", "hash" };
        String[] fieldTypes = { "INTEGER", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2", "VARCHAR2" };
        boolean[] nullableFields = { false, true, true, false, false, false, false };
        int maxRowCount = 100;

        tableCrud = new SqlTableCrud(connectionUrl, user, password, localhostIp, schema, tableName, primaryKey, fields,
                fieldTypes, nullableFields, nonRepeatableField, maxRowCount);
    }

    /**
     * Test the method to attempt delete a record by its id.
     */
    @Test
    void testAttemptToDeleteRecordById() {
        // StringWriter sw = new StringWriter();
        // PrintWriter out = new PrintWriter(sw);
    }

    /**
     * Test the method to attempt to display all the records.
     */
    @Test
    void testAttemptToDisplayAllRecords() {
        // StringWriter sw = new StringWriter();
        // PrintWriter out = new PrintWriter(sw);
        // HttpServletRequest request = mock(HttpServletRequest.class);
        // when(request.getParameter("param")).thenReturn("value");
    }

    /**
     * Test the method to attempt to get a page of records.
     */
    @Test
    void testAttemptToGetPageOfRecords() {

    }

    /**
     * Test the method to attempt to get a record by its id.
     */
    @Test
    void testAttemptToGetRecordById() {

    }

    /**
     * Test the method to attempt to insert a record.
     */
    @Test
    void testAttemptToInsertRecord() {

    }

    /**
     * Test the method to get the select everything query.
     */
    @Test
    void testGetCheckRowQuery() {
        int recordKey = 1;

        String expectedQuery = "SELECT * FROM Sales.credenciales_usuarios WHERE id_credencial = 1";
        String notExpectedQuery = "SELECT * FROM Registry.credencials WHERE id = 2";

        assertEquals(expectedQuery, tableCrud.getCheckRowQuery(recordKey));
        assertNotEquals(notExpectedQuery, tableCrud.getCheckRowQuery(2));
    }

    /**
     * Test the method to get the delete query.
     */
    @Test
    void testGetDeleteQuery() {
        int recordKey = 1;

        String expectedQuery = "DELETE FROM Sales.credenciales_usuarios WHERE id_credencial = 1";
        String notExpectedQuery = "DELETE FROM Registry.credencials WHERE id = 2";

        assertEquals(expectedQuery, tableCrud.getDeleteQuery(recordKey));
        assertNotEquals(notExpectedQuery, tableCrud.getDeleteQuery(2));
    }

    /**
     * Test the method to get the max number of pages.
     */
    @Test
    void testGetMaxNumberOfPages() {
        assertEquals(1, tableCrud.getMaxNumberOfPages(100));
        assertEquals(2, tableCrud.getMaxNumberOfPages(101));
        assertNotEquals(3, tableCrud.getMaxNumberOfPages(102));
    }

    /**
     * Test the method to get the next page URL.
     */
    @Test
    void testGetNextPageUrl() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getParameter("param")).thenReturn("value");

        assertEquals("\"http://localhost:8080/sales-system/salespage=2\"", tableCrud.getNextPageUrl(request, 1));
        assertNotEquals("\"http://localhost:8080/sales-system/salespage=2\"", tableCrud.getNextPageUrl(request, 0));
        assertEquals("\"http://localhost:8080/sales-system/salespage=27\"", tableCrud.getNextPageUrl(request, 26));
        assertNotEquals("\"http://localhost:8080/sales-system/salespage=-1\"", tableCrud.getNextPageUrl(request, 3));
    }

    /**
     * Test the method to get the select query with an offset.
     */
    @Test
    void testGetSelectOffsetQuery() {
        int offset = 25;
        String expectedQuery = "SELECT * FROM Sales.credenciales_usuarios ORDER BY id_credencial ASC OFFSET 25 ROWS FETCH NEXT 100 ROWS ONLY";
        String notExpectedQuery = "SELECT * FROM Registry.credencials ORDER BY id ASC OFFSET 25 ROWS FETCH NEXT 100 ROWS ONLY";

        assertEquals(expectedQuery, tableCrud.getSelectOffsetQuery(offset));
        assertNotEquals(notExpectedQuery, tableCrud.getSelectOffsetQuery(offset));
    }

    /**
     * Test the method to get the select query.
     */
    @Test
    void testGetSelectQuery() {
        String expectedQuery = "SELECT * FROM Sales.credenciales_usuarios";
        String notExpectedQuery = "SELECT * FROM Registry.credencials";

        assertEquals(expectedQuery, tableCrud.getSelectQuery());
        assertNotEquals(notExpectedQuery, tableCrud.getSelectQuery());
    }

    /**
     * Test the method to get the update query.
     */
    @Test
    void testGetUpdateQuery() {
        // String[] fields = { "id_credencial", "id_cliente", "id_vendedor",
        // "tipo_usuario", "email", "salt", "hash" };
        String jsonString = "{\"id_credencial\":\"1\",\"id_cliente\":\"1\", \"id_vendedor\":" + null
                + ",\"tipo_usuario\":\"cliente\",\"email\":\"abc@ejemplo.com\",\"salt\":\"abc123\",\"hash\":\"abc123\"}";
        JSONObject record = new JSONObject(jsonString);

        String expectedQuery = "UPDATE Sales.credenciales_usuarios SET id_credencial = '1', id_cliente = '1', id_vendedor = '', tipo_usuario = 'cliente', email = 'abc@ejemplo.com', salt = 'abc123', hash = 'abc123' WHERE id_credencial = 1";
        String notExpectedQuery = "UPDATE Registry.credencials SET id_credencial = '1', id_cliente = '1', id_vendedor = '', tipo_usuario = 'cliente', email = 'abc@ejemplo.com', salt = 'abc123', hash = 'abc123' WHERE id_credencial = 1";

        assertEquals(expectedQuery, tableCrud.getUpdateQuery(record, 1));
        assertNotEquals(notExpectedQuery, tableCrud.getUpdateQuery(record, 1));
    }

    /**
     * Test the method to insert a new record.
     */
    @Test
    void testInsertNewRecord() {

    }
}
