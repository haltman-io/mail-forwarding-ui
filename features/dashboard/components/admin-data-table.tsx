"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminDataCard } from "@/features/dashboard/components/admin-data-card";
import { EmptyState } from "@/features/dashboard/components/empty-state";
import { PAGE_SIZE_OPTIONS } from "@/features/dashboard/lib/admin-utils";
import { cn } from "@/lib/utils";

export type AdminDataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  total: number;
  offset: number;
  limit: number;
  loading?: boolean;
  getRowId?: (row: TData) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  filterActive?: boolean;
  filterLabel?: string;
  onClearFilters?: () => void;
  onPageChange: (offset: number) => void;
  onPageSizeChange: (limit: number) => void;
  enableSelection?: boolean;
  bulkActions?: React.ReactNode | ((ctx: {
    selectedRows: TData[];
    clearSelection: () => void;
    table: TanstackTable<TData>;
  }) => React.ReactNode);
  className?: string;
};

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ArrowUp className="ml-1 h-3 w-3" />;
  if (sorted === "desc") return <ArrowDown className="ml-1 h-3 w-3" />;
  return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
}

export function AdminDataTable<TData>({
  columns,
  data,
  total,
  offset,
  limit,
  loading = false,
  getRowId,
  emptyTitle = "No results",
  emptyDescription,
  emptyIcon,
  emptyAction,
  filterActive = false,
  filterLabel,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  enableSelection = false,
  bulkActions,
  className,
}: AdminDataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const selectionColumn = React.useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!enableSelection) return [];
    return [
      {
        id: "__select",
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all rows on this page"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 40,
      },
    ];
  }, [enableSelection]);

  const table = useReactTable({
    data,
    columns: [...selectionColumn, ...columns],
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    enableRowSelection: enableSelection,
    getRowId: getRowId
      ? (row) => getRowId(row)
      : undefined,
  });

  React.useEffect(() => {
    setRowSelection({});
  }, [data, offset, limit]);

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);
  const page = Math.floor(offset / Math.max(limit, 1)) + 1;
  const pageCount = Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const clearSelection = () => setRowSelection({});

  const bulk =
    typeof bulkActions === "function"
      ? bulkActions({ selectedRows, clearSelection, table })
      : bulkActions;

  const showEmpty = !loading && data.length === 0;
  const showTable = data.length > 0 || loading;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {enableSelection && selectedRows.length > 0 && bulk ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[rgba(48,209,88,0.18)] bg-[rgba(48,209,88,0.06)] px-4 py-2.5">
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {selectedRows.length} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">{bulk}</div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 text-xs"
            onClick={clearSelection}
          >
            Clear
          </Button>
        </div>
      ) : null}

      <AdminDataCard>
        {loading && data.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : showEmpty && filterActive ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
            <Search className="h-5 w-5 text-[var(--text-muted)]" />
            <p className="text-[13px] text-[var(--text-muted)]">
              {filterLabel
                ? `No results matching “${filterLabel}”`
                : "No results for the current filters."}
            </p>
            {onClearFilters ? (
              <Button variant="outline" size="sm" className="h-8" onClick={onClearFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : showEmpty ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
          />
        ) : showTable ? (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "text-xs font-medium uppercase tracking-wider text-muted-foreground",
                            header.id === "__select" && "w-10 pl-4",
                            header.column.columnDef.meta &&
                              (header.column.columnDef.meta as { className?: string }).className,
                          )}
                          style={{
                            width:
                              header.getSize() !== 150 ? header.getSize() : undefined,
                          }}
                        >
                          {header.isPlaceholder ? null : canSort ? (
                            <button
                              type="button"
                              className="inline-flex items-center gap-0.5 transition-colors hover:text-[var(--text-primary)]"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              <SortIcon sorted={header.column.getIsSorted()} />
                            </button>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading && data.length > 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-16 text-center text-xs text-muted-foreground"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Updating…
                      </span>
                    </TableCell>
                  </TableRow>
                ) : null}
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className="group transition-colors hover:bg-[var(--hover-state)]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.id === "__select" && "pl-4",
                          cell.column.columnDef.meta &&
                            (cell.column.columnDef.meta as { className?: string }).className,
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 border-t border-[var(--hairline-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs tabular-nums text-muted-foreground">
                {from}–{to} of {total}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Rows</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(v) => onPageSizeChange(Number(v))}
                  >
                    <SelectTrigger className="h-7 w-[72px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  Page {page} / {pageCount}
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={!canPrev || loading}
                    onClick={() => onPageChange(0)}
                    title="First page"
                  >
                    <ChevronsLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={!canPrev || loading}
                    onClick={() => onPageChange(Math.max(0, offset - limit))}
                    title="Previous page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={!canNext || loading}
                    onClick={() => onPageChange(offset + limit)}
                    title="Next page"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={!canNext || loading}
                    onClick={() =>
                      onPageChange(Math.max(0, (pageCount - 1) * limit))
                    }
                    title="Last page"
                  >
                    <ChevronsRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </AdminDataCard>
    </div>
  );
}
