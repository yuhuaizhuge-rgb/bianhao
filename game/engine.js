/* 二手车商模拟器 — game rules. No DOM. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.DealerGame = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CONFIG = {
    days: 30,
    startCash: 100000,
    startRep: 56,
    lotSize: 3,
    dailyOverhead: 260,
    deposit: 8000,
    platformFee: 0.018,
    drivesPerDay: 2,
    buysPerDay: 1,
    salesPerDay: 1,
    inspect: { paint: 200, service: 280, insurance: 380, drive: 150 },
    prep: { polish: 380, respray: 2400, parts: 1500 },
    giftCost: 500,
    nowYear: 2026,
    // Buyer willingness as a multiple of the price basis (dealer retail is above private fair).
    buyerMax: { kan: 1.045, tuhao: 1.16, dong: 1.1, peer: 0.985 },
    openRatio: { kan: 0.86, tuhao: 0.92, dong: 0.9, peer: 0.9 },
    concede: { kan: 0.32, tuhao: 0.62, dong: 0.46, peer: 0.5 },
    detect: { kan: 0.18, tuhao: 0.12, dong: 0.86, peer: 0.7 },
    defect: { rollback: 0.96, flood: 0.52, fire: 0.4, lien: 0.8, acc1: 0.93, acc2: 0.76, acc3: 0.58 },
  };

  const MODELS = [
    { id: "hongguang", brand: "五菱", name: "宏光", body: "mpv", base: 34000, tag: "国民神车" },
    { id: "dihao", brand: "吉利", name: "帝豪", body: "sedan", base: 48000, tag: "驾校亲儿子" },
    { id: "yinglang", brand: "别克", name: "英朗", body: "sedan", base: 54000, tag: "经典三厢" },
    { id: "qin", brand: "比亚迪", name: "秦", body: "sedan", base: 76000, tag: "电量是玄学" },
    { id: "langyi", brand: "大众", name: "朗逸", body: "sedan", base: 82000, tag: "地摊销量王" },
    { id: "xuanyi", brand: "日产", name: "轩逸", body: "sedan", base: 84000, tag: "家用永远的神" },
    { id: "h6", brand: "哈弗", name: "H6", body: "suv", base: 86000, tag: "城市SUV" },
    { id: "corolla", brand: "丰田", name: "卡罗拉", body: "sedan", base: 90000, tag: "开不坏传说" },
    { id: "civic", brand: "本田", name: "思域", body: "sport", base: 112000, tag: "小钢炮" },
    { id: "passat", brand: "大众", name: "帕萨特", body: "sedan", base: 122000, tag: "商务脸" },
    { id: "crv", brand: "本田", name: "CR-V", body: "suv", base: 142000, tag: "奶爸战车" },
    { id: "camry", brand: "丰田", name: "凯美瑞", body: "sedan", base: 140000, tag: "稳得像会计" },
    { id: "model3", brand: "特斯拉", name: "Model 3", body: "sport", base: 172000, tag: "电门贼快" },
    { id: "a4", brand: "奥迪", name: "A4L", body: "sedan", base: 180000, tag: "灯厂" },
    { id: "bmw3", brand: "宝马", name: "3系", body: "sport", base: 196000, tag: "姿态担当" },
    { id: "cclass", brand: "奔驰", name: "C级", body: "sedan", base: 208000, tag: "立标" },
    { id: "prado", brand: "丰田", name: "普拉多", body: "suv", base: 310000, tag: "沙漠之王停小区" },
    { id: "x5", brand: "宝马", name: "X5", body: "suv", base: 340000, tag: "大鼻孔" },
    { id: "cayenne", brand: "保时捷", name: "卡宴", body: "suv", base: 430000, tag: "修车修到怀疑人生" },
  ];

  const COLORS = [
    { id: "white", name: "珍珠白", hex: "#f4f1ea" },
    { id: "black", name: "碳黑", hex: "#2a2e33" },
    { id: "red", name: "拉力红", hex: "#d64545" },
    { id: "blue", name: "星空蓝", hex: "#3a6ea5" },
    { id: "silver", name: "水银灰", hex: "#c5ccd3" },
    { id: "gold", name: "土豪金", hex: "#c9962e" },
    { id: "green", name: "军绿", hex: "#5e7a4e" },
  ];

  const CLEAN_PITCH = [
    "女士一手，上下班代步，4S保养。你爱验就验。",
    "孩子出生换了大车，这台一直在地库睡大觉。",
    "原版原漆，公里数是上班通勤，不是跑滴滴。",
    "家里换电车了，这台油车老实，没折腾过。",
    "准备移民处理，手续齐，下午就能过户。",
  ];
  const ROLL_PITCH = [
    "公里数低是因为我就买菜用。表准得很，准得有点谦虚。",
    "表显你别太较真，我这人开车温柔，表自己就走得慢。",
    "刚做完保养，师傅还夸车况新。公里数？就表上这些。",
    "原车主是老师，寒暑假都不怎么开。我发誓。",
  ];
  const FLOOD_PITCH = [
    "便宜出。香味是新脚垫，不是你想的那种味。",
    "去年暴雨地下车库进了点水，我都擦了三遍了。",
    "内饰翻新过，所以味道浓一点，高端香。",
    "不是泡水，是我爱洗车，洗到座位都潮了。",
  ];
  const ACC_PITCH = [
    "保险杠老化裂的，跟撞没有半毛钱关系。",
    "缝大是为了散热，这叫运动版间隙。",
    "贴膜店手艺一般，你别拿灯照，伤感情。",
    "曾经和柱子亲热了一下，喷了点漆，结构好着呢。",
  ];
  const LIGHT_PITCH = [
    "停车被蹭过一下，补了块漆，我自己都忘了。",
    "右前门换过，因为快递小哥的三轮太热情。",
    "小剐蹭，没上报，怕保费涨。人老实才这么做。",
  ];
  const FIRE_PITCH = [
    "引擎舱熏过，冬天在那儿烤过红薯，你别多想。",
    "线路改过氛围灯，所以有点乱，能亮就行。",
    "偶尔故障灯自己跳出来跳个舞，拍一拍就好。",
  ];
  const LIEN_PITCH = [
    "人在外地急用钱。登记证在老家，你先定，我下周补。",
    "银行那点尾款我心里有数，抵押只是爱的证明。",
    "手续我姐夫保管，他人很稳，就是电话不爱接。",
    "你先把定金付了，绿本的事好商量，都是自己人。",
  ];

  const OWNERS = ["王姐", "老李", "陈哥", "赵总", "孙阿姨", "周师傅", "小吴", "郑先生", "冯姐", "钱老板", "刘哥", "马姐"];

  const BUYER_NAMES = {
    kan: ["老周", "小方", "阿强", "赵姐"],
    tuhao: ["坤哥", "林总", "小胖", "吴小姐"],
    dong: ["眼镜哥", "阿凯", "漆膜仪少女", "参数哥"],
    peer: ["老炮", "收车老张", "隔壁老李", "黄牛小刘"],
  };

  const JOKES = [
    "收摊。明天继续和公里数斗智斗勇。",
    "隔壁车行又挂了一台“原版原漆”。鬼信。",
    "今晚梦里都是漆膜仪的滴滴声。",
    "盒饭有点咸，像某些车主的嘴。",
    "车位空的时候，风都是香的。",
    "今天没翻车，已经超越了半个行业。",
    "把钥匙串盘好，明天还是一条好汉。",
  ];

  function yuan(n) {
    return Math.round(Number(n) || 0);
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function rng(state) {
    let x = state.rng >>> 0;
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    state.rng = x;
    return x / 4294967296;
  }

  function irand(state, n) {
    return Math.floor(rng(state) * n);
  }

  function pick(state, arr) {
    return arr[irand(state, arr.length)];
  }

  function formatYuan(n) {
    const v = yuan(n);
    const sign = v < 0 ? "-" : "";
    return sign + "¥" + Math.abs(v).toLocaleString("zh-CN");
  }

  function formatWan(n) {
    const v = yuan(n);
    const sign = v < 0 ? "-" : "";
    const a = Math.abs(v);
    if (a < 10000) return sign + a + "元";
    const w = a / 10000;
    let s = w >= 100 ? w.toFixed(1) : w.toFixed(2);
    s = s.replace(/0+$/, "").replace(/\.$/, "");
    return sign + s + "万";
  }

  function formatKm(n) {
    const a = Math.max(0, Math.round(n));
    if (a < 10000) return a + "公里";
    let s = (a / 10000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return s + "万公里";
  }

  function modelById(id) {
    return MODELS.find((m) => m.id === id) || MODELS[0];
  }

  function nextId(state) {
    state.seq = (state.seq || 1) + 1;
    return "c" + state.seq;
  }

  function marketMult(state) {
    let m = 1;
    if (state.buff && state.buff.until >= state.day) m *= state.buff.mult;
    return clamp(m, 0.8, 1.25);
  }

  function payMood(state) {
    let m = (state.today && state.today.maxPayMult) || 1;
    if (state.buyerDebuff && state.buyerDebuff.until >= state.day) m *= state.buyerDebuff.mult;
    return m;
  }

  function holdMult(car) {
    const d = car.heldDays || 0;
    let m = d >= 10 ? 0.94 : d >= 6 ? 0.97 : 1;
    if (car.stigma) m *= 0.97;
    return m;
  }

  function accMult(level) {
    if (level >= 3) return CONFIG.defect.acc3;
    if (level === 2) return CONFIG.defect.acc2;
    if (level === 1) return CONFIG.defect.acc1;
    return 1;
  }

  function baseRetail(model, age, km) {
    let v = model.base;
    v *= Math.pow(0.935, Math.max(0, age - 1));
    const over = Math.max(0, km - 25000);
    v *= Math.max(0.42, 1 - (over / 10000) * 0.02);
    return v;
  }

  function isSevere(d) {
    return !!(d.flood || d.fire || d.accident >= 3 || (d.lien && d.rollback) || (d.flood && d.accident >= 2));
  }

  function severeEnough(d) {
    return !!(d.flood || d.fire || d.accident >= 2 || d.rollback || d.lien);
  }

  function prepShow(car) {
    let m = 1;
    if (car.prep.polish) m *= 1.035;
    if (car.prep.respray === "done") m *= 1.07;
    if (car.prep.parts) m *= 1.02;
    return m;
  }

  function prepTrue(car) {
    let m = 1;
    if (car.prep.polish) m *= 1.015;
    if (car.prep.respray === "done") m *= 1.025;
    if (car.prep.parts) m *= 1.045;
    return m;
  }

  function valueOf(car, state, mode) {
    const model = modelById(car.modelId);
    const mkt = marketMult(state);
    const hold = holdMult(car);
    if (mode === "face") {
      return baseRetail(model, car.age, car.kmShown) * mkt * hold * prepShow(car);
    }
    if (mode === "true") {
      let v = baseRetail(model, car.age, car.kmReal) * mkt * hold * prepTrue(car);
      const d = car.defects;
      if (d.rollback) v *= CONFIG.defect.rollback;
      if (d.flood) v *= CONFIG.defect.flood;
      if (d.fire) v *= CONFIG.defect.fire;
      v *= accMult(d.accident);
      if (d.lien && !car.lienCleared) v *= CONFIG.defect.lien;
      return Math.max(v, baseRetail(model, car.age, car.kmReal) * mkt * 0.28);
    }
    // known
    const km = car.found.rollback ? car.kmReal : car.kmShown;
    let v = baseRetail(model, car.age, km) * mkt * hold;
    if (car.found.flood) v *= CONFIG.defect.flood;
    if (car.found.fire) v *= CONFIG.defect.fire;
    if (typeof car.found.accident === "number") v *= accMult(car.found.accident);
    if (car.found.lien && !car.lienCleared) v *= CONFIG.defect.lien;
    if (car.found.rollback) v *= CONFIG.defect.rollback;
    if (car.prep.polish) v *= 1.02;
    if (car.prep.respray === "done") v *= 1.03;
    if (car.prep.parts) v *= 1.04;
    return v;
  }

  function blankFound() {
    return { rollback: null, flood: null, accident: null, fire: null, lien: null };
  }

  function blankDefects() {
    return {
      rollback: false,
      flood: false,
      accident: 0,
      fire: false,
      lien: false,
      lienAmount: 0,
      accidentClaim: false,
      floodClaim: false,
      fireClaim: false,
    };
  }

  function rollDefects(state, bias) {
    const d = blankDefects();
    if (bias === "clean") {
      if (rng(state) < 0.2) {
        d.accident = 1;
        d.accidentClaim = rng(state) < 0.7;
      }
      return d;
    }
    if (bias === "flood") {
      d.flood = true;
      d.floodClaim = rng(state) < 0.78;
      if (rng(state) < 0.25) {
        d.accident = 1;
        d.accidentClaim = rng(state) < 0.5;
      }
      return d;
    }
    if (bias === "lemon") {
      const r = rng(state);
      if (r < 0.26) d.rollback = true;
      else if (r < 0.48) {
        d.flood = true;
        d.floodClaim = rng(state) < 0.8;
      } else if (r < 0.78) {
        d.accident = rng(state) < 0.55 ? 2 : 3;
        d.accidentClaim = rng(state) < 0.7;
      } else if (r < 0.9) {
        d.fire = true;
        d.fireClaim = rng(state) < 0.86;
      } else d.lien = true;
      if (rng(state) < 0.16 && !d.rollback) d.rollback = true;
      return d;
    }
    // normal mix: mostly decent, some trouble
    const r = rng(state);
    if (r < 0.42) {
      if (rng(state) < 0.3) {
        d.accident = 1;
        d.accidentClaim = rng(state) < 0.65;
      }
      return d;
    }
    if (r < 0.58) {
      d.rollback = true;
      return d;
    }
    if (r < 0.7) {
      d.flood = true;
      d.floodClaim = rng(state) < 0.75;
      return d;
    }
    if (r < 0.84) {
      d.accident = rng(state) < 0.6 ? 2 : rng(state) < 0.7 ? 3 : 1;
      d.accidentClaim = d.accident > 0 && rng(state) < 0.72;
      return d;
    }
    if (r < 0.92) {
      d.lien = true;
      return d;
    }
    d.fire = true;
    d.fireClaim = rng(state) < 0.85;
    return d;
  }

  function pitchFor(state, defects) {
    if (defects.fire) return pick(state, FIRE_PITCH);
    if (defects.flood) return pick(state, FLOOD_PITCH);
    if (defects.lien) return pick(state, LIEN_PITCH);
    if (defects.rollback) return pick(state, ROLL_PITCH);
    if (defects.accident >= 2) return pick(state, ACC_PITCH);
    if (defects.accident === 1) return pick(state, LIGHT_PITCH);
    return pick(state, CLEAN_PITCH);
  }

  function makeCar(state, spec) {
    const model = modelById(spec.modelId || pick(state, MODELS).id);
    const age = spec.age || 3 + irand(state, 6);
    let kmReal = spec.kmReal;
    let kmShown = spec.kmShown;
    const defects = spec.defects ? Object.assign(blankDefects(), spec.defects) : rollDefects(state, spec.bias || "normal");
    if (kmReal == null) {
      const per = 8000 + rng(state) * 12000;
      kmReal = Math.round((age * per * (0.85 + rng(state) * 0.35)) / 1000) * 1000;
      kmReal = clamp(kmReal, 8000, 280000);
    }
    if (defects.rollback && spec.kmShown == null) {
      kmShown = Math.round(kmReal / (1.65 + rng(state) * 0.7) / 1000) * 1000;
      kmShown = clamp(kmShown, 8000, kmReal - 5000);
    }
    if (kmShown == null) kmShown = kmReal;
    if (defects.lien && !defects.lienAmount) {
      defects.lienAmount = yuan(baseRetail(model, age, kmShown) * (0.08 + rng(state) * 0.1));
    }
    const color = spec.color || pick(state, COLORS);
    const severe = severeEnough(defects);
    const urgent = spec.urgent != null ? spec.urgent : severe ? rng(state) < 0.72 : rng(state) < 0.2;
    const mkt = marketMult(state);
    const face = baseRetail(model, age, kmShown);
    // Most private asks sit near book. The money is in motivated sellers and retail buyers.
    let askRatio = 0.97 + rng(state) * 0.08;
    if (urgent) askRatio -= 0.06;
    if (severe) askRatio -= 0.03;
    if (spec.askRatio) askRatio = spec.askRatio;
    const asking = yuan(face * mkt * clamp(askRatio, 0.86, 1.12));
    const car = {
      uid: spec.uid || nextId(state),
      modelId: model.id,
      brand: model.brand,
      name: model.name,
      body: model.body,
      tag: model.tag,
      color: color.hex,
      colorName: color.name,
      age,
      year: CONFIG.nowYear - age,
      kmShown,
      kmReal,
      defects,
      asking,
      urgent,
      ownerName: spec.owner || pick(state, OWNERS),
      pitch: spec.pitch || pitchFor(state, defects),
      found: blankFound(),
      hints: { rollback: false, flood: false, accident: false, fire: false, lien: false },
      checked: { paint: false, service: false, insurance: false, drive: false },
      reports: [],
      prep: { polish: false, respray: "no", parts: false },
      lienCleared: false,
      heldDays: 0,
      stigma: false,
      buyPrice: null,
      acquiredDay: null,
      pendingCounter: null,
      counterText: "",
      noDealDay: 0,
      tutorial: !!spec.tutorial,
      readyDay: 0,
    };
    return car;
  }

  function emptyToday() {
    return { freeInspect: false, drives: 0, buys: 0, sales: 0, maxPayMult: 1, prepInflation: 1, log: [] };
  }

  function emptyStats() {
    return {
      bought: 0,
      sold: 0,
      refunds: 0,
      honestSales: 0,
      shadySales: 0,
      platformSales: 0,
      caught: 0,
      bestFlip: 0,
      inspectSpent: 0,
      prepSpent: 0,
      revenue: 0,
      secretSold: 0,
      walks: 0,
    };
  }

  function freshState(seed) {
    let rng0 = seed >>> 0;
    if (!rng0) rng0 = (Math.floor(Math.random() * 0xffffffff) ^ (Date.now() >>> 0)) >>> 0;
    return {
      version: 1,
      rng: rng0,
      seed: rng0,
      day: 1,
      phase: "play",
      cash: CONFIG.startCash,
      deposit: 0,
      rep: CONFIG.startRep,
      buff: null,
      buyerDebuff: null,
      platformJoined: false,
      platformActive: false,
      platformOffered: false,
      inventory: [],
      listings: [],
      sold: [],
      event: null,
      haggle: null,
      summary: null,
      ending: null,
      today: emptyToday(),
      stats: emptyStats(),
      honestStreak: 0,
      log: [],
      seq: 1,
      tutorialDone: false,
      seenTip: { detail: false, haggle: false, platform: false },
      forceBuyer: null,
      nextBuyerBoost: 1,
    };
  }

  function pushLog(state, text) {
    state.log.unshift(text);
    state.log = state.log.slice(0, 12);
    if (state.today) {
      state.today.log.unshift(text);
      state.today.log = state.today.log.slice(0, 8);
    }
  }

  function findListing(state, uid) {
    return state.listings.find((c) => c.uid === uid) || null;
  }

  function findInv(state, uid) {
    return state.inventory.find((c) => c.uid === uid) || null;
  }

  function findCar(state, uid) {
    return findInv(state, uid) || findListing(state, uid);
  }

  function repAdd(state, n) {
    state.rep = clamp(yuan(state.rep + n), 0, 100);
  }

  function spend(state, amount) {
    amount = yuan(amount);
    if (state.cash < amount) return false;
    state.cash -= amount;
    return true;
  }

  function generateListings(state) {
    if (state.day === 1) {
      const clean = blankDefects();
      const roll = blankDefects();
      roll.rollback = true;
      const flood = blankDefects();
      flood.flood = true;
      flood.floodClaim = true;
      const lien = blankDefects();
      lien.lien = true;
      state.listings = [
        makeCar(state, {
          modelId: "xuanyi",
          age: 4,
          kmShown: 62000,
          kmReal: 62000,
          defects: clean,
          pitch: "女士一手，上下班代步，4S店保养。你爱验就验。",
          owner: "王姐",
          urgent: false,
          tutorial: true,
          askRatio: 0.98,
        }),
        makeCar(state, {
          modelId: "langyi",
          age: 6,
          kmShown: 41000,
          kmReal: 97000,
          defects: roll,
          pitch: "公里数低是因为我就买菜用。表准得很，准得有点谦虚。",
          owner: "刘哥",
          urgent: true,
        }),
        makeCar(state, {
          modelId: "dihao",
          age: 7,
          kmShown: 88000,
          kmReal: 88000,
          defects: flood,
          pitch: "便宜出。香味是新脚垫，不是你想的那种味。",
          owner: "老周",
          urgent: true,
        }),
        makeCar(state, {
          modelId: "yinglang",
          age: 7,
          kmShown: 91000,
          kmReal: 91000,
          defects: lien,
          pitch: "人在外地急用钱。登记证在老家，你先定，我下周补。",
          owner: "赵总",
          urgent: true,
        }),
      ];
      return;
    }

    const n = 3 + (rng(state) < 0.62 ? 1 : 0);
    const floodDay = state.today && state.today.floodDay;
    const cars = [];
    const fair = rng(state) < 0.74;
    const fairAt = fair ? irand(state, n) : -1;
    const floodAt = floodDay ? (fairAt === 0 ? 1 : 0) : -1;
    for (let i = 0; i < n; i++) {
      let bias = "normal";
      if (i === fairAt) bias = "clean";
      if (i === floodAt) bias = "flood";
      let guard = 0;
      let car;
      do {
        const cash = Math.max(8000, state.cash);
        const pool = MODELS.filter((m) => {
          if (m.base > 220000 && cash < 160000 && rng(state) < 0.82) return false;
          if (m.base * 0.45 > cash * 1.15 && rng(state) < 0.8) return false;
          return true;
        });
        const model = pool.length ? pool[irand(state, pool.length)] : MODELS[0];
        car = makeCar(state, { modelId: model.id, bias });
        guard++;
      } while (guard < 8 && car.asking > state.cash * 1.05 && cars.filter((c) => c.asking <= state.cash * 0.92).length < 1);
      cars.push(car);
    }
    // Guarantee at least one affordable car if the player still has a pulse.
    if (state.cash >= 12000 && !cars.some((c) => c.asking <= state.cash * 0.95)) {
      const cheap = makeCar(state, { modelId: rng(state) < 0.5 ? "hongguang" : "dihao", bias: fair ? "clean" : "normal", age: 6 + irand(state, 3) });
      cars[cars.length - 1] = cheap;
    }
    state.listings = cars;
  }

  function eventDeck() {
    return [
      "warm",
      "cold",
      "rumor",
      "inspector",
      "rain",
      "tuhao",
      "influencer",
      "rivalshop",
      "intro",
      "parts",
      "meme",
      "warm",
      "cold",
      "rumor",
      "inspector",
    ];
  }

  function shuffle(state, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = irand(state, i + 1);
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function describeProblems(car) {
    const d = car.defects;
    const bits = [];
    if (d.rollback) bits.push("调表");
    if (d.flood) bits.push("泡水");
    if (d.accident === 1) bits.push("小事故");
    if (d.accident === 2) bits.push("事故");
    if (d.accident >= 3) bits.push("大事故");
    if (d.fire) bits.push("火烧");
    if (d.lien && !car.lienCleared) bits.push("抵押未解");
    return bits;
  }

  function pullDispute(state) {
    const due = state.sold
      .filter((s) => s.willDispute && !s.resolved && s.disputeDay <= state.day)
      .sort((a, b) => a.disputeDay - b.disputeDay);
    if (!due.length) return null;
    const sale = due[0];
    // push the rest one day so modals don't stack
    due.slice(1).forEach((s) => {
      s.disputeDay = state.day + 1;
    });
    const problems = describeProblems(sale.car);
    const what = problems.length ? problems.join("、") : "一堆说不清的问题";
    return {
      kind: "dispute",
      saleId: sale.id,
      title: "买家退车了",
      text:
        sale.buyerName +
        "找上门，带来的" +
        labelOf(sale.car) +
        "被查出" +
        what +
        "。对方拍着桌子：" +
        (sale.honest ? "「你不是说就这些吗？怎么还有没说的？」" : "「原版原漆？你原的是原话，漆是后喷的。」"),
      choices: [
        { id: "refund", label: "痛快退车退款", hint: "少撕一点口碑，车回到车位" },
        { id: "argue", label: sale.viaPlatform ? "让真保障评理" : "扯皮到底", hint: sale.viaPlatform && sale.honest ? "如实告知的话，平台大概率向着你" : "硬刚可能赔更多" },
      ],
    };
  }

  function labelOf(car) {
    return car.brand + car.name;
  }

  function makeEvent(state, id) {
    if (id === "warm") {
      state.buff = { mult: 1.08, until: state.day + 2, label: "回暖", id: "warm" };
      return {
        kind: "news",
        title: "车市回暖",
        text: "限迁松风传来，置换补贴的小道消息满天飞。未来两天，出手能硬一点。",
        choices: [{ id: "ok", label: "趁热摆摊", hint: "行情 +8%，持续到第" + (state.day + 2) + "天" }],
      };
    }
    if (id === "cold") {
      state.buff = { mult: 0.92, until: state.day + 2, label: "遇冷", id: "cold" };
      return {
        kind: "news",
        title: "车市遇冷",
        text: "新车又降价，二手被按在地上摩擦。这两天买家的手特别紧。",
        choices: [{ id: "ok", label: "勒紧裤腰带", hint: "行情 -8%，两天" }],
      };
    }
    if (id === "rumor") {
      return {
        kind: "choice",
        title: "同行恶意压价",
        text: "隔壁老李在群里说你车行「专收泡水，售后续集」。几位今天的买家进门先冷笑。",
        choices: [
          { id: "fight", label: "花钱回怼 ¥600", hint: "口碑+2，下一位买家更好说话" },
          { id: "follow", label: "跟着把价放低", hint: "今天买家心里先砍一刀" },
          { id: "ignore", label: "装没看见", hint: "谣言会粘两天，口碑-2" },
        ],
      };
    }
    if (id === "inspector") {
      state.today.freeInspect = true;
      return {
        kind: "news",
        title: "检测师兄弟",
        text: "老同学在检测线值班，拍着你的肩：报告钱今天抹了，试驾还得你自己开。",
        choices: [{ id: "ok", label: "那我多抬两台", hint: "今天漆面 / 保养 / 出险免费" }],
      };
    }
    if (id === "rain") {
      state.today.floodDay = true;
      return {
        kind: "news",
        title: "雨季车源",
        text: "城区又看海。今天的车便宜得有点邪门，脚垫的味道建议用鼻子，别用感情。",
        choices: [{ id: "ok", label: "捏着鼻子去看", hint: "今日车源更容易遇到泡水" }],
      };
    }
    if (id === "tuhao") {
      state.forceBuyer = "tuhao";
      return {
        kind: "news",
        title: "土豪突袭",
        text: "有人在朋友圈晒了一沓现金：「今晚要提台车去接人，别跟我讲参数。」",
        choices: [{ id: "ok", label: "把车擦亮", hint: "下一位买家是土豪" }],
      };
    }
    if (id === "influencer") {
      return {
        kind: "choice",
        title: "网红要来探店",
        text: "一个本地探店号想直播你的车位。镜头很诚实，比车主诚实。",
        choices: [
          { id: "host", label: "开门迎接", hint: "口碑好就加分，车位上有雷可能翻车" },
          { id: "shut", label: "今天休息", hint: "什么都不发生，也很安全" },
        ],
      };
    }
    if (id === "rivalshop") {
      state.buyerDebuff = { mult: 0.96, until: state.day + 2 };
      return {
        kind: "news",
        title: "对面新开了车行",
        text: "对面拉了条幅，可乐免费，砍价更免费。这两天你的买家会被养刁。",
        choices: [{ id: "ok", label: "卷就卷", hint: "买家出价 -4%，两天" }],
      };
    }
    if (id === "intro") {
      repAdd(state, 3);
      return {
        kind: "news",
        title: "老客户转介绍",
        text: "上次那位买家跟他表哥说你这人不坑。口碑这东西，比横幅便宜，比横幅好用。",
        choices: [{ id: "ok", label: "谢谢表哥", hint: "口碑 +3" }],
      };
    }
    if (id === "parts") {
      state.today.prepInflation = 1.4;
      return {
        kind: "news",
        title: "配件涨价",
        text: "修理厂老板笑眯眯：「漆和易损件今天按友情价，友情比较贵。」",
        choices: [{ id: "ok", label: "能不喷就不喷", hint: "今天整备花费 +40%" }],
      };
    }
    return {
      kind: "news",
      title: "车市怪谈",
      text: pick(state, [
        "有人把方向盘加热说成原厂按摩。你听完，决定今天对谁都笑得克制一点。",
        "城管在车位口看了一眼，又走了。你和宏光同时松了口气。",
        "群里有人问：卡宴到底能不能当家用？你回了个「能」，然后把手机扣上了。",
      ]),
      choices: [{ id: "ok", label: "当个段子听", hint: "今天无事发生，也是福" }],
    };
  }

  function queuePlatform(state) {
    return {
      kind: "platform",
      title: "真车APP 来人了",
      text: "业务员把工牌亮给你看：「入驻交一笔保证金，买家也交。双向锁着，谁跑路谁肉疼。走平台成交，真保障只罩把话说清楚的人。你要是藏瑕疵，保证金替买家出头。」",
      choices: [
        { id: "join", label: "交 ¥8,000 入驻", hint: "钱先锁住，结业时退还；中途违约会被划走" },
        { id: "later", label: "我再观望", hint: "车行里随时还能入驻" },
      ],
    };
  }

  function startDay(state) {
    state.today = emptyToday();
    state.haggle = null;
    state.summary = null;
    if (state.buff && state.buff.until < state.day) state.buff = null;
    if (state.buyerDebuff && state.buyerDebuff.until < state.day) state.buyerDebuff = null;
    for (const car of state.inventory) {
      if (car.prep.respray === "wet" && state.day >= car.readyDay) {
        car.prep.respray = "done";
        pushLog(state, labelOf(car) + " 漆干了，可以见人了。");
      }
    }
    const dispute = pullDispute(state);
    if (!state.platformOffered && state.day >= 3 && !dispute) {
      state.platformOffered = true;
      if (!state.platformJoined) {
        generateListings(state);
        state.event = queuePlatform(state);
        state.phase = "event";
        return;
      }
    }
    let ev = null;
    if (!dispute && state.day > 1 && rng(state) < 0.42) {
      if (!state.deck || !state.deck.length) state.deck = shuffle(state, eventDeck());
      const id = state.deck.shift();
      ev = makeEvent(state, id);
    }
    generateListings(state);
    if (dispute) {
      state.event = dispute;
      state.phase = "event";
      return;
    }
    if (ev) {
      state.event = ev;
      state.phase = "event";
      return;
    }
    state.event = null;
    state.phase = "play";
  }

  function newGame(seed) {
    const state = freshState(seed);
    state.deck = shuffle(state, eventDeck());
    startDay(state);
    pushLog(state, "车位租好了。10万块，30天，别把自己做成事故车。");
    return state;
  }

  function loadSave(raw) {
    if (!raw || raw.version !== 1 || !raw.day) return null;
    if (!raw.today) raw.today = emptyToday();
    if (!raw.stats) raw.stats = emptyStats();
    if (!raw.seenTip) raw.seenTip = { detail: false, haggle: false, platform: false };
    return raw;
  }

  function hiddenProblems(car, honest) {
    const d = car.defects;
    const list = [];
    const say = !!honest;
    if (d.rollback && !(say && car.found.rollback)) list.push("rollback");
    if (d.flood && !(say && car.found.flood)) list.push("flood");
    if (d.fire && !(say && car.found.fire)) list.push("fire");
    if (d.accident >= 1 && !(say && typeof car.found.accident === "number" && car.found.accident >= 1)) list.push("accident");
    if (d.lien && !car.lienCleared && !(say && car.found.lien)) list.push("lien");
    return list;
  }

  function knowinglyHiding(car, honest) {
    if (honest) return false;
    if (car.found.rollback && car.defects.rollback) return true;
    if (car.found.flood && car.defects.flood) return true;
    if (car.found.fire && car.defects.fire) return true;
    if (typeof car.found.accident === "number" && car.found.accident >= 1 && car.defects.accident >= 1) return true;
    if (car.found.lien && car.defects.lien && !car.lienCleared) return true;
    return false;
  }

  function hasMajorHidden(car, honest) {
    return hiddenProblems(car, honest).some((k) => {
      if (k === "accident") return car.defects.accident >= 2;
      return k === "flood" || k === "fire" || k === "lien" || k === "rollback";
    });
  }

  function inspect(state, uid, kind) {
    if (state.phase !== "play") return { ok: false, error: "现在没空验车" };
    const car = findCar(state, uid);
    if (!car) return { ok: false, error: "车不见了" };
    if (!CONFIG.inspect[kind]) return { ok: false, error: "没有这项" };
    if (car.checked[kind]) return { ok: false, error: "这项查过了", text: lastReport(car, kind) };
    if (kind === "drive" && state.today.drives >= CONFIG.drivesPerDay) {
      return { ok: false, error: "今天试驾次数用完了，明天再开" };
    }
    const cost = state.today.freeInspect && kind !== "drive" ? 0 : CONFIG.inspect[kind];
    if (!spend(state, cost)) return { ok: false, error: "验车的钱不够了" };
    state.stats.inspectSpent += cost;
    if (kind === "drive") state.today.drives += 1;
    car.checked[kind] = true;
    let text = "";
    if (kind === "paint") {
      const acc = car.defects.accident;
      car.found.accident = acc;
      if (acc <= 0) text = "漆膜均匀，原厂橘皮还在。这车身子是干净的。";
      else if (acc === 1) text = "局部补漆，像叶子板或保险杠亲过一下。结构应该还在。";
      else if (acc === 2) text = "多处钣金，漆膜差出一倍。这不是“停车蹭的”。";
      else text = "腻子厚得能种葱，大梁位置不对。事故不小。";
      if (car.defects.fire && rng(state) < 0.45) {
        car.hints.fire = true;
        text += " 引擎盖内侧还有点熏痕。";
      }
    } else if (kind === "service") {
      if (car.defects.rollback) {
        car.found.rollback = true;
        text = "保养单最后一笔是" + formatKm(car.kmReal) + "，表上只有" + formatKm(car.kmShown) + "。这表会倒着长。";
      } else {
        car.found.rollback = false;
        text = "保养记录和表显对得上，没有调表的痕迹。";
      }
      if (car.defects.accident >= 2 && car.found.accident == null && rng(state) < 0.45) {
        car.hints.accident = true;
        text += " 单子里还夹着一次大修，语焉不详。";
      }
    } else if (kind === "insurance") {
      const bits = [];
      if (car.defects.accidentClaim && car.defects.accident > 0) {
        car.found.accident = car.defects.accident;
        bits.push(car.defects.accident >= 3 ? "出险记录很重，大事故赔过。" : car.defects.accident === 2 ? "出过一次不小的险，钣金级别。" : "有一次小额出险，补漆那种。");
      }
      if (car.defects.floodClaim) {
        car.found.flood = true;
        bits.push("涉水险赔付还在档上。这车泡过。");
      }
      if (car.defects.fireClaim) {
        car.found.fire = true;
        bits.push("有火烧相关赔付。别信烤红薯。");
      }
      if (!bits.length) bits.push("出险记录是干净的。私了的事，纸上不会写。");
      text = bits.join("");
    } else if (kind === "drive") {
      car.found.flood = !!car.defects.flood;
      car.found.fire = !!car.defects.fire;
      car.found.lien = !!(car.defects.lien && !car.lienCleared);
      const bits = [];
      if (car.defects.flood) bits.push("一开车门，霉味混着香薰，经典泡水香水。");
      else bits.push("没有霉味。");
      if (car.defects.fire) bits.push("故障灯像圣诞树，线束有烧过的焦味。");
      else bits.push("电路安分。");
      if (car.defects.lien && !car.lienCleared) bits.push("登记证抵押栏盖着红章，车还是银行的。");
      else bits.push("登记证干净，没有抵押。");
      if (car.defects.rollback && car.found.rollback == null) {
        car.hints.rollback = true;
        bits.push("动力挺肉，不太像表上这点公里。");
      }
      if (car.defects.accident >= 2 && car.found.accident == null) {
        car.hints.accident = true;
        bits.push("方向有点跑偏。");
      }
      text = bits.join("");
    }
    car.reports.push({ kind, text });
    const costNote = cost ? " -" + formatYuan(cost) : " 免费";
    pushLog(state, "验了 " + labelOf(car) + " 的" + inspectName(kind) + costNote);
    return { ok: true, text, toast: inspectName(kind) + "完成" + (cost ? " -" + formatYuan(cost) : "（免费）"), cost };
  }

  function lastReport(car, kind) {
    const r = car.reports.filter((x) => x.kind === kind).pop();
    return r ? r.text : "";
  }

  function inspectName(kind) {
    return { paint: "漆面", service: "保养记录", insurance: "出险记录", drive: "试驾" }[kind] || kind;
  }

  function quoteBuy(state, uid) {
    const car = findListing(state, uid);
    if (!car) return null;
    const lotFull = state.inventory.length >= CONFIG.lotSize;
    const buyFull = state.today.buys >= CONFIG.buysPerDay;
    const closed = car.noDealDay === state.day;
    let block = "";
    if (lotFull) block = "车位满了，先卖掉一台";
    else if (buyFull) block = "今天的收车额度用完了";
    else if (closed) block = "这单今天谈崩了";
    const haggle = yuan(car.asking * (car.urgent ? 0.94 : 0.965));
    const knownBad =
      car.found.rollback ||
      car.found.flood ||
      car.found.fire ||
      car.found.lien ||
      (typeof car.found.accident === "number" && car.found.accident >= 1);
    let expose = null;
    if (knownBad) {
      const truth = valueOf(car, state, "true");
      expose = yuan(Math.min(car.asking * 0.9, Math.max(truth * 1.01, car.asking * 0.62)));
      if (expose > car.asking) expose = yuan(car.asking * 0.9);
    }
    return {
      full: car.asking,
      haggle,
      expose,
      pending: car.pendingCounter,
      block,
      canFull: !block && state.cash >= car.asking,
      canHaggle: !block && state.cash >= haggle,
      canExpose: !block && expose != null && state.cash >= expose,
      needFull: car.asking,
      needHaggle: haggle,
    };
  }

  function moveToLot(state, car, price) {
    state.listings = state.listings.filter((c) => c.uid !== car.uid);
    car.buyPrice = price;
    car.acquiredDay = state.day;
    car.pendingCounter = null;
    car.heldDays = 0;
    state.inventory.push(car);
    state.today.buys += 1;
    state.stats.bought += 1;
    state.cash -= price;
    pushLog(state, "收了 " + labelOf(car) + "，" + formatYuan(price));
  }

  function buy(state, uid, mode) {
    if (state.phase !== "play") return { ok: false, error: "现在不能收车" };
    const car = findListing(state, uid);
    if (!car) return { ok: false, error: "这台已经不在了" };
    const q = quoteBuy(state, uid);
    if (q.block) return { ok: false, error: q.block };
    if (mode === "full") {
      if (state.cash < car.asking) return { ok: false, error: "现金不够按要价收" };
      moveToLot(state, car, car.asking);
      return { ok: true, status: "bought", price: car.buyPrice, toast: "收车 -" + formatYuan(car.buyPrice) };
    }
    if (mode === "haggle") {
      const offer = q.haggle;
      if (state.cash < offer) return { ok: false, error: "现金不够砍这一刀" };
      const floor = car.asking * (car.urgent ? 0.88 : severeEnough(car.defects) ? 0.92 : 0.945);
      const p = offer >= floor ? 0.78 + (car.urgent ? 0.12 : 0) : 0.34;
      if (rng(state) < p) {
        moveToLot(state, car, offer);
        return { ok: true, status: "bought", price: offer, toast: "砍成了 -" + formatYuan(offer) };
      }
      const counter = yuan(Math.max(floor, (offer + car.asking) / 2));
      car.pendingCounter = counter;
      car.counterText = car.urgent ? "再加一点点我就卖，真急。" : "这价不行。你再添一点，我当交个朋友。";
      return { ok: true, status: "counter", price: counter, toast: "车主还价 " + formatWan(counter) };
    }
    if (mode === "expose") {
      if (q.expose == null) return { ok: false, error: "你还没抓住把柄" };
      if (state.cash < q.expose) return { ok: false, error: "压价之后这点钱也不够" };
      const truth = valueOf(car, state, "true");
      const acceptLine = q.expose >= truth * 0.98;
      const p = acceptLine ? 0.84 : 0.46;
      if (rng(state) < p || q.expose >= car.asking * 0.9) {
        moveToLot(state, car, q.expose);
        return { ok: true, status: "bought", price: q.expose, toast: "点破之后成交 -" + formatYuan(q.expose) };
      }
      car.noDealDay = state.day;
      car.pendingCounter = null;
      return { ok: true, status: "reject", toast: "车主脸一黑：不卖了", error: "车主不卖了" };
    }
    return { ok: false, error: "没这招" };
  }

  function acceptCounter(state, uid) {
    const car = findListing(state, uid);
    if (!car || !car.pendingCounter) return { ok: false, error: "没有还价" };
    const q = quoteBuy(state, uid);
    if (q.block && q.block.indexOf("谈崩") < 0 && state.inventory.length >= CONFIG.lotSize) return { ok: false, error: q.block };
    if (state.today.buys >= CONFIG.buysPerDay) return { ok: false, error: "今天收车次数用完了" };
    if (state.inventory.length >= CONFIG.lotSize) return { ok: false, error: "车位满了" };
    if (state.cash < car.pendingCounter) return { ok: false, error: "现金不够接这个还价" };
    const price = car.pendingCounter;
    moveToLot(state, car, price);
    return { ok: true, status: "bought", price, toast: "按还价收了 -" + formatYuan(price) };
  }

  function declineCounter(state, uid) {
    const car = findListing(state, uid);
    if (!car || !car.pendingCounter) return { ok: false, error: "没有还价" };
    car.pendingCounter = null;
    car.noDealDay = state.day;
    return { ok: true, toast: "这单今天算了" };
  }

  function prepCost(state, kind) {
    const base = CONFIG.prep[kind];
    return yuan(base * ((state.today && state.today.prepInflation) || 1));
  }

  function prep(state, uid, kind) {
    if (state.phase !== "play") return { ok: false, error: "现在不能整备" };
    const car = findInv(state, uid);
    if (!car) return { ok: false, error: "车上还没到你车位" };
    if (kind === "lien") {
      if (!car.defects.lien || car.lienCleared) return { ok: false, error: "没有要解的抵押" };
      if (!car.found.lien) return { ok: false, error: "你还没确认抵押" };
      const cost = car.defects.lienAmount;
      if (!spend(state, cost)) return { ok: false, error: "解押的钱不够" };
      car.lienCleared = true;
      state.stats.prepSpent += cost;
      pushLog(state, labelOf(car) + " 解押 " + formatYuan(cost));
      return { ok: true, toast: "解押完成 -" + formatYuan(cost) };
    }
    if (!CONFIG.prep[kind]) return { ok: false, error: "没有这项整备" };
    if (kind === "polish" && car.prep.polish) return { ok: false, error: "抛过了" };
    if (kind === "parts" && car.prep.parts) return { ok: false, error: "易损件换过了" };
    if (kind === "respray" && car.prep.respray !== "no") return { ok: false, error: "已经在喷或者喷完了" };
    const cost = prepCost(state, kind);
    if (!spend(state, cost)) return { ok: false, error: "整备的钱不够" };
    state.stats.prepSpent += cost;
    if (kind === "polish") car.prep.polish = true;
    if (kind === "parts") car.prep.parts = true;
    if (kind === "respray") {
      car.prep.respray = "wet";
      car.readyDay = state.day + 1;
    }
    const name = { polish: "抛光", parts: "换易损件", respray: "全车喷漆" }[kind];
    pushLog(state, labelOf(car) + " " + name + " -" + formatYuan(cost));
    return {
      ok: true,
      toast: name + " -" + formatYuan(cost) + (kind === "respray" ? "，明天漆干" : ""),
    };
  }

  function joinPlatform(state) {
    if (state.platformJoined && state.platformActive) return { ok: false, error: "已经入驻了" };
    const need = state.platformJoined ? CONFIG.deposit - state.deposit : CONFIG.deposit;
    if (need <= 0) {
      state.platformActive = true;
      return { ok: true, toast: "档口恢复了" };
    }
    if (!spend(state, need)) return { ok: false, error: "保证金不够，先去周转" };
    state.deposit += need;
    state.platformJoined = true;
    state.platformActive = state.deposit >= CONFIG.deposit;
    state.platformOffered = true;
    if (state.deposit >= CONFIG.deposit) repAdd(state, 1);
    pushLog(state, "真车保证金 +" + formatYuan(need) + "（锁住）");
    return { ok: true, toast: "入驻真车，保证金锁住 " + formatYuan(need) };
  }

  function buyerType(state) {
    if (state.forceBuyer) {
      const t = state.forceBuyer;
      state.forceBuyer = null;
      return t;
    }
    const r = rng(state);
    if (r < 0.3) return "kan";
    if (r < 0.54) return "tuhao";
    if (r < 0.82) return "dong";
    return "peer";
  }

  const BUYER_META = {
    kan: { title: "砍价狂", talk: "网上同款才这个价。我现金，你再看看良心。" },
    tuhao: { title: "土豪", talk: "别跟我念配置，我晚上要提车。你别太离谱就行。" },
    dong: { title: "懂车帝", talk: "漆膜仪我随身带。你先报价，我再决定你是不是老实人。" },
    peer: { title: "同行车商", talk: "收车价，别谈感情。我转手就知道卖谁。" },
  };

  function saleBasis(car, state, honest, detected) {
    if (detected) return valueOf(car, state, "true") * 0.97;
    if (honest) return valueOf(car, state, "known");
    return valueOf(car, state, "face");
  }

  function beginHaggle(state, uid, opts) {
    if (state.phase !== "play") return { ok: false, error: "现在不能卖车" };
    const car = findInv(state, uid);
    if (!car) return { ok: false, error: "这台不在车位上" };
    if (car.prep.respray === "wet") return { ok: false, error: "漆还没干，明天再卖" };
    if (state.today.sales >= CONFIG.salesPerDay) return { ok: false, error: "今天已经接待过买家了" };
    const ask = yuan(opts.ask);
    if (ask < 1000) return { ok: false, error: "这价低得像在送" };
    const honest = !!opts.honest;
    const viaPlatform = !!opts.viaPlatform;
    if (viaPlatform && !state.platformActive) return { ok: false, error: "平台档口还没开通" };
    const type = buyerType(state);
    const detected = rollDetect(state, car, honest, type);
    let basis = saleBasis(car, state, honest, detected);
    basis *= payMood(state) * (state.nextBuyerBoost || 1);
    state.nextBuyerBoost = 1;
    let maxPay = yuan(basis * CONFIG.buyerMax[type]);
    if (detected && type === "dong" && hasMajorHidden(car, honest)) maxPay = yuan(maxPay * 0.9);
    if (detected && type === "peer") maxPay = yuan(valueOf(car, state, "true") * 0.95);
    const open = yuan(maxPay * CONFIG.openRatio[type]);
    let offer = Math.min(open, maxPay);
    let line = BUYER_META[type].talk;
    let calledOut = false;
    if (detected && hiddenProblems(car, honest).length) {
      calledOut = true;
      const what = hiddenProblems(car, honest)
        .map((k) => ({ rollback: "调表", flood: "泡水", fire: "火烧", accident: "事故", lien: "抵押" }[k]))
        .join("、");
      line =
        type === "dong"
          ? "我测完了。这车有" + what + "。你还当原版开价？"
          : type === "peer"
            ? "兄弟，" + what + "就别演了。批发价，爱过不过。"
            : "我看着不太对啊……" + what + "吧？";
      repAdd(state, type === "dong" ? -4 : -2);
      state.stats.caught += 1;
    }
    if (offer >= ask) offer = ask;
    const eager = ask <= maxPay * 0.985 && !calledOut;
    if (eager) {
      offer = Math.min(ask, maxPay);
      line = type === "tuhao" ? "行，就这个数，晚上我来提。" : "价格还算人话。就按你开的来？";
    }
    state.today.sales += 1;
    state.haggle = {
      uid,
      type,
      buyerName: pick(state, BUYER_NAMES[type]),
      title: BUYER_META[type].title,
      line,
      ask,
      offer,
      maxPay,
      round: 0,
      giftUsed: false,
      reportUsed: false,
      honest,
      viaPlatform,
      detected,
      calledOut,
      done: null,
      resultText: "",
      cashDelta: 0,
    };
    state.phase = "haggle";
    state.seenTip.haggle = state.seenTip.haggle;
    return { ok: true, toast: BUYER_META[type].title + "进门了" };
  }

  function rollDetect(state, car, honest, type) {
    const hidden = hiddenProblems(car, honest);
    if (!hidden.length) return false;
    let p = CONFIG.detect[type];
    if (
      car.prep.respray === "done" &&
      hidden.every((h) => h === "accident" && car.defects.accident === 1) &&
      (type === "kan" || type === "tuhao")
    ) {
      p *= 0.35;
    }
    return rng(state) < p;
  }

  function haggleAction(state, action) {
    const h = state.haggle;
    if (!h || h.done) return { ok: false, error: "没在砍价" };
    const car = findInv(state, h.uid);
    if (!car) return { ok: false, error: "车丢了" };
    if (action === "accept") return conclude(state, h.offer, "你按对方的价握了手。");
    if (action === "gift") {
      if (h.giftUsed) return { ok: false, error: "油卡已经送过了" };
      if (!spend(state, CONFIG.giftCost)) return { ok: false, error: "油卡钱都没有" };
      h.giftUsed = true;
      const boost = h.type === "kan" ? 1.05 : h.type === "tuhao" ? 1.015 : 1.03;
      h.maxPay = yuan(h.maxPay * boost);
      h.offer = yuan(Math.min(h.maxPay, h.offer + h.maxPay * 0.025));
      h.line = "油卡可以。价呢？";
      return respond(state, "gift");
    }
    if (action === "report") {
      if (h.reportUsed) return { ok: false, error: "报告亮过了" };
      if (!car.reports.length) return { ok: false, error: "你手里没有报告" };
      h.reportUsed = true;
      if (!h.honest && knowinglyHiding(car, false)) {
        h.honest = true;
        h.detected = false;
        const basis = saleBasis(car, state, true, false) * payMood(state);
        h.maxPay = yuan(basis * CONFIG.buyerMax[h.type]);
        h.offer = yuan(Math.min(h.maxPay, h.maxPay * CONFIG.openRatio[h.type] + (h.maxPay - h.offer) * 0.2));
        h.line = "早这样说不就完了。按实车况，我重新出价。";
        repAdd(state, 2);
        pushLog(state, "临时坦白，口碑拉回来一点");
      } else {
        h.maxPay = yuan(h.maxPay * 1.025);
        h.line = "有报告就好说话。我再看看价。";
        repAdd(state, 1);
      }
      return respond(state, "report");
    }
    if (action === "meet") {
      // Give some ground, but don't collapse onto a lowball in one tap.
      h.ask = yuan(h.ask - (h.ask - h.offer) * 0.38);
      return respond(state, "meet");
    }
    if (action === "walk") return walkAway(state);
    if (action === "hold") {
      h.holdCount = (h.holdCount || 0) + 1;
      return respond(state, "hold");
    }
    return { ok: false, error: "没这招" };
  }

  function respond(state, how) {
    const h = state.haggle;
    const max = h.maxPay;
    if (h.offer >= h.ask) return conclude(state, h.ask, "对方一咬牙，按你的价成交。");
    if (h.ask <= max) {
      const closeness = (max - h.ask) / Math.max(1, max);
      let p = 0.62 + closeness * 0.7;
      if (how === "hold") p -= 0.18;
      if (h.type === "tuhao") p += 0.14;
      if (h.type === "kan") p -= 0.1;
      if (h.reportUsed) p += 0.06;
      if (rng(state) < Math.min(0.95, p)) return conclude(state, h.ask, "谈拢了。");
    }
    const concede = CONFIG.concede[h.type] * (how === "hold" ? 0.5 : 1);
    const target = Math.min(h.ask, max);
    const raise = Math.max(yuan(max * 0.012), yuan((target - h.offer) * concede));
    h.offer = Math.min(max, h.offer + Math.max(0, raise));
    if (h.offer > max) h.offer = max;
    h.round += 1;
    if (h.offer >= h.ask) return conclude(state, h.ask, "对方加到了你的价。");
    if (h.round >= 3) {
      if (h.ask <= max) return conclude(state, h.ask, "最后一轮，对方认了。");
      if (h.ask <= max * 1.025 && rng(state) < 0.55) return conclude(state, max, "对方掏出了心理价的最后一截。");
      return walkAway(state);
    }
    h.line = counterLine(h, how);
    return { ok: true, status: "counter" };
  }

  function counterLine(h, how) {
    if (h.type === "kan") {
      if (how === "hold") return "你不松口？那我也不松。再加点，不然我去对面。";
      return "还是贵。我再添一丢丢，你别得寸进尺。";
    }
    if (h.type === "tuhao") return "行行行，再加一点。今晚别让我打不到车。";
    if (h.type === "dong") return "按车况，我只能再到这儿。你自己看着办。";
    return "批发就这个空间。再磨我就去拍别的了。";
  }

  function disputeChance(car, honest, type, viaPlatform) {
    const hidden = hiddenProblems(car, honest);
    if (!hidden.length) return 0;
    const major = hasMajorHidden(car, honest);
    if (viaPlatform && honest) return major ? 0.06 : 0;
    let p = { kan: 0.2, tuhao: 0.46, dong: 0.18, peer: 0.09 }[type];
    if (!major) p *= 0.28;
    if (knowinglyHiding(car, honest)) p *= 1.3;
    else p *= 0.62;
    return clamp(p, 0, 0.8);
  }

  function conclude(state, price, flavor) {
    const h = state.haggle;
    const car = findInv(state, h.uid);
    price = yuan(price);
    if (h.viaPlatform && knowinglyHiding(car, h.honest) && rng(state) < 0.72) {
      const penalty = 1800;
      state.cash -= penalty;
      if (state.cash < 0 && state.deposit > 0) {
        const take = Math.min(state.deposit, -state.cash);
        state.deposit -= take;
        state.cash += take;
        if (state.deposit < CONFIG.deposit) state.platformActive = false;
      }
      repAdd(state, -12);
      state.stats.caught += 1;
      state.honestStreak = 0;
      h.done = "audit";
      h.resultText = "真车平台的审核员拍了拍报告：已知问题没写进披露。成交取消，保证金替买家出头，划了 " + formatYuan(penalty) + "。";
      h.cashDelta = -penalty;
      pushLog(state, "平台拦下成交，违约金 " + formatYuan(penalty));
      return { ok: true, status: "audit", toast: "真保障罚了你 " + formatYuan(penalty) };
    }
    const fee = h.viaPlatform ? yuan(price * CONFIG.platformFee) : 0;
    state.cash += price - fee;
    const flip = price - (car.buyPrice || 0);
    if (flip > state.stats.bestFlip) state.stats.bestFlip = flip;
    state.stats.sold += 1;
    state.stats.revenue += price;
    const hidden = hiddenProblems(car, h.honest);
    if (h.honest && hidden.length === 0) {
      repAdd(state, 1);
      state.stats.honestSales += 1;
      state.honestStreak += 1;
      if (state.honestStreak === 4) {
        repAdd(state, 2);
        pushLog(state, "连续老实成交，口碑发热");
      }
    } else if (h.honest) {
      repAdd(state, 1);
      state.stats.honestSales += 1;
      state.honestStreak += 1;
    } else {
      state.stats.shadySales += 1;
      state.honestStreak = 0;
      if (knowinglyHiding(car, false)) repAdd(state, -1);
    }
    if (h.viaPlatform && h.honest && hidden.length === 0) {
      repAdd(state, 1);
      state.stats.platformSales += 1;
    } else if (h.viaPlatform) {
      state.stats.platformSales += 1;
    }
    const saleId = "s" + nextId(state);
    const chance = disputeChance(car, h.honest, h.type, h.viaPlatform);
    const will = chance > 0 && rng(state) < chance;
    const snap = JSON.parse(JSON.stringify(car));
    state.sold.push({
      id: saleId,
      car: snap,
      price,
      day: state.day,
      honest: h.honest,
      viaPlatform: h.viaPlatform,
      buyerType: h.type,
      buyerName: h.title + "·" + h.buyerName,
      willDispute: will,
      disputeDay: state.day + 2 + irand(state, 3),
      resolved: false,
      hiddenMajor: hasMajorHidden(car, h.honest),
    });
    if (will) {
      /* scheduled */
    }
    if (!h.honest && hidden.length) state.stats.secretSold += 1;
    state.inventory = state.inventory.filter((c) => c.uid !== car.uid);
    h.done = "sold";
    h.offer = price;
    h.cashDelta = price - fee;
    const feeText = fee ? "，平台服务费 " + formatYuan(fee) : "";
    const protect =
      h.viaPlatform && h.honest && hidden.length === 0 ? " 真保障盖了章。" : "";
    h.resultText = flavor + " 成交价 " + formatYuan(price) + feeText + "。" + protect;
    pushLog(state, "卖出 " + labelOf(car) + " " + formatYuan(price));
    return { ok: true, status: "sold", toast: "卖出 +" + formatYuan(price - fee), price };
  }

  function walkAway(state) {
    const h = state.haggle;
    h.done = "walk";
    h.resultText =
      h.type === "kan"
        ? "砍价狂把你的价在手机上截了个图，冷笑着去对面了。"
        : h.type === "dong"
          ? "懂车帝摇摇头，把漆膜仪收回包里。这单黄了。"
          : "买家摆摆手，人走了，茶还热着。";
    state.stats.walks += 1;
    pushLog(state, "买家走了，" + labelOf(findInv(state, h.uid) || { brand: "", name: "那台车" }) + " 还在");
    return { ok: true, status: "walk", toast: "买家走了" };
  }

  function closeHaggle(state) {
    if (!state.haggle || !state.haggle.done) return { ok: false, error: "还在谈" };
    state.haggle = null;
    state.phase = "play";
    return { ok: true };
  }

  function returnCar(state, sale) {
    const car = sale.car;
    car.uid = nextId(state);
    car.found = {
      rollback: !!car.defects.rollback,
      flood: !!car.defects.flood,
      accident: car.defects.accident,
      fire: !!car.defects.fire,
      lien: !!(car.defects.lien && !car.lienCleared),
    };
    car.checked = { paint: true, service: true, insurance: true, drive: true };
    car.hints = { rollback: false, flood: false, accident: false, fire: false, lien: false };
    car.stigma = true;
    car.heldDays = (car.heldDays || 0) + 1;
    car.pendingCounter = null;
    car.noDealDay = 0;
    if (state.inventory.length >= CONFIG.lotSize) {
      const dump = yuan(valueOf(car, state, "true") * 0.78);
      state.cash += dump;
      return "车位满了，退回的车只能当场批给同行，回笼 " + formatYuan(dump) + "。";
    }
    state.inventory.push(car);
    return "车回到了你的车位，问题已经藏不住了。";
  }

  function applyRefund(state, sale, mode) {
    sale.resolved = true;
    state.cash -= sale.price;
    state.stats.refunds += 1;
    let extra = 0;
    let rep = -3;
    let text = "";
    if (mode === "argue") {
      const protectedDeal = sale.viaPlatform && sale.honest && !sale.hiddenMajor;
      const win = protectedDeal || (sale.honest && !sale.hiddenMajor && rng(state) < 0.55);
      if (win) {
        state.cash += sale.price;
        repAdd(state, sale.viaPlatform ? 3 : 1);
        return {
          ok: true,
          toast: "这单你站住了",
          text: sale.viaPlatform
            ? "真保障翻出披露记录：该说的你说了。买家的保证金安抚了他，钱不用退。"
            : "你把当时的话重复清楚，对方嘟囔两句，还是把车开走了。",
        };
      }
      extra = 1200;
      state.cash -= extra;
      rep = -9;
      text = "越扯越难看。退款之外又赔了 " + formatYuan(extra) + " 精神损失。";
    } else if (mode === "auto") {
      rep = -6;
      text = "还没出三十天，" + sale.buyerName + "把 " + labelOf(sale.car) + " 退了回来。";
    } else {
      text = "你退了款，少挨两句。口碑还是掉了一点。";
      rep = -3;
    }
    repAdd(state, rep);
    const back = returnCar(state, sale);
    if (state.cash < 0 && state.deposit > 0) {
      const take = Math.min(state.deposit, -state.cash);
      state.deposit -= take;
      state.cash += take;
      if (state.deposit < CONFIG.deposit) state.platformActive = false;
      text += " 保证金被划走 " + formatYuan(take) + "。";
    }
    return { ok: true, text: text + back, toast: "退车 -" + formatYuan(sale.price + extra) };
  }

  function chooseEvent(state, choiceId) {
    const ev = state.event;
    if (!ev || state.phase !== "event") return { ok: false, error: "没有待处理的事" };
    let toast = "";
    let text = "";
    if (ev.kind === "dispute") {
      const sale = state.sold.find((s) => s.id === ev.saleId);
      state.event = null;
      state.phase = "play";
      if (!sale || sale.resolved) return { ok: true, toast: "这事已经过去了" };
      const res = applyRefund(state, sale, choiceId === "argue" ? "argue" : "refund");
      return res;
    }
    if (ev.kind === "platform") {
      if (choiceId === "join") {
        const res = joinPlatform(state);
        if (!res.ok) return res;
        state.event = null;
        state.phase = "play";
        return res;
      }
      state.event = null;
      state.phase = "play";
      return { ok: true, toast: "先观望。车行招牌下还能再入驻。" };
    }
    if (ev.title === "同行恶意压价" || (ev.choices || []).some((c) => c.id === "fight")) {
      if (choiceId === "fight") {
        if (!spend(state, 600)) {
          return { ok: false, error: "回怼的钱不够" };
        }
        repAdd(state, 2);
        state.nextBuyerBoost = 1.04;
        toast = "硬刚回去了 -¥600";
        text = "你发了条不点名的朋友圈，配图是检测报告。群里安静了一会儿。";
      } else if (choiceId === "follow") {
        state.today.maxPayMult *= 0.96;
        toast = "今天价松一截";
        text = "你决定不争那天的嘴。买家进门会更嚣张一点。";
      } else {
        repAdd(state, -2);
        state.buyerDebuff = { mult: 0.97, until: state.day + 1 };
        toast = "谣言粘住了";
        text = "你装没看见。接下来两天，有人进门就先问：你这儿泡水吗？";
      }
    } else if ((ev.choices || []).some((c) => c.id === "host")) {
      if (choiceId === "shut") {
        toast = "今天休息";
        text = "卷帘门拉上。网红在对面车行喝到了免费可乐。";
      } else {
        const lemon = state.inventory.some((c) => hasMajorHidden(c, false) && knowinglyHiding(c, false));
        const anySecret = state.inventory.some((c) => hiddenProblems(c, true).some((k) => k !== "accident" || c.defects.accident >= 2));
        if (lemon && rng(state) < 0.7) {
          repAdd(state, -6);
          toast = "直播翻车";
          text = "镜头扫过脚垫和登记证。弹幕从“老板大气”变成“这也敢卖”。";
        } else if (anySecret && rng(state) < 0.45) {
          repAdd(state, -4);
          toast = "弹幕不太友好";
          text = "有人在评论区指出缝隙。你笑着把镜头拧去拍天空。";
        } else if (state.rep >= 60) {
          repAdd(state, 6);
          toast = "口碑 +6";
          text = "你把报告夹摊开给镜头。弹幕说：这老板有点东西。";
        } else {
          repAdd(state, 2);
          toast = "露了个脸";
          text = "直播平平无奇。至少没人骂你。";
        }
      }
    } else {
      toast = "知道了";
    }
    state.event = null;
    state.phase = "play";
    if (text) pushLog(state, text);
    return { ok: true, toast: toast || "继续营业", text };
  }

  function endDay(state) {
    if (state.phase !== "play") return { ok: false, error: "手头的事还没完" };
    if (state.haggle && !state.haggle.done) return { ok: false, error: "买家还在，先把这单谈完" };
    const before = state.cash;
    state.cash -= CONFIG.dailyOverhead;
    for (const car of state.inventory) car.heldDays = (car.heldDays || 0) + 1;
    const delta = state.cash - before;
    state.summary = {
      day: state.day,
      overhead: CONFIG.dailyOverhead,
      cash: state.cash,
      delta,
      joke: JOKES[(state.day + state.seed) % JOKES.length],
      lines: (state.today.log || []).slice(0, 6),
    };
    state.phase = "summary";
    state.listings = [];
    return { ok: true };
  }

  function finish(state) {
    const pending = state.sold.filter((s) => s.willDispute && !s.resolved);
    const notes = [];
    for (const sale of pending) {
      if (sale.disputeDay > state.day + 1 && state.day < CONFIG.days) continue;
      const res = applyRefund(state, sale, "auto");
      if (res.text) notes.push(res.text);
    }
    const cashBefore = state.cash;
    const depositBack = state.deposit;
    let liquidation = 0;
    const leftover = [];
    for (const car of state.inventory) {
      const v = yuan(valueOf(car, state, "true") * 0.86);
      liquidation += v;
      leftover.push({ name: labelOf(car), price: v, problems: describeProblems(car) });
    }
    state.cash = cashBefore + depositBack + liquidation;
    state.deposit = 0;
    state.inventory = [];
    const profit = state.cash - CONFIG.startCash;
    const title = pickTitle(profit, state.rep, state.stats);
    state.ending = {
      profit,
      rep: state.rep,
      cashBefore,
      depositBack,
      liquidation,
      finalCash: state.cash,
      leftover,
      title,
      stars: starCount(profit, state.rep),
      stats: Object.assign({}, state.stats),
      notes: notes.slice(0, 2),
      recap: recap(state.stats, profit),
      days: CONFIG.days,
    };
    state.phase = "ending";
    state.summary = null;
  }

  function recap(stats, profit) {
    if (stats.secretSold >= 3) return "有 " + stats.secretSold + " 台你是睁着眼当原版卖的。钱的味道，买家记得住。";
    if (stats.refunds >= 2) return "退车 " + stats.refunds + " 次。车位像旋转门。";
    if (profit < 0 && stats.secretSold === 0) return "没坑人，但账本是红的。口碑还在，本钱得慢慢找回来。";
    if (stats.refunds === 0 && stats.secretSold === 0 && stats.sold >= 6) return "三十天没有退车，问题也没往靓车里塞。很难得。";
    if (stats.sold < 4) return "成交不多。有时候谨慎是美德，有时候只是车位太冷清。";
    return "有赚有教训。二手车这行，报告比口号值钱。";
  }

  function starCount(profit, rep) {
    const p = clamp(profit / 18000, 0, 5);
    const r = clamp((rep - 15) / 17, 0, 5);
    return clamp(Math.round(p * 0.55 + r * 0.45), 1, 5);
  }

  function pickTitle(profit, rep, stats) {
    const pack = (name, blurb, id, seal) => ({ name, blurb, id, seal });
    if (profit >= 80000 && rep >= 80) {
      return pack("车商之王", "三十天，钱包和口碑你都没卖。这城里的车位，今晚归你。", "king", "王");
    }
    if (profit >= 46000 && rep >= 74) {
      return pack("金牌车商", "价开得明白，车验得仔细。客户走的时候还会回头给你介绍。", "gold", "金");
    }
    if (stats.platformSales >= 4 && stats.refunds === 0 && rep >= 76 && profit >= 22000) {
      return pack("真车守护者", "保证金没白交。真保障罩着的，是你这种把话说清楚的人。", "guard", "真");
    }
    if (profit >= 68000 && rep < 40) {
      return pack("车市枭雄", "钱赚到了，口碑像烧过的线束。人送外号：别问在哪收的。", "tyrant", "枭");
    }
    if (profit >= 20000 && rep >= 70) {
      return pack("良心车商", "没发横财，但睡得着。车市里这叫真本事。", "good", "善");
    }
    if (profit >= 22000 && rep < 38) {
      return pack("黑心车贩", "利润有点糊味。买家群里，你的名字后面跟着问号。", "evil", "黑");
    }
    if (profit >= 20000 && rep >= 50 && rep < 72) {
      return pack("合格车商", "该赚的赚到了，大雷基本绕开了。平稳，也好。", "ok", "稳");
    }
    if (profit >= 20000 && rep >= 38 && rep < 50) {
      return pack("车市老油条", "该装的装了，也没装死。不算好人，算活下来了。", "oil", "油");
    }
    if (profit >= 0 && profit < 22000 && rep >= 70) {
      return pack("邻家老实车商", "小富即安。阿姨们愿意把钥匙交给你。", "neighbor", "邻");
    }
    if (profit < 0 && rep >= 68) {
      return pack("赔本赚吆喝", "口碑响当当，口袋空荡荡。你适合去真车做客服。", "loss", "吆");
    }
    if (profit < 8000 && rep < 40) {
      return pack("黑心车贩", "没赚到多少，名声先塌了。典型的偷鸡不成蚀把米。", "evil", "黑");
    }
    if (profit < 0) {
      return pack("血本无归", "车是雷，价是坑，三十天全踩里面了。", "ruin", "亏");
    }
    return pack("二手车求生者", "没封神，也没躺平。明天还得继续看漆膜。", "survive", "活");
  }

  function nextDay(state) {
    if (state.phase !== "summary") return { ok: false, error: "今天还没打烊" };
    if (state.day >= CONFIG.days) {
      finish(state);
      return { ok: true, ending: true };
    }
    state.day += 1;
    startDay(state);
    return { ok: true, ending: false };
  }

  function chipOf(car, key) {
    if (key === "lien" && car.lienCleared) return "ok";
    const f = car.found[key];
    if (key === "accident") {
      if (f == null) return car.hints.accident ? "sus" : "unk";
      return f > 0 ? "bad" : "ok";
    }
    if (f === true) return "bad";
    if (f === false) return "ok";
    if (car.hints[key]) return "sus";
    return "unk";
  }

  function estimate(car, state) {
    const checks = ["paint", "service", "insurance", "drive"].filter((k) => car.checked[k]).length;
    const any =
      car.found.rollback ||
      car.found.flood ||
      car.found.fire ||
      car.found.lien ||
      (typeof car.found.accident === "number" && car.found.accident > 0) ||
      car.hints.rollback ||
      car.hints.fire ||
      car.hints.accident;
    if (!checks && !any) return null;
    const known = valueOf(car, state, "known");
    const face = valueOf(car, state, "face");
    const truth = valueOf(car, state, "true");
    let mid = known;
    if (checks >= 4) mid = truth * 0.55 + known * 0.45;
    else if (checks >= 1) mid = known * 0.75 + face * 0.25;
    const err = checks >= 4 ? 0.045 : checks === 3 ? 0.08 : checks === 2 ? 0.12 : 0.18;
    // If a serious defect is confirmed, trust known value more.
    if (car.found.flood || car.found.fire || (typeof car.found.accident === "number" && car.found.accident >= 2) || car.found.rollback) {
      mid = known;
    }
    return { low: yuan(mid * (1 - err)), high: yuan(mid * (1 + err)), checks };
  }

  function publicCar(state, car, where) {
    const est = estimate(car, state);
    const wet = car.prep.respray === "wet";
    return {
      uid: car.uid,
      brand: car.brand,
      name: car.name,
      body: car.body,
      tag: car.tag,
      color: car.color,
      colorName: car.colorName,
      age: car.age,
      year: car.year,
      kmShown: car.kmShown,
      kmText: formatKm(car.kmShown),
      kmRealText: car.found.rollback ? formatKm(car.kmReal) : null,
      asking: car.asking,
      buyPrice: car.buyPrice,
      heldDays: car.heldDays || 0,
      urgent: !!car.urgent,
      ownerName: car.ownerName,
      pitch: car.pitch,
      tutorial: !!car.tutorial,
      chips: {
        rollback: chipOf(car, "rollback"),
        flood: chipOf(car, "flood"),
        accident: chipOf(car, "accident"),
        fire: chipOf(car, "fire"),
        lien: chipOf(car, "lien"),
      },
      accidentLevel: typeof car.found.accident === "number" ? car.found.accident : null,
      reports: car.reports.slice(),
      checked: Object.assign({}, car.checked),
      prep: {
        polish: car.prep.polish,
        respray: car.prep.respray,
        parts: car.prep.parts,
        wet,
        lienCleared: car.lienCleared,
      },
      lienAmount: car.found.lien && !car.lienCleared ? car.defects.lienAmount : null,
      pendingCounter: car.pendingCounter,
      counterText: car.counterText || "",
      closed: car.noDealDay === state.day,
      est,
      where,
      stigma: !!car.stigma,
    };
  }

  function suggestedAsk(state, car, honest) {
    const basis = honest ? valueOf(car, state, "known") : valueOf(car, state, "face");
    return yuan(basis * 1.08);
  }

  function moodOf(h) {
    if (!h) return "warm";
    if (h.offer >= h.ask) return "hot";
    if (h.ask <= h.maxPay * 0.98) return "hot";
    if (h.ask <= h.maxPay * 1.06) return "warm";
    return "cold";
  }

  function view(state) {
    const m = marketMult(state);
    let marketLabel = "行情平稳";
    let marketTone = "flat";
    if (state.buff && state.buff.until >= state.day) {
      marketLabel = state.buff.label + (state.buff.mult > 1 ? " +" : " ") + Math.round((state.buff.mult - 1) * 100) + "%";
      marketTone = state.buff.mult > 1 ? "hot" : "cold";
    }
    return {
      day: state.day,
      days: CONFIG.days,
      cash: state.cash,
      rep: state.rep,
      deposit: state.deposit,
      marketLabel,
      marketTone,
      marketMult: m,
      phase: state.phase,
      tutorialDone: !!state.tutorialDone,
      seenTip: Object.assign({}, state.seenTip),
      limits: {
        drives: state.today.drives,
        drivesMax: CONFIG.drivesPerDay,
        buys: state.today.buys,
        buysMax: CONFIG.buysPerDay,
        sales: state.today.sales,
        salesMax: CONFIG.salesPerDay,
        lot: state.inventory.length,
        lotMax: CONFIG.lotSize,
        freeInspect: !!state.today.freeInspect,
      },
      listings: state.listings.map((c) => publicCar(state, c, "market")),
      inventory: state.inventory.map((c) => publicCar(state, c, "lot")),
      event: state.event,
      summary: state.summary,
      ending: state.ending,
      haggle: state.haggle
        ? {
            uid: state.haggle.uid,
            type: state.haggle.type,
            buyerName: state.haggle.buyerName,
            title: state.haggle.title,
            line: state.haggle.line,
            ask: state.haggle.ask,
            offer: state.haggle.offer,
            round: state.haggle.round,
            giftUsed: state.haggle.giftUsed,
            reportUsed: state.haggle.reportUsed,
            honest: state.haggle.honest,
            viaPlatform: state.haggle.viaPlatform,
            done: state.haggle.done,
            resultText: state.haggle.resultText,
            cashDelta: state.haggle.cashDelta,
            mood: moodOf(state.haggle),
            carName: (function () {
              const c = findInv(state, state.haggle.uid);
              return c ? labelOf(c) : "";
            })(),
          }
        : null,
      platform: {
        joined: state.platformJoined,
        active: state.platformActive,
        deposit: state.deposit,
        need: CONFIG.deposit,
        topUp: Math.max(0, CONFIG.deposit - state.deposit),
      },
      log: state.log.slice(0, 4),
      overhead: CONFIG.dailyOverhead,
      netBook: state.cash + state.deposit + bookInventory(state),
    };
  }

  function bookInventory(state) {
    return state.inventory.reduce((s, c) => s + (c.buyPrice || 0), 0);
  }

  function markTip(state, key) {
    if (!state.seenTip) state.seenTip = {};
    state.seenTip[key] = true;
    return { ok: true };
  }

  function setTutorial(state, done) {
    state.tutorialDone = !!done;
    return { ok: true };
  }

  return {
    CONFIG,
    MODELS,
    newGame,
    loadSave,
    inspect,
    buy,
    acceptCounter,
    declineCounter,
    prep,
    prepCost,
    joinPlatform,
    beginHaggle,
    haggleAction,
    closeHaggle,
    endDay,
    nextDay,
    chooseEvent,
    quoteBuy,
    suggestedAsk,
    view,
    formatYuan,
    formatWan,
    formatKm,
    markTip,
    setTutorial,
    valueOf,
    marketMult,
  };
});
