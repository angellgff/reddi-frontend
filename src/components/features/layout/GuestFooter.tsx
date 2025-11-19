// src/components/layout/RootFooter.tsx

import FooterLink from "./FooterLink";
import AccordionSection from "@/src/components/features/layout/AccordionSection";
import FacebookIcon from "../../icons/socials/FacebookIcon";
import InstagramIcon from "../../icons/socials/InstagramIcon";
import XIcon from "../../icons/socials/XIcon";

const sectionsData = [
  {
    title: "Reddi",
    links: [
      { href: "/", label: "Inicio" },
      { href: "/categorias", label: "Categorías" },
      { href: "/como-funciona", label: "Cómo funciona" },
      { href: "/beneficios", label: "Beneficios" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { href: "/contacto", label: "Contacto" },
      { href: "/ayuda", label: "Ayuda" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terminos-y-condiciones", label: "Términos y condiciones" },
      { href: "/privacidad", label: "Políticas de privacidad" },
      {
        href: "/protocolo-respuesta-incidentes-irp",
        label: "Protocolo de respuesta a incidentes (IRP)",
      },
      {
        href: "/politicas-seguridad-transmision-datos-tarjetas",
        label: "Políticas de seguridad (datos de tarjetas)",
      },
      { href: "/politica-entrega", label: "Política de entrega" },
      {
        href: "/politica-reembolsos-devoluciones-cancelaciones",
        label: "Política de reembolsos, devoluciones y cancelaciones",
      },
    ],
  },
];

// --- Componente Principal del Footer ---
export default function RootFooter() {
  return (
    <footer className="bg-black p-8 text-white">
      {" "}
      {/* Cambiado a text-white para mejor contraste */}
      <div className="mx-auto max-w-6xl">
        {" "}
        {/* Centrado y con ancho máximo */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          {/* Columna 1: Info de la marca */}
          <div className="mb-4 md:mb-0">
            <h1 className="text-primary mb-3 text-3xl font-bold">Reddi</h1>
            <p className="text-mainBorder">
              Todo lo que necesitas, directo a tu villa o yate
            </p>
          </div>

          {/* Columnas 2, 3 y 4: Enlaces (ahora usan el acordeón) */}
          {sectionsData.map(({ title, links }) => (
            <AccordionSection title={title} key={title}>
              {links.map(({ href, label }) => (
                <FooterLink href={href} key={href}>
                  {label}
                </FooterLink>
              ))}
            </AccordionSection>
          ))}
        </div>
        {/* Fila inferior: Copyright y Redes Sociales */}
        <div className="mt-6 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-400">
            © 2024 Reddi. Todos los derechos reservados.
          </p>
          <nav className="flex flex-row gap-5">
            <a
              href="https://facebook.com"
              target="_blank"
              aria-label="Facebook"
            >
              <FacebookIcon className="h-6 w-6 text-gray-400 transition-colors hover:text-primary" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-6 w-6 text-gray-400 transition-colors hover:text-primary" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              aria-label="Twitter/X"
            >
              <XIcon className="h-6 w-6 text-gray-400 transition-colors hover:text-primary" />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
