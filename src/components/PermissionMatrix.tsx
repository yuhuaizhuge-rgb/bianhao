import { useState } from "react";

type Focus = "all" | "guest" | "login" | "auth";
type Cell = "yes" | "login" | "auth" | "off" | "no";

const filters: { id: Focus; label: string }[] = [
  { id: "all", label: "全部身份" },
  { id: "guest", label: "未登录" },
  { id: "login", label: "已登录未认证" },
  { id: "auth", label: "已认证" },
];

const text: Record<Cell, string> = {
  yes: "支持",
  login: "引导登录",
  auth: "引导认证",
  off: "未上线",
  no: "不可查看",
};

const rows: { name: string; cells: [Cell, Cell, Cell] }[] = [
  { name: "查看基础信息", cells: ["yes", "yes", "yes"] },
  { name: "完整价格", cells: ["login", "yes", "yes"] },
  { name: "电话咨询", cells: ["login", "yes", "yes"] },
  { name: "IM 联系", cells: ["off", "off", "off"] },
  { name: "保证金锁车", cells: ["login", "yes", "yes"] },
  { name: "收藏", cells: ["login", "yes", "yes"] },
  { name: "分享", cells: ["yes", "yes", "yes"] },
  { name: "订单", cells: ["no", "yes", "yes"] },
  { name: "发布车源", cells: ["login", "auth", "yes"] },
];

export function PermissionMatrix() {
  const [focus, setFocus] = useState<Focus>("all");

  return (
    <div>
      <p className="hint">点一种身份，其他列会淡下去。表本身始终是完整的。</p>
      <div className="chips" role="radiogroup" aria-label="按身份看权限">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={focus === item.id}
            className={focus === item.id ? "filter is-on" : "filter"}
            onClick={() => setFocus(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="matrix-scroll">
        <table className="matrix" data-focus={focus}>
          <caption className="sr-only">游客、已登录未认证、已认证对车源的操作权限</caption>
          <thead>
            <tr>
              <th scope="col">操作</th>
              <th scope="col">未登录</th>
              <th scope="col">已登录未认证</th>
              <th scope="col">已认证</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                {row.cells.map((cell, index) => (
                  <td key={`${row.name}-${index}`}>
                    <span className={`cell cell-${cell}`}>{text[cell]}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
