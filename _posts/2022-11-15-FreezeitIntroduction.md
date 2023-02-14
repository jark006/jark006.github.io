---
layout: post_notitle
title: 冻它说明
header-style: text
comments: false
excerpt: 冻它相关介绍，冻结模式，面具模块、Xposed模块作用等等
---


<div align="center">
<img src = "/images/logo.png" style="height:80px"/>
<br>
<font size="6"><strong>{{ page.title }}</strong></font>
<br>
<font size="2"><strong>更新于 2023-02-14</strong></font>
</div>


---

## 配置选项说明

1. **杀死后台**：该应用进入后台超时就直接杀死，而不是冻结。该选项适合那些用完就丢、不用留后台的应用，冻它自动帮你杀掉。

1. **SIGSTOP冻结**：使用SIGSTOP信号进行冻结，该方式不考虑进程状态而强制冻结，有概率破坏应用的正常运行。

1. **Freezer冻结**：使用cgroup的Freezer子系统进行冻结，该方式会根据进程状态是否合适而冻结，可能会延迟冻结，甚至无限延迟。

1. **后台自由**：该应用不会冻结，可在后台自由运行。

    **注1**：冻它APP配置列表底部的应用，已内置为后台自由，不可更改配置。

    **注2**：播放中不冻结 **[ V2.3已弃用 ]** ：停止播放后，若支持Freezer则使用该方式冻结，否则使用SIGSTOP。部分设备不能识别蓝牙播放状态，所以即使播放中也会冻结。

---

## 冻结控制器说明

1. <strong id="Freezer">Freezer</strong> 是 **cgroup** 的其中一个子控制器，用于冻结进程的CPU使用。冻它日志顶部有说明本机当前支持的V1或V2版本，一般只会启用其中一个，少数系统会同时启用(常见于OPPO/VIVO系)。**Freezer** 在冻结进程时，如果此时进程处于一些特殊状态(例如进程正在binder通信读写数据)，它会等待这个状态结束再冻结，也可能会取消冻结。

1. <strong id="FreezerV1">FreezerV1</strong> 很早便在内核中支持，3.x/4.x/5.x内核都会支持。部分内核的FreezerV1存在缺陷，进程PID被Freezer持有时(即冻结状态)无法被杀死，依旧占据内存，类似内存泄漏，需要解冻(thaw)才能结束进程并释放内存。这是内核级缺陷，应用层大概率无法解决，只能缓解，因此冻它会在 **打开应用(解冻)** 和 **定时解冻** 时解冻这些异常的进程并释放其内存。

    - 注1：厂商基于V1的墓碑机制(例如FreezerV1版Millet)会捕获 **杀进程信号** 及时解冻并释放内存，不存在以上问题。

1. <strong id="FreezerV2">FreezerV2</strong> 在 **5.4** 内核(Android11)起 **完整支持** ，该冻结模式的系统体验最好。部分厂商会移植到4.14~4.19内核中，但是可能没有完整移植而缺失 **BINDER_FREEZE** 特性，导致进程在冻结期间，binder驱动依旧为其工作，若此时应用收到 **binder同步** 请求，超时未响应则会被系统认为异常而杀掉，而FreezerV1、SIGSTOP也会这样。
  
    - 注1：MIUI的 **FreezerV1版Millet** 通过修改了内核binder驱动来获得binder同步事件进行解冻，避免了这个问题。而完整版FreezerV2则不用担心binder同步而被杀的问题。

    - 注2：一般 **4.14-4.19** 内核支持 **不完整** 的FreezerV2，默认没有启用，如果想开启这种不完整FreezerV2，可在冻它群文件寻找挂载V2模块，若失败尝试换其他挂载模块，一直不成功则说明内核不支持V2。

    - 注3：主线 **5.4** 版本内核(Android11)起支持 [**BINDER_FREEZE**](https://cs.android.com/android/kernel/superproject/+/common-android11-5.4:common/drivers/android/binder.c;drc=da97a10882ba78cc036cc6b7b006dd057029b2e4;l=5043) 特性。

1. <strong id="SIGSTOP">SIGSTOP</strong> 是Linux中编号19的系统信号，不能被进程捕获，一旦进程收到该信号则被立即强制暂停运行。这是底层Linux系统原始的进程控制机制，并不会考虑到上层安卓框架层应用的状态是否合适进行冻结，所以应用被 **SIGSTOP** 冻结时，其运行状态可能已经被破坏，重新回到前台解冻时，更容易发生闪退，重载等等现象。其冻结 **最为彻底** ，但 **容易出问题** (闪退，重载等)。

1. **FreezerV2(frozen)** 和 **FreezerV2(uid)** 操作路径不同，但FreezerV2初始化pid路径会有延迟，因此刚打开的应用冻结可能会失败，推荐使用FreezerV2(frozen)。而V1(uid)和V1(frozen)仅操作路径不同，其他完全一致，但FreezerV1存在冻结延迟，若延迟过大，建议换用SIGSTOP。

    - **FreezerV2(frozen)路径**: */sys/fs/cgroup/[frozen/unfrozen]*

    - **FreezerV2(uid)路径**: */sys/fs/cgroup/uid_10xxx/pid_xxx*

    - **FreezerV1(frozen)路径**: */dev/jark_freezer/[frozen/unfrozen]*

    - **FreezerV1(uid)路径**: */dev/jark_freezer/uid_10xxx*

1. 各种模式在冻它模块下的体验排行如下，仅从原理考虑出发，不一定符合全部情况，以个人实际体验为准：

    ***FreezerV2(内核5.4+) > FreezerV2(不完整，内核4.14-4.19) > SIGSTOP ≈ FreezerV1 > FreezerV1泄漏***

1. FreezerV2的Binder冻结比喻解释：
    
    **Binder驱动**是系统里负责应用之间通信，传递通信数据的，类似**邮差小哥**，**同步binder通信**类似**急信**，发信人需要收信人马上回复，**异步binder通信**类似**普通信件**，不着急要回复。
    
    内核版本从5.4起，其Binder驱动支持**BINDER_FREEZE**特性，是**新时代邮差小哥**，哪些应用被**完整V2冻结**时，他可以收到通知，进而决定要不要派件。当某应用处于**完整V2冻结状态**，高级邮差小哥知道这个状态，发给这个应用的**急信**会被丢掉，**普通信件**暂时不派件，等应用解冻了，再给这个应用派件。
    
    而4.19版本内核以下的都是**旧时代邮差小哥**，他出生的年代还没有**冻结**这个概念，只知道有人写信就马上派件。当应用处于**不完整V2、V1或SIGSTOP(KILL-19)冻结**时，如果**其他应用**给**冻结状态的应用**写信(无论急信还是普通信)，旧时代邮差派件时发现这收信人一动不动的(冻结状态)，会报告系统：这收信人多半凉了，埋了吧(也就是解冻时发生闪退闪弹等等)。

    但**即便是新时代邮差**，也没想过**SIGSTOP(KILL-19)**会拿来冻结应用，他也不知道有这种冻结状态，他也会和旧时代邮差一样，也会照常派件，也会导致收信的应用闪退闪弹。

    如果应用都比较独立，被冻结期间一直都没人给他写信，那就不会出现闪退闪弹。

    **关于闪退闪弹**：以上是冻结期间因无法响应Binder通信导致被系统当做异常处理，解冻时发生闪退闪弹。另有**SIGSTOP(KILL-19)**进行冻结时无视应用状态而破坏运行状态，导致解冻时没法恢复正常运行状态而闪退闪弹。

## 总体区别

1. **Freezer** 会等待应用结束特殊运行状态再冻结。V2版体验最好，但V1版冻结有延迟，甚至无法冻结。

1. **SIGSTOP** 无视进程状态直接强制冻结，冻结效果最好，但小概率导致应用异常。

---

## 模块说明

1. 冻它的前台设置有**两种前台级别**，不符合前台条件则一律视为在后台，会被冻结：

    1. **严格前台**：当应用有顶层显示的窗口，含常规窗口、全屏、分屏、MIUI小窗，原生小窗(FreeForm)，virtualDisplay(ProcessStateNumber: 2 ~ 3)则判定为前台状态，不会被冻结。也是**旧版冻它(v2.2.18及以下)**的前台判断条件。

    2. **宽松前台**：包含 ***严格前台*** 判断条件，或存在 **悬浮窗、常驻通知栏、音频播放服务** 等用户可以感知的服务时(ProcessStateNumber : 2 ~ 6)，均判定为前台状态，不会被冻结。

1. 请不要与其他功能类似的 **墓碑模块 / 墓碑模式 / 黑域 / 各类乖巧模式** 一同使用，避免冲突，暂时与系统自带的 **暂停执行已缓存的应用** 无冲突。

1. 底层进程与App通信采用TCP_SOCKET(本地环回 **127.0.0.1:60613** ，模块为Server，APP为Client)，因此通信范围仅限本机内部，没有隐私泄漏风险。

1. **2.5.0版本起**支持冻结全部应用(含系统应用)，而旧版只支持 **第三方应用** 冻结，部分系统辅助类应用以第三方应用形式存在(可以像普通应用那样卸载掉)，被冻结后会导致系统异常，请手动设为自由后台，若发现此类应用，请及时反馈给作者加入内置自由后台，给其他人避坑。

1. 在**MIUI13/14**中，为防止机制冲突，冻它会禁用系统自带的墓碑机制 **Millet** 。

1. 模块的文件大多位于模块自身目录内，但异常日志除外，运行时发生的异常日志会追加到: **/sdcard/Android/freezeit_crash_log.txt** ，若存在异常内容，请向作者反馈。若运行一切正常，则不会出现该文件。卸载模块时，该文件会被删除，同时也会自动卸载冻它APP。

1. 如果使用冻它过程开启了Doze功能，系统的 **电池优化白名单** 中的 **第三方应用** 会被替换成冻它的 **自由后台(包括内置)应用** ，也就是说，**自由后台**应用会设为**电池不优化**，而设为**Freezer冻结、SIGSTOP冻结和杀死后台**的应用设为**电池优化**，卸载冻它后也不会主动还原这些改动，用户有需要可以自行设置那些要优化，那些不优化。

---

## 冻它Xposed说明：系统框架

### 专门解决安卓使用墓碑机制的各类副作用：

1. <strong id="广播">广播(Broadcast)</strong> ：**冻它则会拦截发往已冻结应用的广播，避免其冻结状态无法接收处理而堵塞广播系统**，否则这些广播会积累在系统缓存中，逐渐堵塞直到系统无法处理其他广播，而拨号、安装应用程序等等行为都需要广播通信，一旦堵塞将导致卡拨号，卡安装应用等现象，虽然一键清理后台时系统会顺带清理堆积的广播，暂时获得广播畅通，但随着时间推移依旧会慢慢积累堵塞。

1. <strong id="应用无响应">应用无响应(ANR)</strong> ：**冻它会屏蔽“应用无响应”弹窗，并阻止因ANR异常而杀后台**。应用在冻结状态，超时没有响应系统某些服务或状态问询时，系统会弹窗提示 ***XXX应用未响应*** 询问等待还是关闭应用，如果无法响应的是重要且限时应答的系统服务，此时应用会被系统认为严重异常而杀死，同时在 **/data/anr/** 下输出异常日志。

1. <strong id="唤醒锁">唤醒锁(WakeupLock)</strong> ：**冻它只允许自由后台应用获得唤醒锁**。一旦有应用获得唤醒锁而没有释放，系统即使息屏待机状态也不会进入Doze休眠，CPU会一直保持运转，如果应用被冻结则无法主动释放唤醒锁，因此冻它禁止其获得唤醒锁。

1. <strong id="定时器">定时器(Alarm)</strong> ：**冻它只允许自由后台应用设置定时器**。应用一旦设置了定时器，到了其设定的条件会被系统唤醒运行，这种后台唤醒操作及其唤醒后的运行都是在后台默默运行，产生不必要耗电，因此冻它禁止其设置定时器。

1. <strong id="JobScheduler">JobScheduler</strong> ：Doze期间系统会停止JobScheduler执行。

1. <strong id="Standby">Standby</strong> ：冻结状态不需要Standby。

1. <strong id="传感器">传感器(sensor)</strong> ：某些传感器(运动传感器)会在息屏Doze期间唤醒 CPU 打断设备休眠(冻它使用强制深度Doze,不受影响)。

## 冻它Xposed说明：电量与性能

1. 只在**MIUI13/14**中存在，用于禁用其杀后台的功能，如果不需要，可以不勾选。

---

## 注意项

1. **冻它面具模块** 是墓碑机制的核心，而 **冻它LSPosed模块** 负责解决安卓系统使用墓碑机制的副作用，缺一不可，必需勾选 **系统框架** ，MIUI可选择是否勾选 **电量与性能** ，主要用于禁用其杀后台功能。

1. 如果 **面具Magisk** 管理器进行了隐藏操作，使用了随机包名、名称，冻它可能会拦截其广播而导致 **启动页面卡住** ，请手动设为自由后台。原生包名及Delta版包名已内置自由后台。

1. 如遇其他问题，请加入 **[冻它交流群](https://jq.qq.com/?_wv=1027&k=Q5aVUglt)** 进行讨论。

---

## 其他

1. <strong id="推送">冻结QQ/TIM并使用MiPush或HMSPush消息推送</strong>

    目前QQ/TIM已经接入了MiPush(只有部分用户有资格)和HMSPush(全部用户都可以使用)，以下介绍安装HMSPush步骤：

    1. 在酷安或任意应用市场下载安装 **HMS Core**。

    1. 在 **LSPosed仓库** 中搜索安装 **HMSPush** ，勾选 **系统框架、系统界面、HMS Core、QQ/TIM、和其他支持HMS推送的应用** 。

    1. 重启系统，打开 **QQ/TIM** ，再打开 **HMSPush** 检查其是否已经注册，若已注册，说明可以使用推送了，否则就再重启系统，重复以上操作。

    1. 在冻它设置中，开启 **QQ断网** 功能，此时可以去冻结或杀死 **QQ/TIM**，测试是否可以接收信息推送，该推送弹窗图标是应用的图标，而QQ/TIM自带推送组件的消息弹窗是带对方/群头像的。

        ![P1](/images/2022-11-15P4.jpg)

1. <strong id="检查冻结状态">检查冻结状态</strong>
    
    冻它进行冻结操作后，如果是FreezerV1模式，冻结可能会延迟甚至无法冻结，此时可以换成SIGSTOP，其冻结方式较为彻底。

    1. 点击冻它APP日志页右上角的 **雪花按钮**，日志会列出当前进程状态，可以检查是否被冻结。

        ![P1](/images/2022-11-15P3.jpg)

    1. 如果是其他墓碑，请使用   **Termux终端** ([官网](https://termux.dev/cn/index.html) / [V0.118下载](https://f-droid.org/repo/com.termux_118.apk))，先输入 **su** 执行进入管理员账户，再选择以下其中一个命令执行，结果解释：

        - FreezerV1冻结状态: [**__refrigerator**](https://cs.android.com/android/kernel/superproject/+/common-android11-5.4:common/kernel/freezer.c;drc=0e48f51cbbfbdb79149806de14dcb8bf0f01ca94;l=56)

        - FreezerV2冻结状态: [**do_freezer_trap**](https://cs.android.com/android/kernel/superproject/+/common-android12-5.4-lts:common/kernel/signal.c;drc=572528d7607de23a143df0a4a14d7d8a7e889c9e;l=2438)

        - SIGSTOP冻结状态：[**do_signal_stop**](https://cs.android.com/android/kernel/superproject/+/common-android-4.9:common/kernel/signal.c;drc=a64916631a993a87bc88b3f90b0ed7090198d2a1;l=1995)

        - 不完整FreezerV2冻结状态：[**get_signal**](https://cs.android.com/android/kernel/superproject/+/common-android-4.9:common/kernel/signal.c;drc=a64916631a993a87bc88b3f90b0ed7090198d2a1;l=2200)

        - 其他状态则没有被冻结，处于正常运行中的各种状态：
            - **xxx_epoll_wait**：等待事件触发；
            - **binder_xxx**：binder通信中；
            - 等等

    1. 此命令只显示当前 **已冻结状态** 的进程信息，但是 **无法被冻结** 的不会显示，先执行 **su**，再执行以下命令：

        ```sh
        ps -A | grep -E "refrigerator|do_freezer|signal"
        ```

        ![P1](/images/2022-11-15P1.jpg)

    1. 此命令会显示所有安卓应用进程的状态信息，无论是否**冻结状态**，先执行 **su**，再执行以下命令：

        ```sh
        ps -A | grep u0_a
        ```

        ![P1](/images/2022-11-15P2.jpg)


1. <strong id="临时禁用冻它">临时禁用冻它</strong>

    如果你经常换用多个墓碑模块，只需在面具模块管理器和LSPosed模块管理器同时禁用冻它，重启即可。
    
    如果需要，可以手动备份以下文件，恢复时只需替换这些文件，重启即可：

    ```
    目录 /data/adb/modules/freezeit/

    1. appcfg.txt   (冻结配置)
    2. applabel.txt (应用名称)
    3. settings.db  (设置数据)
    ```

---

## 相关链接

- [冻它官网](/i/freezeit)

- [酷安 @JARK006](https://www.coolapk.com/u/1212220)

- [Github发布页](https://github.com/jark006/freezeitRelease)

- [蓝奏云 密码: dy6i](https://jark006.lanzout.com/b017oz9if)

- [QQ群组 781222669](https://jq.qq.com/?_wv=1027&k=N51hzHJU)

- [QQ频道 冻它模块](https://pd.qq.com/s/eyk08yse2)

- [Telegram 频道](https://t.me/freezeitRelease)

- [Telegram 群组](https://t.me/+sjDX1oTk31ZmYjY1)
