/* global Character, Sprite */

"use strict";

Character.initSprites = function() {
    Character.animations.forEach(function(animation) {
        Character.sprites.male.naked[animation] = {
            clean: new Sprite(Character.spriteDir + "male/" + animation + "/naked.png"),
            default: new Sprite(Character.spriteDir + "male/" + animation + "/naked.png"),
        };
        Character.sprites.female.naked[animation] = {
            clean: new Sprite(Character.spriteDir + "female/" + animation + "/naked.png"),
            default: new Sprite(Character.spriteDir + "female/" + animation + "/naked-default.png"),
        };
    });
    ["sword"].forEach(function(weapon) {
        Character.sprites.male.weapons[weapon] = new Sprite(Character.spriteDir + "male/weapon/" + weapon + ".png");
        Character.sprites.female.weapons[weapon] = new Sprite(Character.spriteDir + "female/weapon/" + weapon + ".png");
    });
    // shared by all characters; stupid by fast?
    // TODO: 99% of the time we don't need it.
    [["stun", 64, 42]].forEach(function(effect) {
        var name = effect[0];
        var width = effect[1];
        var height = effect[2];
        var sprite = new Sprite(Character.spriteDir + "/effects/" + name + ".png", width, height);
        Character.sprites.effects[name] = sprite;
    });
    Character.corpse = {
        corpse: new Sprite("icons/corpse/corpse.png"),
        // arrow: new Sprite("icons/corpse/arrow.png"),
    };

    Character.flags.Empire = new Sprite("icons/flags/empire.png");
    Character.flags.Confederation = new Sprite("icons/flags/confederation.png");
    Character.flags.red = new Sprite("icons/flags/red.png");
    Character.flags.blue = new Sprite("icons/flags/blue.png");
    Character.pvpFlag = new Sprite("icons/pvp.png");
};

Character.spritesInfo = {
    "cat": {
        width: 90,
        height: 90,
        offset: 30,
    },
    "dog": {
        width: 100,
        height: 100,
        offset: 35,
    },
    "kitty-pahan": {
        width: 110,
        height: 110,
        offset: 30,
        nameOffset: 80,
    },
    "kitty-cutthroat": {
        width: 110,
        height: 110,
        offset: 30,
        nameOffset: 80,
    },
    "kitty-robber": {
        width: 110,
        height: 110,
        offset: 30,
        nameOffset: 80,
    },
    "kitty-junkie": {
        width: 110,
        height: 110,
        offset: 30,
        nameOffset: 80,
    },
    "goose": {
        width: 70,
        height: 70,
        speed: 7000,
    },
    "chicken": {
        width: 50,
        height: 50,
        speed: 7000,
    },
    "rabbit": {
        width: 50,
        height: 50,
        speed: 7000,
    },
    "butterfly": {
        width: 43,
        height: 43,
    },
    "bee": {
        width: 43,
        height: 43,
    },
    "zombie": {
        width: 32,
        height: 32,
        angle: Math.PI/2,
    },
    "ultra-zombie": {
        width: 96,
        height: 96,
        angle: Math.PI/2,
    },
    "jesus": {
        width: 64,
        height: 96,
        nameOffset: 100,
    },
    "charles": {
        width: 67,
        height: 95,
    },
    "diego": {
        width: 74,
        height: 95,
        angle: Math.PI*2,
    },
    "abu": {
        width: 120,
        height: 120,
        speed: 25000,
        offset: 20,
    },
    "senior-mocherator": {
        width: 110,
        height: 110,
        speed: 25000,
        offset: 12,
    },
    "mocherator": {
        width: 100,
        height: 100,
        speed: 25000,
        offset: 11,
    },
    "omsk": {
        width: 170,
        height: 170,
        offset: 40,
    },
    "omich": {
        width: 130,
        height: 130,
        offset: 35,
    },
    "ufo": {
        width: 64,
        height: 64,
        angle: Math.PI*2,
    },
    "wyvern": {
        width: 256,
        height: 256,
        speed: 20000,
        offset: 100,
    },
    "rift-imp": {
        width: 110,
        height: 110,
        offset: 20,
        nameOffset: 75,
        speed: 7000,
        animations: {
            idle: {
                speed: 20000,
            }
        }
    },
    "fallen-imp": {
        width: 110,
        height: 110,
        offset: 20,
        nameOffset: 75,
        speed: 7000,
        animations: {
            idle: {
                speed: 20000,
            }
        }
    },
    "fiend": {
        width: 126,
        height: 126,
        offset: 20,
        nameOffset: 75,
        speed: 7000,
        animations: {
            idle: {
                speed: 20000,
            }
        }
    },
    "expelled-imp": {
        width: 110,
        height: 110,
        offset: 20,
        nameOffset: 75,
        speed: 7000,
        animations: {
            idle: {
                speed: 20000,
            }
        }
    },
    "lesser-daemon": {
        width: 160,
        height: 102,
        speed: 40000,
    },
    "higher-daemon": {
        width: 150,
        height: 150,
        offset: 21,
        nameOffset: 105,
        speed: 12000,
        animations: {
            idle: {
                speed: 25000,
            },
            attack: {
                speed: 40000,
            }
        }
    },
    "prince-of-darkness": {
        width: 150,
        height: 150,
        offset: 21,
        nameOffset: 110,
        speed: 50000,
        animations: {
            run: {
                speed: 15000,
            }
        }
    },
    "daemon": {
        width: 150,
        height: 150,
        offset: 20,
        nameOffset: 100,
        speed: 50000,
    },
    "small-spider": {
        width: 64,
        height: 64,
        offset: 25,
        speed: 21000,
    },
    "spider": {
        width: 128,
        height: 128,
        offset: 45,
        speed: 31000,
    },
    "horse": {
        width: 150,
        height: 150,
        offset: 43,
    },
    "medved": {
        width: 150,
        height: 150,
        offset: 43,
        nameOffset: 90,
    },
    "shadow": {
        width: 160,
        height: 160,
        offset: 50,
        nameOffset: 84,
        speed: 30000,
    },
    "bloody-shadow": {
        width: 130,
        height: 130,
        offset: 40,
        nameOffset: 70,
        speed: 30000,
    },
    "hell-shadow": {
        width: 100,
        height: 100,
        offset: 30,
        nameOffset: 62,
        speed: 30000,
    },
    "pinky-rogalian": {
        width: 170,
        height: 170,
        speed: 30000,
        offset: 40,
        nameOffset: 78,
    },
    "rogalian": {
        width: 160,
        height: 160,
        speed: 30000,
        offset: 30,
        nameOffset: 110,
    },
    "hell-rogalian": {
        width: 200,
        height: 200,
        speed: 30000,
        offset: 40,
        nameOffset: 125,
    },
    "preved-medved": {
        width: 210,
        height: 210,
        offset: 44,
        speed: 20000,
    },
    "cow": {
        width: 100,
        height: 100,
        offset: 45,
    },
    "wolf": {
        width: 100,
        height: 100,
        offset: 45,
        nameOffset: 45,
    },
    "wolf-undead": {
        width: 100,
        height: 100,
        offset: 45,
        nameOffset: 45,
    },
    "wolf-demonic": {
        width: 100,
        height: 100,
        offset: 45,
        nameOffset: 45,
    },
    "sheep": {
        width: 100,
        height: 100,
        offset: 45,
    },
    "pig": {
        width: 100,
        height: 100,
        speed: 5000,
    },
    "wolf-fatty": {
        width: 120,
        height: 120,
        offset: 45,
        nameOffset: 60,
    },
    "wolf-hungry": {
        width: 80,
        height: 80,
        offset: 30,
        nameOffset: 40,
    },
    "training-dummy": {
        width: 55,
        height: 67,
        angle: 0,
        nameOffset: 70,
    },
    "blue-chopper": {
        width: 146,
        height: 112,
        offset: 30,
    },
    "red-chopper": {
        width: 146,
        height: 112,
        offset: 30,
    },
    "pink-chopper": {
        width: 146,
        height: 112,
        offset: 30,
    },
    "player": {
        nameOffset: 40,
        offset: 28,
        width: 112,
        height: 112,
        speed: 14000,
    },
};
