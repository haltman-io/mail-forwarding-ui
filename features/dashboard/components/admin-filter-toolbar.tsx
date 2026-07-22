"use client";

import * as React from "react";
import { RefreshCw, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminToolbar,
  AdminToolbarLeft,
  AdminToolbarRight,
} from "@/features/dashboard/components/admin-toolbar";

export type SearchFieldOption = {
  value: string;
  label: string;
  placeholder?: string;
};

export function AdminFilterToolbar({
  fields,
  field,
  onFieldChange,
  query,
  onQueryChange,
  filters,
  onRefresh,
  refreshing,
  hasActiveFilters,
  onClearFilters,
  rightExtra,
}: {
  fields?: SearchFieldOption[];
  field?: string;
  onFieldChange?: (value: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  filters?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  rightExtra?: React.ReactNode;
}) {
  const activeField = fields?.find((f) => f.value === field) ?? fields?.[0];
  const placeholder = activeField?.placeholder ?? "Search…";

  return (
    <AdminToolbar>
      <AdminToolbarLeft className="flex-wrap">
        {fields && fields.length > 1 && onFieldChange ? (
          <Select value={field ?? fields[0]?.value} onValueChange={onFieldChange}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Field" />
            </SelectTrigger>
            <SelectContent>
              {fields.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="h-8 w-[200px] pl-8 pr-8 text-xs sm:w-[240px]"
          />
          {query ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {filters}
      </AdminToolbarLeft>

      <AdminToolbarRight>
        {hasActiveFilters && onClearFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={onClearFilters}
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        ) : null}
        {rightExtra}
        {onRefresh ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        ) : null}
      </AdminToolbarRight>
    </AdminToolbar>
  );
}
