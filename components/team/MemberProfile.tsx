import { useState, type ReactNode } from "react";
import type { Specialty, TeamMember } from "../../data/team";
import { Reveal } from "../ui/Reveal";
import { MemberPhoto } from "./MemberPhoto";
import { StatCounter } from "./StatCounter";
import { CredentialGallery } from "./CredentialGallery";

// Perfil de un integrante. Orden de aparición con el scroll:
// foto → nombre y especialización → indicadores → especialidades → certificados.
// Reutilizable: todo sale de `member` (data/team.ts).

const SPECIALTY_ICONS: Record<Specialty["id"], ReactNode> = {
  fullstack: (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="26" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 11h26" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 16l-3 3 3 3M20 16l3 3-3 3M17.5 15l-3 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  security: (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 3l11 4v8c0 7-4.7 12-11 14C9.7 27 5 22 5 15V7l11-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="11.5" y="14" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 14v-2a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 4l2.6 7.4L26 14l-7.4 2.6L16 24l-2.6-7.4L6 14l7.4-2.6L16 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M25 22l1 2.6 2.6 1-2.6 1L25 29l-1-2.4-2.6-1 2.6-1L25 22z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
};

function SpecialtyRow({ specialty }: { specialty: Specialty }) {
  return (
    <li className="member-spec">
      <span className="member-spec-icon">{SPECIALTY_ICONS[specialty.id]}</span>
      <span>
        <strong>{specialty.title}</strong>
        <span className="member-spec-desc">{specialty.description}</span>
      </span>
    </li>
  );
}

export function MemberProfile({ member }: { member: TeamMember }) {
  // la biografía completa va colapsada: se ve el primer párrafo y "Leer más" despliega el resto
  const [more, setMore] = useState(false);
  return (
    <article className="member member-panel" aria-labelledby={`member-${member.id}`}>
      <div className="member-top">
        <Reveal variant="scale" className="member-photo-col">
          <MemberPhoto member={member} />
        </Reveal>

        <div className="member-info">
          <Reveal delay={120}>
            <span className="member-kicker">Equipo CtrlHack</span>
            <h3 className="member-name" id={`member-${member.id}`}>
              {member.name}
            </h3>
            <p className="member-role">{member.role}</p>
          </Reveal>
          <Reveal delay={220}>
            <blockquote className="member-quote">
              <p>{member.quote}</p>
            </blockquote>
            <div className="member-bio">
              {(more ? member.bio : member.bio.slice(0, 1)).map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              {member.bio.length > 1 && (
                <button type="button" className="member-more" aria-expanded={more} onClick={() => setMore((v) => !v)}>
                  {more ? "Leer menos" : "Leer más"}
                </button>
              )}
            </div>
            <ul className="member-specs" aria-label="Especialidades">
              {member.specialties.map((s) => (
                <SpecialtyRow specialty={s} key={s.id} />
              ))}
            </ul>
            <p className="member-skills-line">También: {member.skills.join(" · ")}</p>
          </Reveal>
          <Reveal delay={320}>
            <div className="member-stats">
              {member.stats.map((s, i) => (
                <StatCounter stat={s} index={i} key={s.label} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal className="member-block">
        <CredentialGallery member={member} />
      </Reveal>
    </article>
  );
}
