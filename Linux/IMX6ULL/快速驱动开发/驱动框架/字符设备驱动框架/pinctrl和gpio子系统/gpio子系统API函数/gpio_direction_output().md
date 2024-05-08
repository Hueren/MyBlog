## gpio_direction_output()

---

用于设置某个GPIO为输出，并且设置默认输出值

## 补充说明

---

#### 语法

```c
int gpio_direction_output(unsigned gpio, int value);
```

#### 参数

gpio ：要设置为输出的gpio标号

value ：GPIO默认输出值。

#### 返回值

0，设置成功；负值，设置失败。
