import React from "react";
// Importa los íconos que vayas a usar
import { Snowflake, Flame, AlertCircle, Leaf, Tag } from "lucide-react";

// Mapeo: String de Base de Datos -> Componente React
const ICON_MAP: Record<string, any> = {
  snowflake: Snowflake,
  fire: Flame,
  alert: AlertCircle,
  leaf: Leaf,
  // 'nombre_en_bd': ComponenteImportado
};

interface TagIconProps {
  iconKey: string | null;
  color?: string;
  size?: number;
}

export const TagIcon = ({
  iconKey,
  color = "#000",
  size = 16,
}: TagIconProps) => {
  // Si la key no existe o es null, usa 'Tag' por defecto
  const IconComponent = ICON_MAP[iconKey || ""] || Tag;

  return <IconComponent color={color} size={size} />;
};
