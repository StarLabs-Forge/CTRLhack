import "./Identity.css";

// Sobre CtrlHack (Home): titular grande a la izquierda (qué hacemos y para
// quién) y, a la derecha, misión y visión con foco en Bolivia.
// El paso a paso de cómo trabajamos vive en <Process /> (sección "Proceso").
const PILLARS = [
  {
    kicker: "Misión",
    text: "Impulsar a emprendedores y empresas de Bolivia con tecnología hecha a su medida, para que crezcan y compitan en el mundo digital.",
  },
  {
    kicker: "Visión",
    text: "Liderar la tecnología en Bolivia y guiar al país hacia un futuro digital mejor.",
  },
];

export function Identity() {
  return (
    <div className="about">
      <div className="about-main">
        <h2 className="about-title">
          Construimos tecnologías digitales que impulsan{" "}
          <span className="about-title-accent">crecimiento de tu emprendimiento o empresa</span>
        </h2>
        <p className="about-text">
          En <strong>CtrlHack</strong> no solo diseñamos webs; creamos ecosistemas digitales que transforman tu forma de
          verte en el mundo digital.
        </p>
      </div>

      <div className="about-pillars">
        {PILLARS.map((pillar) => (
          <div className="about-pillar" key={pillar.kicker}>
            <span className="about-pillar-kicker">{pillar.kicker}</span>
            <p>{pillar.text}</p>
          </div>
        ))}
        <span className="about-origin">Hecho en Bolivia</span>
      </div>
    </div>
  );
}
