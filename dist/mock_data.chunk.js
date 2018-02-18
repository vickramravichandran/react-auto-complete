/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var parentJsonpFunction = window["webpackJsonp"];
/******/ 	window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules, executeModules) {
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [], result;
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules, executeModules);
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/ 		if(executeModules) {
/******/ 			for(i=0; i < executeModules.length; i++) {
/******/ 				result = __webpack_require__(__webpack_require__.s = executeModules[i]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	};
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// objects to store loaded and loading chunks
/******/ 	var installedChunks = {
/******/ 		2: 0
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		var installedChunkData = installedChunks[chunkId];
/******/ 		if(installedChunkData === 0) {
/******/ 			return new Promise(function(resolve) { resolve(); });
/******/ 		}
/******/
/******/ 		// a Promise means "currently loading".
/******/ 		if(installedChunkData) {
/******/ 			return installedChunkData[2];
/******/ 		}
/******/
/******/ 		// setup Promise in chunk cache
/******/ 		var promise = new Promise(function(resolve, reject) {
/******/ 			installedChunkData = installedChunks[chunkId] = [resolve, reject];
/******/ 		});
/******/ 		installedChunkData[2] = promise;
/******/
/******/ 		// start chunk loading
/******/ 		var head = document.getElementsByTagName('head')[0];
/******/ 		var script = document.createElement('script');
/******/ 		script.type = 'text/javascript';
/******/ 		script.charset = 'utf-8';
/******/ 		script.async = true;
/******/ 		script.timeout = 120000;
/******/
/******/ 		if (__webpack_require__.nc) {
/******/ 			script.setAttribute("nonce", __webpack_require__.nc);
/******/ 		}
/******/ 		script.src = __webpack_require__.p + "" + chunkId + ".bundle.js";
/******/ 		var timeout = setTimeout(onScriptComplete, 120000);
/******/ 		script.onerror = script.onload = onScriptComplete;
/******/ 		function onScriptComplete() {
/******/ 			// avoid mem leaks in IE.
/******/ 			script.onerror = script.onload = null;
/******/ 			clearTimeout(timeout);
/******/ 			var chunk = installedChunks[chunkId];
/******/ 			if(chunk !== 0) {
/******/ 				if(chunk) {
/******/ 					chunk[1](new Error('Loading chunk ' + chunkId + ' failed.'));
/******/ 				}
/******/ 				installedChunks[chunkId] = undefined;
/******/ 			}
/******/ 		};
/******/ 		head.appendChild(script);
/******/
/******/ 		return promise;
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// on error function for async loading
/******/ 	__webpack_require__.oe = function(err) { console.error(err); throw err; };
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
/******/ })
/************************************************************************/
/******/ ({

/***/ 13:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var COLORS = [{
  "name": "ANTIQUEWHITE",
  "code": "#faebd7"
}, {
  "name": "AQUA",
  "code": "#00ffff"
}, {
  "name": "AQUAMARINE",
  "code": "#7fffd4"
}, {
  "name": "BEIGE",
  "code": "#f5f5dc"
}, {
  "name": "BISQUE",
  "code": "#ffe4c4"
}, {
  "name": "BLACK",
  "code": "#000000"
}, {
  "name": "BLANCHEDALMOND",
  "code": "#ffebcd"
}, {
  "name": "BLUE",
  "code": "#0000ff"
}, {
  "name": "BLUEVIOLET",
  "code": "#8a2be2"
}, {
  "name": "BROWN",
  "code": "#a52a2a"
}, {
  "name": "BURLYWOOD",
  "code": "#deb887"
}, {
  "name": "CADETBLUE",
  "code": "#5f9ea0"
}, {
  "name": "CHARTREUSE",
  "code": "#7fff00"
}, {
  "name": "CHOCOLATE",
  "code": "#d2691e"
}, {
  "name": "CORAL",
  "code": "#ff7f50"
}, {
  "name": "CORNSILK",
  "code": "#fff8dc"
}, {
  "name": "CRIMSON",
  "code": "#dc143c"
}, {
  "name": "CYAN",
  "code": "#00ffff"
}, {
  "name": "DARKBLUE",
  "code": "#00008b"
}, {
  "name": "DARKCYAN",
  "code": "#008b8b"
}, {
  "name": "DARKGRAY",
  "code": "#a9a9a9"
}, {
  "name": "DARKGREEN",
  "code": "#006400"
}, {
  "name": "DARKGREY",
  "code": "#a9a9a9"
}, {
  "name": "DARKKHAKI",
  "code": "#bdb76b"
}, {
  "name": "DARKRED",
  "code": "#8b0000"
}, {
  "name": "DARKVIOLET",
  "code": "#9400d3"
}, {
  "name": "DEEPPINK",
  "code": "#ff1493"
}, {
  "name": "DEEPSKYBLUE",
  "code": "#00bfff"
}, {
  "name": "DIMGRAY",
  "code": "#696969"
}, {
  "name": "DIMGREY",
  "code": "#696969"
}, {
  "name": "DODGERBLUE",
  "code": "#1e90ff"
}, {
  "name": "FIREBRICK",
  "code": "#b22222"
}, {
  "name": "FLORALWHITE",
  "code": "#fffaf0"
}, {
  "name": "FORESTGREEN",
  "code": "#228b22"
}, {
  "name": "FUCHSIA",
  "code": "#ff00ff"
}, {
  "name": "GAINSBORO",
  "code": "#dcdcdc"
}, {
  "name": "GHOSTWHITE",
  "code": "#f8f8ff"
}, {
  "name": "GOLD",
  "code": "#ffd700"
}, {
  "name": "GOLDENROD",
  "code": "#daa520"
}, {
  "name": "GRAY",
  "code": "#808080"
}, {
  "name": "GREEN",
  "code": "#008000"
}, {
  "name": "GREENYELLOW",
  "code": "#adff2f"
}, {
  "name": "GREY",
  "code": "#808080"
}, {
  "name": "HONEYDEW",
  "code": "#f0fff0"
}, {
  "name": "HOTPINK",
  "code": "#ff69b4"
}, {
  "name": "INDIANRED",
  "code": "#cd5c5c"
}, {
  "name": "INDIGO",
  "code": "#4b0082"
}, {
  "name": "IVORY",
  "code": "#fffff0"
}, {
  "name": "KHAKI",
  "code": "#f0e68c"
}, {
  "name": "LAVENDER",
  "code": "#e6e6fa"
}, {
  "name": "LAWNGREEN",
  "code": "#7cfc00"
}, {
  "name": "LIGHTBLUE",
  "code": "#add8e6"
}, {
  "name": "LIGHTCORAL",
  "code": "#f08080"
}, {
  "name": "LIGHTCYAN",
  "code": "#e0ffff"
}, {
  "name": "LIGHTGRAY",
  "code": "#d3d3d3"
}, {
  "name": "LIGHTGREEN",
  "code": "#90ee90"
}, {
  "name": "LIGHTGREY",
  "code": "#d3d3d3"
}, {
  "name": "LIGHTPINK",
  "code": "#ffb6c1"
}, {
  "name": "LIGHTYELLOW",
  "code": "#ffffe0"
}, {
  "name": "LIME",
  "code": "#00ff00"
}, {
  "name": "LIMEGREEN",
  "code": "#32cd32"
}, {
  "name": "MAGENTA",
  "code": "#ff00ff"
}, {
  "name": "MAROON",
  "code": "#800000"
}, {
  "name": "MEDIUMBLUE",
  "code": "#0000cd"
}, {
  "name": "MIDNIGHTBLUE",
  "code": "#191970"
}, {
  "name": "MINTCREAM",
  "code": "#f5fffa"
}, {
  "name": "MISTYROSE",
  "code": "#ffe4e1"
}, {
  "name": "MOCCASIN",
  "code": "#ffe4b5"
}, {
  "name": "NAVY",
  "code": "#000080"
}, {
  "name": "OLDLACE",
  "code": "#fdf5e6"
}, {
  "name": "OLIVE",
  "code": "#808000"
}, {
  "name": "OLIVEDRAB",
  "code": "#6b8e23"
}, {
  "name": "ORANGE",
  "code": "#ffa500"
}, {
  "name": "ORANGERED",
  "code": "#ff4500"
}, {
  "name": "ORCHID",
  "code": "#da70d6"
}, {
  "name": "PAPAYAWHIP",
  "code": "#ffefd5"
}, {
  "name": "PEACHPUFF",
  "code": "#ffdab9"
}, {
  "name": "PERU",
  "code": "#cd853f"
}, {
  "name": "PINK",
  "code": "#ffc0cb"
}, {
  "name": "PLUM",
  "code": "#dda0dd"
}, {
  "name": "POWDERBLUE",
  "code": "#b0e0e6"
}, {
  "name": "PURPLE",
  "code": "#800080"
}, {
  "name": "RED",
  "code": "#ff0000"
}, {
  "name": "ROSYBROWN",
  "code": "#bc8f8f"
}, {
  "name": "ROYALBLUE",
  "code": "#4169e1"
}, {
  "name": "SADDLEBROWN",
  "code": "#8b4513"
}, {
  "name": "SALMON",
  "code": "#fa8072"
}, {
  "name": "SANDYBROWN",
  "code": "#f4a460"
}, {
  "name": "SEAGREEN",
  "code": "#2e8b57"
}, {
  "name": "SEASHELL",
  "code": "#fff5ee"
}, {
  "name": "SIENNA",
  "code": "#a0522d"
}, {
  "name": "SILVER",
  "code": "#c0c0c0"
}, {
  "name": "SKYBLUE",
  "code": "#87ceeb"
}, {
  "name": "SLATEBLUE",
  "code": "#6a5acd"
}, {
  "name": "SLATEGRAY",
  "code": "#708090"
}, {
  "name": "SLATEGREY",
  "code": "#708090"
}, {
  "name": "SNOW",
  "code": "#fffafa"
}, {
  "name": "SPRINGGREEN",
  "code": "#00ff7f"
}, {
  "name": "STEELBLUE",
  "code": "#4682b4"
}, {
  "name": "TAN",
  "code": "#d2b48c"
}, {
  "name": "TEAL",
  "code": "#008080"
}, {
  "name": "THISTLE",
  "code": "#d8bfd8"
}, {
  "name": "TOMATO",
  "code": "#ff6347"
}, {
  "name": "TURQUOISE",
  "code": "#40e0d0"
}, {
  "name": "VIOLET",
  "code": "#ee82ee"
}, {
  "name": "WHEAT",
  "code": "#f5deb3"
}, {
  "name": "WHITE",
  "code": "#ffffff"
}, {
  "name": "WHITESMOKE",
  "code": "#f5f5f5"
}, {
  "name": "YELLOW",
  "code": "#ffff00"
}, {
  "name": "YELLOWGREEN",
  "code": "#9acd32"
}].map(function (x) {
  return {
    name: x.name.toUpperCase(),
    code: x.code.toUpperCase()
  };
}).sort(function (l, r) {
  return l.name - r.name;
});

var BREAKFAST = ["BAGELS",
//"BISCUITS AND GRAVY",
//"Cold Pizza",
"CEREAL", "CROISSANT", "DOUGHNUTS", "EGG SANDWICH",
//"ENGLISH MUFFIN",
//"FRESH FRUIT",
"FRENCHTOAST", "OATMEAL"
//"ORANGE JUICE"
];

exports.COLORS = COLORS;
exports.BREAKFAST = BREAKFAST;

/***/ })

/******/ });
//# sourceMappingURL=mock_data.chunk.js.map