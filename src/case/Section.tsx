import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { ease } from "../ease";

export function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={id}
      className="section"
      aria-labelledby={`${id}-title`}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, ease }}
    >
      <p className="kicker">{index}</p>
      <h2 id={`${id}-title`}>{title}</h2>
      <div className="prose">{children}</div>
    </motion.section>
  );
}
