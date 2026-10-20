/*:
 * @plugindesc 标题菜单收束：只保留一套图片命令，并移到左侧。
 * @author 雪儿项目
 *
 * @help
 * 本插件依赖 MOG_TitlePictureCom（必须排在其后加载）。
 *
 * 解决的问题：
 *   MOG 的标题图片命令与引擎默认的 Window_TitleCommand 同时显示，
 *   画面上会出现两套“开始/继续/设置”，且默认窗口的绿藤皮肤
 *   与灰褐摄影标题不协调。
 *
 * 处理方式：
 *   - 默认窗口保留 visible/active（否则键盘无法移动光标），
 *     移出画面并设为完全透明，画面上只看到图片命令。
 *   - 图片命令移到左侧留白区，使用 Command_0..2.png。
 *   - 光标关闭旋转与漂移，改为文字左侧的小圆点。
 *
 * 调整菜单位置时修改下方插件参数即可。
 *
 * @param Menu X
 * @text 菜单左边距
 * @type number
 * @default 66
 *
 * @param Menu Y
 * @text 菜单顶边距
 * @type number
 * @default 418
 *
 * @param Line Spacing
 * @text 行距
 * @type number
 * @default 38
 *
 * @param Cursor X Offset
 * @text 光标横向偏移
 * @type number
 * @default -5
 *
 * @param Cursor Y Offset
 * @text 光标纵向偏移
 * @type number
 * @default 14
 */
(() => {
    "use strict";

    const PLUGIN_NAME = "XueEr_TitlePolish";
    const P = PluginManager.parameters(PLUGIN_NAME);
    const num = (value, fallback) => {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    };

    const MENU_X = num(P["Menu X"], 66);
    const MENU_Y = num(P["Menu Y"], 418);
    const LINE_SPACING = Math.max(1, num(P["Line Spacing"], 38));
    const CURSOR_X = num(P["Cursor X Offset"], -5);
    const CURSOR_Y = num(P["Cursor Y Offset"], 14);

    const CONFIG = () => {
        if (!window.Moghunter) return;
        Moghunter.title_cursorX = CURSOR_X;
        Moghunter.title_cursorY = CURSOR_Y;
        Moghunter.title_cursorSlide = "false";
        Moghunter.title_cursorRot = "false";
        if (Moghunter.title_com_pos) {
            for (let i = 0; i < 3; i++) {
                Moghunter.title_com_pos[i] = `${MENU_X},${MENU_Y + LINE_SPACING * i}`;
            }
        }
    };

    // 光标 org 在 createCursorCommand 时读取，所以先于场景创建写入。
    CONFIG();

    Scene_Title.prototype.applyXueErMenuLayout = function() {
        if (this._com_position) {
            for (let i = 0; i < 3; i++) {
                this._com_position[i] = [MENU_X, MENU_Y + LINE_SPACING * i];
            }
        }
    };

    Scene_Title.prototype.hideNativeTitleWindow = function() {
        if (!this._commandWindow) return;
        // Window_Selectable.isOpenAndActive() 要求 visible=true，
        // 因此不能把窗口设为不可见，只能移出画面并完全透明。
        this._commandWindow.visible = true;
        this._commandWindow.active = true;
        this._commandWindow.x = -Graphics.boxWidth;
        this._commandWindow.y = -Graphics.boxHeight;
        this._commandWindow.opacity = 0;
        this._commandWindow.backOpacity = 0;
        this._commandWindow.contentsOpacity = 0;
    };

    const _Scene_Title_create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function() {
        _Scene_Title_create.call(this);
        CONFIG();
        this.applyXueErMenuLayout();
        this.hideNativeTitleWindow();
    };

    const _Scene_Title_update = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        _Scene_Title_update.call(this);
        if (!this._commandWindow) return;
        if (!this._commandWindow.visible ||
            !this._commandWindow.active ||
            this._commandWindow.x !== -Graphics.boxWidth ||
            this._commandWindow.y !== -Graphics.boxHeight ||
            this._commandWindow.opacity !== 0 ||
            this._commandWindow.contentsOpacity !== 0) {
            this.hideNativeTitleWindow();
        }
    };
})();
