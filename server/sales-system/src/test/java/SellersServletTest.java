import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Unit testing for methods of the class {@link SellersServlet}.
 */
public class SellersServletTest {
    // Attributes
    /** SellersServlet object to test. */
    private SellersServlet sellersServlet;
    /** HTTPServletRequest mock. */
    private HttpServletRequest request;
    /** HttpServletResponse mock. */
    private HttpServletResponse response;
    /** StringWriter to write to. */
    private StringWriter stringWriter;
    /** PrintWriter to write to. */
    private PrintWriter out;

    /**
     * Setup for tests.
     * 
     * @throws ServletException
     */
    @BeforeEach
    public void setUp() throws ServletException {
        sellersServlet = new SellersServlet();

        // Call the init method of the servlet
        sellersServlet.init();

        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        stringWriter = new StringWriter();
        out = new PrintWriter(stringWriter);
    }

    /**
     * Test the method
     * {@link SellersServlet#doGet(HttpServletRequest request, HttpServletResponse response)}
     * to check if all the devices are returned.
     * 
     * @throws IOException      if an I/O error occurs
     * @throws ServletException if a servlet exception occurs
     */
    @Test
    void testGetExistingDevices() throws IOException, ServletException {
        // Arrange
        when(request.getParameter("get")).thenReturn("true");
        when(request.getParameter("dispositivos")).thenReturn("true");
        when(request.getParameterMap()).thenReturn(new java.util.HashMap<String, String[]>() {
            {
                put("get", new String[] { "true" });
            }
        });
        when(request.getContentType()).thenReturn("application/json");
        when(request.getCharacterEncoding()).thenReturn("UTF-8");
        when(response.getWriter()).thenReturn(out);
        boolean expected = true;
        Object expectedDevicesType = JSONArray.class;
        JSONObject devicesResponse;

        // Act
        sellersServlet.doGet(request, response);
        devicesResponse = new JSONObject(stringWriter.toString());
        boolean actual = devicesResponse.getBoolean("success");
        Object actualDevicesType = devicesResponse.getJSONArray("dispositivos").getClass();

        // Assert
        assertEquals(expected, actual);
        assertEquals(expectedDevicesType, actualDevicesType);
    }

    /**
     * Test the method
     * {@link SellersServlet#doGet(HttpServletRequest request, HttpServletResponse response)}
     * to check if all the devices out of stock are returned.
     * 
     * @throws IOException      if an I/O error occurs
     * @throws ServletException if a servlet exception occurs
     */
    @Test
    void testGetNonExistingDevices() throws IOException, ServletException {
        // Arrange
        when(request.getParameter("get")).thenReturn("true");
        when(request.getParameter("dispositivosAgotados")).thenReturn("true");
        when(request.getParameterMap()).thenReturn(new java.util.HashMap<String, String[]>() {
            {
                put("get", new String[] { "true" });
            }
        });
        when(request.getContentType()).thenReturn("application/json");
        when(request.getCharacterEncoding()).thenReturn("UTF-8");
        when(response.getWriter()).thenReturn(out);
        boolean expected = true;
        Object expectedDevicesType = JSONArray.class;
        JSONObject devicesResponse;

        // Act
        sellersServlet.doGet(request, response);
        devicesResponse = new JSONObject(stringWriter.toString());
        boolean actual = devicesResponse.getBoolean("success");
        Object actualDevicesType = devicesResponse.getJSONArray("dispositivos").getClass();

        // Assert
        assertEquals(expected, actual);
        assertEquals(expectedDevicesType, actualDevicesType);
    }
}
