import React from 'react';

export class ExampleClass {
  exFun() { }
}


export const ExampleClassVar = class {
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

export const App = () => {
  return <div>App</div>
};

export const App2 = React.forwardRef(() => {
  return <div>App2</div>
})

export const App3 = React.memo(() => {
  return <div>App3</div>
})