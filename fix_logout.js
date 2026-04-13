const fs = require('fs');
const path = require('path');

const srcDir = 'e:\\DIAGNOSYNC\\DiagnoSync\\Diagnosync_Project\\src\\pages';

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkAndReplace(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('<LogOut className="w-4 h-4" />')) {
        content = content.replace(
          /<\s*LogOut\s+className\s*=\s*"w-4 h-4"\s*\/\s*>/g,
          '<LogOut className="w-4 h-4" />\n                <span className="text-sm hidden sm:inline">Logout</span>'
        );
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Replaced in ${fullPath}`);
      }
    }
  }
}

walkAndReplace(srcDir);
