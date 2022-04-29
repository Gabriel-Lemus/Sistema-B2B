import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Singleton class for the Oracle database connection.
 */
public class OracleConnectionSingleton {
    // Class attributes
    /** Instance of the OracleConnectionSingleton. */
    private static OracleConnectionSingleton instance = null;
    /** Connection to the Oracle database. */
    private static Connection connection = null;
    /** User name for the Oracle database. */
    private static String user;
    /** Password for the Oracle database. */
    private static String password;
    /** Oracle database connection string. */
    private static String connectionString = new Secrets().getOracleConnectionString();

    /** Private constructor for the OracleConnectionSingleton. */
    private OracleConnectionSingleton() {
        try {
            Class.forName("oracle.jdbc.driver.OracleDriver");
            connection = DriverManager.getConnection(connectionString, user, password);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Get the connection to the Oracle database.
     * 
     * @param userStr     User name for the Oracle database.
     * @param passwordStr Password for the Oracle database.
     * 
     * @return Connection to the Oracle database.
     */
    public static Connection getConnection(String userStr, String passwordStr) {
        user = userStr;
        password = passwordStr;

        if (instance == null) {
            instance = new OracleConnectionSingleton();
        }

        return connection;
    }

    /**
     * Change the user name and password for the Oracle database and return the new
     * connection.
     * 
     * @param userStr     User name for the Oracle database.
     * @param passwordStr Password for the Oracle database.
     * @return Connection to the Oracle database.
     */
    public static Connection changeConnection(String userStr, String passwordStr) {
        user = userStr;
        password = passwordStr;

        instance = new OracleConnectionSingleton();
        return connection;
    }

    /**
     * Close the connection to the Oracle database.
     * 
     * @throws SQLException If the connection to the Oracle database cannot be
     *                      closed.
     */
    public static void closeConnection() throws SQLException {
        // Close the connection if it is open.
        if (!connection.isClosed()) {
            connection.close();
        }
    }
}
