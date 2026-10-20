/*:
@target MV MZ
@plugindesc 任务系统 v1.4.0
@author うなぎおおとろ/<译>公孖。狼
@url https://raw.githubusercontent.com/unagiootoro/RPGMZ/master/QuestSystem.js
@help
此为任务系统导入插件。

【使用方法】
■ 创建任务
您可通过编辑 "QuestDatas"
插件参数自行创建任务.
借助此插件您可设定任务所需项目,例如
"委托者", "报酬", "任务内容" .

■ 任务状态配置
各项任务都具备实时状态 (未受取, 进行中, 已完成, 等.)
这些状态通过变量进行配置.
变量的对应值请参考如下.
0: 未登陆任务
   尚未激活, 在列表一览不会被显示的任务
1: 未受取任务
   尚未领取, 可被领取的任务
2: 进行中任务
   已领取, 正在进行中的任务
3: 可汇报任务
   任务已达成, 尚未汇报获取收益
4: 已汇报任务
   已达成并获取收益的任务
5: 失败任务
   失败的任务, 可以有安慰报酬或惩戒
6: 失效任务
   时效过期的任务
7: 隐藏任务
   只有部分提示的隐秘任务

■ 关于任务插件执行状态配置
此任务插件仅能执行以下配置:
・ 当领取任务委托后, 状态由未受取切换为进行中.
・ 已完成任务汇报后, 状态由可汇报切换为已汇报
・ 取消进行中的任务时, 状态由进行中切换未受取

如若想要设定上述以外的任务状态, 
则必须通过事件指令进行更改.

■ 领取报酬
提交已完成任务后, 您将获取任务奖励.

■ 开启任务窗口
您可通过以下两种方式呼出任务界面:
・ 通过菜单选项 "任务管理" 呼出
-通过事件执行插件指令 "StartQuestScene"

在此将为您展示两份以上主要形式的示例.
插件指令: 通过事件创建一处任务委托所,
在此可以报备任务.
菜单选项: 在此可以确认各项任务实时状态.

■ 任务指令
任务指令用于管理任务分类,
以及设定任务领取与汇报.
* 无论是插件指令还是菜单选项设定的任务指令
都是默认设定配置好的
因此一般无需您进行基本功能使用方面的更改.

请参见以下几类任务指令.
all: 查看全部任务
questOrder: 查看未受取任务
orderingQuest: 查看进行中任务
questCancel: 取消正在进行中任务
questReport: 查看已完成, 可汇报获取报酬任务
reportedQuest: 查看已汇报任务
failedQuest: 查看失败的任务
expiredQuest: 查看过期失效任务
hiddenQuest: 查看隐藏任务

【关于MV版】
本插件的插件参数为基于MZ创建、
MV使用的情况需要另外导入「callPluginCommandMZ.js」插件。
「callPluginCommandMZ.js」放置于「QuestSystem.js」之上。

【许可】
本插件, 可在遵循MIT许可协议下自由使用.


@param QuestDatas
@text 任务数据
@type struct<QuestData>[]
@default []
@desc
注册任务数据库.

@param EnabledQuestMenu
@text 菜单弃用任务项
@type boolean
@on 是
@off 否
@default true
@desc
设定是否将任务项加入菜单列表.

@param EnabledQuestMenuSwitchId
@text 任务项开关对应ID
@type switch
@default 0
@desc
设定菜单界面是否加入呼出任务窗口选项开关的对应ID.

@param MenuCommands
@text 任务菜单各项名称
@type select[]
@option all
@option questOrder
@option orderingQuest
@option questCancel
@option questReport
@option reportedQuest
@option failedQuest
@option expiredQuest
@option hiddenQuest
@default ["orderingQuest","reportedQuest","all"]
@desc
设定菜单中任务管理界面各项目. 请仔细阅读本插件使用帮助

@param MenuBackgroundImage
@text 菜单背景画像
@type struct<BackgroundImage>
@default {"FileName1":"","FileName2":"","XOfs":"240","YOfs":"300"}
@desc
设定菜单中任务窗口的背景画像.

@param DisplayRequestor
@text 显示委托人
@type boolean
@on 是
@off 否
@default true
@desc
设定是否显示标题.

@param DisplayRewards
@text 显示报酬
@type boolean
@default true
@desc
设定是否显示领取报酬的场所.

@param DisplayDifficulty
@text 显示难易度
@type boolean
@on 是
@off 否
@default true
@desc
设定是否显示任务难度级别.

@param DisplayPlace
@text 显示场所
@type boolean
@default true
@desc
设定是否显示任务获取时的场所.

@param DisplayTimeLimit
@text 显示时效
@type boolean
@on 是
@off 否
@default true
@desc
设定是否显示任务的有效期限.

@param QuestOrderSe
@text 领任务SE音效
@type struct<QuestOrderSe>
@default {"FileName":"Skill1","Volume":"90","Pitch":"100","Pan":"0"}
@desc
设定获取任务时的SE音效.

@param QuestReportMe
@text 汇报任务ME音效
@type struct<QuestReportMe>
@default {"FileName":"Item","Volume":"90","Pitch":"100","Pan":"0"}
@desc
设定汇报已完成任务时的ME音效.

@param WindowSize
@text 窗口尺寸
@type struct<WindowSize>
@default {"CommandWindowWidth":"300","CommandWindowHeight":"160","DialogWindowWidth":"400","GetRewardWindowWidth":"540"}
@desc
设定各项任务窗口的大小.

@param Text
@text 显示提示文字
@type struct<Text>
@default {"MenuQuestSystemText":"查看任务","QuestOrderText":"是否领取本任务？","QuestOrderYesText":"是","QuestOrderNoText":"否","QuestCancelText":"是否取消本任务？","QuestCancelYesText":"是","QuestCancelNoText":"否","QuestReportText":"是否汇报本任务？","QuestReportYesText":"是","QuestReportNoText":"否","NothingQuestText":"本任务不存在。","GetRewardText":"您将获取如下打赏。","ReachedLimitText":"任务数已达上限。","HiddenTitleText":"？？？？？？","AllCommandText":"全部任务","QuestOrderCommandText":"领取任务","OrderingQuestCommandText":"任务进行中","QuestCancelCommandText":"取消任务","QuestReportCommandText":"汇报任务","ReportedQuestCommandText":"任务汇报完毕","FailedQuestCommandText":"任务已失败","ExpiredQuestCommandText":"任务已失效","HiddenQuestCommandText":"任务未知","NotOrderedStateText":"未领取","OrderingStateText":"进行中","ReportableStateText":"可上交","ReportedStateText":"已上交","FailedStateText":"失败","ExpiredStateText":"已失效","RequesterText":"【委托人】：","RewardText":"【报酬】：","DifficultyText":"【难易度】：","PlaceText":"【场所】：","TimeLimitText":"【期限】："}
@desc
自定义任务系统中的提示文字.

@param TextColor
@text 文字颜色
@type struct<TextColor>
@default {"NotOrderedStateColor":"#ffffff","OrderingStateColor":"#ffffff","ReportableStateColor":"#ffffff","ReportedStateColor":"#ffffff","FailedStateColor":"#ffffff","ExpiredStateColor":"#ff0000"}
@desc
设定上述文字颜色.

@param GoldIcon
@text 货币图标
@type number
@default 314
@desc
设定报酬项所显示的金钱奖励图标.

@param ExpIcon
@text 经验值图标
@type number
@default 89
@desc
设定报酬项所显示的经验值奖励图标.

@param QuestTitleWrap
@text 任务标题是否可换行
@type boolean
@default false
@desc
设定编辑任务标题文字时是否可以换行.

@param MaxOrderingQuests
@text 可接任务最大值
@type number
@default 0
@desc
设定单次可领取任务上限. 如若为 0 的话, 则默认无限领取.


@command StartQuestScene
@text 任务初始界面
@desc 启动任务界面.

@arg QuestCommands
@type select[]
@option all
@option questOrder
@option orderingQuest
@option questCancel
@option questReport
@option reportedQuest
@option failedQuest
@option expiredQuest
@option hiddenQuest
@default ["questOrder","questCancel","questReport"]
@text 任务指令
@desc 配置任务指令。

@arg BackgroundImage
@text 背景图片
@type struct<BackgroundImage>
@default {"FileName1":"","FileName2":"","XOfs":"240","YOfs":"300"}
@desc
设定任务界面的背景图片.


@command GetRewards
@text 获取报酬
@desc 获取任务所得奖励.

@arg VariableId
@type variable
@text 变量ID
@desc 设定可获取报酬任务切换的变量ID .

@command ChangeDetail
@text 任务详情变更
@desc 更改任务详情.

@arg VariableId
@type variable
@text 变量ID
@desc 设定详情切换对应任务的变量 ID .

@arg Detail
@type multiline_string
@text 详情
@desc 设定变更后任务详情.


@command ChangeRewards
@text 报酬变更
@desc 更改任务的报酬.

@arg VariableId
@type variable
@text 变量ID
@desc 设定可切换报酬任务的变量 ID .

@arg Rewards
@type struct<Reward>[]
@text 报酬
@desc 设定变更后任务的报酬.
*/


/*~struct~QuestData:
@param VariableId
@text 变量ID
@type variable
@desc
设定任务状态管理变量。

@param Title
@text 标题
@type string
@desc
设定任务标题.

@param IconIndex
@text 标题图标
@type number
@desc
设定任务标题前置图标.

@param Requester
@text 委托人称呼
@type string
@desc
设定任务委托人姓名.

@param Rewards
@text 报酬
@type struct<Reward>[]
@desc
设定任务奖励.

@param Difficulty
@text 难易度
@type string
@desc
设定任务难易度.

@param Place
@text 所在地
@type string
@desc
设定任务所在地.

@param TimeLimit
@text 有効期
@type string
@desc
设定任务有効期限.

@param Detail
@text 任务信息
@type multiline_string
@desc
编辑任务详细情报.

@param HiddenDetail
@text 隐藏信息
@type multiline_string
@desc
任务为隐藏任务时显示的粗略情报.

@param CommonEventId
@text 共通事件ID
@type common_event
@default 0
@desc
设定任务汇报结束后直接导入的公共事件 ID.如若为 0 的话, 则默认么得.

@param Priority
@text 优先级
@type number
@default 0
@desc
设定任务在列表中排列的优先度, 数值越大优先度越高.
*/


/*~struct~Reward:
@param Type
@text 报酬类型
@type select
@option 货币
@value gold
@option 经验值
@value exp
@option 物品
@value item
@option 武器
@value weapon
@option 防具
@value armor
@option 任意
@value any
@desc
设定奖励的类型 (金钱, 经验, 物品, 武器, 防具, 或 任意).

@param GoldValue
@text 奖励金钱数
@type number
@desc
设定报酬的类型为金钱时的数额.

@param ExpValue
@text 奖励经验值
@type number
@desc
设定报酬为经验时的数值.

@param ItemId
@text 奖励物品ID
@type number
@desc
设定报酬为物品时的物品 ID .

@param ItemCount
@text 奖励物品数
@type number
@desc
设定报酬为物品时所获得的对应物品数目.

@param Text
@text 提示语
@type string
@desc
设定奖励为任意物品时的提示文字.

@param IconIndex
@text 图标
@type number
@desc
设定奖励为任意物品时所标注的图标.
*/


/*~struct~QuestOrderSe:
@param FileName
@text 领任务SE音效
@type file
@dir audio/se
@default Skill1
@desc
设定受取任务时的SE音效文件名.

@param Volume
@text 领任务SE音量
@type number
@default 90
@desc
设定上述SE音效的音量.

@param Pitch
@text 领任务SE音高
@type number
@default 100
@desc
设定上述SE音效音高.

@param Pan
@text 领任务SE平移
@type number
@default 0
@desc
设定上述SE音效的平移.
*/


/*~struct~QuestReportMe:
@param FileName
@text 汇报任务ME音效
@type file
@dir audio/me
@default Item
@desc
设定汇报任务时ME音效文件名.

@param Volume
@text 汇报任务ME音量
@type number
@default 90
@desc
设定汇报任务时ME音效音量.

@param Pitch
@text 汇报任务ME音高
@type number
@default 100
@desc
设定汇报任务时ME音效音高.

@param Pan
@text 汇报任务ME平移
@type number
@default 0
@desc
设定汇报任务时ME音效的平移.
*/


/*~struct~BackgroundImage:
@param FileName1
@text 背景图1
@type file
@dir img
@desc
设定背景图片文件名.

@param FileName2
@text 背景图2
@type file
@dir img
@desc
设定背景追加图片文件名.

@param XOfs
@text X坐标偏移
@type number
@default 240
@desc
设定背景追加图片 X 坐标偏移.

@param YOfs
@text Y坐标偏移
@type number
@default 300
@desc
设定背景追加图片 Y 坐标偏移.
*/


/*~struct~WindowSize:
@param CommandWindowWidth
@text 控制窗口幅度
@type number
@default 300
@desc
设定控制窗口横向宽度.

@param CommandWindowHeight
@text 控制窗口高度
@type number
@default 160
@desc
设定控制窗口纵向宽度.

@param DialogWindowWidth
@text 对话框幅度
@type number
@default 400
@desc
设定对话框横向宽度.

@param GetRewardWindowWidth
@text 报酬提示窗幅度
@type number
@default 540
@desc
设定报酬提示窗口横向宽度.
*/


/*~struct~Text:
@param MenuQuestSystemText
@text 菜单文字
@type string
@default 查看任务
@desc
自定义菜单栏追加任务管理选项的名称.

@param QuestOrderText
@text 任务受取提示语
@type string
@default 您同意领取本项任务么？
@desc
设定任务领取时弹出的询问语文本.

@param QuestOrderYesText
@text 选择接受任务子选项文字
@type string
@default 接受
@desc
设定查看可领取任务时确认按钮的显示文字.

@param QuestOrderNoText
@text 暂不接受任务子选项文字
@type string
@default 暂不
@desc
设定查看可领取任务时取消并返回按钮的显示文字.

@param QuestCancelText
@text 取消任务提示语
@type string
@default 您确信对此任务无能为力?
@desc
设定取消进行中任务时进一步确认弹出的提示语.

@param QuestCancelYesText
@text 取消任务子选项文字
@type string
@default 放弃
@desc
设定查看进行中任务并确认取消按钮的文字.

@param QuestCancelNoText
@text 不取消任务子选项文字
@type string
@default 继续
@desc
设定手贱进入查看并取消任务界面、选择退出时的按钮文字.

@param QuestReportText
@text 汇报任务提示语
@type string
@default 您确认决定上交该任务?
@desc
设定汇报已完成任务时进一步确认所弹出提示语内容.

@param QuestReportYesText
@text 汇报选项分支
@type string
@default 是的
@desc
设定确认汇报按钮文字.

@param QuestReportNoText
@text 不汇报任务分支
@type string
@default 非也
@desc
设定明明满足汇报条件脑残选择中途想退出不汇报时的按钮文字.

@param NothingQuestText
@text 无任务提示语
@type string
@default 当前任务空空如也.
@desc
当前查无任务时弹出提示语.

@param GetRewardText
@text 获取报酬提示语
@type string
@default 您将获得如下财富作为打赏.
@desc
设定领取报酬时弹出的提示语.

@param ReachedLimitText
@text 任务上限提示
@type string
@default 您的任务已达上限.
@desc
设定任务达到上限时的提示语.

@param HiddenTitleText
@text 隐藏任务标题
@type string
@default ？？？？？？
@desc
设定隐藏任务所显示的标题文字.

@param AllCommandText
@text 全部任务指令
@type string
@default 全部
@desc
设定查看全部任务界面的指令名称.

@param QuestOrderCommandText
@text 任务受付指令
@type string
@default 可领取
@desc
设定查看可领取任务界面的指令名称.

@param OrderingQuestCommandText
@text 进行中任务指令
@type string
@default 进行中
@desc
设定查看进行中任务界面的指令名称.

@param QuestCancelCommandText
@text 取消任务指令
@type string
@default 取消任务
@desc
设定取消进行中任务的指令名称.

@param QuestReportCommandText
@text 汇报任务指令
@type string
@default 上交任务
@desc
设定汇报已完成任务时的指令名称.

@param ReportedQuestCommandText
@text 已汇报任务指令
@type string
@default 已提交
@desc
设定查看已汇报任务界面时的指令名称.

@param FailedQuestCommandText
@text 失败任务指令
@type string
@default 已失败任务
@desc
设定查看已失败任务界面时的指令名称.

@param ExpiredQuestCommandText
@text 失效任务指令
@type string
@default 已失效任务
@desc
设定查看已时效过期任务界面时的指令名称.

@param HiddenQuestCommandText
@text 隐藏任务指令
@type string
@default 未知任务
@desc
设定查看隐藏任务界面时的指令名称.

@param NotOrderedStateText
@text 未接任务提示语
@type string
@default 未受取
@desc
设定查看未领取任务时的公屏描述语.

@param OrderingStateText
@text 进行中任务提示语
@type string
@default 进行中
@desc
设定查看进行中任务时的公屏描述语.

@param ReportableStateText
@text 可汇报任务提示语
@type string
@default 可上交
@desc
设定查看可汇报任务是的公屏描述语.

@param ReportedStateText
@text 已汇报任务提示语
@type string
@default 已提交
@desc
设定查看已汇报任务时的公屏描述语.

@param FailedStateText
@text 失败任务提示语
@type string
@default 未能完成
@desc
设定查看失败任务时的公屏描述语.

@param ExpiredStateText
@text 失效任务提示语
@type string
@default 时效已过
@desc
设定查看失效任务时的公屏描述语.

@param RequesterText
@text 委托人提示
@type string
@default 【委托人】：
@desc
请自定义委托人相关提示.

@param RewardText
@text 报酬提示
@type string
@default 【报酬】：
@desc
请自定义获取奖励提示语.

@param DifficultyText
@text 难易度提示
@type string
@default 【任务指数】：
@desc
请自定义难度级别提示.

@param PlaceText
@text 场所提示
@type string
@default 【所在地】：
@desc
请自定义受领场所提示.

@param TimeLimitText
@text 期限提示
@type string
@default 【期限】：
@desc
请自定义任务时效提示.
*/


/*~struct~TextColor:
@param NotOrderedStateColor
@text 未接任务颜色
@type string
@default #aaaaaa
@desc
设定未接状态文字颜色.

@param OrderingStateColor
@text 进行中任务颜色
@type string
@default #ffffff
@desc
设定进行中状态文字颜色.

@param ReportableStateColor
@text 可汇报任务颜色
@type string
@default #ffff00
@desc
设定可汇报状态文字颜色.

@param ReportedStateColor
@text 已汇报任务颜色
@type string
@default #60ff60
@desc
设定已汇报状态文字颜色.

@param FailedStateColor
@text 失败任务颜色
@type string
@default #0000ff
@desc
设定已失败状态文字颜色.

@param ExpiredStateColor
@text 失效任务颜色
@type string
@default #ff0000
@desc
设定时效过期状态文字颜色.
*/

const QuestSystemPluginName = document.currentScript.src.match(/.+\/(.+)\.js/)[1];

let $dataQuests = null;

const QuestSystemAlias = (() => {
"use strict";

class PluginParamsParser {
    static parse(params, typeData, predictEnable = true) {
        return new PluginParamsParser(predictEnable).parse(params, typeData);
    }

    constructor(predictEnable = true) {
        this._predictEnable = predictEnable;
    }

    parse(params, typeData, loopCount = 0) {
        if (++loopCount > 255) throw new Error("endless loop error");
        const result = {};
        for (const name in typeData) {
            result[name] = this.convertParam(params[name], typeData[name], loopCount);
        }
        if (!this._predictEnable) return result;
        if (typeof params === "object" && !(params instanceof Array)) {
            for (const name in params) {
                if (result[name]) continue;
                const param = params[name];
                const type = this.predict(param);
                result[name] = this.convertParam(param, type, loopCount);
            }
        }
        return result;
    }

    convertParam(param, type, loopCount) {
        if (typeof type === "string") {
            return this.cast(param, type);
        } else if (typeof type === "object" && type instanceof Array) {
            const aryParam = JSON.parse(param);
            if (type[0] === "string") {
                return aryParam.map(strParam => this.cast(strParam, type[0]));
            } else {
                return aryParam.map(strParam => this.parse(JSON.parse(strParam), type[0]), loopCount);
            }
        } else if (typeof type === "object") {
            return this.parse(JSON.parse(param), type, loopCount);
        } else {
            throw new Error(`${type} is not string or object`);
        }
    }

    cast(param, type) {
        switch(type) {
        case "any":
            if (!this._predictEnable) throw new Error("Predict mode is disable");
            return this.cast(param, this.predict(param));
        case "string":
            return param;
        case "number":
            if (param.match(/\d+\.\d+/)) return parseFloat(param);
            return parseInt(param);
        case "boolean":
            return param === "true";
        default:
            throw new Error(`Unknow type: ${type}`);
        }
    }

    predict(param) {
        if (param.match(/^\d+$/) || param.match(/^\d+\.\d+$/)) {
            return "number";
        } else if (param === "true" || param === "false") {
            return "boolean";
        } else {
            return "string";
        }
    }
}

class ItemInfo {
    constructor(type, id) {
        this._type = type;
        this._id = id;
    }

    get type() { return this._type; }
    set type(_type) { this._type = _type; }
    get id() { return this._id; }
    set id(_id) { this._id = _id; }

    itemData() {
        switch (this._type) {
        case "item":
            return $dataItems[this._id];
        case "weapon":
            return $dataWeapons[this._id];
        case "armor":
            return $dataArmors[this._id];
        }
        throw new Error(`${this._type} is not found`);
    }
}

class RewardData {
    static fromParam(rewardParam) {
        if (rewardParam.Type === "gold") {
            return new RewardData("gold", { value: rewardParam.GoldValue });
        } else if (rewardParam.Type === "exp") {
            return new RewardData("exp", { value: rewardParam.ExpValue });
        } else if (["item", "weapon", "armor"].includes(rewardParam.Type)) {
            const itemInfo = new ItemInfo(rewardParam.Type, rewardParam.ItemId);
            return new RewardData("item", { item: itemInfo, count: rewardParam.ItemCount });
        } else if (rewardParam.Type === "any") {
            return new RewardData("any", { text: rewardParam.Text, iconIndex: rewardParam.IconIndex });
        }
    }

    constructor(type, params) {
        this._type = type;
        this._params = params;
    }

    get type() { return this._type; }
    get params() { return this._params };

    getReward() {
        if (this.type === "gold") {
            $gameParty.gainGold(this._params.value);
        } else if (this.type === "exp") {
            for (const actor of $gameParty.members()) {
                actor.gainExp(this._params.value);
            }
        } else if (["item", "weapon", "armor"].includes(this.type)) {
            $gameParty.gainItem(this._params.item.itemData(), this._params.count);
        }
    }
}

class TextDrawer {
    constructor(window) {
        this._window = window;
    }

    drawIconText(text, iconIndex, x, y, width) {
        return this.drawIconTextByMode(text, iconIndex, x, y, width, "normal");
    }

    drawIconTextWrap(text, iconIndex, x, y, width) {
        return this.drawIconTextByMode(text, iconIndex, x, y, width, "ex");
    }

    drawTextExWrap(text, x, y, width) {
        this._window.resetFontSettings();
        const textState = this._window.createTextState(text, x, y, width);
        const textArray = textState.text.split("");
        const outTextArray = [];
        let begin = 0;
        let turnPoint = 0;
        for (let i = 0; i < textArray.length; i++) {
            outTextArray.push(textArray[i]);
            const end = begin + turnPoint + 2; // +2 is length and next char.
            if (textArray[i] === "\n") {
                begin += turnPoint;
                turnPoint = 1;
            } else if (this.isTextTurn(textArray, begin, end, width)) {
                outTextArray.push("\n");
                begin += turnPoint;
                turnPoint = 0;
            } else {
                turnPoint++;
            }
        }
        textState.text = outTextArray.join("");
        this._window.processAllText(textState);
        return textState.text.split("\n").length;
    }

    isTextTurn(array, begin, end, width) {
        const text = array.slice(begin, end).join("");
        if (this._window.textWidth(text) >= width) return true;
        return false;
    }

    drawIconTextByMode(text, iconIndex, x, y, width, mode) {
        const iconY = y + (this._window.lineHeight() - ImageManager.iconHeight) / 2;
        const textMargin = ImageManager.iconWidth + 4;
        const itemWidth = Math.max(0, width - textMargin);
        this._window.resetTextColor();
        this._window.drawIcon(iconIndex, x, iconY);
        if (mode === "normal") {
            this._window.drawText(text, x + textMargin, y, itemWidth);
            return 1;
        } else if (mode === "ex") {
            return this.drawTextExWrap(text, x + textMargin, y, itemWidth);
        }
    }
}

class RewardWindowDrawer {
    constructor(window, reward) {
        this._window = window;
        this._reward = reward;
        this._textDrawer = new TextDrawer(window);
    }

    drawRewardToWindow(x, y, width) {
        if (this._reward.type === "gold") {
            const text = `${this._reward.params.value}${TextManager.currencyUnit}`;
            this._textDrawer.drawIconText(text, GoldIcon, x, y, width);
        } else if (this._reward.type === "item") {
            this._window.drawItemName(this._reward.params.item.itemData(), x, y, width);
            const strItemCount = `×${this._reward.params.count}`;
            this._window.drawText(strItemCount, x, y, width, "right");
        } else if (this._reward.type === "exp") {
            const text = `${TextManager.exp}＋${this._reward.params.value}`;
            this._textDrawer.drawIconText(text, ExpIcon, x, y, width);
        } else if (this._reward.type === "any") {
            this._textDrawer.drawIconText(this._reward.params.text, this._reward.params.iconIndex, x, y, width);
        }
    }
}

class QuestData {
    static fromParam(questDataParam) {
        const variableId = questDataParam.VariableId;
        const title = questDataParam.Title;
        const iconIndex = questDataParam.IconIndex;
        const requester = questDataParam.Requester;
        const rewards = questDataParam.Rewards.map(rewardParam => {
            return RewardData.fromParam(rewardParam);
        });
        const difficulty = questDataParam.Difficulty;
        const place = questDataParam.Place;
        const timeLimit = questDataParam.TimeLimit;
        const detail = questDataParam.Detail;
        const hiddenDetail = questDataParam.HiddenDetail;
        const commonEventId = questDataParam.CommonEventId;
        const priority = questDataParam.Priority;
        return new QuestData(variableId, title, iconIndex, requester, rewards, difficulty, place, timeLimit, detail, hiddenDetail, commonEventId, priority);
    }

    constructor(variableId, title, iconIndex, requester, rewards, difficulty, place, timeLimit, detail, hiddenDetail, commonEventId, priority) {
        this._variableId = variableId;
        this._title = title;
        this._iconIndex = iconIndex;
        this._requester = requester;
        this._rewards = rewards;
        this._difficulty = difficulty;
        this._place = place;
        this._timeLimit = timeLimit;
        this._detail = detail;
        this._hiddenDetail = hiddenDetail;
        this._commonEventId = commonEventId;
        this._priority = (priority != null ? priority : 0);
    }

    get variableId() { return this._variableId; }
    get title() { return this._title; }
    get iconIndex() { return this._iconIndex; }
    get requester() { return this._requester; }
    get rewards() { return this._rewards; }
    get difficulty() { return this._difficulty; }
    get place() { return this._place; }
    get timeLimit() { return this._timeLimit; }
    get detail() { return this._detail; }
    get hiddenDetail() { return this._hiddenDetail; }
    get commonEventId() { return this._commonEventId; }
    get priority() { return this._priority; }

    set rewards(_rewards) { this._rewards = _rewards; }
    set detail(_detail) { this._detail = _detail; }

    state() {
        const data = STATE_LIST.find(data => data.value === $gameVariables.value(this._variableId));
        return data ? data.state : "none";
    }

    setState(state) {
        const data = STATE_LIST.find(data => data.state === state);
        if (data) $gameVariables.setValue(this._variableId, data.value);
    }

    getRewards() {
        for (const reward of this.rewards) {
            reward.getReward();
        }
    }

    stateText() {
        const data = STATE_LIST.find(data => data.state === this.state());
        return data.text;
    }

    stateTextColor() {
        const data = STATE_LIST.find(data => data.state === this.state());
        return data.color;
    }
}

// Parse plugin parameters.
const typeDefine = {
    MenuCommands: ["string"],
    QuestDatas: [{
        Rewards: [{}],
    }],
    QuestOrderSe: {},
    QuestReportMe: {},
    MenuBackgroundImage: {},
    WindowSize: {},
    Text: {},
    TextColor: {},
};

const params = PluginParamsParser.parse(PluginManager.parameters(QuestSystemPluginName), typeDefine);

$dataQuests = params.QuestDatas.map(questDataParam => {
    return QuestData.fromParam(questDataParam);
});

const EnabledQuestMenu = params.EnabledQuestMenu;
const EnabledQuestMenuSwitchId = params.EnabledQuestMenuSwitchId;
const MenuCommands = params.MenuCommands;
const DisplayRequestor = params.DisplayRequestor;
const DisplayRewards = params.DisplayRewards;
const DisplayDifficulty = params.DisplayDifficulty;
const DisplayPlace = params.DisplayPlace;
const DisplayTimeLimit = params.DisplayTimeLimit;
const GoldIcon = params.GoldIcon;
const ExpIcon = params.ExpIcon;
const QuestTitleWrap = params.QuestTitleWrap;
const MaxOrderingQuests = params.MaxOrderingQuests;

const QuestOrderSe = params.QuestOrderSe;
const QuestReportMe = params.QuestReportMe;
const MenuBackgroundImage = params.MenuBackgroundImage;
const WindowSize = params.WindowSize;
const Text = params.Text;
const TextColor = params.TextColor;

const STATE_LIST = [
    { state: "none", value: 0, text: "" },
    { state: "notOrdered", value: 1, text: Text.NotOrderedStateText, color: TextColor.NotOrderedStateColor },
    { state: "ordering", value: 2, text: Text.OrderingStateText, color: TextColor.OrderingStateColor },
    { state: "reportable", value: 3, text: Text.ReportableStateText, color: TextColor.ReportableStateColor },
    { state: "reported", value: 4, text: Text.ReportedStateText, color: TextColor.ReportedStateColor },
    { state: "failed", value: 5, text: Text.FailedStateText, color: TextColor.FailedStateColor },
    { state: "expired", value: 6, text: Text.ExpiredStateText, color: TextColor.ExpiredStateColor },
    { state: "hidden", value: 7, text: "", color: "#ffffff" },
];

const COMMAND_TABLE = {
    "all": { state: null, text: Text.AllCommandText },
    "questOrder": { state: ["notOrdered"], text: Text.QuestOrderCommandText },
    "orderingQuest": { state: ["ordering", "reportable"], text: Text.OrderingQuestCommandText },
    "questCancel": { state: ["ordering"], text: Text.QuestCancelCommandText },
    "questReport": { state: ["reportable"], text: Text.QuestReportCommandText },
    "reportedQuest": { state: ["reported"], text: Text.ReportedQuestCommandText },
    "failedQuest": { state: ["failed"], text: Text.FailedQuestCommandText },
    "expiredQuest": { state: ["expired"], text: Text.ExpiredQuestCommandText },
    "hiddenQuest": { state: ["hidden"], text: Text.HiddenQuestCommandText },
};


// MV compatible
if (Utils.RPGMAKER_NAME === "MV") {
    ImageManager.iconWidth = 32;
    ImageManager.iconHeight = 32;
    ImageManager.faceWidth = 144;
    ImageManager.faceHeight = 144;

    Window_Base.prototype.drawRect = function(x, y, width, height) {
        const outlineColor = this.contents.outlineColor;
        const mainColor = this.contents.textColor;
        this.contents.fillRect(x, y, width, height, outlineColor);
        this.contents.fillRect(x + 1, y + 1, width - 2, height - 2, mainColor);
    };
    
    Window_Base.prototype.itemPadding = function() {
        return 8;
    };
    
    Window_Selectable.prototype.itemRectWithPadding = function(index) {
        const rect = this.itemRect(index);
        const padding = this.itemPadding();
        rect.x += padding;
        rect.width -= padding * 2;
        return rect;
    };
    
    Window_Selectable.prototype.itemLineRect = function(index) {
        const rect = this.itemRectWithPadding(index);
        const padding = (rect.height - this.lineHeight()) / 2;
        rect.y += padding;
        rect.height -= padding * 2;
        return rect;
    };
    
    Window_Base.prototype.createTextState = function(text, x, y, width) {
        const textState = { index: 0, x: x, y: y, left: x };
        textState.text = this.convertEscapeCharacters(text);
        textState.height = this.calcTextHeight(textState, false);
        return textState;
    };

    Window_Base.prototype.processAllText = function(textState) {
        while (textState.index < textState.text.length) {
            this.processCharacter(textState);
        }
        return textState;
    };

    Object.defineProperty(Window.prototype, "innerWidth", {
        get: function() {
            return Math.max(0, this._width - this._padding * 2);
        },
        configurable: true
    });

    Object.defineProperty(Window.prototype, "innerHeight", {
        get: function() {
            return Math.max(0, this._height - this._padding * 2);
        },
        configurable: true
    });

    Scene_Base.prototype.calcWindowHeight = function(numLines, selectable) {
        if (selectable) {
            return Window_Selectable.prototype.fittingHeight(numLines);
        } else {
            return Window_Base.prototype.fittingHeight(numLines);
        }
    };
}

class Window_Selectable_MZMV extends Window_Selectable {
    initialize(rect) {
        if (Utils.RPGMAKER_NAME === "MZ") {
            super.initialize(rect);
        } else {
            super.initialize(rect.x, rect.y, rect.width, rect.height);
        }
    }
}

class Window_Command_MZMV extends Window_Command {
    initialize(rect) {
        if (Utils.RPGMAKER_NAME === "MZ") {
            super.initialize(rect);
        } else {
            this._windowRect = rect;
            super.initialize(rect.x, rect.y);
        }
    }

    windowWidth() {
        return this._windowRect.width;
    }

    windowHeight() {
        return this._windowRect.height;
    }
}

let superScene_Message;
if (Utils.RPGMAKER_NAME === "MZ") {
    superScene_Message = Scene_Message;
} else {
    function Scene_Message_MV() {
        this.initialize(...arguments);
    }

    Scene_Message_MV.prototype = Object.create(Scene_Base.prototype);
    Scene_Message_MV.prototype.constructor = Scene_Message_MV;
    
    Scene_Message_MV.prototype.initialize = function() {
        Scene_Base.prototype.initialize.call(this);
    };
    
    Scene_Message_MV.prototype.isMessageWindowClosing = function() {
        return this._messageWindow.isClosing();
    };
    
    Scene_Message_MV.prototype.createAllWindows = function() {
        this.createMessageWindow();
    };
    
    Scene_Message_MV.prototype.createMessageWindow = function() {
        const rect = this.messageWindowRect();
        this._messageWindow = new Window_Message(rect);
        this.addWindow(this._messageWindow);
    };
    
    Scene_Message_MV.prototype.messageWindowRect = function() {
        const ww = Graphics.boxWidth;
        const wh = this.calcWindowHeight(4, false) + 8;
        const wx = (Graphics.boxWidth - ww) / 2;
        const wy = 0;
        return new Rectangle(wx, wy, ww, wh);
    };

    superScene_Message = Scene_Message_MV;
}

class Scene_QuestSystem extends superScene_Message {
    prepare(commandList, backgroundImage) {
        this._commandList = commandList;
        this._backgroundImage = backgroundImage;
    }

    create() {
        super.create();
        this.createBackground();
        this.createWindowLayer();
        this.createAllWindow();
        this.createButtons();
        this._interpreter = new Game_Interpreter();
        this._eventState = "none";
    }

    // Ported from Scene_MenuBase
    createButtons() {
        if (ConfigManager.touchUI) {
            if (this.needsCancelButton()) {
                this.createCancelButton();
            }
        }
    }

    // Ported from Scene_MenuBase
    needsCancelButton() {
        return true;
    }

    // Ported from Scene_MenuBase
    createCancelButton() {
        this._cancelButton = new Sprite_Button("cancel");
        this._cancelButton.x = Graphics.boxWidth - this._cancelButton.width - 4;
        this._cancelButton.y = this.buttonY();
        this.addWindow(this._cancelButton);
    }

    // Ported from Scene_MenuBase
    setBackgroundOpacity(opacity) {
        this._backgroundSprite.opacity = opacity;
    }

    createBackground() {
        this._backgroundSprite = new Sprite();
        if (this._backgroundImage.FileName1) {
            const bitmap1 = ImageManager.loadBitmap("img/", this._backgroundImage.FileName1);
            this._backgroundSprite.bitmap = bitmap1;
            if (this._backgroundImage.FileName2) {
                const bitmap2 = ImageManager.loadBitmap("img/", this._backgroundImage.FileName2);
                const sprite = new Sprite(bitmap2);
                sprite.x = this._backgroundImage.XOfs;
                sprite.y = this._backgroundImage.YOfs;
                this._backgroundSprite.addChild(sprite);
            }
            this.addChild(this._backgroundSprite);
        } else {
            this._backgroundFilter = new PIXI.filters.BlurFilter();
            this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
            this._backgroundSprite.filters = [this._backgroundFilter];
            this.addChild(this._backgroundSprite);
            this.setBackgroundOpacity(192);
        }
    }

    createAllWindow() {
        this.createQuestCommandWindow();
        this.createQuestListWindow();
        this.createQuestDetailWindow();
        this.createQuestOrderWindow();
        this.createQuestOrderFailedWindow();
        this.createQuestReportWindow();
        this.createQuestGetRewardWindow();
        this.createQuestCancelWindow();
        super.createAllWindows();
    }

    start() {
        super.start();
        this._questCommandWindow.activate();
        this._questCommandWindow.select(0);
        this._questDetailWindow.setDrawState("undraw");
        this._questCommandWindow.refresh();
        this.resetQuestList();
    }

    update() {
        super.update();
        this.updateEvent();
    }

    updateEvent() {
        if (this._eventState === "start") {
            this._questListWindow.deactivate();
            this._eventState = "running";
        } else if (this._eventState === "running") {
            if (this._interpreter.isRunning()) this._interpreter.update();
            if (!this._interpreter.isRunning() && !$gameMessage.isBusy()) this._eventState = "end";
        } else if (this._eventState === "end") {
            this._eventState = "none";
            this._interpreter.clear();
            this.resetQuestList();
            this._questListWindow.activate();
            this._questListWindow.select(0);
            this._questDetailWindow.refresh();
        }
    }

    createQuestCommandWindow() {
        this._questCommandWindow = new Window_QuestCommand(this.questCommandWindowRect(), this._commandList);
        this._questCommandWindow.setHandler("ok", this.onQuestCommandOk.bind(this));
        this._questCommandWindow.setHandler("cancel", this.onQuestCommandCancel.bind(this));
        this._questCommandWindow.setHandler("select", this.onQuestCommandSelect.bind(this));
        this.addWindow(this._questCommandWindow);
    }

    createQuestListWindow() {
        this._questListWindow = new Window_QuestList(this.questListWindowRect());
        this._questListWindow.setHandler("ok", this.onQuestListOk.bind(this));
        this._questListWindow.setHandler("cancel", this.onQuestListCancel.bind(this));
        this._questListWindow.setHandler("select", this.onQuestListSelect.bind(this));
        this.addWindow(this._questListWindow);
    }

    createQuestDetailWindow() {
        this._questDetailWindow = new Window_QuestDetail(this.questDetailWindowRect());
        this.addWindow(this._questDetailWindow);
    }

    createQuestOrderWindow() {
        this._questOrderWindow = new Window_QuestOrder(this.questOrderWindowRect());
        this._questOrderWindow.setHandler("yes", this.onQuestOrderOk.bind(this));
        this._questOrderWindow.setHandler("no", this.onQuestOrderCancel.bind(this));
        this._questOrderWindow.setHandler("cancel", this.onQuestOrderCancel.bind(this));
        this.addWindow(this._questOrderWindow);
    }

    createQuestOrderFailedWindow() {
        this._questOrderFailedWindow = new Window_QuestOrderFailed(this.questOrderFailedWindowRect());
        this._questOrderFailedWindow.setHandler("ok", this.onQuestOrderFailedOk.bind(this));
        this._questOrderFailedWindow.refresh();
        this.addWindow(this._questOrderFailedWindow);
    }

    createQuestReportWindow() {
        this._questReportWindow = new Window_QuestReport(this.questReportWindowRect());
        this._questReportWindow.setHandler("yes", this.onQuestReportOk.bind(this));
        this._questReportWindow.setHandler("no", this.onQuestReportCancel.bind(this));
        this._questReportWindow.setHandler("cancel", this.onQuestReportCancel.bind(this));
        this.addWindow(this._questReportWindow);
    }

    createQuestGetRewardWindow() {
        this._questGetRewardWindow = new Window_QuestGetReward(this.questGetRewardWindowRect());
        this._questGetRewardWindow.setHandler("ok", this.onQuestGetRewardOk.bind(this));
        this.addWindow(this._questGetRewardWindow);
    }

    createQuestCancelWindow() {
        this._questCancelWindow = new Window_QuestCancel(this.questCancelWindowRect());
        this._questCancelWindow.setHandler("yes", this.onQuestCancelOk.bind(this));
        this._questCancelWindow.setHandler("no", this.onQuestCancelCancel.bind(this));
        this._questCancelWindow.setHandler("cancel", this.onQuestCancelCancel.bind(this));
        this.addWindow(this._questCancelWindow);
    }

    // MV compatible
    isBottomButtonMode() {
        if (Utils.RPGMAKER_NAME === "MZ") return super.isBottomButtonMode();
        return false;
    }

    buttonAreaHeight() {
        if (Utils.RPGMAKER_NAME === "MZ") return super.buttonAreaHeight();
        return 0;
    }

    // Window rectangle
    questCommandWindowRect() {
        const x = 0;
        let y = 0;
        if (!this.isBottomButtonMode()) y += this.buttonAreaHeight();
        const w = WindowSize.CommandWindowWidth;
        const h = WindowSize.CommandWindowHeight;
        return new Rectangle(x, y, w, h);
    }

    questListWindowRect() {
        const questCommandWindowRect = this.questCommandWindowRect();
        const x = 0;
        const y = questCommandWindowRect.y + questCommandWindowRect.height;
        const w = WindowSize.CommandWindowWidth;
        const bottom = (this.isBottomButtonMode() ? Graphics.boxHeight - this.buttonAreaHeight() : Graphics.boxHeight);
        const h = bottom - y;
        return new Rectangle(x, y, w, h);
    }

    questDetailWindowRect() {
        const questCommandWindowRect = this.questCommandWindowRect();
        const questListWindowRect = this.questListWindowRect();
        const x = questListWindowRect.x + questListWindowRect.width;
        const y = questCommandWindowRect.y;
        const w = Graphics.boxWidth - x;
        const h = questCommandWindowRect.height + questListWindowRect.height;
        return new Rectangle(x, y, w, h);
    }

    questOrderWindowRect() {
        const w = WindowSize.DialogWindowWidth;
        const h = (Utils.RPGMAKER_NAME === "MZ" ? 160 : 150);
        const x = Graphics.boxWidth / 2 - w / 2;
        const y = Graphics.boxHeight / 2 - h / 2;
        return new Rectangle(x, y, w, h);
    }

    questOrderFailedWindowRect() {
        const w = WindowSize.DialogWindowWidth;
        const h = 70;
        const x = Graphics.boxWidth / 2 - w / 2;
        const y = Graphics.boxHeight / 2 - h / 2;
        return new Rectangle(x, y, w, h);
    }

    questReportWindowRect() {
        return this.questOrderWindowRect();
    }

    questGetRewardWindowRect() {
        const x = 0;
        const y = 0;
        const w = WindowSize.GetRewardWindowWidth;
        const h = Graphics.boxHeight;
        return new Rectangle(x, y, w, h);
    }

    questCancelWindowRect() {
        return this.questOrderWindowRect();
    }

    // Define window handlers
    onQuestCommandOk() {
        this.change_QuestCommandWindow_To_QuestListWindow();
        this.onQuestListSelect();
    }

    onQuestCommandCancel() {
        this.popScene();
    }

    onQuestCommandSelect() {
        this.resetQuestList();
    }

    onQuestListOk() {
        switch(this._questCommandWindow.currentSymbol()) {
        case "questOrder":
            if (MaxOrderingQuests === 0 || this.numOrderingQuests() < MaxOrderingQuests) {
                this.change_QuestListWindow_To_QuestOrderWindow();
                SoundManager.playOk();
            } else {
                this.change_QuestListWindow_To_QuestOrderFailedWindow();
                SoundManager.playBuzzer();
            }
            break;
        case "questCancel":
            this.change_QuestListWindow_To_QuestCancelWindow();
            SoundManager.playOk();
            break;
        case "questReport":
            this.change_QuestListWindow_To_QuestReportWindow();
            SoundManager.playOk();
            break;
        default:
            this._questListWindow.activate();
            break;
        }
    }

    onQuestListCancel() {
        this.change_QuestListWindow_To_QuestCommandWindow();
    }

    onQuestListSelect() {
        if (this._questListWindow.currentSymbol()) {
            this._questDetailWindow.setQuestData(this._questListWindow.questData());
        } else {
            this._questDetailWindow.setQuestData(null);
        }
        this._questDetailWindow.setDrawState("draw");
        this._questDetailWindow.refresh();
    }

    onQuestOrderOk() {
        const questData = this._questListWindow.questData();
        questData.setState("ordering");
        this.change_QuestOrderWindow_To_QuestListWindow();
        this.resetQuestList();
        this._questListWindow.select(0);
        this._questDetailWindow.refresh();
    }

    onQuestOrderFailedOk() {
        this.change_QuestOrderFailedWindow_To_QuestListWindow();
    }

    onQuestOrderCancel() {
        this.change_QuestOrderWindow_To_QuestListWindow();
    }

    onQuestReportOk() {
        const questData = this._questListWindow.questData();
        questData.setState("reported");
        this._questDetailWindow.refresh();
        this.change_QuestReportWindow_To_QuestGetRewardWindow();
        this._questGetRewardWindow.setQuestData(questData);
        this._questGetRewardWindow.refresh();
    }

    onQuestReportCancel() {
        this.change_QuestReportWindow_To_QuestListWindow();
    }

    onQuestGetRewardOk() {
        const questData = this._questListWindow.questData();
        questData.getRewards();
        this.change_QuestGetRewardWindow_To_QuestListWindow();
        this._eventState = "start";
        this.startCommonEvent(questData.commonEventId);
    }

    onQuestCancelOk() {
        const questData = this._questListWindow.questData();
        questData.setState("notOrdered");
        this.change_QuestCancelWindow_To_QuestListWindow();
        this.resetQuestList();
        this._questListWindow.select(0);
        this._questDetailWindow.refresh();
    }

    onQuestCancelCancel() {
        this.change_QuestCancelWindow_To_QuestListWindow();
    }

    // Change window
    change_QuestCommandWindow_To_QuestListWindow() {
        this._questCommandWindow.deactivate();
        this._questListWindow.show();
        this._questListWindow.activate();
        this._questListWindow.select(0);
    }

    change_QuestListWindow_To_QuestCommandWindow() {
        this._questDetailWindow.setQuestData(null);
        this._questDetailWindow.setDrawState("undraw");
        this._questDetailWindow.refresh();
        this._questListWindow.deactivate();
        this._questListWindow.select(-1);
        this._questCommandWindow.activate();
    }

    change_QuestListWindow_To_QuestOrderWindow() {
        this._questListWindow.deactivate();
        this._questOrderWindow.show();
        this._questOrderWindow.open();
        this._questOrderWindow.activate();
        this._questOrderWindow.select(0);
    }

    change_QuestListWindow_To_QuestOrderFailedWindow() {
        this._questListWindow.deactivate();
        this._questOrderFailedWindow.show();
        this._questOrderFailedWindow.open();
        this._questOrderFailedWindow.activate();
    }

    change_QuestListWindow_To_QuestReportWindow() {
        this._questListWindow.deactivate();
        this._questReportWindow.show();
        this._questReportWindow.open();
        this._questReportWindow.activate();
        this._questReportWindow.select(0);
    }

    change_QuestOrderWindow_To_QuestListWindow() {
        this._questOrderWindow.close();
        this._questOrderWindow.deactivate();
        this._questOrderWindow.select(-1);
        this._questListWindow.activate();
    }

    change_QuestOrderFailedWindow_To_QuestListWindow() {
        this._questOrderFailedWindow.close();
        this._questOrderFailedWindow.deactivate();
        this._questListWindow.activate();
    }

    change_QuestReportWindow_To_QuestListWindow() {
        this._questReportWindow.close();
        this._questReportWindow.deactivate();
        this._questReportWindow.select(-1);
        this._questListWindow.activate();
    }

    change_QuestReportWindow_To_QuestGetRewardWindow() {
        this._questReportWindow.close();
        this._questReportWindow.deactivate();
        this._questReportWindow.select(-1);
        this._questGetRewardWindow.show();
        this._questGetRewardWindow.open();
        this._questGetRewardWindow.activate();
    }

    change_QuestGetRewardWindow_To_QuestListWindow() {
        this._questGetRewardWindow.close();
        this._questGetRewardWindow.deactivate();
        this._questListWindow.activate();
    }

    change_QuestListWindow_To_QuestCancelWindow() {
        this._questListWindow.deactivate();
        this._questCancelWindow.show();
        this._questCancelWindow.open();
        this._questCancelWindow.activate();
        this._questCancelWindow.select(-1);
    }

    change_QuestCancelWindow_To_QuestListWindow() {
        this._questCancelWindow.close();
        this._questCancelWindow.deactivate();
        this._questCancelWindow.select(-1);
        this._questListWindow.activate();
    }

    // Reset quest list window.
    resetQuestList() {
        const questList = this._questCommandWindow.filterQuestList();
        questList.sort((a, b) => b.priority - a.priority);
        this._questListWindow.resetQuestList(questList);
    }

    // Start common event.
    startCommonEvent(commonEventId) {
        // If commonEventId is undefined, do not start common event.;
        if (!commonEventId || commonEventId === 0) return;
        const commonEventData = $dataCommonEvents[commonEventId];
        this._interpreter.setup(commonEventData.list);
    }

    // Return ordering quest count.
    numOrderingQuests() {
        const orderingQuestCommand = COMMAND_TABLE["orderingQuest"];
        const orderingQuests = $dataQuests.filter(quest => orderingQuestCommand.state.includes(quest.state()));
        return orderingQuests.length;
    }
}

class Window_QuestCommand extends Window_Command_MZMV {
    initialize(rect, commandList) {
        this._commandList = commandList;
        super.initialize(rect);
        this.deactivate();
        this.select(-1);
    }

    select(index) {
        super.select(index);
        if (this.active && index >= 0) this.callHandler("select");
    }

    makeCommandList() {
        for (const command of this._commandList) {
            const commandData = COMMAND_TABLE[command];
            if (commandData) {
                this.addCommand(commandData.text, command);
            } else {
                throw new Error(`Unknow quest command ${command}`);
            }
        }
    }

    filterQuestList() {
        if (this.currentSymbol() === "all") return $dataQuests.filter(data => data.state() !== "none");
        const commandData = COMMAND_TABLE[this.currentSymbol()];
        return $dataQuests.filter(quest => commandData.state.includes(quest.state()));
    }
}

class Window_QuestList extends Window_Command_MZMV {
    initialize(rect) {
        this._questList = [];
        super.initialize(rect);
        this.deactivate();
        this.select(-1);
    }

    select(index) {
        super.select(index);
        if (this.active && index >= 0) this.callHandler("select");
    }

    resetQuestList(questList) {
        this.clearCommandList();
        this._questList = questList;
        this.refresh();
    }

    questData() {
        return this._questList[this.index()];
    }

    makeCommandList() {
        for (let i = 0; i < this._questList.length; i++) {
            const questData = this._questList[i];
            const title = (questData.state() === "hidden" ? Text.HiddenTitleText : questData.title);
            this.addCommand(title, `quest${i}`);
        }
    }

    drawItem(index) {
        const rect = this.itemLineRect(index);
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        const questData = this._questList[index];
        if (questData.iconIndex === 0) {
            this.drawText(this.commandName(index), rect.x, rect.y, rect.width, "left");
        } else {
            const textDrawer = new TextDrawer(this);
            textDrawer.drawIconText(this.commandName(index), questData.iconIndex, rect.x, rect.y, rect.width);
        }
    }

    // Play OK sound on the scene side.
    playOkSound() {
    }
}

class Window_QuestDetail extends Window_Selectable_MZMV {
    initialize(rect) {
        super.initialize(rect);
        this._questData = null;
        this._drawState = "undraw";
        this.deactivate();
    }

    setQuestData(questData) {
        this._questData = questData;
    }

    // undraw: Unraw window
    // draw: Draw window
    setDrawState(drawState) {
        this._drawState = drawState;
    }

    infoTextWidth() {
        return 160;
    }

    messageX() {
        return this.infoTextWidth() + 16;
    }

    messageWindth() {
        return this.width - this.padding * 2 - this.messageX();
    }

    drawAllItems() {
        if (this._drawState === "draw" && !this._questData) {
            this.drawNothingQuest(0);
        } else if (this._drawState === "draw" && this._questData.state() === "hidden") {
            this.drawHiddenDetail(0);
        } else if (this._drawState === "draw") {
            this.drawQuestData();
        }
    }

    drawQuestData() {
        let startLine = 0;
        const titleRows = this.drawTitle(startLine);
        startLine += titleRows;
        this.drawHorzLine(this.startY(startLine));
        startLine += 0.25;
        if (DisplayRequestor) {
            this.drawRequester(startLine);
            startLine += 1;
        }
        if (DisplayRewards) {
            this.drawRewards(startLine);
            startLine += this._questData.rewards.length;
        }
        if (DisplayDifficulty) {
            this.drawDifficulty(startLine);
            startLine += 1;
        }
        if (DisplayPlace) {
            this.drawPlace(startLine);
            startLine += 1;
        }
        if (DisplayTimeLimit) {
            this.drawTimeLimit(startLine);
            startLine += 1;
        }
        if (!this.isOnlyDisplayDetail()) {
            this.drawHorzLine(this.startY(startLine));
            startLine += 0.25;
        }
        this.drawDetail(startLine);
    }

    isOnlyDisplayDetail() {
        return !(DisplayRequestor || DisplayRewards || DisplayDifficulty || DisplayPlace || DisplayTimeLimit);
    }

    drawNothingQuest(startLine) {
        this.drawTextEx(Text.NothingQuestText, this.padding, this.startY(startLine), this.width - this.padding * 2);
    }

    drawTitle(startLine) {
        let titleRows = 1;
        this.resetTextColor();
        const stateWidth = 120;
        const titleWidth = this.width - this.padding * 4 - stateWidth;
        if (QuestTitleWrap) {
            if (this._questData.iconIndex === 0) {
                titleRows = this.drawTextExWrap(this._questData.title, this.padding, this.startY(startLine), titleWidth);
            } else {
                titleRows = this.drawIconTextWrap(this._questData.title, this._questData.iconIndex, this.padding, this.startY(startLine), titleWidth);
            }
        } else {
            if (this._questData.iconIndex === 0) {
                this.drawText(this._questData.title, this.padding, this.startY(startLine), titleWidth);
            } else {
                this.drawIconText(this._questData.title, this._questData.iconIndex, this.padding, this.startY(startLine), titleWidth);
            }
        }
        this.changeTextColor(this._questData.stateTextColor());
        this.drawText(this._questData.stateText(), this.padding + titleWidth, this.startY(startLine), stateWidth, "right");
        this.resetTextColor();
        return titleRows;
    }

    drawRequester(startLine) {
        this.changeTextColor(this.systemColor());
        this.drawText(Text.RequesterText, this.padding, this.startY(startLine), this.infoTextWidth());
        this.resetTextColor();
        this.drawText(this._questData.requester, this.messageX(), this.startY(startLine), this.messageWindth());
    }

    drawRewards(startLine) {
        this.changeTextColor(this.systemColor());
        this.drawText(Text.RewardText, this.padding, this.startY(startLine), this.infoTextWidth());
        this.resetTextColor();
        for (const reward of this._questData.rewards) {
            this.drawReward(reward, this.startY(startLine))
            startLine++;
        }
    }

    drawReward(reward, y) {
        new RewardWindowDrawer(this, reward).drawRewardToWindow(this.messageX(), y, this.messageWindth());
    }

    drawDifficulty(startLine) {
        this.changeTextColor(this.systemColor());
        this.drawText(Text.DifficultyText, this.padding, this.startY(startLine), this.infoTextWidth());
        this.resetTextColor();
        this.drawText(this._questData.difficulty, this.messageX(), this.startY(startLine), this.messageWindth());
    }

    drawPlace(startLine) {
        this.changeTextColor(this.systemColor());
        this.drawText(Text.PlaceText, this.padding, this.startY(startLine), this.infoTextWidth());
        this.resetTextColor();
        this.drawText(this._questData.place, this.messageX(), this.startY(startLine), this.messageWindth());
    }

    drawTimeLimit(startLine) {
        this.changeTextColor(this.systemColor());
        this.drawText(Text.TimeLimitText, this.padding, this.startY(startLine), this.infoTextWidth());
        this.resetTextColor();
        this.drawText(this._questData.timeLimit, this.messageX(), this.startY(startLine), this.messageWindth());
    }

    drawDetail(startLine) {
        this.drawTextExWrap(this._questData.detail, this.padding, this.startY(startLine), this.width - this.padding * 2);
    }

    drawHiddenDetail(startLine) {
        this.drawTextEx(this._questData.hiddenDetail, this.padding, this.startY(startLine), this.width - this.padding * 2);
    }

    startY(line) {
        return this.padding + this.itemHeight() * line;
    }

    drawHorzLine(y, color = this.systemColor()) {
        this.changeTextColor(color);
        const padding = this.itemPadding();
        const x = padding;
        const width = this.innerWidth - padding * 2;
        this.drawRect(x, y, width, 5);
        this.resetTextColor();
    }

    drawTextExWrap(text, x, y, width) {
        const textDrawer = new TextDrawer(this);
        return textDrawer.drawTextExWrap(text, x, y, width);
    }

    drawIconText(text, iconIndex, x, y, width) {
        const textDrawer = new TextDrawer(this);
        return textDrawer.drawIconText(text, iconIndex, x, y, width);
    }

    drawIconTextWrap(text, iconIndex, x, y, width) {
        const textDrawer = new TextDrawer(this);
        return textDrawer.drawIconTextWrap(text, iconIndex, x, y, width);
    }

    itemHeight() {
        return 32;
    }
}

class Window_QuestOrder extends Window_Command_MZMV {
    initialize(rect) {
        super.initialize(rect);
        this.deactivate();
        this.hide();
        this.close();
    }

    makeCommandList() {
        this.addCommand(Text.QuestOrderYesText, "yes");
        this.addCommand(Text.QuestOrderNoText, "no");
    }

    drawAllItems() {
        const rect = this.itemLineRect(-1);
        this.drawText(Text.QuestOrderText, rect.x, rect.y, rect.width);
        super.drawAllItems();
    }

    itemRect(index) {
        const rect = super.itemRect(index + 1);
        return rect;
    }

    playOkSound() {
        if (this.currentSymbol() === "yes") return this.playOrderSound();
        super.playOkSound();
    }

    playOrderSound() {
        if (QuestOrderSe.FileName === "") return;
        const se = {
            name: QuestOrderSe.FileName,
            pan: QuestOrderSe.Pan,
            pitch: QuestOrderSe.Pitch,
            volume: QuestOrderSe.Volume,
        }
        AudioManager.playSe(se);
    }
}

class Window_QuestOrderFailed extends Window_Selectable_MZMV {
    initialize(rect) {
        super.initialize(rect);
        this.deactivate();
        this.hide();
        this.close();
    }

    onTouchOk() {
        this.processOk();
    }

    drawAllItems() {
        const rect = this.itemLineRect(0);
        this.drawText(Text.ReachedLimitText, rect.x, rect.y, rect.width);
    }
}

class Window_QuestCancel extends Window_Command_MZMV {
    initialize(rect) {
        super.initialize(rect);
        this.deactivate();
        this.hide();
        this.close();
    }

    makeCommandList() {
        this.addCommand(Text.QuestCancelYesText, "yes");
        this.addCommand(Text.QuestCancelNoText, "no");
    }

    drawAllItems() {
        const rect = this.itemLineRect(-1);
        this.drawText(Text.QuestCancelText, rect.x, rect.y, rect.width);
        super.drawAllItems();
    }

    itemRect(index) {
        const rect = super.itemRect(index + 1);
        return rect;
    }
}

class Window_QuestReport extends Window_Command_MZMV {
    initialize(rect) {
        super.initialize(rect);
        this.deactivate();
        this.hide();
        this.close();
    }

    makeCommandList() {
        this.addCommand(Text.QuestReportYesText, "yes");
        this.addCommand(Text.QuestReportNoText, "no");
    }

    drawAllItems() {
        const rect = this.itemLineRect(-1);
        this.drawText(Text.QuestReportText, rect.x, rect.y, rect.width);
        super.drawAllItems();
    }

    itemRect(index) {
        const rect = super.itemRect(index + 1);
        return rect;
    }

    playOkSound() {
        if (this.currentSymbol() === "yes") return this.playOrderSound();
        super.playOkSound();
    }

    playOrderSound() {
        if (QuestReportMe.FileName === "") return;
        const me = {
            name: QuestReportMe.FileName,
            pan: QuestReportMe.Pan,
            pitch: QuestReportMe.Pitch,
            volume: QuestReportMe.Volume,
        }
        AudioManager.playMe(me);
    }
}

class Window_QuestGetReward extends Window_Selectable_MZMV {
    initialize(rect) {
        super.initialize(rect);
        this.deactivate();
        this.hide();
        this.close();
        this._questData = null;
    }

    refresh() {
        if (this._questData) this.updateWindowRect();
        super.refresh();
    }

    updateWindowRect() {
        const numRewards = this._questData.rewards.length;
        const w = WindowSize.GetRewardWindowWidth;
        const h = (Utils.RPGMAKER_NAME === "MZ" ? 80 : 70) + numRewards * 40;
        const x = Graphics.boxWidth / 2 - w / 2;
        const y = Graphics.boxHeight / 2 - h / 2;
        this.move(x, y, w, h);
    }

    onTouchOk() {
        this.processOk();
    }

    setQuestData(questData) {
        this._questData = questData;
    }

    drawAllItems() {
        const rect = this.itemLineRect(0);
        this.drawText(Text.GetRewardText, rect.x, rect.y, rect.width);
        this.drawRewards();
    }

    drawRewards() {
        let i = 1;
        for (const reward of this._questData.rewards) {
            const rect = this.itemLineRect(i);
            this.drawReward(reward, rect);
            i++;
        }
    }

    drawReward(reward, rect) {
        new RewardWindowDrawer(this, reward).drawRewardToWindow(rect.x, rect.y, rect.width);
    }
}


// Register plugin command.
PluginManager.registerCommand(QuestSystemPluginName, "StartQuestScene", args => {
    SceneManager.push(Scene_QuestSystem);
    const params = PluginParamsParser.parse(args, { QuestCommands: ["string"], BackgroundImage: {} });
    const commands = (params.QuestCommands.length === 0 ? null : params.QuestCommands);
    SceneManager.prepareNextScene(commands, params.BackgroundImage);
});

PluginManager.registerCommand(QuestSystemPluginName, "GetRewards", args => {
    const params = PluginParamsParser.parse(args, { VariableId: "number" });
    const questData = $dataQuests.find(data => data.variableId === params.VariableId);
    if (!questData) return;
    questData.getRewards();
});

PluginManager.registerCommand(QuestSystemPluginName, "ChangeDetail", args => {
    const params = PluginParamsParser.parse(args, { VariableId: "number", Detail: "string" });
    const questData = $dataQuests.find(data => data.variableId === params.VariableId);
    if (!questData) return;
    questData.detail = params.Detail;
});

PluginManager.registerCommand(QuestSystemPluginName, "ChangeRewards", args => {
    const params = PluginParamsParser.parse(args, { Rewards: [{}] });
    const questData = $dataQuests.find(data => data.variableId === params.VariableId);
    if (!questData) return;
    const rewards = params.Rewards.map(rewardParam => {
        return RewardData.fromParam(rewardParam);
    });
    questData.rewards = rewards;
});


// Add QuestSystem to menu command.
const _Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function() {
    _Window_MenuCommand_addOriginalCommands.call(this);
    if (EnabledQuestMenu && Text.MenuQuestSystemText !== "") this.addCommand(Text.MenuQuestSystemText, "quest", this.isEnabledQuestMenu());
};

Window_MenuCommand.prototype.isEnabledQuestMenu = function() {
    if (EnabledQuestMenuSwitchId === 0) return true;
    return $gameSwitches.value(EnabledQuestMenuSwitchId);
};

const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler("quest", this.quest.bind(this));
};

Scene_Menu.prototype.quest = function() {
    SceneManager.push(Scene_QuestSystem);
    SceneManager.prepareNextScene(MenuCommands, MenuBackgroundImage);
};


// Define class alias.
return {
    ItemInfo: ItemInfo,
    RewardData: RewardData,
    RewardWindowDrawer: RewardWindowDrawer,
    QuestData: QuestData,
    Scene_QuestSystem: Scene_QuestSystem,
    Window_QuestCommand: Window_QuestCommand,
    Window_QuestList: Window_QuestList,
    Window_QuestDetail: Window_QuestDetail,
    Window_QuestOrder: Window_QuestOrder,
    Window_QuestCancel: Window_QuestCancel,
    Window_QuestReport: Window_QuestReport,
    Window_QuestGetReward: Window_QuestGetReward,
};

})();
