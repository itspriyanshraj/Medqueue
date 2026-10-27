"use client";

import { animate, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function MotionEnhancer({ children }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isAuthPage = ["/login", "/signup", "/admin/login"].includes(pathname);
  const rootRef = useRef(null);
  const previousPathname = useRef(null);
  const [transitionPath, setTransitionPath] = useState(null);

  useEffect(() => {
    const isPageChange = previousPathname.current !== null && previousPathname.current !== pathname;
    previousPathname.current = pathname;

    if (isPageChange && !reduceMotion) setTransitionPath(pathname);
    if (reduceMotion || !rootRef.current) return;

    animate(
      rootRef.current,
      { opacity: [0, 1], y: [isAuthPage ? 18 : 10, 0], filter: ["blur(3px)", "blur(0px)"] },
      { duration: isAuthPage ? 0.48 : 0.4, ease: [0.22, 1, 0.36, 1] },
    );
  }, [pathname, reduceMotion, isAuthPage]);

  useEffect(() => {
    function startTransition() {
      if (!reduceMotion) setTransitionPath(pathname);
    }

    window.addEventListener("medqueue:transition", startTransition);
    return () => window.removeEventListener("medqueue:transition", startTransition);
  }, [pathname, reduceMotion]);

  return <>
    <div ref={rootRef} className="motion-enhancer-root">{children}</div>
    {transitionPath === pathname && !reduceMotion && (
      <motion.div
        aria-label="MedQueue"
        role="status"
        className="page-transition-wipe"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.42, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setTransitionPath((current) => current === pathname ? null : current)}
      >
        <motion.div
          className="page-transition-brand"
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="page-transition-orbit page-transition-orbit-left"
            animate={{ x: [-5, 5, -5], opacity: [0.35, 1, 0.35], scale: [0.88, 1.08, 0.88] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="page-transition-orbit page-transition-orbit-right"
            animate={{ x: [5, -5, 5], opacity: [1, 0.35, 1], scale: [1.08, 0.88, 1.08] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="page-transition-mark" aria-hidden="true">✚</span>
          <span className="page-transition-name">Med<span>Queue</span></span>
          <span className="page-transition-caption">Care, connected.</span>
        </motion.div>
      </motion.div>
    )}
  </>;
}
