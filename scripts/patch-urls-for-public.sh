#!/bin/bash

# Patch URLs for Public Repository
# Changes development API URL to production API URL for main branch only

echo "Checking if URL patching is needed..."

# Detect current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
echo "Current branch: $BRANCH"

# Define the URL replacements based on branch
OLD_URL="https://api-dev.fluxez.com/api/v1"

if [ "$BRANCH" = "develop" ]; then
    echo "Develop branch - no URL patching needed, keeping development API URL"
    echo "Done!"
    exit 0
elif [ "$BRANCH" = "main" ]; then
    NEW_URL="https://api.fluxez.com/api/v1"
    echo "Main branch - patching from development to production API URL"
    echo "  Old: $OLD_URL"
    echo "  New: $NEW_URL"
else
    # For other branches, no patching
    echo "Branch '$BRANCH' - no URL patching needed"
    echo "Done!"
    exit 0
fi

# Function to patch a file
patch_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo "Patching $file..."
        # Create backup
        cp "$file" "$file.bak"
        # Replace URL
        sed -i.tmp "s|${OLD_URL}|${NEW_URL}|g" "$file"
        # Remove backup files
        rm -f "$file.bak" "$file.tmp"
    fi
}

# Patch TypeScript source files
patch_file "src/constants.ts"
patch_file "src/browser/index.ts"

# Patch compiled JavaScript files
patch_file "dist/constants.js"
patch_file "dist/browser/index.js"
patch_file "lib/constants.js"
patch_file "lib/browser/index.js"

# Patch source map files
for mapfile in dist/*.map lib/*.map dist/**/*.map lib/**/*.map; do
    if [ -f "$mapfile" ]; then
        patch_file "$mapfile"
    fi
done

# Patch README if it contains development API URLs
if [ -f "README.md" ]; then
    echo "Patching README.md..."
    sed -i.tmp "s|${OLD_URL}|${NEW_URL}|g" README.md
    sed -i.tmp "s|https://api-dev.fluxez.com|https://api.fluxez.com|g" README.md
    rm -f README.md.tmp
fi

# Patch example files
for example in examples/*.js examples/*.ts; do
    if [ -f "$example" ]; then
        patch_file "$example"
    fi
done

# Patch package.json repository URL if needed
if [ -f "package.json" ]; then
    echo "Updating package.json repository URL..."
    sed -i.tmp 's|"repository": ".*"|"repository": "https://github.com/fluxez/node-sdk"|g' package.json
    rm -f package.json.tmp
fi

echo "URL patching complete!"

# Verify patching
echo "Verification:"
echo "- Checking for remaining development API references..."
remaining=$(grep -r "api-dev.fluxez.com" --include="*.ts" --include="*.js" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | wc -l)

if [ "$remaining" -gt 0 ]; then
    echo "  Warning: Found $remaining remaining development API references"
    grep -r "api-dev.fluxez.com" --include="*.ts" --include="*.js" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | head -5
else
    echo "  ✓ All references patched to production API"
fi

echo "Done!"