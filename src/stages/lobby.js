/* global game, util, Panel, dom, loader, Character, Stage, gameStorage, T */

"use strict";
function lobbyStage(data) {
    if (data) {
        game.setLogin(data.Email || data.Login);
        document.getElementById("version").textContent =  data.Version;
        lobbyStage.metadataVersion = data.MetadataVersion;
    }

    // loadNews();

    var characters = (data && data.Characters) || lobbyStage.characters || [];
    var maxChars = 4;
    // we need to save it because we may return to this stage after
    // createCharacter stage (back button)
    lobbyStage.characters = characters;

    var avatars = dom.div("avatars");

    function avatarContainer({name, karma, deleted, avatar}) {
        var nameElem = dom.wrap("avatar-name", (name == "+") ? T("Create") : name);
        if (karma < 0) {
            nameElem.className += " avatar-pk";
        }

        return dom.wrap(
            dom.className("avatar-container", "avatar-non-player", deleted && "avatar-deleted"),
            [
                dom.wrap("avatar", avatar),
                nameElem,
                !deleted && dom.wrap("delete", "×", {
                    onclick: (event) => { event.stopPropagation(); del(name); },
                }),
            ],
            {
                onclick: () => {
                    if (deleted) {
                        game.popup.confirm(T("Deletion will be canceled"), enter);
                    } else {
                        enter();
                    }
                },
                title: (deleted)
                    ? T("Will be deleted") + ": " + new Date(deleted * 1000).toLocaleString()
                    : "",
            }
        );

        function enter() {
            game.playerName = name;
            game.setStage("loading", lobbyStage.metadataVersion);
        }
    }


    function del(name) {
        game.popup.confirm(T("Delete character (will take 3 days)?"), () => {
            game.network.send("delete-character", {name}, (data) => game.setStage("lobby", data));
        });
    }

    dom.append(avatars, characters.map(info => avatarContainer({
        name:  info.Name,
        karma: info.Karma,
        deleted: info.Deleted,
        avatar: Character.makeAvatar(Character.sex(info.Sex), info.Hairstyle),
    })));

    for (var i = maxChars - characters.length; i > 0; i--) {
        dom.append(avatars, createContainer());
    };

    function createContainer() {
        var create = loader.loadImage("characters/avatars/new.png", true);
        create.className = "create";

        return dom.wrap("avatar-container", [
            dom.wrap("avatar", create),
            dom.wrap("avatar-name", T("Create"))
        ], {onclick: () => game.setStage("createCharacter")});
    }

    var contents = [
        dom.wrap("lobby-account",  game.getLogin()),
        avatars,
    ];

    if (!game.inVK()) {
        contents.push(dom.button(T("Back"), "", function() {
            lobbyStage.characters = [];
            game.clearServerInfo();
            game.network.disconnect();
            game.setStage("selectServer");
        }));
    }

    var panel = new Panel("lobby", "", contents).hideCloseButton().show().center(0.5, 0.05);

    function fastenter(e) {
        if (e.keyCode != 13) // enter
            return;
        var avatars = document.getElementsByClassName("avatar");
        if (avatars.length > 0)
            avatars[0].click();
    }

    window.addEventListener("keypress", fastenter);

    this.end = function() {
        window.removeEventListener("keypress", fastenter);
        panel.close();
    };

    function loadNews() {
        util.ajax("news/" + game.lang + ".html", function(html) {
            if (!html) {
                return;
            }

            var panel = new Panel("news", "News");
            panel.temporary = true;
            panel.contents.innerHTML = html;

            var pic = panel.element.querySelector(".news-pic");
            if (pic) {
                pic.onclick = function() {
                    new Panel("news-pic", "Image", dom.img("news/update-full.png")).show();
                };
            }

            var title = panel.element.querySelector("h2").textContent;
            var icon = document.getElementById("news-icon");
            dom.show(icon);
            icon.onclick = function() {
                gameStorage.setItem("news.title", title);
                panel.toggle();
                icon.classList.remove("breaking-news");
            };

            if (title != gameStorage.getItem("news.title")) {
                icon.classList.add("breaking-news");
            }
        });
    }
};

Stage.add(lobbyStage);
