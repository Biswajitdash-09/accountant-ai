import React from "react";
import { Button } from "@/components/ui/button";

export type TaxCountry = 'USA' | 'UK' | 'India' | 'Nigeria';

interface TaxCountrySelectorProps {
  value: TaxCountry;
  onChange: (value: TaxCountry) => void;
}

export const TaxCountrySelector: React.FC<TaxCountrySelectorProps> = ({ value, onChange }) => {
  const options: TaxCountry[] = ['USA', 'UK', 'India', 'Nigeria'];

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select tax country">
      {options.map((opt) => (
        <Button
          key={opt}
          type="button"
          variant={value === opt ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
          className="px-4"
        >
          {opt}
        </Button>
      ))}
    </div>
  );
};

export default TaxCountrySelector;
