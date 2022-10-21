// constant -- html elements
const popup = document.querySelector('.popup');
const score = document.querySelector('.score');
const lives = document.querySelector('.lives');
const board = document.querySelector('.board');
const ball = document.querySelector('.ball');
const paddle = document.querySelector('.paddle');

// constants -- variables
const brickWidth = 80;
const brickHeight = 50;
const paddleWidth = 160;
const paddleHeight = 30;
const ballWidth = 40;
const ballHeight = 40;

// variables
let isGameRunning = false;
let scoreCount = 0;
let livesCount = 3;
// paddle
let paddleLeft = board.offsetWidth / 2 - paddleWidth / 2;
let paddleTop = board.offsetHeight - paddleHeight - 10;
let paddleSpeed = 8;
let paddleDirection = {
    x: 0,
    y: 0
}
// ball
let isBallStart = false;
let ballLeft = board.offsetWidth / 2 - ballWidth / 2;
let ballTop = board.offsetHeight - paddleHeight - 10 - ballHeight;
let ballSpeed = 5;
let ballDirection = {
    x: 0,
    y: 0
};
// bricks
let bricks = [];


// functions
function createBricks() {
    // create bricks
    for (let i = 0; i < 8; i++) { // columns 
        for (let j = 0; j < 5; j++) { // rows
            const brick = document.createElement('div');
            brick.classList.add('brick');
            brick.style.left = (board.offsetWidth - 10 * brickWidth) / 2 + i * 100 + 'px';
            brick.style.top = 50 + j * 60 + 'px';
            brick.style.width = brickWidth + 'px'; // 8 * (brickWidth + 20) = 800 
            brick.style.height = brickHeight + 'px';
            bricks.push([brick, Math.floor(Math.random() * 2 + 2)]); // health of it is 3
            board.appendChild(brick);
        }
    }
}

function updateBricksHelath() {
    // update bricks health
    for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i][0];
        let health = bricks[i][1];
        brick.innerHTML = health;
    }
}


function movePaddle() {
    if (paddleDirection.x === 1) {
        if (paddleLeft + paddleWidth + paddleSpeed < board.offsetWidth) {
            paddleLeft = paddleLeft + paddleSpeed;
            // move ball
            if (!isBallStart) {
                ballLeft = ballLeft + paddleSpeed;
            }
        }
    }
    else if (paddleDirection.x === -1) {
        if (paddleLeft > paddleSpeed) {
            paddleLeft = paddleLeft - paddleSpeed;
            // move ball
            if (!isBallStart) {
                ballLeft = ballLeft - paddleSpeed;
            }
        }
    }
    // update paddle position
    paddle.style.left = paddleLeft + 'px';
    paddle.style.top = paddleTop + 'px';
}

function moveBall() {
    ballLeft = ballLeft + ballSpeed * ballDirection.x;
    ballTop = ballTop + ballSpeed * ballDirection.y;
    // update ball position
    ball.style.left = ballLeft + 'px';
    ball.style.top = ballTop + 'px';
}

function checkCollision(x1, y1, w1, w2, x2, y2, w2, h2) {
    // check if the two objects collide return true or false
    if (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + w1 > y2) {
        return true;
    }
    return false;
}

function checkBrickCollision() {
    bricks.forEach(brickItem => {
        let brick = brickItem[0];
        let health = brickItem[1];
        if (checkCollision(ballLeft, ballTop, ballWidth, ballHeight, brick.offsetLeft, brick.offsetTop, brickWidth, brickHeight)) {
            health--;
            playAudio('audios/brick.wav');
            if (health <= 0) {
                board.removeChild(brick); // remove brick from the board
                bricks = bricks.filter(brickItem => brickItem[0] !== brick); // remove brick from the bricks array
                ballDirection.y = -ballDirection.y; // change direction of the ball
                scoreCount += 10; // increase score
            }
            else {
                brickItem[1] = health;
                ballDirection.y = -ballDirection.y; // change direction of the ball
                scoreCount++; // increase score
            }
        }
    });
}

function checkWallCollision() {
    if (ballLeft + ballWidth > board.offsetWidth || ballLeft < 0) { // Goes out of the left or right wall
        ballDirection.x = -ballDirection.x;
        playAudio('audios/wall.wav');
    }
    if (ballTop < 0) { // Goes out of the top wall
        ballDirection.y = -ballDirection.y;
        playAudio('audios/wall.wav');
    }
    if (ballTop + ballHeight > board.offsetHeight) { // Goes out of the bottom wall
        livesCount--; // decrease lives
        isBallStart = false; // stop the ball
        ballDirection = { // reset the ball direction
            x: 0,
            y: 0
        }
        // reset the ball position
        ballLeft = paddleLeft + paddleWidth / 2 - ballWidth / 2;
        ballTop = board.offsetHeight - paddleHeight - 10 - ballHeight;
    }
}

function checkPaddleCollision() {
    if (checkCollision(ballLeft, ballTop, ballWidth, ballHeight, paddleLeft, paddleTop, paddleWidth, paddleHeight)) {
        ballDirection.y = -ballDirection.y;
        paddle.style.animation = 'paddle 0.1s';
        playAudio('audios/paddle.wav');
    }
}

function updateScore() {
    score.innerHTML = `Score: ${scoreCount}`;
}

function updateLives() {
    lives.innerHTML = `Lives: ${livesCount}`;
}

function checkGameOver() {
    if (livesCount <= 0) {
        setTimeout(() => {
            isGameRunning = false;
        }, 500); // wait for 500ms
        popup.style.display = 'block';
        popup.innerHTML = `
        Game Over!
        <p>Enter to 'RESTART'</p>
        `;
    }
}

function checkWin() {
    const bricks = document.querySelectorAll('.brick');
    if (bricks.length === 0) {
        setTimeout(() => {
            isGameRunning = false;
        }, 500); // wait for 500ms
        popup.style.display = 'block';
        popup.innerHTML = `
        You Win!
        <p>Enter to 'RESTART'</p>
        `;
    }
}

// play audio
function playAudio(audioFile, vol = 1, loop = false) {
    const audio = new Audio(audioFile);
    audio.load();
    audio.volume = vol;
    audio.loop = loop;
    audio.currentTime = 0;
    audio.play();
}



function loop() {
    movePaddle(); // move paddle
    moveBall(); // move the ball

    checkBrickCollision(); // check collision between ball and bricks
    checkWallCollision(); // check collision with the wall
    checkPaddleCollision(); // check collision between ball and paddle

    updateScore(); // update score
    updateLives(); // update lives
    updateBricksHelath(); // update bricks health

    checkGameOver(); // check if the game is over
    checkWin(); // check if the player wins

    // call loop function again
    if (isGameRunning) {
        requestAnimationFrame(loop);
    }
    else {
        cancelAnimationFrame(loop);
    }
}

function init() {
    // isGameRunning
    isGameRunning = true;

    // create bricks
    createBricks();

    // setting all variables to default
    scoreCount = 0;
    livesCount = 3;

    paddleSpeed = 8;
    ballSpeed = 5;

    // set the paddle and ball positions
    paddleLeft = board.offsetWidth / 2 - paddleWidth / 2;
    paddleTop = board.offsetHeight - paddleHeight - 10;
    ballLeft = board.offsetWidth / 2 - ballWidth / 2;
    ballTop = board.offsetHeight - paddleHeight - 10 - ballHeight;

    paddleDirection = {
        x: 0,
        y: 0
    };
    ballDirection = {
        x: 0,
        y: 0
    };

    // init
    loop();

    // event listeners
    document.addEventListener('keydown', (e) => {
        if (isGameRunning) {
            if (e.key === 'ArrowRight') {
                paddleDirection.x = 1;
            }
            else if (e.key === 'ArrowLeft') {
                paddleDirection.x = -1;
            }
            else if (e.key === 'ArrowUp') { // start the ball
                if (!isBallStart) {
                    isBallStart = true;
                    ballDirection.x = Math.random() > 0.5 ? 1 : -1;
                    ballDirection.y = Math.random() > 0.5 ? 1 : -1;
                }
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            paddleDirection.x = 0;
        }
    });

    document.addEventListener('click', (e) => { // start the ball
        if (isGameRunning) {
            if (!isBallStart) {
                isBallStart = true;
                ballDirection.x = Math.random() > 0.5 ? 1 : -1;
                ballDirection.y = Math.random() > 0.5 ? 1 : -1;
            }
        }
    });
}


document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (!isGameRunning) {
            popup.style.display = 'none';
            board.style.display = 'block';
            init();
        }
    }
});