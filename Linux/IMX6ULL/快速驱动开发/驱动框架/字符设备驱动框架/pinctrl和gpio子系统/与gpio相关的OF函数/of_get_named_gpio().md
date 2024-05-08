## of_get_named_gpio()

---

用于获取 GPIO编号，因为 Linux内核中关于 GPIO的 API函数都要使用 GPIO编号，
此函数会将设备树中类似 <&gpio5 7 GPIO_ACTIVE_LOW>的属性信息转换为对应的 GPIO编号

## 补充说明

---

#### 语法

```c
int of_get_named_gpio(struct device_node *np, const char *propname, int index)
```

#### 参数

np :              设备节点

propname :包含要获取GPIO信息的属性名。

index:          GPIO索引，因为一个属性里面可能包含多个 GPIO，此参数指定要获取哪个 GPIO的编号，如果只有一个 GPIO信息的话此参数为 0。

#### 返回值

正值，获取到的 GPIO编号；负值，失败。
