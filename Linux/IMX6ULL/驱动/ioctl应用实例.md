## 简单实例——整数传参

本例中，我们让ioctl传递三个命令，分别是一个无参数、写参数、读参数三个指令。首先我们需要确定两个头文件，命名为ioctl_test.h和user_ioctl.h，用来分别定义内核空间和用户空间下的命令码协议。两个头文件中除了引用不同的头文件外，其他内容需要完全一致，以保证协议的一致性。

---

我们使用字符’a’作为幻数，三个命令的作用分别是用户程序让驱动程序打印一句话，用户程序从驱动程序读一个int型数，用户程序向驱动程序写一个int型数。

### ioctl_test.h(驱动)

```c
#include <linux/ioctl.h>

#define CMD_IOC_MAGIC    'a'
#define CMD_IOC_0        _IO(CMD_IOC_MAGIC, 0)
#define CMD_IOC_1        _IOR(CMD_IOC_MAGIC, 1, int)
#define CMD_IOC_2        _IOW(CMD_IOC_MAGIC, 2, int)
```

### user_ioctl.h

```c
#include <sys/ioctl.h>

#define CMD_IOC_MAGIC    'a'
#define CMD_IOC_0        _IO(CMD_IOC_MAGIC, 0)
#define CMD_IOC_1        _IOR(CMD_IOC_MAGIC, 1, int)
#define CMD_IOC_2        _IOW(CMD_IOC_MAGIC, 2, int)
```

### ioctl_test.c

```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/uaccess.h>
#include "ioctl_test.h"

MODULE_LICENSE("GPL");
MODULE_AUTHOR("zz");

static dev_t devno;

static int demo_open(struct inode *ind, struct file *fp)
{
    printk("demo open\n");
    return 0;
}

static int demo_release(struct inode *ind, struct file *fp)
{
    printk("demo release\n");
    return 0;
}

static long demo_ioctl(struct file *fp, unsigned int cmd, unsigned long arg)
{
    int rc = 0;
    int arg_w;
    const int arg_r = 566;
    if (_IOC_TYPE(cmd) != CMD_IOC_MAGIC) {
        pr_err("%s: command type [%c] error.\n", __func__, _IOC_TYPE(cmd));
        return -ENOTTY;
    }

    switch(cmd) {
        case CMD_IOC_0:
            printk("cmd 0: no argument.\n");
            rc = 0;
            break;
        case CMD_IOC_1:
            printk("cmd 1: ioc read, arg = %d.\n", arg_r);
            arg = arg_r;
            rc = 1;
            break;
        case CMD_IOC_2:
            arg_w = arg;
            printk("cmd 2: ioc write, arg = %d.\n", arg_w);
            rc = 2;
            break;
        default:
            pr_err("%s: invalid command.\n", __func__);
            return -ENOTTY;
    }
    return rc;
}

static struct file_operations fops = {
    .open = demo_open,
    .release = demo_release,
    .unlocked_ioctl = demo_ioctl,
};

static struct cdev cd;

static int demo_init(void)
{
    int rc;
    rc = alloc_chrdev_region(&devno, 0, 1, "test");
    if(rc < 0) {
        pr_err("alloc_chrdev_region failed!");
        return rc;
    }
    printk("MAJOR is %d\n", MAJOR(devno));
    printk("MINOR is %d\n", MINOR(devno));

    cdev_init(&cd, &fops);
    rc = cdev_add(&cd, devno, 1);
    if (rc < 0) {
        pr_err("cdev_add failed!");
        return rc;
    }
    return 0;
}

static void demo_exit(void)
{
    cdev_del(&cd);
    unregister_chrdev_region(devno, 1);
    return;
}

module_init(demo_init);
module_exit(demo_exit);
```

### user_ioctl.c

```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include "user_ioctl.h"

int main()
{
    int rc;
    int arg_r;
    const int arg_w = 233;
    int fd = open("/dev/test_chr_dev", O_RDWR);
    if (fd < 0) {
        printf("open file failed!\n");
        return -1;
    }

    rc = ioctl(fd, CMD_IOC_0);
    printf("rc = %d.\n", rc);

    rc = ioctl(fd, CMD_IOC_1, arg_r);
    printf("ioc read arg = %d, rc = %d.\n", arg_r, rc);

    rc = ioctl(fd, CMD_IOC_2, arg_w);
    printf("ioc write arg = %d, rc = %d.\n", arg_w, rc);

    close(fd);
    return 0;
}
```

## 简单实例——地址传参

实际使用中我们可能需要传递更复杂的参数，或者传递多个参数，这时我们就只能传递参数的地址，或者将多个参数打包成一个结构体再传递该结构体的地址。

在Linux系统中，用户空间和内核空间之间是相互隔离开的。驱动程序运行在内核空间中，给出的地址也是在内核空间中的地址，运行在用户空间下的用户程序即使拿到这个地址，也不能访问内核空间。这时，我们需要使用到`copy_to_user()`函数，将要传递的内容从内核空间拷贝到用户空间，用户程序再访问用户空间中的该内容即可。

```c
unsigned long copy_to_user(void *to, const void *from, unsigned long n)
```

1）to：目标地址（用户空间）
2）from：源地址（内核空间）
3）n：需要拷贝的数据的字节数
返回值：成功返回0，失败返回没有拷贝成功的数据字节数。

```c
unsigned long copy_from_user(void *to, const void *from, unsigned long n)
```

1）to：目标地址（内核空间）
2）from：源地址（用户空间）
3）n：需要拷贝的数据的字节数
返回值：成功返回0，失败返回没有拷贝成功的数据字节数。

### 传递两个参数char arg1和int arg2，将这两个参数打包进一个结构体struct IOC_ARGS中。这个结构体在用户程序和驱动程序中也需要保持一致。

### user_ioctl.h

```c
#include <sys/ioctl.h>

struct IOC_ARGS {
    char    arg1;
    int        arg2;
};

#define CMD_IOC_MAGIC    'a'
#define CMD_IOC_0        _IOR(CMD_IOC_MAGIC, 0, struct IOC_ARGS)
#define CMD_IOC_1        _IOW(CMD_IOC_MAGIC, 1, struct IOC_ARGS)
```

### ioctl_test.h(驱动)

```c
#include <linux/ioctl.h>

typedef struct IOC_ARGS {
    char    arg1;
    int        arg2;
}IOC_ARGS;

#define CMD_IOC_MAGIC    'a'
#define CMD_IOC_0        _IOR(CMD_IOC_MAGIC, 0, struct IOC_ARGS)
#define CMD_IOC_1        _IOW(CMD_IOC_MAGIC, 1, struct IOC_ARGS)
```

### user_ioctl.c

```c
#include <stdio.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include "user_ioctl.h"

int main()
{
    int rc;
    struct IOC_ARGS args_r;
    struct IOC_ARGS args_w = {'u', 233};
    int fd = open("/dev/test_chr_dev", O_RDWR);

    rc = ioctl(fd, CMD_IOC_0, &args_r);
    if (rc < 0)
        printf("ioctl: %s\n", strerror(errno));
    else
        printf("ioc read arg1 = %c, arg2 = %d.\n", args_r.arg1, args_r.arg2);

    rc = ioctl(fd, CMD_IOC_1, &args_w);
    if (rc < 0)
        printf("ioctl: %s\n", strerror(errno));
    else
        printf("ioc write arg1 = %c, arg2 = %d.\n", args_w.arg1, args_w.arg2);

    close(fd);
    return 0;
}
```

### ioctl_test.c

```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/uaccess.h>
#include "ioctl_test.h"

MODULE_LICENSE("GPL");
MODULE_AUTHOR("zz");

static dev_t devno;

static int demo_open(struct inode *ind, struct file *fp)
{
    printk("demo open\n");
    return 0;
}

static int demo_release(struct inode *ind, struct file *fp)
{
    printk("demo release\n");
    return 0;
}

static long demo_ioctl(struct file *fp, unsigned int cmd, unsigned long arg)
{
    int rc = 0;
    struct IOC_ARGS args_r = {'k', 566};
    struct IOC_ARGS args_w;
    if (_IOC_TYPE(cmd) != CMD_IOC_MAGIC) {
        pr_err("%s: command type [%c] error.\n", __func__, _IOC_TYPE(cmd));
        return -ENOTTY;
    }

    switch(cmd) {
        case CMD_IOC_0:
            rc = copy_to_user((char __user *)arg, &args_r, sizeof(IOC_ARGS));
            if (rc) {
                pr_err("%s: copy_to_user failed", __func__);
                return rc;
            }
            printk("%s: ioc read arg1 = %c, arg2 = %d", __func__, args_r.arg1, args_r.arg2);
            break;
            break;
        case CMD_IOC_1:
            rc = copy_from_user(&args_w, (char __user *)arg, sizeof(IOC_ARGS));
            if (rc) {
                pr_err("%s: copy_from_user failed", __func__);
                return rc;
            }
            printk("%s: ioc write arg1 = %c, arg2 = %d", __func__, args_w.arg1, args_w.arg2);
            break;
        default:
            pr_err("%s: invalid command.\n", __func__);
            return -ENOTTY;
    }
    return rc;
}

static struct file_operations fops = {
    .open = demo_open,
    .release = demo_release,
    .unlocked_ioctl = demo_ioctl,
};

static struct cdev cd;

static int demo_init(void)
{
    int rc;
    rc = alloc_chrdev_region(&devno, 0, 1, "test");
    if(rc < 0) {
        pr_err("alloc_chrdev_region failed!");
        return rc;
    }
    printk("MAJOR is %d\n", MAJOR(devno));
    printk("MINOR is %d\n", MINOR(devno));

    cdev_init(&cd, &fops);
    rc = cdev_add(&cd, devno, 1);
    if (rc < 0) {
        pr_err("cdev_add failed!");
        return rc;
    }
    return 0;
}

static void demo_exit(void)
{
    cdev_del(&cd);
    unregister_chrdev_region(devno, 1);
    return;
```
