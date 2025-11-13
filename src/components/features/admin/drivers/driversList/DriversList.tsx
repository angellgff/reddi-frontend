import DriverListItem, { Driver } from "./DriverListItem";

export default function DriversList({ drivers }: { drivers: Driver[] }) {
  if (!drivers.length) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={8}
            className="px-6 py-6 text-center text-sm text-gray-500"
          >
            No hay repartidores disponibles
          </td>
        </tr>
      </tbody>
    );
  }
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {drivers.map((d) => (
        <DriverListItem key={d.id} driver={d} />
      ))}
    </tbody>
  );
}
