export default function Page() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4 space-y-6">
      <h1 className="text-3xl font-bold">Políticas de seguridad para la transmisión de datos de tarjetas</h1>
      <p className="text-sm text-gray-700">Lineamientos para cifrado, almacenamiento temporal, tokenización y cumplimiento (ej. PCI-DSS). Sustituir por la política oficial.</p>
      <section className="space-y-4 text-sm text-gray-700">
        <p>1. Cifrado en tránsito: Protocolos TLS mínimos.</p>
        <p>2. Cifrado en reposo: Algoritmos y gestión de claves.</p>
        <p>3. Tokenización: Proceso y proveedor externo (si aplica).</p>
        <p>4. Auditoría y monitoreo: Logs, alertas y revisiones periódicas.</p>
      </section>
    </main>
  );
}
