"use server";

export type OrderDetails = {
  orderId: number;
  estimatedTime: string;
  store: {
    name: string;
    logoUrl: string;
  };
  items: {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }[];
  costs: {
    delivery: number;
    taxes: number;
  };
  address: {
    title: string;
    details: string;
  };
};

const orderData: OrderDetails[] = [
  {
    orderId: 22341,
    estimatedTime: "30-40 min",
    store: {
      name: "La Pizzería Italiana",
      logoUrl: "/lapizzeria.svg",
    },
    items: [
      {
        id: 1,
        name: "Leche Entera",
        description: "2 Litros",
        price: 437,
        quantity: 1,
        imageUrl: "/lecheentera.svg",
      },
      {
        id: 2,
        name: "Pan Integral",
        description: "2 Litros",
        price: 437,
        quantity: 1,
        imageUrl: "/panintegral.svg",
      },
    ],
    costs: {
      delivery: 50,
      taxes: 87,
    },
    address: {
      title: "Villa Mediterránea",
      details:
        "Villa número 203, cerca a la piscina principal, frente al jardín azul",
    },
  },
  {
    orderId: 22342,
    estimatedTime: "30-40 min",
    store: {
      name: "Pollos pollongos",
      logoUrl: "/images/store-logo.png",
    },
    items: [
      {
        id: 1,
        name: "Leche Entera",
        description: "2 Litros",
        price: 437,
        quantity: 1,
        imageUrl: "/images/milk.png",
      },
    ],
    costs: {
      delivery: 1000,
      taxes: 50,
    },
    address: {
      title: "Villa Mediterránea",
      details:
        "Villa número 203, cerca a la piscina principal, frente al jardín azul",
    },
  },
  {
    orderId: 22343,
    estimatedTime: "30-40 min",
    store: {
      name: "Helados",
      logoUrl: "/images/store-logo.png",
    },
    items: [
      {
        id: 1,
        name: "Leche Entera",
        description: "2 Litros",
        price: 437,
        quantity: 1,
        imageUrl: "/images/milk.png",
      },
    ],
    costs: {
      delivery: 50,
      taxes: 87,
    },
    address: {
      title: "Villa Mediterránea",
      details:
        "Villa número 203, cerca a la piscina principal, frente al jardín azul",
    },
  },
];

export default async function getOrderHeaderData(id: string) {
  const order = orderData.find((order) => order.orderId === Number(id));
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
}
