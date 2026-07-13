const fs = require('fs');
const path = 'C:\\Users\\BaoVo PC\\.gemini\\antigravity\\brain\\9e5a6e64-17a2-4b8f-a0b2-15a472e0a760\\.system_generated\\logs\\transcript_full.jsonl';

const lines = fs.readFileSync(path, 'utf8').split('\n');
for (let line of lines) {
  if (line.includes('seed.mjs') && line.includes('CodeContent')) {
    const data = JSON.parse(line);
    const toolCalls = data.tool_calls || [];
    for (let call of toolCalls) {
      if (call.name === 'write_to_file' && call.args && call.args.TargetFile && call.args.TargetFile.includes('seed.mjs')) {
        console.log(call.args.CodeContent);
        process.exit(0);
      }
    }
  }
}
console.log('Not found');
