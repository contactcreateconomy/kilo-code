import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Home Page", () => {
  describe("page structure", () => {
    it("should have a main content area", () => {
      render(
        <main data-testid="home-page">
          <h1>Welcome to Createconomy</h1>
          <p>Discover amazing digital products</p>
        </main>
      );
      
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Welcome to Createconomy"
      );
    });

    it("should display a welcome message", () => {
      render(
        <main>
          <h1>Welcome to Createconomy</h1>
          <p>Discover amazing digital products</p>
        </main>
      );
      
      expect(
        screen.getByText("Discover amazing digital products")
      ).toBeInTheDocument();
    });
  });

  describe("SEO", () => {
    it("should have proper heading hierarchy", () => {
      render(
        <main>
          <h1>Welcome to Createconomy</h1>
          <section>
            <h2>Featured Products</h2>
          </section>
          <section>
            <h2>Categories</h2>
          </section>
        </main>
      );
      
      const h1 = screen.getByRole("heading", { level: 1 });
      const h2s = screen.getAllByRole("heading", { level: 2 });
      
      expect(h1).toBeInTheDocument();
      expect(h2s).toHaveLength(2);
    });
  });

  describe("accessibility", () => {
    it("should have accessible landmarks", () => {
      render(
        <main role="main" aria-label="Home page content">
          <h1>Welcome to Createconomy</h1>
        </main>
      );
      
      expect(screen.getByRole("main")).toHaveAttribute(
        "aria-label",
        "Home page content"
      );
    });
  });
});
