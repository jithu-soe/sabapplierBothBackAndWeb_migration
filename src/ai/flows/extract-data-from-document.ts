'use server';
/**
 * @fileOverview An AI agent for extracting data from uploaded documents.
 *
 * - extractDataFromDocument - A function that handles the data extraction process.
 * - ExtractDataFromDocumentInput - The input type for the extractDataFromDocument function.
 * - ExtractDataFromDocumentOutput - The return type for the extractDataFromDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDataFromDocumentInputSchema = z.object({
  dataUri: z
    .string()
    .describe(
      "The document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  docType: z.string().describe('The type of the document (e.g., aadhaar_card).'),
});
export type ExtractDataFromDocumentInput = z.infer<typeof ExtractDataFromDocumentInputSchema>;

const ExtractDataFromDocumentOutputSchema = z.object({
  extractedData: z.record(z.string(), z.any()).describe('The extracted data from the document as a JSON object.'),
});
export type ExtractDataFromDocumentOutput = z.infer<typeof ExtractDataFromDocumentOutputSchema>;

export async function extractDataFromDocument(input: ExtractDataFromDocumentInput): Promise<ExtractDataFromDocumentOutput> {
  return extractDataFromDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDataFromDocumentPrompt',
  input: {schema: ExtractDataFromDocumentInputSchema},
  output: {schema: ExtractDataFromDocumentOutputSchema},
  prompt: `You are an expert in document analysis and data extraction. Your task is to extract all relevant fields from the given document.

Document Type: {{{docType}}}

Here is the document:
{{media url=dataUri}}

Extract all identifiable fields from the document, and return a JSON object containing the extracted data. If the document is of low quality and data cannot be reliably extracted, return a JSON object with an "error" field set to "low_quality". Ensure the output is a valid JSON object.
`,
});

const extractDataFromDocumentFlow = ai.defineFlow(
  {
    name: 'extractDataFromDocumentFlow',
    inputSchema: ExtractDataFromDocumentInputSchema,
    outputSchema: ExtractDataFromDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
