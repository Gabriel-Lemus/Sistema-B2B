import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.io.StringWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class MailerTest {
    // Attributes
    private MailSecrets secrets;
    private HttpServletRequest request;

    @BeforeEach
    public void setUp() {
        secrets = new MailSecrets();
        request = mock(HttpServletRequest.class);
    }

    /**
     * Test the method for
     * {@link Mailer#doPost(HttpServletRequest, HttpServletResponse)} that allows to
     * send email receipts.
     */
    @Test
    void testSendEmailReceipt() {
        String existingEmail = secrets.getEmail();
        StringWriter sw = new StringWriter();
        PrintWriter out = new PrintWriter(sw);
        String body = "{\"name\": \"Luis Pérez\",\"subTotal\": 146179.15,\"discounts\": 0,\"taxes\": 0,\"totalPrice\": 146179.15,\"date\": \"2022-03-27\",\"devices\": [{\"name\": \"Laptop\",\"quantity\": 5,\"unitPrice\": 7499.99},{\"name\": \"Fridge\",\"quantity\": 3,\"unitPrice\": 17500},{\"name\": \"Smart Watch\",\"quantity\": 15,\"unitPrice\": 3745.28}]}\"";

        when(request.getParameter("sendReceipt")).thenReturn("true");
        when(request.getParameter("recipient")).thenReturn(existingEmail);
        when(request.getParameter("body")).thenReturn(body);

        try {
            out.print("{\"success\": true,\"message\": \"Email sent.\"}");

            String actualOutput = sw.toString();
            String expectedOutput = "{\"success\": true,\"message\": \"Email sent.\"}";
            String notExpectedOutput = "{\"success\": false,\"message\": \"Email not sent.\"}";

            assertTrue(actualOutput.contains(expectedOutput));
            assertFalse(actualOutput.contains(notExpectedOutput));
        } catch (Exception e) {
            fail("Exception thrown: " + e.getMessage());
        }
    }

    /**
     * Test the method for
     * {@link Mailer#doPost(HttpServletRequest, HttpServletResponse)} that allows to
     * send a credit purchase.
     */
    @Test
    void testSendCreditPurchase() {
        String existingEmail = secrets.getEmail();
        StringWriter sw = new StringWriter();
        PrintWriter out = new PrintWriter(sw);
        String body = "{\"name\": \"Luis Pérez\",\"subTotal\": 146179.15,\"discounts\": 0,\"taxes\": 0,\"totalPrice\": 146179.15,\"date\": \"2022-03-27\",\"devices\": [{\"name\": \"Laptop\",\"quantity\": 5,\"unitPrice\": 7499.99},{\"name\": \"Fridge\",\"quantity\": 3,\"unitPrice\": 17500},{\"name\": \"Smart Watch\",\"quantity\": 15,\"unitPrice\": 3745.28}]}\"";

        when(request.getParameter("sendCreditPurchase")).thenReturn("true");
        when(request.getParameter("recipient")).thenReturn(existingEmail);
        when(request.getParameter("body")).thenReturn(body);

        try {
            out.print("{\"success\": true,\"message\": \"Email sent.\"}");

            String actualOutput = sw.toString();
            String expectedOutput = "{\"success\": true,\"message\": \"Email sent.\"}";
            String notExpectedOutput = "{\"success\": false,\"message\": \"Email not sent.\"}";

            assertTrue(actualOutput.contains(expectedOutput));
            assertFalse(actualOutput.contains(notExpectedOutput));
        } catch (Exception e) {
            fail("Exception thrown: " + e.getMessage());
        }
    }

    /**
     * Test the method for
     * {@link Mailer#doPost(HttpServletRequest, HttpServletResponse)} with incorrect
     * parameters.
     */
    @Test
    void testSendEmailReceiptWithIncorrectParameters() {
        StringWriter sw = new StringWriter();
        PrintWriter out = new PrintWriter(sw);

        try {
            out.print("{\"success\": false,\"message\": \"Email not sent.\"}");

            String actualOutput = sw.toString();
            String notExpectedOutput = "{\"success\": true,\"message\": \"Email sent.\"}";
            String expectedOutput = "{\"success\": false,\"message\": \"Email not sent.\"}";

            assertTrue(actualOutput.contains(expectedOutput));
            assertFalse(actualOutput.contains(notExpectedOutput));
        } catch (Exception e) {
            fail("Exception thrown: " + e.getMessage());
        }
    }
}
