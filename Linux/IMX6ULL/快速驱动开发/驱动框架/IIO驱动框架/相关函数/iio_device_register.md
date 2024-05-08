## iio_device_register()

---

用于将iio_dev注册到内核中

## 补充说明

---

#### 语法

```c
int iio_device_register(struct iio_dev *indio_dev)
```

#### 参数

**indio_dev**：需要注册的 iio_dev。

#### 返回值

0，成功；其他值，失败。
