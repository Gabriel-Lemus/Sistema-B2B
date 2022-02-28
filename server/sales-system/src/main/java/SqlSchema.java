/**
 * This class represents a schema from the Oracle database. It is used to handle
 * the requests for the CRUD operations of the tables in the schema.
 */
public class SqlSchema {
    // Attributes
    private String conUrl;
    private String user;
    private String password;
    private String[] schemaTables;
    private SqlTableCrud[] tableCruds;
    private ServletHelper helper;

    // Constructor
    public SqlSchema(String conUrl, String user, String password,
            String localhostIp, String schema, String[] tableServletUrls,
            String[] tableNames, String[] primaryKeys, String[][] tableAttrs,
            String[][] tableAttrTypes, boolean[][] tableAttrNulls, int[] tablesMaxRows) {
        this.conUrl = conUrl;
        this.user = user;
        this.password = password;
        this.schemaTables = tableNames;
        this.helper = new ServletHelper();
        this.tableCruds = new SqlTableCrud[tableServletUrls.length];

        // Initialize the table cruds
        for (int i = 0; i < tableServletUrls.length; i++) {
            tableCruds[i] = new SqlTableCrud(conUrl, user,
                    password, localhostIp, tableServletUrls[i], schema,
                    tableNames[i], primaryKeys[i], tableAttrs[i], tableAttrTypes[i],
                    tableAttrNulls[i], tablesMaxRows[i]);
        }
    }
}
