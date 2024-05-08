## signal()

---

用于Linux系统下设置信号处理方式

## 补充说明

---

需要包含头文件`<signal.h>`

#### 语法

```c
/*定义了一个类型sig_t，表示指向返回值为void型（参数为int型）的函数（的）指针。

  它可以用来声明一个或多个函数指针。

  sig_t sig1, sig2; 这个声明等价于下面这种晦涩难懂的写法：

  void (*sig1)(int), (*sig2)(int);
*/
typedef void (*sig_t)(int)

sig_t signal(int signum, sig_t handler)
```

#### 参数

`signum` : 此参数指定需要进行设置的信号，可使用信号名（宏）或信号的数字编号，建议使用信号名。

`handler` : sig_t类型的函数指针，指向信号对应的信号处理函数，当进程接收到信号后会自动执行该处理函数；参数handler既可以设置为用户自定义的函数，也就是捕获信号时需要执行的处理函数，也可以设置为SIG_IGN或SIG_DFL，SIG_IGN表示此进程需要忽略该信号，SIG_DFL则表示设置为系统默认操作。sig_t函数指针的int类型参数指的是，当前触发该函数的信号，可将多个信号绑定到同一个信号处理函数上，此时就可通过此参数来判断当前触发的是哪个信号。

#### 返回值

此函数的返回值也是一个sig_t类型的函数指针，成功情况下的返回值则是指向在此之前的信号处理函数；如果出错则返回SIG_ERR，并会设置errno。

#### 实例

```c
#include <stdio.h> 
#include <stdlib.h> 
#include <signal.h> 
static void sig_handler(int sig) 
{ 
    printf("Received signal: %d\n", sig); 
} 
int main(int argc, char *argv[]) 
{ 
    sig_t ret = NULL; 
    ret = signal(SIGINT, (sig_t)sig_handler); 
    if (SIG_ERR == ret) 
    {
        perror("signal error"); exit(-1); 
    } 
/* 死循环 */ 
    for ( ; ; ) { } 
    exit(0); 
}
```
