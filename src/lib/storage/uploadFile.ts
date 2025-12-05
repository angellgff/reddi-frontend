import { createClient } from "@/src/lib/supabase/client";
import { uuid } from "@/src/lib/utils";

export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<string | null> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${uuid()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
}
