// Автотипограф: расставляет неразрывные пробелы (предлоги, числа и единицы, имена).
// Запуск: npm i --no-save typograf && node typo.mjs  (в CI — после сборки блога)
import fs from 'fs';
import path from 'path';
import Typograf from 'typograf';

const tp = new Typograf({ locale: ['ru', 'en-US'], htmlEntity: { type: 'name', onlyInvisible: true } });
// не трогаем кавычки/тире/многоточия: нужны только переносы
['common/punctuation/quote', 'common/punctuation/quoteLink', 'ru/punctuation/exclamation', 'ru/punctuation/exclamationQuestion',
 'common/punctuation/delBeforePunctuation', 'common/punctuation/apostrophe', 'common/punctuation/hellip',
 'common/number/mathSigns', 'common/number/times', 'common/symbols/arrows', 'common/symbols/cf', 'common/space/delBeforePunctuation',
 'common/space/afterPunctuation', 'common/space/trimLeft', 'common/space/trimRight', 'common/space/delRepeatN', 'common/space/delRepeatSpace',
 'common/space/delLeadingBlanks', 'common/space/delTrailingBlanks', 'common/space/replaceTab', 'common/space/beforeBracket',
 'common/space/bracket', 'common/space/squareBracket', 'common/space/afterPunctuation', 'ru/dash/main', 'ru/dash/centuries', 'ru/dash/decade', 'ru/dash/izpod', 'ru/dash/izza', 'ru/dash/kade', 'ru/dash/koe', 'ru/dash/taki', 'ru/dash/to', 'ru/dash/weekday', 'ru/dash/years',
 'common/nbsp/replaceNbsp'].forEach(r => { try { tp.disableRule(r); } catch (e) {} });
// частицы «же, ли, бы» к предыдущему слову, предлоги к следующему
const SHORT = 'в во на с со к ко о об от до из у за по для без при про под над и а но или да не ни'.split(' ');
const extra = (html) => {
  const re = new RegExp('(^|[\s>(«"])(' + SHORT.join('|') + ')\s(?=[^\s<])', 'gi');
  html = html.replace(re, '$1$2&nbsp;');
  html = html.replace(/(\S)\s(же|ли|бы|ль)(?=[\s.,;:!?<)»"]|$)/gi, '$1&nbsp;$2');
  html = html.replace(/(\d)\s(?=(₽|%|млн|млрд|тыс|руб|мес|час|дн|недел|месяц|год|лет|заяв|сдел|прод|проект|ниш|шаг|выкуп|клиент))/gi, '$1&nbsp;');
  html = html.replace(/(\d)\s(?=\d{3}(?!\d))/g, '$1&nbsp;');
  html = html.replace(/(Яндекс|Google|Ольга|Реклама)\s(?=(Директ|Ads|Сивцова|с&nbsp;умом|с\sумом))/g, '$1&nbsp;');
  html = html.replace(/(Директ|Ads)\s(и)\s/g, '$1 $2&nbsp;');
  return html;
};

const files = [];
const walk = d => { for (const f of fs.readdirSync(d, { withFileTypes: true })) {
  if (['node_modules', '.git', '.blog-kit', '.github', 'img'].includes(f.name)) continue;
  const p = path.join(d, f.name);
  if (f.isDirectory()) walk(p); else if (f.name.endsWith('.html')) files.push(p);
} };
walk('.');

// типографим только текст между тегами, пропуская script/style/option/комментарии
const protect = /(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->|<[^>]+>)/gi;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const parts = src.split(protect);
  const out = parts.map(p => {
    if (!p || p.startsWith('<')) return p;
    if (!p.trim()) return p;
    const lead = p.match(/^\s*/)[0], tail = p.match(/\s*$/)[0];
    let t = p.trim();
    t = tp.execute(t);
    t = extra(' ' + t).slice(1);
    return lead + t + tail;
  }).join('');
  if (out !== src) { fs.writeFileSync(f, out); console.log('typo:', f); }
}
