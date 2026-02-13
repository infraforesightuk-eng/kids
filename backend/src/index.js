import createApp from './app.js';
import path from 'path';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || path.resolve(process.cwd(), 'parental-controls.db');
const app = createApp(dbPath);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Parental Control API running on http://localhost:${PORT}`);
});
