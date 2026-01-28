#!/bin/bash

# Setup Monitoring Scripts
# Makes monitoring scripts executable and sets up directory structure

set -e

echo "🔧 Setting up monitoring and optimization tools..."
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p "$PROJECT_ROOT/data"
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/scripts"

# Make scripts executable
echo "🔨 Making scripts executable..."
chmod +x "$SCRIPT_DIR/monitor-ai-usage.js"
chmod +x "$SCRIPT_DIR/cost-tracker.js"
chmod +x "$SCRIPT_DIR/monitor-all-services.js"

# Create .gitignore entries if not exists
GITIGNORE="$PROJECT_ROOT/.gitignore"
if [ ! -f "$GITIGNORE" ]; then
  touch "$GITIGNORE"
fi

if ! grep -q "data/monthly-costs.json" "$GITIGNORE"; then
  echo "" >> "$GITIGNORE"
  echo "# Monitoring data" >> "$GITIGNORE"
  echo "data/monthly-costs.json" >> "$GITIGNORE"
  echo "data/ai-usage-tracker.json" >> "$GITIGNORE"
  echo "logs/*.log" >> "$GITIGNORE"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "⚠️  Node.js is not installed. Please install Node.js to use monitoring scripts."
  exit 1
fi

# Install dependencies if package.json exists
if [ -f "$PROJECT_ROOT/package.json" ]; then
  echo "📦 Installing dependencies..."
  cd "$PROJECT_ROOT"
  if [ ! -d "node_modules" ]; then
    npm install
  fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Set up service alerts:"
echo "   - Review MONITORING_SETUP_GUIDE.md"
echo ""
echo "2. Test monitoring scripts:"
echo "   node $SCRIPT_DIR/monitor-all-services.js"
echo ""
echo "3. Set up monthly cost tracking:"
echo "   node $SCRIPT_DIR/cost-tracker.js 1 2025 --update"
echo ""
echo "4. Schedule daily monitoring (optional):"
echo "   Add to crontab:"
echo "   0 9 * * * node $SCRIPT_DIR/monitor-all-services.js >> $PROJECT_ROOT/logs/monitoring.log 2>&1"
echo ""
echo "5. Review optimization recommendations:"
echo "   - See COST_OPTIMIZATION_IMPLEMENTATIONS.md"
echo ""

