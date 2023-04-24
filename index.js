import { words } from "./wordlist.js";
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("keydown", (event) => {
    const allowedKeys = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "Backspace",
    ];
    const keyName = event.key;
    if (keyName === "Enter") {
      handleSubmitWord();
    } else {
      if (allowedKeys.includes(keyName)) {
        updateGuessedWords(keyName);
      }
    }
  });
  getRandomWord();
  createSquares();

  let guessedWords = [[]];
  let availableSpace = 1;

  let word = "dairy";
  let correctAnswer;

  let guessedWordCount = 0;

  async function getRandomWord() {
    const max = words.length;
    const min = 0;
    const rand = Math.floor(Math.random() * (max - min + 1) + min);
    const randomWord = words[rand];
    // check if this randomWord is real
    // await the info from the api link
    const response = await fetch(
      `https://dictionaryapi.com/api/v3/references/collegiate/json/${randomWord}?key=3f23d705-7caf-4c53-a19f-b646f6127bf1`
    );
    // await the response to be turned into json before data is a thing
    const data = await response.json();
    // when data is a thing obtain the shortdef (if there is no short definition and it isn't a word, it is undefined)
    const validWord = data[0].shortdef;

    if (validWord) {
      word = randomWord;

      const wordArray = randomWord.split("");
      correctAnswer = wordArray.map((letter, index) => {
        return {
          checked: false,
          letter,
        };
      });
    } else {
      getRandomWord();
    }
  }

  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  function updateGuessedWords(letter) {
    const currentWordArr = getCurrentWordArr();

    // If key is delete, then delete one
    if (letter === "del" || letter === "Backspace") {
      if (currentWordArr.length !== 0) {
        currentWordArr.pop();
        availableSpace = availableSpace - 1;
        const availableSpaceEl = document.getElementById(
          String(availableSpace)
        );
        availableSpaceEl.textContent = null;
      }
    } else {
      // if key is not delete, make sure that there is a currentWord array and that it less than 5 characters long
      if (currentWordArr && currentWordArr.length < 5) {
        currentWordArr.push(letter);
        const availableSpaceEl = document.getElementById(
          String(availableSpace)
        );
        availableSpace = availableSpace + 1;
        availableSpaceEl.textContent = letter;
      }
    }
  }

  function getTileColor(guessedLetter) {
    if (guessedLetter.position === "none") {
      return "rgb(58, 58, 60)";
    }

    if (guessedLetter.position === "correct") {
      return "rgb(83, 141, 78)";
    }

    return "rgb(181, 159, 59)";
  }

  function resetCorrectAnswerArray() {
    for (let i = 0; i < correctAnswer.length; i++) {
      correctAnswer[i].checked = false;
    }
  }

  function getLetterPosition(letterArray) {
    resetCorrectAnswerArray();
    const currentLetterArray = letterArray;
    // check correct letters
    currentLetterArray.forEach((letterObj, index) => {
      if (letterObj.letter === correctAnswer[index].letter) {
        correctAnswer[index].checked = true;
        currentLetterArray[index].checked = true;
        currentLetterArray[index].position = "correct";
      }
    });
    // check wrong position letters
    currentLetterArray.forEach((letterObj, index) => {
      if (!letterObj.checked) {
        if (
          correctAnswer.some(
            (item) => item.letter === letterObj.letter && !item.checked
          )
        ) {
          const matchedLetter = correctAnswer.find(
            (item) => item.letter === letterObj.letter && !item.checked
          );
          matchedLetter.checked = true;
          currentLetterArray[index].checked = true;
          currentLetterArray[index].position = "wrong";
        }
      }
    });
    return currentLetterArray;
  }

  async function handleSubmitWord() {
    const currentWordArr = getCurrentWordArr();
    if (currentWordArr.length !== 5) {
      window.alert("Word must be 5 letters");
      return;
    }

    const guessedWord = currentWordArr.join("");

    // await the info from the api link
    const response = await fetch(
      `https://dictionaryapi.com/api/v3/references/collegiate/json/${guessedWord}?key=3f23d705-7caf-4c53-a19f-b646f6127bf1`
    );
    // await the response to be turned into json before data is a thing
    const data = await response.json();
    // when data is a thing obtain the shortdef (if there is no short definition and it isn't a word, it is undefined)
    const validWord = data[0].shortdef;

    // if valid word is undefined/null/false
    if (!validWord) {
      window.alert("Try again, that isn't a valid word");
      return;
    }

    const thisGuess = currentWordArr.map((letter, index) => {
      return {
        index: index + 1,
        checked: false,
        position: "none",
        letter,
      };
    });

    const checkedGuess = getLetterPosition(thisGuess);

    const firstLetterId = guessedWordCount * 5 + 1;

    const interval = 200;
    checkedGuess.forEach((letter, index) => {
      setTimeout(() => {
        const tileColor = getTileColor(letter);
        updateKeyboardKeys(letter, tileColor);
        const letterId = firstLetterId + index;
        const letterEl = document.getElementById(letterId);
        letterEl.classList.add("animate__flipInX");
        letterEl.style = `background-color:${tileColor};border-color${tileColor}`;
      }, interval * index);
    });

    guessedWordCount += 1;

    setTimeout(() => {
      if (guessedWord === word) {
        alert("Congratulations! You win!");
        return;
      }
      if (guessedWordCount === 6) {
        window.alert(`You have run out of guesses. The word is ${word}.`);
        return;
      }
    }, 1200);
    guessedWords.push([]);
  }

  function updateKeyboardKeys(letterObj, tileColor) {
    const letterKey = letterObj.letter;
    const thisLetter = document.querySelector(`[data-key=${letterKey}]`);
    if (!thisLetter.classList.contains("correctPlacement")) {
      if (letterObj.position === "none") {
        if (!thisLetter.classList.contains("wrongPlacement"))
          thisLetter.classList.add("notInWord");
      }
      if (letterObj.position === "wrong") {
        thisLetter.classList.add("wrongPlacement");
      }
      if (letterObj.position === "correct") {
        thisLetter.classList.add("correctPlacement");
      }
    }
  }

  function createSquares() {
    const gameBoard = document.getElementById("board");
    const keys = document.querySelectorAll(".keyboard-row button");

    for (let index = 0; index < 30; index++) {
      let square = document.createElement("div");
      square.classList.add("square");
      square.classList.add("animate__animated");
      square.setAttribute("id", index + 1);
      gameBoard.appendChild(square);
    }

    for (let i = 0; i < keys.length; i++) {
      keys[i].onclick = ({ target }) => {
        const letter = target.getAttribute("data-key");

        if (letter === "enter") {
          handleSubmitWord();
          return;
        }

        updateGuessedWords(letter);
      };
    }
  }
});

// Get banner
var banner = document.getElementById("banner");

// Show banner
banner.style.display = "block";

// Remove banner
setTimeout(function() {
    banner.style.display = "none";
}, 5000);
