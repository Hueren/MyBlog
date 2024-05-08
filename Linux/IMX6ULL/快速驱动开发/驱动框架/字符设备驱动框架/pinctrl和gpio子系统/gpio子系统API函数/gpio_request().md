## gpio_request()

---

用于申请一个GPIO管脚

## 补充说明

---

在使用一个 GPIO之前一定要使用 gpio_request进行申请。

#### 语法

```c
int gpio_request(unsigned gpio, const char *label)
```

#### 参数

gpio ：要申请的 gpio标号，使用 of_get_named_gpio函数从设备树获取指定 GPIO属性信息，此函数会返回这个 GPIO的标号。
label：给 gpio设置个名字。

#### 返回值

 0，申请成功；其他值，申请失败。
