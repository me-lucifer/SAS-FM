'use server';

import { dashboardAnomalyDetection } from '@/ai/flows/dashboard-anomaly-detection';
import { anomalyDetectionData } from '@/lib/data';

export async function getAnomalyAlert() {
  try {
    const result = await dashboardAnomalyDetection({
      fleetData: JSON.stringify(anomalyDetectionData),
    });
    return { success: true, message: result.alertMessage };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to analyze data.' };
  }
}
