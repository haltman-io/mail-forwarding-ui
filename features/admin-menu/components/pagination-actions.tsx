import { Button } from "@/components/ui/button";
import type { ListState } from "@/features/admin-menu/types/admin-menu.types";

type PaginationActionsProps = {
  state: ListState<unknown>;
  onPrevious: () => void;
  onNext: () => void;
  busy: boolean;
};

export function PaginationActions({
  state,
  onPrevious,
  onNext,
  busy,
}: PaginationActionsProps) {
  const from = state.total === 0 ? 0 : state.offset + 1;
  const to = Math.min(state.offset + state.limit, state.total);
  const canPrev = state.offset > 0;
  const canNext = state.offset + state.limit < state.total;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
      <span>
        {from}-{to} of {state.total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev || busy}
          className="h-7 border-white/10 bg-white/5 px-2.5 text-zinc-200 hover:bg-white/10"
          onClick={onPrevious}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext || busy}
          className="h-7 border-white/10 bg-white/5 px-2.5 text-zinc-200 hover:bg-white/10"
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
