'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting anomalies in fleet data.
 *
 * The flow takes in fleet data and identifies unusual patterns or anomalies, such as sudden
 * increases in fuel consumption or unexpected mileage spikes, and returns an alert message.
 *
 * @interface DashboardAnomalyDetectionInput - The input type for the dashboardAnomalyDetection function.
 * @interface DashboardAnomalyDetectionOutput - The output type for the dashboardAnomalyDetection function.
 * @function dashboardAnomalyDetection - The function that handles the anomaly detection process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DashboardAnomalyDetectionInputSchema = z.object({
  fleetData: z
    .string()
    .describe('The fleet data in JSON format, including fuel consumption, mileage, etc.'),
});
export type DashboardAnomalyDetectionInput = z.infer<typeof DashboardAnomalyDetectionInputSchema>;

const DashboardAnomalyDetectionOutputSchema = z.object({
  alertMessage: z
    .string()
    .describe(
      'A message indicating any detected anomalies, or a message indicating no anomalies were found.'
    ),
});
export type DashboardAnomalyDetectionOutput = z.infer<typeof DashboardAnomalyDetectionOutputSchema>;

export async function dashboardAnomalyDetection(
  input: DashboardAnomalyDetectionInput
): Promise<DashboardAnomalyDetectionOutput> {
  return dashboardAnomalyDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dashboardAnomalyDetectionPrompt',
  input: {schema: DashboardAnomalyDetectionInputSchema},
  output: {schema: DashboardAnomalyDetectionOutputSchema},
  prompt: `You are an expert fleet data analyst. Your task is to analyze the given fleet data and identify any unusual patterns or anomalies.

Fleet Data: {{{fleetData}}}

Based on the data, please generate an alert message if you detect any anomalies such as:
- Sudden increase in fuel consumption for a specific vehicle or across the fleet.
- Unexpected mileage spikes for a vehicle.
- Any other unusual patterns that might indicate vehicle misuse or maintenance needs.
If no anomalies are found, respond with a message indicating that no anomalies were detected.
`,
});

const dashboardAnomalyDetectionFlow = ai.defineFlow(
  {
    name: 'dashboardAnomalyDetectionFlow',
    inputSchema: DashboardAnomalyDetectionInputSchema,
    outputSchema: DashboardAnomalyDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
