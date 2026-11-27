import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { CATEGORY_LABELS, formatCredentialDate, type Credential, type CredentialCategory, type TeamMember } from "../../data/team";
import { CredentialViewer } from "./CredentialViewer";
import "../portfolio/ProjectFilters.css";

// "Conocimiento respaldado": logos de las organizaciones, filtros por
// especialidad y un carrusel con las imágenes originales de los certificados
// (deslizable con el dedo; flechas en escritorio). Primero las destacadas; el
// botón "Ver todas las credenciales" suma el resto. Al elegir uno se abre el
// visor ampliado con sus datos y el enlace de verificación.
type Filter = "todas" | CredentialCategory;
const FILTERS: Filter[] = ["todas", "ciberseguridad", "ia", "desarrollo"];

function CredentialCard({ credential, index, onOpen }: { credential: Credential; index: number; onOpen: () => void }) {
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const s = e.currentTarget.style;
    s.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    s.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    s.setProperty("--rx", `${((0.5 - y) * 6).toFixed(2)}deg`);
    s.setProperty("--ry", `${((x - 0.5) * 8).toFixed(2)}deg`);
  };
  const onLeave = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };
  return (
    <li className="cred-slot" style={{ "--i": Math.min(index, 6) } as CSSProperties}>
      <button type="button" className="cred-card" onClick={onOpen} onPointerMove={onMove} onPointerLeave={onLeave} aria-label={`Ver certificado: ${credential.title}, ${credential.issuer}`}>
        <span className="cred-shot">
          <img
            src={credential.image.thumb}
            width={520}
            height={Math.round((credential.image.height * 520) / credential.image.width)}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <span className="cred-shine" aria-hidden="true" />
        </span>
        <span className="cred-body">
          <span className="cred-cat">{CATEGORY_LABELS[credential.category]}</span>
          <span className="cred-title">{credential.title}</span>
          <span className="cred-meta">
            <span>{credential.issuer}</span>
            <span className="cred-dot" aria-hidden="true">·</span>
            <time dateTime={credential.date}>{formatCredentialDate(credential.date)}</time>
          </span>
        </span>
      </button>
    </li>
  );
}

export function CredentialGallery({ member }: { member: TeamMember }) {
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState<Filter>("todas");
  const [open, setOpen] = useState<number | null>(null);
  const track = useRef<HTMLUListElement>(null);

  const pool = useMemo(() => member.credentials.filter((c) => showAll || c.featured), [member.credentials, showAll]);
  const list = useMemo(() => pool.filter((c) => filter === "todas" || c.category === filter), [pool, filter]);
  const counts = useMemo(() => {
    const out: Record<Filter, number> = { todas: pool.length, ciberseguridad: 0, ia: 0, desarrollo: 0 };
    pool.forEach((c) => out[c.category]++);
    return out;
  }, [pool]);
  const hidden = member.credentials.length - member.credentials.filter((c) => c.featured).length;

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".cred-slot");
    const step = card ? card.offsetWidth + 18 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * (el.clientWidth > 900 ? 2 : 1), behavior: prefersSmooth() ? "smooth" : "auto" });
  };

  const changeFilter = (f: Filter) => {
    setFilter(f);
    track.current?.scrollTo({ left: 0 });
  };

  // filtros como grupo de selección única, navegable con flechas (igual que el portafolio)
  const onFiltersKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const cur = FILTERS.indexOf(filter);
    let next = cur;
    if (e.key === "ArrowRight") next = (cur + 1) % FILTERS.length;
    if (e.key === "ArrowLeft") next = (cur - 1 + FILTERS.length) % FILTERS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = FILTERS.length - 1;
    changeFilter(FILTERS[next]);
    e.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return (
    <div className="creds">
      <div className="creds-head">
        <div>
          <span className="member-block-label">Conocimiento respaldado</span>
          <p className="creds-sub">
            {member.credentials.length} credenciales. Toca una para verla.
          </p>
        </div>
        <ul className="creds-orgs" aria-label="Organizaciones formativas">
          {member.orgs.map((o) => (
            <li key={o.id}>
              <img src={o.logo} alt={o.name} loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
      </div>

      <div className="creds-toolbar">
        <div className="pfilters pfilters--start" role="radiogroup" aria-label="Filtrar credenciales por especialidad" onKeyDown={onFiltersKey}>
          {FILTERS.map((f) => {
            const selected = f === filter;
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                className={`pfilter${selected ? " is-selected" : ""}`}
                onClick={() => changeFilter(f)}
              >
                <span className="pfilter-label">{f === "todas" ? "Todas" : CATEGORY_LABELS[f]}</span>
                <span className="pfilter-count" aria-hidden="true">
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>
        <div className="creds-arrows">
          <button type="button" className="creds-arrow" onClick={() => scrollBy(-1)} aria-label="Certificados anteriores">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="creds-arrow" onClick={() => scrollBy(1)} aria-label="Certificados siguientes">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <p className="team-sr" role="status">
        {list.length} {list.length === 1 ? "credencial" : "credenciales"}
      </p>

      <ul className="creds-track" ref={track} key={`${showAll}-${filter}`}>
        {list.map((c, i) => (
          <CredentialCard credential={c} index={i} key={c.id} onOpen={() => setOpen(i)} />
        ))}
      </ul>

      <div className="creds-more">
        <button type="button" className="btn-ghost" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
          {showAll ? "Ver solo las destacadas" : `Ver todas las credenciales (+${hidden})`}
        </button>
      </div>

      {open !== null && list[open] && (
        <CredentialViewer list={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}

function prefersSmooth() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
