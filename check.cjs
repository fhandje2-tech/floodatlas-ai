const fs = require('fs');
const content = fs.readFileSync('src/screens/SmartMapping.tsx', 'utf8');

const stack = [];
for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (char === '(' || char === '{') {
    stack.push({ char, line: content.slice(0, i).split('\n').length });
  } else if (char === ')' || char === '}') {
    const last = stack[stack.length - 1];
    if (last && ((char === ')' && last.char === '(') || (char === '}' && last.char === '{'))) {
      stack.pop();
    } else {
      // ignoring mismatched for now, just seeing what's left
      stack.push({ char, line: content.slice(0, i).split('\n').length });
    }
  }
}
console.log(stack.slice(-5));
