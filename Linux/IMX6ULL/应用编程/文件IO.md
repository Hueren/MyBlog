### 文件I/O

对文件的输入/输出操作，即对文件的读写操作

## 标准I/O

`fopen/fread/fwrite`

引入了用户`buffer`，避免频繁进入内核，提高效率 

## 系统调用I/O

`open/read/write`

```c
#include <sys/types.h>
#include <sys/stat.h>
#include <fcnt1.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <unistd.h>

int main (int argc, char **argv)
{
    int fd;
    fd = open(argv[1],O_RDWR);
    if(fd <0)
    {
        printf("errno = %d\n",errno);
        printf("err: %s\n",strerror(errno));
        perror("open");
    }

}
```

## 文件权限

[Linux文件权限详解_linux 文件权限-CSDN博客](https://blog.csdn.net/lv8549510/article/details/85406215?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522169736060516800186551027%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=169736060516800186551027&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-85406215-null-null.142^v96^control&utm_term=linux%E6%96%87%E4%BB%B6%E6%9D%83%E9%99%90&spm=1018.2226.3001.4187)
