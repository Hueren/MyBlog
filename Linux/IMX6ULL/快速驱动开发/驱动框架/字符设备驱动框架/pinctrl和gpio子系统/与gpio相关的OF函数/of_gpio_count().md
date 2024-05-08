## of_gpio_count()

---

用于函数用于获取设备树"gpio"属性的GPIO数量，要注意的是空的 GPIO信息也会被统计到.

## 补充说明

---

#### 语法

```c
int of_gpio_count(struct device_node *np)
```

#### 参数

np :设备节点

#### 返回值

正值，统计到的 GPIO数量；负值，失败。
