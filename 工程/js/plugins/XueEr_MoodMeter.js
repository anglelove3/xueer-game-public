/*:
 * @plugindesc 情绪值 + 心象滤镜 + 右上角天气图标。玩家永远看不到数字。
 * @author 雪儿项目
 *
 * @help
 * 事件指令：
 *   Mood set value=90
 *   Mood add value=-15
 *   Mood refresh
 *   Mood get            （仅开发用，输出到控制台）
 *
 * 规则：
 *   - V20 情绪值 0–100，自动驱动屏幕 Tint 与右上角天气图标。
 *   - 只有跨档位时才改变 Tint，避免每帧调用。
 *   - 新游戏默认情绪值来自插件参数（默认 55）。
 *   - 剧情强制改值后，最迟 30 帧会自动更新；需要立刻更新时用 Mood refresh。
 *
 * @param Mood Variable
 * @text 情绪值变量
 * @type number
 * @min 1
 * @default 20
 *
 * @param Initial Mood
 * @text 新游戏初始情绪值
 * @type number
 * @min 0
 * @max 100
 * @default 55
 *
 * @param Initialize On New Game
 * @text 新游戏自动初始化
 * @type boolean
 * @default true
 *
 * @param Check Interval
 * @text 检查间隔（帧）
 * @type number
 * @min 1
 * @default 30
 *
 * @param Icon X Offset
 * @text 图标距右边距
 * @type number
 * @default 16
 *
 * @param Icon Y
 * @text 图标 Y 坐标
 * @type number
 * @default 16
 *
 * @param Icon Opacity
 * @text 图标透明度
 * @type number
 * @min 0
 * @max 255
 * @default 220
 *
 * @param Hidden Switch
 * @text 隐藏图标的开关
 * @desc 此开关打开时隐藏右上角图标（尾声与制作名单使用）。设为 0 表示不启用。
 * @type switch
 * @default 48
 *
 * @param Sun Icon
 * @text 晴图标
 * @default MoodIcon_晴
 *
 * @param Cloudy Icon
 * @text 多云图标
 * @default MoodIcon_多云
 *
 * @param Overcast Icon
 * @text 阴图标
 * @default MoodIcon_阴
 *
 * @param Rain Icon
 * @text 雨图标
 * @default MoodIcon_雨
 *
 * @param Storm Icon
 * @text 雷图标
 * @default MoodIcon_雷
 *
 * @command set
 * @text 设置情绪值
 * @desc 直接设为指定值（0–100），跨档时 60 帧过渡。
 *
 * @arg value
 * @text 数值
 * @type number
 * @min 0
 * @max 100
 * @default 55
 *
 * @command add
 * @text 增减情绪值
 * @desc 在当前值上增减，自动限制在 0–100。
 *
 * @arg value
 * @text 增减量
 * @type number
 * @default -5
 *
 * @command refresh
 * @text 立即刷新滤镜与图标
 * @desc 剧情用 Control Variables 改值后调用。
 *
 * @command get
 * @text 查看情绪值（控制台）
 * @desc 仅开发用，不向玩家显示数字。
 */
(() => {
    "use strict";

    const PLUGIN_NAME = "XueEr_MoodMeter";
    const P = PluginManager.parameters(PLUGIN_NAME);
    const num = (value, fallback) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    };
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    const VARIABLE_ID = Math.max(1, num(P["Mood Variable"], 20));
    const INITIAL_MOOD = clamp(num(P["Initial Mood"], 55), 0, 100);
    const INITIALIZE_ON_NEW_GAME = String(P["Initialize On New Game"]) !== "false";
    const CHECK_INTERVAL = Math.max(1, num(P["Check Interval"], 30));
    const ICON_X_OFFSET = Math.max(0, num(P["Icon X Offset"], 16));
    const ICON_Y = Math.max(0, num(P["Icon Y"], 16));
    const ICON_OPACITY = clamp(num(P["Icon Opacity"], 220), 0, 255);
    const ICON_WIDTH = 32;
    // MZ 的菜单按钮固定在最右上角（48px + 4px 边距），
    // 情绪图标必须让位，否则会被完全盖住。
    const MENU_BUTTON_RESERVE = 52;
    const HIDDEN_SWITCH_ID = Math.max(0, num(P["Hidden Switch"], 48));
    const ICON_FADE_SPEED = 16;

    // 顺序从低到高：0–19 雷，20–39 雨，40–59 阴，60–79 多云，80–100 晴。
    const BANDS = [
        {
            max: 19,
            icon: P["Storm Icon"] || "MoodIcon_雷",
            tone: [-110, -110, -100, 160],
            name: "雷"
        },
        {
            max: 39,
            icon: P["Rain Icon"] || "MoodIcon_雨",
            tone: [-75, -75, -60, 120],
            name: "雨"
        },
        {
            max: 59,
            icon: P["Overcast Icon"] || "MoodIcon_阴",
            tone: [-45, -45, -35, 60],
            name: "阴"
        },
        {
            max: 79,
            icon: P["Cloudy Icon"] || "MoodIcon_多云",
            tone: [-15, -15, -10, 20],
            name: "多云"
        },
        {
            max: 100,
            icon: P["Sun Icon"] || "MoodIcon_晴",
            tone: [0, 0, 0, 0],
            name: "晴"
        }
    ];

    //-------------------------------------------------------------------------
    // Game_MoodMeter
    //-------------------------------------------------------------------------

    function Game_MoodMeter() {
        this.initialize(...arguments);
    }

    Game_MoodMeter.prototype.initialize = function() {
        this._lastBand = null;
        this._pendingBand = null;
        this._frame = 0;
        this._icon = null;
        this._scene = null;
        this._lastValue = null;
    };

    Game_MoodMeter.prototype.value = function() {
        const raw = $gameVariables.value(VARIABLE_ID);
        return clamp(num(raw, 0), 0, 100);
    };

    Game_MoodMeter.prototype.bandIndexFor = function(value) {
        for (let i = 0; i < BANDS.length; i++) {
            if (value <= BANDS[i].max) return i;
        }
        return BANDS.length - 1;
    };

    Game_MoodMeter.prototype.bandIndex = function() {
        return this.bandIndexFor(this.value());
    };

    Game_MoodMeter.prototype.bandName = function() {
        return BANDS[this.bandIndex()].name;
    };

    Game_MoodMeter.prototype.set = function(value) {
        const next = clamp(num(value, INITIAL_MOOD), 0, 100);
        $gameVariables.setValue(VARIABLE_ID, next);
        if (next !== this._lastValue) {
            this._lastValue = next;
            this.sync(true);
        }
    };

    Game_MoodMeter.prototype.add = function(delta) {
        this.set(this.value() + num(delta, 0));
    };

    Game_MoodMeter.prototype.sync = function(force) {
        if (window.$gameMentalLock && window.$gameMentalLock.isBusy()) {
            return;
        }
        const band = this.bandIndex();
        if (force || band !== this._lastBand) {
            this.applyBand(band, 60);
        }
    };

    Game_MoodMeter.prototype.applyBand = function(band, duration) {
        if (window.$gameMentalLock && window.$gameMentalLock.isBusy()) {
            this._pendingBand = band;
            return;
        }
        const tone = BANDS[band].tone;
        $gameScreen.startTint(tone.clone(), duration);
        this._lastBand = band;
        this._pendingBand = null;
        this.updateIcon();
    };

    Game_MoodMeter.prototype.shouldHideIcon = function() {
        if (HIDDEN_SWITCH_ID > 0 && $gameSwitches.value(HIDDEN_SWITCH_ID)) {
            return true;
        }
        return !!(window.$gameMentalLock && window.$gameMentalLock.isBusy());
    };

    Game_MoodMeter.prototype.createIcon = function(scene) {
        if (!scene || !scene._spriteset) return;
        const sprite = new Sprite();
        sprite.bitmap = ImageManager.loadSystem(BANDS[this.bandIndex()].icon);
        const menuReserve = scene._menuButton ? MENU_BUTTON_RESERVE : 0;
        sprite.x = Graphics.boxWidth - ICON_WIDTH - ICON_X_OFFSET - menuReserve;
        sprite.y = ICON_Y;
        // 进入地图时直接落到目标状态，避免尾声/回忆中闪一下。
        sprite.opacity = this.shouldHideIcon() ? 0 : ICON_OPACITY;
        sprite.visible = sprite.opacity > 0;
        scene._spriteset.addChild(sprite);
        this._icon = sprite;
    };

    Game_MoodMeter.prototype.updateIcon = function() {
        if (this._icon) {
            this._icon.bitmap = ImageManager.loadSystem(BANDS[this.bandIndex()].icon);
        }
    };

    Game_MoodMeter.prototype.updateIconVisibility = function() {
        if (!this._icon) return;
        const target = this.shouldHideIcon() ? 0 : ICON_OPACITY;
        if (this._icon.opacity === target) {
            this._icon.visible = target > 0;
            return;
        }
        if (this._icon.opacity < target) {
            this._icon.opacity = Math.min(target, this._icon.opacity + ICON_FADE_SPEED);
        } else {
            this._icon.opacity = Math.max(target, this._icon.opacity - ICON_FADE_SPEED);
        }
        this._icon.visible = this._icon.opacity > 0;
    };

    Game_MoodMeter.prototype.onMapStart = function(scene) {
        this._scene = scene;
        this._icon = null;
        this._frame = 0;
        this._lastValue = this.value();
        this.createIcon(scene);
        if (this._lastBand === null) {
            this.applyBand(this.bandIndex(), 0);
        } else {
            this.updateIcon();
        }
    };

    Game_MoodMeter.prototype.updateMenuButton = function() {
        const scene = this._scene || SceneManager._scene;
        if (!scene || !scene._menuButton) return;
        // Scene_Map.updateMenuButton 每帧会恢复按钮，这里在它之后统一收口。
        if (this.shouldHideIcon()) {
            scene._menuButton.visible = false;
        }
    };

    Game_MoodMeter.prototype.tick = function() {
        this._frame++;
        this.updateIconVisibility();
        this.updateMenuButton();
        if (this._frame % CHECK_INTERVAL === 0) {
            this._lastValue = this.value();
            this.sync(false);
        }
    };

    //-------------------------------------------------------------------------
    // 生命周期与钩子
    //-------------------------------------------------------------------------

    const _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.apply(this, arguments);
        window.$gameMoodMeter = new Game_MoodMeter();
    };

    const _DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        _DataManager_setupNewGame.apply(this, arguments);
        if (INITIALIZE_ON_NEW_GAME) {
            $gameVariables.setValue(VARIABLE_ID, INITIAL_MOOD);
        }
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        if (window.$gameMoodMeter) {
            window.$gameMoodMeter.onMapStart(this);
        }
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        if (window.$gameMoodMeter) {
            window.$gameMoodMeter.tick();
        }
    };

    PluginManager.registerCommand(PLUGIN_NAME, "set", function(args) {
        $gameMoodMeter.set(args.value);
    });

    PluginManager.registerCommand(PLUGIN_NAME, "add", function(args) {
        $gameMoodMeter.add(args.value);
    });

    PluginManager.registerCommand(PLUGIN_NAME, "refresh", function() {
        $gameMoodMeter.sync(true);
    });

    PluginManager.registerCommand(PLUGIN_NAME, "get", function() {
        console.log(
            `[XueEr_MoodMeter] V${VARIABLE_ID} = ${$gameMoodMeter.value()}（${$gameMoodMeter.bandName()}）`
        );
    });
})();
