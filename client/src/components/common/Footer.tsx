import { useState, type FormEvent } from "react";
import {
  FaBed,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");

  const onNewsletter = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    window.location.href = `mailto:info@HomeTreats.lk?subject=Newsletter&body=Please add ${encodeURIComponent(email)} to updates.`;
    setEmail("");
  };

  const location = useLocation();
  if (['/login', '/register', '/forgot-password','/student/dashboard'].includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="w-full border-t border-border bg-navbar">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20">
                <FaBed className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Home Treats
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Student-friendly stays in Jaffna — safe rooms, clear pricing, and
              facilities you can rely on.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { Icon: FaFacebook, label: "Facebook" },
                { Icon: FaTwitter, label: "Twitter" },
                { Icon: FaInstagram, label: "Instagram" },
                { Icon: FaLinkedin, label: "LinkedIn" },
                { Icon: FaWhatsapp, label: "WhatsApp" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground transition hover:border-primary/40 hover:bg-surface-hover hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Quick links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/rooms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Rooms
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <FaEnvelope className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href="mailto:info@HomeTreats.lk"
                  className="hover:text-primary"
                >
                  info@HomeTreats.lk
                </a>
              </li>
              <li className="flex items-start gap-2">
                <FaPhone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+94762932003" className="hover:text-primary">
                  +94 76 293 2003
                </a>
              </li>
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  No. 11, Nallur
                  <br />
                  Jaffna 40000, Sri Lanka
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Newsletter
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Get openings and monthly specials (low volume).
            </p>
            <form
              onSubmit={onNewsletter}
              className="mt-4 flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none ring-primary/0 transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Home Treats. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built for students in <span className="text-primary">Jaffna</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
