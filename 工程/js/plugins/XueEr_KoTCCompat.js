/*:
 * @plugindesc 修正 KoTC 小地图在切场景时被连带销毁的问题，并保证刷新计时器唯一。
 * @author 雪儿项目
 * @target MZ
 * @help
 * 必须排在「KoTC Minimap Basic」之后加载。
 *
 * 本作的自定义场景（独白回看等）用 SceneManager.push 打开。
 * MZ 在切场景时会销毁旧的 Scene_Map，而 KoTC 把全局小地图精灵挂在地图场景上，
 * 返回地图后它继续操作已被销毁的精灵，进而卡死地图加载。
 *
 * 本补丁做三件事：
 * 1. Scene_Map 终止前先把小地图摘下来，交给下一个地图场景复用。
 * 2. 地图加载时 KoTC 会调用两次 Enable（onMapLoaded 与 setTimeout），这里清掉旧计时器，只保留一个。
 * 3. 若小地图精灵仍被意外销毁，刷新函数直接跳过，不抛异常。
 */
(() => {
    "use strict";

    if (
        typeof KoTCMinimapEnable !== "function" ||
        typeof KoTCUpdateMinimapLocations !== "function" ||
        typeof Scene_Map === "undefined"
    ) {
        console.warn("[XueEr_KoTCCompat] 未找到 KoTC Minimap，补丁未生效。");
        return;
    }

    const system = () => window.$KoTCMinimapSystem;

    // 1) 切出地图前摘下小地图，避免随旧场景一起被销毁。
    const _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        const sys = system();
        const sprite = sys && sys.MainMinimapSprite;
        if (sprite && sprite.parent === this) {
            this.removeChild(sprite);
        }
        _Scene_Map_terminate.call(this);
    };

    // 2) 地图加载时的重复 Enable 去重，并保证只有一个刷新计时器。
    const _KoTCMinimapEnable = KoTCMinimapEnable;
    KoTCMinimapEnable = function() {
        const sys = system();
        if (!sys || !(SceneManager._scene instanceof Scene_Map)) {
            return;
        }
        if (sys.PlayerKoTCMinimapInterval) {
            clearInterval(sys.PlayerKoTCMinimapInterval);
            sys.PlayerKoTCMinimapInterval = null;
        }
        _KoTCMinimapEnable.apply(this, arguments);
    };

    // 3) 兜底：精灵若已被销毁，刷新直接跳过。
    const _KoTCUpdateMinimapLocations = KoTCUpdateMinimapLocations;
    KoTCUpdateMinimapLocations = function() {
        const sys = system();
        if (!sys || !(SceneManager._scene instanceof Scene_Map)) return;
        if (!sys.MainMinimapSprite || sys.MainMinimapSprite._destroyed) return;
        if (!sys.KoTCMinimapPlayerSprite || sys.KoTCMinimapPlayerSprite._destroyed) {
            return;
        }
        return _KoTCUpdateMinimapLocations.apply(this, arguments);
    };
})();
