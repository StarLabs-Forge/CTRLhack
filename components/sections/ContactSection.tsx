import { ContactForm } from "./ContactForm";
import { Eyebrow } from "../ui/Eyebrow";
import { Reveal } from "../ui/Reveal";
import { socials } from "../../data/socials";
import "./ContactSection.css";

// Última sección del recorrido de Home (06 / CONTACTO). Reemplaza a la antigua
// página /contacto y a la CTABand final: el formulario, el correo directo y las
// redes viven aquí, a un scroll de cualquier punto de la Home. En móvil se
// apila: titular → formulario → canales y redes.
export function ContactSection() {
  return (
    <section id="contacto" className="contact-section section-deco gridlines section-snap section-dense">
      <div className="section-index">06</div>
      <div className="wrap contact-grid">
        <Reveal className="contact-head" index={0}>
          <span className="idx">06 / CONTACTO</span>
          <Eyebrow>Hablemos</Eyebrow>
          <h2>Cuéntanos tu idea.</h2>
          <p className="lead">No necesitas tenerlo todo claro. Empecemos por lo que tienes.</p>
        </Reveal>

        <Reveal className="contact-card" index={1} variant="scale">
          <ContactForm />
        </Reveal>

        <Reveal className="contact-aside" index={2}>
          <div className="contact-channels">
            <span className="contact-label">¿Prefieres hablar directamente?</span>
            <a href="mailto:hola@vexora.io" className="contact-email">
              hola@vexora.io
            </a>
            <span className="contact-location">La Paz, Bolivia</span>
          </div>

          <div className="contact-socials">
            <span className="contact-label">Síguenos</span>
            <ul>
              {socials.map((social) => (
                <li key={social.id}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.name} — ${social.handle}`}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d={social.icon} />
                    </svg>
                    <span className="contact-social-text">
                      <strong>{social.name}</strong>
                      <span>{social.handle}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
