import type { AppProps } from "next/app";
import { PrismicPreview } from "@prismicio/next";

import { repositoryName } from "@/prismicio";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <PrismicPreview repositoryName={repositoryName} />
    </>
  );
}
