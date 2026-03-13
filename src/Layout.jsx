import db from '@/api/base44Client';

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { Button } from "@/components/ui/button";
import { Zap, Menu, X, LayoutDashboard, ShieldCheck, LogOut, Bookmark } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    db.auth.isAuthenticated().then((ok) => {
      if (ok) db.auth.me().then(setUser);
    });
  }, []);

  const NAV = [
    { label: "Explore", page: "Marketplace" },
    { label: "Pricing", page: "CreatorSignup" },
  ];

  return (
    <div className="min-h-screen bg-background font-space">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40"
        style={{ background: "rgba(8,7,16,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground tracking-tight">
              Vibe<span className="gradient-text">Market</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <Link key={n.page} to={createPageUrl(n.page)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${currentPageName === n.page ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to={createPageUrl("MyLibrary")}>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Bookmark className="w-4 h-4 mr-1.5" /> Library
                  </Button>
                </Link>
                <Link to={createPageUrl("CreatorDashboard")}>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link to={createPageUrl("AdminDashboard")}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <ShieldCheck className="w-4 h-4 mr-1.5" /> Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => db.auth.logout()} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => db.auth.redirectToLogin()} className="text-muted-foreground">
                  Sign In
                </Button>
                <Link to={createPageUrl("CreatorSignup")}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                    <Zap className="w-3.5 h-3.5 mr-1.5" /> List Tool
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-1.5 text-muted-foreground" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/40 px-4 py-4 flex flex-col gap-2"
            style={{ background: "rgba(8,7,16,0.95)" }}>
            {NAV.map((n) => (
              <Link key={n.page} to={createPageUrl(n.page)} onClick={() => setMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                {n.label}
              </Link>
            ))}
            <div className="border-t border-border/40 pt-3 mt-1 flex flex-col gap-2">
              {user ? (
                <>
                  <Link to={createPageUrl("MyLibrary")} onClick={() => setMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    My Library
                  </Link>
                  <Link to={createPageUrl("CreatorDashboard")} onClick={() => setMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link to={createPageUrl("AdminDashboard")} onClick={() => setMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
                      Admin
                    </Link>
                  )}
                  <button onClick={() => db.auth.logout()} className="px-3 py-2 rounded-lg text-sm text-muted-foreground text-left hover:text-foreground hover:bg-muted/50">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => db.auth.redirectToLogin()} className="px-3 py-2 rounded-lg text-sm text-muted-foreground text-left hover:text-foreground hover:bg-muted/50">
                    Sign In
                  </button>
                  <Link to={createPageUrl("CreatorSignup")} onClick={() => setMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm bg-primary/20 text-primary hover:bg-primary/30">
                    List Your Tool
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="pt-14">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span>VibeMarket — Built by vibers, for everyone.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Marketplace")} className="hover:text-foreground transition-colors">Explore</Link>
            <Link to={createPageUrl("CreatorSignup")} className="hover:text-foreground transition-colors">Creators</Link>
            <span className="text-xs font-mono">© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}