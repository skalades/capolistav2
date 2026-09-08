"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/actions/auth";
import { getSettings } from "@/app/actions/settings";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("Capolista");

  useEffect(() => {
    getSettings().then(data => {
      if (data) {
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.companyName) setCompanyName(data.companyName);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    const result = await loginUser(email, password);
    
    if (result.success) {
      router.push("/");
    } else {
      setErrorMsg(result.error || "Login failed");
      setIsLoading(false);
    }
  };

  const getFullLogoUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3005";
    return `${baseUrl}${path}`;
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Decorative elements for industrial feel */}
        <div className="flex justify-between items-end mb-2 px-1">
          <div className="font-mono text-xs text-capo-ink-soft uppercase tracking-widest">
            System Access
          </div>
          <div className="w-12 h-[1px] bg-capo-line"></div>
        </div>

        <div className="bg-capo-panel border-2 border-capo-ink p-8 relative shadow-[4px_4px_0_0_var(--color-capo-ink)]">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-capo-ink" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-capo-ink" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-capo-ink" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-capo-ink" />

          <div className="text-center mb-8">
            {logoUrl && (
              <div className="flex justify-center mb-4">
                <img src={getFullLogoUrl(logoUrl)} alt={companyName} className="max-h-24 object-contain" />
              </div>
            )}
            <h1 className="font-oswald text-4xl text-capo-ink uppercase tracking-tight mb-1">
              {companyName}
            </h1>
            <p className="font-mono text-xs text-capo-ink-soft mb-4">
              AUTHORIZATION REQUIRED
            </p>
            {errorMsg && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm font-mono">
                {errorMsg}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block font-mono text-xs font-semibold text-capo-ink uppercase tracking-wider"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-capo-bg border border-capo-line p-3 font-sans text-sm focus:border-capo-ink focus:outline-none focus:ring-1 focus:ring-capo-ink transition-colors"
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block font-mono text-xs font-semibold text-capo-ink uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-capo-bg border border-capo-line p-3 font-sans text-sm focus:border-capo-ink focus:outline-none focus:ring-1 focus:ring-capo-ink transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-capo-navy hover:bg-capo-accent text-capo-bg font-oswald text-lg uppercase tracking-wider py-4 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-capo-bg border-t-transparent rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-capo-line text-center">
            <p className="font-mono text-[10px] text-capo-ink-soft">
              SECURE CONNECTION ESTABLISHED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
