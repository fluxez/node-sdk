#!/bin/bash

# Patch URLs for Development Branch
# Changes localhost URLs to dev API URLs

echo "Patching URLs from localhost to development API..."

# Define the URL replacements
OLD_URL="http://localhost:3000/api/v1"
NEW_URL="https://api-dev.fluxez.com/api/v1"

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

# Patch README if it contains localhost URLs
if [ -f "README.md" ]; then
    echo "Patching README.md..."
    sed -i.tmp "s|${OLD_URL}|${NEW_URL}|g" README.md
    sed -i.tmp "s|http://localhost:3000|https://dev.fluxez.com|g" README.md
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
echo "- Checking for remaining localhost references..."
remaining=$(grep -r "localhost:3000" --include="*.ts" --include="*.js" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | wc -l)

if [ "$remaining" -gt 0 ]; then
    echo "  Warning: Found $remaining remaining localhost references"
    grep -r "localhost:3000" --include="*.ts" --include="*.js" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | head -5
else
    echo "  ✓ No localhost references found"
fi

echo "Done!"
