#### 在应用层操作I2C，使用ioctl来传参。 `ret = ioctl(fd, I2C_RDWR, (unsigned long)&erom_data);` 这是设备接口控制函数ioctl。

#### I2C_RDWR 是命令控制符，这是定义在 linux/i2c-dev.h 中的宏。就是告诉驱动我们要它干什么。

```c
 #define I2C_RETRIES    0x0701  /* number of times a device address should be polled when not acknowledging */
#define I2C_TIMEOUT 0x0702  /* set timeout in units of 10 ms */

/* NOTE: Slave address is 7 or 10 bits, but 10-bit addresses
 * are NOT supported! (due to code brokenness)
 */
#define I2C_SLAVE   0x0703  /* Use this slave address */
#define I2C_SLAVE_FORCE 0x0706  /* Use this slave address, even if it
                   is already in use by a driver! */
#define I2C_TENBIT  0x0704  /* 0 for 7 bit addrs, != 0 for 10 bit */

#define I2C_FUNCS   0x0705  /* Get the adapter functionality mask */

#define I2C_RDWR    0x0707  /* Combined R/W transfer (one STOP only) */

#define I2C_PEC     0x0708  /* != 0 to use PEC with SMBus */
#define I2C_SMBUS   0x0720  /* SMBus transfer */
```

透过这些命令控制符，可向定义在 /linux/i2c-dev.c 的i2cdev_ioctl()函数传递cmd。下面的fops 就是定义在i2c-dev.c 的钩子函数，在应用程序空间调用ioctl，内核就会找到i2cdev_ioctl()，并且调用。然后根据传入的不同的命令控制符，来调用不同函数来实现不同的功能。

```c

    static const struct file_operations i2cdev_fops = {
    .owner      = THIS_MODULE,
    .llseek     = no_llseek,
    .read       = i2cdev_read,
    .write      = i2cdev_write,
    .unlocked_ioctl = i2cdev_ioctl,
    .open       = i2cdev_open,
    .release    = i2cdev_release,
};
```

```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/ioctl.h>

#define I2C_RDWR    0x0707    /* Combined R/W transfer (one STOP only) */

struct i2c_msg {
    unsigned short addr;    /* slave address            */
    unsigned short flags;
    unsigned short len;        /* msg length                */
    unsigned char *buf;        /* pointer to msg data            */
};

/* This is the structure as used in the I2C_RDWR ioctl call */
struct i2c_rdwr_ioctl_data {
    struct i2c_msg  *msgs;    /* pointers to i2c_msgs */
    unsigned long nmsgs;            /* number of i2c_msgs */
};

int main()
{
    int fd=0;
    struct i2c_rdwr_ioctl_data eeprom_data;

    //打开字符设备文件
    fd = open("/dev/i2c-0", O_RDWR);

    //构造需要写入到EEPROM的消息
    eeprom_data.nmsgs = 1;  //写只有一条消息
    (eeprom_data.msgs) = (struct i2c_msg *)malloc(2 * sizeof(struct i2c_msg));
    (eeprom_data.msgs[0]).addr = 0x50;//I2C设备地址
    (eeprom_data.msgs[0]).flags = 0;//0为写，1为读
    (eeprom_data.msgs[0]).len = 2;//写入数据长度
    (eeprom_data.msgs[0]).buf = (unsigned char *)malloc(2);//申请2个字节
    (eeprom_data.msgs[0]).buf[0] = 0x10;//写入到EEPROM的偏移地址
    (eeprom_data.msgs[0]).buf[1] = 0x60;//写入到偏移地址的数据

    //使用ioctl把数据写入到EEPROM中
    ioctl(fd, I2C_RDWR, (unsigned long)&eeprom_data);//需要做类型转换，因为i2cdev_ioctl_rdrw的参数是unsigned long

    //构造从EEPROM读数据的消息
    eeprom_data.nmsgs = 2;  //读有二条消息
    (eeprom_data.msgs[0]).addr = 0x50;//先写入需要开始读取的偏移地址，然后开始读
    (eeprom_data.msgs[0]).flags = 0;
    (eeprom_data.msgs[0]).len = 1;
    (eeprom_data.msgs[0]).buf[0] = 0x10;

    (eeprom_data.msgs[1]).addr = 0x50;//然后开始读取数据，len的长度为1，表示读取数据的长度
    (eeprom_data.msgs[1]).flags = 1;
    (eeprom_data.msgs[1]).len = 1;
    (eeprom_data.msgs[1]).buf = (unsigned char *)malloc(2);
    (eeprom_data.msgs[1]).buf[0] = 0;//先把读取缓冲清0

    //使用ioctl读出消息
    ioctl(fd, I2C_RDWR, (unsigned long)&eeprom_data);
    printf("buf[0]:%x\n", (eeprom_data.msgs[1]).buf[0]);

    //关闭字符设备
    close(fd);
    return 0;
}
```
