import { exitPreview } from "@prismicio/next";

/**
 * This endpoint exits a preview session.
 */
export async function GET() {
  return await exitPreview();
}
