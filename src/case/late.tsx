import { useState } from "react";
import { Shot } from "../components/Shot";
import { PermissionMatrix } from "../components/PermissionMatrix";
import { ConversionPath } from "../components/ConversionPath";
import { Section } from "./Section";
import deposit from "../assets/dialog-deposit.png";
import privacy from "../assets/dialog-privacy.png";
import appeal from "../assets/dialog-appeal.png";
import asc from "../assets/asc-108.png";
import membership from "../assets/membership.png";
import mapping from "../assets/tool-field-mapping.png";
import dealer from "../assets/tool-dealer-match.png";
import folder from "../assets/tool-report-folder.png";
import brandAvg from "../assets/report-brand-avg.png";
import brandTop from "../assets/report-brand-top10.png";
import cityTop from "../assets/report-city-top20.png";

const promptRows = [
  {
    id: "role",
    label: "角色",
    text: "真车二手车平台外呼顾问，专做车商同行交易保障邀约。",
  },
  {
    id: "goal",
    label: "15 秒",
    text: "讲清同行交易保障，加上双向保证金：买卖双方都交，谁违约扣谁。",
  },
  {
    id: "act",
    label: "转化动作",
    text: "不引导去应用商店搜索。引导对方通过已经发过的官网链接下载；没看到，就看垃圾短信或拦截短信。",
  },
  {
    id: "line",
    label: "要记住的一句",
    text: "真车APP，同行交易保障，双向保证金，谁违约扣谁。",
  },
  {
    id: "tone",
    label: "风格",
    text: "务实、直接、不寒暄、不夸大。短句。先自报家门。一次只讲一个重点。客户打断，先回应。",
  },
  {
    id: "fee",
    label: "收费口径",
    text: "现在下载使用免费。保证金交易时才用，固定两千元，完成后返还。",
  },
  {
    id: "ban",
    label: "约束",
    text: "每次回复不超过 3 句。不问库存、利润、销量。不承诺成交和收益。不贬低竞品。不编造数据、城市覆盖或下载量。明确拒绝就结束。不说「应用商店搜索」。",
  },
];

const scenes = [
  "忙",
  "不需要",
  "什么平台",
  "没收到短信",
  "链接安全吗",
  "有合作渠道",
  "发微信",
  "收费吗",
  "保证金多少",
  "沉默",
];

const modules = [
  "登录注册",
  "会员开通",
  "发布车源",
  "浏览搜索",
  "下单保证金",
  "订单状态",
  "首次与非首次发布",
  "批量发布",
  "纠纷申诉",
  "意见反馈",
  "其它",
  "我的界面",
];

const ticks = ["发送", "到达", "点击", "访问", "下载", "安装", "注册", "首次浏览", "首次发布"];

function PromptCard() {
  const [active, setActive] = useState(promptRows[0].id);
  return (
    <div className="prompt">
      {promptRows.map((row) => (
        <button
          key={row.id}
          type="button"
          className={active === row.id ? "prompt-row is-on" : "prompt-row"}
          aria-pressed={active === row.id}
          onClick={() => setActive(row.id)}
        >
          <span className="prompt-label">{row.label}</span>
          <span>{row.text}</span>
        </button>
      ))}
    </div>
  );
}

const benefits = [
  ["发布车源", "不限量"],
  ["找车求购", "免费"],
  ["客户线索", "不限量"],
  ["限时秒杀", "不限量"],
  ["朋友圈", "免费同步"],
  ["电话直达", "免费"],
  ["上新置顶", "免费"],
  ["一键刷新", "免费"],
];

export function Permission() {
  return (
    <Section id="permission" index="05" title="查看权限">
      <p className="source">
        来源：《真车APP｜车源查看权限需求文档》，V1.0.7，2026/5/27。文档状态是「待补充 / 待评审」。
      </p>
      <p>
        这是一份模块需求文档，覆盖车源的查看、详情和权限。它不包含认证流程改造，不包含保证金支付之后的交易规则，也不包含申诉退款。不是一整套产品 PRD，更不是从零做一套账号权限产品。
      </p>
      <p>用户分成三种：游客 / 未登录，已登录未认证车商，已登录已认证车商。</p>
      <p>
        除了价格，其他车辆信息三种状态都展示：图、品牌车型、年款、上牌、里程、所在地、配置、车况、标签、发布时间。价格在未登录时用星号脱敏，例如 <code>**.**万</code>
        。已登录之后，无论认不认证，都看完整价格。认证状态不影响价格。
      </p>
      <PermissionMatrix />
      <p>异常也写进了同一份文档：</p>
      <ul>
        <li>已锁定的车不可再锁。</li>
        <li>已成交的车不可锁。</li>
        <li>已下架的车不可电话，也不可锁。</li>
        <li>车源不存在。</li>
        <li>自己的车不展示锁车，或把锁车禁用。</li>
        <li>认证状态变了，权限要马上刷新。</li>
      </ul>
      <p>
        未登录去点电话、锁车、收藏或订单，应弹窗去登录；登录成功后回到原来的详情，并且价格完整展示。这一项验收没有勾完，不写成已经验证通过。
      </p>
      <p>
        这份模块和商店 1.0.8 的更新说明对得上。更新里写了「优化认证后电话联系、保证金锁车等功能权限体验」，也写了「优化第三方车源电话弹窗提示」。下面这张就是第三方车源还没开保证金时，电话前的提示。
      </p>
      <Shot
        src={deposit}
        alt="第三方车源未开启双向保证金时，电话前的温馨提示"
        width={716}
        height={804}
        variant="dialog"
        caption="第三方车源暂未开启双向保证金时的电话提示。车牌、车商姓名和页面底部信息已从素材里裁掉。"
      />
    </Section>
  );
}

export function Judgments() {
  return (
    <Section id="judgments" index="06" title="四个判断">
      <p>检查表很长。这里只留四件能看出判断方式的事：先认这是哪一类问题，再决定写给开发，还是先跟老板确认。</p>
      <div className="cases">
        <article className="case-card">
          <p className="case-kicker">01 · 流程缺少终点</p>
          <h3>验车完成后没有终点</h3>
          <p>
            <strong>现象。</strong>用户问：验车完成之后的步骤呢？交易怎么完成？
          </p>
          <p>
            <strong>判断。</strong>这是流程缺少终点，不是某个按钮点不动。
          </p>
          <p>
            <strong>怎么写。</strong>继续追规则要不要写完，而不是改一处界面。
          </p>
          <p>
            <strong>结果。</strong>开发二次反馈：「还有什么步骤可以写下来，完成验车是目前设计的最终结果。」
          </p>
        </article>
        <article className="case-card">
          <p className="case-kicker">02 · 规则要跟老板确认</p>
          <h3>买家付了保证金，能不能取消</h3>
          <p>
            <strong>现象。</strong>买家支付之后，在卖家接受之前，也不能自己取消。
          </p>
          <p>
            <strong>判断。</strong>这是要和老板确认的规则，不是我可以直接改的缺陷。
          </p>
          <p>
            <strong>怎么写。</strong>标成待确认。检查表里把「买家取消交易」记为紧急，同时是体验优化。
          </p>
          <p>
            <strong>结果。</strong>二次反馈：「跟你的老板确认下，当时是说只能走申诉退款。」
          </p>
        </article>
        <article className="case-card">
          <p className="case-kicker">03 · 规则形同虚设</p>
          <h3>卖家无法主动联系买家</h3>
          <p>
            <strong>现象。</strong>卖家没有任何可以主动联系买家的渠道。那拒绝交易怎么用？
          </p>
          <p>
            <strong>判断。</strong>联系入口缺失，拒绝这笔交易的规则就落不了地。
          </p>
          <p>
            <strong>怎么写。</strong>方案是锁车之后，给双方都加联系入口。
          </p>
          <p>
            <strong>结果。</strong>二次反馈：已经添加联系入口。
          </p>
        </article>
        <article className="case-card">
          <p className="case-kicker">04 · 资金安全</p>
          <h3>管理端裁决之后，保证金对不上</h3>
          <p>
            <strong>现象。</strong>用真实的小额资金走仲裁，金额是 0.2、0.3、0.5、0.6 元。退款和赔付不一致，有的要人工处理，订单会卡在「裁决执行中」。
          </p>
          <p>
            <strong>判断。</strong>这是资金安全验收，不是普通的界面测试。
          </p>
          <p>
            <strong>怎么写。</strong>把「人工兜底」写成异常路径：自动执行对不上的时候，要能收口，并且买卖双方的保证金状态一起改。
          </p>
          <p>
            <strong>结果。</strong>管理端留了人工完结申诉。下面这张是这个入口，不是那几笔小额测试的收据。
          </p>
        </article>
      </div>
      <div className="pair">
        <Shot
          src={privacy}
          alt="隐私号通话前的说明"
          width={924}
          height={804}
          variant="dialog"
          caption="锁车后的电话会先经过这层说明。背景里的车牌和车商信息已裁掉。"
        />
        <Shot
          src={appeal}
          alt="人工完结申诉的处理窗口"
          width={506}
          height={382}
          variant="dialog"
          caption="申诉执行出现异常时的人工完结。订单编号已从画面外裁掉。"
        />
      </div>
    </Section>
  );
}

export function Quality() {
  return (
    <Section id="quality" index="07" title="质量与协同">
      <p>小团队要对齐，靠的是一张大家天天打开的表，不是另一套流程系统。</p>
      <div className="band">
        <div>
          <span className="band-num">59</span>
          <span className="band-label">需求同步</span>
          <span className="band-sub">APP 端 54 · 管理端 5</span>
        </div>
        <div>
          <span className="band-num">16</span>
          <span className="band-label">二次反馈</span>
          <span className="band-sub">和开发来回留痕</span>
        </div>
        <div>
          <span className="band-num">70</span>
          <span className="band-label">检查项</span>
          <span className="band-sub">12 个模块</span>
        </div>
        <div>
          <span className="band-num">46</span>
          <span className="band-label">检查通过</span>
          <span className="band-sub">未通过 17 · 待确认 3</span>
        </div>
      </div>
      <p>
        这 59 条不全是缺陷。类型上，BUG 修复 30、功能完善 26、新增功能 2。状态上，已完成 47、暂缓 6、非系统问题 2、待开发调整 1。优先级上，紧急 21、重要 20、普通 15。
      </p>
      <p>优先级当时是这样定的：</p>
      <ul>
        <li>紧急：影响核心交易、支付、发布或下单。</li>
        <li>重要：影响体验或转化。</li>
        <li>普通：不阻断主流程的体验优化。</li>
        <li>待定：业务规则还没确认。</li>
      </ul>
      <p>
        二次反馈是和开发来回的留痕，例如「这个不用加了」「需额外开发」「放在 2.0」。技术每天进表格看问题记录。表里有问题截图、二次反馈和效果截图。
      </p>
      <p>检查清单覆盖这 12 个模块：</p>
      <ul className="pills">
        {modules.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p>这件事的结果就一句：小团队有了一种能一起验收的轻量方式，原来说不清的体验问题，变成了可以排进去做的任务。</p>
    </Section>
  );
}

export function Outreach() {
  return (
    <Section id="outreach" index="08" title="外呼与短信">
      <p>当时真正走的路径不是「看到广告，打开商店，下载」。它长这样：</p>
      <ConversionPath />
      <blockquote className="sms">
        <span className="sms-label">短信原文</span>
        <p>
          【真车二手车】同行买卖二手车，怕车况不符、临时变卦？真车APP引入双向保证金机制，买卖双方按规则履约，交易更放心。新人福利免费用，点击下载： checheduoduo.com 退订回T
        </p>
      </blockquote>
      <p>外呼稿没有整篇贴在这里。下面只留结构、开场里的一句，和当时写死的约束。</p>
      <blockquote className="pull">
        <span className="pull-label">开场摘一句</span>
        <p>
          「老板您好，我是真车二手车的。我们是做同行车商交易保障的，核心就是双向保证金——买卖双方都交，按规则履约，谁违约扣谁。」
        </p>
      </blockquote>
      <PromptCard />
      <p className="hint">这些是稿子里预备要接住的反应。页面上只列场景，不展开每一种答法。</p>
      <ul className="ticks">
        {scenes.map((scene) => (
          <li key={scene}>{scene}</li>
        ))}
      </ul>
      <p>
        短信大约 1000 条，拉新只有几十人。电话大约 2000 通，拉新也只有几十人。
      </p>
      <div className="crack">
        <h3>话术在收，入口选错了</h3>
        <div>
          <p>
            <strong>稿子里的规定。</strong>
            不许说「去应用商店搜索」。只让人去翻一条可能已经被拦截的官网短信。
          </p>
        </div>
        <div>
          <p>
            <strong>当时的事实。</strong>
            iOS 1.0.8 已经在 App Store 上。老板只上架了苹果商店，想先看效果，再做其他系统。很多接到短信或电话的人，找不到 APP。我认为这是最大的策略问题。
          </p>
        </div>
      </div>
      <p>
        短信和电话这种打法本身也偏过时。很多人一听是 AI 语音就挂断，短信也容易被运营商拦截。几个原因叠在一起，推广没有做成。
      </p>
      <p>
        所以这不是一句文案或一套话术的问题。整条转化链路摩擦很高：入口信任不足，路径太长，用户不愿点陌生链接，官网下载和安卓未知来源都有阻力，又缺少应用商店这种低门槛入口来接住。
      </p>
      <p>当时写下的改进是这些，它们没有在项目里做成：</p>
      <ul>
        <li>应用商店做主入口，官网作补充。</li>
        <li>外呼同时讲两件事：有同行低价车源，以及双向保证金。</li>
        <li>官网首屏说清这是什么、有什么车源、保证金怎么保障、下载按钮在哪、安卓的安全提示怎么办。</li>
        <li>把过程拆开记。否则只能看到最终注册，看不出人是在哪一步离开的。</li>
      </ul>
      <p className="quiet">下面这些名字是建议分开记、当时没有分开的步骤，不是一组成绩。</p>
      <ul className="ticks">
        {ticks.map((tick) => (
          <li key={tick}>{tick}</li>
        ))}
      </ul>
      <p>更长一点看，要回答的是三件事：</p>
      <div className="questions">
        <article className="question">
          <strong>为什么我要下载</strong>
          <span>因为这里有同行车源。</span>
        </article>
        <article className="question">
          <strong>为什么我敢交易</strong>
          <span>双向保证金，谁违约扣谁。</span>
        </article>
        <article className="question">
          <strong>为什么我相信你</strong>
          <span>官方入口、规则透明、流程清楚。</span>
        </article>
      </div>
    </Section>
  );
}

export function Tools() {
  return (
    <Section id="tools" index="09" title="数据工具">
      <p>
        手头的车源表、车商表经常没法直接用：字段是编码，两张表对不上，也看不出分布。我用 Python 做成了一键工具，让这些表能进系统，也能读。
      </p>
      <div className="tool-copy">
        <h3>字段自动映射工具 v2.0</h3>
        <p>外部车源表里很多字段是数字编码。同时上传原表和字段映射表，一键生成完整的车辆信息。解决的是「数据在，但人看不懂，系统也接不住」。</p>
      </div>
      <Shot
        src={mapping}
        alt="字段自动映射工具 v2.0 的界面，可选择车源文件和映射对照表"
        width={602}
        height={452}
        caption="字段自动映射工具 v2.0。上传车源文件和映射对照表，一键转换。"
      />
      <div className="tool-copy">
        <h3>车源和车商，合成一张表</h3>
        <p>
          车源表和车商表常常是分开到的，本应通过共同的车商 ID 一一对应。上传两张表之后一键关联。可以按住 Ctrl 多选文件，合并后自动去重，并补上车商信息。支持 csv 和 xlsx。
        </p>
      </div>
      <Shot
        src={dealer}
        alt="二手车数据批量合并工具，可选择车商表和车源表"
        width={1044}
        height={1020}
        caption="二手车数据批量合并工具。合并、去重，并补充车商信息。"
      />
      <div className="tool-copy">
        <h3>报告</h3>
        <p>把车源数据做成可读的报告：品牌均价、品牌数量、城市分布，再加上数据报告和文字结论。</p>
      </div>
      <Shot
        src={folder}
        alt="报告工具输出的文件：report_tool.py、品牌均价、品牌数量、城市分布、数据报告和数据结论"
        width={456}
        height={436}
        variant="narrow"
        caption="一次输出里的文件名：report_tool.py、三张图、数据报告.xlsx、数据结论.txt。"
      />
      <div className="charts">
        <Shot src={brandAvg} alt="报告工具生成的品牌均价图" width={1000} height={600} caption="品牌均价。" />
        <Shot src={brandTop} alt="报告工具生成的品牌数量图" width={1000} height={600} caption="品牌数量。" />
        <Shot src={cityTop} alt="报告工具生成的城市分布图" width={1000} height={600} caption="城市分布。" />
      </div>
      <p className="quiet">三张图是工具自己画出来的。正文不把图里的柱高改写成结论。</p>
    </Section>
  );
}

export function Launch() {
  return (
    <Section id="launch" index="10" title="上线与表达">
      <p>iOS 1.0.8 的 App Store 提审和发布，是我独立参与并完成的。商店预览和下载介绍见封面，那部分文案是我写的。</p>
      <Shot
        src={asc}
        alt="App Store Connect 中，真车 iOS 1.0.8 准备提交"
        width={1447}
        height={670}
        caption="App Store Connect 里，iOS 1.0.8 处于准备提交。红框是素材上原有的标记。"
      />
      <h3>黄金会员是一套方案，不是卖货成绩</h3>
      <p>
        会员页是我设计的。卖点写成：全年不限量真车车源信息；车源优先推荐，曝光提升 3 倍；专属交易保障，降低违约风险。「曝光提升 3 倍」是页面上的卖点文案，不是事后统计出来的结果。
      </p>
      <p className="price-line">
        <s>¥288/年</s>¥88/年
      </p>
      <p>限时特惠，新用户专享。大约 0.24 元一天，立省 200 元。按钮是「同意协议并支付 ¥88」，要先勾选用户协议和会员规则。</p>
      <ul className="benefits">
        {benefits.map(([name, value]) => (
          <li key={name} className="benefit">
            <strong>{name}</strong>
            <span>{value}</span>
          </li>
        ))}
      </ul>
      <Shot
        src={membership}
        alt="真车黄金会员页面，年费从 288 元调到 88 元"
        width={390}
        height={844}
        variant="narrow"
        caption="黄金会员页设计稿。"
      />
      <p>
        后来老板为了推广，把会员模式暂时取消，改成免费使用。短信里的「新人福利免费用」和这个决定是一致的。这页用来展示当时的商业化方案，不表示已经大规模卖出去了。
      </p>
    </Section>
  );
}

export function Review() {
  return (
    <Section id="review" index="11" title="复盘">
      <p>项目没有漂亮的增长数字。能带走的是四件以后做 AI 产品还会用的方法。</p>
      <div className="methods">
        <article className="method">
          <strong>01 状态、权限、异常、验收</strong>
          <span>设计 agent 或工作流时，还是要把状态、权限、异常和验收标准写清楚。</span>
        </article>
        <article className="method">
          <strong>02 外呼不是一段好听的话</strong>
          <span>先规定角色、目标、节奏、异议和禁区：不编造，不承诺，不贬低。再拿到真实通话里验证。</span>
        </article>
        <article className="method">
          <strong>03 增长先看链路</strong>
          <span>增长出了问题，先看整条链路和分发策略，而不是继续打磨话术。</span>
        </article>
        <article className="method">
          <strong>04 用代码吃掉重复整理</strong>
          <span>把不能用的表，变成产品能吃进去的输入。</span>
        </article>
      </div>
      <p className="close-line">知道一个方案为什么不成立，本身也是产品经验。</p>
      <p>
        <a className="text-link" href="../index.html">
          返回首页
        </a>
      </p>
    </Section>
  );
}
