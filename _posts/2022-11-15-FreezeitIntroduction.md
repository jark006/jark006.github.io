---
layout: post_notitle
title: 冻它说明
header-style: text
comments: false
excerpt: 冻它相关介绍，冻结模式，面具模块、Xposed模块作用等等
---


<div align="center">
<img src = "/images/logo.png"/>
<br>
<font size="6"><strong>{{ page.title }}</strong></font>
<br>
<font size="2"><strong>更新于 2023-01-03</strong></font>
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

1. <strong id="FreezerV1">FreezerV1</strong> 很早便在内核中支持，3.x/4.x/5.x内核都会支持。部分内核的FreezerV1存在缺陷，进程PID被Freezer持有时(即冻结状态)无法被杀死，依旧占据内存，类似内存泄漏，需要解冻(thaw)才能结束进程并释放内存。这是内核级缺陷，应用层大概率无法解决，只能缓解，因此冻它依靠 **打开应用(解冻)** 和 **定时解冻** 操作来彻底结束这些异常的进程并释放其内存。

    - 注1：厂商基于V1的墓碑机制(例如FreezerV1版Millet)会捕获 **杀进程信号** 进而为其解冻，不存在内存无法释放问题。

1. <strong id="FreezerV2">FreezerV2</strong> 在 **5.4** 内核(Android11)起 **完整支持** ，该冻结模式的系统体验最好。部分厂商会移植到4.14~4.19内核中，但是可能没有完整移植而缺失 **BINDER_FREEZE** 特性，导致进程在冻结期间，binder驱动依旧为其工作，若此时应用收到 **binder同步** 请求，超时未响应则会被系统认为异常而杀掉，而FreezerV1、SIGSTOP也会这样。
  
    - 注1：MIUI的 **FreezerV1版Millet** 通过修改了内核binder驱动来获得binder同步事件进行解冻，避免了这个问题。而完整版FreezerV2则不用担心binder同步问题(异步binder请求会被系统缓存起来，等应用解冻了再处理，暂不清楚会不会像广播那样导致缓存溢出堵塞)。

    - 注2：一般 **4.14-4.19** 内核支持 **不完整** 的FreezerV2，默认没有启用，如果想开启这种不完整FreezerV2，在冻它设置里开启挂载，重启即可，如果无法挂载，可在冻它群文件寻找其他挂载V2模块，若仍旧失败则说明内核不支持(部分高通设备才支持)。

    - 注3：主线 **5.4** 版本内核(Android11)起支持 [**BINDER_FREEZE**](https://cs.android.com/android/kernel/superproject/+/common-android11-5.4:common/drivers/android/binder.c;drc=da97a10882ba78cc036cc6b7b006dd057029b2e4;l=5043) 特性。

1. <strong id="SIGSTOP">SIGSTOP</strong> 是Linux中编号19的系统信号，不能被进程捕获，一旦进程收到该信号则被立即强制暂停运行。这是底层Linux系统原始的进程控制机制，并不会考虑到上层安卓框架层应用的状态是否合适进行冻结，所以应用被 **SIGSTOP** 冻结时，其运行状态可能已经被破坏，重新回到前台解冻时，更容易发生闪退，重载等等现象。其冻结 **最为彻底** ，但 **容易出问题** (闪退，重载等)。

1. **FreezerV2(frozen)** 和 **FreezerV2(uid)** 仅仅是操作路径不同，效果没有区别，V1版同理。

    - **FreezerV2(frozen)路径**: */sys/fs/cgroup/[frozen/unfrozen]*

    - **FreezerV2(uid)路径**: */sys/fs/cgroup/uid_10xxx/pid_xxx*

    - **FreezerV1(frozen)路径**: */dev/jark_freezer/[frozen/unfrozen]*

    - **FreezerV1(uid)路径**: */dev/jark_freezer/uid_10xxx*

1. 各种模式在冻它模块下的体验排行如下，仅从原理考虑出发，不一定符合全部情况，以个人实际体验为准：

    ```
    FreezerV2 > FreezerV2半残 = FreezerV1 > FreezerV1泄漏 ≈ SIGSTOP
    ```

1. FreezerV2的Binder冻结比喻解释：
    
    **Binder驱动**是系统里负责应用之间通信，传递通信数据的，类似**邮差小哥**，**同步binder通信**类似**急信**，发信人需要收信人马上回复，**异步binder通信**类似**普通信件**，不着急要回复。
    
    内核版本从5.4起，其Binder驱动支持**BINDER_FREEZE**特性，是**新时代邮差小哥**，哪些应用被**完整V2冻结**时，他可以收到通知，进而决定要不要派件。当某应用处于**完整V2冻结状态**，高级邮差小哥知道这个状态，发给这个应用的**急信**会被丢掉，**普通信件**暂时不派件，等应用解冻了，再给这个应用派件。
    
    而4.19版本内核以下的都是**旧时代邮差小哥**，他出生的年代还没有**冻结**这个概念，只知道有人写信就马上派件。当应用处于**不完整V2、V1或SIGSTOP(KILL-19)冻结**时，如果**其他应用**给**冻结状态的应用**写信(无论急信还是普通信)，旧时代邮差派件时发现这收信人一动不动的(冻结状态)，会报告系统：这收信人多半凉了，埋了吧(也就是解冻时发生闪退闪弹等等)。

    但**即便是新时代邮差**，也没想过**SIGSTOP(KILL-19)**会拿来冻结应用，他也不知道有这种冻结状态，他也会和旧时代邮差一样，也会照常派件，也会导致收信的应用闪退闪弹。

    如果应用都比较独立，被冻结期间一直都没人给他写信，那就不会出现闪退闪弹。

    **关于闪退闪弹**：以上是冻结期间因无法响应Binder通信导致被系统当做异常处理，解冻时发生闪退闪弹。另有**SIGSTOP(KILL-19)**进行冻结时不分青红皂白（即冻结时不考虑应用状态）而破坏运行状态，导致解冻时没法恢复正常运行状态而闪退闪弹。

## 总体区别

1. **Freezer** 会等待应用结束特殊运行状态再冻结，可能会推迟冻结，也可能无限推迟。

1. **SIGSTOP** 不考虑后果直接冻结，即使会导致应用异常。

---

## 模块说明

1. **【v2.3.0起】** 冻它的前台设置有两种级别：

    1. **严格前台**：当应用Activity显示在 **顶层** (TOP)或 **绑定到顶层** (BOUND_TOP)应用时(ProcessStateNumber: 2 ~ 3)，才算在前台，也是旧版冻它(v2.2.18及以下)的前台判断条件。

    2. **宽松前台**：若符合 *严格前台* 的条件，或存在 **悬浮窗、常驻通知栏、音频播放服务** 等前台服务时，则判为前台状态，不会被冻结，其判断范围包含：
    TOP，BOUND_TOP，FOREGROUND_SERVICE，BOUND_FOREGROUND_SERVICE，IMPORTANT_FOREGROUND。(ProcessStateNumber : 2 ~ 6)

1. **【v2.2.18及以下】** 冻它的前台状态判断比较严格：

    1. 只有顶层显示窗口才算前台状态，包括 ***普通前台，分屏，MIUI小窗，原生小窗(FreeForm)，第二屏前台，virtualDisplay***；
    
    2. 其他状态一律视为在后台，只有 **悬浮窗、常驻通知栏、音频播放服务** 等 **前台服务** 的应用也视为后台状态，例如Scene的悬浮监视器、B站悬浮的视频小窗口这类 **画中画** 悬浮窗，建议设为自由后台或播放中不冻结。

1. 请不要与其他功能类似的 **墓碑模块 / 墓碑模式 / 黑域 / 各类乖巧模式** 一同使用，避免冲突，暂时与系统自带的 **暂停执行已缓存的应用** 无冲突。

1. 底层进程与App通信采用TCP_SOCKET(本地环回 **127.0.0.1:60613** ，模块为Server，APP为Client)，因此通信范围仅限本机内部，没有隐私泄漏风险。

1. 仅接管 **第三方应用** 冻结，不会接管系统应用(以后的版本也不会)，部分系统辅助类应用以第三方应用形式存在(可卸载)，被冻结后会导致系统异常，请手动设为自由后台，若发现此类应用，请及时反馈给作者加入内置，给其他人避坑。

1. 在MIUI13中，为防止机制冲突，模块会禁用系统自带的墓碑机制 **Millet** 。

1. 模块的文件大多位于模块自身目录内，以下两个文件则在外部，不过卸载模块时，都会被删除，同时也会自动卸载冻它APP，若是手动删除冻它模块，记得也得手动卸载冻它APP并删除以下两个文件。

    - 模块发生异常时，异常日志会追加到: **/sdcard/Android/freezeit_crash_log.txt** ，若存在异常内容，请向作者反馈。若运行一切正常，则不会出现该文件。

1. 如果使用冻它过程开启了Doze功能，系统的 **电池优化白名单** 中的 **第三方应用** 会被替换成冻它的 **自由后台(包括内置)应用** ，这是本模块唯一的 **残留内容** 。

---

## 冻它Xposed说明：系统框架

1. 安卓进程在冻结状态无法正常响应安卓框架的各类服务请求，容易导致严重副作用，故Xposed的作用则是解决这类问题。

1. <strong id="广播">广播(Broadcast)</strong> ：应用在冻结状态无法响应各种广播，这些广播会积累在系统缓存中，直到系统无法处理其他新生的广播，也就是广播堵塞，而拨号、安装应用程序等等行为都需要广播通信，此时这些行为会堵在某个阶段，临时解决方法是一键清理后台，这样系统会顺带清理传递给这些应用的广播，暂时获得广播畅通，但随着时间推移依旧会慢慢积累堵塞。**冻它则会拦截发往冻结应用的广播，避免其无法处理而堵塞**。

1. <strong id="应用无响应">应用无响应(ANR)</strong> ：应用在冻结状态，超时没有响应系统某些服务或状态问询时，系统会弹窗提示 ***XXX应用未响应*** 询问等待还是关闭应用，如果无法响应的是重要且限时应答的系统服务，此时应用会被系统认为严重异常而杀死，同时在 **/data/anr/** 下输出异常日志。**冻它会屏蔽系统ANR组件处理或杀死应用**。

1. <strong id="唤醒锁">唤醒锁(WakeupLock)</strong> ：一旦有应用获得唤醒锁而没有释放，系统即使息屏待机状态也不会进入Doze休眠，CPU会一直保持运转，如果应用被冻结则无法主动释放唤醒锁。**冻它只允许系统应用和自由后台应用获得唤醒锁**。

1. <strong id="定时器">定时器(Alarm)</strong> ：应用一旦设置了定时器，到了其设定的时间会被系统唤醒运行，这种后台唤醒操作及其唤醒后的运行都是在后台默默运行，产生不必要耗电。**冻它只允许系统应用和自由后台应用设定定时器**。

1. <strong id="JobScheduler">JobScheduler</strong> ：Doze期间系统会停止JobScheduler执行。

1. <strong id="Standby">Standby</strong> ：冻结状态不需要Standby。

1. <strong id="传感器">传感器(sensor)</strong> ：某些传感器(运动传感器)会在息屏Doze期间唤醒CPU打断休眠(冻它使用强制深度Doze,不受影响)。

## 冻它Xposed说明：电量与性能

1. 只在MIUI中存在，用于禁用其杀后台的功能，如果不需要，可以不勾选。

---

## 注意项

1. **冻它面具模块** 是墓碑机制的核心，而 **冻它Lsposed模块** 负责解决安卓系统使用墓碑的副作用，缺一不可。冻它Xposed需要勾选 **系统框架** ，MIUI可选择是否勾选 **电量与性能** ，主要用于禁用其杀后台功能。

1. 目前的模块的广播处理应该不容易导致卡通话、卡短信接收，卡安装应用等等问题，如果偶尔遇到，使用系统 **一键清理后台** 即可，若经常遇到，请向作者反馈。

1. 如果 **面具Magisk** 应用进行了隐藏操作，使用了随机包名、名称，默认配置不是自由后台，冻它可能会拦截其广播而导致 **启动页面卡住** ，请设为自由后台。原生包名及Delta版包名已内置自由后台。

1. 如遇其他问题，请加入 **[冻它交流群](https://jq.qq.com/?_wv=1027&k=Q5aVUglt)** 进行讨论。

---

## 其他

1. <strong id="推送">冻结QQ/TIM并使用MiPush或HMSPush消息推送</strong>

    目前QQ/TIM接入了MiPush(只有部分用户有资格)或HMSPush(全部用户都可以使用)，但只是单纯冻结QQ/TIM的话，系统仍旧保持着QQ/TIM:MSF进程和腾讯服务器的连接，只有切断其网络连接，QQ消息才会走第三方推送通道。目前腾讯只开放少数用户使用MiPush，而HMSPush则是全部开放，以下介绍安装HMSPush步骤：

    1. 在酷安或任意应用市场下载安装 **HMS Core**。

    1. 在 **LSPosed仓库** 中搜索安装 **HMSPush** ，勾选 **系统框架、系统界面、HMS Core、QQ/TIM、和其他支持HMS推送的应用** 。

    1. 重启系统，打开 **QQ/TIM** ，再打开 **HMSPush** 检查其是否已经注册，若已注册，说明可以使用推送了，否则就再重启系统，重复以上操作。

    1. 在冻它设置中，开启 **QQ断网** 功能，此时可以去冻结或杀死 **QQ/TIM**，测试是否可以接收信息推送，该推送弹窗图标是应用的图标，而QQ/TIM自带推送组件的消息弹窗是带对方/群头像的。

    ![P1](/images/2022-11-15P4.png)

1. <strong id="检查冻结状态">检查冻结状态</strong>
    
    冻它进行冻结操作后，如果是Freezer模式，进程并非百分百进入冻结状态，因为进程在某些状态下，Freezer控制器就不会冻结它，否则会破坏进程运行状态，这种时候，你可以选择任由这样，或者换成SIGSTOP，即使冻结可能会导致终结应用。

    1. 点击冻它APP日志页右上角的 **雪花按钮**，日志会列出当前第三方应用进程的wchan状态，可以检查是否被冻结。

        ![P1](/images/2022-11-15P3.png)

    1. 如果是其他墓碑，请使用   **Termux终端** ([官网](https://termux.dev/cn/index.html) / [V0.118下载](https://f-droid.org/repo/com.termux_118.apk))，先输入 **su** 执行进入管理员账户，再选择以下其中一个命令执行，结果解释：

        - FreezerV1冻结状态: [**__refrigerator**](https://cs.android.com/android/kernel/superproject/+/common-android11-5.4:common/kernel/freezer.c;drc=0e48f51cbbfbdb79149806de14dcb8bf0f01ca94;l=56)

        - FreezerV2冻结状态: [**do_freezer_trap**](https://cs.android.com/android/kernel/superproject/+/common-android12-5.4-lts:common/kernel/signal.c;drc=572528d7607de23a143df0a4a14d7d8a7e889c9e;l=2438)

        - SIGSTOP冻结状态：[**do_signal_stop**](https://cs.android.com/android/kernel/superproject/+/common-android-4.9:common/kernel/signal.c;drc=a64916631a993a87bc88b3f90b0ed7090198d2a1;l=1995)

        - 不完整FreezerV2冻结状态：[**get_signal**](https://cs.android.com/android/kernel/superproject/+/common-android-4.9:common/kernel/signal.c;drc=a64916631a993a87bc88b3f90b0ed7090198d2a1;l=2200)

        - 其他状态，一般是应用正常运行中的各种状态：
            - **xxx_epoll_wait**：等待事件触发；
            - **binder_xxx**：binder通信中；
            - 等等

    1. 此命令直接只会过滤出当前已冻结的进程信息，没有冻结的不会显示出来：

        ```sh
        ps -A | grep -E "refrigerator|do_freezer|signal"
        ```

        ![P1](/images/2022-11-15P1.png)

    1. 此命令会显示所有安卓应用进程的状态信息，无论是否冻结状态：

        ```sh
        ps -A | grep u0_a
        ```

        ![P1](/images/2022-11-15P2.png)


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

<div align="center">
<a href="https://www.coolapk.com/u/1212220">酷安 @JARK006</a>&nbsp;&nbsp;&nbsp;
<a href="https://github.com/jark006/freezeitRelease">Github发布页</a>&nbsp;&nbsp;&nbsp;
<a href="https://jark006.lanzout.com/b017oz9if">蓝奏云 密码: dy6i</a>
</div>

<div align="center">
<a href="https://jq.qq.com/?_wv=1027&k=Q5aVUglt">QQ群组 781222669</a>&nbsp;&nbsp;&nbsp;
<a href="https://qun.qq.com/qqweb/qunpro/share?_wv=3&_wwv=128&appChannel=share&inviteCode=1W6opB7&businessType=9&from=246610&biz=ka">QQ频道 冻它模块</a>&nbsp;&nbsp;&nbsp;
<a href="https://t.me/+sjDX1oTk31ZmYjY1">Telegram 群组</a>&nbsp;&nbsp;&nbsp;
<a href="https://t.me/freezeitRelease">Telegram 频道</a>
</div>
