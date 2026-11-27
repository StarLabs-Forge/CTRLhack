import type { CSSProperties, ReactElement } from "react";
import type { ServiceArtId } from "../../data/serviceDetails";

// Ilustraciones de las características de /servicios/*: una escena por cada una,
// dibujada en SVG con el lenguaje de la marca (cobre sobre superficies oscuras).
// Todas comparten viewBox 200×120 y un vocabulario de clases que define
// ServiceDetail.css:
//   s = trazo de acento · d = trazo tenue · f = superficie · h = relleno cobre
//   draw = el trazo se dibuja al entrar · pop = aparece con un pequeño salto
//   float / pulse / flow = bucles ambientales (solo con el bloque en pantalla)
// `--d` es el retraso (ms) de cada pieza, para que la escena se arme en orden.
const dl = (n: number) => ({ "--d": n }) as CSSProperties;

const SCENES: Record<ServiceArtId, ReactElement> = {
  // ---------------------------------------------------------------- WEB
  "web-corporate": (
    <>
      <rect className="f draw" pathLength={1} x="20" y="12" width="160" height="96" rx="7" />
      <path className="d draw" pathLength={1} d="M20 30H180" style={dl(150)} />
      <circle className="h" cx="32" cy="21" r="2.4" />
      <circle className="d" cx="41" cy="21" r="2.4" />
      <circle className="d" cx="50" cy="21" r="2.4" />
      <rect className="h pop" x="32" y="40" width="68" height="34" rx="4" style={dl(250)} />
      <path className="s draw" pathLength={1} d="M110 46H166M110 57H152M110 68H160" style={dl(350)} />
      <rect className="d pop" x="32" y="82" width="40" height="18" rx="3" style={dl(450)} />
      <rect className="d pop" x="80" y="82" width="40" height="18" rx="3" style={dl(520)} />
      <rect className="d pop" x="128" y="82" width="40" height="18" rx="3" style={dl(590)} />
      <g className="float">
        <circle className="f" cx="178" cy="104" r="11" />
        <path className="s" d="M172.5 104.5l4 4 7-8" />
      </g>
    </>
  ),
  "web-landing": (
    <>
      <circle className="h" cx="36" cy="19" r="3.5" />
      <path className="d" d="M112 19H124M132 19H144M152 19H166" />
      <path className="d draw" pathLength={1} d="M30 28H170" style={dl(100)} />
      <rect className="h pop" x="50" y="40" width="100" height="8" rx="4" style={dl(200)} />
      <rect className="f pop" x="66" y="54" width="68" height="8" rx="4" style={dl(300)} />
      <path className="d draw" pathLength={1} d="M78 72H122" style={dl(400)} />
      <rect className="h pulse" x="72" y="82" width="56" height="18" rx="9" style={dl(500)} />
      <path className="s" d="M88 91H112" />
      <g className="float">
        <path className="c" d="M118 94v16l4-4 3 8 4-2-3-8h6z" />
      </g>
      <path className="s draw" pathLength={1} d="M146 106L158 92 166 98 184 72" style={dl(600)} />
      <path className="s draw" pathLength={1} d="M175 72H184V81" style={dl(900)} />
    </>
  ),
  "web-platform": (
    <>
      <rect className="f draw" pathLength={1} x="16" y="14" width="34" height="92" rx="5" />
      <path className="d draw" pathLength={1} d="M24 30H42M24 42H42M24 54H36" style={dl(150)} />
      <rect className="d pop" x="58" y="14" width="36" height="24" rx="4" style={dl(200)} />
      <rect className="d pop" x="98" y="14" width="36" height="24" rx="4" style={dl(260)} />
      <rect className="h pop" x="138" y="14" width="36" height="24" rx="4" style={dl(320)} />
      <path className="s" d="M64 30V26M70 30V22M76 30V28M82 30V20" />
      <rect className="d pop" x="58" y="46" width="116" height="60" rx="5" style={dl(400)} />
      <path className="s draw" pathLength={1} d="M66 94L82 82 98 88 118 64 138 72 166 54" style={dl(500)} />
      <g className="float">
        <circle className="f" cx="180" cy="22" r="11" />
        <rect className="s" x="175" y="22" width="10" height="8" rx="2" />
        <path className="s" d="M177 22v-3a3 3 0 0 1 6 0v3" />
      </g>
    </>
  ),
  "web-interfaces": (
    <>
      <circle className="d dash spin" cx="100" cy="62" r="54" />
      <rect className="f draw" pathLength={1} x="18" y="22" width="112" height="70" rx="5" />
      <path className="d" d="M10 99H138" />
      <rect className="h pop" x="26" y="30" width="54" height="24" rx="3" style={dl(250)} />
      <rect className="d pop" x="86" y="30" width="36" height="24" rx="3" style={dl(320)} />
      <rect className="d pop" x="26" y="60" width="96" height="26" rx="3" style={dl(390)} />
      <g className="float">
        <rect className="f" x="126" y="38" width="42" height="72" rx="8" />
        <rect className="h" x="132" y="50" width="30" height="14" rx="3" />
        <path className="d" d="M132 72H162M132 80H154M132 88H158" />
      </g>
    </>
  ),

  // --------------------------------------------------------------- APPS
  "apps-mobile": (
    <>
      {/* el giro lleva su propio centro: se anula el origen CSS global de .sa */}
      <rect
        className="d solid"
        x="62"
        y="16"
        width="52"
        height="92"
        rx="9"
        transform="rotate(-9 88 62)"
        style={{ transformBox: "view-box", transformOrigin: "0 0" }}
      />
      <rect className="f draw" pathLength={1} x="92" y="10" width="58" height="100" rx="10" />
      <path className="d" d="M109 18H133" />
      <rect className="h pop" x="100" y="28" width="20" height="20" rx="5" style={dl(250)} />
      <rect className="d pop" x="124" y="28" width="20" height="20" rx="5" style={dl(320)} />
      <rect className="d pop" x="100" y="54" width="20" height="20" rx="5" style={dl(390)} />
      <rect className="d pop" x="124" y="54" width="20" height="20" rx="5" style={dl(460)} />
      <rect className="f pop" x="100" y="82" width="44" height="10" rx="5" style={dl(530)} />
      <g className="pulse">
        <circle className="h" cx="148" cy="18" r="6.5" />
      </g>
    </>
  ),
  "apps-product": (
    <>
      <circle className="s dash spin" cx="44" cy="50" r="22" />
      <path className="s" d="M38 52Q44 42 50 52M38 74H50M40 80H48" />
      <path className="s draw" pathLength={1} d="M76 58H116" style={dl(300)} />
      <path className="s draw" pathLength={1} d="M110 52L116 58 110 64" style={dl(700)} />
      <circle className="h float" cx="92" cy="40" r="2.6" />
      <circle className="h float f2" cx="100" cy="76" r="2" />
      <rect className="f draw" pathLength={1} x="128" y="22" width="52" height="72" rx="7" style={dl(500)} />
      <rect className="h pop" x="136" y="32" width="36" height="18" rx="3" style={dl(800)} />
      <path className="d draw" pathLength={1} d="M136 62H172M136 72H162M136 82H168" style={dl(900)} />
    </>
  ),
  "apps-connected": (
    <>
      <path className="d flow" d="M41 30L84 52M159 30L116 52M41 90L84 70M159 90L116 70" />
      <rect className="f draw" pathLength={1} x="82" y="32" width="36" height="56" rx="7" />
      <rect className="h pulse" x="89" y="42" width="22" height="14" rx="3" />
      <path className="d" d="M89 64H111M89 72H105" />
      <g className="pop" style={dl(250)}>
        <circle className="f" cx="30" cy="24" r="12" />
        <path className="s" d="M26 26a4 4 0 0 1 8 0v2l2 3H24l2-3z" />
      </g>
      <g className="pop" style={dl(350)}>
        <circle className="f" cx="170" cy="24" r="12" />
        <rect className="s" x="163" y="19" width="14" height="10" rx="2" />
        <path className="s" d="M163 23H177" />
      </g>
      <g className="pop" style={dl(450)}>
        <circle className="f" cx="30" cy="96" r="12" />
        <path className="s" d="M23 101L28 95 32 98 37 90" />
      </g>
      <g className="pop" style={dl(550)}>
        <circle className="f" cx="170" cy="96" r="12" />
        <path className="s" d="M164 96H176M170 90V102" />
      </g>
    </>
  ),
  "apps-mvp": (
    <>
      <rect className="d dash" x="16" y="66" width="44" height="40" rx="5" />
      <rect className="f draw" pathLength={1} x="78" y="46" width="44" height="60" rx="5" style={dl(250)} />
      <rect className="h draw" pathLength={1} x="140" y="26" width="44" height="80" rx="5" style={dl(500)} />
      <path className="s draw" pathLength={1} d="M60 84H72M122 76H134" style={dl(700)} />
      <path className="d" d="M24 78H52M24 88H44M86 58H114M86 68H106M148 38H176M148 48H168" />
      <g className="float">
        <path className="s" d="M162 26V8" />
        <path className="h" d="M162 8L180 13 162 19z" />
      </g>
    </>
  ),

  // ------------------------------------------------------------ SISTEMAS
  "sistemas-management": (
    <>
      <rect className="d pop" x="12" y="20" width="14" height="14" rx="3" style={dl(100)} />
      <rect className="d pop" x="30" y="56" width="14" height="14" rx="3" style={dl(180)} />
      <rect className="d pop" x="12" y="90" width="14" height="14" rx="3" style={dl(260)} />
      <path className="s flow" d="M28 28C56 28 62 52 80 58M46 64H80M28 98C56 98 62 72 80 66" />
      <rect className="f draw" pathLength={1} x="82" y="18" width="104" height="84" rx="6" style={dl(300)} />
      <rect className="h" x="82" y="18" width="104" height="18" rx="6" />
      <path className="d draw" pathLength={1} d="M92 52H176M92 66H176M92 80H176M126 36V102" style={dl(600)} />
      <path className="s" d="M92 27H116" />
    </>
  ),
  "sistemas-automation": (
    <>
      <circle className="gear spin" cx="64" cy="60" r="26" />
      <circle className="f" cx="64" cy="60" r="22" />
      <circle className="d" cx="64" cy="60" r="9" />
      <path className="s draw" pathLength={1} d="M64 51V60L70 64" style={dl(400)} />
      <g className="pop" style={dl(300)}>
        <circle className="h" cx="126" cy="34" r="6" />
        <path className="s" d="M123 34l2 2 4-4" />
      </g>
      <g className="pop" style={dl(450)}>
        <circle className="h" cx="126" cy="60" r="6" />
        <path className="s" d="M123 60l2 2 4-4" />
      </g>
      <g className="pop" style={dl(600)}>
        <circle className="d" cx="126" cy="86" r="6" />
      </g>
      <path className="d" d="M138 34H178M138 60H172M138 86H176" />
      <path className="s draw" pathLength={1} d="M92 60H114" style={dl(250)} />
    </>
  ),
  "sistemas-tools": (
    <>
      <rect className="f draw" pathLength={1} x="14" y="14" width="92" height="92" rx="6" />
      <path className="d" d="M24 36H60M24 60H56M24 84H64" />
      <g className="pop" style={dl(250)}>
        <rect className="h" x="74" y="30" width="26" height="12" rx="6" />
        <circle className="c" cx="94" cy="36" r="4" />
      </g>
      <g className="pop" style={dl(350)}>
        <rect className="d solid" x="74" y="54" width="26" height="12" rx="6" />
        <circle className="d" cx="80" cy="60" r="4" />
      </g>
      <g className="pop" style={dl(450)}>
        <rect className="h" x="74" y="78" width="26" height="12" rx="6" />
        <circle className="c" cx="94" cy="84" r="4" />
      </g>
      <rect className="d pop" x="118" y="14" width="68" height="24" rx="4" style={dl(300)} />
      <rect className="f pop float" x="118" y="46" width="68" height="24" rx="4" style={dl(400)} />
      <rect className="d pop" x="118" y="78" width="68" height="24" rx="4" style={dl(500)} />
      <path className="s" d="M126 58H160" />
    </>
  ),
  "sistemas-integration": (
    <>
      <rect className="f draw" pathLength={1} x="12" y="34" width="46" height="52" rx="6" />
      <path className="d" d="M20 48H50M20 60H44M20 72H50" />
      <rect className="f draw" pathLength={1} x="142" y="34" width="46" height="52" rx="6" />
      <path className="d" d="M150 48H180M150 60H174M150 72H180" />
      <path className="s flow" d="M58 60H80M120 60H142" />
      <polygon className="h pulse" points="100,32 122,46 122,74 100,88 78,74 78,46" />
      <path className="s" d="M92 60H108M100 52V68" />
    </>
  ),
};

export function ServiceArt({ id }: { id: ServiceArtId }) {
  return (
    <svg className="sa" viewBox="0 0 200 120" aria-hidden="true" focusable="false">
      {SCENES[id]}
    </svg>
  );
}
