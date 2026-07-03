# Zombie Invasion 2D

A fast-paced 2D retro arcade platformer. Bonk platforms, trigger TNT, and survive 50 waves of zombies solo or in local co-op!

🎮 **Play Online on Itch.io:** [https://sailorsanjay.itch.io/zombie-invasion](https://sailorsanjay.itch.io/zombie-invasion)

---

## 🕹️ How to Play

### 🧑‍🚀 Player 1 Controls (Solo / Co-op Left)
* **`A` / `D`**: Move Left / Right
* **`W`**: Jump
* **`S`**: Drop down (if applicable)

### 🧑‍🚀 Player 2 Controls (Co-op Right)
* **`Left` / `Right` Arrow**: Move Left / Right
* **`Up` Arrow**: Jump
* **`Down` Arrow**: Drop down (if applicable)

### ⚙️ Global Commands
* **`F`**: Toggle Fullscreen Mode
* **`Esc`**: Pause / Resume the Game

---

## 🚀 Features

* **Local 2-Player Co-op Mode**: Play together with dedicated WASD vs Arrow Key controls on the same keyboard.
* **Unified Preloading**: All 130+ sprite assets (hero, player 2, and enemies) are preloaded up-front, ensuring gameplay transitions are instant without browser freezes.
* **Responsive Fullscreen Support**: Play in fullscreen on any device by clicking the Fullscreen toggle button or pressing the `F` key.
* **Sequential Progression**: Complete levels sequentially to unlock the next challenge (50 levels across 4 distinct worlds: Valley, Steel, Vault, and Castle).
* **Instant Retry**: On game over, quickly jump back into action with the "► RETRY" button to restart the current level from scratch.
* **Sandboxed IFrame Compatibility**: Uses custom local storage wrappers (`safeStorage`) to prevent browser security exceptions when hosted inside cross-origin sandboxed iframes.

---

## 🛠️ Technologies Used

* **Phaser v3.80.1**: Bundled locally (`phaser.min.js`) for self-contained, offline-compatible web play.
* **Vanilla JavaScript & CSS**: Clean code optimized for speed and low CPU utilization.
* **HTML5 Canvas**: Responsive canvas scaling using Phaser's Scale Manager (`FIT` mode).
