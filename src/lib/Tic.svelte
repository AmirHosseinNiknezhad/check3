<script lang="ts">
    import JSConfetti from "js-confetti";
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
            if (this.position.flat().every((cell) => cell !== 0)) {
                return 0;
            }
            return null;
        }
        get side_toMove(): Player {
            const flatPosition = this.position.flat();
            const count1 = flatPosition.filter((cell) => cell === 1).length;
            const count2 = flatPosition.filter((cell) => cell === 2).length;
            if (count1 < count2)
                throw new Error(
                    "Invalid game state: Player 1 cannot have fewer moves than Player 2.",
                );
            return count1 === count2 ? 1 : 2;
        }
        createChildren() {
            if (this.result !== null) return;
            const nextPlayer = this.side_toMove;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (this.position[i][j] === 0) {
                        const newPosition = this.position.map((row) =>
                            row.slice(),
                        );
                        newPosition[i][j] = nextPlayer;
                        const newChild = new TicNode(newPosition);
                        newChild.createChildren();
                        this.children.push(newChild);
                    }
                }
            }
        }
        minimax(depth: number = 0): number {
            if (this.result !== null) {
                this.minimaxValue =
                    this.result === 0
                        ? 0
                        : this.result === 1
                          ? 1 - depth * 0.1
                          : -1 + depth * 0.1;
                return this.minimaxValue;
            }
            if (this.side_toMove === 1) {
                let maxEval: number = -Infinity;
                this.children.forEach((child) => {
                    const current = child.minimax(depth + 1);
                    maxEval = Math.max(maxEval, current);
                });
                this.minimaxValue = maxEval;
            } else {
                let minEval: number = Infinity;
                this.children.forEach((child) => {
                    const current = child.minimax(depth + 1);
                    minEval = Math.min(minEval, current);
                });
                this.minimaxValue = minEval;
            }
            return this.minimaxValue;
        }
        get bestmoves(): TicNode[] {
            if (this.result !== null) return [];
            if (this.side_toMove === 1) {
                const maxEval = Math.max(
                    ...this.children.map(
                        (child) => child.minimaxValue ?? -Infinity,
                    ),
                );
                return this.children.filter(
                    (child) => child.minimaxValue === maxEval,
                );
            } else {
                const minEval = Math.min(
                    ...this.children.map(
                        (child) => child.minimaxValue ?? Infinity,
                    ),
                );
                return this.children.filter(
                    (child) => child.minimaxValue === minEval,
                );
            }
        }
    }

    const tree = new TicNode([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ]);
    tree.createChildren();
    tree.minimax();

    let current = $state(tree);
    let moveStack: TicNode[] = [];
    // svelte-ignore state_referenced_locally
        moveStack.push(current);

    const jsConfetti = new JSConfetti();

    function handleCellClick(row: number, col: number) {
        moveStack.push(current);
        if (current.result !== null) return;
        if (current.position[row][col] !== 0) return;
        current =
            current.children.find(
                (child) => child.position[row][col] === current.side_toMove,
            ) ?? current;
        if (current.result !== null) {
            if (current.result !== 0) {
                jsConfetti.addConfetti({
                    confettiNumber: 1000
                });
            }
        }
    }
</script>

<h1>Tic Tac Toe</h1>
<div class="board">
    {#each current.position as row, rowIndex}
        <div class="row">
            {#each row as cell, colIndex}
                <button
                    class="cell"
                    onclick={() => handleCellClick(rowIndex, colIndex)}
                >
                    {cell === 0 ? "" : cell === 1 ? "X" : "O"}
                </button>
            {/each}
        </div>
    {/each}
</div>
<div class="info" style:background-color={current.result === null ? 'blue' : current.result === 0 ? 'gray' : current.result === 1 ? 'green' : 'red'}>
    {#if current.result !== null}
        {#if current.result === 0}
            <p>It's a draw!</p>
        {:else}
            <p>Player {current.result} wins!</p>
        {/if}
    {:else}
        <p>Current Player: {current.side_toMove === 1 ? "X" : "O"}</p>
    {/if}
</div>
<div class="controls">
    <button onclick={() => {moveStack = []; current = tree}}>Restart</button>
    <button onclick={() => {moveStack.push(current); current = current.bestmoves[Math.floor(Math.random() * current.bestmoves.length)] ?? current}}>Best Move</button>
    <button onclick={() => current = moveStack.pop() ?? current}>Undo</button>
</div>

<style>
    .board {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
        margin-top: 2rem;
    }
    .row {
        display: flex;
        gap: 1rem;
    }
    .cell {
        width: 3rem;
        height: 3rem;
        font-size: 1rem;
        text-align: center;
        cursor: pointer;
    }
    .info {
        margin-top: 1rem;
        text-align: center;
        color: white;
        padding: 0.5rem;
        border-radius: 2rem;
        margin-bottom: 1rem;
    }
</style>
