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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNWQ5NWM2OWExOTcyOGI4NjUzNjgiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uanMiXSwibmFtZXMiOlsicHV6emxlRGlmZmljdWx0eSIsIkFMTE9XX01BVENISU5HX05FSUdIQk9SUyIsIk1BWF9BVFRFTVBUX1RPX0FWT0lEX05FSUdIQk9SUyIsImlzVG91Y2hEZXZpY2UiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsIklOVEVSQUNUSU9OIiwic3RhZ2UiLCJjYW52YXMiLCJwaWN0dXJlVXJsIiwicXVlcnlTZWxlY3RvckFsbCIsInNyYyIsImltZyIsImltZ1BsYXlJY29uIiwiaW1nU2V0dGluZ3NJY29uIiwicGllY2VzIiwicHV6emxlV2lkdGgiLCJwdXp6bGVIZWlnaHQiLCJwaWVjZVdpZHRoIiwicGllY2VIZWlnaHQiLCJjdXJyZW50UGllY2UiLCJzb2x2ZWQiLCJzZXR0aW5ncyIsInBsYXlJY29uIiwicXVlcnlTZWxlY3RvciIsIm1lbnVFbGVtZW50Iiwic2V0dGluZ3NJbWFnZSIsImNhbnZhc0VsZW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsInByZXZlbnREZWZhdWx0IiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwiYWRkIiwiaW5pdCIsIm9ubW91c2Vkb3duIiwib250b3VjaGVuZCIsInRvdWNoZW5kIiwiaGFuZGxlVG91Y2hPbk1lbnVJdGVtcyIsImlkUHJlZml4Iiwic2VsZWN0ZWRDbGFzcyIsIm9uU2VsZWN0IiwibWF4IiwiY291bnRlciIsInBpY3R1cmUiLCJpIiwicCIsImVsZW1lbnQiLCJwYXJzZUludCIsImdldEF0dHJpYnV0ZSIsImRlYnVnIiwidGV4dCIsImlubmVySFRNTCIsIkltYWdlIiwib25JbWFnZSIsIk1hdGgiLCJmbG9vciIsIndpZHRoIiwiaGVpZ2h0Iiwic2V0Q2FudmFzIiwiaW5pdFB1enpsZSIsImdldEVsZW1lbnRCeUlkIiwiZ2V0Q29udGV4dCIsInN0eWxlIiwiYm9yZGVyIiwiZHJhd0ltYWdlIiwiYnVpbGRQaWVjZXMiLCJwaWVjZSIsInBvc1giLCJwb3NZIiwiY2xpcFgiLCJjbGlwWSIsImluZGV4IiwicHVzaCIsInNodWZmbGVQdXp6bGUiLCJyZWZyZXNoUHV6emxlIiwiY2xlYXJSZWN0IiwibGVuZ3RoIiwic3Ryb2tlU3R5bGUiLCJsaW5lV2lkdGgiLCJzdHJva2VSZWN0IiwiaGFzTmVpZ2hib3JzIiwic2h1ZmZsZVByb3Blcmx5IiwiY291bnQiLCJjYWxsYmFjayIsInNodWZmbGVBcnJheSIsInNldFRpbWVvdXQiLCJpc01lbnVPbiIsImNvbnRhaW5zIiwib25TaHVmZmxlZCIsImV2ZW50IiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIngiLCJjbGllbnRYIiwiY2hhbmdlZFRvdWNoZXMiLCJsZWZ0IiwieSIsImNsaWVudFkiLCJ0b3AiLCJyaWdodCIsImJvdHRvbSIsImN1cnNvclBvc2l0aW9uIiwiZ2V0Q3Vyc29yUG9zaXRpb24iLCJzZWxlY3RlZEluZGV4IiwiaW5kZXhYIiwiaW5kZXhZIiwiY3VycmVudEluZGV4IiwidG1wIiwidG1wMiIsImNoZWNrUHV6emxlIiwiY29uc29sZSIsImxvZyIsIm1hcmtQaWVjZSIsImdsb2JhbEFscGhhIiwiZmlsbFN0eWxlIiwiZmlsbFJlY3QiLCJhcnJheSIsImoiLCJyYW5kb20iLCJ0ZW1wIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbURBQTJDLGNBQWM7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FB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TixDQUFxQixDQUFyQixFQUF3QkcsT0FBMUMsSUFBcURQLEtBQUtRLEdBQWxFOztBQUVBLE1BQUlNLFNBQVNsRCxLQUFLQyxLQUFMLENBQVdxQyxJQUFFM0UsVUFBYixDQUFiO0FBQ0EsTUFBSXdGLFNBQVNuRCxLQUFLQyxLQUFMLENBQVd5QyxJQUFFOUUsV0FBYixDQUFiOztBQUVBO0FBQ0EsTUFBSXVGLFVBQVUxRyxnQkFBVixJQUE4QnlHLFVBQVV6RyxnQkFBNUMsRUFBOEQ7QUFDNUQsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQsU0FBTyxFQUFFeUcsY0FBRixFQUFVQyxjQUFWLEVBQVA7QUFDSCxDQWREOztBQWdCQTs7OztBQUlBLElBQU1yQixlQUFlLFNBQWZBLFlBQWUsQ0FBQ2dDLEtBQUQsRUFBVztBQUM5QixPQUFLLElBQUl4RSxJQUFJd0UsTUFBTXhDLE1BQU4sR0FBZSxDQUE1QixFQUErQmhDLElBQUksQ0FBbkMsRUFBc0NBLEdBQXRDLEVBQTJDO0FBQ3pDLFFBQU15RSxJQUFJL0QsS0FBS0MsS0FBTCxDQUFXRCxLQUFLZ0UsTUFBTCxNQUFpQjFFLElBQUksQ0FBckIsQ0FBWCxDQUFWO0FBQ0EsUUFBTTJFLE9BQU9ILE1BQU14RSxDQUFOLENBQWI7QUFDQXdFLFVBQU14RSxDQUFOLElBQVd3RSxNQUFNQyxDQUFOLENBQVg7QUFDQUQsVUFBTUMsQ0FBTixJQUFXRSxJQUFYO0FBQ0Q7QUFDRCxTQUFPSCxLQUFQO0FBQ0QsQ0FSRCxDIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDVkOTVjNjlhMTk3MjhiODY1MzY4IiwibGV0IHB1enpsZURpZmZpY3VsdHkgPSAyO1xuY29uc3QgQUxMT1dfTUFUQ0hJTkdfTkVJR0hCT1JTID0gZmFsc2U7XG5jb25zdCBNQVhfQVRURU1QVF9UT19BVk9JRF9ORUlHSEJPUlMgPSAxMDtcbmNvbnN0IGlzVG91Y2hEZXZpY2UgPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5jb25zdCBJTlRFUkFDVElPTiA9IGlzVG91Y2hEZXZpY2UgID8gXCJ0b3VjaGVuZFwiIDogXCJjbGlja1wiO1xuXG5sZXQgc3RhZ2U7XG5sZXQgY2FudmFzO1xubGV0IHBpY3R1cmVVcmwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnBpY3R1cmUtaXRlbSBpbWdcIilbMF0uc3JjO1xuXG5sZXQgaW1nO1xubGV0IGltZ1BsYXlJY29uID0gbnVsbDtcbmxldCBpbWdTZXR0aW5nc0ljb24gPSBudWxsO1xubGV0IHBpZWNlcztcbmxldCBwdXp6bGVXaWR0aDtcbmxldCBwdXp6bGVIZWlnaHQ7XG5sZXQgcGllY2VXaWR0aDtcbmxldCBwaWVjZUhlaWdodDtcbmxldCBjdXJyZW50UGllY2U7XG5sZXQgc29sdmVkID0gZmFsc2U7XG5sZXQgc2V0dGluZ3MgPSBmYWxzZTtcbmNvbnN0IHBsYXlJY29uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5LWljb24gaW1nXCIpO1xuY29uc3QgbWVudUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnVcIilcbmNvbnN0IHNldHRpbmdzSW1hZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NldHRpbmdzIGltZ1wiKVxuY29uc3QgY2FudmFzRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2FudmFzXCIpXG5cbi8vIERpc2FibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXNcbmlmIChpc1RvdWNoRGV2aWNlKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIH0pO1xufVxuXG4vLyBUT0RPOiBtb3ZlIHRvIG90aGVyIG1vZHVsZSAtIHNpbXBsaWZ5XG5cbnBsYXlJY29uLmFkZEV2ZW50TGlzdGVuZXIoSU5URVJBQ1RJT04sKGUpID0+IHtcbiAgbWVudUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcInNob3dcIik7XG4gIG1lbnVFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXG4gIHNldHRpbmdzSW1hZ2UuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XG4gIHNldHRpbmdzSW1hZ2UuY2xhc3NMaXN0LmFkZChcInNob3dcIik7XG5cbiAgY2FudmFzRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcbiAgY2FudmFzRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwic2hvd1wiKTtcblxuICBpbml0KCk7XG59KTtcblxuc2V0dGluZ3NJbWFnZS5hZGRFdmVudExpc3RlbmVyKElOVEVSQUNUSU9OLCAoZSkgPT4ge1xuICBtZW51RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcbiAgbWVudUVsZW1lbnQuY2xhc3NMaXN0LmFkZChcInNob3dcIik7XG5cbiAgc2V0dGluZ3NJbWFnZS5jbGFzc0xpc3QucmVtb3ZlKFwic2hvd1wiKTtcbiAgc2V0dGluZ3NJbWFnZS5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcblxuICBjYW52YXNFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJzaG93XCIpO1xuICBjYW52YXNFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuXG4gIGRvY3VtZW50Lm9ubW91c2Vkb3duID0gZG9jdW1lbnQub250b3VjaGVuZCA9IGRvY3VtZW50LnRvdWNoZW5kID0gbnVsbDtcblxufSk7XG5cbi8vIFNvbWVob3cgb2xkZXIgSU9TIHZlcnNpb24gZG9lcyBub3Qgc2VlbSB0byBoYW5kbGUgZXZlbnQgbGlzdGVuZXIgb24gbXVsdGlwbGUgZWxlbWVudC5cbmNvbnN0IGhhbmRsZVRvdWNoT25NZW51SXRlbXMgPSAoaWRQcmVmaXgsIHNlbGVjdGVkQ2xhc3MsIG9uU2VsZWN0KSA9PiB7XG4gIGxldCBtYXggPSAwO1xuICBmb3IgKGxldCBjb3VudGVyID0gMCA7IDsgY291bnRlcisrKSB7XG4gICAgbGV0IHBpY3R1cmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZFByZWZpeH0tJHtjb3VudGVyfWApO1xuICAgIGlmICghcGljdHVyZSkge1xuICAgICAgbWF4ID0gY291bnRlcjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBwaWN0dXJlLmFkZEV2ZW50TGlzdGVuZXIoSU5URVJBQ1RJT04sKGUpID0+IHtcbiAgICAgIGZvciAobGV0IGkgPSAwIDsgaSA8IG1heCA7IGkrKykge1xuICAgICAgICBsZXQgcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkUHJlZml4fS0ke2l9YCk7XG4gICAgICAgIGlmIChpID09PSBjb3VudGVyKSB7XG4gICAgICAgICAgcC5jbGFzc0xpc3QuYWRkKHNlbGVjdGVkQ2xhc3MpO1xuICAgICAgICAgIG9uU2VsZWN0ICYmIG9uU2VsZWN0KHApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHAuY2xhc3NMaXN0LnJlbW92ZShzZWxlY3RlZENsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmhhbmRsZVRvdWNoT25NZW51SXRlbXMoXCJwaWN0dXJlXCIsXCJwaWN0dXJlLXNlbGVjdGVkXCIsKGVsZW1lbnQpID0+IHtcbiAgcGljdHVyZVVybCA9IGVsZW1lbnQuc3JjO1xufSk7XG5oYW5kbGVUb3VjaE9uTWVudUl0ZW1zKFwibGV2ZWxcIixcImxldmVsLXNlbGVjdGVkXCIsKGVsZW1lbnQpID0+IHtcbiAgcHV6emxlRGlmZmljdWx0eSA9IHBhcnNlSW50KGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1sZXZlbFwiKSk7XG59KTtcblxuZnVuY3Rpb24gZGVidWcodGV4dCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Zvb2JhclwiKS5pbm5lckhUTUwgKz0gdGV4dCArIFwiPGJyLz5cIjtcbn1cblxuY29uc3QgaW5pdCA9ICgpID0+IHtcbiAgaW1nID0gbmV3IEltYWdlKCk7XG4gIGltZy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJyxvbkltYWdlLGZhbHNlKTtcbiAgaW1nLnNyYyA9IHBpY3R1cmVVcmw7XG59XG5cbmNvbnN0IG9uSW1hZ2UgPSAoZSkgPT4ge1xuICBwaWVjZVdpZHRoID0gTWF0aC5mbG9vcihpbWcud2lkdGggLyBwdXp6bGVEaWZmaWN1bHR5KVxuICBwaWVjZUhlaWdodCA9IE1hdGguZmxvb3IoaW1nLmhlaWdodCAvIHB1enpsZURpZmZpY3VsdHkpXG4gIHB1enpsZVdpZHRoID0gcGllY2VXaWR0aCAqIHB1enpsZURpZmZpY3VsdHk7XG4gIHB1enpsZUhlaWdodCA9IHBpZWNlSGVpZ2h0ICogcHV6emxlRGlmZmljdWx0eTtcbiAgc2V0Q2FudmFzKCk7XG4gIGluaXRQdXp6bGUoKTtcbn1cblxuY29uc3Qgc2V0Q2FudmFzID0gKCkgPT4ge1xuICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG4gIHN0YWdlID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIGNhbnZhcy53aWR0aCA9IHB1enpsZVdpZHRoO1xuICBjYW52YXMuaGVpZ2h0ID0gcHV6emxlSGVpZ2h0O1xuICBjYW52YXMuc3R5bGUuYm9yZGVyID0gXCIxcHggc29saWQgYmxhY2tcIjtcbn1cblxuY29uc3QgaW5pdFB1enpsZSA9ICgpID0+IHtcbiAgcGllY2VzID0gW107XG4gIGN1cnJlbnRQaWVjZSA9IG51bGw7XG4gIHN0YWdlLmRyYXdJbWFnZShpbWcsIDAsIDAsIHB1enpsZVdpZHRoLCBwdXp6bGVIZWlnaHQsIDAsIDAsIHB1enpsZVdpZHRoLCBwdXp6bGVIZWlnaHQpO1xuICBidWlsZFBpZWNlcygpO1xufVxuXG5jb25zdCBidWlsZFBpZWNlcyA9ICgpID0+IHtcbiAgcGllY2VzID0gW107XG4gIGxldCBwaWVjZTtcbiAgbGV0IHBvc1ggPSAwO1xuICBsZXQgcG9zWSA9IDA7XG4gIGZvciAobGV0IGkgPSAwIDsgaSA8IHB1enpsZURpZmZpY3VsdHkgKiBwdXp6bGVEaWZmaWN1bHR5IDsgaSsrKSB7XG4gICAgcGllY2UgPSB7fTtcbiAgICBwaWVjZS5jbGlwWCA9IHBvc1g7XG4gICAgcGllY2UuY2xpcFkgPSBwb3NZO1xuICAgIHBpZWNlLmluZGV4ID0gaTtcbiAgICBwaWVjZXMucHVzaChwaWVjZSk7XG4gICAgcG9zWCArPSBwaWVjZVdpZHRoO1xuICAgIGlmIChwb3NYID49IHB1enpsZVdpZHRoKSB7XG4gICAgICBwb3NYID0gMDtcbiAgICAgIHBvc1kgKz0gcGllY2VIZWlnaHQ7XG4gICAgfVxuICB9XG4gIHNodWZmbGVQdXp6bGUoKTtcbn1cblxuXG4vLyBUT0RPOiBDb3VsZCBiZSBvcHRpbWl6ZWQgdG8gb25seSByZWZyZXNoIHRoZSAyIGFmZmVjdGVkIHRpbGVzXG5jb25zdCByZWZyZXNoUHV6emxlID0gKGJvcmRlciA9IHRydWUpID0+IHtcbiAgc3RhZ2UuY2xlYXJSZWN0KDAsMCxwdXp6bGVXaWR0aCxwdXp6bGVIZWlnaHQpO1xuICBsZXQgcG9zWCA9IDA7XG4gIGxldCBwb3NZID0gMDtcbiAgZm9yIChsZXQgaSA9IDAgOyBpIDwgcGllY2VzLmxlbmd0aCA7IGkrKykge1xuICAgIGxldCBwaWVjZSA9IHBpZWNlc1tpXTtcbiAgICBwaWVjZS5wb3NYID0gcG9zWDtcbiAgICBwaWVjZS5wb3NZID0gcG9zWTtcbiAgICBsZXQgeyBjbGlwWCxjbGlwWSB9ID0gcGllY2U7XG4gICAgaWYgKGJvcmRlcikge1xuICAgICAgc3RhZ2Uuc3Ryb2tlU3R5bGU9XCIjMDAwMDAwXCI7XG4gICAgICBzdGFnZS5saW5lV2lkdGg9NTtcbiAgICAgIHN0YWdlLnN0cm9rZVJlY3QocG9zWCxwb3NZLHBpZWNlV2lkdGgscGllY2VIZWlnaHQpO1xuICAgIH1cbiAgICBzdGFnZS5kcmF3SW1hZ2UoaW1nLCBjbGlwWCwgY2xpcFksIHBpZWNlV2lkdGgsIHBpZWNlSGVpZ2h0LCBwb3NYLCBwb3NZLCBwaWVjZVdpZHRoLCBwaWVjZUhlaWdodCk7XG4gICAgcG9zWCArPSBwaWVjZVdpZHRoO1xuICAgIGlmIChwb3NYID49IHB1enpsZVdpZHRoKSB7XG4gICAgICBwb3NYID0gMDtcbiAgICAgIHBvc1kgKz0gcGllY2VIZWlnaHQ7XG4gICAgfVxuICB9XG59XG5cbi8vIFRPRE86IHNob3VsZCBiZSB1bml0IHRlc3RlZCAtIERvZXMgbm90IHNlZW0gdG8gd29yayBjb3JyZWN0bHkgP1xuY29uc3QgaGFzTmVpZ2hib3JzID0gKHBpZWNlcykgPT4ge1xuICBmb3IgKGxldCBpID0gMCA7IGkgPCBwaWVjZXMubGVuZ3RoIDsgaSsrKSB7XG4gICAgY29uc3QgcGllY2UgPSBwaWVjZXNbaV07XG4gICAgLy8gbmV4dCB0byB0aGUgcmlnaHRcbiAgICBpZiAocGllY2VzW2krMV0pIHtcbiAgICAgIGlmIChwaWVjZXNbaSsxXS5pbmRleCA9PT0gcGllY2UuaW5kZXggKyAxKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBuZXh0IHRvIHRoZSBsZWZ0XG4gICAgaWYgKHBpZWNlc1tpLTFdKSB7XG4gICAgICBpZiAocGllY2VzW2ktMV0uaW5kZXggPT09IHBpZWNlLmluZGV4IC0gMSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYmVsb3dcbiAgICBpZiAocGllY2VzW2kgKyBwdXp6bGVEaWZmaWN1bHR5XSkge1xuICAgICAgaWYgKHBpZWNlc1tpK3B1enpsZURpZmZpY3VsdHldLmluZGV4ID09PSBwaWVjZS5pbmRleCArIHB1enpsZURpZmZpY3VsdHkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwaWVjZXNbaSAtIHB1enpsZURpZmZpY3VsdHldKSB7XG4gICAgICBpZiAocGllY2VzW2ktcHV6emxlRGlmZmljdWx0eV0uaW5kZXggPT09IHBpZWNlLmluZGV4IC0gcHV6emxlRGlmZmljdWx0eSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIFNodWZmbGUgdW50aWwgdGhlcmUgYXJlIG5vIG1hdGNoaW5nIG5laWdoYm9ycy4gRG9lcyBub3QgY2hlY2sgYWRqYWNlbnQgdGlsZXNcbmNvbnN0IHNodWZmbGVQcm9wZXJseSA9IChjb3VudCxjYWxsYmFjaykgPT4ge1xuICBkb2N1bWVudC5vbm1vdXNlZG93biA9IGRvY3VtZW50Lm9udG91Y2hlbmQgPSBkb2N1bWVudC50b3VjaGVuZCA9IG51bGwgO1xuICBjb3VudCsrO1xuICBwaWVjZXMgPSBzaHVmZmxlQXJyYXkocGllY2VzKTtcbiAgcmVmcmVzaFB1enpsZSgpO1xuICBpZiAoY291bnQgPCBNQVhfQVRURU1QVF9UT19BVk9JRF9ORUlHSEJPUlMgJiYgIUFMTE9XX01BVENISU5HX05FSUdIQk9SUyAmJiAhaGFzTmVpZ2hib3JzKHBpZWNlcykpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBzaHVmZmxlUHJvcGVybHkoY291bnQsY2FsbGJhY2spO1xuICAgIH0sMTAwKTtcbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjaygpO1xuICB9XG59XG5cbmNvbnN0IGlzTWVudU9uID0gKCkgPT4ge1xuICByZXR1cm4gbWVudUVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwic2hvd1wiKTtcbn1cblxuY29uc3Qgb25TaHVmZmxlZCA9ICgpID0+IHtcbiAgZG9jdW1lbnQub25tb3VzZWRvd24gPSBkb2N1bWVudC5vbnRvdWNoZW5kID0gZG9jdW1lbnQudG91Y2hlbmQgPSAoZXZlbnQpID0+IHtcblxuICAgIGlmIChpc01lbnVPbigpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHNvbHZlZCkge1xuICAgICAgc2h1ZmZsZVB1enpsZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCByZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxldCB4ID0gKGV2ZW50LmNsaWVudFggfHwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCkgLSByZWN0LmxlZnQ7XG4gICAgbGV0IHkgPSAoZXZlbnQuY2xpZW50WSB8fCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZKSAtIHJlY3QudG9wO1xuXG4gICAgLy8gSWYgY2xpY2tpbmcgb24gdGhlIHNldHRpbmdzIGdlYXIgaWNvblxuICAgIGlmICh4ID4gcmVjdC5yaWdodCAtIDE0OCAmJiB5ID4gcmVjdC5ib3R0b20gLSAxMjApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgY3Vyc29yUG9zaXRpb24gPSBnZXRDdXJzb3JQb3NpdGlvbihjYW52YXMsZXZlbnQpXG5cbiAgICBpZiAoIWN1cnNvclBvc2l0aW9uKSB7XG4gICAgICAvLyBJZ25vcmUgYWN0aW9uIGFzIGl0IGlzIG91dHNpZGUgdGhlIHB1enpsZVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoY3VycmVudFBpZWNlKSB7XG4gICAgICBsZXQgc2VsZWN0ZWRJbmRleCA9IGN1cnNvclBvc2l0aW9uLmluZGV4WCArIChjdXJzb3JQb3NpdGlvbi5pbmRleFkgKiBwdXp6bGVEaWZmaWN1bHR5KTtcbiAgICAgIGxldCBjdXJyZW50SW5kZXggPSBjdXJyZW50UGllY2UuaW5kZXhYICsgKGN1cnJlbnRQaWVjZS5pbmRleFkgKiBwdXp6bGVEaWZmaWN1bHR5KTtcbiAgICAgIC8vIFN3aXRjaCBwbGFjZXNcbiAgICAgIGxldCB0bXAgPSBwaWVjZXNbc2VsZWN0ZWRJbmRleF07XG4gICAgICBsZXQgdG1wMiA9IHBpZWNlc1tjdXJyZW50SW5kZXhdO1xuICAgICAgcGllY2VzW3NlbGVjdGVkSW5kZXhdID0gdG1wMjtcbiAgICAgIHBpZWNlc1tjdXJyZW50SW5kZXhdID0gdG1wO1xuICAgICAgY3VycmVudFBpZWNlID0gbnVsbDtcbiAgICAgIHJlZnJlc2hQdXp6bGUoKTtcblxuICAgICAgaWYgKGNoZWNrUHV6emxlKCkpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIldlZWUgY29uZmV0dGkgdGltZSFcIik7XG4gICAgICAgIHNvbHZlZCA9IHRydWU7XG4gICAgICAgIHJlZnJlc2hQdXp6bGUoIXNvbHZlZCk7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudFBpZWNlID0gY3Vyc29yUG9zaXRpb247XG4gICAgICBtYXJrUGllY2UoY3VycmVudFBpZWNlKTtcbiAgICB9XG4gIH07XG59XG5cbmNvbnN0IHNodWZmbGVQdXp6bGUgPSAoKSA9PiB7XG5cbiAgaWYgKGlzTWVudU9uKCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzb2x2ZWQgPSBmYWxzZTtcbiAgbGV0IGNvdW50ID0gMDtcbiAgc2h1ZmZsZVByb3Blcmx5KGNvdW50LG9uU2h1ZmZsZWQpO1xufVxuXG4vLyBDaGVjayBpZiB0aGUgcHV6emxlIGhhcyBiZWVuIHNvbHZlZFxuY29uc3QgY2hlY2tQdXp6bGUgPSAoKSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwaWVjZXMubGVuZ3RoIDsgaSsrKSB7XG4gICAgICBjb25zdCBwaWVjZSA9IHBpZWNlc1tpXTtcbiAgICAgIGlmIChwaWVjZS5pbmRleCAhPT0gaSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5jb25zdCBtYXJrUGllY2UgPSAoe2luZGV4WCxpbmRleFl9KSA9PiB7XG4gIHN0YWdlLmdsb2JhbEFscGhhID0gMC4yO1xuICBzdGFnZS5maWxsU3R5bGUgPSBcIiNGRjAwMDBcIjtcbiAgc3RhZ2UuZmlsbFJlY3QoaW5kZXhYKnBpZWNlV2lkdGgsaW5kZXhZKnBpZWNlSGVpZ2h0LHBpZWNlV2lkdGgscGllY2VIZWlnaHQpO1xuICBzdGFnZS5nbG9iYWxBbHBoYSA9IDEuMDtcbn1cblxuY29uc3QgZ2V0Q3Vyc29yUG9zaXRpb24gPSAoY2FudmFzLCBldmVudCkgPT4ge1xuICAgIGxldCByZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxldCB4ID0gKGV2ZW50LmNsaWVudFggfHwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCkgLSByZWN0LmxlZnQ7XG4gICAgbGV0IHkgPSAoZXZlbnQuY2xpZW50WSB8fCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZKSAtIHJlY3QudG9wO1xuXG4gICAgbGV0IGluZGV4WCA9IE1hdGguZmxvb3IoeC9waWVjZVdpZHRoKTtcbiAgICBsZXQgaW5kZXhZID0gTWF0aC5mbG9vcih5L3BpZWNlSGVpZ2h0KTtcblxuICAgIC8vIE1ha2Ugc3VyZSBpdCBpcyBhIHZhbGlkIGluZGV4XG4gICAgaWYgKGluZGV4WSA+PSBwdXp6bGVEaWZmaWN1bHR5IHx8IGluZGV4WCA+PSBwdXp6bGVEaWZmaWN1bHR5KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpbmRleFgsIGluZGV4WSB9XG59XG5cbi8qKlxuICogUmFuZG9taXplIGFycmF5IGVsZW1lbnQgb3JkZXIgaW4tcGxhY2UuXG4gKiBVc2luZyBEdXJzdGVuZmVsZCBzaHVmZmxlIGFsZ29yaXRobS5cbiAqL1xuY29uc3Qgc2h1ZmZsZUFycmF5ID0gKGFycmF5KSA9PiB7XG4gIGZvciAobGV0IGkgPSBhcnJheS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgIGNvbnN0IHRlbXAgPSBhcnJheVtpXTtcbiAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgIGFycmF5W2pdID0gdGVtcDtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21haW4uanMiXSwic291cmNlUm9vdCI6IiJ9