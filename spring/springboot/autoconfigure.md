# autoconfigure

自动配置是springboot重要的一个特性, springboot可以根据我们引入的jar包来猜测你可能会用得到的spring bean, 并自动提供这些bean.

## 1. Java-based Configuration

使用springboot, XML-based configuconracontion已经一去不复返了. 基于@Componen注解家族(@Service, @Controller, @Repository等) Annotation-based configuration相信大家都很熟悉了, Java-based Configuration在springboot大量使用, java代码配置bean定义是使用springboot的前提条件

### 1.1. Basic Concepts: `@Bean` and `@Configuration`

`@Configuration`注解在类上, 表明该类为配置类. 

`@Bean`注解在方法上, 通常用在`Configuration`注解的类里面, 其实也可以配合`@Component`使用,甚至是单独使用(Lite Mode)

```java
@Configuration
public class AppConfig {
    @Bean
    public MyService myService() {
        return new MyServiceImpl();
    }
}
```

以上示例与下面的xml配置是相同的效果

```xml
<beans>
    <bean id="myService" class="com.acme.services.MyServiceImpl"/>
</beans>
```

### 1.2. @Import

可以将一个或多个Component包含进来, 特别是Configuration配置, 一般可以将相关联的配置当作一个模块结合在一起

spring中内置了一些@Enabling的注解, 比如`@EnableWebMvc`

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(DelegatingWebMvcConfiguration.class)
public @interface EnableWebMvc {
}
```

`@Enabling...`注解就是为了import其他的配置, 让其生效

### 1.3. @Conditional

`springboot` autoconfiguare是很智能的, 不仅智能的提供自动配置, 而且不影响自定义的配置

这都得益于`@Conditional`一系列注解, `@Conditional`与`@Configuration`一起使用可以决定这个配置能是否有效,

与`@Bean`一起使用可以决定这个Bean定义是否有效

autoconfiguare中最常见的就是`@ConditionalOnClas`, `@ConditionalOnMissingBean`, 这些注解会关联对应的Condition接口的实现, 用于判断该配置是否生效.比如:

`@ConditionalOnClas` ---- `OnClassCondition`    classpath下存在指定class才生效

`@ConditionalOnMissingBean` ---- `OnBeanCondition`    spring容器中不存在指定bean才生效(如果我们自定义了则自动配置无效)

*得注意的是@Profile也属于@Conditional家族的注解,虽然不用于autoconfig(用于区别不同环境)*

## 2. AutoConfigure

### 2.1 xxxAutoConfiguration &  xxxProperties

springboot提供的自动配置, 我们可以在spring-boot-autoconfigure jar包下的org.springframework.boot.autoconfigure包中查看. 一般命名规则都是xxxAutoConfiguration xxxProperties.

比如我们添加spring-boot-starter-mail依赖

```java
@Configuration
@ConditionalOnClass({ MimeMessage.class, MimeType.class, MailSender.class })
@ConditionalOnMissingBean(MailSender.class)
@Conditional(MailSenderCondition.class)
// 这里@Import @EnableConfigurationProperties 都是模块化配置的体现.
@EnableConfigurationProperties(MailProperties.class)
@Import({ MailSenderJndiConfiguration.class, MailSenderPropertiesConfiguration.class })
public class MailSenderAutoConfiguration {
	... ...
}
```

```java
@Configuration
@ConditionalOnProperty(prefix = "spring.mail", name = "host")
class MailSenderPropertiesConfiguration {

	private final MailProperties properties;

	MailSenderPropertiesConfiguration(MailProperties properties) {
		this.properties = properties;
	}

	@Bean
	@ConditionalOnMissingBean
	public JavaMailSenderImpl mailSender() {
		JavaMailSenderImpl sender = new JavaMailSenderImpl();
		applyProperties(sender);
		return sender;
	}

... ...

}
```

我们只需要在applicatio.yml配置MailProperties就可以直接使用mailSender这个Bean了.

当然如果我们自己配置`MailSender`, `MailSenderAutoConfiguration`以及`@Import`,`@EnableConfigurationProperties`都会失效

### 2.2. @SpringBootASpringpplication

看`@SpringBootApplication`源码, 发现他是一个复合注解

`@SpringBootASpringpplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan` ...

类似`@RestController`, `@GetMapping` 将多种注解的功能集于一身

### 2.3. @EnableAutoConfiguration & spring.factories

**springboot中的自动配置虽然都用了@Configuration注解, 但是我们@ComponentScan并没有扫描到他们, 他们是怎么注册到spring容器的?**

没错, autoconfig使用的是专用通道进行注册的! 那就是`@EnableAutoConfiguration` + `spring.factories`配置文件

#### 2.3.1. @EnableAutoConfiguration 

之前有提到过@Enable..注解, 包括`@EnableWebMvc`,`@EnableWebSecurity`,`@EnableScheduling` ...这些会Import其他的xxxConfiguration(配置类), 这些都比较好理解

但是`@EnableAutoConfiguration`, `@EnableAsync`, `@EnableTransactionManagement` ...他们却Import其他的xxxxSelector ...

`@EnableAutoConfiguration`  Import的就是AutoConfigurationImportSelector

#### 2.3.2. AutoConfigurationImportSelector

```java
/**
 * 1. DeferredImportSelector是ImportSelector的子接口
 * 2. ImportSelector.selectImports返回的String[]对应的配置类会被Import
 * 3. DeferredImportSelector是特殊的ImportSelector, 被Import的配置类会延迟处理
 *    所谓延迟处理就是在其他Configuration配置类处理之后才会处理DeferredImportSelector Import的配置
 *    这个特性保证了autoconfigure中的@ConditionalOnMissingBean等condition能够正常工作
 */
public class AutoConfigurationImportSelector implements DeferredImportSelector ... {
	...
    @Override
	public String[] selectImports(AnnotationMetadata annotationMetadata) {
		if (!isEnabled(annotationMetadata)) {
			return NO_IMPORTS;
		}
		AutoConfigurationMetadata autoConfigurationMetadata = AutoConfigurationMetadataLoader
				.loadMetadata(this.beanClassLoader);
        // 获取EnableAutoConfiguration exclude属性
		AnnotationAttributes attributes = getAttributes(annotationMetadata);
        // 从spring.properties配置文件获取候选配置
		List<String> configurations = getCandidateConfigurations(annotationMetadata,
				attributes);
        // 去重复
		configurations = removeDuplicates(configurations);
		Set<String> exclusions = getExclusions(annotationMetadata, attributes);
		checkExcludedClasses(configurations, exclusions);
        // 去exclude
		configurations.removeAll(exclusions);
		configurations = filter(configurations, autoConfigurationMetadata);
		fireAutoConfigurationImportEvents(configurations, exclusions);
		return StringUtils.toStringArray(configurations);
	}
    ...
    protected List<String> getCandidateConfigurations(AnnotationMetadata metadata,
                                                      AnnotationAttributes attributes) {
		List<String> configurations = SpringFactoriesLoader.loadFactoryNames(
				getSpringFactoriesLoaderFactoryClass(), getBeanClassLoader());
		Assert.notEmpty(configurations,
				"No auto configuration classes found in META-INF/spring.factories. If you "
						+ "are using a custom packaging, make sure that file is correct.");
		return configurations;
	}
}
```



spring-boot-autoconfigure-2.0.6.RELEASE.jar   META-INF/spring.factories

```properties
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.admin.SpringApplicationAdminJmxAutoConfiguration,\
org.springframework.boot.autoconfigure.aop.AopAutoConfiguration,\
org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration,\
org.springframework.boot.autoconfigure.batch.BatchAutoConfiguration,\
org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration,\
org.springframework.boot.autoconfigure.cassandra.CassandraAutoConfiguration,\
......
```

**@EnableAutoConfiguration是目的就是Import配置文件META-INF/spring.factories中的xxxAutoConfiguration, 并且延迟处理(确保自动配置中的condition正常工作)**

## 3. 自定义stater

springboot虽然对springMvc以及常用的第三方框架提供了autoconfig以及starter模块, 我们自己也可以定义starter, `mybatis` `druid`就是案列典范.

步骤很简单:

1.  配置自己的xxxAutoConfiguration, 使用`@Configuration` `@Bean`等 配合各种`@Conditional`

2. META-INF/spring.factories

   ```properties
   org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
   com.mycorp.libx.autoconfigure.LibXAutoConfiguration,\
   com.mycorp.libx.autoconfigure.LibXWebAutoConfiguration
   ```

**best practise** :

1. 自定义的starter打包命名遵循 xxx-spring-boot-starter
2. 自动配置类名 xxxAutoConfiguration, 需要属性配置 xxxProperties
3. 使用@condition进行限制
4. 使用@Import @EnableConfigurationProperties 模块化配置
5. autoconfigure只能使用**专用通道**注册, 不要扫描xxxAutoConfiguration