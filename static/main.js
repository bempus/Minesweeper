const config = {
  mines: 30,
  rows: 16,
  size: 1,
  minRows: 3,
  maxMines: 85,
};
let gameOver = false;
let defaultFace = "normal";
const resetBtn = document.querySelector("#reset");
const resBtnImg = resetBtn.querySelector("img");

const setFace = (face) => {
  resBtnImg.src = `./img/face/${face || defaultFace}_nb.png`;
};

const gameBoard = document.querySelector(".game");

const newGame = () => {
  if (!window.localStorage.getItem("win")) {
    window.localStorage.setItem("win", 0);
  }
  let wins = Number(window.localStorage.getItem("win"));
  const winsContainer = document.querySelector("#wins");
  winsContainer.textContent = wins;
  gameBoard.removeAttribute("win");
  if (config.mines > config.maxMines) config.mines = config.maxMines;
  if (config.rows < config.minRows) config.rows = config.minRows;
  gameOver = false;
  defaultFace = "normal";
  setFace();
  gameBoard.innerHTML = "";
  let firstClick = true;

  const addWin = () => {
    wins++;
    console.log(wins);

    window.localStorage.setItem("win", wins);
    winsContainer.textContent = wins;
  };

  const addMine = (exclude) => {
    const mine = `c${Math.floor(Math.random() * config.rows)}_${Math.floor(
      Math.random() * config.rows
    )}`;
    if (document.querySelector("#cheat").checked) {
      if (document.querySelector(`#${mine}[revealed]`)) return;
    }
    if (mine === exclude) return;
    mines.add(mine);
  };

  const explode = () => {
    mines.forEach((mine) => {
      document.querySelector(`#${mine}`).classList.add("exploded");
    });
    gameOver = true;
  };

  const getAdjacentIds = (id) => {
    const [oldX, oldY] = id
      .replace("c", "")
      .split("_")
      .map((el) => Number(el));
    return [
      [1, 1],
      [1, 0],
      [1, -1],
      [0, 1],
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
    ]
      .map(([x, y]) => {
        const newX = oldX + x;
        const newY = oldY + y;
        if (
          newX < 0 ||
          newY < 0 ||
          newX > config.rows - 1 ||
          newY > config.rows - 1
        )
          return;

        return `c${newX}_${newY}`;
      })
      .filter((el) => el);
  };

  const checkWin = () => {
    if (
      document.querySelectorAll(".col:not([revealed])").length === mines.size
    ) {
      document.querySelector(".game").setAttribute("win", true);
      revealAll();
      gameOver = true;
      defaultFace = "win";
      addWin();
      setTimeout(() => alert("Congratulations, you won!"), 250);
    }
  };

  const handleClick = (e) => {
    if (gameOver) return;
    if (e.target.getAttribute("revealed")) return;
    if (e.target.getAttribute("flagged")) return;
    if (mines.has(e.target.id)) {
      if (firstClick || document.querySelector("#cheat").checked) {
        mines.delete(e.target.id);
        while (mines.size < config.mines) {
          addMine(e.target.id);
        }
        return handleClick(e);
      }
      defaultFace = "angry";
      setFace();
      return explode();
    }
    e.target.setAttribute("revealed", true);
    firstClick = false;
    const adjacentIds = getAdjacentIds(e.target.id);
    const adjacentMinesCount = adjacentMines(adjacentIds);

    if (!adjacentMinesCount) {
      e.target.style.background = "#eee";

      adjacentIds.forEach((id) =>
        handleClick({ target: document.getElementById(id) })
      );
      checkWin();
      return;
    }
    e.target.style.backgroundImage = `url(./img/numbers/${adjacentMinesCount}.svg)`;
    checkWin();
  };

  const handleRightClick = (e) => {
    e.preventDefault();

    if (gameOver) return;
    if (e.target.getAttribute("revealed")) return;
    e.target.getAttribute("flagged")
      ? e.target.removeAttribute("flagged")
      : e.target.setAttribute("flagged", true);
  };

  const adjacentMines = (ids) => {
    let mineCount = 0;
    ids.forEach((id) => {
      if (mines.has(id)) mineCount++;
    });
    return mineCount;
  };

  const mines = new Set();

  while (mines.size < config.mines) {
    addMine();
  }

  for (let i = 0; i < config.rows; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < config.rows; j++) {
      const col = document.createElement("div");
      col.classList.add("col");
      row.appendChild(col);
      col.id = `c${i}_${j}`;
      col.onclick = handleClick;
      col.onmouseenter = (e) => {
        if (
          e.buttons === 1 &&
          !e.target.getAttribute("revealed") &&
          !gameOver
        ) {
          e.target.style.borderStyle = "inset";
        }
      };
      col.onmouseleave = (e) => {
        e.target.style.borderStyle = null;
      };
      col.oncontextmenu = handleRightClick;
    }
    document.querySelector(".game").appendChild(row);
  }

  const revealAll = () => {
    document.querySelectorAll(".col").forEach((el) => {
      el.setAttribute("revealed", true);
      if (mines.has(el.id)) {
        el.classList.add("exploded");
        return;
      }

      const adjacentIds = getAdjacentIds(el.id);
      const adjacentMinesCount = adjacentMines(adjacentIds);

      if (!adjacentMinesCount) {
        el.style.backgroundColor = "#eee";
        return;
      }

      el.style.backgroundImage = `url(./img/numbers/${adjacentMinesCount}.svg)`;
    });
    if (document.querySelector("#cheat").checked) {
      defaultFace = "cheat_win";
      setFace();
      if (gameOver) return;
      addWin();
      gameOver = true;
      gameBoard.setAttribute("win", "cheat");
      setTimeout(() => alert("You won, you cheater!"), 250);
    }
  };
  document.querySelector("#revealAll").onclick = revealAll;
};

const gridSetting = document.querySelector("#grid");

const updateRows = () => {
  if (gridSetting.value < config.minRows) gridSetting.value = config.minRows;
  gridSetting.dataset.value = gridSetting.value;
  config.rows = Number(gridSetting.value);
  config.maxMines = Math.floor((config.rows * config.rows) / 3);
  updateMines();
  document
    .querySelectorAll("[grid]")
    .forEach((el) => (el.innerHTML = gridSetting.value));

  newGame();
};

gridSetting.addEventListener("input", (e) => {
  updateRows();
});

const mineSetting = document.querySelector("#mines");

const updateMines = () => {
  mineSetting.max = config.maxMines;
  const value = Number(mineSetting.value);
  if (value > config.maxMines) mineSetting.value = config.maxMines;
  if (value < 1) mineSetting.value = 1;

  document.querySelector("#mineDisplay").textContent = value;
  config.mines = value;
  newGame();
};

mineSetting.addEventListener("input", (e) => {
  updateMines();
});

const sizeSetting = document.querySelector("#size");

const updateSize = (e) => {
  config.size = e.target.value;
  document
    .querySelector(":root")
    .style.setProperty("--boxSize", `${config.size}em`);
  document.querySelector("#sizeDisplay").textContent = config.size;
};

sizeSetting.addEventListener("input", updateSize);

document
  .querySelector("#toggle-settings-button")
  .addEventListener("click", (e) => {
    const aside = document.querySelector("aside");
    if (aside.getAttribute("expanded")) {
      aside.removeAttribute("expanded");
      e.target.textContent = "V";
      return;
    }
    aside.setAttribute("expanded", true);
    e.target.textContent = "X";
  });

resetBtn.addEventListener("click", newGame);
const main = document.querySelector("main");

main.addEventListener(
  "mouseover",
  (e) => e.buttons === 1 && !gameOver && setFace("scared")
);

main.addEventListener("mouseout", (e) => setFace());
main.addEventListener("mouseup", (e) => {
  if (e.button === 2) {
    e.target.dispatchEvent();
    return;
  }
  e.target.click();

  setFace();
});

newGame();
