import { describe, expect, it } from 'vitest';
import { TAG_ROWS } from './tag-data';

describe('TAG_ROWS', () => {
    it('records a cost equal to the typed length for every measured example', () => {
        for (const row of TAG_ROWS.filter((candidate) => candidate.measured !== false)) {
            expect(row.example.length, row.example).toBe(row.cost);
        }
    });

    it('has unique examples and a description for each row', () => {
        const examples = TAG_ROWS.map((row) => row.example);
        expect(new Set(examples).size).toBe(examples.length);
        expect(TAG_ROWS.every((row) => row.effect.length > 0)).toBe(true);
    });
});
