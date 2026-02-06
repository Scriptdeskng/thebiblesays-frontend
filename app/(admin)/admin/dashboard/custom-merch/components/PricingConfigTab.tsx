"use client";

import { Button, LoadingSpinner } from "@/components/admin/ui";
import type { PageTab, PricingConfig } from "../types";
import ValuePicker from "./ValuePicker";

interface PricingConfigTabProps {
  setPageTab: (tab: PageTab) => void;
  pricing: PricingConfig;
  setPricing: React.Dispatch<React.SetStateAction<PricingConfig>>;
  onSave: () => void;
  saving: boolean;
  loading: boolean;
}

const PLACEMENT_OPTIONS = [
  { key: "frontFee" as const, label: "Front" },
  { key: "backFee" as const, label: "Back" },
  { key: "sideFee" as const, label: "Side" },
];

export default function PricingConfigTab({
  setPageTab,
  pricing,
  setPricing,
  onSave,
  saving,
  loading,
}: PricingConfigTabProps) {
  if (loading) {
    return (
      <div className="overflow-hidden">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="py-6">
        <h2 className="text-lg font-semibold text-admin-primary">
          Pricing configuration
        </h2>
        <p className="text-sm text-admin-primary/70 mt-0.5">
          Set pricing rules for BYOM customizations
        </p>
      </div>

      <div className="bg-white rounded-xl py-4 px-3 space-y-8">
        <div>
          <h3 className="text-sm font-semibold text-admin-primary mb-3">
            Base Pricing
          </h3>

          <ValuePicker
            label="Base BYOM customization fee"
            value={pricing.baseFee}
            onChange={(baseFee) => setPricing((p) => ({ ...p, baseFee }))}
            step={1000}
            helperText="Applied to all BYOM orders regardless of configuration"
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-admin-primary mb-3">
            Individual Customization Fees
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ValuePicker
              label="Image customization fee"
              value={pricing.imageCustomizationFee}
              onChange={(imageCustomizationFee) =>
                setPricing((p) => ({ ...p, imageCustomizationFee }))
              }
              step={1000}
              helperText="Applied to all BYOM orders regardless of configuration"
            />
            <ValuePicker
              label="Texts customization fee"
              value={pricing.textsCustomizationFee}
              onChange={(textsCustomizationFee) =>
                setPricing((p) => ({ ...p, textsCustomizationFee }))
              }
              step={1000}
              helperText="Applied to all BYOM orders regardless of configuration"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-admin-primary mb-3">
            Per placement Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLACEMENT_OPTIONS.map(({ key, label }) => (
              <ValuePicker
                key={key}
                label={label}
                value={pricing[key]}
                onChange={(value) =>
                  setPricing((p) => ({ ...p, [key]: value }))
                }
                step={1000}
                inputClassName="w-32 px-4 py-2 border border-accent-2 rounded-lg text-admin-primary"
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => {
              setPageTab("custom-asset");
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving && <LoadingSpinner size="sm" />}
            Save pricing configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
