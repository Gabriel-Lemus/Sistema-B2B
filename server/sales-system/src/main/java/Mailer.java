import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Properties;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

@WebServlet("/mail")
public class Mailer extends HttpServlet {
    // Attributes
    private MailSecrets secrets = new MailSecrets();
    private ServletHelper helper = new ServletHelper();

    // ========================= CRUD Methods =========================
    /**
     * Method to allow the handling of the post request to the schema instance.
     * 
     * @param request  The request to be handled.
     * @param response The response to be handled.
     * @throws ServletException If the request could not be handled.
     * @throws IOException      If the request could not be handled.
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        if (helper.requestContainsParameter(request, "sendReceipt")
                || helper.requestContainsParameter(request, "sendCreditPurchase")) {
            String sender = secrets.getEmail();
            String password = secrets.getPassword();
            String recipient = request.getParameter("recipient");

            Properties properties = System.getProperties();
            properties.put("mail.smtp.host", "smtp.gmail.com");
            properties.put("mail.smtp.socketFactory.port", "465");
            properties.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            properties.put("mail.smtp.auth", "true");
            properties.put("mail.smtp.port", "465");

            Session session = Session.getDefaultInstance(properties, new javax.mail.Authenticator() {
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(sender, password);
                }
            });

            if (helper.requestContainsParameter(request, "sendReceipt")) {
                String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
                JSONObject body = new JSONObject(bodyStr);
                JSONArray items = body.getJSONArray("devices");
                String date = body.getString("date");
                float subTotal = body.getFloat("subTotal");
                float discounts = body.getFloat("discounts");
                float taxes = body.getFloat("taxes");
                float totalPrice = body.getFloat("totalPrice");

                try {
                    MimeMessage message = new MimeMessage(session);
                    message.setFrom(new InternetAddress(sender, "Sistema B2B"));
                    message.addRecipient(Message.RecipientType.TO, new InternetAddress(recipient));
                    message.setSubject("Factura de compra de " + body.getString("name"));

                    StringBuilder messageBuilder = new StringBuilder();
                    messageBuilder.append("<html><head><style>table{border-collapse: collapse;width: 100%;}");
                    messageBuilder.append("th, td {border: 1px solid #dddddd;padding: 8px;}");
                    messageBuilder.append("tr:nth-child(even){background-color: #dddddd;}</style></head>");
                    messageBuilder.append("<body><div style='background-color: #d1f6ed;padding: 20px;'>");
                    messageBuilder.append("<table><tr><th>Nombre</th><th>Cantidad</th><th>Precio</th></tr>");

                    for (int i = 0; i < items.length(); i++) {
                        JSONObject item = items.getJSONObject(i);
                        messageBuilder.append("<tr><td>" + item.getString("name") + "</td>");
                        messageBuilder.append("<td>" + item.getInt("quantity") + "</td>");
                        messageBuilder.append("<td>" + item.getFloat("unitPrice") + "</td></tr>");
                    }

                    messageBuilder.append("</table><b>Subtotal:</b> " + subTotal + "<br><b>Descuentos:</b> " + discounts
                            + "<br><b>Impuestos:</b> " + taxes + "<br><b>Total:</b> " + totalPrice);
                    messageBuilder.append("</div></body></html>");
                    message.setContent(messageBuilder.toString(), "text/html");
                    Transport.send(message);

                    out.print("{\"success\":" + true + ",\"message\":\"" + "Email sent." + "\"}");
                } catch (MessagingException e) {
                    out.print("{\"success\":" + false + ",\"message\":\"" + "Email could not be sent." + "\"}");
                }
            } else {
                String bodyStr = request.getReader().lines().reduce("", (acc, cur) -> acc + cur);
                JSONObject body = new JSONObject(bodyStr);
                JSONArray items = body.getJSONArray("devices");
                String date = body.getString("date");
                float subTotal = body.getFloat("subTotal");
                float discounts = body.getFloat("discounts");
                float taxes = body.getFloat("taxes");
                float totalPrice = body.getFloat("totalPrice");
                String paymentLink = body.getString("paymentLink");

                try {
                    MimeMessage message = new MimeMessage(session);
                    message.setFrom(new InternetAddress(sender, "Sistema B2B"));
                    message.addRecipient(Message.RecipientType.TO, new InternetAddress(recipient));
                    message.setSubject("Compras a Crédito Mensuales de " + body.getString("name"));

                    StringBuilder messageBuilder = new StringBuilder();
                    messageBuilder.append("<html><head><style>table{border-collapse: collapse;width: 100%;}");
                    messageBuilder.append("th, td {border: 1px solid #dddddd;padding: 8px;}");
                    messageBuilder.append("tr:nth-child(even){background-color: #dddddd;}</style></head>");
                    messageBuilder.append("<body><div style='background-color: #d1f6ed;padding: 20px;'>");
                    messageBuilder.append("<table><tr><th>Nombre</th><th>Cantidad</th><th>Precio</th></tr>");

                    for (int i = 0; i < items.length(); i++) {
                        JSONObject item = items.getJSONObject(i);
                        messageBuilder.append("<tr><td>" + item.getString("name") + "</td>");
                        messageBuilder.append("<td>" + item.getInt("quantity") + "</td>");
                        messageBuilder.append("<td>" + item.getFloat("unitPrice") + "</td></tr>");
                    }

                    messageBuilder.append("</table><b>Subtotal:</b> " + subTotal + "<br><b>Descuentos:</b> " + discounts
                            + "<br><b>Impuestos:</b> " + taxes + "<br><b>Total:</b> " + totalPrice);
                    messageBuilder.append("<br>Para realizar su pago, por favor haga click en el siguiente botón:");
                    messageBuilder.append("<br><button style='background-color: #449342;padding: 20px;'><a href='"
                            + paymentLink + "'>Pagar</a></button>");
                    messageBuilder
                            .append("<br>O si eso no funciona, copie y pegue el siguiente link en su navegador:</br>");
                    messageBuilder.append(
                            "<a style='background-color: #449342;' href='" + paymentLink + "'>" + paymentLink + "</a>");
                    messageBuilder.append("</div></body></html>");
                    message.setContent(messageBuilder.toString(), "text/html");
                    Transport.send(message);

                    out.print("{\"success\":" + true + ",\"message\":\"" + "Email sent." + "\"}");
                } catch (MessagingException e) {
                    out.print("{\"success\":" + false + ",\"message\":\"" + "Email could not be sent." + "\"}");
                }
            }
        } else {
            helper.printJsonMessage(out, false, "message", "Incorrect parameters.");
        }
    }

    /**
     * Method to allow the handling of the get request to the schema instance.
     * 
     * @param request  The request to be handled.
     * @param response The response to be handled.
     * @throws ServletException If the request could not be handled.
     * @throws IOException      If the request could not be handled.
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        out.print("{\"success\":" + false + ",\"message\":\"" + "Method not yet implemented." + "\"}");
    }

    /**
     * Method to allow the handling of the put request to the schema instance.
     * 
     * @param request  The request to be handled.
     * @param response The response to be handled.
     * @throws ServletException If the request could not be handled.
     * @throws IOException      If the request could not be handled.
     */
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        out.print("{\"success\":" + false + ",\"message\":\"" + "Method not yet implemented." + "\"}");
    }

    /**
     * Method to allow the handling of the delete request to the schema instance.
     * 
     * @param request  The request to be handled.
     * @param response The response to be handled.
     * @throws ServletException If the request could not be handled.
     * @throws IOException      If the request could not be handled.
     */
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        out.print("{\"success\":" + false + ",\"message\":\"" + "Method not yet implemented." + "\"}");
    }
}
