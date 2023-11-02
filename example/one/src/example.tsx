export class ExampleClass {
  exFun() { }
}

export function ExampleFunc(a: number, b: string) {
  return a + b;
}

export const exampleArrowFunc = (c: string, d: number) => {
  return +c + d;
};


interface CC {
  ta: number;
  tb?: boolean;
}

export interface ExampleInterface {
  readonly aa: string;
  bb: boolean;
  cc: CC;
}

function examplefunc2(a2: boolean, a3: string) {
  return a3 + a2;
}

export default examplefunc2;

export enum ExampleEnum {
  A, B, C
}

export const ExampleVar = 123;