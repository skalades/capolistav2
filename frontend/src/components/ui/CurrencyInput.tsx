import * as React from "react";

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number | string;
  onChange?: (value: string | number) => void;
}

export function CurrencyInput({ value, onChange, name, className, required, defaultValue, ...props }: CurrencyInputProps & { defaultValue?: number | string }) {
  const [internalRawValue, setInternalRawValue] = React.useState<number | string>(defaultValue !== undefined ? defaultValue : "");

  const isControlled = value !== undefined;
  const rawVal = isControlled ? value : internalRawValue;
  const displayValue = (rawVal === "" || rawVal === null || rawVal === undefined || isNaN(Number(rawVal))) 
    ? "" 
    : Number(rawVal).toLocaleString('id-ID');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawStr = e.target.value.replace(/\D/g, "");
    const newVal = rawStr === "" ? "" : Number(rawStr);
    
    if (!isControlled) {
      setInternalRawValue(newVal);
    }

    if (onChange) {
      onChange(newVal);
    }
  };

  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-capo-ink-soft text-[12px] md:text-[14px] font-medium pointer-events-none">Rp</span>
      <input
        type="text"
        className={`pl-8 ${className || ''}`}
        value={displayValue}
        onChange={handleChange}
        required={required}
        {...props}
      />
      {name && <input type="hidden" name={name} value={rawVal} />}
    </div>
  );
}
