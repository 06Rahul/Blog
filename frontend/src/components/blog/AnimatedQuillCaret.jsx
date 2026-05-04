import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const AnimatedQuillCaret = ({ quill }) => {
    const [caret, setCaret] = useState(null);
    const velocityRef = useRef(0);
    const lastPositionRef = useRef({ left: 0, top: 0 });
    const lastTimeRef = useRef(Date.now());
    const animationFrameRef = useRef(null);

    useEffect(() => {
        if (!quill) return;

        const update = () => {
            const sel = quill.getSelection();
            if (!sel) {
                setCaret(null);
                return;
            }

            // Get cursor bounds relative to the editor
            const bounds = quill.getBounds(sel.index);

            // Get the editor's absolute position on the page
            const editorRect = quill.root.getBoundingClientRect();

            // Calculate absolute position on the page
            const absoluteTop = editorRect.top + bounds.top + window.scrollY;
            const absoluteLeft = editorRect.left + bounds.left + window.scrollX;

            // Calculate velocity for stretch effect
            const now = Date.now();
            const timeDelta = Math.max(now - lastTimeRef.current, 1);
            const dx = absoluteLeft - lastPositionRef.current.left;
            const dy = absoluteTop - lastPositionRef.current.top;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Update velocity with higher sensitivity
            const newVelocity = Math.min((distance / timeDelta) * 10, 4);
            velocityRef.current = newVelocity;

            lastPositionRef.current = { left: absoluteLeft, top: absoluteTop };
            lastTimeRef.current = now;

            setCaret({
                top: absoluteTop,
                left: absoluteLeft,
                height: bounds.height * 0.85,
                velocity: velocityRef.current,
            });

            // Decay velocity smoothly
            if (velocityRef.current > 0.05) {
                animationFrameRef.current = requestAnimationFrame(() => {
                    velocityRef.current *= 0.7;
                    if (velocityRef.current > 0.05) {
                        setCaret(prev => prev ? { ...prev, velocity: velocityRef.current } : null);
                    } else {
                        setCaret(prev => prev ? { ...prev, velocity: 0 } : null);
                    }
                });
            }
        };

        const handleEditorChange = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            requestAnimationFrame(update);
        };

        const handleScroll = () => {
            requestAnimationFrame(update);
        };

        quill.on("editor-change", handleEditorChange);
        quill.on("selection-change", handleEditorChange);

        // Listen for scroll events
        quill.root.addEventListener("scroll", handleScroll);
        window.addEventListener("scroll", handleScroll);

        // Initial update
        setTimeout(update, 100);

        return () => {
            quill.off("editor-change", handleEditorChange);
            quill.off("selection-change", handleEditorChange);
            quill.root.removeEventListener("scroll", handleScroll);
            window.removeEventListener("scroll", handleScroll);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [quill]);

    if (!caret) return null;

    // Calculate stretch based on velocity - more pronounced effect
    const stretchX = 1 + caret.velocity * 0.4;
    const squashY = 1 - caret.velocity * 0.2;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{
                opacity: [1, 1, 0, 0, 1],
                scaleX: stretchX,
                scaleY: squashY,
            }}
            transition={{
                opacity: {
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                },
                scaleX: {
                    duration: 0.2,
                    ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
                },
                scaleY: {
                    duration: 0.2,
                    ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
                },
            }}
            style={{
                position: "fixed",
                top: caret.top,
                left: caret.left,
                width: "2px",
                height: caret.height,
                backgroundColor: "#a855f7",
                pointerEvents: "none",
                zIndex: 9999,
                transformOrigin: "left center",
                boxShadow: "0 0 8px rgba(168, 85, 247, 0.5)",
                borderRadius: "1px",
            }}
        />
    );
};

export default AnimatedQuillCaret;

