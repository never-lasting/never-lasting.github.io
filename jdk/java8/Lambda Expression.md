# Lambda Expression

[Oracle官方文档]( https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html )

> JAVA语言在JAVA8之前一直被人诟病不支持***函数式编程***, 无法将方法当作参数传给另一个方法使用, 匿名内部类的使用看起来也很不优雅. JAVA8新特性Lambda Expression解决了上述问题, **他支持将功能视为方法参数, 将代码视为数据**. Lambda Expression可以更加简洁的表示一个functional interface的实例

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
4. 添加了@FunctionalInterface, 如果接口不满足函数式接口的条件, 则不能通过编译, 类似@Override
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

- lambda语法相当于一个方法的实现,  (...)里面是方法的参数, 如果只有一个参数 ()可省略
- {...}是方法的具体实现, 如果只有一行语句, 可省略{} 和 return

### 类型检查 & 类型推断

刚开始使用Lambda语法不管是读还自己写都有点不太适应, 那么**类型检查**&**类型推断**可以很好的帮助我们理解Lambda

- Lambda整体是表示一个函数式接口的实例, 那么这个函数式接口是哪个类型?

  Lambda的类型时从上下文推断出来的,要么时赋值上下文(上面的例子就是Predicate<Integer>, 体现将代码视为数据), 要么是方法调用上下文(大多数的使用场景, 体现将功能视为方法参数)

-  知道了Lambda的类型, 也就知道了Lambda方法体是实现的哪一个抽象方法

  上面的例子就是实现的Predict<Integ>中的test()方法), 那么age的类型就确定是Integer, 所以Lambda表达式中的方法参数是不用写类型的

## Lambda使用场景

>  Lambda expressions enable you to  treat functionality as method argument, or code as data. 

1. 取代匿名内部类

   ```java
   public void test() {
       // 匿名内部类方式
       Thread thread1 = new Thread(new Runnable() {
           @Override
           public void run() {
               System.out.println("hello");
           }
       });
       // Lambda方式
       Thread thread2 = new Thread(() -> System.out.println("hello"));
   }
   ```

   

2. jdk的其他类对Lambda的支持

   ```java
   // java.util.List新增默认方法
   default void sort(Comparator<? super E> c) {
       Object[] a = this.toArray();
       Arrays.sort(a, (Comparator) c);
       ListIterator<E> i = this.listIterator();
       for (Object e : a) {
           i.next();
           i.set((E) e);
       }
   }
   // 对ArrayList排序(按学生年龄)
   public void test() {
       List<Student> students = new ArrayList<>();
       // add students
       ... ...
       // 此处推断lambda为Comparator<Student>的实例
       // Comparator 的抽象方法 int compare(T o1, T o2);
       list.sort((s1, s2) -> s1.getAge() - s2.getAge());
   }
   ```

   

3. Lambda使用最多的地方是JAVA8的另一个新特新[Stream API](./Stream API)

## Method References (方法引用)

很多时候我们使用Lambda创建一个匿名的函数, 函数逻辑仅仅只是调用一个已经存在的方法, 在这种情况下, 通过名称引用现有的方法通常更加清楚. Method References就是Lambda的一种特殊表现形式, 用于直接使用已经存在的方法.

example: 

```java
@FunctionalInterface
public interface Consumer<T> {
    void accept(T t);
}

@Test
public void test() {
    // Lambda普通写法
    Consumer<String> consumer1 = str -> System.out.println(str);
    // menthod reference
    Consumer<String> consumer2 = System.out::println;
}

```

### 方法引用的种类

|                             Kind                             |               Example                |
| :----------------------------------------------------------: | :----------------------------------: |
|                 Reference to a static method                 |  ContainingClass::staticMethodName   |
|    Reference to an instance method of a particular object    | containingObject::instanceMethodName |
| Reference to an instance method of an arbitrary object of a particular type |      ContainingType::methodName      |
|                  Reference to a constructor                  |            ClassName::new            |

1. Reference to a static method (静态方法引用)

   ```java
   public void test() {
       // Lambda
       Supplier<LocalDate> supplier1 = () -> LocalDate.now();
       // Reference to a static method
       Supplier<LocalDate> supplier2 = LocalDate::now;
   }
   ```

   

2. Reference to an instance method of a particular object  (引用特定对象的实例方法)

   ```java
   public void test() {
       // Lambda
       Consumer<String> consumer1 = str -> System.out.println(str);
       // Reference to an instance method of a particular object
       Consumer<String> consumer2 = System.out::println;
   }
   ```

   

3. Reference to an instance method of an arbitrary object of a particular type ( 引用特定类型的任意对象的实例方法 )    这种方式有点难理解, 第一个参数是方法的调用者

   ```java
   public void test() {
       Comparator<String> comparator1 = (s1, s2) -> s1.compareTo(s2);
       Comparator<String> comparator2 = String::compareTo;
   }
   
   ```

   

4. Reference to a constructor  构造器引用

   ```java
   public void test() {
       Supplier<StringBuilder> supplier1 = () -> new StringBuilder();
       Supplier<StringBuilder> supplier2 = StringBuilder::new;
   }
   ```

   