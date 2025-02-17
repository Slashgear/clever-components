import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { dispatchCustomEvent } from '../../lib/events.js';

/**
 * @typedef {import('./cc-toggle.types.js').Choice} Choice
 */

/**
 * A radio/checkbox input group component acting like a toggle between many options.
 *
 * ## When to use?
 *
 * * This component does not replace regular usage of radio/checkbox inputs in forms.
 * * It works well in toolbars or filter panels.
 * * The single mode mode (default) works well to toggle a component between two (or more) modes.
 *
 * ## Details
 *
 * * Single mode (default) is one selected choice.
 * * Multiple mode is zero to many selected choices and is enabled by setting \`multipleValues\`.
 *
 * ## Technical details
 *
 * * Single mode (default) uses native `input[type=radio]` under the hood to keep native behaviour (a11y, keyboards...).
 * * Multiple mode uses native `input[type=checkbox]` under the hood to keep native behaviour (a11y, keyboards...).
 * * We decided to use a JavaScript array of objects for the choices because it's way simpler to implement and not that dirtier to use.
 *
 * @cssdisplay inline-flex
 *
 * @event {CustomEvent<string>} cc-toggle:input - Fires the selected `value` whenever the selected `value` changes (single mode only).
 * @event {CustomEvent<string[]>} cc-toggle:input-multiple - Fires the selected `multipleValues` whenever the selected `multipleValues` changes (single mode only).
 *
 * @cssprop {BorderRadius} --cc-toggle-border-radius - Sets the value of the border radius CSS property (defaults: `0.15em`).
 * @cssprop {Color} --cc-toggle-color - The main color of the toggle (defaults: `#334252`). It must be defined directly on the element.
 * @cssprop {FontWeight} --cc-toggle-font-weight - Sets the value of the font weight CSS property (defaults: `bold`).
 * @cssprop {Filter} --cc-toggle-img-filter - A CSS filter to apply on images of all choices (defaults: `none`). It must be defined directly on the element.
 * @cssprop {Filter} --cc-toggle-img-filter-selected - A CSS filter to apply on images of selected choices (defaults: `none`). It must be defined directly on the element.
 * @cssprop {TextTransform} --cc-toggle-text-transform - Sets the value of the text transform CSS property (defaults: `uppercase`).
 */
export class CcToggle extends LitElement {

  static get properties () {
    return {
      /** @required */
      choices: { type: Array },
      disabled: { type: Boolean },
      hideText: { type: Boolean, attribute: 'hide-text' },
      inline: { type: Boolean, reflect: true },
      legend: { type: String },
      multipleValues: { type: Array, attribute: 'multiple-values', reflect: true },
      subtle: { type: Boolean },
      value: { type: String, reflect: true },
    };
  }

  constructor () {
    super();

    /** @type {Choice[]|null} Sets the list of choices. */
    this.choices = null;

    /** @type {boolean} Sets the `disabled` attribute on all inner `<input>` of whole group. */
    this.disabled = false;

    /** @type {boolean} Hides the text and only displays the image specified with `choices[i].image`. The text will be added as `title` on the inner `<label>` and an `aria-label` on the inner `<input>`. */
    this.hideText = false;

    /** @type {boolean} Sets the `<label>` on the left of the `<select>` element.
     * Only use this if your form contains 1 or 2 fields and your labels are short.
     */
    this.inline = false;

    /** @type {string|null} Sets a legend to describe the whole component (input group). */
    this.legend = null;

    /** @type {string[]} Enables multiple mode and sets the selected values. */
    this.multipleValues = null;

    /** @type {boolean} Uses a more subtle display mode, less attractive to the user's attention. */
    this.subtle = false;

    /** @type {string|null} Sets the selected value (single mode only). */
    this.value = null;
  }

  _onChange (e) {
    if (this.multipleValues == null) {
      this.value = e.target.value;
      dispatchCustomEvent(this, 'input', this.value);
    }
    else {
      // Same order as the choices
      const multipleValues = this.choices
        .filter(({ value }) => {
          return value === e.target.value
            ? e.target.checked
            : this.multipleValues.includes(value);
        })
        .map(({ value }) => value);
      this.multipleValues = multipleValues;
      dispatchCustomEvent(this, 'input-multiple', multipleValues);
    }
  }

  render () {

    const classes = {
      disabled: this.disabled,
      enabled: !this.disabled,
      'display-normal': !this.subtle,
      'display-subtle': this.subtle,
      'mode-single': this.multipleValues == null,
      'mode-multiple': this.multipleValues != null,
    };
    const type = (this.multipleValues == null) ? 'radio' : 'checkbox';

    const isChecked = (value) => {
      return (this.multipleValues != null)
        ? this.multipleValues.includes(value)
        : this.value === value;
    };

    return html`
      <fieldset>
        <legend>${this.legend}</legend>
        <div class="toggle-group ${classMap(classes)}">
          ${repeat(this.choices, ({ value }) => value, ({ label, image, value }) => html`
            <input
              type=${type}
              name="toggle"
              .value=${value}
              id=${value}
              ?disabled=${this.disabled}
              .checked=${isChecked(value)}
              @change=${this._onChange}
              aria-label=${ifDefined((image != null && this.hideText) ? label : undefined)}>
            <label for=${value} title=${ifDefined((image != null && this.hideText) ? label : undefined)}>
              ${image != null ? html`
                <img src=${image} alt="">
              ` : ''}
              ${(image == null) || !this.hideText ? html`
                <span>${label}</span>
              ` : ''}
            </label>
          `)}
        </div>
      </fieldset>
    `;
  }

  static get styles () {
    return [
      // language=CSS
      css`
        :host {
          --cc-toggle-color: var(--cc-color-bg-primary, #000000);
          --cc-toggle-img-filter: none;
          --cc-toggle-img-filter-selected: none;
          --height: 2em;
          display: inline-flex;
        }

        /* RESET */
        fieldset {
          border: 0;
          display: inline-block;
          margin: 0;
          min-width: 0;
          padding: 0;
        }

        /* RESET */
        legend {
          color: inherit;
          line-height: inherit;
          max-width: 100%;
          padding: 0;
          white-space: normal;
        }

        legend:not(:empty) {
          line-height: 1.25em;
          padding-bottom: 0.35em;
        }

        :host([inline]) legend {
          /* cannot use flex to change legend position. Only solution is float. */
          float: left;
          /* used to vertically center the floated element. */
          line-height: var(--height);
          margin-right: 1em;
          padding: 0;
          width: max-content;
        }

        .toggle-group {
          background-color: var(--cc-color-bg-default, #fff);
          border-radius: 0.15em;
          box-sizing: border-box;
          display: flex;
          height: var(--height);
          line-height: 1.25;
          overflow: visible;
          width: max-content;
        }

        /* We hide the <input> and only display the related <label> */
        input {
          -moz-appearance: none;
          -webkit-appearance: none;
          appearance: none;
          border: 0;
          display: block;
          height: 0;
          margin: 0;
          outline: none;
          width: 0;
        }

        label {
          /* used around the background */
          --space: 2px;
          --border-radius: var(--cc-toggle-border-radius, 0.15em);
          align-items: center;
          border-color: var(--cc-toggle-color);
          border-style: solid;
          color: var(--color-txt);
          cursor: pointer;
          display: grid;
          font-size: 0.85em;
          font-weight: var(--cc-toggle-font-weight, bold);
          gap: 0.6em;
          grid-auto-flow: column;
          padding: 0 0.6em;
          position: relative;
          text-transform: var(--cc-toggle-text-transform, uppercase);
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        label {
          border-width: 1px 0;
        }

        label:first-of-type {
          border-left-width: 1px;
          border-radius: var(--border-radius) 0 0 var(--border-radius);
        }

        label:last-of-type {
          border-radius: 0 var(--border-radius) var(--border-radius) 0;
          border-right-width: 1px;
        }

        label:not(:first-of-type) {
          margin-left: calc(var(--space) * -1);
        }

        /* Used to display a background behind the text */
        label::before {
          background-color: var(--cc-color-bg);
          border-radius: .15em;
          bottom: var(--space);
          content: '';
          display: block;
          left: var(--space);
          position: absolute;
          right: var(--space);
          top: var(--space);
          z-index: 0;
        }

        /* Used to display a bottom line in display subtle */
        .display-subtle label::after {
          background-color: var(--color-subtle-border);
          bottom: 0;
          content: '';
          display: block;
          height: var(--space);
          left: 0.25em;
          position: absolute;
          right: 0.25em;
          z-index: 0;
        }

        label span,
        label img {
          z-index: 0;
        }

        img {
          display: block;
          height: 1.45em;
          width: 1.45em;
        }

        /* NOT SELECTED */
        label {
          --cc-color-bg: var(--cc-color-bg-default, #fff);
          --color-txt: var(--cc-color-text-default);
        }

        img {
          filter: var(--cc-toggle-img-filter);
        }

        /* DISABLED */
        .toggle-group.disabled {
          opacity: .5;
        }

        .disabled label {
          cursor: default;
        }

        /* HOVERED */
        .display-normal input:not(:checked):enabled:hover + label,
        .display-subtle input:enabled:hover + label {
          --cc-color-bg: var(--cc-color-bg-neutral-hovered);
        }

        /* FOCUS */
        .toggle-group.mode-single.enabled:not(:hover):focus-within,
        .toggle-group.mode-multiple.enabled:not(:hover) input:enabled:focus + label {
          box-shadow: 0 0 0 .2em rgba(50, 115, 220, .25);
          outline: 0;
        }

        .toggle-group.mode-multiple.enabled:not(:hover) input:enabled:focus + label {
          z-index: 1;
        }

        /* ACTIVE */
        input:enabled:active + label::before {
          transform: scale(0.95);
        }

        /* SELECTED */
        input:checked + label img {
          filter: var(--cc-toggle-img-filter-selected);
        }

        .display-normal input:checked + label {
          --cc-color-bg: var(--cc-toggle-color);
          --color-txt: var(--cc-color-text-inverted, #fff);
        }

        .display-subtle input:checked + label {
          --color-txt: var(--cc-toggle-color);
          --color-subtle-border: var(--cc-toggle-color);
        }
      `,
    ];
  }
}

window.customElements.define('cc-toggle', CcToggle);
