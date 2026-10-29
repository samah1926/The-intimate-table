import {describe,it,expect} from 'vitest';
import {zodiac,summary,sections} from './fields';
describe('Chapter 0',()=>{
  it('calculates zodiac at the year wrap and sign boundaries',()=>{
    expect(zodiac('1996-01-19')).toBe('Capricorne');
    expect(zodiac('1996-01-20')).toBe('Verseau');
    expect(zodiac('1996-12-21')).toBe('Sagittaire');
    expect(zodiac('1996-12-22')).toBe('Capricorne');
    expect(zodiac('1996-03-21')).toBe('Bélier');
    expect(zodiac('')).toBe('');
  });
  it('includes every questionnaire field in the shareable summary',()=>{
    const answers=Object.fromEntries(sections.flatMap(s=>s.fields.map(f=>[f.key,`value-${f.key}`])));
    const text=summary(answers);
    for(const section of sections)for(const f of section.fields)expect(text).toContain(`${f.label} : value-${f.key}`);
    expect(summary({})).toContain('Prénom ou surnom : —');
  });
});
