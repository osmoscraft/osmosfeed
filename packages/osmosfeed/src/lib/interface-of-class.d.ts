// Use this to mock classes for use with dependency injector during testing
export type InterfaceOfClass<T> = { [K in keyof T]: T[K] };
