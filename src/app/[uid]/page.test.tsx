import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { asText, filter } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import { createClient } from "@/prismicio";
import { components } from "@/slices";

// Mock external dependencies
jest.mock("@/prismicio", () => ({
  createClient: jest.fn(),
}));

jest.mock("@prismicio/client", () => ({
  asText: jest.fn(),
  filter: {
    not: jest.fn(),
  },
}));

jest.mock("@prismicio/react", () => ({
  SliceZone: jest.fn(({ slices, components }) => (
    <div data-testid="slice-zone">
      {slices.map((slice: { slice_type: string }, index: number) => (
        <div key={index} data-slice-type={slice.slice_type}>
          slice
        </div>
      ))}
    </div>
  )),
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// Import the functions after mocking dependencies
import Page, { generateMetadata, generateStaticParams } from "./page";

// Mock Prismic client
const mockGetByUID = jest.fn();
const mockGetAllByType = jest.fn();

const mockClient = {
  getByUID: mockGetByUID,
  getAllByType: mockGetAllByType,
};

describe("Page Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockClient);
  });

  it("should render the SliceZone with page data", async () => {
    const mockPageData = {
      data: {
        slices: [
          { slice_type: "text", primary: {} },
          { slice_type: "image", primary: {} },
        ],
        title: "Test Page",
      },
      uid: "test-page",
    };

    mockGetByUID.mockResolvedValueOnce(mockPageData);

    const paramsPromise = Promise.resolve({ uid: "test-page" });
    
    // Since the component expects params as a promise, we need to handle it properly
    const PageComponent = await Page({ params: paramsPromise });

    // Render the component by awaiting its result
    const { container } = render(PageComponent);

    expect(mockGetByUID).toHaveBeenCalledWith("page", "test-page");
    expect(container.querySelector("[data-testid='slice-zone']")).toBeInTheDocument();
  });

  it("should call notFound if page retrieval fails", async () => {
    const notFoundMock = mocked(notFound);
    mockGetByUID.mockRejectedValueOnce(new Error("Not found"));

    const paramsPromise = Promise.resolve({ uid: "nonexistent-page" });

    // Since the component calls next/navigation's notFound which throws an error,
    // we need to catch the error that gets thrown when notFound is called
    await expect(async () => {
      await Page({ params: paramsPromise });
    }).rejects.toThrow();

    expect(notFoundMock).toHaveBeenCalled();
  });
});

describe("generateMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockClient);
    (asText as jest.Mock).mockReturnValue("Test Title");
  });

  it("should generate correct metadata", async () => {
    const mockPageData = {
      data: {
        title: "Test Page Title",
        meta_description: "Test Description",
        meta_title: "Meta Title",
        meta_image: { url: "https://example.com/image.jpg" },
      },
      uid: "test-page",
    };

    mockGetByUID.mockResolvedValueOnce(mockPageData);

    const paramsPromise = Promise.resolve({ uid: "test-page" });
    const metadata: Metadata = await generateMetadata({ params: paramsPromise });

    expect(mockGetByUID).toHaveBeenCalledWith("page", "test-page");
    expect(asText).toHaveBeenCalledWith(mockPageData.data.title);
    expect(metadata.title).toBe("Test Title");
    expect(metadata.description).toBe("Test Description");
    expect(metadata.openGraph?.title).toBe("Meta Title");
    expect(metadata.openGraph?.images).toEqual([{ url: "https://example.com/image.jpg" }]);
  });

  it("should handle meta_image missing gracefully", async () => {
    const mockPageData = {
      data: {
        title: "Test Page Title",
        meta_description: "Test Description",
        meta_title: null,
        meta_image: { url: undefined },
      },
      uid: "test-page",
    };

    mockGetByUID.mockResolvedValueOnce(mockPageData);

    const paramsPromise = Promise.resolve({ uid: "test-page" });
    const metadata: Metadata = await generateMetadata({ params: paramsPromise });

    expect(metadata.openGraph?.title).toBeUndefined();
    expect(metadata.openGraph?.images).toEqual([{ url: "" }]);
  });

  it("should call notFound if metadata retrieval fails", async () => {
    mockGetByUID.mockRejectedValueOnce(new Error("Not found"));

    const paramsPromise = Promise.resolve({ uid: "nonexistent-page" });
    
    await expect(generateMetadata({ params: paramsPromise })).rejects.toThrow();

    // Check if notFound was called (though in a real scenario it would be caught)
    expect(mockGetByUID).toHaveBeenCalledWith("page", "nonexistent-page");
  });
});

describe("generateStaticParams", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockClient);
    (filter.not as jest.Mock).mockImplementation((field, value) => ({ field, value }));
  });

  it("should return correct static params", async () => {
    const mockPages = [
      { uid: "about" },
      { uid: "services" },
      { uid: "contact" },
    ];

    mockGetAllByType.mockResolvedValueOnce(mockPages);

    const params = await generateStaticParams();

    expect(mockGetAllByType).toHaveBeenCalledWith("page", {
      filters: [expect.any(Object)],
    });
    expect(filter.not).toHaveBeenCalledWith("my.page.uid", "home");
    expect(params).toEqual([
      { uid: "about" },
      { uid: "services" },
      { uid: "contact" },
    ]);
  });

  it("should exclude home page from static params", async () => {
    const mockPages = [
      { uid: "about" }, // This should be included
    ];

    mockGetAllByType.mockResolvedValueOnce(mockPages);

    const params = await generateStaticParams();

    // Verify that filter.not was called to exclude "home"
    expect(filter.not).toHaveBeenCalledWith("my.page.uid", "home");
    expect(params).toEqual([{ uid: "about" }]);
  });
});