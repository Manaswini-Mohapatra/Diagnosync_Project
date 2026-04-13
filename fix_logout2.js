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
      
      // Look for my inserted span immediately followed by ANY other Logout span, and collapse them to just one
      const regex = /<span className="text-sm hidden sm:inline">Logout<\/span>\s*<span className="[^"]*">Logout<\/span>/g;
      if (regex.test(content)) {
        content = content.replace(regex, '<span className="text-sm hidden sm:inline">Logout</span>');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Cleaned up duplicate in ${fullPath}`);
      }
    }
  }
}

walkAndReplace(srcDir);
