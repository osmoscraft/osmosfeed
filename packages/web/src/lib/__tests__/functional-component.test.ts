import { beforeEach, describe, expect, it } from "@osmoscraft/typescript-testing-library";
import { fxc } from "../functional-component";

describe("fxc", () => {
  it("instantiates", async () => {
    await expect(() => {
      fxc("my-component");
    }).not.toThrow();
  });

  it("renders simple element", async () => {
    const component = fxc("my-component");
    await expect(component.toString()).toEqual("<my-component></my-component>");
  });

  it("renders pre-defined class", async () => {
    const component = fxc("my-component").class("hello");
    await expect(component.toString()).toEqual(`<my-component class="hello"></my-component>`);
  });
  it("renders custom class", async () => {
    const component = fxc("my-component").class("hello");
    await expect(component.class("world").toString()).toEqual(`<my-component class="hello world"></my-component>`);
  });

  it("renders pre-defined attr", async () => {
    const component = fxc("my-component").attr({ foo: "bar" });
    await expect(component.toString()).toEqual(`<my-component foo="bar"></my-component>`);
  });
  it("renders custom attr", async () => {
    const component = fxc("my-component").attr({ foo: "bar" });
    await expect(component.attr({ fiz: "buz" }).toString()).toEqual(
      `<my-component foo="bar" fiz="buz"></my-component>`
    );
  });

  it("renders predefined innerHTML", async () => {
    const component = fxc("my-component").innerHTML("hello");
    await expect(component.toString()).toEqual(`<my-component>hello</my-component>`);
  });
  it("renders custom innerHTML", async () => {
    const component = fxc("my-component").innerHTML("hello");
    await expect(component.innerHTML("world").toString()).toEqual(`<my-component>world</my-component>`);
  });

  it("applies predefined render function", async () => {
    const component = fxc("my-component").renderChild(() => "hello");
    await expect(component.toString()).toEqual(`<my-component>hello</my-component>`);
  });
  it("applies custom render function", async () => {
    const component = fxc("my-component").renderChild(() => "hello");
    await expect(component.renderChild(() => "world").toString()).toEqual(`<my-component>world</my-component>`);
  });
});
