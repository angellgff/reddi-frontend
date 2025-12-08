import PricingRulesClient, { type PricingRuleRow } from "@/src/components/features/admin/pricing-rules/PricingRulesClient";
import { createClient } from "@/src/lib/supabase/server";

export default async function AdminPricingRulesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("delivery_pricing_rules")
    .select("*")
    .order("created_at", { ascending: false });

  const rows: PricingRuleRow[] = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    base_fee: c.base_fee,
    fee_per_kilometer: c.fee_per_kilometer,
    min_fee: c.min_fee,
    max_fee: c.max_fee,
    is_active: c.is_active,
    created_at: c.created_at,
  }));

  return <PricingRulesClient rules={rows} />;
}
