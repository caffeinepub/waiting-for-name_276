import { u as useInternetIdentity, a as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-CgfZwU8L.js";
import { B as Button } from "./button-COivdPDa.js";
function Login() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const principal = identity == null ? void 0 : identity.getPrincipal().toText();
      if (principal && principal !== "2vxsx-fae") {
        navigate({ to: "/dashboard" });
      }
    } catch {
    }
  }, [identity, navigate]);
  reactExports.useEffect(() => {
    if (loginStatus === "success") {
      navigate({ to: "/dashboard" });
    }
    if (loginStatus !== "logging-in") {
      setIsLoading(false);
    }
  }, [loginStatus, navigate]);
  function handleLogin() {
    setIsLoading(true);
    login();
  }
  const isPending = isLoading || loginStatus === "logging-in";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "min-h-screen w-full flex items-center justify-center p-4",
      "data-ocid": "login-page",
      style: {
        background: "linear-gradient(150deg, oklch(0.92 0.04 235) 0%, oklch(0.95 0.025 248) 50%, oklch(0.93 0.038 218) 100%)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "pointer-events-none fixed inset-0 overflow-hidden",
            "aria-hidden": "true",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full",
                  style: {
                    background: "radial-gradient(circle, oklch(0.58 0.16 240 / 0.25) 0%, transparent 65%)"
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute -bottom-28 -right-28 w-[440px] h-[440px] rounded-full",
                  style: {
                    background: "radial-gradient(circle, oklch(0.68 0.18 25 / 0.18) 0%, transparent 65%)"
                  }
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative z-10 w-full max-w-[400px] bg-card rounded-2xl border border-border p-8 flex flex-col items-center gap-6 shadow-elevated",
            "data-ocid": "login-card",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center gap-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                    style: {
                      background: "linear-gradient(135deg, oklch(0.42 0.14 240) 0%, oklch(0.56 0.18 246) 100%)"
                    },
                    "aria-hidden": "true",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "svg",
                      {
                        width: "24",
                        height: "24",
                        viewBox: "0 0 24 24",
                        fill: "none",
                        xmlns: "http://www.w3.org/2000/svg",
                        "aria-hidden": "true",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "circle",
                            {
                              cx: "12",
                              cy: "7.5",
                              r: "3.5",
                              fill: "white",
                              fillOpacity: "0.95"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "path",
                            {
                              d: "M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7",
                              stroke: "white",
                              strokeWidth: "2",
                              strokeLinecap: "round",
                              strokeOpacity: "0.9"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "path",
                            {
                              d: "M15.5 12.5h1.5l1 -2 1.5 4 1 -2H22",
                              stroke: "white",
                              strokeWidth: "1.4",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeOpacity: "0.75"
                            }
                          )
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display font-bold text-2xl leading-tight tracking-tight text-foreground", children: "KidiCare" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-body font-semibold uppercase tracking-widest text-primary opacity-75 leading-tight", children: "Pediatric Health Monitoring" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-px bg-border" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center leading-relaxed font-body", children: "Monitor your child's wellbeing with real-time sensor data and AI-powered emotion detection." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  className: "w-full h-11 font-display font-semibold text-sm tracking-wide transition-smooth gap-2",
                  onClick: handleLogin,
                  disabled: isPending,
                  "data-ocid": "login-button",
                  children: isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin",
                        "aria-hidden": "true"
                      }
                    ),
                    "Connecting…"
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "svg",
                      {
                        width: "18",
                        height: "18",
                        viewBox: "0 0 18 18",
                        fill: "none",
                        xmlns: "http://www.w3.org/2000/svg",
                        "aria-hidden": "true",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "rect",
                            {
                              x: "2",
                              y: "5",
                              width: "14",
                              height: "10",
                              rx: "2",
                              stroke: "currentColor",
                              strokeWidth: "1.5",
                              strokeOpacity: "0.85"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "path",
                            {
                              d: "M6 5V4a3 3 0 016 0v1",
                              stroke: "currentColor",
                              strokeWidth: "1.5",
                              strokeLinecap: "round",
                              strokeOpacity: "0.85"
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "circle",
                            {
                              cx: "9",
                              cy: "10",
                              r: "1.25",
                              fill: "currentColor",
                              fillOpacity: "0.9"
                            }
                          )
                        ]
                      }
                    ),
                    "Sign in with Internet Identity"
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center leading-relaxed", children: "Secured by the Internet Computer. No passwords stored or shared." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground/60 text-center", children: [
                "© ",
                (/* @__PURE__ */ new Date()).getFullYear(),
                ". Built with love using",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.hostname : ""
                    )}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "hover:text-primary transition-colors duration-200",
                    children: "caffeine.ai"
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
}
export {
  Login as default
};
