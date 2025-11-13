import CardShell from "../../CardShell";
import AdminMap from "./AdminMap";
import type { AdminMapData } from "@/src/lib/admin/data/dashboard/getMapData";

export default function MapCard({ data }: { data: AdminMapData }) {
  return (
    <CardShell title="Mapa de Operaciones (hoy)">
      <AdminMap data={data} />
    </CardShell>
  );
}
