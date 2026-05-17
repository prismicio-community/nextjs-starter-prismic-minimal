import { NextRequest } from "next/server";
import { redirectToPreviewURL } from "@prismicio/next";
import { GET } from './route';

// Mock the @prismicio/next module
jest.mock('@prismicio/next', () => ({
  redirectToPreviewURL: jest.fn(),
}));

// Mock the prismicio module to control client creation
jest.mock('@/prismicio', () => ({
  createClient: jest.fn(() => ({
    repositoryName: 'test-repo'
  })),
}));

describe('Preview API Route', () => {
  const mockCreateClient = require('@/prismicio').createClient;
  const mockRedirectToPreviewURL = require('@prismicio/next').redirectToPreviewURL;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call redirectToPreviewURL with correct parameters', async () => {
    // Arrange
    const mockRequest = new Request('http://localhost:3000/api/preview');
    const mockResponse = new Response(null, { status: 307, headers: { Location: '/preview-url' } });

    (mockRedirectToPreviewURL as jest.MockedFunction<any>).mockResolvedValue(mockResponse);

    // Act
    const result = await GET(mockRequest as NextRequest);

    // Assert
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockRedirectToPreviewURL).toHaveBeenCalledWith({
      client: expect.any(Object),
      request: mockRequest as NextRequest,
    });
    expect(result).toBe(mockResponse);
  });

  it('should handle redirect response from redirectToPreviewURL', async () => {
    // Arrange
    const mockRequest = new Request('http://localhost:3000/api/preview');
    const mockRedirectResponse = new Response(null, {
      status: 307,
      headers: { Location: '/some-page' },
    });

    (mockRedirectToPreviewURL as jest.MockedFunction<any>).mockResolvedValue(mockRedirectResponse);

    // Act
    const result: Response = await GET(mockRequest as NextRequest);

    // Assert
    expect(mockRedirectToPreviewURL).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(307);
    expect(result.headers.get('Location')).toBe('/some-page');
  });

  it('should handle different redirect statuses', async () => {
    // Arrange
    const mockRequest = new Request('http://localhost:3000/api/preview');
    const mockTemporaryRedirectResponse = new Response(null, {
      status: 302,
      headers: { Location: '/temporary-location' },
    });

    (mockRedirectToPreviewURL as jest.MockedFunction<any>).mockResolvedValue(mockTemporaryRedirectResponse);

    // Act
    const result: Response = await GET(mockRequest as NextRequest);

    // Assert
    expect(mockRedirectToPreviewURL).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(302);
    expect(result.headers.get('Location')).toBe('/temporary-location');
  });

  it('should pass the request object correctly to redirectToPreviewURL', async () => {
    // Arrange
    const mockRequest = new Request('http://localhost:3000/api/preview', {
      headers: {
        'x-test-header': 'test-value',
      },
    });
    const mockResponse = new Response(null, { status: 200 });

    (mockRedirectToPreviewURL as jest.MockedFunction<any>).mockResolvedValue(mockResponse);

    // Act
    await GET(mockRequest as NextRequest);

    // Assert
    expect(mockRedirectToPreviewURL).toHaveBeenCalledWith({
      client: expect.any(Object),
      request: mockRequest as NextRequest,
    });
    expect(mockRedirectToPreviewURL).toHaveBeenCalledTimes(1);
  });

  it('should create a client using the createClient function', async () => {
    // Arrange
    const mockRequest = new Request('http://localhost:3000/api/preview');
    const mockClient = { repositoryName: 'test-repo' };
    const mockResponse = new Response(null, { status: 200 });

    (mockCreateClient as jest.Mock).mockReturnValue(mockClient);
    (mockRedirectToPreviewURL as jest.MockedFunction<any>).mockResolvedValue(mockResponse);

    // Act
    await GET(mockRequest as NextRequest);

    // Assert
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockRedirectToPreviewURL).toHaveBeenCalledWith({
      client: mockClient,
      request: mockRequest as NextRequest,
    });
  });

  it('should only export GET method', () => {
    // Check that only GET is exported by verifying types of the module
    const routeModule = require('./route');
    expect(routeModule.GET).toBeDefined();
    expect(routeModule.POST).toBeUndefined();
    expect(routeModule.PUT).toBeUndefined();
    expect(routeModule.DELETE).toBeUndefined();
  });

  it('should handle redirectToPreviewURL rejection gracefully', async () => {
    // Arrange
    const mockRequest = new Request('http://localhost:3000/api/preview');
    const mockError = new Error('Preview redirect failed');

    (mockRedirectToPreviewURL as jest.MockedFunction<any>).mockRejectedValue(mockError);

    // Act & Assert
    await expect(GET(mockRequest as NextRequest)).rejects.toThrow('Preview redirect failed');
    expect(mockRedirectToPreviewURL).toHaveBeenCalledTimes(1);
  });

  it('should work with different request configurations', async () => {
    // Arrange
    const mockRequests = [
      new Request('http://localhost:3000/api/preview?token=test'),
      new Request('https://example.com/api/preview', {
        method: 'GET',
        headers: { 'X-Forwarded-Proto': 'https' },
      }),
    ];
    const mockResponse = new Response(null, { status: 307, headers: { Location: '/preview' } });

    (mockRedirectToPreviewURL as jest.MockedFunction<any>).mockResolvedValue(mockResponse);

    // Act & Assert - Test with different request configurations
    for (const req of mockRequests) {
      const result = await GET(req as NextRequest);

      expect(mockCreateClient).toHaveBeenCalledTimes(1);
      expect(mockRedirectToPreviewURL).toHaveBeenCalledWith({
        client: expect.any(Object),
        request: req as NextRequest,
      });
      expect(result).toBe(mockResponse);

      // Clear mocks for next iteration
      jest.clearAllMocks();
    }
  });
});