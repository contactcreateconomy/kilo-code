import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@createconomy/ui/components/card";
import { Badge } from "@createconomy/ui/components/badge";
import { Star } from "lucide-react";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          )}
          {/* Category Badge */}
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="shadow-sm">
              {product.category.name}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-1 font-semibold group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            by {product.seller.name}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between px-4 pb-4 pt-0">
          <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
            <span className="text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
