type CsvValue = string | number | boolean | null | undefined;

/** Serializes ordered columns and records as RFC 4180-compatible CSV. */
export function toCsv<Row extends Record<string, CsvValue>>(
  columns: readonly (keyof Row)[],
  rows: readonly Row[],
): string {
  const header = columns.map((column) => escapeCsvValue(String(column)));
  const records = rows.map((row) =>
    columns.map((column) => escapeCsvValue(row[column])).join(","),
  );

  return [header.join(","), ...records].join("\r\n");
}

function escapeCsvValue(value: CsvValue): string {
  const text = value === null || value === undefined ? "" : String(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}
