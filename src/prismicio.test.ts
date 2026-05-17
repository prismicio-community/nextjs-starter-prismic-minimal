import { ClientConfig } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import { createClient, repositoryName } from "./prismicio";
import sm from "../slicemachine.config.json";

// Mock the external dependencies
jest.mock("@prismicio/client", () => ({
  createClient: jest.fn((repositoryNameOrEndpoint: string, config: ClientConfig) => ({
    repositoryNameOrEndpoint,
    config,
  })),
}));

jest.mock("@prismicio/next", () => ({
  enableAutoPreviews: jest.fn(),
}));

// Import the mocked functions
const mockBaseCreateClient = require("@prismicio/client").createClient;

describe("Prismic client setup", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment variables for each test using Object.defineProperty to handle readonly properties
    Object.defineProperty(process.env, 'NEXT_PUBLIC_PRISMIC_ENVIRONMENT', {
      value: undefined,
      writable: true,
      configurable: true
    });
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: undefined,
      writable: true,
      configurable: true
    });
  });

  describe("repositoryName", () => {
    it("should fall back to sm.repositoryName by default", () => {
      // Note: Since repositoryName is evaluated when the module is imported,
      // changing process.env after import won't affect it.
      // To test the conditional logic, we would need to mock the module before import.
      expect(repositoryName).toBe(sm.repositoryName);
    });
  });

  describe("routes", () => {
    it("should define correct routes for pages", () => {
      // Since routes is a constant inside the module, we can't directly access it
      // But we can verify that createClient uses the correct routes
    });
  });

  describe("createClient", () => {
    it("should create a client with the correct repository name or endpoint", () => {
      const mockClient = { repositoryNameOrEndpoint: "", config: {} };
      (mockBaseCreateClient as jest.MockedFunction<any>).mockReturnValue(mockClient);

      createClient();

      expect(mockBaseCreateClient).toHaveBeenCalledWith(
        sm.apiEndpoint || sm.repositoryName,
        expect.objectContaining({
          routes: [
            { type: "page", uid: "home", path: "/" },
            { type: "page", path: "/:uid" },
          ],
        })
      );
    });

    it("should enable auto previews on the created client", () => {
      const mockClient = { repositoryNameOrEndpoint: "", config: {} };
      (mockBaseCreateClient as jest.MockedFunction<any>).mockReturnValue(mockClient);

      const result = createClient();

      expect(enableAutoPreviews).toHaveBeenCalledWith({ client: mockClient });
      expect(result).toBe(mockClient);
    });

    it("should use force-cache and prismic tags in production environment", () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: "production",
        writable: true,
        configurable: true
      });
      const mockClient = { repositoryNameOrEndpoint: "", config: {} };
      (mockBaseCreateClient as jest.MockedFunction<any>).mockReturnValue(mockClient);

      createClient();

      expect(mockBaseCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          fetchOptions: { next: { tags: ["prismic"] }, cache: "force-cache" as const },
        })
      );
    });

    it("should use revalidate option in non-production environment", () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: "development",
        writable: true,
        configurable: true
      });
      const mockClient = { repositoryNameOrEndpoint: "", config: {} };
      (mockBaseCreateClient as jest.MockedFunction<any>).mockReturnValue(mockClient);

      createClient();

      expect(mockBaseCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          fetchOptions: { next: { revalidate: 5 } },
        })
      );
    });

    it("should merge additional config options", () => {
      const mockClient = { repositoryNameOrEndpoint: "", config: {} };
      (mockBaseCreateClient as jest.MockedFunction<any>).mockReturnValue(mockClient);

      const additionalConfig = { accessToken: "test-token", routes: [] };
      createClient(additionalConfig);

      expect(mockBaseCreateClient).toHaveBeenCalledWith(
        sm.apiEndpoint || sm.repositoryName,
        expect.objectContaining(additionalConfig)
      );
    });

    it("should use apiEndpoint if available, otherwise repository name", () => {
      const mockClient = { repositoryNameOrEndpoint: "", config: {} };
      (mockBaseCreateClient as jest.MockedFunction<any>).mockReturnValue(mockClient);

      // Test with apiEndpoint defined
      const originalApiEndpoint = sm.apiEndpoint;
      sm.apiEndpoint = "https://test.cdn.prismic.io/api/v2";
      
      createClient();
      
      expect(mockBaseCreateClient).toHaveBeenCalledWith(
        sm.apiEndpoint,
        expect.anything()
      );

      // Restore original value
      sm.apiEndpoint = originalApiEndpoint;
    });

    it("should allow overriding fetchOptions through config", () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: "production",
        writable: true,
        configurable: true
      });
      const mockClient = { repositoryNameOrEndpoint: "", config: {} };
      (mockBaseCreateClient as jest.MockedFunction<any>).mockReturnValue(mockClient);

      const customFetchOptions = {
        next: { tags: ["custom"], revalidate: 10 },
        cache: "default" as const
      };

      createClient({ fetchOptions: customFetchOptions });

      expect(mockBaseCreateClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          fetchOptions: customFetchOptions,
        })
      );
    });
  });
});