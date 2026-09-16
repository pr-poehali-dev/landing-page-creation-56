const LOGOS = [
  "logo-remi.png",
  "logo-yandexgo.png",
  "logo-sambery.png",
  "logo-sts.png",
  "logo-dns.png",
  "logo-wildberries.png",
  "logo-vtb.png",
  "logo-tochka.png",
  "logo-tele2.png",
  "logo-tbank.png",
  "logo-sber.png",
  "logo-pyaterochka.png",
  "logo-gazprombank.png",
  "logo-ursa.jpg",
  "logo-izumrud.jpg",
];

export default function ClientsLogos() {
  return (
    <section className="fb-gray" id="clients">
      <div className="fb-wrap">
        <div className="fb-center" style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="fb-kicker">Нам доверяют</div>
          <h2>Нас выбирают</h2>
        </div>
        <div className="fb-logogrid">
          {LOGOS.map((file, i) => (
            <div className="fb-logoitem" key={i}>
              <img
                src={`/logos/${file}`}
                alt="Логотип клиента"
                loading="lazy"
                onError={e => {
                  (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}