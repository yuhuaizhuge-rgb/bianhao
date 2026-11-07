import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { SECTIONS } from "./toc";
import { Cover, Problem, Role, Rules } from "./early";
import { Judgments, Launch, Outreach, Permission, Quality, Review, Tools } from "./late";

function useActiveSection() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.28;
      let current: string = SECTIONS[0].id;
      for (const section of SECTIONS) {
        const node = document.getElementById(section.id);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= line) current = section.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return active;
}

export function CasePage() {
  const reduce = useReducedMotion();
  const active = useActiveSection();
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.25 });
  const scaleX = useTransform(reduce ? scrollYProgress : smooth, (value) =>
    Math.min(1, Math.max(0, value)),
  );
  const pct = useTransform(scrollYProgress, (value) => {
    const clamped = Math.min(1, Math.max(0, value));
    return `${Math.round(clamped * 100)}%`;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a className="skip" href="#content">
        跳到正文
      </a>
      <div className="progress-track" aria-hidden="true">
        <motion.div className="progress-bar" style={{ scaleX }} />
      </div>
      <header className="topbar">
        <a className="topbar-name" href="../index.html">
          边豪
        </a>
        <button
          type="button"
          className="toc-toggle"
          aria-expanded={open}
          aria-controls="toc"
          onClick={() => setOpen((value) => !value)}
        >
          目录
        </button>
        <span className="topbar-title">真车 APP</span>
        <motion.span className="pct" aria-hidden="true">
          {pct}
        </motion.span>
      </header>
      {open ? (
        <button type="button" className="backdrop" aria-label="关闭目录" onClick={() => setOpen(false)} />
      ) : null}
      <div className="shell">
        <nav id="toc" className={open ? "toc is-open" : "toc"} aria-label="案例目录">
          <a className="toc-back" href="../index.html">
            ← 首页
          </a>
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              className="toc-link"
              href={`#${section.id}`}
              aria-current={active === section.id ? "true" : undefined}
              onClick={() => setOpen(false)}
            >
              {active === section.id ? (
                <motion.span
                  className="toc-mark"
                  layoutId="toc-mark"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36 }}
                />
              ) : null}
              <span className="toc-index">{section.index}</span>
              <span>{section.title}</span>
            </a>
          ))}
        </nav>
        <article id="content">
          <Cover />
          <Problem />
          <Role />
          <Rules />
          <Permission />
          <Judgments />
          <Quality />
          <Outreach />
          <Tools />
          <Launch />
          <Review />
        </article>
      </div>
    </>
  );
}
