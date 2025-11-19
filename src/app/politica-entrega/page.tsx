export default function Page() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-6 text-gray-800">
      {/* Botón de Volver */}
      <a href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
        &larr; Volver
      </a>

      <h1 className="text-4xl font-bold border-b pb-4">Política de entrega</h1>
      <p className="text-sm text-gray-500">
        Última actualización: 18 / 11 / 2025
      </p>

      {/* 1. Zonas de entrega */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">1. Zonas de entrega</h2>
        <p className="mb-4">
          Realizamos entregas dentro de{" "}
          <strong>Casa de Campo, La Romana</strong> y áreas cercanas.
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Entrega Express (≈ 30 minutos):</strong> disponible para
            productos en inventario dentro de Casa de Campo.
          </li>
          <li>
            <strong>Pre-Arrival Delivery:</strong> permite recibir tus pedidos{" "}
            <strong>antes de tu llegada al yate o villa</strong>, con reserva
            anticipada.
          </li>
        </ul>
      </section>

      {/* 2. Horarios de entrega */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">2. Horarios de entrega</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Todos los días:</strong> de 10:00 a.m. a 12:00 a.m.
            (medianoche).
          </li>
          <li>
            Los pedidos realizados fuera de horario se procesarán al siguiente
            día hábil o según disponibilidad.
          </li>
          <li>
            En fechas de alta demanda (feriados, eventos o temporadas
            turísticas) los tiempos de entrega pueden variar.
          </li>
        </ul>
      </section>

      {/* 3. Tarifas de entrega */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">3. Tarifas de entrega</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Entrega Express:</strong> tarifa fija según la zona.
          </li>
          <li>
            <strong>Pre-Arrival Delivery:</strong> tarifa variable según horario
            y ubicación.
          </li>
        </ul>
      </section>

      {/* 4. Estimación del tiempo de entrega */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          4. Estimación del tiempo de entrega
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            En la app verás una <strong>hora estimada</strong> de entrega basada
            en tu ubicación.
          </li>
          <li>
            Factores externos como tráfico, clima o disponibilidad de productos
            pueden afectar los tiempos.
          </li>
          <li>
            Si ocurre un retraso considerable, te notificaremos por la app o vía
            WhatsApp.
          </li>
        </ul>
      </section>

      {/* 5. Recepción del pedido */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">5. Recepción del pedido</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            El cliente o una persona autorizada debe estar presente para recibir
            la entrega.
          </li>
          <li>
            Si no hay nadie disponible en el momento de la entrega,{" "}
            <strong>
              el pedido será dejado en la dirección indicada al realizar la
              orden
            </strong>
            , salvo que el cliente especifique lo contrario.
          </li>
          <li>
            En pedidos <strong>Pre-Arrival</strong>, la entrega se realiza
            directamente con el personal autorizado del{" "}
            <strong>yate o villa</strong>.
          </li>
        </ul>
      </section>

      {/* 6. Pedidos anticipados (“Pre-Arrival Delivery”) */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          6. Pedidos anticipados (“Pre-Arrival Delivery”)
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Se deben realizar{" "}
            <strong>con al menos 2 horas de anticipación</strong>.
          </li>
          <li>
            El cliente debe indicar la dirección exacta, nombre del{" "}
            <strong>yate o villa</strong> y cualquier instrucción adicional (por
            ejemplo, código de acceso o contacto del personal).
          </li>
        </ul>
      </section>

      {/* 7. Cambios, cancelaciones y devoluciones */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          7. Cambios, cancelaciones y devoluciones
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>
              Una vez realizada la orden, no podrá ser modificada ni cancelada.
            </strong>
          </li>
          <li>
            No se aceptan devoluciones de productos perecederos una vez
            entregados.
          </li>
          <li>
            En caso de error o faltante, contáctanos dentro de las primeras{" "}
            <strong>2 horas posteriores a la entrega</strong> para buscar una
            solución.
          </li>
        </ul>
      </section>

      {/* 8. Responsabilidades */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">8. Responsabilidades</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Reddi</strong> garantiza que los pedidos lleguen completos,
            en buen estado y dentro del tiempo estimado.
          </li>
          <li>
            El cliente es responsable de proporcionar información exacta y estar
            disponible para recibir la entrega.
          </li>
        </ul>
      </section>
    </main>
  );
}
