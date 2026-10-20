//=============================================================================
// Cyclone Engine - Maps
//=============================================================================

/*:
 * @target MZ
 * @plugindesc 地图视差叠加 1.01.01
 *
 * <pluginName:CycloneMaps>
 * @author Hudell
 * @url https://makerdevs.com/plugin/cyclone-maps
 *
 * @help
 * ===========================================================================
 *                                    88
 *                                    88
 *                                    88
 *   ,adPPYba, 8b       d8  ,adPPYba, 88  ,adPPYba,  8b,dPPYba,   ,adPPYba,
 *  a8"     "" `8b     d8' a8"     "" 88 a8"     "8a 88P'   `"8a a8P_____88
 *  8b          `8b   d8'  8b         88 8b       d8 88       88 8PP"""""""
 *  "8a,   ,aa   `8b,d8'   "8a,   ,aa 88 "8a,   ,a8" 88       88 "8b,   ,aa
 *   `"Ybbd8"'     Y88'     `"Ybbd8"' 88  `"YbbdP"'  88       88  `"Ybbd8"'
 *                 d8'
 *                d8'
 * Advanced Map Features                                             by Hudell
 * ===========================================================================
 * Terms of Use
 * ===========================================================================
 * 1. For support, feature requests or bug reports, you may contact me through
 *  any of the following channels (in order of preference):
 *
 *   1.a. Opening an issue on the plugin's GitHub repository:
 *      https://github.com/Hudell/cyclone-engine
 *   1.b. Tagging me on threads on Rpg Maker related Forums, such as:
 *      rpgmakerweb.com (English)
 *      centrorpg.com (Portuguese)
 *      condadobraveheart.com (Portuguese)
 *   1.c. Opening threads on the plugin's itch.io page
 *   1.d. Tagging my user on Rpg Maker related sub-reddits, such as r/rpgmaker
 *
 * 2. Do not send me Direct Messages asking for support or bug reports.
 * You may only send me direct messages when none of the above platforms are
 * appropiate for it, or when you want to share pictures of cute dogs.
 *
 * 3. A special exception is created for patreon users who get access to my
 * priority support discord server.
 *
 * 4. Sending plugin related questions on channels related to any of my other
 * projects (such as my game's Discord server) may result in an immediate ban
 * from such platforms and I may also choose to ignore your future requests.
 *
 * 5. This plugin is released under the Apache License 2.0 (Apache-2.0).
 *
 * 6. You can send me your own changes to this plugin if you wish to see them
 * included in an update, by registering a Pull Request on the plugin's GitHub
 * repository.
 *
 * 7. This plugin is provided as is. While I'll often read feedback and offer
 * updates to my plugins, I am in no obligation to do so.
 *
 * 8. I'm not responsible for anything created with this plugin.
 * ===========================================================================
 * Did you know?
 * Early maps used to have the east side on top. That's the origin of the verb
 * "to orient", which meant putting the orient (east) on its correct position.
 * ===========================================================================
 * Change Log
 * ===========================================================================
 * 2020-08-30 - Version 1.01.00
 *   * Fixed issue with fog opacity not going down
 *   * Removed Cyclone Core Dependency
 *
 *
 * 2020-08-23 - Version 1.00.00
 * ===========================================================================
 * Instructions
 * ===========================================================================
 * You can use this plugin to add overlay images to your maps
 * You can keep the images either on the img/parallaxes folder
 * or (if you set the Organized Folders param to true) on separate
 * folders like this:
 *
 * img/overlays/grounds
 * img/overlays/pars
 * img/overlays/shadows
 * img/overlays/lights
 * img/overlays/fogs
 *
 * All image filenames must end with the number of the map
 *
 * 地图注释标签 :
 *
 * <all> : 显示所有叠加层
 * <ground> : 显示地面图层
 * <par> : 视察叠加
 * <light> : 灯光
 * <shadow> : 阴影
 * <fogName:filename> : 显示指定的雾图像 
 * <fogOpacity:number> : 更改雾的不透明度 (0 to 255)
 * <fogBlend:number> : 更改雾的混合类型
 * <fogDuration:number> : 更改不透明度跟过度持续时间
 * <xMove:number> : 改变雾的水平速度
 * <yMove:number> : 改变雾的垂直速度
 *
 * Go to https://makerdevs.com/plugin/cyclone-maps for more instructions
 *
 * @param Map Change Event Id
 * @desc 选择每次切换地图要调出的公共事件
 * @type common_event
 * @default 0
 *
 * @param Change Tile Size
 *
 * @param Tile Width
 * @parent Change Tile Size
 * @desc 每个图块的宽度
 * @type number
 * @default 48
 *
 * @param Tile Height
 * @parent Change Tile Size
 * @desc 每个图块的高度
 * @type number
 * @default 48
 *
 * @param Tileset Path
 * @parent Change Tile Size
 * @desc 你可以定义加载图块集的备用路径
 * @type string
 * @default img/tilesets/
 *
 * @param Map Settings
 *
 * @param disableAutoShadows
 * @text 禁用自动阴影
 * @parent Map Settings
 * @desc 使游戏停止渲染地图的自动阴影
 * @type boolean
 * @default false
 *
 * @param Overlay
 *
 * @param enableOverlays
 * @text 启用叠加
 * @parent Overlay
 * @desc on启用覆盖功能
 * @type boolean
 * @default false
 *
 * @param disableTilemap
 * @text 禁用瓷砖地图
 * @parent Overlay
 * @desc 如果您的游戏仅仅使用视差映射功能 可以禁用提升性能
 * @type boolean
 * @default false
 *
 * @param Organized Folders
 * @parent Overlay
 * @desc 为每种类型的视差使用不同的文件夹 
 * @type boolean
 * @default false
 *
 * @param Parallax Layer Filename
 * @parent Overlay
 * @desc 视差层文件的基本名称. 必须在末加上 mapId 
 * @default par
 *
 * @param Ground Layer Filename
 * @parent Overlay
 * @desc 地图层文件的基本名称. 必须在末尾加上map id
 * @default ground
 *
 * @param Light Layer Filename
 * @parent Overlay
 * @desc The base name of the files for the light layer. Must have the mapId appended at the end
 * @default light
 *
 * @param Shadow Layer Filename
 * @parent Overlay
 * @desc The base name of the files for the shadow layer. Must have the mapId appended at the end
 * @default shadow
 *
 * @param Light Opacity
 * @parent Overlay
 * @type number
 * @desc 光层的不透明级别
 * @default 185
 *
 * @param Quick Start
 * @parent Overlay
 * @type boolean
 * @desc 如果此参数打开 雾光视差和阴影将开启新游戏.
 * @default true
 *
 * @param Fog Switch ID
 * @parent Overlay
 * @type switch
 * @desc 控制是否应启用雾的开关 
 * @default 0
 *
 * @param Light Switch ID
 * @parent Overlay
 * @type switch
 * @desc 一个开关来控制是否应该启用灯光 
 * @default 0
 *
 * @param Parallax Switch ID
 * @parent Overlay
 * @type switch
 * @desc 控制是否应启用视差的开关
 * @default 0
 *
 * @param Shadow Switch ID
 * @parent Overlay
 * @type switch
 * @desc 控制是否应启用阴影的开关 
 * @default 0
 *
 * @param Fog Z
 * @parent Overlay
 * @type number
 * @desc 雾层的Z值应该是多少？ 
 * @default 22
 *
 * @param Light Z
 * @parent Overlay
 * @type number
 * @desc 光层的Z值应该是多少？ 
 * @default 23
 *
 * @param Parallax Z
 * @parent Overlay
 * @type number
 * @desc 覆盖层的 Z 值应该是多少？
 * @default 20
 *
 * @param Shadow Z
 * @parent Overlay
 * @type number
 * @desc 阴影层的 Z 值应该是多少？ 
 * @default 21
 *
 * @param Ground Z
 * @parent Overlay
 * @type number
 * @desc 地层的Z值应该是多少？ 
 * @default 1
 *
 * @param Balloon Z
 * @parent Overlay
 * @type number
 * @desc 使用视差时，使用它来更改气球 Z 值。
 * 推荐默认值 = 7，视差 = 30 
 * @default 7
 *
 * @param Animations Z
 * @parent Overlay
 * @type number
 * @desc 使用视差时，使用它来更改动画 Z 值。
 * Recomended default = 8, with parallaxes = 31
 * @default 8
 *
 * @param Regions
 *
 * @param bushRegionId
 * @text 灌木区域
 * @parent Regions
 * @type number
 * @desc 配置一个区域 id，使用时会将图块标记为灌木 
 * @default 0
 *
 * @param Region Movement
 * @parent Regions
 *
 * @param blockRegionId
 * @text 封锁区域
 * @parent Region Movement
 * @type number
 * @desc 配置一个区域 id，该区域 id 应阻止磁贴上的通行 
 * @default 0
 *
 * @param unblockRegionId
 * @text 解锁区域
 * @parent Region Movement
 * @type number
 * @desc Configure a region id that should unblock passage on a tile
 * @default 0
 *
 * @param blockPlayerRegionId
 * @text (玩家) 封锁区域
 * @parent Region Movement
 * @type number
 * @desc Configure a region id that should block the player's passage on a tile
 * @default 0
 *
 * @param unblockPlayerRegionId
 * @text (玩家) 解锁区域
 * @parent Region Movement
 * @type number
 * @desc Configure a region id that should unblock the player's passage on a tile
 * @default 0
 *
 * @param blockEventRegionId
 * @text (事件) 封锁区域
 * @parent Region Movement
 * @type number
 * @desc Configure a region id that should block event's passage on a tile
 * @default 0
 *
 * @param unblockEventRegionId
 * @text (事件) 解锁区域
 * @parent Region Movement
 * @type number
 * @desc Configure a region id that should unblock event's passage on a tile
 * @default 0
 *
 * @param Region Actions
 * @parent Regions
 *
 * @param commonEventRegions
 * @text 公共事件区域
 * @parent Region Actions
 * @type struct<CommonEventRegion>[]
 * @desc 配置特定区域踩踏时触发常见事件
 *
 * @param namedRegions
 * @text 命名区域
 * @parent Region Actions
 * @type struct<NamedRegion>[]
 * @desc 配置某些区域以在屏幕上显示名称 
 *
 * @param regionNamesStay
 * @text 区域名称留在屏幕上
 * @parent Region Actions
 * @desc 如果打开，当玩家在该区域上方时，名称将保留在屏幕上 
 * @type boolean
 * @default false
 *
 * @command newFogOpacity
 * @text 更改雾不透明度 
 * @desc
 *
 * @arg opacity
 * @text 不透明度
 * @type number
 * @desc The new value for the fog opacity: 1 - 255
 *
 * @arg duration
 * @text 持续时间
 * @type number
 * @desc 不透明度过渡应该持续多长时间？ 将其保留为零以使用地图默认值。 
 * @default 0
 *
 * @command fogFadeout
 * @text Fog fade out
 * @desc Fade out and deactivate the fog layer
 *
 * @arg duration
 * @text 持续时间
 * @type number
 * @desc How long should the fade out last?
 * @default 0
 *
 * @command moveFog
 * @text 移动雾
 * @desc Change the speed at which the fog moves
 *
 * @arg moveX
 * @text X 速度
 * @type number
 * @desc how many pixels the fog should move horizontally at a time. Use a negative value to move left.
 *
 * @arg moveY
 * @text Y 速度
 * @type number
 * @desc how many pixels the fog should move vertically at a time. Use a negative value to move up.
 *
 * @command fogBlendMode
 * @text 更改雾混合模式
 * @desc
 *
 * @arg blend
 * @text 混合类型
 * @type select
 * @desc 要在雾层中使用的混合类型 
 * @default 0
 * @option Normal
 * @value 0
 * @option Additive
 * @value 1
 *
 * @command fog
 * @text 改变雾
 * @desc
 *
 * @arg fileName
 * @text 文件名
 * @type string
 * @desc The file name of the new fog
 *
 * @command light
 * @text 改变灯光
 * @desc
 *
 * @arg fileName
 * @text 文件名
 * @type string
 * @desc The file name of the new light
 *
 * @command shadow
 * @text 改变阴影
 * @desc
 *
 * @arg fileName
 * @text 文件名
 * @type string
 * @desc The file name of the new shadow
 *
 * @command par
 * @text 改变视差
 * @desc
 *
 * @arg fileName
 * @text 文件名
 * @type string
 * @desc The file name of the new parallax
 *
 * @command ground
 * @text 改变 地面
 * @desc
 *
 * @arg fileName
 * @text 文件名
 * @type string
 * @desc The file name of the new ground
 *
 **/
/*~struct~CommonEventRegion:
 * @param regionId
 * @text 区域ID
 * @type number
 * @desc The regionId to add an event to
 *
 * @param commonEventId
 * @text 常见事件
 * @type common_event
 * @desc The common event to be executed on this region
 */
/*~struct~NamedRegion:
 * @param regionId
 * @text 区域 Id
 * @type number
 * @desc The regionId to display a name on
 *
 * @param name
 * @text 名称
 * @type string
 * @desc 这个地区的名字 
 */
(function () {
'use strict';

globalThis.CyclonePatcher=class{static initialize(t){this.pluginName=t,this.superClasses=new Map;}static _descriptorIsProperty(t){return t.get||t.set||!t.value||"function"!=typeof t.value}static _getAllClassDescriptors(t,e=!1){if(t===Object)return {};const r=Object.getOwnPropertyDescriptors(e?t.prototype:t);let s={};if(t.prototype){const r=Object.getPrototypeOf(t.prototype).constructor;r!==Object&&(s=this._getAllClassDescriptors(r,e));}return Object.assign({},s,r)}static _assignDescriptor(t,e,r,s,a=!1){if(this._descriptorIsProperty(r))r.get||r.set?Object.defineProperty(t,s,{get:r.get,set:r.set,enumerable:r.enumerable,configurable:r.configurable}):Object.defineProperty(t,s,{value:r.value,enumerable:r.enumerable,configurable:r.configurable});else {let r=s;if(a)for(;r in t;)r=`_${r}`;t[r]=e[s];}}static _applyPatch(t,e,r,s,a=!1){const n=this._getAllClassDescriptors(t,a),i=a?t.prototype:t,o=a?e.prototype:e,l=Object.getOwnPropertyDescriptors(o);let u=!1;for(const t in l){if(s.includes(t))continue;if(t in n){u=!0;const e=n[t];this._assignDescriptor(r,i,e,t,!0);}const e=l[t];this._assignDescriptor(i,o,e,t);}return u}static patchClass(t,e){const r=this.superClasses&&this.superClasses[t.name]||{},s={},a={},n=e(a,s);if("function"!=typeof n)throw new Error(`Invalid class patch for ${t.name}`);const i=Object.getOwnPropertyNames(class{}),o=Object.getOwnPropertyNames(class{}.prototype),l=this._applyPatch(t,n,r,i),u=this._applyPatch(t,n,s,o,!0);if(l){const t=Object.getOwnPropertyDescriptors(r);for(const e in t)this._assignDescriptor(a,r,t[e],e);u&&(a.$prototype=s);}else Object.assign(a,s);this.superClasses&&(this.superClasses[t.name]=a);}};const t=Object.freeze(["TRUE","ON","1","YES","T","V"]);class e extends CyclonePatcher{static initialize(t){super.initialize(t),this.fileName=void 0,this.params={},this.structs=new Map,this.eventListeners=new Map,this.structs.set("Dictionary",{name:{type:"string",defaultValue:""},value:{type:"string",defaultValue:""}});}static register(t={}){const e=this.loadAllParams();this.params=this.loadParamMap(t,e);}static loadAllParams(){for(const t of globalThis.$plugins){if(!t||!t.status)continue;if(!t.description||!t.description.includes(`<pluginName:${this.pluginName}`))continue;this.fileName=t.name;const e=new Map;for(const r in t.parameters)r&&!r.startsWith("-")&&e.set(r,t.parameters[r]);return e}}static loadParamMap(t,e){const r={};for(const s in t)if(t.hasOwnProperty(s))try{r[s]=this.parseParam(s,t,e);}catch(t){console.error(`CycloneEngine crashed while trying to parse a parameter value (${s}). Please report the following error to Hudell:`),console.log(t);}return r}static registerEvent(t,e){this.eventListeners.has(t)||this.eventListeners.set(t,new Set);this.eventListeners.get(t).add(e);}static removeEventListener(t,e){if(!this.eventListeners.has(t))return;this.eventListeners.get(t).delete(e);}static shouldReturnCallbackResult(t,{abortOnTrue:e,abortOnFalse:r,returnOnValue:s}){return !(!1!==t||!r)||(!(!0!==t||!e)||!(void 0===t||!s))}static runEvent(t,{abortOnTrue:e=!1,abortOnFalse:r=!1,returnOnValue:s=!1}={},...a){if(!this.eventListeners.has(t))return;const n=this.eventListeners.get(t);for(const t of n){if("number"==typeof t){this.runCommonEvent(t);continue}if("function"!=typeof t){console.error("CycloneEngine: Invalid callback type:"),console.log(t);continue}const n=t(...a);if(this.shouldReturnCallbackResult(n,{abortOnTrue:e,abortOnFalse:r,returnOnValue:s}))return n}}static runCommonEvent(t){const e=globalThis.$dataCommonEvents[t];if(!e)return;const r=new Game_Interpreter(1);if(r.setup(e.list,0),!this._interpreters){this._interpreters=new Set;const t=SceneManager.updateMain;SceneManager.updateMain=()=>{t.call(SceneManager),this.update();};}this._interpreters.add(r);}static update(){if(this._interpreters)for(const t of this._interpreters)t.update(),t.isRunning()||this._interpreters.delete(t);}static getPluginFileName(){return this.fileName??this.pluginName}static isTrue(e){return "string"!=typeof e?Boolean(e):t.includes(e.toUpperCase())}static isFalse(t){return !this.isTrue(t)}static getIntParam({value:t,defaultValue:e}){try{const r=parseInt(t);return isNaN(r)?e:r}catch(r){return ""!==t&&console.error(`Cyclone Engine plugin ${this.pluginName}: Param is expected to be an integer number, but the received value was '${t}'.`),e}}static getFloatParam({value:t,defaultValue:e}){try{const r=parseFloat(t.replace(",","."));return isNaN(r)?e:r}catch(r){return ""!==t&&console.error(`Cyclone Engine plugin ${this.pluginName}: Param is expected to be a number, but the received value was '${t}'.`),e}}static getIntListParam({value:t}){return this.parseArray((t??"").trim(),(t=>{try{return parseInt(t.trim())}catch(e){return ""!==t&&console.error(`Cyclone Engine plugin ${this.pluginName}: Param is expected to be a list of integer numbers, but one of the items was '${t}'.`),0}}))}static parseStructArrayParam({data:t,type:e}){const r=[];for(const s of t){const t=this.parseStructParam({value:s,defaultValue:"",type:e});t&&r.push(t);}return r}static getFloatListParam({value:t}){return this.parseArray((t||"").trim(),(t=>{try{return parseFloat(t.trim())}catch(e){return ""!==t&&console.error(`Cyclone Engine plugin ${this.pluginName}: Param ${name} is expected to be a list of numbers, but one of the items was '${t}'.`),0}}))}static getParam({value:t,defaultValue:e,type:r}){if(r.endsWith("[]"))return this.parseArrayParam({value:t,type:r});if(r.startsWith("struct<"))return this.parseStructParam({value:t,defaultValue:e,type:r});if(void 0===t)return e;switch(r){case"int":return this.getIntParam({value:t,defaultValue:e});case"float":return this.getFloatParam({value:t,defaultValue:e});case"boolean":return "boolean"==typeof t?t:this.isTrue(String(t).trim());default:return t}}static getPluginParam(t){return this.params.get(t)}static defaultValueForType(t){switch(t){case"int":return 0;case"boolean":return !1}return ""}static parseParam(t,e,r){let s=e[t];s&&"string"==typeof s&&(s={type:s,defaultValue:this.defaultValueForType(s)});const{name:a=t,type:n="string",defaultValue:i=""}=s;let o;if(r)o=r.get(a)??i;else {o=(this.getPluginParam(a)||{}).value??i;}return this.getParam({value:o,defaultValue:i,type:n})}static parseArrayParam({value:t,type:e}){const r=this.parseArray(t);if(!r||!r.length)return r;const s=e.substr(0,e.length-2),a=[];for(const t of r){const e=this.defaultValueForType(s);a.push(this.getParam({value:t,type:s,defaultValue:e}));}return a}static getRegexMatch(t,e,r){const s=t.match(e);if(s)return s[r]}static parseStructParam({value:t,defaultValue:e,type:r}){let s;if(t)try{s=JSON.parse(t);}catch(e){console.error("Cyclone Engine failed to parse param structure: ",t),console.error(e);}s||(s=JSON.parse(e));const a=this.getRegexMatch(r,/struct<(.*)>/i,1);if(!a)return console.error(`Unknown plugin param type: ${r}`),s;const n=this.structs.get(a);if(!n)return console.error(`Unknown param structure type: ${a}`),s;for(const t in n){if(!n.hasOwnProperty(t))continue;let e=n[t];"string"==typeof e&&(e={type:e,defaultValue:this.defaultValueForType(e)}),s[t]=this.getParam({value:s[t],defaultValue:e.defaultValue,type:e.type});}return s}static parseList(t,e){let r=t;r.startsWith("[")&&(r=r.substr(1)),r.endsWith("]")&&(r=r.substr(0,r.length-1));const s=r.split(",");return e?s.map((t=>e(t))):s}static parseArray(t,e){let r;try{r=JSON.parse(t);}catch(t){return []}return r&&r.length?e?r.map((t=>e(t))):r:[]}static registerCommand(t,e,r){return "function"==typeof e?PluginManager.registerCommand(this.getPluginFileName(),t,e):PluginManager.registerCommand(this.getPluginFileName(),t,(t=>{const s=new Map;for(const e in t)t.hasOwnProperty(e)&&s.set(e,t[e]);const a=this.loadParamMap(e,s);return Object.assign(t,a),r(t)}))}}globalThis.CyclonePlugin=e;

class CycloneMaps$1 extends CyclonePlugin {
  static register() {
    super.initialize('CycloneMaps');

    this.structs.set('CycloneCommonEventRegion', {
      regionId: 'int',
      commonEventId: 'int',
    });
    this.structs.set('CycloneNamedRegion', {
      regionId: 'int',
      name: 'string',
    });

    super.register({
      commonEventId: {
        name: 'Map Change Event Id',
        type: 'int',
      },
      tileWidth: {
        name: 'Tile Width',
        type: 'int',
        defaultValue: 48,
      },
      tileHeight: {
        name: 'Tile Height',
        type: 'int',
        defaultValue: 48,
      },
      tilesetPath: {
        name: 'Tileset Path',
        type: 'string',
        defaultValue: 'img/tilesets/',
      },
      enableOverlays: 'boolean',
      disableTilemap: 'boolean',
      disableAutoShadows: 'boolean',
      organizedFolders: {
        name: 'Organized Folders',
        type: 'boolean',
        defaultValue: false,
      },
      parallaxLayerFileName: {
        name: 'Parallax Layer Filename',
        type: 'string',
        defaultValue: 'par',
      },
      groundLayerFileName: {
        name: 'Ground Layer Filename',
        type: 'string',
        defaultValue: 'ground',
      },
      lightLayerFileName: {
        name: 'Light Layer Filename',
        type: 'string',
        defaultValue: 'light',
      },
      shadowLayerFileName: {
        name: 'Shadow Layer Filename',
        type: 'string',
        defaultValue: 'shadow',
      },
      lightOpacity: {
        name: 'Light Opacity',
        type: 'int',
        defaultValue: 185,
      },
      quickStart: {
        name: 'Quick Start',
        type: 'boolean',
        defaultValue: true,
      },
      fogSwitchId: {
        name: 'Fog Switch ID',
        type: 'int',
        defaultValue: 0,
      },
      lightSwitchId: {
        name: 'Light Switch ID',
        type: 'int',
        defaultValue: 0,
      },
      parallaxSwitchId: {
        name: 'Parallax Switch ID',
        type: 'int',
        defaultValue: 0,
      },
      shadowSwitchId: {
        name: 'Shadow Switch ID',
        type: 'int',
        defaultValue: 0,
      },
      groundZ: {
        name: 'Ground Z',
        type: 'int',
        defaultValue: 1,
      },
      parallaxZ: {
        name: 'Parallax Z',
        type: 'int',
        defaultValue: 20,
      },
      shadowZ: {
        name: 'Shadow Z',
        type: 'int',
        defaultValue: 21,
      },
      fogZ: {
        name: 'Fog Z',
        type: 'int',
        defaultValue: 22,
      },
      lightZ: {
        name: 'Light Z',
        type: 'int',
        defaultValue: 23,
      },
      bushRegionId: 'int',
      blockRegionId: 'int',
      unblockRegionId: 'int',
      blockPlayerRegionId: 'int',
      unblockPlayerRegionId: 'int',
      blockEventRegionId: 'int',
      unblockEventRegionId: 'int',
      commonEventRegions: {
        type: 'struct<CycloneCommonEventRegion>[]',
        defaultValue: '[]',
      },
      namedRegions: {
        type: 'struct<CycloneNamedRegion>[]',
        defaultValue: '[]',
      },
      regionNamesStay: 'boolean',
    });

    this.registerCommand('newFogOpacity', {
      opacity: 'int',
      duration: 'int',
    }, ({opacity, duration}) => {
      this.newFogOpacity = opacity;
      this.newFogOpacityDuration = duration;
    });

    this.registerCommand('fogFadeout', {
      duration: 'int',
    }, ({duration}) => {
      this.needsFogFadeOut = true;
      this.fogFadeOutDuration = duration;
    });

    this.registerCommand('moveFog', {
      moveX: 'int',
      moveY: 'int',
    }, ({moveX, moveY}) => {
      this.fogMoveX = moveX;
      this.fogMoveY = moveY;
    });

    this.registerCommand('fogBlendMode', {
      blend: 'int',
    }, ({blend}) => {
      this.fogBlendMode = blend;
    });

    this.registerCommand('fog', {
      fileName: 'string',
      moveX: 'int',
      moveY: 'int',
      blend: 'int',
    }, ({fileName, moveX, moveY, blend}) => {
      this.fogFileName = fileName;
      this.changedFogFileName = true;
    });

    this.registerCommand('light', ({fileName}) => {
      this.lightName = fileName;
      this.changedLightFileName = true;
    });

    this.registerCommand('shadow', ({fileName}) => {
      this.shadowName = fileName;
      this.changedShadowFileName = true;
    });
    this.registerCommand('par', ({fileName}) => {
      this.parallaxName = fileName;
      this.changedParallaxFileName = true;
    });

    this.registerCommand('ground', ({fileName}) => {
      this.groundName = fileName;
      this.changedGroundFileName = true;
    });

    this.clearSettings();
  }

  static get groundZ() {
    return this.params.groundZ;
  }
  static get parallaxZ() {
    return this.params.parallaxZ;
  }
  static get shadowZ() {
    return this.params.shadowZ;
  }
  static get fogZ() {
    return this.params.fogZ;
  }
  static get lightZ() {
    return this.params.lightZ;
  }

  static clearSettings() {
    // Set this attribute to a numeric value to change the fog opacity temporarily
    this.newFogOpacity = false;
    // Set this to use a custom duration for the fog opacity transition
    this.newFogOpacityDuration = 0;
    // Set this to true to fade out the fog and then erase the temporary fog data
    this.needsFogFadeOut = false;
    this.fogFadeOutDuration = 1;

    this.fogMoveX = 0;
    this.fogMoveY = 0;
    this.fogBlendMode = 0;

    // the default opacity and duration are loaded with the map
    this.fogOpacity = 255;
    this.fogDuration = 1;

    this.fogFileName = '';
    this.changedFogFileName = false;

    this.changedLightFileName = false;
    this.lightName = '';

    this.changedShadowFileName = false;
    this.shadowName = '';

    this.changedParallaxFileName = false;
    this.parallaxName = '';

    this.changedGroundFileName = false;
    this.groundName = '';

    this.blockRegionId = this.params.blockRegionId;
    this.unblockRegionId = this.params.unblockRegionId;
    this.blockPlayerRegionId = this.params.blockPlayerRegionId;
    this.unblockPlayerRegionId = this.params.unblockPlayerRegionId;
    this.blockEventRegionId = this.params.blockEventRegionId;
    this.unblockEventRegionId = this.params.unblockEventRegionId;

    this.disableAutoShadows = this.params.disableAutoShadows;

    const commonEventRegions = this.params.commonEventRegions;
    const namedRegions = this.params.namedRegions;

    this.commonEventRegions = new Map();
    this.namedRegions = new Map();

    for (const config of commonEventRegions) {
      if (config.regionId > 0 && config.commonEventId > 0) {
        this.commonEventRegions.set(config.regionId, config.commonEventId);
      }
    }
    for (const config of namedRegions) {
      if (config.regionId > 0) {
        this.namedRegions.set(config.regionId, config.name.trim());
      }
    }
  }

  static checkRegionActions() {
    const regionId = $gameMap.regionId($gamePlayer.x, $gamePlayer.y);

    if (this.commonEventRegions.has(regionId)) {
      this.runCommonEvent(this.commonEventRegions.get(regionId));
    }
  }
}

globalThis.CycloneMaps = CycloneMaps$1;
CycloneMaps$1.register();

CycloneMaps.patchClass(DataManager, $super => class {
  static setupNewGame() {
    $super.setupNewGame.call(this);

    if (CycloneMaps.params.enableOverlays && CycloneMaps.params.quickStart) {
      const { fogSwitchId, lightSwitchId, parallaxSwitchId, shadowSwitchId } = CycloneMaps.params;

      if (fogSwitchId > 0) {
        $gameSwitches.setValue(fogSwitchId, true);
      }

      if (lightSwitchId > 0) {
        $gameSwitches.setValue(lightSwitchId, true);
      }

      if (parallaxSwitchId > 0) {
        $gameSwitches.setValue(parallaxSwitchId, true);
      }

      if (shadowSwitchId > 0) {
        $gameSwitches.setValue(shadowSwitchId, true);
      }
    }
  }
});

CycloneMaps.patchClass(Game_Event, $super => class {
  isMapPassable(x, y, d) {
    const blockRegionId = CycloneMaps.blockEventRegionId;
    const unblockRegionId = CycloneMaps.unblockEventRegionId;

    if (blockRegionId > 0 || unblockRegionId > 0) {
      const newX = $gameMap.roundXWithDirection(x, d);
      const newY = $gameMap.roundYWithDirection(y, d);
      const regionId = $gameMap.regionId(newX, newY);

      if (regionId > 0) {
        if (regionId === blockRegionId) {
          return false;
        }

        if (regionId === unblockRegionId) {
          return false;
        }
      }
    }

    return $super.isMapPassable.call(this, x, y, d);
  }
});

CycloneMaps.patchClass(Game_Map, $super => class {
  tileWidth() {
    const customWidth = CycloneMaps.params.tileWidth;
    if (typeof customWidth === 'number' && customWidth > 0) {
      return customWidth;
    }

    return $super.tileWidth.call(this);
  }

  tileHeight() {
    const customHeight = CycloneMaps.params.tileHeight;
    if (typeof customHeight === 'number' && customHeight > 0) {
      return customHeight;
    }

    return $super.tileHeight.call(this);
  }

  isBush(x, y) {
    if ($super.isBush.call(this, x, y)) {
      return true;
    }

    const bushRegionId = CycloneMaps.params.bushRegionId;
    if (!bushRegionId) {
      return false;
    }

    if (!this.isValid(x, y)) {
      return false;
    }

    return $gameMap.regionId(x, y) === bushRegionId;
  }

  checkRegionPassability(x, y) {
    const blockRegionId = CycloneMaps.blockRegionId;
    const unblockRegionId = CycloneMaps.unblockRegionId;

    if (blockRegionId > 0 || unblockRegionId > 0) {
      const regionId = this.regionId(x, y);

      if (regionId > 0) {
        if (regionId === blockRegionId) {
          return false;
        }

        if (regionId === unblockRegionId) {
          return true;
        }
      }
    }

    return null;
  }

  checkPassage(x, y, bit) {
    const region = this.checkRegionPassability(x, y);
    if (typeof region === 'boolean') {
      return region;
    }

    return $super.checkPassage.call(this, x, y, bit);
  }
});

CycloneMaps.patchClass(Game_Party, $super => class {
  onPlayerWalk() {
    $super.onPlayerWalk.call(this);

    if (CycloneMaps.commonEventRegions.size > 0) {
      CycloneMaps.checkRegionActions();
    }
  }
});

CycloneMaps.patchClass(Game_Player, $super => class {
  performTransfer() {
    if (this.isTransferring()) {
      if (CycloneMaps.params.commonEventId > 0) {
        $gameTemp.reserveCommonEvent(CycloneMaps.params.commonEventId);
      }
    }

    $super.performTransfer.call(this);
  }

  isMapPassable(x, y, d) {
    const blockRegionId = CycloneMaps.blockPlayerRegionId;
    const unblockRegionId = CycloneMaps.unblockPlayerRegionId;

    if (blockRegionId > 0 || unblockRegionId > 0) {
      const newX = $gameMap.roundXWithDirection(x, d);
      const newY = $gameMap.roundYWithDirection(y, d);
      const regionId = $gameMap.regionId(newX, newY);

      if (regionId > 0) {
        if (regionId === blockRegionId) {
          return false;
        }

        if (regionId === unblockRegionId) {
          return false;
        }
      }
    }

    return $super.isMapPassable.call(this, x, y, d);
  }
});

CycloneMaps.patchClass(ImageManager, $super => class {
  static loadTileset(filename) {
    const customPath = CycloneMaps.params.tilesetPath;
    if (customPath) {
      return this.loadBitmap(customPath, filename);
    }

    return $super.loadTileset.call(this, filename);
  }
});

class WindowRegionName extends Window_MapName {
  refresh() {
    this.contents.clear();

    const regionId = this._currentRegionId || 0;
    if (regionId === 0) {
      return;
    }

    const regionName = CycloneMaps.namedRegions.get(regionId);
    if (!regionName) {
      return;
    }

    const width = this.contentsWidth();
    this.drawBackground(0, 0, width, this.lineHeight());
    this.drawText(regionName, 0, 0, width, 'center');
  }

  update() {
    if (this._delay) {
      this._delay--;
      return;
    }

    this._delay = 10;
    const regionId = $gameMap.regionId($gamePlayer._x, $gamePlayer._y);

    const shouldUpdate = regionId > 0 || !this._showCount;

    if (shouldUpdate && (CycloneMaps.params.regionNamesStay || regionId !== this._currentRegionId)) {
      this._currentRegionId = regionId;
      this.open();
      return;
    }

    super.update();
  }
}

CycloneMaps.patchClass(Scene_Map, $super => class {
  createRegionNameWindow() {
    const rect = this.mapNameWindowRect();
    this._regionNameWindow = new WindowRegionName(rect);
    this.addChild(this._regionNameWindow);
  }

  createMapNameWindow() {
    $super.createMapNameWindow.call(this);
    this.createRegionNameWindow();
  }

  updateTransferPlayer() {
    if ($gamePlayer.isTransferring()) {
      this._regionNameWindow.close();
    }

    $super.updateTransferPlayer();
    this._regionNameWindow._delay = 0;
    this._regionNameWindow.update();
  }

  callMenu() {
    $super.callMenu.call(this);
    this._regionNameWindow.hide();
  }

  launchBattle() {
    $super.launchBattle.call(this);
    this._regionNameWindow.hide();
  }

  stop() {
    this._regionNameWindow.close();
    $super.stop.call(this);
  }
});

CycloneMaps.patchClass(Sprite_Animation, $super => class {
  initMembers() {
    $super.initMembers.call(this);
    const animationZ = CycloneMaps.params.animationZ;

    // Only apply if we have a valid Z different from the default
    if (animationZ !== 0 && animationZ !== 8) {
      this.z = animationZ;
    }
  }
});

CycloneMaps.patchClass(Sprite_Balloon, $super => class {
  initMembers() {
    $super.initMembers.call(this);
    const balloonZ = CycloneMaps.params.balloonZ;

    // Only apply if we have a valid Z different from the default
    if (balloonZ !== 0 && balloonZ !== 7) {
      this.z = balloonZ;
    }
  }
});

function defaultIfNaN(value, defaultValue) {
  if (isNaN(Number(value))) {
    return defaultValue;
  }

  return value;
}

function getValueMaybeVariable(rawValue) {
  const value = rawValue.trim();

  if (value.startsWith('$')) {
    const variableId = parseInt(value.slice(1));
    if (isNaN(variableId)) {
      throw new Error(`Invalid Variable ID: ${ variableId }`); //`
    }

    if (variableId === 0) {
      return 0;
    }

    return $gameVariables.value(variableId);
  }

  return value;
}

CycloneMaps.patchClass(Spriteset_Map, $super => class {
  createLowerLayer() {
    CycloneMaps.clearSettings();
    $super.createLowerLayer.call(this);
  }

  loadOverlayBitmap(folderName, fileName) {
    if (CycloneMaps.params.organizedFolders) {
      return ImageManager.loadBitmap(`img/overlays/${ folderName }/`, fileName);
    }

    return ImageManager.loadParallax(fileName);
  }

  createOverlayLayer(folderName, fileNamePrefix, tagName, zValue, visibilitySwitchId = 0, maxOpacity = 255) {
    if (!this.getMeta(tagName) && !this.getMeta('all')) {
      return null;
    }

    const bitmap = this.loadOverlayBitmap(folderName, fileNamePrefix + $gameMap._mapId);
    const layer = new Sprite(bitmap);
    layer.z = zValue;

    this._tilemap.addChild(layer);

    if (visibilitySwitchId > 0) {
      layer.opacity = $gameSwitches.value(visibilitySwitchId) ? maxOpacity : 0;
    }

    return layer;
  }

  createGroundLayer() {
    this._groundLayer = this.createOverlayLayer('grounds', CycloneMaps.params.groundLayerFileName, 'ground', CycloneMaps.groundZ);
  }

  createParallaxLayer() {
    const { parallaxLayerFileName, parallaxSwitchId } = CycloneMaps.params;
    this._parallaxLayer = this.createOverlayLayer('pars', parallaxLayerFileName, 'par', CycloneMaps.parallaxZ, parallaxSwitchId);
  }

  createShadowLayer() {
    const { shadowLayerFileName, shadowSwitchId } = CycloneMaps.params;
    this._shadowLayer = this.createOverlayLayer('shadows', shadowLayerFileName, 'shadow', CycloneMaps.shadowZ, shadowSwitchId);
  }

  createLightLayer() {
    const { lightLayerFileName, lightSwitchId, lightOpacity } = CycloneMaps.params;
    this._lightLayer = this.createOverlayLayer('lights', lightLayerFileName, 'light', CycloneMaps.lightZ, lightSwitchId, lightOpacity);
    if (this._lightLayer) {
      this._lightLayer.blendMode = 1;
    }
  }

  createFogLayer() {
    CycloneMaps.fogFileName = this.getOverlayVariable('fogName');
    CycloneMaps.fogOpacity = this.getOverlayIntVariable('fogOpacity', 255);
    CycloneMaps.fogMoveX = this.getOverlayIntVariable('xMove', 0);
    CycloneMaps.fogMoveY = this.getOverlayIntVariable('yMove', 0);
    CycloneMaps.fogBlendMode = this.getOverlayIntVariable('fogBlend', 0);
    CycloneMaps.fogDuration = this.getOverlayIntVariable('fogDuration', 1);

    if (!CycloneMaps.fogFileName) {
      return;
    }

    const bitmap = this.loadOverlayBitmap('fogs', CycloneMaps.fogFileName);
    if (!bitmap) {
      return;
    }

    const layer = new TilingSprite();
    layer.bitmap = bitmap;
    layer.width = Graphics.width;
    layer.height = Graphics.height;

    layer.blendMode = CycloneMaps.fogBlendMode;
    layer.opacity = 0;
    layer.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
    layer.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
    layer.z = CycloneMaps.fogZ;

    CycloneMaps.fogNewX = 0;
    CycloneMaps.fogNewY = 0;

    this._tilemap.addChild(layer);
    this._fogLayer = layer;
    CycloneMaps.changedFogFileName = false;
  }

  createCharacters() {
    if (!CycloneMaps.params.enableOverlays) {
      $super.createCharacters.call(this);
      return;
    }

    this.createGroundLayer();
    $super.createCharacters.call(this);
    this.createParallaxLayer();
    this.createShadowLayer();
    this.createFogLayer();
    this.createLightLayer();
  }

  getMeta(name) {
    if ($dataMap && $dataMap.meta) {
      return $dataMap.meta[name];
    }
  }

  getOverlayVariable(variableName) {
    if (this.getMeta(variableName) === undefined) {
      return false;
    }

    return getValueMaybeVariable($dataMap.meta[variableName]);
  }

  getOverlayIntVariable(variableName, defaultValue) {
    const value = parseInt(this.getOverlayVariable(variableName)) ?? defaultValue;
    return defaultIfNaN(value, defaultValue);
  }

  updateLayerOpacity(layer, maxOpacity, opacityChange) {
    const newOpacity = (layer.opacity + opacityChange).clamp(0, maxOpacity);

    if (layer.opacity !== newOpacity) {
      layer.opacity = newOpacity;
    }
  }

  updateLayer(layerName, update, folderName, fileNamePrefix, tagName, zValue, switchId, maxOpacity = 255, opacityChange = 10) {
    let layer = this[layerName];

    if (!layer) {
      layer = this.createOverlayLayer(folderName, fileNamePrefix, tagName, zValue, switchId, maxOpacity);
      update = false;
    }

    if (!layer) {
      return;
    }

    layer.x = $gameMap.displayX() * (0 - $gameMap.tileWidth());
    layer.y = $gameMap.displayY() * (0 - $gameMap.tileHeight());

    if (switchId > 0) {
      this.updateLayerOpacity(layer, maxOpacity, opacityChange * ($gameSwitches.value(switchId) ? 1 : -1));
    }

    if (update) {
      layer.bitmap = this.loadOverlayBitmap(folderName, fileNamePrefix + $gameMap._mapId);
    }

    this[layerName] = layer;
  }

  updateGroundLayer() {
    const { groundLayerFileName } = CycloneMaps.params;

    this.updateLayer('_groundLayer', CycloneMaps.changedGroundFileName, 'grounds', CycloneMaps.groundName || groundLayerFileName, 'ground', CycloneMaps.groundZ, 0);
    CycloneMaps.changedGroundFileName = false;
  }

  updateParallaxLayer() {
    const { parallaxLayerFileName, parallaxSwitchId } = CycloneMaps.params;

    this.updateLayer('_parallaxLayer', CycloneMaps.changedParallaxFileName, 'pars', CycloneMaps.parallaxName || parallaxLayerFileName, 'par', CycloneMaps.parallaxZ, parallaxSwitchId);
    CycloneMaps.changedParallaxFileName = false;
  }

  updateShadowLayer() {
    const { shadowLayerFileName, shadowSwitchId } = CycloneMaps.params;

    this.updateLayer('_shadowLayer', CycloneMaps.changedShadowFileName, 'shadows', CycloneMaps.shadowName || shadowLayerFileName, 'shadow', CycloneMaps.shadowZ, shadowSwitchId);
    CycloneMaps.changedShadowFileName = false;
  }

  stepFogLayerOpacity(stepSize = -10, maxOpacity = 255) {
    this._fogLayer.opacity = (this._fogLayer.opacity + stepSize).clamp(0, maxOpacity);
  }

  isFogEnabled() {
    const { fogSwitchId } = CycloneMaps.params;
    return fogSwitchId > 0 && $gameSwitches.value(fogSwitchId);
  }

  fadeOutOpacity() {
    // if a manual fade out was triggered
    if (CycloneMaps.needsFogFadeOut) {
      // If there's a new opacity level set by a plugin command, use that instead of the map's default
      const targetOpacity = CycloneMaps.newFogOpacity || CycloneMaps.fogOpacity;
      const transition = targetOpacity / (CycloneMaps.fogFadeOutDuration || 1);

      if (this._fogLayer.opacity > 0) {
        this.stepFogLayerOpacity(0 - transition, this._fogLayer.opacity);
        return;
      }

      // When the manual fade out is complete, we reset the temporary data and deactivate the fog switch
      CycloneMaps.needsFogFadeOut = false;
      CycloneMaps.newFogOpacity = false;
      CycloneMaps.newFogOpacityDuration = 0;
      CycloneMaps.currentOpacityTarget = 0;

      const fogSwitchId = CycloneMaps.params.fogSwitchId;
      if (fogSwitchId > 0) {
        $gameSwitches.setValue(fogSwitchId, false);
      }

      return;
    }

    // If there's no manual fade out requested, then the switch was turned off - so use the default fade out
    if (this._fogLayer.opacity > 0) {
      this.stepFogLayerOpacity(-10, this._fogLayer.opacity);
    }
  }

  updateFogOpacity() {
    if (!this.isFogEnabled() || CycloneMaps.needsFogFadeOut) {
      this.fadeOutOpacity();
      return;
    }

    // If there's a new opacity level set by a plugin command, use that instead of the map's default
    const targetOpacity = CycloneMaps.newFogOpacity || CycloneMaps.fogOpacity;
    const duration = CycloneMaps.newFogOpacityDuration || CycloneMaps.fogDuration;
    const transition = targetOpacity / duration;

    // If the opacity is not at the desired level yet, fade it in
    if (this._fogLayer.opacity < targetOpacity) {
      this.stepFogLayerOpacity(transition, targetOpacity);
    } else if (this._fogLayer.opacity > targetOpacity) {
      this._fogLayer.opacity = targetOpacity;
    }
  }

  updateFogLayer() {
    if (!this._fogLayer) {
      this.createFogLayer();
      if (!this._fogLayer) {
        return;
      }
    }

    this._fogLayer.blendMode = CycloneMaps.fogBlendMode;
    CycloneMaps.fogNewX += CycloneMaps.fogMoveX;
    CycloneMaps.fogNewY += CycloneMaps.fogMoveY;

    this._fogLayer.origin.x = $gameMap.displayX() * $gameMap.tileWidth() - CycloneMaps.fogNewX;
    this._fogLayer.origin.y = $gameMap.displayY() * $gameMap.tileHeight() - CycloneMaps.fogNewY;
    this.updateFogOpacity();

    if (CycloneMaps.changedFogFileName && CycloneMaps.fogFileName) {
      this._fogLayer.bitmap = this.loadOverlayBitmap('fogs', CycloneMaps.fogFileName);
      CycloneMaps.changedFogFileName = false;
    }
  }

  updateLightLayer() {
    const { lightLayerFileName, lightSwitchId, lightOpacity } = CycloneMaps.params;
    this.updateLayer('_lightLayer', CycloneMaps.changedLightFileName, 'lights', CycloneMaps.lightName || lightLayerFileName, 'light', CycloneMaps.lightZ, lightSwitchId, lightOpacity, 1);
    CycloneMaps.changedLightFileName = false;
  }

  updateTilemap() {
    if (CycloneMaps.params.enableOverlays) {
      this.updateGroundLayer();
      this.updateParallaxLayer();
      this.updateShadowLayer();
      this.updateFogLayer();
      this.updateLightLayer();
    }

    $super.updateTilemap.call(this);
  }
});

CycloneMaps.patchClass(Tilemap, $super => class {
  initialize() {
    $super.initialize.call(this);
    this._tileWidth = $gameMap.tileWidth();
    this._tileHeight = $gameMap.tileHeight();
  }

  updateTransform() {
    if (CycloneMaps.params.disableTilemap && CycloneMaps.params.enableOverlays) {
      this._sortChildren();
      PIXI.Container.prototype.updateTransform.call(this);
      return;
    }

    $super.updateTransform.call(this);
  }

  _addShadow(...args) {
    if (CycloneMaps.disableAutoShadows) {
      return;
    }

    return $super._addShadow.call(this, ...args);
  }
});
})();
