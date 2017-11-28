import test from 'ava';
import Parser from '../lib/parser.js';

const p = new Parser();

test('should return true', t => {
  t.is(true, true);
});

