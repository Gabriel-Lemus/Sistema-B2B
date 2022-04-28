import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.SQLException;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

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
        // Nothing to arrange.

        // Act
        // Nothing to act on.

        // Assert
        assertTrue(oracleConnectionSingleton.isClosed());
    }

    /**
     * Test that a new instance is not created when an instance of the
     * OracleConnectionSingleton already exists.
     */
    @Test
    void testCreateNewConnectionWhenInstanceAlreadyExists() {
        // Arrange
        // Nothing to arrange.

        // Act
        // Nothing to act on.

        // Assert
        assertNotNull(oracleConnectionSingleton);
        assertNotNull(otherOracleConnectionSingleton);
        assertTrue(oracleConnectionSingleton == otherOracleConnectionSingleton);
    }

    /**
     * Test that the connection can be changed to another user and password.
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
     * Test closing the connection to the Oracle database.
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
     * Check that if the connection has been closed, the same connection cannot be
     * closed again.
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
