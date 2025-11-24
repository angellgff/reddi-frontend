import Link from "next/link";

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-8 text-gray-800">
      {/* Botón de Volver */}
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        &larr; Volver
      </Link>

      <h1 className="text-4xl font-bold border-b pb-4">Sobre Reddi</h1>

      {/* Introducción */}
      <section className="space-y-4">
        <p className="text-lg leading-relaxed">
          Reddi es una <strong>plataforma digital de entregas rápidas</strong>{" "}
          diseñada específicamente para <strong>urbanizaciones privadas</strong>
          , con un enfoque operativo que prioriza la seguridad del condominio y
          de todos nuestros usuarios.
        </p>
        <p className="text-lg leading-relaxed">
          Actualmente, Reddi opera dentro de{" "}
          <strong>Casa de Campo, La Romana</strong>, ofreciendo un sistema de
          delivery premium para turistas, residentes y villas.
        </p>
      </section>

      {/* Servicios */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Nuestros servicios incluyen:
        </h2>
        <ul className="list-disc list-inside space-y-3 text-gray-700">
          <li>
            <strong>Supermercado y abarrotes:</strong> productos frescos,
            snacks, bebidas, agua, hielo y artículos esenciales.
          </li>
          <li>
            <strong>Farmacia y cuidado personal:</strong> medicamentos de venta
            libre, higiene personal y primeros auxilios.
          </li>
          <li>
            <strong>Carnes premium y productos gourmet:</strong> cortes de alta
            calidad provenientes de suplidores locales certificados.
          </li>
          <li>
            <strong>Artículos de conveniencia:</strong> productos del hogar,
            suministros básicos y necesidades urgentes.
          </li>
          <li>
            <strong>Pre-Arrival Delivery:</strong> abastecimiento completo de
            villas antes de la llegada del huésped.
          </li>
          <li>
            <strong>Entregas rápidas dentro del condominio</strong>, con tiempos
            de respuesta optimizados según disponibilidad y horario.
          </li>
        </ul>
      </section>

      {/* Seguridad y Operatividad */}
      <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-3">Seguridad y Confianza</h3>
        <p>
          Todos los pedidos se gestionan mediante nuestra aplicación, y las
          entregas son realizadas únicamente por{" "}
          <strong>conductores verificados</strong>, con acceso controlado y
          registros digitales que garantizan transparencia y trazabilidad.
        </p>
      </section>
    </main>
  );
}
