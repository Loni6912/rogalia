/* global T, Panel, dom, ContainerSlot, game, playerStorage, Container */

"use strict";

class QuickBar {
    constructor(modifier) {
        this.modifier = modifier;
        const size = 5;
        this.types = new Array(size);
        this.slots = _.range(size).map(i => {
            const slot = new ContainerSlot({
                panel: this.panel,
                entity: {},
                dwim() {
                    slot.clear();
                },
                getTopExcept: () => null,
            }, i);
            slot.element.check = () => true;
            slot.element.use = (entity) => {
                this.setSlot(i, entity);
                const from = Container.getEntitySlot(entity);
                from && from.unlock();
                return true;
            };
            return slot;
        });
        this.panel = new Panel(
            `quickbar-${this.modifier}`,
            "",
            dom.wrap("slots-wrapper", this.slots.map(slot => slot.element))
        ).hideTitle().hideCloseButton();
        this.load();
    }

    hotkey(key) {
        const index = key - 1;
        const slot = this.slots[index];
        if (slot.locked) {
            return;
        }
        const entity = this.findEntity(index);

        if (!entity) {
            slot.clear();
            return;
        }

        if (entity.canBeEquipped()) {
            entity.equip();
            return;
        }

        if (entity.Actions.includes("cast")) {
            entity.cast(() => {
                this.updateSlot(index, entity.Type);
                slot.lock();
                setTimeout(()=> slot.unlock(), entity.Cooldown || 5000);
            });
            return;
        }

        const action = ["Eat", "Consume", "Inject"].find(action => entity.Actions.includes(action));
        if (action) {
            slot.lock();
            game.network.send(action, {Id: entity.Id}, () => {
                slot.unlock();
                this.updateSlot(index, entity.Type);
            });
        }
    }

    findEntity(index) {
        const {entity} = this.slots[index];
        if (entity) {
            return entity;
        }
        const type = this.types[index];
        const items = game.player.findItems([type])[type];
        return _.first(items);
    }

    setSlot(index, entity) {
        this.types[index] = entity.Type;
        const slot = this.slots[index];
        slot.set(entity);
        const hotkey = index + 1;
        slot.setSup(`${this.modifier}+${hotkey}`);
    }

    clearSlot(index) {
        this.slots[index].clear();
    }

    updateSlot(index, type) {
        const items = game.player.findItems([type])[type];
        if (items.length == 0) {
            this.clearSlot(index);
        } else {
            this.setSlot(index, items[0]);
        }
    }

    load() {
        const ids = playerStorage.getItem(`quickbar.${this.modifier}`);
        if (!ids || ids.length != this.slots.length)  {
            return;
        }
        ids.map(Entity.get).forEach((entity, i) => {
            if (entity) {
                this.setSlot(i, entity);
            }
        });
    }

    save() {
        playerStorage.setItem(`quickbar.${this.modifier}`, this.slots.map(slot => slot.entity && slot.entity.Id));
    }

}
