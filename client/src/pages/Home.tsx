import { useEffect } from "react";
import {
  FaArrowRight,
  FaBed,
  FaBook,
  FaBuilding,
  FaCheckCircle,
  FaChevronDown,
  FaEnvelope,
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
  FaQuoteLeft,
  FaShieldAlt,
  FaStar,
  FaTint,
  FaTshirt,
  FaUtensils,
  FaWifi,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const HERO_IMAGE = "/images/hostel-room.jpg";
const LOCATION = import.meta.env.VITE_HOSTEL_LOCATION || "Jaffna, Sri Lanka";
const ADDRESS =
  import.meta.env.VITE_HOSTEL_ADDRESS ||
  "No. 11, Nallur, Jaffna 40000, Sri Lanka";

const roomTypes = [
  {
    name: "Deluxe double",
    blurb: "Spacious room with study corner and wardrobe.",
    price: "From Rs. 18,000",
    period: "/ month",
    capacity: "2 guests",
    highlights: ["AC & fan", "High-speed WiFi", "Attached bath"],
    featured: true,
  },
  {
    name: "Standard twin",
    blurb: "Bunk-friendly layout ideal for sharing with a course mate.",
    price: "From Rs. 12,500",
    period: "/ month",
    capacity: "2 guests",
    highlights: ["WiFi", "Shared bath nearby", "Desk per bed"],
    featured: false,
  },
  {
    name: "Single studio",
    blurb: "Quiet solo space when you need zero distractions.",
    price: "From Rs. 22,000",
    period: "/ month",
    capacity: "1 guest",
    highlights: ["Private bath", "Kitchenette", "WiFi"],
    featured: false,
  },
];

const facilities = [
  {
    icon: <FaWifi className="h-7 w-7" />,
    title: "WiFi",
    desc: "Fiber-backed connectivity across all floors.",
  },
  {
    icon: <FaBook className="h-7 w-7" />,
    title: "Study areas",
    desc: "Quiet zones and shared desks for exams.",
  },
  {
    icon: <FaTint className="h-7 w-7" />,
    title: "Water 24/7",
    desc: "RO drinking points and steady supply.",
  },
  {
    icon: <FaShieldAlt className="h-7 w-7" />,
    title: "Security",
    desc: "CCTV, access control, on-site staff.",
  },
  {
    icon: <FaTshirt className="h-7 w-7" />,
    title: "Laundry",
    desc: "Washers and dryers on the ground floor.",
  },
  {
    icon: <FaUtensils className="h-7 w-7" />,
    title: "Kitchen",
    desc: "Equipped shared kitchen for residents.",
  },
];

const galleryImages = [
  {
    url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    label: "Exterior",
  },
  {
    url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    label: "Master room",
  },
  {
    url: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=600&q=80",
    label: "Study corner",
  },
  {
    url: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80",
    label: "Dining",
  },
  {
    url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600&q=80",
    label: "Lounge",
  },
  {
    url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
    label: "Washroom",
  },
];

const testimonials = [
  {
    name: "Tharani S.",
    meta: "Medicine, Year 3",
    text: "Clean rooms, honest pricing, and staff who reply on WhatsApp. Best stay I have had near campus.",
    rating: 5,
    initials: "TS",
  },
  {
    name: "Ruvan P.",
    meta: "Engineering, Year 2",
    text: "WiFi never dropped during online labs. The study room on floor 2 is a lifesaver.",
    rating: 5,
    initials: "RP",
  },
  {
    name: "Meera K.",
    meta: "Business, Year 1",
    text: "Felt safe walking in late after society events. Laundry and kitchen are actually maintained.",
    rating: 4,
    initials: "MK",
  },
];

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (!id) return;
    const t = window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 landing-mesh opacity-[0.92]" />
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar/55 via-sidebar/80 to-sidebar" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-primary/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <FaBuilding className="h-4 w-4 text-info" />
              Home Treats · {LOCATION}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              A calmer place to
              <span className="mt-2 block bg-gradient-to-r from-white via-info to-secondary bg-clip-text text-transparent">
                live and study.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
              Modern rooms, fair monthly rates, and facilities that actually
              work — student accommodation designed for real routines, not
              brochure photos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition hover:bg-primary-hover"
              >
                Book now
                <FaArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/rooms"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
              >
                View all rooms
              </Link>
              <a
                href="#gallery"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-7 py-3.5 text-base font-semibold text-info/90 underline-offset-4 hover:text-white hover:underline"
              >
                See gallery
              </a>
            </div>
            <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "Rooms", v: "50+" },
                { k: "Beds", v: "120+" },
                { k: "Rating", v: "4.8★" },
                { k: "Since", v: "2016" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center backdrop-blur-sm"
                >
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/55">
                    {row.k}
                  </dt>
                  <dd className="mt-1 text-xl font-bold tabular-nums text-white">
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/40 to-secondary/25 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
              <img
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=960&q=80"
                alt="Bright furnished bedroom at Home Treats"
                className="aspect-[5/4] w-full object-cover sm:aspect-[4/3]"
              />
              <div className="flex items-center gap-3 border-t border-white/10 bg-sidebar/60 px-5 py-4">
                <FaStar className="h-8 w-8 shrink-0 text-accent" />
                <p className="text-sm leading-snug text-sidebar-foreground">
                  <span className="font-semibold text-white">Top pick</span> for
                  students who want quiet nights and reliable utilities in{" "}
                  {LOCATION.split(",")[0]}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <a
          href="#rooms"
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-0.5 text-white/50 hover:text-white"
        >
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]">
            Scroll
          </span>
          <FaChevronDown className="h-6 w-6 animate-bounce" />
        </a>
      </section>

      {/* Room types — cards instead of tables */}
      <section
        id="rooms"
        className="scroll-mt-24 border-b border-border bg-card py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Rooms
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pick a layout that fits your budget
            </h2>
            <p className="mt-4 text-muted-foreground">
              Transparent highlights — no tiny table text. Confirm live
              availability on the rooms page.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {roomTypes.map((room) => (
              <article
                key={room.name}
                className={`flex flex-col rounded-2xl border bg-muted/40 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${room.featured
                  ? "border-primary/40 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/30"
                  }`}
              >
                {room.featured && (
                  <span className="mb-3 w-fit rounded-full bg-surface-active px-3 py-1 text-xs font-semibold text-primary">
                    Most booked
                  </span>
                )}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {room.name}
                  </h3>
                  <FaBed className="h-6 w-6 shrink-0 text-primary opacity-80" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {room.blurb}
                </p>
                <p className="mt-4 text-2xl font-bold text-foreground">
                  {room.price}
                  <span className="text-base font-normal text-muted-foreground">
                    {room.period}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Capacity: {room.capacity}
                </p>
                <ul className="mt-5 flex flex-col gap-2 border-t border-border/80 pt-5">
                  {room.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-center gap-2 text-sm text-foreground/90"
                    >
                      <FaCheckCircle className="h-4 w-4 shrink-0 text-success" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/rooms"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                >
                  Check availability
                  <FaArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="scroll-mt-24 border-b border-border bg-background py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-md">
              <img
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80"
                alt="Home Treats building"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why students choose{" "}
                <span className="text-primary">Home Treats</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                We run a tight ship: clear house rules, fast maintenance, and
                staff on site. You get a furnished room without surprise fees
                buried in a table footnote.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Walking distance to campus and local transit",
                  "Monthly billing with digital payment options",
                  "Common areas cleaned on a fixed schedule",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-foreground/90">
                    <FaCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-8 flex items-start gap-2 text-sm text-muted-foreground">
                <FaMapMarkerAlt className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {ADDRESS}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="border-b border-border bg-card py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Facilities
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything we maintain in-house for residents.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-muted/50 p-6 transition hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-card text-primary shadow-sm ring-1 ring-border transition group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section
        id="gallery"
        className="scroll-mt-24 border-b border-border bg-background py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Gallery
            </h2>
            <p className="mt-4 text-muted-foreground">
              Spaces you will actually use — kitchens, lounges, and fresh rooms.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((img, i) => (
              <figure
                key={img.label}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-muted shadow-sm ${i === 0
                  ? "sm:col-span-2 sm:row-span-2 min-h-[240px] lg:min-h-[320px]"
                  : "aspect-[4/3] min-h-[200px]"
                  }`}
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sidebar/90 to-transparent px-4 pb-4 pt-10">
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <FaCheckCircle className="h-4 w-4 text-info" />
                    {img.label}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section
        id="reviews"
        className="scroll-mt-24 border-b border-border bg-card py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Reviews
            </h2>
            <p className="mt-4 text-muted-foreground">
              Recent feedback from residents — stars, not asterisks.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="flex h-full flex-col rounded-2xl border border-border bg-muted/50 p-6 shadow-sm"
              >
                <FaQuoteLeft className="h-8 w-8 text-info" aria-hidden />
                <div
                  className="mt-3 flex gap-0.5"
                  aria-label={`${t.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                      key={i}
                      className={`h-4 w-4 ${i < t.rating ? "text-accent" : "text-border"}`}
                    />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                  “{t.text}”
                </p>
                <footer className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {t.initials}
                  </div>
                  <div>
                    <cite className="not-italic text-sm font-semibold text-foreground">
                      {t.name}
                    </cite>
                    <p className="text-xs text-muted-foreground">{t.meta}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sidebar py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-hover to-secondary px-6 py-12 text-center shadow-xl sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-secondary/25 blur-3xl" />
            <h2 className="relative text-2xl font-bold text-white sm:text-3xl">
              Ready to move in?
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-primary-foreground/90">
              Message us for a walkthrough or hold a room while you finalize
              travel.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3 text-sm text-white">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <FaPhone className="h-4 w-4" />
                +94 76 293 2003
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <FaEnvelope className="h-4 w-4" />
                info@HomeTreats.lk
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <FaMapMarkerAlt className="h-4 w-4" />
                {LOCATION}
              </span>
            </div>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 font-semibold text-primary shadow-lg transition hover:bg-slate-100"
              >
                <FaHeart className="h-4 w-4" />
                Contact & booking
              </Link>
              <Link
                to="/rooms"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Browse rooms
                <FaArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
