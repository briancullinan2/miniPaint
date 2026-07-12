/**
 * Zero-dependency global event subscription coordinator.
 * Prevents memory leaks by tracking context associations across global targets.
 */
import app from "./app";
import config from "./config";
import Base_layers_class from "./core/base-layers";

class GlobalEventRegistry {
    constructor() {
        if (GlobalEventRegistry.instance) {
            return GlobalEventRegistry.instance;
        }
        this._records = new Map();
        this._inactive = new Map();
        GlobalEventRegistry.instance = this;
    }

    /**
     * Attaches an event listener to a target and registers it under a context tracking bucket.
     * @param {Object} context - The calling class instance ('this') owning the listener lifecycle.
     * @param {EventTarget} target - The DOM node, window, or document scope receiving the listener.
     * @param {string} type - The string event name identifier (e.g., 'mousemove', 'resize').
     * @param {Function} handler - The raw callback function executing on trigger.
     * @param {boolean|Object} [options=false] - Optional configurations (e.g., {passive: false}).
     */
    register(context, target, type, handler, options = undefined) {
        if (!context) {
            throw new Error("GlobalEvents.register requires a valid context instance reference.");
        }

        const normalizedOptions = options === undefined ? false : options;
        target.addEventListener(type, handler, normalizedOptions);

        if (!this._records.has(context)) {
            this._records.set(context, []);
        }

        this._records.get(context).push({
            target,
            type,
            handler,
            options: normalizedOptions
        });
    }

    activate(context) {
        if (!context || !this._records.has(context)) return;

        if (!this._inactive.has(context)) {
            this._inactive.set(context, []);
        }

        const listeners = this._inactive.get(context);
        for (let { target, type, handler, options } of listeners) {
            this.register(context, target, type, handler, options);
        }

        this._inactive.set(context, listeners);
    }

    deActivate(context) {
        if (!context || !this._records.has(context)) return;

        if (!this._inactive.has(context)) {
            this._inactive.set(context, []);
        }

        const listeners = this._records.get(context);
        for (let { target, type, handler, options } of listeners) {
            target.removeEventListener(type, handler, options);
        }

        this._inactive.delete(context);
    }

    /**
     * Unbinds and tears down all event registrations associated with a specific context instance.
     * Call this inside your Lumino widget's onBeforeDetach() or destroy() lifecycle block.
     * @param {Object} context - The calling class instance ('this') to scrub.
     */
    destroy(context) {
        if (!context || !this._records.has(context)) return;

        const listeners = this._records.get(context);
        while (listeners.length > 0) {
            const { target, type, handler, options } = listeners.pop();
            target.removeEventListener(type, handler, options);
        }

        this._records.delete(context);
        const index = Base_layers_class.registry.indexOf(app.Layers);
        if (index !== -1) {
            Base_layers_class.registry.splice(index, 1); // Removes exactly 1 item at that index position
        }
        app.GUI = null;
        app.Tools = null;
        app.Layers = null;
        app.Config = null;
        app.State = null;
        app.FileOpen = null;
        app.FileSave = null;
        app.Actions = null;
        app.Events = null;
        app.Search = null;
        config.deepPurgeObject(config);
    }
}

// Freeze and export a single unified instance across your workspace engine
export const GlobalEvents = new GlobalEventRegistry();
