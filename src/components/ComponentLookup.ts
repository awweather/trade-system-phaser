import * as components from "./Components.ts";
class ComponentLookup {
  private indexedComponents: Map<string, any>;
  constructor() {
    this.indexedComponents = new Map<string, any>();

    Object.keys(components).forEach((componentKey: string) => {
      this.indexedComponents.set(
        componentKey.toLowerCase(),
        components[componentKey] as any
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
