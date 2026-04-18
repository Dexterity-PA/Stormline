import {
  createAlert,
  getAlertById,
  listAlertDeliveries,
  listAlerts,
} from '@/lib/db/queries/alerts';

async function main() {
  const alert = await createAlert({
    category: 'commodity_move',
    industries: ['restaurant'],
    regions: ['TX', 'national'],
    severity: 'high',
    headline: 'Smoke test alert',
    bodyMd: 'Historical patterns indicate a significant move.',
    sourceUrl: 'https://example.com/fred',
    eventOccurredAt: new Date(),
  });
  console.log('createAlert:', alert.id);

  const byId = await getAlertById(alert.id);
  if (byId?.id !== alert.id) throw new Error('getAlertById mismatch');

  const { data } = await listAlerts({
    industries: ['restaurant'],
    severity: 'high',
  });
  if (!data.some((a) => a.id === alert.id)) throw new Error('listAlerts missing row');

  const deliveries = await listAlertDeliveries(alert.id);
  console.log('listAlertDeliveries count:', deliveries.length);

  console.log('smoke-alerts: PASSED');
}

main().catch((err) => {
  console.error('smoke-alerts: FAILED', err);
  process.exit(1);
});
