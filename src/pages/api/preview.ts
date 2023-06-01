import * as prismicNext from "@prismicio/next";
import type { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "@/prismicio";

/**
 * This endpoint handles previews that are launched from the Page Builder.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = createClient({ req });

  prismicNext.setPreviewData({ req, res });

  await prismicNext.redirectToPreviewURL({ req, res, client });
}
