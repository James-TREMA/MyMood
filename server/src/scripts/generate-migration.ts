import { generateMigration } from '../database/utils/migration';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Veuillez fournir un nom pour la migration');
  process.exit(1);
}

generateMigration(migrationName)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });