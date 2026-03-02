import { Button } from "@/components/ui/button";
import {
  Bell,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Loader2,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURES = [
  {
    icon: Users,
    title: "Connect & Share",
    description:
      "Post photos, videos, and updates with your entire campus community.",
    color: "bg-blue-500",
  },
  {
    icon: Bell,
    title: "College Notices",
    description:
      "Stay updated with official announcements, exam schedules, and events.",
    color: "bg-amber-500",
  },
  {
    icon: MessageCircle,
    title: "Interactive Feeds",
    description:
      "Like, comment, and engage with posts from students and faculty.",
    color: "bg-purple-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Powered by Internet Computer — your data is fully decentralized.",
    color: "bg-emerald-500",
  },
];

const STATS = [
  { value: "2,400+", label: "Students" },
  { value: "180+", label: "Faculty" },
  { value: "50+", label: "Activities" },
];

export function AuthPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToFeatures() {
    document
      .getElementById("features-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.005_250)]">
      {/* ── TOP NAV ── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[oklch(0.92_0.015_250)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[oklch(0.42_0.18_265)] flex items-center justify-center shadow-md">
              <GraduationCap className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span
              className={`font-display text-lg font-bold transition-colors ${scrolled ? "text-[oklch(0.17_0.025_260)]" : "text-white"}`}
            >
              campusX
            </span>
          </div>

          {/* Sign in button */}
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="sm"
            className="bg-white text-[oklch(0.25_0.08_265)] hover:bg-white/90 font-semibold rounded-xl shadow-sm px-5"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </div>
      </motion.nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Hero background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/uploads/WhatsApp-Image-2026-03-02-at-2.24.15-PM-1.jpeg')`,
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/70" />

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-8">
              <BookOpen className="w-3.5 h-3.5 text-white/80" />
              <span className="text-white/90 text-xs font-medium tracking-wide uppercase">
                Your Campus, Digitally Connected
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              campusX:{" "}
              <span className="text-[oklch(0.78_0.15_255)]">
                The Next Generation Campus Hub
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/75 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Uniting academic life and social interaction in one dynamic
              platform.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  size="lg"
                  className="h-13 px-8 text-base font-bold bg-[oklch(0.42_0.18_265)] hover:bg-[oklch(0.38_0.18_265)] text-white rounded-2xl shadow-lg shadow-[oklch(0.3_0.15_265)]/40 gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-5 h-5" />
                      Join campusX
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={scrollToFeatures}
                  variant="outline"
                  size="lg"
                  className="h-13 px-8 text-base font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30 hover:border-white/50 text-white rounded-2xl gap-2 transition-all"
                >
                  Learn More
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-3 gap-4 mt-16 max-w-sm mx-auto"
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20"
              >
                <div className="font-display font-bold text-xl text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-white/65 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToFeatures}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white/80 transition-colors flex flex-col items-center gap-1"
          aria-label="Scroll to features"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeInOut",
            }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </section>

      {/* ── WHY CAMPUSCONNECT SECTION ── */}
      <section id="features-section" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[oklch(0.17_0.025_260)] mb-4">
              Why campusX?
            </h2>
            <p className="text-[oklch(0.45_0.03_255)] text-lg max-w-2xl mx-auto leading-relaxed">
              Everything your campus community needs — in one place. Connect
              with classmates, stay on top of college news, and never miss an
              event.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="group bg-white border border-[oklch(0.92_0.015_250)] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  <div
                    className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-sm`}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-[oklch(0.2_0.03_260)] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[oklch(0.5_0.03_255)] leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GET STARTED TODAY SECTION ── */}
      <section className="py-20 bg-gradient-to-br from-[oklch(0.22_0.08_265)] via-[oklch(0.25_0.1_255)] to-[oklch(0.18_0.06_280)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Get Started Today
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              Join thousands of students and faculty already connected on
              campusX. Set up your profile in minutes.
            </p>

            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="lg"
                className="h-14 px-10 text-base font-bold bg-white text-[oklch(0.25_0.1_265)] hover:bg-white/90 rounded-2xl shadow-lg gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5" />
                    Sign Up Now
                  </>
                )}
              </Button>
            </motion.div>

            <p className="text-white/40 text-xs mt-6">
              Free to use · Secured by Internet Identity · Decentralized
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-[oklch(0.92_0.015_250)] py-5 text-center">
        <p className="text-xs text-[oklch(0.55_0.02_255)]">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[oklch(0.42_0.18_265)] hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
