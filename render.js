'use strict';

const JSC3D = require('./index');
const input = process.argv[1];
const output = process.argv[2];

const Canvas = require('canvas');
const canvas = new Canvas(1170, 585);

canvas.addEventListener = () => {};


var viewer = new JSC3D.Viewer(canvas);
viewer.setParameter('SceneUrl', 'hotair_retainer_support.stl');
viewer.setParameter('InitRotationX', 45);
viewer.setParameter('InitRotationY', -45);
viewer.setParameter('InitRotationZ', -135);
viewer.setParameter('ModelColor', '#ffffff');
viewer.setParameter('BackgroundColor1', '#ffffff');
viewer.setParameter('BackgroundColor2', '#ffffff');
// viewer.setParameter('BackgroundImageUrl', '{{ STATIC_URL }}meshviewer/img/graphy_bg.png');
//viewer.setParameter('RenderMode', 'smooth');
//viewer.setParameter('SphereMapUrl', 'models/chrome.jpg');
//viewer.setParameter('SphereMapUrl', '{{ STATIC_URL }}meshviewer/img/graphy/graphy_@2X.png');
//viewer.setParameter('SphereMapUrl', '{{ STATIC_URL }}meshviewer/img/wood/wood_pattern.png');
//viewer.setParameter('SphereMapUrl', '{{ STATIC_URL }}meshviewer/img/carbon/carbon_fibre_big.png');
//viewer.setParameter('SphereMapUrl', '{{ STATIC_URL }}meshviewer/img/graphy/graphy_@2X.png');
viewer.setParameter('ProgressBar', 'off');

var ctx = canvas.getContext('2d');

var rotation_timer = null;

var stop_rotate = function (skip_mouse) {
    if (rotation_timer) {
        clearInterval(rotation_timer);
    }

    if (!skip_mouse) {
        viewer.setMouseUsage('rotate');
        viewer.enableDefaultInputHandler(true);
    }
};

var start_rotate = function () {
    stop_rotate(true);
    viewer.enableDefaultInputHandler(false);
    rotation_timer = setInterval( function() { 
        viewer.rotate(0, 2, 0);
        viewer.update();
    }, 100);
};

var set_material_texture = function () {
    //viewer.setParameter('RenderMode', 'texturesmooth');
    viewer.setParameter('RenderMode', 'flat');
    viewer.setParameter('ModelColor', "#ffffff");
    //viewer.setParameter('ModelColor', '#bbbbff');
    viewer.init();
};

var set_material_wireframe = function () {
    viewer.setRenderMode('wireframe');
    viewer.setParameter('ModelColor', '#111111');
    viewer.init();
};

var buttonize = function ($e, func_on, func_off) {
    $e.find('i').toggleClass('icon-check').toggleClass('icon-check-empty');
    if ($e.find('i.icon-check').length) {
        // Is checked now
        func_on();
    } else {
        func_off();
    }
};

/*
$('#button_wireframe').click(function() {
    buttonize($(this), set_material_wireframe, set_material_texture);
});

$('#button_rotate').click(function() {
    buttonize($(this), start_rotate, stop_rotate);
});
*/


viewer.setParameter('Definition', 'high');
set_material_texture();

/*
    start_rotate();
*/

viewer.afterupdate = function() {
    /* Alert phantomjs to take screenshot */
    console.log('ready!');
};

viewer.init();
