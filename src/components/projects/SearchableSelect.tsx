"use client";

import { useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
                      <Avatar className="size-6">
                        <AvatarImage src={selectedItem.logo} alt="Team A" className="object-scale-down" />
                        <AvatarFallback className="text-[8px] font-bold">
                          {getInitials(selectedItem.name.split(" vs ")[0])}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {selectedItem.secondaryLogo && (
                      <Avatar className="size-8">
                        <AvatarImage src={selectedItem.secondaryLogo} alt="Team B" className="object-scale-down" />
                        <AvatarFallback className="text-[10px] font-bold">
                          {getInitials(selectedItem.name.split(" vs ")[1])}
                        </AvatarFallback>
                      </Avatar>
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
                              <Avatar className="size-8">
                                <AvatarImage src={item.logo} alt="Team A" className="object-scale-down" />
                                <AvatarFallback className="text-[10px] font-bold">
                                  {getInitials(item.name.split(" vs ")[0])}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {item.secondaryLogo && (
                              <Avatar className="size-8">
                                <AvatarImage src={item.secondaryLogo} alt="Team B" className="object-scale-down" />
                                <AvatarFallback className="text-[10px] font-bold">
                                  {getInitials(item.name.split(" vs ")[1])}
                                </AvatarFallback>
                              </Avatar>
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
