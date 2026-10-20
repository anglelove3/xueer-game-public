/*:
 * @plugindesc 独白日记：全屏日记本 UI、逐字打印、确认关闭，并在菜单里回看已读的夜晚。
 * @author 雪儿项目
 *
 * @help
 * 事件指令：
 *   Mono night night=1 variant=1
 *   Mono night night=5 variant=2
 *   Mono menu
 *   Mono get          （仅开发用）
 *
 * 约定：
 *   - night：1–4 为第 1–4 夜，5 为终夜。variant 从 1 开始。
 *   - 读完后自动打开 S33–S37 对应开关（S32 + night）。
 *   - 情绪值 +3 不在这里做，由事件层在关闭后调用 Mood add value=3，
 *     这样「重看」不会重复加情绪。
 *   - 玩家在菜单中可回看已读的夜晚；未读的夜晚显示为灰色不可选。
 *   - 本插件不依赖 2D_Cat_MsgTextPrintAnim，逐字打印在自定义窗口里完成。
 *
 * 文本位置：本文件底部的 TEXTS 常量。
 * 第 3 夜目前只有 1 个变体；设计文档里的「变体 B：未发现买药单」尚未写。
 *
 * @param Background Picture
 * @text 日记本图片
 * @default 日记本
 *
 * @param Window X
 * @text 文字框 X
 * @type number
 * @default 102
 *
 * @param Window Y
 * @text 文字框 Y
 * @type number
 * @default 76
 *
 * @param Window Width
 * @text 文字框宽
 * @type number
 * @default 672
 *
 * @param Window Height
 * @text 文字框高
 * @type number
 * @default 472
 *
 * @param Font Size
 * @text 正文字号
 * @type number
 * @default 22
 *
 * @param Frames Per Char
 * @text 每个字停留帧数
 * @desc 60 帧 = 1 秒。默认 3 帧/字。
 * @type number
 * @min 1
 * @default 3
 *
 * @param Enable Menu Replay
 * @text 菜单增加「独白」项
 * @type boolean
 * @default true
 *
 * @param Menu Command Text
 * @text 菜单项文字
 * @default 独白
 *
 * @command night
 * @text 翻开某一夜独白
 * @desc 显示日记本、逐字打印，读完后打开对应已读开关。
 *
 * @arg night
 * @text 夜号
 * @desc 1–4 为第 1–4 夜，5 为终夜。
 * @type number
 * @min 1
 * @max 5
 * @default 1
 *
 * @arg variant
 * @text 变体
 * @type number
 * @min 1
 * @max 3
 * @default 1
 *
 * @arg text
 * @text 自定义文本（可空）
 * @desc 仅开发/调试用；留空则读取内置文本库。换行请直接写 \n。
 * @default
 *
 * @command menu
 * @text 打开独白回看
 * @desc 打开已读夜晚列表。可接在道具或菜单事件上。
 *
 * @command get
 * @text 查看已读状态（控制台）
 * @desc 仅开发用。
 */
(() => {
    "use strict";

    const PLUGIN_NAME = "XueEr_Monologue";
    const P = PluginManager.parameters(PLUGIN_NAME);
    const num = (value, fallback) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    };

    const CFG = {
        background: P["Background Picture"] || "日记本",
        windowX: num(P["Window X"], 102),
        windowY: num(P["Window Y"], 76),
        windowWidth: num(P["Window Width"], 672),
        windowHeight: num(P["Window Height"], 472),
        fontSize: num(P["Font Size"], 22),
        framesPerChar: Math.max(1, num(P["Frames Per Char"], 3)),
        enableMenuReplay: String(P["Enable Menu Replay"]) !== "false",
        menuText: P["Menu Command Text"] || "独白"
    };

    const NIGHT_LABELS = {
        1: "第 1 夜",
        2: "第 2 夜",
        3: "第 3 夜",
        4: "第 4 夜",
        5: "终夜"
    };

    // 独白全本来自《04_剧情脚本_全本》各章末尾。
    const TEXTS = {
        1: {
            1: [
                "今天做了个梦。",
                "梦里有两个人一直追我，追了很久。后来有人说「别怕，我带你回家」。",
                "我醒了，妈在喊我吃饭。",
                "她做的饭，味道和以前一样。我吃了三样。我是真的觉得好吃。",
                "那个人的声音很好听。我有点想再听他说话。",
                "……",
                "明天再想吧。"
            ].join("\n"),
            2: [
                "今天做了个梦。",
                "妈做的饭，我吃了一点。",
                "剩下的被我倒掉了，她没看见。",
                "我说「真好吃」的时候，是真心的。",
                "就是吃不下。"
            ].join("\n"),
            3: [
                "小娟的发卡丢了，她让我帮她找。",
                "我没理她。我知道我该帮她。",
                "我今天连站起来都费劲。",
                "她哭了。她说「雪儿姐姐最讨厌了」。",
                "……",
                "她说得对。"
            ].join("\n")
        },
        2: {
            1: [
                "今天捡了一天东西。树枝五根，叶子四片，菌三朵。",
                "我记得很清楚。我很少记得这么清楚。",
                "在医院的时候，护士问我几号，我答不上来。",
                "……",
                "我为什么会想到医院。"
            ].join("\n"),
            2: [
                "今天在林子里坐了很久。",
                "什么都没做。",
                "天黑了才回家。",
                "……",
                "这是最近做得最像话的一件事。"
            ].join("\n")
        },
        3: {
            1: [
                "今天去了城里。",
                "街上有人在吵架，吵得很大声。我站在那儿听完了。",
                "有个屋子，我一进去就觉得熟悉。",
                "抽屉里有张单子。",
                "……",
                "我不记得我买过那个药。我不记得。",
                "我今天想不起来了。",
                "我明天再想。"
            ].join("\n"),
            2: [
                "今天去了城里。",
                "街上有人在吵架，吵得很大声。我绕开了。",
                "工厂里有个女工，让我帮她送一封信。",
                "我接了，把信放在包的最里面。",
                "她说她妹妹住在城东。",
                "我没告诉她，我连城东在哪儿都想不起来。",
                "……",
                "今天想不起来的事情，比昨天多。"
            ].join("\n")
        },
        4: {
            1: [
                "今天多了一个人。他叫岚哥。",
                "他记不住路，但是记得住我们谁不吃什么。",
                "他说他不记得以前的事了。",
                "……",
                "我问他多大。他说忘了。",
                "我好像知道他是谁了。",
                "但我不敢往下想。想下去，我就得想别的了。",
                "今天到这里。够了。"
            ].join("\n")
        },
        5: {
            1: [
                "我把门推开了一条缝。",
                "风是凉的。",
                "我居然是活的。"
            ].join("\n"),
            2: [
                "我把门推开了一条缝。",
                "风是凉的。",
                "明天我再推一次。"
            ].join("\n"),
            3: [
                "我把门推开了一条缝。",
                "风是凉的。",
                "……",
                "就到这里吧。"
            ].join("\n")
        }
    };

    //-------------------------------------------------------------------------
    // Game_Monologue
    //-------------------------------------------------------------------------

    function Game_Monologue() {
        this.initialize(...arguments);
    }

    Game_Monologue.prototype.initialize = function() {
        this._busy = false;
        this._currentNight = 0;
        this._pending = null;
    };

    Game_Monologue.prototype.isBusy = function() {
        return this._busy;
    };

    Game_Monologue.prototype.hasRead = function(night) {
        return !!$gameSwitches.value(32 + Number(night));
    };

    Game_Monologue.prototype.hasAnyRead = function() {
        for (let night = 1; night <= 5; night++) {
            if (this.hasRead(night)) return true;
        }
        return false;
    };

    Game_Monologue.prototype.textFor = function(night, variant) {
        const nightTexts = TEXTS[Number(night)];
        if (!nightTexts) return null;
        return nightTexts[Number(variant)] || null;
    };

    Game_Monologue.prototype.openNight = function(night, variant, options) {
        night = Number(night);
        variant = Number(variant) || 1;
        options = options || {};
        if (this._busy) {
            console.warn("[XueEr_Monologue] 已经有一篇独白正在显示。");
            return false;
        }
        const text = String(options.text || "") || this.textFor(night, variant);
        if (!text) {
            console.warn(
                `[XueEr_Monologue] 找不到独白文本：night=${night}, variant=${variant}`
            );
            return false;
        }
        this._busy = true;
        this._currentNight = night;
        this._pending = {
            night: night,
            variant: variant,
            text: text,
            fromMenu: !!options.fromMenu
        };
        SceneManager.push(Scene_Monologue);
        return true;
    };

    Game_Monologue.prototype.takePending = function() {
        const pending = this._pending;
        this._pending = null;
        return pending;
    };

    Game_Monologue.prototype.closeNight = function() {
        if (!this._busy) return;
        if (this._currentNight >= 1 && this._currentNight <= 5) {
            $gameSwitches.setValue(32 + this._currentNight, true);
        }
        console.log(
            `[XueEr_Monologue] 关灯：night=${this._currentNight}，已读开关 S${32 + this._currentNight}`
        );
        this._busy = false;
        this._currentNight = 0;
    };

    Game_Monologue.prototype.openMenu = function() {
        SceneManager.push(Scene_MonologueList);
    };

    //-------------------------------------------------------------------------
    // Window_Monologue
    //-------------------------------------------------------------------------

    function Window_Monologue() {
        this.initialize(...arguments);
    }

    Window_Monologue.prototype = Object.create(Window_Base.prototype);
    Window_Monologue.prototype.constructor = Window_Monologue;

    Window_Monologue.prototype.initialize = function(rect, data) {
        Window_Base.prototype.initialize.call(this, rect);
        this._night = data.night;
        this._text = this.wrapText(data.text);
        this._index = 0;
        this._drawnIndex = -1;
        this._typing = true;
        this._charFrames = 0;
        this._promptFrames = 0;
        this._promptSprite = null;
        this.setBackgroundType(2);
        this.createPromptSprite();
        this.openness = 0;
        this.open();
    };

    Window_Monologue.prototype.resetFontSettings = function() {
        Window_Base.prototype.resetFontSettings.call(this);
        this.contents.fontSize = CFG.fontSize;
        this.contents.textColor = "#3f362b";
        this.contents.outlineColor = "rgba(0, 0, 0, 0.28)";
    };

    // drawTextEx 不会自动折行，先按像素宽度手动断开，避免长句画出纸面。
    Window_Monologue.prototype.wrapText = function(text) {
        const maxWidth = this.contents.width;
        const lines = String(text || "").split("\n");
        const wrapped = [];
        for (const line of lines) {
            let current = "";
            for (const char of line) {
                const test = current + char;
                if (current && this.textWidth(test) > maxWidth) {
                    wrapped.push(current);
                    current = char;
                } else {
                    current = test;
                }
            }
            wrapped.push(current);
        }
        return wrapped.join("\n");
    };

    Window_Monologue.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (!this.isOpen()) return;
        if (this._typing) {
            this._charFrames++;
            if (this._charFrames >= CFG.framesPerChar) {
                this._charFrames = 0;
                this._index++;
                if (this._index >= this._text.length) {
                    this._index = this._text.length;
                    this._typing = false;
                }
            }
        } else {
            this._promptFrames++;
        }
        if (this._drawnIndex !== this._index) {
            this._drawnIndex = this._index;
            this.redraw();
        }
        this.updatePrompt();
    };

    Window_Monologue.prototype.redraw = function() {
        this.contents.clear();
        this.drawTextEx(
            this._text.slice(0, this._index),
            0,
            0,
            this.contents.width
        );
        this.drawNightLabel();
    };

    Window_Monologue.prototype.drawNightLabel = function() {
        const label = NIGHT_LABELS[this._night] || "";
        this.contents.fontSize = 18;
        this.contents.outlineColor = "rgba(255, 255, 255, 0.35)";
        this.contents.textColor = "#8c7f6c";
        this.drawText(
            label,
            0,
            this.contents.height - 34,
            this.contents.width,
            "right"
        );
    };

    Window_Monologue.prototype.createPromptSprite = function() {
        const bitmap = new Bitmap(18, 18);
        for (let row = 0; row < 6; row++) {
            bitmap.fillRect(9 - row, 4 + row, row * 2 + 1, 1, "#d8d0c0");
        }
        const sprite = new Sprite(bitmap);
        sprite.x = this.width - 44;
        sprite.y = this.height - 40;
        sprite.opacity = 200;
        sprite.visible = false;
        this.addChild(sprite);
        this._promptSprite = sprite;
    };

    Window_Monologue.prototype.updatePrompt = function() {
        if (!this._promptSprite) return;
        if (this._typing || !this.isOpen()) {
            this._promptSprite.visible = false;
        } else {
            this._promptSprite.visible = Math.floor(this._promptFrames / 30) % 2 === 0;
        }
    };

    Window_Monologue.prototype.isTyping = function() {
        return this._typing;
    };

    Window_Monologue.prototype.finishTyping = function() {
        if (!this._typing) return;
        this._typing = false;
        this._index = this._text.length;
        this._drawnIndex = -1;
        this.updatePrompt();
    };

    //-------------------------------------------------------------------------
    // Scene_Monologue
    //-------------------------------------------------------------------------

    function Scene_Monologue() {
        this.initialize(...arguments);
    }

    Scene_Monologue.prototype = Object.create(Scene_Base.prototype);
    Scene_Monologue.prototype.constructor = Scene_Monologue;

    Scene_Monologue.prototype.create = function() {
        Scene_Base.prototype.create.call(this);
        this._pending = $gameMonologue.takePending();
        this._closing = false;
        this._inputDelay = 12;
        if (!this._pending) return;
        this._background = new Sprite(ImageManager.loadPicture(CFG.background));
        this._background.x = 0;
        this._background.y = 0;
        this.addChild(this._background);
        this.createWindowLayer();
        const rect = new Rectangle(
            CFG.windowX,
            CFG.windowY,
            CFG.windowWidth,
            CFG.windowHeight
        );
        this._window = new Window_Monologue(rect, this._pending);
        this.addWindow(this._window);
        this.startFadeIn(20, false);
    };

    Scene_Monologue.prototype.start = function() {
        Scene_Base.prototype.start.call(this);
        if (!this._pending) {
            SceneManager.pop();
            return;
        }
        AudioManager.playSe({ name: "Book1", volume: 60, pitch: 100, pan: 0 });
    };

    Scene_Monologue.prototype.update = function() {
        Scene_Base.prototype.update.call(this);
        if (this._closing) {
            if (!this.isFading()) {
                SceneManager.pop();
            }
            return;
        }
        if (!this._window) return;
        if (this._inputDelay > 0) {
            this._inputDelay--;
            return;
        }
        const triggered =
            Input.isTriggered("ok") ||
            Input.isTriggered("cancel") ||
            TouchInput.isTriggered() ||
            TouchInput.isCancelled();
        if (!triggered) return;
        if (this._window.isTyping()) {
            this._window.finishTyping();
        } else {
            this.closeScene();
        }
    };

    Scene_Monologue.prototype.closeScene = function() {
        if (this._closing) return;
        this._closing = true;
        AudioManager.playSe({ name: "Book2", volume: 55, pitch: 100, pan: 0 });
        $gameMonologue.closeNight();
        this.startFadeOut(20, false);
    };

    Scene_Monologue.prototype.terminate = function() {
        Scene_Base.prototype.terminate.call(this);
        if ($gameMonologue.isBusy()) {
            $gameMonologue.closeNight();
        }
    };

    //-------------------------------------------------------------------------
    // Window_MonologueList
    //-------------------------------------------------------------------------

    function Window_MonologueList() {
        this.initialize(...arguments);
    }

    Window_MonologueList.prototype = Object.create(Window_Command.prototype);
    Window_MonologueList.prototype.constructor = Window_MonologueList;

    // 在 makeCommandList 里建项，构造时会自动 refresh；
    // 若在 addCommand 后再调 Window_Command.refresh，会先清空列表。
    Window_MonologueList.prototype.makeCommandList = function() {
        for (let night = 1; night <= 5; night++) {
            const read = $gameMonologue.hasRead(night);
            const label = NIGHT_LABELS[night] + (read ? "" : "（未读）");
            this.addCommand(label, "night" + night, read);
        }
    };

    //-------------------------------------------------------------------------
    // Scene_MonologueList
    //-------------------------------------------------------------------------

    function Scene_MonologueList() {
        this.initialize(...arguments);
    }

    Scene_MonologueList.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_MonologueList.prototype.constructor = Scene_MonologueList;

    Scene_MonologueList.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        const rect = new Rectangle(
            (Graphics.boxWidth - 480) / 2,
            (Graphics.boxHeight - 264) / 2,
            480,
            264
        );
        this._listWindow = new Window_MonologueList(rect);
        this._listWindow.setHandler("ok", this.onNightOk.bind(this));
        this._listWindow.setHandler("cancel", this.popScene.bind(this));
        this.addWindow(this._listWindow);
        this._listWindow.activate();
        this._listWindow.select(0);
    };

    Scene_MonologueList.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);
        if (
            this._listWindow &&
            !this._listWindow.active &&
            SceneManager._scene === this
        ) {
            this._listWindow.activate();
        }
    };

    Scene_MonologueList.prototype.onNightOk = function() {
        const symbol = this._listWindow.currentSymbol();
        if (!symbol || symbol.indexOf("night") !== 0) return;
        const night = Number(symbol.replace("night", ""));
        if (!night || !$gameMonologue.hasRead(night)) return;
        if ($gameMonologue.openNight(night, 1, { fromMenu: true })) {
            this._listWindow.deactivate();
        }
    };

    //-------------------------------------------------------------------------
    // 菜单入口
    //-------------------------------------------------------------------------

    const _Window_MenuCommand_addOriginalCommands =
        Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function() {
        _Window_MenuCommand_addOriginalCommands.call(this);
        if (
            CFG.enableMenuReplay &&
            window.$gameMonologue &&
            $gameMonologue.hasAnyRead()
        ) {
            this.addCommand(CFG.menuText, "xueerMonologue", true);
        }
    };

    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler(
            "xueerMonologue",
            this.commandXueErMonologue.bind(this)
        );
    };

    Scene_Menu.prototype.commandXueErMonologue = function() {
        SceneManager.push(Scene_MonologueList);
    };

    //-------------------------------------------------------------------------
    // 生命周期与钩子
    //-------------------------------------------------------------------------

    const _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.apply(this, arguments);
        window.$gameMonologue = new Game_Monologue();
    };

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === "XueErMonologue") {
            if (window.$gameMonologue && window.$gameMonologue.isBusy()) {
                return true;
            }
            this._waitMode = "";
            return false;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    PluginManager.registerCommand(PLUGIN_NAME, "night", function(args) {
        const night = Number(args.night) || 1;
        const variant = Number(args.variant) || 1;
        const customText = String(args.text || "").replace(/\\n/g, "\n");
        if (
            $gameMonologue.openNight(night, variant, {
                text: customText
            })
        ) {
            this.setWaitMode("XueErMonologue");
        }
    });

    PluginManager.registerCommand(PLUGIN_NAME, "menu", function() {
        $gameMonologue.openMenu();
    });

    PluginManager.registerCommand(PLUGIN_NAME, "get", function() {
        for (let night = 1; night <= 5; night++) {
            console.log(
                `[XueEr_Monologue] ${NIGHT_LABELS[night]} 已读 = ${$gameMonologue.hasRead(night)}`
            );
        }
    });
})();
