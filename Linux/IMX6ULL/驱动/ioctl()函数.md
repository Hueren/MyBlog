## ioctl()

---

用于扩展file_operations给出的接口中没有的自定义功能

## 补充说明

---

### 1、应用程序中的ioctl接口

使用时需要规定命令码，命令码在应用程序和驱动程序中保持一致。

应用程序只需向驱动程序下发一条命令码，用来通知驱动执行哪条命令。

应用程序的接口函数为ioctl,函数原型如下：

```c
#include <sys/ioctl.h>

int ioctl(int fd,unsigned long request,...);
```

1. `fd` 必须是打开的文件描述符。当我们的设备作为特殊文件被open函数打开后，会返回一个文件描述符，通过操作这个文件描述符达到操作设备文件的目的

2. `request`是命令码，应用程序通过下发命令码来控制驱动程序完成对应操作

3. `...`是可变参数，一些情况下应用程序需要向驱动程序传递参数，参数通过`...`来传递。`...`只能传递一个参数，但内核不会检查这个参数的类型，因此有两种传参方式：只传一个整数，传递一个指针。

如果ioctl()执行成功，他的返回值就是驱动程序中对应接口给的返回值，驱动程序可以通过返回值向用户传参。驱动程序最好返回一个非负数。

应用程序中的`ioctl`运行失败会返回-1，并设置`errno`，

```css
errno不同值的代表含义：
EBADF:fd 不是有效的文件描述符
EFAULT:在“...”是指针的前提下，指针指向一个不可访问的内存空间
EINVAL:request或argp是无效的
ENOTTY:fd没有关联到一个字符特殊设备，或该request不适用于文件描述符fd引用的对象类型。
（说人话就是fd没有指向一个字符设备，或fd指向的文件不支持ioctl操作）
```

所以在用户空间调用ioctl()时，可以使用如下的错误判断处理

```c
#include <string.h>
#include <errno.h>

int ret;
ret = ioctl(fd, MYCMD);
if (ret == -1)
    printf("ioctl: %s\n", strerror(errno));
```

### 2、驱动程序中的ioctl接口

在驱动程序的ioctl函数体中，实现了一个switch-case结构，每一个case对应一个命令码，case内部是驱动程序实现该命令的相关操作。
ioctl的实现函数要传递给file_operations结构体中对应的函数指针，函数原型为

```c
#include <linux/ioctl.h>
long (*unlocked_ioctl) (struct file * fp, unsigned int request, unsigned long args);
long (*compat_ioctl) (struct file * fp, unsigned int request, unsigned long args);
```

`unlocked_ioctl`在无大内核锁（BKL）的情况下调用。64位用户程序运行在64位的`kernel`，或32位的用户程序运行在32位的`kernel`上，都是调用`unlocked_ioctl`函数。

`compat_ioctl`是64位系统提供32位ioctl的兼容方法，也在无大内核锁的情况下调用。即如果是32位的用户程序调用64位的`kernel`，则会调用`compat_ioctl`。如果驱动程序没有实现`compat_ioctl`，则用户程序在执行ioctl时会返回错误`Not a typewriter`。

另外，如果32位用户态和64位内核态发生交互时，第三个参数的长度需要保持一致，否则交互协议会出错。

### 3、用户与驱动之间的ioctl协议构成

也就是request或cmd，本质上就是一个32位数字，理论上可以是任何一个数，但为了保证命令码的唯一性，linux定义了一套严格的规定，通过计算得到这个命令吗数字。linux将32位划分为四段，如下图。

<img title="" src="file:///D:/MyBlog/docs/images/2024-04-16-22-06-24-image.png" alt="" data-align="center">

1、dir ，表示ioctl命令的访问模式，分为无数据(_IO)、读数据(_IOR)、写数据(_IOW)、读写数据(_IOWR)四种模式。

2、size，涉及到ioctl的参数arg，占据13bit或14bit，这个与体系有关，arm使用14bit。用来传递arg的数据类型的长度，比如如果arg是int型，我们就将这个参数填入int，系统会检查数据类型和长度的正确性。

3、type，即device type，表示设备类型，也可翻译成“幻数”或“魔数”，可以是任意一个char型字符，如’a’、‘b’、‘c’等，其主要作用是使ioctl命令具有唯一的设备标识。不过在内核中’w’、‘y’、'z’三个字符已经被使用了。

4、nr，即number，命令编号/序数，取值范围0~255，在定义了多个ioctl命令的时候，通常从0开始顺次往下编号。

在上面的四个参数都需要用户自己定义，linux系统提供了宏可以使程序员方便的定义ioctl命令码。

```c
include/uapi/asm-generic/ioctl.h
--------------------------------------------
/* used to create numbers */
#define _IO(type,nr)        _IOC(_IOC_NONE,(type),(nr),0)
#define _IOR(type,nr,size)  _IOC(_IOC_READ,(type),(nr),(_IOC_TYPECHECK(size)))
#define _IOW(type,nr,size)  _IOC(_IOC_WRITE,(type),(nr),(_IOC_TYPECHECK(size)))
#define _IOWR(type,nr,size) _IOC(_IOC_READ|_IOC_WRITE,(type),(nr),(_IOC_TYPECHECK(size)))
```

```c
_IO(type, nr)：用来定义不带参数的ioctl命令。
_IOR(type,nr,size)：用来定义用户程序向驱动程序写参数的ioctl命令。
_IOW(type,nr,size)：用来定义用户程序从驱动程序读参数的ioctl命令。
_IOWR(type,nr,size)：用来定义带读写参数的驱动命令。
```

系统也定义反向解析ioctl命令的宏。

```c
include/uapi/asm-generic/ioctl.h
--------------------------------------------
/* used to decode ioctl numbers */
#define _IOC_DIR(nr)        (((nr) >> _IOC_DIRSHIFT) & _IOC_DIRMASK)
#define _IOC_TYPE(nr)       (((nr) >> _IOC_TYPESHIFT) & _IOC_TYPEMASK)
#define _IOC_NR(nr)     (((nr) >> _IOC_NRSHIFT) & _IOC_NRMASK)
#define _IOC_SIZE(nr)       (((nr) >> _IOC_SIZESHIFT) & _IOC_SIZEMASK
```
