import { readdirSync, statSync, rmdirSync, existsSync, renameSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to recursively read directories and move files
function flattenDirectory(dir) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const currentPath = join(dir, file);
    const stat = statSync(currentPath);

    if (stat.isDirectory()) {
      flattenDirectory(currentPath); // Recursively flatten subdirectories
      // Attempt to remove the directory
      try {
        // Ensure the directory is empty before removing
        readdirSync(currentPath).forEach(subfile => {
          const subfilePath = join(currentPath, subfile);
          // Recursively remove files and directories
          rmSync(subfilePath, { recursive: true, force: true });
        });
        rmdirSync(currentPath); // Now remove the directory
      } catch (error) {
        console.error(`Error removing directory ${currentPath}:`, error);
      }
    } else {
      const newFilePath = join(__dirname, file);
      if (existsSync(newFilePath)) {
        console.error(`File ${file} already exists in the root directory. Skipping...`);
      } else {
        renameSync(currentPath, newFilePath);
        console.log(`Moved: ${currentPath} -> ${newFilePath}`);
      }
    }
  });
}

// Function to update import paths in files
function updateImportPaths(dir) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const currentPath = join(dir, file);
    const stat = statSync(currentPath);

    if (stat.isDirectory()) {
      updateImportPaths(currentPath); // Recursively update paths in subdirectories
    } else if (file.endsWith('.vue') || file.endsWith('.ts') || file.endsWith('.js')) {
      let content = readFileSync(currentPath, 'utf-8');
      content = content.replace(/['"](\.\.\/)+/g, "'./"); // Update import paths
      writeFileSync(currentPath, content);
      console.log(`Updated import paths in: ${currentPath}`);
    }
  });
}

// Start the flattening process
const rootDir = join(__dirname, 'project2-frontend');
flattenDirectory(rootDir);
updateImportPaths(rootDir);
