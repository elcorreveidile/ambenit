import Image from "next/image";
import { site } from "@/lib/site-config";
import GaleriaPublica from "@/components/GaleriaPublica";

export default function Home() {
  const t = site.trueque;

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="wrap">
          <div className="brand">
            {site.marca}
            <small>{site.tagline}</small>
          </div>
          <div className="navlinks">
            <a href="#fotografo">El fotógrafo</a>
            <a href="#galeria">Galería</a>
            <a href="#marco">Marco</a>
            <a href="#cuenta">La cuenta</a>
            <a href="#contacto">Contacto</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap">
          <span className="kicker">◍ recitales · directos · luz de noche</span>
          <h1>
            La noche <em>bien contada</em>,<br />disparo a disparo.
          </h1>
          <p className="lead">
            Soy <b>{site.fotografo.nombre}</b> —{" "}
            <span className="hand">{site.marca}</span> — y fotografío recitales
            cuando cae la luz. Selecciono, revelo y te entrego solo lo que merece
            quedarse. Si era de noche y me pilló con la cámara, salió bien.
          </p>
          <div className="cta">
            <a href="#cuenta" className="btn btn-gold">
              Ver la cuenta →
            </a>
            <a href="#galeria" className="btn btn-ghost">
              La galería
            </a>
          </div>
          <div className="stats">
            {site.stats.map((s) => (
              <div className="stat" key={s.etiqueta}>
                <b>{s.valor}</b>
                <span>{s.etiqueta}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* EL FOTÓGRAFO */}
      <section id="fotografo">
        <div className="wrap">
          <div className="eyebrow">El fotógrafo</div>
          <h2>
            Antonio, <em>el del ojo para la noche</em>
          </h2>
          <p className="sub">
            {site.fotografo.edad} años y ya dispara recitales como quien respira.
            Si la escena estaba oscura, él la vio antes que nadie.
          </p>

          <div className="who">
            <div className="portrait">
              <Image
                src={site.fotografo.retrato}
                alt={`${site.fotografo.nombre}, el fotógrafo`}
                fill
                sizes="300px"
                style={{ objectFit: "cover" }}
                priority
              />
              <span className="badge">{site.marca} · fotógrafo</span>
            </div>
            <div className="bio">
              <p>
                Se mueve en la penumbra de los recitales: aprende a leer la luz
                escasa de los directos y espera el gesto que merece quedarse.{" "}
                <b>277 disparos</b>, cero pereza.
              </p>
              <p>
                Selecciona a mano, revela él mismo y solo entrega lo que aguanta
                una segunda mirada. Trabaja de noche porque es cuando la cosa se
                pone <b>interesante</b>.
              </p>
              <div className="tags">
                <span>Recitales</span>
                <span>Directos</span>
                <span>Luz natural nocturna</span>
                <span>Retrato</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LA SESIÓN */}
      <section id="sesion">
        <div className="wrap">
          <div className="eyebrow">La sesión destacada</div>
          <h2>
            {site.sesion.titulo} <em>{site.sesion.subtitulo}</em>
          </h2>
          <p className="sub">
            De noche, que es cuando la cosa se pone interesante. 277 disparos,
            revisados uno a uno hasta dejar los 138 buenos.
          </p>

          <div className="session">
            <div className="card">
              <dl>
                {site.sesion.ficha.map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
                <dt>Edición</dt>
                <dd>
                  Revelado y retoque incluidos{" "}
                  <span className="hand">(por mí, no por el tito)</span>
                </dd>
              </dl>
            </div>
            <div className="filmstrip" aria-hidden="true">
              {site.galeria.semilla.slice(0, 3).map((f, i) => (
                <div className="frame" key={f.src}>
                  <Image
                    src={f.src}
                    alt=""
                    fill
                    sizes="(max-width:820px) 50vw, 240px"
                    style={{ objectFit: "cover" }}
                  />
                  <span>{["focus · noche", "contraluz", "público"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LA GALERÍA */}
      <section id="galeria">
        <GaleriaPublica />
      </section>

      {/* LA CUENTA */}
      <section id="cuenta">
        <div className="wrap">
          <div className="eyebrow">La cuenta</div>
          <h2>
            El trueque: <em>tus fotos por mi web</em>
          </h2>
          <p className="sub">
            Tú me pasaste una factura que yo no había presupuestado (las fotos).
            Aquí va la mía, que tú tampoco esperabas (esta web). Las cruzamos y
            vemos cómo queda el saldo.
          </p>

          <div className="ledger">
            {/* Lo que paga el tito */}
            <div className="invoice">
              <div className="top">
                <b>{t.tito.titulo}</b>
                <span className="tag debe">{t.tito.etiqueta}</span>
              </div>
              <ul>
                {t.tito.lineas.map((l) => (
                  <li
                    className={"libre" in l && l.libre ? "free" : undefined}
                    key={l.concepto}
                  >
                    <span>
                      {l.concepto}
                      <small>{l.detalle}</small>
                    </span>
                    <span className="amt">{l.importe}</span>
                  </li>
                ))}
              </ul>
              <div className="mini-total">
                <span>Te debo por las fotos</span>
                <b style={{ color: "var(--mar)" }}>{t.tito.total}</b>
              </div>
            </div>

            {/* Lo que paga Antonio */}
            <div className="invoice">
              <div className="top">
                <b>{t.antonio.titulo}</b>
                <span className="tag cobra">{t.antonio.etiqueta}</span>
              </div>
              <ul>
                {t.antonio.lineas.map((l) => (
                  <li key={l.concepto}>
                    <span>
                      {l.concepto}
                      <small>{l.detalle}</small>
                    </span>
                    <span className="amt">{l.importe}</span>
                  </li>
                ))}
              </ul>
              <div className="mini-total">
                <span>Me debes por la web</span>
                <b style={{ color: "var(--gold-soft)" }}>{t.antonio.total}</b>
              </div>
            </div>
          </div>

          <div className="balance">
            <div className="rows">
              <div>
                <span>Yo te pago (las fotos)</span>
                <b>{t.balance.pagaTito}</b>
              </div>
              <div>
                <span>Tú me pagas (la web)</span>
                <b>{t.balance.pagaAntonio}</b>
              </div>
              <div>
                <span>Saldo del trueque, a favor del tito</span>
                <b>{t.balance.saldo}</b>
              </div>
            </div>
            <div className="final">
              <small>Me debes</small>
              <b>{t.balance.saldo}</b>
              <em>{t.balance.guino}</em>
            </div>
          </div>

          <p className="fineprint">
            <b>Letra pequeña:</b> trueque válido entre tito y sobrino. Si
            prefieres, cambiamos <b>las 138 fotos por esta web</b> y nadie paga
            nada (opción recomendada). El saldo incluye un{" "}
            <b>recargo simbólico por no presupuestar</b> —el mismo detalle que
            tuviste tú— y <b>0 € de rencor</b>. Reclamaciones, en el próximo
            asado. Moraleja de los dos: la próxima vez, se avisa el precio antes. 📸
          </p>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto">
        <div className="wrap">
          <div className="eyebrow">Contacto</div>
          <h2>
            ¿Cerramos el <em>pack</em>?
          </h2>
          <p className="sub">
            Dime que te interesa y hablamos. Del pago ya… en cuanto tú me digas.
          </p>

          <div className="contact">
            <div className="card">
              <h3>{site.fotografo.nombre}</h3>
              <a className="line" href="#">
                <b>◍</b> Fotógrafo de recitales y directos
              </a>
              <a className="line" href="#">
                <b>◎</b> {site.contacto.instagram}
              </a>
            </div>
            <div className="card">
              <h3>Cómo funciona el trueque</h3>
              <a className="line" href="#galeria">
                <b>1</b> Miras la selección aquí
              </a>
              <a className="line" href="#cuenta">
                <b>2</b> Cruzamos las dos facturas
              </a>
              <a className="line" href="#">
                <b>3</b> Fotos por web, saldo a la vista
              </a>
              <a className="line" href="#">
                <b>4</b> Quedamos en paz (o me debes {t.balance.saldo})
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="brand">{site.marca}</div>
          <div>Fotografía nocturna · {site.fotografo.nombre}</div>
          <p className="wink">
            Web preparada con mucho cariño (y algo de guasa) por el tito, a cambio
            de 138 fotos que nadie había presupuestado. Si has llegado hasta aquí
            leyendo la letra pequeña, ya sabes de dónde te viene el ojo para el
            detalle. 📸
          </p>
        </div>
      </footer>
    </>
  );
}
