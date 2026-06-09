import chalk from 'chalk';
import { c } from '../tokens/colors.js';
import { CHARS } from '../tokens/chars.js';
import { padLabel } from '../layout/utils.js';
import { box } from '../layout/box.js';

export function errorInline(message: string, hint?: string): void {
  console.log();
  console.log('  ' + c.error(CHARS.CROSS) + '  ' + c.text(message));
  if (hint) console.log('     ' + c.textMuted(hint));
  console.log();
}

interface OperationalErrorProps {
  code?: string;
  message?: string;
  cause?: string;
  hint?: string;
  link?: string;
}

export function errorOperational(headline: string, props: OperationalErrorProps): void {
  console.log();
  console.log('  ' + c.error(CHARS.CROSS) + '  ' + c.text(chalk.bold(headline)));
  console.log();
  
  const detailLines = [
    props.code    ? (c.textMuted(padLabel('Code'))    + c.error(props.code)) : null,
    props.message ? (c.textMuted(padLabel('Message')) + c.text(props.message)) : null,
    props.cause   ? (c.textMuted(padLabel('Cause'))   + c.textFaint(props.cause)) : null,
  ].filter(Boolean) as string[];

  const hintLines = [
    props.hint ? c.text(props.hint) : null,
    props.link ? (c.textMuted('Details › ') + c.info(props.link)) : null,
  ].filter(Boolean) as string[];

  const linesToBox: string[] = [];
  if (detailLines.length > 0) {
    linesToBox.push(...detailLines);
  }
  if (hintLines.length > 0) {
    if (detailLines.length > 0) {
      linesToBox.push('');
      // In a more complex renderer we would inject VL+H+VR here.
      // We will use a standard separator line.
      linesToBox.push(c.border(CHARS.DIV.repeat(40)));
      linesToBox.push('');
    }
    linesToBox.push(...hintLines);
  }
  
  console.log(box(linesToBox, { title: 'Error', colorFn: c.errorDim }));
  console.log();
}
