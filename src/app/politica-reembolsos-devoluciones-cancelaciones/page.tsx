export default function Page() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-8 text-gray-800">
      {/* Botón de Volver */}
      <a href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
        &larr; Volver
      </a>

      <h1 className="text-4xl font-bold border-b pb-4">
        Política de reembolsos, devoluciones y cancelaciones
      </h1>
      <p className="text-sm text-gray-500">18 / 11 / 2025</p>

      {/* 1. Introducción */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">1. Introducción</h2>
        <p className="mb-4">
          En Reddi trabajamos para ofrecer una experiencia rápida, segura y
          confiable para <strong>usuarios</strong> y <strong>comercios</strong>.
        </p>
        <p>
          Esta política establece las condiciones bajo las cuales ambas partes
          pueden solicitar o gestionar{" "}
          <strong>reembolsos, devoluciones o cancelaciones</strong> de pedidos
          realizados a través de nuestra plataforma.
        </p>
      </section>

      {/* 2. Alcance */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">2. Alcance</h2>
        <p className="mb-2">Esta política aplica a:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Usuarios</strong> que realicen pedidos a través de Reddi.
          </li>
          <li>
            <strong>Comercios afiliados</strong> que vendan productos dentro de
            la plataforma.
          </li>
          <li>
            Esta política aplica a todas las entregas realizadas dentro de las
            zonas operativas de Reddi.
          </li>
          <li>
            Productos provenientes de restaurantes, supermercados, licorerías,
            farmacias y establecimientos autorizados.
          </li>
        </ul>
      </section>

      {/* 3. Cancelaciones */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">3. Cancelaciones</h2>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            3.1. Cancelaciones por parte del usuario
          </h3>
          <p className="mb-2">
            Una vez que el comercio <strong>acepta</strong> un pedido, este{" "}
            <strong>no podrá ser cancelado</strong> por el usuario.
          </p>
          <p className="mb-2">Esto incluye pedidos:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>En preparación</li>
            <li>Listos para recoger</li>
            <li>Ya retirados por el repartidor</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            3.2. Cancelaciones por parte del comercio
          </h3>
          <p className="mb-2">Un comercio puede cancelar un pedido si:</p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>No cuenta con el producto solicitado</li>
            <li>Hubo un cierre inesperado</li>
            <li>Existe una razón operativa válida</li>
          </ul>
          <p className="mb-2">En esos casos:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              El usuario recibirá un <strong>reembolso completo</strong>
            </li>
            <li>Se notificará automáticamente a ambas partes</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            3.3. Cancelaciones por parte de Reddi
          </h3>
          <p className="mb-2">Reddi podrá cancelar pedidos por razones como:</p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Información incompleta del usuario</li>
            <li>Riesgos de seguridad en la zona de operación</li>
            <li>Problemas logísticos extremos</li>
            <li>
              Actividad sospechosa o incumplimiento de términos por parte del
              comercio
            </li>
          </ul>
          <p className="mb-2">Si Reddi cancela un pedido:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Se otorgará <strong>reembolso completo</strong> al usuario
            </li>
            <li>El comercio será notificado inmediatamente</li>
          </ul>
        </div>
      </section>

      {/* 4. Reembolsos */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">4. Reembolsos</h2>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            4.1. Reembolsos completos (aplica a usuarios)
          </h3>
          <p className="mb-2">
            Se otorgará un reembolso total únicamente cuando:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              El pedido entregado <strong>no coincide</strong> con lo solicitado
            </li>
            <li>
              Los productos sean entregados{" "}
              <strong>dañados, abiertos o en mal estado</strong>
            </li>
            <li>
              El repartidor no realizó la entrega por una falla atribuible a
              Reddi o al comercio
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            4.2. Reembolsos parciales
          </h3>
          <p className="mb-2">Aplican cuando:</p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>El pedido llega incompleto</li>
            <li>Faltan artículos del comercio</li>
            <li>Existe un error parcial en el armado del pedido</li>
          </ul>
          <p>El monto se calculará según los productos afectados.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            4.3. Reembolsos no aplicables
          </h3>
          <p className="mb-2">
            Reddi <strong>no</strong> otorgará reembolsos cuando:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              La dirección o punto de entrega proporcionado fue incorrecto
            </li>
            <li>El usuario no estuvo disponible para recibir el pedido</li>
            <li>Los productos fueron abiertos, consumidos o manipulados</li>
            <li>
              El retraso se debió a factores externos (clima, tráfico, acceso
              restringido, demanda alta)
            </li>
            <li>
              El comercio cumplió correctamente y el error fue responsabilidad
              del usuario
            </li>
          </ul>
        </div>
      </section>

      {/* 5. Devoluciones */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">5. Devoluciones</h2>
        <p className="mb-2">
          Por razones sanitarias, <strong>no se aceptan devoluciones</strong>{" "}
          de:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Alimentos preparados</li>
          <li>Bebidas</li>
          <li>Alcohol y tabaco</li>
          <li>Productos perecederos</li>
        </ul>
        <p className="mb-2">
          Los comercios <strong>solo</strong> aceptarán devoluciones si:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>El producto está sellado</li>
          <li>Está sin consumir</li>
          <li>Fue enviado por error del comercio</li>
        </ul>
        <p>
          Reddi facilitará el proceso entre el usuario y el comercio, pero el
          cumplimiento final dependerá del comercio.
        </p>
      </section>

      {/* 6. Proceso de Revisión */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          6. Proceso de Revisión (para usuarios y comercios)
        </h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            El reporte debe enviarse dentro de los{" "}
            <strong>45 minutos posteriores a la entrega</strong>.
          </li>
          <li>
            Se deberá incluir evidencia (fotos, descripción, número de orden).
          </li>
          <li>
            El equipo de Reddi analizará el caso y contactará al comercio.
          </li>
          <li>Se determinará si aplica reembolso total, parcial o rechazo.</li>
          <li>
            Los reembolsos aprobados se procesarán dentro de{" "}
            <strong>5–7 días hábiles</strong>.
          </li>
        </ol>
      </section>

      {/* 7. Modificaciones de la Política */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          7. Modificaciones de la Política
        </h2>
        <p className="mb-2">
          Esta política puede actualizarse en cualquier momento para adaptarse
          a:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Nuevas zonas de operación</li>
          <li>Nuevos tipos de comercios o productos</li>
          <li>Reglas internas de lugares como Casa de Campo</li>
        </ul>
        <p>Los cambios serán comunicados a usuarios y comercios.</p>
      </section>
    </main>
  );
}
