"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Linkedin, Globe, Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApplicationStep1Data } from "@/lib/jobs/schema";

interface ApplyStep1Props {
    data: Partial<ApplicationStep1Data>;
    onChange: (data: Partial<ApplicationStep1Data>) => void;
    errors: Record<string, string>;
    jobTitle: string;
    companyName: string;
    resumeRequired: boolean;
}

/**
 * Step 1 of the apply flow: contact info + resume upload.
 */
export function ApplyStep1({
    data,
    onChange,
    errors,
    jobTitle,
    companyName,
    resumeRequired,
}: ApplyStep1Props) {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size
        if (file.size > 5 * 1024 * 1024) {
            onChange({ ...data });
            return;
        }

        // Validate type
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(file.type)) {
            return;
        }

        // For MVP, store file name; actual upload would go to Supabase Storage
        onChange({ ...data, resumeUrl: file.name });
    };

    return (
        <div>
            <h2 className="mb-1 text-xl font-bold text-charcoal">
                Apply to {jobTitle} at {companyName}
            </h2>
            <p className="mb-6 text-sm text-muted">
                Review your details before applying
            </p>

            <div className="space-y-4">
                {/* Full name */}
                <div>
                    <Label htmlFor="fullName">
                        Full name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="fullName"
                        value={data.fullName ?? ""}
                        onChange={(e) => onChange({ ...data, fullName: e.target.value })}
                        placeholder="Your full name"
                        className="mt-1"
                    />
                    {errors.fullName && (
                        <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <Label htmlFor="email">
                        Email address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                        <Input
                            id="email"
                            type="email"
                            value={data.email ?? ""}
                            onChange={(e) => onChange({ ...data, email: e.target.value })}
                            className="pr-32"
                            readOnly={!!data.email}
                        />
                        {data.email && (
                            <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs text-olive">
                                <Lock className="h-3 w-3" />
                                Verified email
                            </span>
                        )}
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <Label htmlFor="phone">Phone number (optional)</Label>
                    <Input
                        id="phone"
                        value={data.phone ?? ""}
                        onChange={(e) => onChange({ ...data, phone: e.target.value })}
                        placeholder="+971 50 XXX XXXX"
                        className="mt-1"
                    />
                </div>

                {/* Resume */}
                <div>
                    <Label>
                        Resume {resumeRequired && <span className="text-red-500">*</span>}
                    </Label>

                    {data.resumeUrl ? (
                        <div className="mt-1 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
                            <FileText className="h-5 w-5 text-green-600" />
                            <span className="flex-1 truncate text-sm text-charcoal">
                                {data.resumeUrl}
                            </span>
                            <span className="text-xs text-green-600">✓</span>
                            <button
                                type="button"
                                onClick={() => onChange({ ...data, resumeUrl: "" })}
                                className="text-muted hover:text-charcoal"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-olive hover:bg-olive-subtle/30">
                            <Upload className="mb-2 h-6 w-6 text-muted" />
                            <span className="text-sm text-charcoal">Upload your resume</span>
                            <span className="mt-1 text-xs text-muted">
                                PDF, DOC, DOCX · Max 5MB
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="mt-3 border-olive text-olive"
                            >
                                Browse files
                            </Button>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    )}
                    {errors.resumeUrl && (
                        <p className="mt-1 text-xs text-red-500">{errors.resumeUrl}</p>
                    )}
                </div>

                {/* LinkedIn */}
                <div>
                    <Label htmlFor="linkedin">LinkedIn profile (optional)</Label>
                    <div className="relative mt-1">
                        <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input
                            id="linkedin"
                            value={data.linkedinUrl ?? ""}
                            onChange={(e) =>
                                onChange({ ...data, linkedinUrl: e.target.value })
                            }
                            placeholder="https://linkedin.com/in/yourprofile"
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Portfolio */}
                <div>
                    <Label htmlFor="portfolio">Portfolio / Website (optional)</Label>
                    <div className="relative mt-1">
                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input
                            id="portfolio"
                            value={data.portfolioUrl ?? ""}
                            onChange={(e) =>
                                onChange({ ...data, portfolioUrl: e.target.value })
                            }
                            placeholder="https://yourportfolio.com"
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
