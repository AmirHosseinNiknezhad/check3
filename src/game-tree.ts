type Player = 1 | 2 | 0;

class TicNode {
    position: Player[][];
    children: TicNode[];
    minimaxValue: number | null;

    constructor(position: Player[][]) {
        this.position = position;
        this.children = [];
        this.minimaxValue = null;
    }

    get result(): Player | null {
        for (let i = 0; i < 3; i++) {
            if (
                this.position[i][0] === this.position[i][1] &&
                this.position[i][1] === this.position[i][2] &&
                this.position[i][0] !== 0
            ) {
                return this.position[i][0];
            }
        }
        for (let i = 0; i < 3; i++) {
            if (
                this.position[0][i] === this.position[1][i] &&
                this.position[1][i] === this.position[2][i] &&
                this.position[0][i] !== 0
            ) {
                return this.position[0][i];
            }
        }
        if (
            this.position[0][0] === this.position[1][1] &&
            this.position[1][1] === this.position[2][2] &&
            this.position[0][0] !== 0
        ) {
            return this.position[0][0];
        }
        if (
            this.position[0][2] === this.position[1][1] &&
            this.position[1][1] === this.position[2][0] &&
            this.position[0][2] !== 0
        ) {
            return this.position[0][2];
        }
        if (this.position.flat().every(cell => cell !== 0)) {
            return 0;
        }
        return null;
    }
    get side_toMove(): Player {
        const flatPosition = this.position.flat();
        const count1 = flatPosition.filter(cell => cell === 1).length;
        const count2 = flatPosition.filter(cell => cell === 2).length;
        if (count1 < count2) throw new Error("Invalid game state: Player 1 cannot have fewer moves than Player 2.");
        return count1 === count2 ? 1 : 2;
    }
    createChildren() {
        if (this.result !== null) return;
        const nextPlayer = this.side_toMove;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.position[i][j] === 0) {
                    const newPosition = this.position.map(row => row.slice());
                    newPosition[i][j] = nextPlayer;
                    this.children.push(new TicNode(newPosition));
                }
            }
        }
        return this.children;
    }
    minimax(): number {
        if (this.result !== null) {
            this.minimaxValue = this.result === 0 ? 0 : this.result === 1 ? 1 : -1;
            return this.minimaxValue;
        }
        if (this.side_toMove === 1) {
            let maxEval: number = -Infinity;
            this.children.forEach(child => {
                const current = child.minimax();
                maxEval = Math.max(maxEval, current);
            this.minimaxValue = maxEval;
            });
            // this.minimaxValue = Math.max(...this.children.map(child => child.minimax()));
        } else {
            // this.minimaxValue = Math.min(...this.children.map(child => child.minimax()));
            let minEval: number = Infinity;
            this.children.forEach(child => {
                const current = child.minimax();
                minEval = Math.min(minEval, current);
            });
            this.minimaxValue = minEval;
        }
        return this.minimaxValue;
    }
}

const start = new TicNode([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]);
start.createChildren();
start.minimax();

console.log(start.minimaxValue); // Should print the minimax value of the initial position