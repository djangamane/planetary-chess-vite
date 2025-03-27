import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fsegtvxhysiynmkyoovz.supabase.co'
// Use the provided anon key directly
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZWd0dnhoeXNpeW5ta3lvb3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNzYwOTAsImV4cCI6MjA1NTk1MjA5MH0.ueW5w2RtD65BtbTjvhhkBoJoIlKai8_F-N9u2NXAENA'

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)