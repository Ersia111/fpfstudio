import React, { useEffect, useRef, useState } from "react";

const WA = "https://wa.me/355692605353";
const EMAIL = "shemilliersia@gmail.com";

/* ---------- helpers ---------- */
function useInView(ref, opts = { threshold: 0.2 }) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), opts);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return inView;
}

function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }) {
  const ref = useRef(null);
  const [state, setState] = useState("rest");
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) return; // already visible: stay at rest
    setState("pre");
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setState("in"); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${state} ${className}`} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

function LazyVideo({ src, className = "", poster }) {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.05 });
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (inView) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
  }, [inView]);
  return <video ref={ref} className={className} src={src} poster={poster} muted loop playsInline preload="metadata" />;
}

function Counter({ to, suffix = "", prefix = "", decimals = 0, duration = 1800 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf, started = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started) return;
      started = true; io.disconnect();
      const start = performance.now();
      const tick = (t) => {
        const k = Math.min(1, (t - start) / duration);
        setVal(k >= 1 ? to : to * (1 - Math.pow(1 - k, 4)));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      setVal(0);
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); setVal(to); };
  }, []);
  const shown = decimals ? val : Math.round(val);
  return (
    <span ref={ref} className="num">
      {prefix}{shown.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

function Phone({ src, label, sub, tilt = 0, delay = 0 }) {
  return (
    <Reveal className="phone-wrap" delay={delay} style={{ "--tilt": `${tilt}deg` }}>
      <div className="phone">
        <div className="phone-island" />
        <div className="phone-screen">
          <LazyVideo src={src} />
        </div>
      </div>
      {label && (
        <div className="phone-cap">
          <span className="phone-label">{label}</span>
          {sub && <span className="phone-sub">{sub}</span>}
        </div>
      )}
    </Reveal>
  );
}

function SceneHead({ n, kicker, title, children }) {
  return (
    <header className="scene-head">
      <Reveal className="slate">
        <span className="slate-n">SCENE {String(n).padStart(2, "0")}</span>
        <span className="slate-rule" />
        <span className="slate-k">{kicker}</span>
      </Reveal>
      <Reveal as="h2" className="scene-title" delay={80}>{title}</Reveal>
      {children && <Reveal className="scene-lede" delay={160}>{children}</Reveal>}
    </header>
  );
}

/* ---------- nav ---------- */
function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <nav className={`nav ${solid ? "solid" : ""}`}>
      <a href="#top" className="brand">FPF <em>Studio</em></a>
      <div className="nav-links">
        <a href="#work">Work</a>
        <a href="#results">Results</a>
        <a href="#higgsfield">Higgsfield</a>
        <a href="#process">Process</a>
      </div>
      <a href={WA} target="_blank" rel="noreferrer" className="btn btn-small">Let's talk</a>
    </nav>
  );
}

/* ---------- hero ---------- */
function Timecode() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const s = performance.now();
    const id = setInterval(() => setT((performance.now() - s) / 1000), 41);
    return () => clearInterval(id);
  }, []);
  const f = Math.floor((t % 1) * 24), sec = Math.floor(t) % 60, min = Math.floor(t / 60);
  const p = (x) => String(x).padStart(2, "0");
  return <span className="tc">REC ● 00:{p(min)}:{p(sec)}:{p(f)}</span>;
}

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % wides.length), 10000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="hero" id="top">
      <div className="hero-stage">
        {wides.map((src, k) => (
          <div key={src} className={`wide-frame ${k === i ? "on" : ""}`}>
            <video src={src} autoPlay muted loop playsInline preload={k === 0 ? "auto" : "metadata"} />
          </div>
        ))}
        <div className="letterbox top" />
        <div className="letterbox bottom" />
        <div className="reel-dots" aria-hidden="true">
          {wides.map((src, k) => <span key={src} className={k === i ? "on" : ""} />)}
        </div>
      </div>
      <div className="hero-band">
        <div className="hero-hud">
          <Timecode />
          <span>Generated with Higgsfield · directed by Ersia</span>
        </div>
        <div className="hero-row">
          <div className="hero-corner">
            <p className="hero-eyebrow">Ersia Shemilli · Social media specialist &amp; marketing expert</p>
            <h1 className="hero-title">
              In a world of algorithms, hashtags and followers,{" "}
              <em>know the true importance of human connection.</em>
            </h1>
          </div>
          <div className="hero-right">
            <p className="hero-sub">Leave your social media to me<br />and focus on your business.</p>
            <a href={WA} target="_blank" rel="noreferrer" className="btn btn-small">Message me on WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 1. social media marketing ---------- */
const services = [
  ["Strategy", "A monthly plan built around your goals, audience and sales calendar."],
  ["Content", "Photo, reels, carousels and AI-directed video produced for each platform."],
  ["Community", "I answer, engage and build the relationships that turn followers into clients."],
  ["Paid ads", "Campaigns prepared, targeted and tracked so your budget reaches the right people."],
  ["Reporting", "A clear end-of-month report: what grew, what worked, what we do next."],
];

function Marketing() {
  return (
    <section className="scene marketing" id="marketing">
      <div className="ambient"><LazyVideo src="media/rain.mp4" /></div>
      <div className="wrap">
        <SceneHead n={4} kicker="Social media marketing" title={<>Your brand, <em>directed</em> like a film.</>}>
          Every post has a role, every month has a storyline. I plan it, shoot or generate it, publish it,
          and stay in the conversation with your audience, so your business gets attention that turns into clients.
        </SceneHead>
        <ol className="services">
          {services.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 70}>
              <span className="svc-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="svc-t">{t}</span>
              <span className="svc-d">{d}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- 2. soul ---------- */
const principles = [
  ["I listen first", "Before any post, I learn your business, your clients and the way you speak."],
  ["People over numbers", "Followers are people. Content is written for them, not for the algorithm."],
  ["Human voice, AI speed", "I use AI tools like Higgsfield to produce cinematic content faster, with a human eye on every frame."],
  ["You stay informed", "You always know what's planned, what's live and what it achieved."],
];

function Soul() {
  return (
    <section className="scene soul" id="about">
      <div className="wrap soul-grid">
        <Reveal className="soul-photo">
          <div className="soul-stage">
            <span className="soul-disc" />
            <span className="soul-ring" />
            <img src="media/ersia-cutout.png" alt="Ersia Shemilli holding a newspaper that reads 'Leave it to me and focus on your business.'" />
          </div>
          <span className="soul-tag">Ersia Shemilli · Founder of FPF Studio &amp; Aura Studio</span>
        </Reveal>
        <div className="soul-text">
          <SceneHead n={5} kicker="The soul behind your social media" title={<>Hi, I'm <em>Ersia.</em></>}>
            I'm a social media specialist and marketing expert with a computer science background and more than
            five years of running accounts for real businesses. I know the algorithms well, and I know they are
            only half the story. The other half is people.
          </SceneHead>
          <Reveal as="h3" className="mini-head">The way I work</Reveal>
          <ul className="principles">
            {principles.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={i * 80}>
                <strong>{t}</strong>
                <span>{d}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. feeds ---------- */
const feeds = [
  ["media/feed1.mp4", "@remax_albania_", "Real estate", -4],
  ["media/feed2.mp4", "@kles_event", "Event planning", 2],
  ["media/feed3.mp4", "@mobileri.nobel", "Home furniture", -2],
  ["media/feed4.mp4", "@aurastudio.al", "My studio", 3],
  ["media/feed5.mp4", "@fjaleperfjale", "16.7K followers", -3],
];

function Feeds() {
  return (
    <section className="scene feeds" id="work">
      <div className="wrap">
        <SceneHead n={2} kicker="Feeds I manage" title={<>Grids that look like <em>a brand,</em> not a random scroll.</>}>
          Live recordings of Instagram feeds I plan, design and post for every week.
        </SceneHead>
      </div>
      <div className="phone-row">
        {feeds.map(([src, l, s, tilt], i) => (
          <Phone key={src} src={src} label={l} sub={s} tilt={tilt} delay={i * 90} />
        ))}
      </div>
    </section>
  );
}

/* ---------- 4. results ---------- */
const sectors = [
  ["Real estate", "VIP Realty · Illyrian Realty · REMAX Albania"],
  ["Home furniture", "Mobileri Nobel"],
  ["Event planning", "Kles Event"],
  ["Architecture studios", "Eternal Design"],
  ["Hair & beauty", "Salon and beauty Instagram accounts"],
  ["Fashion", "Class by Alketa Vejsiu"],
];

function Results() {
  return (
    <section className="scene results" id="results">
      <div className="wrap">
        <SceneHead n={3} kicker="Results so far" title={<>The numbers behind the <em>connection.</em></>} />
        <div className="stats">
          <Reveal className="stat big"><Counter to={20} prefix="+" /><span className="stat-l">businesses managed successfully</span></Reveal>
          <Reveal className="stat big" delay={80}><Counter to={5} prefix="+" /><span className="stat-l">years of experience in social media</span></Reveal>
          <Reveal className="stat" delay={160}><Counter to={8.17} decimals={2} suffix="M" /><span className="stat-l">views on one managed account, 10 Sep – 9 Nov</span></Reveal>
          <Reveal className="stat" delay={240}><Counter to={1.39} decimals={2} suffix="M" /><span className="stat-l">accounts reached in the same period, +45.8%</span></Reveal>
          <Reveal className="stat" delay={320}><Counter to={222} suffix="K+" /><span className="stat-l">views in 30 days for Illyrian Realty</span></Reveal>
          <Reveal className="stat" delay={400}><Counter to={157} prefix="+" suffix="%" /><span className="stat-l">views in 30 days for REMAX Albania</span></Reveal>
        </div>

        <div className="proof">
          <Reveal className="proof-card tall"><img src="media/views.jpg" alt="Instagram insights: 8,175,546 views and 1,396,227 accounts reached between 10 Sep and 9 Nov" /><span>Instagram insights · 60 days</span></Reveal>
          <Reveal className="proof-card" delay={100}><img src="media/illyrian.jpg" alt="Illyrian Realty: 222.2K views and 148 new followers in 30 days" /><span>Illyrian Realty · 30 days</span></Reveal>
          <Reveal className="proof-card" delay={200}><img src="media/grid.jpg" alt="Illyrian Realty Instagram grid designed by Aura Studio" /><span>Illyrian Realty · feed design</span></Reveal>
          <Reveal className="proof-card tall" delay={300}><img src="media/dashboard.jpg" alt="Instagram dashboard: 142,972 views, up 157% in 30 days" /><span>REMAX Albania · 30 days</span></Reveal>
        </div>

        <Reveal as="h3" className="mini-head">Sectors and brands</Reveal>
        <ul className="sectors">
          {sectors.map(([s, b], i) => (
            <Reveal as="li" key={s} delay={i * 60}>
              <span className="sec-s">{s}</span>
              <span className="sec-b">{b}</span>
            </Reveal>
          ))}
        </ul>
      </div>
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>
              VIP Realty ✦ Illyrian Realty ✦ REMAX Albania ✦ Mobileri Nobel ✦ Kles Event ✦ Eternal Design ✦ Class by Alketa Vejsiu ✦ Hair &amp; Beauty ✦&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. education ---------- */
const edu = [
  ["Degree", "Bachelor of Computer Science", "The technical base behind how I read data, platforms and algorithms."],
  ["Award", "1st place, Hackathon", "Won by building a job-posting business and platform from idea to working product."],
  ["Certifications", "Start-up programmes", "Several certifications on building, launching and growing start-ups."],
  ["License", "Real estate license", "Which is why real estate brands trust me to speak their language."],
];

function Education() {
  return (
    <section className="scene education" id="education">
      <div className="wrap">
        <SceneHead n={6} kicker="Education" title={<>Trained in <em>code,</em> fluent in people.</>} />
        <div className="edu-grid">
          {edu.map(([k, t, d], i) => (
            <Reveal className={`edu ${i === 1 ? "gold" : ""}`} key={t} delay={i * 90}>
              <span className="edu-k">{k}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 6. higgsfield ---------- */
const hf = [
  ["media/hf1.mp4", "Luxury watch", "Macro product film", 0],
  ["media/hf2.mp4", "Fine jewelry", "Product reveal", 0],
  ["media/hf3.mp4", "MonChéri drinks", "Beverage ad", 0],
  ["media/hf4.mp4", "Celebration", "Event teaser", 0],
  ["media/hf5.mp4", "Dental clinic", "Concept campaign", 0],
];
const wides = ["media/rain.mp4", "media/pizza.mp4"];

function Higgsfield() {
  return (
    <section className="scene higgsfield" id="higgsfield">
      <div className="wrap">
        <SceneHead n={1} kicker="Higgsfield expert" title={<>Cinematic ads, <em>without</em> the film crew.</>}>
          I direct AI video in Higgsfield: product macros, brand teasers and story-driven ads that look like
          a studio shoot, delivered in days instead of weeks.
        </SceneHead>
      </div>
      <div className="phone-row hf-row">
        {hf.map(([src, l, s], i) => (
          <Phone key={src} src={src} label={l} sub={s} tilt={0} delay={i * 90} />
        ))}
      </div>
    </section>
  );
}

/* ---------- 7. process ---------- */
const steps = [
  ["You reach out", "Tell me about your business on WhatsApp or email."],
  ["Your package", "I send my packages, or we build a personalised one around your business and the volume of work."],
  ["We make the deal", "Clear scope, clear price, clear start date."],
  ["Strategy & calendar", "You receive the strategy, the platforms and the full content calendar for the month."],
  ["Create · post · engage", "I create the content, publish it, engage with your audience and prepare the ads."],
  ["Monthly report", "At the end of the month you get a report with the results and next steps."],
];

function Process() {
  const ref = useRef(null);
  const [p, setP] = useState(1);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const on = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const k = (window.innerHeight * 0.75 - r.top) / r.height;
      setP(Math.max(0, Math.min(1, k)));
    };
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <section className="scene process" id="process">
      <div className="wrap">
        <SceneHead n={7} kicker="Process" title={<>From first message to <em>monthly report.</em></>} />
        <ol className="steps" ref={ref} style={{ "--p": p }}>
          <span className="steps-line" />
          {steps.map(([t, d], i) => (
            <Reveal as="li" key={t} delay={i * 60} className={p * steps.length > i + 0.2 ? "lit" : ""}>
              <span className="step-dot">{i + 1}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- 8. platforms ---------- */
const platforms = [
  ["Instagram", "Feed, reels, stories and DMs"],
  ["TikTok", "Short-form video built for reach"],
  ["Facebook", "Pages, community and Meta ads"],
  ["LinkedIn", "Authority content for founders and B2B"],
  ["Google Business Profile", "Local search, reviews, photos and posts"],
];

function Platforms() {
  return (
    <section className="scene platforms" id="platforms">
      <div className="wrap">
        <SceneHead n={8} kicker="Platforms I manage" title={<>Wherever your clients <em>scroll.</em></>} />
        <ul className="plat-list">
          {platforms.map(([n, d], i) => (
            <Reveal as="li" key={n} delay={i * 70}>
              <span className="plat-n">{n}</span>
              <span className="plat-d">{d}</span>
              <span className="plat-arrow" aria-hidden="true">→</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */
function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        <Reveal as="p" className="foot-kicker">Final scene</Reveal>
        <Reveal as="h2" className="foot-title" delay={80}>
          Leave your social media <em>to me.</em>
        </Reveal>
        <Reveal as="p" className="foot-sub" delay={160}>And focus on your business.</Reveal>
        <div className="contact-grid">
          <a className="contact" href={WA} target="_blank" rel="noreferrer">
            <span className="c-k">WhatsApp</span><span className="c-v">+355 69 260 5353</span>
          </a>
          <a className="contact" href={`mailto:${EMAIL}`}>
            <span className="c-k">Email</span><span className="c-v">{EMAIL}</span>
          </a>
          <a className="contact" href="https://www.instagram.com/aurastudio.al/" target="_blank" rel="noreferrer">
            <span className="c-k">Instagram · studio</span><span className="c-v">@aurastudio.al</span>
          </a>
          <a className="contact" href="https://www.instagram.com/fjaleperfjale/" target="_blank" rel="noreferrer">
            <span className="c-k">Instagram</span><span className="c-v">@fjaleperfjale</span>
          </a>
        </div>
        <div className="credits">
          <span>FPF Studio</span>
          <span>Social media · Marketing · Higgsfield</span>
          <span>© {new Date().getFullYear()} FPF Studio</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Higgsfield />
        <Feeds />
        <Results />
        <Marketing />
        <Soul />
        <Education />
        <Process />
        <Platforms />
      </main>
      <Footer />
    </>
  );
}
