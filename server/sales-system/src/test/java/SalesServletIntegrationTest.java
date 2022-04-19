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
 * Integration testing for methods of the class {@link SalesServlet}.
 */
public class SalesServletIntegrationTest {
    // Attributes
    private SalesServlet salesServlet;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private HttpServletRequest newRequest;
    private HttpServletResponse newResponse;
    private HttpServletRequest otherRequest;
    private HttpServletResponse otherResponse;
    private StringWriter stringWriter;
    private PrintWriter out;
    private StringWriter newStringWriter;
    private PrintWriter newOut;
    private StringWriter otherStringWriter;
    private PrintWriter otherOut;

    @BeforeEach
    public void setUp() {
        salesServlet = new SalesServlet();
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
    }

    /**
     * Test that the number of rows can be read, that a new row can be inserted and
     * deleted.
     * It tests the
     * {@link SalesServlet#doGet(HttpServletRequest, HttpServletResponse)},
     * {@link SalesServlet#doPost(HttpServletRequest, HttpServletResponse)} and
     * {@link SalesServlet#doDelete(HttpServletRequest, HttpServletResponse)}
     * methods.
     *
     * @throws IOException
     * @throws ServletException
     */
    @Test
    void testRowInsertionAndRead() throws IOException, ServletException {
        String body = "{\"nombre\": \"Apple\"}";

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

        // Get the current brands
        salesServlet.doGet(request, response);

        // Get the number of brands
        JSONObject oldResponse = new JSONObject(stringWriter.toString());
        System.out.println("oldResponse: " + oldResponse);
        int oldRowCount = oldResponse.getInt("rowCount");

        // Insert a new brand
        salesServlet.doPost(newRequest, newResponse);
        System.out.println(newStringWriter.toString());

        // Get the new brands
        salesServlet.doGet(request, otherResponse);
        JSONObject newResponseJSON = new JSONObject(otherStringWriter.toString());
        System.out.println("newResponse: " + newResponseJSON);
        int newRowCount = newResponseJSON.getInt("rowCount");

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
        salesServlet.doDelete(otherRequest, otherResponse);

        // Get the new brands
        salesServlet.doGet(request, response);
        JSONObject newResponse2 = new JSONObject(stringWriter.toString());
        int newRowCount2 = newResponse2.getInt("rowCount");

        // Check that the number of brands did increase by one when inserting a new
        // brand
        assertEquals(oldRowCount + 1, newRowCount);

        // Check that the number of brands did decrease by one when deleting the newly
        // inserted brand
        assertEquals(oldRowCount, newRowCount2);
    }
}
