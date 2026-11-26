import { useId } from "react";
import "./Logo.css";

// Isotipo oficial CTRLHACK — "03 · Cobre fiel" (CtrlHack_03_Cobre_Fiel.svg).
// GENERADO desde el SVG oficial: la geometría (paths, viewBox, proporción 2:1)
// no se modifica. Lo único que cambia respecto al archivo es que los <g> llevan
// clases (sl-chevron, sl-key, sl-ambient…) para poder animar el ensamblaje, y
// que los ids se prefijan por instancia (useId) para que varias copias en la
// misma página (navbar, loading, 404) no se pisen los gradientes ni los filtros.
//
// Uso: dimensionar siempre por UNA sola dimensión en CSS (height o width) y dejar
// la otra en auto — nunca fijar ancho y alto a la vez, que deforma la proporción.
interface LogoProps {
  className?: string;
  title?: string;
  // Reproduce la animación de ensamblaje al montar (chevrones + tecla + luz).
  assemble?: boolean;
}

export function Logo({ className = "", title = "CTRLHACK", assemble = false }: LogoProps) {
  const p = `ch${useId().replace(/:/g, "")}-`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1774 887"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
      className={`sl-logo${assemble ? " sl-logo--assemble" : ""} ${className}`.trim()}
    >
      <defs>
        <linearGradient id={`${p}metalTop`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6d605e" />
          <stop offset=".19" stopColor="#b9aaa2" />
          <stop offset=".36" stopColor="#fff5e8" />
          <stop offset=".52" stopColor="#e2d7d2" />
          <stop offset=".74" stopColor="#aca3a3" />
          <stop offset=".91" stopColor="#f8eeea" />
          <stop offset="1" stopColor="#7b7271" />
        </linearGradient>
        <linearGradient id={`${p}metalBottom`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#494344" />
          <stop offset=".24" stopColor="#706462" />
          <stop offset=".48" stopColor="#d7b8a6" />
          <stop offset=".66" stopColor="#92796f" />
          <stop offset=".85" stopColor="#584a46" />
          <stop offset="1" stopColor="#2c2524" />
        </linearGradient>
        <linearGradient id={`${p}metalRight`} x1="1" y1="0" x2="0" y2="1">
          <stop stopColor="#6c6264" />
          <stop offset=".28" stopColor="#aaa0a1" />
          <stop offset=".52" stopColor="#f9f1ed" />
          <stop offset=".72" stopColor="#d3cac7" />
          <stop offset="1" stopColor="#666064" />
        </linearGradient>
        <linearGradient id={`${p}metalRightLower`} x1="1" y1="0" x2="0" y2="1">
          <stop stopColor="#3c3638" />
          <stop offset=".27" stopColor="#726667" />
          <stop offset=".51" stopColor="#ceafa1" />
          <stop offset=".69" stopColor="#968078" />
          <stop offset="1" stopColor="#403332" />
        </linearGradient>
        <linearGradient id={`${p}copperEdge`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffebce" />
          <stop offset=".18" stopColor="#b96e37" />
          <stop offset=".36" stopColor="#ffab64" />
          <stop offset=".52" stopColor="#4d1b06" />
          <stop offset=".72" stopColor="#ffbe7e" />
          <stop offset=".89" stopColor="#a74e1a" />
          <stop offset="1" stopColor="#ff8528" />
        </linearGradient>
        <linearGradient id={`${p}copperSide`} x1="0" y1="0" x2=".8" y2="1">
          <stop stopColor="#55200b" />
          <stop offset=".18" stopColor="#b85e27" />
          <stop offset=".38" stopColor="#361306" />
          <stop offset=".69" stopColor="#170906" />
          <stop offset=".9" stopColor="#6e2608" />
          <stop offset="1" stopColor="#ffad48" />
        </linearGradient>
        <linearGradient id={`${p}keyFront`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#3d1609" />
          <stop offset=".32" stopColor="#1b0803" />
          <stop offset=".69" stopColor="#371003" />
          <stop offset="1" stopColor="#a5430b" />
        </linearGradient>
        <linearGradient id={`${p}keyRight`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffb044" />
          <stop offset=".12" stopColor="#a44a13" />
          <stop offset=".4" stopColor="#361408" />
          <stop offset=".68" stopColor="#1b0803" />
          <stop offset="1" stopColor="#b65a1a" />
        </linearGradient>
        <linearGradient id={`${p}keyLeft`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffcc87" />
          <stop offset=".32" stopColor="#d66a22" />
          <stop offset=".56" stopColor="#5f2008" />
          <stop offset="1" stopColor="#1e0d04" />
        </linearGradient>
        <radialGradient id={`${p}blackFace`} cx=".49" cy=".45" r=".8">
          <stop stopColor="#130e0c" />
          <stop offset=".5" stopColor="#1b1512" />
          <stop offset=".78" stopColor="#35251e" />
          <stop offset="1" stopColor="#6c3318" />
        </radialGradient>
        <linearGradient id={`${p}faceBevel`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#744226" />
          <stop offset=".32" stopColor="#2b170e" />
          <stop offset=".78" stopColor="#17100c" />
          <stop offset="1" stopColor="#6d3923" />
        </linearGradient>
        <linearGradient id={`${p}rim`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff8e4" />
          <stop offset=".25" stopColor="#fff0ba" />
          <stop offset=".43" stopColor="#ff9f28" />
          <stop offset=".64" stopColor="#ffe9b8" />
          <stop offset=".82" stopColor="#ff9d30" />
          <stop offset="1" stopColor="#fff2c2" />
        </linearGradient>
        <linearGradient id={`${p}letter`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fffcf7" />
          <stop offset=".36" stopColor="#f9eee5" />
          <stop offset=".7" stopColor="#e7d4c4" />
          <stop offset="1" stopColor="#d6b89d" />
        </linearGradient>
        <radialGradient id={`${p}flare`}>
          <stop stopColor="#fffdeb" />
          <stop offset=".18" stopColor="#ffda84" stopOpacity=".9" />
          <stop offset=".46" stopColor="#ff8a19" stopOpacity=".6" />
          <stop offset="1" stopColor="#ff6d10" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${p}ambient`}>
          <stop stopColor="#ef6415" stopOpacity=".35" />
          <stop offset=".65" stopColor="#aa3a08" stopOpacity=".28" />
          <stop offset="1" stopColor="#8b2904" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${p}brush`} patternUnits="userSpaceOnUse" width="7" height="9" patternTransform="rotate(42)">
          <path d="M0 1H7 M0 4H7 M0 7H7" stroke="#fff" strokeWidth=".28" opacity=".1" />
          <path d="M0 2H7 M0 6H7" stroke="#311e19" strokeWidth=".28" opacity=".12" />
        </pattern>
        <filter id={`${p}wideGlow`} x="-25%" y="-35%" width="150%" height="170%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        <filter id={`${p}smallGlow`} x="-20%" y="-30%" width="140%" height="160%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`${p}letterShadow`} x="-20%" y="-25%" width="145%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <path id={`${p}leftUpper`} d="M193 426 470 100 611 100 342 429Z" />
        <path id={`${p}leftLower`} d="M193 426 342 429 611 767 461 767Z" />
        <path id={`${p}rightUpper`} d="M1164 100 1303 100 1575 426 1431 429Z" />
        <path id={`${p}rightLower`} d="M1431 429 1575 426 1302 767 1151 767Z" />
        <path id={`${p}keyOutline`} d="M655 252Q669 238 699 238H1147Q1190 238 1181 278L1103 511Q1091 542 1056 542H594Q543 542 552 505Z" />
        <path id={`${p}C`} d="M860 320H790Q750 320 725 341Q698 364 684 410Q674 438 690 451Q702 462 729 462H807L813 430H746Q720 430 729 407Q737 385 753 364Q766 348 792 348H843Z" />
        <path id={`${p}t`} d="M895 333H927L917 360H944L934 385H907L889 426Q885 434 896 434H920L910 462H879Q845 462 852 433L872 385H846L857 360H883Z" />
        <path id={`${p}r`} d="M927 462 952 396Q967 360 1009 360H1038L1029 385H1008Q989 385 982 408L962 462Z" />
        <path id={`${p}l`} d="M1066 320H1103L1052 462H1016Z" />
      </defs>
      <g className="sl-ambient">
        <ellipse cx="881" cy="447" rx="500" ry="305" fill={`url(#${p}ambient)`} opacity=".45" />
        <path d="M202 427 466 99H613M194 430 464 778H611M1161 100H1300L1575 427 1303 779H1153" stroke="#e9742f" strokeWidth="9" fill="none" opacity=".18" filter={`url(#${p}wideGlow)`} />
      </g>
      <g className="sl-chevron sl-chevron--left">
        <path d="M190 426 468 97H614L615 130 368 432 615 767 612 782H458L189 448Z" fill={`url(#${p}copperSide)`} stroke="#ad5b2d" strokeWidth="2" />
        <use href={`#${p}leftUpper`} fill={`url(#${p}metalTop)`} />
        <use href={`#${p}leftLower`} fill={`url(#${p}metalBottom)`} />
        <use href={`#${p}leftUpper`} fill={`url(#${p}brush)`} />
        <use href={`#${p}leftLower`} fill={`url(#${p}brush)`} />
        <path d="M193 426 470 100H611L342 429 611 767H461L193 426Z" fill="none" stroke={`url(#${p}copperEdge)`} strokeWidth="4" strokeLinejoin="round" />
        <path d="M196 426 473 103H605 M197 428H341 M462 769H608" fill="none" stroke="#fff2e3" strokeWidth="2.5" opacity=".8" />
        <path d="M342 429 611 767" fill="none" stroke="#ffb476" strokeWidth="3" opacity=".85" />
        <ellipse cx="474" cy="263" rx="9" ry="91" transform="rotate(40 474 263)" fill={`url(#${p}flare)`} opacity=".65" />
        <ellipse cx="480" cy="603" rx="9" ry="80" transform="rotate(-40 480 603)" fill={`url(#${p}flare)`} opacity=".65" />
      </g>
      <g className="sl-chevron sl-chevron--right">
        <path d="M1160 97H1305L1579 426 1576 448 1307 782H1150L1148 767 1405 432 1160 130Z" fill={`url(#${p}copperSide)`} stroke="#ad5b2d" strokeWidth="2" />
        <use href={`#${p}rightUpper`} fill={`url(#${p}metalRight)`} />
        <use href={`#${p}rightLower`} fill={`url(#${p}metalRightLower)`} />
        <use href={`#${p}rightUpper`} fill={`url(#${p}brush)`} />
        <use href={`#${p}rightLower`} fill={`url(#${p}brush)`} />
        <path d="M1164 100H1303L1575 426 1302 767H1151L1431 429Z" stroke={`url(#${p}copperEdge)`} strokeWidth="4" strokeLinejoin="round" fill="none" />
        <path d="M1168 103H1300L1572 426 M1432 429H1573 M1156 767H1300" fill="none" stroke="#fff0e4" opacity=".85" strokeWidth="2.5" />
        <ellipse cx="1309" cy="605" rx="9" ry="84" transform="rotate(40 1309 605)" fill={`url(#${p}flare)`} opacity=".65" />
      </g>
      <g className="sl-key">
        <g className="sl-key-glow" fill="none">
          <use href={`#${p}keyOutline`} stroke="#ff8a15" strokeWidth="26" opacity=".28" filter={`url(#${p}wideGlow)`} />
          <path d="M567 643H1135Q1156 643 1166 619L1247 375Q1253 357 1240 340L1177 251" stroke="#ff6510" strokeWidth="14" opacity=".35" filter={`url(#${p}wideGlow)`} />
        </g>
        <g className="sl-key-body">
          <path fill={`url(#${p}keyLeft)`} d="M655 252 551 505Q539 531 566 540L568 642Q553 642 544 624L508 562Q502 550 511 532Z" />
          <path fill={`url(#${p}keyFront)`} d="M551 505Q542 530 567 540H1056L1137 643H571Q557 643 546 626L509 562Z" />
          <path fill={`url(#${p}keyRight)`} d="M1181 248 1245 343Q1254 359 1246 382L1166 618Q1158 640 1137 643L1056 542Q1091 542 1103 511L1181 278Z" />
          <path fill={`url(#${p}copperEdge)`} d="M1056 539 1074 537 1158 630Q1151 641 1135 642Z" />
          <path d="M655 252 511 532Q502 550 509 562L546 626Q557 643 571 643H1135Q1157 643 1166 618L1246 382Q1254 359 1245 343L1181 248" fill="none" stroke="#ff8a11" strokeWidth="5" />
          <path d="M511 532Q502 550 509 562L546 626Q557 643 571 643H1135Q1157 643 1166 618L1246 382" fill="none" stroke="#fff0a8" strokeWidth="2.5" />
        </g>
        <g className="sl-key-top">
          <use href={`#${p}keyOutline`} fill={`url(#${p}faceBevel)`} stroke="#ff840e" strokeWidth="10" />
          <path d="M662 254Q678 245 700 245H1145Q1180 245 1172 275L1093 507Q1083 527 1055 527H595Q558 527 561 503Z" fill={`url(#${p}blackFace)`} stroke="#73442e" strokeWidth="2" />
          <use href={`#${p}keyOutline`} fill="none" stroke="#ffa52c" strokeWidth="10" opacity=".9" filter={`url(#${p}smallGlow)`} />
          <use href={`#${p}keyOutline`} fill="none" stroke={`url(#${p}rim)`} strokeWidth="5.2" />
          <path d="M558 500 655 254Q670 238 699 238H1147Q1176 238 1181 261" fill="none" stroke="#fff9e9" strokeWidth="3.8" strokeLinecap="round" />
        </g>
        <g className="sl-key-reflections">
          <ellipse cx="1058" cy="239" rx="87" ry="14" fill={`url(#${p}flare)`} />
          <ellipse cx="667" cy="542" rx="91" ry="17" fill={`url(#${p}flare)`} />
          <ellipse cx="904" cy="643" rx="115" ry="19" fill={`url(#${p}flare)`} />
          <ellipse cx="573" cy="430" rx="16" ry="65" transform="rotate(22 573 430)" fill={`url(#${p}flare)`} />
        </g>
        <g className="sl-key-lettering" fill={`url(#${p}letter)`} strokeLinejoin="round">
          <g fill="#000" opacity=".88" transform="translate(5 9)" filter={`url(#${p}letterShadow)`}>
            <use href={`#${p}C`} />
            <use href={`#${p}t`} />
            <use href={`#${p}r`} />
            <use href={`#${p}l`} />
          </g>
          <g fill="#a86136" stroke="#5e260d" strokeWidth="1.3" transform="translate(0 4)">
            <use href={`#${p}C`} />
            <use href={`#${p}t`} />
            <use href={`#${p}r`} />
            <use href={`#${p}l`} />
          </g>
          <g stroke="#fff6eb" strokeWidth="1.1">
            <use href={`#${p}C`} />
            <use href={`#${p}t`} />
            <use href={`#${p}r`} />
            <use href={`#${p}l`} />
          </g>
        </g>
      </g>
    </svg>
  );
}
