## iio_device_free()

---

用于释放iio_dev

## 补充说明

也可以使用 devm_iio_device_alloc 来分配 iio_dev ， 这 样 就 不 需 要 我 们 手 动 调 用iio_device_free 函数完成 iio_dev 的释放工作。

---

#### 语法

```c
void iio_device_free(struct iio_dev *indio_dev)
```

#### 参数

**indio_dev**：需要释放的 iio_dev。

#### 返回值

无


