import mammoth from "mammoth";
import readXlsxFile from "read-excel-file/browser";

interface ContentBlock {
  type: "text" | "code" | "image";
  content: string;
}

export interface ParsedLecture {
  title: string;
  description: string;
  video_url: string;
  pdf_url: string;
  slot_number: number;
  content_blocks: ContentBlock[];
}

/**
 * Parses a DOCX file and extracts content for lectures.
 * Assumes:
 * - H1 tags are lecture titles.
 * - H2 tags are content block titles.
 * - P tags are text content blocks.
 * - Images are image content blocks (will try to extract base64, but external URLs are better).
 */
export async function parseDocx(file: File): Promise<ParsedLecture[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
  const html = result.value;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const lectures: ParsedLecture[] = [];
  let currentLecture: ParsedLecture | null = null;
  let slotNumber = 1;

  doc.body.childNodes.forEach((node) => {
    if (node.nodeName === "H1") {
      if (currentLecture) {
        lectures.push(currentLecture);
      }
      currentLecture = {
        title: node.textContent?.trim() || `Lecture ${slotNumber}`,
        description: "",
        video_url: "",
        pdf_url: "",
        slot_number: slotNumber++,
        content_blocks: [],
      };
    } else if (currentLecture) {
      if (node.nodeName === "P") {
        currentLecture.content_blocks.push({
          type: "text",
          content: node.textContent?.trim() || "",
        });
      } else if (node.nodeName === "IMG") {
        // Mammoth converts images to base64 data URLs
        const img = node as HTMLImageElement;
        currentLecture.content_blocks.push({
          type: "image",
          content: img.src, // This will be a base64 string
        });
      }
      // Add more parsing for other HTML elements if needed (e.g., code blocks from pre tags)
    }
  });

  if (currentLecture) {
    lectures.push(currentLecture);
  }

  return lectures;
}

/**
 * Parses an XLSX file and extracts content for lectures.
 * Assumes the first sheet has columns:
 * "Title", "Description", "Video URL", "PDF URL", "Content Type 1", "Content 1", "Content Type 2", "Content 2", ...
 */
export async function parseXlsx(file: File): Promise<ParsedLecture[]> {
  const rows = await readXlsxFile(file);

  // Assumes the first row contains headers
  const headers = rows[0] as string[];
  const dataRows = rows.slice(1);

  const lectures: ParsedLecture[] = [];
  let slotNumber = 1;

  dataRows.forEach((row, rowIndex) => {
    const rowData: Record<string, any> = {};
    headers.forEach((header, colIndex) => {
      rowData[header] = row[colIndex];
    });

    const content_blocks: ContentBlock[] = [];
    for (let i = 1; ; i++) {
      const contentTypeKey = `Content Type ${i}`;
      const contentKey = `Content ${i}`;
      if (rowData[contentTypeKey] && rowData[contentKey]) {
        content_blocks.push({
          type: String(rowData[contentTypeKey]).toLowerCase() as
            | "text"
            | "code"
            | "image",
          content: String(rowData[contentKey]),
        });
      } else {
        break;
      }
    }

    lectures.push({
      title: String(rowData["Title"] || `Lecture ${slotNumber}`),
      description: String(rowData["Description"] || ""),
      video_url: String(rowData["Video URL"] || ""),
      pdf_url: String(rowData["PDF URL"] || ""),
      slot_number: slotNumber++,
      content_blocks: content_blocks,
    });
  });

  return lectures;
}
