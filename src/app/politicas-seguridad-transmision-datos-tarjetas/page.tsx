export default function Page() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-8 text-gray-800">
      {/* Botón de Volver */}
      <a href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
        &larr; Volver
      </a>

      <h1 className="text-4xl font-bold border-b pb-4">
        Políticas de seguridad para la transmisión de datos de tarjetas
      </h1>
      <p className="text-sm text-gray-500">
        Última actualización: 18 / 11 / 2025
      </p>

      {/* 1. Introducción */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">1. Introducción</h2>
        <p className="mb-4">
          Reddi se compromete a proteger la información financiera de{" "}
          <strong>usuarios</strong> y <strong>comercios</strong>, utilizando
          protocolos de seguridad que cumplen con estándares internacionales y
          las normativas bancarias de la República Dominicana utilizadas por{" "}
          <strong>Azul</strong>.
        </p>
        <p className="mb-4">
          Todos los pagos procesados en Reddi son manejados por{" "}
          <strong>proveedores certificados PCI DSS Nivel 1</strong>, incluyendo{" "}
          <strong>Azul</strong> y proveedores equivalentes.
        </p>
        <p>
          <strong>
            Reddi no almacena, procesa ni maneja directamente información
            completa de tarjetas.
          </strong>
        </p>
      </section>

      {/* 2. Alcance */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">2. Alcance</h2>
        <p className="mb-2">Esta política aplica a:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Todas las transacciones procesadas mediante Azul, Stripe o cualquier
            proveedor PCI DSS Nivel 1.
          </li>
          <li>Usuarios que agregan métodos de pago.</li>
          <li>Comercios que reciben pagos a través de Reddi.</li>
          <li>
            Transmisión y tratamiento de datos de tarjetas en todas las zonas
            operativas presentes y futuras.
          </li>
        </ul>
      </section>

      {/* 3. Cumplimiento Normativo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">3. Cumplimiento Normativo</h2>
        <p>Reddi opera bajo:</p>
        <div>
          <h3 className="text-xl font-semibold mb-2">3.1. PCI DSS Nivel 1</h3>
          <p>
            Todos los datos se transmiten y procesan bajo el estándar global
            utilizado por Azul y Stripe.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            3.2. Normativas del Banco Popular Dominicano (Azul)
          </h3>
          <p className="mb-2">Azul exige:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Tokenización obligatoria</li>
            <li>No almacenamiento de datos sensibles</li>
            <li>Validación de transacciones en territorio dominicano</li>
            <li>Fraud scoring local e internacional</li>
            <li>Procesamiento bajo infraestructura bancaria certificada</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            3.3. Regulaciones de la Superintendencia de Bancos (SB)
          </h3>
          <p>
            Cuando apliquen, transacciones se ajustarán a normas nacionales de
            seguridad financiera.
          </p>
        </div>
      </section>

      {/* 4. Principios de Seguridad */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">4. Principios de Seguridad</h2>
        <div>
          <h3 className="text-xl font-semibold mb-2">4.1. No almacenamiento</h3>
          <p className="mb-2">Reddi no almacena:</p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Número completo de tarjeta</li>
            <li>CVV</li>
            <li>Fecha de expiración</li>
            <li>Datos sensibles del titular</li>
          </ul>
          <p>
            Esto cumple tanto con PCI DSS como con las reglas de Azul y Stripe.
          </p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            4.2. Tokenización (Azul + Stripe)
          </h3>
          <p className="mb-2">
            El sistema convierte los datos de tarjeta en{" "}
            <strong>tokens encriptados</strong>, usados en transacciones futuras
            sin exponer información real.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Azul tokeniza la tarjeta según los estándares dominicanos.</li>
            <li>Stripe tokeniza usando infraestructura global.</li>
            <li>Ningún token puede usarse fuera del entorno autorizado.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">4.3. Encriptación</h3>
          <p className="mb-2">La transmisión de datos utiliza:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>TLS 1.2+</strong>
            </li>
            <li>Certificados SSL actualizados</li>
            <li>
              Algoritmos criptográficos aprobados por PCI DSS, Azul y Stripe.
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            4.4. 3D Secure / Verified by Visa / Mastercard SecureCode
          </h3>
          <p className="mb-2">
            Azul requiere <strong>autenticación adicional (3DS)</strong> para
            reducir fraude en:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Tarjetas emitidas en RD</li>
            <li>Transacciones sospechosas</li>
            <li>Operaciones de alto valor</li>
          </ul>
          <p>Reddi cumple este proceso automáticamente a través del gateway.</p>
        </div>
      </section>

      {/* 5. Captura y Transmisión de Datos */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">
          5. Captura y Transmisión de Datos
        </h2>
        <div>
          <h3 className="text-xl font-semibold mb-2">5.1. Captura</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>
              El formulario de pago es proporcionado por Azul o Stripe mediante
              una interfaz de pago segura y alojada directamente por el
              proveedor.
            </li>
            <li>
              Reddi <strong>nunca recibe</strong> datos de tarjetas en sus
              servidores.
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">5.2. Transmisión</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Los datos se envían directamente al proveedor de pagos.</li>
            <li>
              La información se cifra localmente y durante toda la transmisión.
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">5.3. Validación</h3>
          <p className="mb-2">Azul realiza validaciones como:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>AVS (cuando aplica)</li>
            <li>3D Secure</li>
            <li>Fraud Score Azul (motor local)</li>
            <li>Autorización bancaria en RD</li>
          </ul>
        </div>
      </section>

      {/* 6. Almacenamiento */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">6. Almacenamiento</h2>
        <p className="mb-2">Reddi sólo puede almacenar:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Últimos 4 dígitos</li>
          <li>Tipo de tarjeta</li>
          <li>Token generado</li>
          <li>Estado del método de pago</li>
        </ul>
        <p>
          Esto está completamente alineado con Azul, Stripe y los estándares PCI
          DSS.
        </p>
      </section>

      {/* 7. Acceso Interno y Control */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          7. Acceso Interno y Control
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Nadie en Reddi (incluyendo empleados, repartidores o comercios)
            tiene acceso a datos completos.
          </li>
          <li>
            Accesos administrativos están protegidos con{" "}
            <strong>2FA/MFA</strong>.
          </li>
          <li>
            Se realizan auditorías periódicas junto a los proveedores de pago.
          </li>
        </ul>
      </section>

      {/* 8. Prevención y Detección de Fraude */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mb-3">
          8. Prevención y Detección de Fraude
        </h2>
        <div>
          <p className="font-semibold mb-2">Automático (Azul + Stripe):</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Motor antifraude Azul local + filtros internacionales</li>
            <li>3D Secure</li>
            <li>IP & device risk scoring</li>
            <li>Detección de patrones inusuales</li>
            <li>Bloqueo de tarjetas comprometidas</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Manual (Reddi):</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Revisión de disputas</li>
            <li>Confirmaciones con comercios</li>
            <li>Validación de actividad sospechosa</li>
            <li>Soporte local</li>
          </ul>
        </div>
      </section>

      {/* 9. Responsabilidades del Usuario */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          9. Responsabilidades del Usuario
        </h2>
        <p className="mb-2">Los usuarios deben:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Usar redes seguras</li>
          <li>Mantener su dispositivo actualizado</li>
          <li>Reportar transacciones sospechosas</li>
          <li>No compartir métodos de pago</li>
        </ul>
      </section>

      {/* 10. Responsabilidades del Comercio */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          10. Responsabilidades del Comercio
        </h2>
        <p className="mb-2">Los comercios deben:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>No solicitar pagos o datos de tarjetas fuera de Reddi</li>
          <li>Reportar actividades sospechosas</li>
          <li>Mantener información de su negocio actualizada</li>
          <li>
            Cumplir con las políticas de seguridad y procesamiento establecidas
            por Reddi, las cuales se basan en los requisitos de{" "}
            <strong>Azul, Stripe y los estándares PCI DSS</strong>.
          </li>
        </ul>
      </section>

      {/* 11. Incidentes de Seguridad */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          11. Incidentes de Seguridad
        </h2>
        <p className="mb-2">En caso de detectar un incidente:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Reddi activará su{" "}
            <strong>Protocolo de Respuesta a Incidentes</strong>.
          </li>
          <li>
            Se notificará a los usuarios, comercios y a Azul/Stripe según la
            ley.
          </li>
          <li>Se aislará la actividad sospechosa.</li>
          <li>Se tomarán medidas correctivas con el proveedor de pagos.</li>
        </ol>
      </section>

      {/* 12. Modificaciones */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">12. Modificaciones</h2>
        <p className="mb-2">Reddi puede actualizar esta política cuando:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Cambien los estándares PCI DSS</li>
          <li>Azul o Stripe modifiquen sus requisitos</li>
          <li>Ingresen nuevos proveedores de pago</li>
          <li>Nuevas zonas operativas lo requieran</li>
        </ul>
        <p>Se avisará a usuarios y comercios antes de aplicar cambios.</p>
      </section>
    </main>
  );
}
