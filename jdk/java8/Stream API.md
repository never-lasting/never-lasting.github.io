# Strem API

为了更好的理解Stream API, 需要先理解JDK8的[Lambda Expression](./Lambda Expression)

## 1. Aggregate Operation 

```java
// aggregate ops using Stream and IntStream
int maleAgeSum = personList.stream()
                .filter(p -> p.getGender() == Person.Sex.MALE)
                .mapToInt(Person::getAge)
                .sum();
```



## 2. Stream & Pipeline

> A *stream* is a sequence of elements. Unlike a collection, it is not a data structure that stores elements. Instead, a stream carries values from a source through a pipeline. 
>
>  A *pipeline* is a sequence of aggregate operations.  

 A stream pipeline contains the following components: 

- A ***resource***: This could be a *collection*, an *array*,  a generator function, or an I/O channel 
- Zero or more ***intermediate operations***.  An intermediate operation, such as `filter(Predicate)`, produces a new stream. 
-  A ***terminal operation***. produces a non-stream result or side-effect, such as `count()` or `foreach(Consumer)`



**Note:**

1.  Most stream ops accept parameters that describe user-specified behavior, such as Lambda expression(in the example above). To preserve correct behavior, these *behavior parameters* must be non-interfering(they do not modify the stream source); and in most cases must be stateless(there result should not depend on any state that might change during execution of the stream pipeline)

2. A stream should be operated on (invoking an intermediate or terminal stream ops) only once.A stream implementation may throw `IllegalStateException` , if it detects that the stream is being reused. 

   ```java
   @Test
   public void test() {
       Stream<Person> stream = personList.stream();
       // intermediate ops(filter) create a new Stream
       stream.filter(p -> p.getGender() == Person.Sex.MALE)
           .forEach(System.out::println);
       
   	// java.lang.IllegalStateException: stream has already been operated upon or closed
       stream.filter(person -> person.getGender() == Person.Sex.FEMALE);
   }
   ```

3. Nearly all stream instances do not actually need to be closed after use, unless streams whose source is an IO channel. If a stream does require closing, It can be declared as a resource in a `tyr-with-resouces` statement ,since Stream is a sub-interface of `AutoCloseable`.

4. Streams are lazy; computation on the source data is only performed when the terminal operation is initiated, and source elements are consumed only as needed.

   ```java
   @Test
   public void test() {
       // create a stream of Person objects via Collection.stream()
       // filter it to produce a stream containing only the male Persons
       Stream<Person> stream = personList.stream()
           .filter(p -> p.getGender() == Person.Sex.MALE);
   	
       // add a new MALE person to the list
       personList.add(new Person("Jack", LocalDate.of(1977, 1, 22), Person.Sex.MALE, "..."));
       // terminal operation foreach to print elements
       // Jack will show
       stream.forEach(System.out::println);
   }
   ```

   

