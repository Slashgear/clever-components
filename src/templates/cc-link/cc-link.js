import { css, html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

function isDifferentOrigin (rawUrl) {
  try {
    const url = new URL(rawUrl, location.href);
    return (url.origin !== location.origin);
  }
  catch (e) {
    // Consider bad URLs as different origin
    return true;
  }
}

// NOTE: we could just create raw DOM but here we benefit from lit-html safe/escaping system on "content"
export const ccLink = (url, content, skeleton = false) => {
  const href = (url != null) ? url : undefined;
  const target = isDifferentOrigin(href) ? '_blank' : undefined;
  const rel = isDifferentOrigin(href) ? 'noopener noreferrer' : undefined;
  return html`<a class="cc-link ${classMap({ skeleton })}" href=${ifDefined(href)} target=${ifDefined(target)} rel=${ifDefined(rel)}>${content}</a>`;
};

// language=CSS
export const linkStyles = css`
  .sanitized-link,
  .sanitized-link:visited,
  .sanitized-link:active,
  .cc-link,
  .cc-link:visited,
  .cc-link:active {
      color: var(--cc-color-text-primary-highlight, blue);
  }

  .sanitized-link:enabled:hover,
  .cc-link:enabled:hover {
    color: var(--cc-color-text-primary);
  }

  .sanitized-link:focus,
  .cc-link:focus {
    background-color: var(--cc-color-bg-default, #fff);
    border-radius: 0.1em;
    box-shadow: 0 0 0 .1em var(--cc-color-bg-default, #fff), 0 0 0 .3em rgba(50, 115, 220, .25);
    outline: 0;
  }

  .sanitized-link::-moz-focus-inner,
  .cc-link::-moz-focus-inner {
    border: 0;
  }

  .cc-link.skeleton,
  .sanitized-link.skeleton,
  .cc-link .skeleton,
  .sanitized-link .skeleton {
    background-color: var(--cc-color-text-primary-weak, hsl(209, 98%, 73%));
    color: transparent;
  }
`;
