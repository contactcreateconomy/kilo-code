'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';

// Mock data - in production this would come from Convex
const initialCategories = [
  {
    id: '1',
    name: 'Digital Art',
    slug: 'digital-art',
    description: 'Digital artwork and illustrations',
    productCount: 125,
    order: 1,
  },
  {
    id: '2',
    name: 'Design',
    slug: 'design',
    description: 'UI kits, templates, and design resources',
    productCount: 89,
    order: 2,
  },
  {
    id: '3',
    name: 'Photography',
    slug: 'photography',
    description: 'Stock photos and photography presets',
    productCount: 234,
    order: 3,
  },
  {
    id: '4',
    name: '3D Assets',
    slug: '3d-assets',
    description: '3D models and assets',
    productCount: 67,
    order: 4,
  },
  {
    id: '5',
    name: 'Audio',
    slug: 'audio',
    description: 'Music, sound effects, and audio resources',
    productCount: 156,
    order: 5,
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = categories.findIndex((c) => c.id === draggedItem);
    const targetIndex = categories.findIndex((c) => c.id === targetId);

    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, removed);

    // Update order numbers
    newCategories.forEach((cat, index) => {
      cat.order = index + 1;
    });

    setCategories(newCategories);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    // In production, save the new order to Convex
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories. Drag to reorder.
          </p>
        </div>
        <Link
          href="/categories/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Category
        </Link>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-4 border-b bg-muted/50">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Name</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Products</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>
        <div>
          {categories.map((category) => (
            <div
              key={category.id}
              draggable
              onDragStart={() => handleDragStart(category.id)}
              onDragOver={(e) => handleDragOver(e, category.id)}
              onDragEnd={handleDragEnd}
              className={`grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 items-center cursor-move hover:bg-muted/50 transition-colors ${
                draggedItem === category.id ? 'opacity-50 bg-muted' : ''
              }`}
            >
              <div className="col-span-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                  {category.order}
                </div>
              </div>
              <div className="col-span-3">
                <div>
                  <span className="font-medium">{category.name}</span>
                  <p className="text-xs text-muted-foreground">
                    /{category.slug}
                  </p>
                </div>
              </div>
              <div className="col-span-4 text-muted-foreground text-sm">
                {category.description}
              </div>
              <div className="col-span-2">
                <span className="badge badge-info">
                  {category.productCount} products
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Link
                  href={`/categories/${category.id}`}
                  className="text-primary hover:underline text-sm"
                >
                  Edit
                </Link>
                <button className="text-destructive hover:underline text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Save Order
        </button>
      </div>
    </div>
  );
}
