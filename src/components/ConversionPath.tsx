import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ease } from "../ease";

const steps = [
  { id: "sms", title: "短信触达", note: "转化从一条短信开始。" },
  { id: "see", title: "看到短信", note: "短信可能被拦截。外呼里会让人去看垃圾短信或拦截短信。" },
  { id: "click", title: "点击官网链接", note: "走短信里已经发过的官网链接，不引导去应用商店搜索。" },
  { id: "site", title: "进入官网", note: "人得点进去，才有下一步。" },
  { id: "pack", title: "下载安装包", note: "官网给的是安装包，不是在商店里点一下就有。" },
  { id: "install", title: "安装", note: "下载之后还要完成安装。" },
  { id: "reg", title: "注册登录", note: "安装之后才到注册登录。" },
  { id: "use", title: "浏览、发布或了解保证金", note: "走到这里，路径已经很长。" },
];

export function ConversionPath() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(steps[2].id);
  const current = steps.find((step) => step.id === active) ?? steps[0];

  return (
    <div className="path-layout">
      <div>
        <p className="hint">点一跳。八步都写在下面，选中的一步用深色圆点标出来。</p>
        <div className="path">
          <motion.div
            className="path-spine"
            aria-hidden="true"
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease }}
          />
          <ol>
          {steps.map((step, index) => (
            <li key={step.id}>
              <motion.button
                type="button"
                className={active === step.id ? "path-step is-on" : "path-step"}
                aria-pressed={active === step.id}
                onClick={() => setActive(step.id)}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: reduce ? 0 : index * 0.05, ease }}
              >
                <span className="path-no">{index + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <span>{step.note}</span>
                </span>
              </motion.button>
            </li>
          ))}
          </ol>
        </div>
        <p className="quiet">正在看第 {steps.findIndex((step) => step.id === current.id) + 1} 步：{current.title}。</p>
      </div>
      <aside className="branch">
        <strong>电话外呼是二次提醒</strong>
        <p>
          打给已经收过短信的人，让对方去找短信里的官网链接，而不是去应用商店搜索。它不是另一条下载路径。
        </p>
      </aside>
    </div>
  );
}
