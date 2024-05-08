## iio_device_alloc()

---

用于申请iio_dev

## 补充说明

---

#### 语法

```c
struct iio_dev *iio_device_alloc(int sizeof_priv)
```

#### 参数

**sizeof_priv**：私有数据内存空间大小，一般我们会将自己定义的设备结构体变量作为 iio_dev的私有数据，这样可以直接通过 iio_device_alloc 函数同时完成 iio_dev 和设备结构体变量的内存申请。申请成功以后使用 `iio_priv `函数来得到自定义的设备结构体变量首地址。

#### 返回值

如果申请成功就返回 iio_dev 首地址，如果失败就返回 NULL。

#### 示例

```c
struct icm20608_dev *dev
struct iio_dev *indio_dev

/*申请iio_dev内存*/
indio_dev = iio_device_alloc(sizeof(*dev));
if(!indio_dev)
    return -ENOMEM;
/*获取设备结构体变量地址*/
dev = iio_priv(indio_dev);
```
