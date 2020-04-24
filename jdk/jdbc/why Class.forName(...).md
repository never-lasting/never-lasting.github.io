# why Class.forName(...)

我们在使用jdbc访问数据库时一般都有6个步骤

1. 加载驱动

   `Class.forName(...)`

2. 通过DriverManager获取数据库连接

    `DriverManager.getConnection(String url,String user,String pass);` 

3. 创建statement对象

   `conn.createStatement()`:创建基本的Statement对象

   `conn.prepareStatement(String sql)` : 根据传入的SQL语句创建预编译的Statement对象 

4. 通过`Statement`执行sql语句

   execute(), executeQuery(), executeUpdate...

5. 处理ResultSet(如果是query操作)

6. 回收连接资源

   关闭ResultSet Connection  Statement  资源,一般在写在finally语句块,

   以上资源都实现了AutoClosable接口,所以也可以使用try-with-resources(jdk1.7特性)



那么为什么要先加载驱动?为什么写一句Class.forName.. DriverManager才能获取连接

以mysql驱动为例,`Class.forName("com.mysql.jdbc.Driver");`会加载Driver,Driver中的static块会被执行

```java
static {
    try {
        DriverManager.registerDriver(new Driver());
    } catch (SQLException var1) {
        throw new RuntimeException("Can't register driver!");
    }
}
```

再看看java.sql.DriverManager的**代码片段**

```java
public class DriverManager {
    ...
	// List of registered JDBC drivers
	private final static CopyOnWriteArrayList<DriverInfo> registeredDrivers = new                CopyOnWriteArrayList<>();
	    
	public static synchronized void registerDriver(java.sql.Driver driver, DriverAction da)
        throws SQLException {
        /* Register the driver if it has not already been added to our list */
        if(driver != null) {
            registeredDrivers.addIfAbsent(new DriverInfo(driver, da));
        } else {
            // This is for compatibility with the original DriverManager
            throw new NullPointerException();
        }
        println("registerDriver: " + driver);
    }
    
    //  Worker method called by the public getConnection() methods.
    private static Connection getConnection(
        String url, java.util.Properties info, Class<?> caller) throws SQLException {
	    ...
        // HERE IS IMPORTANT    
        for(DriverInfo aDriver : registeredDrivers) {
	    ...	
            try {
                println("    trying " + aDriver.driver.getClass().getName());
                Connection con = aDriver.driver.connect(url, info);
                if (con != null) {
                    // Success!
                    println("getConnection returning " + aDriver.driver.getClass().getName());
                    return (con);
                }
            } 

        }
	    ...
    }
}
```

> 加载mysql驱动的目的是为了将mysql驱动的实列注册到DriverManager, 当使用DriverManager获取连接时, 会遍历注册的驱动尝试使用数据库连接参数获取连接.
>

奥! 原来是这样.

但是如果你使用的jdk是1.6以上,mysql驱动支持了spi(mysql jar包里有META-INF/services/java.sql.Driver)

你会发现去掉第一步的加载驱动Class.forName(...), 代码似乎依旧正常, 并不会获取不到连接!!! why???

see [service provider interface](./spi/jdk1.6 spi)