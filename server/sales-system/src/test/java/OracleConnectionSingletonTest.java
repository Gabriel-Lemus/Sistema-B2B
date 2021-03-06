import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.SQLException;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Unit testing for methods of the class {@link OracleConnectionSingleton}.
 */
public class OracleConnectionSingletonTest {
    /** Oracle database connection singleton. */
    private Connection oracleConnectionSingleton;
    /** Another Oracle database connection singleton. */
    private Connection otherOracleConnectionSingleton;
    /** User name for the Oracle database. */
    private String user = "system";
    /** Password for the Oracle database. */
    private String password = "Oracle18c";

    /** Instantiate the OracleConnectionSingleton before each test. */
    @BeforeEach
    public void setUp() {
        oracleConnectionSingleton = OracleConnectionSingleton.getConnection(user, password);
        otherOracleConnectionSingleton = OracleConnectionSingleton.getConnection(user, password);
    }

    /**
     * Close the Oracle database connection after each test.
     * 
     * @throws SQLException If the connection to the Oracle database cannot be
     *                      closed.
     */
    @AfterEach
    public void tearDown() throws SQLException {
        OracleConnectionSingleton.closeConnection();
    }

    /**
     * Test instantiation of the OracleConnectionSingleton.
     * 
     * @throws SQLException If the connection to the Oracle database fails.
     */
    @Test
    void testCreateNewConnection() throws SQLException {
        // Arrange
        String newUser = "sys";
        String newPassword = "Oracle18c";

        // Act
        oracleConnectionSingleton = OracleConnectionSingleton.getConnection(newUser, newPassword);

        // Assert
        assertNotNull(oracleConnectionSingleton);
    }

    /**
     * Test the method
     * {@link OracleConnectionSingleton#getConnection(String userStr, String passwordStr)}
     * to check that a new instance is not created when another one already exists.
     */
    @Test
    void testCreateNewConnectionWhenInstanceAlreadyExists() {
        // Arrange
        String newUser = "sys";
        String newPassword = "Oracle18c";

        // Act
        otherOracleConnectionSingleton = OracleConnectionSingleton.getConnection(newUser, newPassword);

        // Assert
        assertNotNull(oracleConnectionSingleton);
        assertNotNull(otherOracleConnectionSingleton);
        assertTrue(oracleConnectionSingleton == otherOracleConnectionSingleton);
    }

    /**
     * Test the method
     * {@link OracleConnectionSingleton#changeConnection(String userStr, String passwordStr)}
     * to check that the connection can be changed to another user and password.
     * 
     * @throws SQLException If the connection to the Oracle database fails.
     */
    @Test
    void testChangeConnection() throws SQLException {
        // Arrange
        String newUser = "sales";
        String newPassword = "adminsales";

        // Act
        OracleConnectionSingleton.changeConnection(newUser, newPassword);

        // Assert
        assertTrue(!oracleConnectionSingleton.isClosed());
    }

    /**
     * Test the method {@link OracleConnectionSingleton#closeConnection()} the check
     * that the connection to the Oracle database can be closed.
     * 
     * @throws SQLException If the connection to the Oracle database cannot be
     *                      closed.
     */
    @Test
    void testCloseConnection() throws SQLException {
        // Arrange
        // Nothing to arrange.

        // Act
        OracleConnectionSingleton.closeConnection();

        // Assert
        assertTrue(oracleConnectionSingleton.isClosed());
        assertTrue(otherOracleConnectionSingleton.isClosed());
    }

    /**
     * Check the method {@link OracleConnectionSingleton#closeConnection()} to check
     * that if the connection has been closed, the same connection cannot be closed
     * again.
     * 
     * @throws SQLException If the connection to the Oracle database cannot be
     *                      closed.
     */
    @Test
    void testCloseConnectionWhenConnectionAlreadyClosed() throws SQLException {
        // Arrange
        OracleConnectionSingleton.closeConnection();

        // Act
        OracleConnectionSingleton.closeConnection();

        // Assert
        assertTrue(oracleConnectionSingleton.isClosed());
        assertTrue(otherOracleConnectionSingleton.isClosed());
    }
}
