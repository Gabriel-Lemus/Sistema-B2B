import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import javax.servlet.http.HttpServletRequest;

import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Unit testing for methods of the class {@link SqlTableCrud}.
 */
public class SqlTableCrudTest {
    // Attributes
    private SqlTableCrud tableCrud;
    private Secrets secrets;

    /**
     * Sets up the test environment.
     */
    @BeforeEach
    public void setUp() {
        secrets = new Secrets();
        String connectionUrl = secrets.getOracleConnectionString();
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
     * Test the method {@link SqlTableCrud#getCheckRowQuery(int recordKey)} to get
     * the select everything query.
     */
    @Test
    void testGetCheckRowQuery() {
        // Arrange
        int recordKey = 1;

        // Act
        String expected = "SELECT * FROM Sales.credenciales_usuarios WHERE id_credencial = 1";
        String actual = tableCrud.getCheckRowQuery(recordKey);

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method {@link SqlTableCrud#getDeleteQuery(int recordKey)} to get
     * the delete query.
     */
    @Test
    void testGetDeleteQuery() {
        // Arrange
        int recordKey = 1;

        // Act
        String expected = "DELETE FROM Sales.credenciales_usuarios WHERE id_credencial = 1";
        String actual = tableCrud.getDeleteQuery(recordKey);

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method {@link SqlTableCrud#getDeleteQuery(int recordKey)} to get the
     * max number of pages.
     */
    @Test
    void testGetMaxNumberOfPages() {
        // Act & Assert
        assertEquals(1, tableCrud.getMaxNumberOfPages(100));
        assertEquals(2, tableCrud.getMaxNumberOfPages(101));
        assertNotEquals(3, tableCrud.getMaxNumberOfPages(102));
    }

    /**
     * Test the method
     * {@link SqlTableCrud#getNextPageUrl(HttpServletRequest request, int page)} to
     * get the next page URL.
     */
    @Test
    void testGetNextPageUrl() {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getParameter("param")).thenReturn("value");

        // Act
        String expected = "\"http://localhost:8080/sales-system/salespage=2\"";
        String actual = tableCrud.getNextPageUrl(request, 1);

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method {@link SqlTableCrud#getSelectOffsetQuery(int offset)} to get
     * the select query with an offset.
     */
    @Test
    void testGetSelectOffsetQuery() {
        // Arrange
        int offset = 25;

        // Act
        String expected = "SELECT * FROM Sales.credenciales_usuarios ORDER BY id_credencial ASC OFFSET 25 ROWS FETCH NEXT 100 ROWS ONLY";
        String actual = tableCrud.getSelectOffsetQuery(offset);

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method {@link SqlTableCrud#getSelectQuery()} to get the select
     * query.
     */
    @Test
    void testGetSelectQuery() {
        // Arrange
        String expected = "SELECT * FROM Sales.credenciales_usuarios";

        // Act
        String actual = tableCrud.getSelectQuery();

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method
     * {@link SqlTableCrud#getUpdateQuery(JSONObject json, int recordKey)} to get
     * the update query.
     */
    @Test
    void testGetUpdateQuery() {
        // Arrange
        String jsonString = "{\"id_credencial\":\"1\",\"id_cliente\":\"1\", \"id_vendedor\":" + null
                + ",\"tipo_usuario\":\"cliente\",\"email\":\"abc@ejemplo.com\",\"salt\":\"abc123\",\"hash\":\"abc123\"}";
        JSONObject record = new JSONObject(jsonString);

        // Act
        String expected = "UPDATE Sales.credenciales_usuarios SET id_credencial = '1', id_cliente = '1', id_vendedor = '', tipo_usuario = 'cliente', email = 'abc@ejemplo.com', salt = 'abc123', hash = 'abc123' WHERE id_credencial = 1";
        String actual = tableCrud.getUpdateQuery(record, 1);

        // Assert
        assertEquals(expected, actual);
    }
}
