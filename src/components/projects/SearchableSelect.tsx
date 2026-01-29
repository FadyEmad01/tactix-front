"use client";

import { useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

export interface SearchSelectItem {
  id: string;
  name: string;
  logo?: string;
  secondaryLogo?: string; // Added for Match (Team B Logo)
  subtitle?: string;      // Added for Match (Date & Result)
}

export function SearchableSelect({
  value,
  onChange,
  placeholder,
  items,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  items: SearchSelectItem[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selectedItem = items.find((i) => i.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-9 py-2 px-3", // Adjusted height for multi-line
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-2 text-left">
            {selectedItem ? (
              <>
                {/* Logo Logic for Trigger */}
                <div className="flex items-center -space-x-2 shrink-0">
                    {selectedItem.logo && (
                    <img
                        src={selectedItem.logo}
                        alt="logo A"
                        // className="size-8 bg-white/20 backdrop-blur-sm p-[1px] border border-border rounded-full object-scale-down"
                        className="size-6 object-scale-down"
                    />
                    )}
                    {selectedItem.secondaryLogo && (
                    <img
                        src={selectedItem.secondaryLogo}
                        alt="logo B"
                        className="size-8 object-scale-down"
                    />
                    )}
                </div>
                
                {/* Text Logic for Trigger */}
                <div className="flex flex-col leading-tight">
                   <span className="truncate font-medium">{selectedItem.name}</span>
                   {selectedItem.subtitle && (
                       <span className="text-xs text-muted-foreground">{selectedItem.subtitle}</span>
                   )}
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>

          <ChevronDownIcon size={16} className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[300px] p-0" side="bottom"> 
      {/* Increased width slightly for better readability of long dates */}
        <Command>
          <CommandInput placeholder={`Search ${placeholder}...`} />
          {/* Scroll fix applied here */}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name + " " + (item.subtitle || "")} // Allow searching by subtitle (date/result)
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    
                    {/* Left Side: Logos */}
                    {(item.logo || item.secondaryLogo) && (
                        <div className="flex items-center -space-x-2 shrink-0">
                            {item.logo && (
                                <img
                                src={item.logo}
                                // className="size-8 bg-white/20 backdrop-blur-sm p-[1px] border border-border rounded-full object-scale-down"
                                className="size-8 object-scale-down"
                                alt="Team A"
                                />
                            )}
                            {item.secondaryLogo && (
                                <img
                                src={item.secondaryLogo}
                                className="size-8 object-scale-down"
                                alt="Team B"
                                />
                            )}
                        </div>
                    )}

                    {/* Right Side: Text */}
                    <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        {item.subtitle && (
                            <span className="text-xs text-muted-foreground">
                                {item.subtitle}
                            </span>
                        )}
                    </div>
                  </div>

                  {value === item.id && (
                    <CheckIcon className="ml-auto h-4 w-4 shrink-0" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
