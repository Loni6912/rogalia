/* global Effects, T */

Effects.descriptions = {
    "Overeat": {
        "class": "bad",
        "effect": "캐릭터의 이동 속도가 45 감소합니다.",
        "desc": "굶주림 수치가 100 이상이면 발생합니다.",
        "note": "이 상태에서 음식을 먹으면 비타민도 0이하가 됩니다. 이 버프를 제거하는 가장 빠른 방법은 화장실을 가는 것이지만 50%의 체력 손실을 유발합니다. 식수는 과식을 빨리 제거하는데 도움이 됩니다.",
    },
    "Starving": {
        "class": "bad",
        "effect": "캐릭터의 체력이 조금씩 줄어듭니다.",
        "desc": "굶주림이 0이 되었을 떄 발생합니다.",
        "note": "굶어죽을 수도 있습니다.",
    },
    "Thirsty": {
        "class": "bad",
        "effect": "캐릭터의 이동 속도가 45 감소하고, 체력이 조금씩 줄어듭니다. 땅을 파거나, 광석을 캐거나, 물건을 들 수 없습니다.",
        "desc": "캐릭터의 스테미너가 0일 때 발생합니다.",
        "note": "",
    },
    "Lifting": {
        "class": "",
        "effect": "캐릭터의 이동 속도가 45 감소합니다.",
        "desc": "아이템을 들고 있을 때 발생합니다.",
        "note": "",
    },
    "Fire": {
        "class": "bad",
        "effect": "캐릭터는 지속적인 데미지를 받습니다. (5초 간격으로 30데미지).",
        "desc": "일부 무기나 몬스터에게 공격당했을 때 발생합니다.",
    },
    "Bleed": {
        "class": "bad",
        "effect": "캐릭터는 지속적인 데미지를 받습니다.",
        "desc": "몬스터에게 공격당했을 때 발생합니다.",
    },
    "Hangover": {
        "class": "",
        "effect": " +9 힘, -9 민첩성.",
        "desc": "술을 마셨을 때 발생합니다. (맥주, 와인).",
        "note": "중첩되지 않습니다.",
    },
    "Sitting": {
        "class": "good",
        "effect": "굶주림과 스테미너의 감속 속도가 줄어듭니다. 테이블 옆에 앉아서 음식을 먹으면 굶주림이 차는 양이 줄어듭니다.",
        "desc": "캐릭터가 의자, 그루터기 등에 앉아있을 때 발생합니다..",
        "note": "",
    },
    "MushroomTrip": {
        "class": "",
        "effect": "이동 속도가 35 증가하고, 환각에 의해 틱당 10%의 체력이 줄어듭니다.",
        "desc": "굽지않은 버섯을 먹었을 때 발생합니다.",
        "note": "버섯을 먹은 양에 따라 피해가 증가합니다.",
    },
    "Sex": {
        "class": "good",
        "effect": "굶주림이 20 감소하고, 스테미너가 50 증가합니다.",
        "desc": "마르고에게 살 수 있습니다.",
        "note": "1.5분동안 지속됩니다.",
    },
    "Arena": {
        "class": "",
        "effect": "살인할 때 카르마의 감소, 사망 패널티 (배고픔, 비타민, 학습 포인트 잃음) 가 없습니다.",
        "desc": "아레나에 진입할 때 발생합니다.",
        "note": "",
    },
    "Riding": {
        "class": "good",
        "effect": "캐릭터의 이동 속도가 크게 증가합니다. Lifting에 의한 패널티가 무시됩니다.",
        "desc": "말이나 오토바이에 탈 때 발생합니다.",
        "note": "",
    },
    "Slowed": {
        "class": "bad",
        "effect": "캐릭터의 이동 속도가 감소합니다.",
        "desc": "",
        "note": "중첩되지 않습니다.",
    },
    "High": {
        "class": "good",
        "effect": "음식을 먹을 때 굶주림이 차는 양이 줄어듭니다. 퀄리티 1 담배: 7%, 퀄리티 1 시가: 12%, 퀄리티 1 마리화나: 15%. 퀄리티가 높을 수록 효과가 증가합니다.",
        "desc": "담배, 시가, 마리화나를 필 때 발생합니다.",
        "note": "테이블 옆에 앉아 먹을 때의 감소효과와 중첩됩니다. 틱당 1%의 체력을 회복합니다.",
    },
    "Weakness": {
        "class": "bad",
        "effect": "캐릭터의 이동 속도가 45 감소합니다. 전투에서 거의 데미지를 주지 못합니다.",
        "desc": "죽은 후 부활했을 때 발생합니다.",
        "note": "강화 포션으로 제거할 수 있습니다.",
    },
    "ActivatedCarbon": {
        "class": "good",
        "effect": "모든 비타민을 제거하고, pooping의 패널티를 제거합니다.",
        "desc": "활성탄을 사용했을 때 발생합니다.",
    },
    "Drunk": {
        "class": "good",
        "effect": "+13% Hp; -7% 데미지.",
        "desc": "술을 마셨을 때 발생합니다.",
        "note": "과음을 하면, 활성탄도 무용지물입니다.",
    },
    "Plague": {
        "class": "bad",
        "effect": "캐릭터는 지속적인 데미지를 받습니다.",
        "desc": "쓰레기 더미 옆에 서 있거나, 붕가붕가 중 감염될 수 있습니다.",
        "note": "역병 방지 포션으로 제거할 수 있습니다.",
    },
    "SynodProtection": {
        "class": "good",
        "effect": "PVP에서 80% 감소된 데미지를 받습니다.",
        "desc": "지하에서, 또는 카르마가 0보다 작거나 반격을 한 경우 효과가 발휘되지 않습니다.",
        "note": "부활 포인트나 마을이 있는경우 그 곳으로 돌아갈 수 있습니다.",
    },
    "Prospecting": {
        "class": "good",
        "effect": "근처 광맥을 볼 수 있습니다.",
        "desc": "탐지기를 사용했을 때 발생합니다.",
    },
    "NewbieProtection": {
        "class": "",
        "effect": "사망 패널티.",
        "desc": "레벨 1 to 9 - 가방과 가방을 잃지 않습니다.\n레벨 10 to 24 - 가방은 잃지않지만 내용물은 잃습니다.\n레벨 25 이상 - 모든 아이템과 장비를 잃습니다.",
        "note": "모든 레벨에서 모든 비타민과 학습 포인트를 잃습니다.",
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
        "effect": "크리티컬 확률이 증가합니다. [De] 의 데미지 흡수량이 증가합니다.",
        "desc": "AoE buff"
    },
    "Invisibility": {
        "class": "good",
        "effect": "Makes you invisible",
        "desc": "Reveals on any action",
    },
};
