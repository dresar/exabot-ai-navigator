import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { devQuickLoginRequest, loginRequest, setTokens } from "@/lib/auth";

const showQuickLogin = import.meta.env.DEV;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function doLogin(userEmail: string, userPassword: string) {
    setError(null);
    setLoading(true);
    try {
      const tokens = await loginRequest(userEmail, userPassword);
      setTokens(tokens.access_token, tokens.refresh_token);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  async function onQuickLogin() {
    setError(null);
    setLoading(true);
    try {
      const tokens = await devQuickLoginRequest();
      setTokens(tokens.access_token, tokens.refresh_token);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login cepat gagal — pastikan API dev jalan dan user ada di DB");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void doLogin(email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md glass-card p-8 space-y-6 border border-border/60">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold gradient-text">ExaBot</h1>
          <p className="text-sm text-muted-foreground text-center">Masuk ke dashboard prediksi AI</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-secondary/40"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses…" : "Masuk"}
          </Button>
        </form>

        {showQuickLogin && (
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">atau</span>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              disabled={loading}
              onClick={() => void onQuickLogin()}
            >
              <Zap className="w-4 h-4" />
              Login cepat (dev)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
