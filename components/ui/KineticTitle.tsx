import { Fragment, type CSSProperties } from "react";

// Titular "cinético": cada palabra sube desde una máscara con un giro corto,
// escalonada, en vez de un simple fade del bloque. El disparo lo da el
// <Reveal> padre (.reveal.in) — sin JS o con reduced-motion el texto es normal
// y visible. `lines` reemplaza a los <br />: cada línea es un bloque.
// ⚠️ Cada palabra es un span propio: el lector de pantalla lee el mismo texto,
// pero no uses esto en párrafos largos (solo titulares de sección).
export function KineticTitle({ lines }: { lines: string[] }) {
  let i = 0;
  return (
    <>
      {lines.map((line, li) => (
        <span className="kt-line" key={li}>
          {line.split(" ").map((word) => {
            const idx = i++;
            return (
              <Fragment key={idx}>
                <span className="kt-word">
                  <span className="kt-inner" style={{ "--kt-i": idx } as CSSProperties}>
                    {word}
                  </span>
                </span>{" "}
              </Fragment>
            );
          })}
        </span>
      ))}
    </>
  );
}
