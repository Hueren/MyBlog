## sigaction()

---

用于Linux系统下设置信号处理方式

## 补充说明

---

**sigaction()** 允许单独获取信号的处理函数而不是设置，并且还可以设置各种属性对调用信号处理函数时的行为施以更加精准的控制

需要包含头文件`<signal.h>`

#### 语法

```c
int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact);
```

#### 参数

**signum**: 需要设置的信号，除了SIGKILL信号和SIGSTOP信号之外的任何信号.

**act**        : act参数是一个struct sigaction类型指针，指向一个`struct sigaction`数据结构，该数据结构描述了信号的处理方式，稍后介绍该数据结构；如果参数act不为NULL，则表示需要为信号设置新的处理方式；如果参数act为NULL，则表示无需改变信号当前的处理方式。
**oldact**    : oldact参数也是一个struct sigaction类型指针，指向一个struct sigaction数据结构。如果参数oldact不为NULL，则会将信号之前的处理方式等信息通过参数oldact返回出来；如果无意获取此类信息，那么可将该参数设置为NULL。

#### 返回值

成功返回0；失败将返回-1，并设置errno。

#### struct sigaction结构体

```c
示例代码 8.4.2 struct sigaction结构体 
struct sigaction 
{ 
    void (*sa_handler)(int); 
    void (*sa_sigaction)(int, siginfo_t *, void *); 
    sigset_t sa_mask; 
    int sa_flags; 
    void (*sa_restorer)(void); 
};
```

⚫ sa_handler：  指定信号处理函数，与signal()函数的handler参数相同。
⚫ sa_sigaction：也用于指定信号处理函数，这是一个替代的信号处理函数，他提供了更多的参数，可以通过该函数获取到更多信息，这些信号通过siginfo_t参数获取，稍后介绍该数据结构；sa_handler和sa_sigaction是互斥的，不能同时设置，对于标准信号来说，使用sa_handler就可以了，可通过SA_SIGINFO标志进行选择。
⚫ sa_mask：参数sa_mask定义了一组信号，当进程在执行由sa_handler所定义的信号处理函数之前，会先将这组信号添加到进程的信号掩码字段中，当进程执行完处理函数之后再恢复信号掩码，将这组信号从信号掩码字段中删除。当进程在执行信号处理函数期间，可能又收到了同样的信号或其它信号，从而打断当前信号处理函数的执行，这就好点像中断嵌套；通常我们在执行信号处理函数期间不希望被另一个信号所打断，那么怎么做呢？那么就是通过信号掩码来实现，如果进程接收到了信号掩码中的这些信号，那么这个信号将会被阻塞暂时不能得到处理，直到这些信号从进程的信号掩码中移除。在信号处理函数调用时，进程会自动将当前处理的信号添加到信号掩码字段中，这样保证了在处理一个给定的信号时，如果此信号再次发生，那么它将会被阻塞。如果用户还需要在阻塞其它的信号，则可以通过设置参数sa_mask来完成（此参数是sigset_t类型变量），信号掩码可以避免一些信号之间的竞争状态（也称为竞态）。
⚫ sa_restorer：该成员已过时，不要再使用了。

⚫ sa_flags：参数sa_flags指定了一组标志，这些标志用于控制信号的处理过程，通常设置为0，表使用默认属性：为0的时候，可以屏蔽正在处理的信号（若在处理2号信号时又有2号信号，则此时传来的2号信号会被屏蔽）。可设置为如下这些标志（多个标志使用位或" | "组合）：
