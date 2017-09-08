/* global Effects, T */


Effects.descriptions = {
    "Overeat": {
        "class": "bad",
        "effect": "角色移动速度减少45",
        "desc": "当人物的饥饿度达到100以上时获得",
        "note": "在这种状态下食物会降低维生获得甚至无法获得，去除这种状态的最快方法是在厕所方便一下，但会造成50％的血量损失，饮用水也有助于更快地清除暴饮暴食（不要吃饱了撑着）。",
    },
    "Starving": {
        "class": "bad",
        "effect": "稍微降低你的健康",
        "desc": "当角色的饥饿度为0时获得",
        "note": "你可能会饿死，不要做饿死鬼",
    },
    "Thirsty": {
        "class": "bad",
        "effect": "角色的移动速度降低到45，健康稍微下降，你不能挖泥土，矿石和举起物品。",
        "desc": "当角色的饥渴度达到0时获得",
        "note": "",
    },
    "Lifting": {
        "class": "",
        "effect": "角色移动速度降至45",
        "desc": "当你的角色举起和移动物品时获得",
        "note": "",
    },
    "Fire": {
        "class": "bad",
        "effect": "“角色周期性伤害（5秒内受到30点伤害）",
        "desc": "受到某些武器或生物的攻击时获得",
    },
    "Bleed": {
        "class": "bad",
        "effect": "角色受到持续伤害.",
        "desc": "受到生物袭击时获得",
    },
    "Hangover": {
        "class": "",
        "effect": " +9力量, -9灵巧.",
        "desc": "当人物喝酒（啤酒，葡萄酒）时获得",
        "note": "不可叠加",
    },
    "Sitting": {
        "class": "good",
        "effect": "口渴和体力损失速度降低。吃饭时坐在桌子旁，减少饱腹感。",
        "desc": "当角色坐在椅子，王位或树桩上获得。",
        "note": "",
    },
    "MushroomTrip": {
        "class": "",
        "effect": "增加移动速度35，解除幻觉，导致10%血量损失。",
        "desc": "当角色食用生蘑菇时获得",
        "note": "损伤按吃蘑菇的量比例增加。",
    },
    "Sex": {
        "class": "good",
        "effect": "减少20饥饿度，饥渴度增加50",
        "desc": "从玛格那大保健获得",
        "note": "时长为1.5分钟",
    },
    "Arena": {
        "class": "",
        "effect": "杀后没有该损失，死亡惩罚（饥饿、维生素、学习要点和工具损失）无效。",
        "desc": "在擂台上获得",
        "note": "",
    },
    "Riding": {
        "class": "good",
        "effect": "人物移动速度大大提高，物品提升的速度加成无效。",
        "desc": "角色骑马时获得",
        "note": "",
    },
    "Slowed": {
        "class": "bad",
        "effect": "人物移动速度降低",
        "desc": "",
        "note": "不能叠加",
    },
    "High": {
        "class": "good",
        "effect": "吃东西时比例减少饥饿度增加（1品质香烟：-7%，1品质雪茄：-12%，1品质大麻烟：-15%），质量越高加成越高。",
        "desc": "抽香烟，雪茄和大麻烟得到。",
        "note": "坐在桌子旁边吸食，每次治疗1％的血量。",
    },
    "Weakness": {
        "class": "bad",
        "effect": "角色运动速度降低45，你几乎造成不了伤害。",
        "desc": "死亡后人物复活时获得",
        "note": "使用加强药水时去除",
    },
    "ActivatedCarbon": {
        "class": "good",
        "effect": "将所有维生素都设为零，消除潜在的负面影响。",
        "desc": "持有活性炭时获得",
    },
    "Drunk": {
        "class": "good",
        "effect": "+13% 血量; -7% 伤害",
        "desc": "酒壮怂人胆",
        "note": "如果你喝太多，即使是活性炭也不能解除你的宿醉。",
    },
    "Plague": {
        "class": "bad",
        "effect": "持续掉血",
        "desc": "当站在垃圾堆或另一个病人旁边时，可能感染。",
        "note": "可以用抗瘟疫剂治愈",
    },
    "SynodProtection": {
        "class": "good",
        "effect": "你在pvp中的伤害减少80％",
        "desc": "如果你反击或者你业力为负，那么将失效。",
        "note": "你可以回到复活点",
    },
    "Prospecting": {
        "class": "good",
        "effect": "允许你发现附近的矿脉",
        "desc": "使用勘探器器获得",
    },
    "NewbieProtection": {
        "class": "",
        "effect": "死刑",
        "desc": "Lv1到Lv9，保留背包和工具：Lv10到Lv24，保留背包，但丢失背包内物品：Lv25以上，失去所有工具和库存。",
        "note": "任何级别你都会失去所有的维生素和学习点",
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
        "effect": "增加暴击几率；增加伤害吸收。",
        "desc": "AoE buff"
    },
    "Invisibility": {
        "class": "good",
        "effect": "Makes you invisible",
        "desc": "Reveals on any action",
    },
};
