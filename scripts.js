async function loadFlashcards(subject) {
  const response = await fetch('flashcards.json');
  const data = await response.json();
  return data[subject];
}

document.addEventListener("DOMContentLoaded", () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const flashcardsParam = urlSearchParams.get("flashcards");

  if (flashcardsParam) {
    // Reset all game state variables
    currentCardIndex = 0;
    cardDeck = [];
    skippedCards = [];
    playedCards.clear();
    currentCardId = null;
    hasInteracted = false;
    isCheckResultsCalled = false;
    hasShownResults = false;
    
    // Clear any existing cards in the timeline
    const cardContainer = document.querySelector('.card-container');
    if (cardContainer) {
      cardContainer.innerHTML = '';
    }
    
    // Reset placeholder
    placeholder.style.opacity = '1';
    placeholder.style.color = '#3b82f6';
    placeholder.style.borderColor = '#3b82f6';
    placeholder.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
    
    // Reset UI elements to initial state
    const subjectDiv = document.getElementById('subject-selector');
    const subjectSelector = document.getElementById('subject');
    const loadGameButton = document.getElementById('load-game-button');
    
    if (subjectDiv) subjectDiv.style.display = 'flex';
    if (subjectSelector) subjectSelector.disabled = false;
    if (loadGameButton) loadGameButton.disabled = true;
    
    // Hide game elements initially
    if (skipBtn) skipBtn.style.display = 'none';
    if (deck) deck.style.display = 'none';
    if (cardArea) cardArea.style.display = 'none';
    
    // Load the game
    loadGame(flashcardsParam);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.interface-button').forEach(btn => {
    btn.style.display = 'flex';
  });
});

// Theme preference system using localStorage
const THEME_KEY = 'timetango-theme';

// Get saved theme preference or default to 'light'
function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark';
  } catch (e) {
    console.warn('localStorage not available, using default theme');
    return 'dark';
  }
}

// Save theme preference
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.warn('localStorage not available, theme preference not saved');
  }
}

// Apply theme on page load
function applySavedTheme() {
  const savedTheme = getSavedTheme();
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    isDarkMode = true;
  } else {
    document.body.classList.remove('dark-mode');
    isDarkMode = false;
  }
}

const whitepaper = document.getElementById('whitepaper');
const popupDiv = document.getElementById('popup');
const popupResultsDiv = document.getElementById('popup-results');
let isCheckResultsCalled = false;
let isDraggable = true;
let hasShownResults = false; // Track if results have been shown and not resumed
const deck = document.querySelector('.deck');
const skipBtn = document.querySelector('.next-button');
const cardArea = document.querySelector('.card-area');
const checkBtn = document.querySelector('.check-results-button');
const placeholder = document.querySelector('.placeholder');
placeholder.style.opacity = '0.3';
placeholder.style.backgroundColor = '#f3f4f6';
placeholder.style.color = '#9ca3af';
placeholder.style.borderColor = '#d1d5db';
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
  // Apply saved theme preference
  applySavedTheme();
});


let draggedCard = null;
let currentCardIndex = 0;
let cardDeck = [...flashcards];
let hasInteracted = false;
let skippedCards = []; // Track skipped cards for back functionality
let playedCards = new Set(); // Track cards that have been placed in timeline
let currentCardId = null; // Track the currently displayed card ID

// Creator attribution mapping
const creatorMapping = {
  'test': 'Jude St John',
  'apeuro': 'Brittany Berriz',
  'apeuro-extended': 'Brittany Berriz',
  'apush': 'Sierra Hall',
  'apush-extended': 'Austin Kim',
  'apwh': 'Fiveable'
};

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

// Helper function to check if a card is available to be drawn
function isCardAvailable(cardId) {
  return cardId !== currentCardId && !playedCards.has(cardId);
}

// Helper function to find the next available card index
function findNextAvailableCard(startIndex) {
  for (let i = startIndex; i < cardDeck.length; i++) {
    if (isCardAvailable(cardDeck[i].id)) {
      return i;
    }
  }
  return -1; // No available cards found
}

function drawCard() {
  if (currentCardIndex >= cardDeck.length) {
    skipBtn.disabled = true;
    //checkResults();
    return;
  }

  let cardData = cardDeck[currentCardIndex];
  
  // Check if this card is already being shown or has been played
  if (!isCardAvailable(cardData.id)) {
    // Find the next available card
    const nextIndex = findNextAvailableCard(currentCardIndex + 1);
    
    if (nextIndex === -1) {
      // No more cards available
      skipBtn.disabled = true;
      return;
    }
    
    currentCardIndex = nextIndex;
    cardData = cardDeck[currentCardIndex];
  }
  
  const currentCardDiv = document.getElementById('current-card');

  // Clear the current card area
  currentCardDiv.innerHTML = '';

  newCard = document.createElement('div');
  newCard.textContent = cardData.name;
  newCard.dataset.date = cardData.date;
  newCard.dataset.cardId = cardData.id; // Store the card ID
  newCard.style.visibility = 'visible';
  newCard.classList.add('card', 'top-card');
  setupCardEvents(newCard);
  currentCardDiv.appendChild(newCard);
  
  // Set current card ID
  currentCardId = cardData.id;
  
  // Check if this card was previously skipped and remove it from skippedCards
  const skippedIndex = skippedCards.findIndex(skippedCard => 
    skippedCard.id === cardData.id
  );
  
  if (skippedIndex !== -1) {
    skippedCards.splice(skippedIndex, 1);
    // Disable back button if no more skipped cards
    if (skippedCards.length === 0) {
      document.querySelector('.back-button').disabled = true;
    }
  }
  
  // Disable skip button if this is the last card
  if (currentCardIndex >= cardDeck.length - 1) {
    skipBtn.disabled = true;
  } else {
    skipBtn.disabled = false;
  }
}

function updateCheckResultsButton() {
  const checkResultsButton = document.getElementById('check-results-button');
  const actualCards = Array.from(cardContainer.children).filter(child => 
    child.classList.contains('card')
  );
  const hasPlacedCards = actualCards.length > 0;
  const hasCardsLeft = currentCardIndex < cardDeck.length;
  const placedCardsCount = actualCards.length;
  
  // Only enable if there are at least 2 cards placed
  if (hasPlacedCards && placedCardsCount >= 2) {
    checkResultsButton.disabled = false;
    
    // Add shine animation if all cards are placed (no cards left in deck)
    if (!hasCardsLeft) {
      checkResultsButton.classList.add('shine');
    } else {
      checkResultsButton.classList.remove('shine');
    }
  } else {
    checkResultsButton.disabled = true;
    checkResultsButton.classList.remove('shine');
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
  const currentCardDiv = document.getElementById('current-card');
  if (card.parentNode === currentCardDiv) {
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
        const currentCardDiv = document.getElementById('current-card');
        currentCardDiv.appendChild(draggedCard);
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

      const currentCardDiv = document.getElementById('current-card');
      if (draggedCard.parentNode === currentCardDiv) {
        drawCard();
      } else {
        // Mark the card as played
        const cardId = draggedCard.dataset.cardId;
        if (cardId) {
          playedCards.add(cardId);
        }
        
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


function updatePopup(accuracy, results, cards) {
  const orderBackwards = isOrderBackwards(cards);
  
  // Get the popup elements
  const popup = document.getElementById("popup");
  const resultsDiv = document.querySelector(".popup-results");
  const accuracyPercentage = document.getElementById("accuracy-percentage");
  const correctCount = document.getElementById("correct-count");
  const incorrectCount = document.getElementById("incorrect-count");
  const totalCards = document.getElementById("total-cards");
  const feedbackContent = document.getElementById("feedback-content");

  const urlParams = new URLSearchParams(window.location.search);
  const flashSet = urlParams.get('flashcards');
  const cardsPlayed = results.length;
  
  // Add warning for backwards order instead of replacing results
  let orderWarning = "";
  if (orderBackwards && cards.length >= 2) {
    orderWarning = "⚠️ WARNING: Cards are in reverse chronological order (newest to oldest). Timeline should be oldest to newest.";
  }

  // Get the flashcard count using the callback
  getFlashcardCount(flashSet, (error, flashcardCount) => {
    if (error) {
      console.error("Failed to get flashcard count:", error);
    } else {
      // Calculate stats
      const correctCards = Math.round((accuracy / 100) * cardsPlayed);
      const incorrectCards = cardsPlayed - correctCards;
      
      // Update the visual stats
      accuracyPercentage.textContent = `${accuracy.toFixed(0)}%`;
      correctCount.textContent = correctCards;
      incorrectCount.textContent = incorrectCards;
      totalCards.textContent = cardsPlayed;
      
      // Generate educational feedback
      const feedback = generateFeedback(accuracy, correctCards, incorrectCards, cardsPlayed, flashcardCount);
      feedbackContent.innerHTML = feedback;
      
      // Update detailed results
      const resultsText = results.map(result => {
        if (typeof result === 'string') {
          return result;
        } else if (Array.isArray(result)) {
          return result.join('<br>');
        }
        return '';
      }).join('<br>').trim();
      
      // Add copy button to results div
      resultsDiv.innerHTML = `
        ${orderWarning ? `<div class="order-warning">${orderWarning}</div>` : ''}
        <button class="copy-button" onclick="copyResults()" title="Copy results">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <div class="copy-confirmation">Copied!</div>
        <div class="results-content">${resultsText}</div>
      `;

      // Show/hide resume button based on game completion
      const resumeButton = document.getElementById('resume-button');
      if (cardsPlayed < flashcardCount) {
        resumeButton.style.display = 'inline-block';
      } else {
        resumeButton.style.display = 'none';
      }
      
      // Display the popup
      popup.classList.remove("hidden");
    }
  });
}

function resumeGame() {
  // Close the results popup
  closePopup();
  
  // Re-enable the game
  isCheckResultsCalled = false;
  hasShownResults = false; // Reset the flag when game is resumed
  sortableInstance.option("disabled", false);
  
  // Re-enable skip button if there are cards left
  if (currentCardIndex < cardDeck.length) {
    skipBtn.disabled = false;
  }
  
  // Remove colored backgrounds from cards
  const cards = Array.from(cardContainer.children).filter((child) =>
    child.classList.contains("card")
  );
  
  cards.forEach(card => {
    card.style.backgroundColor = '';
    card.draggable = true;
  });
  
  // Remove event dates
  cards.forEach(card => {
    const eventDate = card.querySelector('.event-date');
    if (eventDate) {
      eventDate.remove();
    }
  });
  
  // Update check results button
  updateCheckResultsButton();
}

function generateFeedback(accuracy, correctCards, incorrectCards, cardsPlayed, totalCards) {
  let feedback = '';
  
  if (accuracy === 100) {
    feedback = `
      <div class="feedback-item success">
        <strong>🎉 Perfect Tango!</strong> You've mastered this timeline completely.
      </div>
      <div class="feedback-item tip">
        <strong>💡 Tip:</strong> Try the extended version of this deck for a greater challenge.
      </div>
    `;
  } else if (accuracy >= 80) {
    feedback = `
      <div class="feedback-item good">
        <strong>👍 Great Tango!</strong> You have a solid understanding of this timeline.
      </div>
      <div class="feedback-item tip">
        <strong>💡 Tip:</strong> Review the incorrect cards below and try again to improve your score.
      </div>
    `;
  } else if (accuracy >= 60) {
    feedback = `
      <div class="feedback-item okay">
        <strong>📚 Tango in Progress!</strong> You're on the right track, but there's room for improvement.
      </div>
      <div class="feedback-item tip">
        <strong>💡 Study Tip:</strong> Focus on the chronological relationships between events. Look for patterns in the dates.
      </div>
    `;
  } else {
    feedback = `
      <div class="feedback-item needs-work">
        <strong>📖 Keep Practicing Your Tango!</strong> This timeline needs more practice.
      </div>
      <div class="feedback-item tip">
        <strong>💡 Study Strategy:</strong> 
        <ul>
          <li>Start with a few cards at a time</li>
          <li>Look for date patterns (centuries, decades)</li>
          <li>Use the "Skip" button if you're unsure</li>
          <li>Practice regularly to build memory</li>
        </ul>
      </div>
    `;
  }
  
  if (cardsPlayed < totalCards) {
    const remainingCards = totalCards - cardsPlayed;
    feedback += `
      <div class="feedback-item note">
        <strong>📝 Incomplete Game:</strong> You played ${cardsPlayed} out of ${totalCards} cards. ${remainingCards} card${remainingCards !== 1 ? 's' : ''} remaining.
      </div>
    `;
  }
  
  return feedback;
}


function isOrderBackwards(cards) {
  // Need at least 2 cards to determine if they're ordered backwards
  if (cards.length < 2) {
    return false;
  }
  
  for (let i = 1; i < cards.length; i++) {
    if (Number(cards[i - 1].dataset.date) <= Number(cards[i].dataset.date)) {
      return false;
    }
  }
  return true;
}


function checkResults() {
  // Check if button is disabled or if there are fewer than 2 cards placed
  const checkResultsButton = document.getElementById('check-results-button');
  const actualCards = Array.from(cardContainer.children).filter(child => 
    child.classList.contains('card')
  );
  const placedCardsCount = actualCards.length;
  
  if (checkResultsButton.disabled || placedCardsCount < 2) {
    return; // Don't proceed if button is disabled or insufficient cards
  }
  
  // Check if there are cards left in the deck
  const hasCardsLeft = currentCardIndex < cardDeck.length;
  
  if (hasCardsLeft && !hasShownResults) {
    // Show confirmation popup for incomplete game only if results haven't been shown yet
    showConfirmPopup();
    return;
  }
  
  // If no cards left or results already shown, proceed with results
  showResults();
}

function showConfirmPopup() {
  const confirmPopup = document.getElementById('confirm-popup');
  confirmPopup.classList.remove('hidden');
  
  // Add event listeners for the confirmation buttons
  document.getElementById('continue-check-button').onclick = function() {
    closeConfirmPopup();
    showResults();
  };
  
  document.getElementById('cancel-check-button').onclick = function() {
    closeConfirmPopup();
  };
}

function closeConfirmPopup() {
  const confirmPopup = document.getElementById('confirm-popup');
  confirmPopup.classList.add('hidden');
}

function showResults() {
  // Remove shine animation when results are checked
  const checkResultsButton = document.getElementById('check-results-button');
  checkResultsButton.classList.remove('shine');
  
  isCheckResultsCalled = true;
  hasShownResults = true; // Mark that results have been shown
  sortableInstance.option("disabled", true);
  skipBtn.disabled = true;

  if (deck.querySelector(".top-card")) {
    deck.querySelector(".top-card").style.backgroundColor = "rgba(156, 163, 175, 0.5)";
  }

  const cards = Array.from(cardContainer.children).filter((child) =>
    child.classList.contains("card")
  );

  const orderBackwards = isOrderBackwards(cards);

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
    const isCorrect = correctIndices.has(index) || orderBackwards;
    card.style.backgroundColor = orderBackwards
      ? "rgba(255, 255, 0, 0.3)"
      : isCorrect
      ? "rgba(0, 255, 0, 0.3)"
      : "rgba(255, 0, 0, 0.3)";
    card.draggable = false;

    if (!card.querySelector(".event-date")) {
      const eventDate = document.createElement("div");
      eventDate.classList.add("event-date");
      eventDate.textContent = Math.floor(card.dataset.date);
      card.prepend(eventDate);
    }

    results.push(
      `${isCorrect ? "CORRECT" : "INCORRECT"} -- ${
        card.dataset.date
      }: ${card.textContent.replace(card.dataset.date, "").trim()}`
    );
  });

  
  // Calculate the accuracy percentage
  const accuracy = orderBackwards ? 100 : (correctIndices.size / n) * 100;

  
  // Show the popup with accuracy and results
  updatePopup(accuracy, results, cards);
}



function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  
  // Save theme preference to localStorage
  saveTheme(isDarkMode ? 'dark' : 'light');

  // Add or remove the 'dark-mode' class for each element
  document.body.classList.toggle('dark-mode', isDarkMode);
  deck.classList.toggle('dark-mode', isDarkMode);
  subjectDiv.classList.toggle('dark-mode', isDarkMode);
  cardArea.classList.toggle('dark-mode', isDarkMode);
  //messageBox.classList.toggle('dark-mode', isDarkMode);
  popupDiv.classList.toggle('dark-mode', isDarkMode);
  //popupResultsDiv.classList.toggle('dark-mode', isDarkMode);

  // Add or remove the 'dark-mode' class for popup and popup-results
  document.getElementById('popup').classList.toggle('dark-mode', isDarkMode);
  //document.getElementById('popup-results').classList.toggle('dark-mode', isDarkMode);

  const themeText = themeToggle.querySelector('span');
  themeText.textContent = isDarkMode ? 'Light' : 'Dark';
}



skipBtn.addEventListener('click', () => {
  // Don't allow skipping if this is the last card
  if (currentCardIndex >= cardDeck.length - 1) {
    return;
  }
  
  // Store the skipped card with ID
  const skippedCardData = {
    name: newCard.textContent,
    date: newCard.dataset.date,
    id: newCard.dataset.cardId
  };
  skippedCards.push(skippedCardData);
  
  currentCardIndex++;
  drawCard();
  hasInteracted = true;
  
  // Enable back button
  document.querySelector('.back-button').disabled = false;
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

function closeInstructionsPopup() {
  const instructionsPopup = document.getElementById('instructions-popup');
  instructionsPopup.classList.add('hidden');
}

function closeCreditsPopup() {
  const creditsPopup = document.getElementById('credits-popup');
  creditsPopup.classList.add('hidden');
}

function howTo() {
  const instructionsPopup = document.getElementById('instructions-popup');
  instructionsPopup.classList.remove('hidden');
}

function closeInstructionsPopup() {
  const instructionsPopup = document.getElementById('instructions-popup');
  instructionsPopup.classList.add('hidden');
}



document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const popupDiv = document.getElementById('popup');
    const instructionsPopup = document.getElementById('instructions-popup');

    if (!popupDiv.classList.contains('hidden')) {
      closePopup();
    } else if (!instructionsPopup.classList.contains('hidden')) {
      closeInstructionsPopup();
    }
  }
});

// Add click outside to close functionality for all popups
document.addEventListener('DOMContentLoaded', function() {
  const popupDiv = document.getElementById('popup');
  const instructionsPopup = document.getElementById('instructions-popup');
  const confirmPopup = document.getElementById('confirm-popup');

  // Results popup
  popupDiv.addEventListener('click', function(event) {
    if (event.target === popupDiv) {
      closePopup();
    }
  });

  // Instructions popup
  instructionsPopup.addEventListener('click', function(event) {
    if (event.target === instructionsPopup) {
      closeInstructionsPopup();
    }
  });

  // Confirmation popup
  confirmPopup.addEventListener('click', function(event) {
    if (event.target === confirmPopup) {
      closeConfirmPopup();
    }
  });
  

});

function goBack() {
  if (skippedCards.length === 0) {
    return;
  }
  
  // Get the last skipped card
  const lastSkippedCard = skippedCards.pop();
  
  // Remove the card from played cards if it was there
  playedCards.delete(lastSkippedCard.id);
  
  // Insert the skipped card back at the current position
  cardDeck.splice(currentCardIndex, 0, lastSkippedCard);
  
  // Redraw the card (this will show the restored card)
  drawCard();
  
  // Disable back button if no more skipped cards
  if (skippedCards.length === 0) {
    document.querySelector('.back-button').disabled = true;
  }
  
  // Show a message
  showMessage('Card restored!');
}

function updateCreatorAttribution(flashcardSet) {
  const studyText = document.getElementById('study-text');
  const creator = creatorMapping[flashcardSet];
  
  if (creator) {
    // Get the display name for the subject
    const subjectNames = {
      'test': 'Test Deck',
      'apeuro': 'AP Euro (key dates)',
      'apeuro-extended': 'AP Euro (extended)',
      'apush': 'APUSH (key dates)',
      'apush-extended': 'APUSH (extended)',
      'apwh': 'AP World'
    };
    
    const subjectName = subjectNames[flashcardSet] || flashcardSet;
    studyText.innerHTML = `Studying <strong>${subjectName}</strong> by ${creator}`;
    
    // Show the study info
    document.getElementById('study-info').style.display = 'flex';
  } else {
    // Hide the study info if no creator found
    document.getElementById('study-info').style.display = 'none';
  }
}

document.getElementById('message-close').addEventListener('click', () => {
  closePopup();
});

document.getElementById('restart-button').addEventListener('click', () => {
  restart()
});

document.getElementById('resume-button').addEventListener('click', () => {
  resumeGame()
});

document.getElementById('check-results-button').onclick = checkResults;

cardDeck = shuffle(cardDeck);
drawCard();


const sortableInstance = Sortable.create(cardContainer, {
  group: 'shared',
  animation: 150,
  ghostClass: 'sortable-ghost',
  chosenClass: 'sortable-chosen',
  forceFallback: true,
  fallbackClass: 'sortable-fallback',
  swap: false,
  swapThreshold: 0.5,
  onAdd: updateCheckResultsButton,
  onUpdate: updateCheckResultsButton,
  onEnd: updateCheckResultsButton,
  //disabled: !isDraggable,
});

// Hide the Skip button initially, and hide the deck and card-area initially
skipBtn.style.display = 'none';
deck.style.display = 'none';
document.querySelector('.card-area').style.display = 'none';

// Hide game elements initially
document.querySelector('.current-card').style.display = 'none';
document.querySelector('.back-button').style.display = 'none';

// Add event listeners to the subject selector and load game button
const subjectSelector = document.getElementById('subject');
const subjectDiv = document.getElementById('subject-selector');
const loadGameButton = document.getElementById('load-game-button');

// Add event listener for subject selector change
if (subjectSelector) {
  subjectSelector.addEventListener('change', () => {
    if (loadGameButton) {
      loadGameButton.disabled = subjectSelector.value === '';
    }
  });
}

async function loadGame(flashcardSetName) {
  gtag('event', 'game_load', {
    'subject': flashcardSetName,
  });
  
  const selectedSubject = flashcardSetName;
  const newFlashcards = await loadFlashcards(selectedSubject);

  ///fix
  const params = new URLSearchParams(window.location.search);
  if (!params.has('flashcards')) {
    let stateObj = { id: "100" };
    window.history.pushState(stateObj,
        "Page", window.location.href+"&flashcards="+selectedSubject);
  }

  // Reset UI state
  const cardContainer = document.querySelector('.card-container');
  if (cardContainer) {
    cardContainer.innerHTML = '';
  }
  
  // Reset placeholder
  placeholder.style.opacity = '1';
  placeholder.style.color = '#3b82f6';
  placeholder.style.borderColor = '#3b82f6';
  placeholder.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
    
  if (newFlashcards) {
    flashcards.length = 0;
    flashcards.push(...newFlashcards);
    
    // Add unique IDs to cards
    const cardsWithIds = newFlashcards.map((card, index) => ({
      ...card,
      id: `${selectedSubject}_${index}_${card.name.replace(/\s+/g, '_')}_${card.date}`
    }));
    
    cardDeck = shuffle([...cardsWithIds]);
    currentCardIndex = 0;
    skippedCards = []; // Reset skipped cards
    playedCards.clear(); // Reset played cards tracking
    currentCardId = null; // Reset current card ID

    // Show the Skip button, card deck, and card area
    skipBtn.style.display = 'block';
    deck.style.display = 'flex';
    deck.style.alignItems = 'center'; // Add this line
    deck.style.justifyContent = 'center'; // Add this line
    document.querySelector('.card-area').style.display = 'flex';
    
    // Show game elements
    document.querySelector('.current-card').style.display = 'flex';
    document.querySelector('.back-button').style.display = 'block';
    
    // Disable back button initially
    document.querySelector('.back-button').disabled = true;

    // Update creator attribution
    updateCreatorAttribution(flashcardSetName);

    // Remove shine animation from check results button
    const checkResultsButton = document.getElementById('check-results-button');
    checkResultsButton.classList.remove('shine');

    // Disable the subject selector and load game button
    if (subjectSelector) subjectSelector.disabled = true;
    if (loadGameButton) loadGameButton.disabled = true;
    if (subjectDiv) subjectDiv.style.display = 'none';

    drawCard();
    
    // Enable skip button if there are multiple cards
    if (cardDeck.length > 1) {
      skipBtn.disabled = false;
    }
    
    // Ensure check results button is in correct initial state
    updateCheckResultsButton();
    
    console.log(`Loading game with flashcard set: ${flashcardSetName}`);
    console.log('Game elements should now be visible:', {
      skipBtn: skipBtn.style.display,
      deck: deck.style.display,
      cardArea: document.querySelector('.card-area').style.display,
      currentCard: document.querySelector('.current-card').style.display,
      backButton: document.querySelector('.back-button').style.display
    });
  }
}

loadGameButton.addEventListener('click', async () => {

  placeholder.style.opacity = '1';
  placeholder.style.color = '#3b82f6';
  placeholder.style.borderColor = '#3b82f6';
  placeholder.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
  
  const selectedSubject = subjectSelector ? subjectSelector.value : '';
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
    
    // Add unique IDs to cards
    const cardsWithIds = newFlashcards.map((card, index) => ({
      ...card,
      id: `${selectedSubject}_${index}_${card.name.replace(/\s+/g, '_')}_${card.date}`
    }));
    
    cardDeck = shuffle([...cardsWithIds]);
    currentCardIndex = 0;
    skippedCards = []; // Reset skipped cards
    playedCards.clear(); // Reset played cards tracking
    currentCardId = null; // Reset current card ID

    // Show the Skip button, card deck, and card area
    skipBtn.style.display = 'block';
    deck.style.display = 'flex';
    deck.style.alignItems = 'center'; // Add this line
    deck.style.justifyContent = 'center'; // Add this line
    document.querySelector('.card-area').style.display = 'flex';
    
    // Show game elements
    document.querySelector('.current-card').style.display = 'flex';
    document.querySelector('.back-button').style.display = 'block';
    
    // Disable back button initially
    document.querySelector('.back-button').disabled = true;

    // Update creator attribution
    updateCreatorAttribution(selectedSubject);

    // Remove shine animation from check results button
    const checkResultsButton = document.getElementById('check-results-button');
    checkResultsButton.classList.remove('shine');

    // Disable the subject selector and load game button
    if (subjectSelector) subjectSelector.disabled = true;
    if (loadGameButton) loadGameButton.disabled = true;
    if (subjectDiv) subjectDiv.style.display = 'none';

    drawCard();
    
    // Enable skip button if there are multiple cards
    if (cardDeck.length > 1) {
      skipBtn.disabled = false;
    }
    
    // Ensure check results button is in correct initial state
    updateCheckResultsButton();
  }
});

function copyResults() {
  const resultsDiv = document.querySelector(".popup-results");
  const copyButton = resultsDiv.querySelector(".copy-button");
  const copyConfirmation = resultsDiv.querySelector(".copy-confirmation");
  const resultsContent = resultsDiv.querySelector(".results-content");
  
  // Get the text content from the results-content div only
  let textContent = resultsContent.innerText;
  
  // Clean up whitespace more aggressively
  textContent = textContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
  
  // Copy to clipboard
  navigator.clipboard.writeText(textContent).then(() => {
    // Show visual feedback
    copyButton.classList.add('copied');
    copyConfirmation.classList.add('show');
    
    // Reset after 2 seconds
    setTimeout(() => {
      copyButton.classList.remove('copied');
      copyConfirmation.classList.remove('show');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Show visual feedback even for fallback
    copyButton.classList.add('copied');
    copyConfirmation.classList.add('show');
    
    setTimeout(() => {
      copyButton.classList.remove('copied');
      copyConfirmation.classList.remove('show');
    }, 2000);
  });
}
