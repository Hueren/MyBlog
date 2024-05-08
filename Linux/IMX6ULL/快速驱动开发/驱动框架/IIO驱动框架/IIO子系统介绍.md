## iio_dev

```c
struct iio_dev {
    int                id;

    int                modes;
    int                currentmode; /*当前模式*/
    struct device            dev;

    struct iio_event_interface    *event_interface;

    struct iio_buffer        *buffer;/*缓冲区*/
    struct list_head        buffer_list;/*当前匹配的缓冲区列表*/
    int                scan_bytes;/*捕获到，并且提供给缓冲区的字节数*/
    struct mutex            mlock;

    const unsigned long        *available_scan_masks;/*为可选的扫描位掩码，使用触发缓冲区的时候可以通过设
置掩码来确定使能哪些通道，使能以后的通道会将捕获到的数据发送到 IIO 缓冲区。*/
    unsigned            masklength;
    const unsigned long        *active_scan_mask;/*为缓冲区已经开启的通道掩码。只有这些使能了的通道数据才
能被发送到缓冲区*/
    bool                scan_timestamp;/*扫描时间戳，如果使能以后会将捕获时间戳放到缓冲区里面。*/
    unsigned            scan_index_timestamp;
    struct iio_trigger        *trig;
    struct iio_poll_func        *pollfunc;

    struct iio_chan_spec const    *channels;
    int                num_channels;

    struct list_head        channel_attr_list;
    struct attribute_group        chan_attr_group;
    const char            *name;
    const struct iio_info        *info;/*iio_info 结构体类型，这个结构体里面有很多函数，需要驱动开发人员编
写，非常重要！我们从用户空间读取 IIO 设备内部数据，最终调用的就是 iio_info 里面的函数*/
    struct mutex            info_exist_lock;
    const struct iio_buffer_setup_ops    *setup_ops;
    struct cdev            chrdev; 
    ......
}
```

## iio_info

```c
struct iio_info {
    struct module            *driver_module;
    struct attribute_group        *event_attrs;
    const struct attribute_group    *attrs;/*通用的设备属性*/

    int (*read_raw)(struct iio_dev *indio_dev,
            struct iio_chan_spec const *chan,
            int *val,
            int *val2,
            long mask);

    int (*read_raw_multi)(struct iio_dev *indio_dev,
            struct iio_chan_spec const *chan,
            int max_len,
            int *vals,
            int *val_len,
            long mask);

    int (*write_raw)(struct iio_dev *indio_dev,
             struct iio_chan_spec const *chan,
             int val,
             int val2,
             long mask);

    int (*write_raw_get_fmt)(struct iio_dev *indio_dev,
             struct iio_chan_spec const *chan,
             long mask); 
}
```

**val，val2**：对于 read_raw 函数来说 val 和 val2 这两个就是应用程序从内核空间读取到数据，一般就是传感器指定通道值，或者传感器的量程、分辨率等。对于 write_raw 来说就是应用程序向设备写入的数据。val 和 val2 共同组成具体值，val 是整数部分，val2 是小数部分。但是val2 也是对具体的小数部分扩大 N 倍后的整数值，因为不能直接从内核向应用程序返回一个小数值。比如现在有个值为 1.00236，那么 val 就是 1，vla2 理论上来讲是 0.00236，但是我们需要对 0.00236 扩大 N 倍，使其变为整数，这里我们扩大 1000000 倍，那么 val2 就是 2360。因此val=1，val2=2360。扩大的倍数我们不能随便设置，而是要使用 Linux 定义的倍数

| 组合宏                       | 描述                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| IIO_VAL_INT               | 整数值，没有小数。比如 5000，那么就是 val=5000，不需要设置 val2                                                          |
| IIO_VAL_INT_PLUS_MICRO    | 小数部分扩大 1000000 倍，比如 1.00236，此时 val=1， val2=2360。                                                   |
| IIO_VAL_INT_PLUS_NANO     | 小数部分扩大 1000000000 倍，同样是 1.00236，此时                                                                 |
| val=1，val2=2360000。       |                                                                                                    |
| IIO_VAL_INT_PLUS_MICRO_DB | dB 数据，和 IIO_VAL_INT_PLUS_MICRO 数据形式一 样，只是在后面添加 db。                                                 |
| IIO_VAL_INT_MULTIPLE      | 多个整数值，比如一次要传回 6 个整数值，那么 val 和 val2就不够用了。此宏主要用于iio_info的read_raw_multi 函数。                          |
| IIO_VAL_FRACTIONAL        | 分数值，也就是 val/val2。比如 val=1，val2=4，那么实际 值就是 1/4。                                                     |
| IIO_VAL_FRACTIONAL_LOG2   | 值为 val>>val2，也就是 val 右移 val2 位。比如 val=25600，val2=4 ， 那 么 真 正 的 值 就 是 25600 右 移 4 位 ，25600>>4=1600. |

**mask**：掩码，用于指定我们读取的是什么数据，比如 ICM20608 这样的传感器，他既有原始的测量数据，比如 X,Y,Z 轴的陀螺仪、加速度计等，也有测量范围值，或者分辨率。比如加速度计测量范围设置为±16g，那么分辨率就是32/65536≈0.000488，我们只有读出原始值以及对应的分辨率(量程)，才能计算出真实的重力加速度。此时就有两种数据值：传感器原始值、分辨率。Linux 内核使用 IIO_CHAN_INFO_RAW 和 IIO_CHAN_INFO_SCALE 这两个宏来表示原始值以及分辨率，这两个宏就是掩码。至于每个通道可以采用哪几种掩码，这个在我们初始化
通道的时候需要驱动编写人员设置好。

`write_raw_get_fmt `用于设置用户空间向内核空间写入的数据格式，
write_raw_get_fmt 函数决定了 wtite_raw 函数中 val 和 val2 的意义，也就是表 75.1.2.1 中的组合形式。比如我们需要在应用程序中设置 ICM20608 加速度计的量程为±8g，那么分辨率就是16/65536≈0.000244，我们在 write_raw_get_fmt 函数里面设置加速度计的数据格式为IIO_VAL_INT_PLUS_MICRO。那么我们在应用程序里面向指定的文件写入 0.000244 以后，最终传递给内核驱动的就是 0.000244*1000000=244。也就是 write_raw 函数的 val 参数为 0，val2参数为 244。

## iio_chan_spec

```c
struct iio_chan_spec {
    enum iio_chan_type    type;
    int            channel;
    int            channel2;
    unsigned long        address;/*用户可以自定义，但是一般会设置为此通道对应的芯片数据寄存器地址,也可以不使用 address*/
    int            scan_index;
    struct {
        char    sign;/*如果为‘u’表示数据为无符号类型，为‘s’的话为有符号类型。*/
        u8    realbits;/*数据真实的有效位数，比如很多传感器说的 10 位 ADC，其真实有效数据就是 10 位*/
        u8    storagebits;/*存储位数，有效位数+填充位。比如有些传感器 ADC 是 12 位的，
那么我们存储的话肯定要用到 2 个字节，也就是 16 位，这 16 位就是存储位数。*/
        u8    shift;/*右移位数，也就是存储位数和有效位数不一致的时候，需要右移的位数，这
个参数不总是需要，一切以实际芯片的数据手册位数。*/
        u8    repeat;/*实际或存储位的重复数量。*/
        enum iio_endian endianness;/*数据的大小端模式，可设置为 IIO_CPU、IIO_BE(大端)或 IIO_LE(小
端)。*/
    } scan_type;/*描述了扫描数据在缓冲区中的存储格式。*/
    long            info_mask_separate;/*标记某些属性专属于此通道*/
    long            info_mask_shared_by_type;
    long            info_mask_shared_by_dir;
    long            info_mask_shared_by_all;
    const struct iio_event_spec *event_spec;
    unsigned int        num_event_specs;
    const struct iio_chan_spec_ext_info *ext_info;
    const char        *extend_name;
    const char        *datasheet_name;
    unsigned        modified:1;
    unsigned        indexed:1;
    unsigned        output:1;
    unsigned        differential:1;/*表示为差分通道*/
};
```

#### iio_chan_type

```c
enum iio_chan_type {
    IIO_VOLTAGE,
    IIO_CURRENT,
    IIO_POWER,
    IIO_ACCEL,
    IIO_ANGL_VEL,
    IIO_MAGN,
    IIO_LIGHT,
    IIO_INTENSITY,
    IIO_PROXIMITY,
    IIO_TEMP,
    IIO_INCLI,
    IIO_ROT,
    IIO_ANGL,
    IIO_TIMESTAMP,
    IIO_CAPACITANCE,
    IIO_ALTVOLTAGE,
    IIO_CCT,
    IIO_PRESSURE,
    IIO_HUMIDITYRELATIVE,
    IIO_ACTIVITY,
    IIO_STEPS,
    IIO_ENERGY,
    IIO_DISTANCE,
    IIO_VELOCITY,
};
```

#### iio_modifier

```c
enum iio_modifier {
    IIO_NO_MOD,
    IIO_MOD_X,
    IIO_MOD_Y,
    IIO_MOD_Z,
    IIO_MOD_X_AND_Y,
    IIO_MOD_X_AND_Z,
    IIO_MOD_Y_AND_Z,
    IIO_MOD_X_AND_Y_AND_Z,
    IIO_MOD_X_OR_Y,
    IIO_MOD_X_OR_Z,
    IIO_MOD_Y_OR_Z,
    IIO_MOD_X_OR_Y_OR_Z,
    IIO_MOD_LIGHT_BOTH,
    IIO_MOD_LIGHT_IR,
    IIO_MOD_ROOT_SUM_SQUARED_X_Y,
    IIO_MOD_SUM_SQUARED_X_Y_Z,
    IIO_MOD_LIGHT_CLEAR,
    IIO_MOD_LIGHT_RED,
    IIO_MOD_LIGHT_GREEN,
    IIO_MOD_LIGHT_BLUE,
    IIO_MOD_QUATERNION,
    IIO_MOD_TEMP_AMBIENT,
    IIO_MOD_TEMP_OBJECT,
    IIO_MOD_NORTH_MAGN,
    IIO_MOD_NORTH_TRUE,
    IIO_MOD_NORTH_MAGN_TILT_COMP,
    IIO_MOD_NORTH_TRUE_TILT_COMP,
    IIO_MOD_RUNNING,
    IIO_MOD_JOGGING,
    IIO_MOD_WALKING,
    IIO_MOD_STILL,
    IIO_MOD_ROOT_SUM_SQUARED_X_Y_Z,
};
```

**info_mask_separate 标记某些属性专属于此通道，include/linux/iio/iio.h 文件中的 iio_chan_info_enum 枚举类型描述了可选的属性值**

#### iio_chan_info_enum

```c
enum iio_chan_info_enum {
    IIO_CHAN_INFO_RAW = 0,
    IIO_CHAN_INFO_PROCESSED,
    IIO_CHAN_INFO_SCALE,
    IIO_CHAN_INFO_OFFSET,
    IIO_CHAN_INFO_CALIBSCALE,
    IIO_CHAN_INFO_CALIBBIAS,
    IIO_CHAN_INFO_PEAK,
    IIO_CHAN_INFO_PEAK_SCALE,
    IIO_CHAN_INFO_QUADRATURE_CORRECTION_RAW,
    IIO_CHAN_INFO_AVERAGE_RAW,
    IIO_CHAN_INFO_LOW_PASS_FILTER_3DB_FREQUENCY,
    IIO_CHAN_INFO_SAMP_FREQ,
    IIO_CHAN_INFO_FREQUENCY,
    IIO_CHAN_INFO_PHASE,
    IIO_CHAN_INFO_HARDWAREGAIN,
    IIO_CHAN_INFO_HYSTERESIS,
    IIO_CHAN_INFO_INT_TIME,
    IIO_CHAN_INFO_ENABLE,
    IIO_CHAN_INFO_CALIBHEIGHT,
    IIO_CHAN_INFO_CALIBWEIGHT,
    IIO_CHAN_INFO_DEBOUNCE_COUNT,
    IIO_CHAN_INFO_DEBOUNCE_TIME,
};
```
