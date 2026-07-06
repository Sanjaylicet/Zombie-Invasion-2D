// --- Game Initialization ---
// Safe localStorage helper for sandboxed iframes
const safeStorage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("Storage read blocked:", e);
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn("Storage write blocked:", e);
        }
    }
};

// --- Skeuomorphic Theme Helpers ---
function generateSkeuomorphicTextures(scene) {
    const drawMetalPlate = (key, w, h) => {
        let g = scene.make.graphics({ x: 0, y: 0, add: false });
        // Base plate (metallic grey)
        g.fillStyle(0x282c34, 1.0);
        g.fillRect(0, 0, w, h);
        
        // Brushed metal lines
        g.lineStyle(1, 0x21252b, 0.4);
        for (let i = 2; i < h; i += 4) {
            g.lineBetween(2, i, w - 2, i);
        }
        
        // Outer 3D bevel borders
        g.lineStyle(3, 0xabb2bf, 0.8); // Top/Left highlight
        g.lineBetween(1, 1, w - 1, 1);
        g.lineBetween(1, 1, 1, h - 1);
        g.lineStyle(3, 0x181a1f, 0.9); // Bottom/Right shadow
        g.lineBetween(1, h - 1, w - 1, h - 1);
        g.lineBetween(w - 1, 1, w - 1, h - 1);
        
        // Recessed inner display screen
        g.fillStyle(0x15181e, 0.95);
        g.fillRect(16, 16, w - 32, h - 32);
        
        // Inner display screen bevel (recessed shadow)
        g.lineStyle(2, 0x090b0e, 0.9); // Top/Left shadow
        g.lineBetween(15, 15, w - 15, 15);
        g.lineBetween(15, 15, 15, h - 15);
        g.lineStyle(2, 0x3e4451, 0.6); // Bottom/Right highlight
        g.lineBetween(15, h - 15, w - 15, h - 15);
        g.lineBetween(w - 15, 15, w - 15, h - 15);
        
        // Metal rivets/screws in the 4 corners
        const drawScrew = (x, y) => {
            g.fillStyle(0x5c6370, 1.0);
            g.fillCircle(x, y, 6);
            g.lineStyle(1.5, 0x1e2227, 1.0);
            g.strokeCircle(x, y, 6);
            g.lineStyle(1.5, 0x181a1f, 1.0);
            g.lineBetween(x - 4, y - 1, x + 4, y + 1);
            g.fillStyle(0xffffff, 0.4);
            g.fillCircle(x - 2, y - 2, 1.5);
        };
        drawScrew(8, 8);
        drawScrew(w - 8, 8);
        drawScrew(8, h - 8);
        drawScrew(w - 8, h - 8);
        
        g.generateTexture(key, w, h);
        g.destroy();
    };

    const drawButton = (key, w, h, themeColor, isPressed, isHover) => {
        let g = scene.make.graphics({ x: 0, y: 0, add: false });
        
        let colors = {
            red:    { base: 0x5a0000, topStart: 0xff3b30, topEnd: 0x990000, border: 0xff8888, hoverStart: 0xff5c52, hoverEnd: 0xb31a1a, pressed: 0x770000 },
            green:  { base: 0x004d00, topStart: 0x4cd964, topEnd: 0x007f00, border: 0xa1f7b0, hoverStart: 0x73e285, hoverEnd: 0x009900, pressed: 0x006000 },
            blue:   { base: 0x002d5a, topStart: 0x007aff, topEnd: 0x004499, border: 0x88ccff, hoverStart: 0x3395ff, hoverEnd: 0x005cc2, pressed: 0x003377 },
            yellow: { base: 0x5a4800, topStart: 0xffcc00, topEnd: 0x997a00, border: 0xffe680, hoverStart: 0xffdd33, hoverEnd: 0xb38f00, pressed: 0x775f00 },
            grey:   { base: 0x1c1e22, topStart: 0x494e57, topEnd: 0x2c2f35, border: 0x6e7682, hoverStart: 0x5a606b, hoverEnd: 0x3a3e46, pressed: 0x1d2024 }
        }[themeColor] || { base: 0x222222, topStart: 0x777777, topEnd: 0x444444, border: 0x999999, hoverStart: 0x888888, hoverEnd: 0x555555, pressed: 0x333333 };

        const radius = 6;
        let startColor = isHover ? colors.hoverStart : colors.topStart;
        let endColor = isHover ? colors.hoverEnd : colors.topEnd;
        
        if (!isPressed) {
            // Extruded 3D base side
            g.fillStyle(colors.base, 1.0);
            g.fillRoundedRect(0, 4, w, h - 4, radius);
            g.fillStyle(colors.base & 0x7f7f7f, 1.0);
            g.fillRoundedRect(0, h - 2, w, 2, radius);
            
            // Raised surface (shifted up by 4px)
            g.fillStyle(endColor, 1.0);
            g.fillRoundedRect(0, 0, w, h - 4, radius);
            
            // 3D Bevel highlight
            g.lineStyle(1.5, colors.border, 0.7);
            g.strokeRoundedRect(0.75, 0.75, w - 1.5, h - 4 - 1.5, radius);
            
            // Top gloss overlay
            g.fillStyle(0xffffff, 0.22);
            g.fillRoundedRect(3, 3, w - 6, (h - 4) / 2.5, { tl: radius - 2, tr: radius - 2, bl: 2, br: 2 });
        } else {
            // Pressed surface (shifted down by 3px, minimal base)
            g.fillStyle(colors.base, 1.0);
            g.fillRoundedRect(0, h - 1, w, 1, radius);
            
            g.fillStyle(colors.pressed, 1.0);
            g.fillRoundedRect(0, 3, w, h - 4, radius);
            
            g.lineStyle(1.5, colors.border, 0.35);
            g.strokeRoundedRect(0.75, 3.75, w - 1.5, h - 4 - 1.5, radius);
            
            g.fillStyle(0xffffff, 0.1);
            g.fillRoundedRect(3, 6, w - 6, (h - 4) / 3, { tl: radius - 2, tr: radius - 2, bl: 1, br: 1 });
        }
        
        g.generateTexture(key, w, h);
        g.destroy();
    };

    // Generate Panels
    drawMetalPlate('panel_main_menu', 420, 270);
    drawMetalPlate('panel_level_select', 540, 280);
    drawMetalPlate('panel_pause', 220, 360);

    // Generate Large Buttons (200x48)
    drawButton('btn_play_normal', 200, 48, 'green', false, false);
    drawButton('btn_play_hover', 200, 48, 'green', false, true);
    drawButton('btn_play_pressed', 200, 48, 'green', true, false);

    drawButton('btn_select_normal', 200, 48, 'blue', false, false);
    drawButton('btn_select_hover', 200, 48, 'blue', false, true);
    drawButton('btn_select_pressed', 200, 48, 'blue', true, false);

    drawButton('btn_players_normal', 200, 48, 'yellow', false, false);
    drawButton('btn_players_hover', 200, 48, 'yellow', false, true);
    drawButton('btn_players_pressed', 200, 48, 'yellow', true, false);

    // Generate Medium Buttons (180x44)
    drawButton('btn_back_normal', 180, 44, 'red', false, false);
    drawButton('btn_back_hover', 180, 44, 'red', false, true);
    drawButton('btn_back_pressed', 180, 44, 'red', true, false);

    drawButton('btn_resume_normal', 180, 44, 'green', false, false);
    drawButton('btn_resume_hover', 180, 44, 'green', false, true);
    drawButton('btn_resume_pressed', 180, 44, 'green', true, false);

    drawButton('btn_lvlselect_normal', 180, 44, 'blue', false, false);
    drawButton('btn_lvlselect_hover', 180, 44, 'blue', false, true);
    drawButton('btn_lvlselect_pressed', 180, 44, 'blue', true, false);

    drawButton('btn_fullscreen_normal', 180, 44, 'yellow', false, false);
    drawButton('btn_fullscreen_hover', 180, 44, 'yellow', false, true);
    drawButton('btn_fullscreen_pressed', 180, 44, 'yellow', true, false);

    // Generate Small Buttons (110x28) for Fullscreen small
    drawButton('btn_fs_small_normal', 110, 28, 'yellow', false, false);
    drawButton('btn_fs_small_hover', 110, 28, 'yellow', false, true);
    drawButton('btn_fs_small_pressed', 110, 28, 'yellow', true, false);

    // Generate Level Cells (72x38)
    drawButton('level_btn_locked_normal', 72, 38, 'grey', true, false);
    
    drawButton('level_btn_unlocked_normal', 72, 38, 'green', false, false);
    drawButton('level_btn_unlocked_hover', 72, 38, 'green', false, true);
    drawButton('level_btn_unlocked_pressed', 72, 38, 'green', true, false);

    drawButton('level_btn_completed_normal', 72, 38, 'yellow', false, false);
    drawButton('level_btn_completed_hover', 72, 38, 'yellow', false, true);
    drawButton('level_btn_completed_pressed', 72, 38, 'yellow', true, false);

    // Tab buttons
    drawButton('tab_active', 110, 28, 'yellow', false, false);
    drawButton('tab_inactive', 110, 28, 'grey', true, false);
}

function makeTactileButton(scene, imageObj, textObj, normalKey, hoverKey, pressedKey, callback) {
    imageObj.setInteractive({ useHandCursor: true });
    const origImgY = imageObj.y;
    const origTxtY = textObj ? textObj.y : 0;
    
    imageObj.on('pointerover', () => {
        imageObj.setTexture(hoverKey);
    });
    
    imageObj.on('pointerout', () => {
        imageObj.setTexture(normalKey);
        imageObj.y = origImgY;
        if (textObj) textObj.y = origTxtY;
    });
    
    imageObj.on('pointerdown', () => {
        imageObj.setTexture(pressedKey);
        imageObj.y = origImgY + 3; // tactile shift down by 3px
        if (textObj) textObj.y = origTxtY + 3;
    });
    
    imageObj.on('pointerup', () => {
        imageObj.setTexture(hoverKey);
        imageObj.y = origImgY;
        if (textObj) textObj.y = origTxtY;
        if (callback) callback();
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
    const targetKills = Math.max(10, Math.min(5 + levelId * 2, 50));
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
        // --- Load Menu Visuals & Sounds ---
        this.load.image('menu_bg', 'assets/totalassets/png/Tiles/BGTile (1).png');
        
        // Dynamically generate textures
        generateSkeuomorphicTextures(this);

        // Preload sounds
        this.load.audio('buttonclick', 'sounds/buttonclick.mp3');
        this.load.audio('coin', 'sounds/coin.mp3');
        this.load.audio('hit', 'sounds/hit.wav');
        this.load.audio('jump', 'sounds/jump.wav');
        this.load.audio('levelcomplete', 'sounds/levelcomplete.mp3');
        this.load.audio('power_up', 'sounds/power_up.wav');
        this.load.audio('tntexplosion', 'sounds/tntexplosion.wav');
        this.load.audio('wasted', 'sounds/wasted.mp3');
        
        for (let i = 1; i <= 5; i++) {
            this.load.audio(`bgmusic${i}`, `sounds/bgmusic${i}.mp3`);
        }

        // --- Load Gameplay & Environment Assets ---
        this.load.image('bg_tile_1', 'assets/totalassets/png/Tiles/BGTile (1).png');
        this.load.image('bg_tile_3', 'assets/totalassets/png/Tiles/BGTile (3).png');
        this.load.image('bg_tile_4', 'assets/totalassets/png/Tiles/BGTile (4).png');
        this.load.image('bg_tile_7', 'assets/totalassets/png/Tiles/BGTile (7).png');
        this.load.image('tile_2', 'assets/totalassets/png/Tiles/Tile (2).png');
        this.load.image('tile_5', 'assets/totalassets/png/Tiles/Tile (5).png');
        this.load.image('tile_8', 'assets/totalassets/png/Tiles/Tile (8).png');
        this.load.image('tile_14', 'assets/totalassets/png/Tiles/Tile (14).png');
        this.load.image('barrel', 'assets/totalassets/png/Objects/Barrel (1).png');
        this.load.image('coin', 'assets/totalassets/png/Objects/coin.png');

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
        // Loading finished

        // Tiled menu background
        this.bg = this.add.tileSprite(320, 180, 640, 360, 'menu_bg');
        this.bg.setTileScale(1.40625, 1.40625);
        this.bg.setAlpha(0.35);

        // Frame Panel
        this.panel = this.add.image(320, 190, 'panel_main_menu');

        // Title Text
        this.titleText = this.add.text(320, 80, 'ZOMBIE INVASION', {
            fontSize: '36px',
            fill: '#ff2222',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(202);

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
        const playBtnBg = this.add.image(320, 160, 'btn_play_normal').setDisplaySize(200, 48);
        const playText = this.add.text(320, 158, 'PLAY GAME', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(202);

        makeTactileButton(this, playBtnBg, playText, 'btn_play_normal', 'btn_play_hover', 'btn_play_pressed', () => {
            console.log("Play Button Clicked");
            try {
                this.sound.play('buttonclick');
            } catch (e) {
                console.warn("Audio play blocked:", e);
            }
            try {
                const lvl = this.getHighestLevel();
                this.scene.start('PlatformerScene', { levelId: lvl });
            } catch (e) {
                console.error("Failed to start PlatformerScene:", e);
            }
        });

        // --- Level Select Button ---
        const selectBtnBg = this.add.image(320, 220, 'btn_select_normal').setDisplaySize(200, 48);
        const selectText = this.add.text(320, 218, 'LEVEL SELECT', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(202);

        makeTactileButton(this, selectBtnBg, selectText, 'btn_select_normal', 'btn_select_hover', 'btn_select_pressed', () => {
            try {
                this.sound.play('buttonclick');
            } catch (e) {
                console.warn("Audio play blocked:", e);
            }
            try {
                this.scene.start('LevelSelectScene');
            } catch (e) {
                console.error("Failed to start LevelSelectScene:", e);
            }
        });

        // --- Players Toggle Button ---
        this.isTwoPlayer = safeStorage.getItem('CrazyBonk_TwoPlayer') === 'true';

        const modeBtnBg = this.add.image(320, 280, 'btn_players_normal').setDisplaySize(200, 48);
        const getModeText = () => this.isTwoPlayer ? 'PLAYERS: 2 PLAYERS' : 'PLAYERS: 1 PLAYER';
        const modeText = this.add.text(320, 278, getModeText(), {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(202);

        makeTactileButton(this, modeBtnBg, modeText, 'btn_players_normal', 'btn_players_hover', 'btn_players_pressed', () => {
            try {
                this.sound.play('buttonclick');
            } catch (e) {
                console.warn("Audio play blocked:", e);
            }
            this.isTwoPlayer = !this.isTwoPlayer;
            safeStorage.setItem('CrazyBonk_TwoPlayer', this.isTwoPlayer ? 'true' : 'false');
            modeText.setText(getModeText());
        });

        // Fullscreen Toggle Button at top-right
        const fsBtnBg = this.add.image(575, 20, 'btn_fs_small_normal').setDisplaySize(110, 28).setDepth(201);
        const fsText = this.add.text(575, 19, '⛶ FULLSCREEN', {
            fontSize: '10px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(202);

        makeTactileButton(this, fsBtnBg, fsText, 'btn_fs_small_normal', 'btn_fs_small_hover', 'btn_fs_small_pressed', () => {
            try { this.sound.play('buttonclick'); } catch (e) {}
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
    }

    getHighestLevel() {
        return parseInt(safeStorage.getItem('CrazyBonk_HighestLevel')) || 1;
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
        this.bg.setTileScale(1.40625, 1.40625);
        this.bg.setAlpha(0.35);

        // Frame Panel (Skeuomorphic metal panel)
        this.panel = this.add.image(320, 190, 'panel_level_select');

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
        const backBtnBg = this.add.image(320, 310, 'btn_back_normal').setDisplaySize(180, 44);
        const backText = this.add.text(320, 308, '◄ MENU', {
            fontSize: '15px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(202);

        makeTactileButton(this, backBtnBg, backText, 'btn_back_normal', 'btn_back_hover', 'btn_back_pressed', () => {
            this.sound.play('buttonclick');
            this.scene.start('MainMenuScene');
        });

        this.currentTab = 0;
        this.createTabs();
        this.createLevelButtons();

        // Fullscreen Toggle Button at top-right
        const fsBtnBg = this.add.image(575, 20, 'btn_fs_small_normal').setDisplaySize(110, 28).setDepth(201);
        const fsText = this.add.text(575, 19, '⛶ FULLSCREEN', {
            fontSize: '10px',
            fill: '#ffffff',
            fontFamily: 'Courier',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(202);

        makeTactileButton(this, fsBtnBg, fsText, 'btn_fs_small_normal', 'btn_fs_small_hover', 'btn_fs_small_pressed', () => {
            try { this.sound.play('buttonclick'); } catch (e) {}
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
    }
    createTabs() {
        const tabs = ['VALLEY (1-12)', 'STEEL (13-25)', 'VAULT (26-38)', 'CASTLE (39-50)'];
        this.tabButtons = [];
        this.tabBgs = [];

        tabs.forEach((tab, index) => {
            const x = 140 + index * 120;
            const y = 72;
            const isActive = index === this.currentTab;
            
            const tabBg = this.add.image(x, y, isActive ? 'tab_active' : 'tab_inactive').setDisplaySize(110, 28);
            tabBg.setInteractive({ useHandCursor: true });
            
            const btn = this.add.text(x, y - 1, tab, {
                fontSize: '10px',
                fill: isActive ? '#ffffff' : '#888888',
                fontFamily: 'Courier',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            tabBg.on('pointerdown', () => {
                this.sound.play('buttonclick');
                this.currentTab = index;
                this.refreshUI();
            });

            this.tabButtons.push(btn);
            this.tabBgs.push(tabBg);
        });
    }
    createLevelButtons() {
        this.buttonsGroup = this.add.group();

        let highestLevel = parseInt(safeStorage.getItem('CrazyBonk_HighestLevel')) || 1;
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
            let normalKey = 'level_btn_locked_normal';
            let hoverKey = '';
            let pressedKey = '';
            let label = l.toString() + ' 🔒';
            let txtColor = '#888888';
            let textY = y + 1; // depressed grey button offset

            if (isUnlocked) {
                txtColor = '#ffffff';
                label = l.toString() + (isCompleted ? ' ★' : '');
                textY = y - 2; // raised button offset
                if (isCompleted) {
                    normalKey = 'level_btn_completed_normal';
                    hoverKey = 'level_btn_completed_hover';
                    pressedKey = 'level_btn_completed_pressed';
                } else {
                    normalKey = 'level_btn_unlocked_normal';
                    hoverKey = 'level_btn_unlocked_hover';
                    pressedKey = 'level_btn_unlocked_pressed';
                }
            }

            const btnBg = this.add.image(x, y, normalKey).setDisplaySize(72, 38).setDepth(201);
            this.buttonsGroup.add(btnBg);

            const btn = this.add.text(x, textY, label, {
                fontSize: '14px',
                fill: txtColor,
                fontFamily: 'Courier',
                fontStyle: 'bold',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(202);
            this.buttonsGroup.add(btn);

            if (isUnlocked) {
                makeTactileButton(this, btnBg, btn, normalKey, hoverKey, pressedKey, () => {
                    this.sound.play('buttonclick');
                    this.scene.start('PlatformerScene', { levelId: l });
                });
            }

            index++;
        }
    }
    refreshUI() {
        this.tabButtons.forEach((btn, index) => {
            const isActive = index === this.currentTab;
            this.tabBgs[index].setTexture(isActive ? 'tab_active' : 'tab_inactive');
            btn.setStyle({ fill: isActive ? '#ffffff' : '#888888' });
        });
        this.buttonsGroup.clear(true, true);
        this.createLevelButtons();
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

        // Initialize coin dynamic group
        this.coins = this.physics.add.group();

        this.createLevel();
        this.createPlayer();
        this.createEnemies();
        this.setupCollisions();
        this.setupInput();

        // Select and play a random bgmusic track
        this.bgMusicKey = 'bgmusic' + Phaser.Math.Between(1, 5);
        this.bgMusic = this.sound.add(this.bgMusicKey, { loop: true, volume: 0.25 });
        this.bgMusic.play();

        // Handle scene shutdown to clean up looping music
        this.events.on('shutdown', () => {
            if (this.bgMusic) {
                this.bgMusic.stop();
            }
        });

        // Add 'F' keyboard shortcut listener to toggle fullscreen
        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
    }
    createLevel() {
        const levelConfig = this.levelConfig;
        const highestLvl = this.getHighestLevel();
        console.log(`Game Log: Launching Level ${this.currentLevelId} (Max Run: ${highestLvl})`);
        this.saveLevelRecord(this.currentLevelId);
        // Tiled Background
        this.bg = this.add.tileSprite(320, 180, 640, 360, levelConfig.bgKey);
        this.bg.setTileScale(1.40625, 1.40625);
        this.bg.setDepth(-10);
        // Tiled ground floor
        this.floor = this.add.tileSprite(320, 340, 640, 40, levelConfig.tileKey);
        this.floor.setTileScale(0.15625, 0.15625);
        this.physics.add.existing(this.floor, true);
        this.floor.body.setSize(640, 40);
        this.platforms = this.physics.add.staticGroup();
        levelConfig.platforms.forEach((p, index) => {
            const plat = this.add.tileSprite(p.x, p.y, p.w, p.h, levelConfig.tileKey);
            plat.setTileScale(0.0625, 0.0625);
            this.platforms.add(plat);
            plat.body.setSize(p.w, p.h);
            plat.isBonked = false;

            // Designate special golden coin-dropping platforms deterministically
            plat.isSpecial = ((index + levelConfig.levelId) % 2 === 0);
            plat.hasCoin = plat.isSpecial;
            if (plat.isSpecial) {
                plat.setTint(0xffcc00); // Premium Golden Yellow
            }
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
        this.isTwoPlayer = safeStorage.getItem('CrazyBonk_TwoPlayer') === 'true';

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

        // Setup coin colliders and overlaps - explicitly passing this.player/this.player2 to prevent callback scope issues
        this.physics.add.collider(this.coins, this.floor);
        this.physics.add.collider(this.coins, this.platforms);
        this.physics.add.overlap(this.player, this.coins, (dummyP, coin) => {
            this.collectCoin(this.player, coin, false);
        });
        if (this.isTwoPlayer && this.player2) {
            this.physics.add.overlap(this.player2, this.coins, (dummyP2, coin) => {
                this.collectCoin(this.player2, coin, true);
            });
        }

        this.physics.add.overlap(this.player, this.enemies, (dummyP, enemy) => {
            if (this.isGameOver || this.isLevelComplete) return;
            this.handleEnemyOverlap(this.player, enemy, false);
        });

        if (this.isTwoPlayer && this.player2) {
            this.physics.add.overlap(this.player2, this.enemies, (dummyP2, enemy) => {
                if (this.isGameOver || this.isLevelComplete) return;
                this.handleEnemyOverlap(this.player2, enemy, true);
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
        if (invulnFlag || playerSprite.isCoinImmortal || this.isGameOver || this.isLevelComplete) return;
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
    collectCoin(playerSprite, coin, isPlayer2) {
        if (!coin.active || coin.isCollectible === false) return;

        // Prevent collecting the coin from underneath the platform
        if (playerSprite.body.bottom > coin.y + 20) {
            return;
        }

        coin.destroy();
        this.sound.play('coin', { volume: 0.6 });

        // 4 randomized coin behaviors
        const effect = Phaser.Math.Between(1, 4);

        if (effect === 1) {
            // Option 1: Increase player health by 1
            this.lives = Math.min(this.lives + 1, 5);
            this.updateLivesText();
            this.createFloatingText(playerSprite.x, playerSprite.y - 30, '+1 LIFE!');
        } else if (effect === 2) {
            // Option 2: Increase the score
            this.score += 500;
            this.scoreText.setText('SCORE: ' + this.score);
            this.createFloatingText(playerSprite.x, playerSprite.y - 30, '+500 SCORE!');
        } else if (effect === 3) {
            // Option 3: Speed boost
            this.sound.play('power_up', { volume: 0.6 });
            playerSprite.speedBoosted = true;
            playerSprite.setTint(0x55ff55); // Highlight green for speed
            this.createFloatingText(playerSprite.x, playerSprite.y - 30, 'SPEED BOOST!');

            if (playerSprite.speedTimer) playerSprite.speedTimer.remove();
            playerSprite.speedTimer = this.time.delayedCall(8000, () => {
                playerSprite.speedBoosted = false;
                // Only clear tint if not currently coin-immortal
                if (!playerSprite.isCoinImmortal) {
                    playerSprite.clearTint();
                } else {
                    playerSprite.setTint(0xffd700); // Revert to gold tint
                }
                playerSprite.body.setMaxVelocity(this.MAX_SPEED_X, this.MAX_SPEED_Y);
            });
        } else if (effect === 4) {
            // Option 4: Immortality
            this.sound.play('power_up', { volume: 0.6 });
            playerSprite.isCoinImmortal = true;
            playerSprite.setTint(0xffd700); // Highlight gold
            this.createFloatingText(playerSprite.x, playerSprite.y - 30, 'IMMORTALITY!');

            // Pulse flashing alpha animation
            if (playerSprite.immortalTween) playerSprite.immortalTween.remove();
            playerSprite.immortalTween = this.tweens.add({
                targets: playerSprite,
                alpha: 0.4,
                duration: 150,
                yoyo: true,
                repeat: -1
            });

            if (playerSprite.immortalTimer) playerSprite.immortalTimer.remove();
            playerSprite.immortalTimer = this.time.delayedCall(8000, () => {
                playerSprite.isCoinImmortal = false;
                if (playerSprite.immortalTween) {
                    playerSprite.immortalTween.remove();
                    playerSprite.alpha = 1.0;
                }
                // Revert to green tint if still speed boosted, otherwise clear tint
                if (playerSprite.speedBoosted) {
                    playerSprite.setTint(0x55ff55);
                } else {
                    playerSprite.clearTint();
                }
            });
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
        // Unlock next level in localStorage
        this.saveLevelRecord(this.currentLevelId + 1);

        // Stop music and play victory sound
        if (this.bgMusic) this.bgMusic.stop();
        this.sound.play('levelcomplete', { volume: 0.7 });

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
                    this.sound.play('buttonclick');
                    const nextLvl = this.currentLevelId + 1;
                    this.scene.start('PlatformerScene', { levelId: nextLvl });
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
                this.sound.play('buttonclick');
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
        const currentHighest = parseInt(safeStorage.getItem('CrazyBonk_HighestLevel')) || 1;
        if (levelIndex > currentHighest) {
            safeStorage.setItem('CrazyBonk_HighestLevel', levelIndex.toString());
        }
    }
    getHighestLevel() {
        return parseInt(safeStorage.getItem('CrazyBonk_HighestLevel')) || 1;
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

        // Stop music and play game over wasted track
        if (this.bgMusic) this.bgMusic.stop();
        this.sound.play('wasted', { volume: 0.7 });

        this.gameOverText = this.add.text(320, 160, 'WASTED', { fontSize: '56px', fill: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5).setDepth(150);
        this.retryBtn = this.add.text(320, 230, '► RETRY', { fontSize: '24px', fill: '#ffff00', fontStyle: 'bold', backgroundColor: '#00000088' })
            .setOrigin(0.5)
            .setPadding(8)
            .setDepth(150)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.sound.play('buttonclick');
                this.scene.start('PlatformerScene', { levelId: this.currentLevelId });
            });
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

            // Pause all animations and bg music
            this.player.anims.pause();
            if (this.isTwoPlayer && this.player2) {
                this.player2.anims.pause();
            }
            this.enemies.children.iterate((enemy) => {
                if (enemy && enemy.active) {
                    enemy.anims.pause();
                }
            });
            if (this.bgMusic) this.bgMusic.pause();

            // Create Pause UI (dim overlay and metal console plate)
            this.pauseOverlay = this.add.rectangle(320, 180, 640, 360, 0x000000, 0.6).setDepth(200);
            this.pausePanel = this.add.image(320, 180, 'panel_pause').setDepth(200);

            this.pauseTitle = this.add.text(320, 48, 'PAUSED', {
                fontSize: '22px',
                fill: '#ffff00',
                fontFamily: 'Courier',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(201);

            // --- Resume Button ---
            this.resumeBtn = this.add.image(320, 110, 'btn_resume_normal').setDisplaySize(180, 44).setDepth(201);
            this.resumeText = this.add.text(320, 108, 'RESUME', {
                fontSize: '15px', fill: '#ffffff', fontFamily: 'Courier', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(202);

            makeTactileButton(this, this.resumeBtn, this.resumeText, 'btn_resume_normal', 'btn_resume_hover', 'btn_resume_pressed', () => {
                this.sound.play('buttonclick');
                this.togglePause();
            });

            // --- Level Select Button ---
            this.lvlSelectBtn = this.add.image(320, 170, 'btn_lvlselect_normal').setDisplaySize(180, 44).setDepth(201);
            this.lvlSelectText = this.add.text(320, 168, 'LEVEL SELECT', {
                fontSize: '15px', fill: '#ffffff', fontFamily: 'Courier', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(202);

            makeTactileButton(this, this.lvlSelectBtn, this.lvlSelectText, 'btn_lvlselect_normal', 'btn_lvlselect_hover', 'btn_lvlselect_pressed', () => {
                this.sound.play('buttonclick');
                this.scene.start('LevelSelectScene');
            });

            // --- Main Menu Button ---
            this.mainMenuBtn = this.add.image(320, 230, 'btn_back_normal').setDisplaySize(180, 44).setDepth(201);
            this.mainMenuText = this.add.text(320, 228, 'MAIN MENU', {
                fontSize: '15px', fill: '#ffffff', fontFamily: 'Courier', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(202);

            makeTactileButton(this, this.mainMenuBtn, this.mainMenuText, 'btn_back_normal', 'btn_back_hover', 'btn_back_pressed', () => {
                this.sound.play('buttonclick');
                this.scene.start('MainMenuScene');
            });

            // --- Fullscreen Button ---
            this.fsBtn = this.add.image(320, 290, 'btn_fullscreen_normal').setDisplaySize(180, 44).setDepth(201);
            this.fsText = this.add.text(320, 288, '⛶ FULLSCREEN', {
                fontSize: '14px', fill: '#ffffff', fontFamily: 'Courier', fontStyle: 'bold', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5).setDepth(202);

            makeTactileButton(this, this.fsBtn, this.fsText, 'btn_fullscreen_normal', 'btn_fullscreen_hover', 'btn_fullscreen_pressed', () => {
                try { this.sound.play('buttonclick'); } catch (e) {}
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                } else {
                    this.scale.startFullscreen();
                }
            });
        } else {
            this.isPaused = false;

            // Clean up UI
            this.pauseOverlay.destroy();
            this.pausePanel.destroy();
            this.pauseTitle.destroy();
            this.resumeBtn.destroy();
            this.resumeText.destroy();
            this.lvlSelectBtn.destroy();
            this.lvlSelectText.destroy();
            this.mainMenuBtn.destroy();
            this.mainMenuText.destroy();
            if (this.fsBtn) this.fsBtn.destroy();
            if (this.fsText) this.fsText.destroy();

            // Resume physics, spawning, and bg music
            this.physics.resume();
            this.tweens.resumeAll();
            if (this.spawnEvent) this.spawnEvent.paused = false;
            if (this.bgMusic) this.bgMusic.resume();

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
        // Player 1 Speed adjustments
        const acc1 = this.player.speedBoosted ? 1800 : this.ACCELERATION_X;
        const maxSpeed1 = this.player.speedBoosted ? 450 : this.MAX_SPEED_X;
        this.player.body.setMaxVelocity(maxSpeed1, this.MAX_SPEED_Y);

        // Player 1 WASD Controls
        if (this.wasd.left.isDown) {
            this.player.body.setAccelerationX(-acc1);
        } else if (this.wasd.right.isDown) {
            this.player.body.setAccelerationX(acc1);
        } else {
            this.player.body.setAccelerationX(0);
        }
        const isGrounded1 = this.player.body.blocked.down || this.player.body.touching.down;
        if (this.wasd.up.isDown && isGrounded1) {
            this.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.isJumping = true;
            this.sound.play('jump', { volume: 0.5 });
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
            const acc2 = this.player2.speedBoosted ? 1800 : this.ACCELERATION_X;
            const maxSpeed2 = this.player2.speedBoosted ? 450 : this.MAX_SPEED_X;
            this.player2.body.setMaxVelocity(maxSpeed2, this.MAX_SPEED_Y);

            if (this.cursors.left.isDown) {
                this.player2.body.setAccelerationX(-acc2);
            } else if (this.cursors.right.isDown) {
                this.player2.body.setAccelerationX(acc2);
            } else {
                this.player2.body.setAccelerationX(0);
            }
            const isGrounded2 = this.player2.body.blocked.down || this.player2.body.touching.down;
            if (this.cursors.up.isDown && isGrounded2) {
                this.player2.body.setVelocityY(this.JUMP_VELOCITY);
                this.isJumping2 = true;
                this.sound.play('jump', { volume: 0.5 });
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
        this.sound.play('tntexplosion', { volume: 0.7 });
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
        this.sound.play('hit', { volume: 0.6 });
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

        // Spawn coin if platform is special and contains a coin
        if (platform.isSpecial && platform.hasCoin) {
            platform.hasCoin = false;
            platform.setTint(0x888888); // Spent platforms color fade

            const coin = this.coins.create(platform.x, platform.body.top - 20, 'coin');
            coin.setScale(0.005);
            coin.body.setCollideWorldBounds(true);
            coin.body.setBounce(0.3);
            coin.body.setGravityY(1000);
            coin.body.setVelocityY(-400); // Pop upward
            coin.body.setVelocityX(Phaser.Math.Between(-80, 80)); // Pop dynamic angle
            coin.isCollectible = false;

            // Make the coin collectible after 300ms, ensuring it arches upward first
            this.time.delayedCall(300, () => {
                if (coin && coin.active) {
                    coin.isCollectible = true;
                }
            });

            // Continuous spin
            this.tweens.add({
                targets: coin,
                angle: 360,
                duration: 1000,
                repeat: -1
            });
        }

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
window.game = game;