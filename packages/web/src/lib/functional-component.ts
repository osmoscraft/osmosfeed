class FunctionalComponent<AttrType> {
  static createComponent<AttrType = any>(renderFn: RenderFn<AttrType>) {
    return new FunctionalComponent<AttrType>(renderFn);
  }

  constructor(private renderFn: RenderFn<AttrType>) {
    this.renderFn = renderFn.bind(this);
  }
  private _attr = new AttrDict();
  private _child: string;

  class(classString: string) {
    this._attr["class"] = classString;
    return this;
  }
  attr(attrObj: Record<string, any>) {
    Object.entries(attrObj).forEach(([key, value]) => {
      this._attr[key] = value;
    });
    return this;
  }

  child(html: string) {
    this._child = html;
    return this;
  }

  toString() {
    return this.renderFn({
      attr: this._attr as AttrType,
      child: this._child,
    });
  }
}

export const fxc = FunctionalComponent.createComponent;

export interface RenderFnProps<T> {
  attr: T & Record<string, any>;
  child: string;
}

export interface RenderFn<T> {
  (props: RenderFnProps<T>): string;
}

class AttrDict {
  toString() {
    return Object.getOwnPropertyNames(this)
      .map((name) => `${name}="${this[name]}"`)
      .join(" ");
  }
}
