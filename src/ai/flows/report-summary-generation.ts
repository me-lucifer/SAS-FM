'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a summarized report on fleet performance for a selected date range.
 *
 * - `generateReportSummary` - A function that takes a date range and fleet performance data as input and returns a summarized report.
 * - `ReportSummaryInput` - The input type for the `generateReportSummary` function.
 * - `ReportSummaryOutput` - The return type for the `generateReportSummary` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportSummaryInputSchema = z.object({
  startDate: z.string().describe('The start date for the report (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date for the report (YYYY-MM-DD).'),
  fleetPerformanceData: z.string().describe('Fleet performance data in JSON format.'),
});

export type ReportSummaryInput = z.infer<typeof ReportSummaryInputSchema>;

const ReportSummaryOutputSchema = z.object({
  summary: z.string().describe('A summarized report on fleet performance for the selected date range.'),
});

export type ReportSummaryOutput = z.infer<typeof ReportSummaryOutputSchema>;

export async function generateReportSummary(input: ReportSummaryInput): Promise<ReportSummaryOutput> {
  return reportSummaryFlow(input);
}

const reportSummaryPrompt = ai.definePrompt({
  name: 'reportSummaryPrompt',
  input: {schema: ReportSummaryInputSchema},
  output: {schema: ReportSummaryOutputSchema},
  prompt: `You are an expert fleet manager and data analyst.
  Your goal is to generate a concise and informative summary of fleet performance based on the provided data.
  The summary should highlight key metrics, identify trends, and suggest potential areas for improvement.
  The report should be no more than 200 words.

  Date Range: {{startDate}} - {{endDate}}
  Fleet Performance Data: {{{fleetPerformanceData}}}
  
  Summary:
  `,
});

const reportSummaryFlow = ai.defineFlow(
  {
    name: 'reportSummaryFlow',
    inputSchema: ReportSummaryInputSchema,
    outputSchema: ReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await reportSummaryPrompt(input);
    return output!;
  }
);
