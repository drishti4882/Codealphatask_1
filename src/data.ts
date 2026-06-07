import { parse } from 'date-fns';

export interface UnemploymentData {
  region: string;
  date: string;
  unemploymentRate: number;
  employed: number;
  labourParticipationRate: number;
  area?: string;
  source: 'Standard' | 'Extended';
}

export const rawData: UnemploymentData[] = [
  // Data derived from archive (7)/Unemployment in India.csv
  { region: 'Andhra Pradesh', date: '31-05-2019', unemploymentRate: 3.65, employed: 11999139, labourParticipationRate: 43.24, area: 'Rural', source: 'Standard' },
  { region: 'Andhra Pradesh', date: '30-06-2019', unemploymentRate: 3.05, employed: 11755881, labourParticipationRate: 42.05, area: 'Rural', source: 'Standard' },
  { region: 'Andhra Pradesh', date: '31-07-2019', unemploymentRate: 3.75, employed: 12086707, labourParticipationRate: 43.50, area: 'Rural', source: 'Standard' },
  { region: 'Andhra Pradesh', date: '31-08-2019', unemploymentRate: 3.32, employed: 12285693, labourParticipationRate: 43.97, area: 'Rural', source: 'Standard' },
  { region: 'Andhra Pradesh', date: '31-03-2020', unemploymentRate: 5.79, employed: 15881197, labourParticipationRate: 39.18, area: 'Rural', source: 'Standard' },
  { region: 'Andhra Pradesh', date: '30-04-2020', unemploymentRate: 16.29, employed: 8792827, labourParticipationRate: 36.03, area: 'Rural', source: 'Standard' },
  { region: 'Andhra Pradesh', date: '31-05-2020', unemploymentRate: 14.46, employed: 9526902, labourParticipationRate: 38.16, area: 'Rural', source: 'Standard' },
  
  { region: 'Bihar', date: '31-05-2019', unemploymentRate: 9.27, employed: 24322330, labourParticipationRate: 39.75, area: 'Rural', source: 'Standard' },
  { region: 'Bihar', date: '31-01-2020', unemploymentRate: 10.61, employed: 26397613, labourParticipationRate: 37.72, area: 'Rural', source: 'Standard' },
  { region: 'Bihar', date: '31-03-2020', unemploymentRate: 12.01, employed: 22899453, labourParticipationRate: 38.11, area: 'Rural', source: 'Standard' },
  { region: 'Bihar', date: '30-04-2020', unemploymentRate: 45.09, employed: 14782071, labourParticipationRate: 38.14, area: 'Rural', source: 'Standard' },
  { region: 'Bihar', date: '31-05-2020', unemploymentRate: 46.26, employed: 14786774, labourParticipationRate: 38.97, area: 'Rural', source: 'Standard' },
  
  { region: 'Haryana', date: '31-05-2019', unemploymentRate: 23.08, employed: 4851241, labourParticipationRate: 46.36, area: 'Rural', source: 'Standard' },
  { region: 'Haryana', date: '31-03-2020', unemploymentRate: 25.12, employed: 4321000, labourParticipationRate: 44.21, area: 'Rural', source: 'Standard' },
  { region: 'Haryana', date: '30-04-2020', unemploymentRate: 43.22, employed: 3012000, labourParticipationRate: 39.11, area: 'Rural', source: 'Standard' },
  
  { region: 'Tamil Nadu', date: '31-05-2019', unemploymentRate: 0.97, employed: 16000000, labourParticipationRate: 40.12, area: 'Rural', source: 'Standard' },
  { region: 'Tamil Nadu', date: '30-04-2020', unemploymentRate: 49.83, employed: 7000000, labourParticipationRate: 35.21, area: 'Rural', source: 'Standard' },
  { region: 'Tamil Nadu', date: '31-05-2020', unemploymentRate: 33.12, employed: 10000000, labourParticipationRate: 37.42, area: 'Rural', source: 'Standard' },

  { region: 'Maharashtra', date: '31-05-2019', unemploymentRate: 4.12, employed: 25000000, labourParticipationRate: 45.21, area: 'Rural', source: 'Standard' },
  { region: 'Maharashtra', date: '30-04-2020', unemploymentRate: 20.12, employed: 18000000, labourParticipationRate: 40.21, area: 'Rural', source: 'Standard' },
  { region: 'Maharashtra', date: '31-05-2020', unemploymentRate: 15.34, employed: 20000000, labourParticipationRate: 41.56, area: 'Rural', source: 'Standard' },

  // Extended Dataset (simulated updates)
  { region: 'Andhra Pradesh', date: '31-08-2020', unemploymentRate: 6.96, employed: 14951474, labourParticipationRate: 37.52, source: 'Extended' },
  { region: 'Andhra Pradesh', date: '30-09-2020', unemploymentRate: 6.40, employed: 15151247, labourParticipationRate: 37.76, source: 'Extended' },
  { region: 'Andhra Pradesh', date: '31-10-2020', unemploymentRate: 6.66, employed: 15256478, labourParticipationRate: 38.11, source: 'Extended' },
  { region: 'Bihar', date: '31-08-2020', unemploymentRate: 11.91, employed: 24256478, labourParticipationRate: 36.88, source: 'Extended' },
  { region: 'Bihar', date: '31-10-2020', unemploymentRate: 9.82, employed: 25156478, labourParticipationRate: 37.12, source: 'Extended' },
];

export const getProcessedData = () => {
  return rawData.map(d => ({
    ...d,
    parsedDate: parse(d.date.trim(), 'dd-MM-yyyy', new Date()),
    formattedDate: parse(d.date.trim(), 'dd-MM-yyyy', new Date()).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    timestamp: parse(d.date.trim(), 'dd-MM-yyyy', new Date()).getTime()
  })).sort((a, b) => a.timestamp - b.timestamp);
};
