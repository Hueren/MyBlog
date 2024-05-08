# Shell脚本

`.sh`文件

首行必须为如下代码

```shell
#!/bin/bash
```

`chomd 777`更改权限

### 交互式shell脚本

```shell
#!/bin/bash
read -p "请输入你的姓名和年龄" name age
echo "your name:" $name
```

### Shell数值运算

```shell
仅支持整数运算。
数值计算使用如下:
$((表达式))
计算时"="左右两边不能有空格，注意和C语言写法规范区分
```

### test命令

用于查看文件是否存在、权限等信息，可以进行数值、字符、文件测试

**相关网站：**

[Shell test命令（Shell []）详解，附带所有选项及说明](http://c.biancheng.net/view/2742.html)

[Shell test 命令 | 菜鸟教程](https://www.runoob.com/linux/linux-shell-test.html)

### &&和||命令

```shell
cmd1 && cmd2
当cmd1执行完并且正确，那么继续执行cmd2,否则cmd2不执行
cmd1 || cmd2
当cmd1执行完并且正确，cmd2不执行，否则cmd2执行
```

### "[ ]" 进行判断

```shell
[ "$str1" = "abc" ] 
```

### 默认变量

```shell
$0~$n, 表示shell脚本的参数，包括shell脚本命令本身，shell脚本命令本身为$0
$#:#表示最后一个参数的标号
$@:表示$1、$2、$3...
"filename":$0
"total param num":$#
"whole param":$@
"first param":$1
```

### if 条件判断

```shell
#!/bin/bash
read value
if [ "$value" == "Y" ] || [ "$value" == "y" ];then
#执行的代码。

    echo "输出内容"
    exit 0
else
#执行的代码
fi
#注释：if 后面跟条件语句即可，不需要"[]",但判断字符串是否相等则需要"[]"
```

```shell
#!/bin/bash
read value
if [ "$value" == "Y" ] || [ "$value" == "y" ];then
#执行的代码。

    echo "输出内容"
    exit 0
elif [ "$value" == "N" ] || [ "$value" == "n" ];then
#执行的代码
else
#执行的代码
fi
#注释：if 后面跟条件语句即可，不需要"[]",但判断字符串是否相等则需要"[]"
```

### case条件判断

```shell
case $变量 in
"第一个变量内容")
#执行的程序
    ;;
"第二个变量内容")
#执行的程序
    ;;
*)
#执行的程序
    ;;
esac
```

### 函数
