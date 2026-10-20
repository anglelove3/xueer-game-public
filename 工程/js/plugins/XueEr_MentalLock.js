/*:
 * @plugindesc 心锁闪回：12 段记忆的统一演出。播放图片、去色、恢复 BGM，并记录心锁计数。
 * @author 雪儿项目
 *
 * @help
 * 设计师用法（事件指令 → 3 插件命令）：
 *   MemLock play id=1
 *   MemLock play id=7 images=Memory_7_1,Memory_7_2
 *   MemLock play id=12 silent=true images=Memory_12
 *   MemLock count
 *   MemLock reset     （仅开发自检用）
 *
 * 规则：
 *   - 每段只播放一次。播放结束后 S21–S32 对应开关打开，V18 心锁计数 +1。
 *   - 若该段开关已打开，命令直接跳过，不会重复播放。
 *   - 插件命令会阻塞事件，直到闪回与 180 帧消化时间结束。
 *   - silent=true 时：不播 SE、不抖屏、不去色、不显示记忆边框，只安静地显示图片。
 *     第 12 段「空房间」使用这个模式。
 *
 * 素材：
 *   - img/pictures/记忆底框_4x3.png（Windows 文件名不能含冒号，故用 4x3）
 *   - img/pictures/<Image Pattern>，默认 Memory_%1_%2
 *
 * @param Frame Picture
 * @text 记忆边框图片
 * @default 记忆底框_4x3
 *
 * @param Image Pattern
 * @text 图片命名规则
 * @desc %1 = 段号，%2 = 段内序号。
 * @default Memory_%1_%2
 *
 * @param Images Per Segment
 * @text 每段默认图片数
 * @type number
 * @min 1
 * @default 1
 *
 * @param Fade In Frames
 * @text 进入闪回帧数
 * @type number
 * @min 0
 * @default 60
 *
 * @param Image Fade Frames
 * @text 图片淡入淡出帧数
 * @type number
 * @min 0
 * @default 30
 *
 * @param Image Hold Frames
 * @text 单张图片停留帧数
 * @type number
 * @min 0
 * @default 120
 *
 * @param Fade Out Frames
 * @text 退出闪回帧数
 * @type number
 * @min 0
 * @default 60
 *
 * @param Recovery Frames
 * @text 收尾消化帧数
 * @type number
 * @min 0
 * @default 180
 *
 * @param Tint
 * @text 闪回去色 Tint
 * @desc 格式 R,G,B,Gray。
 * @default 0,0,0,180
 *
 * @param SE Name
 * @text 嗡鸣音效
 * @desc 留空则不播。默认使用音效库的 Darkness2。
 * @default Darkness2
 *
 * @param SE Volume
 * @text 音效音量
 * @type number
 * @min 0
 * @max 100
 * @default 40
 *
 * @param SE Pitch
 * @text 音效音高
 * @type number
 * @min 50
 * @max 200
 * @default 70
 *
 * @param Shake Power
 * @text 抖屏强度
 * @type number
 * @min 0
 * @default 3
 *
 * @param Shake Speed
 * @text 抖屏速度
 * @type number
 * @min 1
 * @default 5
 *
 * @param Shake Duration
 * @text 抖屏帧数
 * @type number
 * @min 0
 * @default 30
 *
 * @param BGM Fade Seconds
 * @text BGM 淡出秒数
 * @type number
 * @default 1.2
 *
 * @command play
 * @text 播放心锁闪回
 * @desc 播放指定段号的记忆。已播放过的段会跳过。
 *
 * @arg id
 * @text 段号
 * @type number
 * @min 1
 * @max 12
 * @default 1
 *
 * @arg images
 * @text 图片列表
 * @desc 逗号分隔的图片名（不含扩展名）。留空则按 Image Pattern 自动生成。
 * @default
 *
 * @arg silent
 * @text 安静模式
 * @desc 不播 SE、不抖屏、不去色。第 12 段使用。
 * @type boolean
 * @default false
 *
 * @command count
 * @text 查看心锁计数（控制台）
 * @desc 输出当前 V18 心锁计数，仅开发用。
 *
 * @command reset
 * @text 重置心锁（仅开发）
 * @desc 将 V18 归零并关闭 S21–S32。正式游戏不要使用。
 */
(() => {
    "use strict";

    const PLUGIN_NAME = "XueEr_MentalLock";
    const P = PluginManager.parameters(PLUGIN_NAME);
    const num = (value, fallback) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    };
    // 本作内核中 $gameScreen 的色调是普通数组（没有 Tone 类）。
    const parseTone = text => {
        const parts = String(text || "0,0,0,180")
            .split(",")
            .map(Number);
        return [parts[0] || 0, parts[1] || 0, parts[2] || 0, parts[3] || 0];
    };

    const CFG = {
        framePicture: P["Frame Picture"] || "记忆底框_4x3",
        imagePattern: P["Image Pattern"] || "Memory_%1_%2",
        imagesPerSegment: Math.max(1, num(P["Images Per Segment"], 1)),
        fadeIn: Math.max(0, num(P["Fade In Frames"], 60)),
        imageFade: Math.max(0, num(P["Image Fade Frames"], 30)),
        imageHold: Math.max(0, num(P["Image Hold Frames"], 120)),
        fadeOut: Math.max(0, num(P["Fade Out Frames"], 60)),
        recovery: Math.max(0, num(P["Recovery Frames"], 180)),
        tint: parseTone(P["Tint"]),
        seName: P["SE Name"] || "Darkness2",
        seVolume: Math.min(100, Math.max(0, num(P["SE Volume"], 40))),
        sePitch: Math.min(200, Math.max(50, num(P["SE Pitch"], 70))),
        shakePower: Math.max(0, num(P["Shake Power"], 3)),
        shakeSpeed: Math.max(1, num(P["Shake Speed"], 5)),
        shakeDuration: Math.max(0, num(P["Shake Duration"], 30)),
        bgmFadeSeconds: Math.max(0, num(P["BGM Fade Seconds"], 1.2))
    };

    const FRAME_PICTURE_ID = 90;
    const MEMORY_PICTURE_ID = 91;

    //-------------------------------------------------------------------------
    // Game_MentalLock
    //-------------------------------------------------------------------------

    function Game_MentalLock() {
        this.initialize(...arguments);
    }

    Game_MentalLock.prototype.initialize = function() {
        this._busy = false;
        this._id = 0;
        this._silent = false;
        this._steps = [];
        this._frame = 0;
        this._endFrame = 0;
        this._finished = false;
        this._savedTone = null;
        this._savedBgm = null;
    };

    Game_MentalLock.prototype.isBusy = function() {
        return this._busy;
    };

    Game_MentalLock.prototype.makeDefaultImages = function(id) {
        const images = [];
        for (let i = 1; i <= CFG.imagesPerSegment; i++) {
            images.push(
                CFG.imagePattern.replace(/%1/g, String(id)).replace(/%2/g, String(i))
            );
        }
        return images;
    };

    Game_MentalLock.prototype.play = function(id, options) {
        id = Number(id);
        options = options || {};
        if (!(id >= 1 && id <= 12)) {
            console.warn("[XueEr_MentalLock] 段号必须在 1–12 之间：", id);
            return false;
        }
        if (this._busy) {
            console.warn("[XueEr_MentalLock] 已有闪回正在播放，忽略本次请求。");
            return false;
        }
        if ($gameSwitches.value(20 + id)) {
            console.warn(`[XueEr_MentalLock] 第 ${id} 段已经播放过，跳过。`);
            return false;
        }

        const images = Array.isArray(options.images) && options.images.length
            ? options.images
            : this.makeDefaultImages(id);
        this._id = id;
        this._silent = !!options.silent;
        this._busy = true;
        this._finished = false;
        this._frame = -1;
        this._steps = [];
        this._savedTone = $gameScreen.tone().clone();
        this._savedBgm = AudioManager.saveBgm();

        const cx = Graphics.boxWidth / 2;
        const cy = Graphics.boxHeight / 2;
        const at = (frame, fn) => this._steps.push({ frame: Math.max(0, frame), fn });
        let t = 0;

        if (!this._silent) {
            at(0, () => {
                if (this._savedBgm && this._savedBgm.name && CFG.bgmFadeSeconds > 0) {
                    AudioManager.fadeOutBgm(CFG.bgmFadeSeconds);
                }
                if (CFG.seName) {
                    AudioManager.playSe({
                        name: CFG.seName,
                        volume: CFG.seVolume,
                        pitch: CFG.sePitch,
                        pan: 0
                    });
                }
                if (CFG.shakePower > 0 && CFG.shakeDuration > 0) {
                    $gameScreen.startShake(
                        CFG.shakePower,
                        CFG.shakeSpeed,
                        CFG.shakeDuration
                    );
                }
                $gameScreen.startTint(CFG.tint, CFG.fadeIn);
                $gameScreen.showPicture(
                    FRAME_PICTURE_ID,
                    CFG.framePicture,
                    1,
                    cx,
                    cy,
                    100,
                    100,
                    0,
                    0
                );
                $gameScreen.movePicture(
                    FRAME_PICTURE_ID,
                    1,
                    cx,
                    cy,
                    100,
                    100,
                    255,
                    0,
                    CFG.fadeIn
                );
            });
            t = CFG.fadeIn;
        }

        for (const imageName of images) {
            at(t, () => {
                $gameScreen.showPicture(
                    MEMORY_PICTURE_ID,
                    imageName,
                    1,
                    cx,
                    cy,
                    100,
                    100,
                    this._silent ? 255 : 0,
                    0
                );
                if (!this._silent) {
                    $gameScreen.movePicture(
                        MEMORY_PICTURE_ID,
                        1,
                        cx,
                        cy,
                        100,
                        100,
                        255,
                        0,
                        CFG.imageFade
                    );
                }
            });
            if (this._silent) {
                t += CFG.imageHold;
            } else {
                t += CFG.imageFade + CFG.imageHold;
                at(t, () => {
                    $gameScreen.movePicture(
                        MEMORY_PICTURE_ID,
                        1,
                        cx,
                        cy,
                        100,
                        100,
                        0,
                        0,
                        CFG.imageFade
                    );
                });
                t += CFG.imageFade;
            }
            at(t, () => $gameScreen.erasePicture(MEMORY_PICTURE_ID));
            t += 10;
        }

        if (!this._silent) {
            at(t, () => {
                $gameScreen.startTint(this._savedTone, CFG.fadeOut);
                $gameScreen.movePicture(
                    FRAME_PICTURE_ID,
                    1,
                    cx,
                    cy,
                    100,
                    100,
                    0,
                    0,
                    CFG.fadeOut
                );
            });
            t += CFG.fadeOut;
            at(t, () => $gameScreen.erasePicture(FRAME_PICTURE_ID));
        }

        at(t, () => this.finishVisuals());
        this._endFrame = t + CFG.recovery;
        this._steps.sort((a, b) => a.frame - b.frame);
        this.update();
        return true;
    };

    Game_MentalLock.prototype.finishVisuals = function() {
        if (this._finished) return;
        this._finished = true;
        if (!this._silent) {
            $gameScreen.startTint(this._savedTone, CFG.fadeOut);
            if (this._savedBgm && this._savedBgm.name) {
                AudioManager.replayBgm(this._savedBgm);
            }
        }
        $gameVariables.setValue(
            18,
            Math.min(12, Number($gameVariables.value(18) || 0) + 1)
        );
        $gameSwitches.setValue(20 + this._id, true);
        console.log(
            `[XueEr_MentalLock] 第 ${this._id} 段完成，V18 = ${$gameVariables.value(18)}`
        );
    };

    Game_MentalLock.prototype.update = function() {
        if (!this._busy) return;
        this._frame++;
        while (this._steps.length && this._steps[0].frame <= this._frame) {
            const step = this._steps.shift();
            try {
                step.fn();
            } catch (error) {
                console.error("[XueEr_MentalLock] 时间线步骤出错：", error);
            }
        }
        if (this._frame >= this._endFrame) {
            this._busy = false;
            this._steps = [];
        }
    };

    Game_MentalLock.prototype.count = function() {
        return Number($gameVariables.value(18) || 0);
    };

    Game_MentalLock.prototype.reset = function() {
        $gameVariables.setValue(18, 0);
        for (let id = 1; id <= 12; id++) {
            $gameSwitches.setValue(20 + id, false);
        }
        console.log("[XueEr_MentalLock] 已重置 V18 与 S21–S32。");
    };

    //-------------------------------------------------------------------------
    // 生命周期与钩子
    //-------------------------------------------------------------------------

    const _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.apply(this, arguments);
        window.$gameMentalLock = new Game_MentalLock();
    };

    const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function() {
        if (this._waitMode === "XueErMentalLock") {
            if (window.$gameMentalLock && window.$gameMentalLock.isBusy()) {
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
        if (window.$gameMentalLock) {
            window.$gameMentalLock.update();
        }
    };

    PluginManager.registerCommand(PLUGIN_NAME, "play", function(args) {
        const images = String(args.images || "")
            .split(",")
            .map(name => name.trim())
            .filter(Boolean);
        const silent = String(args.silent) === "true";
        if ($gameMentalLock.play(Number(args.id), { images: images, silent: silent })) {
            this.setWaitMode("XueErMentalLock");
        }
    });

    PluginManager.registerCommand(PLUGIN_NAME, "count", function() {
        const count = $gameMentalLock.count();
        console.log(`[XueEr_MentalLock] 心锁计数 V18 = ${count} / 12`);
    });

    PluginManager.registerCommand(PLUGIN_NAME, "reset", function() {
        $gameMentalLock.reset();
    });
})();
