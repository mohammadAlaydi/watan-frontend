"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ReviewStep3Data } from "@/lib/reviews/schema";

interface ReviewFormStep3Props {
    data: Partial<ReviewStep3Data>;
    companyName: string;
    onChange: (data: Partial<ReviewStep3Data>) => void;
    errors?: Record<string, string>;
}

function CharCount({ current, min }: { current: number; min: number }) {
    const met = current >= min;
    return (
        <span className={met ? "text-muted" : "text-destructive"}>
            {current}/{min} min
        </span>
    );
}

/** Step 3 — Written review content */
export function ReviewFormStep3({
    data,
    companyName,
    onChange,
    errors,
}: ReviewFormStep3Props) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-charcoal">
                    Tell us more about working at {companyName}
                </h2>
                <p className="mt-1 text-sm text-muted">
                    Be specific and honest. Your review helps thousands of professionals.
                </p>
            </div>

            {/* Review Title */}
            <div className="space-y-2">
                <Label htmlFor="review_title" className="text-sm font-semibold text-charcoal">
                    Review title <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="review_title"
                    placeholder="Great culture, but limited growth opportunities"
                    maxLength={100}
                    value={data.title ?? ""}
                    onChange={(e) => onChange({ ...data, title: e.target.value })}
                    className="h-11"
                />
                <div className="flex justify-between">
                    {errors?.title && (
                        <p className="text-xs text-destructive">{errors.title}</p>
                    )}
                    <span className="ml-auto text-xs text-muted">
                        {(data.title ?? "").length}/100
                    </span>
                </div>
            </div>

            {/* Pros */}
            <div className="space-y-2">
                <Label htmlFor="pros" className="text-sm font-semibold text-charcoal">
                    What did you like about working here?{" "}
                    <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    id="pros"
                    rows={5}
                    maxLength={2000}
                    placeholder="Describe the positive aspects — culture, team, management, perks, growth..."
                    value={data.pros ?? ""}
                    onChange={(e) => onChange({ ...data, pros: e.target.value })}
                />
                <div className="flex justify-between">
                    {errors?.pros && (
                        <p className="text-xs text-destructive">{errors.pros}</p>
                    )}
                    <span className="ml-auto text-xs">
                        <CharCount current={(data.pros ?? "").length} min={100} />
                    </span>
                </div>
            </div>

            {/* Cons */}
            <div className="space-y-2">
                <Label htmlFor="cons" className="text-sm font-semibold text-charcoal">
                    What could be improved?{" "}
                    <span className="text-destructive">*</span>
                </Label>
                <Textarea
                    id="cons"
                    rows={5}
                    maxLength={2000}
                    placeholder="Be constructive — what would make this a better workplace?"
                    value={data.cons ?? ""}
                    onChange={(e) => onChange({ ...data, cons: e.target.value })}
                />
                <div className="flex justify-between">
                    {errors?.cons && (
                        <p className="text-xs text-destructive">{errors.cons}</p>
                    )}
                    <span className="ml-auto text-xs">
                        <CharCount current={(data.cons ?? "").length} min={100} />
                    </span>
                </div>
            </div>

            {/* Advice to Management */}
            <div className="space-y-2">
                <Label htmlFor="advice" className="text-sm font-semibold text-charcoal">
                    Advice to management{" "}
                    <span className="text-xs font-normal text-muted">(optional)</span>
                </Label>
                <Textarea
                    id="advice"
                    rows={3}
                    maxLength={1000}
                    placeholder="What would you tell leadership to improve?"
                    value={data.advice_to_management ?? ""}
                    onChange={(e) =>
                        onChange({ ...data, advice_to_management: e.target.value })
                    }
                />
            </div>

            {/* Guidelines */}
            <div className="rounded-xl border border-border bg-cream p-4">
                <p className="mb-2 text-sm font-semibold text-charcoal">
                    Community guidelines
                </p>
                <ul className="space-y-1 text-xs text-muted">
                    <li>• Be specific and constructive</li>
                    <li>• Focus on workplace experience, not personal disputes</li>
                    <li>• Do not include names of individuals</li>
                    <li>• Do not include confidential company information</li>
                    <li>• False or misleading reviews violate our terms</li>
                </ul>
            </div>
        </div>
    );
}
