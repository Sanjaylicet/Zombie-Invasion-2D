// --- Task 1: Poki Initialization Bridge ---
if (typeof PokiSDK !== 'undefined') {
    PokiSDK.init().then(() => {
        console.log("Poki SDK cleanly initialized");
    }).catch(() => {
        console.log("Poki SDK mock bypassed (Adblock or restricted network)");
    });
}
// --- Seeded Deterministic Level Generator ---
function getLevelConfig(levelId) {
    let bgKey = 'bg_tile_1';
    let tileKey = 'tile_2';
    let worldName = 'Green Valley';
    if (levelId > 38) {
        bgKey = 'bg_tile_3';
        tileKey = 'tile_5';
        worldName = 'Haunted Castle';
    } else if (levelId > 25) {
        bgKey = 'bg_tile_7';
        tileKey = 'tile_8';
        worldName = 'Abandoned Vault';
    } else if (levelId > 12) {
        bgKey = 'bg_tile_4';
        tileKey = 'tile_14';
        worldName = 'Industrial Steel';
    }
    const targetKills = 5 + levelId * 2;
    const maxEnemies = Math.min(4 + Math.floor(levelId / 5), 10);
    const spawnRate = Math.max(4000 - levelId * 60, 1500);
    // Slower initial speed to make it highly playable
    const enemySpeed = 50 + Math.min(levelId * 2, 60);
    const platforms = [];
    const tntBlocks = [];
    const pseudoRandom = (offset) => {
        const x = Math.sin(levelId * 100 + offset) * 10000;
        return x - Math.floor(x);
    };
    // Top platforms are ALWAYS split on left and right sides with a central gap
    platforms.push({ x: 100, y: 75, w: 200, h: 16 });
    platforms.push({ x: 540, y: 75, w: 200, h: 16 });
    // Staggered middle and bottom platforms
    const p1Width = 140 + Math.floor(pseudoRandom(1) * 60);
    const p2Width = 140 + Math.floor(pseudoRandom(2) * 60);
    const p3Width = 180 + Math.floor(pseudoRandom(3) * 60);
    if (levelId % 2 === 0) {
        platforms.push({ x: 150, y: 255, w: p1Width, h: 16 });
        platforms.push({ x: 490, y: 255, w: p2Width, h: 16 });
        platforms.push({ x: 320, y: 165, w: p3Width, h: 16 });
        tntBlocks.push({ x: 320, y: 165, w: 32, h: 32 });
    } else {
        platforms.push({ x: 320, y: 255, w: p3Width, h: 16 });
        platforms.push({ x: 150, y: 165, w: p1Width, h: 16 });
        platforms.push({ x: 490, y: 165, w: p2Width, h: 16 });
        tntBlocks.push({ x: 320, y: 255, w: 32, h: 32 });
    }
    // Top corners spawn points
    const spawnPoints = [
        { x: 40, y: 30 },
        { x: 600, y: 30 }
    ];
    return {
        levelId,
        worldName,
        bgKey,
        tileKey,
        targetKills,
        maxEnemies,
        spawnRate,
        enemySpeed,
        platforms,
        tntBlocks,
        spawnPoints
    };
}
// --- Main Menu Scene ---
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }
    preload() {
        this.load.image('menu_bg', 'assets/totalassets/png/Tiles/BGTile (1).png');
        this.load.image('menu_panel', 'assets/menu/png/window_sliced.png');
        this.load.image('menu_button', 'assets/menu/png/button_sliced.png');
    }
    create() {
        // Tiled menu background
        this.bg = this.add.tileSprite(320, 180, 640, 360, 'menu_bg');
        this.bg.setAlpha(0.35);
        
        // Frame Panel
        this.panel = this.add.image(320, 190, 'menu_panel');
        this.panel.setDisplaySize(420, 270);
        
        // Title Text
        this.titleText = this.add.text(320, 80, 'ZOMBIE INVASION', {
            fontSize: '36px',
            fill: '#ff2222',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Pulsing Title Animation
        this.tweens.add({
            targets: this.titleText,
            scaleX: 1.05,
            scaleY: 1.05,
            y: 75,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // --- Play Button ---
        const playBtnBg = this.add.image(320, 160, 'menu_button').setDisplaySize(200, 48);
        playBtnBg.setInteractive({ useHandCursor: true });
        
        const playText = this.add.text(320, 160, 'PLAY GAME', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        playBtnBg.on('pointerdown', () => {
            const lvl = this.getHighestLevel();
            this.scene.start('PlatformerScene', { levelId: lvl });
        });
        
        playBtnBg.on('pointerover', () => {
            playBtnBg.setTint(0x88ff88);
            playBtnBg.setAlpha(0.8);
        });
        
        playBtnBg.on('pointerout', () => {
            playBtnBg.clearTint();
            playBtnBg.setAlpha(1.0);
        });
        
        // --- Level Select Button ---
        const selectBtnBg = this.add.image(320, 220, 'menu_button').setDisplaySize(200, 48);
        selectBtnBg.setInteractive({ useHandCursor: true });
        
        const selectText = this.add.text(320, 220, 'LEVEL SELECT', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        selectBtnBg.on('pointerdown', () => {
            this.scene.start('LevelSelectScene');
        });
        
        selectBtnBg.on('pointerover', () => {
            selectBtnBg.setTint(0x88ccff);
            selectBtnBg.setAlpha(0.8);
        });
        
        selectBtnBg.on('pointerout', () => {
            selectBtnBg.clearTint();
            selectBtnBg.setAlpha(1.0);
        });

        // --- Players Toggle Button ---
        this.isTwoPlayer = localStorage.getItem('PokiBonk_TwoPlayer') === 'true';
        
        const modeBtnBg = this.add.image(320, 280, 'menu_button').setDisplaySize(200, 48);
        modeBtnBg.setInteractive({ useHandCursor: true });
        
        const getModeText = () => this.isTwoPlayer ? 'PLAYERS: 2 PLAYERS' : 'PLAYERS: 1 PLAYER';
        const modeText = this.add.text(320, 280, getModeText(), {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        modeBtnBg.on('pointerdown', () => {
            this.isTwoPlayer = !this.isTwoPlayer;
            localStorage.setItem('PokiBonk_TwoPlayer', this.isTwoPlayer ? 'true' : 'false');
            modeText.setText(getModeText());
        });
        
        modeBtnBg.on('pointerover', () => {
            modeBtnBg.setTint(0xffff55);
            modeBtnBg.setAlpha(0.8);
        });
        
        modeBtnBg.on('pointerout', () => {
            modeBtnBg.clearTint();
            modeBtnBg.setAlpha(1.0);
        });
    }
    
    getHighestLevel() {
        try {
            return parseInt(localStorage.getItem('PokiBonk_HighestLevel')) || 1;
        } catch (error) {
            return 1;
        }
    }
}
// --- Level Selection Scene ---
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }
    preload() {
        // Assets are preloaded in MainMenuScene, but defined here just in case
    }
    create() {
        // Tiled menu background
        this.bg = this.add.tileSprite(320, 180, 640, 360, 'menu_bg');
        this.bg.setAlpha(0.35);
        
        // Frame Panel (using assets/menu/png/Windows.png)
        this.panel = this.add.image(320, 190, 'menu_panel').setDisplaySize(540, 280);
        
        // Header Title
        this.add.text(320, 32, 'ZOMBIE INVASION: SELECT LEVEL', {
            fontSize: '22px',
            fill: '#ffff00',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Back to Main Menu Button at the bottom
        const backBtnBg = this.add.image(320, 310, 'menu_button').setDisplaySize(180, 44);
        backBtnBg.setInteractive({ useHandCursor: true });
        
        const backText = this.add.text(320, 310, '◄ MENU', {
            fontSize: '15px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        backBtnBg.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
        
        backBtnBg.on('pointerover', () => {
            backBtnBg.setTint(0xffaa55);
            backBtnBg.setAlpha(0.8);
        });
        
        backBtnBg.on('pointerout', () => {
            backBtnBg.clearTint();
            backBtnBg.setAlpha(1.0);
        });
        
        this.currentTab = 0; 
        this.createTabs();
        this.createLevelButtons();
    }
    createTabs() {
        const tabs = ['VALLEY (1-12)', 'STEEL (13-25)', 'VAULT (26-38)', 'CASTLE (39-50)'];
        this.tabButtons = [];
        
        tabs.forEach((tab, index) => {
            const x = 140 + index * 120;
            const y = 72;
            const btn = this.add.text(x, y, tab, {
                fontSize: '11px',
                fill: index === this.currentTab ? '#ffff00' : '#ffffff',
                backgroundColor: index === this.currentTab ? '#ffffff22' : '#00000044',
                fontFamily: 'Courier',
                fontStyle: 'bold'
            })
            .setOrigin(0.5)
            .setPadding(6)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.currentTab = index;
                this.refreshUI();
            });
            this.tabButtons.push(btn);
        });
    }
    createLevelButtons() {
        this.buttonsGroup = this.add.group();
        
        let highestLevel = 1;
        try {
            highestLevel = parseInt(localStorage.getItem('PokiBonk_HighestLevel')) || 1;
        } catch (e) {
            highestLevel = 1;
        }
        let startLevel = 1;
        let endLevel = 12;
        if (this.currentTab === 1) { startLevel = 13; endLevel = 25; }
        else if (this.currentTab === 2) { startLevel = 26; endLevel = 38; }
        else if (this.currentTab === 3) { startLevel = 39; endLevel = 50; }
        const cols = 5;
        const startX = 140;
        const startY = 135;
        const spacingX = 90;
        const spacingY = 50;
        let index = 0;
        for (let l = startLevel; l <= endLevel; l++) {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = startX + col * spacingX;
            const y = startY + row * spacingY;
            const isUnlocked = l <= highestLevel;
            const isCompleted = l < highestLevel;
            let bgColor = '#44444488';
            let txtColor = '#888888';
            let label = l.toString() + ' 🔒';
            if (isUnlocked) {
                bgColor = isCompleted ? '#ffaa00bb' : '#00aa00bb';
                txtColor = '#ffffff';
                label = l.toString() + (isCompleted ? ' ★' : '');
            }
            
            // Draw visual button background from menu assets
            const btnBg = this.add.image(x, y, 'menu_button').setDisplaySize(72, 38);
            if (!isUnlocked) {
                btnBg.setTint(0x555555);
            } else {
                btnBg.setTint(isCompleted ? 0xffcc44 : 0x44ff44);
            }
            this.buttonsGroup.add(btnBg);
            
            const btn = this.add.text(x, y, label, {
                fontSize: '15px',
                fill: txtColor,
                backgroundColor: bgColor,
                fontFamily: 'Courier',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            })
            .setOrigin(0.5)
            .setPadding(8)
            .setFixedSize(65, 36);
            
            if (isUnlocked) {
                btnBg.setInteractive({ useHandCursor: true });
                btn.setInteractive({ useHandCursor: true })
                   .on('pointerdown', () => {
                       this.scene.start('PlatformerScene', { levelId: l });
                   })
                   .on('pointerover', () => {
                       btnBg.setTint(0xffffff);
                       btnBg.setAlpha(0.8);
                       btn.setStyle({ fill: '#ffff00', backgroundColor: isCompleted ? '#ff9900' : '#00ff00' });
                       btn.setAlpha(0.8);
                   })
                   .on('pointerout', () => {
                       btnBg.setTint(isCompleted ? 0xffcc44 : 0x44ff44);
                       btnBg.setAlpha(1.0);
                       btn.setStyle({ fill: '#ffffff', backgroundColor: bgColor });
                       btn.setAlpha(1.0);
                   });
            } else {
                btnBg.setInteractive({ useHandCursor: true });
                btn.setInteractive({ useHandCursor: true })
                   .on('pointerdown', () => {
                       this.watchAdToUnlockLevel(l);
                   })
                   .on('pointerover', () => {
                       btnBg.setTint(0xffffff);
                       btnBg.setAlpha(0.8);
                       btn.setStyle({ fill: '#ffff00', backgroundColor: '#bb3333' });
                       btn.setAlpha(0.8);
                   })
                   .on('pointerout', () => {
                       btnBg.setTint(0x555555);
                       btnBg.setAlpha(1.0);
                       btn.setStyle({ fill: txtColor, backgroundColor: bgColor });
                       btn.setAlpha(1.0);
                   });
            }
            this.buttonsGroup.add(btn);
            index++;
        }
    }
    refreshUI() {
        this.tabButtons.forEach((btn, index) => {
            if (index === this.currentTab) {
                btn.setStyle({ fill: '#ffff00', backgroundColor: '#ffffff22' });
            } else {
                btn.setStyle({ fill: '#ffffff', backgroundColor: '#00000044' });
            }
        });
        this.buttonsGroup.clear(true, true);
        this.createLevelButtons();
    }
    watchAdToUnlockLevel(levelId) {
        if (typeof PokiSDK !== 'undefined') {
            PokiSDK.rewardedBreak().then((success) => {
                if (success) {
                    this.unlockLevel(levelId);
                }
            });
        } else {
            this.unlockLevel(levelId);
        }
    }
    unlockLevel(levelId) {
        try {
            const currentHighest = parseInt(localStorage.getItem('PokiBonk_HighestLevel')) || 1;
            if (levelId > currentHighest) {
                localStorage.setItem('PokiBonk_HighestLevel', levelId.toString());
            }
            this.refreshUI();
        } catch (e) {
            console.warn("Storage exception on unlock", e);
        }
    }
}
// --- Gameplay Scene ---
class PlatformerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlatformerScene' });
    }
    init(data) {
        this.currentLevelId = data.levelId || 1;
        this.killsCount = 0;
        this.totalSpawnsCount = 0;
        this.levelConfig = getLevelConfig(this.currentLevelId);
        this.isGameOver = false;
        this.isLevelComplete = false;
        this.isPaused = false;
    }
    preload() {
        // --- Load Environment & Tile Assets ---
        this.load.image('bg_tile_1', 'assets/totalassets/png/Tiles/BGTile (1).png');
        this.load.image('bg_tile_3', 'assets/totalassets/png/Tiles/BGTile (3).png');
        this.load.image('bg_tile_4', 'assets/totalassets/png/Tiles/BGTile (4).png');
        this.load.image('bg_tile_7', 'assets/totalassets/png/Tiles/BGTile (7).png');
        this.load.image('tile_2', 'assets/totalassets/png/Tiles/Tile (2).png');
        this.load.image('tile_5', 'assets/totalassets/png/Tiles/Tile (5).png');
        this.load.image('tile_8', 'assets/totalassets/png/Tiles/Tile (8).png');
        this.load.image('tile_14', 'assets/totalassets/png/Tiles/Tile (14).png');
        this.load.image('barrel', 'assets/totalassets/png/Objects/Barrel (1).png');
        this.load.image('menu_button', 'assets/menu/png/button_sliced.png');
        // --- Load Hero Animation Frames ---
        for (let i = 1; i <= 10; i++) {
            this.load.image(`hero_idle_${i}`, `assets/hero/Idle (${i}).png`);
            this.load.image(`hero_dead_${i}`, `assets/hero/Dead (${i}).png`);
        }
        for (let i = 1; i <= 8; i++) {
            this.load.image(`hero_run_${i}`, `assets/hero/Run (${i}).png`);
            this.load.image(`hero_hurt_${i}`, `assets/hero/Hurt (${i}).png`);
        }
        for (let i = 1; i <= 12; i++) {
            this.load.image(`hero_jump_${i}`, `assets/hero/Jump (${i}).png`);
        }
        // --- Load Hero 2 (Player 2) Animation Frames ---
        for (let i = 1; i <= 10; i++) {
            this.load.image(`hero2_idle_${i}`, `assets/hero 2/Idle (${i}).png`);
            this.load.image(`hero2_dead_${i}`, `assets/hero 2/Dead (${i}).png`);
            this.load.image(`hero2_jump_${i}`, `assets/hero 2/Jump (${i}).png`);
        }
        for (let i = 1; i <= 8; i++) {
            this.load.image(`hero2_run_${i}`, `assets/hero 2/Run (${i}).png`);
        }
        // --- Load Female Enemy Animation Frames ---
        for (let i = 1; i <= 10; i++) {
            this.load.image(`enemy_female_walk_${i}`, `assets/enemy/female/Walk (${i}).png`);
        }
        for (let i = 1; i <= 15; i++) {
            this.load.image(`enemy_female_idle_${i}`, `assets/enemy/female/Idle (${i}).png`);
        }
        // --- Load Male Enemy Animation Frames ---
        for (let i = 1; i <= 10; i++) {
            this.load.image(`enemy_male_walk_${i}`, `assets/enemy/male/Walk (${i}).png`);
        }
        for (let i = 1; i <= 15; i++) {
            this.load.image(`enemy_male_idle_${i}`, `assets/enemy/male/Idle (${i}).png`);
        }
    }
    create() {
        this.ACCELERATION_X = 1200;
        this.MAX_SPEED_X = 300;
        this.MAX_SPEED_Y = 800;
        this.FRICTION = 1500;
        this.JUMP_VELOCITY = -500;
        this.isGameOver = false;
        this.isInvulnerable = false;
        this.lives = 5;
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold'
        });
        this.scoreText.setDepth(100);
        // Target Kills progress indicator in top center
        this.progressText = this.add.text(320, 20, `KILLS: 0 / ${this.levelConfig.targetKills}`, {
            fontSize: '22px',
            fill: '#ffff00',
            fontFamily: 'Courier',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.progressText.setDepth(100);
        // Lives indicator on top-right
        this.livesText = this.add.text(624, 16, 'LIVES: ❤️❤️❤️❤️❤️', {
            fontSize: '22px',
            fill: '#ff3333',
            fontFamily: 'Courier',
            fontStyle: 'bold'
        });
        this.livesText.setOrigin(1, 0);
        this.livesText.setDepth(100);
        // Display current level details
        this.worldNameText = this.add.text(16, 44, `${this.levelConfig.worldName} - Level ${this.currentLevelId}`, {
            fontSize: '13px',
            fill: '#88ccff',
            fontFamily: 'Courier',
            fontStyle: 'bold'
        });
        this.worldNameText.setDepth(100);
        // --- Register Animations ---
        const createAnim = (key, prefix, count, frameRate, repeat = -1) => {
            if (!this.anims.exists(key)) {
                const frames = [];
                for (let i = 1; i <= count; i++) {
                    frames.push({ key: `${prefix}${i}` });
                }
                this.anims.create({ key, frames, frameRate, repeat });
            }
        };
        // Hero anims
        createAnim('hero_idle', 'hero_idle_', 10, 15);
        createAnim('hero_run', 'hero_run_', 8, 15);
        createAnim('hero_jump', 'hero_jump_', 12, 15, 0);
        createAnim('hero_dead', 'hero_dead_', 10, 10, 0);
        createAnim('hero_hurt', 'hero_hurt_', 8, 15, 0);
        // Hero 2 anims
        createAnim('hero2_idle', 'hero2_idle_', 10, 15);
        createAnim('hero2_run', 'hero2_run_', 8, 15);
        createAnim('hero2_jump', 'hero2_jump_', 10, 15, 0);
        createAnim('hero2_dead', 'hero2_dead_', 10, 10, 0);
        createAnim('hero2_hurt', 'hero2_idle_', 10, 15, 0);
        // Enemy anims
        createAnim('enemy_female_walk', 'enemy_female_walk_', 10, 12);
        createAnim('enemy_female_idle', 'enemy_female_idle_', 15, 12);
        createAnim('enemy_male_walk', 'enemy_male_walk_', 10, 12);
        createAnim('enemy_male_idle', 'enemy_male_idle_', 15, 12);
        this.createLevel();
        this.createPlayer();
        this.createEnemies();
        this.setupCollisions();
        this.setupInput();
    }
    createLevel() {
        const levelConfig = this.levelConfig;
        const highestLvl = this.getHighestLevel();
        console.log(`Poki Game Log: Launching Level ${this.currentLevelId} (Max Run: ${highestLvl})`);
        this.saveLevelRecord(this.currentLevelId);
        if (typeof PokiSDK !== 'undefined') PokiSDK.gameplayStart();
        // Tiled Background
        this.bg = this.add.tileSprite(320, 180, 640, 360, levelConfig.bgKey);
        this.bg.setDepth(-10);
        // Tiled ground floor
        this.floor = this.add.tileSprite(320, 340, 640, 40, levelConfig.tileKey);
        this.floor.setTileScale(0.15625, 0.15625);
        this.physics.add.existing(this.floor, true);
        this.floor.body.setSize(640, 40);
        this.platforms = this.physics.add.staticGroup();
        levelConfig.platforms.forEach(p => {
            const plat = this.add.tileSprite(p.x, p.y, p.w, p.h, levelConfig.tileKey);
            plat.setTileScale(0.0625, 0.0625);
            this.platforms.add(plat);
            plat.body.setSize(p.w, p.h);
            plat.isBonked = false;
        });
        this.tntBlocks = this.physics.add.staticGroup();
        if (levelConfig.tntBlocks) {
            levelConfig.tntBlocks.forEach(t => {
                const tnt = this.add.sprite(t.x, t.y, 'barrel');
                tnt.setDisplaySize(t.w, t.h + 8);
                this.tntBlocks.add(tnt);
                tnt.body.setSize(t.w, 16);
                tnt.body.setOffset(0, 0);
                tnt.hitsRemaining = 5;
                tnt.isBonked = false;
            });
        }
    }
    createPlayer() {
        this.isTwoPlayer = localStorage.getItem('PokiBonk_TwoPlayer') === 'true';
        
        // Spawn Player 1
        const p1X = this.isTwoPlayer ? 240 : 320;
        this.player = this.physics.add.sprite(p1X, 300, 'hero_idle_1');
        this.player.setScale(0.1);
        this.player.body.setSize(320, 480);
        this.player.body.setOffset(174, 89);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setMaxVelocity(this.MAX_SPEED_X, this.MAX_SPEED_Y);
        this.player.body.setDragX(this.FRICTION);
        this.player.play('hero_idle');
        this.isInvulnerable = false;
        
        // Spawn Player 2 if enabled
        if (this.isTwoPlayer) {
            this.player2 = this.physics.add.sprite(400, 300, 'hero2_idle_1');
            this.player2.setScale(0.1);
            this.player2.body.setSize(320, 480);
            this.player2.body.setOffset(174, 89);
            this.player2.body.setCollideWorldBounds(true);
            this.player2.body.setMaxVelocity(this.MAX_SPEED_X, this.MAX_SPEED_Y);
            this.player2.body.setDragX(this.FRICTION);
            this.player2.play('hero2_idle');
            this.isInvulnerable2 = false;
        }
    }
    createEnemies() {
        this.enemies = this.physics.add.group();
        const levelConfig = this.levelConfig;
        this.spawnEvent = this.time.addEvent({
            delay: levelConfig.spawnRate,
            callback: () => {
                const activeCount = this.enemies.countActive(true);
                if (this.killsCount + activeCount < levelConfig.targetKills &&
                    activeCount < levelConfig.maxEnemies &&
                    !this.isGameOver && !this.isLevelComplete) {
                    const point = Phaser.Utils.Array.GetRandom(levelConfig.spawnPoints);
                    this.spawnEnemy(point.x, point.y);
                }
            },
            callbackScope: this,
            loop: true
        });
        // Spawn initially from both corners
        if (levelConfig.spawnPoints.length > 0 && this.killsCount + this.enemies.countActive(true) < levelConfig.targetKills) {
            this.spawnEnemy(levelConfig.spawnPoints[0].x, levelConfig.spawnPoints[0].y);
        }
        if (levelConfig.spawnPoints.length > 1 && this.killsCount + this.enemies.countActive(true) < levelConfig.targetKills) {
            this.spawnEnemy(levelConfig.spawnPoints[1].x, levelConfig.spawnPoints[1].y);
        }
    }
    spawnEnemy(x, y) {
        this.totalSpawnsCount++;
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const enemy = this.physics.add.sprite(x, y, `enemy_${gender}_idle_1`);
        enemy.gender = gender;
        enemy.setScale(0.08);
        // Custom 24x24 box aligned at enemy feet
        enemy.body.setSize(300, 300);
        enemy.body.setOffset(65, 219);
        enemy.body.setMaxVelocity(400, 800);
        enemy.speedTier = 0;
        enemy.initialSpeed = this.levelConfig.enemySpeed;
        enemy.baseSpeed = enemy.initialSpeed;
        enemy.direction = x < 320 ? 1 : -1; // Walk inward from top corners
        enemy.isStunned = false;
        enemy.isKicked = false;
        enemy.play(`enemy_${gender}_walk`);
        this.enemies.add(enemy);
    }
    setupCollisions() {
        this.physics.add.collider(this.player, this.floor);
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.tntBlocks);
        
        if (this.isTwoPlayer && this.player2) {
            this.physics.add.collider(this.player2, this.floor);
            this.physics.add.collider(this.player2, this.platforms);
            this.physics.add.collider(this.player2, this.tntBlocks);
            
            // Collide players when hitting each other
            this.physics.add.collider(this.player, this.player2);
        }
        
        this.physics.add.collider(this.enemies, this.floor);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.enemies, this.tntBlocks);
        
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            if (this.isGameOver || this.isLevelComplete) return;
            this.handleEnemyOverlap(player, enemy, false);
        });
        
        if (this.isTwoPlayer && this.player2) {
            this.physics.add.overlap(this.player2, this.enemies, (player2, enemy) => {
                if (this.isGameOver || this.isLevelComplete) return;
                this.handleEnemyOverlap(player2, enemy, true);
            });
        }
    }
    handleEnemyOverlap(playerSprite, enemy, isPlayer2) {
        if (enemy.isStunned && !enemy.isKicked) {
            enemy.isKicked = true;
            if (enemy.stunEvent) enemy.stunEvent.remove();
            const kickDirection = playerSprite.x <= enemy.x ? 1 : -1;
            enemy.body.setVelocityX(kickDirection * 500);
            enemy.body.setVelocityY(-150);
            enemy.body.checkCollision.none = true;
            this.tweens.add({
                targets: enemy,
                angle: 360 * kickDirection,
                duration: 300,
                repeat: -1
            });
            this.score += 100;
            this.scoreText.setText('SCORE: ' + this.score);
            this.createFloatingText(enemy.x, enemy.y, '+100');
            this.incrementKills();
        } else if (!enemy.isStunned && !enemy.isKicked) {
            this.handlePlayerHit(playerSprite, enemy, isPlayer2);
        }
    }
    createFloatingText(x, y, message) {
        const txt = this.add.text(x, y, message, { fontSize: '16px', fill: '#ffff00', fontStyle: 'bold' });
        txt.setOrigin(0.5);
        this.tweens.add({
            targets: txt,
            y: y - 40,
            alpha: 0,
            duration: 1000,
            onComplete: () => txt.destroy()
        });
    }
    handlePlayerHit(playerSprite, enemy, isPlayer2) {
        const invulnFlag = isPlayer2 ? this.isInvulnerable2 : this.isInvulnerable;
        if (invulnFlag || this.isGameOver || this.isLevelComplete) return;
        this.lives--;
        this.updateLivesText();
        if (this.lives <= 0) {
            this.triggerGameOver();
        } else {
            if (isPlayer2) {
                this.isInvulnerable2 = true;
                playerSprite.play('hero2_hurt');
            } else {
                this.isInvulnerable = true;
                playerSprite.play('hero_hurt');
            }
            const bounceDir = playerSprite.x < enemy.x ? -1 : 1;
            playerSprite.body.setVelocityX(bounceDir * 300);
            playerSprite.body.setVelocityY(-350);
            this.cameras.main.shake(100, 0.005);
            this.tweens.add({
                targets: playerSprite,
                alpha: 0.3,
                duration: 150,
                yoyo: true,
                repeat: 4,
                onComplete: () => {
                    playerSprite.alpha = 1;
                    if (isPlayer2) {
                        this.isInvulnerable2 = false;
                    } else {
                        this.isInvulnerable = false;
                    }
                }
            });
        }
    }
    updateLivesText() {
        if (this.livesText) {
            const hearts = this.lives > 0 ? '❤️'.repeat(this.lives) : '💀';
            this.livesText.setText(`LIVES: ${hearts}`);
        }
    }
    incrementKills() {
        if (this.isGameOver || this.isLevelComplete) return;
        this.killsCount++;
        this.progressText.setText(`KILLS: ${this.killsCount} / ${this.levelConfig.targetKills}`);
        if (this.killsCount >= this.levelConfig.targetKills) {
            this.triggerLevelComplete();
        }
    }
    triggerLevelComplete() {
        if (this.isLevelComplete) return;
        this.isLevelComplete = true;
        this.physics.pause();
        this.tweens.pauseAll();
        if (typeof PokiSDK !== 'undefined') PokiSDK.gameplayStop();
        // Unlock next level in localStorage
        this.saveLevelRecord(this.currentLevelId + 1);
        // Semitransparent dark overlay
        this.add.rectangle(320, 180, 640, 360, 0x000000, 0.75).setDepth(140);
        this.victoryText = this.add.text(320, 130, 'LEVEL COMPLETED!', {
            fontSize: '44px',
            fill: '#00ff00',
            fontStyle: 'bold',
            fontFamily: 'Courier'
        }).setOrigin(0.5).setDepth(150);
        const isLastLevel = this.currentLevelId >= 50;
        if (!isLastLevel) {
            this.nextLevelBtn = this.add.text(320, 210, '► NEXT LEVEL', {
                fontSize: '24px',
                fill: '#ffff00',
                fontStyle: 'bold',
                backgroundColor: '#000000aa',
                fontFamily: 'Courier'
            })
                .setOrigin(0.5)
                .setPadding(8)
                .setDepth(150)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    this.scene.start('PlatformerScene', { levelId: this.currentLevelId + 1 });
                });
        } else {
            this.victoryText.setText('GAME COMPLETED!');
            this.victoryText.setStyle({ fill: '#ffcc00' });
            this.add.text(320, 190, 'CONGRATULATIONS! YOU BEAT ALL 50 LEVELS!', {
                fontSize: '18px',
                fill: '#ffffff',
                fontStyle: 'bold',
                fontFamily: 'Courier'
            }).setOrigin(0.5).setDepth(150);
        }
        this.menuBtn = this.add.text(320, isLastLevel ? 250 : 270, '► LEVEL SELECT', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#000000aa',
            fontFamily: 'Courier'
        })
            .setOrigin(0.5)
            .setPadding(8)
            .setDepth(150)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('LevelSelectScene');
            });
    }
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.isJumping = false;
        this.isJumping2 = false;
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // Player 1 WASD keys
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
    }
    saveLevelRecord(levelIndex) {
        try {
            const currentHighest = parseInt(localStorage.getItem('PokiBonk_HighestLevel')) || 1;
            if (levelIndex > currentHighest) {
                localStorage.setItem('PokiBonk_HighestLevel', levelIndex.toString());
            }
        } catch (error) {
            console.warn("Storage Exception (Incognito/Private enabled, skipping sync)", error);
        }
    }
    getHighestLevel() {
        try {
            return parseInt(localStorage.getItem('PokiBonk_HighestLevel')) || 1;
        } catch (error) {
            console.warn("Storage Exception (Incognito/Private enabled, defaulting to 1)", error);
            return 1;
        }
    }
    triggerGameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.player.play('hero_dead');
        if (this.isTwoPlayer && this.player2) {
            this.player2.play('hero2_dead');
        }
        this.physics.pause();
        this.tweens.pauseAll();
        if (typeof PokiSDK !== 'undefined') PokiSDK.gameplayStop();
        this.gameOverText = this.add.text(320, 160, 'WASTED', { fontSize: '56px', fill: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(150);
        this.extraLifeBtn = this.add.text(320, 230, '► WATCH AD FOR EXTRA LIFE', { fontSize: '24px', fill: '#ffff00', fontStyle: 'bold', backgroundColor: '#00000088' })
            .setOrigin(0.5)
            .setPadding(8)
            .setDepth(150)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.watchRewardedAd());
    }
    watchRewardedAd() {
        if (typeof PokiSDK !== 'undefined') {
            PokiSDK.rewardedBreak().then((success) => {
                if (success) {
                    this.resumeWithExtraLife();
                } else {
                    this.extraLifeBtn.setText('[ AD CANCELLED / UNAVAILABLE ]');
                }
            });
        } else {
            this.resumeWithExtraLife();
        }
    }
    resumeWithExtraLife() {
        this.gameOverText.destroy();
        this.extraLifeBtn.destroy();
        this.enemies.children.iterate((enemy) => {
            if (enemy && enemy.active) enemy.destroy();
        });
        this.isGameOver = false;
        this.lives = 5;
        this.updateLivesText();
        this.physics.resume();
        this.tweens.resumeAll();
        if (typeof PokiSDK !== 'undefined') PokiSDK.gameplayStart();
        
        this.player.play('hero_idle');
        this.player.body.setVelocityY(-400);
        
        if (this.isTwoPlayer && this.player2) {
            this.player2.play('hero2_idle');
            this.player2.body.setVelocityY(-400);
        }
    }
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            if (!this.isGameOver && !this.isLevelComplete) {
                this.togglePause();
            }
        }
        
        if (this.isPaused || this.isGameOver || this.isLevelComplete) return;
        this.handlePlayerMovement();
        this.updatePlayerAnimations();
        this.checkBonkMechanic();
        this.updateEnemies();
    }
    togglePause() {
        if (!this.isPaused) {
            this.isPaused = true;
            this.physics.pause();
            this.tweens.pauseAll();
            if (this.spawnEvent) this.spawnEvent.paused = true;
            
            // Pause all animations
            this.player.anims.pause();
            if (this.isTwoPlayer && this.player2) {
                this.player2.anims.pause();
            }
            this.enemies.children.iterate((enemy) => {
                if (enemy && enemy.active) {
                    enemy.anims.pause();
                }
            });
            
            // Create Pause UI
            this.pauseOverlay = this.add.rectangle(320, 180, 640, 360, 0x000000, 0.75).setDepth(200);
            
            this.pauseTitle = this.add.text(320, 85, 'GAME PAUSED', {
                fontSize: '28px',
                fill: '#ffff00',
                fontFamily: 'Courier',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(201);
            
            // --- Resume Button ---
            this.resumeBtn = this.add.image(320, 155, 'menu_button').setDisplaySize(180, 44).setDepth(201);
            this.resumeBtn.setInteractive({ useHandCursor: true });
            this.resumeText = this.add.text(320, 155, 'RESUME', {
                fontSize: '15px', fill: '#ffffff', fontFamily: 'Courier', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(201);
            
            this.resumeBtn.on('pointerdown', () => this.togglePause());
            this.resumeBtn.on('pointerover', () => {
                this.resumeBtn.setTint(0x88ff88);
                this.resumeBtn.setAlpha(0.8);
            });
            this.resumeBtn.on('pointerout', () => {
                this.resumeBtn.clearTint();
                this.resumeBtn.setAlpha(1.0);
            });
            
            // --- Level Select Button ---
            this.lvlSelectBtn = this.add.image(320, 215, 'menu_button').setDisplaySize(180, 44).setDepth(201);
            this.lvlSelectBtn.setInteractive({ useHandCursor: true });
            this.lvlSelectText = this.add.text(320, 215, 'LEVEL SELECT', {
                fontSize: '15px', fill: '#ffffff', fontFamily: 'Courier', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(201);
            
            this.lvlSelectBtn.on('pointerdown', () => {
                if (typeof PokiSDK !== 'undefined') PokiSDK.gameplayStop();
                this.scene.start('LevelSelectScene');
            });
            this.lvlSelectBtn.on('pointerover', () => {
                this.lvlSelectBtn.setTint(0x88ccff);
                this.lvlSelectBtn.setAlpha(0.8);
            });
            this.lvlSelectBtn.on('pointerout', () => {
                this.lvlSelectBtn.clearTint();
                this.lvlSelectBtn.setAlpha(1.0);
            });
            
            // --- Main Menu Button ---
            this.mainMenuBtn = this.add.image(320, 275, 'menu_button').setDisplaySize(180, 44).setDepth(201);
            this.mainMenuBtn.setInteractive({ useHandCursor: true });
            this.mainMenuText = this.add.text(320, 275, 'MAIN MENU', {
                fontSize: '15px', fill: '#ffffff', fontFamily: 'Courier', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(201);
            
            this.mainMenuBtn.on('pointerdown', () => {
                if (typeof PokiSDK !== 'undefined') PokiSDK.gameplayStop();
                this.scene.start('MainMenuScene');
            });
            this.mainMenuBtn.on('pointerover', () => {
                this.mainMenuBtn.setTint(0xffaa55);
                this.mainMenuBtn.setAlpha(0.8);
            });
            this.mainMenuBtn.on('pointerout', () => {
                this.mainMenuBtn.clearTint();
                this.mainMenuBtn.setAlpha(1.0);
            });
        } else {
            this.isPaused = false;
            
            // Clean up UI
            this.pauseOverlay.destroy();
            this.pauseTitle.destroy();
            this.resumeBtn.destroy();
            this.resumeText.destroy();
            this.lvlSelectBtn.destroy();
            this.lvlSelectText.destroy();
            this.mainMenuBtn.destroy();
            this.mainMenuText.destroy();
            
            // Resume physics and spawning
            this.physics.resume();
            this.tweens.resumeAll();
            if (this.spawnEvent) this.spawnEvent.paused = false;
            
            // Resume animations
            this.player.anims.resume();
            if (this.isTwoPlayer && this.player2) {
                this.player2.anims.resume();
            }
            this.enemies.children.iterate((enemy) => {
                if (enemy && enemy.active) {
                    enemy.anims.resume();
                }
            });
        }
    }
    updatePlayerAnimations() {
        if (this.isGameOver) return;
        
        // Player 1 Animations
        if (this.isInvulnerable && this.player.anims.currentAnim && this.player.anims.currentAnim.key === 'hero_hurt' && !this.player.anims.currentFrame.isLast) {
            // Wait for hurt animation to finish
        } else {
            const isGrounded = this.player.body.blocked.down || this.player.body.touching.down;
            if (!isGrounded) {
                this.player.play('hero_jump', true);
            } else if (Math.abs(this.player.body.velocity.x) > 10) {
                this.player.play('hero_run', true);
            } else {
                this.player.play('hero_idle', true);
            }
            if (this.player.body.velocity.x < -10) {
                this.player.setFlipX(true);
            } else if (this.player.body.velocity.x > 10) {
                this.player.setFlipX(false);
            }
        }

        // Player 2 Animations
        if (this.isTwoPlayer && this.player2 && this.player2.active) {
            if (this.isInvulnerable2 && this.player2.anims.currentAnim && this.player2.anims.currentAnim.key === 'hero2_hurt' && !this.player2.anims.currentFrame.isLast) {
                // Wait for Player 2 hurt animation
            } else {
                const isGrounded2 = this.player2.body.blocked.down || this.player2.body.touching.down;
                if (!isGrounded2) {
                    this.player2.play('hero2_jump', true);
                } else if (Math.abs(this.player2.body.velocity.x) > 10) {
                    this.player2.play('hero2_run', true);
                } else {
                    this.player2.play('hero2_idle', true);
                }
                if (this.player2.body.velocity.x < -10) {
                    this.player2.setFlipX(true);
                } else if (this.player2.body.velocity.x > 10) {
                    this.player2.setFlipX(false);
                }
            }
        }
    }
    updateEnemies() {
        this.enemies.children.iterate((enemy) => {
            if (!enemy || !enemy.active) return;
            if (enemy.isKicked) {
                if (enemy.x < -100 || enemy.x > this.sys.game.config.width + 100 || enemy.y > this.sys.game.config.height + 100) {
                    enemy.destroy();
                }
                return;
            }
            // --- Wrap-around bottom floor corners to top corners with speed boost ---
            const isOnFloor = enemy.body.blocked.down || enemy.body.touching.down;
            if (isOnFloor && enemy.y > 300) {
                if (enemy.x < 45 || enemy.x > 595) {
                    const sp = Phaser.Utils.Array.GetRandom(this.levelConfig.spawnPoints);
                    enemy.x = sp.x;
                    enemy.y = sp.y;
                    enemy.body.setVelocityX(0);
                    enemy.body.setVelocityY(0);
                    // Boost Speed by 20% per tier, capping at 3 boosts (4 speed levels total!)
                    if (enemy.speedTier < 3) {
                        enemy.speedTier++;
                        enemy.baseSpeed = enemy.initialSpeed * Math.pow(1.20, enemy.speedTier);
                    }
                    // Clear stun statuses
                    enemy.isStunned = false;
                    enemy.setFlipY(false);
                    if (enemy.stunEvent) enemy.stunEvent.remove();
                    enemy.direction = enemy.x < 320 ? 1 : -1; // Walk inward
                    enemy.play(`enemy_${enemy.gender}_walk`, true);
                    return;
                }
            }
            if (!enemy.isStunned) {
                const isGrounded = enemy.body.blocked.down || enemy.body.touching.down;
                if (!isGrounded) {
                    enemy.body.setVelocityX(0);
                    enemy.play(`enemy_${enemy.gender}_idle`, true);
                } else {
                    enemy.body.setVelocityX(enemy.baseSpeed * enemy.direction);
                    enemy.play(`enemy_${enemy.gender}_walk`, true);
                    if (enemy.body.blocked.left) enemy.direction = 1;
                    if (enemy.body.blocked.right) enemy.direction = -1;
                }
            } else {
                enemy.body.setVelocityX(0);
                enemy.play(`enemy_${enemy.gender}_idle`, true);
            }
            if (enemy.direction === 1) {
                enemy.setFlipX(false);
            } else {
                enemy.setFlipX(true);
            }
            if (enemy.y > this.sys.game.config.height + 50) {
                const levelConfig = this.levelConfig;
                const sp = Phaser.Utils.Array.GetRandom(levelConfig.spawnPoints);
                enemy.x = sp.x;
                enemy.y = sp.y;
                enemy.body.setVelocityX(0);
                enemy.body.setVelocityY(0);
                enemy.direction = Math.random() > 0.5 ? 1 : -1;
            }
        });
    }
    handlePlayerMovement() {
        // Player 1 WASD Controls
        if (this.wasd.left.isDown) {
            this.player.body.setAccelerationX(-this.ACCELERATION_X);
        } else if (this.wasd.right.isDown) {
            this.player.body.setAccelerationX(this.ACCELERATION_X);
        } else {
            this.player.body.setAccelerationX(0);
        }
        const isGrounded1 = this.player.body.blocked.down || this.player.body.touching.down;
        if (this.wasd.up.isDown && isGrounded1) {
            this.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.isJumping = true;
        }
        if (this.wasd.up.isUp && this.isJumping && this.player.body.velocity.y < 0) {
            this.player.body.setVelocityY(this.player.body.velocity.y * 0.5);
            this.isJumping = false;
        }
        if (this.player.body.velocity.y >= 0) {
            this.isJumping = false;
        }

        // Player 2 Arrow Key Controls
        if (this.isTwoPlayer && this.player2 && this.player2.active) {
            if (this.cursors.left.isDown) {
                this.player2.body.setAccelerationX(-this.ACCELERATION_X);
            } else if (this.cursors.right.isDown) {
                this.player2.body.setAccelerationX(this.ACCELERATION_X);
            } else {
                this.player2.body.setAccelerationX(0);
            }
            const isGrounded2 = this.player2.body.blocked.down || this.player2.body.touching.down;
            if (this.cursors.up.isDown && isGrounded2) {
                this.player2.body.setVelocityY(this.JUMP_VELOCITY);
                this.isJumping2 = true;
            }
            if (this.cursors.up.isUp && this.isJumping2 && this.player2.body.velocity.y < 0) {
                this.player2.body.setVelocityY(this.player2.body.velocity.y * 0.5);
                this.isJumping2 = false;
            }
            if (this.player2.body.velocity.y >= 0) {
                this.isJumping2 = false;
            }
        }
    }
    checkBonkMechanic() {
        // Player 1 bonk check
        if (this.player.body.blocked.up || this.player.body.touching.up) {
            this.checkBonkForPlayer(this.player);
        }
        // Player 2 bonk check
        if (this.isTwoPlayer && this.player2 && (this.player2.body.blocked.up || this.player2.body.touching.up)) {
            this.checkBonkForPlayer(this.player2);
        }
    }
    checkBonkForPlayer(playerSprite) {
        this.platforms.children.iterate((platform) => {
            if (platform && platform.active && !platform.isBonked) {
                const isHorizontallyAligned = playerSprite.body.right > platform.body.left && playerSprite.body.left < platform.body.right;
                const isTouchingBottom = Math.abs(playerSprite.body.top - platform.body.bottom) <= 12;
                if (isHorizontallyAligned && isTouchingBottom) {
                    this.triggerBonk(platform, playerSprite.x, platform.body.bottom);
                }
            }
        });
        this.tntBlocks.children.iterate((tntBlock) => {
            if (tntBlock && tntBlock.active && !tntBlock.isBonked) {
                const isHorizontallyAligned = playerSprite.body.right > tntBlock.body.left && playerSprite.body.left < tntBlock.body.right;
                const isTouchingBottom = Math.abs(playerSprite.body.top - tntBlock.body.bottom) <= 12;
                if (isHorizontallyAligned && isTouchingBottom) {
                    this.triggerTNT(tntBlock);
                }
            }
        });
    }
    triggerTNT(tntBlock) {
        tntBlock.isBonked = true;
        tntBlock.hitsRemaining--;
        // Visual flash & shockwave for every hit
        const flash = this.add.rectangle(320, 180, 640, 360, 0xffffff);
        flash.alpha = 0.5;
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 250,
            onComplete: () => flash.destroy()
        });
        const shockwave = this.add.circle(tntBlock.x, tntBlock.y, 16, 0xffaa00);
        this.tweens.add({
            targets: shockwave,
            alpha: 0,
            scale: 20,
            duration: 500,
            onComplete: () => shockwave.destroy()
        });
        this.cameras.main.shake(120, 0.01);
        // Stun active patrolling enemies on every hit
        this.enemies.children.iterate((enemy) => {
            if (enemy && enemy.active && !enemy.isStunned && !enemy.isKicked) {
                this.stunEnemy(enemy);
            }
        });
        if (tntBlock.hitsRemaining > 0) {
            // Apply red damage color tint and shake it
            tntBlock.setTint(0xff8888);
            this.tweens.add({
                targets: tntBlock,
                y: tntBlock.y - 6,
                duration: 60,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    tntBlock.clearTint();
                    // Reset bonked state to allow subsequent hits
                    tntBlock.isBonked = false;
                }
            });
        } else {
            // Final massive explosion effect
            const finalShockwave = this.add.circle(tntBlock.x, tntBlock.y, 24, 0xff3300);
            this.tweens.add({
                targets: finalShockwave,
                alpha: 0,
                scale: 30,
                duration: 700,
                onComplete: () => finalShockwave.destroy()
            });
            this.cameras.main.shake(200, 0.02);
            tntBlock.destroy();
        }
    }
    triggerBonk(platform, impactX, impactY) {
        platform.isBonked = true;
        const originalY = platform.y;
        this.tweens.add({
            targets: platform,
            y: originalY - 4,
            duration: 60,
            yoyo: true,
            onComplete: () => {
                platform.y = originalY;
                platform.isBonked = false;
            }
        });
        const impactFlash = this.add.circle(impactX, impactY, 4, 0xffffff);
        this.tweens.add({
            targets: impactFlash,
            alpha: 0,
            scale: 4,
            duration: 250,
            onComplete: () => impactFlash.destroy()
        });
        this.cameras.main.shake(40, 0.003);
        if (this.enemies) {
            this.enemies.children.iterate((enemy) => {
                if (!enemy || !enemy.active || enemy.isStunned || enemy.isKicked) return;
                const platformTop = platform.body.top;
                const enemyBottom = enemy.body.bottom;
                if (Math.abs(enemyBottom - platformTop) <= 10) {
                    if (enemy.x >= platform.body.left && enemy.x <= platform.body.right) {
                        if (Math.abs(enemy.x - impactX) <= 32) {
                            this.stunEnemy(enemy);
                        }
                    }
                }
            });
        }
    }
    stunEnemy(enemy) {
        enemy.isStunned = true;
        enemy.body.setVelocityX(0);
        enemy.body.setVelocityY(-150);
        enemy.setFlipY(true);
        // Increase stun/knock duration to 15 seconds (15000ms)
        enemy.stunEvent = this.time.delayedCall(15000, () => {
            if (enemy && enemy.active && enemy.isStunned && !enemy.isKicked) {
                enemy.isStunned = false;
                enemy.setFlipY(false);
                enemy.baseSpeed *= 1.2;
            }
        });
    }
}
// --- Phaser Main Game Config ---
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    backgroundColor: '#1a1a2e',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 },
            debug: false
        }
    },
    scene: [MainMenuScene, LevelSelectScene, PlatformerScene]
};
const game = new Phaser.Game(config);