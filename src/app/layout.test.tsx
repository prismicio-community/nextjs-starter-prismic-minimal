import React from 'react';
import { renderToString } from 'react-dom/server';
import RootLayout from './layout';

// Mock the PrismicPreview component since it's an external dependency
jest.mock('@prismicio/next', () => ({
  PrismicPreview: ({ repositoryName }: { repositoryName: string }) => (
    <div data-testid="prismic-preview">Prismic Preview: {repositoryName}</div>
  ),
}));

// Mock the prismicio module to provide a repository name
jest.mock('@/prismicio', () => ({
  repositoryName: 'test-repo',
}));

describe('RootLayout', () => {
  it('renders html element with correct lang attribute', () => {
    const testChild = <div>Test Content</div>;
    
    // Using server-side rendering to check the HTML structure
    const htmlOutput = renderToString(
      <RootLayout>{testChild}</RootLayout>
    );
    
    // Check that the lang attribute is correctly set on the html tag
    expect(htmlOutput).toContain('<html lang="en">');
  });

  it('renders children correctly', () => {
    const testContent = 'Test Child Content';
    const testChild = <div>{testContent}</div>;
    
    const htmlOutput = renderToString(
      <RootLayout>{testChild}</RootLayout>
    );
    
    // Check that the child content is included in the output
    expect(htmlOutput).toContain(testContent);
  });

  it('includes PrismicPreview component', () => {
    const testChild = <div>Some content</div>;
    
    const htmlOutput = renderToString(
      <RootLayout>{testChild}</RootLayout>
    );
    
    // Check that PrismicPreview is included in the output
    expect(htmlOutput).toContain('data-testid="prismic-preview"');
    expect(htmlOutput).toContain('test-repo'); // Repository name should appear
  });

  it('renders complete document structure', () => {
    const testChild = <span data-testid="child-span">Child text</span>;
    
    const htmlOutput = renderToString(
      <RootLayout>{testChild}</RootLayout>
    );
    
    // Check for complete structure
    expect(htmlOutput).toContain('<html lang="en">');
    expect(htmlOutput).toContain('<body>');
    expect(htmlOutput).toContain('data-testid="child-span"');
    expect(htmlOutput).toContain('Child text');
    expect(htmlOutput).toContain('data-testid="prismic-preview"');
  });
});