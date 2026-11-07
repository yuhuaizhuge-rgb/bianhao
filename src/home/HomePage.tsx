import { motion, useReducedMotion } from "framer-motion";
import { ease } from "../ease";

export function HomePage() {
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease },
        };

  return (
    <div className="home-wrap">
      <a className="skip" href="#content">
        跳到正文
      </a>
      <header className="home-nav">
        <span>边豪</span>
        <span>作品集</span>
      </header>
      <main className="home-main" id="content">
        <motion.p className="role-line" {...enter(0)}>
          AI 产品经理
        </motion.p>
        <h1 className="home-name">
          {"边豪".split("").map((char, index) => (
            <motion.span key={char} {...enter(0.08 + index * 0.08)}>
              {char}
            </motion.span>
          ))}
          <motion.span className="name-mark" aria-hidden="true" {...enter(0.28)} />
        </h1>
        <motion.p className="lede" {...enter(0.32)}>
          做过完整从 0 到 1 的 B 端交易产品，能把规则写成可验收的说明，也亲手验证过 AI 外呼和数据工具。
        </motion.p>
        <motion.p className="lede-sub" {...enter(0.42)}>
          产品运营出身，完整参与过交易规则、验收上架与增长验证。
        </motion.p>
        <motion.a className="entry" href="zhen-che/index.html" {...enter(0.52)}>
          <span className="entry-index">01</span>
          <span>
            <span className="entry-kicker">案例</span>
            <span className="entry-title">真车 APP</span>
            <span className="entry-one">面向全国二手车商的 B2B 同行交易保障平台</span>
          </span>
          <span className="entry-meta">
            <span>2025.10 – 2026.6</span>
            <span className="entry-go">
              进入案例 <i aria-hidden="true">→</i>
            </span>
          </span>
        </motion.a>
      </main>
      <footer className="home-foot">
        <span>边豪</span>
        <span>个人作品集存档 · 这一册只收真车一则</span>
      </footer>
    </div>
  );
}
