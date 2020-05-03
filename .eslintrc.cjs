module.exports = {
  'extends': 'standard',
  'plugins': [
    'import',
    'lit',
  ],
  'rules': {
    // custom rules
    'i18n-always-arrow-with-sanitize': ['error'],
    'i18n-always-sanitize-with-html': ['error'],
    'i18n-no-paramless-arrow': ['error'],
    'i18n-no-sanitize-without-html': ['error'],
    'i18n-order': ['error'],
    'i18n-valid-key': ['error'],
    'i18n-valid-value': ['error'],
    'sort-lit-element-css-declarations': ['error'],
    // other rules
    'accessor-pairs': 'off',
    'arrow-parens': ['error', 'always'],
    'brace-style': ['error', 'stroustrup'],
    'camelcase': ['error', { allow: ['_lp$'] }],
    'comma-dangle': ['error', 'always-multiline'],
    'curly': ['error', 'all'],
    'eqeqeq': ['error', 'always', { 'null': 'never' }],
    'import/extensions': ['error', 'always'],
    'import/first': ['error'],
    'import/newline-after-import': ['error', { 'count': 1 }],
    'import/no-useless-path-segments': ['error', { 'noUselessIndex': true }],
    'import/order': ['error', { 'alphabetize': { 'order': 'asc', 'caseInsensitive': true } }],
    'line-comment-position': ['error', { 'position': 'above' }],
    'lit/attribute-value-entities': 'error',
    'lit/binding-positions': 'error',
    'lit/no-duplicate-template-bindings': 'error',
    'lit/no-invalid-escape-sequences': 'error',
    'lit/no-invalid-html': 'error',
    'lit/no-legacy-template-syntax': 'error',
    'lit/no-private-properties': 'error',
    'lit/no-template-bind': 'error',
    'lit/no-useless-template-literals': 'error',
    'lit/no-value-attribute': 'error',
    'multiline-ternary': 'off',
    'operator-linebreak': ['error', 'before'],
    'padded-blocks': 'off',
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'semi': ['error', 'always'],
    'sort-lit-element-css-declarations': ['error'],
    'spaced-comment': ['error', 'always', { 'markers': ['#region', '#endregion'] }],
  },
};
