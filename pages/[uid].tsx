import type { InferGetStaticPropsType, GetStaticPropsContext } from "next";
import Head from "next/head";
import * as prismic from "@prismicio/client";
import * as prismicH from "@prismicio/helpers";
import { SliceZone } from "@prismicio/react";

import { createClient } from "../prismicio";
import { components } from "../slices";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
type PageParams = { uid: string };

/**
 * This page renders a Prismic Document dynamically based on the URL.
 */
export default function Index({ page }: PageProps) {
  return (
    <main>
      <Head>
        <title>{prismicH.asText(page.data.title)}</title>
      </Head>
      <SliceZone slices={page.data.slices} components={components} />
    </main>
  );
}

export async function getStaticProps({
  params,
  previewData,
}: GetStaticPropsContext<PageParams>) {
  const client = createClient({ previewData });

  if (params && params.uid) {
    const page = await client.getByUID("page", params.uid);

    if (page) {
      return {
        props: {
          page,
        },
      };
    }
  }

  return {
    notFound: true,
  };
}

export async function getStaticPaths() {
  const client = createClient();

  /**
   * Query all Documents from the API, except the homepage.
   */
  const pages = await client.getAllByType("page", {
    predicates: [prismic.predicate.not("my.page.uid", "home")],
  });

  /**
   * Define a path for every Document.
   */
  return {
    paths: pages.map((page) => {
      return prismicH.asLink(page);
    }),
    fallback: false,
  };
}
