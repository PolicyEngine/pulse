#!/bin/bash

echo "======================================"
echo "PolicyEngine pulse database setup"
echo "======================================"
echo ""
echo "To set up the Supabase database:"
echo ""
echo "1. Open the Supabase SQL editor:"
echo "   https://supabase.com/dashboard/project/mbhrkgzrswaysrmpdehz/sql/new"
echo ""
echo "2. Copy the SQL schema to clipboard:"
cat supabase/schema.sql | pbcopy
echo "   ✅ SQL copied to clipboard!"
echo ""
echo "3. Paste and run in the SQL editor"
echo ""
echo "======================================"