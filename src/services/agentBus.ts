import mitt from 'mitt';

type Events = {
  'analysis:complete': { zoneId: string; analysisResult: any };
  'feature:selected': { featureId: string; coordinates: [number, number]; type: string };
  'report:ready': { reportId: string; reportUrl: string };
  'scenario:complete': { zoneId: string; scenarioType: string; results: any };
  'assistant:suggest': { message: string; actions: any[] };
  'zone:changed': { zone: any };
};

export const agentBus = mitt<Events>();
