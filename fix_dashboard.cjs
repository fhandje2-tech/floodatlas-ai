const fs = require('fs');

let file = fs.readFileSync('src/screens/DashboardHome.tsx', 'utf8');

// 1. Remove Recent Activity
file = file.replace(/\{.*?Recent activity.*?<\/div>\s*<\/div>\s*<\/div>/s, '');
// Let's just do it with a regex that matches the Recent Activity block.
// Wait, the structure is:
// <div className="col-span-12 lg:col-span-8 bg-surface border border-border rounded-lg p-6">
//   <div className="flex justify-between items-center mb-6">
//     <h2 className="font-semibold text-lg">Recent activity</h2>...
// It's easier to replace it fully by looking at the content.
