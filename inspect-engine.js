const { Engine } = require('@deriverse/kit');

console.log('--- Inspecting Engine ---');
console.log('Engine keys:', Object.keys(Engine));
console.log('Engine prototype keys:', Object.getOwnPropertyNames(Engine.prototype));

if (Engine.initialize) console.log('Engine.initialize exists (static)');
if (Engine.prototype.initialize) console.log('Engine.prototype.initialize exists (instance)');
