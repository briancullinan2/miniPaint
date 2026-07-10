/**
 * miniPaint - https://github.com/viliusle/miniPaint
 * author: Vilius L.
 */

//css
import './../css/reset.css';
import './../css/utility.css';
import './../css/component.css';
import './../css/layout.css';
import './../css/menu.css';
import './../css/print.css';
import './../css/boxicons.min.css';
import './../../node_modules/alertifyjs/build/css/alertify.min.css';
//js
import app from './app.js';
import config from './config.js';
import './core/components/index.js';
import Base_gui_class from './core/base-gui.js';
import Base_layers_class from './core/base-layers.js';
import Base_tools_class from './core/base-tools.js';
import Base_state_class from './core/base-state.js';
import Base_search_class from './core/base-search.js';
import File_open_class from './modules/file/open.js';
import File_save_class from './modules/file/save.js';
import * as Actions from './actions/index.js';

/**
 * Core application initialization sequence.
 * Can be invoked immediately by a layout manager or deferred to a window event listener.
 * @param {HTMLElement} [targetNode] - Optional custom DOM mount point inside a Lumino Widget container
 */
export function initializeMiniPaint(targetNode = null) {

	let Layers = new Base_layers_class();
	let Base_tools = new Base_tools_class(true);
	let GUI = new Base_gui_class();
	let Base_state = new Base_state_class();
	let File_open = new File_open_class();
	let File_save = new File_save_class();
	let Base_search = new Base_search_class();

	// If a custom target container element is supplied, pass its reference over to miniPaint's GUI layout generator
	if (targetNode) {
		config.TARGET_ELEMENT = targetNode; // Ensure miniPaint appends its canvas workspace here
	}

	// Register singletons in app module context boundaries
	app.Actions = Actions;
	app.Config = config;
	app.FileOpen = File_open;
	app.FileSave = File_save;
	app.GUI = GUI;
	app.Layers = Layers;
	app.State = Base_state;
	app.Tools = Base_tools;

	// Render operations
	GUI.init();
	Layers.init();

	return app;
}

// ENVIRONMENT CHECK: Determine fallback routine execution paths
const isLuminoEnvironment = window.Lumino  || document.readyState === 'complete';

if (isLuminoEnvironment) {
	// If we're already embedded or window has loaded, bypass event listeners completely
	console.log("Lumino context or late bundle load detected. Initializing painter pipeline instantly.");
	window.initializeMiniPaint = initializeMiniPaint;
} else {
	// Standalone fallback pathway
	window.addEventListener('load', () => initializeMiniPaint(), false);
}

