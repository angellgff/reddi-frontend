"use server";

import { createClient } from "@/src/lib/supabase/server";
import { Banner } from "@/src/components/features/admin/banners/BannersTable";

interface GetBannersDataParams {
  page?: number;
  fromDate?: string;
  toDate?: string;
  status?: string; // 'active' | 'inactive' | ''
}

export interface GetBannersResult {
  banners: Banner[];
  totalCount: number;
}

const PAGE_SIZE = 5;

export default async function getBannersData({
  page = 1,
  fromDate,
  toDate,
  status,
}: GetBannersDataParams): Promise<GetBannersResult> {
  const supabase = await createClient();

  // Basic query
  let query = supabase
    .from("banners")
    .select(
      `
      id,
      title,
      image_url,
      start_date,
      end_date,
      is_active,
      category_id,
      categories (
        name
      ),
      banner_clicks (
        count
      )
    `,
      { count: "exact" }
    );

  // Filters
  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  // Date Range Filtering
  // Assuming start_date should be >= fromDate and/or <= toDate
  // Adjust logic based on exact business requirement. 
  // Common pattern: if fromDate provided, start_date >= fromDate
  if (fromDate) {
    query = query.gte("start_date", fromDate);
  }
  if (toDate) {
    query = query.lte("end_date", toDate);
  }

  // Pagination
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  query = query.range(from, to).order("created_at", { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching banners:", error);
    return { banners: [], totalCount: 0 };
  }

  // Map to UI Banner type
  const banners: Banner[] = (data || []).map((row: any) => {
    // Determine status string
    let currentStatus: "active" | "inactive" = "inactive";
    if (row.is_active) {
       // Ideally we also check dates vs now, but strict is_active flag is safer for admin MVP
       currentStatus = "active";
    }

    // Format Date Range
    // Example: "12/02/25 - 12/03/25"
    // Helper to format ISO string to DD/MM/YY
    const formatDate = (isoString: string) => {
      if (!isoString) return "";
      const d = new Date(isoString);
      return d.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    };
    
    const dateRange = `${formatDate(row.start_date)} - ${formatDate(row.end_date)}`;

    // Clicks count from relation
    const clicks = row.banner_clicks?.[0]?.count || 0;

    return {
      id: row.id,
      image: row.image_url,
      title: row.title,
      category: row.categories?.name || "Sin categoría",
      clicks: clicks,
      dateRange: dateRange,
      status: currentStatus,
    };
  });

  return {
    banners,
    totalCount: count || 0,
  };
}
