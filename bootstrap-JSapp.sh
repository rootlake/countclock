#!/bin/bash

set -e  # Exit on error

# Function to cleanup on failure
cleanup() {
    echo "Error occurred. Cleaning up..."
    exit 1
}

trap cleanup ERR

# Check if directory is empty (excluding this script)
if [ "$(ls -A | grep -v 'bootstrap-JSapp.sh' | wc -l)" -ne 0 ]; then
    echo "Warning: Directory is not empty. Please ensure it only contains this script."
    read -p "Continue anyway? (y/n): " CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 1
    fi
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

# Get current directory name as project name
PROJECT_NAME=$(basename "$PWD")

# Create .gitignore first
echo "Creating .gitignore..."
cat > .gitignore <<EOF
node_modules
dist
.DS_Store
*.log
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
bootstrap-JSapp.sh
coverage
EOF

# Initialize git
echo "Initializing git repository..."
git init || exit 1

# Initialize npm project
echo "Initializing npm project..."
npm init -y || exit 1

# Init Vite + React + JS
echo "Initializing Vite project..."
npm create vite@latest . -- --template react --yes || exit 1

# Ensure package.json exists and has proper configuration
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found after Vite initialization"
    exit 1
fi

# Install dependencies with explicit package names
echo "Installing dependencies..."
npm install react react-dom @vitejs/plugin-react || exit 1
npm install -D vite @types/react @types/react-dom || exit 1

# Install testing dependencies
echo "Installing testing dependencies..."
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom || exit 1

# Install Tailwind CSS and its PostCSS plugin
echo "Installing Tailwind CSS..."
npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss || exit 1

# Create Tailwind config files manually instead of using npx
echo "Configuring Tailwind..."
cat > tailwind.config.js <<EOF
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
EOF

cat > postcss.config.js <<EOF
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOF

cat > src/index.css <<EOF
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Update main.jsx to import Tailwind
sed -i.bak '1s/^/import "\/src\/index.css";\n/' src/main.jsx
rm src/main.jsx.bak

# Install QR code plugin
echo "Installing QR code plugin..."
npm install -D vite-plugin-qrcode || exit 1

# Update vite.config.js
echo "Configuring Vite..."
cat > vite.config.js <<EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { qrcode } from 'vite-plugin-qrcode'

export default defineConfig({
  plugins: [
    react(),
    qrcode() // only applies in dev mode
  ],
  base: "/$PROJECT_NAME/",
  build: {
    outDir: "docs",
    sourcemap: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  }
})
EOF

# Create test setup file
echo "Creating test setup..."
mkdir -p src/test
cat > src/test/setup.js <<EOF
import '@testing-library/jest-dom'
EOF

# Create a simple test
echo "Creating initial test..."
cat > src/App.test.jsx <<EOF
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
EOF

# Update App.jsx to include test attributes
cat > src/App.jsx <<EOF
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main role="main" className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">Count Clock</h1>
                <div className="text-center">
                  <p className="text-4xl font-bold mb-4">{count}</p>
                  <button
                    onClick={() => setCount(count + 1)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Increment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
EOF

# Update package.json scripts
echo "Updating package.json scripts..."
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:coverage="vitest run --coverage"
npm pkg set scripts.test:ui="vitest --ui"

# Install Prettier
echo "Installing Prettier..."
npm install -D prettier || exit 1
cat > .prettierrc <<EOF
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
EOF

# Create basic TASKS.md
echo "Creating TASKS.md..."
cat > TASKS.md <<EOF
# Project Tasks

- [x] Set up testing environment
- [ ] Add more components
- [ ] Write more unit tests
- [ ] Push to GitHub Pages
- [ ] Add error boundaries
- [ ] Set up CI/CD
EOF

# Add CursorRules
echo "Setting up CursorRules..."
mkdir -p .cursor/rules
curl -s https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/main/react-basic.md -o .cursor/rules/react-basic.md || exit 1
curl -s https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/main/javascript.md -o .cursor/rules/javascript.md || exit 1

# Initial commit
echo "Creating initial commit..."
git add .
git commit -m "Initial commit with React + Vite + Tailwind + QR Code + Testing + CursorRules" || exit 1

# Prompt for GitHub repo
read -p "Enter the GitHub repo URL (e.g., https://github.com/youruser/yourrepo.git): " REPO_URL

# Validate repo URL
if [[ ! $REPO_URL =~ ^https://github.com/.*\.git$ ]]; then
    echo "Error: Invalid GitHub repository URL"
    exit 1
fi

# Add remote and push
echo "Setting up GitHub remote..."
git remote add origin "$REPO_URL" || exit 1
git branch -M main || exit 1
git push -f origin main || exit 1

echo "Setup completed successfully!"
