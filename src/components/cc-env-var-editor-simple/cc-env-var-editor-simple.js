import '../cc-env-var-create/cc-env-var-create.js';
import '../cc-env-var-input/cc-env-var-input.js';
import { css, html, LitElement } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { dispatchCustomEvent } from '../../lib/events.js';
import { i18n } from '../../lib/i18n.js';

const SKELETON_VARIABLES = [
  { name: 'VARIABLE_ONE', value: '' },
  { name: 'VARIABLE_FOOBAR', value: '' },
  { name: 'VARIABLE_PORT', value: '' },
];

/**
 * @typedef {import('./cc-env-var-editor-simple.types.js').Variable} Variable
 */

/**
 * A high level environment variable editor to create/edit/delete variables one at a time (with validation and error messages).
 *
 * @cssdisplay grid / none (with `[hidden]`)
 *
 * @event {CustomEvent<Variable[]>} cc-env-var-editor-simple:change - Fires the new list of variables whenever something changes in the list.
 */
export class CcEnvVarEditorSimple extends LitElement {

  static get properties () {
    return {
      disabled: { type: Boolean },
      mode: { type: String },
      readonly: { type: Boolean },
      variables: { type: Array },
    };
  }

  constructor () {
    super();

    /** @type {boolean} Sets `disabled` attribute on inputs and buttons. */
    this.disabled = false;

    /** @type {string} Sets the mode of the variables name validation. */
    this.mode = '';

    /** @type {boolean} Sets `readonly` attribute on inputs and hides buttons. */
    this.readonly = false;

    // this.variables is let to undefined by default (this triggers skeleton screen)
    /** @type {Variable[]|null} Sets the list of variables. */
    this.variables = null;
  }

  _onCreate ({ detail: newVar }) {
    this.variables = [...this.variables, newVar];
    dispatchCustomEvent(this, 'change', this.variables);
  }

  _onInput ({ detail: editedVar }) {
    this.variables = this.variables.map((v) => {
      return (v.name === editedVar.name)
        ? { ...v, value: editedVar.value }
        : v;
    });
    dispatchCustomEvent(this, 'change', this.variables);
  }

  _onDelete ({ detail: deletedVar }) {
    this.variables = this.variables
      .filter((v) => {
        return (v.name === deletedVar.name)
          ? (!v.isNew)
          : true;
      })
      .map((v) => {
        return (v.name === deletedVar.name)
          ? { ...v, isDeleted: true }
          : v;
      });
    dispatchCustomEvent(this, 'change', this.variables);
  }

  _onKeep ({ detail: keptVar }) {
    this.variables = this.variables.map((v) => {
      return (v.name === keptVar.name)
        ? { ...v, isDeleted: false }
        : v;
    });
    dispatchCustomEvent(this, 'change', this.variables);
  }

  render () {

    const skeleton = (this.variables == null);
    const variables = skeleton ? SKELETON_VARIABLES : this.variables;
    const variablesNames = variables.map(({ name }) => name);

    return html`

      ${!this.readonly ? html`
        <cc-env-var-create
          ?disabled=${skeleton || this.disabled}
          mode=${this.mode}
          .variablesNames=${variablesNames}
          @cc-env-var-create:create=${this._onCreate}
        ></cc-env-var-create>
      ` : ''}

      <div class="message" ?hidden=${variables != null && variables.length !== 0}>
        ${i18n('cc-env-var-editor-simple.empty-data')}
      </div>

      ${repeat(variables, ({ name }) => name, ({ name, value, isNew, isEdited, isDeleted }) => html`
        <cc-env-var-input
          name=${name}
          value=${value}
          ?new=${isNew}
          ?edited=${isEdited}
          ?deleted=${isDeleted}
          ?skeleton=${skeleton}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @cc-env-var-input:input=${this._onInput}
          @cc-env-var-input:delete=${this._onDelete}
          @cc-env-var-input:keep=${this._onKeep}
        ></cc-env-var-input>
      `)}
    `;
  }

  static get styles () {
    // language=CSS
    return css`
      :host {
        display: grid;
        grid-gap: 0.5em;
      }

      :host([hidden]) {
        display: none;
      }

      /* Negative margin + padding to make the background-color span through the full width of the cc-block, despite the cc-block padding */
      cc-env-var-create {
        background-color: var(--cc-color-bg-neutral);
        margin-bottom: 0.5em;
        margin-inline: -1em;
        padding: 1em;
      }

      .message {
        color: var(--cc-color-text-weak);
        font-style: italic;
        margin: 0.2em;
      }
    `;
  }
}

window.customElements.define('cc-env-var-editor-simple', CcEnvVarEditorSimple);
