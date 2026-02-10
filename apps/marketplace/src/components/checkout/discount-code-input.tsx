"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { Button, Input } from "@createconomy/ui";
import { useToast } from "@createconomy/ui";
import { Tag, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscountCodeInputProps {
  orderAmount?: number; // cents
  productId?: string;
  onApply?: (discount: {
    offerCodeId: string;
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    discountAmount: number;
  }) => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * Discount code input for checkout.
 * Validates codes in real-time via Convex query.
 */
export function DiscountCodeInput({
  orderAmount,
  productId,
  onApply,
  onRemove,
  className,
}: DiscountCodeInputProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCode, setAppliedCode] = useState<{
    offerCodeId: string;
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const toast = useToast();

  // We validate on button click, not real-time, to avoid unnecessary queries
  const validation = useQuery(
    api.functions.offerCodes.validateOfferCode,
    isValidating && code.trim()
      ? {
          code: code.trim(),
          ...(productId ? { productId: productId as Id<"products"> } : {}),
          ...(orderAmount ? { orderAmount } : {}),
        }
      : "skip"
  );

  // Handle validation result
  if (isValidating && validation !== undefined) {
    setIsValidating(false);
    if (validation.valid && validation.offerCode) {
      const discount = {
        offerCodeId: validation.offerCode._id,
        code: validation.offerCode.code,
        discountType: validation.offerCode.discountType as "percent" | "fixed",
        discountValue: validation.offerCode.discountValue,
        discountAmount: validation.offerCode.discountAmount,
      };
      setAppliedCode(discount);
      onApply?.(discount);
      toast.addToast("Discount code applied!", "success");
    } else {
      toast.addToast(validation.message ?? "Invalid code", "error");
    }
  }

  function handleApply() {
    if (!code.trim()) {
      toast.addToast("Please enter a discount code", "error");
      return;
    }
    setIsValidating(true);
  }

  function handleRemove() {
    setAppliedCode(null);
    setCode("");
    onRemove?.();
  }

  if (appliedCode) {
    return (
      <div className={cn("flex items-center gap-2 rounded-md border bg-green-50 p-3 dark:bg-green-950/20", className)}>
        <Check className="h-4 w-4 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {appliedCode.code}
          </p>
          <p className="text-xs text-green-600 dark:text-green-500">
            {appliedCode.discountType === "percent"
              ? `${appliedCode.discountValue}% off`
              : `$${(appliedCode.discountValue / 100).toFixed(2)} off`}
            {appliedCode.discountAmount > 0 &&
              ` — saving $${(appliedCode.discountAmount / 100).toFixed(2)}`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="h-7 w-7 p-0 text-green-600 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Discount code"
          className="pl-9 uppercase"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
        />
      </div>
      <Button
        variant="outline"
        size="default"
        onClick={handleApply}
        disabled={isValidating || !code.trim()}
      >
        {isValidating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Apply"
        )}
      </Button>
    </div>
  );
}
