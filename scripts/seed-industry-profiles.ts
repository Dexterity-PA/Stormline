// scripts/seed-industry-profiles.ts
/**
 * Seeds industry_profile_schemas with declarative form field definitions.
 * Idempotent: re-running overwrites fields and bumps schema_version (authoritative).
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/seed-industry-profiles.ts
 */
import { db } from '@/lib/db';
import { industryProfileSchemas } from '@/lib/db/schema';

type FieldType = 'text' | 'select' | 'multiselect' | 'number' | 'bool';

interface ProfileField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  helper?: string;
}

const RESTAURANT_FIELDS: ProfileField[] = [
  { key: 'cuisine_type', label: 'Cuisine type', type: 'text', required: true },
  {
    key: 'service_model',
    label: 'Service model',
    type: 'select',
    options: ['fast_casual', 'full_service', 'qsr', 'fine_dining'],
    required: true,
  },
  { key: 'seats', label: 'Seats', type: 'number' },
  { key: 'locations_count', label: 'Number of locations', type: 'number', required: true },
  { key: 'avg_check', label: 'Average check ($)', type: 'number' },
  {
    key: 'primary_proteins',
    label: 'Primary proteins',
    type: 'multiselect',
    options: ['beef', 'chicken', 'pork', 'seafood', 'plant_based', 'other'],
  },
  {
    key: 'primary_produce',
    label: 'Primary produce',
    type: 'multiselect',
    options: ['lettuce', 'tomatoes', 'avocado', 'citrus', 'root_veg', 'other'],
  },
  { key: 'alcohol_license', label: 'Alcohol license', type: 'bool' },
  { key: 'delivery_share_pct', label: 'Delivery % of sales', type: 'number' },
  {
    key: 'labor_model',
    label: 'Labor model',
    type: 'select',
    options: ['tipped', 'no_tip', 'hybrid'],
    required: true,
  },
  {
    key: 'peak_meal_periods',
    label: 'Peak meal periods',
    type: 'multiselect',
    options: ['breakfast', 'lunch', 'dinner', 'late_night'],
  },
];

const CONSTRUCTION_FIELDS: ProfileField[] = [
  { key: 'trade_type', label: 'Trade / specialty', type: 'text', required: true },
  {
    key: 'project_types',
    label: 'Project types',
    type: 'multiselect',
    options: ['residential', 'commercial', 'industrial', 'renovation', 'new_construction'],
  },
  { key: 'crew_size', label: 'Crew size', type: 'number' },
  { key: 'union_status', label: 'Union', type: 'bool' },
  { key: 'bonded', label: 'Bonded', type: 'bool' },
  {
    key: 'primary_materials',
    label: 'Primary materials',
    type: 'multiselect',
    options: ['lumber', 'steel', 'concrete', 'copper', 'pvc', 'drywall', 'roofing', 'other'],
  },
  { key: 'equipment_fleet_size', label: 'Equipment fleet size', type: 'number' },
  {
    key: 'typical_project_value_range',
    label: 'Typical project value range',
    type: 'select',
    options: ['under_50k', '50k_250k', '250k_1m', 'over_1m'],
  },
];

const RETAIL_FIELDS: ProfileField[] = [
  {
    key: 'format',
    label: 'Store format',
    type: 'select',
    options: ['brick_and_mortar', 'online_only', 'hybrid'],
    required: true,
  },
  { key: 'category', label: 'Product category', type: 'text', required: true },
  { key: 'locations_count', label: 'Number of locations', type: 'number', required: true },
  {
    key: 'sqft_range',
    label: 'Store sq ft',
    type: 'select',
    options: ['under_1k', '1k_5k', '5k_20k', 'over_20k'],
  },
  {
    key: 'price_tier',
    label: 'Price tier',
    type: 'select',
    options: ['budget', 'mid', 'premium'],
  },
  { key: 'import_share_pct', label: 'Import % of inventory', type: 'number' },
  {
    key: 'primary_sourcing_countries',
    label: 'Primary sourcing countries',
    type: 'multiselect',
    options: ['usa', 'china', 'mexico', 'vietnam', 'india', 'other'],
  },
  {
    key: 'seasonal_peaks',
    label: 'Seasonal peaks',
    type: 'multiselect',
    options: ['holiday', 'back_to_school', 'summer', 'spring'],
  },
  { key: 'pos_system', label: 'POS system', type: 'text' },
  { key: 'loyalty_program', label: 'Loyalty program', type: 'bool' },
];

const ROWS = [
  { industry: 'restaurant' as const, schemaVersion: 1, fields: RESTAURANT_FIELDS },
  { industry: 'construction' as const, schemaVersion: 1, fields: CONSTRUCTION_FIELDS },
  { industry: 'retail' as const, schemaVersion: 1, fields: RETAIL_FIELDS },
];

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('Seeding industry_profile_schemas...\n');

  for (const row of ROWS) {
    await db
      .insert(industryProfileSchemas)
      .values(row)
      .onConflictDoUpdate({
        target: industryProfileSchemas.industry,
        set: { fields: row.fields, schemaVersion: row.schemaVersion },
      });
    console.log(
      `  ${row.industry}: ${row.fields.length} fields (schema_version=${row.schemaVersion})`,
    );
  }

  console.log('\nDone.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
