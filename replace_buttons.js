const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/**/*.jsx', { cwd: process.cwd() });
let modifiedCount = 0;

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // Regex to match 'Back to Dashboard' or similar text links inside <nav> or general buttons
  
  // Back to Dashboard / Back text links
  content = content.replace(
    /<button[^>]*onClick={\(\) => navigate\([^)]+\)}[^>]*className=\"(?:[^\"]*text-gray-600[^\"]*hover:text-primary[^\"]*|flex items-center gap-2 text-gray-600 text-sm)\"[^>]*>[\s\S]*?(<ArrowLeft[^>]*>)?[\s\S]*?(?:Back to Dashboard|Back|← Dashboard)[\s\S]*?<\/button>/g,
    (match) => {
      // Extract the navigate path
      const navMatch = match.match(/navigate\(([\'\"][^\'\"]+[\'\"])\)/);
      const navPath = navMatch ? navMatch[1] : "'/dashboard'";
      
      // Ensure ArrowLeft is imported if we are using it
      if (!content.includes('ArrowLeft')) {
        content = content.replace(/import \{([^}]+)\} from 'lucide-react'/, (m, p1) => `import {${p1}, ArrowLeft} from 'lucide-react'`);
        content = content.replace(/import \{([^}]+)\} from "lucide-react"/, (m, p1) => `import {${p1}, ArrowLeft} from "lucide-react"`);
      }
      
      return `<button
                onClick={() => navigate(${navPath})}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 hidden sm:inline" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </button>`;
    }
  );

  // Logout text links
  content = content.replace(
    /<button[^>]*onClick={handleLogout}[^>]*className=\"(?:[^\"]*text-gray-600[^\"]*hover:text-primary[^\"]*|flex items-center gap-2 text-gray-600 text-sm)\"[^>]*>[\s\S]*?<LogOut[^>]*>[\s\S]*?Logout[\s\S]*?<\/button>/g,
    `<button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>`
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log('Modified: ' + file);
    modifiedCount++;
  }
});

console.log('Total files modified: ' + modifiedCount);
