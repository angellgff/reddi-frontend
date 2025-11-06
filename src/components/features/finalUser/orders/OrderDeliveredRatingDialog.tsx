"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import StarIcon from "@/src/components/icons/StarIcon";

interface Props {
  orderId: string;
  partnerId: string | null | undefined;
  userId: string | null | undefined; // current logged user id
  delivered: boolean; // whether order status is delivered
}

// Fallback lengths & copy pulled from Figma spec provided by user.
// We keep styling via Tailwind approximations instead of raw absolute px positioning.
export default function OrderDeliveredRatingDialog({
  orderId,
  partnerId,
  userId,
  delivered,
}: Props) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Auto-open when delivered & not yet rated.
  useEffect(() => {
    async function checkExisting() {
      if (!delivered || !orderId || !userId) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ratings")
        .select("id")
        .eq("order_id", orderId)
        .eq("user_id", userId)
        .maybeSingle();
      if (!error && !data) {
        setOpen(true);
      }
    }
    checkExisting();
  }, [delivered, orderId, userId]);

  async function handleSubmit() {
    if (!userId || !partnerId) {
      setError("Faltan datos para registrar la calificación.");
      return;
    }
    if (stars < 1) {
      setError("Selecciona al menos 1 estrella.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Prefer API route to centralize validation and server auth
      const resp = await fetch("/api/ratings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          partnerId,
          ratingValue: stars,
          comment: comment.trim() || undefined,
        }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || "Error guardando calificación");
      }
      setSuccess(true);
      // Close after short delay
      setTimeout(() => setOpen(false), 1200);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e ?? "");
      setError(msg || "Error guardando calificación");
    } finally {
      setSubmitting(false);
    }
  }

  if (!delivered) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[500px] p-10 rounded-[30px] flex flex-col items-center gap-5">
        <DialogHeader className="flex flex-col items-center gap-4 w-full">
          <div className="h-[59px] w-[53px] rounded-lg flex items-center justify-center">
            <svg
              width="53"
              height="59"
              viewBox="0 0 53 59"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M52.8108 22.0528C52.5165 21.1457 51.8677 20.3999 50.9714 19.943C49.0317 18.9553 47.0853 19.5197 45.8814 21.4212C45.0453 22.7448 44.2092 24.0751 43.3731 25.3988C42.0621 27.4816 40.7512 29.5645 39.4268 31.6406C39.2262 31.9564 38.8048 32.6149 38.4971 32.7896C38.4235 32.8299 38.3232 32.8702 38.2295 32.9038C38.2228 32.8635 38.2161 32.8299 38.2228 32.8097C38.3566 31.6003 38.6242 30.3976 38.9118 29.1278C39.0188 28.6574 39.1191 28.1938 39.2195 27.7235L39.8482 24.6933C40.8783 19.7414 41.9083 14.7963 42.9517 9.85122C43.6005 6.7874 42.0086 5.59816 41.0053 5.15471C39.8616 4.65751 38.2763 4.76501 37.2396 5.41675C36.3968 5.94082 35.8082 6.93522 35.4805 8.37978C34.9253 10.8322 34.417 13.298 33.9086 15.7639L33.0391 19.9565H33.0525L32.8184 21.1054C32.3034 23.5981 31.795 26.0908 31.2532 28.5768C31.2332 28.6642 31.2131 28.7515 31.1863 28.8321C31.1863 28.6776 31.1796 28.5096 31.173 28.3484L30.979 17.3025C30.9054 13.0024 30.8318 8.70901 30.7516 4.40891C30.7181 2.57465 29.9088 1.06962 28.5978 0.377571C27.5009 -0.200255 26.2367 -0.112909 25.1331 0.62617C23.8622 1.47275 23.1733 3.28014 23.1666 4.54329C23.1532 8.54776 23.2335 12.6127 23.3138 16.5433L23.4074 21.3338C23.4208 21.9184 23.4341 22.5029 23.4341 23.0875C19.2069 20.9038 14.9194 20.588 10.6788 22.1603C8.59864 22.9262 6.73919 24.223 5.16066 25.3719C3.7159 26.42 3.32128 27.6026 3.24771 28.4156C3.14738 29.4637 3.52196 30.5119 4.31122 31.3584C4.89314 31.9833 7.02682 33.831 10.03 31.2241C12.4045 29.1681 15.4077 28.4424 18.2705 29.242C21.0196 30.0079 23.1265 32.0639 24.0495 34.8791C25.521 39.3674 23.0797 43.9228 18.3842 45.4748C13.9095 46.953 9.24076 44.7022 7.75587 40.3416C7.70905 40.2139 7.67562 40.0796 7.64218 39.9452C7.55522 39.6428 7.46827 39.3338 7.34787 39.0449C6.55861 37.1165 4.96002 36.2095 3.04705 36.6059C1.04045 37.0292 -0.123367 38.6216 0.0104066 40.7515C0.358218 46.3282 3.72929 51.7906 9.01335 55.3449C12.5784 57.7436 16.6117 59 20.4644 59C22.2904 59 24.0763 58.7178 25.7551 58.1467C29.2801 56.944 32.4572 54.7604 35.2063 51.6562C37.3868 49.1904 39.1592 46.8791 40.6107 44.5947C43.4066 40.2005 46.1489 35.6787 48.8043 31.3114C49.8879 29.5309 50.9714 27.7504 52.0617 25.9632L52.1554 25.8153C52.2624 25.6541 52.3627 25.4928 52.4497 25.3181C53.0182 24.2095 53.152 23.0807 52.8242 22.0662L52.8108 22.0528Z"
                fill="#04BD88"
              />
            </svg>
          </div>
          <DialogTitle className="text-[28px] leading-8 font-semibold text-center text-[#0D0D0D]">
            ¡Pedido Entregado!
          </DialogTitle>
          <DialogDescription className="text-[18px] leading-6 text-[#767676] font-normal text-center">
            Pedido #{orderId}
          </DialogDescription>
          <div className="h-px w-full bg-[#D9DCE3]" />
        </DialogHeader>

        {/* Rating block */}
        <div className="flex flex-col items-center gap-5 w-full">
          <div className="flex flex-col items-center gap-4 w-full">
            <h3 className="text-[20px] leading-6 font-semibold text-center text-[#171717]">
              ¿Cómo calificarías tu experiencia?
            </h3>
            <p className="text-[14px] leading-[17px] text-[#737373] text-center">
              Tu opinión nos ayuda a mejorar
            </p>
            {/* Stars */}
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }, (_, i) => {
                const index = i + 1;
                const active = (hover || stars) >= index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setStars(index)}
                    onMouseEnter={() => setHover(index)}
                    onMouseLeave={() => setHover(0)}
                    className="h-[30px] w-[33.75px] flex items-center justify-center"
                    aria-label={`Calificar ${index} estrellas`}
                  >
                    <StarIcon
                      className="h-[30px] w-[30px]"
                      fill={
                        active
                          ? index <= stars
                            ? "#F2A356"
                            : "#F2A356"
                          : "#9BA1AE"
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment input */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[14px] font-medium text-[#292929]">
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos más sobre tu experiencia"
              className="w-full h-[91px] resize-none rounded-xl border border-[#D9DCE3] p-4 text-[16px] leading-5 text-[#292929] focus:outline-none focus:ring-2 focus:ring-[#04BD88]/40"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex w-full gap-4 mt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 h-11 rounded-xl border border-[#202124] bg-white px-5 text-[14px] font-medium text-[#202124]"
            disabled={submitting}
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 h-11 rounded-xl bg-[#04BD88] px-5 text-[14px] font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting
              ? "Guardando..."
              : success
              ? "¡Gracias!"
              : "Enviar Calificación"}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600 text-center w-full">
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
