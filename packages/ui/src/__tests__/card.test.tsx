import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/card";

describe("Card", () => {
  describe("Card component", () => {
    it("renders children correctly", () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("applies default styles", () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId("card");
      expect(card).toHaveClass("rounded-lg", "border", "shadow-sm");
    });

    it("applies custom className", () => {
      render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>
      );
      expect(screen.getByTestId("card")).toHaveClass("custom-class");
    });

    it("forwards ref", () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Content</Card>);
      expect(ref).toHaveBeenCalled();
    });

    it("passes through additional props", () => {
      render(
        <Card data-testid="card" aria-label="Test card">
          Content
        </Card>
      );
      expect(screen.getByTestId("card")).toHaveAttribute(
        "aria-label",
        "Test card"
      );
    });
  });

  describe("CardHeader component", () => {
    it("renders children correctly", () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText("Header content")).toBeInTheDocument();
    });

    it("applies default styles", () => {
      render(<CardHeader data-testid="header">Content</CardHeader>);
      const header = screen.getByTestId("header");
      expect(header).toHaveClass("flex", "flex-col", "p-6");
    });

    it("applies custom className", () => {
      render(
        <CardHeader className="custom-header" data-testid="header">
          Content
        </CardHeader>
      );
      expect(screen.getByTestId("header")).toHaveClass("custom-header");
    });
  });

  describe("CardTitle component", () => {
    it("renders children correctly", () => {
      render(<CardTitle>Title text</CardTitle>);
      expect(screen.getByText("Title text")).toBeInTheDocument();
    });

    it("applies default styles", () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      const title = screen.getByTestId("title");
      expect(title).toHaveClass("text-2xl", "font-semibold");
    });

    it("applies custom className", () => {
      render(
        <CardTitle className="custom-title" data-testid="title">
          Title
        </CardTitle>
      );
      expect(screen.getByTestId("title")).toHaveClass("custom-title");
    });
  });

  describe("CardDescription component", () => {
    it("renders children correctly", () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });

    it("applies default styles", () => {
      render(
        <CardDescription data-testid="description">
          Description
        </CardDescription>
      );
      const description = screen.getByTestId("description");
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("applies custom className", () => {
      render(
        <CardDescription className="custom-desc" data-testid="description">
          Description
        </CardDescription>
      );
      expect(screen.getByTestId("description")).toHaveClass("custom-desc");
    });
  });

  describe("CardContent component", () => {
    it("renders children correctly", () => {
      render(<CardContent>Content text</CardContent>);
      expect(screen.getByText("Content text")).toBeInTheDocument();
    });

    it("applies default styles", () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId("content");
      expect(content).toHaveClass("p-6", "pt-0");
    });

    it("applies custom className", () => {
      render(
        <CardContent className="custom-content" data-testid="content">
          Content
        </CardContent>
      );
      expect(screen.getByTestId("content")).toHaveClass("custom-content");
    });
  });

  describe("CardFooter component", () => {
    it("renders children correctly", () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText("Footer content")).toBeInTheDocument();
    });

    it("applies default styles", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId("footer");
      expect(footer).toHaveClass("flex", "items-center", "p-6", "pt-0");
    });

    it("applies custom className", () => {
      render(
        <CardFooter className="custom-footer" data-testid="footer">
          Footer
        </CardFooter>
      );
      expect(screen.getByTestId("footer")).toHaveClass("custom-footer");
    });
  });

  describe("Card composition", () => {
    it("renders a complete card with all subcomponents", () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content of the card</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card description goes here")).toBeInTheDocument();
      expect(screen.getByText("Main content of the card")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    });
  });
});
