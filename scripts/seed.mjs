import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://nojktckjliiqayrxcwdh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vamt0Y2tqbGlpcWF5cnhjd2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzMTE1NzYsImV4cCI6MjEwOTg4NzU3Nn0.m8gmPUHFFMRop1blFZx7JSTeVaGwnV_8Gkwv1Rrjee8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  const initialData = JSON.parse(fs.readFileSync('./src/data/initialData.json', 'utf8'));

  console.log('Seeding fiscal_years...');
  for (const fy of initialData.fiscalYears || []) {
    await supabase.from('fiscal_years').upsert({ id: fy.id, data: fy });
  }

  console.log('Seeding departments...');
  for (const d of initialData.departments || []) {
    await supabase.from('departments').upsert({ id: d.id, data: d });
  }

  console.log('Seeding projects...');
  for (const p of initialData.projects || []) {
    await supabase.from('projects').upsert({ id: p.id, data: p });
  }

  console.log('Seeding activities...');
  const actRows = (initialData.activities || []).map(a => ({ id: a.id, data: a }));
  // Upsert in batches of 20
  for (let i = 0; i < actRows.length; i += 20) {
    const chunk = actRows.slice(i, i + 20);
    const { error } = await supabase.from('activities').upsert(chunk);
    if (error) console.error('Error inserting activities chunk:', error);
  }

  console.log('Seeding reports...');
  for (const r of initialData.reports || []) {
    await supabase.from('reports').upsert({ id: r.id, data: r });
  }

  console.log('Seeding documents...');
  for (const doc of initialData.documents || []) {
    await supabase.from('documents').upsert({ id: doc.id, data: doc });
  }

  console.log('Seeding completed successfully!');
}

seed().catch(console.error);
