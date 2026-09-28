const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function compile(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) compile(file);
    else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      const output = path.join('dist', path.relative('src', file)).replace(/\.ts$/, '.js');
      const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
          esModuleInterop: true, sourceMap: false },
      });
      if ((result.diagnostics || []).some(d => d.category === ts.DiagnosticCategory.Error)) {
        throw new Error('Compilation failed: ' + file);
      }
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.writeFileSync(output, result.outputText);
    }
  }
}
compile('src');
fs.mkdirSync('dist/config/websocket/chunk', { recursive: true });
console.log('Backend source compiled.');
