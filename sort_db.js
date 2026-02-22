const fs = require('fs');

try {
    const lines = fs.readFileSync('data/notes.jsonl', 'utf-8').split('\n').filter(l => l.trim());
    const notes = lines.map(l => JSON.parse(l));
    notes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    fs.writeFileSync('data/notes.jsonl', notes.map(n => JSON.stringify(n)).join('\n') + '\n', 'utf-8');
    console.log('Successfully sorted ' + notes.length + ' notes.');
} catch (e) {
    console.error('Failed to sort:', e);
}
