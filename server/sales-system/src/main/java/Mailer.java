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
                    messageBuilder.append("<!DOCTYPE html><head><style type='text/css'>body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #d1f6ed; }");
                    messageBuilder.append(".mail-form { width: 650px; max-width: 90vw; min-width: 300px; padding: 25px; margin: 42px auto; background-color: $white; border-radius: 10px; }");
                    messageBuilder.append(".mail-form-header { margin-bottom: 50px; } .mail-form-body { margin-bottom: 25px; width: 85%; margin: 0 auto; }");
                    messageBuilder.append(".bold-table-rows { border-top: 1.5px solid black; border-bottom: 1.5px solid black; } .bold-table-rows-2 { border-top: none; border-bottom: 2.5px solid black; }");
                    messageBuilder.append(".table-double-border { margin-top: 7px; border-top: 2.7px solid black; } .table { width: 100%; margin-bottom: 1rem; color: #212529; } .text-muted { color: #6c757d !important; } .text-secondary { color: #6c757d !important; } ");
                    messageBuilder.append(".font-weight-normal { font-weight: 400 !important; } .text-right { text-align: right !important; } .text-left { text-align: left !important; } ");
                    messageBuilder.append("");
                    messageBuilder.append("</style></head><body>");
                    messageBuilder.append("<div class='mail-form'><div class='mail-form-header'><h2 class='text-center mt-3 mb-5'>¡Gracias por su compra!</h2>");
                    messageBuilder.append("<h4 class='text-center mt-3 mb-3'>Detalle:</h4><p class='text-center text-muted'>" + date + "</p></div>");
                    messageBuilder.append("<div class='mail-form-body'><table class='body' style='margin-bottom: 0px;'><tbody>");

                    for (int i = 0; i < items.length(); i++) {
                        JSONObject item = items.getJSONObject(i);
                        messageBuilder.append("<tr><td>" + item.getString("name") + "</td>");
                        messageBuilder.append("<td class='text-right text-muted font-weight-normal text-secondary'>Q. " + item.getFloat("unitPrice") + "</td></tr>");
                        messageBuilder.append("<td class='text-left text-muted font-weight-normal text-secondary'>x " + item.getInt("quantity") + "</td>");
                        messageBuilder.append("<td class='text-right'>Q. " + item.getInt("quantity") * item.getFloat("unitPrice") + "</td></tr>");
                    }

                    messageBuilder.append("</tbody></table>");
                    messageBuilder.append("<table class='table bold-table-rows' style='margin-bottom: 0px;'><tbody><tr><th class='text-left font-weight-normal font-italic'>Subtotal</th>");
                    messageBuilder.append("<th class='text-right font-weight-normal font-italic'>Q. " + subTotal + "</th></tr><tr><th class='text-left font-weight-normal font-italic'>Descuentos</th>");
                    messageBuilder.append("<th class='text-right font-weight-normal font-italic'>Q. " + discounts + "</th></tr><tr><th class='text-left font-weight-normal font-italic'>Impuestos</th>");
                    messageBuilder.append("<th class='text-right font-weight-normal font-italic'>Q. " + taxes + "</th></tr></tbody></table>");
                    messageBuilder.append("<table class='table bold-table-rows-2' style='margin-bottom: 0px;'><tbody><tr><th class='text-left font-weight-normal font-weight-bold font-italic'>Total</th>");
                    messageBuilder.append("<th class='text-right font-weight-normal font-weight-bold font-italic'>Q. " + totalPrice + "</th></tr></tbody></table><hr class='table-double-border'><p class='text-center font-weight-bold mt-4 mb-4'>Sistema B2B</p>");
                    messageBuilder.append("</div></div></body></html>");
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
                // String date = body.getString("date");
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
