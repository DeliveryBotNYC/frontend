/**
 * Convert array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Array of header objects with title and value properties
 * @returns CSV formatted string
 */
export const convertToCSV = (
  data: any[],
  headers: Array<{ title: string; value: string }>
): string => {
  // Create header row using the titles
  const headerRow = headers.map((header) => `"${header.title}"`).join(",");

  // Create data rows
  const dataRows = data.map((item) => {
    return headers
      .map((header) => {
        // Handle nested values with dot notation (e.g., 'address.formatted')
        const value = getNestedValue(item, header.value);

        // Handle special cases like formatted dates, ensure proper CSV escaping
        let formattedValue =
          value === null || value === undefined ? "" : String(value);

        // Escape quotes and wrap in quotes to handle commas in values
        formattedValue = formattedValue.replace(/"/g, '""');
        return `"${formattedValue}"`;
      })
      .join(",");
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join("\n");
};

/**
 * Get nested property value using dot notation
 * @param obj Object to extract value from
 * @param path Path to value using dot notation (e.g., 'address.formatted')
 * @returns The value at the specified path or undefined if not found
 */
const getNestedValue = (obj: any, path: string): any => {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return "";
    }
    result = result[key];
  }

  return result;
};

/**
 * Download data as a CSV file
 * @param data CSV formatted string
 * @param filename Name of the file to download
 */
export const downloadCSV = (data: string, filename: string): void => {
  // Create a blob with the CSV data
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });

  // Create a link to download the blob
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  // Add the link to the DOM, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to CSV and download it
 * @param data Array of objects to export
 * @param headers Array of header objects with title and value properties
 * @param filename Name of the file to download
 */
export const exportToCSV = (
  data: any[],
  headers: Array<{ title: string; value: string }>,
  filename: string
): void => {
  const csvData = convertToCSV(data, headers);
  downloadCSV(csvData, filename);
};
