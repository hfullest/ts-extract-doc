type TestObject = {
  p1: string;
  p2: number;
  p3?: boolean;
  p4: string;
  p5: symbol;
};

export type PickObject = Pick<TestObject, 'p1' | 'p2'>;
