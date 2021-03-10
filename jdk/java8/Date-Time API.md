# Date-Time API

[Oracle官网 Java Date-Time Packages](https://docs.oracle.com/javase/8/docs/technotes/guides/datetime/index.html)

### 1. 糟糕的Date

> `java.util.Date`从jdk1.0就诞生了, 到后来jdk1.1的`java.util.Calendar`, `java.util.TimeZone`, 还有`java.text.SimpleDateFormat`就是早期的时间API, 如今被认为是设计最烂的API之一. 
>
> - Date中年份与1900的关系让api不够简洁清楚
> - 日期与时间都是Date
> - 都是线程不安全的, 特别是`SimpleDateFormat`
> - 时间的计算以及格式化都不够友好

### 2. 新的时间API

Date的糟糕让程序员们更青睐第三方工具包joda-time, 终于java8带来了新的Date-Time API.

- **java.time**

  The core of the API for representing date and time.

  It includes classes for date, time, date and time combined, time zones, instants, duration, and clocks. 

  These classes are based on the calendar system defined in **ISO-8601**, and are immutable and thread-safe.

- **java.time.chrono**

  The API for representing calendar systems other than the default ISO-8601. 

  You can also define your own calendar system. This tutorial does not cover this package in any detail.

- **java.time.format**

  Classes for formatting and parsing dates and times.

- **java.time.temporal**

  Extended API, primarily for framework and library writers,

  allowing interoperations between the date and time classes, querying, and adjustment.

  Fields (`TemporalField` and `ChronoField`) and units (`TemporalUnit` and `ChronoUnit`) are defined in this package.



| Class/Enum     | Year | Month | Day  | Hours | Munites | Seconds* | Zone Offset | Zone ID | toString                                  | human/machine |
| -------------- | :--: | :---: | :--: | :---: | :-----: | :------: | :---------: | ------- | ----------------------------------------- | ------------- |
| Instant        |      |       |      |       |         |    Y     |             |         | 2013-08-20T15:16:26.355Z                  | machine       |
| LocalDate      |  Y   |   Y   |  Y   |       |         |          |             |         | 2013-08-20                                | human         |
| LocalDateTime  |  Y   |   Y   |  Y   |   Y   |    Y    |    Y     |             |         | 2013-08-20T08:16:26.937                   | human         |
| ZonedDateTime  |  Y   |   Y   |  Y   |   Y   |    Y    |    Y     |      Y      | Y       | 2013-08-21T00:16:26.941+09:00[Asia/Tokyo] | human         |
| LocalTime      |      |       |      |   Y   |    Y    |    Y     |             |         | 08:16:26.943                              | human         |
| MonthDay       |      |   Y   |  Y   |       |         |          |             |         | --08-20                                   | human         |
| Year           |  Y   |       |      |       |         |          |             |         |                                           | human         |
| YearMonth      |  Y   |   Y   |      |       |         |          |             |         | 2013-08                                   | human         |
| Month          |      |   Y   |      |       |         |          |             |         | AUGUST                                    | human         |
| OffsetDateTime |  Y   |   Y   |  Y   |   Y   |    Y    |    Y     |      Y      |         | 2013-08-20T08:16:26.954-07:00             | human         |
| OffsetTime     |      |       |      |   Y   |    Y    |    Y     |      Y      |         | 08:16:26.957-07:00                        | human         |
| Duration       |      |       |      |  **   |   **    |    Y     |             |         | `PT20H` (20 hours)                        |               |
| Period         |  Y   |   Y   |  Y   |       |         |          |     ***     | ***     | `P10D` (10 days)                          |               |

   \*Seconds are captured to nanosecond precision.

 \**This class does not store this information, but has methods to provide time in these units.

\***When a `Period` is added to a `ZonedDateTime`, daylight saving time or other local time differences are observed.

### 3. Date-Time Design Principles

- **clear**

  The methods in the API are well defined and their behavior is clear and expected.

  ```java
  // 表示1999-02-18 简洁明了
  LocalDate date = LocalDate.of(1999, 2, 18);
  ```

- **immutable and thread-safe**

  新的Date-Time API创建的对象大部分都是不可变对象, 想要修改一个不可变对象的, 会创建一个新的对象. 这也意味着Date-Time API是线程安全的
  这也使得API中往往没有任何set方法,同时使用of, from, with前缀的方法来创建实例, 而不是构造器(私有的).



### 4. Method Naming Conventions

Date-Time API提供了丰富的类和方法, 这些方法名在类之间尽可能保持一致。比如很多类都提供now方法来获取这个类需要的当前的日期或时间, from方法可以将其他类型转换成当前类型.

方法名前缀的规范

| Prefix | Method Type    | Use                                                          |
| ------ | -------------- | ------------------------------------------------------------ |
| of     | static factory | Creates an instance where the factory is primarily validating the input parameters, not converting them. |
| from   | static factory | Converts the input parameters to an instance of the target class, which may involve losing information from the input. |
| parse  | static factory | Parses the input string to produce an instance of the target class. |
| format | instance       | Uses the specified formatter to format the values in the temporal object to produce a string. |
| get    | instance       | Returns a part of the state of the target object.            |
| is     | instance       | Queries the state of the target object.                      |
| with   | instance       | Returns a copy of the target object with one element changed; this is the immutable equivalent to a `set` method on a JavaBean. |
| plus   | instance       | Returns a copy of the target object with an amount of time added. |
| minus  | instance       | Returns a copy of the target object with an amount of time subtracted. |
| to     | instance       | Converts this object to another type.                        |
| at     | instance       | Combines this object with another.                           |











