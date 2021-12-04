type Class<T> = new (...args: any[]) => T;

type Classes<Tuple extends [...any[]]> = Tuple extends any[]
  ? {
      [Index in keyof Tuple]: Class<Tuple[Index]>;
    }
  : [];

export class DependencyInjector {
  depMap = new Map<Class<any>, Class<any>[]>();
  ctorMap = new Map<Class<any>, Class<any>>();
  instanceMap = new Map<Class<any>, any>();

  registerClass<K extends Class<any>>(klass: K, deps: Classes<ConstructorParameters<K>>, ctor?: K) {
    this.depMap.set(klass, deps);
    this.ctorMap.set(klass, ctor ?? klass);
  }

  getSingleton<T>(klass: { new (...args: any[]): T }): T {
    const existingInstance = this.instanceMap.get(klass);
    if (existingInstance) return existingInstance;

    const instance = this.createShallow(klass);
    this.instanceMap.set(klass, instance);

    return instance;
  }

  createShallow<T>(klass: { new (...args: any[]): T }): T {
    const depKlasses = this.depMap.get(klass);
    if (!depKlasses) {
      throw new Error(`[DI] Cannot create unregistered class ${klass.name}`);
    }
    const depInstances = depKlasses.map((depKlass) => this.getSingleton(depKlass));

    const ctor = this.ctorMap.get(klass) ?? klass;
    const newInstance = new ctor(...depInstances);

    return newInstance;
  }

  clear() {
    this.depMap.clear();
    this.ctorMap.clear();
    this.instanceMap.clear();
  }
}

export const di = new DependencyInjector();
