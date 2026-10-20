/*:
 * @plugindesc 心魔对话：用「反驳 / 认同 / 沉默」替代战斗，不显示胜利或失败。
 * @author 雪儿项目
 *
 * @help
 * 事件指令：
 *   MindTalk start strength=6 set=心魔
 *   MindTalk get          （仅开发用）
 *
 * 规则：
 *   - 最多 5 轮。强度归零 / 情绪归零 / 5 轮到顶都会收尾。
 *   - 反驳：强度 -2，情绪 -5
 *   - 认同：强度 +1，情绪 +8
 *   - 沉默：不变化，真的等 120 帧
 *   - 收尾永远不出现「胜利 / 失败」。打赢也只显示「她撑住了今天。」
 *   - 结束一律情绪 -1，打赢也扣。
 *
 * set 可用：心魔 / 大眼虫 / 狼人 / 变异人 / 邪零巫师 / boss1 / 拂晓教信徒。
 * 未填时使用「心魔」。
 *
 * 注意：本插件是地图事件用的「对话战」，不会进入 Scene_Battle，
 * 因此 Troops.json 里的战斗设置不会被触发。把心魔事件接到地图上即可。
 *
 * @param Mood Variable
 * @text 情绪值变量
 * @desc 没有安装 XueEr_MoodMeter 时的后备变量。
 * @type number
 * @min 1
 * @default 20
 *
 * @param Default Strength
 * @text 默认心魔强度
 * @type number
 * @min 1
 * @default 6
 *
 * @param Max Rounds
 * @text 最大轮数
 * @type number
 * @min 1
 * @default 5
 *
 * @param Win Text
 * @text 撑住时的收尾
 * @default 她撑住了今天。
 *
 * @param Cap Text
 * @text 五轮到顶的收尾
 * @default 今天先到这儿。
 *
 * @param Silence Frames
 * @text 沉默等待帧数
 * @type number
 * @min 0
 * @default 120
 *
 * @param Breath Frames
 * @text 其他选择后的停顿帧数
 * @type number
 * @min 0
 * @default 30
 *
 * @param BGM Fade Seconds
 * @text 战斗对话 BGM 淡出秒数
 * @type number
 * @default 1.2
 *
 * @command start
 * @text 开始心魔对话
 * @desc 进入对话战。插件会阻塞事件直到收尾文本被确认。
 *
 * @arg strength
 * @text 心魔强度
 * @type number
 * @min 1
 * @default 6
 *
 * @arg set
 * @text 台词组
 * @desc 心魔 / 大眼虫 / 狼人 / 变异人 / 邪零巫师 / boss1 / 拂晓教信徒
 * @default 心魔
 *
 * @command get
 * @text 查看对话战状态（控制台）
 * @desc 仅开发用。
 */
(() => {
    "use strict";

    const PLUGIN_NAME = "XueEr_MindTalk";
    const P = PluginManager.parameters(PLUGIN_NAME);
    const num = (value, fallback) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    };
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    const CFG = {
        moodVariable: Math.max(1, num(P["Mood Variable"], 20)),
        defaultStrength: Math.max(1, num(P["Default Strength"], 6)),
        maxRounds: Math.max(1, num(P["Max Rounds"], 5)),
        winText: P["Win Text"] || "她撑住了今天。",
        capText: P["Cap Text"] || "今天先到这儿。",
        silenceFrames: Math.max(0, num(P["Silence Frames"], 120)),
        breathFrames: Math.max(0, num(P["Breath Frames"], 30)),
        bgmFadeSeconds: Math.max(0, num(P["BGM Fade Seconds"], 1.2))
    };

    const LINE_SETS = {
        心魔: [
            "你不值得被爱。",
            "你拖累了所有人。",
            "他们只是客气。",
            "你笑的时候在演。"
        ],
        大眼虫: ["所有人都在看你。", "他们在议论你。"],
        狼人: ["你早就烂掉了。", "别装了。"],
        变异人: ["你以前不是这样的。"],
        邪零巫师: ["你连自己都骗。", "你知道这是假的。"],
        boss1: ["你以为你能赢？", "你赢了，然后呢？"],
        拂晓教信徒: ["信了就好了。", "你为什么还不信。"]
    };

    const CHOICES = ["反驳", "认同", "沉默"];

    //-------------------------------------------------------------------------
    // Game_MindTalk
    //-------------------------------------------------------------------------

    function Game_MindTalk() {
        this.initialize(...arguments);
    }

    Game_MindTalk.prototype.initialize = function() {
        this._busy = false;
        this._strength = 0;
        this._round = 0;
        this._phase = "idle";
        this._delay = 0;
        this._closeFrames = 0;
        this._setName = "心魔";
        this._lastLine = "";
        this._savedBgm = null;
        this._savedBackground = 0;
        this._savedPosition = 2;
    };

    Game_MindTalk.prototype.isBusy = function() {
        return this._busy;
    };

    Game_MindTalk.prototype.start = function(strength, setName) {
        if (this._busy) {
            console.warn("[XueEr_MindTalk] 已有一场心魔对话在进行。");
            return false;
        }
        if ($gameMessage.isBusy()) {
            console.warn("[XueEr_MindTalk] 消息窗口还在使用，无法开始心魔对话。");
            return false;
        }
        this._busy = true;
        this._strength = Math.max(1, num(strength, CFG.defaultStrength));
        this._round = 0;
        this._phase = "round";
        this._delay = 0;
        this._closeFrames = 0;
        this._lastLine = "";
        this._setName = LINE_SETS[setName] ? setName : "心魔";
        this._savedBgm = AudioManager.saveBgm();
        this._savedBackground = $gameMessage.background();
        this._savedPosition = $gameMessage.positionType();
        if (this._savedBgm && this._savedBgm.name && CFG.bgmFadeSeconds > 0) {
            AudioManager.fadeOutBgm(CFG.bgmFadeSeconds);
        }
        console.log(
            `[XueEr_MindTalk] 开始：set=${this._setName}, strength=${this._strength}, mood=${this.mood()}`
        );
        this.nextRound();
        return true;
    };

    Game_MindTalk.prototype.mood = function() {
        if (window.$gameMoodMeter) {
            return $gameMoodMeter.value();
        }
        return clamp(num($gameVariables.value(CFG.moodVariable), 0), 0, 100);
    };

    Game_MindTalk.prototype.changeMood = function(delta) {
        if (window.$gameMoodMeter) {
            $gameMoodMeter.add(delta);
        } else {
            $gameVariables.setValue(
                CFG.moodVariable,
                clamp(this.mood() + delta, 0, 100)
            );
        }
    };

    Game_MindTalk.prototype.pickLine = function() {
        const lines = LINE_SETS[this._setName] || LINE_SETS["心魔"];
        if (lines.length === 1) return lines[0];
        let line = this._lastLine;
        for (let i = 0; i < 8 && line === this._lastLine; i++) {
            line = lines[Math.floor(Math.random() * lines.length)];
        }
        this._lastLine = line;
        return line;
    };

    Game_MindTalk.prototype.nextRound = function() {
        if (!this._busy) return;
        if (this._strength <= 0) {
            this.end(CFG.winText);
            return;
        }
        if (this.mood() <= 0) {
            this.end(CFG.winText);
            return;
        }
        if (this._round >= CFG.maxRounds) {
            this.end(CFG.capText);
            return;
        }
        this._round++;
        this._phase = "choice";
        const line = this.pickLine();
        console.log(
            `[XueEr_MindTalk] 第 ${this._round} 轮：${line}（strength=${this._strength}, mood=${this.mood()}）`
        );
        $gameMessage.clear();
        $gameMessage.setBackground(1);
        $gameMessage.setPositionType(1);
        $gameMessage.add(line);
        $gameMessage.setChoices(CHOICES, 0, 2);
        $gameMessage.setChoiceCallback(n => this.onChoice(n));
    };

    Game_MindTalk.prototype.onChoice = function(index) {
        if (!this._busy || this._phase !== "choice") return;
        let delay = CFG.breathFrames;
        if (index === 0) {
            this._strength -= 2;
            this.changeMood(-5);
        } else if (index === 1) {
            this._strength += 1;
            this.changeMood(8);
        } else {
            delay = CFG.silenceFrames;
        }
        console.log(
            `[XueEr_MindTalk] 选择 ${CHOICES[index] || index}：strength=${this._strength}, mood=${this.mood()}`
        );
        this._phase = "delay";
        this._delay = delay;
    };

    Game_MindTalk.prototype.end = function(text) {
        this._phase = "closing";
        this._closeFrames = 0;
        this._strength = Math.max(0, this._strength);
        console.log(`[XueEr_MindTalk] 收尾：${text}`);
        $gameMessage.clear();
        $gameMessage.setBackground(1);
        $gameMessage.setPositionType(1);
        $gameMessage.add(text);
    };

    Game_MindTalk.prototype.finish = function() {
        if (!this._busy) return;
        this.changeMood(-1);
        if (this._savedBgm && this._savedBgm.name) {
            AudioManager.replayBgm(this._savedBgm);
        }
        $gameMessage.clear();
        $gameMessage.setBackground(this._savedBackground);
        $gameMessage.setPositionType(this._savedPosition);
        this._busy = false;
        this._phase = "idle";
        this._savedBgm = null;
        console.log(
            `[XueEr_MindTalk] 结束：round=${this._round}, mood=${this.mood()}`
        );
    };

    Game_MindTalk.prototype.update = function() {
        if (!this._busy) return;
        if (this._phase === "delay") {
            this._delay--;
            if (this._delay <= 0) {
                this.nextRound();
            }
            return;
        }
        if (this._phase === "closing") {
            if ($gameMessage.isBusy()) {
                this._closeFrames = 0;
                return;
            }
            this._closeFrames++;
            if (this._closeFrames > 30) {
                this.finish();
            }
        }
    };

    //-------------------------------------------------------------------------
    // 生命周期与钩子
    //-------------------------------------------------------------------------

    const _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.apply(this, arguments);
        window.$gameMindTalk = new Game_MindTalk();
    };

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === "XueErMindTalk") {
            if (window.$gameMindTalk && window.$gameMindTalk.isBusy()) {
                return true;
            }
            this._waitMode = "";
            return false;
        }
        return _Game_Interpreter_updateWaitMode.call(this);
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (window.$gameMindTalk) {
            window.$gameMindTalk.update();
        }
    };

    PluginManager.registerCommand(PLUGIN_NAME, "start", function(args) {
        if ($gameMindTalk.start(args.strength, args.set)) {
            this.setWaitMode("XueErMindTalk");
        }
    });

    PluginManager.registerCommand(PLUGIN_NAME, "get", function() {
        console.log(
            `[XueEr_MindTalk] busy=${$gameMindTalk.isBusy()}, strength=${$gameMindTalk._strength}, round=${$gameMindTalk._round}, mood=${$gameMindTalk.mood()}`
        );
    });
})();
