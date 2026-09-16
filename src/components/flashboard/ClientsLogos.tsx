const LOGOS = [
  "logo-1.jpg",
  "logo-2.png",
  "logo-3.png",
  "logo-4.png",
  "logo-5.png",
  "logo-6.png",
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