import { team } from "../../data/team";
import { Eyebrow } from "../ui/Eyebrow";
import { KineticTitle } from "../ui/KineticTitle";
import { Reveal } from "../ui/Reveal";
import { MemberProfile } from "./MemberProfile";
import "./TeamSection.css";

// "Nuestro equipo" (Home, justo después de Sobre). Un perfil por integrante
// de data/team.ts: para sumar a alguien basta con agregarlo ahí.
export function TeamSection() {
  return (
    <section id="equipo" className="team section-deco gridlines">
      <div className="wrap">
        <Reveal className="section-head team-head">
          <span className="idx">SOBRE / EQUIPO</span>
          <Eyebrow>Quiénes lo hacen posible</Eyebrow>
          <h2 className="kinetic">
            <KineticTitle lines={["Nuestro equipo"]} />
          </h2>
          <p className="team-sub">Las personas detrás de las ideas, el código y la innovación.</p>
        </Reveal>
        <div className="team-members">
          {team.map((m) => (
            <MemberProfile member={m} key={m.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
