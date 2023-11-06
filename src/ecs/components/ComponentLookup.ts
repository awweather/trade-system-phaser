import { components } from "./Components.ts";

class ComponentLookup {
  private indexedComponents: Map<string, any>;
  constructor() {
    this.indexedComponents = new Map<string, any>();
    let comps = components as any;
    Object.keys(components).forEach((componentKey: string) => {
      this.indexedComponents.set(
        componentKey.toLowerCase(),
        comps[componentKey]
      );
    });
  }

  getComponent(componentKey: string) {
    if (componentKey.toLowerCase().indexOf("component") > -1) {
      return this.indexedComponents.get(componentKey.toLowerCase());
    } else {
      return this.indexedComponents.get(
        `${componentKey.toLowerCase()}component`
      );
    }
  }
}

export const componentLookup = new ComponentLookup();
