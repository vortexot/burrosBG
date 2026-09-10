const canvas = document.getElementById("arena");
const ctx = canvas.getContext("2d");

const healthBar = document.getElementById("healthBar");
const scoreText = document.getElementById("score");
const waveText = document.getElementById("wave");

const menu = document.getElementById("menu");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const leftMode = document.getElementById("leftMode");
const rightMode = document.getElementById("rightMode");
const restartBtn = document.getElementById("restartBtn");

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");
const attackButton = document.getElementById("attack");
const quitBtn = document.getElementById("quitBtn");

const message = document.getElementById("message");


// ======================================================
// TOUCH
// ======================================================

document.body.style.touchAction = "none";
document.documentElement.style.touchAction = "none";
canvas.style.touchAction = "none";
joystick.style.touchAction = "none";
attackButton.style.touchAction = "none";


// ======================================================
// IMAGENS
// ======================================================

const lulaImage = new Image();
lulaImage.src = "./assets/lula.jpg";

const bolsonaroImage = new Image();
bolsonaroImage.src = "./assets/bolsonaro.jpg";


// ======================================================
// ARMAS
// ======================================================

const commonWeaponImage = new Image();
commonWeaponImage.src = "./assets/weapons/comum.png";

const rareWeaponImage = new Image();
rareWeaponImage.src = "./assets/weapons/rare.png";

const epicWeaponImage = new Image();
epicWeaponImage.src = "./assets/weapons/epic.png";

const legendaryWeaponImage = new Image();
legendaryWeaponImage.src = "./assets/weapons/legendary.png";

const mythicWeaponImage = new Image();
mythicWeaponImage.src = "./assets/weapons/mythic.png";

const secretWeaponImage = new Image();
secretWeaponImage.src = "./assets/weapons/secret.png";


// ======================================================
// MODO
// ======================================================

let gameMode = null;


// ======================================================
// PLAYER
// ======================================================

const player = {
    x: 0,
    y: 0,
    radius: 30,
    speed: 3.8,
    health: 100,
    maxHealth: 100,
    velocityX: 0,
    velocityY: 0
};


// ======================================================
// VARIÁVEIS
// ======================================================

let score = 0;

let totalPointsEarned = 0;

let wave = 1;

let enemies = [];
let bullets = [];
let enemyBullets = [];
let particles = [];
let weapons = [];

let spawnTimer = 0;
let attackCooldown = 0;
let lastTime = 0;

let gameRunning = false;

let enemiesSpawnedThisWave = 0;
let enemiesKilledThisWave = 0;

let attackHeld = false;


// ======================================================
// LOJA
// ======================================================

let shopOpen = false;


// ======================================================
// UPGRADES
// ======================================================

let upgrades = {
    damage: 0,
    speed: 0,
    fireRate: 0,
    maxHealth: 0
};


// ======================================================
// ARMA ATUAL
// ======================================================

let currentWeapon = {
    name: "NORMAL",
    rarity: "NORMAL",
    damage: 1,
    cooldown: 250,
    bulletColor: "#00e5ff",
    secret: false,
    image: null
};


// ======================================================
// RARIDADES
// ======================================================

const rarityTypes = [

    {
        name: "COMUM",
        chance: 35,
        damage: 0.7,
        cooldown: 400,
        life: 20000,
        color: "#bdbdbd",
        image: commonWeaponImage
    },

    {
        name: "RARO",
        chance: 30,
        damage: 1.5,
        cooldown: 170,
        life: 15000,
        color: "#2196f3",
        image: rareWeaponImage
    },

    {
        name: "ÉPICO",
        chance: 20,
        damage: 2.5,
        cooldown: 120,
        life: 11000,
        color: "#9c27b0",
        image: epicWeaponImage
    },

    {
        name: "LENDÁRIO",
        chance: 10,
        damage: 4,
        cooldown: 75,
        life: 7000,
        color: "#ff9800",
        image: legendaryWeaponImage
    },

    {
        name: "MÍTICO",
        chance: 5,
        damage: 10,
        cooldown: 45,
        life: 4000,
        color: "#ff1744",
        image: mythicWeaponImage
    }

];


// ======================================================
// RESIZE
// ======================================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!gameRunning) {

        player.x = canvas.width / 2;
        player.y = canvas.height / 2;

    }

}

window.addEventListener("resize", resizeCanvas);


// ======================================================
// JOYSTICK
// ======================================================

let joystickActive = false;
let joystickX = 0;
let joystickY = 0;


function updateJoystick(clientX, clientY) {

    const rect = joystick.getBoundingClientRect();

    const centerX =
        rect.left + rect.width / 2;

    const centerY =
        rect.top + rect.height / 2;

    let dx =
        clientX - centerX;

    let dy =
        clientY - centerY;

    const maxDistance =
        Math.max(1, rect.width / 2 - 29);

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    if (distance > maxDistance) {

        dx =
            (dx / distance) *
            maxDistance;

        dy =
            (dy / distance) *
            maxDistance;

    }

    joystickX =
        dx / maxDistance;

    joystickY =
        dy / maxDistance;

    stick.style.transform =
        `translate(${dx}px, ${dy}px)`;

}


function resetJoystick() {

    joystickActive = false;

    joystickX = 0;
    joystickY = 0;

    stick.style.transform =
        "translate(0px, 0px)";

}


joystick.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();

        joystickActive = true;

        try {

            joystick.setPointerCapture(
                event.pointerId
            );

        } catch (error) {}

        updateJoystick(
            event.clientX,
            event.clientY
        );

    }
);


joystick.addEventListener(
    "pointermove",
    function(event) {

        if (!joystickActive) return;

        event.preventDefault();

        updateJoystick(
            event.clientX,
            event.clientY
        );

    }
);


joystick.addEventListener(
    "pointerup",
    function(event) {

        event.preventDefault();

        resetJoystick();

    }
);


joystick.addEventListener(
    "pointercancel",
    resetJoystick
);


joystick.addEventListener(
    "lostpointercapture",
    resetJoystick
);


// ======================================================
// WASD
// ======================================================

const keyboard = {
    w: false,
    a: false,
    s: false,
    d: false
};


window.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();

        if (
            key === "w" ||
            key === "a" ||
            key === "s" ||
            key === "d"
        ) {

            keyboard[key] = true;

            event.preventDefault();

        }

        if (event.code === "Space") {

            event.preventDefault();

            shoot();

        }

    }
);


window.addEventListener(
    "keyup",
    function(event) {

        const key =
            event.key.toLowerCase();

        if (
            key === "w" ||
            key === "a" ||
            key === "s" ||
            key === "d"
        ) {

            keyboard[key] = false;

            event.preventDefault();

        }

    }
);


// ======================================================
// MODOS
// ======================================================

function selectMode(mode) {

    gameMode = mode;

    startGame();

}


leftMode.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();

        selectMode("left");

    }
);


rightMode.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();

        selectMode("right");

    }
);


// ======================================================
// START GAME
// ======================================================

function startGame() {

    menu.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    score = 0;

    totalPointsEarned = 0;

    wave = 1;

    enemies = [];
    bullets = [];
    enemyBullets = [];
    particles = [];
    weapons = [];

    spawnTimer = 0;

    attackCooldown = 0;

    enemiesSpawnedThisWave = 0;
    enemiesKilledThisWave = 0;

    shopOpen = false;


    upgrades = {

        damage: 0,
        speed: 0,
        fireRate: 0,
        maxHealth: 0

    };


    currentWeapon = {

        name: "NORMAL",

        rarity: "NORMAL",

        damage: 1,

        cooldown: 250,

        bulletColor: "#00e5ff",

        secret: false,

        image: null

    };


    player.health = 100;

    player.maxHealth = 100;

    player.speed = 3.8;


    player.x =
        canvas.width / 2;

    player.y =
        canvas.height / 2;


    player.velocityX = 0;
    player.velocityY = 0;


    joystickX = 0;
    joystickY = 0;


    keyboard.w = false;
    keyboard.a = false;
    keyboard.s = false;
    keyboard.d = false;


    attackHeld = false;

    resetJoystick();


    gameRunning = true;


    updateHUD();

    showModeMessage();

}


// ======================================================
// SAIR
// ======================================================

function quitGame() {

    gameRunning = false;

    attackHeld = false;

    shopOpen = false;

    enemies = [];
    bullets = [];
    enemyBullets = [];
    particles = [];
    weapons = [];

    score = 0;
    wave = 1;

    totalPointsEarned = 0;

    spawnTimer = 0;
    attackCooldown = 0;

    enemiesSpawnedThisWave = 0;
    enemiesKilledThisWave = 0;

    player.health = 100;

    player.maxHealth = 100;

    player.speed = 3.8;

    player.velocityX = 0;
    player.velocityY = 0;

    joystickX = 0;
    joystickY = 0;

    keyboard.w = false;
    keyboard.a = false;
    keyboard.s = false;
    keyboard.d = false;

    resetJoystick();


    currentWeapon = {

        name: "NORMAL",

        rarity: "NORMAL",

        damage: 1,

        cooldown: 250,

        bulletColor: "#00e5ff",

        secret: false,

        image: null

    };


    closeShop();

    gameOverScreen.classList.add("hidden");

    menu.classList.remove("hidden");

    updateHUD();

}


if (quitBtn) {

    quitBtn.addEventListener(
        "pointerdown",
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            quitGame();

        }
    );

}


// ======================================================
// MENSAGENS
// ======================================================

function showModeMessage() {

    if (gameMode === "left") {

        showMessage("MODO ESQUERDA");

    } else {

        showMessage("MODO DIREITA");

    }

}


function showMessage(text) {

    if (!message) return;

    message.textContent = text;

    message.style.opacity = "1";

    setTimeout(
        function() {

            message.style.opacity = "0";

        },
        1800
    );

}


// ======================================================
// FLASH DE DANO
// ======================================================

let damageFlashEl = null;

let lastPlayerHealth = player.health;


function ensureDamageFlashEl() {

    if (damageFlashEl) return damageFlashEl;

    damageFlashEl = document.createElement("div");

    damageFlashEl.id = "damageFlash";

    document.body.appendChild(damageFlashEl);

    return damageFlashEl;

}


function triggerDamageFlash(intensity) {

    const el = ensureDamageFlashEl();

    const clamped =
        Math.max(0.25, Math.min(1, intensity));

    el.style.opacity = clamped;

    el.classList.add("active");

    clearTimeout(el._flashTimeout);

    el._flashTimeout = setTimeout(
        function() {

            el.classList.remove("active");

        },
        160
    );

}


function triggerLowHealthPulse(active) {

    const el = ensureDamageFlashEl();

    if (active) {

        el.classList.add("low-health");

    } else {

        el.classList.remove("low-health");

    }

}


// ======================================================
// HUD
// ======================================================

function updateHUD() {

    scoreText.textContent = score;

    waveText.textContent = wave;


    const healthPercent =
        Math.max(
            0,
            Math.min(
                100,
                player.health /
                player.maxHealth *
                100
            )
        );


    healthBar.style.width =
        `${healthPercent}%`;


    // ==================================================
    // ESTADO CRÍTICO DE VIDA
    // ==================================================

    const healthWrapper =
        healthBar.parentElement;


    if (healthWrapper) {

        if (healthPercent <= 30) {

            healthWrapper.classList.add(
                "critical"
            );

        } else {

            healthWrapper.classList.remove(
                "critical"
            );

        }

    }


    triggerLowHealthPulse(
        healthPercent > 0 &&
        healthPercent <= 20
    );


    // ==================================================
    // FLASH AO TOMAR DANO
    // ==================================================

    if (
        gameRunning &&
        player.health < lastPlayerHealth
    ) {

        const lost =
            lastPlayerHealth -
            player.health;

        triggerDamageFlash(
            0.18 +
            Math.min(0.5, lost / 40)
        );

    }


    lastPlayerHealth = player.health;


    const healthPercentText =
        document.getElementById(
            "healthPercent"
        );


    if (healthPercentText) {

        healthPercentText.textContent =
            `${Math.ceil(healthPercent)}%`;

    }


    const weaponText =
        document.getElementById("weapon");


    if (weaponText) {

        weaponText.textContent =
            currentWeapon.name;

        weaponText.style.color =
            currentWeapon.bulletColor;

    }


    const weaponRarity =
        document.getElementById(
            "weaponRarity"
        );


    if (weaponRarity) {

        weaponRarity.textContent =
            currentWeapon.rarity;

        weaponRarity.style.color =
            currentWeapon.bulletColor;

    }


    const weaponImage =
        document.getElementById(
            "weaponImage"
        );


    if (weaponImage) {

        if (
            currentWeapon.image &&
            currentWeapon.image.complete &&
            currentWeapon.image.naturalWidth > 0
        ) {

            weaponImage.src =
                currentWeapon.image.src;

            weaponImage.style.display =
                "block";

        } else {

            weaponImage.removeAttribute(
                "src"
            );

            weaponImage.style.display =
                "none";

        }

    }

}


// ======================================================
// GANHAR PONTOS
// ======================================================

function addPoints(amount) {

    score += amount;

    totalPointsEarned += amount;

}


// ======================================================
// RARIDADE
// ======================================================

function rollRarity() {

    const totalChance =
        rarityTypes.reduce(
            function(total, rarity) {

                return total +
                    rarity.chance;

            },
            0
        );


    let random =
        Math.random() *
        totalChance;


    for (const rarity of rarityTypes) {

        random -= rarity.chance;

        if (random <= 0) {

            return rarity;

        }

    }


    return rarityTypes[0];

}


// ======================================================
// SPAWN WEAPON
// ======================================================

function spawnWeapon() {

    const rarity =
        rollRarity();


    const weapon = {

        x:
            100 +
            Math.random() *
            Math.max(
                1,
                canvas.width - 200
            ),

        y:
            100 +
            Math.random() *
            Math.max(
                1,
                canvas.height - 200
            ),

        radius: 32,

        name: rarity.name,

        rarity: rarity.name,

        damage: rarity.damage,

        cooldown: rarity.cooldown,

        life: rarity.life,

        color: rarity.color,

        secret: false,

        image: rarity.image

    };


    weapons.push(weapon);


    showMessage(
        `🎰 ARMA ${rarity.name}!`
    );

}


// ======================================================
// ARMA SECRETA
// ======================================================

function spawnSecretWeapon() {

    const weapon = {

        x:
            100 +
            Math.random() *
            Math.max(
                1,
                canvas.width - 200
            ),

        y:
            100 +
            Math.random() *
            Math.max(
                1,
                canvas.height - 200
            ),

        radius: 34,

        name: "???",

        rarity: "SECRETA",

        damage: 3,

        cooldown: 1200,

        life: 10000,

        color: "#ffffff",

        secret: true,

        image: secretWeaponImage

    };


    weapons.push(weapon);


    showMessage(
        "☠️ ARMA SECRETA APARECEU! ☠️"
    );

}


// ======================================================
// UPDATE WEAPONS
// ======================================================

function updateWeapons(delta) {

    for (
        let i = weapons.length - 1;
        i >= 0;
        i--
    ) {

        const weapon =
            weapons[i];


        weapon.life -=
            delta * 16.67;


        if (weapon.life <= 0) {

            weapons.splice(i, 1);


            showMessage(
                `${weapon.rarity} DESAPARECEU!`
            );

        }

    }

}


// ======================================================
// PEGAR ARMA
// ======================================================

function checkWeaponPickup() {

    for (
        let i = weapons.length - 1;
        i >= 0;
        i--
    ) {

        const weapon =
            weapons[i];


        const dx =
            player.x - weapon.x;

        const dy =
            player.y - weapon.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            player.radius +
            weapon.radius
        ) {

            currentWeapon = {

                name:
                    weapon.secret
                        ? "ARMA SECRETA"
                        : weapon.name,

                rarity:
                    weapon.rarity,

                damage:
                    weapon.damage,

                cooldown:
                    weapon.cooldown,

                bulletColor:
                    weapon.color,

                secret:
                    weapon.secret,

                image:
                    weapon.image

            };


            if (weapon.secret) {

                showMessage(
                    "☠️ ARMA SECRETA EQUIPADA!"
                );

            } else {

                showMessage(
                    `🔫 ${weapon.rarity} EQUIPADA!`
                );

            }


            weapons.splice(i, 1);

            updateHUD();

        }

    }

}


// ======================================================
// ATAQUE TOUCH
// ======================================================

attackButton.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();

        attackHeld = true;

        try {

            attackButton.setPointerCapture(
                event.pointerId
            );

        } catch (error) {}

        shoot();

    }
);


attackButton.addEventListener(
    "pointerup",
    function(event) {

        event.preventDefault();

        attackHeld = false;

    }
);


attackButton.addEventListener(
    "pointercancel",
    function() {

        attackHeld = false;

    }
);


attackButton.addEventListener(
    "lostpointercapture",
    function() {

        attackHeld = false;

    }
);


// ======================================================
// SHOOT
// ======================================================

function shoot() {

    if (!gameRunning) return;

    if (shopOpen) return;

    if (attackCooldown > 0) return;


    if (currentWeapon.secret) {

        shootAllDirections();

        attackCooldown =
            currentWeapon.cooldown *
            Math.pow(
                0.95,
                upgrades.fireRate
            );

        return;

    }


    let closestEnemy = null;

    let closestDistance =
        Infinity;


    for (const enemy of enemies) {

        const dx =
            enemy.x - player.x;

        const dy =
            enemy.y - player.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            closestDistance
        ) {

            closestDistance =
                distance;

            closestEnemy =
                enemy;

        }

    }


    if (!closestEnemy) return;


    const dx =
        closestEnemy.x -
        player.x;

    const dy =
        closestEnemy.y -
        player.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance === 0) return;


    bullets.push({

        x: player.x,

        y: player.y,

        velocityX:
            dx /
            distance *
            9,

        velocityY:
            dy /
            distance *
            9,

        radius: 6,

        damage:
            currentWeapon.damage +
            upgrades.damage,

        color:
            currentWeapon.bulletColor

    });


    attackCooldown =
        currentWeapon.cooldown *
        Math.pow(
            0.92,
            upgrades.fireRate
        );


    createParticles(
        player.x,
        player.y,
        5
    );

}


// ======================================================
// ARMA SECRETA
// ======================================================

function shootAllDirections() {

    const directions = 16;


    for (
        let i = 0;
        i < directions;
        i++
    ) {

        const angle =
            (
                Math.PI * 2 /
                directions
            ) * i;


        bullets.push({

            x: player.x,

            y: player.y,

            velocityX:
                Math.cos(angle) *
                8,

            velocityY:
                Math.sin(angle) *
                8,

            radius: 5,

            damage:
                currentWeapon.damage +
                upgrades.damage,

            color: "#ffffff"

        });

    }


    createParticles(
        player.x,
        player.y,
        20
    );

}


// ======================================================
// PARTICLES
// ======================================================

function createParticles(
    x,
    y,
    amount
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        particles.push({

            x: x,

            y: y,

            velocityX:
                (Math.random() - 0.5) *
                5,

            velocityY:
                (Math.random() - 0.5) *
                5,

            life: 1,

            size:
                2 +
                Math.random() * 4

        });

    }

}


// ======================================================
// SPAWN NPC
// ======================================================

function spawnEnemy() {

    if (
        enemiesSpawnedThisWave >= 5
    ) return;


    const enemy = {

        x: 0,

        y: 0,

        radius: 30,

        speed:
            0.7 +
            Math.random() * 0.3 +
            wave * 0.02,

        health: 3,

        maxHealth: 3,

        elite: false,

        boss: false,

        // NOVO
        attackTimer:
            130 +
            Math.random() * 60,

        attackCooldown:
            160,

        attackType:
            "normal"

    };


    // ==================================================
    // NPC ELITE
    // ==================================================

    if (
        wave >= 4 &&
        Math.random() < 0.08
    ) {

        enemy.elite = true;

        enemy.radius = 38;

        enemy.speed += 0.15;

        enemy.health = 6;

        enemy.maxHealth = 6;

        enemy.attackTimer =
            100 +
            Math.random() * 50;

        enemy.attackCooldown =
            115;

        enemy.attackType =
            "elite";

    }


    const side =
        Math.floor(
            Math.random() * 4
        );


    if (side === 0) {

        enemy.x = -60;

        enemy.y =
            Math.random() *
            canvas.height;

    }


    if (side === 1) {

        enemy.x =
            canvas.width + 60;

        enemy.y =
            Math.random() *
            canvas.height;

    }


    if (side === 2) {

        enemy.x =
            Math.random() *
            canvas.width;

        enemy.y = -60;

    }


    if (side === 3) {

        enemy.x =
            Math.random() *
            canvas.width;

        enemy.y =
            canvas.height + 60;

    }


    enemies.push(enemy);

    enemiesSpawnedThisWave++;

}


// ======================================================
// BOSS
// ======================================================

function spawnBoss() {

    const bossNumber =
        Math.floor(wave / 10);


    const bossHealth =
        200 +
        (bossNumber - 1) *
        100;


    const boss = {

        x: 0,

        y: 0,

        radius: 55,

        speed:
            0.65 +
            bossNumber * 0.05,

        health:
            bossHealth,

        maxHealth:
            bossHealth,

        elite: false,

        boss: true,

        // ATAQUE DO BOSS
        attackTimer: 120,

        attackCooldown:
            Math.max(
                70,
                145 -
                bossNumber * 5
            ),

        attackType: 0,

        attackFlash: 0

    };


    const side =
        Math.floor(
            Math.random() * 4
        );


    if (side === 0) {

        boss.x = -100;

        boss.y =
            Math.random() *
            canvas.height;

    }


    if (side === 1) {

        boss.x =
            canvas.width + 100;

        boss.y =
            Math.random() *
            canvas.height;

    }


    if (side === 2) {

        boss.x =
            Math.random() *
            canvas.width;

        boss.y = -100;

    }


    if (side === 3) {

        boss.x =
            Math.random() *
            canvas.width;

        boss.y =
            canvas.height + 100;

    }


    enemies.push(boss);


    showMessage(
        `🔥 BOSS - ONDA ${wave} 🔥`
    );

}


// ======================================================
// RECOMPENSA DO BOSS
// ======================================================

function bossReward() {

    const reward =
        2000 +
        Math.floor(wave / 10) *
        500;


    addPoints(reward);


    showMessage(
        `💰 BOSS: +${reward} PONTOS!`
    );


    createParticles(
        player.x,
        player.y,
        50
    );

}


// ======================================================
// ATAQUE NPC COMUM
// ======================================================

function npcNormalAttack(enemy) {

    const dx =
        player.x -
        enemy.x;

    const dy =
        player.y -
        enemy.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance === 0) return;


    enemyBullets.push({

        x: enemy.x,

        y: enemy.y,

        velocityX:
            dx /
            distance *
            3.2,

        velocityY:
            dy /
            distance *
            3.2,

        radius: 5,

        damage: 4,

        color: "#00b8ff",

        type: "normal",

        life: 250

    });


    createParticles(
        enemy.x,
        enemy.y,
        4
    );

}


// ======================================================
// ATAQUE NPC ELITE
// ======================================================

function npcEliteAttack(enemy) {

    const dx =
        player.x -
        enemy.x;

    const dy =
        player.y -
        enemy.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance === 0) return;


    const baseAngle =
        Math.atan2(
            dy,
            dx
        );


    // RAJADA DE 3 TIROS

    for (
        let i = -1;
        i <= 1;
        i++
    ) {

        const angle =
            baseAngle +
            i * 0.18;


        enemyBullets.push({

            x: enemy.x,

            y: enemy.y,

            velocityX:
                Math.cos(angle) *
                4,

            velocityY:
                Math.sin(angle) *
                4,

            radius: 5.5,

            damage: 5,

            color: "#ff9800",

            type: "elite",

            life: 250

        });

    }


    createParticles(
        enemy.x,
        enemy.y,
        7
    );

}


// ======================================================
// ATAQUES DOS NPCS
// ======================================================

function updateNPCAttacks(delta) {

    for (const enemy of enemies) {

        if (enemy.boss) continue;


        if (
            enemy.attackTimer === undefined
        ) {

            enemy.attackTimer =
                enemy.elite
                    ? 100
                    : 150;

        }


        enemy.attackTimer -= delta;


        if (
            enemy.attackTimer > 0
        ) {

            continue;

        }


        // ==============================================
        // VIDA DO NPC
        // ==============================================

        const healthPercent =
            enemy.health /
            enemy.maxHealth;


        // Quanto menos vida,
        // um pouco mais rápido ele ataca.

        let speedMultiplier =
            1;


        if (
            healthPercent <= 0.50
        ) {

            speedMultiplier =
                0.85;

        }


        if (
            healthPercent <= 0.25
        ) {

            speedMultiplier =
                0.70;

        }


        if (enemy.elite) {

            npcEliteAttack(enemy);


            enemy.attackTimer =
                enemy.attackCooldown *
                speedMultiplier;

        } else {

            npcNormalAttack(enemy);


            enemy.attackTimer =
                enemy.attackCooldown *
                speedMultiplier;

        }

    }

}


// ======================================================
// BOSS - RAJADA
// ======================================================

function bossBurstAttack(boss) {

    const dx =
        player.x -
        boss.x;

    const dy =
        player.y -
        boss.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance === 0) return;


    const baseAngle =
        Math.atan2(
            dy,
            dx
        );


    // 5 PROJÉTEIS

    for (
        let i = -2;
        i <= 2;
        i++
    ) {

        const angle =
            baseAngle +
            i * 0.16;


        enemyBullets.push({

            x: boss.x,

            y: boss.y,

            velocityX:
                Math.cos(angle) *
                4.8,

            velocityY:
                Math.sin(angle) *
                4.8,

            radius: 7,

            damage: 7,

            color: "#ff3030",

            type: "boss",

            life: 300

        });

    }


    createParticles(
        boss.x,
        boss.y,
        12
    );

}


// ======================================================
// BOSS - ATAQUE CIRCULAR
// ======================================================

function bossCircleAttack(boss) {

    const amount = 14;


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const angle =
            Math.PI * 2 /
            amount *
            i;


        enemyBullets.push({

            x: boss.x,

            y: boss.y,

            velocityX:
                Math.cos(angle) *
                3.2,

            velocityY:
                Math.sin(angle) *
                3.2,

            radius: 6,

            damage: 5,

            color: "#ff1744",

            type: "bossCircle",

            life: 300

        });

    }


    createParticles(
        boss.x,
        boss.y,
        18
    );

}


// ======================================================
// BOSS - MÍSSIL
// ======================================================

function bossMissileAttack(boss) {

    const dx =
        player.x -
        boss.x;

    const dy =
        player.y -
        boss.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance === 0) return;


    enemyBullets.push({

        x: boss.x,

        y: boss.y,

        velocityX:
            dx /
            distance *
            2.7,

        velocityY:
            dy /
            distance *
            2.7,

        radius: 10,

        damage: 12,

        color: "#ff0055",

        type: "missile",

        life: 360,

        turnSpeed: 0.045

    });


    createParticles(
        boss.x,
        boss.y,
        15
    );

}


// ======================================================
// ATAQUES DO BOSS
// ======================================================

function updateBossAttacks(delta) {

    for (const boss of enemies) {

        if (!boss.boss) continue;


        if (
            boss.attackTimer === undefined
        ) {

            boss.attackTimer = 120;

        }


        boss.attackTimer -= delta;


        if (
            boss.attackFlash > 0
        ) {

            boss.attackFlash -= delta;

        }


        if (
            boss.attackTimer > 0
        ) {

            continue;

        }


        const healthPercent =
            boss.health /
            boss.maxHealth;


        // ==============================================
        // BOSS FICA MAIS RÁPIDO COM MENOS VIDA
        // ==============================================

        let speedMultiplier = 1;


        if (
            healthPercent <= 0.70
        ) {

            speedMultiplier =
                0.85;

        }


        if (
            healthPercent <= 0.40
        ) {

            speedMultiplier =
                0.70;

        }


        if (
            healthPercent <= 0.20
        ) {

            speedMultiplier =
                0.55;

        }


        const cooldown =
            Math.max(
                55,
                boss.attackCooldown *
                speedMultiplier
            );


        boss.attackTimer =
            cooldown;


        boss.attackFlash = 15;


        // ==============================================
        // ESCOLHE ATAQUE
        // ==============================================

        const attack =
            Math.floor(
                Math.random() * 3
            );


        if (attack === 0) {

            bossBurstAttack(boss);

            showMessage(
                "⚠️ BOSS: RAJADA!"
            );

        }


        if (attack === 1) {

            bossCircleAttack(boss);

            showMessage(
                "💥 BOSS: EXPLOSÃO!"
            );

        }


        if (attack === 2) {

            bossMissileAttack(boss);

            showMessage(
                "🎯 BOSS: MÍSSIL!"
            );

        }

    }

}


// ======================================================
// ATUALIZAR BALAS DOS NPCS
// ======================================================

function updateEnemyBullets(delta) {

    for (
        let i = enemyBullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            enemyBullets[i];


        // ==============================================
        // MÍSSIL TELEGUEADO
        // ==============================================

        if (
            bullet.type === "missile"
        ) {

            const dx =
                player.x -
                bullet.x;

            const dy =
                player.y -
                bullet.y;


            const targetAngle =
                Math.atan2(
                    dy,
                    dx
                );


            const currentAngle =
                Math.atan2(
                    bullet.velocityY,
                    bullet.velocityX
                );


            let angleDifference =
                targetAngle -
                currentAngle;


            while (
                angleDifference > Math.PI
            ) {

                angleDifference -=
                    Math.PI * 2;

            }


            while (
                angleDifference < -Math.PI
            ) {

                angleDifference +=
                    Math.PI * 2;

            }


            const turn =
                Math.max(
                    -bullet.turnSpeed * delta,
                    Math.min(
                        bullet.turnSpeed * delta,
                        angleDifference
                    )
                );


            const newAngle =
                currentAngle +
                turn;


            const speed =
                Math.sqrt(
                    bullet.velocityX *
                        bullet.velocityX +
                    bullet.velocityY *
                        bullet.velocityY
                );


            bullet.velocityX =
                Math.cos(newAngle) *
                speed;

            bullet.velocityY =
                Math.sin(newAngle) *
                speed;

        }


        bullet.x +=
            bullet.velocityX *
            delta;

        bullet.y +=
            bullet.velocityY *
            delta;


        bullet.life -= delta;


        // ==============================================
        // COLISÃO COM PLAYER
        // ==============================================

        const dx =
            bullet.x -
            player.x;

        const dy =
            bullet.y -
            player.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            bullet.radius +
            player.radius
        ) {

            player.health -=
                bullet.damage;


            createParticles(
                player.x,
                player.y,
                bullet.type === "missile"
                    ? 15
                    : 7
            );


            enemyBullets.splice(i, 1);

            continue;

        }


        // ==============================================
        // SAIR DA TELA
        // ==============================================

        if (
            bullet.x < -100 ||
            bullet.x >
                canvas.width + 100 ||
            bullet.y < -100 ||
            bullet.y >
                canvas.height + 100 ||
            bullet.life <= 0
        ) {

            enemyBullets.splice(i, 1);

        }

    }

}


// ======================================================
// UPDATE
// ======================================================

function update(delta) {

    if (!gameRunning) return;

    if (shopOpen) return;


    let keyboardX = 0;

    let keyboardY = 0;


    if (keyboard.a)
        keyboardX--;

    if (keyboard.d)
        keyboardX++;

    if (keyboard.w)
        keyboardY--;

    if (keyboard.s)
        keyboardY++;


    const keyboardDistance =
        Math.sqrt(
            keyboardX *
                keyboardX +
            keyboardY *
                keyboardY
        );


    if (
        keyboardDistance > 0
    ) {

        keyboardX /=
            keyboardDistance;

        keyboardY /=
            keyboardDistance;

    }


    if (
        keyboardDistance > 0
    ) {

        player.velocityX =
            keyboardX *
            player.speed;

        player.velocityY =
            keyboardY *
            player.speed;

    } else {

        player.velocityX =
            joystickX *
            player.speed;

        player.velocityY =
            joystickY *
            player.speed;

    }


    player.x +=
        player.velocityX *
        delta;

    player.y +=
        player.velocityY *
        delta;


    player.x =
        Math.max(
            player.radius,
            Math.min(
                canvas.width -
                    player.radius,
                player.x
            )
        );


    player.y =
        Math.max(
            player.radius,
            Math.min(
                canvas.height -
                    player.radius,
                player.y
            )
        );


    if (attackHeld) {

        shoot();

    }


    if (attackCooldown > 0) {

        attackCooldown -=
            delta * 16.67;


        if (
            attackCooldown < 0
        ) {

            attackCooldown = 0;

        }

    }


    spawnTimer -= delta;


    if (
        enemiesSpawnedThisWave < 5 &&
        spawnTimer <= 0
    ) {

        spawnEnemy();

        spawnTimer = 0.7;

    }


    updateWeapons(delta);

    checkWeaponPickup();


    // ==================================================
    // NPCS
    // ==================================================

    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];


        const dx =
            player.x - enemy.x;

        const dy =
            player.y - enemy.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (distance > 0) {

            enemy.x +=
                dx /
                distance *
                enemy.speed *
                delta;

            enemy.y +=
                dy /
                distance *
                enemy.speed *
                delta;

        }


        if (
            distance <
            player.radius +
            enemy.radius
        ) {

            const damage =
                enemy.boss
                    ? 0.7
                    : enemy.elite
                        ? 0.45
                        : 0.35;


            player.health -=
                damage *
                delta;


            if (distance > 0) {

                enemy.x -=
                    dx /
                    distance *
                    2;

                enemy.y -=
                    dy /
                    distance *
                    2;

            }

        }

    }


    // ==================================================
    // ATAQUES DOS NPCS
    // ==================================================

    updateNPCAttacks(delta);


    // ==================================================
    // ATAQUES DO BOSS
    // ==================================================

    updateBossAttacks(delta);


    // ==================================================
    // BALAS DO PLAYER
    // ==================================================

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];


        bullet.x +=
            bullet.velocityX *
            delta;

        bullet.y +=
            bullet.velocityY *
            delta;


        if (
            bullet.x < -30 ||
            bullet.x >
                canvas.width + 30 ||
            bullet.y < -30 ||
            bullet.y >
                canvas.height + 30
        ) {

            bullets.splice(i, 1);

            continue;

        }


        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {

            const enemy =
                enemies[j];


            const dx =
                bullet.x -
                enemy.x;

            const dy =
                bullet.y -
                enemy.y;


            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <
                bullet.radius +
                enemy.radius
            ) {

                enemy.health -=
                    bullet.damage;


                bullets.splice(i, 1);


                createParticles(
                    enemy.x,
                    enemy.y,
                    enemy.boss
                        ? 12
                        : 8
                );


                if (
                    enemy.health <= 0
                ) {

                    let points = 10;


                    if (
                        enemy.elite
                    ) {

                        points = 30;

                    }


                    if (
                        enemy.boss
                    ) {

                        bossReward();

                    } else {

                        addPoints(
                            points
                        );

                    }


                    createParticles(
                        enemy.x,
                        enemy.y,
                        enemy.boss
                            ? 40
                            : 18
                    );


                    enemies.splice(
                        j,
                        1
                    );


                    if (
                        !enemy.boss
                    ) {

                        enemiesKilledThisWave++;

                    }


                    checkWaveComplete();

                }


                break;

            }

        }

    }


    // ==================================================
    // BALAS INIMIGAS
    // ==================================================

    updateEnemyBullets(delta);


    // ==================================================
    // PARTICLES
    // ==================================================

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.velocityX *
            delta;

        particle.y +=
            particle.velocityY *
            delta;


        particle.life -=
            0.04 *
            delta;


        particle.velocityX *=
            0.96;

        particle.velocityY *=
            0.96;


        if (
            particle.life <= 0
        ) {

            particles.splice(i, 1);

        }

    }


    if (
        player.health <= 0
    ) {

        player.health = 0;

        gameOver();

    }


    updateHUD();

}


// ======================================================
// ONDA
// ======================================================

function checkWaveComplete() {

    if (
        enemiesKilledThisWave < 5
    ) return;


    if (
        enemiesSpawnedThisWave !== 5
    ) return;


    // AGORA NENHUM NPC PODE ESTAR VIVO.
    // ISSO FAZ O BOSS PRECISAR MORRER.

    if (
        enemies.length > 0
    ) return;


    nextWave();

}


// ======================================================
// PRÓXIMA ONDA
// ======================================================

function nextWave() {

    wave++;

    enemiesSpawnedThisWave = 0;

    enemiesKilledThisWave = 0;

    spawnTimer = 1.5;


    // LIMPA BALAS ANTIGAS

    enemyBullets = [];


    showMessage(
        `⚡ ONDA ${wave}!`
    );


    // ==================================================
    // ARMA A CADA 5 ONDAS
    // ==================================================

    if (
        wave % 5 === 0 &&
        wave % 10 !== 0
    ) {

        if (
            Math.random() < 0.10
        ) {

            spawnSecretWeapon();

        } else {

            spawnWeapon();

        }

    }


    // ==================================================
    // LOJA A CADA 10 ONDAS
    // ==================================================

    if (
        wave % 10 === 0
    ) {

        setTimeout(
            function() {

                if (
                    gameRunning
                ) {

                    openShop();

                }

            },
            500
        );

    }


    // ==================================================
    // BOSS A CADA 10 ONDAS
    // ==================================================

    if (
        wave % 10 === 0
    ) {

        setTimeout(
            function() {

                if (
                    gameRunning
                ) {

                    spawnBoss();

                }

            },
            1000
        );

    }


    updateHUD();

}


// ======================================================
// PREÇOS
// ======================================================

function getUpgradeCost(type) {

    const level =
        upgrades[type];


    if (type === "damage") {

        return 300 +
            level * 250;

    }


    if (type === "speed") {

        return 250 +
            level * 200;

    }


    if (type === "fireRate") {

        return 400 +
            level * 350;

    }


    if (type === "maxHealth") {

        return 350 +
            level * 300;

    }


    return 999999;

}


// ======================================================
// COMPRAR UPGRADE
// ======================================================

function buyUpgrade(type) {

    if (!shopOpen) return;


    const cost =
        getUpgradeCost(type);


    if (score < cost) {

        showMessage(
            "❌ PONTOS INSUFICIENTES!"
        );

        return;

    }


    score -= cost;


    upgrades[type]++;


    if (
        type === "damage"
    ) {

        showMessage(
            "💥 DANO AUMENTADO!"
        );

    }


    if (
        type === "speed"
    ) {

        player.speed += 0.35;

        showMessage(
            "🏃 VELOCIDADE AUMENTADA!"
        );

    }


    if (
        type === "fireRate"
    ) {

        showMessage(
            "⚡ ATAQUE MAIS RÁPIDO!"
        );

    }


    if (
        type === "maxHealth"
    ) {

        player.maxHealth += 20;

        player.health += 20;

        showMessage(
            "❤️ VIDA MÁXIMA AUMENTADA!"
        );

    }


    updateHUD();

    updateShopUI();

}


// ======================================================
// COMPRAR ARMA
// ======================================================

function buyWeapon(rarityName) {

    if (!shopOpen) return;


    const prices = {

        "COMUM": 100,

        "RARO": 500,

        "ÉPICO": 1500,

        "LENDÁRIO": 5000,

        "MÍTICO": 15000

    };


    const cost =
        prices[rarityName];


    if (
        score < cost
    ) {

        showMessage(
            "❌ PONTOS INSUFICIENTES!"
        );

        return;

    }


    const rarity =
        rarityTypes.find(
            item =>
                item.name ===
                rarityName
        );


    if (!rarity) return;


    score -= cost;


    currentWeapon = {

        name:
            rarity.name,

        rarity:
            rarity.name,

        damage:
            rarity.damage,

        cooldown:
            rarity.cooldown,

        bulletColor:
            rarity.color,

        secret: false,

        image:
            rarity.image

    };


    showMessage(
        `🔫 ${rarity.name} COMPRADA!`
    );


    updateHUD();

    updateShopUI();

}


// ======================================================
// CRIAR LOJA
// ======================================================

function createShop() {

    if (
        document.getElementById(
            "shopScreen"
        )
    ) return;


    const shop =
        document.createElement(
            "div"
        );


    shop.id =
        "shopScreen";


    shop.innerHTML = `

        <div class="shop-box">

            <div class="shop-title">
                🛒 LOJA
            </div>

            <div class="shop-wave">
                ONDA ${wave}
            </div>

            <div class="shop-points">
                💰 <span id="shopPoints">
                    ${score}
                </span> PONTOS
            </div>


            <div class="shop-section">
                MELHORIAS
            </div>


            <div class="shop-grid">

                <button data-upgrade="damage">
                    💥 DANO
                    <small id="cost-damage">
                        ${getUpgradeCost("damage")} pts
                    </small>
                </button>


                <button data-upgrade="speed">
                    🏃 VELOCIDADE
                    <small id="cost-speed">
                        ${getUpgradeCost("speed")} pts
                    </small>
                </button>


                <button data-upgrade="fireRate">
                    ⚡ CADÊNCIA
                    <small id="cost-fireRate">
                        ${getUpgradeCost("fireRate")} pts
                    </small>
                </button>


                <button data-upgrade="maxHealth">
                    ❤️ VIDA MÁXIMA
                    <small id="cost-maxHealth">
                        ${getUpgradeCost("maxHealth")} pts
                    </small>
                </button>

            </div>


            <div class="shop-section">
                ARMAS
            </div>


            <div class="shop-grid weapons-shop">

                <button data-weapon="COMUM" style="--rarity-color:#bdbdbd">
                    ⚪ COMUM
                    <small>100 pts</small>
                </button>


                <button data-weapon="RARO" style="--rarity-color:#2196f3">
                    🔵 RARO
                    <small>500 pts</small>
                </button>


                <button data-weapon="ÉPICO" style="--rarity-color:#9c27b0">
                    🟣 ÉPICO
                    <small>1.500 pts</small>
                </button>


                <button data-weapon="LENDÁRIO" style="--rarity-color:#ff9800">
                    🟠 LENDÁRIO
                    <small>5.000 pts</small>
                </button>


                <button data-weapon="MÍTICO" style="--rarity-color:#ff1744">
                    🔴 MÍTICO
                    <small>15.000 pts</small>
                </button>

            </div>


            <button
                id="closeShop"
                class="close-shop"
            >
                CONTINUAR 🔥
            </button>

        </div>

    `;


    document.body.appendChild(
        shop
    );


    // ==================================================
    // ESTILO DA LOJA
    // ==================================================

    // A loja deve começar ESCONDIDA.
    // Sem isso ela fica cobrindo a tela
    // (inclusive o menu) assim que o
    // script carrega, bloqueando os
    // botões de ESQUERDA/DIREITA.

    shop.style.display =
        "none";

    shop.style.position =
        "fixed";

    shop.style.inset =
        "0";

    shop.style.zIndex =
        "9999";

    shop.style.alignItems =
        "center";

    shop.style.justifyContent =
        "center";

    shop.style.background =
        "rgba(0,0,0,0.82)";

    shop.style.backdropFilter =
        "blur(10px)";

    shop.style.fontFamily =
        "Arial, sans-serif";


    const box =
        shop.querySelector(
            ".shop-box"
        );


    box.style.width =
        "min(650px, 92vw)";

    box.style.maxHeight =
        "90vh";

    box.style.overflowY =
        "auto";

    box.style.padding =
        "25px";

    box.style.borderRadius =
        "20px";

    box.style.background =
        "linear-gradient(145deg,#08101f,#05070d)";

    box.style.border =
        "1px solid #00e5ff55";

    box.style.boxShadow =
        "0 0 50px #00e5ff22";


    const title =
        shop.querySelector(
            ".shop-title"
        );


    title.style.fontSize =
        "32px";

    title.style.fontWeight =
        "900";

    title.style.textAlign =
        "center";

    title.style.color =
        "#00e5ff";

    title.style.textShadow =
        "0 0 15px #00e5ff";


    const waveLabel =
        shop.querySelector(
            ".shop-wave"
        );


    waveLabel.style.textAlign =
        "center";

    waveLabel.style.color =
        "#aaa";

    waveLabel.style.marginTop =
        "5px";


    const points =
        shop.querySelector(
            ".shop-points"
        );


    points.style.textAlign =
        "center";

    points.style.fontSize =
        "22px";

    points.style.fontWeight =
        "bold";

    points.style.color =
        "#ffd740";

    points.style.margin =
        "12px 0 20px";


    const sections =
        shop.querySelectorAll(
            ".shop-section"
        );


    sections.forEach(
        section => {

            section.style.margin =
                "18px 0 8px";

            section.style.fontSize =
                "12px";

            section.style.fontWeight =
                "bold";

            section.style.letterSpacing =
                "2px";

            section.style.color =
                "#ffffff88";

        }
    );


    const grid =
        shop.querySelectorAll(
            ".shop-grid"
        );


    grid.forEach(
        item => {

            item.style.display =
                "grid";

            item.style.gridTemplateColumns =
                "repeat(auto-fit,minmax(120px,1fr))";

            item.style.gap =
                "10px";

        }
    );


    const buttons =
        shop.querySelectorAll(
            ".shop-grid button"
        );


    buttons.forEach(
        button => {

            const rarityColor =
                button.style.getPropertyValue(
                    "--rarity-color"
                ) || "#00e5ff";


            button.style.border =
                button.dataset.weapon
                    ? `1px solid ${rarityColor}66`
                    : "1px solid #ffffff18";

            button.style.borderRadius =
                "12px";

            button.style.padding =
                "13px 8px";

            button.style.background =
                button.dataset.weapon
                    ? `${rarityColor}14`
                    : "#ffffff08";

            button.style.color =
                "white";

            button.style.fontWeight =
                "900";

            button.style.cursor =
                "pointer";

            button.style.transition =
                "0.15s";


            if (button.dataset.weapon) {

                button.style.boxShadow =
                    `0 0 14px ${rarityColor}22`;

            }


            button.addEventListener(
                "pointerdown",
                function(event) {

                    event.preventDefault();

                    button.style.transform =
                        "scale(0.95)";

                    setTimeout(
                        () => {

                            button.style.transform =
                                "scale(1)";

                        },
                        100
                    );


                    if (
                        button.dataset.upgrade
                    ) {

                        buyUpgrade(
                            button.dataset.upgrade
                        );

                    }


                    if (
                        button.dataset.weapon
                    ) {

                        buyWeapon(
                            button.dataset.weapon
                        );

                    }

                }
            );

        }
    );


    const smalls =
        shop.querySelectorAll(
            ".shop-grid small"
        );


    smalls.forEach(
        small => {

            const parentButton =
                small.closest("button");

            const rarityColor =
                parentButton &&
                parentButton.style.getPropertyValue(
                    "--rarity-color"
                );

            small.style.display =
                "block";

            small.style.marginTop =
                "6px";

            small.style.color =
                rarityColor || "#00e5ff";

            small.style.fontSize =
                "10px";

        }
    );


    const close =
        shop.querySelector(
            "#closeShop"
        );


    close.style.width =
        "100%";

    close.style.marginTop =
        "20px";

    close.style.padding =
        "15px";

    close.style.border =
        "none";

    close.style.borderRadius =
        "12px";

    close.style.background =
        "#00e5ff";

    close.style.color =
        "#001018";

    close.style.fontWeight =
        "900";

    close.style.fontSize =
        "15px";

    close.style.cursor =
        "pointer";


    close.addEventListener(
        "pointerdown",
        function(event) {

            event.preventDefault();

            closeShop();

        }
    );

}


// ======================================================
// ATUALIZAR LOJA
// ======================================================

function updateShopUI() {

    const points =
        document.getElementById(
            "shopPoints"
        );


    if (points) {

        points.textContent =
            score;

    }


    for (
        const type of [
            "damage",
            "speed",
            "fireRate",
            "maxHealth"
        ]
    ) {

        const cost =
            document.getElementById(
                `cost-${type}`
            );


        if (cost) {

            cost.textContent =
                `${getUpgradeCost(type)} pts`;

        }

    }

}


// ======================================================
// ABRIR LOJA
// ======================================================

function openShop() {

    if (!gameRunning) return;

    shopOpen = true;

    attackHeld = false;

    resetJoystick();

    createShop();


    const shop =
        document.getElementById(
            "shopScreen"
        );


    if (shop) {

        shop.style.display =
            "flex";

    }


    updateShopUI();


    showMessage(
        "🛒 LOJA ABERTA!"
    );

}


// ======================================================
// FECHAR LOJA
// ======================================================

function closeShop() {

    shopOpen = false;


    const shop =
        document.getElementById(
            "shopScreen"
        );


    if (shop) {

        shop.style.display =
            "none";

    }


    if (gameRunning) {

        showMessage(
            "🔥 PREPARE-SE!"
        );

    }

}


// ======================================================
// GAME OVER
// ======================================================

function gameOver() {

    gameRunning = false;

    attackHeld = false;

    resetJoystick();


    keyboard.w = false;
    keyboard.a = false;
    keyboard.s = false;
    keyboard.d = false;


    finalScore.textContent =
        totalPointsEarned;


    gameOverScreen.classList.remove(
        "hidden"
    );


    saveRanking();

    showRankingOnGameOver();

}


// ======================================================
// RANKING
// ======================================================

function getRanking() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "touchArenaRanking"
            )
        ) || [];

    } catch (error) {

        return [];

    }

}


function saveRanking() {

    const ranking =
        getRanking();


    ranking.push({

        score:
            totalPointsEarned,

        wave:
            wave,

        date:
            new Date()
                .toLocaleDateString(
                    "pt-BR"
                )

    });


    ranking.sort(
        (a, b) =>
            b.score -
            a.score
    );


    const top10 =
        ranking.slice(
            0,
            10
        );


    localStorage.setItem(
        "touchArenaRanking",
        JSON.stringify(
            top10
        )
    );

}


// ======================================================
// MOSTRAR RANKING
// ======================================================

function showRankingOnGameOver() {

    let rankingBox =
        document.getElementById(
            "rankingBox"
        );


    if (!rankingBox) {

        rankingBox =
            document.createElement(
                "div"
            );


        rankingBox.id =
            "rankingBox";


        gameOverScreen
            .querySelector(
                ".panel"
            )
            .appendChild(
                rankingBox
            );


        rankingBox.style.marginTop =
            "20px";

        rankingBox.style.padding =
            "15px";

        rankingBox.style.borderRadius =
            "15px";

        rankingBox.style.background =
            "rgba(0,0,0,0.3)";

        rankingBox.style.border =
            "1px solid #ffffff15";

    }


    const ranking =
        getRanking();


    let html =
        `<h3 style="
            margin:0 0 10px;
            color:#ffd740;
        ">
            🏆 RANKING
        </h3>`;


    if (
        ranking.length === 0
    ) {

        html +=
            `<p>Nenhuma pontuação ainda.</p>`;

    } else {

        ranking.forEach(
            function(item, index) {

                let medal =
                    "▫️";


                if (index === 0)
                    medal = "🥇";

                if (index === 1)
                    medal = "🥈";

                if (index === 2)
                    medal = "🥉";


                html += `

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        padding:6px 0;
                        border-bottom:1px solid #ffffff08;
                    ">

                        <span>
                            ${medal}
                            ${index + 1}º
                        </span>

                        <strong>
                            ${item.score}
                        </strong>

                        <small style="
                            color:#ffffff66;
                        ">
                            Onda ${item.wave}
                        </small>

                    </div>

                `;

            }
        );

    }


    rankingBox.innerHTML =
        html;

}


// ======================================================
// RESTART
// ======================================================

restartBtn.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();


        if (!gameMode) {

            gameMode = "left";

        }


        startGame();

    }
);


// ======================================================
// GRID
// ======================================================

function drawGrid() {

    const gridSize = 50;


    ctx.strokeStyle =
        "#ffffff08";

    ctx.lineWidth = 1;


    for (
        let x = 0;
        x < canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = 0;
        y < canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }

}


// ======================================================
// PERSONAGEM
// ======================================================

function drawCharacter(
    image,
    x,
    y,
    size
) {

    if (
        !image ||
        !image.complete ||
        image.naturalWidth === 0
    ) {

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            size / 2,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#00e5ff";

        ctx.fill();

        return;

    }


    ctx.save();


    ctx.shadowColor =
        "#00e5ff";

    ctx.shadowBlur = 20;


    ctx.beginPath();


    ctx.arc(
        x,
        y,
        size / 2,
        0,
        Math.PI * 2
    );


    ctx.clip();


    ctx.drawImage(
        image,
        x - size / 2,
        y - size / 2,
        size,
        size
    );


    ctx.restore();

}


// ======================================================
// ARMAS NO MAPA
// ======================================================

function drawWeapons() {

    for (
        const weapon of weapons
    ) {

        ctx.save();

        ctx.globalAlpha =
            0.22;

        ctx.shadowColor =
            weapon.color;

        ctx.shadowBlur =
            35;

        ctx.fillStyle =
            weapon.color;


        ctx.beginPath();


        ctx.arc(
            weapon.x,
            weapon.y,
            weapon.radius *
                0.75,
            0,
            Math.PI * 2
        );


        ctx.fill();

        ctx.restore();


        if (
            weapon.image &&
            weapon.image.complete &&
            weapon.image.naturalWidth > 0
        ) {

            ctx.save();


            ctx.shadowColor =
                weapon.color;

            ctx.shadowBlur =
                18;


            const weaponSize =
                weapon.radius *
                2.2;


            ctx.drawImage(
                weapon.image,
                weapon.x -
                    weaponSize / 2,
                weapon.y -
                    weaponSize / 2,
                weaponSize,
                weaponSize
            );


            ctx.restore();

        } else {

            ctx.save();


            ctx.font =
                "28px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillStyle =
                "#ffffff";

            ctx.shadowColor =
                weapon.color;

            ctx.shadowBlur =
                15;


            ctx.fillText(
                weapon.secret
                    ? "☠️"
                    : "🔫",
                weapon.x,
                weapon.y
            );


            ctx.restore();

        }


        ctx.save();


        ctx.font =
            "bold 12px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "alphabetic";

        ctx.fillStyle =
            weapon.color;

        ctx.shadowColor =
            weapon.color;

        ctx.shadowBlur = 8;


        ctx.fillText(
            weapon.rarity,
            weapon.x,
            weapon.y +
                weapon.radius +
                18
        );


        const seconds =
            Math.ceil(
                weapon.life /
                1000
            );


        ctx.font =
            "10px Arial";

        ctx.fillStyle =
            "#ffffff";

        ctx.shadowBlur = 0;


        ctx.fillText(
            `${seconds}s`,
            weapon.x,
            weapon.y +
                weapon.radius +
                32
        );


        ctx.restore();

    }

}


// ======================================================
// DESENHAR BALAS INIMIGAS
// ======================================================

function drawEnemyBullets() {

    for (
        const bullet of enemyBullets
    ) {

        ctx.save();


        ctx.shadowColor =
            bullet.color;

        ctx.shadowBlur =
            bullet.type === "missile"
                ? 25
                : 16;


        // ==============================================
        // MÍSSIL
        // ==============================================

        if (
            bullet.type === "missile"
        ) {

            const angle =
                Math.atan2(
                    bullet.velocityY,
                    bullet.velocityX
                );


            ctx.translate(
                bullet.x,
                bullet.y
            );


            ctx.rotate(angle);


            // CAUDA

            ctx.fillStyle =
                "#ff9800";


            ctx.beginPath();

            ctx.moveTo(
                -18,
                0
            );

            ctx.lineTo(
                -5,
                -5
            );

            ctx.lineTo(
                -5,
                5
            );

            ctx.closePath();

            ctx.fill();


            // CORPO

            ctx.fillStyle =
                "#ff1744";


            ctx.beginPath();

            ctx.arc(
                0,
                0,
                bullet.radius,
                0,
                Math.PI * 2
            );

            ctx.fill();


            // BRILHO

            ctx.fillStyle =
                "#ffffff";


            ctx.beginPath();

            ctx.arc(
                3,
                -3,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();

        } else {

            // ==========================================
            // TIROS NORMAIS
            // ==========================================

            ctx.beginPath();


            ctx.arc(
                bullet.x,
                bullet.y,
                bullet.radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                bullet.color;


            ctx.fill();


            // brilho interno

            ctx.shadowBlur = 0;


            ctx.fillStyle =
                "rgba(255,255,255,0.8)";


            ctx.beginPath();


            ctx.arc(
                bullet.x -
                    bullet.radius *
                    0.25,
                bullet.y -
                    bullet.radius *
                    0.25,
                bullet.radius *
                    0.25,
                0,
                Math.PI * 2
            );


            ctx.fill();

        }


        ctx.restore();

    }

}


// ======================================================
// DESENHAR
// ======================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawGrid();


    drawWeapons();


    // ==================================================
    // BALAS DO PLAYER
    // ==================================================

    for (
        const bullet of bullets
    ) {

        ctx.beginPath();


        ctx.arc(
            bullet.x,
            bullet.y,
            bullet.radius,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            bullet.color;

        ctx.shadowColor =
            bullet.color;

        ctx.shadowBlur = 20;


        ctx.fill();


        ctx.shadowBlur = 0;

    }


    // ==================================================
    // BALAS INIMIGAS
    // ==================================================

    drawEnemyBullets();


    // ==================================================
    // NPCS
    // ==================================================

    for (
        const enemy of enemies
    ) {

        const enemyImage =
            gameMode === "left"
                ? bolsonaroImage
                : lulaImage;


        const size =
            enemy.boss
                ? 110
                : enemy.elite
                    ? 75
                    : 60;


        // ==================================================
        // FLASH DE ATAQUE DO BOSS
        // ==================================================

        if (
            enemy.boss &&
            enemy.attackFlash > 0
        ) {

            ctx.save();


            ctx.globalAlpha =
                enemy.attackFlash /
                15 *
                0.45;


            ctx.strokeStyle =
                "#ff0000";


            ctx.lineWidth = 5;


            ctx.shadowColor =
                "#ff0000";


            ctx.shadowBlur = 25;


            ctx.beginPath();


            ctx.arc(
                enemy.x,
                enemy.y,
                enemy.radius +
                    15 +
                    (15 -
                        enemy.attackFlash) *
                    2,
                0,
                Math.PI * 2
            );


            ctx.stroke();


            ctx.restore();

        }


        drawCharacter(
            enemyImage,
            enemy.x,
            enemy.y,
            size
        );


        // ==================================================
        // BARRA DE VIDA BONITA
        // ==================================================

        const barWidth =
            enemy.boss
                ? 140
                : enemy.elite
                    ? 70
                    : 50;


        const barHeight =
            enemy.boss
                ? 12
                : enemy.elite
                    ? 8
                    : 6;


        const healthPercent =
            Math.max(
                0,
                Math.min(
                    1,
                    enemy.health /
                    enemy.maxHealth
                )
            );


        const barX =
            enemy.x -
            barWidth / 2;


        const barY =
            enemy.y -
            enemy.radius -
            17;


        ctx.save();


        // FUNDO

        ctx.fillStyle =
            "rgba(0,0,0,0.75)";


        ctx.beginPath();


        ctx.roundRect(
            barX - 2,
            barY - 2,
            barWidth + 4,
            barHeight + 4,
            6
        );


        ctx.fill();


        // BORDA

        ctx.strokeStyle =
            enemy.boss
                ? "#ff3030"
                : enemy.elite
                    ? "#ff9800"
                    : "#00e5ff";


        ctx.lineWidth = 1.5;


        ctx.stroke();


        // DEGRADÊ

        const gradient =
            ctx.createLinearGradient(
                barX,
                0,
                barX +
                    barWidth,
                0
            );


        if (enemy.boss) {

            gradient.addColorStop(
                0,
                "#ff0000"
            );

            gradient.addColorStop(
                0.5,
                "#ff3030"
            );

            gradient.addColorStop(
                1,
                "#ff8a8a"
            );

        } else if (
            enemy.elite
        ) {

            gradient.addColorStop(
                0,
                "#ff6d00"
            );

            gradient.addColorStop(
                0.5,
                "#ff9800"
            );

            gradient.addColorStop(
                1,
                "#ffd180"
            );

        } else {

            gradient.addColorStop(
                0,
                "#00b8ff"
            );

            gradient.addColorStop(
                0.5,
                "#00e5ff"
            );

            gradient.addColorStop(
                1,
                "#8fffff"
            );

        }


        ctx.fillStyle =
            gradient;


        ctx.shadowColor =
            enemy.boss
                ? "#ff2020"
                : enemy.elite
                    ? "#ff9800"
                    : "#00e5ff";


        ctx.shadowBlur =
            enemy.boss
                ? 12
                : 7;


        ctx.beginPath();


        ctx.roundRect(
            barX,
            barY,
            barWidth *
                healthPercent,
            barHeight,
            4
        );


        ctx.fill();


        // BRILHO

        if (
            healthPercent > 0
        ) {

            ctx.shadowBlur = 0;

            ctx.fillStyle =
                "rgba(255,255,255,0.45)";


            ctx.beginPath();


            ctx.roundRect(
                barX + 1,
                barY + 1,
                Math.max(
                    0,
                    barWidth *
                        healthPercent -
                        2
                ),
                Math.max(
                    1,
                    barHeight *
                        0.25
                ),
                3
            );


            ctx.fill();

        }


        // ==================================================
        // LABEL ELITE
        // ==================================================

        if (
            enemy.elite &&
            !enemy.boss
        ) {

            ctx.shadowColor =
                "#ff9800";

            ctx.shadowBlur =
                8;

            ctx.fillStyle =
                "#ffd180";

            ctx.font =
                "bold 10px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";


            ctx.fillText(
                "ELITE",
                enemy.x,
                barY - 9
            );

        }


        // ==================================================
        // BOSS
        // ==================================================

        if (
            enemy.boss
        ) {

            ctx.shadowColor =
                "#ff0000";

            ctx.shadowBlur =
                10;

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 17px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";


            ctx.fillText(
                "BOSS",
                enemy.x,
                barY - 13
            );

        }


        ctx.restore();

    }


    // ==================================================
    // PLAYER
    // ==================================================

    const playerImage =
        gameMode === "left"
            ? lulaImage
            : bolsonaroImage;


    drawCharacter(
        playerImage,
        player.x,
        player.y,
        70
    );


    // ==================================================
    // PARTICULAS
    // ==================================================

    for (
        const particle of particles
    ) {

        ctx.save();


        ctx.globalAlpha =
            particle.life;


        ctx.beginPath();


        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            currentWeapon.bulletColor;


        ctx.shadowColor =
            currentWeapon.bulletColor;


        ctx.shadowBlur = 15;


        ctx.fill();


        ctx.restore();

    }

}


// ======================================================
// LOOP
// ======================================================

function loop(timestamp) {

    if (!lastTime) {

        lastTime =
            timestamp;

    }


    const delta =
        Math.min(
            (
                timestamp -
                lastTime
            ) / 16.67,
            2
        );


    lastTime =
        timestamp;


    update(delta);

    draw();


    requestAnimationFrame(
        loop
    );

}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

resizeCanvas();


player.x =
    canvas.width / 2;

player.y =
    canvas.height / 2;


updateHUD();

draw();


// Cria a loja uma vez
createShop();


requestAnimationFrame(
    loop
);