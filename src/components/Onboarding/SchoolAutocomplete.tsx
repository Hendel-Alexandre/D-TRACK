import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Sample data - in production, this would come from an API
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Japan', 'China', 'India', 'Brazil'
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Boston', 'San Francisco'],
  'United Kingdom': ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Cambridge', 'Oxford'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  'Germany': ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'],
  'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
};

const SCHOOLS_BY_LOCATION: Record<string, string[]> = {
  'United States-New York': ['Columbia University', 'New York University', 'Cornell University', 'Fordham University'],
  'United States-Boston': ['Harvard University', 'MIT', 'Boston University', 'Northeastern University'],
  'United States-San Francisco': ['Stanford University', 'UC Berkeley', 'San Francisco State University'],
  'United Kingdom-London': ['Imperial College London', 'UCL', 'Kings College London', 'LSE'],
  'United Kingdom-Cambridge': ['University of Cambridge', 'Anglia Ruskin University'],
  'United Kingdom-Oxford': ['University of Oxford', 'Oxford Brookes University'],
  'Canada-Toronto': ['University of Toronto', 'York University', 'Ryerson University'],
  'Canada-Vancouver': ['University of British Columbia', 'Simon Fraser University'],
  'Australia-Sydney': ['University of Sydney', 'UNSW Sydney', 'UTS'],
  'Australia-Melbourne': ['University of Melbourne', 'Monash University', 'RMIT University'],
};

interface SchoolAutocompleteProps {
  onSchoolChange: (school: string) => void;
  defaultSchool?: string;
}

export function SchoolAutocomplete({ onSchoolChange, defaultSchool = '' }: SchoolAutocompleteProps) {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [school, setSchool] = useState(defaultSchool);
  const [customSchool, setCustomSchool] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const [openCountry, setOpenCountry] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [openSchool, setOpenSchool] = useState(false);

  const cities = country ? CITIES_BY_COUNTRY[country] || [] : [];
  const schools = country && city ? SCHOOLS_BY_LOCATION[`${country}-${city}`] || [] : [];

  useEffect(() => {
    if (school && !showCustomInput) {
      onSchoolChange(school);
    } else if (customSchool && showCustomInput) {
      onSchoolChange(customSchool);
    }
  }, [school, customSchool, showCustomInput, onSchoolChange]);

  return (
    <div className="space-y-4">
      {/* Country Selector */}
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Popover open={openCountry} onOpenChange={setOpenCountry}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCountry}
              className="w-full justify-between input-sleek"
            >
              {country || "Select country..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {COUNTRIES.map((c) => (
                    <CommandItem
                      key={c}
                      value={c}
                      onSelect={(currentValue) => {
                        setCountry(currentValue === country ? "" : c);
                        setCity('');
                        setSchool('');
                        setOpenCountry(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          country === c ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {c}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* City Selector */}
      {country && (
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Popover open={openCity} onOpenChange={setOpenCity}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCity}
                className="w-full justify-between input-sleek"
              >
                {city || "Select city..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {cities.map((c) => (
                      <CommandItem
                        key={c}
                        value={c}
                        onSelect={(currentValue) => {
                          setCity(currentValue === city ? "" : c);
                          setSchool('');
                          setOpenCity(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            city === c ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {c}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* School Selector */}
      {country && city && !showCustomInput && (
        <div className="space-y-2">
          <Label htmlFor="school">School Name</Label>
          <Popover open={openSchool} onOpenChange={setOpenSchool}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSchool}
                className="w-full justify-between input-sleek"
              >
                {school || "Select school..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search school..." />
                <CommandList>
                  <CommandEmpty>
                    <div className="p-2 text-center">
                      <p className="text-sm text-muted-foreground mb-2">School not found?</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustomInput(true);
                          setOpenSchool(false);
                        }}
                      >
                        Add manually
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {schools.map((s) => (
                      <CommandItem
                        key={s}
                        value={s}
                        onSelect={(currentValue) => {
                          setSchool(currentValue === school ? "" : s);
                          setOpenSchool(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            school === s ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {s}
                      </CommandItem>
                    ))}
                    <CommandItem
                      onSelect={() => {
                        setShowCustomInput(true);
                        setOpenSchool(false);
                      }}
                      className="border-t"
                    >
                      <span className="text-sm text-muted-foreground">+ Add school manually</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Custom School Input */}
      {showCustomInput && (
        <div className="space-y-2">
          <Label htmlFor="customSchool">School Name (Custom)</Label>
          <div className="flex gap-2">
            <Input
              id="customSchool"
              value={customSchool}
              onChange={(e) => setCustomSchool(e.target.value)}
              placeholder="Enter your school name"
              className="input-sleek"
            />
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomInput(false);
                setCustomSchool('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
