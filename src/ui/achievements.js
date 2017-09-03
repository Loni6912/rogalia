/* global Image, TS, dom, game, ParamBar, T */

"use strict";

class Achievements {
    static loadInto(container) {
        game.network.send("get-achievements", {}, ({Achievements: achievements}) => {
            dom.setContents(container, Achievements.makeContents(achievements, () => {
                Achievements.loadInto(container);
            }));
        });
    }

    static makeContents(achievements, update) {
        let unlocked = 0;
        const list = achievements
              .sort((a, b) => b.Unlocked - a.Unlocked)
              .map(({Name, Unlocked, Progress, Required}) => {
                  if (Unlocked) {
                      unlocked++;
                  }
                  const img = dom.img(
                      `assets/achievements/${(Unlocked) ? Name : Name + "-locked"}.jpg`,
                      "achievement-icon"
                  );
                  const {name, desc} = Achievements.descriptions[Name];
                  return dom.wrap("achievement" + ((Unlocked) ? " achievement-unlocked" : ""), [
                      img,
                      dom.wrap("achievement-info", [
                          dom.wrap("achievement-name", name),
                          dom.wrap("achievement-desc", desc),
                          (Unlocked)
                              ? dom.wrap("achievement-unlocked-time", Achievements.formatTimestamp(Unlocked))
                              : new ParamBar("", {Current: Progress, Max: Required}).element,

                      ]),
                  ]);
              });
        return dom.wrap("achievements-container", [
            dom.wrap("achievements-header", [
                new ParamBar("Total", {Current: unlocked, Max: achievements.length}).element,
                dom.button(T("Update"), "", update),
            ]),
            dom.hr(),
            dom.scrollable("achievements", dom.wrap("achievement-list", list)),
        ]);
    }

    static formatTimestamp(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString();
    }

    static showUnlockAlert(name) {
        const img = new Image();
        const {name: title, desc} = Achievements.descriptions[name];
        const container = dom.wrap("achievement-alert achievement achievement-unlocked", [
            img,
            dom.wrap("achievement-info", [
                dom.wrap("achievement-name", title),
                dom.wrap("achievement-desc", desc),
            ]),
        ], {
            onclick: () => {
                game.controller.journal.panel.show();
                game.controller.journal.tabs[1].activate();
            }
        });
        img.onload = () => {
            dom.insert(container, document.getElementById("achievement-alerts"));
            setTimeout(() => dom.fadeOut(container), 5000);
        };
        img.onerror = (err) => {
            console.error(`Cannot load achievement ${name}`, err);
        };
        img.src = `assets/achievements/${name}.jpg`;
    }
}
