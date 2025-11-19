export default function Page() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-8 text-gray-800">
      {/* Botón de Volver */}
      <a href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
        &larr; Volver
      </a>

      <h1 className="text-4xl font-bold border-b pb-4">
        Términos y Condiciones
      </h1>
      <p className="text-sm text-gray-500">
        Última actualización: 18 / 11 / 2025
      </p>
      <p>
        Bienvenido a Reddi. Al acceder, navegar o realizar pedidos a través de
        nuestra plataforma, aceptas los siguientes Términos y Condiciones. Te
        recomendamos leerlos detenidamente.
      </p>

      {/* 1. Definiciones */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">1. Definiciones</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Reddi:</strong> plataforma digital que conecta usuarios con
            comercios y repartidores para facilitar entregas dentro de Casa de
            Campo.
          </li>
          <li>
            <strong>Usuario:</strong> toda persona que crea una cuenta o realiza
            pedidos a través de Reddi.
          </li>
          <li>
            <strong>Comercio:</strong> establecimiento afiliado que ofrece
            productos dentro de la plataforma.
          </li>
          <li>
            <strong>Repartidor:</strong> persona autorizada por Reddi para
            realizar entregas.
          </li>
          <li>
            <strong>Pedido:</strong> solicitud de compra realizada por un
            usuario a través de Reddi.
          </li>
        </ul>
      </section>

      {/* 2. Uso de la plataforma */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">2. Uso de la plataforma</h2>
        <p className="mb-2">El usuario acepta:</p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Proporcionar información verídica y actualizada.</li>
          <li>
            No utilizar Reddi para actividades ilegales, fraudulentas o
            abusivas.
          </li>
          <li>No interferir con el funcionamiento de la plataforma.</li>
        </ul>
        <p>
          Reddi se reserva el derecho de suspender o cancelar cuentas si detecta
          comportamiento inapropiado o violaciones a estos términos.
        </p>
      </section>

      {/* 3. Registro y cuenta del usuario */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          3. Registro y cuenta del usuario
        </h2>
        <p className="mb-2">Para realizar pedidos, el usuario debe:</p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Ser mayor de 18 años.</li>
          <li>Registrar una cuenta con nombre, teléfono y correo válido.</li>
          <li>Mantener la confidencialidad de su cuenta.</li>
        </ul>
        <p>
          El usuario es responsable de toda actividad realizada bajo su sesión.
        </p>
      </section>

      {/* 4. Pedidos y confirmación */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          4. Pedidos y confirmación
        </h2>
        <p className="mb-2">Cuando un pedido es realizado:</p>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>
            El comercio recibe y <strong>acepta</strong> la orden.
          </li>
          <li>Tras la aceptación, el pedido pasa a preparación.</li>
          <li>El repartidor recoge y entrega el pedido.</li>
        </ol>
        <p className="font-semibold">
          Una vez realizada la orden, no podrá ser modificada ni cancelada.
        </p>
        <p>Esto incluye pedidos en preparación, listos o ya retirados.</p>
      </section>

      {/* 5. Pagos */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">5. Pagos</h2>
        <p className="mb-2">
          Los pagos se procesan a través de proveedores certificados:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Stripe</li>
          <li>Azul</li>
          <li>Tarjetas de crédito o débito</li>
        </ul>
        <p>
          <strong>Reddi no almacena información completa de tarjetas.</strong>
        </p>
        <p>
          Al realizar un pedido, el usuario autoriza el cobro automático del
          monto total.
        </p>
        <p>
          En caso de cancelación por parte del comercio o Reddi, se gestionará
          un reembolso según la{" "}
          <strong>Política de Reembolsos, Devoluciones y Cancelaciones</strong>.
        </p>
      </section>

      {/* 6. Entregas */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Entregas</h2>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            6.1. Zonas y modalidades
          </h3>
          <p className="mb-2">
            Las entregas se realizan dentro de <strong>Casa de Campo</strong> y
            áreas cercanas.
          </p>
          <p>Modalidades:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Entrega Express (≈ 30 minutos)</strong>
            </li>
            <li>
              <strong>Pre-Arrival Delivery (mínimo 2 horas antes)</strong>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            6.2. Entrega en villas y yates
          </h3>
          <p className="mb-2">Las entregas pueden realizarse a:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Villas dentro de Casa de Campo</li>
            <li>Yates en la Marina Casa de Campo</li>
          </ul>
          <p>
            El usuario deberá indicar la ubicación exacta y cualquier
            instrucción relevante.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            6.3. Si no hay nadie disponible
          </h3>
          <p className="mb-2">Si no hay una persona para recibir:</p>
          <p className="bg-yellow-100 p-3 rounded-md border border-yellow-300 mb-4">
            <strong>
              El pedido será dejado en la dirección indicada por el usuario
            </strong>
            , salvo que este especifique lo contrario.
          </p>
          <p className="mb-2">Reddi no se hace responsable de:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Pérdida del pedido</li>
            <li>Daños posteriores</li>
            <li>Acceso no autorizado después de dejar la orden</li>
          </ul>
        </div>
      </section>

      {/* 7. Responsabilidades del usuario */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          7. Responsabilidades del usuario
        </h2>
        <p className="mb-2">El usuario se compromete a:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Ingresar direcciones correctas y claras.</li>
          <li>Recibir el pedido en el horario estimado.</li>
          <li>No incurrir en maltrato hacia repartidores o comercios.</li>
          <li>Respetar políticas de uso, entrega y devoluciones.</li>
        </ul>
      </section>

      {/* 8. Responsabilidades de Reddi */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          8. Responsabilidades de Reddi
        </h2>
        <p className="mb-2">Reddi se compromete a:</p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Mostrar información clara sobre productos, tiempos y tarifas.</li>
          <li>Proteger los datos del usuario.</li>
          <li>Coordinar las entregas con comercios y repartidores.</li>
          <li>Gestionar reclamos conforme a las políticas oficiales.</li>
        </ul>
        <p>
          <strong>Reddi no garantiza</strong> disponibilidad de todos los
          productos ni tiempos exactos de entrega, ya que pueden verse afectados
          por clima, tráfico, eventos locales u otros factores externos.
        </p>
      </section>

      {/* 9. Responsabilidad limitada */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          9. Responsabilidad limitada
        </h2>
        <p className="mb-2">Reddi no será responsable por:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Retrasos por causas externas</li>
          <li>
            Daños, pérdidas o robos del pedido una vez entregado o dejado en la
            dirección indicada
          </li>
          <li>Errores causados por direcciones incorrectas del usuario</li>
          <li>
            Productos abiertos, consumidos o manipulados después de la entrega
          </li>
          <li>
            Problemas internos del comercio que no sean atribuibles a Reddi
          </li>
        </ul>
      </section>

      {/* 10. Propiedad intelectual */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          10. Propiedad intelectual
        </h2>
        <p className="mb-2">
          Todo el contenido de la plataforma (marca Reddi, logotipo,
          fotografías, diseño, textos, software) es propiedad exclusiva de
          Reddi.
        </p>
        <p>Queda prohibida su reproducción sin autorización.</p>
      </section>

      {/* 11. Modificaciones a los Términos */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          11. Modificaciones a los Términos
        </h2>
        <p className="mb-2">
          Reddi podrá actualizar estos Términos en cualquier momento.
        </p>
        <p className="mb-2">
          Las modificaciones se publicarán con su fecha correspondiente.
        </p>
        <p>
          El uso continuo de la plataforma implica la aceptación de dichos
          cambios.
        </p>
      </section>

      {/* 12. Ley aplicable */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">12. Ley aplicable</h2>
        <p className="mb-2">
          Estos Términos se rigen por las leyes de la{" "}
          <strong>República Dominicana</strong>.
        </p>
        <p>
          Cualquier disputa se resolverá bajo la jurisdicción competente en
          dicho país.
        </p>
      </section>
    </main>
  );
}
