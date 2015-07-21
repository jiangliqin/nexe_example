## 各类广告参数。包括JS，绑定dspSetting的计费名

**js形式返回 ssp处理统一处理还是不同dsp特殊处理 包iframe**

--ok(dsp中间模块返回不一样的广告类型[native[,banner[...]]])

**数据库是否共享  slot account dspSetting  详细参数由哪个服务发到哪个服务**

--各查各的数据库，需要共享直接传递(ext..)

dspSetting在dsp中间模块直接处理

adSource在exChange里面特殊设置

**slot的dspList由adExchange的服务来进行特别配置这会导致基本上所有广告位都得不管白名单还是黑名单都得设一个**

没设置的话dsp中间模块发现不符合条件返回空

dsp中间层 == dsp


## 竞价问题

baidu API、JS形式等无法RTB的DSP如何请求 符合RTB规范 比如百度没出价 js形式的没出价

--开启胡文硕猜价模式

--要有自己价格加密方式

## 计费问题

JS广告按展示计费 api广告按点击完了两边跳，告诉花多少钱

--302跳转传递加密价格参数，表示点击时的价格，发给exChange,Exchange发给DSP

## 流量分配问题

我自己的流量优先分配给百度，怎么保证不流到其他dsp

（讨论）
--在百度dsp中间层记着自己接受的流量


## m.adpro.cn没返回换另一个域名再进来的问题

--做一个请求两次的js

--adExchange时候wseat参数指定只请求百度，然后另一个js指定不请求百度(bseat建议加在扩展里)
