# STM32串口

## 串口DMA

```c
#define DMA_Rec_Len 200

u8 DMA_Rece_Buf[DMA_Rec_Len] = {0};

void uart2_init ( u32 bound ) {
    GPIO_InitTypeDef GPIO_InitStructure;
    USART_InitTypeDef USART_InitStructure;
    NVIC_InitTypeDef NVIC_InitStructure;
    DMA_InitTypeDef DMA_InitStructure;
    RCC_APB2PeriphClockCmd ( RCC_APB2Periph_GPIOA, ENABLE );
    RCC_APB1PeriphClockCmd ( RCC_APB1Periph_USART2, ENABLE );
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_2;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_50MHz;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AF_PP;
    GPIO_Init ( GPIOA, &GPIO_InitStructure );
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_3;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_IN_FLOATING;
    GPIO_Init ( GPIOA, &GPIO_InitStructure );
    NVIC_InitStructure.NVIC_IRQChannel = USART2_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 3;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 2;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init ( &NVIC_InitStructure );
    USART_InitStructure.USART_BaudRate = bound;
    USART_InitStructure.USART_WordLength = USART_WordLength_8b;
    USART_InitStructure.USART_StopBits = USART_StopBits_1;
    USART_InitStructure.USART_Parity = USART_Parity_No;
    USART_InitStructure.USART_HardwareFlowControl = USART_HardwareFlowControl_None;
    USART_InitStructure.USART_Mode = USART_Mode_Rx | USART_Mode_Tx;
    USART_Init ( USART2, &USART_InitStructure );
    USART_ITConfig ( USART2, USART_IT_TC, DISABLE );
    USART_ITConfig ( USART2, USART_IT_RXNE, DISABLE );
    USART_ITConfig ( USART2, USART_IT_IDLE, ENABLE ); // 开启空闲中断
    USART_DMACmd ( USART2, USART_DMAReq_Rx, ENABLE ); // 使能串口2的DMA接收
    USART_Cmd ( USART2, ENABLE );
    RCC_AHBPeriphClockCmd ( RCC_AHBPeriph_DMA1, ENABLE );
    DMA_DeInit ( DMA1_Channel6 );
    DMA_InitStructure.DMA_PeripheralBaseAddr = ( u32 ) &USART2->DR;
    DMA_InitStructure.DMA_MemoryBaseAddr = ( u32 ) DMA_Rece_Buf;
    DMA_InitStructure.DMA_DIR = DMA_DIR_PeripheralSRC;  // 数据传输方向，即从外设读取数据发送到内存
    DMA_InitStructure.DMA_BufferSize = DMA_Rec_Len; // DMA通道的DMA缓存的大小
    DMA_InitStructure.DMA_PeripheralInc = DMA_PeripheralInc_Disable; // 外设地址寄存器不变
    DMA_InitStructure.DMA_MemoryInc = DMA_MemoryInc_Enable; // 内存地址寄存器递增
    DMA_InitStructure.DMA_PeripheralDataSize = DMA_PeripheralDataSize_Byte; // 数据宽度为8位
    DMA_InitStructure.DMA_MemoryDataSize = DMA_MemoryDataSize_Byte; // 数据宽度为8位
    DMA_InitStructure.DMA_Mode = DMA_Mode_Normal; // 工作在正常缓存模式
    DMA_InitStructure.DMA_Priority = DMA_Priority_VeryHigh; // DMA通道拥有高优先级
    DMA_InitStructure.DMA_M2M = DMA_M2M_Disable; // DMA通道没有设置为内存到内存传输
    DMA_Init ( DMA1_Channel6, &DMA_InitStructure );
    DMA_Cmd ( DMA1_Channel6, ENABLE );
}

void USART2_IRQHandler ( void ) {
    u16 Usart2_Rec_Cnt = 0;

    if ( USART_GetITStatus ( USART2, USART_IT_IDLE ) != RESET ) {
        USART2->SR;
        USART2->DR; // 清USART_IT_IDLE标志
        DMA_Cmd ( DMA1_Channel6, DISABLE );
        // USART_ClearITPendingBit ( USART2, USART_IT_IDLE ); // 清除中断标志
        // 计算接收到的数据帧长度
        Usart2_Rec_Cnt = DMA_Rec_Len - DMA_GetCurrDataCounter ( DMA1_Channel6 );
        // printf ( "The length is %d\r\n", Usart2_Rec_Cnt );
        // printf ( "The data is %s", DMA_Rece_Buf );
        DMA_SetCurrDataCounter ( DMA1_Channel6, DMA_Rec_Len );
        DMA_Cmd ( DMA1_Channel6, ENABLE );
    }
}
```