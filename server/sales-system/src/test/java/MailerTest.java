import static org.junit.jupiter.api.Assertions.*;
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

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.DelegatingServletInputStream;

/**
 * Unit testing for methods of the class {@link Mailer}.
 */
public class MailerTest {
    // Attributes
    /** Mailer object to test. */
    private Mailer mailer;
    /** Secrets object. */
    private Secrets secrets;
    /** HttpServletRequest mock. */
    private HttpServletRequest request;
    /** HttpServletResponse mock. */
    private HttpServletResponse response;
    /** StringWriter to write to. */
    private StringWriter stringWriter;
    /** PrintWriter to write to. */
    private PrintWriter out;

    /**
     * Test setup.
     */
    @BeforeEach
    public void setUp() {
        mailer = new Mailer();
        secrets = new Secrets();
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        stringWriter = new StringWriter();
        out = new PrintWriter(stringWriter);
    }

    /** Get test JSON object */
    private JSONObject getTestJson() {
        JSONObject testJson = new JSONObject();

        testJson.put("name", "Luis Pérez");
        testJson.put("paymentLink", "http://localhost:8080/mail");
        testJson.put("subTotal", 146179.15);
        testJson.put("discounts", 0);
        testJson.put("taxes", 0);
        testJson.put("totalPrice", 146179.15);
        testJson.put("date", "2022-03-27");

        JSONArray jsonDevices = new JSONArray();

        JSONObject jsonDevice1 = new JSONObject();
        jsonDevice1.put("name", "Laptop");
        jsonDevice1.put("quantity", 5);
        jsonDevice1.put("unitPrice", 7499.99);

        JSONObject jsonDevice2 = new JSONObject();
        jsonDevice2.put("name", "Fridge");
        jsonDevice2.put("quantity", 3);
        jsonDevice2.put("unitPrice", 17500);

        JSONObject jsonDevice3 = new JSONObject();
        jsonDevice3.put("name", "Smart Watch");
        jsonDevice3.put("quantity", 15);
        jsonDevice3.put("unitPrice", 3745.28);

        jsonDevices.put(jsonDevice1);
        jsonDevices.put(jsonDevice2);
        jsonDevices.put(jsonDevice3);

        testJson.put("devices", jsonDevices);

        return testJson;
    }

    /**
     * Test the method for
     * {@link Mailer#doPost(HttpServletRequest request, HttpServletResponse response)}
     * that allows to send email receipts.
     * 
     * @throws IOException
     * @throws ServletException
     */
    @Test
    void testSendEmailReceipt() throws IOException, ServletException {
        // Arrange
        String existingEmail = secrets.getEmail();
        String body = getTestJson().toString();

        when(request.getParameter("sendReceipt")).thenReturn("true");
        when(request.getParameter("recipient")).thenReturn(existingEmail);
        when(request.getParameter("body")).thenReturn(body);
        when(request.getInputStream()).thenReturn(
                new DelegatingServletInputStream(new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8))));
        when(request.getReader()).thenReturn(
                new BufferedReader(new StringReader(body)));
        when(request.getContentType()).thenReturn("application/json");
        when(request.getCharacterEncoding()).thenReturn("UTF-8");
        when(response.getWriter()).thenReturn(out);

        // Act
        mailer.doPost(request, response);
        String responseString = stringWriter.toString();

        // Assert
        assertTrue(responseString.contains("{\"success\":true,\"message\":\"Email sent.\"}"));
    }

    /**
     * Test the method for
     * {@link Mailer#doPost(HttpServletRequest request, HttpServletResponse response)}
     * that allows to send a credit purchase.
     * 
     * @throws IOException
     * @throws ServletException
     */
    @Test
    void testSendCreditPurchase() throws IOException, ServletException {
        // Arrange
        String existingEmail = secrets.getEmail();
        String body = getTestJson().toString();

        when(request.getParameter("sendCreditPurchase")).thenReturn("true");
        when(request.getParameter("recipient")).thenReturn(existingEmail);
        when(request.getParameter("body")).thenReturn(body);
        when(request.getInputStream()).thenReturn(
                new DelegatingServletInputStream(new ByteArrayInputStream(body.getBytes(StandardCharsets.UTF_8))));
        when(request.getReader()).thenReturn(
                new BufferedReader(new StringReader(body)));
        when(request.getContentType()).thenReturn("application/json");
        when(request.getCharacterEncoding()).thenReturn("UTF-8");
        when(response.getWriter()).thenReturn(out);

        // Act
        mailer.doPost(request, response);
        String responseString = stringWriter.toString();

        // Assert
        assertTrue(responseString.contains("{\"success\":true,\"message\":\"Email sent.\"}"));
    }

    /**
     * Test the method for
     * {@link Mailer#doPost(HttpServletRequest request, HttpServletResponse response)}
     * with incorrect parameters.
     * 
     * @throws IOException
     * @throws ServletException
     */
    @Test
    void testSendEmailReceiptWithIncorrectParameters() throws IOException, ServletException {
        // Arrange
        when(request.getParameter("param")).thenReturn("true");
        when(response.getWriter()).thenReturn(out);

        // Act
        mailer.doPost(request, response);
        String responseString = stringWriter.toString();

        // Assert
        assertFalse(responseString.contains("{\"success\":true,\"message\":\"Email sent.\"}"));
    }
}
