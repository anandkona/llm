import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=====================================================');
console.log('🚀 LLM Portal Monorepo Initial Setup Script');
console.log('=====================================================\n');

// 1. Setup Backend .env
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvExamplePath = path.join(__dirname, 'backend', '.env.example');

if (!fs.existsSync(backendEnvPath) && fs.existsSync(backendEnvExamplePath)) {
  fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
  console.log('✅ Created backend/.env from backend/.env.example');
} else {
  console.log('ℹ️  backend/.env already exists');
}

// 2. Setup Frontend .env
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
const frontendEnvExamplePath = path.join(__dirname, 'frontend', '.env.example');

if (!fs.existsSync(frontendEnvPath) && fs.existsSync(frontendEnvExamplePath)) {
  fs.copyFileSync(frontendEnvExamplePath, frontendEnvPath);
  console.log('✅ Created frontend/.env from frontend/.env.example');
} else {
  console.log('ℹ️  frontend/.env already exists');
}

// 3. Install dependencies
console.log('\n📦 Installing backend dependencies...');
execSync('npm install', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

console.log('\n📦 Installing frontend dependencies...');
execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

// 4. Run database migrations & seed
console.log('\n🗄️  Verifying database connection & seeding sample universities & users...');
try {
  execSync('node src/config/seed.js', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
  console.log('✅ Database tables initialized and seed accounts ready.');
} catch (err) {
  console.warn('⚠️  Could not auto-seed database. Ensure MySQL is running on port 3306 (XAMPP).');
}

console.log('\n=====================================================');
console.log('🎉 Setup Complete! To start the application:');
console.log('-----------------------------------------------------');
console.log('1. Start Backend:');
console.log('   npm run dev:backend   (or: cd backend && npm run dev)');
console.log('2. Start Frontend:');
console.log('   npm run dev:frontend  (or: cd frontend && npm run dev)');
console.log('=====================================================\n');
