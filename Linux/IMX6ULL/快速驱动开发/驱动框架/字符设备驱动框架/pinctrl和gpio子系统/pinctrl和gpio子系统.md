## pinctrl子系统

### 主要工作

1. 获取设备树中pin信息

2. 根据获取到的 pin信息来设置 pin的复用功能

3. 根据获取到的 pin信息来设置 pin的电气特性，比如上 /下拉、速度、驱动能力等。

对于我们使用者来讲，只需要在设备树里面设置好某个 pin的相关属性即可，其他的初始化工作均由 pinctrl子系统来完成， pinctrl子系统源码目录为 drivers/pinctrl。

pinctrl子系统结构描述：

<img src="file:///D:/MyBlog/docs/images/2024-04-24-17-44-28-image.png" title="" alt="" data-align="center">

### PIN配置信息

iomuxc节点是IMX6ULL的IOMUXC外设对应的节点。

```c
iomuxc: iomuxc@020e0000 {
       compatible = "fsl,imx6ul-iomuxc";
       reg = <0x020e0000 0x4000>;
};         
```

```c
&iomuxc {
    pinctrl-names = "default";
    pinctrl-0 = <&pinctrl_hog_1>;
    imx6ul-evk {
        pinctrl_hog_1: hoggrp-1 {
            fsl,pins = <
                MX6UL_PAD_UART1_RTS_B__GPIO1_IO19   0x17059 /* SD1 CD */
                MX6UL_PAD_GPIO1_IO05__USDHC1_VSELECT    0x17059 /* SD1 VSELECT */
                /* MX6UL_PAD_GPIO1_IO09__GPIO1_IO09        0x17059 SD1 RESET */
                MX6UL_PAD_GPIO1_IO00__ANATOP_OTG1_ID    0x13058 /* USB_OTG1_ID */
            >;
        };
        /* zuozhongkai LED */
        pinctrl_led: ledgrp {
            fsl,pins = <
                MX6UL_PAD_GPIO1_IO03__GPIO1_IO03        0x10B0 /* LED0 */
            >;
        };
    }
}
```

---

## gpio子系统

子系统， pinctrl子系统重点是设置 PIN(有的 SOC叫做 PAD)的复用
和电气属性，如果 pinctrl子系统将一个 PIN复用为 GPIO的话，那么接下来就要用到 gpio子系统。

gpio子系统顾名思义，就是用于初始化 GPIO并且提供相应的 API函数，比如设置GPIO为输入输出，读取 GPIO的值等。 gpio子系统的主要目的就是方便驱动开发者使用 gpio，驱动开发者在设备树中添加 gpio相关信息，然后就可以在驱动程序中使用 gpio子系统提供的 API函数来操作 GPIO Linux内核向驱动开发者屏蔽掉了 GPIO的设置过程，极大的方便了驱动开发者使用 GPIO。

```c
&usdhc1 {
    pinctrl-names = "default", "state_100mhz", "state_200mhz";
    pinctrl-0 = <&pinctrl_usdhc1>;
    pinctrl-1 = <&pinctrl_usdhc1_100mhz>;
    pinctrl-2 = <&pinctrl_usdhc1_200mhz>;
    cd-gpios = <&gpio1 19 GPIO_ACTIVE_LOW>;
    keep-power-in-suspend;
    enable-sdio-wakeup;
    vmmc-supply = <&reg_sd1_vmmc>;
    status = "okay";
    no-1-8-v;
};
```
