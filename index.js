'use strict';
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const SCRIPT_PATH = [__dirname, 'assets', 'jsc3d.js'].join(path.sep);

// Set up simple mock window
const mockWindow = {
    pageXOffset: 0,
    pageYOffset: 0,
    //Uint32Array: Buffer, // Supports Typed Arrays
    WebGLRenderingContext: undefined, // does not support WebGL
    navigator: {
        userAgent: 'Chrome 0', // look like chrome to sniffing
    },
};

// Set up simple mock document
const mockDocument = {
    createTouch: undefined, // does not support touch
    body: {
        appendChild: () => {},
        createElement: () => ({
            style: {},
        }),
        scrollLeft: 0,
        scrollTop: 0,
    },
    addEventListener: () => {},
};


// Create mock XMLHttpRequest that actually just wraps FS
class XMLHttpRequest {
    open(method, urlPath) {
        this.path = urlPath;
    }

    setRequestHeader() {}
    overrideMimeType() {}

    abort() {}

    send() {
        fs.readFile(this.path, (error, data) => {
            if (error) {
                throw error;
            }
            this.status = 200;
            this.readyState = 4;
            //this.data = data.toString();
            this.responseText = data.toString();
            this.onreadystatechange(); // call callback
            JSC3D.triggerLoaded(this.path); // read file, trigger ready
        });
    }
}

const encodeURI = string => string; // don't actually encode anything

// Include this in top level JSC3D to expose it as part of node-jsc3d's
// interface
const JSC3D = {
    onLoadedCallbacks: [],
    makeCairoCanvas: (width, height) => {
        const Canvas = require('canvas');
        const canvas = new Canvas(width, height);
        canvas.addEventListener = () => {};
        return canvas;
    },

    render: (parameters, callback) => {
        const canvas = parameters.canvas;
        const viewer = new JSC3D.Viewer(canvas);
        for (const name of Object.keys(parameters)) {
            if (name === 'canvas') {
                continue;
            }
            viewer.setParameter(name, parameters[name]);
        }

        viewer.init();
        JSC3D.onLoaded(path => {
            viewer.doUpdate();
            callback();
        });
    },

    // TODO: Replace with event emitter
    onLoaded: callback => {
        JSC3D.onLoadedCallbacks.push(callback);
    },

    triggerLoaded: path => {
        for (const callback of JSC3D.onLoadedCallbacks) {
            callback(path);
        }
    },

    setSandboxWindow: newWindow => {
        // Overrides the sandbox, useful if it is to be used in a real or
        // somewhat real window context
        const keys = ['document', 'encodeURI', 'setTimeout', 'XMLHttpRequest'];
        for (const key in keys) {
            sandbox[key] = newWindow[key];
        }
        sandbox.window = newWindow;
    },
};

function mockSetTimeout (func, time) {
    // For now, actually STOP the setTimeout loop
    // setTimeout(func, 0);
}

const sandbox = {
    window: mockWindow,
    document: mockDocument,
    encodeURI: string => string,
    setTimeout: mockSetTimeout,
    XMLHttpRequest,
    JSC3D,
};

const context = new vm.createContext(sandbox);
const jsc3dLoader = new vm.Script(fs.readFileSync(SCRIPT_PATH));
jsc3dLoader.runInContext(context);
module.exports = JSC3D;
module.exports.sandbox = sandbox;

