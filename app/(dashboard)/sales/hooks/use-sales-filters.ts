import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

export function useSalesFilters() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("")
  );
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault("")
  );

  return {
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
  };
}
