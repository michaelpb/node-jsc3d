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

    abort() {} // TODO implement to cancel fs.readFile

    send() {
        fs.readFile(this.path, (error, data) => {
            if (error) {
                throw error;
            }
            this.status = 200;
            this.readyState = 4;
            this.data = data;
            this.responseText = data;
            this.onreadystatechange(); // call callback
        });
    }
}

const encodeURI = string => string; // don't actually encode anything

// Include this in top level JSC3D to expose it as part of node-jsc3d's
// interface
const JSC3D = {
    makeNodeCanvas: (width, height) => {
        const Canvas = require('canvas');
        const canvas = new Canvas(1170, 585);
        canvas.addEventListener = () => {};
    },
    makeSimpleCanvas: (width, height) => {
        return {
        };
    },
};

function mockSetTimeout (func, time) {
    // For now, run right away
    setTimeout(func, 0);
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
const jsc3dLoader = new vm.Script(fs.readFileSync('./assets/jsc3d.js'));
jsc3dLoader.runInContext(context);
module.exports = JSC3D;
module.exports.sandbox = sandbox;

