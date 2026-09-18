"use client";

import { ListFilter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { countActiveFilters, defaultExpenseFilters, type ExpenseFilters } from "@/lib/expenses/filters";
import { EXPENSE_CATEGORIES, getCategoryMeta } from "@/lib/expenses/categories";
import type { RoomMember } from "@/types/database";

export function ExpensesToolbar({
  members,
  filters,
  onChange,
}: {
  members: RoomMember[];
  filters: ExpenseFilters;
  onChange: (next: ExpenseFilters) => void;
}) {
  const activeCount = countActiveFilters(filters);

  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search expenses..."
          className="pl-9"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative shrink-0">
            <ListFilter className="size-4" />
            {activeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Filters</p>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...defaultExpenseFilters, search: filters.search })}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" /> Clear
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Paid by</Label>
            <Select
              value={filters.paidBy}
              onValueChange={(value) => onChange({ ...filters, paidBy: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Anyone</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => onChange({ ...filters, category: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any category</SelectItem>
                {EXPENSE_CATEGORIES.map((value) => {
                  const meta = getCategoryMeta(value);
                  return (
                    <SelectItem key={value} value={value}>
                      <meta.icon className="size-4 text-muted-foreground" />
                      {meta.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="filter-from">From</Label>
              <Input
                id="filter-from"
                type="date"
                value={filters.fromDate}
                onChange={(e) => onChange({ ...filters, fromDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-to">To</Label>
              <Input
                id="filter-to"
                type="date"
                value={filters.toDate}
                onChange={(e) => onChange({ ...filters, toDate: e.target.value })}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
