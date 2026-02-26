"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ReviewSuccessStateProps {
    onViewReview: () => void;
    onReviewAnother: () => void;
}

/** Post-submit success screen with animated checkmark */
export function ReviewSuccessState({
    onViewReview,
    onReviewAnother,
}: ReviewSuccessStateProps) {
    return (
        <div className="flex flex-col items-center py-8">
            {/* Animated checkmark circle */}
            <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-full bg-olive"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                <motion.svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <motion.path
                        d="M5 12l5 5L20 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    />
                </motion.svg>
            </motion.div>

            <motion.h3
                className="mt-6 text-2xl font-bold text-charcoal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                Review submitted!
            </motion.h3>

            <motion.p
                className="mt-2 max-w-xs text-center text-sm text-muted"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                Thank you for helping the community. Your review will appear shortly
                after a quick check.
            </motion.p>

            <motion.div
                className="mt-6 flex items-center gap-6 text-xs text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <span>✓ Anonymous</span>
                <span>✓ Protected</span>
                <span>✓ Verified by community</span>
            </motion.div>

            <motion.div
                className="mt-8 flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
            >
                <Button onClick={onViewReview} className="bg-olive hover:bg-olive-light">
                    View your review
                </Button>
                <Button variant="outline" onClick={onReviewAnother}>
                    Review another company
                </Button>
            </motion.div>
        </div>
    );
}
