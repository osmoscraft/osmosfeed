class FunctionalComponentV2<AttrType> {
  static createComponent<AttrType = any>(tagName: string) {
    return new FunctionalComponentV2<AttrType>(tagName);
  }

  constructor(private _tagName: string) {
    this._tagName = _tagName;
  }

  private _attr = new AttrDict() as AttrDict & Record<string, any>;
  private _innerHTML = "";

  class(...classList: string[]) {
    const newInstance = this.clone();
    newInstance._attr["class"] = [...(this._attr["class"] ?? "").split(" "), ...classList].join(" ");
    return newInstance;
  }
  attr(attrObj: Record<string, any>) {
    const newInstance = this.clone();
    Object.entries(attrObj).forEach(([key, value]) => {
      newInstance._attr[key] = value;
    });
    return newInstance;
  }
  renderChild(renderFn: RenderFn<AttrType>) {
    const newInstance = this.clone();
    newInstance._renderChild = renderFn;
    return newInstance;
  }
  innerHTML(innerHTML: string) {
    const newInstance = this.clone();
    newInstance._innerHTML = innerHTML;
    return newInstance;
  }
  toString() {
    return `<${this._tagName} ${this._attr}>${
      this._renderChild?.({
        attr: this._attr as AttrType,
      }) ?? ""
    }</${this._tagName}>`;
  }

  private _renderChild(_props: RenderFnProps<AttrType>) {
    console.log(this._innerHTML);
    return this._innerHTML;
  }

  private clone() {
    const newInstnace = FunctionalComponentV2.createComponent<AttrType>(this._tagName);
    newInstnace._tagName = this._tagName;
    newInstnace._attr = this._attr.clone();
    newInstnace._innerHTML = this._innerHTML;
    newInstnace._renderChild = this._renderChild;

    return newInstnace;
  }
}

export const fxc = FunctionalComponentV2.createComponent;

export interface RenderFnProps<T> {
  attr: T & Record<string, any>;
}

export interface RenderFn<T> {
  (props: RenderFnProps<T>): string;
}

class AttrDict {
  clone() {
    const newInstance = new AttrDict();
    Object.assign(newInstance, Object.fromEntries(Object.entries(this)));
    return newInstance;
  }

  toString() {
    return Object.getOwnPropertyNames(this)
      .map((name) => `${name}="${(this as any)[name]}"`)
      .join(" ");
  }
}
