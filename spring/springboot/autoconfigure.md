# autoconfigure

自动配置是springboot重要的一个特性, springboot可以根据我们引入的jar包来猜测你可能会用得到的spring bean, 并自动提供这些bean.

## 1. Java-based Configuration

使用springboot, XML-based configuconracontion已经一去不复返了. 基于@Componen注解家族(@Service, @Controller, @Repository等) Annotation-based configuration相信大家都很熟悉了, Java-based Configuration在springboot大量使用, 是使用springboot的前提条件

### 1.1. Basic Concepts: `@Bean` and `@Configuration`

`@Configuration`注解在类上, 表明该类为配置类. 本质上也是`@Component`

`@Bean`注解在方法上, 通常用在`Configuration`注解的类里面, 其实也可以配合@Component使用(Lite Mode)

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

spring中内置了一些Enabling的注解, 比如`EnableWebMvc`

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(DelegatingWebMvcConfiguration.class)
public @interface EnableWebMvc {
}
```

`@Enabling...`注解与`@Configuration`一起使用就是为了import其他的配置, 让其生效

### 1.3. @Conditional

`springboot` autoconfiguare是很智能的, 不仅智能的提供自动配置, 而且不影响自定义的配置

这都得益于`@Conditional`一系列注解, `@Conditional`与`@Configuration`一起使用可以决定这个配置能是否生效,

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

当然如果我们自己配置MailSender, MailSenderAutoConfiguration以及@Import,@EnableConfigurationProperties都会失效

### 2.2 @EnableAutoConfiguration & spring.factories

**springboot中的自动配置虽然都用了@Configuration注解, 但是我们@ComponentScan并没有扫描到他们, 他们是怎么注册到spring容器的?**

没错, autoconfig使用的是专用通道进行注册的! 那就是spring.factories

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

