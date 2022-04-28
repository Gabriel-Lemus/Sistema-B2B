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
     * Initializes the test.
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

    /**
     * Test the method for
     * {@link Mailer#doPost(HttpServletRequest, HttpServletResponse)} that allows to
     * send email receipts.
     * 
     * @throws IOException
     * @throws ServletException
     */
    @Test
    void testSendEmailReceipt() throws IOException, ServletException {
        String existingEmail = secrets.getEmail();
        String body = "{\"name\": \"Luis Pérez\",\"subTotal\": 146179.15,\"discounts\": 0,\"taxes\": 0,\"totalPrice\": 146179.15,\"date\": \"2022-03-27\",\"devices\": [{\"name\": \"Laptop\",\"quantity\": 5,\"unitPrice\": 7499.99},{\"name\": \"Fridge\",\"quantity\": 3,\"unitPrice\": 17500},{\"name\": \"Smart Watch\",\"quantity\": 15,\"unitPrice\": 3745.28}]}\"";

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

        mailer.doPost(request, response);
        String responseString = stringWriter.toString();
        assertTrue(responseString.contains("{\"success\":true,\"message\":\"Email sent.\"}"));
    }

    /**
     * Test the method for
     * {@link Mailer#doPost(HttpServletRequest, HttpServletResponse)} that allows to
     * send a credit purchase.
     * 
     * @throws IOException
     * @throws ServletException
     */
    @Test
    void testSendCreditPurchase() throws IOException, ServletException {
        String existingEmail = secrets.getEmail();
        String body = "{\"name\": \"Luis Pérez\",\"paymentLink\":\"http://localhost:8080/mail\",\"subTotal\": 146179.15,\"discounts\": 0,\"taxes\": 0,\"totalPrice\": 146179.15,\"date\": \"2022-03-27\",\"devices\": [{\"name\": \"Laptop\",\"quantity\": 5,\"unitPrice\": 7499.99},{\"name\": \"Fridge\",\"quantity\": 3,\"unitPrice\": 17500},{\"name\": \"Smart Watch\",\"quantity\": 15,\"unitPrice\": 3745.28}]}\"";

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

        mailer.doPost(request, response);
        String responseString = stringWriter.toString();
        assertTrue(responseString.contains("{\"success\":true,\"message\":\"Email sent.\"}"));
    }

    /**
     * Test the method for
     * {@link Mailer#doPost(HttpServletRequest, HttpServletResponse)} with incorrect
     * parameters.
     * 
     * @throws IOException
     * @throws ServletException
     */
    @Test
    void testSendEmailReceiptWithIncorrectParameters() throws IOException, ServletException {
        when(request.getParameter("param")).thenReturn("true");
        when(response.getWriter()).thenReturn(out);

        mailer.doPost(request, response);
        String responseString = stringWriter.toString();
        assertFalse(responseString.contains("{\"success\":true,\"message\":\"Email sent.\"}"));
    }
}
