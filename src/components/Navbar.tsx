import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import NotificationBell from "./NotificationBell";
import LanguageSwitcher from "./LanguageSwitcher";
import iebcLogo from "@/assets/iebc-logo.jpg.asset.json";
const logo = iebcLogo.url;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setMobileOpen(false);
  };

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/courses", label: t("nav.courses") },
    { to: "/about", label: t("nav.about") },
    { to: "/events", label: t("nav.events") },
  ];

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={logo}
              alt="IEBC — International Economics and Business Corporation"
              className="h-9 w-9 rounded-full object-contain bg-white ring-1 ring-border/60"
            />
            <span className="text-base font-semibold tracking-tight text-foreground/90 hidden sm:inline">
              IEBC E-Learning
            </span>
          </Link>

          {/* Desktop Navigation - center */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive(l.to)
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions - right */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <LanguageSwitcher />
            {user && <NotificationBell />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t("nav.dashboard")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">{t("nav.register")}</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: notif + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            {user && <NotificationBell />}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm p-0 flex flex-col">
                <SheetHeader className="px-6 py-4 border-b text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <img
                      src={logo}
                      alt=""
                      className="h-8 w-8 rounded-full object-contain bg-white ring-1 ring-border/60"
                    />
                    <span>IEBC E-Learning</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                  {navLinks.map((l) => (
                    <SheetClose asChild key={l.to}>
                      <Link
                        to={l.to}
                        className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive(l.to)
                            ? "bg-muted text-foreground"
                            : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}

                  {user && (
                    <>
                      <div className="my-3 h-px bg-border" />
                      <SheetClose asChild>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-foreground transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {t("nav.dashboard")}
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </div>

                <div className="border-t px-4 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t("nav.language")}
                  </span>
                    <LanguageSwitcher />
                  </div>

                  {user ? (
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("nav.logout")}
                    </Button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <SheetClose asChild>
                        <Link to="/auth">
                          <Button variant="outline" className="w-full">
                            {t("nav.login")}
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/register">
                          <Button className="w-full">{t("nav.register")}</Button>
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
