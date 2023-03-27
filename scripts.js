async function loadFlashcards(subject) {
  const response = await fetch('flashcards.json');
  const data = await response.json();
  return data[subject];
}

document.addEventListener("DOMContentLoaded", () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const flashcardsParam = urlSearchParams.get("flashcards");

  if (flashcardsParam) {
    loadGame(flashcardsParam);
    placeholder.style.opacity = '1';
    placeholder.style.color = '#00f';
    placeholder.style.borderColor = '#00f';
    placeholder.style.backgroundColor = '#b19cd9';
  }
});

const isDark = new URLSearchParams(window.location.search).get('dark');

const whitepaper = document.getElementById('whitepaper');
const popupDiv = document.getElementById('popup');
const popupResultsDiv = document.getElementById('popup-results');
let isCheckResultsCalled = false;
let isDraggable = true;
const deck = document.querySelector('.deck');
const skipBtn = document.querySelector('.next-button');
const cardArea = document.querySelector('.card-area');
const checkBtn = document.querySelector('.check-results-button');
const placeholder = document.querySelector('.placeholder');
placeholder.style.opacity = '0.3';
placeholder.style.backgroundColor = 'lightgray';
placeholder.style.color = 'gray';
placeholder.style.borderColor = 'gray';
const themeToggle = document.querySelector('.theme-toggle');
const cardContainer = document.querySelector('.card-container');

const flashcards = [
  {name: 'Event 1', date: 1900},
  {name: 'Event 2', date: 1910},
  {name: 'Event 3', date: 1920},
  // Add more cards here
];

let isDarkMode;

document.addEventListener('DOMContentLoaded', (event) => {
  if (isDark === 'enabled') {
    toggleDarkMode();
  }
  else if (isDark !== 'disabled') {

    const currentPage = window.location.pathname;
    window.history.pushState({ id: "100" }, "Page", `${currentPage}?dark=disabled`);

  }
});


let draggedCard = null;
let currentCardIndex = 0;
let cardDeck = [...flashcards];
let hasInteracted = false;

function shuffle(array) {
  
  let currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function drawCard() {
  if (currentCardIndex >= cardDeck.length) {
    skipBtn.disabled = true;
    //checkResults();
    return;
  }

  const cardData = cardDeck[currentCardIndex];

  const existingTopCard = document.querySelector('.top-card');
  if (existingTopCard) {
    existingTopCard.classList.remove('top-card');
  }

  newCard = document.createElement('div');
  newCard.textContent = cardData.name;
  newCard.dataset.date = cardData.date;
  newCard.style.visibility = 'visible';
  newCard.classList.add('card', 'top-card');
  setupCardEvents(newCard);
  deck.appendChild(newCard);
  if (existingTopCard) {
    deck.removeChild(existingTopCard);
  }
}

function updateCheckResultsButton() {
  const checkResultsButton = document.getElementById('check-results-button');
  if (cardContainer.children.length > 0) {
    checkResultsButton.disabled = false;
  } else {
    checkResultsButton.disabled = true;
  }
}

function setupCardEvents(card) {
card.addEventListener('mousedown', onCardDragStart);
card.addEventListener('touchstart', onCardDragStart);
}

function onCardDragStart(e) {
  if (isCheckResultsCalled) {
    sortableInstance.option("disabled", true);
    return;
  }
  e.preventDefault();
  
  const card = e.target;
  if (card.parentNode === deck) {
  draggedCard = card.cloneNode(true);
  setupCardEvents(draggedCard);
  cardArea.appendChild(draggedCard);
  card.style.visibility = 'hidden';
  placeholder.style.display = 'none';
  
  draggedCard.classList.add('dragged');
  const rect = card.getBoundingClientRect();
  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  draggedCard.style.left = `${clientX - rect.width / 2}px`;
  draggedCard.style.top = `${clientY - rect.height / 2}px`;
  
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('touchmove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('touchend', onMouseUp);
  }
}

function onMouseMove(e) {
  e.preventDefault();
  if (!draggedCard) {
    return;
  }

  const clientX = e.clientX || e.touches[0].clientX;
  const clientY = e.clientY || e.touches[0].clientY;
  draggedCard.style.left = `${clientX - draggedCard.offsetWidth / 2}px`;
  draggedCard.style.top = `${clientY - draggedCard.offsetHeight / 2}px`;

  const cardContainerRect = cardContainer.getBoundingClientRect();
  const cardRect = draggedCard.getBoundingClientRect();
  const y = clientY;

  if (y < cardContainerRect.top || y > cardContainerRect.bottom) {
    return;
  }

  const closestCard = Array.from(cardContainer.children)
    .filter(child => child !== draggedCard && child !== placeholder)
    .reduce((closest, child) => {
      const childRect = child.getBoundingClientRect();
      const offset = y - childRect.top - childRect.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return {offset, element: child};
      } else {
        return closest;
      }
    }, {offset: Number.NEGATIVE_INFINITY});

  const placeholderRect = placeholder.getBoundingClientRect();
  placeholder.style.height = `${draggedCard.offsetHeight / 2}px`;
  placeholder.style.width = `${draggedCard.offsetWidth}px`;


  if (placeholder.nextSibling !== closestCard.element) {
    cardContainer.insertBefore(placeholder, closestCard.element);
  }
}

function onMouseUp(e) {
  e.preventDefault();

  if (draggedCard) {
    const deckRect = deck.getBoundingClientRect();
    const clientX = e.clientX || e.changedTouches[0].clientX;
    const clientY = e.clientY || e.changedTouches[0].clientY;
    const isOverDeck = clientX >= deckRect.left && clientX <= deckRect.right &&
      clientY >= deckRect.top && clientY <= deckRect.bottom;
    
    if (isOverDeck) {
      const topCard = document.querySelector('.top-card');
      if (draggedCard === topCard) {
        deck.appendChild(draggedCard);
      } else {
        cardArea.removeChild(draggedCard);
        topCard.style.visibility = 'visible';
      }
    } else {
      cardArea.removeChild(draggedCard);
      const newIndex = Array.from(cardContainer.children).indexOf(placeholder);
      cardContainer.insertBefore(draggedCard, newIndex === -1 ? null : cardContainer.children[newIndex]);

      draggedCard.style.position = '';
      draggedCard.style.left = '';
      draggedCard.style.top = '';
      draggedCard.classList.remove('dragged');
  
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onMouseUp);
      
      placeholder.style.height = '';

      if (draggedCard.parentNode === deck) {
        drawCard();
      } else {
        currentCardIndex++; // Add this line to increment the index when a card is placed
        drawCard(); // Add this line to draw a new card when a card is placed
      }
    }

    updateCheckResultsButton();

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    placeholder.style.width = '';

  }
}


const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');


function restart() {
  // Suppress the "save changes" popup
  window.onbeforeunload = null;

  let url = new URL(window.location.href);
  const currentPage = window.location.pathname;
  
  // Reload the page
  if (document.body.classList.contains('dark-mode')) {
    url.searchParams.set('dark', 'enabled');
  } else {
    url.searchParams.set('dark', 'disabled');
  }
  url.pathname = currentPage;
  window.location.href = url.href;

}

function newSubject() {
  // Suppress the "save changes" popup
  window.onbeforeunload = null;

  let url = new URL(window.location.href.split('?')[0]);
  
  // Reload the page
  if (document.body.classList.contains('dark-mode')) {
    url.searchParams.set('dark', 'enabled');
    window.location.href = url.href;
  } else {
    url.searchParams.set('dark', 'disabled');
    window.location.href = url.href;
  }
}

function hideMessageBox(duration) {
  setTimeout(() => {
    messageBox.classList.add('fade-out');
    setTimeout(() => {
      messageBox.classList.add('hidden');
      messageBox.classList.remove('fade-out');
    }, 1000);
  }, duration);
}


function getFlashcardCount(listName, callback) {
  // Fetch the JSON file
  fetch('flashcards.json')
    .then(response => {
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Parse the JSON file
      return response.json();
    })
    .then(flashcardsData => {
      // Get the number of flashcards for the given listName
      const flashcardCount = flashcardsData[listName]?.length || 0;

      // Return the flashcard count using the callback
      callback(null, flashcardCount);
    })
    .catch(error => {
      console.error(error);
      callback(error, 0);
    });
}


function updatePopup(accuracy, results) {
  // Get the popup elements
  const popup = document.getElementById("popup");
  const resultsDiv = document.querySelector(".popup-results");

  const urlParams = new URLSearchParams(window.location.search);
  const flashSet = urlParams.get('flashcards');

  // Calculate the number of cards played and the total cards
  const cardsPlayed = results.length;

  // Get the flashcard count using the callback
  getFlashcardCount(flashSet, (error, flashcardCount) => {
    if (error) {
      console.error("Failed to get flashcard count:", error);
    } else {
      // Update the results
      const accuracyText = `Accuracy: ${accuracy.toFixed(2)}%`;
      const cardsPlayedText = `${cardsPlayed}/${flashcardCount} cards played`;
      resultsDiv.innerHTML = [accuracyText, cardsPlayedText, ...results].join('<br>');

      // Display the popup
      popup.classList.remove("hidden");
    }
  });
}





function checkResults() {
  whitepaper.style.pointerEvents = "auto";
  whitepaper.style.cursor = "pointer";
  whitepaper.textContent = "Copy";

  if (whitepaper.classList.contains("copied")) {
    whitepaper.classList.remove("copied");
  }

  isCheckResultsCalled = true;
  sortableInstance.option("disabled", true);
  skipBtn.disabled = true;

  if (deck.querySelector(".top-card")) {
    deck.querySelector(".top-card").style.backgroundColor = "rgba(192, 192, 192, 0.5)";
  }

  const cards = Array.from(cardContainer.children).filter((child) =>
    child.classList.contains("card")
  );

  let n = cards.length;
  const dp = new Array(n).fill(1);

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (Number(cards[j].dataset.date) <= Number(cards[i].dataset.date)) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  let maxCorrect = Math.max(...dp);
  const correctIndices = new Set();

  for (let i = n - 1; i >= 0 && maxCorrect > 0; i--) {
    if (dp[i] === maxCorrect) {
      correctIndices.add(i);
      maxCorrect--;
    }
  }

  const results = [];
  cards.forEach((card, index) => {
    const isCorrect = correctIndices.has(index);
    card.style.backgroundColor = isCorrect ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)";
    card.draggable = false;

    if (!card.querySelector(".event-date")) {
      const eventDate = document.createElement("div");
      eventDate.classList.add("event-date");
      eventDate.textContent = Math.floor(card.dataset.date);
      card.prepend(eventDate);
    }

    results.push(`${isCorrect ? "CORRECT" : "INCORRECT"} -- ${card.dataset.date}: ${card.textContent.replace(card.dataset.date, "")}`);
  });

  // Calculate the accuracy percentage
  const accuracy = (correctIndices.size / n) * 100;

  // Show the popup with accuracy and results
  updatePopup(accuracy, results);
}


function myCopy(event) {
  let prevDate = null;
  let allCorrect = true;
  let correctCount = 0;
  let totalCount = 0;
  skipBtn.disabled = true;

  const results = [];
  Array.from(cardContainer.children)
    .filter(child => child.classList.contains('card'))
    .forEach((card, index) => {
      const cardDate = Number(card.dataset.date);
      const isCorrect = prevDate === null || prevDate <= cardDate;
      allCorrect = allCorrect && isCorrect;
      prevDate = cardDate;

      if (!card.querySelector('.event-date')) {
        const eventDate = document.createElement('div');
        eventDate.classList.add('event-date');
        eventDate.textContent = Math.floor(card.dataset.date);
        card.prepend(eventDate);
      }

      results.push(`${isCorrect ? 'CORRECT' : 'INCORRECT'} -- ${card.dataset.date}: ${card.textContent.replace(/[0-9]/g, '')}`);
    });
  
  var copyText = document.querySelector(".popup-results").innerHTML.replace(new RegExp('<br>', 'g'), "\n");
//results//event.target.parentNode.nextSibling.nextSibling.value

   /* Copy the text inside the text field */
  parent.navigator.clipboard.writeText(copyText);

  //let copyText = document.querySelector("#input");

  //alert("Copied results");
  whitepaper.classList.add('copied');
  whitepaper.textContent = "Copied";
  whitepaper.style.pointerEvents = 'none';
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;

  // Add or remove the 'dark-mode' class for each element
  document.body.classList.toggle('dark-mode', isDarkMode);
  deck.classList.toggle('dark-mode', isDarkMode);
  subjectDiv.classList.toggle('dark-mode', isDarkMode);
  cardArea.classList.toggle('dark-mode', isDarkMode);
  messageBox.classList.toggle('dark-mode', isDarkMode);
  popupDiv.classList.toggle('dark-mode', isDarkMode);
  popupResultsDiv.classList.toggle('dark-mode', isDarkMode);

  // Add or remove the 'dark-mode' class for popup and popup-results
  document.getElementById('popup').classList.toggle('dark-mode', isDarkMode);
  document.getElementById('popup-results').classList.toggle('dark-mode', isDarkMode);

  themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}



skipBtn.addEventListener('click', () => {
  currentCardIndex++;
  const newCardData = {
    name: newCard.textContent,
    date: newCard.dataset.date
  };
  cardDeck.push(newCardData);
  drawCard();
  hasInteracted = true;
});

checkBtn.addEventListener('click', () => {
  checkResults();
});

themeToggle.addEventListener('click', () => {
  toggleDarkMode();
});

window.addEventListener('beforeunload', (e) => {
  if (hasInteracted) {
    e.preventDefault();
    e.returnValue = '';
  }
});

function closePopup() {
  popupDiv.classList.add('hidden');
}

function howTo() {
  const instructionsPopup = document.getElementById('instructions-popup');
  instructionsPopup.classList.remove('hidden');
}

function closeInstructionsPopup() {
  const instructionsPopup = document.getElementById('instructions-popup');
  instructionsPopup.classList.add('hidden');
}

function credits() {
  const creditsPopup = document.getElementById('credits-popup');
  creditsPopup.classList.remove('hidden');
}

function closeCreditsPopup() {
  const creditsPopup = document.getElementById('credits-popup');
  creditsPopup.classList.add('hidden');
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const popupDiv = document.getElementById('popup');
    const instructionsPopup = document.getElementById('instructions-popup');
    const creditsPopup = document.getElementById('credits-popup');

    if (!popupDiv.classList.contains('hidden')) {
      closePopup();
    } else if (!instructionsPopup.classList.contains('hidden')) {
      closeInstructionsPopup();
    } else if (!creditsPopup.classList.contains('hidden')) {
      closeCreditsPopup();
    }
  }
});

document.getElementById('message-close').addEventListener('click', () => {
  closePopup();
});

document.getElementById('restart-button').addEventListener('click', () => {
  restart()
});

document.getElementById('check-results-button').onclick = checkResults;

cardDeck = shuffle(cardDeck);
drawCard();


const sortableInstance = Sortable.create(cardContainer, {
  group: 'shared',
  animation: 150,
  ghostClass: 'sortable-ghost',
  chosenClass: 'sortable-chosen',
  forceFallback: true, // Add this line
  fallbackClass: 'sortable-fallback', // Add this line
  swap: false, // Add this line
  swapThreshold: 0.5, // Add this line
  onAdd: updateCheckResultsButton,
  onUpdate: updateCheckResultsButton,
  onEnd: updateCheckResultsButton,
  //disabled: !isDraggable,
});

// Hide the Skip button and card deck initially
skipBtn.style.display = 'none';
deck.style.display = 'none';

// Add event listeners to the subject selector and load game button
const subjectSelector = document.getElementById('subject');
const subjectDiv = document.getElementById('subject-selector');
const loadGameButton = document.getElementById('load-game-button');

subjectSelector.addEventListener('change', () => {
  loadGameButton.disabled = subjectSelector.value === '';
});

async function loadGame(flashcardSetName) {
  const selectedSubject = flashcardSetName;
  const newFlashcards = await loadFlashcards(selectedSubject);

  ///fix
  const params = new URLSearchParams(window.location.search);
  if (!params.has('flashcards')) {
    let stateObj = { id: "100" };
    window.history.pushState(stateObj,
        "Page", window.location.href+"&flashcards="+selectedSubject);
  }

    
  if (newFlashcards) {
    flashcards.length = 0;
    flashcards.push(...newFlashcards);
    cardDeck = shuffle([...flashcards]);
    currentCardIndex = 0;

    // Show the Skip button and card deck
    skipBtn.style.display = 'block';
    deck.style.display = 'flex';
    deck.style.alignItems = 'center'; // Add this line
    deck.style.justifyContent = 'center'; // Add this line

    // Disable the subject selector and load game button
    subjectSelector.disabled = true;
    loadGameButton.disabled = true;

    subjectDiv.style.display = 'none';

    drawCard();
    console.log(`Loading game with flashcard set: ${flashcardSetName}`);
  }
}

loadGameButton.addEventListener('click', async () => {

  placeholder.style.opacity = '1';
  placeholder.style.color = '#00f';
  placeholder.style.borderColor = '#00f';
  placeholder.style.backgroundColor = '#b19cd9';
  
  const selectedSubject = subjectSelector.value;
  const newFlashcards = await loadFlashcards(selectedSubject);

  const params = new URLSearchParams(window.location.search);
  if (!params.has('flashcards')) {
    let stateObj = { id: "100" };
    window.history.pushState(stateObj,
        "Page", window.location.href+"&flashcards="+selectedSubject);
  }
  
  if (newFlashcards) {
    flashcards.length = 0;
    flashcards.push(...newFlashcards);
    cardDeck = shuffle([...flashcards]);
    currentCardIndex = 0;

    // Show the Skip button and card deck
    skipBtn.style.display = 'block';
    deck.style.display = 'flex';
    deck.style.alignItems = 'center'; // Add this line
    deck.style.justifyContent = 'center'; // Add this line

    // Disable the subject selector and load game button
    subjectSelector.disabled = true;
    loadGameButton.disabled = true;

    subjectDiv.style.display = 'none';

    drawCard();
  }
});
