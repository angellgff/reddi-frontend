export default function Page() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-8 text-gray-800">
      {/* Botón de Volver */}
      <a href="/" className="text-blue-600 hover:text-blue-800 hover:underline">
        &larr; Volver
      </a>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">
          (Documento Interno Oficial)
        </p>
        <h1 className="text-4xl font-bold">
          Protocolo de Respuesta a Incidentes (IRP)
        </h1>
        <p className="text-sm text-gray-500 mt-4 border-b pb-4">
          Última actualización: 18 / 11 / 2025
        </p>
      </div>

      {/* 1. Propósito */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">1. Propósito</h2>
        <p className="mb-4">
          El objetivo de este Protocolo de Respuesta a Incidentes es establecer
          un proceso claro, ordenado y efectivo para identificar, analizar,
          contener y resolver cualquier incidente de seguridad relacionado con:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Datos de pago</li>
          <li>Cuentas de usuarios</li>
          <li>Cuentas de comercios</li>
          <li>Operaciones de la plataforma</li>
          <li>Intentos de fraude</li>
          <li>Vulnerabilidades del sistema</li>
        </ul>
        <p className="mb-2">Este protocolo está alineado con:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>PCI DSS (Payment Card Industry Data Security Standard)</li>
          <li>Requisitos de seguridad de Azul Dominicana</li>
          <li>Requisitos de seguridad de Stripe</li>
          <li>Buenas prácticas globales del sector financiero y tecnológico</li>
        </ul>
      </section>

      {/* 2. Alcance */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">2. Alcance</h2>
        <p className="mb-2">Este protocolo aplica a:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Todo el equipo interno de Reddi</li>
          <li>Sistemas administrativos e internos</li>
          <li>Paneles de comercios y repartidores</li>
          <li>Flujos de pago procesados por Azul o Stripe</li>
          <li>Información de usuarios almacenada por Reddi (no sensible)</li>
          <li>
            Cualquier actividad sospechosa o maliciosa detectada en la
            plataforma
          </li>
        </ul>
      </section>

      {/* 3. ¿Qué se considera un incidente de seguridad? */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mb-3">
          3. ¿Qué se considera un incidente de seguridad?
        </h2>
        <p>Un "incidente de seguridad” puede incluir, entre otros:</p>
        <div>
          <h3 className="text-lg font-semibold">Accesos no autorizados</h3>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Intento sospechoso de acceso al panel administrativo</li>
            <li>Robo de credenciales</li>
            <li>
              Intentos de acceso indebido por parte de comercios o terceros
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Problemas relacionados con pagos
          </h3>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Transacciones fraudulentas</li>
            <li>Múltiples fallos de pago consecutivos</li>
            <li>Actividad inusual con reembolsos o disputas</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Comportamientos anómalos del sistema
          </h3>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Uso indebido del API</li>
            <li>Actividad de bots</li>
            <li>Manipulación de datos</li>
            <li>Intentos de alterar pedidos o registros</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Amenazas externas</h3>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Phishing</li>
            <li>Ingeniería social</li>
            <li>Tarjetas reportadas como comprometidas</li>
            <li>Secuestro de cuenta de un comercio</li>
          </ul>
        </div>
      </section>

      {/* 4. Ciclo de Respuesta a Incidentes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">
          4. Ciclo de Respuesta a Incidentes
        </h2>
        <p>
          El proceso de Reddi sigue 4 etapas principales, basadas en protocolos
          utilizados por Azul y Stripe.
        </p>

        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Etapa 1 — Detección</h3>
          <p className="mb-2">El incidente puede detectarse mediante:</p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Alertas automáticas de Azul o Stripe</li>
            <li>Registros del backend (logs)</li>
            <li>Notificaciones del sistema</li>
            <li>Informes de usuarios o comercios</li>
            <li>Comportamientos anormales detectados por el equipo</li>
          </ul>
          <p>
            <strong>Responsable:</strong> Miembro designado del equipo de Reddi
          </p>
          <p>
            <strong>Herramientas:</strong> Panel Reddi, panel de Azul, panel de
            Stripe, logs internos.
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Etapa 2 — Contención</h3>
          <p className="mb-2">Acciones inmediatas para reducir el impacto:</p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>
              Suspender temporalmente la cuenta afectada (usuario/comercio)
            </li>
            <li>Congelar pedidos o transacciones relacionadas</li>
            <li>Forzar cambio de contraseña o cierre de sesión</li>
            <li>Bloquear IPs o sesiones sospechosas</li>
            <li>
              Desactivar temporalmente accesos administrativos si es necesario
            </li>
          </ul>
          <p>
            <strong>Responsable:</strong> Miembro designado del equipo de Reddi
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Etapa 3 — Investigación</h3>
          <p className="mb-2">Identificar:</p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Qué ocurrió</li>
            <li>Cómo ocurrió</li>
            <li>Qué cuentas o sistemas fueron impactados</li>
            <li>Si está relacionado con pagos (Azul/Stripe)</li>
            <li>Evidencias necesarias</li>
          </ul>
          <p className="mb-2">La investigación debe incluir:</p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Logs detallados</li>
            <li>Historial de accesos</li>
            <li>Registros de transacciones</li>
            <li>Reportes de usuarios</li>
            <li>Alertas de Azul o Stripe</li>
          </ul>
          <p>
            <strong>Responsable:</strong> Miembro designado del equipo de Reddi
          </p>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="text-xl font-bold mb-2">Etapa 4 — Resolución</h3>
          <p className="mb-2">Acciones para cerrar el incidente:</p>
          <ul className="list-disc list-inside space-y-1 mb-3">
            <li>Restaurar servicios y accesos</li>
            <li>Revertir acciones no autorizadas</li>
            <li>
              Emitir reembolsos a través de Azul/Stripe cuando corresponda
            </li>
            <li>Actualizar reglas de seguridad (bloqueos, filtros, etc.)</li>
            <li>Reactivar cuentas suspendidas (si procede)</li>
            <li>Documentar el incidente y sus causas</li>
          </ul>
          <p>
            <strong>Responsable:</strong> Miembro designado del equipo de Reddi
          </p>
        </div>
      </section>

      {/* 5. Notificaciones */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">5. Notificaciones</h2>
        <p className="mb-4">Según la gravedad del incidente:</p>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Notificaciones Internas</h3>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>El equipo responsable de seguridad y operaciones de Reddi</li>
              <li>
                Los miembros designados del equipo de Reddi involucrados en la
                gestión del incidente
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Notificaciones Externas</h3>
            <p className="mb-2">Solo si es necesario:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Usuarios afectados</li>
              <li>Comercios afectados</li>
              <li>Azul / Stripe (obligatorio si involucra pagos o fraude)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Cumplimiento legal en RD</h3>
            <p className="mb-2">En incidentes relacionados con pagos:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Azul es quien reporta a Banco Popular o la Superintendencia de
                Bancos si aplica.
              </li>
              <li>Reddi coopera según el procedimiento de Azul.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Documentación del Incidente */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          6. Documentación del Incidente
        </h2>
        <p className="mb-2">Cada incidente debe registrarse con:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Fecha y hora</li>
          <li>Descripción del incidente</li>
          <li>Sistemas afectados</li>
          <li>Acciones tomadas</li>
          <li>Evidencia recopilada</li>
          <li>Notificaciones realizadas</li>
          <li>Análisis de causa raíz</li>
          <li>Medidas preventivas implementadas</li>
        </ul>
        <p>
          Documentos guardados por <strong>mínimo 12 meses</strong>.
        </p>
      </section>

      {/* 7. Medidas de Prevención */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          7. Medidas de Prevención
        </h2>
        <p className="mb-2">
          Para evitar futuros incidentes, Reddi implementa:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Acceso administrativo protegido con{" "}
            <strong>MFA (autenticación multifactor)</strong>
          </li>
          <li>Uso estricto de roles y permisos</li>
          <li>Revisión periódica de logs</li>
          <li>
            Actualizaciones continuas según requerimientos de Azul y Stripe
          </li>
          <li>HTTPS obligatorio</li>
          <li>No almacenamiento de datos sensibles</li>
          <li>Uso de tokenización para métodos de pago</li>
          <li>Respuesta inmediata a alertas antifraude</li>
        </ul>
      </section>

      {/* 8. Matriz de Escalamiento */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mb-3">
          8. Matriz de Escalamiento
        </h2>
        <div>
          <h3 className="text-lg font-semibold">Incidente de Baja Severidad</h3>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Errores menores en pagos</li>
            <li>Disputas no relacionadas a fraude</li>
            <li>Problemas de UI/UX</li>
          </ul>
          <p className="mt-2">
            <strong>Responsables:</strong> Miembro designado del equipo de Reddi
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            Incidente de Severidad Media
          </h3>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Inicio de actividad sospechosa</li>
            <li>Múltiples fallos de pago</li>
            <li>Comportamiento extraño en cuentas</li>
          </ul>
          <p className="mt-2">
            <strong>Responsables:</strong> Miembro designado del equipo de Reddi
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Incidente de Alta Severidad</h3>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Compromiso de cuentas administrativas</li>
            <li>Secuestro de cuenta de comercio</li>
            <li>Fraude confirmado</li>
            <li>Manipulación de datos</li>
          </ul>
          <p className="mt-2">
            <strong>Responsables:</strong> Miembro designado del equipo de Reddi
          </p>
        </div>
      </section>

      {/* 9. Cierre del Incidente */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">9. Cierre del Incidente</h2>
        <p className="mb-2">Un incidente se considera cerrado cuando:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>La amenaza ha sido eliminada</li>
          <li>Los sistemas están restaurados</li>
          <li>Los usuarios/comercios han sido notificados</li>
          <li>Se documentó la causa raíz</li>
          <li>Se implementaron mejoras de prevención</li>
        </ul>
      </section>

      {/* 10. Revisión y Mejora Continua */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          10. Revisión y Mejora Continua
        </h2>
        <p className="mb-2">
          Mensualmente, el equipo designado de Reddi revisa:
        </p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Incidentes del mes</li>
          <li>Causas identificadas</li>
          <li>Ajustes de seguridad</li>
          <li>Procedimientos de soporte</li>
          <li>Reglas antifraude</li>
        </ul>
        <p>
          Se realiza una <strong>revisión completa anual</strong>.
        </p>
      </section>
    </main>
  );
}
