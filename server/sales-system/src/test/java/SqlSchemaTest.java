import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.DelegatingServletInputStream;

/**
 * Unit testing for methods of the class {@link SqlSchema}.
 */
public class SqlSchemaTest {
    // Attributes
    /** SQLSchema object */
    SqlSchema sqlSchema;
    /** Secrets object */
    Secrets secrets;
    /** HTTPServletRequest mock. */
    private HttpServletRequest request;
    /** HttpServletResponse mock. */
    private HttpServletResponse response;
    /** HTTPServletRequest mock. */
    private HttpServletRequest newRequest;
    /** HttpServletResponse mock. */
    private HttpServletResponse newResponse;
    /** HTTPServletRequest mock. */
    private HttpServletRequest otherRequest;
    /** HttpServletResponse mock. */
    private HttpServletResponse otherResponse;
    /** StringWriter to write to. */
    private StringWriter stringWriter;
    /** PrintWriter to write to. */
    private PrintWriter out;
    /** StringWriter to write to. */
    private StringWriter newStringWriter;
    /** PrintWriter to write to. */
    private PrintWriter newOut;
    /** StringWriter to write to. */
    private StringWriter otherStringWriter;
    /** PrintWriter to write to. */
    private PrintWriter otherOut;

    /**
     * Setup for tests.
     */
    @BeforeEach
    public void setUp() {
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        newRequest = mock(HttpServletRequest.class);
        newResponse = mock(HttpServletResponse.class);
        otherRequest = mock(HttpServletRequest.class);
        otherResponse = mock(HttpServletResponse.class);
        stringWriter = new StringWriter();
        out = new PrintWriter(stringWriter);
        newStringWriter = new StringWriter();
        newOut = new PrintWriter(newStringWriter);
        otherStringWriter = new StringWriter();
        otherOut = new PrintWriter(otherStringWriter);
        secrets = new Secrets();
        sqlSchema = new SqlSchema(secrets.getOracleConnectionString(), "Sales", "adminsales", "localhost", "Sales",
                new String[] { "credenciales_usuarios", "clientes", "vendedores", "marcas" },
                new String[] { "id_credencial", "id_cliente", "id_vendedor", "id_marca" },
                new String[] { "email", null, "nombre", "nombre" },
                new String[][] {
                        { "id_credencial", "id_cliente", "id_vendedor", "tipo_usuario", "email", "salt", "hash" },
                        { "id_cliente", "nombre", "nit", "email", "telefono", "patente_comercio", "tipo_cliente",
                                "tiene_suscripcion", "vencimiento_suscripcion" },
                        { "id_vendedor", "nombre", "es_admin" },
                        { "id_marca", "nombre" },
                },
                new String[][] {
                        { "INTEGER", "INTEGER", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2", "VARCHAR2" },
                        { "INTEGER", "VARCHAR2", "INTEGER", "VARCHAR2", "VARCHAR2", "VARCHAR2", "VARCHAR2", "VARCHAR2",
                                "DATE" },
                        { "INTEGER", "VARCHAR2", "VARCHAR2" },
                        { "INTEGER", "VARCHAR2" },
                },
                new boolean[][] {
                        { false, true, true, false, false, false, false },
                        { false, false, true, true, true, true, true, false, true },
                        { false, false, false },
                        { false, false },
                },
                new int[] { 100, 100, 100, 100 });
    }

    /**
     * Test that the CRUD methods for the sales servlet are working correctly.
     * It tests the
     * {@link SqlSchema#handleGet(HttpServletRequest request, HttpServletResponse response)},
     * {@link SqlSchema#handlePost(HttpServletRequest request, HttpServletResponse response)}
     * {@link SqlSchema#handlePut(HttpServletRequest request, HttpServletResponse response)}
     * and
     * {@link SqlSchema#handleDelete(HttpServletRequest request, HttpServletResponse response)}
     * methods.
     *
     * @throws IOException
     * @throws ServletException
     */
    @Test
    void testCrudOperations() throws IOException, ServletException {
        // Arrange
        String body = "{\"nombre\": \"Apple\"}";
        String newBody = "{\"nombre\": \"Apple ABC\"}";

        when(request.getParameter("table")).thenReturn("marcas");
        when(request.getParameterMap()).thenReturn(new java.util.HashMap<String, String[]>() {
            {
                put("table", new String[] { "marcas" });
            }
        });
        when(request.getContentType()).thenReturn("application/json");
        when(request.getCharacterEncoding()).thenReturn("UTF-8");
        when(response.getWriter()).thenReturn(out);
        when(newRequest.getParameter("table")).thenReturn("marcas");
        when(newRequest.getParameterMap()).thenReturn(new java.util.HashMap<String, String[]>() {
            {
                put("table", new String[] { "marcas" });
            }
        });
        when(newRequest.getParameter("body")).thenReturn(body);
        when(newRequest.getInputStream()).thenReturn(
                new DelegatingServletInputStream(new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8))));
        when(newRequest.getReader()).thenReturn(
                new BufferedReader(new StringReader(body)));
        when(newRequest.getContentType()).thenReturn("application/json");
        when(newRequest.getCharacterEncoding()).thenReturn("UTF-8");
        when(newResponse.getWriter()).thenReturn(newOut);
        when(otherResponse.getWriter()).thenReturn(otherOut);

        // Act
        // Get the current brands
        sqlSchema.handleGet(request, response);

        // Get the number of brands
        JSONObject oldResponse = new JSONObject(stringWriter.toString());
        int oldRowCount = oldResponse.getInt("rowCount");

        // Insert a new brand
        sqlSchema.handlePost(newRequest, newResponse);

        // Get the new brands
        sqlSchema.handleGet(request, otherResponse);
        JSONObject newResponseJSON = new JSONObject(otherStringWriter.toString());
        int newRowCount = newResponseJSON.getInt("rowCount");

        // Update the new brand
        otherStringWriter = new StringWriter();
        otherOut = new PrintWriter(otherStringWriter);
        when(otherRequest.getParameter("table")).thenReturn("marcas");
        when(otherRequest.getParameter("id")).thenReturn(Integer.toString(newRowCount));
        when(otherRequest.getParameterMap()).thenReturn(new java.util.HashMap<String, String[]>() {
            {
                put("table", new String[] { "marcas" });
                put("id", new String[] { Integer.toString(newRowCount) });
            }
        });
        when(otherRequest.getParameter("body")).thenReturn(newBody);
        when(otherRequest.getInputStream()).thenReturn(
                new DelegatingServletInputStream(new ByteArrayInputStream(newBody.getBytes(StandardCharsets.UTF_8))));
        when(otherRequest.getReader()).thenReturn(
                new BufferedReader(new StringReader(newBody)));
        when(otherRequest.getContentType()).thenReturn("application/json");
        when(otherRequest.getCharacterEncoding()).thenReturn("UTF-8");
        when(otherResponse.getWriter()).thenReturn(otherOut);
        sqlSchema.handlePut(otherRequest, otherResponse);
        sqlSchema.handleGet(request, response);
        String expectedUpdatedBrand = "Apple ABC";
        String actualUpdatedBrand = new JSONObject(otherStringWriter.toString()).getJSONObject("dataModified")
                .getString("nombre");

        // Delete the newly inserted brand
        otherStringWriter = new StringWriter();
        otherOut = new PrintWriter(otherStringWriter);
        when(otherRequest.getParameter("table")).thenReturn("marcas");
        when(otherRequest.getParameter("id")).thenReturn(Integer.toString(newRowCount));
        when(otherRequest.getParameterMap()).thenReturn(new java.util.HashMap<String, String[]>() {
            {
                put("table", new String[] { "marcas" });
                put("id", new String[] { Integer.toString(newRowCount) });
            }
        });
        when(otherRequest.getParameter("body")).thenReturn(body);
        when(otherRequest.getInputStream()).thenReturn(
                new DelegatingServletInputStream(new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8))));
        when(otherRequest.getReader()).thenReturn(
                new BufferedReader(new StringReader(body)));
        when(otherRequest.getContentType()).thenReturn("application/json");
        when(otherRequest.getCharacterEncoding()).thenReturn("UTF-8");
        when(otherResponse.getWriter()).thenReturn(otherOut);

        // Delete the newly inserted brand
        sqlSchema.handleDelete(otherRequest, otherResponse);

        // Get the new brands
        sqlSchema.handleGet(request, response);
        JSONObject newResponse2 = new JSONObject(stringWriter.toString());
        int newRowCount2 = newResponse2.getInt("rowCount");

        // Assert
        assertEquals(oldRowCount + 1, newRowCount);
        assertEquals(oldRowCount, newRowCount2);
        assertEquals(expectedUpdatedBrand, actualUpdatedBrand);
    }
}
