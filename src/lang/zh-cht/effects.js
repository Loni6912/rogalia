/* global Effects, T */


Effects.descriptions = {
    "Overeat": {
        "class": "bad",
        "effect": "角色移動速度減少45",
        "desc": "當人物的飢餓度達到100以上時獲得",
        "note": "在這種狀態下食物會降低維生獲得甚至無法獲得，去除這種狀態的最快方法是在廁所方便一下，但會造成50％的血量損失，飲用水也有助於更快地清除暴飲暴食（不要吃飽了撐着）。",
    },
    "Starving": {
        "class": "bad",
        "effect": "稍微降低你的健康",
        "desc": "當角色的飢餓度為0時獲得",
        "note": "你可能會餓死，不要做餓死鬼",
    },
    "Thirsty": {
        "class": "bad",
        "effect": "角色的移動速度降低到45，健康稍微下降，你不能挖泥土，礦石和舉起物品。",
        "desc": "當角色的饑渴度達到0時獲得",
        "note": "",
    },
    "Lifting": {
        "class": "",
        "effect": "角色移動速度降至45",
        "desc": "當你的角色舉起和移動物品時獲得",
        "note": "",
    },
    "Fire": {
        "class": "bad",
        "effect": "“角色周期性傷害（5秒內受到30點傷害）",
        "desc": "受到某些武器或生物的攻擊時獲得",
    },
    "Bleed": {
        "class": "bad",
        "effect": "角色受到持續傷害.",
        "desc": "受到生物襲擊時獲得",
    },
    "Hangover": {
        "class": "",
        "effect": " +9力量, -9靈巧.",
        "desc": "當人物喝酒（啤酒，葡萄酒）時獲得",
        "note": "不可疊加",
    },
    "Sitting": {
        "class": "good",
        "effect": "口渴和體力損失速度降低。吃飯時坐在桌子旁，減少飽腹感。",
        "desc": "當角色坐在椅子，王位或樹樁上獲得。",
        "note": "",
    },
    "MushroomTrip": {
        "class": "",
        "effect": "增加移動速度35，解除幻覺，導致10%血量損失。",
        "desc": "當角色食用生蘑菇時獲得",
        "note": "損傷按吃蘑菇的量比例增加。",
    },
    "Sex": {
        "class": "good",
        "effect": "減少20飢餓度，饑渴度增加50",
        "desc": "從瑪格那大保健獲得",
        "note": "時長為1.5分鐘",
    },
    "Arena": {
        "class": "",
        "effect": "殺後沒有該損失，死亡懲罰（飢餓、維生素、學習要點和工具損失）無效。",
        "desc": "在擂台上獲得",
        "note": "",
    },
    "Riding": {
        "class": "good",
        "effect": "人物移動速度大大提高，物品提升的速度加成無效。",
        "desc": "角色騎馬時獲得",
        "note": "",
    },
    "Slowed": {
        "class": "bad",
        "effect": "人物移動速度降低",
        "desc": "",
        "note": "不能疊加",
    },
    "High": {
        "class": "good",
        "effect": "吃東西時比例減少飢餓度增加（1品質香煙：-7%，1品質雪茄：-12%，1品質大麻煙：-15%），質量越高加成越高。",
        "desc": "抽香煙，雪茄和大麻煙得到。",
        "note": "坐在桌子旁邊吸食，每次治療1％的血量。",
    },
    "Weakness": {
        "class": "bad",
        "effect": "角色運動速度降低45，你幾乎造成不了傷害。",
        "desc": "死亡後人物復活時獲得",
        "note": "使用加強藥水時去除",
    },
    "ActivatedCarbon": {
        "class": "good",
        "effect": "將所有維生素都設為零，消除潛在的負面影響。",
        "desc": "持有活性炭時獲得",
    },
    "Drunk": {
        "class": "good",
        "effect": "+13% 血量; -7% 傷害",
        "desc": "酒壯慫人膽",
        "note": "如果你喝太多，即使是活性炭也不能解除你的宿醉。",
    },
    "Plague": {
        "class": "bad",
        "effect": "持續掉血",
        "desc": "當站在垃圾堆或另一個病人旁邊時，可能感染。",
        "note": "可以用抗瘟疫劑治癒",
    },
    "SynodProtection": {
        "class": "good",
        "effect": "你在pvp中的傷害減少80％",
        "desc": "如果你反擊或者你業力為負，那麼將失效。",
        "note": "你可以回到復活點",
    },
    "Prospecting": {
        "class": "good",
        "effect": "允許你發現附近的礦脈",
        "desc": "使用勘探器器獲得",
    },
    "NewbieProtection": {
        "class": "",
        "effect": "死刑",
        "desc": "Lv1到Lv9，保留背包和工具：Lv10到Lv24，保留背包，但丟失背包內物品：Lv25以上，失去所有工具和庫存。",
        "note": "任何級別你都會失去所有的維生素和學習點",
    },
    "De": {
        "class": "fight",
        "effect": T.help.combos.de.effect,
        "desc": T.help.combos.de.desc,
    },
    "Su": {
        "class": "fight",
        "effect": T.help.combos.su.effect,
        "desc": T.help.combos.su.desc,
    },
    "Nya": {
        "class": "fight",
        "effect": T.help.combos.nya.effect,
        "desc": T.help.combos.nya.desc,

    },
    "Inspiration": {
        "class": "fight",
        "effect": "增加暴擊幾率；增加傷害吸收。",
        "desc": "AoE buff"
    },
    "Invisibility": {
        "class": "good",
        "effect": "Makes you invisible",
        "desc": "Reveals on any action",
    },
};
