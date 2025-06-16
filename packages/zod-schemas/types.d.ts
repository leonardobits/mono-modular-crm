declare global {
  function describe(name: string, fn: () => void): void;
  function test(name: string, fn: () => void): void;
  function expect(actual: any): {
    toEqual(expected: any): void;
    toThrow(): void;
    not: {
      toThrow(): void;
    };
  };
}

export {}; 