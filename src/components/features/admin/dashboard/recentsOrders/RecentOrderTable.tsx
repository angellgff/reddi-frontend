import CardShell from "../../CardShell";
import getRecentOrders from "@/src/lib/admin/data/dashboard/getRecentOrders";

const statusStyles: { [key: string]: string } = {
  delivered: "bg-green-100 text-green-700",
  out_for_delivery: "bg-blue-100 text-blue-700",
  preparing: "bg-yellow-100 text-yellow-700",
  pending: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
        statusStyles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function money(n: number) {
  return `$${(n || 0).toFixed(2)}`;
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `${days} d`;
}

export default async function RecentOrdersTable() {
  const orders = await getRecentOrders(10);
  return (
    <CardShell title="Pedidos Recientes">
      <div className="overflow-x-auto overflow-y-auto max-h-72">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase border-b">
            <tr>
              <th scope="col" className="px-4 py-3">
                ID
              </th>
              <th scope="col" className="px-4 py-3">
                Usuario
              </th>
              <th scope="col" className="px-4 py-3">
                Total
              </th>
              <th scope="col" className="px-4 py-3">
                Estado
              </th>
              <th scope="col" className="px-4 py-3">
                Tiempo
              </th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {orders.map((o) => (
              <tr key={o.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {o.id.split("-")[0]}
                </td>
                <td className="px-4 py-3 truncate max-w-[200px]">
                  {o.customerName || "—"}
                </td>
                <td className="px-4 py-3">{money(o.total_amount)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={(o.status as any) || "pending"} />
                </td>
                <td className="px-4 py-3">{timeAgo(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  );
}
