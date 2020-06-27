var basePath = "../../";
var nodes = 
[
	{name:"algorithm", children:[
		{name:"Why capacity must be a power of two?" , blogUrl:basePath + "algorithm/[HashMap] why capacity must be a power of two", tags:["algorithm", "HashMap"]}
	]},
	
	{name:"jdk", children:[
		{name:"api", children:[
			name:"java.math", children:[
				{name:"BigDecimal", blogUrl:basePath + "jdk/api/java.math/BigDecimal", tages:["BigDecimal"]}
			]
		]},
		{name:"java8", children:[
			{name:"what's new in JAVA8", blogUrl:basePath + "jdk/java8/what's new in JAVA8", tages:["JAVA8"]},
			{name:"Lambda Expression", blogUrl:basePath + "jdk/java8/Lambda Expression", tages:["JAVA8", "Lambda"]},
			{name:"Stream API", blogUrl:basePath + "jdk/java8/Stream API", tags:["JAVA8, Stream API"]}
		]},
		{name:"jdbc", children:[
			{name:"why Class.forName(…)", blogUrl:basePath + "jdk/jdbc/why Class.forName", tags:["jdbc"]}
		]},
		{name:"spi", children:[
			{name:"jdk1.6 spi", blogUrl:basePath + "jdk/spi/jdk1.6 spi", tags:["spi", "service loader"]},
			{name:"spi in jdk", blogUrl:basePath + "jdk/spi/spi in jdk",tags:["spi"]}
		]}
	]},
	
	{name:"Linux", children:[
		{name:"Linux Concepts", blogUrl:basePath + "Linux/Linux Concepts"},
		{name:"Linux-basic", children:[
			{name:"file system", blogUrl:basePath + "Linux/Linux-basic/file system", tages:["Linux", "file system"]},
			{name:"linux directory", blogUrl:basePath + "Linux/Linux-basic/linux directory", tages:["Linux", "linux directory"]},
			{name:"user manager", blogUrl:basePath + "Linux/Linux-basic/user manager", tages:["Linux", "user manager"]},
			{name:"permission manager", blogUrl:basePath + "Linux/Linux-basic/permission manager", tages:["Linux", "permission manager"]}
		]}
	]},
	
	{name:"spring", children:[
		{name:"security", children:[
			{name:"springSecurityFilterChain", blogUrl:"spring/security/springSecurityFilterChain", yags:["security"]}
		]},
		
		{name:"springboot", children:[
			{name:"autoconfigure", blogUrl:"spring/springboot/autoconfigure", tages:["springboot", "autoconfigure"]}
		]}
	]}
	
];