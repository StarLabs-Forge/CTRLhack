import { PIECES } from "./fractureGeometry";

// Definiciones compartidas de la tecla Ctrl: gradientes, la tecla completa
// (#key), el recorte de cada fragmento y la máscara alfa de su silueta.
//
// La geometría y los gradientes salen del isotipo oficial (Logo.tsx, "03 · Cobre
// fiel"); aquí solo se quitan los filtros de desenfoque (sombra de letras y
// brillo), porque los fragmentos se mueven sin parar y un blur SVG se repintaría
// en cada fotograma. La sombra se aproxima con una copia desplazada.
//
// Vive en un <svg> de 0×0 (no display:none: algunos navegadores no resuelven
// gradientes de un SVG oculto) y las piezas lo referencian con <use>.
export function KeyDefs({ p }: { p: string }) {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id={`${p}keyFront`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#3d1609" /><stop offset=".32" stopColor="#1b0803" /><stop offset=".69" stopColor="#371003" /><stop offset="1" stopColor="#a5430b" />
        </linearGradient>
        <linearGradient id={`${p}keyRight`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffb044" /><stop offset=".12" stopColor="#a44a13" /><stop offset=".4" stopColor="#361408" /><stop offset=".68" stopColor="#1b0803" /><stop offset="1" stopColor="#b65a1a" />
        </linearGradient>
        <linearGradient id={`${p}keyLeft`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffcc87" /><stop offset=".32" stopColor="#d66a22" /><stop offset=".56" stopColor="#5f2008" /><stop offset="1" stopColor="#1e0d04" />
        </linearGradient>
        <linearGradient id={`${p}copperEdge`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffebce" /><stop offset=".18" stopColor="#b96e37" /><stop offset=".36" stopColor="#ffab64" /><stop offset=".52" stopColor="#4d1b06" /><stop offset=".72" stopColor="#ffbe7e" /><stop offset=".89" stopColor="#a74e1a" /><stop offset="1" stopColor="#ff8528" />
        </linearGradient>
        <radialGradient id={`${p}blackFace`} cx=".49" cy=".45" r=".8">
          <stop stopColor="#130e0c" /><stop offset=".5" stopColor="#1b1512" /><stop offset=".78" stopColor="#35251e" /><stop offset="1" stopColor="#6c3318" />
        </radialGradient>
        <linearGradient id={`${p}faceBevel`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#744226" /><stop offset=".32" stopColor="#2b170e" /><stop offset=".78" stopColor="#17100c" /><stop offset="1" stopColor="#6d3923" />
        </linearGradient>
        <linearGradient id={`${p}rim`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff8e4" /><stop offset=".25" stopColor="#fff0ba" /><stop offset=".43" stopColor="#ff9f28" /><stop offset=".64" stopColor="#ffe9b8" /><stop offset=".82" stopColor="#ff9d30" /><stop offset="1" stopColor="#fff2c2" />
        </linearGradient>
        <linearGradient id={`${p}letter`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fffcf7" /><stop offset=".36" stopColor="#f9eee5" /><stop offset=".7" stopColor="#e7d4c4" /><stop offset="1" stopColor="#d6b89d" />
        </linearGradient>
        <radialGradient id={`${p}flare`}>
          <stop stopColor="#fffdeb" /><stop offset=".18" stopColor="#ffda84" stopOpacity=".9" /><stop offset=".46" stopColor="#ff8a19" stopOpacity=".6" /><stop offset="1" stopColor="#ff6d10" stopOpacity="0" />
        </radialGradient>

        <path id={`${p}keyOutline`} d="M655 252Q669 238 699 238H1147Q1190 238 1181 278L1103 511Q1091 542 1056 542H594Q543 542 552 505Z" />
        <path id={`${p}C`} d="M860 320H790Q750 320 725 341Q698 364 684 410Q674 438 690 451Q702 462 729 462H807L813 430H746Q720 430 729 407Q737 385 753 364Q766 348 792 348H843Z" />
        <path id={`${p}t`} d="M895 333H927L917 360H944L934 385H907L889 426Q885 434 896 434H920L910 462H879Q845 462 852 433L872 385H846L857 360H883Z" />
        <path id={`${p}r`} d="M927 462 952 396Q967 360 1009 360H1038L1029 385H1008Q989 385 982 408L962 462Z" />
        <path id={`${p}l`} d="M1066 320H1103L1052 462H1016Z" />

        {/* la tecla completa, sin filtros */}
        <g id={`${p}key`}>
          <path fill={`url(#${p}keyLeft)`} d="M655 252 551 505Q539 531 566 540L568 642Q553 642 544 624L508 562Q502 550 511 532Z" />
          <path fill={`url(#${p}keyFront)`} d="M551 505Q542 530 567 540H1056L1137 643H571Q557 643 546 626L509 562Z" />
          <path fill={`url(#${p}keyRight)`} d="M1181 248 1245 343Q1254 359 1246 382L1166 618Q1158 640 1137 643L1056 542Q1091 542 1103 511L1181 278Z" />
          <path fill={`url(#${p}copperEdge)`} d="M1056 539 1074 537 1158 630Q1151 641 1135 642Z" />
          <path d="M655 252 511 532Q502 550 509 562L546 626Q557 643 571 643H1135Q1157 643 1166 618L1246 382Q1254 359 1245 343L1181 248" fill="none" stroke="#ff8a11" strokeWidth="5" />
          <path d="M511 532Q502 550 509 562L546 626Q557 643 571 643H1135Q1157 643 1166 618L1246 382" fill="none" stroke="#fff0a8" strokeWidth="2.5" />
          <use href={`#${p}keyOutline`} fill={`url(#${p}faceBevel)`} stroke="#ff840e" strokeWidth="10" />
          <path d="M662 254Q678 245 700 245H1145Q1180 245 1172 275L1093 507Q1083 527 1055 527H595Q558 527 561 503Z" fill={`url(#${p}blackFace)`} stroke="#73442e" strokeWidth="2" />
          <use href={`#${p}keyOutline`} fill="none" stroke="#ffa52c" strokeWidth="14" opacity=".16" />
          <use href={`#${p}keyOutline`} fill="none" stroke={`url(#${p}rim)`} strokeWidth="5.2" />
          <path d="M558 500 655 254Q670 238 699 238H1147Q1176 238 1181 261" fill="none" stroke="#fff9e9" strokeWidth="3.8" strokeLinecap="round" />
          <ellipse cx="1058" cy="239" rx="87" ry="14" fill={`url(#${p}flare)`} />
          <ellipse cx="667" cy="542" rx="91" ry="17" fill={`url(#${p}flare)`} />
          <ellipse cx="904" cy="643" rx="115" ry="19" fill={`url(#${p}flare)`} />
          <ellipse cx="573" cy="430" rx="16" ry="65" transform="rotate(22 573 430)" fill={`url(#${p}flare)`} />
          <g fill={`url(#${p}letter)`} strokeLinejoin="round">
            <g fill="#000" opacity=".6" transform="translate(5 9)">
              <use href={`#${p}C`} /><use href={`#${p}t`} /><use href={`#${p}r`} /><use href={`#${p}l`} />
            </g>
            <g fill="#a86136" stroke="#5e260d" strokeWidth="1.3" transform="translate(0 4)">
              <use href={`#${p}C`} /><use href={`#${p}t`} /><use href={`#${p}r`} /><use href={`#${p}l`} />
            </g>
            <g stroke="#fff6eb" strokeWidth="1.1">
              <use href={`#${p}C`} /><use href={`#${p}t`} /><use href={`#${p}r`} /><use href={`#${p}l`} />
            </g>
          </g>
        </g>

        {/* silueta (canal alfa) de la tecla: contiene las líneas de fractura dentro de ella */}
        <mask id={`${p}silhouette`} maskUnits="userSpaceOnUse" x="0" y="0" width="1774" height="887" style={{ maskType: "alpha" }}>
          <use href={`#${p}key`} />
        </mask>

        {PIECES.map((piece) => (
          <clipPath id={`${p}clip-${piece.id}`} key={piece.id}>
            <polygon points={piece.polygon} />
          </clipPath>
        ))}
      </defs>
    </svg>
  );
}
