import { MarkdownOptions, TemplateCustom } from '../../interface';
import { Document } from '../../models';
import { defaultRender as defaultRender } from './default';

export { defaultMarkdownOptions } from './default';

export const render = <T>(document: Document, options: MarkdownOptions) => {
  if (!(options as any)?.template) return (options as TemplateCustom)?.render?.(document);
  const templateOptions = options as Exclude<MarkdownOptions, TemplateCustom>;
  switch (templateOptions.template) {
    case 'default':
      return defaultRender(document, templateOptions);
  }
};
