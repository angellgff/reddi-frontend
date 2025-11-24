"use server";

import { createClient } from "@/src/lib/supabase/server";
import { ValidatedCoupon } from "@/src/lib/store/checkoutSlice";

interface ValidateCouponResult {
    success: boolean;
    message: string;
    coupon?: ValidatedCoupon;
}

export async function validateCouponAction(
    code: string,
    subtotal: number
): Promise<ValidateCouponResult> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase.functions.invoke("validate-coupon", {
            body: { couponCode: code, subtotal },
        });

        if (error) throw new Error(error.message);

        if (data.valid) {
            return {
                success: true,
                message: data.message,
                coupon: data.coupon as ValidatedCoupon,
            };
        } else {
            return {
                success: false,
                message: data.message || "Cupón inválido",
            };
        }
    } catch (e) {
        console.error("Error validating coupon:", e);
        return {
            success: false,
            message: "Ocurrió un error al validar el cupón.",
        };
    }
}
