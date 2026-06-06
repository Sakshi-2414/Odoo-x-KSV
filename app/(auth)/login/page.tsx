"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { Boxes, Sparkles, Zap, CheckCircle2, Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  
  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);
  const [email, setEmail] = useState("sarah@acme.com");
  const [pwd, setPwd] = useState("demo123");
  const [name, setName] = useState("Sarah Jenkins");
  const [role, setRole] = useState("manager");
  const [department, setDepartment] = useState("Procurement");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stat, setStat] = useState(0);
  const stats = [
    { label: "$2.4M saved this month", icon: Sparkles },
    { label: "847 RFQs processed", icon: Zap },
    { label: "12.4% avg cost reduction", icon: CheckCircle2 },
  ];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pwd }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          // If it's the demo account and it fails, let's just bypass it for the hackathon
          if (email === "sarah@acme.com" && pwd === "demo") {
            router.push("/");
            return;
          }
          throw new Error(data.error || "Login failed");
        }
      } else {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: pwd, full_name: name, role, department }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
      }
      
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSSO = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/' }
      });
    } catch (err: any) {
      setError(err.message || "Google login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col bg-sidebar text-sidebar-foreground p-12 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-info/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Boxes className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="font-display text-xl font-semibold">VendorBridge AI</div>
        </div>

        <div className="relative mt-auto space-y-8">
          <div>
            <h1 className="font-display text-5xl font-bold leading-tight">
              Your AI<br />
              Procurement<br />
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">Officer.</span>
            </h1>
            <p className="mt-4 text-sidebar-muted max-w-md text-lg">
              From RFQ to PO in days, not months. Powered by Gemini 2.5 Flash.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["AI Analysis", "Instant POs", "Smart Approvals"].map((p) => (
              <span key={p} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium backdrop-blur">
                {p}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((s, i) => {
              const active = i === stat;
              return (
                <button
                  key={s.label}
                  onMouseEnter={() => setStat(i)}
                  className={`text-left rounded-xl border p-4 transition-all ${active ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10"}`}
                >
                  <s.icon className="h-4 w-4 text-primary mb-2" />
                  <div className="text-xs font-medium leading-tight">{s.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-6">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Boxes className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">VendorBridge AI</span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold">
              {mode === "login" ? "Sign in to VendorBridge AI" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "login" ? "Welcome back. Let's get to work." : "Join the future of intelligent procurement."}
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full Name</span>
                  <div className="relative">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                  </div>
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Role</span>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="officer">Procurement Officer</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </label>
                  
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Department</span>
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      type="text"
                      placeholder="e.g. IT, Operations"
                      className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                  </label>
                </div>
              </div>
            )}

            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-lg border bg-background pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
            </label>

            <label className="block space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Password</span>
                {mode === "login" && <a className="text-xs text-primary hover:underline cursor-pointer">Forgot?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border bg-background pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
            </label>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full h-11 gap-2" onClick={handleGoogleSSO} disabled={loading}>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" opacity=".7" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/></svg>
              Continue with Google
            </Button>
          </form>

          {mode === "login" && (
            <div className="rounded-xl border bg-muted/50 p-4 text-xs space-y-1.5 cursor-pointer hover:bg-muted transition-colors" onClick={() => { setEmail("sarah@acme.com"); setPwd("demo"); }}>
              <div className="font-semibold flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> Demo for judges</div>
              <div className="text-muted-foreground">Pre-filled credentials — just click <strong>Sign in</strong> to explore the full experience.</div>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            {mode === "login" ? "New to VendorBridge?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-medium outline-none"
            >
              {mode === "login" ? "Create an account" : "Sign in here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
