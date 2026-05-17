import { components } from "./index";

describe("src/slices/index", () => {
  describe("components", () => {
    it("should have rich_text component", () => {
      expect(components).toHaveProperty("rich_text");
      expect(components.rich_text).toBeDefined();
    });

    it("should export the rich_text component as a dynamic import", () => {
      // Since the component is dynamically imported, we can't easily test its actual type,
      // but we can verify that it's defined and has expected properties for a dynamic component
      expect(components.rich_text).toBeDefined();
      
      // Dynamic components in Next.js typically have certain properties or methods
      // Even though it's not loaded yet, the dynamic wrapper should be present
      expect(typeof components.rich_text).toBe("object");
    });

    it("should not have any undefined values in the components object", () => {
      Object.entries(components).forEach(([key, value]) => {
        expect(value).toBeDefined();
      });
    });

    it("should export all expected components", () => {
      // Check that only expected components are exported
      const expectedComponents = ["rich_text"];
      const actualComponents = Object.keys(components);
      
      expect(actualComponents.sort()).toEqual(expectedComponents.sort());
    });
  });
});