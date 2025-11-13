#!/bin/bash

# Patch URLs for Development Branch
# Changes localhost AND production URLs to dev API URLs

echo "Patching URLs to development API..."

# Define the URL replacements
OLD_URL_LOCALHOST="http://localhost:3000/api/v1"
OLD_URL_LOCALHOST_BASE="http://localhost:3000"
OLD_URL_PRODUCTION="https://api.fluxez.com/api/v1"
OLD_URL_PRODUCTION_BASE="https://api.fluxez.com"
NEW_URL="https://api-dev.fluxez.com/api/v1"
NEW_URL_BASE="https://api-dev.fluxez.com"

# Function to patch a file
patch_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo "Patching $file..."
        # Create backup
        cp "$file" "$file.bak"
        # Replace production URLs first
        sed -i.tmp "s|${OLD_URL_PRODUCTION}|${NEW_URL}|g" "$file"
        # Then replace localhost URLs
        sed -i.tmp "s|${OLD_URL_LOCALHOST}|${NEW_URL}|g" "$file"
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

# Patch README if it contains URLs
if [ -f "README.md" ]; then
    echo "Patching README.md..."
    sed -i.tmp "s|${OLD_URL_PRODUCTION}|${NEW_URL}|g" README.md
    sed -i.tmp "s|${OLD_URL_LOCALHOST}|${NEW_URL}|g" README.md
    sed -i.tmp "s|${OLD_URL_PRODUCTION_BASE}|${NEW_URL_BASE}|g" README.md
    sed -i.tmp "s|${OLD_URL_LOCALHOST_BASE}|https://dev.fluxez.com|g" README.md
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
    sed -i.tmp 's|"repository": ".*"|"repository": "https://github.com/fluxez/node-sdk#develop"|g' package.json
    rm -f package.json.tmp
fi

echo "URL patching complete!"

# Verify patching
echo "Verification:"
echo "- Checking for remaining production/localhost references..."
prod_remaining=$(grep -r "api.fluxez.com" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=lib . 2>/dev/null | wc -l)
local_remaining=$(grep -r "localhost:3000" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | wc -l)

if [ "$prod_remaining" -gt 0 ]; then
    echo "  Warning: Found $prod_remaining remaining production API references in source"
    grep -r "api.fluxez.com" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=lib . 2>/dev/null | head -3
fi

if [ "$local_remaining" -gt 0 ]; then
    echo "  Warning: Found $local_remaining remaining localhost references"
    grep -r "localhost:3000" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | head -5
fi

if [ "$prod_remaining" -eq 0 ] && [ "$local_remaining" -eq 0 ]; then
    echo "  ✓ All URLs successfully patched to dev API"
fi

echo "Done!"
