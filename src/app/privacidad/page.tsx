export default function Page() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-8 text-gray-800">
      {/* Botón de Volver */}
      <a href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
        &larr; Volver
      </a>

      <h1 className="text-4xl font-bold border-b pb-4">
        Política de Privacidad – Reddi
      </h1>
      <p className="text-sm text-gray-500">
        Última actualización: 18 / 11 / 2025
      </p>
      <p>
        En Reddi, valoramos tu privacidad y nos comprometemos a proteger la
        información personal que compartes con nosotros. Esta política explica
        cómo recopilamos, usamos y protegemos tus datos cuando utilizas nuestros
        servicios.
      </p>

      {/* 1. Información que recopilamos */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          1. Información que recopilamos
        </h2>
        <p className="mb-4">
          Recopilamos información para ofrecerte una mejor experiencia y
          procesar tus pedidos de manera eficiente.
        </p>
        <p className="mb-2">Podemos solicitar:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Datos personales:</strong> nombre, número de teléfono,
            correo electrónico y dirección de entrega (villa o yate).
          </li>
          <li>
            <strong>Datos de pago:</strong> información procesada de manera
            segura por terceros autorizados como <strong>Stripe, Azul</strong>,
            o mediante <strong>tarjeta de crédito/débito</strong>.
          </li>
          <li>
            <strong>Datos de ubicación:</strong> para calcular tiempos de
            entrega y asignar repartidores cercanos.
          </li>
          <li>
            <strong>Datos del dispositivo:</strong> tipo de dispositivo, sistema
            operativo, dirección IP y actividad dentro de la app o web.
          </li>
        </ul>
      </section>

      {/* 2. Uso de la información */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          2. Uso de la información
        </h2>
        <p className="mb-2">Usamos tu información para:</p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Procesar, gestionar y entregar tus pedidos.</li>
          <li>
            Comunicarte actualizaciones, confirmaciones o incidencias del pedido
            (por WhatsApp, correo o notificaciones).
          </li>
          <li>Mejorar la experiencia de usuario en la app o sitio web.</li>
          <li>Cumplir obligaciones legales o de seguridad.</li>
        </ul>
        <p>
          No vendemos, alquilamos ni compartimos tu información personal con
          terceros sin tu consentimiento, excepto en los casos necesarios para
          procesar pedidos o cumplir la ley.
        </p>
      </section>

      {/* 3. Almacenamiento y protección de datos */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          3. Almacenamiento y protección de datos
        </h2>
        <p className="mb-3">
          Tus datos se almacenan en servidores seguros con acceso limitado.
        </p>
        <p className="mb-3">
          Implementamos medidas técnicas y administrativas para proteger tu
          información contra pérdida, robo o acceso no autorizado.
        </p>
        <p>
          <strong>
            Reddi no guarda la información completa de tus métodos de pago;
          </strong>{" "}
          estas son procesadas directamente por plataformas certificadas de pago
          seguro como <strong>Stripe y Azul</strong>.
        </p>
      </section>

      {/* 4. Terceros y servicios externos */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          4. Terceros y servicios externos
        </h2>
        <p className="mb-2">Podemos compartir ciertos datos con:</p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>
            <strong>Socios de entrega:</strong> para completar los envíos y
            confirmar entregas.
          </li>
          <li>
            <strong>Proveedores de pago:</strong> como{" "}
            <strong>Stripe y Azul</strong>, para procesar transacciones de
            manera segura.
          </li>
          <li>
            <strong>Servicios analíticos:</strong> como Google Analytics o
            herramientas internas que nos ayudan a entender y optimizar el uso
            de la app.
          </li>
        </ul>
        <p>
          Estos terceros están obligados a cumplir con políticas de privacidad y
          protección de datos equivalentes a las nuestras.
        </p>
      </section>

      {/* 5. Cookies y tecnologías similares */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          5. Cookies y tecnologías similares
        </h2>
        <p className="mb-2">Usamos cookies para:</p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Recordar tus preferencias de idioma o ubicación.</li>
          <li>Analizar el tráfico y mejorar el rendimiento del sitio.</li>
          <li>Ofrecerte promociones personalizadas o contenido relevante.</li>
        </ul>
        <p>
          Puedes ajustar tus preferencias de cookies en cualquier momento desde
          tu navegador o en la configuración de la app.
        </p>
      </section>

      {/* 6. Tus derechos */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">6. Tus derechos</h2>
        <p className="mb-2">Tienes derecho a:</p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Acceder, actualizar o eliminar tus datos personales.</li>
          <li>Retirar tu consentimiento para el uso de tus datos.</li>
          <li>Solicitar una copia de la información que tenemos sobre ti.</li>
        </ul>
        <p>
          Para ejercer estos derechos, escríbenos a{" "}
          <strong>[contacto@reddi.do]</strong> o mediante WhatsApp a{" "}
          <strong>[número Reddi]</strong>.
        </p>
      </section>

      {/* 7. Retención de datos */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">7. Retención de datos</h2>
        <p>
          Conservamos tu información solo durante el tiempo necesario para
          cumplir con los fines descritos en esta política o según lo requiera
          la ley.
        </p>
      </section>

      {/* 8. Actualizaciones a esta política */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          8. Actualizaciones a esta política
        </h2>
        <p className="mb-3">
          Podemos modificar esta Política de Privacidad ocasionalmente.
        </p>
        <p className="mb-3">
          Las actualizaciones se publicarán en nuestra pagina web con la fecha
          de la última revisión.
        </p>
        <p>
          El uso continuo de nuestros servicios implica la aceptación de los
          cambios.
        </p>
      </section>
    </main>
  );
}
