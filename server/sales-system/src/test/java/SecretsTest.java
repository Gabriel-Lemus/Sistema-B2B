import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Unit testing for methods of the class {@link Secrets}.
 */
public class SecretsTest {
    // Attributes
    /** Secrets object to test. */
    private Secrets secrets;

    /**
     * Setup for tests.
     */
    @BeforeEach
    public void setUp() {
        secrets = new Secrets();
    }

    /**
     * Test the method
     * {@link Secrets#getEmail()} to check that the correct email is returned.
     */
    @Test
    void testGetEmail() {
        // Arrange
        String expected = "glemus.luigi@gmail.com";

        // Act
        String actual = secrets.getEmail();

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method
     * {@link Secrets#getPassword()} to check that the correct ip address is
     * returned.
     */
    @Test
    void testGetLocalHostIP() {
        // Arrange
        Object expected = String.class;

        // Act
        Object actual = secrets.getLocalHostIP().getClass();

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method
     * {@link Secrets#getOracleConnectionString()} to check that the Oracle
     * connection string is returned.
     */
    @Test
    void testGetOracleConnectionString() {
        // Arrange
        Object expected = String.class;

        // Act
        Object actual = secrets.getOracleConnectionString().getClass();

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method
     * {@link Secrets#getPassword()} to check that the correct password is
     * returned.
     */
    @Test
    void testGetPassword() {
        // Arrange
        Object expected = String.class;

        // Act
        Object actual = secrets.getPassword().getClass();

        // Assert
        assertEquals(expected, actual);
    }

    /**
     * Test the method
     * {@link Secrets#getWebServerPort()} to check that the correct web server
     * port is returned.
     */
    @Test
    void testGetWebServerPort() {
        // Arrange
        String expected = "3003";

        // Act
        String actual = secrets.getWebServerPort();

        // Assert
        assertEquals(expected, actual);
    }
}
