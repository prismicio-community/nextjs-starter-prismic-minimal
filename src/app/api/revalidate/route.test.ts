import { POST } from "./route";
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

// Mock the next/cache module
jest.mock("next/cache", () => ({
  revalidateTag: jest.fn(),
}));

describe("Revalidation API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully revalidate the prismic tag", async () => {
    const mockRevalidateTag = jest.spyOn(require("next/cache"), "revalidateTag");

    // Mock the revalidateTag function
    mockRevalidateTag.mockResolvedValue(undefined);

    const response = await POST();
    const responseBody = await response.json();

    expect(mockRevalidateTag).toHaveBeenCalledWith("prismic", "max");
    expect(responseBody.revalidated).toBe(true);
    expect(typeof responseBody.now).toBe("number");
    expect(response.status).toBe(200);
  });

  it("should return correct JSON response format", async () => {
    const mockRevalidateTag = jest.spyOn(require("next/cache"), "revalidateTag");
    mockRevalidateTag.mockResolvedValue(undefined);

    const response = await POST();
    const responseBody = await response.json();

    expect(responseBody).toHaveProperty("revalidated");
    expect(responseBody).toHaveProperty("now");
    expect(responseBody.revalidated).toBe(true);
    expect(typeof responseBody.now).toBe("number");
  });

  it("should handle revalidateTag correctly", async () => {
    const mockRevalidateTag = jest.spyOn(require("next/cache"), "revalidateTag");
    mockRevalidateTag.mockResolvedValue(undefined);

    await POST();

    expect(mockRevalidateTag).toHaveBeenCalledTimes(1);
    expect(mockRevalidateTag).toHaveBeenCalledWith("prismic", "max");
  });

  it("should return 200 status code on success", async () => {
    const mockRevalidateTag = jest.spyOn(require("next/cache"), "revalidateTag");
    mockRevalidateTag.mockResolvedValue(undefined);

    const response = await POST();

    expect(response.status).toBe(200);
  });

  it("should return a timestamp close to current time", async () => {
    const mockRevalidateTag = jest.spyOn(require("next/cache"), "revalidateTag");
    mockRevalidateTag.mockResolvedValue(undefined);

    const beforeCall = Date.now();
    const response = await POST();
    const responseBody = await response.json();
    const afterCall = Date.now();

    expect(responseBody.now).toBeGreaterThanOrEqual(beforeCall);
    expect(responseBody.now).toBeLessThanOrEqual(afterCall);
  });
});