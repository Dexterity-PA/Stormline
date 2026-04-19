import { db } from '@/lib/db';
import { indicators } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { NewAlertRuleForm } from './NewAlertRuleForm';

export default async function NewAlertRulePage() {
  const allIndicators = await db
    .select({
      id: indicators.id,
      code: indicators.code,
      name: indicators.name,
      unit: indicators.unit,
    })
    .from(indicators)
    .orderBy(asc(indicators.name));

  return <NewAlertRuleForm indicators={allIndicators} />;
}
