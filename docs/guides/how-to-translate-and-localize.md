---
kind: '📌 Docs'
---
# How to translate and localize?

Welcome to this complete guide about the translation and localization system of our component library.

**_🧐 OBSERVATIONS:_**

* This system is agnostic to how the different components of this library are coded/implemented.
* This system is agnostic to the code/stack of your target application.
* This system tries to have the smallest API surface in our components, just a `i18n(key, params)` function with 2 args.
* This system assumes your users MUST reload the page to apply a language change.
* We don't have a way to only load the translations for a set of components (but we'd like to).

## As a user

If you're using our component library, you'll need to:
 
1. Load the language file(s)
2. Register language(s)
3. Select the language selected by your user

Depending on your context, the setup can be done synchronously or asynchronously.

### Asynchronous setup example

It's always better if you can only load the language you need.

```js
// Import function from system
import { addTranslations, setLanguage } from '@clevercloud/components/dist/lib/i18n.js';

// Load the language files asynchronously (ex: french only) 
import('@clevercloud/components/dist/translations/translations.fr.js')
  .then(({ lang, translations }) => {
    // Register languages (ex: french)
    addTranslations(lang, translations);
    // Select the language selected by your user (ex: french)
    setLanguage(lang);
  })
```

### Synchronous setup example

```js
// Load the language files synchronously (ex: english and french) 
import * as en from '@clevercloud/components/dist/translations/translations.en.js';
import * as fr from '@clevercloud/components/dist/translations/translations.fr.js';

// Import function from system
import { addTranslations, setLanguage } from '@clevercloud/components/dist/lib/i18n.js';

// Register languages
addTranslations(en.lang, en.translations);
addTranslations(fr.lang, fr.translations);

// Select the language selected by your user (ex: english)
setLanguage(en.lang);
```

## As a developer/contributor

If you're working on a component, you'll need to:
 
1. Import the `i18n()` function. 
2. Use it in your templates.
3. Create new translations in all language files.
4. Follow the rules and avoid the traps. 

### Import the `i18n()` function 

To use the `i18n()` function, import it from the `i18n.js`:

```js
import { i18n } from 'src/lib/i18n.js';
```

NOTE: The path to the `i18n.js` will be relative to your component's file.

### Use the `i18n()` function

If you're translating a static sentence/word, you can call the function with only the first argument which is the key:

```html
<div>${i18n('my-component.hello-world')}</div>
```

If you're translating a sentence with some parameters, you need to pass them as the second argument which is always an object:

```html
<div>${i18n('my-component.hello-name', { name: 'John' })}</div>
```

**_🧐 OBSERVATIONS:_**

* When the `i18n()` returns text, you CANNOT trust it and your templating library needs to handle it properly. That's what `lit-html` does for us.
* When the `i18n()` returns a DOM fragment, you can trust it, it has been sanitized internally.
* You MUST always use the `i18n()` function with keys as static text.

This means, if you have translation keys with the same prefix, you CANNOT do this:

```html
<!-- DON'T DO THIS! -->
<div>${i18n('my-component.state.' + myState)}</div>
```

You will have to use a `switch` or some `if`s like this:

```js
_getState (state) {
  if (state === 'foo') {
    return i18n('my-component.state.foo');
  }
  if (state === 'bar') {
    return i18n('my-component.state.bar');
  }
  if (state === 'baz') {
    return i18n('my-component.state.baz');
  }
};
```

and then use the function in your template like this:

```html
<div>${i18n(this._getState(myState)}</div>
```

### Language files

Our language files are JavaScript files located at `src/translations/translations.[lang].js`.
They all follow this pattern:

* Import helper functions (date, number and sanitize).
* Export `lang`, a string with the language code.
* Setup helper functions for the current lang.
* Export `translations`, a key/value object where the key is the translation id/key and the value is a string or function.

### Create a new translation

NOTE: All the conventions described below are enforced with a series of custom ESLint rules.

When you create a new translation, please follow those rules:

* Don't use a translation in multiple components.
* Prefix your translation key with the name of the component and a dot: `my-component.`.
* Use a dash `-` with composed names but not `_`.
* Use a dot `.` to split by "category" or "section".
* Group the translations by component and surround them with:
  * a start comment: `//#region my-component`.
  * a end comment: `//#endregion`.
* Sort the groups and translations in alphabetical order.

Here's a few examples of how to create new translation:

#### Static text

```js
{ 'my-component.hello-world': `Hello World!` }
```

#### Text with params

```js
{ 'my-component.hello-name': ({ name }) => `Hello ${name}!` }
```

#### Static text with HTML

```js
{ 'my-component.hello-world': () => sanitize`Hello <strong>World!</strong>` }
```

**_⚠️ WARNING:_** You MUST always use an arrow function with `sanitize`! If you don't, it will fail when you use this translation more than once at the same time in your component. 

#### Text with params and HTML

```js
{ 'my-component.hello-name': ({ name }) => sanitize`Hello <strong>${name}</strong>!` }
```

### HTML in translations

If some HTML is needed in the translations, you need to keep it simple and to make sure it is safe.
This is the role of the `sanitize` template tag function.

Here are the rules for the HTML you use in your translations:

* All tags that are not whitelisted are replaced by their inner text content.
* Current whitelisted tags are: `<strong>`, `<em>`, `<code>`, `<a>`.
* Any attribute not following those two rules will be removed.
  * You can use the `title` attribute on any of the whitelisted tags.
  * You can use the `href` attribute on the `<a>` tag.
* If the origin of the `<a href>` is not the same as the current page's origin, two attributes are added:
  * `target="_blank"` because [we don't want users to loose what they're working on](https://css-tricks.com/use-target_blank/#article-header-id-7) and it's a simple way to achieve that.
  * `rel="noopener noreferrer"` to avoid [problem one](https://mathiasbynens.github.io/rel-noopener/), [problem two](https://jakearchibald.com/2016/performance-benefits-of-rel-noopener/) and for security reasons.

**_🧐 OBSERVATIONS:_**

* If your params contain HTML, they will be escaped.
* The `sanitize` template tag function returns a DOM fragment and not a string.

### Dates, numbers, plurals...

Our i18n system tries to be the smallest possible and to rely on standards as much as possible.
Our browser target is: 2 latest version of Chrome/Firefox/Safari + Edgium (Edge based on Chromium).

For dates, we rely on:

* [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)
* [`Intl.RelativeTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RelativeTimeFormat) with a simplified custom fallback implementation for Safari.

Please follow those rules:

* Try to reuse the already existing functions/formats.
* We're sill using simple language settings without locales like GB or US for english so try to avoid the `DD/MM/YYYY` vs. `MM/DD/YYYY` format.

For numbers, we rely on:

* [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat)

Please follow those rules:

* Don't forget to use it for percents.

We decided not to use [`Intl.PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/PluralRules) because of its limited support and because our current use case (english and french) is really simple.
We just use a simple/dumb `plural()` helper function.

### Check missing/unused translations with the i18n task

Thanks to [i18n-extract](https://github.com/oliviertassinari/i18n-extract), we were able to create a task to enforce those rules:

* Don't forget to translate a key that is used in a component.
* Don't translate a key that is never used in a component.
* Don't use dynamic keys with `i18n()`.

You can run this check with:

```bash
npm run components:check-i18n
```

### Check hard coded text with the "missing" language

In our Storybook, you can:

* Change the language with a control in the canvas tab.
* Change the language with the `i` key shortcut (canvas tab and docs tab).

The keyboard shortcut will cycle through english, french and "missing".

In any situation, if a translation is missing, it will be displayed as some angry emoji faces 🤬🤬🤬🤬🤬.
It's a good visual helper to identify missing translations while you're working on the component (the i18n would catch them eventually).

We also have a "missing" language.
When you select it, all translations are missing and displayed as 🤬🤬🤬🤬🤬.
In this mode, if you still see some text that does not come from your inputs (properties, attributes...), it means it's hard coded.
