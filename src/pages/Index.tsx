import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const TEAM_IMAGE = "https://cdn.poehali.dev/projects/f948ab59-8b43-426a-95d0-8243ac478a1d/files/fa085e2b-aae6-4656-830c-7f4f21a96235.jpg";
const TECH_IMAGE = "https://cdn.poehali.dev/projects/f948ab59-8b43-426a-95d0-8243ac478a1d/files/cdee6acb-57ac-45c9-8125-95e4ebc39c79.jpg";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const services = [
  { icon: "Layers", title: "Стратегия и консалтинг", desc: "Глубокий анализ вашего рынка, разработка стратегии роста и чёткого плана действий для достижения бизнес-целей.", color: "from-pink-500 to-purple-600" },
  { icon: "TrendingUp", title: "Маркетинг и продвижение", desc: "Комплексные маркетинговые решения: от SEO и контента до таргетированной рекламы с измеримым результатом.", color: "from-purple-600 to-blue-500" },
  { icon: "Code2", title: "Цифровые продукты", desc: "Разработка сайтов, мобильных приложений и IT-решений, которые работают и приносят прибыль.", color: "from-blue-500 to-cyan-400" },
  { icon: "BarChart3", title: "Аналитика и данные", desc: "Сбор, анализ и визуализация данных для принятия умных решений на основе фактов, а не интуиции.", color: "from-cyan-400 to-teal-500" },
  { icon: "Users", title: "Развитие команды", desc: "Обучение персонала, выстраивание процессов и формирование корпоративной культуры для максимальной эффективности.", color: "from-orange-400 to-pink-500" },
  { icon: "Zap", title: "Автоматизация", desc: "Внедрение инструментов автоматизации для снижения операционных затрат и повышения скорости работы.", color: "from-yellow-400 to-orange-500" },
];

const steps = [
  { num: "01", title: "Знакомство", desc: "Проводим встречу, изучаем ваш бизнес, задачи и цели. Формируем чёткое понимание проекта." },
  { num: "02", title: "Анализ", desc: "Исследуем рынок и конкурентов, выявляем точки роста и барьеры на пути к результату." },
  { num: "03", title: "Стратегия", desc: "Разрабатываем детальный план работ с конкретными метриками, сроками и ответственными." },
  { num: "04", title: "Реализация", desc: "Внедряем решения шаг за шагом, держим вас в курсе каждого действия и корректируем при необходимости." },
  { num: "05", title: "Результат", desc: "Замеряем достигнутые показатели, делаем выводы и формируем план дальнейшего масштабирования." },
];

const results = [
  { value: "340%", label: "Рост конверсии в среднем по проектам" },
  { value: "120+", label: "Успешных проектов за 5 лет" },
  { value: "2.5×", label: "Средний рост выручки клиентов" },
  { value: "98%", label: "Клиентов возвращаются снова" },
];

const faqs = [
  { q: "Сколько времени занимает запуск проекта?", a: "В среднем от 2 до 4 недель в зависимости от сложности задачи. После первой встречи мы даём чёткий план с датами." },
  { q: "Как вы работаете с небольшим бюджетом?", a: "Мы предлагаем гибкие форматы сотрудничества: от разовых консультаций до комплексного ведения. Есть решения для любого бюджета." },
  { q: "Как вы измеряете результаты работы?", a: "Ещё до старта мы фиксируем ключевые метрики и целевые показатели. Каждый месяц — детальный отчёт с цифрами." },
  { q: "Работаете ли вы с компаниями из разных сфер?", a: "Да, наши методики универсальны. За 5 лет мы работали с ритейлом, IT, производством, строительством и сферой услуг." },
  { q: "Что если результат меня не устроит?", a: "Мы работаем до достижения оговорённых KPI. Если цели не достигнуты по нашей вине — бесплатно продолжаем работу." },
];

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#about", label: "О нас" },
    { href: "#services", label: "Услуги" },
    { href: "#process", label: "Процесс" },
    { href: "#results", label: "Результаты" },
    { href: "#faq", label: "FAQ" },
    { href: "#contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen font-body" style={{ background: "#0A0A1A", color: "#fff" }}>

      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3 backdrop-blur-xl" : "py-5"}`}
        style={{
          background: scrolled ? "rgba(10,10,26,0.9)" : "transparent",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="font-display text-2xl font-bold">
            <span className="gradient-text">APEX</span>
            <span className="text-white opacity-60 ml-1">Group</span>
          </a>
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = "var(--brand-1)"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = ""; }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contacts" className="hidden md:inline-flex btn-gradient text-white text-sm font-semibold px-6 py-2.5 rounded-full">
            Обсудить проект
          </a>
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden mt-3 mx-4 rounded-2xl p-4" style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.1)" }}>
            {navLinks.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 px-2 text-white/80 hover:text-white border-b border-white/5 last:border-0 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a href="#contacts" className="block mt-3 btn-gradient text-white text-sm font-semibold px-6 py-3 rounded-full text-center">
              Обсудить проект
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-overlay">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-pulse-glow"
            style={{ background: "radial-gradient(circle, rgba(255,60,172,0.3) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-pulse-glow delay-300"
            style={{ background: "radial-gradient(circle, rgba(43,134,197,0.25) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(120,75,160,0.15) 0%, transparent 70%)", filter: "blur(80px)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center pt-24 pb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 animate-slide-up"
              style={{ background: "rgba(255,60,172,0.12)", border: "1px solid rgba(255,60,172,0.3)" }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--brand-1)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--brand-1)" }}>Агентство полного цикла</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Превращаем{" "}
              <span className="gradient-text">идеи</span>{" "}
              в{" "}
              <span className="gradient-text-warm">результат</span>
            </h1>
            <p className="text-lg text-white/60 mb-8 leading-relaxed">
              Стратегия, маркетинг, разработка и аналитика в одном окне. Мы берёмся за проекты, которые должны расти быстро и работать надёжно.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#contacts" className="btn-gradient text-white font-semibold px-8 py-4 rounded-full text-base inline-flex items-center gap-2">
                Начать проект <Icon name="ArrowRight" size={18} />
              </a>
              <a href="#services"
                className="text-white font-semibold px-8 py-4 rounded-full text-base inline-flex items-center gap-2 transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                Наши услуги
              </a>
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: "linear-gradient(135deg, rgba(255,60,172,0.3), rgba(43,134,197,0.3))", filter: "blur(30px)" }} />
            <img
              src={TECH_IMAGE}
              alt="Технологии"
              className="relative rounded-3xl w-full object-cover"
              style={{ border: "1px solid rgba(255,255,255,0.1)", aspectRatio: "4/3" }}
            />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-xs text-white/30">Прокрутите вниз</span>
          <Icon name="ChevronDown" size={20} className="text-white/30" />
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {results.map((r, i) => (
            <AnimatedSection key={i} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold gradient-text">{r.value}</div>
              <div className="text-xs md:text-sm text-white/50 mt-1">{r.label}</div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <AnimatedSection className="relative">
            <div className="absolute -inset-4 rounded-3xl"
              style={{ background: "linear-gradient(135deg, rgba(255,60,172,0.15), rgba(43,134,197,0.1))", filter: "blur(20px)" }} />
            <img src={TEAM_IMAGE} alt="Наша команда" className="relative rounded-3xl w-full object-cover"
              style={{ border: "1px solid rgba(255,255,255,0.1)", aspectRatio: "4/3" }} />
            <div className="absolute -bottom-6 -right-6 px-6 py-4 rounded-2xl card-glow"
              style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="font-display text-2xl font-bold gradient-text">5+ лет</div>
              <div className="text-xs text-white/50">на рынке</div>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <span className="text-sm font-semibold uppercase tracking-widest mb-4 block" style={{ color: "var(--brand-1)" }}>О нас</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Мы — команда,<br />которая <span className="gradient-text">думает</span> о вашем бизнесе
            </h2>
            <p className="text-white/60 leading-relaxed mb-6">
              APEX Group — агентство полного цикла, которое объединяет стратегию, маркетинг, разработку и аналитику. Мы не просто выполняем задачи — мы становимся партнёром, заинтересованным в вашем росте.
            </p>
            <p className="text-white/60 leading-relaxed mb-8">
              За 5 лет мы реализовали более 120 проектов в различных отраслях и помогли нашим клиентам увеличить выручку в среднем в 2.5 раза.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Прозрачность", "Измеримость", "Результат", "Партнёрство"].map(tag => (
                <span key={tag} className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ background: "rgba(255,60,172,0.1)", border: "1px solid rgba(255,60,172,0.25)", color: "var(--brand-1)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest mb-4 block" style={{ color: "var(--brand-3)" }}>Услуги</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Что мы делаем</h2>
            <p className="text-white/50 max-w-xl mx-auto">Полный спектр услуг для роста вашего бизнеса — от идеи до измеримого результата</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <AnimatedSection key={i} className="group">
                <div
                  className="h-full p-8 rounded-2xl transition-all duration-300 group-hover:-translate-y-1 cursor-default"
                  style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.07)" }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(255,60,172,0.3)";
                    el.style.boxShadow = "0 0 40px rgba(255,60,172,0.1)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(255,255,255,0.07)";
                    el.style.boxShadow = "";
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-5`}>
                    <Icon name={s.icon} size={22} className="text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3">{s.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="py-24 px-6 max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest mb-4 block" style={{ color: "var(--brand-4)" }}>Процесс</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Как мы работаем</h2>
          <p className="text-white/50 max-w-xl mx-auto">Прозрачный и проверенный процесс, в котором вы видите каждый шаг</p>
        </AnimatedSection>
        <div className="relative">
          <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5"
            style={{ background: "linear-gradient(90deg, transparent, var(--brand-1), var(--brand-2), var(--brand-3), transparent)", margin: "0 10%" }} />
          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <AnimatedSection key={i}>
                <div className="text-center p-6 rounded-2xl transition-all duration-300"
                  style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-display text-xl font-bold"
                    style={{ background: "linear-gradient(135deg, var(--brand-1), var(--brand-3))", color: "#fff" }}>
                    {step.num}
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-3">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section id="results" className="py-24 px-6 relative overflow-hidden noise-overlay">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,60,172,0.08) 0%, rgba(43,134,197,0.08) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,60,172,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(43,134,197,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest mb-4 block" style={{ color: "var(--brand-1)" }}>Результаты</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Цифры, которые говорят</h2>
            <p className="text-white/50 max-w-xl mx-auto">Реальные результаты реальных проектов — не обещания, а факты</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {results.map((r, i) => (
              <AnimatedSection key={i}>
                <div className="text-center p-8 rounded-2xl card-glow"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                  <div className="font-display text-5xl font-bold gradient-text mb-2">{r.value}</div>
                  <div className="text-white/50 text-sm">{r.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection>
            <div className="p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: "Award", title: "Лидер рейтинга 2024", desc: "Топ-10 агентств по версии отраслевого портала" },
                  { icon: "ShieldCheck", title: "Гарантия результата", desc: "Работаем до достижения оговорённых KPI" },
                  { icon: "HeartHandshake", title: "Долгосрочные партнёрства", desc: "78% клиентов работают с нами больше 2 лет" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, var(--brand-1), var(--brand-3))" }}>
                      <Icon name={item.icon} size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">{item.title}</div>
                      <div className="text-white/50 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest mb-4 block" style={{ color: "var(--brand-3)" }}>FAQ</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Частые вопросы</h2>
          <p className="text-white/50">Ответы на то, что спрашивают чаще всего</p>
        </AnimatedSection>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <AnimatedSection key={i}>
              <div className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{ background: "#12122A", border: `1px solid ${activeFaq === i ? "rgba(255,60,172,0.35)" : "rgba(255,255,255,0.07)"}` }}>
                <button
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-semibold text-base">{faq.q}</span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeFaq === i ? "rotate-45" : ""}`}
                    style={{ background: activeFaq === i ? "var(--brand-1)" : "rgba(255,255,255,0.08)" }}>
                    <Icon name="Plus" size={16} className="text-white" />
                  </div>
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 text-white/60 text-sm leading-relaxed border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="pt-4">{faq.a}</div>
                  </div>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest mb-4 block" style={{ color: "var(--brand-1)" }}>Контакты</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Начнём работу вместе?</h2>
            <p className="text-white/50 max-w-xl mx-auto">Оставьте заявку, и мы свяжемся с вами в течение часа</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <AnimatedSection>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl text-white placeholder-white/30 outline-none transition-all"
                  style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = "var(--brand-1)"; }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
                <input
                  type="tel"
                  placeholder="Телефон"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl text-white placeholder-white/30 outline-none transition-all"
                  style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = "var(--brand-1)"; }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
                <textarea
                  placeholder="Расскажите о вашем проекте"
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl text-white placeholder-white/30 outline-none resize-none transition-all"
                  style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = "var(--brand-1)"; }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
                <button className="w-full btn-gradient text-white font-semibold py-4 rounded-xl text-base flex items-center justify-center gap-2">
                  Отправить заявку <Icon name="Send" size={18} />
                </button>
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div className="space-y-4">
                {[
                  { icon: "Phone", label: "Телефон", value: "+7 (999) 123-45-67" },
                  { icon: "Mail", label: "Email", value: "hello@apex-group.ru" },
                  { icon: "MapPin", label: "Адрес", value: "Москва, ул. Примерная, 1" },
                  { icon: "Clock", label: "Режим работы", value: "Пн–Пт: 9:00–19:00" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-xl"
                    style={{ background: "#12122A", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--brand-1), var(--brand-3))" }}>
                      <Icon name={item.icon} size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-0.5">{item.label}</div>
                      <div className="font-medium">{item.value}</div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 mt-2">
                  {[
                    { icon: "Send", label: "Telegram" },
                    { icon: "MessageCircle", label: "WhatsApp" },
                    { icon: "Instagram", label: "Instagram" },
                  ].map((s, i) => (
                    <button key={i}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <Icon name={s.icon} size={16} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-xl font-bold">
            <span className="gradient-text">APEX</span>
            <span className="text-white/40 ml-1">Group</span>
          </div>
          <div className="text-white/30 text-sm">© 2024 APEX Group. Все права защищены.</div>
          <div className="flex gap-6 flex-wrap justify-center">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="text-white/40 hover:text-white/70 text-sm transition-colors">{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}