import { objectEquals } from './utils.js';

// In the global space of this module (for any module importing it), we maintain:
// * a rootContext object
// * a smartContainers Set with all containers currently in the page
// * a smartComponentDefinitions Set with all definitions currently in the page

// On each container, we maintain:
// * a Map on container[COMPONENTS] with all components keyed by definition object
// * an object with the current context on container[CURRENT_CONTEXT]

// On each component, we maintain:
// * an object with the last context on component[LAST_CONTEXT]

/**
 * @typedef SmartComponentDefinition
 * @property {String} selector
 * @property {Object?} params
 * @property {Function?} onConnect
 * @property {Function?} onContextUpdate
 * @property {Function?} onDisconnect
 */

const COMPONENTS = Symbol('COMPONENTS');
const CURRENT_CONTEXT = Symbol('CURRENT_CONTEXT');
const LAST_CONTEXT = Symbol('LAST_CONTEXT');
let rootContext = {};

/** @type {Set<CcSmartContainer>} */
const smartContainers = new Set();

/** @type {Set<SmartComponentDefinition>} */
const smartComponentDefinitions = new Set();

/**
 * @param {CcSmartContainer} container
 * @param {AbortSignal} signal
 */
export function observeContainer (container, signal) {

  container[COMPONENTS] = new Map();
  smartContainers.add(container);

  // TODO: Seems like debouncing this reduces the number of call but is it really necessary?
  const mutationObserver = new MutationObserver(() => updateEverything());
  mutationObserver.observe(container, { childList: true, subtree: true, attributes: true, attributeOldValue: true });

  signal.addEventListener('abort', () => {

    mutationObserver.disconnect();
    smartContainers.delete(container);

    // Properly disconnect components
    container[COMPONENTS].forEach((allComponents, definition) => {
      allComponents.forEach((component) => disconnectComponent(container, definition, component));
    });
    delete container[COMPONENTS];
    delete container[CURRENT_CONTEXT];

  }, { once: true });
}

/**
 * @param {SmartComponentDefinition} definition
 * @param {AbortSignal?} signal
 */
export function defineSmartComponentCore (definition, signal) {

  smartComponentDefinitions.add(definition);
  updateEverything();

  if (signal != null) {
    signal.addEventListener('abort', () => {

      smartComponentDefinitions.delete(definition);

      // Properly disconnect components
      smartContainers.forEach((container) => {
        const allComponents = container[COMPONENTS].get(definition) ?? [];
        allComponents.forEach((component) => disconnectComponent(container, definition, component));
        container[COMPONENTS].delete(definition);
      });

    }, { once: true });
  }
}

function updateEverything () {

  const allDisconnectedComponents = [];
  const allConnectedComponents = [];
  const allIdleComponents = [];

  smartContainers.forEach((container) => {
    smartComponentDefinitions.forEach((definition) => {

      const allDefinitionComponents = Array.from(container.querySelectorAll(definition.selector))
        .filter((c) => closestParent(c, 'cc-smart-container') === container);

      const previousComponents = container[COMPONENTS].get(definition) ?? [];
      container[COMPONENTS].set(definition, allDefinitionComponents);

      // connected
      allDefinitionComponents
        .filter((component) => !previousComponents.includes(component))
        .forEach((component) => allConnectedComponents.push([container, definition, component]));

      // idle
      allDefinitionComponents
        .filter((component) => previousComponents.includes(component))
        .forEach((component) => allIdleComponents.push([container, definition, component]));

      // disconnected
      previousComponents
        .filter((component) => !allDefinitionComponents.includes(component))
        .forEach((component) => allDisconnectedComponents.push([container, definition, component]));
    });
  });

  allDisconnectedComponents.forEach(([container, definition, component]) => disconnectComponent(container, definition, component));

  allConnectedComponents.forEach(([container, definition, component]) => connectComponent(container, definition, component));

  [...allConnectedComponents, ...allIdleComponents].forEach(([container, definition, component]) => updateComponentContext(container, definition, component));
}

/**
 * @param {CcSmartContainer} container
 * @param {Object} context
 */
export function updateContext (container, context) {
  container[CURRENT_CONTEXT] = context;
  updateEverything();
}

/**
 * @param {Object} context
 */
export function updateRootContext (context) {
  rootContext = context;
  updateEverything();
}

/**
 * @param {CcSmartComponent} container
 * @param {SmartComponentDefinition} definition
 * @param {Element} component
 */
function connectComponent (container, definition, component) {
  component[LAST_CONTEXT] = {};
  definition.onConnect?.(container, component);
}

/**
 * @param {CcSmartComponent} container
 * @param {SmartComponentDefinition} definition
 * @param {Element} component
 */
function updateComponentContext (container, definition, component) {
  const currentContext = { ...rootContext, ...container[CURRENT_CONTEXT] };
  const filteredContext = filterContext(currentContext, definition.params);
  if (objectEquals(component[LAST_CONTEXT], filteredContext)) {
    return;
  }
  component[LAST_CONTEXT] = filteredContext;
  definition.onContextUpdate?.(container, component, filteredContext);
}

/**
 * @param {CcSmartComponent} container
 * @param {SmartComponentDefinition} definition
 * @param {Element} component
 */
function disconnectComponent (container, definition, component) {
  delete component[LAST_CONTEXT];
  definition.onDisconnect?.(container, component);
}

// LOW LEVEL HELPERS

/**
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Element}
 */
function closestParent (element, selector) {
  return element.parentElement.closest(selector);
}

/**
 *
 * @param {Object|null} source
 * @param {Object|null} keyObject
 * @return {Object}
 */
function filterContext (source, keyObject) {
  if (source == null) {
    return {};
  }
  if (keyObject == null) {
    return source;
  }
  const newEntries = Object.keys(keyObject)
    .map((name) => [name, source[name]])
    .filter(([name, value]) => value !== undefined);
  return Object.fromEntries(newEntries);
}
