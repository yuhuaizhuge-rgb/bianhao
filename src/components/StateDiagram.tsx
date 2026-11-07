import { motion, useReducedMotion } from "framer-motion";
import { useState, type KeyboardEvent } from "react";
import { ease } from "../ease";

type Party = { title: string; body: string };
type Tone = "main" | "risk" | "open";

type Step = {
  id: string;
  tone: Tone;
  tag: string;
  buyer: Party;
  seller?: Party;
};

const steps: Step[] = [
  {
    id: "browse",
    tone: "main",
    tag: "主路径",
    buyer: { title: "看车源", body: "可查看详情、联系方式和保证金说明。" },
  },
  {
    id: "pending",
    tone: "main",
    tag: "主路径",
    buyer: { title: "待支付保证金", body: "点击「支付保证金 / 锁车」之后进入待支付。" },
  },
  {
    id: "paid",
    tone: "main",
    tag: "主路径",
    buyer: {
      title: "已支付 / 待卖家确认",
      body: "支付成功就生成订单。车源锁定，他人不能再锁，避免一车多卖。",
    },
    seller: { title: "收到交易申请", body: "卖家看到的是一笔待处理的交易申请。" },
  },
  {
    id: "fail",
    tone: "risk",
    tag: "异常",
    buyer: { title: "未支付", body: "支付失败或取消支付，停在未支付，不应误生成已支付订单。" },
  },
  {
    id: "dup",
    tone: "risk",
    tag: "异常",
    buyer: { title: "只留一笔有效订单", body: "重复点击支付时，不能重复扣款。" },
  },
  {
    id: "agree",
    tone: "main",
    tag: "主路径",
    buyer: {
      title: "等双方都缴纳",
      body: "卖家同意后，若发布时没交保证金，需要补交。双方缴纳后进入交易中。",
    },
    seller: { title: "补交保证金 / 同意", body: "发布时没交的，同意交易时补交。" },
  },
  {
    id: "reject",
    tone: "risk",
    tag: "异常",
    buyer: { title: "订单取消，保证金退回", body: "卖家拒绝之后，买家保证金按规则退回。" },
    seller: { title: "拒绝", body: "卖家可以拒绝这笔交易。" },
  },
  {
    id: "timeout",
    tone: "open",
    tag: "不断言",
    buyer: { title: "卖家长时间不处理", body: "应有超时规则。有没有上线，这里不断言。" },
    seller: { title: "未处理", body: "长时间不处理要有超时。是否已经上线，不断言。" },
  },
  {
    id: "trading",
    tone: "main",
    tag: "主路径",
    buyer: { title: "交易中 / 验车", body: "双方都已缴纳。两边看到的状态应一致。" },
    seller: { title: "交易中", body: "和买家进入同一段状态。" },
  },
  {
    id: "done",
    tone: "open",
    tag: "不断言",
    buyer: { title: "完成，保证金释放、返还", body: "是否必须双方再确认一次，不写成已经定死的结论。" },
    seller: { title: "完成", body: "保证金释放、返还。是否还要双方确认，不断言。" },
  },
  {
    id: "appeal",
    tone: "risk",
    tag: "异常",
    buyer: { title: "申诉中，保证金冻结", body: "不应自动退还，也不应自动扣除。" },
    seller: { title: "被申诉", body: "应能感知「对方已发起申诉」。申诉期间资金冻结。" },
  },
];

const risks = ["连点支付", "支付中杀进程", "弱网", "双方同时操作", "旧页面上的过期按钮", "后台改状态后前端不刷新"];

function PartyCard({ label, party }: { label: string; party?: Party }) {
  if (!party) {
    return <div className="side side-empty" aria-hidden="true" />;
  }
  return (
    <div className="side">
      <span className="side-label">{label}</span>
      <span className="side-title">{party.title}</span>
      <span className="side-body">{party.body}</span>
    </div>
  );
}

export function StateDiagram() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(steps[0].id);
  const [risk, setRisk] = useState(risks[0]);

  function onKey(event: KeyboardEvent<HTMLOListElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const index = steps.findIndex((step) => step.id === active);
    const next =
      event.key === "ArrowDown" ? Math.min(steps.length - 1, index + 1) : Math.max(0, index - 1);
    const id = steps[next].id;
    setActive(id);
    document.getElementById(`step-${id}`)?.focus();
  }

  return (
    <div>
      <p className="hint">点一行，或用上下键，把这一跳从整条链路里提出来。虚线标签表示这里不断言已经上线。</p>
      <div className="flow">
        <motion.div
          className="flow-spine"
          aria-hidden="true"
          initial={reduce ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.05, ease }}
        />
        <ol onKeyDown={onKey}>
        {steps.map((step, index) => (
          <li key={step.id}>
            <motion.button
              id={`step-${step.id}`}
              type="button"
              className={active === step.id ? "step is-on" : "step"}
              data-tone={step.tone}
              aria-pressed={active === step.id}
              onClick={() => setActive(step.id)}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -5% 0px" }}
              transition={{ duration: 0.45, delay: reduce ? 0 : index * 0.035, ease }}
            >
              <span className="step-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="step-main">
                <span className={step.seller ? "step-grid" : "step-grid is-single"}>
                  <PartyCard label="买家" party={step.buyer} />
                  {step.seller ? <PartyCard label="卖家" party={step.seller} /> : null}
                </span>
                {step.tone !== "main" ? <span className="step-tag">{step.tag}</span> : null}
              </span>
            </motion.button>
          </li>
        ))}
        </ol>
      </div>

      <h3>重点异常</h3>
      <div className="exceptions">
        <article className="exception">
          <p className="tag">支付成功，页面还是旧的</p>
          <h3>停在「正在支付中」</h3>
          <p>风险是人以为没付成，或者再付一次。状态必须能靠刷新或重新进入同步过来。</p>
        </article>
        <article className="exception">
          <p className="tag">补交失败</p>
          <h3>卖家补交保证金失败</h3>
          <p>订单不能卡死。应允许重新支付，或者取消。</p>
        </article>
        <article className="exception">
          <p className="tag">申诉</p>
          <h3>一方发起申诉</h3>
          <p>另一方应感知「对方已发起申诉」。申诉期间资金冻结，不自动退，也不自动扣。</p>
        </article>
      </div>

      <p>还有一组情况按风险优先测，因为直接涉及扣款，也要防止一车多卖。</p>
      <div className="chips" role="list">
        {risks.map((item) => (
          <button
            key={item}
            type="button"
            className={risk === item ? "chip is-on" : "chip"}
            aria-pressed={risk === item}
            onClick={() => setRisk(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="quiet">当前看着的是「{risk}」。这六种都不单独改规则，而是同一条验收优先级：先测会扣错钱、会一车多卖的路径。</p>
    </div>
  );
}
