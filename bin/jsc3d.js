#!/usr/bin/env node
'use strict';

const jsc3d = require('../index');
const fs = require('fs');

function simpleParseArgs(args) {
    const positional = [];
    const named = {};
    for (const arg of args) {
        if (arg.match(/^\-\-/)) {
            const stripped = arg.substr(2);
            const i = stripped.indexOf('=');
            const name = stripped.substr(0, i);
            const value = stripped.substr(i + 1);
            named[name] = value;
        } else {
            positional.push(arg);
        }
    }

    // Get rid of self
    if (positional[0].match(/nodej?s?$/)) {
        positional.shift();
    }
    if (positional[0].match(/jsc3d.?j?s?$/)) {
        positional.shift();
    }
    return {positional, named};
}

function main() {
    const args = simpleParseArgs(process.argv);

    const inputPath = args.positional[0];
    const outputPath = args.positional[1];
    // console.log("Rendering ", inputPath, " to ", outputPath);

    const canvas = jsc3d.makeCairoCanvas(500, 500);
    const parameters = Object.assign({
        canvas,
        SceneUrl: inputPath,
        InitRotationX: 45,
        InitRotationY: -45,
        InitRotationZ: -135,
        ModelColor: '#ffffff',
        BackgroundColor1: '#ffffff',
        BackgroundColor2: '#ffffff',
        ProgressBar: 'off',
        RenderMode: 'flat',
        Definition: 'high',
    }, args.named);

    jsc3d.render(parameters, () => {
        const buf = canvas.toBuffer(undefined, 3, canvas.PNG_FILTER_NONE);
        fs.writeFile(outputPath, buf, error => {
            if (error) {
                throw error;
            }
        });
    });
}

main();
