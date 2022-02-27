public class SqlTableCrud {
    // Attributes
    private String conUrl;
    private String user;
    private String password;
    private String localhostIp;
    private String servletUrl;
    private String schema;
    private String tableName;
    private String primaryKey;
    private String[] attributes;
    private String[] types;
    private boolean[] nullableAttributes;
    private int maxRows;

    // Constructor
    public SqlTableCrud(String conUrl, String user, String password,
            String localhostIp, String servletUrl, String schema,
            String tableName, String primaryKey, String[] attributes,
            String[] types, boolean[] nullableAttributes, int maxRows) {
        super();

        this.conUrl = conUrl;
        this.user = user;
        this.password = password;
        this.localhostIp = localhostIp;
        this.servletUrl = servletUrl;
        this.schema = schema;
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.attributes = attributes;
        this.types = types;
        this.nullableAttributes = nullableAttributes;
        this.maxRows = maxRows;
    }
}
