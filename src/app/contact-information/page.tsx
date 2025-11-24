"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useState } from "react";

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    console.log("Form submitted:", formData);
    alert("Gracias por contactarnos. Nos pondremos en contacto contigo pronto.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <main className="max-w-4xl mx-auto py-12 px-4 space-y-8 text-gray-800">
      {/* Botón de Volver */}
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 hover:underline inline-block"
      >
        &larr; Volver
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Información de Contacto */}
        <section className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Información de Contacto</h1>
            <h2 className="text-xl text-gray-600">Servicio al Cliente</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Correo electrónico</h3>
              <p className="text-gray-600">reddi.technology.com</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Teléfono</h3>
              <p className="text-gray-600">+1 (912) 228-0053</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Dirección física</h3>
              <address className="text-gray-600 not-italic">
                REDDI SRL<br />
                Calle 7ma No6<br />
                Preconca<br />
                La Romana 22000<br />
                República Dominicana
              </address>
            </div>
          </div>
        </section>

        {/* Formulario de Contacto */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Envíanos un mensaje</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="¿En qué podemos ayudarte?"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Enviar Mensaje
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
