/* global game, dom, Vendor, Panel, util, T, TT, Container */

"use strict";

function Bank(npc) {
    var balance = dom.tag("label");
    var price = Vendor.createPriceInput();

    var deposit = dom.button(T("Deposit"), "", () => send("deposit"));
    var withdraw = dom.button(T("Withdraw"), "", () => send("withdraw"));
    var clear = dom.button(T("Clear"), "", function() {
        price.set(0, 0, 0);
    });
    var max = dom.button(T("Max"), "", function () {
        var items = game.player.findItems(["currency"]);
        var currencies = _.groupBy(items.currency, "Type");
        _.forEach(currencies, function(v, k) {
            const currency = price.currency[k];
            if (currency) {
                currency.value = _.sumBy(v, "Amount");
            }
        });
    });

    function send(action) {
        var cost = price.cost();
        if (cost == 0)
            game.popup.alert(T("Please enter amount"));
        else
            game.network.send(action, {Id: npc.Id, Cost: cost}, callback);
    }

    function maxPeriod(paidTill = 0, {Lvl} = game.player) {
        const paid = paidTill - Date.now() / 1000;
        const dayDuration = (60 * 60 * 24 * 7);
        const paidWeeks = Math.ceil(paid / dayDuration);
        return Math.max(0, Math.min(Math.floor(Lvl/10) + 2, 12) - paidWeeks);
    }

    function makePeriodSelecter(paidTill = 0) {
        return dom.select(_.range(1, maxPeriod(paidTill) + 1));
    }

    var claimRent = dom.span("", "rent-price");
    const claimTotalPrice = dom.span("", "total-price");
    var claimPaidTill = dom.tag("label");

    let periodSelector = makePeriodSelecter();

    var claimGet = dom.button(T("Get claim"), "", function() {
        var cit = game.player.Citizenship;
        var msg = "";
        if (cit.Claims > 0 && cit.Claims >= cit.Rank) {
            msg = T("To build a new claim you must increase your faction rank or destroy old claim") + ". ";
        }
        msg += TT("Get claim for {n} gold?", {n: 8});
        game.popup.confirm(msg, function() {
            game.network.send("get-claim", {}, callback);
        });
    });

    var claimPay = dom.button(T("Pay"), "", function() {
        game.popup.confirm(T("Confirm?"), function() {
            game.network.send("pay-for-claim", {Id: npc.Id, Period: +periodSelector.value}, callback);
        });
    });


    var vault = dom.div("vault slots-wrapper");

    const claimProlongationContainer = dom.wrap("claim-prolongation", [
        dom.make("label", [dom.span(T("Rent")), claimRent]),
        dom.make("label", [dom.span(T("Week(s)")), periodSelector]),
        dom.make("label", [dom.span(""), claimTotalPrice]),
        dom.make("label", [dom.span(""), claimPay]),
    ]);

    var contents = [
        balance,
        dom.hr(),
        dom.wrap("price-controller", [
            price,
            deposit,
            withdraw,
            max,
            clear,
        ]),
        dom.hr(),
        T("Vault"),
        vault,
        dom.hr(),
        dom.wrap("claim", [
            dom.make("label", [T("Claim"), claimGet]),
            claimPaidTill,
            dom.hr(),
            claimProlongationContainer,
        ]),
    ];
    var panel = new Panel("bank", "Bank", contents);
    panel.hide();
    panel.entity = npc;

    game.network.send("get-bank-info", {id: npc.Id}, callback);

    function date(unixtime) {
        return dom.span(
            (unixtime > 0)
                ? util.date.human(new Date(unixtime * 1000))
                : "-"
        );
    }

    function callback(data) {
        if (!data.Bank)
            return callback;
        price.set(0, 0, 0);
        balance.innerHTML = T("Balance") + ": ";
        dom.append(balance, Vendor.createPrice(data.Bank.Balance));

        const claim = data.Bank.Claim;

        if (claim.Cost == 0 || maxPeriod(claim.PaidTill) == 0) {
            claimProlongationContainer.classList.add("disabled");
        } else {
            claimProlongationContainer.classList.remove("disabled");
        }

        periodSelector = dom.replace(periodSelector, makePeriodSelecter(claim.PaidTill));

        dom.setContents(claimRent, Vendor.createPrice(claim.Cost));
        dom.setContents(claimTotalPrice, Vendor.createPrice(claim.Cost * periodSelector.value));
        periodSelector.onchange = () => {
            dom.setContents(claimTotalPrice, Vendor.createPrice(claim.Cost * periodSelector.value));
        };

        claimPaidTill.innerHTML = T("Paid till") + ": ";
        dom.append(claimPaidTill, date(claim.PaidTill));

        dom.clear(vault);
        dom.setContents(vault, data.Bank.Vault.map(function(vaultSlot, i) {
            var slot = dom.slot();
            if (vaultSlot.Unlocked) {
                var entity = Entity.get(vaultSlot.Id);
                dom.append(slot, entity.icon());
                slot.onclick = function() {
                    Container.show(entity);
                };
            } else {
                slot.classList.add("plus");
                slot.onclick = function() {
                    var cost = Math.pow(100, i) * 100;
                    game.popup.confirm(TT("Buy slot for {cost}?", {cost: Vendor.priceString(cost)}), function() {
                        game.network.send("buy-bank-vault-slot", {id: npc.Id}, callback);
                    });
                };
            }
            return slot;
        }));
        // //TODO: remove items on panel close?


        panel.show();
    };
}
