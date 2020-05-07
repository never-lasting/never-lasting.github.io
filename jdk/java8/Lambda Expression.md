# Lambda Expression

[Oracle官方文档]( https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html )

> JAVA语言在JAVA8之前一直被人诟病不支持***函数式编程***, 无法将方法当作参数传给另一个方法使用, 匿名内部类的使用看起来很不优雅. JAVA8新特性Lambda Expression解决了上述问题, 他支持将功能视为方法参数, 将代码视为数据.

## Functional Interface

在开始Lambda之前, 先引入与之息息相关的概念Functional Interface(函数式接口)

```java
/**
 * @since 1.8
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface FunctionalInterface {}
```

`functional interface` : 有且只有一个抽象方法的接口称之为函数式接口

1. default/static 已有默认实现不属于抽象方法
2. 所有类直接或者间接继承自Object类, 若接口中的abstract方法签名与Object中的方法签名相同, 此方法也不算抽象方法
3. @FunctionalInterface是一个标记注解, 如果一个接口满足只有一个抽象方法的条件, 那么他就是functional interface, 不管他有没有添加@FunctionalInterface
4. 添加了@FunctionalInterface, 如果接口不满足函数式接口的条件, 则不能通过编译, 有点类似@Override
5. functional interface的实例经常使用Lambda表达式创建
6. jdk在java.util.function包下已经提供了常用的functional interface

```java
// 常用的内置functional interface(省略了default/static方法)
@FunctionalInterface
public interface Predicate<T> {
    boolean test(T t);
    ...
}

@FunctionalInterface
public interface Supplier<T> {
    T get();
}

@FunctionalInterface
public interface Consumer<T> {
    void accept(T t);
}

@FunctionalInterface
public interface Function<T, R> {
    R apply(T t);
    ...
}
```

## Lambda 语法

```java
@Test
public void testLambda() {
    Predicate<Integer> predicate = age -> age != null && age > 18;
    // 打印true
    System.out.println(predicate.test(19));
}
```

上面是一个简单的Lambda表示Predicate的一个实例, Lambda表达式语法 (...) -> {...}

- lambda语法相当与一个方法的实现,  (...)里面是方法的参数, 如果只有一个参数 ()可省略
- {...}是方法的具体实现, 如果只有一句, 可省略{} 和 return

### 类型检查 & 类型推断

刚开始使用Lambda语法一般很难适应, 那么**类型检查**&**类型推断**一定要好好理解

- Lambda整体是表示一个函数式接口的实列的, 那么这个函数式接口是哪个类型的?

  Lambda的类型时从上下文推断出来的,要么时赋值上下文(上面的例子就是Predicate<Integer>), 要么是方法调用上下文

-  知道了Lambda的类型, 也就知道了Lambda方法体是实现的哪一个抽象方法

  上面的例子就是实现的Predict<Integ>中的test()方法), 那么age的类型就确定是Integer, 所以Lambda表达式中的方法参数是不用写类型的