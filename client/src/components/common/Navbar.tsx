import { useEffect, useState } from "react";
import {
  FaBars,
  FaBed,
  FaHome,
  FaSignInAlt,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, isAdmin, isStudent, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const apiRoot = (
    import.meta.env.VITE_API_URL || "http://localhost:5000/api"
  ).replace(/\/api\/?$/, "");
  const avatarUrl = user?.profileImage
    ? user.profileImage.startsWith("http://") ||
      user.profileImage.startsWith("https://")
      ? user.profileImage
      : `${apiRoot}${user.profileImage}`
    : "";
  const profileLink = isAdmin ? "/admin/profile" : "/student/profile";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const dashboardLink = isAdmin
    ? {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: <FaTachometerAlt className="h-4 w-4" />,
      }
    : isStudent
      ? {
          name: "Dashboard",
          href: "/student/dashboard",
          icon: <FaTachometerAlt className="h-4 w-4" />,
        }
      : null;

  const linkBase =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200";
  const linkIdle =
    "text-muted-foreground hover:bg-surface-hover hover:text-primary";
  const linkActive = "bg-surface-active text-foreground";

  // Navbar is now permanently visible on all routes!

  return (
    <nav
      className={`sticky inset-x-0 top-0 z-50 isolate border-b border-border bg-navbar/95 backdrop-blur-md transition-shadow duration-300 ${
        scrolled
          ? "shadow-md shadow-foreground/10"
          : "shadow-sm shadow-foreground/5"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/25">
            <FaBed className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <span className="text-lg font-bold tracking-tight text-foreground">
              Home Treats
            </span>
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
              Student stays
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {!isAuthenticated && (
            <>
              <Link
                to="/"
                className={`${linkBase} ${location.pathname === "/" ? linkActive : linkIdle}`}
              >
                <FaHome className="h-4 w-4" />
                Home
              </Link>
              <Link
                to="/about"
                className={`${linkBase} ${location.pathname === "/about" ? linkActive : linkIdle}`}
              >
                About Us
              </Link>
            </>
          )}

          <Link
            to="/contact"
            className={`${linkBase} ${location.pathname === "/contact" ? linkActive : linkIdle}`}
          >
            Contact Us
          </Link>

          {isAuthenticated && dashboardLink && (
            <Link
              to={dashboardLink.href}
              className={`${linkBase} ${location.pathname === dashboardLink.href ? linkActive : linkIdle}`}
            >
              {dashboardLink.icon}
              {dashboardLink.name}
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to={profileLink}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
                title="Profile"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-active text-xs font-bold text-primary">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-error/10 hover:text-error"
              >
                <FaSignOutAlt className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover hover:text-primary transition"
              >
                <FaSignInAlt className="h-4 w-4" />
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/30 transition hover:bg-primary-hover"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
          aria-expanded={mobileOpen}
          aria-label="Menu"
        >
          {mobileOpen ? (
            <FaTimes className="h-5 w-5" />
          ) : (
            <FaBars className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-navbar px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {!isAuthenticated && (
              <>
                <Link
                  to="/"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface-hover text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                   Home
                </Link>
                <Link
                  to="/about"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface-hover text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  About Us
                </Link>
              </>
            )}
            
            <Link
              to="/contact"
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface-hover text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Contact Us
            </Link>

            {isAuthenticated && dashboardLink && (
              <Link
                to={dashboardLink.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface-hover text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {dashboardLink.name}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="mt-2 flex flex-col gap-1 border-t border-border pt-3">
                <Link
                  to={profileLink}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm text-error hover:bg-error/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium bg-muted hover:bg-surface-hover text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium bg-primary text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
