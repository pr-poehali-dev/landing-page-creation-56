const ROW_ONE = [
  { file: "logo-remi.png", name: "Реми" },
  { file: "logo-yandexgo.png", name: "Яндекс Go" },
  { file: "logo-sambery.png", name: "Самбери" },
  { file: "logo-sts.png", name: "СТС" },
  { file: "logo-dns.png", name: "DNS" },
  { file: "logo-wildberries.png", name: "Wildberries" },
  { file: "logo-vtb.png", name: "ВТБ" },
  { file: "logo-izumrud.jpg", name: "ТЦ Изумруд Плаза" },
];

const ROW_TWO = [
  { file: "logo-sber.png", name: "Сбер" },
  { file: "logo-tbank.png", name: "Т-Банк" },
  { file: "logo-tochka.png", name: "Точка Банк" },
  { file: "logo-gazprombank.png", name: "Газпромбанк" },
  { file: "logo-tele2.png", name: "Tele2" },
  { file: "logo-pyaterochka.png", name: "Пятёрочка" },
  { file: "logo-ursa.jpg", name: "УРСА" },
];

interface Logo {
  file: string;
  name: string;
}

function LogoRow({ items, reverse }: { items: Logo[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="fb-logomarquee">
      <div className={`fb-logotrack${reverse ? " fb-logotrack-rev" : ""}`}>
        {doubled.map((logo, i) => (
          <div className="fb-logoitem" key={`${logo.file}-${i}`}>
            <img src={`/logos/${logo.file}`} alt={logo.name} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientsLogos() {
  return (
    <section className="fb-gray" id="clients">
      <div className="fb-wrap">
        <div className="fb-center" style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="fb-kicker">Нам доверяют</div>
          <h2>Нас выбирают</h2>
        </div>
      </div>
      <LogoRow items={ROW_ONE} />
      <LogoRow items={ROW_TWO} reverse />
    </section>
  );
}
