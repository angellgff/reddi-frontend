import { API_DELAY } from "@/src/lib/type";
import { getRandomNumberFrom1To10 } from "@/src/lib/utils";
import { BusinessFormData } from "@/src/components/features/admin/partners/editPartner/PartnerProfile";

const databaseSimulation: Array<{
  id: string;
  businessData: BusinessFormData;
}> = [
  {
    id: "12345",
    businessData: {
      name: "Pizza Express",
      isPhysical: true,
      address: "Calle Falsa 123, Springfield",
      category: "restaurant",
      phone: "+1-555-1234",
      email: "contacto@pizzaexpress.com",
      hours: {
        monday: { active: true, opens: "11:00:00", closes: "23:00:00" },
        tuesday: { active: true, opens: "11:00:00", closes: "23:00:00" },
        wednesday: { active: true, opens: "11:00:00", closes: "23:00:00" },
        thursday: { active: true, opens: "11:00:00", closes: "23:00:00" },
        friday: { active: true, opens: "11:00:00", closes: "00:00:00" },
        saturday: { active: true, opens: "11:00:00", closes: "00:00:00" },
      },
      profileState: true,
      logo: "/sushi-carne.svg",
      document: null,
    },
  },
  {
    id: "12346",
    businessData: {
      name: "SuperBurger",
      isPhysical: true,
      address: "Avenida Siempreviva 742, Shelbyville",
      category: "restaurant",
      phone: "+1-555-5678",
      email: "info@superburger.com",
      hours: {
        monday: { active: true, opens: "10:00:00", closes: "22:00:00" },
        tuesday: { active: true, opens: "10:00:00", closes: "22:00:00" },
        wednesday: { active: true, opens: "10:00:00", closes: "22:00:00" },
        thursday: { active: true, opens: "10:00:00", closes: "22:00:00" },
        friday: { active: true, opens: "10:00:00", closes: "23:00:00" },
        saturday: { active: true, opens: "10:00:00", closes: "23:00:00" },
      },
      profileState: false,
      logo: null,
      document: null,
    },
  },
  {
    id: "12347",
    businessData: {
      name: "Café del Sol",
      isPhysical: true,
      address: "Plaza Mayor 1, Capital City",
      category: "restaurant",
      phone: "+1-555-8765",
      email: "hola@cafedelsol.es",
      hours: {
        monday: { active: true, opens: "08:00:00", closes: "20:00:00" },
        tuesday: { active: true, opens: "08:00:00", closes: "20:00:00" },
        wednesday: { active: true, opens: "08:00:00", closes: "20:00:00" },
        thursday: { active: true, opens: "08:00:00", closes: "20:00:00" },
        friday: { active: true, opens: "08:00:00", closes: "21:00:00" },
        saturday: { active: true, opens: "09:00:00", closes: "21:00:00" },
      },
      profileState: true,
      logo: null,
      document: null,
    },
  },
  {
    id: "12348",
    businessData: {
      name: "Tacos el Jefe",
      isPhysical: true,
      address: "Calle Luna, Esquina Sol, Ciudad de México",
      category: "restaurant",
      phone: "+52-55-1234-5678",
      email: "contacto@tacoseljefe.com.mx",
      hours: {
        monday: { active: false, opens: "09:00:00", closes: "18:00:00" },
        tuesday: { active: true, opens: "12:00:00", closes: "23:00:00" },
        wednesday: { active: true, opens: "12:00:00", closes: "23:00:00" },
        thursday: { active: true, opens: "12:00:00", closes: "23:00:00" },
        friday: { active: true, opens: "12:00:00", closes: "01:00:00" },
        saturday: { active: true, opens: "12:00:00", closes: "01:00:00" },
      },
      profileState: false,
      logo: null,
      document: null,
    },
  },
  {
    id: "12349",
    businessData: {
      name: "Sushi Time",
      isPhysical: true,
      address: "Avenida del Sushi 42, Tokio",
      category: "restaurant",
      phone: "+81-3-1234-5678",
      email: "info@sushitime.jp",
      hours: {
        monday: { active: true, opens: "12:00:00", closes: "15:00:00" },
        tuesday: { active: true, opens: "12:00:00", closes: "15:00:00" },
        wednesday: { active: true, opens: "12:00:00", closes: "15:00:00" },
        thursday: { active: true, opens: "12:00:00", closes: "15:00:00" },
        friday: { active: true, opens: "12:00:00", closes: "15:00:00" },
        saturday: { active: true, opens: "12:00:00", closes: "22:00:00" },
      },
      profileState: true,
      logo: null,
      document: null,
    },
  },
];

// Función para traer datos de un restaurante por ID para la página de edición de aliado

export default async function getPartnerDataById(id: string) {
  await new Promise((resolve) =>
    setTimeout(resolve, API_DELAY * getRandomNumberFrom1To10())
  );

  // Se hace la búsqueda por ID en la "base de datos" simulada
  const partner = databaseSimulation.find((entry) => entry.id === id);
  // Si se encuentra (que lo encontrara siempre en este ejemplo), se retornan los datos del negocio
  if (!partner) {
    // Error en caso de fallar la búsqueda
    throw new Error("Aliado no encontrado");
  }
  return partner.businessData;
}
