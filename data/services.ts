// Las cuatro cosas que CTRLHACK construye — mismas categorías que la fila del
// Hero ("Web · Apps · Sistemas · Productos propios"). Fuente única para el
// resumen en Home, para /servicios y para el footer, evita que diverjan en
// texto o en el link al que apuntan.
export interface Service {
  id: string;
  name: string;
  hook: string;
  description: string;
  // Frase corta de la tarjeta (Home y /servicios): invita a entrar a la página.
  teaser: string;
  // Página propia de esta categoría — la card ya no redirige a /contacto,
  // cada una es puerta de entrada a su propia página (ver App.tsx).
  path: string;
}

export const services: Service[] = [
  {
    id: "web",
    name: "Web",
    hook: "Tu presencia digital.",
    description: "Sitios y plataformas web pensados para crecer.",
    teaser: "Descubre los diferentes tipos de páginas web que podemos hacer.",
    path: "/servicios/web",
  },
  {
    id: "apps",
    name: "Apps",
    hook: "Tu idea, convertida en producto.",
    description: "Aplicaciones diseñadas para tus usuarios.",
    teaser: "Descubre los diferentes tipos de aplicaciones que podemos crear.",
    path: "/servicios/apps",
  },
  {
    id: "sistemas",
    name: "Sistemas",
    hook: "Más control. Menos trabajo.",
    description: "Sistemas que organizan y automatizan tus procesos.",
    teaser: "Descubre los diferentes tipos de sistemas que podemos construir.",
    path: "/servicios/sistemas",
  },
  {
    id: "productos",
    name: "Productos propios",
    hook: "Nuestras ideas, hechas realidad.",
    description: "Productos y proyectos que nacen dentro de CTRLHACK.",
    teaser: "Descubre los productos que creamos dentro de CtrlHack.",
    path: "/productos",
  },
];
