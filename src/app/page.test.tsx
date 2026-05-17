import Home, { generateMetadata } from './page';
import { createClient } from '@/prismicio';

// Mock the Prismic client
jest.mock('@/prismicio', () => ({
  createClient: jest.fn(),
}));

// Mock the @prismicio/react module
jest.mock('@prismicio/react', () => {
  return {
    SliceZone: ({ slices, components }: { slices: any; components: any }) => (
      <div data-testid="slice-zone">
        {slices.map((slice: any, index: number) => (
          <div key={index} data-testid={`slice-${slice.slice_type}`}>
            Slice: {slice.slice_type}
          </div>
        ))}
      </div>
    ),
  };
});

// Mock the slices components
jest.mock('@/slices', () => ({
  components: {},
}));

// Mock asText from @prismicio/client
jest.mock('@prismicio/client', () => {
  return {
    asText: jest.fn().mockImplementation((richText: any) => {
      if (!richText) return '';
      if (Array.isArray(richText)) {
        return richText.map((block: any) => block.text).join(' ');
      }
      return String(richText);
    }),
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve with proper data when called', async () => {
    // Mock the Prismic client methods
    const mockClient = {
      getByUID: jest.fn().mockResolvedValue({
        data: {
          slices: [],
          title: [{ type: 'heading1', text: 'Home Page' }],
          meta_description: 'Test description',
          meta_title: 'Test Meta Title',
          meta_image: { url: 'https://example.com/image.jpg' },
        },
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);

    // Since we can't directly render the component without testing library,
    // we can test the data fetching aspect by calling the function
    const testData = await Home();

    // The component should return JSX elements
    expect(testData).toBeDefined();
  });

  it('handles Prismic client errors gracefully', async () => {
    const mockClient = {
      getByUID: jest.fn().mockRejectedValue(new Error('Failed to fetch')),
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);

    await expect(Home()).rejects.toThrow('Failed to fetch');
  });
});

describe('generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate correct metadata', async () => {
    const mockClient = {
      getByUID: jest.fn().mockResolvedValue({
        data: {
          title: [{ text: 'Home Page Title' }],
          meta_description: 'Test description',
          meta_title: 'Test Meta Title',
          meta_image: { url: 'https://example.com/image.jpg' },
        },
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);
    const metadata = await generateMetadata();

    expect(metadata.title).toBe('Home Page Title');
    expect(metadata.description).toBe('Test description');
    expect(metadata.openGraph?.title).toBe('Test Meta Title');
    expect(metadata.openGraph?.images).toEqual([{ url: 'https://example.com/image.jpg' }]);
  });

  it('should handle missing meta title as undefined', async () => {
    const mockClient = {
      getByUID: jest.fn().mockResolvedValue({
        data: {
          title: [{ text: 'Home Page Title' }],
          meta_description: 'Test description',
          meta_title: null, // Null value should result in undefined
          meta_image: { url: 'https://example.com/image.jpg' },
        },
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);
    const metadata = await generateMetadata();

    expect(metadata.openGraph?.title).toBeUndefined();
  });

  it('should handle missing meta image gracefully', async () => {
    const mockClient = {
      getByUID: jest.fn().mockResolvedValue({
        data: {
          title: [{ text: 'Home Page Title' }],
          meta_description: 'Test description',
          meta_title: 'Test Meta Title',
          meta_image: { url: null }, // Null URL should result in empty string
        },
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);
    const metadata = await generateMetadata();

    expect(metadata.openGraph?.images).toEqual([{ url: '' }]);
  });

  it('should handle Prismic client error in metadata generation', async () => {
    const mockClient = {
      getByUID: jest.fn().mockRejectedValue(new Error('Failed to fetch')),
    };

    (createClient as jest.Mock).mockReturnValue(mockClient);

    await expect(generateMetadata()).rejects.toThrow('Failed to fetch');
  });
});