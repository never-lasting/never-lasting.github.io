# Why capacity must be a power of two?

HashMap的由数组+链表(或者红黑树)的形式实现的, capacity虽然不是HashMap中的成员变量, 但是却是一个非常重要的概念. capacity代表的bucket的数量(数组的长度).

```java
    /**
     * The default initial capacity - MUST be a power of two.
     */
    static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; // aka 16
```

HashMap中默认的initial capacity是16并且注明了必须是2的幂, 而HashMap的重载构造器是支持传入initialCapacity的, 代码如下

```java
    /**
     * Constructs an empty <tt>HashMap</tt> with the specified initial
     * capacity and load factor.
     *
     * @param  initialCapacity the initial capacity
     * @param  loadFactor      the load factor
     * @throws IllegalArgumentException if the initial capacity is negative
     *         or the load factor is nonpositive
     */
    public HashMap(int initialCapacity, float loadFactor) {
        if (initialCapacity < 0)
            throw new IllegalArgumentException("Illegal initial capacity: " + initialCapacity);
        if (initialCapacity > MAXIMUM_CAPACITY)
            initialCapacity = MAXIMUM_CAPACITY;
        if (loadFactor <= 0 || Float.isNaN(loadFactor))
            throw new IllegalArgumentException("Illegal load factor: " + loadFactor);     
        this.loadFactor = loadFactor;
        // 注意这里
        this.threshold = tableSizeFor(initialCapacity);
    }
```

当我们使用这个构造器时,传入一个不是2的幂的initialCapacity, HashMap会选择大于该数字的第一个2的幂作为initialCapacity

```java
    /**
     * Returns a power of two size for the given target capacity.
     */
    static final int tableSizeFor(int cap) {
        int n = cap - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }
```

当HashMap的size到达阈值(threshold), capacity会扩容到原来的2倍, 依旧是2的幂

**那么为什么capacity必须要是2的幂?**

> 我们都知道HashMap的数据结构就是数组+链表(或者红黑树), key的hash决定数据存放在哪个桶(数组的哪个位置), 那么hash%capacity(数组length)这个取模运算就可以.  sun公司的大佬们发现**当capacity是2的幂时,  hash & (capacity - 1) == hash % capacity** .于是capacity被设计只能是2的幂,性能更高的位运算hash & (capacity -1)也替代了原来的取模算法

那如何证明**当capacity是2的幂时,  hash & (capacity - 1) == hash % capacity**

1. hash = capacity 时   ===> hash & (capacity - 1) = 0             hash % capacity = 0                成立

2. hash < capacity 时   ===> hash & (capacity - 1) = hash       hash % capacity = hash         成立

3. hash > capacity 时   ===> hash = n * capacity + 小于capacity部分(余数部分)


解释下3:

hash > capacity时,  hash可以拆分为2部分. 以capacity = 16, hash = 54举例

capacity : 0001 0000

hash       : 0011 0110        拆分为  0011 0000 (高位部分)   +    0000 0110(低位部分) 

高位部分必定是capacity的倍数,取模为0;低位部分 < capacity ,取模为本身

hash % capacity = 低位部分 % capacity = 低位部分

hash & (capacity - 1) = 低位部分    



> 在jdk8 Date-Time api中判断闰年的时候也用到了这个算法  (prolepticYear & 3 替代 prolepticYear % 4)
>
> ```java
>  // 4年一闰 百年不闰 400年再闰
>  @Override
>  public boolean isLeapYear(long prolepticYear) {
>      return ((prolepticYear & 3) == 0) && 
>          ((prolepticYear % 100) != 0 || (prolepticYear % 400) == 0);
>  }
> ```
>