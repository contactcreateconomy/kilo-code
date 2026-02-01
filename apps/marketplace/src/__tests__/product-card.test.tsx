import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "../../components/products/product-card";

// Mock product data
const mockProduct = {
  _id: "product_123",
  slug: "digital-art-pack",
  name: "Digital Art Pack",
  description: "A collection of digital art assets",
  price: 29.99,
  images: ["https://example.com/image.jpg"],
  rating: 4.5,
  seller: {
    _id: "seller_123",
    name: "Creative Studio",
  },
  categoryId: "category_123",
  status: "active" as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Digital Art Pack")).toBeInTheDocument();
  });

  it("renders product price", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("$29.99")).toBeInTheDocument();
  });

  it("renders seller name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("by Creative Studio")).toBeInTheDocument();
  });

  it("renders product rating", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders product image with correct alt text", () => {
    render(<ProductCard product={mockProduct} />);
    const image = screen.getByAltText("Digital Art Pack");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("links to the product page", () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products/digital-art-pack");
  });

  it("applies hover styles via group class", () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("group");
  });

  describe("price formatting", () => {
    it("formats price with two decimal places", () => {
      const productWithWholePrice = { ...mockProduct, price: 30 };
      render(<ProductCard product={productWithWholePrice} />);
      expect(screen.getByText("$30.00")).toBeInTheDocument();
    });

    it("handles zero price", () => {
      const freeProduct = { ...mockProduct, price: 0 };
      render(<ProductCard product={freeProduct} />);
      expect(screen.getByText("$0.00")).toBeInTheDocument();
    });
  });
});
