"use client";

import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
  disabled = false
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (value: string) => {
    if (value === "") {
      // If "All Categories" is clicked, clear all selections
      onChange([]);
    } else {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onChange(newValues);
    }
  };

  const selectedLabels = options
    .filter(option => selectedValues.includes(option.value.toString()))
    .map(option => option.label)
    .join(", ");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-1 text-left text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:border-blue-400 transition-colors appearance-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        disabled={disabled}
      >
        <div className="flex justify-between items-center">
          <span className="truncate text-sm">
            {selectedValues.length > 0 ? selectedLabels : placeholder}
          </span>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div
            className="flex items-center px-3 py-1 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
            onClick={() => handleOptionClick("")}
          >
            <div className={`w-4 h-4 border rounded flex items-center justify-center mr-2 ${
              selectedValues.length === 0
                ? 'bg-[#a02337] border-[#a02337]'
                : 'border-gray-300'
            }`}>
              {selectedValues.length === 0 && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <span className="text-sm">All Categories</span>
          </div>
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center px-3 py-1 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleOptionClick(option.value.toString())}
            >
              <div className={`w-4 h-4 border rounded flex items-center justify-center mr-2 ${
                selectedValues.includes(option.value.toString())
                  ? 'bg-[#a02337] border-[#a02337]'
                  : 'border-gray-300'
              }`}>
                {selectedValues.includes(option.value.toString()) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 