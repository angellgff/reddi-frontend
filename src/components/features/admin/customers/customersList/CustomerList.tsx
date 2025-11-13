import CustomerListItem, { Customer } from "./CustomerListItem";

export default function CustomerList({ customers }: { customers: Customer[] }) {
  if (!customers.length) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={7}
            className="px-6 py-6 text-center text-sm text-gray-500"
          >
            No hay clientes disponibles
          </td>
        </tr>
      </tbody>
    );
  }
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {customers.map((c) => (
        <CustomerListItem key={c.id} customer={c} />
      ))}
    </tbody>
  );
}
