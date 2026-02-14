import createApp from './app.js';
import path from 'path';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || path.resolve(process.cwd(), 'parental-controls.db');
const PORT = process.env.PORT || 3000;

// Initialize app with async database connection
createApp(dbPath).then((app) => {
  app.listen(PORT, () => {
    console.log(`Parental Control API running on http://localhost:${PORT}`);
    console.log(`Database: ${dbPath}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
