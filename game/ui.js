/* 二手车商模拟器 UI. Talks to ./engine.js via window.DealerGame. */
(function () {
  "use strict";
  const G = window.DealerGame;
  if (!G) {
    document.getElementById("app").innerHTML = "<p style=\"padding:24px;font-weight:800\">引擎没加载。请确认 engine.js 和本页在同一目录。</p>";
    return;
  }
  const SAVE = "ershouche-dealer-save-v1";
  const MUTE = "ershouche-dealer-mute";
  const app = document.getElementById("app");

  const ui = {
    screen: "title",
    tab: "market",
    openUid: null,
    toast: null,
    toastBad: false,
    help: false,
    menu: false,
    confirmNew: false,
    showTutorial: false,
    tutorialIndex: 0,
    mute: localStorage.getItem(MUTE) === "1",
    ask: {},
    askDirty: {},
    honest: {},
    platformOn: {},
  };

  let state = null;
  let audioCtx = null;

  const TUTORIAL = [
    {
      title: "欢迎来当车商",
      text: "你租下一个车位，口袋里 10 万。干满 30 天，按利润和口碑封号。从邻家老实人到车商之王，或者……黑心车贩。",
    },
    {
      title: "车主的嘴",
      text: "每天来 3 到 4 台车。品牌、年限、表显公里、要价，再加一段说辞。说辞好听，不代表车干净。",
    },
    {
      title: "验车四件套",
      text: "漆面看事故，保养对公里（抓调表），出险查出过的险，试驾闻泡水、查火烧、对登记证上的抵押。试驾一天只能开两台，挑最可疑的。",
    },
    {
      title: "整备与卖车",
      text: "抛光、换件、喷漆能抬价。喷漆遮得住小蹭，遮不住泡水，也骗不过懂车帝。买家有四种：砍价狂、土豪、懂车帝、同行。亏本的价可以直接送客。",
    },
    {
      title: "真车平台",
      text: "真车APP 收一笔保证金，买家也交。走平台成交，真保障只罩把已知问题说清楚的人。藏瑕疵，保证金替买家出头。一天收一台、卖一台，打烊扣盒饭和车位费。",
    },
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function persist() {
    if (state) localStorage.setItem(SAVE, JSON.stringify(state));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE);
      if (!raw) return null;
      return G.loadSave(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  function flash(text, bad) {
    ui.toast = text;
    ui.toastBad = !!bad;
    clearTimeout(flash._t);
    flash._t = setTimeout(function () {
      ui.toast = null;
      render();
    }, 1700);
  }

  function beep(freq, dur, type) {
    if (ui.mute) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type || "square";
      o.frequency.value = freq;
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      o.stop(audioCtx.currentTime + dur);
    } catch (e) {
      /* autoplay or missing audio is fine */
    }
  }

  function coin() {
    beep(520, 0.08, "square");
    setTimeout(function () { beep(780, 0.1, "square"); }, 90);
  }

  function run(fn) {
    let res = {};
    try {
      res = fn() || {};
    } catch (err) {
      console.error(err);
      res = { ok: false, error: "出了点岔子" };
    }
    if (res.toast) {
      flash(res.toast, false);
      if (res.status === "bought" || res.status === "sold") coin();
      else beep(440, 0.05, "square");
    } else if (res.ok === false && res.error) {
      flash(res.error, true);
      beep(180, 0.12, "sawtooth");
    }
    if (res.status === "bought") {
      ui.tab = "lot";
      ui.openUid = null;
    }
    persist();
    render();
    return res;
  }

  function rawCar(uid) {
    if (!state) return null;
    return state.inventory.find(function (c) { return c.uid === uid; }) ||
      state.listings.find(function (c) { return c.uid === uid; }) ||
      null;
  }

  function signedWan(n) {
    const t = G.formatWan(n);
    return n > 0 ? "+" + t : t;
  }

  function carSVG(car) {
    const body = car.body || "sedan";
    const fill = car.color || "#ddd";
    const roof = body === "suv" || body === "mpv" ? 16 : body === "sport" ? 26 : 20;
    const top = body === "mpv" ? 18 : roof;
    const nose = body === "sport" ? 168 : 160;
    return (
      '<svg viewBox="0 0 180 78" width="100%" aria-hidden="true">' +
      '<ellipse cx="90" cy="70" rx="58" ry="5" fill="rgba(36,25,16,.18)"/>' +
      '<path d="M22 52 L36 ' + top + ' H118 L' + nose + ' 52 V60 H22 Z" fill="' + esc(fill) + '" stroke="#241910" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M58 ' + (top + 2) + ' H108 L122 46 H48 Z" fill="#c5e8ff" stroke="#241910" stroke-width="3"/>' +
      '<circle cx="52" cy="60" r="11" fill="#241910"/>' +
      '<circle cx="52" cy="60" r="5" fill="#f4efe6"/>' +
      '<circle cx="128" cy="60" r="11" fill="#241910"/>' +
      '<circle cx="128" cy="60" r="5" fill="#f4efe6"/>' +
      '<rect x="24" y="46" width="8" height="6" fill="#ffe08a" stroke="#241910"/>' +
      "</svg>"
    );
  }

  function portrait(type, mood) {
    const skin = "#f3c7a1";
    const mouth = mood === "hot" ? "M78 118 Q100 136 122 118" : mood === "cold" ? "M78 128 Q100 112 122 128" : "M80 122 H120";
    const brow = mood === "cold" ? "M70 78 L92 86 M130 86 L108 78" : "M70 82 H92 M108 82 H130";
    let extra = "";
    if (type === "kan") {
      extra = '<rect x="64" y="86" width="72" height="16" rx="6" fill="#241910"/><rect x="70" y="90" width="24" height="8" fill="#7ec8ff"/><rect x="106" y="90" width="24" height="8" fill="#7ec8ff"/>';
    } else if (type === "tuhao") {
      extra = '<rect x="58" y="84" width="84" height="18" rx="6" fill="#241910"/><path d="M40 150 H160" stroke="#e23d3d" stroke-width="10"/><circle cx="150" cy="168" r="8" fill="#f0b429" stroke="#241910"/>';
    } else if (type === "dong") {
      extra = '<circle cx="84" cy="96" r="16" fill="none" stroke="#241910" stroke-width="3"/><circle cx="116" cy="96" r="16" fill="none" stroke="#241910" stroke-width="3"/><path d="M100 96 H100" stroke="#241910" stroke-width="3"/><rect x="118" y="140" width="36" height="46" fill="#fff" stroke="#241910" stroke-width="3"/>';
    } else {
      extra = '<path d="M60 70 H140 L132 88 H68 Z" fill="#3a6ea5" stroke="#241910" stroke-width="3"/><rect x="128" y="150" width="22" height="16" rx="3" fill="#cfe7c8" stroke="#241910"/>';
    }
    return (
      '<svg viewBox="0 0 200 210" width="100%" aria-hidden="true">' +
      '<rect x="48" y="132" width="104" height="70" rx="16" fill="' + (type === "tuhao" ? "#e23d3d" : type === "peer" ? "#5e7a4e" : "#2c6cb0") + '" stroke="#241910" stroke-width="3"/>' +
      '<circle cx="100" cy="96" r="52" fill="' + skin + '" stroke="#241910" stroke-width="3"/>' +
      "<path d=\"" + brow + '" stroke="#241910" stroke-width="3" fill="none"/>' +
      '<circle cx="84" cy="100" r="4" fill="#241910"/><circle cx="116" cy="100" r="4" fill="#241910"/>' +
      '<path d="' + mouth + '" stroke="#241910" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      extra +
      "</svg>"
    );
  }

  function chipHtml(car) {
    const meta = [
      ["rollback", "调表"],
      ["flood", "泡水"],
      ["accident", "事故"],
      ["fire", "火烧"],
      ["lien", "抵押"],
    ];
    return (
      '<div class="chips">' +
      meta
        .map(function (pair) {
          const key = pair[0];
          const val = car.chips[key];
          let label = "未查";
          if (val === "ok") label = key === "lien" && car.prep.lienCleared ? "已解押" : "正常";
          if (val === "sus") label = "存疑";
          if (val === "bad") {
            if (key === "accident") {
              label = car.accidentLevel >= 3 ? "大事故" : car.accidentLevel === 2 ? "事故" : "小剐蹭";
            } else label = "中招";
          }
          return '<span class="chip ' + val + '" data-chip="' + key + '" data-val="' + val + '">' + pair[1] + "·" + label + "</span>";
        })
        .join("") +
      "</div>"
    );
  }

  function hud(v) {
    const dots = [];
    for (let i = 1; i <= v.days; i++) dots.push("<i class=\"" + (i <= v.day ? "on" : "") + "\"></i>");
    return (
      '<header class="hud">' +
      '<div class="hud-top">' +
      '<div class="daypill" data-day="' + v.day + '">第 ' + v.day + "/" + v.days + " 天</div>" +
      '<div class="cash" data-cash="' + v.cash + '">' + esc(G.formatYuan(v.cash)) + "</div>" +
      '<button class="iconbtn" data-act="mute" aria-label="声音">' + (ui.mute ? "静音" : "声音") + "</button>" +
      '<button class="iconbtn" data-act="menu" aria-label="菜单">菜单</button>' +
      "</div>" +
      '<div class="hud-bot">' +
      '<div class="rep"><span data-rep="' + v.rep + '">口碑 ' + v.rep + '</span><div class="repbar"><i style="width:' + v.rep + '%"></i></div></div>' +
      '<div class="market ' + v.marketTone + '">' + esc(v.marketLabel) + "</div>" +
      "</div>" +
      '<div class="limits">试驾 ' + v.limits.drives + "/" + v.limits.drivesMax +
      " · 收车 " + v.limits.buys + "/" + v.limits.buysMax +
      " · 卖车 " + v.limits.sales + "/" + v.limits.salesMax +
      " · 车位 " + v.limits.lot + "/" + v.limits.lotMax +
      (v.limits.freeInspect ? " · 报告免费" : "") +
      "</div>" +
      '<div class="dots" aria-hidden="true">' + dots.join("") + "</div>" +
      "</header>"
    );
  }

  function marketList(v) {
    if (!v.listings.length) return '<div class="empty">今天的车源看完了。<br>去车位整备，或者打烊。</div>';
    return v.listings
      .map(function (car) {
        return (
          '<button class="car-card" data-act="open" data-uid="' + car.uid + '">' +
          (car.tutorial && v.day === 1 ? '<span class="ribbon">先看这台</span>' : "") +
          '<div>' + carSVG(car) + "</div>" +
          "<div><div>" +
          (car.urgent ? '<span class="badge">急售</span>' : "") +
          (car.closed ? '<span class="badge bad">今天谈崩</span>' : "") +
          '<h3 class="name">' + esc(car.brand + " " + car.name) + "</h3></div>" +
          '<div class="sub">' + car.year + "年 · " + esc(car.kmText) + "</div>" +
          '<p class="pitch">「' + esc(car.pitch) + "」</p></div>" +
          '<div class="price-tag"><small>要价</small>' + esc(G.formatWan(car.asking)) + "</div>" +
          "</button>"
        );
      })
      .join("");
  }

  function detail(v, car) {
    const quote = G.quoteBuy(state, car.uid);
    const checks = [
      ["paint", "漆面", "看事故"],
      ["service", "保养", "抓调表"],
      ["insurance", "出险", "查赔付"],
      ["drive", "试驾", "闻味对证"],
    ];
    const tools = checks
      .map(function (row) {
        const kind = row[0];
        const cost = v.limits.freeInspect && kind !== "drive" ? 0 : G.CONFIG.inspect[kind];
        const done = car.checked[kind];
        const driveOut = kind === "drive" && !done && v.limits.drives >= v.limits.drivesMax;
        return (
          '<button class="tool' + (done ? " done" : "") + '" data-act="inspect" data-kind="' + kind + '" data-uid="' + car.uid + '"' +
          (done || driveOut ? " disabled" : "") + ">" +
          "<b>" + row[1] + "</b><small>" + row[2] + "</small><small>" +
          (done ? "已出报告" : driveOut ? "今天开够了" : cost ? esc(G.formatYuan(cost)) : "免费") +
          "</small></button>"
        );
      })
      .join("");
    const reports = (car.reports || [])
      .map(function (r) {
        const name = { paint: "漆面", service: "保养", insurance: "出险", drive: "试驾" }[r.kind] || "";
        return '<div class="report"><b>' + name + "。</b>" + esc(r.text) + "</div>";
      })
      .join("");
    let est = '<div class="est">还没验。这是开盲盒。</div>';
    if (car.est) {
      const asking = car.asking;
      let judge = "要价落在估价里，有的谈。";
      if (asking > car.est.high) judge = "要价比估价高，肉不多。";
      if (asking < car.est.low) judge = "便宜得有点邪门，先问自己为什么。";
      est = '<div class="est">心里估价 ' + esc(G.formatWan(car.est.low)) + " ~ " + esc(G.formatWan(car.est.high)) + "<br>" + judge + "</div>";
    }
    let buy = "";
    if (quote) {
      if (quote.pending) {
        buy =
          '<div class="owner"><b>' + esc(car.ownerName) + "还价 " + esc(G.formatWan(quote.pending)) + "</b><div>" + esc(car.counterText) + "</div></div>" +
          '<div class="buygrid">' +
          '<button class="btn primary" data-act="accept-counter" data-uid="' + car.uid + '">按还价收</button>' +
          '<button class="btn ghost" data-act="decline-counter" data-uid="' + car.uid + '">这单算了</button></div>';
      } else if (quote.block) {
        buy = '<p class="hintline">' + esc(quote.block) + "</p>";
      } else {
        buy =
          '<div class="buygrid">' +
          '<button class="btn primary" data-act="buy" data-mode="haggle" data-uid="' + car.uid + '"' + (quote.canHaggle ? "" : " disabled") + ">砍一刀 " + esc(G.formatWan(quote.haggle)) + "</button>" +
          '<button class="btn ghost" data-act="buy" data-mode="full" data-uid="' + car.uid + '"' + (quote.canFull ? "" : " disabled") + ">按要价 " + esc(G.formatWan(quote.full)) + "</button>" +
          "</div>";
        if (quote.expose != null) {
          buy += '<button class="btn gold" data-act="buy" data-mode="expose" data-uid="' + car.uid + '"' + (quote.canExpose ? "" : " disabled") + ">指出问题压价 " + esc(G.formatWan(quote.expose)) + "</button>";
        }
      }
    }
    return (
      '<button class="back" data-act="back">← 返回车源</button>' +
      '<div class="detail-head"><div>' + carSVG(car) + '</div><div>' +
      '<div class="sub">' + esc(car.ownerName) + " · " + car.year + "年 · " + esc(car.colorName) + "</div>" +
      '<h2 class="display" style="font-size:28px;margin:2px 0">' + esc(car.brand + car.name) + "</h2>" +
      '<div class="sub">' + esc(car.kmText) + (car.kmRealText ? " · 实际约 " + esc(car.kmRealText) : "") + "</div>" +
      '<div class="price-tag" style="display:inline-block;margin-top:6px"><small>要价</small>' + esc(G.formatWan(car.asking)) + "</div>" +
      "</div></div>" +
      '<div class="owner"><b>' + esc(car.ownerName) + ' 说</b><div>「' + esc(car.pitch) + "」</div></div>" +
      chipHtml(car) + est +
      '<div class="tools">' + tools + "</div>" + reports + buy
    );
  }

  function lot(v) {
    const p = v.platform;
    let banner = "";
    if (!p.joined) {
      banner =
        '<div class="banner"><strong>真车APP · 双向保证金</strong>交 ' + esc(G.formatYuan(p.need)) +
        " 入驻。买家也锁一笔。如实成交有真保障，藏瑕疵会被划走。" +
        '<button class="btn gold" data-act="join">交保证金入驻</button></div>';
    } else if (!p.active) {
      banner =
        '<div class="banner"><strong>档口暂停</strong>保证金被划过，还差 ' + esc(G.formatYuan(p.topUp)) + "。" +
        '<button class="btn gold" data-act="join">补缴保证金</button></div>';
    } else {
      banner = '<div class="banner"><strong>真保障生效中</strong>保证金 ' + esc(G.formatYuan(p.deposit)) + " 锁在平台。结业时退还，违约会被划。</div>";
    }
    if (!v.inventory.length) {
      return banner + '<div class="empty">车位空空，风都是香的。<br>去收一台吧。</div>';
    }
    const cards = v.inventory
      .map(function (car) {
        const raw = rawCar(car.uid);
        const honest = ui.honest[car.uid] !== false;
        if (ui.ask[car.uid] == null || !ui.askDirty[car.uid]) {
          ui.ask[car.uid] = G.suggestedAsk(state, raw, honest);
        }
        const ask = ui.ask[car.uid];
        const via = ui.platformOn[car.uid] !== false && p.active;
        const inflation = (state.today && state.today.prepInflation) || 1;
        function cost(kind) {
          return G.formatYuan(Math.round(G.CONFIG.prep[kind] * inflation));
        }
        let prep = '<div class="mini">';
        prep += '<button data-act="prep" data-kind="polish" data-uid="' + car.uid + '"' + (car.prep.polish ? " disabled" : "") + ">抛光 " + (car.prep.polish ? "好了" : cost("polish")) + "</button>";
        prep += '<button data-act="prep" data-kind="parts" data-uid="' + car.uid + '"' + (car.prep.parts ? " disabled" : "") + ">换件 " + (car.prep.parts ? "好了" : cost("parts")) + "</button>";
        prep += '<button data-act="prep" data-kind="respray" data-uid="' + car.uid + '"' + (car.prep.respray !== "no" ? " disabled" : "") + ">" +
          (car.prep.respray === "wet" ? "漆未干" : car.prep.respray === "done" ? "已喷漆" : "喷漆 " + cost("respray")) + "</button>";
        if (car.lienAmount) {
          prep += '<button data-act="prep" data-kind="lien" data-uid="' + car.uid + '">解押 ' + esc(G.formatYuan(car.lienAmount)) + "</button>";
        }
        prep += "</div>";
        let sell;
        if (car.prep.wet) {
          sell = '<p class="hintline">漆还没干，明天才能见人。</p>';
        } else if (v.limits.sales >= v.limits.salesMax) {
          sell = '<p class="hintline">今天的买家接待完了。</p>';
        } else {
          sell =
            '<div class="row" style="margin-top:8px"><span class="sub">开价</span><div class="stepper">' +
            '<button data-act="ask-dec" data-uid="' + car.uid + '" aria-label="降价">−</button>' +
            '<div class="asknum">' + esc(G.formatWan(ask)) + "</div>" +
            '<button data-act="ask-inc" data-uid="' + car.uid + '" aria-label="加价">+</button></div></div>' +
            '<div class="toggles">' +
            '<button data-act="toggle-honest" data-uid="' + car.uid + '" class="' + (honest ? "on" : "") + '" aria-pressed="' + honest + '">' + (honest ? "如实告知" : "当靓车卖") + "</button>" +
            '<button data-act="toggle-platform" data-uid="' + car.uid + '" class="' + (via ? "on" : "") + '" ' + (p.active ? "" : "disabled") + ">" + (p.active ? (via ? "走真车" : "私下卖") : "未入驻") + "</button>" +
            "</div>" +
            '<button class="btn primary" data-act="sell" data-uid="' + car.uid + '">开价迎客</button>';
        }
        return (
          '<article class="lot-card">' +
          '<div class="row"><div style="width:120px">' + carSVG(car) + "</div><div>" +
          "<h3 class=\"name\" style=\"margin:0\">" + esc(car.brand + " " + car.name) + "</h3>" +
          '<div class="sub">买入 ' + esc(G.formatYuan(car.buyPrice || 0)) + " · 在库 " + car.heldDays + " 天" +
          (car.stigma ? " · 退车车" : "") + "</div>" +
          (car.est ? '<div class="sub">估价 ' + esc(G.formatWan(car.est.low)) + " ~ " + esc(G.formatWan(car.est.high)) + "</div>" : '<div class="sub">还没验透</div>') +
          "</div></div>" +
          chipHtml(car) + prep + sell +
          "</article>"
        );
      })
      .join("");
    return banner + cards;
  }

  function haggleScreen(v) {
    const h = v.haggle;
    const car = v.inventory.find(function (c) { return c.uid === h.uid; }) || v.listings.find(function (c) { return c.uid === h.uid; });
    const moodName = { hot: "眼神发亮，快成了", warm: "还在犹豫", cold: "脸色发沉，可能要走" }[h.mood] || "";
    if (h.done) {
      return (
        '<div class="haggle-top"><div>' + portrait(h.type, h.done === "sold" ? "hot" : "cold") + "</div><div>" +
        '<div class="sub">' + esc(h.title) + "</div><h2 class=\"who\">" + esc(h.buyerName) + "</h2></div></div>" +
        '<div class="bubble" style="margin-top:8px">' + esc(h.resultText) + "</div>" +
        '<button class="btn primary" data-act="close-haggle" style="margin-top:16px">' + (h.done === "sold" ? "把钥匙交出去" : "送走，车还在") + "</button>"
      );
    }
    let hint = "";
    if (car && car.buyPrice != null) {
      const diff = h.offer - car.buyPrice;
      hint = diff < 0 ? "按这口价会亏 " + G.formatWan(-diff) : diff < 1500 ? "薄利 " + G.formatWan(diff) : "这口价大约赚 " + G.formatWan(diff);
    }
    const left = Math.max(0, 3 - h.round);
    return (
      '<div class="haggle-top"><div>' + portrait(h.type, h.mood) + "</div><div>" +
      '<div class="sub">' + esc(h.title) + " · " + esc(h.carName) + "</div>" +
      '<h2 class="who">' + esc(h.buyerName) + "</h2>" +
      '<div class="sub">第 ' + (h.round + 1) + " / 3 轮 · 还剩 " + left + " 次拉扯</div></div></div>" +
      '<div class="bubble" style="margin-top:10px">' + esc(h.line) + "</div>" +
      '<div class="prices"><div><span class="sub">你的开价</span><b>' + esc(G.formatWan(h.ask)) + "</b></div>" +
      "<div><span class=\"sub\">对方出价</span><b>" + esc(G.formatWan(h.offer)) + "</b></div></div>" +
      '<div class="mood ' + h.mood + '">' + moodName + "</div>" +
      '<div class="hintline">' + esc(hint) + "</div>" +
      '<div class="buygrid">' +
      '<button class="btn primary" data-act="haggle" data-move="accept">按他的价成交</button>' +
      '<button class="btn ghost" data-act="haggle" data-move="walk">送客</button>' +
      '<button class="btn" data-act="haggle" data-move="meet">让一步</button>' +
      '<button class="btn" data-act="haggle" data-move="hold">咬住价格</button>' +
      "</div>" +
      '<div class="buygrid">' +
      '<button class="btn gold" data-act="haggle" data-move="gift"' + (h.giftUsed ? " disabled" : "") + ">送油卡 " + esc(G.formatYuan(G.CONFIG.giftCost)) + "</button>" +
      '<button class="btn" data-act="haggle" data-move="report"' + (h.reportUsed ? " disabled" : "") + ">亮出报告</button>" +
      "</div>"
    );
  }

  function eventSheet(ev) {
    const choices = (ev.choices || [])
      .map(function (c) {
        return '<button class="choice" data-act="choice" data-id="' + esc(c.id) + '">' + esc(c.label) + (c.hint ? "<small>" + esc(c.hint) + "</small>" : "") + "</button>";
      })
      .join("");
    return (
      '<div class="modal-back"><div class="sheet" role="dialog">' +
      '<div class="kicker">今日突发</div><h2>' + esc(ev.title) + "</h2><p>" + esc(ev.text) + "</p>" + choices +
      "</div></div>"
    );
  }

  function summary(v) {
    const s = v.summary;
    const lines = (s.lines || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    const last = v.day >= v.days;
    return (
      '<div class="summary"><div class="kicker">第 ' + s.day + ' 天打烊</div>' +
      "<h2 class=\"display\" style=\"font-size:30px;margin:6px 0\">" + esc(s.joke) + "</h2>" +
      "<p>盒饭和车位 " + esc(G.formatYuan(s.overhead)) + "。现金还剩 " + esc(G.formatYuan(s.cash)) + "。</p>" +
      (lines ? "<ul>" + lines + "</ul>" : "<p class=\"muted\">今天风平浪静，车位看着你。</p>") +
      "</div>" +
      '<button class="btn primary" data-act="next-day">' + (last ? "三十天到了，看结局" : "睡觉，进入下一天") + "</button>"
    );
  }

  function ending(v) {
    const e = v.ending;
    const stars = "★★★★★".slice(0, e.stars) + "☆☆☆☆☆".slice(0, 5 - e.stars);
    const profitCls = e.profit >= 0 ? "profit-plus" : "profit-minus";
    const notes = (e.notes || []).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
    return (
      '<article class="result-card" id="result-card" data-title="' + esc(e.title.name) + '">' +
      '<div class="result-top"><div><div class="kicker">二手车商营业执照</div><div class="sub">30天模拟经营</div></div>' +
      '<div class="seal" aria-hidden="true">' + esc(e.title.seal) + "</div></div>" +
      "<h2>" + esc(e.title.name) + "</h2>" +
      '<div class="stars" aria-label="' + e.stars + '星">' + stars + "</div>" +
      '<p class="blurb">' + esc(e.title.blurb) + "</p>" +
      '<div class="statgrid">' +
      '<div><b class="' + profitCls + '">' + esc(signedWan(e.profit)) + "</b><span>净利润</span></div>" +
      "<div><b>" + e.rep + "</b><span>口碑</span></div>" +
      "<div><b>" + e.stats.sold + " 台</b><span>成交</span></div>" +
      "<div><b>" + e.stats.refunds + " 次</b><span>退车</span></div>" +
      "</div>" +
      '<p class="blurb" style="font-size:13px">' + esc(e.recap) + "</p>" +
      notes +
      '<div class="card-foot"><span class="slogan">真车源·真车商·真保障</span><span>边豪 出品</span></div>' +
      '<div class="barcode" aria-hidden="true"></div>' +
      "</article>" +
      '<p class="logline">结业现金 ' + esc(G.formatYuan(e.finalCash)) +
      " · 保证金退回 " + esc(G.formatYuan(e.depositBack)) +
      " · 库存甩卖 " + esc(G.formatYuan(e.liquidation)) +
      " · 最高一单 " + esc(signedWan(e.stats.bestFlip)) + "</p>" +
      '<button class="btn primary" data-act="copy-result">复制战绩</button>' +
      '<button class="btn" data-act="again">再开一局</button>'
    );
  }

  function tutorialSheet() {
    const step = TUTORIAL[ui.tutorialIndex];
    return (
      '<div class="modal-back"><div class="sheet" role="dialog" aria-label="新手引导">' +
      '<div class="kicker">新手 ' + (ui.tutorialIndex + 1) + " / " + TUTORIAL.length + "</div>" +
      "<h2>" + esc(step.title) + "</h2><p>" + esc(step.text) + "</p>" +
      '<button class="btn primary" data-act="tutorial-next">' + (ui.tutorialIndex === TUTORIAL.length - 1 ? "开门营业" : "下一步") + "</button>" +
      '<button class="btn ghost" data-act="skip-tutorial">跳过，我熟</button>' +
      "</div></div>"
    );
  }

  function helpSheet() {
    return (
      '<div class="modal-back"><div class="sheet help" role="dialog"><h2>怎么玩</h2>' +
      "<p>每天看 3 到 4 台车。先验再买。一天只能收一台、卖一台，试驾两台。</p>" +
      "<p>漆面 → 事故。保养记录 → 调表。出险记录 → 报过的险（私了查不到）。试驾 → 泡水、火烧、抵押。</p>" +
      "<p>整备能让车更好卖。已知问题建议如实告知。走真车平台要交保证金，真保障护老实人，藏雷会被罚。</p>" +
      "<p>买家：砍价狂爱压价，土豪痛快，懂车帝随身带漆膜仪，同行只出批发价。亏了可以送客。</p>" +
      "<p>30 天结束，利润和口碑一起算。两个都高，才是车商之王。</p>" +
      '<button class="btn" data-act="close-help">知道了</button></div></div>'
    );
  }

  function menuSheet() {
    return (
      '<div class="modal-back"><div class="sheet" role="dialog"><h2>菜单</h2>' +
      '<button class="btn" data-act="open-help">怎么玩</button>' +
      '<button class="btn" data-act="to-title">回标题（进度已自动存）</button>' +
      '<button class="btn danger" data-act="ask-restart">新开一局</button>' +
      '<button class="btn ghost" data-act="close-menu">继续营业</button></div></div>'
    );
  }

  function titleScreen(hasSave) {
    return (
      '<div class="title-screen" data-screen="title">' +
      '<div class="marquee"><div class="bulb">▲ 收车 · 验车 · 不坑人 ▲</div>' +
      carSVG({ body: "sedan", color: "#e23d3d" }) +
      "</div>" +
      '<div class="title-block"><h1>二手车商<br>模拟器</h1>' +
      '<p class="subtitle">30 天，钱包和口碑你打算保哪一个？</p></div>' +
      (hasSave ? '<button class="btn primary" data-act="continue">继续游戏</button>' : "") +
      '<button class="btn gold" data-act="new">新游戏</button>' +
      '<button class="btn ghost" data-act="open-help">怎么玩</button>' +
      '<p class="slogan">真车源 · 真车商 · 真保障</p>' +
      '<p class="credit">边豪 出品</p>' +
      "</div>"
    );
  }

  function render() {
    const sc = app.querySelector(".scroll");
    const top = sc ? sc.scrollTop : 0;
    const hasSave = !!load() || !!state;
    if (ui.screen === "title" || !state) {
      app.innerHTML = titleScreen(!!load()) + overlay();
      return;
    }
    const v = G.view(state);
    let body = "";
    let dock = "";
    if (v.phase === "ending") {
      body = ending(v);
    } else if (v.phase === "summary") {
      body = summary(v);
    } else if (v.phase === "haggle" && v.haggle) {
      body = '<div data-haggle="1">' + haggleScreen(v) + "</div>";
    } else if (ui.openUid && v.phase === "play") {
      const car = v.listings.find(function (c) { return c.uid === ui.openUid; });
      if (car) body = detail(v, car);
      else ui.openUid = null;
    }
    if (!body && v.phase !== "ending" && v.phase !== "summary" && v.phase !== "haggle") {
      const tabMarket = ui.tab !== "lot";
      body =
        '<div class="tabs">' +
        '<button data-act="tab" data-tab="market" class="' + (tabMarket ? "on" : "") + '">今日车源 ' + v.listings.length + "</button>" +
        '<button data-act="tab" data-tab="lot" class="' + (!tabMarket ? "on" : "") + '">我的车位 ' + v.inventory.length + "</button>" +
        "</div>" +
        (tabMarket ? marketList(v) : lot(v));
    }
    if (v.phase === "play") {
      dock = '<footer class="dock"><button data-act="end-day">打烊 · 盒饭和车位 ' + esc(G.formatYuan(v.overhead)) + "</button></footer>";
    }
    const tip = tipBanner(v);
    app.setAttribute("data-screen", v.phase);
    app.innerHTML =
      hud(v) +
      (ui.toast && v.phase !== "ending" ? '<div class="toast' + (ui.toastBad ? " bad" : "") + '">' + esc(ui.toast) + "</div>" : "") +
      '<main class="scroll">' + tip + body + "</main>" +
      dock +
      overlay(v);
    const sc2 = app.querySelector(".scroll");
    if (sc2) sc2.scrollTop = top;
  }

  function tipBanner(v) {
    if (ui.showTutorial) return "";
    if (v.phase === "play" && ui.openUid && !v.seenTip.detail && v.day === 1) {
      const open = v.listings.find(function (c) { return c.uid === ui.openUid; });
      if (open && open.tutorial) {
        return '<div class="banner"><strong>练手</strong>王姐这台轩逸适合第一单。先试驾，再决定掏钱。<button class="btn ghost" data-act="tip" data-tip="detail">懂了</button></div>';
      }
    }
    if (v.phase === "haggle" && v.haggle && !v.haggle.done && !v.seenTip.haggle) {
      return '<div class="banner"><strong>砍价</strong>眼神发亮可以成交。会亏的价直接送客，明天还有下一位。<button class="btn ghost" data-act="tip" data-tip="haggle">懂了</button></div>';
    }
    return "";
  }

  function overlay(v) {
    if (ui.help) return helpSheet();
    if (ui.confirmNew) {
      return (
        '<div class="modal-back"><div class="sheet"><h2>丢掉这档进度？</h2><p>现在的存档会被盖掉。</p>' +
        '<button class="btn danger" data-act="confirm-new">新开一局</button>' +
        '<button class="btn ghost" data-act="cancel-new">还是算了</button></div></div>'
      );
    }
    if (ui.menu) return menuSheet();
    if (ui.showTutorial && state && !state.tutorialDone) return tutorialSheet();
    if (v && v.phase === "event" && v.event) return eventSheet(v.event);
    return "";
  }

  function stepSize(n) {
    if (n >= 200000) return 5000;
    if (n >= 80000) return 2000;
    return 1000;
  }

  function shareText() {
    const e = state.ending;
    if (!e) return "";
    return [
      "我在《二手车商模拟器》干了30天",
      "结局：" + e.title.name,
      "利润 " + signedWan(e.profit) + " · 口碑 " + e.rep,
      "成交 " + e.stats.sold + " 台 · 退车 " + e.stats.refunds + " 次",
      "真车源·真车商·真保障",
      "边豪 出品",
    ].join("\n");
  }

  function startNew() {
    state = G.newGame();
    ui.screen = "play";
    ui.tab = "market";
    ui.openUid = null;
    ui.showTutorial = true;
    ui.tutorialIndex = 0;
    ui.menu = false;
    ui.confirmNew = false;
    ui.ask = {};
    ui.askDirty = {};
    ui.honest = {};
    ui.platformOn = {};
    persist();
    render();
  }

  app.addEventListener("click", function (ev) {
    const el = ev.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const act = el.dataset.act;
    if (act === "mute") {
      ui.mute = !ui.mute;
      localStorage.setItem(MUTE, ui.mute ? "1" : "0");
      render();
      return;
    }
    if (act === "open-help") {
      ui.help = true;
      ui.menu = false;
      render();
      return;
    }
    if (act === "close-help") {
      ui.help = false;
      render();
      return;
    }
    if (act === "menu") {
      ui.menu = true;
      render();
      return;
    }
    if (act === "close-menu") {
      ui.menu = false;
      render();
      return;
    }
    if (act === "new") {
      if (load()) {
        ui.confirmNew = true;
        render();
      } else startNew();
      return;
    }
    if (act === "ask-restart") {
      ui.menu = false;
      ui.confirmNew = true;
      render();
      return;
    }
    if (act === "cancel-new") {
      ui.confirmNew = false;
      render();
      return;
    }
    if (act === "confirm-new" || act === "again") {
      startNew();
      return;
    }
    if (act === "continue") {
      state = load();
      if (!state) {
        flash("没有存档", true);
        render();
        return;
      }
      ui.screen = "play";
      ui.showTutorial = !state.tutorialDone && state.day === 1 && state.stats.bought === 0 && state.stats.sold === 0;
      render();
      return;
    }
    if (act === "to-title") {
      ui.menu = false;
      ui.screen = "title";
      persist();
      render();
      return;
    }
    if (act === "tutorial-next") {
      if (ui.tutorialIndex >= TUTORIAL.length - 1) {
        ui.showTutorial = false;
        run(function () { return G.setTutorial(state, true); });
      } else {
        ui.tutorialIndex += 1;
        render();
      }
      return;
    }
    if (act === "skip-tutorial") {
      ui.showTutorial = false;
      run(function () { return G.setTutorial(state, true); });
      return;
    }
    if (act === "tip") {
      run(function () { return G.markTip(state, el.dataset.tip); });
      return;
    }
    if (!state) return;
    if (act === "tab") {
      ui.tab = el.dataset.tab;
      ui.openUid = null;
      render();
      return;
    }
    if (act === "open") {
      ui.openUid = el.dataset.uid;
      render();
      return;
    }
    if (act === "back") {
      ui.openUid = null;
      render();
      return;
    }
    if (act === "inspect") {
      run(function () { return G.inspect(state, el.dataset.uid, el.dataset.kind); });
      return;
    }
    if (act === "buy") {
      run(function () { return G.buy(state, el.dataset.uid, el.dataset.mode); });
      return;
    }
    if (act === "accept-counter") {
      run(function () { return G.acceptCounter(state, el.dataset.uid); });
      return;
    }
    if (act === "decline-counter") {
      run(function () { return G.declineCounter(state, el.dataset.uid); });
      return;
    }
    if (act === "prep") {
      run(function () { return G.prep(state, el.dataset.uid, el.dataset.kind); });
      return;
    }
    if (act === "join") {
      run(function () { return G.joinPlatform(state); });
      return;
    }
    if (act === "ask-inc" || act === "ask-dec") {
      const uid = el.dataset.uid;
      const cur = ui.ask[uid] || 0;
      const step = stepSize(cur);
      ui.ask[uid] = Math.max(1000, cur + (act === "ask-inc" ? step : -step));
      ui.askDirty[uid] = true;
      render();
      return;
    }
    if (act === "toggle-honest") {
      const uid = el.dataset.uid;
      ui.honest[uid] = ui.honest[uid] === false;
      ui.askDirty[uid] = false;
      render();
      return;
    }
    if (act === "toggle-platform") {
      const uid = el.dataset.uid;
      ui.platformOn[uid] = ui.platformOn[uid] === false;
      render();
      return;
    }
    if (act === "sell") {
      const uid = el.dataset.uid;
      const raw = rawCar(uid);
      const honest = ui.honest[uid] !== false;
      const ask = ui.ask[uid] || G.suggestedAsk(state, raw, honest);
      const via = ui.platformOn[uid] !== false && state.platformActive;
      run(function () {
        return G.beginHaggle(state, uid, { ask: ask, honest: honest, viaPlatform: via });
      });
      return;
    }
    if (act === "haggle") {
      run(function () { return G.haggleAction(state, el.dataset.move); });
      return;
    }
    if (act === "close-haggle") {
      run(function () { return G.closeHaggle(state); });
      return;
    }
    if (act === "end-day") {
      run(function () { return G.endDay(state); });
      return;
    }
    if (act === "next-day") {
      run(function () { return G.nextDay(state); });
      return;
    }
    if (act === "choice") {
      run(function () { return G.chooseEvent(state, el.dataset.id); });
      return;
    }
    if (act === "copy-result") {
      const text = shareText();
      const done = function () { flash("战绩已复制"); render(); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); });
      } else fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); flash("战绩已复制"); } catch (e) { flash("复制失败，长按战绩截图吧", true); }
    ta.remove();
    render();
  }

  window.__dealer = {
    get state() { return state; },
    ui: ui,
    startNew: startNew,
  };

  state = load();
  render();
})();
