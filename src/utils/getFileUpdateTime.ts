import { execSync } from 'child_process';
import { Document } from '../models';

export const getFileUpdateTime = (doc: Document) => {
  const filePath = doc?.filePath;
  if (!filePath) return;
  const { start: [startLine] = [0], end: [endLine] = [0] } = doc?.pos ?? {};
  try {
    const result = execSync(`git blame -w -L ${startLine},${endLine} -- ${filePath}`).toString('utf-8');
    const dates = [];
    const reg = /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/g;
    const match = { current: null } as any;
    while ((match.current = reg.exec(result))) dates.push(match.current[1]);
    const lastUpdateTime = dates.sort((d1, d2) => new Date(d2).getTime() - new Date(d1).getTime());
    return lastUpdateTime[0];
  } catch {}
  return '';
};
