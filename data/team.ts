// Integrantes del equipo (sección "Nuestro equipo" de la Home).
// Para sumar a alguien: agregar otro objeto a `team` con su foto en
// public/team/ y sus credenciales en public/team/credentials/ como WebP
// (<id>.webp de 1600 px de ancho y <id>-520.webp para la galería, con la
// proporción original del documento). Todo lo que se muestra sale de aquí: no
// hay texto fijo en los componentes. Los datos de cada credencial están copiados del certificado
// original (título, institución, fecha, código y enlace de verificación).

export type OrgId = "anthropic" | "microsoft" | "linkedin" | "platzi";
export type CredentialCategory = "ciberseguridad" | "ia" | "desarrollo";

export interface Organization {
  id: OrgId;
  name: string;
  logo: string; // logo en tono claro, recortado del propio certificado
}

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  org: OrgId;
  category: CredentialCategory;
  /** fecha de emisión (AAAA-MM-DD), tal como figura en el certificado */
  date: string;
  /** las destacadas se muestran primero; el resto con "Ver todas las credenciales" */
  featured: boolean;
  /** código o ID impreso en el certificado */
  code?: string;
  verify?: { url: string; label: string };
  image: { src: string; thumb: string; width: number; height: number };
}

export interface Specialty {
  id: "fullstack" | "security" | "ai";
  title: string;
  description: string;
}

export interface Stat {
  value: number;
  unit?: string;
  label: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  quote: string;
  bio: string[];
  photo: { src: string; srcSm: string; width: number; height: number; alt: string };
  stats: Stat[];
  specialties: Specialty[];
  skills: string[];
  orgs: Organization[];
  credentials: Credential[];
}

export const CATEGORY_LABELS: Record<CredentialCategory, string> = {
  ciberseguridad: "Ciberseguridad",
  ia: "Inteligencia artificial",
  desarrollo: "Desarrollo y gestión",
};

export const ORGANIZATIONS: Record<OrgId, Organization> = {
  anthropic: { id: "anthropic", name: "Anthropic", logo: "/team/orgs/anthropic.png" },
  microsoft: { id: "microsoft", name: "Microsoft", logo: "/team/orgs/microsoft.png" },
  linkedin: { id: "linkedin", name: "LinkedIn Learning", logo: "/team/orgs/linkedin-learning.png" },
  platzi: { id: "platzi", name: "Platzi", logo: "/team/orgs/platzi.png" },
};

// Proporciones reales de cada tipo de documento (se conservan en la galería y el visor).
const SIZE = {
  platzi: { width: 1600, height: 1238 },
  linkedin: { width: 1600, height: 1239 },
  academy: { width: 1600, height: 1174 },
} as const;

const img = (id: string, kind: keyof typeof SIZE) => ({
  src: `/team/credentials/${id}.webp`,
  thumb: `/team/credentials/${id}-520.webp`,
  ...SIZE[kind],
});

const PLATZI_PROFILE = { url: "https://platzi.com/@rogerfernandobautistaquispe/", label: "Perfil en Platzi" };
const academy = (hash: string) => ({ url: `https://academy.claude.com/verify/${hash}`, label: "Verificar en Claude Academy" });

const ROGER_CREDENTIALS: Credential[] = [
  // ── Ciberseguridad ──
  { id: "malware-forense", title: "Análisis de Malware e Ingeniería Forense", issuer: "Platzi", org: "platzi", category: "ciberseguridad", date: "2026-01-02", featured: true, code: "b356b17f-620d-44e3-9a72-b3eae77189e5", verify: PLATZI_PROFILE, image: img("malware-forense", "platzi") },
  { id: "hacking-etico", title: "Hacking Ético", issuer: "Platzi", org: "platzi", category: "ciberseguridad", date: "2026-01-02", featured: true, code: "aea3fd6d-34d1-4684-a3e1-8fa71f51a142", verify: PLATZI_PROFILE, image: img("hacking-etico", "platzi") },
  { id: "ciberseguridad-microsoft", title: "Fundamentos Profesionales en Ciberseguridad", issuer: "Microsoft y LinkedIn", org: "microsoft", category: "ciberseguridad", date: "2024-11-21", featured: true, code: "406bc7d3db04ada2010816e33b9426a1f97a579a8bd37e2aa4fe64be7010a98a", image: img("ciberseguridad-microsoft", "linkedin") },
  // ── Inteligencia artificial ──
  { id: "claude-code-in-action", title: "Claude Code in Action", issuer: "Anthropic", org: "anthropic", category: "ia", date: "2026-04-06", featured: true, code: "6n3s8qwo69sc", verify: { url: "https://verify.skilljar.com/c/6n3s8qwo69sc", label: "Verificar certificado" }, image: img("claude-code-in-action", "linkedin") },
  { id: "model-context-protocol", title: "Introduction to Model Context Protocol", issuer: "Claude Academy · Anthropic", org: "anthropic", category: "ia", date: "2026-10-02", featured: true, verify: academy("57f5913d4849ec6789e08f5fb6d2bd85"), image: img("model-context-protocol", "academy") },
  { id: "claude-enterprise", title: "Deploying Claude Enterprise with Confidence", issuer: "Claude Academy · Anthropic", org: "anthropic", category: "ia", date: "2026-10-03", featured: true, verify: academy("74299d721960609ab1262815ce22cc20"), image: img("claude-enterprise", "academy") },
  { id: "data-science-ai", title: "Fundamentos de Data Science y AI", issuer: "Platzi", org: "platzi", category: "ia", date: "2026-01-03", featured: true, code: "13caa921-230f-4836-a124-c7712f77675f", verify: PLATZI_PROFILE, image: img("data-science-ai", "platzi") },
  { id: "claude-platform-101", title: "Claude Platform 101", issuer: "Claude Academy · Anthropic", org: "anthropic", category: "ia", date: "2026-10-01", featured: true, verify: academy("4f652cc22c8ceed8a9ef4e5ede42f254"), image: img("claude-platform-101", "academy") },
  // ── Desarrollo y gestión ──
  { id: "flutter", title: "Desarrollo Multiplataforma con Flutter", issuer: "Platzi", org: "platzi", category: "desarrollo", date: "2025-12-29", featured: true, code: "61ab7067-ac08-4ee4-8321-136bcde87a7f", verify: PLATZI_PROFILE, image: img("flutter", "platzi") },
  { id: "gestion-proyectos", title: "Fundamentos Profesionales de Gestión de Proyectos", issuer: "Microsoft y LinkedIn", org: "microsoft", category: "desarrollo", date: "2024-12-15", featured: true, code: "e9f0e3aaa40e51fb4c10b3407c4ab5cff6190bd2ab753b296a2e34a904fee2c4", image: img("gestion-proyectos", "linkedin") },
  // ── Resto (con "Ver todas las credenciales") ──
  { id: "claude-code-101", title: "Claude Code 101", issuer: "Claude Academy · Anthropic", org: "anthropic", category: "ia", date: "2026-10-01", featured: false, verify: academy("8647abbc507a3c8121d800117a9d6c59"), image: img("claude-code-101", "academy") },
  { id: "claude-101", title: "Claude 101", issuer: "Claude Academy · Anthropic", org: "anthropic", category: "ia", date: "2026-10-01", featured: false, verify: academy("5fa52751ee737bcf560561748e4ed05f"), image: img("claude-101", "academy") },
  { id: "claude-cowork", title: "Introduction to Claude Cowork", issuer: "Claude Academy · Anthropic", org: "anthropic", category: "ia", date: "2026-10-01", featured: false, verify: academy("fedb90550e0026f8ce202062c551d044"), image: img("claude-cowork", "academy") },
  { id: "claude-tag", title: "Introduction to Claude Tag", issuer: "Claude Academy · Anthropic", org: "anthropic", category: "ia", date: "2026-10-01", featured: false, verify: academy("8ac37b02f2409b4a4f7f270d7820afd7"), image: img("claude-tag", "academy") },
  { id: "productividad-ia", title: "Productividad con IA Generativa", issuer: "Microsoft y LinkedIn", org: "microsoft", category: "ia", date: "2024-12-16", featured: false, code: "5977a9c133a1188fa280f46d1c6c2e524cabc4e5607feefeafc916980d3d256e", image: img("productividad-ia", "linkedin") },
  { id: "analisis-empresarial", title: "Fundamentos del Análisis Empresarial", issuer: "LinkedIn Learning", org: "linkedin", category: "desarrollo", date: "2024-11-30", featured: false, code: "06e043e032e549241e27cc5c8ac779f7a527c404c79dde7f126306ccc315042d", image: img("analisis-empresarial", "linkedin") },
  { id: "excel-avanzado", title: "Excel Avanzado para Análisis de Datos", issuer: "Platzi", org: "platzi", category: "desarrollo", date: "2026-01-10", featured: false, code: "62cbffef-fc06-41b0-9eaf-2ad397ffd0cb", verify: PLATZI_PROFILE, image: img("excel-avanzado", "platzi") },
  { id: "tecnologia-sostenible", title: "Fundamentos Profesionales en Tecnología Sostenible", issuer: "Microsoft y LinkedIn", org: "microsoft", category: "desarrollo", date: "2024-12-16", featured: false, code: "fc2b45dddcd90e185e8fbea812ac4539108bdfe12d241bb19f6a3eca16be49af", image: img("tecnologia-sostenible", "linkedin") },
  { id: "asistencia-administrativa", title: "Fundamentos Profesionales de Asistencia Administrativa", issuer: "Microsoft y LinkedIn", org: "microsoft", category: "desarrollo", date: "2024-12-15", featured: false, code: "3cbf5dd50b24ba4170cc362a52b47b57070a42fc2c0c53aaf1c9046ea645db39", image: img("asistencia-administrativa", "linkedin") },
];

// Credenciales de Geraldine Lavadenz Tapia (certificados recibidos). Tamaños reales de cada documento.
const fit = (id: string, width: number, height: number) => ({
  src: `/team/credentials/${id}.webp`,
  thumb: `/team/credentials/${id}-520.webp`,
  width,
  height,
});
const PLATZI_DASH = { url: "https://platzi.com/@dash.aprende/", label: "Perfil en Platzi" };

const GERALDINE_CREDENTIALS: Credential[] = [
  { id: "gl-claude-code-101", title: "Claude Code 101", issuer: "Claude Academy · Anthropic", org: "anthropic", category: "ia", date: "2026-10-01", featured: true, verify: academy("95f459c70759ef9eac03849743e8d287"), image: fit("gl-claude-code-101", 1600, 1088) },
  { id: "gl-claude-platform-101", title: "Claude Platform 101", issuer: "Claude Academy · Anthropic", org: "anthropic", category: "ia", date: "2026-10-01", featured: true, verify: academy("aea947da08c43b64438548b3ee27663d"), image: fit("gl-claude-platform-101", 1600, 1088) },
  { id: "gl-claude-code", title: "Claude Code", issuer: "Platzi", org: "platzi", category: "ia", date: "2026-04-07", featured: true, code: "ad292ad2-f820-4f65-970e-6aeed83b55f5", verify: PLATZI_DASH, image: fit("gl-claude-code", 1600, 1222) },
  { id: "gl-prompt-engineering", title: "Prompt Engineering", issuer: "Platzi", org: "platzi", category: "ia", date: "2026-08-21", featured: true, code: "b1038cca-47f8-456b-85b5-6264bff38686", verify: PLATZI_DASH, image: fit("gl-prompt-engineering", 1600, 1222) },
  { id: "gl-flutter", title: "Curso de Flutter", issuer: "Platzi", org: "platzi", category: "desarrollo", date: "2025-12-22", featured: true, code: "d784a271-bd26-4a15-b1f1-562ed1e0918e", verify: PLATZI_DASH, image: fit("gl-flutter", 1600, 1204) },
  { id: "gl-v0", title: "Creación de páginas web con v0", issuer: "Platzi", org: "platzi", category: "desarrollo", date: "2026-04-08", featured: true, code: "d40cd3c8-d49e-4091-96c6-8e4cc63b5495", verify: PLATZI_DASH, image: fit("gl-v0", 1600, 1222) },
  { id: "gl-gamificacion-componentes", title: "Gamificación con Octalysis: componentes y framework", issuer: "Platzi", org: "platzi", category: "desarrollo", date: "2026-02-03", featured: true, code: "01c752a1-dea1-45f7-81c5-28dcc069f396", verify: PLATZI_DASH, image: fit("gl-gamificacion-componentes", 1600, 1236) },
  { id: "gl-gamificacion-estrategias", title: "Gamificación con Octalysis: estrategias y fases de experiencia", issuer: "Platzi", org: "platzi", category: "desarrollo", date: "2026-02-26", featured: true, code: "96897cc3-5b79-4f63-b5b5-de854b531b35", verify: PLATZI_DASH, image: fit("gl-gamificacion-estrategias", 1600, 1236) },
];

export const team: TeamMember[] = [
  {
    id: "roger",
    name: "Roger Fernando Bautista Quispe",
    role: "Full Stack Developer | Cybersecurity & AI Specialist",
    quote: "Construyo con código. Protejo con conocimiento. Transformo con inteligencia.",
    bio: [
      "Desarrollador Full Stack con dos años de experiencia profesional y especialista en ciberseguridad con un año de experiencia, especializado también en inteligencia artificial aplicada.",
      "Combina el desarrollo de software, la seguridad informática y la inteligencia artificial para construir soluciones innovadoras, seguras y escalables.",
      "Su formación en Anthropic, Microsoft, LinkedIn y Platzi, junto con sus conocimientos en ciencia de datos, gestión de proyectos y análisis empresarial, le permite abordar los desafíos tecnológicos desde una perspectiva multidisciplinaria, técnica y estratégica.",
    ],
    photo: {
      src: "/team/roger.webp",
      srcSm: "/team/roger-600.webp",
      width: 1024,
      height: 1536,
      alt: "Roger Fernando Bautista Quispe, Full Stack Developer y especialista en ciberseguridad e inteligencia artificial",
    },
    stats: [
      { value: 2, unit: "años", label: "Desarrollo Full Stack" },
      { value: 1, unit: "año", label: "Ciberseguridad" },
      { value: 19, label: "Credenciales de formación" },
      { value: 4, label: "Organizaciones formativas" },
    ],
    specialties: [
      {
        id: "fullstack",
        title: "Full Stack Development",
        description: "Frontend, backend, APIs y bases de datos.",
      },
      {
        id: "security",
        title: "Cybersecurity",
        description: "Hacking ético, malware y análisis forense.",
      },
      {
        id: "ai",
        title: "Artificial Intelligence",
        description: "Modelos de lenguaje, automatización y MCP.",
      },
    ],
    skills: ["Data Science", "Gestión de proyectos", "Análisis empresarial", "Análisis de datos", "Innovación tecnológica"],
    orgs: [ORGANIZATIONS.anthropic, ORGANIZATIONS.microsoft, ORGANIZATIONS.linkedin, ORGANIZATIONS.platzi],
    credentials: ROGER_CREDENTIALS,
  },
  {
    id: "geraldine",
    name: "Geraldine Lavadenz Tapia",
    role: "",
    quote: "",
    bio: [],
    photo: {
      src: "/team/geraldine.webp",
      srcSm: "/team/geraldine-600.webp",
      width: 865,
      height: 868,
      alt: "Geraldine Lavadenz Tapia, integrante del equipo CtrlHack",
    },
    stats: [],
    specialties: [],
    skills: [],
    orgs: [ORGANIZATIONS.anthropic, ORGANIZATIONS.platzi],
    credentials: GERALDINE_CREDENTIALS,
  },
];

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
/** "2026-01-02" → "2 ene 2026" (sin depender de la zona horaria del visitante) */
export function formatCredentialDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
