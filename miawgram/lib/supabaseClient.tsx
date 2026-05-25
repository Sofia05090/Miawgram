import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aqnzmdotjzhtahzrsswf.supabase.co/rest/v1/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxbnptZG90anpodGFoenJzc3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjAzMjYsImV4cCI6MjA5NTIzNjMyNn0.OI5-yeTJWog0-ldwydEa2bytgIjHahM4BLBfdKVB5aY';
export const supabase = createClient(supabaseUrl, supabaseKey);

