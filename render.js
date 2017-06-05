'use strict';

const JSC3D = require('./index');
const fs = require('fs')

const inputPath = process.argv[2];
const outputPath = process.argv[3];
// console.log("Rendering ", inputPath, " to ", outputPath);

const canvas = JSC3D.makeCairoCanvas(500, 500);
const parameters = {
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
};

JSC3D.render(parameters, () => {
    const buf = canvas.toBuffer(undefined, 3, canvas.PNG_FILTER_NONE);
    fs.writeFile(outputPath, buf, error => {
        if (error) {
            throw error;
        }
    });
});

