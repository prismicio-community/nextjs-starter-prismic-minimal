require('@testing-library/jest-dom');

// In jsdom environment, extend with missing globals for Next.js API routes
// Always override Request since NextRequest extends it and expects specific behavior
global.Request = class Request {
  constructor(input, init) {
    // Create a URL object first if input is a string
    let urlString = '';
    if (typeof input === 'string' || input instanceof URL) {
      urlString = input.toString();
    }

    // Define the url property to be compatible with NextRequest
    Object.defineProperty(this, 'url', {
      value: urlString,
      writable: true,
      enumerable: true,
      configurable: true
    });

    // Handle headers properly - check if it's already a Headers instance
    let headersObj = init?.headers;
    if (headersObj && typeof headersObj !== 'object') {
      headersObj = {};
    } else if (!headersObj) {
      headersObj = {};
    }

    // If headersObj is plain object, wrap it in Headers, otherwise use as-is
    this.headers = headersObj instanceof Headers ? headersObj : new Headers(headersObj);

    this.method = init?.method || 'GET';
  }
};
// Always override Response since NextResponse extends it and expects specific behavior
global.Response = class Response {
  constructor(body, options = {}) {
    this._body = body;
    this.status = options.status || 200;
    this.headers = new Headers(options.headers);
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    // Use stored original data if available (from Response.json())
    if (this._originalData !== undefined) {
      return this._originalData;
    }
    if (typeof this._body === 'string') {
      try {
        return JSON.parse(this._body);
      } catch (e) {
        return {};
      }
    }
    return this._body || {};
  }

  static json(data, options) {
    const body = JSON.stringify(data);
    const headers = new Headers({ ...(options?.headers || {}), 'Content-Type': 'application/json' });
    const resp = new Response(body, { ...options, headers });
    resp._originalData = data; // Store the original data separately for json() method
    return resp;
  }
};

// Also ensure NextResponse is properly handled
if (typeof global.NextResponse === 'undefined') {
  global.NextResponse = global.Response;
}
if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init) {
      this.map = {};
      if (init) {
        if (init instanceof Headers) {
          // Copy from existing Headers object
          if (init.map) {
            this.map = {...init.map};
          }
        } else if (typeof init === 'object') {
          // Handle object/record input
          Object.entries(init).forEach(([k, v]) => {
            this.map[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : v;
          });
        }
      }
    }
    get(name) {
      return this.map[name.toLowerCase()];
    }
    set(name, value) {
      this.map[name.toLowerCase()] = value;
    }
    append(name, value) {
      const existing = this.get(name);
      if (existing) {
        this.set(name, `${existing}, ${value}`);
      } else {
        this.set(name, value);
      }
    }
    *entries() {
      for (const [key, value] of Object.entries(this.map)) {
        yield [key, value];
      }
    }
    forEach(callback) {
      for (const [key, value] of Object.entries(this.map)) {
        callback(value, key, this);
      }
    }
  };
}