export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream pt-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-[var(--shadow-watan)]">
        <h1 className="mb-2 text-2xl font-bold text-charcoal">
          Join Watan
        </h1>
        <p className="mb-6 text-sm text-muted">
          Create your account. Clerk authentication will be integrated here.
        </p>
        <div className="rounded-xl bg-olive-subtle p-4 text-center text-sm text-muted">
          Clerk sign-up component placeholder
        </div>
      </div>
    </div>
  );
}
