class Box {
    constructor(width, height, x, y, ctx) {
        /* Dimensions, coordinates, rendering context, occupied status */
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.occupied = false;
    }
    draw() {
        /* Draw the box using a Path2D Object (easy touch or mouse collision detection) */
        this.path = new Path2D();
        this.path.rect(this.x, this.y, this.width, this.height);
        this.ctx.strokeRect(this.x, this.y, this.width, this.height);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x, this.y, this.width, this.height)
    }
    mark(player) {
        /* Mark the box with the player's color */
        if (player) {
            console.log(player)
            this.occupied = player;
            this.ctx.beginPath();
            this.ctx.fillStyle = player.color;
            this.ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 30, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
}

class TicTacToeApp {
    constructor(size = 3) {
        this.gameOver = false;
        this.players = [{ name: 'red', color: 'red' }, { name: 'blue', color: 'blue' }];
        this.turn = 0;
        this.moves = size * size;
        this.boxes = [];
        this.touches = [];
        this.size = size;
        this.getTouchCoord = this.getTouchCoord.bind(this);
    }
    /* Initialize and handle responsive sizing */
    init(ctx, canvas, width, height) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.activateListeners();
        this.makeBoard();
        this.drawBoard();
    }
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.drawBoard();
    }
    /* Methods for plotting and drawing the board */
    drawBoard() {
        this.makeBoard();
        for (let box in this.boxes) {
            this.boxes[box].draw();
        }
    }
    makeBoard() {
        const { ctx, canvas } = this;
        this.boxes = [];
        const width = canvas.width / this.size;
        const height = canvas.height / this.size;
        let y = canvas.height - height;
        let x = 0;
        while (x <= canvas.width) {
            if (x === canvas.width) {
                x = 0;
                y -= height;
                if (y <= -height) {
                    break;
                }
            }
            const box = new Box(width, height, x, y, ctx);
            this.boxes.push(box);
            x += canvas.width / this.size;
        }
    }
    /* Methods for determining a winner */
    hasWinner(box) {
        // Tie?
        if (this.moves === 0) {
            this.endGame({ name: 'Nobody', color: 'black' });
            return;
        }
        // Winner?
        if (this.checkRows(box) || this.checkColumn(box) || this.checkDownwardDiaganal(box) || this.checkUpwardDiaganal(box)) {
            this.endGame(this.players[this.turn % 2]); // Announce the winner
        } else {
            this.turn = (this.turn + 1) % 2; // Next player's turn
        }
    }
    endGame(player) {
        this.ctx.fillStyle = player.color;
        this.ctx.font = '75px Arial';
        this.ctx.translate(0, 0);
        this.ctx.fillText(`${player.name} wins! \n Touch to start a new game.`, (this.canvas.width / 2) / 2, this.canvas.height / 2);
        this.gameOver = true;
        this.moves = this.size * this.size;
    }
    checkRows(index) {
        let currentName = this.boxes[index].occupied.name;
        let row = Math.floor(index / this.size);
        for (let col = 0; col < this.size; col++) {
            let otherBox = row * this.size + col;
            if (!this.boxes[otherBox]) return false;
            if (this.boxes[otherBox].occupied.name !== currentName) return false;
        }
        return true;
    }
    checkColumn(index) {
        let currentName = this.boxes[index].occupied.name;
        let col = Math.floor(index % this.size);
        for (let row = 0; row < this.size; row++) {
            let otherBox = row * this.size + col;
            if (!this.boxes[otherBox]) return false;
            if (this.boxes[otherBox].occupied.name !== currentName) return false;
        }
        return true;
    }
    checkDownwardDiaganal(index) {
        let currentName = this.boxes[index].occupied.name;
        for (let col = 0; col < this.size; col++) {
            let otherBox = (col * this.size) + col;
            if (!this.boxes[otherBox]) return false;
            if (this.boxes[otherBox].occupied.name !== currentName) return false;
        }
        console.log(`Winning diaganal: ${currentName}`)
    }
    checkUpwardDiaganal(index) {
        let currentName = this.boxes[index].occupied.name;
        for (let col = 0; col < this.size; col++) {
            let otherBox = (this.size - 1 - col) * this.size + col;
            // (get the row) + col
            if (!this.boxes[otherBox]) return false;
            if (this.boxes[otherBox].occupied.name !== currentName) return false;
        }
        return true;
    }
    /* Interactivity methods */
    activateListeners() {
        const { canvas } = this;
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            if (!this.gameOver) {
                this.touchStart(event)
            } else {
                this.boxes = [];
                this.turn = 0;
                this.ctx.clearRect(0, 0, this.width, this.height);
                this.drawBoard();
                this.gameOver = false;
            }
        }, false);
        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            this.touchEnd(event)
        }, false);
    }
    touchStart(event) {
        const changedTouches = event.changedTouches;
        let key;
        let newTouch;
        for (let touch = 0; touch < changedTouches.length; ++touch) {
            key = this.getBox(changedTouches[touch]);
            newTouch = { id: changedTouches[touch].identifier, key };
            this.touches.push(newTouch);
        }
    }
    touchEnd(event) {
        const changedTouches = event.changedTouches;
        for (let touch = 0; touch < changedTouches.length; ++touch) {
            const index = this.getTouchIndex(changedTouches[touch].identifier);
            if (index >= 0) {
                this.touches.splice(index, 1);
            }
        }
    }
    getTouchIndex(id) {
        for (let touch = 0; touch < this.touches.length; ++touch) {
            if (this.touches[touch].id === id) {
                return touch;
            }
        }
    }
    getTouchCoord(touch) {
        const { canvas } = this;
        const rect = canvas.getBoundingClientRect(),
            scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
            scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
        return [
            (touch.clientX - rect.left) * scaleX,
            (touch.clientY - rect.top) * scaleY
        ];
    }
    getBox(touch) {
        const { ctx, boxes, getTouchCoord, players, turn } = this;
        const [touchX, touchY] = getTouchCoord(touch);
        for (let box in boxes) {
            const rect = boxes[box];
            if (!isNaN(touchX) && !isNaN(touchY)) {
                if (ctx.isPointInPath(rect.path, touchX, touchY)) {
                    if (boxes[box].occupied) {
                        console.log(`Box is already occupied by ${boxes[box].occupied.name}`)
                    } else {
                        boxes[box].mark(players[turn]);
                        this.moves--;
                        this.hasWinner(box);
                    }
                }
            }
        }
    }
}

export { TicTacToeApp }