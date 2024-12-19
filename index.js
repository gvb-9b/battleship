"use strict";

const Grid = class Grid {
  constructor() {

    this.grid = document.querySelector(".grid");
    this.sunkShipsHtml = document.getElementById("sunkShips");
    this.sunkShipsHtml2 = document.getElementById("sunkShips2");
    this.winnerHtml = document.getElementById("winner");
    this.actualPlayerHtml = document.getElementById("actualPlayer");

    this.table = "<table>";
    this.playerGrid1 = [ 
      [0, 0, 0, 0, 0, 0, 0, 0, 0,0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 0, 5, 0, 0, 0, 0, 0, 0],
      [0, 3, 0, 5, 0, 0, 0, 0, 0, 0],
      [0, 3, 0, 5, 0, 0, 3, 3, 3, 0],
      [0, 0, 0, 5, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 5, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 4, 4, 4, 4, 0],
    ];

    this.playerGrid2 = [
      [0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 3, 0, 2, 2, 0, 0, 0],
      [0, 0, 0, 0, 5, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 5, 0, 0, 0, 0, 0],
      [0, 4, 0, 0, 5, 0, 0, 3, 3, 3],
      [0, 4, 0, 0, 5, 0, 0, 0, 0, 0],
      [0, 4, 0, 0, 5, 0, 0, 0, 0, 0],
      [0, 4, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    this.currentPlayer = 1;

    this.playerScores = {
      1: 0,
      2: 0,
    };

    this.gridMemory = {
      1: {},
      2: {},
    };

    this.shipDamages = {
      1: { 2: 0, 3: 0, 4: 0, 5: 0 },
      2: { 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    this.shipCount = {
      1: this.innitDatas(this.playerGrid1),
      2: this.innitDatas(this.playerGrid2),
    };

    this.shipNames = {
      2: "torpilleur",
      3: "sous-marin",
      4: "croiseur",
      5: "porte-avion",
    };

    this.sunkShips = {
      1: {
        "torpilleur": { cases: 2, nombres: this.shipCount[1][2] || 0 },
        "sous-marin": { cases: 3, nombres: this.shipCount[1][3] || 0 },
        "croiseur": { cases: 4, nombres: this.shipCount[1][4] || 0 },
        "porte-avion": { cases: 5, nombres: this.shipCount[1][5] || 0 },
      },
      2: {
        "torpilleur": { cases: 2, nombres: this.shipCount[2][2] || 0 },
        "sous-marin": { cases: 3, nombres: this.shipCount[2][3] || 0 },
        "croiseur": { cases: 4, nombres: this.shipCount[2][4] || 0 },
        "porte-avion": { cases: 5, nombres: this.shipCount[2][5] || 0 },
      },
    };

    this.run();
  }

  ////////////////////////////////////////////////////////////////////////////////

  innitDatas(playerGrid) {
    const shipCount = { 2: 0, 3: 0, 4: 0, 5: 0 };
    const shipSizes = [2, 3, 4, 5];

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const ship = playerGrid[i][j];
        if (ship !== 0) {
          shipCount[ship] += 1;
        }
      }
    }

    shipSizes.forEach((size) => {
      shipCount[size] = Math.floor(shipCount[size] / size);
    });

    return shipCount;
  }

  ////////////////////////////////////////////////////////////////////////////////

  innitGame() {
    for (let i = 0; i < 10; i++) {
      this.table += "<tr>";
      for (let j = 0; j < 10; j++) {
        this.table += `<td style="background: grey; width: 50px; height: 50px;" id="cell-${i}-${j}"></td>`;
      }
      this.table += "</tr>";
    }
    this.table += "</table>";
    this.grid.innerHTML += this.table;
  }

  ////////////////////////////////////////////////////////////////////////////////

  onClickCheck() {
    const elTd = document.querySelectorAll("td");
    elTd.forEach((td, index) => {
      const handleClick = (e) => {
        e.preventDefault();

        if (td.style.backgroundColor !== "grey") {
          return;
        }

        const i = Math.floor(index / 10); // Indice pour la ligne
        const j = index % 10; // Indice pour la colonne
        const row = String.fromCharCode(65 + i);
        const col = j + 1;

        fetch("./check_bateau.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            row: row,
            col: col,
            player: this.currentPlayer,
          }),
        })
          .then((response) => response.json())
          .then((data) => {

            if (data.status === "coup") {

              td.style.backgroundColor = "red";
              this.gridMemory[this.currentPlayer][`${i}-${j}`] = "red";
              
              const bateauId = parseInt(data.bateau_id, 10);
              
              this.shipDamages[this.currentPlayer][bateauId] += 1;
              this.isSunk();
              this.checkWin();
            } else if (data.status === "manqué") {
              td.style.backgroundColor = "blue";
              this.gridMemory[this.currentPlayer][`${i}-${j}`] = "blue";
              setTimeout(() => {
                this.changePlayer();
              }, 50);
            }
          })
          .catch((error) => console.error("Error:", error));
      };

      td.addEventListener("click", handleClick);
    });
  }

  ////////////////////////////////////////////////////////////////////////////////

  giveScore(shipSize){

    let pts = this.playerScores[this.currentPlayer] += shipSize;
    let elScore;

    if (this.currentPlayer === 1) {
      elScore = document.getElementById("score1");
    } else {
      elScore = document.getElementById("score2");
    }

    elScore.innerHTML = `<span>Score : ${pts} pts</span>`;
  }

  ////////////////////////////////////////////////////////////////////////////////

  isSunk() {
    const damages = this.shipDamages[this.currentPlayer];
    const sunk = this.sunkShips[this.currentPlayer];
    const count = this.shipCount[this.currentPlayer];

    for (const i in damages) {
      const shipSize = parseInt(i, 10);

      if (damages[i] >= shipSize && count[shipSize] > 0) {
        const shipName = this.shipNames[shipSize];

        sunk[shipName].nombres -= 1;
        count[shipSize] -= 1;
        damages[i] -= shipSize;

        setTimeout(() => {
          alert(`- ${shipName} coulé !`);
        }, 50);
        if (this.currentPlayer === 1) {
          this.sunkShipsHtml.innerHTML += `<div>- ${shipName}</div>`;
          this.giveScore(shipSize);

        } else {
          this.sunkShipsHtml2.innerHTML += `<div>- ${shipName}</div>`;
          this.giveScore(shipSize);
        }
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  checkWin() {
    const sunk = this.sunkShips[this.currentPlayer];
    let win = true;
    for (const i in sunk) {
      if (sunk[i].nombres !== 0) {
        win = false;
        break;
      }
    }

    if (win === true) {
      setTimeout(() => {
        alert(`Joueur ${this.currentPlayer} GAGNÉ !`);
      }, 50);
      this.winnerHtml.innerHTML += `WINNER : Player ${this.currentPlayer}`;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  changePlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    const elTd = document.querySelectorAll("td");
    elTd.forEach((td) => (td.style.backgroundColor = "grey"));
    const actualPlayerGrid = this.gridMemory[this.currentPlayer];

    for (const key in actualPlayerGrid) {
      const [i, j] = key.split("-").map(Number);
      const td = document.getElementById(`cell-${i}-${j}`);
      td.style.backgroundColor = actualPlayerGrid[key];
    }

    alert(`C'est au tour du Joueur ${this.currentPlayer} !`);
    this.actualPlayerHtml.innerHTML = `Player ${this.currentPlayer} turn`;
  }

  ////////////////////////////////////////////////////////////////////////////////

  run() {
    this.innitGame();
    this.onClickCheck();
  }
};

////////////////////////////////////////////////////////////////////////////////

const test = new Grid();
