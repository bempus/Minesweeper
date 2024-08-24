const config = {
  mines: 30,
  rows: 16,
  size: 1,
  minRows: 3,
  maxMines: 85,
};

const gameBoard = document.querySelector(".game");

const newGame = () => {
  if (config.mines > config.maxMines) config.mines = config.maxMines;
  if (config.rows < config.minRows) config.rows = config.minRows;

  gameBoard.innerHTML = "";
  let gameOver = false;
  let firstClick = true;

  const addMine = (exclude) => {
    const mine = `c${Math.floor(Math.random() * config.rows)}_${Math.floor(
      Math.random() * config.rows
    )}`;
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
      revealAll();
      gameOver = true;
      setTimeout(() => alert("Congratulations, you won!"), 250);
    }
  };

  const handleClick = (e) => {
    if (gameOver) return;
    if (e.target.getAttribute("revealed")) return;
    if (e.target.getAttribute("flagged")) return;
    if (mines.has(e.target.id)) {
      if (firstClick) {
        mines.delete(e.target.id);
        while (mines.size < config.mines) {
          console.log("Mine on first click");
          addMine(e.target.id);
        }
        return handleClick(e);
      }
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
      col.addEventListener("click", handleClick);
      col.addEventListener("contextmenu", handleRightClick);
    }
    document.querySelector(".game").appendChild(row);
  }

  const revealAll = () => {
    firstClick = false;
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
  };

  document.querySelector("#revealAll").addEventListener("click", revealAll);
};

newGame();
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

document.querySelector("#reset").addEventListener("click", () => {
  newGame();
});

document.querySelector("#toggle-settings").addEventListener("click", (e) => {
  const aside = document.querySelector("aside");
  if (aside.getAttribute("expanded")) {
    aside.removeAttribute("expanded");
    e.target.textContent = ">>";
    return;
  }
  aside.setAttribute("expanded", true);
  e.target.textContent = "<<";
});
