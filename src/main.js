import { play, stopSound } from "./sound";
import { showConfetti } from "./confetti";

let puzzleDifficulty = 2;
const ALLOW_MATCHING_NEIGHBORS = false;
const MAX_ATTEMPT_TO_AVOID_NEIGHBORS = 10;
const isTouchDevice = "ontouchstart" in document.documentElement;
const INTERACTION = isTouchDevice ? "touchend" : "click";
const INTERACTION_DOWN = isTouchDevice ? "mousedown" : "mousedown";

let stage;
let canvas;
let pictureUrl = document.querySelectorAll(".picture-item img")[0].src;

const PUZZLE_HOVER_TINT = "#FF0000";
let img;
let imgPlayIcon = null;
let imgSettingsIcon = null;
let pieces;
let puzzleWidth;
let puzzleHeight;
let pieceWidth;
let pieceHeight;
// The position (grid coords) of the source piece
let sourcePos;
// The piece being dragged
let dragPiece = null;
// Where to drop the piece when dragged
let dropPiece = null;
let solved = false;
let settings = false;
const playIcon = document.querySelector("#play-icon img");
const menuElement = document.querySelector("#menu");
const settingsImage = document.querySelector("#settings img");
const canvasElement = document.querySelector("#canvas");
const confettiElement = document.querySelector("#confetti");
const retryImage = document.querySelector("#retry img");

// Disable scrolling on touch devices
if (isTouchDevice) {
  document.addEventListener("touchmove", function(e) {
    e.preventDefault();
  });
}

// TODO: move to other module - simplify

playIcon.addEventListener(INTERACTION, e => {
  menuElement.classList.remove("show");
  menuElement.classList.add("hide");

  settingsImage.classList.remove("hide");
  settingsImage.classList.add("show");

  canvasElement.classList.remove("hide");
  canvasElement.classList.add("show");

  init();
});

settingsImage.addEventListener(INTERACTION, e => {
  menuElement.classList.remove("hide");
  menuElement.classList.add("show");

  settingsImage.classList.remove("show");
  settingsImage.classList.add("hide");

  retryImage.classList.remove("show");
  retryImage.classList.add("hide");

  canvasElement.classList.remove("show");
  canvasElement.classList.add("hide");

  confettiElement.classList.remove("show");
  confettiElement.classList.add("hide");

  document.onmousedown = document.ontouchend = document.touchend = null;
});

// Somehow older IOS version does not seem to handle event listener on multiple element.
const handleTouchOnMenuItems = (idPrefix, selectedClass, onSelect) => {
  let max = 0;
  for (let counter = 0; ; counter++) {
    let picture = document.querySelector(`#${idPrefix}-${counter}`);
    if (!picture) {
      max = counter;
      break;
    }
    picture.addEventListener(INTERACTION, e => {
      for (let i = 0; i < max; i++) {
        let p = document.querySelector(`#${idPrefix}-${i}`);
        if (i === counter) {
          p.classList.add(selectedClass);
          onSelect && onSelect(p);
        } else {
          p.classList.remove(selectedClass);
        }
      }
    });
  }
};

handleTouchOnMenuItems("picture", "picture-selected", element => {
  pictureUrl = element.src;
  stopSound(true);
  const picId = element.id;
  play(picId.substring(picId.indexOf("-") + 1), "picture");
});

handleTouchOnMenuItems("level", "level-selected", element => {
  puzzleDifficulty = parseInt(element.getAttribute("data-level"));
  stopSound(true);
  play(puzzleDifficulty - 2, "level");
});

const init = () => {
  img = new Image();
  img.addEventListener("load", onImage, false);
  img.src = pictureUrl;
};

const onImage = e => {
  pieceWidth = Math.floor(img.width / puzzleDifficulty);
  pieceHeight = Math.floor(img.height / puzzleDifficulty);
  puzzleWidth = pieceWidth * puzzleDifficulty;
  puzzleHeight = pieceHeight * puzzleDifficulty;
  setCanvas();
  initPuzzle();
};

const setCanvas = () => {
  canvas = document.getElementById("canvas");
  stage = canvas.getContext("2d");
  canvas.width = puzzleWidth;
  canvas.height = puzzleHeight;
  canvas.style.border = "1px solid black";
};

const initPuzzle = () => {
  pieces = [];
  sourcePos = null;
  dropPiece = null;
  stage.drawImage(
    img,
    0,
    0,
    puzzleWidth,
    puzzleHeight,
    0,
    0,
    puzzleWidth,
    puzzleHeight
  );
  buildPieces();
};

const buildPieces = () => {
  pieces = [];
  let piece;
  let x = 0;
  let y = 0;
  for (let i = 0; i < puzzleDifficulty * puzzleDifficulty; i++) {
    piece = {};
    piece.clipX = x;
    piece.clipY = y;
    piece.index = i;
    pieces.push(piece);
    x += pieceWidth;
    if (x >= puzzleWidth) {
      x = 0;
      y += pieceHeight;
    }
  }
  shufflePuzzle();
};

// TODO: Could be optimized to only refresh the 2 affected tiles
const refreshPuzzle = (border = true) => {
  stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
  let x = 0;
  let y = 0;
  for (let i = 0; i < pieces.length; i++) {
    let piece = pieces[i];
    piece.x = x;
    piece.y = y;
    let { clipX, clipY } = piece;
    if (border) {
      stage.strokeStyle = "#000000";
      stage.lineWidth = 2;
      stage.strokeRect(x, y, pieceWidth, pieceHeight);
    }
    stage.drawImage(
      img,
      clipX,
      clipY,
      pieceWidth,
      pieceHeight,
      x,
      y,
      pieceWidth,
      pieceHeight
    );
    x += pieceWidth;
    if (x >= puzzleWidth) {
      x = 0;
      y += pieceHeight;
    }
  }
};

// TODO: should be unit tested - Does not seem to work correctly ?
const hasNeighbors = pieces => {
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
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
      if (
        pieces[i + puzzleDifficulty].index ===
        piece.index + puzzleDifficulty
      ) {
        return false;
      }
    }

    if (pieces[i - puzzleDifficulty]) {
      if (
        pieces[i - puzzleDifficulty].index ===
        piece.index - puzzleDifficulty
      ) {
        return false;
      }
    }
  }

  return true;
};

// Shuffle until there are no matching neighbors. Does not check adjacent tiles
const shuffleProperly = (count, callback) => {
  document.onmousedown = document.ontouchend = document.touchend = null;
  count++;
  pieces = shuffleArray(pieces);
  refreshPuzzle();
  if (
    count < MAX_ATTEMPT_TO_AVOID_NEIGHBORS &&
    !ALLOW_MATCHING_NEIGHBORS &&
    !hasNeighbors(pieces)
  ) {
    setTimeout(function() {
      shuffleProperly(count, callback);
    }, 100);
  } else {
    callback();
  }
};

const isMenuOn = () => {
  return menuElement.classList.contains("show");
};

const onShuffled = () => {
  document.onmousedown = document.ontouchstart = event => {
    if (isMenuOn()) {
      return false;
    }

    if (solved) {
      confettiElement.classList.remove("show");
      confettiElement.classList.add("hide");
      stopSound(true);
      shufflePuzzle();
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const { x, y } = getTouchPos(canvas, event);

    // If clicking on the settings gear icon
    if (x > rect.right - 148 && y > rect.bottom - 120) {
      return false;
    }

    let tilePos = getTilePos(canvas, event);

    if (!tilePos) {
      // Ignore action as it is outside the puzzle
      return false;
    }

    let selectedIndex = tilePos.x + tilePos.y * puzzleDifficulty;
    dragPiece = pieces[selectedIndex];

    sourcePos = tilePos;
    markPiece(sourcePos, event);
  };
};

const shufflePuzzle = () => {
  if (isMenuOn()) {
    return false;
  }

  retryImage.classList.remove("show");
  retryImage.classList.add("hide");

  solved = false;
  let count = 0;

  shuffleProperly(count, onShuffled);
};

// Check if the puzzle has been solved
const checkPuzzle = () => {
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    if (piece.index !== i) {
      return false;
    }
  }
  return true;
};

const markPiece = ({ x, y }, event) => {
  document.onmousemove = document.ontouchmove = updatePuzzle;
  document.onmouseup = document.ontouchend = pieceDropped;
};

const updatePuzzle = event => {
  stage.clearRect(0, 0, puzzleWidth, puzzleHeight);
  let mouseX = 0;
  let mouseY = 0;
  dropPiece = null;

  if (event.layerX || event.layerX == 0) {
    mouseX = event.layerX - canvas.offsetLeft;
    mouseY = event.layerY - canvas.offsetTop;
  } else if (event.offsetX || event.offsetX == 0) {
    mouseX = event.offsetX - canvas.offsetLeft;
    mouseY = event.offsetY - canvas.offsetTop;
  }

  for (let i = 0; i < pieces.length; i++) {
    let piece = pieces[i];
    if (piece === dragPiece) {
      continue;
    }
    let { clipX, clipY } = piece;
    stage.drawImage(
      img,
      clipX,
      clipY,
      pieceWidth,
      pieceHeight,
      piece.x,
      piece.y,
      pieceWidth,
      pieceHeight
    );
    stage.lineWidth = 2;
    stage.strokeRect(piece.x, piece.y, pieceWidth, pieceHeight);

    if (dropPiece === null) {
      if (
        mouseX < piece.x ||
        mouseX > piece.x + pieceWidth ||
        mouseY < piece.y ||
        mouseY > piece.y + pieceHeight
      ) {
        // Not over a piece
      } else {
        dropPiece = piece;
        stage.save();
        stage.globalAlpha = 0.4;
        stage.fillStyle = PUZZLE_HOVER_TINT;
        stage.fillRect(dropPiece.x, dropPiece.y, pieceWidth, pieceHeight);
        stage.restore();
      }
    }
  }

  if (dragPiece) {
    stage.save();
    stage.globalAlpha = 0.5;
    stage.drawImage(
      img,
      dragPiece.clipX,
      dragPiece.clipY,
      pieceWidth,
      pieceHeight,
      mouseX - pieceWidth / 2,
      mouseY - pieceHeight / 2,
      pieceWidth,
      pieceHeight
    );
    stage.restore();
  }
};

const pieceDropped = event => {
  document.onmousemove = document.ontouchmove = null;
  document.onmouseup = document.ontouchend = null;

  if (dropPiece) {
    let tilePos = getTilePos(canvas, event);
    let selectedIndex = tilePos.x + tilePos.y * puzzleDifficulty;
    let currentIndex = sourcePos.x + sourcePos.y * puzzleDifficulty;

    // Switch places
    sourcePos = null;
    let tmp = pieces[selectedIndex];
    let tmp2 = pieces[currentIndex];
    pieces[selectedIndex] = tmp2;
    pieces[currentIndex] = tmp;
    refreshPuzzle(true);

    if (checkPuzzle()) {
      retryImage.classList.remove("hide");
      retryImage.classList.add("show");
      solved = true;

      // Queue the confetti cannon
      confettiElement.classList.remove("hide");
      confettiElement.classList.add("show");

      play(0, "victory");
      showConfetti();

      refreshPuzzle(false);
    }
  } else {
    refreshPuzzle(true);
  }
};

const getTouchPos = (canvas, event) => {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX || event.changedTouches[0].clientX) - rect.left;
  const y = (event.clientY || event.changedTouches[0].clientY) - rect.top;
  return { x, y };
};

const getTilePos = (canvas, event) => {
  let { x, y } = getTouchPos(canvas, event);
  let posX = Math.floor(x / pieceWidth);
  let posY = Math.floor(y / pieceHeight);
  // Make sure it is a valid index
  if (posY >= puzzleDifficulty || posX >= puzzleDifficulty) {
    return null;
  }

  return {
    x: posX,
    y: posY
  };
};

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};
