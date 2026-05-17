// __mocks__/next-server.js
const originalModule = jest.requireActual('next/server');

// Provide a proper mock that maintains the expected interface
const NextResponse = {
  json: (data, init) => {
    // Create a response object that behaves like NextResponse
    return {
      json: async () => data,  // Return the original data when json() is called
      status: init?.status || 200,
      headers: new Headers(init?.headers || {}),
      ok: true,
    };
  }
};

// Keep the original NextRequest or provide a compatible one if not available
const NextRequest = originalModule.NextRequest || class NextRequest extends global.Request {
  constructor(input, init) {
    super(input, init);
  }
};

module.exports = {
  ...originalModule,
  NextResponse,
  NextRequest,
};