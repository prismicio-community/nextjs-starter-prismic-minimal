import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "@jest/globals";
import { PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type JSXMapSerializer } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";

// Mock the CSS module
jest.mock("./index.module.css", () => ({
  richtext: "richtext",
}));

// Mock the PrismicNextLink component
jest.mock("@prismicio/next", () => ({
  PrismicNextLink: ({ field, children }: { field: any; children: React.ReactNode }) => {
    let href = "#";
    if (field && typeof field === 'object') {
      if (field.url) {
        href = field.url;
      } else if (field.link_type === 'Web' && field.url) {
        href = field.url;
      } else if (field.link_type === 'Document' && field.uid) {
        href = `/${field.uid}`;
      }
    }
    return <a href={href}>{children}</a>;
  },
}));

// Mock the PrismicRichText component
jest.mock("@prismicio/react", () => ({
  PrismicRichText: ({ field, components }: { field: any; components?: any }) => {
    // This mock simulates how the PrismicRichText component processes the content
    // It should handle spans within text such as hyperlinks and labels
    const processSpans = (text: string, spans: any[], index: number) => {
      if (!spans || spans.length === 0) {
        return <span key={`text-${index}`}>{text}</span>;
      }

      // Create a map to track character positions and what type of span they belong to
      const charMap = new Array(text.length);
      for (let i = 0; i < spans.length; i++) {
        const span = spans[i];
        for (let j = span.start; j < span.end; j++) {
          if (!charMap[j]) charMap[j] = [];
          charMap[j].push({ ...span, id: i });
        }
      }

      // Group consecutive characters with the same spans
      const segments = [];
      let currentStart = 0;
      let currentSpans = charMap[0] ? [...charMap[0]] : [];

      for (let i = 1; i <= text.length; i++) {
        const nextSpans = i < text.length ? (charMap[i] ? [...charMap[i]] : []) : [];

        if (JSON.stringify(currentSpans) !== JSON.stringify(nextSpans)) {
          // End of current segment
          if (currentStart < i) {
            segments.push({
              text: text.substring(currentStart, i),
              spans: currentSpans,
            });
          }
          currentStart = i;
          currentSpans = nextSpans;
        }
      }

      if (segments.length === 0) {
        return <span key={`text-${index}`}>{text}</span>;
      }

      // Render each segment with appropriate wrappers
      return (
        <span key={`text-${index}`}>
          {segments.map((segment, segIndex) => {
            if (!segment.spans || segment.spans.length === 0) {
              return <span key={`seg-${index}-${segIndex}`}>{segment.text}</span>;
            }

            // Use the first span to determine wrapping element
            const span = segment.spans[0];
            const wrapper = createSpanWrapper(span, segment.text, `seg-${index}-${segIndex}`, components);
            return wrapper;
          })}
        </span>
      );
    };

    const createSpanWrapper = (span: any, text: string, key: string, components?: any) => {
      switch (span.type) {
        case 'hyperlink':
          if (components?.hyperlink) {
            return components.hyperlink({
              node: { type: 'hyperlink', data: span.data },
              children: text
            });
          }
          return <a key={key} href={span.data?.url || "#"}>{text}</a>;

        case 'label':
          if (components?.label && span.data?.label === "codespan") {
            return components.label({
              node: { type: 'label', data: span.data },
              children: text
            });
          }
          if (span.data?.label === "codespan") {
            return <code key={key}>{text}</code>;
          }
          return <span key={key}>{text}</span>;

        case 'strong':
          return <strong key={key}>{text}</strong>;

        case 'em':
          return <em key={key}>{text}</em>;

        default:
          return <span key={key}>{text}</span>;
      }
    };

    const processNodes = (nodes: any[]) => {
      return nodes.map((node, index) => {
        switch (node.type) {
          case 'paragraph':
            return <p key={index}>{processSpans(node.text, node.spans, index)}</p>;
          case 'heading1':
            return <h1 key={index}>{processSpans(node.text, node.spans, index)}</h1>;
          case 'heading2':
            return <h2 key={index}>{processSpans(node.text, node.spans, index)}</h2>;
          case 'heading3':
            return <h3 key={index}>{processSpans(node.text, node.spans, index)}</h3>;
          case 'heading4':
            return <h4 key={index}>{processSpans(node.text, node.spans, index)}</h4>;
          case 'heading5':
            return <h5 key={index}>{processSpans(node.text, node.spans, index)}</h5>;
          case 'heading6':
            return <h6 key={index}>{processSpans(node.text, node.spans, index)}</h6>;
          default:
            return <div key={index}>{processSpans(node.text, node.spans, index)}</div>;
        }
      });
    };

    return <>{Array.isArray(field) ? processNodes(field) : <span>{field}</span>}</>;
  },
  JSXMapSerializer: {}
}));

import RichText from "./index";

// Helper function to create mock slices with the correct structure
const createMockSlice = (content: any) => {
  return {
    id: "test-id",
    slice_type: "rich_text" as const,
    slice_label: null,
    variation: "default" as const,
    version: "sktwi1xtmkfgx8626",
    primary: {
      content: content
    },
    items: [],
  };
};

describe("RichText", () => {
  it("renders without crashing", () => {
    const mockContent = [
      {
        type: "paragraph",
        text: "Test paragraph content",
        spans: [],
      },
    ];
    
    const mockSlice = createMockSlice(mockContent);

    render(<RichText slice={mockSlice} index={0} slices={[]} context={{}} />);
    
    expect(document.querySelector(".richtext")).toBeInTheDocument();
  });

  it("renders with default variation structure using mock data", () => {
    const mockContent = [
      {
        type: "paragraph",
        text: "Esse aliqua qui in qui duis nisi. Esse elit elit culpa cillum dolore eiusmod aliquip deserunt.",
        spans: [],
      },
    ];
    
    const mockSlice = createMockSlice(mockContent);

    render(<RichText slice={mockSlice} index={0} slices={[]} context={{}} />);
    
    expect(document.querySelector(".richtext")).toBeInTheDocument();
    expect(screen.getByText(/Esse aliqua qui in qui duis nisi/i)).toBeInTheDocument();
  });

  it("passes the content field to PrismicRichText", () => {
    const mockContent = [
      {
        type: "heading1",
        text: "Test heading",
        spans: [],
      },
    ];
    
    const mockSlice = createMockSlice(mockContent);

    render(<RichText slice={mockSlice} index={0} slices={[]} context={{}} />);
    
    expect(screen.getByText("Test heading")).toBeInTheDocument();
  });

  it("renders different content types correctly", () => {
    const mockContent = [
      {
        type: "paragraph",
        text: "Regular paragraph text",
        spans: [],
      },
      {
        type: "heading1",
        text: "Main Heading",
        spans: [],
      },
    ];
    
    const mockSlice = createMockSlice(mockContent);

    render(<RichText slice={mockSlice} index={0} slices={[]} context={{}} />);
    
    expect(screen.getByText("Regular paragraph text")).toBeInTheDocument();
    expect(screen.getByText("Main Heading")).toBeInTheDocument();
  });

  it("handles hyperlink serialization correctly", () => {
    const mockContent = [
      {
        type: "paragraph",
        text: "Visit our website",
        spans: [
          {
            type: "hyperlink",
            start: 6,
            end: 18,
            data: {
              link_type: "Web",
              url: "https://example.com",
            },
          },
        ],
      },
    ];

    const mockSlice = createMockSlice(mockContent);

    render(<RichText slice={mockSlice} index={0} slices={[]} context={{}} />);

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveTextContent("our website"); // The hyperlink text content
  });

  it("handles codespan label serialization correctly", () => {
    const mockContent = [
      {
        type: "paragraph",
        text: "const x = 5;",
        spans: [
          {
            type: "label",
            start: 0,
            end: 10,
            data: {
              label: "codespan",
            },
          },
        ],
      },
    ];

    const mockSlice = createMockSlice(mockContent);

    render(<RichText slice={mockSlice} index={0} slices={[]} context={{}} />);

    const codeElement = screen.getByRole("code");
    expect(codeElement).toBeInTheDocument();
    // The text might be split due to how spans are processed, so check for partial content
    expect(codeElement.textContent).toContain("const x =");
  });

  it("does not apply codespan formatting for non-codespan labels", () => {
    const mockContent = [
      {
        type: "paragraph",
        text: "Some highlighted text",
        spans: [
          {
            type: "label",
            start: 0,
            end: 18,
            data: {
              label: "highlight",
            },
          },
        ],
      },
    ];

    const mockSlice = createMockSlice(mockContent);

    render(<RichText slice={mockSlice} index={0} slices={[]} context={{}} />);

    // Should render as plain text since there's no matching serializer for 'highlight'
    // The text should appear in the document but not be wrapped in a code element
    expect(screen.getByText(/highlighted/)).toBeInTheDocument();
    // Check that it's not wrapped in a code element
    expect(screen.queryByRole("code")).not.toBeInTheDocument();
  });
});