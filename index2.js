"use strict";

const Grid = class Grid {
  constructor() {
    this.grid = document.querySelector(".grid");
    this.sunkShipsHtml = document.getElementById('sunkShips');
    this.actualPlayerHtml = document.getElementById("actualPlayer");

    this.table = "<table>";
    this.playerGrid = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
    this.gridMemory = {
      1: {},
      2: {},
    };

    this.playerGrids = {
      1 : this.playerGrid,
      2 : this.playerGrid2
    }

    this.shipCount = this.innitDatas();
    this.shipDamages = { 2: 0, 3: 0, 4: 0, 5: 0 };
    this.shipNames = {
      2: "torpilleur",
      3: "sous-marin",
      4: "croiseur",
      5: "porte-avion",
    };

    this.sunkShips = {
      "torpilleur": {
        cases: 2,
        nombres: this.shipCount[2] || 0,
      },
      "sous-marin": {
        cases: 3,
        nombres: this.shipCount[3] || 0,
      },
      "croiseur": {
        cases: 4,
        nombres: this.shipCount[4] || 0,
      },
      "porte-avion": {
        cases: 5,
        nombres: this.shipCount[5] || 0,
      },
    };
    this.run();
  }

  innitDatas() {
    const shipCount = { 2: 0, 3: 0, 4: 0, 5: 0 };
    const shipSizes = [2, 3, 4, 5];

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const ship = this.playerGrid[i][j];
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

  innitGame() {
    for (let i = 0; i < 10; i++) {
      this.table += "<tr>";

      for (let j = 0; j < 10; j++) {
        this.table += `<td style="background: grey; width: 50px; height: 50px;" id="cell-${i}-${j}"></td>`;
      }

      this.table += "</tr>";
    }

    this.table += "</table>";

    console.log(this.table);
    this.grid.innerHTML += this.table;
  }

  onClickCheck() {
    const elTd = document.querySelectorAll("td");
    elTd.forEach((td, index) => {
      const handleClick = (e) => {
        e.preventDefault();

        const i = Math.floor(index / 10); // Indice de la ligne
        const j = index % 10; // Indice de la colonne
        const row = String.fromCharCode(65 + i);
        const col = j + 1;

        fetch("./check_bateau.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ row: row, col: col, player: this.currentPlayer }),
        })
          .then((response) => response.json())
          .then((data) => {
            //console.log(data);
            if (data.status === "coup") {
              td.style.backgroundColor = "red";
              this.gridMemory[this.currentPlayer][`${i}-${j}`] = "red";
              const bateauId = parseInt(data.bateau_id, 10);
              this.shipDamages[bateauId] += 1;
              this.isSunk();
              this.checkWin();
              //console.log(`Touché ! Bateau ID : ${data.bateau_id}`);

            } else if (data.status === "manqué") {
              td.style.backgroundColor = "blue";
              this.gridMemory[this.currentPlayer][`${i}-${j}`] = "blue";
              //console.log("Manqué !");
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

  isSunk() {
    const damages = this.shipDamages;
    const sunk = this.sunkShips;
    const count = this.shipCount;

    for (const i in damages) {
      const shipSize = parseInt(i, 10);

      if (damages[i] >= shipSize && count[shipSize] > 0) {
        const shipName = this.shipNames[shipSize];

        sunk[shipName].nombres -= 1;
        count[shipSize] -= 1;
        damages[i] -= shipSize;

        //console.log(sunk);
        setTimeout(() => {
          alert(`- ${shipName} coulé !`);
        }, 50);
        this.sunkShipsHtml.innerHTML += `<div>- ${shipName}</div>`;
      }
    }
  }

  checkWin() {
    const sunk = this.sunkShips;
    let win = true;
    for (const i in sunk) {
      if (sunk[i].nombres !== 0) {
        win = false;
        break;
      }
    }

    if (win === true) {
      setTimeout(() => {
        alert("WIN !!! Every ship sunk !");
      }, 50);
    }
  }


  changePlayer(){

    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    const elTd = document.querySelectorAll("td");
    elTd.forEach((td) => td.style.backgroundColor = "grey");
    const actualPlayerGrid = this.gridMemory[this.currentPlayer];

    for (const key in actualPlayerGrid) {
    
    const [i, j] = key.split("-").map(Number); //trouvé sur internet : permet de décomposer l'id des cell
    const td = document.getElementById(`cell-${i}-${j}`);
    td.style.backgroundColor = actualPlayerGrid[key];
    }

    alert(`C'est au tour du Joueur ${this.currentPlayer} !`);
    this.actualPlayerHtml.innerHTML = `Player ${this.currentPlayer}`;
    
    

  }


  run() {
    this.innitGame();
    this.onClickCheck();
  }
};

const test = new Grid();