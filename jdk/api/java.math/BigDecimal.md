# BigDecimal

### 1. When we use BigDecimal
> 浮点数采用“尾数+阶码”的编码方式，类似于科学计数法的“有效数字+指数”的表示方式。二进制无法精确表示大部分的十进制小数.在严格要求精度的场景(金钱相关等),以及一些比较大小的场景时, 最好使用`BigDecimal`来处理.

```java
/**
 * 浮点数之间的等值判断，基本数据类型不能用==来比较，包装数据类型不能用equals来判断。(java开发手册)
 **/
// 反例
float a = 1.0f - 0.9f;
float b = 0.9f - 0.8f;
if (a == b) {
	// 预期进入此代码快，执行其它业务逻辑
    // 但事实上 a==b 的结果为 false
}
Float x = Float.valueOf(a);
Float y = Float.valueOf(b);
if (x.equals(y)) {
    // 预期进入此代码快，执行其它业务逻辑
    // 但事实上 equals 的结果为 false
} 

// 正例 使用 BigDecimal 来定义值，再进行浮点数的运算操作
BigDecimal a = new BigDecimal("1.0");
BigDecimal b = new BigDecimal("0.9");
BigDecimal c = new BigDecimal("0.8");
BigDecimal x = a.subtract(b);
BigDecimal y = b.subtract(c);
// 在已知BigDecimal的scale相同的情况下可以使用equals比较,但是我更推荐使用compareTo来比较	
if (y.equals(x)) {
    System.out.println("true");
}
```


### 2. Introduction of BigDecimal

#### 2.1 Properties
> `BigDecimal`可以表示任意精度的带符号的十进制数, 而且BigDeciaml对象的重要属性都是final的(不可变的).

```java
/**
 *  unscaled value(去掉小数点的值) eg: new BigDecimal("1.24") unscaled value为124
 *  只有当BigDecimal的值大于Long.MAX_VALUE时,intVal才有值,否则为null
 *  unscaledValue() 取值时先判度intVal是否为null,是的话取intCompact值
 **/
private final BigInteger intVal;

/**
 *  小数部分的位数
 *  注意 :new BigDecimal("1.2"); scale = 1, precision = 2
 *       new BigDecimal("1.20"); scale = 2, precision = 3
 *       new BIgDecimal("0.012"); scale = 3 precision = 2
 **/
private final int scale;

/**
 * 精度 整数部分位数 + 小数部分位数
 * new BigDecimal("100.256");  //precision = 6
 * 注意: BigDecimal对象在初始化的时候precision有可能是未知的, 此时precision = 0
 *      当调用precision() 获取精度后, precision将不可变
 **/
private transient int precision;

/**
 * 存储BigDecimal传统的字符串表示
 **/
private transient String stringCache;

/**
 * 当BIgDecimal对象unscaled value绝对值小于等于Long.MAX_VALUE时,
 * 用intCompact简洁的表示, 否则会使用intVal表示
 **/
private final transient long intCompact;
```

#### 2.2 How To Create A BigDecimal

- Constructor

  BIgDecimal提供很多重载构造器, 使用较多的有

  `BIgDecimal(int)`, `BigDecimal(double)`, `BigDecimal(long)`, `BigDecimal(String)`

  <u>**禁止使用BIgDecimal(double)构造器**</u>, 存在精度丢失风险

  ```java
  // 实际存储0.100000001490116119384765625
  BigDecimal g = new BigDecimal(0.1f)
  ```

  **<u>`BIgDecimal(int)`, `BigDecimal(double)`, `BigDecimal(long)` scale都为0</u>**

  **<u>BigDecimal(String) scale注意末尾的0</u>**

  ```java
  BigDecimal a = new BigDecimal("1.2");  // precision = 2, scale = 1
  BigDecimal b = new BigDecimal("1.20"); // precision = 3, scale = 2
  System.out.println(a.equals(b)); // false
  ```

- 静态工厂方法

  `valueOf(double)`, `valueOf(long)`...

  ```java
  // 先将double转成String 再调用构造器
  public static BigDecimal valueOf(double val) {
      return new BigDecimal(Double.toString(val));
  }
  // 使用时注意Double.toString(val)规则
  BigDecimal.valueOf(1.20d); // 存储1.2 scale为1
  BigDecimal.valueOf(1d);    // 存储1.0 scale为1
  ```

  ```java
  // 此方法返回的BigDecimal scale均为0
  // 若val再0-10之间, 则返回缓存中的对象
  public static BigDecimal valueOf(long val) {
      if (val >= 0 && val < zeroThroughTen.length)
          return zeroThroughTen[(int)val];
      else if (val != INFLATED)
          return new BigDecimal(null, val, 0, 0);
      return new BigDecimal(INFLATED_BIGINT, val, 0, 0);
  }
  // note:
  BigDecimal a = BigDecimal.valueOf(2L); // precision = 1, scale = 0
  BigDecimal b = BigDecimal.valueOf(2L);
  System.out.println(a == b); // true
  ```


### 3. equals & compareTo

  ```java
  /**
   * 注意: scale不相同直接返回false
   **/
  @Override
  public boolean equals(Object x) {
      if (!(x instanceof BigDecimal))
          return false;
      BigDecimal xDec = (BigDecimal) x;
      if (x == this)
          return true;
      if (scale != xDec.scale)
          return false;
      long s = this.intCompact;
      long xs = xDec.intCompact;
      if (s != INFLATED) {
          if (xs == INFLATED)
              xs = compactValFor(xDec.intVal);
          return xs == s;
      } else if (xs != INFLATED)
          return xs == compactValFor(this.intVal);
  
      return this.inflated().equals(xDec.inflated());
  }
  
  BigDecimal a = new BigDecimal("1.9"); // scale = 1
  BigDecimal b = new BigDecimal("1.90"); // scale = 2
  System.out.println(a.equals(b)); // false
  ```

  `BIgDecimal`实现了`Comparable`接口, 比较数值大小推荐使用compareTo方法

  ```java
  BigDecimal a = new BigDecimal("1.9");
  BigDecimal b = new BigDecimal("1.90");
  System.out.println(a.compareTo(b) == 0); // true
  ```


### 4. Do The Math

add, subtract, multiply, divide    ---- 加, 减, 乘, 除

1. divide(Bigdecimal) 这个除法运算时, 若结果为无限小数,则抛异常, 

   可以使用重载方法divide(BigDecimal divisor, int roundingMode),divide(BigDecimal divisor, int scale, int roundingMode) 

   `roundingMode`后面详细再提

   ```java
   BigDecimal a = new BigDecimal("1.0");
   BigDecimal b = new BigDecimal("3.0");
   // 0.33 (四舍五入,保留两位小数)
   System.out.println(a.divide(b, 2, BigDecimal.ROUND_HALF_UP));
   // java.lang.ArithmeticException: Non-terminating decimal expansion; no exact representable decimal result.
   System.out.println(a.divide(b));
   ```

2. 加减乘除后的scale问题  this.mathOps(that)    this  that分别为2个BigDecimal对象

   |ops      |result scale      |
   | :--: | :----: |
   | add | max(this.scale, that.scale) |
   | subtract | max(this.scale, that.scale) |
   | multiply | this.scale + that.scale |
   | divide | preferred scale : this.scale() -  divisor.scale() |
   | divide(BigDecimal divisor, int roundingMode) | this.scale() |
   | divide(BigDecimal divisor, int scale, int roundingMode) | 指定 |

   ```java
   BigDecimal a = new BigDecimal("1.5");
   BigDecimal b = new BigDecimal("0.5");
   // 结果:3
   // preferred scale : this.scale() -  divisor.scale() 好好品一品这句话
   System.out.println(a.divide(b));
   
   BigDecimal c = new BigDecimal("1.5");
   BigDecimal d = new BigDecimal("0.4");
   // 结果:3.75
   System.out.println(c.divide(d));
   
   BigDecimal e = new BigDecimal("1.5");
   BigDecimal f = new BigDecimal("0.3");
   // 结果: 5.0
   System.out.println(e.divide(f, BigDecimal.ROUND_HALF_UP));
   ```

### 5. RoundingMode

上面提到了divide除法保留小数以及四舍五入的舍入规则, 那么BigDecimal有哪些射入规则呢

|   RoundingMode    | intValue |                         description                          |
| :---------------: | :------: | :----------------------------------------------------------: |
|     ROUND_UP      |    0     |                       始终将前一位加一                       |
|    ROUND_DOWN     |    1     |                         丢弃舍入部分                         |
|   ROUND_CEILING   |    2     | if positive behaves like ROUND_UP<br> if negative behaves like ROUND_DOWN |
|    ROUND_FLOOR    |    3     | if positive behaves like ROUND_DOWN<br/> if negative behaves like ROUND_UP |
|   ROUND_HALF_UP   |    4     |                           四舍五入                           |
|  ROUND_HALF_DOWN  |    5     |                           五舍六入                           |
|  ROUND_HALF_EVEN  |    6     | round towards the literal "nearest neighbor"<br>if neighbors are equidistant,round towards the even neighbor |
| ROUND_UNNECESSARY |    7     |       已知结果时确定的值(不是无限小数), 可以不使用舍入       |

```java
// ROUND_UP
BigDecimal a = new BigDecimal("1.3356333");
BigDecimal b = new BigDecimal("-1.3356333");

// ROUND_DOWN
System.out.println(a.setScale(1, BigDecimal.ROUND_UP)); //1.4
System.out.println(b.setScale(1, BigDecimal.ROUND_UP)); //-1.4

// ROUND_CEILING
System.out.println(a.setScale(2, BigDecimal.ROUND_DOWN)); //1.33
System.out.println(b.setScale(2, BigDecimal.ROUND_DOWN)); //-1.33

// ROUND_FLOOR
System.out.println(a.setScale(2, BigDecimal.ROUND_CEILING)); //1.34
System.out.println(b.setScale(2, BigDecimal.ROUND_CEILING)); //-1.33

// ROUND_UNNECESSARY
BigDecimal c = new BigDecimal("1.21");
BigDecimal d = new BigDecimal("1.1");
System.out.println(c.divide(d, BigDecimal.ROUND_UNNECESSARY)); // 1.10 scale与c相同
```

