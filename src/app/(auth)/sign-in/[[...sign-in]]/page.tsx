"use client";

import { SignIn } from "@clerk/nextjs";

const appearance = {
  elements: {
    rootBox: "w-full",
    card: "shadow-none p-0 bg-transparent",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "border border-border rounded-xl h-11 font-medium text-charcoal hover:bg-olive-subtle transition-colors",
    socialButtonsBlockButtonText: "font-medium text-sm",
    dividerLine: "bg-border",
    dividerText: "text-muted text-xs",
    formFieldLabel: "text-charcoal font-medium text-sm",
    formFieldInput:
      "border-border rounded-xl h-11 text-sm focus:border-olive focus:ring-1 focus:ring-olive bg-white",
    formButtonPrimary:
      "bg-olive hover:bg-charcoal rounded-xl h-11 font-semibold text-sm transition-colors",
    footerActionLink: "text-olive font-medium hover:text-olive-light",
    identityPreviewText: "text-charcoal",
    formResendCodeLink: "text-olive",
  },
  variables: {
    colorPrimary: "#4A5C3A",
    colorBackground: "#FAF8F4",
    colorText: "#1C1F1A",
    colorTextSecondary: "#7A8275",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#1C1F1A",
    borderRadius: "12px",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  },
};

export default function SignInPage(props: {
  params: Promise<{ "sign-in"?: string[] }>;
}) {
  void props;
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-charcoal">Welcome back</h1>
      <p className="mb-6 text-sm text-muted">
        Sign in to your Watan account.
      </p>
      {hasClerk ? (
        <SignIn appearance={appearance} />
      ) : (
        <div className="rounded-xl bg-olive-subtle p-6 text-center">
          <p className="text-sm font-medium text-olive">
            Clerk authentication
          </p>
          <p className="mt-1 text-xs text-muted">
            Add your Clerk keys to .env.local to enable sign-in
          </p>
        </div>
      )}
    </div>
  );
}
