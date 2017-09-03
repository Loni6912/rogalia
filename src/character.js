/* global util, CELL_SIZE, game, Point, Info, dom, T, Panel, Talks, BBox, loader, config, Avatar, Effect, TS, TT, Customization, ImageFilter, FONT_SIZE, astar, ContainerSlot, Quest, Sprite */

"use strict";
class Character {
    constructor(id) {
        this.Id = id;
        this.name = "";
        this.x = 0;
        this.y = 0;

        this.Hp = {Current: 0, Max: 0};
        this.Invisible = false;

        this.Title = "";
        this.Type = "";
        //used to show animation of varius type, like damage deal or exp gain
        this.info = [];
        this.Messages = null;
        this.PrivateMessages = null;

        this.Dst = {
            X: 0,
            Y: 0,
        };

        this.velocity = new Point();

        this.dst = {
            x: 0,
            y: 0,
            time: null,
            radius: 0,
        };

        this.target = null;

        this.Radius = CELL_SIZE / 4;
        this.Speed = 0;
        this.Equip = [];

        this.IsNpc = false;

        this.Burden = 0;
        this.burden = null;
        this.plow = null;

        this.Effects = {};
        this.Clothes = [];

        this.Settings = {
            Pathfinding: true,
            ObstacleaAvoidance: true,
        };

        this.ballon = null;
        this.isPlayer = false;

        this.Action = {};
        this.action = {
            progress: 0,
            last: 0,
        };

        this.animation = {up: null, down: null};

        this.sprites = Character.animations.reduce((sprites, animation) => {
            const sprite = new Sprite();
            sprite.name = animation;
            sprites[animation] = sprite;
            return sprites;
        }, {});
        this.sprite = this.sprites.idle;

        this._parts = "{}"; // defaults for npcs

        this._marker = {
            opacity: 1,
            delta: -1,
        };

        this._messages = [];
        this._remote = new Point();
    }

    get X() {
        return this.x;
    }

    get Y() {
        return this.y;
    }

    // ignore remote position (from sync)
    set X(x) {}
    set Y(y) {}

    get correction() {
        return new Point(this).sub(this._remote).length();
    }

    positionSyncRequired(x, y) {
        return Math.abs(this.x - x) > CELL_SIZE || Math.abs(this.y - y) > CELL_SIZE;
    }

    syncPosition(x, y) {
        this._remote.set(x, y);
        if (this.positionSyncRequired(x, y)) {
            this.setPos(x, y);
        }
    }

    syncDst(x, y) {
        if (x != 0 || y != 0) {
            this.updateDst(x, y);
            return;
        }

        if (Math.abs(this.x - this._remote.x) < CELL_SIZE || Math.abs(this.y - this._remote - y) < CELL_SIZE) {
            this.setPos(this._remote.x, this._remote.y);
            this.stop();
        } else {
            this.updateDst(this._remote.x, this._remote.y);
        }
    }
    getZ() {
        return 0;
    }

    get Name() {
        return this.name || util.ucfirst(this.Type);
    }

    set Name(name) {
        this.name = name;
    }

    leftTopX() {
        return (this.X - this.Width / 2) << 0;
    }

    leftTopY() {
        return (this.Y - this.Height / 2) << 0;
    }

    compare(entity) {
        if (this.Effects.Sitting && this.Effects.Sitting.SeatId == entity.Id) {
            return (!entity.Orientation || entity.Orientation == "n" || entity.Orientation == "w")
                ? +1
                : -1;
        }
        return Entity.prototype.compare.call(this, entity);
    }

    get statusPoints() {
        return {
            Current: this.Citizenship.StatusPoints,
            Max: Math.pow(10, this.Citizenship.Rank),
        };
    }

    setPoint(p) {
        this.setPos(p.x, p.y);
    }

    setPos(x, y) {
        game.sortedEntities.remove(this);
        this.x = x;
        this.y = y;
        game.sortedEntities.add(this);
    }

    screen() {
        if (this.mount) {
            var x = this.mount.X;
            var y = this.mount.Y;
        } else {
            x = this.X;
            y = this.Y;
        }
        return new Point(x, y).toScreen();
    }

    sync(data, init) {
        Character.copy(this, data);
        if (data.X || data.Y) {
            this.syncPosition(data.X, data.Y);
        }

        if (data.Dst) {
            this.syncDst(data.Dst.X, data.Dst.Y);
        }

        if (data.Messages) {
            this._messages = this._messages.concat(data.Messages);
        }

        if (data.PrivateMessages) {
            this._messages = this._messages.concat(data.PrivateMessages);
        }

        if (data.Waza) {
            game.controller.updateCombo(data.Waza);
        }

        if (this.Type == "margo") {
            this.reloadSprite();
        } else if (!init && JSON.stringify(this.getParts()) != this._parts) {
            this.reloadSprite();
        }

        if ("Dir" in data) {
            this.sprite.position = data.Dir;
        }

        if ("AvailableQuests" in data) {
            this.updateActiveQuest();
        }
        if (data.ChatChannels) {
            game.chat && game.chat.updateChannels(data.ChatChannels);
        }

        if (this.isPlayer) {
            game.controller.updateMail(this.NewMail);
            if (data.Exp) {
                game.controller.xpBar.update(game.player.Exp);
            }

            if ("Z" in data && game.controller.minimap) {
                game.controller.minimap.selectLevel(data.Z);
            }

            if (data.Fullness) {
                game.controller.updateItemInfo();
            }

            if (data.Customization && "customization" in game.panels) {
                new Customization();
            }

            if (data.Style) {
                game.controller.updateAvatar(this);
            }

            if ("Party" in data) {
                this.updateParty(data.Party);
            }

            if (data.ActiveQuests && game.controller.journal) {
                game.controller.journal.update();
            }

            if (data.Equip && game.controller.craft) {
                game.controller.craft.updateSearch();
                game.controller.updateActiveQuest();
            }

            if (data.MapMarkers) {
                game.mapMarkers = data.MapMarkers;
                if (game.controller.minimap) {
                    game.controller.minimap.update();
                }
            }
        }
    }

    avatar() {
        if (!this.IsNpc) {
            return Character.makeAvatar(this.sex(), this.Style && this.Style.Hair);
        }
        const name = (this.Type == "vendor")
              ? Character.vendorSpriteName(this.Name)
              : this.Type;
        return dom.img("assets/" + this.spriteDir() + "avatars/" + name + ".png", "avatar-face");
    }

    updateParty(members) {
        var party = game.controller.party;
        dom.clear(party);
        if (!members) {
            game.controller.avatar.setIcon("");
            return;
        }

        party.avatars = [];
        const leader = members[0];
        if (leader == game.player.Name) {
            game.controller.avatar.setIcon("★");
        }
        members.forEach(function(name, i) {
            if (name == game.playerName) {
                return;
            }
            const member = game.characters.get(name);
            if (member) {
                var avatar = new Avatar(member);
            } else {
                avatar = new Avatar({
                    Name: name,
                    getFullName() {
                        return name;
                    },
                    avatar() {
                        return loader.loadImage("characters/avatars/new.png", true);
                    },
                    chevron() {
                        return null;
                    },
                });
                avatar.element.title = T("Out of sight");
                Character.partyLoadQueue[name] = true;
            }
            // party leader
            if (name == leader) {
                avatar.setIcon("★");
            }
            party.appendChild(avatar.element);
            party.avatars.push(avatar);
        });
    }

    processMessages() {
        if (this._messages.length > 0) {
            this._messages.forEach(message => this.info.push(new Info(message, this)));
            this._messages = [];
        }
    }

    reloadSprite() {
        for (var i in this.sprites) {
            this.sprites[i].ready = false;
        }
        this.loadSprite();
    }

    init(data) {
        this.IsNpc = (data.Type != "player");
        this.IsMob = "Aggressive" in data;

        this.sync(data, true);
        this.loadSprite();
        if (this.isPlayer) {
            this.initSprite(this.sprites.run);
            this.buildSprite(this.sprites.run);
        }
    }

    initSprite(sprite = this.sprite) {
        sprite.speed = 14000;
        sprite.offset = this.Radius;
        sprite.angle = Math.PI/4;

        var spriteInfo = Character.spritesInfo[this.Type];
        if (spriteInfo) {
            ["width", "height", "speed", "angle", "offset", "nameOffset"].forEach(key => {
                if (key in spriteInfo) {
                    sprite[key] = spriteInfo[key];
                }
            });
            const animation = spriteInfo.animations && spriteInfo.animations[sprite.name];
            if (animation) {
                sprite.speed = animation.speed;
            }
        } else {
            sprite.offset = 2 * this.Radius;
            sprite.speed = 7000;
        }
    }

    loadSprite() {
        const sprite = this.sprite;
        if (sprite.loading) {
            return;
        }

        this.initSprite();

        if (this.IsNpc) {
            this.loadNpcSprite();
        } else {
            this.buildSprite(sprite);
        }
    }

    buildSprite(sprite) {
        // emulate loading, because we will load sprite ourselves
        sprite.loading = true;

        var sex = this.sex();
        var animation = sprite.name;
        var dir = Character.spriteDir + sex + "/";
        var parts = this.getParts();
        this._parts = JSON.stringify(parts);

        for (var type in parts) {
            var part = parts[type];
            if (part && part.name) {
                var path = dir + animation + "/" + type + "/" + part.name + ".png";
                parts[type].image = loader.loadImage(path);
            } else {
                delete parts[type];
            }
        }

        if (sprite.name == "attack") {
            parts["weapon"] = {
                name: "sword",
                image: Character.sprites[sex].weapons.sword.image,
            };
        }

        var name = this.Name;
        loader.ready(function() {
            var canvas = dom.canvas();
            var ctx = canvas.ctx;
            var naked = Character.sprites[sex].naked[animation];
            naked = ("hair" in parts || parts.head) ? naked.clean : naked.default;

            canvas.width = naked.image.width;
            canvas.height = naked.image.height;
            ctx.drawImage(naked.image, 0, 0);
            for (var type in parts) {
                var part = parts[type];
                var image = part.image;
                if (image && image.width > 0) {
                    if (part.color && part.opacity) {
                        var worker = new Worker("src/tint.js");
                        var tmpCanvas = util.imageToCanvas(image);
                        var tmpCtx = tmpCanvas.getContext("2d");
                        worker.onmessage = function(e) {
                            tmpCtx.putImageData(e.data, 0, 0);
                            ctx.drawImage(tmpCanvas, 0, 0);
                        };
                        worker.postMessage({
                            imageData: tmpCtx.getImageData(0, 0, image.width, image.height),
                            color: part.color,
                            opacity: part.opacity,
                        });

                        // very slow
                        // image = ImageFilter.tint(image, part.color, part.opacity);
                        // ctx.drawImage(image, 0, 0);
                    } else {
                        ctx.drawImage(image, 0, 0);
                    }
                }
            }

            sprite.image = canvas;
            sprite.framesNum = sprite.image.width / sprite.width;
            sprite.makeOutline();
            sprite.ready = true;
            sprite.loading = false;

            if (name in Character.partyLoadQueue) {
                delete Character.partyLoadQueue.name;
                game.player.updateParty(game.player.Party);
            }
        });
    }

    loadNpcSprite() {
        let name = this.Type;
        switch (name) {
        case "margo":
            name = (this.Owner == game.player.Id) ? "margo-naked" : "margo";
            break;
        case "vendor":
            name = Character.vendorSpriteName(this.Name);
            break;
        default:
            if (this.IsMob) {
                name = this.Type + "/" + this.sprite.name;
            }
        }

        this.sprite.load(this.spriteDir() + name + ".png");
    }

    spriteDir() {
        let dir = Character.spriteDir;
        if (this.IsNpc) {
            dir += (this.IsMob) ? "mobs/" : "npcs/";
            if (this.Type == "vendor") {
                dir += "vendors/";
            }
        }
        return dir;
    }

    getActions() {
        var actions = {};
        switch (this.Type) {
        case "cow":
            actions = {
                Milk() {
                    game.network.send("milk", {Id: this.Id});
                },
            };
            break;
        case "rabbit":
        case "chicken":
        case "bee":
            actions = {
                Catch() {
                    game.network.send("catch-animal", {Id: this.Id});
                },
            };
            break;
        default:
            if (this.Riding) {
                actions = {
                    Mount() {
                        game.network.send("mount", {Id: this.Id});
                    },
                    Dismount() {
                        game.network.send("dismount");
                    },
                };
            }
        }

        var common = {
            Select: () => game.player.setTarget(this),
        };
        if (!this.IsMob && !this.IsNpc) {
            common.Inspect = () => game.player.inspect(this);
        }
        if (this.isInteractive()) {
            common.Interact = this.interact;
        }

        var list = [common, actions];
        if (!this.IsNpc) {
            list = list.concat(game.chat.makeNameActions(this.Name));
        }

        if (game.player.IsAdmin) {
            list.push("---");
            list.push({
                "$cmd"() {
                    game.chat.append("* " + this.Id);
                },
                kill() {
                    if (this.Type == "vendor") {
                        game.chat.send("*remove-vendor " + this.Name);
                    } else {
                        const cmd = (this.IsNpc && !this.IsMob)  ? "remove-npc" : "kill";
                        game.chat.send(`*${cmd} ${this.Id}`);
                    }
                },
                comeToMe() {
                    game.chat.send("*come-to-me " + this.Id);
                },
                summon() {
                    game.chat.send("*summon " + this.Id);
                },
            });
        }

        return list;
    }

    defaultAction(targetOnly) {
        if (this.isInteractive()) {
            this.interact();
            return;
        }

        // call actionButton on space
        if (!targetOnly && this.isPlayer && game.controller.actionButton.active()) {
            game.controller.actionButton.activate();
            return;
        }

        if (this.isPlayer) {
            return;
        }

        var party = game.player.Party;
        if (party && _.includes(party, this.Name)) {
            return;
        }

        if (game.controller.wantShot()) {
            game.player.shot(this.x, this.y);
            return;
        }

        game.player.setTarget(this);
    }

    nameOffset() {
        switch (this.Type) {
        case "player":
            return (this.mount) ? 100 : 90;
        case "horse":
            return (this.rider) ? 130 : 100;
        }
        return this.sprite.nameOffset || this.sprite.height - (this.sprite.offset || 0);
    }

    drawAction() {
        if (this.Action.Duration) {
            const progress = Math.min(this.action.progress, 1);
            if (this.isPlayer) {
                game.controller.actionProgress.value = progress * 100;
            }
            var w = 64;
            var h = FONT_SIZE * 0.5;
            var p = this.screen();
            var x = p.x - w/2;
            var y = p.y - this.nameOffset() + h + 1;
            h -= 2;

            game.ctx.fillStyle = "#333";
            game.ctx.fillRect(x - 1, y - 1, w + 2, h + 2);

            game.ctx.fillStyle = "#99682e";
            game.ctx.fillRect(x, y, w, h);

            game.ctx.fillStyle = "#cf9d62";
            game.ctx.fillRect(x, y, progress * w, h);
        }
    }

    see(character) {
        if (this == character) {
            return true;
        }
        const lenX = character.X - this.X;
        const lenY = character.Y - this.Y;
        return util.distanceLessThan(lenX, lenY, Math.hypot(game.screen.width, game.screen.height));
    }

    setDst(x, y) {
        if (this.Speed <= 0 || this.Disabled) {
            return;
        }
        var leftBorder, rightBorder, topBorder, bottomBorder;
        leftBorder = this.Radius;
        topBorder = this.Radius;
        rightBorder = game.map.full.width - this.Radius;
        bottomBorder = game.map.full.height - this.Radius;

        if (x < leftBorder) {
            x = leftBorder;
        } else if (x > rightBorder) {
            x = rightBorder;
        }

        if (y < topBorder) {
            y = topBorder;
        } else if (y > bottomBorder) {
            y = bottomBorder;
        }

        if (x == this.dst.x && y == this.dst.y) return;

        game.network.send("set-dst", {x, y});
        game.controller.resetAction();
        this.dst.radius = 9;
        this.dst.time = Date.now();
        this.updateDst(x, y);
    }

    updateDst(x, y) {
        this.dst.x = x;
        this.dst.y = y;
        this.velocity.set(x, y).sub(this).normalize();
        this.updateUI();
    }

    getDrawPoint() {
        var p = this.screen();
        var dy = 0;
        if (this.mount) {
            switch (this.mount.Type) {
            case "horse":
                dy = 16;
                break;
            }
        } else if (this.Effects.Sitting) {
            const sit = Entity.get(this.Effects.Sitting.SeatId);
            if (sit) {
                switch (sit.Type) {
                case "bar-stool":
                    dy = 12;
                    break;
                }
            }
        }
        return new Point(
            p.x - this.sprite.width/2,
            p.y - this.sprite.height + this.sprite.offset - dy
        ).round();
    }

    draw(force) {
        if ("Sleeping" in this.Effects || (this.mount && !force)) {
            return;
        }

        this.drawDst();

        if (!this.sprite.ready) {
            return;
        }

        var p = this.getDrawPoint();
        var s = this.screen();
        var up = this.animation.up;
        var down = this.animation.down;

        if (down) {
            var downPoint = new Point(
                s.x - down.width/2,
                p.y + this.sprite.height + this.sprite.offset - down.height
            );
            down.draw(downPoint);
            down.animate();
            if (down.frame == 0) {
                //finished
                this.animation.down = null;
            }
        }

        // drawing character model
        if (this.Invisible) {
            this.sprite.drawAlpha(p, 0.3);
        } else {
            this.sprite.draw(p);
        }

        if (up) {
            var upPoint = new Point(
                s.x - up.width/2,
                p.y + this.sprite.height + this.sprite.offset - up.height
            );
            up.draw(upPoint);
            up.animate();
            if (up.frame == 0) {
                //finished
                this.animation.up = null;
            }
        }

        this.drawEffects();

        if (this != game.controller.world.hovered && this == game.player.target) {
            this.drawHovered(true);
        }

        if (this.burden) {
            this.drawBurden(this.burden);
        }

        if (this.rider) {
            this.rider.draw(true);
        }
    }

    drawBowRadius() {
        var ranged = Entity.get(this.equipSlot("right-hand"));
        if (!ranged || !ranged.Range) {
            ranged = Entity.get(this.equipSlot("left-hand"));
        }
        if (!ranged || !ranged.Range) {
            return;
        }

        // maximum range radius
        game.ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
        game.iso.fillCircle(this.X, this.Y, ranged.Range.Maximum);

        // effective range radius
        game.ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
        game.iso.fillCircle(this.X, this.Y, ranged.Range.Effective);
    }

    drawCorpsePointer() {
        if (!this.Corpse || this.Instance == "sanctuary" || (this.Corpse.X == 0 && this.Corpse.Y == 0)) {
            return;
        }

        var dir = new Point(1, 1);
        var p = new Point(this.mount ? this.mount : this);
        var diff = new Point(this.Corpse).sub(p);
        var angle = Math.atan2(diff.y, diff.x);
        dir.rotate(angle).mul(100);
        p.toScreen().add(dir).round();
        Character.corpse.corpse.draw(p);
        // Character.corpse.arrow.draw(p);
    }

    drawBurden(burden) {
        var point = this.getDrawPoint();
        var sprite = burden.sprite;
        point.x += this.sprite.width/2 - sprite.width/2;
        point.y -= sprite.height / 2;
        burden.sprite.draw(point);
    }

    drawEffects() {
        var p = this.getDrawPoint();
        var sp = this.screen();

        for (var name in this.Effects) {
            name = name.toLowerCase();
            var sprite = Character.sprites.effects[name];
            if (!sprite) {
                continue;
            }
            p.x = sp.x - sprite.width / 2;
            sprite.draw(p);
            sprite.animate(); //TODO: should be animated per character basis;
        }
    }

    drawAura() {
        if (config.ui.showAttackRadius && this.Action.Name == "attack") {
            this.drawAttackRadius();
        }

        if (this.isPlayer && game.controller.modifier.shift && game.controller.modifier.ctrl) {
            this.drawBowRadius();
        }
    }

    drawUI() {
        var marker = this.getQuestMarker();
        if (marker) {
            this.drawMarker(marker, 0.01);
        } else {
            marker = this.getNPCMarker();
            if (marker) {
                this.drawMarker(marker, 0.005);
            }
        }

        if (game.debug.player.box || game.controller.hideStatic) {
            if (!this.mount) {
                this.drawBox();
            }
        }

        // else drawn in controller
        if (this != game.controller.world.hovered && this != game.player.target) {
            this.drawName(undefined, !!marker);
        }

        this.info.forEach(function(info) {
            info.draw();
        });

        if (game.debug.player.position) {
            game.ctx.fillStyle = "#fff";
            var text = "(" + Math.floor(this.X) + " " + Math.floor(this.Y) + ")";
            var x = this.X - game.ctx.measureText(text).width / 2;
            game.drawStrokedText(text, x, this.Y);
        }

        this.drawCorpsePointer();
    }

    drawMarker(marker, intensity) {
        this._marker.opacity += this._marker.delta * intensity;

        if (this._marker.opacity >= 1 || this._marker.opacity < 0.7) {
            this._marker.delta = -this._marker.delta;
        }

        var p = this.screen();
        p.x -= marker.width / 2;
        p.y -= this.nameOffset() + marker.height + FONT_SIZE;

        game.ctx.globalAlpha = this._marker.opacity;
        game.ctx.drawImage(marker, p.x, p.y);
        game.ctx.globalAlpha = 1;
    }

    getNPCMarker() {
        switch (this.Type) {
        case "charles":
        case "diego":
        case "larisa":
        case "margo":
        case "scrooge":
            return game.loader.loadImage("icons/npcs/" + this.Type + ".png");
        case "vendor":
        case "shot":
        case "bruno":
        case "bertran":
        case "cosmas":
            return game.loader.loadImage("icons/npcs/vendor.png");
        }
        return null;
    }

    getQuestMarker() {
        // has owner -> vendor -> no quests
        if (this.Owner) {
            return null;
        }
        // 1. yellow (?) -> has "ready" quest
        // 2. yellow (!) -> has "available" quest
        // 3. gray (?) -> has "active" quest

        var active = false;
        for (var name in game.player.ActiveQuests) {
            var questLog = game.player.ActiveQuests[name];
            var quest = questLog.Quest;
            if (quest.End != this.Type) {
                continue;
            }
            if (questLog.State == "ready") {
                return game.loader.loadImage("icons/quests/ready.png");
            }
            active = active || questLog.State == "active";
        }
        if (this.getAvailableQuests().length > 0) {
            return game.loader.loadImage("icons/quests/available.png");
        }
        if (active) {
            return game.loader.loadImage("icons/quests/active.png");
        }
        return null;
    }

    drawDst() {
        if (this.dst.radius <= 0) {
            return;
        }
        var now = Date.now();
        if (this.dst.time + 33 > now) {
            game.ctx.strokeStyle = "#ff0";
            game.ctx.beginPath();
            var x = this.dst.x;
            var y = this.dst.y;
            game.iso.strokeCircle(x, y, this.dst.radius--);
            this.dst.time = now;
        }
    }

    drawBox() {
        var p = this.screen();
        game.ctx.strokeStyle = "cyan";
        game.iso.strokeRect(this.leftTopX(), this.leftTopY(), this.Width, this.Height);
        game.iso.strokeCircle(this.X, this.Y, this.Radius);
    }

    getFullName() {
        var name = this.Name;
        if (this.Type == "vendor") {
            return name.substring(1);
        }

        if (this.IsNpc) {
            return TS(this.Name);
        }

        if (this.Title) {
            name = TT(this.Title, {name});
        }

        if (this.Fame == 10000) {
            name = T("Lord") + " " + name;
        }
        return name;
    }

    inPvp() {
        var pvpExpires = new Date(this.PvpExpires * 1000);
        return pvpExpires > Date.now();
    }

    drawName(drawHp, drawName) {
        var name = this.getFullName();
        if (this == game.player.target) {
            name = "{" + name + "}";
        }

        if (game.controller.modifier.shift) {
            name += " | " + T("Lvl") + ": " + this.Lvl;
            name += " | " + ["♂", "♀"][this.Sex];
        }

        var p = this.screen();
        var y = p.y - this.nameOffset();
        var dy = FONT_SIZE * 0.5;

        drawHp = this.isInteractive()
            ? false
            : drawHp || ((!this.IsNpc || game.config.ui.npc) && game.config.ui.hp);

        drawName = drawName || ((!this.IsNpc || game.config.ui.npc) && game.config.ui.name);

        if (this.PvpExpires) {
            var pvpExpires = new Date(this.PvpExpires * 1000);
            var diff = pvpExpires - Date.now();
            // blink when less then 3 sec
            if (diff > 0 && (diff > 3e3 || diff % 1000 < 500)) {
                var pdy = Character.pvpFlag.height;
                if (drawHp) {
                    pdy += dy;
                }
                if (drawName) {
                    pdy += dy;
                }

                var pvpPoint = new Point(p.x, y);
                pvpPoint.x -= Character.pvpFlag.width / 2;
                pvpPoint.y -= pdy * 1.25;

                Character.pvpFlag.draw(pvpPoint);
            }
        }

        if (!drawHp && !drawName) {
            return;
        }

        const nameWidth = game.ctx.measureText(name).width;
        var x = p.x - nameWidth / 2;

        if (drawHp) {
            var w = 64;
            game.ctx.fillStyle = "#333";
            game.ctx.fillRect(p.x - w/2 - 1, y - 1, w + 2, dy + 2); //wtf

            //full red rect
            game.ctx.fillStyle = "#883527";
            game.ctx.fillRect(p.x - w/2, y, w, dy); //wtf

            //green hp
            game.ctx.fillStyle = "#2ea237";
            game.ctx.fillRect(p.x - w/2, y, w * this.Hp.Current / this.Hp.Max, dy); //wtf

            if (this.Domestical && game.controller.modifier.shift) {
                game.ctx.fillStyle = "#333";
                game.ctx.fillRect(p.x - w/2 - 1, y + dy - 1, w + 2, dy + 2); //wtf

                game.ctx.fillStyle = "#883527";
                game.ctx.fillRect(p.x - w/2, y + dy, w, dy); //wtf

                game.ctx.fillStyle = "#fea237";
                game.ctx.fillRect(p.x - w/2, y + dy, w * this.Fullness.Current / this.Fullness.Max, dy); //wtf
            }
        } else {
            dy = 0;
        }
        if (drawName) {
            var nameColor = "#e2e9ec";
            if (this.Karma < 0 || this.Aggressive) {
                nameColor = "#e23624";
            } else if (this.isPlayer) {
                nameColor = "#caff8c";
            } else if (this.IsNpc) {
                nameColor = "#ffca8c";
            }

            dy *= 0.75;
            game.ctx.fillStyle = nameColor;
            game.drawStrokedText(name, x, y - dy);
            var flag = this.flag();
            if (flag) {
                flag.draw({x: x - 20, y: y - dy - 14});
            }

            const chevron = this.chevron();
            if (chevron) {
                const img = loader.loadImage(`icons/chevrons/${this.Style.Chevron}.png`);
                if (img.width) {
                    game.ctx.drawImage(img, x + nameWidth + 5, y - dy - 14, 16, 16);
                }
            }
        }
    }

    chevron() {
        return this.Style && this.Style.Chevron;
    }
    flag() {
        if (this.Team) {
            return Character.flags[this.Team];
        }
        if (this.Citizenship) {
            return Character.flags[this.Citizenship.Faction];
        }
        return null;
    }

    idle() {
        return this.velocity.isZero() && this.Action.Name == "";
    }

    sector(angle, x, y) {
        var sectors = 2 * Math.PI/angle;
        var alpha = Math.atan2(-y, x) + Math.PI;
        var sector = ((alpha + angle / 2) / angle) << 0;
        return (sector + sectors / 2) % sectors;
    }

    animate() {
        var animation = "idle";
        var self = (this.mount) ? this.mount : this;
        var position = (this.IsNpc && !this.rider) ? self.Dir : self.sprite.position;
        if (self.sprite.angle == 0) {
            position = 0;
        } else if (self.sprite.angle == Math.PI/2 && position > 4) {
            position = (position / 2) << 0;
        }

        if (self.velocity.x || self.velocity.y) {
            animation = "run";
            var angle = self.sprite.angle;
            var sector = this.sector(angle, self.velocity.x, self.velocity.y);
            var multiple = angle / this.sprite.angle;
            position = (sector + 1) * multiple % (2*Math.PI / angle);
        } else if (this.Effects.Sitting) {
            animation = "sit";
            var seat = Entity.get(this.Effects.Sitting.SeatId);
            if (seat) {
                switch (seat.Orientation) {
                case "w":
                    position = 1;
                    break;
                case "s":
                    position = 3;
                    break;
                case "e":
                    position = 5;
                    break;
                case "n":
                    position = 7;
                    break;
                }
            }
        } else {
            switch (this.Action.Name) {
            case "attack":
                if (self.sprite.angle) {
                    // see this.sector()
                    const angle = Math.PI/4;
                    const alpha = this.AttackAngle + Math.PI;
                    let sector = ((alpha + angle/2) / angle) << 0;
                    position = (1 + sector + 8/2) % 8;
                }
            case "dig":
                animation = this.Action.Name;
                break;
            case "defecate":
            case "":
                animation = "idle";
                break;
            default:
                animation = (this.IsNpc) ? "attack" : "craft";
            }
        }

        if (this.mount) {
            animation = "ride";
        }

        this.sprite = this.sprites[animation];
        this.sprite.position = position;

        if (!this.sprite.ready) {
            this.loadSprite();
            return;
        }

        var now = Date.now();
        var speed = this.Speed || 100;

        var spriteSpeed = this.sprite.speed;
        switch (animation) {
        case "run":
            if (this.Type == "player") {
                spriteSpeed = 6500;
            }
            var biom = game.map.biomAt(this.X, this.Y);
            if (biom) {
                speed *= biom.Speed;
            }
            break;
        case "attack":
            spriteSpeed = this.Action.Duration / this.sprite.framesNum;
            if (!this.IsMob) {
                spriteSpeed *= 2;
            }
            speed = 1;
            break;
        }

        if (now - this.sprite.lastUpdate > spriteSpeed / speed) {
            this.sprite.frame++;
            this.sprite.lastUpdate = now;
        }

        var start = 0, end = this.sprite.image.width / this.sprite.width;

        if (this.sprite.frame < start || this.sprite.frame >= end) {
            this.sprite.frame = start;
        }
    }

    drawAttackRadius(angle = this.AttackAngle) {
        if (this.isPlayer) {
            game.ctx.strokeStyle = "rgba(0, 255, 0, 0.4)";
            game.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        } else if (game.player.Party && game.player.Party.includes(this.Name)) {
            game.ctx.strokeStyle = "rgba(50, 50, 255, 0.4)";
            game.ctx.fillStyle = "rgba(50, 50, 255, 0.3)";
        } else {
            game.ctx.strokeStyle = "rgba(255, 0, 0, 0.4)";
            game.ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        }

        const attackRadius = this.AttackRadius || 1.5 * CELL_SIZE;
        const attackHalfAngle = Math.PI/4;
        if (this.target && this.canHit(this.target, attackRadius, attackHalfAngle)) {
            game.ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
        }
        const start = -angle - attackHalfAngle;
        const end = -angle + attackHalfAngle;
        game.iso.fillSector(this.X, this.Y, attackRadius, start, end);
        game.iso.strokeSector(this.X, this.Y, attackRadius, start, end);
    }

    canHit(target, attackRadius, attackHalfAngle) {
        const point = new Point(this);
        if (point.distanceMoreThen(this.target, attackRadius + this.target.Radius)) {
            return false; // out of radius
        }

        if (point.distanceLessThen(this.target, this.target.Radius)) {
            return true; // inside target's radius
        }

        const attackAngle = new Point(game.controller.world.point).sub(point).angle();
        const distanceAngle = new Point(this.target).sub(this).angle();

        let diff = Math.abs(attackAngle - distanceAngle);
        if (diff > Math.PI) {
            diff = 2*Math.PI - diff;
        }
        if (diff < attackHalfAngle) {
            return true;
        }

        const attackFirstPoint = new Point(
            Math.cos(-attackAngle - attackHalfAngle),
            Math.sin(-attackAngle - attackHalfAngle)
        ).mul(attackRadius).add(game.player);

        if (attackFirstPoint.distanceLessThen(this.target, this.target.Radius)) {
            return true;
        }

        const attackSecondPoint = new Point(
            Math.cos(-attackAngle + attackHalfAngle),
            Math.sin(-attackAngle + attackHalfAngle)
        ).mul(attackRadius).add(this);
        if (attackSecondPoint.distanceLessThen(this.target, this.target.Radius)) {
            return true;
        }

        const firstSection = util.commonSectionCircle(
            this.x,
            this.y,
            attackFirstPoint.x,
            attackFirstPoint.y,
            this.target.x,
            this.target.y,
            this.target.Radius
        );
        if (firstSection) {
            return true;
        }

        return util.commonSectionCircle(
            this.x,
            this.y,
            attackSecondPoint.x,
            attackSecondPoint.y,
            this.target.x,
            this.target.y,
            this.target.Radius
        );
    }

    toggleActionSound() {
        game.sound.stopSound(this.action.name);
        this.action.name = this.Action.Name;

        if (!this.Action.Duration) {
            return;
        }

        if (this.action.name in game.sound.sounds) {
            game.sound.playSound(this.action.name, 0);
        }
    }

    update(k) {
        this.processMessages();
        this.animate();

        this.burden = (this.Burden) ? Entity.get(this.Burden) : null;
        this.plow = ("Plowing" in this.Effects) ? Entity.get(this.Effects.Plowing.Plow) : null;

        if ("Plague" in this.Effects) {
            this.playAnimation({
                up: {
                    name: "plague",
                    width: 64,
                    height: 64,
                    dy: -16,
                    speed: 177,
                },
            });
        }
        if (this.Action) {
            this.updateActionAnimation();
            if (this.Action.Started != this.action.last) {
                this.action.progress = 0;
                this.action.last = this.Action.Started;
                this.toggleActionSound();
                if (this.isPlayer) {
                    game.controller.actionProgress.show();
                    game.controller.actionButton.startProgress();
                }
            }
            if (this.Action.Duration) {
                this.action.progress += (1 / this.Action.Duration * 1000 * k);
            } else {
                if (this.isPlayer) {
                    game.controller.actionProgress.hide();
                    game.controller.actionButton.stopProgress();
                }
                this.action.progress = 0;
            }
        }
        if (this.Mount) {
            if (!this.mount) {
                this.mount = Entity.get(this.Mount);
                if (this.mount) {
                    this.mount.rider = this;
                }
            }
        } else {
            if (this.mount) {
                this.mount.rider = null;
                this.mount = null;
            }
        }
        this.updatePosition(k);

        if (this.isPlayer) {
            // clear target if one is disappeared
            if (this.target && !game.entities.has(this.target.Id)) {
                this.setTarget(null);
            }

            this.updateBuilding();
            this.updateActionButton();
        }

        this.info = this.info.filter(function(info) {
            return info.update(k);
        });

        if (this.ballon) {
            this.ballon.update();
        }
    }

    updateBuilding() {
        if (!config.graphics.autoHideWalls) {
            return;
        }
        var n = false, w = false, s = false, e = false;
        var x = this.X;
        var y = this.Y;

        game.entities.forEach(function(b) {
            if (b.Group == "wall" || b.Group == "gate") {
                n = n || (b.Y < y && Math.abs(b.X - x) < b.Width);
                w = w || (b.X < x && Math.abs(b.Y - y) < b.Height);
                s = s || (b.Y > y && Math.abs(b.X - x) < b.Width);
                e = e || (b.X > x && Math.abs(b.Y - y) < b.Height);
            }
        });

        this.inBuilding = (n && w && s && e);
    }

    equipSlot(name) {
        return this.Equip[Character.equipSlots.indexOf(name)];
    }

    updateActionButton() {
        var button = game.controller.actionButton;
        if (this.burden) {
            button.setAction("drop", () => this.liftStop());
            return;
        }
        var left = Entity.get(this.equipSlot("left-hand"));
        var right = Entity.get(this.equipSlot("right-hand"));
        if (is(rangedWeaponp)) {
            button.setAction("shot", () => this.shot());
            return;
        }

        var fishingRod = is(fishingRodp);
        if (fishingRod) {
            button.setAction("fish", () => setCursor("fish", fishingRod, this.fish.bind(this)));
            return;
        }

        var targetable = is(targetablep);
        if (targetable) {
            button.setAction(targetable.Group, () => {
                game.controller.cursor.set(targetable, game.controller.mouse.x, game.controller.mouse.y);
            });
            return;
        }

        var [action, cmd, entity] = getAction(right) || getAction(left) || [];
        if (button.action == action) {
            return;
        }

        if (action) {
            button.setAction(action, makeHandler(cmd, entity));
        } else {
            button.reset();
        }

        function is(predicate) {
            if (right && predicate(right)) {
                return right;
            }

            if (left && predicate(left)) {
                return left;
            }

            return null;
        }

        function rangedWeaponp(entity) {
            return "Range" in entity;
        }

        function fishingRodp(entity) {
            return entity.Group == "fishing-rod";
        }

        function targetablep(entity) {
            return _.includes(["dildo", "snowball", "shit"], entity.Group);
        }

        function getAction(entity) {
            if (!entity) {
                return null;
            }
            var action = {
                "taming": ["lasso", "tame"],
                "biom-converter": ["tool", "use-tool"],
                "shovel": ["shovel", "dig"],
                "pickaxe": ["pickaxe", "dig"],
            }[entity.Group];
            return action && action.concat(entity);
        }

        function makeHandler(action, entity) {
            return () => setCursor(action, entity);
        }

        function setCursor(action, entity, callback) {
            var cursor = new Entity(entity.Type);
            cursor.initSprite();
            var icon = entity._icon || entity.icon();
            cursor.Width = CELL_SIZE;
            cursor.Height = CELL_SIZE;
            cursor.Sprite.Dx = 6;
            cursor.Sprite.Dy = 56;
            cursor.sprite.image = icon;
            cursor.sprite.width = icon.width;
            cursor.sprite.height = icon.height;
            game.controller.creatingCursor(cursor, action, callback);
        }
    }

    fish(data) {
        var panel = game.panels["fishing"];
        if (!panel) {
            var rating = dom.div("rating");
            var buttons = dom.div("#fishing-buttons");

            dom.append(buttons, makeButtons(["<", "<<", "<<<"], 3));
            dom.append(buttons, makeButtons([">", ">>", ">>>"], 0));

            var playerValue = dom.span("?", "value");
            var playerMeter = dom.tag("meter");
            playerMeter.max = 300;
            playerMeter.style.width = "100%";
            playerMeter.title = T("Player");

            var fishValue = dom.span("?", "value");
            var fishMeter = dom.tag("meter");
            fishMeter.max = 300;
            fishMeter.style.width = "100%";
            fishMeter.title = T("Fish");

            panel = new Panel("fishing", "Fishing", [
                rating,
                dom.img("assets/icons/fishing/fish.png"),
                fishMeter,
                fishValue,
                dom.img("assets/icons/fishing/player.png"),
                playerMeter,
                playerValue,
                dom.hr(),
                buttons,
            ]);
            panel.player = playerMeter;
            panel.fish = fishMeter;
            panel.rating = rating;
            panel.fishValue = fishValue;
            panel.playerValue = playerValue;
        }
        if ("Rating" in data) {
            panel.rating.textContent = T(data.Rating);
            panel.player.value = +data.Player || 0;
            panel.fish.value = +data.Fish || 0;
            panel.playerValue.textContent = +data.Player || 0;
            panel.fishValue.textContent = +data.Fish || 0;
        }
        if (data.Ok == "fishing-finished") {
            dom.forEach("#fishing-buttons button", function() {
                this.disabled = true;
            });
            panel.hide();
            return null;
        }
        dom.forEach("#fishing-buttons button", function() {
            this.disabled = false;
        });
        panel.show();
        return (data) => this.fish(data);

        function makeButtons(actions, offset) {
            return dom.wrap("button-group", actions.map(function(action, index) {
                var button = dom.button(T(action), "", function() {
                    game.network.send("fishing-move", {move: offset + this.move});
                    dom.forEach("#fishing-buttons button", function() {
                        this.disabled = true;
                    });
                });

                button.move = index;
                button.disabled = true;
                return button;
            }));
        }
    }

    findMovePosition(k = 16/1000) {
        var delta = this.Speed * k;
        var biom = game.map.biomAt(this.X, this.Y);
        if (biom && biom.Speed != 0) {
            // Client is ahead of server so we can get into blocked tile here but not on server.
            delta *= biom.Speed;
        }

        var p = new Point(this);
        var dst = new Point(this.dst.x, this.dst.y);
        var distToDst = p.distanceTo(dst);
        if (distToDst < delta) {
            return dst;
        }

        const v = this.velocity.clone().mul(delta);
        return p.add(v);
    }

    canCollideNow() {
        return true;
    }

    updatePosition(k) {
        if (this.mount) {
            return;
        }

        if (this.X == this.dst.x && this.Y == this.dst.y) {
            return;
        }

        let p = this.findMovePosition(k);
        if (p.x == this.dst.x && p.y == this.dst.y) {
            this.setPos(p.x, p.y);
            this.stop();
        } else {
            this.setPos(p.x, p.y);
        }

        this.updatePlow();
    }

    updateUI() {
        if (game.controller.ready && (this.isPlayer || (this.rider && this.rider.isPlayer))) {
            game.controller.updateVisibility();
            game.controller.minimap.update();
        }
    }

    willCollide(point, gap = 0) {
        let bbox = BBox.centeredAtPoint(point, 2*(this.Radius + gap), 2*(this.Radius + gap));
        return game.quadtree.find(bbox, (object) => {
            if (object == this || !object.canCollideNow()) {
                return false;
            }
            if (object.Width && object.Height) {
                return true;
            }
            const radius = object.Radius + this.Radius + gap;
            return util.distanceLessThan(point.x - object.X, point.y - object.Y, radius);
        });
    }

    updatePlow() {
        if (!this.plow) {
            return;
        }
        var p = new Point(this);
        var sector = this.sprite.position - 1;
        // y = 1 used to fix rendering order
        var offset = new Point(this.plow.Radius, 1).rotate(2*Math.PI - sector * Math.PI/4);
        p.add(offset);
        this.plow.setPoint(p);
        this.plow.sprite.position = this.sprite.position;

        if (this.velocity.x || this.velocity.y) {
            this.plow.sprite.animate();
        }
    }

    pickUp() {
        const list = game
              .findItemsNear(this.X, this.Y)
              .filter(e => e.MoveType == Entity.MT_PORTABLE)
              .sort((a, b) => a.distanceTo(this) - b.distanceTo(this));

        if (list.length > 0) {
            list[0].pickUp();
        }
    }

    harvest(dontStop = false, type = null) {
        const plant = game
              .findItemsNear(this.X, this.Y, 4 * CELL_SIZE)
              .filter(entity => {
                  if (entity.State != "adult") {
                      return false;
                  }
                  return (type) ? entity.is(type) : entity.Actions.includes("Harvest");
              })
              .sort((a, b) => a.distanceTo(this) - b.distanceTo(this))[0];

        plant && game.network.send("Harvest", {Id: plant.Id}, ({Ok}) => {
            // skip confirm (Ok == 1)
            if (Ok == 2 && dontStop) {
                game.player.harvest(true, plant.Type);
            }
        });
    }

    liftStart() {
        const list = game
              .findItemsNear(this.X, this.Y)
              .filter(e => e.MoveType == Entity.MT_LIFTABLE)
              .sort((a, b) => a.distanceTo(this) - b.distanceTo(this));

        if (list.length > 0) {
            list[0].lift();
        }
    }

    liftStop() {
        if (this.burden) {
            game.controller.clonedCreatingCursor(this.burden, "lift-stop");
            game.controller.lastAction.set(null);
        }
    }

    stop() {
        this.Dst.X = this.dst.x = this.X;
        this.Dst.Y = this.dst.y = this.Y;
        this.velocity.set(0, 0);
        this.updateUI();
    }

    isNear(entity) {
        const target = this.mount || this;
        const padding = target.Radius * 2 + target.correction;

        if (entity.belongsTo(this)) {
            return true;
        }
        if (entity.Width) {
            return util.rectIntersects(
                entity.leftTopX() - padding,
                entity.leftTopY() - padding,
                entity.Width + padding * 2,
                entity.Height + padding * 2,
                target.leftTopX(),
                target.leftTopY(),
                target.Width,
                target.Height
            );
        }
        return util.distanceLessThan(
            entity.X - target.X,
            entity.Y - target.Y,
            padding + Math.max(entity.Radius, Math.min(entity.Width, entity.Height) / 2) + 2
        );
    }

    drawHovered(nameOnly) {
        if (this.Invisible) {
            return;
        }

        if (!nameOnly) {
            this.sprite.drawOutline(this.getDrawPoint());
        }

        if (this == game.player.target) {
            game.setFontSize(17);
        }

        this.drawName(true, true);

        if (this == game.player.target) {
            game.setFontSize(0);
        }
    }

    canIntersect() {
        return this.sprite.outline != null && (config.ui.allowSelfSelection || this != game.player);
    }

    bag() {
        return Entity.get(this.Equip[0]);
    }

    findItems(kinds) {
        var found = {};
        var self = this;

        kinds.forEach(function(kind) {
            found[kind] = [];
        });

        var entities = [
            this.equipSlot("right-hand"),
            this.equipSlot("left-hand"),
        ].map(Entity.get).map(search);

        game.controller.iterateContainers(function(slot) {
            kinds.forEach(function(kind) {
                if (slot.entity && slot.entity.is(kind)) {
                    found[kind].push(slot.entity);
                }
            });
        });

        function search(entity) {
            if (!entity) {
                return;
            }

            var items = (entity.Props.Slots) ? entity.Props.Slots.map(Entity.get) : [entity];
            items.forEach(function(entity) {
                entity && kinds.forEach(function(kind) {
                    if (entity.is(kind)) {
                        found[kind].push(entity);
                    }
                });
            });
        }

        return found;
    }

    equippedWith(group) {
        return this.Equip
            .filter(Number)
            .map(Entity.get)
            .some(item => item.Group == group);
    }

    icon() {
        if (!this._icon) {
            this._icon = this.sprite.icon();
        }
        return this._icon;
    }

    getParts() {
        if (this.IsNpc) {
            return {};
        }
        var parts = {
            legs: null,
            feet: null,
            body: null,
            hair: null,
            head: null,
        };
        var hideHelmet = this.Style && this.Style.HideHelmet;
        Character.clothes.forEach((type, i) => {
            parts[type] = {
                name: (type == "head" && hideHelmet) ? "" : this.Clothes[i],
            };
        });

        if (!parts.head.name && this.Style && this.Style.Hair) {
            var hairStyle = this.Style.Hair.split("#");
            parts.hair = {
                name: hairStyle[0],
                color: hairStyle[1],
                opacity: hairStyle[2],
            };
        }
        return parts;
    }

    interact() {
        game.player.setTarget(this);
        game.network.send("follow", {Id: this.Id}, () => {
            if (this.Type == "vendor") {
                game.controller.vendor.open(this);
                return;
            }

            var quests = this.getQuests();
            if (quests.length > 0 && this.Type == "plato") {
                new Quest(quests[0], this).showPanel();
                return;
            }

            var talks = this.getTalks();
            if (talks.talks.length == 0) {
                Character.npcActions.Quest.call(this);
            } else {
                Character.npcActions.Talk.call(this);
            }
        });
    }

    getTalks() {
        return Talks.get(
            this.Type,
            game.player.Citizenship.Faction.toLowerCase(),
            game.player.sex()
        );
    }

    sex() {
        return Character.sex(this.Sex);
    }

    isInteractive() {
        if (this.Type == "vendor") {
            return true;
        }
        if (this.getQuests().length > 0) {
            return true;
        }
        if (this.Type.toLowerCase() in Talks.npcs) {
            return true;
        }
        return false;
    }

    use(entity, callback) {
        switch (entity.Group) {
        case "shit":
        case "snowball":
            game.network.send("throw", {Id: this.Id, Item: entity.Id});
            return true;
        case "dildo":
            game.network.send("fuck", {Id: this.Id});
            return true;
        case "spell-scroll":
            game.network.send("cast", {Id: entity.Id, Target: this.Id}, callback);
            return true;
        }
        return false;
    }

    canUse(entity) {
        if (entity instanceof Character) {
            return this.Z == entity.Z && this.distanceTo(entity) < 2*CELL_SIZE + this.correction;
        }

        switch (entity.Group) {
        case "shit":
        case "dildo":
        case "snowball":
        case "spell-scroll":
            return true;
        }

        switch (entity.Location) {
        case Entity.LOCATION_IN_CONTAINER:
            var cnt = entity.findRootContainer();
            return cnt && this.canUse(cnt);
        case Entity.LOCATION_EQUIPPED:
            return this.Id == entity.Owner;
        default:
            return this.isNear(entity);
        }
    }

    updateActionAnimation() {
        switch (this.Action.Name) {
        case "cast":
            this.playAnimation({
                down: {
                    name: "cast",
                    width: 100,
                    height: 60,
                    dy: -18,
                },
            });
            break;
        }
    }

    // available anims: {up: {...}, down: {...}}
    playAnimation(anims) {
        for (var type in anims) {
            if (this.animation[type] == null) {
                this.loadAnimation(type, anims[type]);
            }
        }
    }

    loadAnimation(type, anim) {
        var sprt = new Sprite(
            "animations/" + anim.name + "-" + type + ".png",
            anim.width,
            anim.height,
            (anim.speed || 80)
        );
        if (anim.dy) {
            sprt.dy = anim.dy;
        }

        loader.ready(() => {
            this.animation[type] = sprt;
        });
    }

    distanceTo(e) {
        return (this.mount)
            ? Math.hypot(this.mount.X - e.X, this.mount.Y - e.Y)
            : Math.hypot(this.X - e.X, this.Y - e.Y);
    }

    selectNextTarget(p = new Point(this), ignore = this.target, anchor = p) {
        var party = this.Party || [];
        var list = game
            .findCharsNear(p.x, p.y, 5 * CELL_SIZE)
            .filter(c => {
                if (c == this || c == ignore || c == this.mount) {
                    return false;
                }
                if (c.Team && c.Team == this.Team) {
                    return false;
                }
                if (c.IsNpc && !c.IsMob) {
                    return false;
                }
                return party.indexOf(c.Name) == -1;
            })
            .sort((a, b) => new Point(a).distanceTo(anchor) - new Point(b).distanceTo(anchor));

        if (list.length > 0) {
            this.setTarget(list[0]);
        }
    }

    setTarget(target) {
        this.target = target;
        var cnt = game.controller.targetContainer;
        if (!target) {
            cnt.dataset.targetId = null;
            dom.hide(cnt);
            return;
        }

        if (cnt.dataset.targetId == target.Id) {
            return;
        }

        cnt.dataset.targetId = target.Id;
        cnt.avatar = new Avatar(target);
        dom.setContents(cnt, cnt.avatar.element);
        dom.show(cnt);
    }

    inspect(target) {
        game.network.send("inspect", {Id: target.Id}, function(data) {
            if (!data.Equip) {
                return;
            }
            // TODO: merge with stats.js
            const slots = data.Equip.reduce(function(slots, item, i) {
                var name = Character.equipSlots[i];
                var slot = new ContainerSlot({panel: panel, entity: {}, inspect: true}, i);
                if (item) {
                    var entity = new Entity(item.Type);
                    entity.sync(item);
                    slot.set(entity);
                }
                slot.setPlaceholder(`assets/icons/equip/${name}.png`, TS(name));
                slots[name] = slot.element;
                return slots;
            }, {});

            target.Equip = data.Equip;
            var panel = new Panel(
                "inspect",
                target.Name,
                dom.wrap("equip-and-lvl", dom.wrap("equip", [
                    dom.wrap("level", [
                        dom.make("small", T("Level")),
                        dom.wrap("circle", target.Lvl),
                    ]),
                    slots["head"],
                    dom.wrap("faction", [
                        dom.make("small", T("Rank")),
                        dom.wrap("square", target.Citizenship.Rank || "?"),
                    ]),
                    slots["bag"],
                    slots["body"],
                    slots["neck"],
                    slots["left-hand"],
                    slots["legs"],
                    slots["right-hand"],
                    dom.div(),
                    slots["feet"],
                    dom.div(),
                ].map(elem => {
                    elem.classList.add("equip-cell");
                    return elem;
                })))
            );
            panel.element.classList.add("stats-panel");
            panel.temporary = true;
            panel.show();
        });
    }

    getAvailableQuests() {
        return game.player.AvailableQuests[this.Type] || [];
    }
    getQuests() {
        var quests = this.getAvailableQuests();
        for (var id in game.player.ActiveQuests) {
            var quest = game.player.ActiveQuests[id].Quest;
            if (quest.End == this.Type) quests.push(quest);
        }
        return quests;
    }

    updateActiveQuest() {
        const panel = game.panels.quest;
        panel && panel.setContents(panel.quest.getContents());
    }

    onremove() {
        game.sound.stopSound(this.action.name);
    }

    shot(x = 0, y = 0) {
        if (this.target instanceof Character) {
            game.network.send("waza", {Name: "Shot", Id: this.target.Id, X: x, Y: y});
        } else {
            game.controller.showWarning("Select target");
        }
    }

    onclick(x, y) {
        if (game.controller.wantShot()) {
            this.shot(x, y);
        } else {
            this.setDst(x, y);
        }
    }

    armored() {
        const armoredMob = [
            "training-dummy",
            "kitty-pahan",
            "rogalian",
            "hell-rogalian",
            "ufo",
            "red-chopper",
            "blue-chopper",
        ].includes(this.Type);
        if (armoredMob) {
            return true;
        }
        const armor = this.Clothes[2]; // see getParts()
        return ["iron", "steel", "titanium", "meteorite", "bloody"].includes(armor);
    }

    synodProtection() {
        if (this.Karma < 0 || this.inPvp()) {
            return false;
        }
        return (this.Z == 0) || (this.Z == 3 && this.X < 2804 && this.Y < 3341);
    }

    bbox() {
        return new BBox(
            this.X - this.Width/2,
            this.Y - this.Height/2,
            this.Width,
            this.Height
        );
    }
}

Character.prototype.intersects = Entity.prototype.intersects;
