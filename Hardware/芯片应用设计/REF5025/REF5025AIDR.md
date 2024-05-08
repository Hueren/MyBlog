# 电压基准芯片

## 基本连接

<img title="" src="https://telegraph-image666.pages.dev/file/3a608595a243842cee778.png" alt="" data-align="center">

TI 建议电源旁路电容器的范围为 1μF 至 10μF 。1μF 至 50μF 输出电容器 (CL) 必须从 VOUT 连接到 GND。CL 的等效串联电阻 (ESR) 值必须小于或等于 1.5Ω，以确保输出稳定性。为了最大限度地降低噪声，CL 的建议 ESR 为 1Ω 至 1.5Ω。

## 减少噪声

<img title="" src="https://telegraph-image666.pages.dev/file/f25c18f0b5ccf810eb0e2.png" alt="" data-align="center">

从 TRIM/NR 引脚到 GND  放置一个电容器，结合内部 R3和 R4 电阻器形成一个低通滤波器。1μF 的电容形成了转角频率为 10Hz 至 20Hz 的低通滤波器。这样的滤波器可将VOUT 引脚上测得的总体噪声减少了一半。电容越高，产生的滤波器截止频率越低，从而进一步降低输出噪声。使用此电容器会增加启动时间。

## 负基准电压

<img title="" src="file:///D:/MyBlog/docs/images/2023-10-15-17-39-41-image.png" alt="" data-align="center">

对于需要负和正基准电压的应用，可使用 REF50xx 和 OPA735 从 5V 电源提供双电源基准。图 中显示了用于提供 2.5V 电源基准电压的 REF5025。REF50xx 的低漂移性能补充了 OPA735 的低偏移电压和零漂移，为分离电源应用提供精确的解决方案。注意匹配 R1 和 R2 的温度系数。

## 布局设计

<img title="" src="https://telegraph-image666.pages.dev/file/1676833da3bd701d8746a.png" alt="" data-align="center">

1. 尽可能将电源旁路电容器放置靠近电源引脚和接地引脚的位置。该旁路电容器的建议值为 1μF 至 10μF。如有必要，可以添加额外的去耦电容以补偿噪声或高阻抗电源。

2. 将 1μF 噪声滤除电容器放置在 NR 引脚和接地之间。

3. 必须使用 1μF 至 50μF 电容器对输出进行去耦。为输出电容器串联电阻器是可选操作。要实现更出色的噪声性能，建议输出电容器上的 ESR 为 1Ω 至 1.5Ω。

4. 可以在输出和接地之间并联高频、1μF 电容器来滤除噪声，并充当数据转换器进行负载切换。

## 典型应用

<img title="" src="https://telegraph-image666.pages.dev/file/6d2fd620ef4be763a9b32.png" alt="" data-align="center">

### 设计要求

### 详细过程

### 测量结果
