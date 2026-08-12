const fs = require('fs');
const path = 'd:/Project/NexBank/frontend/src/features/admin/adminSlice.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace axios import
content = content.replace("import axios from 'axios';", "import api from '../../api/api';");

// Replace all http://localhost:8080/api/ with /
content = content.replace(/axios\.(get|post|put|delete)\('http:\/\/localhost:8080\/api\//g, "api.$1('/");
// For template literals
content = content.replace(/axios\.(get|post|put|delete)\(`http:\/\/localhost:8080\/api\//g, "api.$1(`/");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed adminSlice.ts');
