## of_gpio_named_count()

---

用于函数用于获取设备树某个属性里面定义了几个 GPIO信息，要注意的是空的 GPIO信息也会被统计到.

## 补充说明

---

#### 语法

```c
int of_gpio_named_count(struct device_node *np, const char *propname)
```

#### 参数

np :设备节点

propname :要统计的GPIO属性

#### 返回值

正值，统计到的 GPIO数量；负值，失败。
