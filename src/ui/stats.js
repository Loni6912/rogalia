/* global game, dom, sprintf, Panel, T, config, Image, util, Statistics, Ratings, Customization, ContainerEquip, ParamBar, Character, TS */

"use strict";
class Stats {
    constructor() {
        this.equipContainer = new ContainerEquip();
        this.fields = new Set(["Lvl", "Health", "Attr", "Citizenship"]);
        this.panel = this.makePanel(game.player);
    }

    makePanel(player) {
        return new Panel(
            "stats",
            "Characteristics",
            this.makeContents(player)
        );
    }

    makeContents(player) {
        return [
            dom.wrap("stats-name", player.getFullName()),
            dom.hr(),
            dom.wrap("equip-and-params", [
                dom.wrap("equip-and-lvl", [
                    this.makeFaction(player),
                    this.makeEquipAndLvl(player, this.equipContainer),
                ]),
                this.makeParams(player),
            ]),
            dom.hr(),
            this.makeVitaminsAndAttrs(player),
            dom.hr(),
            dom.wrap("", [
                this.makeCustomization(),
                dom.button(T("Statistics"), "",  () => { new Statistics(); }),
                dom.button(T("Ratings"), "", () => { new Ratings(); }),
            ]),
        ];
    }

    makeCustomization() {
        const customization = dom.make("button", [
            dom.img("assets/icons/customization.png"),
            T("Customization"),
        ]);
        customization.onclick = () => { new Customization(); };
        return customization;
    }

    makeEquipAndLvl(player, equipContainer) {
        equipContainer.update();
        const slots = equipContainer.slots.reduce(function(slots, slot, i) {
            var name = Character.equipSlots[i];
            slot.setPlaceholder(`assets/icons/equip/${name}.png`, TS(name));
            slots[name] = slot.element;
            return slots;
        }, {});

        return dom.wrap("equip", [
            dom.wrap("level", [
                dom.make("small", T("Level")),
                dom.wrap("circle", player.Lvl),
            ]),
            slots["head"],
            dom.wrap("faction", [
                dom.make("small", T("Rank")),
                dom.wrap("square", player.Citizenship.Rank || "?"),
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
        }));
    }

    makeParams(player) {
        const param = (name) => {
            this.fields.add(name);
            return new ParamBar(name, player[name]).element;
        };

        const value = (name, label = name) => {
            this.fields.add(name);
            return ParamBar.makeValue(label, player[name]);
        };

        return dom.wrap("stats-params", [
            param("Hp"),
            param("Fullness"),
            param("Stamina"),
            value("Karma"),
            dom.hr(),
            param("Exp"),
            value("LP"),
            value("statusPoints", "Status points"),
            value("Addiction"),
            dom.hr(),
            this.makeDamage(player),
            value("Armor"),
            value("Defence"),
            value("Accuracy"),
            value("Speed"),
        ]);
    }

    makeDamage(player) {
        return ParamBar.makeValue("Damage", this.calcDamage(player));
    }

    calcDamage(player) {
        const left = Entity.get(player.equipSlot("left-hand"));
        const right = Entity.get(player.equipSlot("right-hand"));

        const str = player.Attr.Strength.Current;
        const dex = player.Attr.Dexterity.Current;;
        if (!left && !right) {
            return str * (dex/42+1)/12 + 12;
        }

        const ranged = detectRanged(left, right);
        if (ranged) {
            return ranged.damage();
        }

        const [main, secondary] = detectMelee(left, right).map(weapon => weapon.damage());
        const lvl = player.Lvl;
        const joy = player.Effects.MushroomJoy;
        const mushroom = (joy) ? joy.BonusDamage : 1;
        const alcohol = (player.Effects.Drunk) ? 1.07 : 1;

        return (main + secondary*0.2)*(2 - (str-100))*(1+(0.2 * lvl/100))*mushroom/alcohol;

        function detectMelee(left, right) {
            const empty = {damage: () => 0};
            if (left && left.Range) {
                left = null;
            }
            if (right && right.Range) {
                right = null;
            }
            if (left && !right) {
                return [left, empty];
            }
            if (!left && right) {
                return [right, empty];
            }
            if (left.Damage > right.Damage){
                return [left, right];
            }
            return [right, left];
        }

        function detectRanged(left, right) {
            if (!right && left && left.Range) {
                return left;
            }
            if (!left && right && right.Range) {
                return right;
            }
            return null;
        }
    }



    makeVitaminsAndAttrs(player) {
        return dom.wrap("vitamins-and-attrs", [
            this.makeVitamins(player),
            this.makeAttrs(player),
        ]);
    }

    makeVitamins(player) {
        return dom.wrap("vitamins", Character.vitamins.map(function(vitamin) {
            const value = util.toFixed(player.Health[vitamin], 2);
            return dom.wrap(`param vitamin-${vitamin.toLowerCase()}`, [
                T(vitamin),
                dom.wrap("value" + ((value == 0) ? " zero" : ""), [
                    value,
                    dom.wrap("arrow",  "→"),
                ]),
            ]);
        }));
    }

    makeAttrs(player) {
        return dom.wrap("attributes", Character.attrs.map(function(attr)  {
            return new ParamBar(
                attr.toLowerCase(),
                {
                    Current: player.Attr[attr].Current,
                    Max: 100,
                },
                2
            ).element;
        }));
    }

    sync(data) {
        if (!this.panel)
            return;
        if (!this.panel.visible) {
            this.panel.hooks.show = () => this.update();
            return;
        }
        for (const field of this.fields) {
            if (field in data) {
                this.update();
                return;
            }
        }
        this.equipContainer.update();
    }

    update() {
        this.panel.setContents(this.makeContents(game.player));
    }

    makeFaction(player) {
        const faction = player.Citizenship.Faction || T("No faction");
        return dom.wrap("stats-faction", T(faction));
    }

    makeLvl(player) {
        return dom.wrap("stats-lvl", T("Level") + ": " + player.Lvl);
    }
}
