# What's new JDK8

> Oracle宣布java每半年就会发布一个新版本, 现在已经JAVA14了, JAVA8是目前使用最多的版本, 而且springboot等开源项目要求JAVA版本至少是JAVA8以上

本文只涉及重要的使用较多的JAVA8新特性, 更详细的信息请访问:[oracle官网JAVA8新特性](https://www.oracle.com/java/technologies/javase/8-whats-new.html)

- <a href="#Default Methods">Default  Methods 接口增强</a>
- <a href="#Repeating Annotations">Repeating Annotations可重复注解</a>
- [Lambda Expression](./Lambda Expression)
- [Stream API](./Stream API)
- [Date-Time API](./Date-Time API)

## <a name="Default Methods">Default  Methods 接口增强</a>

> JAVA8允许接口中有default 和 static 默认实现

```java
public interface IService {
    void sayHello(String message);
    default void eat() {
        System.out.println("eat");
    }
    static void sleep() {
        System.out.println("sleep");
    }
}    
```

其他类如果实现`IService`直接继承default方法, 但是接口中的static方法只能通过定义他的接口来调用

如果一个类继承了其他类, 而且又实现了多个增强的接口, 要注意以下情况

1. ```java
   // 父类和接口有相同方法签名的时候, 优先继承父类方法
   public class Demo extands Foo impliments NewInterface {
       public static void main(String[] args) {
           // 输出Foo work
           new Demo().work();
       }
   }
   class Foo {
       public void work() {
           System.out.println("Foo work");
       }
   }
   interface NewInterface {
       default void work() {
           System.out.println("Interface1 work");
       }
   }
   ```

2. ```java
   // 当实现的多个接口有相同签名的方法default实现时, 必须要重写该方法否则不能通过编译
   class Demo implements Interface1, Interface2 {
       @Override
       public void work() {
           // 重写逻辑
       }
   }
   interface Interface1 {
       default void work() {
           System.out.println("Interface1 work");
       }
   }
   interface Interface2 {
       default void work() {
           System.out.println("work");
       }
   }
   ```
   
   

## <a name="Repeating Annotations">Repeating Annotations可重复注解</a>

[oracle官方文档]( https://docs.oracle.com/javase/tutorial/java/annotations/repeating.html )

> 很多场合下需要在一个地方多次使用同一个注解, JAVA8可重复注解让我们更优雅的实现此场景

```java
// JAVA8之前大多使用这种方式
@Roles({@Role("ADMIN"), @Role("CEO")})
public class RepeatableAnnotationTest {
    public static void main(String[] args) {
        Class<RepeatableAnnotationTest> clazz = RepeatableAnnotationTest.class;
        if(clazz.isAnnotationPresent(Roles.class)) {
            Roles schedulesAnno = clazz.getDeclaredAnnotation(Roles.class);
            Role[] values = schedulesAnno.value();
            for (Role role : values) {
                System.out.println(role.value());
            }
        }
    }
}
// 必须定义一个包含想要多次使用注解的 容器注解
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@interface Roles {
    Role[] value() default {};
}
// 想要多次使用的注解
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@interface Role {
    String value();
}
```

JAVA8使用Repeatable相对优雅

```java
/**
 * @since 1.8 JAVA8新增元注解
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.ANNOTATION_TYPE)
public @interface Repeatable {
    Class<? extends Annotation> value();
}
```

```java
// JAVA8 demo
// 多次使用Role注解 而不是臃肿的Roles注解
@Role("ADMIN")
@Role("CEO")
public class RepeatableAnnotationTest {
    public static void main(String[] args) {
        Class<RepeatableAnnotationTest> clazz = RepeatableAnnotationTest.class;
        // 1.8新方法
        Role[] values = clazz.getAnnotationsByType(Role.class);
        for (Role role : values) {
            System.out.println(role.value());
        }
    }
}

// 依然需要容器注解
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@interface Roles {
    Role[] value() default {};
}

// 只需加上Repeatable元注解
@Repeatable(Roles.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@interface Role {
    String value();
}
```

***Tips***

> 为了JDK向上兼容的考虑, 使用`可重复注解`也需要定义一个`容器注解`. 当一个可重复注解在一个地方多次使用时, 编译器会自动将之转换成容器注解.
>
> 也就是说@Role("ADMIN") @Role("CEO") 编译后还是@Roles({@Role("ADMIN"), @Role("CEO")}), 但只使用一个@Role("xxx")时不会自动转换,
>
> 所以在使用isAnnotationPresent() 以及getAnnotation()反射api时要小心. 推荐尽可能使用1.8新增的方法getAnnotationsByType()

***best practise***

`jsr303`各种约束注解对Repeatable Annotation的支持 不同的group可以定义不同的约束

```java
@Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE })
@Retention(RUNTIME)
@Repeatable(List.class)
@Documented
@Constraint(validatedBy = { })
public @interface Max {

	String message() default "{javax.validation.constraints.Max.message}";

	Class<?>[] groups() default { };

	Class<? extends Payload>[] payload() default { };

	/**
	 * @return value the element must be lower or equal to
	 */
	long value();

	/**
	 * Defines several {@link Max} annotations on the same element.
	 *
	 * @see Max
	 */
	@Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE })
	@Retention(RUNTIME)
	@Documented
	@interface List {

		Max[] value();
	}
}
```
