## gpio_get_value()

---

用于获取某个GPIO的值（0或1）

## 补充说明

---

#### 语法

```c
#define gpio_get_value __gpio_get_value 
int __gpio_get_value(unsigned gpio)
```

#### 参数

gpio ：要获取的gpio标号

#### 返回值

非负值，得到的 GPIO值；负值，获取失败。
