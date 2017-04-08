/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var puzzleDifficulty = 2;
var ALLOW_MATCHING_NEIGHBORS = false;
var MAX_ATTEMPT_TO_AVOID_NEIGHBORS = 10;
var isTouchDevice = 'ontouchstart' in document.documentElement;
var INTERACTION = isTouchDevice ? "touchend" : "click";

var stage = void 0;
var canvas = void 0;
var pictureUrl = document.querySelectorAll(".picture-item img")[0].src;

var img = void 0;
var imgPlayIcon = null;
var imgSettingsIcon = null;
var pieces = void 0;
var puzzleWidth = void 0;
var puzzleHeight = void 0;
var pieceWidth = void 0;
var pieceHeight = void 0;
var currentPiece = void 0;
var solved = false;
var settings = false;
var playIcon = document.querySelector("#play-icon img");
var menuElement = document.querySelector("#menu");
var settingsImage = document.querySelector("#settings img");
var canvasElement = document.querySelector("#canvas");
var retryImage = document.querySelector("#retry img");

// Disable scrolling on touch devices
if (isTouchDevice) {
  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
  });
}

// TODO: move to other module - simplify

playIcon.addEventListener(INTERACTION, function (e) {
  menuElement.classList.remove("show");
  menuElement.classList.add("hide");

  settingsImage.classList.remove("hide");
  settingsImage.classList.add("show");

  canvasElement.classList.remove("hide");
  canvasElement.classList.add("show");

  init();
});

settingsImage.addEventListener(INTERACTION, function (e) {
  menuElement.classList.remove("hide");
  menuElement.classList.add("show");

  settingsImage.classList.remove("show");
  settingsImage.classList.add("hide");

  retryImage.classList.remove("show");
  retryImage.classList.add("hide");

  canvasElement.classList.remove("show");
  canvasElement.classList.add("hide");

  document.onmousedown = document.ontouchend = document.touchend = null;
});

// Somehow older IOS version does not seem to handle event listener on multiple element.
var handleTouchOnMenuItems = function handleTouchOnMenuItems(idPrefix, selectedClass, onSelect) {
  var max = 0;

  var _loop = function _loop(counter) {
    var picture = document.querySelector("#" + idPrefix + "-" + counter);
    if (!picture) {
      max = counter;
      return "break";
    }
    picture.addEventListener(INTERACTION, function (e) {
      for (var i = 0; i < max; i++) {
        var p = document.querySelector("#" + idPrefix + "-" + i);
        if (i === counter) {
          p.classList.add(selectedClass);
          onSelect && onSelect(p);
        } else {
          p.classList.remove(selectedClass);
        }
      }
    });
  };

  for (var counter = 0;; counter++) {
    var _ret = _loop(counter);

    if (_ret === "break") break;
  }
};

handleTouchOnMenuItems("picture", "picture-selected", function (element) {
  pictureUrl = element.src;
});
handleTouchOnMenuItems("level", "level-selected", function (element) {
  puzzleDifficulty = parseInt(element.getAttribute("data-level"));
});

function debug(text) {
  document.querySelector("#foobar").innerHTML += text + "<br/>";
}

var init = function init() {
  img = new Image();
  img.addEventListener('load', onImage, false);
  img.src = pictureUrl;
};

var onImage = function onImage(e) {
  pieceWidth = Math.floor(img.width / puzzleDifficulty);
  pieceHeight = Math.floor(img.height / puzzleDifficulty);
  puzzleWidth = pieceWidth * puzzleDifficulty;
  puzzleHeight = pieceHeight * puzzleDifficulty;
  setCanvas();
  initPuzzle();
};

var setCanvas = function setCanvas() {
  canvas = document.getElementById('canvas');
  stage = canvas.getContext('2d');
  canvas.width = puzzleWidth;
  canvas.height = puzzleHeight;
  canvas.style.border = "1px solid black";
};

var initPuzzle = function initPuzzle() {
  pieces = [];
  currentPiece = null;
  stage.drawImage(img, 0, 0, puzzleWidth, puzzleHeight, 0, 0, puzzleWidth, puzzleHeight);
  buildPieces();
};

var buildPieces = function buildPieces() {
  pieces = [];
  var piece = void 0;
  var posX = 0;
  var posY = 0;
  for (var i = 0; i < puzzleDifficulty * puzzleDifficulty; i++) {
    piece = {};
    piece.clipX = posX;
    piece.clipY = posY;
    piece.index = i;
    pieces.push(piece);
    posX += pieceWidth;
    if (posX >= puzzleWidth) {
      posX = 0;
      posY += pieceHeight;
    }
  }
  shufflePuzzle();
};

// TODO: Could be optimized to only refresh the 2 affected tiles
var refreshPuzzle = function refreshPuzzle() {
  var border = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

  stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
  var posX = 0;
  var posY = 0;
  for (var i = 0; i < pieces.length; i++) {
    var piece = pieces[i];
    piece.posX = posX;
    piece.posY = posY;
    var clipX = piece.clipX,
        clipY = piece.clipY;

    if (border) {
      stage.strokeStyle = "#000000";
      stage.lineWidth = 5;
      stage.strokeRect(posX, posY, pieceWidth, pieceHeight);
    }
    stage.drawImage(img, clipX, clipY, pieceWidth, pieceHeight, posX, posY, pieceWidth, pieceHeight);
    posX += pieceWidth;
    if (posX >= puzzleWidth) {
      posX = 0;
      posY += pieceHeight;
    }
  }
};

// TODO: should be unit tested - Does not seem to work correctly ?
var hasNeighbors = function hasNeighbors(pieces) {
  for (var i = 0; i < pieces.length; i++) {
    var piece = pieces[i];
    // next to the right
    if (pieces[i + 1]) {
      if (pieces[i + 1].index === piece.index + 1) {
        return false;
      }
    }

    // next to the left
    if (pieces[i - 1]) {
      if (pieces[i - 1].index === piece.index - 1) {
        return false;
      }
    }

    // below
    if (pieces[i + puzzleDifficulty]) {
      if (pieces[i + puzzleDifficulty].index === piece.index + puzzleDifficulty) {
        return false;
      }
    }

    if (pieces[i - puzzleDifficulty]) {
      if (pieces[i - puzzleDifficulty].index === piece.index - puzzleDifficulty) {
        return false;
      }
    }
  }

  return true;
};

// Shuffle until there are no matching neighbors. Does not check adjacent tiles
var shuffleProperly = function shuffleProperly(count, callback) {
  document.onmousedown = document.ontouchend = document.touchend = null;
  count++;
  pieces = shuffleArray(pieces);
  refreshPuzzle();
  if (count < MAX_ATTEMPT_TO_AVOID_NEIGHBORS && !ALLOW_MATCHING_NEIGHBORS && !hasNeighbors(pieces)) {
    setTimeout(function () {
      shuffleProperly(count, callback);
    }, 100);
  } else {
    callback();
  }
};

var isMenuOn = function isMenuOn() {
  return menuElement.classList.contains("show");
};

var onShuffled = function onShuffled() {
  document.onmousedown = document.ontouchend = document.touchend = function (event) {

    if (isMenuOn()) {
      return false;
    }

    if (solved) {
      shufflePuzzle();
      return;
    }

    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX || event.changedTouches[0].clientX) - rect.left;
    var y = (event.clientY || event.changedTouches[0].clientY) - rect.top;

    // If clicking on the settings gear icon
    if (x > rect.right - 148 && y > rect.bottom - 120) {
      return false;
    }

    var cursorPosition = getCursorPosition(canvas, event);

    if (!cursorPosition) {
      // Ignore action as it is outside the puzzle
      return false;
    }
    if (currentPiece) {
      var selectedIndex = cursorPosition.indexX + cursorPosition.indexY * puzzleDifficulty;
      var currentIndex = currentPiece.indexX + currentPiece.indexY * puzzleDifficulty;
      // Switch places
      var tmp = pieces[selectedIndex];
      var tmp2 = pieces[currentIndex];
      pieces[selectedIndex] = tmp2;
      pieces[currentIndex] = tmp;
      currentPiece = null;
      refreshPuzzle();

      if (checkPuzzle()) {
        console.log("Weee confetti time!");
        retryImage.classList.remove("hide");
        retryImage.classList.add("show");

        solved = true;
        refreshPuzzle(!solved);
      }
    } else {
      currentPiece = cursorPosition;
      markPiece(currentPiece);
    }
  };
};

var shufflePuzzle = function shufflePuzzle() {

  if (isMenuOn()) {
    return false;
  }

  retryImage.classList.remove("show");
  retryImage.classList.add("hide");

  solved = false;
  var count = 0;
  shuffleProperly(count, onShuffled);
};

// Check if the puzzle has been solved
var checkPuzzle = function checkPuzzle() {
  for (var i = 0; i < pieces.length; i++) {
    var piece = pieces[i];
    if (piece.index !== i) {
      return false;
    }
  }
  return true;
};

var markPiece = function markPiece(_ref) {
  var indexX = _ref.indexX,
      indexY = _ref.indexY;

  stage.globalAlpha = 0.2;
  stage.fillStyle = "#FF0000";
  stage.fillRect(indexX * pieceWidth, indexY * pieceHeight, pieceWidth, pieceHeight);
  stage.globalAlpha = 1.0;
};

var getCursorPosition = function getCursorPosition(canvas, event) {
  var rect = canvas.getBoundingClientRect();
  var x = (event.clientX || event.changedTouches[0].clientX) - rect.left;
  var y = (event.clientY || event.changedTouches[0].clientY) - rect.top;

  var indexX = Math.floor(x / pieceWidth);
  var indexY = Math.floor(y / pieceHeight);

  // Make sure it is a valid index
  if (indexY >= puzzleDifficulty || indexX >= puzzleDifficulty) {
    return null;
  }

  return { indexX: indexX, indexY: indexY };
};

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
var shuffleArray = function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMWY3MDY1N2FlYzQ4MzFkNGUxNDAiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uanMiXSwibmFtZXMiOlsicHV6emxlRGlmZmljdWx0eSIsIkFMTE9XX01BVENISU5HX05FSUdIQk9SUyIsIk1BWF9BVFRFTVBUX1RPX0FWT0lEX05FSUdIQk9SUyIsImlzVG91Y2hEZXZpY2UiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsIklOVEVSQUNUSU9OIiwic3RhZ2UiLCJjYW52YXMiLCJwaWN0dXJlVXJsIiwicXVlcnlTZWxlY3RvckFsbCIsInNyYyIsImltZyIsImltZ1BsYXlJY29uIiwiaW1nU2V0dGluZ3NJY29uIiwicGllY2VzIiwicHV6emxlV2lkdGgiLCJwdXp6bGVIZWlnaHQiLCJwaWVjZVdpZHRoIiwicGllY2VIZWlnaHQiLCJjdXJyZW50UGllY2UiLCJzb2x2ZWQiLCJzZXR0aW5ncyIsInBsYXlJY29uIiwicXVlcnlTZWxlY3RvciIsIm1lbnVFbGVtZW50Iiwic2V0dGluZ3NJbWFnZSIsImNhbnZhc0VsZW1lbnQiLCJyZXRyeUltYWdlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImNsYXNzTGlzdCIsInJlbW92ZSIsImFkZCIsImluaXQiLCJvbm1vdXNlZG93biIsIm9udG91Y2hlbmQiLCJ0b3VjaGVuZCIsImhhbmRsZVRvdWNoT25NZW51SXRlbXMiLCJpZFByZWZpeCIsInNlbGVjdGVkQ2xhc3MiLCJvblNlbGVjdCIsIm1heCIsImNvdW50ZXIiLCJwaWN0dXJlIiwiaSIsInAiLCJlbGVtZW50IiwicGFyc2VJbnQiLCJnZXRBdHRyaWJ1dGUiLCJkZWJ1ZyIsInRleHQiLCJpbm5lckhUTUwiLCJJbWFnZSIsIm9uSW1hZ2UiLCJNYXRoIiwiZmxvb3IiLCJ3aWR0aCIsImhlaWdodCIsInNldENhbnZhcyIsImluaXRQdXp6bGUiLCJnZXRFbGVtZW50QnlJZCIsImdldENvbnRleHQiLCJzdHlsZSIsImJvcmRlciIsImRyYXdJbWFnZSIsImJ1aWxkUGllY2VzIiwicGllY2UiLCJwb3NYIiwicG9zWSIsImNsaXBYIiwiY2xpcFkiLCJpbmRleCIsInB1c2giLCJzaHVmZmxlUHV6emxlIiwicmVmcmVzaFB1enpsZSIsImNsZWFyUmVjdCIsImxlbmd0aCIsInN0cm9rZVN0eWxlIiwibGluZVdpZHRoIiwic3Ryb2tlUmVjdCIsImhhc05laWdoYm9ycyIsInNodWZmbGVQcm9wZXJseSIsImNvdW50IiwiY2FsbGJhY2siLCJzaHVmZmxlQXJyYXkiLCJzZXRUaW1lb3V0IiwiaXNNZW51T24iLCJjb250YWlucyIsIm9uU2h1ZmZsZWQiLCJldmVudCIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJ4IiwiY2xpZW50WCIsImNoYW5nZWRUb3VjaGVzIiwibGVmdCIsInkiLCJjbGllbnRZIiwidG9wIiwicmlnaHQiLCJib3R0b20iLCJjdXJzb3JQb3NpdGlvbiIsImdldEN1cnNvclBvc2l0aW9uIiwic2VsZWN0ZWRJbmRleCIsImluZGV4WCIsImluZGV4WSIsImN1cnJlbnRJbmRleCIsInRtcCIsInRtcDIiLCJjaGVja1B1enpsZSIsImNvbnNvbGUiLCJsb2ciLCJtYXJrUGllY2UiLCJnbG9iYWxBbHBoYSIsImZpbGxTdHlsZSIsImZpbGxSZWN0IiwiYXJyYXkiLCJqIiwicmFuZG9tIiwidGVtcCJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5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QUFDQUQsVUFBTUMsQ0FBTixJQUFXRSxJQUFYO0FBQ0Q7QUFDRCxTQUFPSCxLQUFQO0FBQ0QsQ0FSRCxDIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDFmNzA2NTdhZWM0ODMxZDRlMTQwIiwibGV0IHB1enpsZURpZmZpY3VsdHkgPSAyO1xuY29uc3QgQUxMT1dfTUFUQ0hJTkdfTkVJR0hCT1JTID0gZmFsc2U7XG5jb25zdCBNQVhfQVRURU1QVF9UT19BVk9JRF9ORUlHSEJPUlMgPSAxMDtcbmNvbnN0IGlzVG91Y2hEZXZpY2UgPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5jb25zdCBJTlRFUkFDVElPTiA9IGlzVG91Y2hEZXZpY2UgID8gXCJ0b3VjaGVuZFwiIDogXCJjbGlja1wiO1xuXG5sZXQgc3RhZ2U7XG5sZXQgY2FudmFzO1xubGV0IHBpY3R1cmVVcmwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnBpY3R1cmUtaXRlbSBpbWdcIilbMF0uc3JjO1xuXG5sZXQgaW1nO1xubGV0IGltZ1BsYXlJY29uID0gbnVsbDtcbmxldCBpbWdTZXR0aW5nc0ljb24gPSBudWxsO1xubGV0IHBpZWNlcztcbmxldCBwdXp6bGVXaWR0aDtcbmxldCBwdXp6bGVIZWlnaHQ7XG5sZXQgcGllY2VXaWR0aDtcbmxldCBwaWVjZUhlaWdodDtcbmxldCBjdXJyZW50UGllY2U7XG5sZXQgc29sdmVkID0gZmFsc2U7XG5sZXQgc2V0dGluZ3MgPSBmYWxzZTtcbmNvbnN0IHBsYXlJY29uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5LWljb24gaW1nXCIpO1xuY29uc3QgbWVudUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnVcIilcbmNvbnN0IHNldHRpbmdzSW1hZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NldHRpbmdzIGltZ1wiKVxuY29uc3QgY2FudmFzRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzXCIpXG5jb25zdCByZXRyeUltYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZXRyeSBpbWdcIik7XG5cbi8vIERpc2FibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXNcbmlmIChpc1RvdWNoRGV2aWNlKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xufVxuXG4vLyBUT0RPOiBtb3ZlIHRvIG90aGVyIG1vZHVsZSAtIHNpbXBsaWZ5XG5cbnBsYXlJY29uLmFkZEV2ZW50TGlzdGVuZXIoSU5URVJBQ1RJT04sKGUpID0+IHtcbiAgbWVudUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInNob3dcIik7XG4gIG1lbnVFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXG4gIHNldHRpbmdzSW1hZ2UuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XG4gIHNldHRpbmdzSW1hZ2UuY2xhc3NMaXN0LmFkZChcInNob3dcIik7XG5cbiAgY2FudmFzRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcbiAgY2FudmFzRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwic2hvd1wiKTtcblxuICBpbml0KCk7XG59KTtcblxuc2V0dGluZ3NJbWFnZS5hZGRFdmVudExpc3RlbmVyKElOVEVSQUNUSU9OLCAoZSkgPT4ge1xuICBtZW51RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcbiAgbWVudUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInNob3dcIik7XG5cbiAgc2V0dGluZ3NJbWFnZS5jbGFzc0xpc3QucmVtb3ZlKFwic2hvd1wiKTtcbiAgc2V0dGluZ3NJbWFnZS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcblxuICByZXRyeUltYWdlLmNsYXNzTGlzdC5yZW1vdmUoXCJzaG93XCIpO1xuICByZXRyeUltYWdlLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXG4gIGNhbnZhc0VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInNob3dcIik7XG4gIGNhbnZhc0VsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGVcIik7XG5cbiAgZG9jdW1lbnQub25tb3VzZWRvd24gPSBkb2N1bWVudC5vbnRvdWNoZW5kID0gZG9jdW1lbnQudG91Y2hlbmQgPSBudWxsO1xuXG59KTtcblxuLy8gU29tZWhvdyBvbGRlciBJT1MgdmVyc2lvbiBkb2VzIG5vdCBzZWVtIHRvIGhhbmRsZSBldmVudCBsaXN0ZW5lciBvbiBtdWx0aXBsZSBlbGVtZW50LlxuY29uc3QgaGFuZGxlVG91Y2hPbk1lbnVJdGVtcyA9IChpZFByZWZpeCwgc2VsZWN0ZWRDbGFzcywgb25TZWxlY3QpID0+IHtcbiAgbGV0IG1heCA9IDA7XG4gIGZvciAobGV0IGNvdW50ZXIgPSAwIDsgOyBjb3VudGVyKyspIHtcbiAgICBsZXQgcGljdHVyZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkUHJlZml4fS0ke2NvdW50ZXJ9YCk7XG4gICAgaWYgKCFwaWN0dXJlKSB7XG4gICAgICBtYXggPSBjb3VudGVyO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHBpY3R1cmUuYWRkRXZlbnRMaXN0ZW5lcihJTlRFUkFDVElPTiwoZSkgPT4ge1xuICAgICAgZm9yIChsZXQgaSA9IDAgOyBpIDwgbWF4IDsgaSsrKSB7XG4gICAgICAgIGxldCBwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWRQcmVmaXh9LSR7aX1gKTtcbiAgICAgICAgaWYgKGkgPT09IGNvdW50ZXIpIHtcbiAgICAgICAgICBwLmNsYXNzTGlzdC5hZGQoc2VsZWN0ZWRDbGFzcyk7XG4gICAgICAgICAgb25TZWxlY3QgJiYgb25TZWxlY3QocCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcC5jbGFzc0xpc3QucmVtb3ZlKHNlbGVjdGVkQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuaGFuZGxlVG91Y2hPbk1lbnVJdGVtcyhcInBpY3R1cmVcIixcInBpY3R1cmUtc2VsZWN0ZWRcIiwoZWxlbWVudCkgPT4ge1xuICBwaWN0dXJlVXJsID0gZWxlbWVudC5zcmM7XG59KTtcbmhhbmRsZVRvdWNoT25NZW51SXRlbXMoXCJsZXZlbFwiLFwibGV2ZWwtc2VsZWN0ZWRcIiwoZWxlbWVudCkgPT4ge1xuICBwdXp6bGVEaWZmaWN1bHR5ID0gcGFyc2VJbnQoZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWxldmVsXCIpKTtcbn0pO1xuXG5mdW5jdGlvbiBkZWJ1Zyh0ZXh0KSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm9vYmFyXCIpLmlubmVySFRNTCArPSB0ZXh0ICsgXCI8YnIvPlwiO1xufVxuXG5jb25zdCBpbml0ID0gKCkgPT4ge1xuICBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgaW1nLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLG9uSW1hZ2UsZmFsc2UpO1xuICBpbWcuc3JjID0gcGljdHVyZVVybDtcbn1cblxuY29uc3Qgb25JbWFnZSA9IChlKSA9PiB7XG4gIHBpZWNlV2lkdGggPSBNYXRoLmZsb29yKGltZy53aWR0aCAvIHB1enpsZURpZmZpY3VsdHkpXG4gIHBpZWNlSGVpZ2h0ID0gTWF0aC5mbG9vcihpbWcuaGVpZ2h0IC8gcHV6emxlRGlmZmljdWx0eSlcbiAgcHV6emxlV2lkdGggPSBwaWVjZVdpZHRoICogcHV6emxlRGlmZmljdWx0eTtcbiAgcHV6emxlSGVpZ2h0ID0gcGllY2VIZWlnaHQgKiBwdXp6bGVEaWZmaWN1bHR5O1xuICBzZXRDYW52YXMoKTtcbiAgaW5pdFB1enpsZSgpO1xufVxuXG5jb25zdCBzZXRDYW52YXMgPSAoKSA9PiB7XG4gIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbiAgc3RhZ2UgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgY2FudmFzLndpZHRoID0gcHV6emxlV2lkdGg7XG4gIGNhbnZhcy5oZWlnaHQgPSBwdXp6bGVIZWlnaHQ7XG4gIGNhbnZhcy5zdHlsZS5ib3JkZXIgPSBcIjFweCBzb2xpZCBibGFja1wiO1xufVxuXG5jb25zdCBpbml0UHV6emxlID0gKCkgPT4ge1xuICBwaWVjZXMgPSBbXTtcbiAgY3VycmVudFBpZWNlID0gbnVsbDtcbiAgc3RhZ2UuZHJhd0ltYWdlKGltZywgMCwgMCwgcHV6emxlV2lkdGgsIHB1enpsZUhlaWdodCwgMCwgMCwgcHV6emxlV2lkdGgsIHB1enpsZUhlaWdodCk7XG4gIGJ1aWxkUGllY2VzKCk7XG59XG5cbmNvbnN0IGJ1aWxkUGllY2VzID0gKCkgPT4ge1xuICBwaWVjZXMgPSBbXTtcbiAgbGV0IHBpZWNlO1xuICBsZXQgcG9zWCA9IDA7XG4gIGxldCBwb3NZID0gMDtcbiAgZm9yIChsZXQgaSA9IDAgOyBpIDwgcHV6emxlRGlmZmljdWx0eSAqIHB1enpsZURpZmZpY3VsdHkgOyBpKyspIHtcbiAgICBwaWVjZSA9IHt9O1xuICAgIHBpZWNlLmNsaXBYID0gcG9zWDtcbiAgICBwaWVjZS5jbGlwWSA9IHBvc1k7XG4gICAgcGllY2UuaW5kZXggPSBpO1xuICAgIHBpZWNlcy5wdXNoKHBpZWNlKTtcbiAgICBwb3NYICs9IHBpZWNlV2lkdGg7XG4gICAgaWYgKHBvc1ggPj0gcHV6emxlV2lkdGgpIHtcbiAgICAgIHBvc1ggPSAwO1xuICAgICAgcG9zWSArPSBwaWVjZUhlaWdodDtcbiAgICB9XG4gIH1cbiAgc2h1ZmZsZVB1enpsZSgpO1xufVxuXG5cbi8vIFRPRE86IENvdWxkIGJlIG9wdGltaXplZCB0byBvbmx5IHJlZnJlc2ggdGhlIDIgYWZmZWN0ZWQgdGlsZXNcbmNvbnN0IHJlZnJlc2hQdXp6bGUgPSAoYm9yZGVyID0gdHJ1ZSkgPT4ge1xuICBzdGFnZS5jbGVhclJlY3QoMCwwLHB1enpsZVdpZHRoLHB1enpsZUhlaWdodCk7XG4gIGxldCBwb3NYID0gMDtcbiAgbGV0IHBvc1kgPSAwO1xuICBmb3IgKGxldCBpID0gMCA7IGkgPCBwaWVjZXMubGVuZ3RoIDsgaSsrKSB7XG4gICAgbGV0IHBpZWNlID0gcGllY2VzW2ldO1xuICAgIHBpZWNlLnBvc1ggPSBwb3NYO1xuICAgIHBpZWNlLnBvc1kgPSBwb3NZO1xuICAgIGxldCB7IGNsaXBYLGNsaXBZIH0gPSBwaWVjZTtcbiAgICBpZiAoYm9yZGVyKSB7XG4gICAgICBzdGFnZS5zdHJva2VTdHlsZT1cIiMwMDAwMDBcIjtcbiAgICAgIHN0YWdlLmxpbmVXaWR0aD01O1xuICAgICAgc3RhZ2Uuc3Ryb2tlUmVjdChwb3NYLHBvc1kscGllY2VXaWR0aCxwaWVjZUhlaWdodCk7XG4gICAgfVxuICAgIHN0YWdlLmRyYXdJbWFnZShpbWcsIGNsaXBYLCBjbGlwWSwgcGllY2VXaWR0aCwgcGllY2VIZWlnaHQsIHBvc1gsIHBvc1ksIHBpZWNlV2lkdGgsIHBpZWNlSGVpZ2h0KTtcbiAgICBwb3NYICs9IHBpZWNlV2lkdGg7XG4gICAgaWYgKHBvc1ggPj0gcHV6emxlV2lkdGgpIHtcbiAgICAgIHBvc1ggPSAwO1xuICAgICAgcG9zWSArPSBwaWVjZUhlaWdodDtcbiAgICB9XG4gIH1cbn1cblxuLy8gVE9ETzogc2hvdWxkIGJlIHVuaXQgdGVzdGVkIC0gRG9lcyBub3Qgc2VlbSB0byB3b3JrIGNvcnJlY3RseSA/XG5jb25zdCBoYXNOZWlnaGJvcnMgPSAocGllY2VzKSA9PiB7XG4gIGZvciAobGV0IGkgPSAwIDsgaSA8IHBpZWNlcy5sZW5ndGggOyBpKyspIHtcbiAgICBjb25zdCBwaWVjZSA9IHBpZWNlc1tpXTtcbiAgICAvLyBuZXh0IHRvIHRoZSByaWdodFxuICAgIGlmIChwaWVjZXNbaSsxXSkge1xuICAgICAgaWYgKHBpZWNlc1tpKzFdLmluZGV4ID09PSBwaWVjZS5pbmRleCArIDEpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIG5leHQgdG8gdGhlIGxlZnRcbiAgICBpZiAocGllY2VzW2ktMV0pIHtcbiAgICAgIGlmIChwaWVjZXNbaS0xXS5pbmRleCA9PT0gcGllY2UuaW5kZXggLSAxKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBiZWxvd1xuICAgIGlmIChwaWVjZXNbaSArIHB1enpsZURpZmZpY3VsdHldKSB7XG4gICAgICBpZiAocGllY2VzW2krcHV6emxlRGlmZmljdWx0eV0uaW5kZXggPT09IHBpZWNlLmluZGV4ICsgcHV6emxlRGlmZmljdWx0eSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBpZWNlc1tpIC0gcHV6emxlRGlmZmljdWx0eV0pIHtcbiAgICAgIGlmIChwaWVjZXNbaS1wdXp6bGVEaWZmaWN1bHR5XS5pbmRleCA9PT0gcGllY2UuaW5kZXggLSBwdXp6bGVEaWZmaWN1bHR5KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gU2h1ZmZsZSB1bnRpbCB0aGVyZSBhcmUgbm8gbWF0Y2hpbmcgbmVpZ2hib3JzLiBEb2VzIG5vdCBjaGVjayBhZGphY2VudCB0aWxlc1xuY29uc3Qgc2h1ZmZsZVByb3Blcmx5ID0gKGNvdW50LGNhbGxiYWNrKSA9PiB7XG4gIGRvY3VtZW50Lm9ubW91c2Vkb3duID0gZG9jdW1lbnQub250b3VjaGVuZCA9IGRvY3VtZW50LnRvdWNoZW5kID0gbnVsbCA7XG4gIGNvdW50Kys7XG4gIHBpZWNlcyA9IHNodWZmbGVBcnJheShwaWVjZXMpO1xuICByZWZyZXNoUHV6emxlKCk7XG4gIGlmIChjb3VudCA8IE1BWF9BVFRFTVBUX1RPX0FWT0lEX05FSUdIQk9SUyAmJiAhQUxMT1dfTUFUQ0hJTkdfTkVJR0hCT1JTICYmICFoYXNOZWlnaGJvcnMocGllY2VzKSkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNodWZmbGVQcm9wZXJseShjb3VudCxjYWxsYmFjayk7XG4gICAgfSwxMDApO1xuICB9IGVsc2Uge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cbn1cblxuY29uc3QgaXNNZW51T24gPSAoKSA9PiB7XG4gIHJldHVybiBtZW51RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJzaG93XCIpO1xufVxuXG5jb25zdCBvblNodWZmbGVkID0gKCkgPT4ge1xuICBkb2N1bWVudC5vbm1vdXNlZG93biA9IGRvY3VtZW50Lm9udG91Y2hlbmQgPSBkb2N1bWVudC50b3VjaGVuZCA9IChldmVudCkgPT4ge1xuXG4gICAgaWYgKGlzTWVudU9uKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc29sdmVkKSB7XG4gICAgICBzaHVmZmxlUHV6emxlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbGV0IHggPSAoZXZlbnQuY2xpZW50WCB8fCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYKSAtIHJlY3QubGVmdDtcbiAgICBsZXQgeSA9IChldmVudC5jbGllbnRZIHx8IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkpIC0gcmVjdC50b3A7XG5cbiAgICAvLyBJZiBjbGlja2luZyBvbiB0aGUgc2V0dGluZ3MgZ2VhciBpY29uXG4gICAgaWYgKHggPiByZWN0LnJpZ2h0IC0gMTQ4ICYmIHkgPiByZWN0LmJvdHRvbSAtIDEyMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBjdXJzb3JQb3NpdGlvbiA9IGdldEN1cnNvclBvc2l0aW9uKGNhbnZhcyxldmVudClcblxuICAgIGlmICghY3Vyc29yUG9zaXRpb24pIHtcbiAgICAgIC8vIElnbm9yZSBhY3Rpb24gYXMgaXQgaXMgb3V0c2lkZSB0aGUgcHV6emxlXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChjdXJyZW50UGllY2UpIHtcbiAgICAgIGxldCBzZWxlY3RlZEluZGV4ID0gY3Vyc29yUG9zaXRpb24uaW5kZXhYICsgKGN1cnNvclBvc2l0aW9uLmluZGV4WSAqIHB1enpsZURpZmZpY3VsdHkpO1xuICAgICAgbGV0IGN1cnJlbnRJbmRleCA9IGN1cnJlbnRQaWVjZS5pbmRleFggKyAoY3VycmVudFBpZWNlLmluZGV4WSAqIHB1enpsZURpZmZpY3VsdHkpO1xuICAgICAgLy8gU3dpdGNoIHBsYWNlc1xuICAgICAgbGV0IHRtcCA9IHBpZWNlc1tzZWxlY3RlZEluZGV4XTtcbiAgICAgIGxldCB0bXAyID0gcGllY2VzW2N1cnJlbnRJbmRleF07XG4gICAgICBwaWVjZXNbc2VsZWN0ZWRJbmRleF0gPSB0bXAyO1xuICAgICAgcGllY2VzW2N1cnJlbnRJbmRleF0gPSB0bXA7XG4gICAgICBjdXJyZW50UGllY2UgPSBudWxsO1xuICAgICAgcmVmcmVzaFB1enpsZSgpO1xuXG4gICAgICBpZiAoY2hlY2tQdXp6bGUoKSl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiV2VlZSBjb25mZXR0aSB0aW1lIVwiKTtcbiAgICAgICAgcmV0cnlJbWFnZS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcbiAgICAgICAgcmV0cnlJbWFnZS5jbGFzc0xpc3QuYWRkKFwic2hvd1wiKTtcblxuICAgICAgICBzb2x2ZWQgPSB0cnVlO1xuICAgICAgICByZWZyZXNoUHV6emxlKCFzb2x2ZWQpO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnRQaWVjZSA9IGN1cnNvclBvc2l0aW9uO1xuICAgICAgbWFya1BpZWNlKGN1cnJlbnRQaWVjZSk7XG4gICAgfVxuICB9O1xufVxuXG5jb25zdCBzaHVmZmxlUHV6emxlID0gKCkgPT4ge1xuXG4gIGlmIChpc01lbnVPbigpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0cnlJbWFnZS5jbGFzc0xpc3QucmVtb3ZlKFwic2hvd1wiKTtcbiAgcmV0cnlJbWFnZS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcblxuICBzb2x2ZWQgPSBmYWxzZTtcbiAgbGV0IGNvdW50ID0gMDtcbiAgc2h1ZmZsZVByb3Blcmx5KGNvdW50LG9uU2h1ZmZsZWQpO1xufVxuXG4vLyBDaGVjayBpZiB0aGUgcHV6emxlIGhhcyBiZWVuIHNvbHZlZFxuY29uc3QgY2hlY2tQdXp6bGUgPSAoKSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwaWVjZXMubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBjb25zdCBwaWVjZSA9IHBpZWNlc1tpXTtcbiAgICAgIGlmIChwaWVjZS5pbmRleCAhPT0gaSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5jb25zdCBtYXJrUGllY2UgPSAoe2luZGV4WCxpbmRleFl9KSA9PiB7XG4gIHN0YWdlLmdsb2JhbEFscGhhID0gMC4yO1xuICBzdGFnZS5maWxsU3R5bGUgPSBcIiNGRjAwMDBcIjtcbiAgc3RhZ2UuZmlsbFJlY3QoaW5kZXhYKnBpZWNlV2lkdGgsaW5kZXhZKnBpZWNlSGVpZ2h0LHBpZWNlV2lkdGgscGllY2VIZWlnaHQpO1xuICBzdGFnZS5nbG9iYWxBbHBoYSA9IDEuMDtcbn1cblxuY29uc3QgZ2V0Q3Vyc29yUG9zaXRpb24gPSAoY2FudmFzLCBldmVudCkgPT4ge1xuICAgIGxldCByZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxldCB4ID0gKGV2ZW50LmNsaWVudFggfHwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCkgLSByZWN0LmxlZnQ7XG4gICAgbGV0IHkgPSAoZXZlbnQuY2xpZW50WSB8fCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZKSAtIHJlY3QudG9wO1xuXG4gICAgbGV0IGluZGV4WCA9IE1hdGguZmxvb3IoeC9waWVjZVdpZHRoKTtcbiAgICBsZXQgaW5kZXhZID0gTWF0aC5mbG9vcih5L3BpZWNlSGVpZ2h0KTtcblxuICAgIC8vIE1ha2Ugc3VyZSBpdCBpcyBhIHZhbGlkIGluZGV4XG4gICAgaWYgKGluZGV4WSA+PSBwdXp6bGVEaWZmaWN1bHR5IHx8IGluZGV4WCA+PSBwdXp6bGVEaWZmaWN1bHR5KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpbmRleFgsIGluZGV4WSB9XG59XG5cbi8qKlxuICogUmFuZG9taXplIGFycmF5IGVsZW1lbnQgb3JkZXIgaW4tcGxhY2UuXG4gKiBVc2luZyBEdXJzdGVuZmVsZCBzaHVmZmxlIGFsZ29yaXRobS5cbiAqL1xuY29uc3Qgc2h1ZmZsZUFycmF5ID0gKGFycmF5KSA9PiB7XG4gIGZvciAobGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgIGNvbnN0IHRlbXAgPSBhcnJheVtpXTtcbiAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgIGFycmF5W2pdID0gdGVtcDtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21haW4uanMiXSwic291cmNlUm9vdCI6IiJ9