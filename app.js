const tiles = document.querySelector(".tile-container");
const backspaceAndEnterRow = document.querySelector("#backspaceAndEnterRow");
const keyboardFirstRow = document.querySelector("#keyboardFirstRow");
const keyboardSecondRow = document.querySelector("#keyboardSecondRow");
const keyboardThirdRow = document.querySelector("#keyboardThirdRow");

const keysFirstRow = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const keysSecondRow = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const keysThirdRow = ["Z", "X", "C", "V", "B", "N", "M"];

let letreco = "PEGAR";
let sentences = [];
let synonyms = [];
let meanings = []
$.get(`https://significado.herokuapp.com/v2/frases/${letreco}`, function (data) {
  sentences = data;
})
$.get(`https://significado.herokuapp.com/v2/${letreco}`, function (data) {
  meanings = data;
})
$.get(`https://significado.herokuapp.com/v2/sinonimos/${letreco}`, function (data) {
  synonyms = data;
})
const rows = 6;
const columns = letreco.length;
$("#tips-list").append(`<li>A palavra tem <strong>${letreco.length} letras</strong></li>`)
let currentRow = 0;
let currentColumn = 0;
const guesses = [];
const tips = [];

for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
  guesses[rowIndex] = new Array(columns);
  const tileRow = document.createElement("div");
  tileRow.setAttribute("id", "row" + rowIndex);
  tileRow.setAttribute("class", "tile-row");
  for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
    const tileColumn = document.createElement("div");
    tileColumn.setAttribute("id", "row" + rowIndex + "column" + columnIndex);
    tileColumn.setAttribute(
      "class",
      rowIndex === 0 ? "tile-column typing" : "tile-column disabled"
    );
    tileRow.append(tileColumn);
    guesses[rowIndex][columnIndex] = "";
  }
  tiles.append(tileRow);
}

const checkGuess = () => {
  const guess = guesses[currentRow].join("");
  if (guess.length !== columns) {
    return;
  }


  let letrecoLocal = [...letreco]
  var currentColumns = document.querySelectorAll(".typing");
  for (let index = 0; index < columns; index++) {
    const letter = guess[index];
    if (letrecoLocal.indexOf(letter) < 0) {
      currentColumns[index].classList.add("wrong")
      $(`#${letter}`).addClass("wrong")
    } else {
      if (letrecoLocal[index] === letter) {
        currentColumns[index].classList.add("right")
        $(`#${letter}`).addClass("right")
      } else {
        currentColumns[index].classList.add("displaced")
        $(`#${letter}`).addClass("displaced")
      }
    }
  }

  if (guess !== letreco) {
    if (currentRow === rows - 1) {
      window.location.reload()
    } else {
      switch (currentRow) {
        case 0:
          $("#tips-list").append(`<li class="capitalize-text"><strong>${meanings[0].partOfSpeech}</strong></li>`)

          break;
        case 1:
          $("#tips-list").append(`<li><strong>Sinônimo</strong>: ${synonyms[0]}</li>`)

          break;
        case 2:
          $("#tips-list").append(`<li><strong>Frase</strong>: ${sentences[0].sentence.replace(new RegExp(letreco, "gi"), "?")}</li>`)

          break;
        case 3:
          $("#tips-list").append(`<li><strong>Significado</strong>: ${meanings[0].meanings[0]}</li>`)

        default:
          break;
      }

      moveToNextRow()
    }
  }
};

const moveToNextRow = () => {
  var typingColumns = document.querySelectorAll(".typing")
  for (let index = 0; index < typingColumns.length; index++) {
    typingColumns[index].classList.remove("typing")
    typingColumns[index].classList.add("disabled")
  }
  currentRow++
  currentColumn = 0

  const currentRowEl = document.querySelector("#row" + currentRow)
  var currentColumns = currentRowEl.querySelectorAll(".tile-column")
  for (let index = 0; index < currentColumns.length; index++) {
    currentColumns[index].classList.remove("disabled")
    currentColumns[index].classList.add("typing")
  }
}

const handleKeyboardOnClick = (key) => {
  if (currentColumn === columns) {
    return;
  }
  const currentTile = document.querySelector(
    "#row" + currentRow + "column" + currentColumn
  );
  currentTile.textContent = key.toLowerCase();
  guesses[currentRow][currentColumn] = key;
  currentColumn++;
};

const createKeyboardRow = (keys, keyboardRow) => {
  keys.forEach((key) => {
    var buttonElement = document.createElement("button");
    buttonElement.textContent = key.toLowerCase();
    buttonElement.setAttribute("id", key);
    buttonElement.addEventListener("click", () => handleKeyboardOnClick(key));
    keyboardRow.append(buttonElement);
  });
};

createKeyboardRow(keysFirstRow, keyboardFirstRow);
createKeyboardRow(keysSecondRow, keyboardSecondRow);
createKeyboardRow(keysThirdRow, keyboardThirdRow);

const handleBackspace = () => {
  if (currentColumn === 0) {
    return
  }

  currentColumn--
  guesses[currentRow][currentColumn] = ""
  const tile = document.querySelector("#row" + currentRow + "column" + currentColumn)
  tile.textContent = ""
};

const backspaceButton = document.createElement("button");
backspaceButton.addEventListener("click", handleBackspace);
backspaceButton.textContent = "delete";
backspaceButton.classList.add("backspace-button")
backspaceAndEnterRow.append(backspaceButton);

const enterButton = document.createElement("button");
enterButton.addEventListener("click", checkGuess);
enterButton.textContent = "enter";
enterButton.classList.add("enter-button")
backspaceAndEnterRow.append(enterButton);

document.onkeydown = function (evt) {
  evt = evt || window.evt
  if (evt.key === "Enter") {
    $.get(`https://significado.herokuapp.com/v2/${guesses[currentRow].join("").toLowerCase()}`, function () {
      checkGuess();
    })

  } else if (evt.key === "Backspace") {
    handleBackspace()
  } else if (/^[a-z]$/i.test(evt.key)) {
    handleKeyboardOnClick(evt.key.toUpperCase())
  }
}
