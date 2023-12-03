import { MarkdownOptions, TemplateCustom } from '../../interface';
import { Document } from '../../models';
import { beautyRender } from './beauty';
import { defaultRender as defaultRender } from './default';

export { defaultMarkdownOptions } from './default';
export { beautyMarkdownOptions } from './beauty';

type TemplateOptions = Exclude<MarkdownOptions, TemplateCustom>;

const RENDERS = {
  default: defaultRender,
  beauty: beautyRender,
} as Record<TemplateOptions['template'], (document: Document, options: TemplateOptions) => string>;

export const render = (document: Document, options: MarkdownOptions) => {
  if (!(options as any)?.template) return (options as TemplateCustom)?.render?.(document);
  const templateOptions = options as TemplateOptions;
  const targetRender = RENDERS[templateOptions?.template];
  return targetRender?.(document, templateOptions);
};
