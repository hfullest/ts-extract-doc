import { MarkdownOptions, TemplateCustom } from '../../interface';
import { Document } from '../../models';
import { beautyRender, beautyMarkdownOptions } from './beauty';
import { defaultRender, defaultMarkdownOptions } from './default';

export { defaultMarkdownOptions, beautyMarkdownOptions };

type TemplateOptions = Exclude<MarkdownOptions, TemplateCustom>;

export const TEMPLATE_RENDERS = {
  default: { render: defaultRender, options: defaultMarkdownOptions },
  beauty: { render: beautyRender, options: beautyMarkdownOptions },
} as Record<
  TemplateOptions['template'],
  { render: (document: Document, options: TemplateOptions) => string; options: TemplateOptions }
>;

/** 合并`markdown`配置选项 */
export const mergeMarkdownOptions = (
  options: MarkdownOptions = TEMPLATE_RENDERS['default'].options,
): MarkdownOptions => {
  if (!(options as any)?.template) return options;
  const templateOptions = options as TemplateOptions;
  const originOptions = TEMPLATE_RENDERS[templateOptions?.template]?.options;
  return Object.assign({}, originOptions, templateOptions);
};

export const render = (document: Document, options?: MarkdownOptions) => {
  if (!(options as any)?.template) return (options as TemplateCustom)?.render?.(document);
  const templateOptions = options as TemplateOptions;
  const targetRender = TEMPLATE_RENDERS[templateOptions?.template]?.render;
  return targetRender?.(document, templateOptions);
};
