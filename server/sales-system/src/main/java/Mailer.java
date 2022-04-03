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
    private Secrets secrets = new Secrets();
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
                String date = helper.getCurrentDateAndTime();
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
                    messageBuilder.append("<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head><body>");
                    messageBuilder.append("<div style='width: 650px; max-width: 90vw; min-width: 300px; padding: 25px; margin: 42px auto; background-color: #d1f6ed; border-radius: 10px;'>");
                    messageBuilder.append("<div style='margin-bottom: 50px;'><h2 style='font-size: 2rem; text-align: center !important; margin-top: 1rem !important; margin-bottom: 1rem !important;'>¡Gracias por su compra!</h2>");
                    messageBuilder.append("<p style='font-size: 1rem; text-align: center !important; color: #6c757d !important;'>" + date + "</p></div>");       
                    messageBuilder.append("<div style='margin-bottom: 25px; width: 85%; margin: 0 auto; font-size: 1rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';'><table style='box-sizing: border-box; width: 100%; margin-bottom: 1rem; color: #212529; border-collapse: collapse; display: table; text-indent: initial; border-spacing: 2px; border-color: grey;'><tbody>");

                    for (int i = 0; i < items.length(); i++) {
                        JSONObject item = items.getJSONObject(i);
                        messageBuilder.append("<tr><td style='font-size: 1rem;'>" + item.getString("name") + "</td>");
                        messageBuilder.append("<td style='font-size: 1rem; color: #6c757d !important; font-weight: 400 !important; text-align: right !important;'>Q. " + helper.formatNumber(helper.round(item.getFloat("unitPrice"), 2)) + "</td>");
                        messageBuilder.append("<td style='font-size: 1rem; color: #6c757d !important; font-weight: 400 !important; text-align: left !important;'>x " + item.getInt("quantity") + "</td>");
                        messageBuilder.append("<td style='font-size: 1rem; text-align: right !important;'>Q. " + helper.formatNumber(helper.round(item.getInt("quantity") * item.getFloat("unitPrice"), 2)) + "</td></tr>");
                    }

                    messageBuilder.append("</tbody></table>");
                    messageBuilder.append("<table style='padding-top: 1rem; width: 100%; margin-bottom: 0px; color: #212529; border-collapse: collapse; border-top: 1.5px solid black; border-bottom: 1.5px solid black;'><tbody><tr><th style='padding-top: 1rem; font-size: 1rem; text-align: left !important; font-weight: 400 !important; font-style: italic !important; margin-top: 1rem !important;'>Subtotal</th>");
                    messageBuilder.append("<td style='padding-top: 1rem; font-size: 1rem; text-align: right !important; font-weight: 400 !important; font-style: italic !important;'>Q. " + helper.formatNumber(helper.round(subTotal, 2)) + "</td></tr><tr><th style='font-size: 1rem; text-align: left !important; font-weight: 400 !important; font-style: italic !important;'>Descuentos</th>");
                    messageBuilder.append("<td style='font-size: 1rem; text-align: right !important; font-weight: 400 !important; font-style: italic !important;'>- Q. " + helper.formatNumber(helper.round(discounts, 2)) + "</td></tr><tr><th style='padding-bottom: 1rem; font-size: 1rem; text-align: left !important; font-weight: 400 !important; font-style: italic !important;'>Impuestos + Comisión de Ventas</th>");
                    messageBuilder.append("<td style='padding-bottom: 1rem; font-size: 1rem; text-align: right !important; font-weight: 400 !important; font-style: italic !important;'>Q. " + helper.formatNumber(helper.round(taxes, 2)) + "</td></tr></tbody></table>");
                    messageBuilder.append("<table style='border-top: none; border-bottom: 2.5px solid black; width: 100%; margin-bottom: 0px; color: #212529; border-collapse: collapse; border-top: 1.5px solid black; border-bottom: 1.5px solid black;'><tbody><tr><th style='font-size: 1rem; text-align: left !important; font-style: italic !important; padding-top: 1rem; padding-bottom: 1rem;'>Total</th>");
                    messageBuilder.append("<td style='padding-top: 1rem; padding-bottom: 1rem; font-size: 1rem; font-weight: 700 !important; text-align: right !important; font-style: italic !important;'>Q. " + helper.formatNumber(helper.round(totalPrice, 2)) + "</td></tr></tbody></table><hr style='border-top: 2.7px solid black;'><p style='text-align: center !important; margin-top: 1.5rem !important; margin-bottom: 0.5rem !important; font-weight: 500 !important; font-size: 1rem;'>Sistema B2B</p></div></div></body></html>");
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
                            + "<br><b>Impuestos + Comisión de Ventas:</b> " + taxes + "<br><b>Total:</b> " + totalPrice);
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
