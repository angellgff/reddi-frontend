"use server";

import { createClient } from "@/src/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type CouponStatus = "active" | "inactive" | "expired";
type DiscountType = "percentage" | "fixed_amount";

export async function createCoupon(formData: FormData) {
  const supabase = await createClient();

  const code = (formData.get("code") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = (formData.get("status") as CouponStatus) || "inactive";
  const discount_type =
    (formData.get("discount_type") as DiscountType) || "percentage";
  const discount_value = Number(formData.get("discount_value") || 0);
  const minimum_purchase_amount = Number(
    formData.get("minimum_purchase_amount") || 0
  );
  const start_date_raw = formData.get("start_date") as string;
  const end_date_raw = formData.get("end_date") as string;

  const start_date = start_date_raw
    ? new Date(start_date_raw + "T00:00:00Z").toISOString()
    : new Date().toISOString();
  const end_date = end_date_raw
    ? new Date(end_date_raw + "T23:59:59Z").toISOString()
    : new Date().toISOString();

  if (!code || !title) return;

  const { error } = await supabase.from("coupons").insert({
    code,
    title,
    description,
    status,
    discount_type,
    discount_value,
    minimum_purchase_amount,
    start_date,
    end_date,
  });

  if (error) {
    console.error("create coupon error", error);
  } else {
    revalidatePath("/admin/coupons");
    redirect("/admin/coupons");
  }
}

export async function updateCoupon(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const code = (formData.get("code") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const status = (formData.get("status") as CouponStatus) || "inactive";
  const discount_type =
    (formData.get("discount_type") as DiscountType) || "percentage";
  const discount_value = Number(formData.get("discount_value") || 0);
  const minimum_purchase_amount = Number(
    formData.get("minimum_purchase_amount") || 0
  );
  const start_date_raw = formData.get("start_date") as string;
  const end_date_raw = formData.get("end_date") as string;

  const start_date = start_date_raw
    ? new Date(start_date_raw + "T00:00:00Z").toISOString()
    : new Date().toISOString();
  const end_date = end_date_raw
    ? new Date(end_date_raw + "T23:59:59Z").toISOString()
    : new Date().toISOString();

  if (!id || !code || !title) return;

  const { error } = await supabase
    .from("coupons")
    .update({
      code,
      title,
      description,
      status,
      discount_type,
      discount_value,
      minimum_purchase_amount,
      start_date,
      end_date,
    })
    .eq("id", id);

  if (error) {
    console.error("update coupon error", error);
  } else {
    revalidatePath("/admin/coupons");
    redirect("/admin/coupons");
  }
}

export async function deleteCoupon(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) {
    console.error("delete coupon error", error);
  } else {
    revalidatePath("/admin/coupons");
  }
}
