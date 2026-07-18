#!/bin/bash
# ─────────────────────────────────────────────
#  SpacECE — Dev Server Launcher
#  Usage: ./run.sh
# ─────────────────────────────────────────────

# Move to the project root (directory containing this script)
cd "$(dirname "$0")" || exit 1

echo "🚀 Starting SpacECE dev server..."
echo "   Press Ctrl+C to stop."
echo ""

npm run dev
