/**
 * Utility functions for SVG element creation and manipulation
 */

/**
 * Create an SVG element with attributes
 */
export function createSVGElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes?: Record<string, string | number>
): SVGElementTagNameMap[K] {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
  }
  
  return element;
}

/**
 * Set multiple attributes on an SVG element
 */
export function setAttributes(
  element: SVGElement,
  attributes: Record<string, string | number>
): void {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });
}

/**
 * Remove all children from an element
 */
export function clearElement(element: Element): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
