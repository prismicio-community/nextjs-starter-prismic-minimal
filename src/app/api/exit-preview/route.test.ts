import { exitPreview } from '@prismicio/next';
import { GET } from './route';

// Mock the @prismicio/next module
jest.mock('@prismicio/next', () => ({
  exitPreview: jest.fn(),
}));

describe('Exit Preview Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call exitPreview when GET is invoked', async () => {
    const mockResponse = new Response(null, { status: 200 });
    (exitPreview as jest.MockedFunction<typeof exitPreview>).mockResolvedValue(mockResponse);

    const result = await GET();

    expect(exitPreview).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockResponse);
  });

  it('should handle different responses from exitPreview', async () => {
    const mockRedirectResponse = new Response(null, {
      status: 307,
      headers: { Location: '/' },
    });
    (exitPreview as jest.MockedFunction<typeof exitPreview>).mockResolvedValue(mockRedirectResponse);

    const result = await GET();

    expect(exitPreview).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockRedirectResponse);
  });

  it('should only export GET method', () => {
    // Check that only GET is exported by verifying types of the module
    const routeModule = require('./route');
    expect(routeModule.GET).toBeDefined();
    expect(routeModule.POST).toBeUndefined();
    expect(routeModule.PUT).toBeUndefined();
    expect(routeModule.DELETE).toBeUndefined();
  });

  it('should return the response from exitPreview without modification', async () => {
    const mockCustomResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    (exitPreview as jest.MockedFunction<typeof exitPreview>).mockResolvedValue(mockCustomResponse);

    const result = await GET();

    expect(result).toBe(mockCustomResponse);
    expect(exitPreview).toHaveBeenCalledWith();
  });
});