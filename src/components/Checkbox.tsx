"use client";
import React from "react";

type Props = {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
};

export default function Checkbox({ label, checked, onChange }: Props) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
