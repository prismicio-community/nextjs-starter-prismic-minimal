import SliceSimulatorPage from "./page";

// Define the mock implementations outside the tests
const mockSearchParams = { state: null };
const mockSlices = [{ id: "test-slice", slice_type: "test" }];

// Mock the external modules
jest.mock("@slicemachine/adapter-next/simulator", () => ({
  SliceSimulator: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="slice-simulator">{children}</div>
  ),
  SliceSimulatorParams: jest.fn(),
  getSlices: jest.fn(() => []),
}));

jest.mock("@/slices", () => ({
  components: {},
}));

jest.mock("@prismicio/react", () => ({
  SliceZone: ({ slices, components }: { slices: any[]; components: any }) => (
    <div data-testid="slice-zone">
      {slices.map((slice, index) => (
        <div key={index} data-testid={`slice-${index}`} />
      ))}
    </div>
  ),
}));

describe("SliceSimulatorPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(SliceSimulatorPage).toBeDefined();
  });

  it("executes without throwing", async () => {
    // Mock getSlices to return some test slices
    const { getSlices } = require("@slicemachine/adapter-next/simulator");
    getSlices.mockReturnValue(mockSlices);

    // Try to execute the component function to make sure it doesn't throw
    await expect(SliceSimulatorPage({ searchParams: Promise.resolve({ state: undefined }) })).resolves.toBeDefined();
  });

  it("handles empty slices correctly", async () => {
    // Mock getSlices to return empty array
    const { getSlices } = require("@slicemachine/adapter-next/simulator");
    getSlices.mockReturnValue([]);

    // Try to execute the component function with empty slices
    await expect(SliceSimulatorPage({ searchParams: Promise.resolve({ state: undefined }) })).resolves.toBeDefined();
  });

  it("calls getSlices with state parameter", async () => {
    const mockState = "test-state";

    const { getSlices } = require("@slicemachine/adapter-next/simulator");
    const mockGetSlices = jest.fn(() => mockSlices);
    getSlices.mockImplementation(mockGetSlices);

    await SliceSimulatorPage({ searchParams: Promise.resolve({ state: mockState }) });

    // Verify that getSlices is called with the state value
    expect(mockGetSlices).toHaveBeenCalledWith(mockState);
  });
});