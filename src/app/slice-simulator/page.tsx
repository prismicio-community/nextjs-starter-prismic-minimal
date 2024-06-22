import {
  SliceSimulator,
  SliceSimulatorParams,
  getSlices,
} from "@slicemachine/adapter-next/simulator";
import { SliceZone } from "@prismicio/react";

import { components } from "@/slices";

export default function SliceSimulatorPage({
  searchParams,
}: SliceSimulatorParams & { searchParams: { secret?: string } }) {
  if (
    process.env.SLICE_SIMULATOR_SECRET &&
    searchParams.secret !== process.env.SLICE_SIMULATOR_SECRET
  ) {
    throw new Error("Incorrect or missing secret");
  }

  const slices = getSlices(searchParams.state);

  return (
    <SliceSimulator>
      <SliceZone slices={slices} components={components} />
    </SliceSimulator>
  );
}
