import DocumentClass from './DocumentClass';
import DocumentFunction from './DocumentFunction';
import DocumentLiteral from './DocumentLiteral';

export type DocumentParameter = DocumentLiteral | DocumentFunction | DocumentClass;
