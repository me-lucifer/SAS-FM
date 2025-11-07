
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts an array of objects to a CSV string and triggers a download.
 * @param data The array of objects to convert.
 * @param reportName The name of the report for the filename.
 * @param fleet The fleet name to include in the filename.
 */
export function exportToCsv(data: any[], reportName: string, fleet: string = 'all') {
  if (!data.length) {
    alert('No data to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers
        .map(fieldName => {
          let field = row[fieldName];
          if (field === null || field === undefined) {
            return '';
          }
          // Escape quotes by doubling them
          const escapedField = field.toString().replace(/"/g, '""');
          // Enclose in quotes if it contains a comma, newline, or quote
          if (/[",\n]/.test(escapedField)) {
            return `"${escapedField}"`;
          }
          return escapedField;
        })
        .join(',')
    ),
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const date = format(new Date(), 'yyyy-MM-dd');
  const filename = `${reportName}_${date}_${fleet}.csv`;

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
