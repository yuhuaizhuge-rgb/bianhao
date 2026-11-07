import { motion, useReducedMotion } from "framer-motion";
import { ease } from "../ease";
import { Shot } from "../components/Shot";
import { StateDiagram } from "../components/StateDiagram";
import { Section } from "./Section";
import appStore from "../assets/app-store.jpg";

export function Cover() {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id="cover"
      className="section cover"
      aria-labelledby="cover-title"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.75, ease }}
    >
      <p className="kicker">案例 01</p>
      <h1 id="cover-title">真车 APP</h1>
      <p className="store-name">真车 - 二手车商同行交易保障平台</p>
      <p className="subtitle">双向保证金，买卖都放心</p>
      <p className="slogan">
        真车源<span>·</span>真车商<span>·</span>真保障
      </p>
      <dl className="meta-row">
        <div>
          <dt>时间</dt>
          <dd>2025.10 – 2026.6</dd>
        </div>
        <div>
          <dt>团队</dt>
          <dd>4 人</dd>
        </div>
        <div>
          <dt>角色</dt>
          <dd>产品运营</dd>
        </div>
        <div>
          <dt>上架</dt>
          <dd>iOS 1.0.8</dd>
        </div>
      </dl>
      <div className="prose">
        <p>
          面向全国二手车商的 B2B 同行交易保障平台。车商既是车源供给方，也是采购方。商店上的副标题是「双向保证金，买卖都放心」。
        </p>
        <aside className="honest">
          <strong>先把结局说清楚</strong>
          产品上线之后推广受挫，老板放弃了项目。下面写的是把想法做成可上架产品的过程，以及一次不成功的获客验证。
        </aside>
        <Shot
          src={appStore}
          alt="App Store 上的真车产品页，版本 1.0.8"
          width={1206}
          height={2290}
          scroll
          loading="eager"
          caption="App Store 产品页。开发者名 FlowMind 是商店上的公开信息。画面底部的系统切换栏已裁掉，画面里可以滚动。"
        />
        <p>
          商店页当时有 1 个评分，5.0。样本只有一条，不把它当成口碑。年龄分级 18+，类别是购物，版本 1.0.8。
        </p>
        <p>版本 1.0.8 的更新说明有三条：</p>
        <ol>
          <li>优化认证后电话联系、保证金锁车等功能权限体验</li>
          <li>优化第三方车源电话弹窗提示</li>
          <li>修复部分已知问题，提升使用稳定性</li>
        </ol>
        <p>商店预览文案也是我写的。</p>
        <div className="preview-grid">
          <article>
            <strong>真车商、真车源、真交易</strong>
            <span>诚信·优质二手车交易平台</span>
          </article>
          <article>
            <strong>一手车源，快人一步</strong>
            <span>全国海量车源实时更新</span>
          </article>
          <article>
            <strong>双向保证金，买卖都放心</strong>
            <span>买方锁车、卖方履约，双向缴纳保证金</span>
          </article>
          <article>
            <strong>简化经营流程，生意更高效</strong>
            <span>告别繁琐操作，让二手车经营更简单、更省心</span>
          </article>
        </div>
        <p>
          产品介绍可以收成一句：全国二手车商批发服务平台。通过车商内网，提供车源发布、求购批发、保证金交易。理念是「真车商、真车源、真交易」。
        </p>
      </div>
    </motion.section>
  );
}

export function Problem() {
  return (
    <Section id="problem" index="02" title="问题与切入">
      <p>同行之间买卖二手车，怕的是车况不符、临时变卦、跑单扯皮。</p>
      <p>
        真车的核心机制是双向保证金：买卖双方都缴纳保证金，按规则履约，谁违约扣谁。保证金金额固定 2000 元，交易完成后返还。信任不靠自己做检测，也不靠自己做估值，而是靠这笔履约保证金，把违约和扯皮的成本摆到明处。
      </p>
      <p>2026 年 3 月做过一版竞品分析。行业可以收成三派，这里只留这张图谱。</p>
      <div className="camps">
        <article className="camp">
          <p className="kicker">数据与信任</p>
          <h3>交易前先回答值不值</h3>
          <p>车300 做估值定价，查博士做检测和报告。它们回答的是：这车值多少、能不能买。</p>
        </article>
        <article className="camp">
          <p className="kicker">流量与内容</p>
          <h3>看的是线索怎么分</h3>
          <p>汽车之家、懂车帝。要学的是线索如何分发，不是去做一份 To C 资讯。</p>
        </article>
        <article className="camp">
          <p className="kicker">交易提效</p>
          <h3>买卖本身怎么更快</h3>
          <p>金鱼塘是社群化交易，批批车是 B2B 批发拍卖，节奏者是 SaaS。</p>
        </article>
      </div>
      <p>
        也曾把查博士的 S / A / B / C / D 车况定级（从准新车到重大事故车）当作「信任如何被标准化」的参考。这套评级没有写成我们上线的功能。
      </p>
      <aside className="aside-note">
        <strong>当时想到、没有当成主线的事</strong>
        <p>1.0 可以引导上传第三方检测或估值报告的截图，当作凭证。</p>
        <p>交易要尽量在站内走完，避免车商聊完就跑到站外。</p>
        <p>自己不做大模型，但可以接 API，用来查车况、估价、推荐。</p>
      </aside>
    </Section>
  );
}

export function Role() {
  return (
    <Section id="role" index="03" title="角色与边界">
      <p>我在四个人的团队里做产品运营。实际碰到的事，覆盖需求与规则、测试验收、版本上架、增长验证和数据工具。</p>
      <ol>
        <li>
          <strong>产品需求与交易流程。</strong>
          梳理注册登录、车商认证、车源发布、浏览、电话联系、保证金锁车、订单和异常状态。围绕双向保证金，参与交易规则、违约约束、异常交易、第三方车源这些场景。模块 PRD 是我独立编写和完善的，里面写清用户状态、权限、交互、跳转、异常和验收标准。
        </li>
        <li>
          <strong>测试、验收和版本交付。</strong>
          从 0 搭功能检查清单。用多个账号模拟车商，走正常路径，也走异常路径。问题记下来，推动修复和回归。上线前的验收是我做的，并且完成了 iOS 1.0.8 的 App Store 提审与发布。
        </li>
        <li>
          <strong>运营增长和商业化探索。</strong>
          短信拉新，AI 电话外呼（角色、Prompt、开场、异议），以及会员权益和定价页。效果不好的时候，判断落在渠道和转化链路上，而不只是改文案。
        </li>
      </ol>
      <p>另外用 Python 做了数据清洗、字段映射和车源-车商匹配的小工具，也设计过会员页和应用预览文案。</p>
      <aside className="boundary">
        <strong>边界</strong>
        我是四人群里的产品运营。支付结算系统不是我独立设计的，研发也不是我负责的。
      </aside>
    </Section>
  );
}

export function Rules() {
  return (
    <Section id="rules" index="04" title="交易规则">
      <p>
        保证金是固定的 2000 元。下面把买家和卖家对照着画：谁在哪一步看到什么，钱在什么时候锁定、退回或冻结。支付失败、重复点击、拒绝、申诉，都单独留在图上，不混进成功路径里。
      </p>
      <StateDiagram />
      <aside className="aside-note">
        <strong>发布车源 · 旁注</strong>
        <p className="source">来自《发布车源功能拆解表》。</p>
        <p>供给从 VIN 进入：输入或扫描，自动识别品牌、车型和标题，失败了可以手填。</p>
        <p>要填的有上牌年份、里程、价格、颜色、城市、过户次数、能源类型，再加上多张图。</p>
        <h3>已经确认的规则</h3>
        <ul>
          <li>发布必须先交保证金。</li>
          <li>支付取消之后，不应自动发布。</li>
          <li>支付成功应回到确认页，再由用户自己点发布。</li>
          <li>支付失败或取消之后，车源可以进待审核，以后同意交易时再补交保证金。</li>
          <li>审核不通过可以修改再提，审核会给拒绝原因。</li>
          <li>发布之后，字段允许全部修改。</li>
          <li>下架之后可以重新提交再审。</li>
          <li>批量发布暂缓。</li>
          <li>审核通过需要通知用户。</li>
        </ul>
        <h3>检查里对上的问题</h3>
        <ul>
          <li>退出页面不保存。</li>
          <li>已发布列表不好找。</li>
          <li>再次发布不能复用上次的信息。</li>
          <li>批量入口没有上线。</li>
        </ul>
      </aside>
    </Section>
  );
}
