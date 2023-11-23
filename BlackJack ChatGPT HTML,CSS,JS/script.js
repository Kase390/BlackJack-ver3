// script.js
const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let dealerHand = [];
let playerMoney = 100;
let bet = 0;

const playerHandElement = document.getElementById('player-hand');
const dealerHandElement = document.getElementById('dealer-hand');
const dealButton = document.getElementById('deal-button');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const cardContainer = document.querySelector('.card'); // 追加
const betInputElement = document.getElementById('bet-input');
const betButton = document.getElementById('bet-button');
const moneyElement = document.getElementById('money');

dealButton.addEventListener('click', () => deal(deck, playerHand, dealerHand));
hitButton.addEventListener('click', () => hit(deck, playerHand));
standButton.addEventListener('click', () => stand(deck, dealerHand));

betButton.addEventListener('click', () => changeBet(1));

function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}


  const backgroundSound = new Howl({
    src: ['sounds/background-sound.mp3'],
    loop: true,
    volume: 0.2,
  });

  // Howler.jsを使用して効果音を再生
  const soundDealerWins = new Howl({
    src: ['sounds/dealer-wins-sound.mp3'], // 実際の音声ファイルのパスに変更
    volume: 0.5,
  });

  // Howler.jsを使用して効果音を再生
  const soundPlayerWins = new Howl({
    src: ['sounds/player-wins-sound.mp3'], // 実際の音声ファイルのパスに変更
    volume: 0.5,
  });

function placeBet() {

  if (playerHand.length > 0 || dealerHand.length > 0) {
    alert("You cannot change your bet during the game.");
    return;
  }

  const betAmount = parseInt(betInputElement.value);
  if (isNaN(betAmount) || betAmount <= 0 || betAmount > playerMoney) {
    alert('Invalid bet amount. Please enter a valid amount.');
    return;
  }
  
    // ベット処理
  playerMoney -= betAmount;
  bet = betAmount;
  
  updateMoneyDisplay();
    // ゲームスタート

  startGame();
  }  

function initHands() {
    const playerFirstCard = deck.pop();
    const dealerFirstCard = deck.pop();
    const playerSecondCard = deck.pop();
    const dealerSecondCard = deck.pop();
  
    // プレイヤーとディーラーの手札を初期化
    playerHand = [playerFirstCard, playerSecondCard];
    dealerHand = [dealerFirstCard, dealerSecondCard];

  }

function startGame(){
  console.log("Starting game...");
  if (!backgroundSound.playing()) {
    backgroundSound.play();
  }
  // これより下の処理はベット機能などを追加する。
  
  // プレイヤーとディーラーの手札を初期化
  if (deck.length < 4) { // デッキの残り枚数が4枚以下の場合に新しいデッキを用意
    deck = createDeck();
    shuffleDeck(deck);
  }

  initHands();

  toggleButtons(false);
  renderHands();
}


function changeBet(amount) {
  const betInput = document.getElementById('bet-input');
  let newBet = parseInt(betInput.value) + amount;

  if (newBet < 1) {
    newBet = 1;
  }

  betInput.value = newBet;
  currentBet = newBet;
}

function stand() {
  console.log("stand called");
  console.log("dealerHand at the beginning of stand:", dealerHand);
  revealDealerFirstCard(); // ここで revealDealerFirstCard を呼び出す

  while (calculateHandValue(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }

  renderHands();
  endGame(calculateWinner());
}


function deal() {
  if (bet === 0) {
    alert("Please place a bet before dealing.");
    return;
  }
  deck = createDeck();
  shuffleDeck(deck);

  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];

  renderHands();
  toggleButtons(false);
}

function hit() {
  playerHand.push(deck.pop());
  renderHands();

  if (calculateHandValue(playerHand) > 21) {
    endGame(false);
  }
}

function calculateHandValue(hand, excludeFirstCard = false) {
  console.log(hand); // デバッグ用のログ

  let sum = 0;
  let hasAce = false;

  for (let i = 0; i < hand.length; i++) {
    const card = hand[i]

    if (i === 0 && excludeFirstCard) {
      continue; // 初期手札の一枚目は total に加算しない
    }

    if (card.value === 'A') {
      hasAce = true;
    }
    sum += cardValue(card.value);
  }

  if (hasAce && sum + 10 <= 21) {
    sum += 10;
  }

  return sum;
}

function calculateWinner() {
  const playerScore = calculateHandValue(playerHand);
  const dealerScore = calculateHandValue(dealerHand);

  if (playerScore > 21) {
    return false; // Dealer wins, player busted
  }

  if (dealerScore > 21) {
    return true; // Player wins, dealer busted
  }

  return playerScore > dealerScore; // Compare scores
}


function cardValue(value) {
  return (value === 'K' || value === 'Q' || value === 'J') ? 10 : parseInt(value) || 11;
}

function renderHands() {
  renderHand(playerHand, playerHandElement);
  renderHand(dealerHand, dealerHandElement, true); // ここでの true は初期の裏側のカードを表示するためのものです

  const dealerTotalElement = dealerHandElement.querySelector('.hand-total');
  // ディーラーの初期手札は total に反映させない
  const initialDealerTotal = (dealerHand.length === 2 && calculateHandValue(dealerHand, true) !== calculateHandValue(dealerHand))
    ? calculateHandValue([dealerHand[1]]) // 初期カードの一枚目だけを計算に加える
    : calculateHandValue(dealerHand);

  dealerTotalElement.textContent = (dealerHand.length === 2) ? `Total: ${initialDealerTotal} + ?` : `Total: ${initialDealerTotal}`;
}


function revealDealerFirstCard() {
  console.log("revealDealerFirstCard called");
  console.log("dealerHand in revealDealerFirstCard:", dealerHand);

  // ディーラーの初期の裏側のカードを表示する
  const dealerHandElement = document.getElementById('dealer-hand');

  if (!dealerHandElement) {
    console.error("Dealer hand element not found!");
    return;
  }

  if (dealerHand.length === 0) {
    console.error("Dealer hand is empty!");
    return;
  }

  const firstCardElement = dealerHandElement.querySelector('.card img:first-child');

  if (!firstCardElement) {
    console.error("First card element not found!");
    return;
  }

  // 以下はそのまま
  firstCardElement.style.display = 'block';

  if (dealerHand.length === 2) {
    // ディーラーの初期手札の場合のみ初期カードを表示
    firstCardElement.src = `images/${dealerHand[0].suit}/${dealerHand[0].value}.png`;

    const dealerTotalElement = dealerHandElement.querySelector('.hand-total');
    const initialDealerTotal = calculateHandValue([dealerHand[1]]);
    dealerTotalElement.textContent = `Total: ${initialDealerTotal + cardValue(dealerHand[0].value)}`;
  }
}


function revealAllDealerCards() {
  const dealerHandElement = document.getElementById('dealer-hand');

  // 全てのディーラーのカードを表示
  dealerHand.forEach((card, index) => {
    const cardElement = dealerHandElement.querySelector(`.card:nth-child(${index + 1}) img`);
    cardElement.src = `images/${card.suit}/${card.value}.png`;
  });

  // ディーラーの手札の合計を表示
  displayTotal(dealerHand, 'dealer-hand');
}

function displayTotal() {
  console.log("displayTotal called");
  const playerTotalElement = document.getElementById('player-area').querySelector('.hand-total');
  const dealerTotalElement = document.getElementById('dealer-area').querySelector('.hand-total');

  const playerTotal = calculateHandValue(playerHand);
  const dealerTotal = calculateHandValue(dealerHand);

  playerTotalElement.textContent = `Total: ${playerTotal}`;
  dealerTotalElement.textContent = `Total: ${dealerTotal}`;
}

function renderHand(hand, element, hideFirstCard) {
  console.log(hand); // デバッグ用のログ

  element.innerHTML = '';

  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];

    // デバッグ用のログ
    if (!card) {
      console.error(`Card at index ${i} is undefined. Hand:`, hand);
      continue;
    }

    const cardElement = document.createElement('div');
    cardElement.className = 'card';

    if (i === 0 && hideFirstCard) {
      cardElement.innerHTML = `<img src="images/back.png" alt="Card Back">`;
    } else {
      cardElement.innerHTML = `<img src="images/${card.suit}/${card.value}.png" alt="${card.value} of ${card.suit}">`;
    }

    element.appendChild(cardElement);
  }

  const handValueElement = document.createElement('div');
  handValueElement.className = 'hand-total';
  // ディーラーの初期手札は total に反映させない
  handValueElement.textContent = (hideFirstCard) ? 'Total: ?' : `Total: ${calculateHandValue(hand)}`;
  element.appendChild(handValueElement);
}

function updateMoneyDisplay() {
  moneyElement.textContent = `Money: $${playerMoney}`; // 修正した行
}


function toggleButtons() {
  hitButton.disabled = deck.length === 0;
  standButton.disabled = deck.length === 0;
  }

function endGame(playerWins) {
  toggleButtons(false);
  
  if (playerWins) {
    alert('Player wins!');
    playerMoney += bet * 2;
    soundPlayerWins.play();
  } else {
    alert('Dealer wins!');
    soundDealerWins.play(); // ディーラーが勝利した場合も初期手札のカードを表示
    }

  revealAllDealerCards();
  revealDealerFirstCard();
  renderHands(!playerWins);
  console.log("dealerHand at the end of endGame:", dealerHand);
  displayTotal();

  toggleButtons(true);
  updateMoneyDisplay();
  
  resetGame();
  }
// ゲーム開始時にボタンを無効化
function resetGame() {
  // デッキや手札、ベットを初期状態に戻す
  deck = [];
  playerHand = [];
  dealerHand = [];
  bet = 0;

  // ゲーム開始時にボタンを無効化
  toggleButtons(false);

  // ベット額の表示を初期化
  updateMoneyDisplay();

  // プレイヤーの手札エリアをクリア
  playerHandElement.innerHTML = '';
  // ディーラーの手札エリアをクリア
  dealerHandElement.innerHTML = '';
}


function displayWinnerInitialHand(hand) {
  const handElement = (hand === playerHand) ? playerHandElement : dealerHandElement;

  // 初期手札を表示
  const firstCardElement = handElement.querySelector('.card img:first-child');
  firstCardElement.style.display = 'block';
  firstCardElement.src = `images/${hand[0].suit}/${hand[0].value}.png`;

  const totalElement = handElement.querySelector('.hand-total');
  const initialTotal = calculateHandValue([hand[1]]);
  totalElement.textContent = `Total: ${initialTotal + cardValue(hand[0].value)}`;
}






