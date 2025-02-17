import { render } from 'lit';
import { makeStory } from '../../stories/lib/make-story.js';
import { skeletonStyles } from '../../styles/skeleton.js';
import { ccLink, linkStyles } from './cc-link.js';
import docsPage from './cc-link.md';

export default {
  title: '♻️ Templates/ccLink()',
  parameters: { docs: { page: docsPage.parameters.docs.page } },
};

const conf = {
  css: [linkStyles, skeletonStyles].join(''),
};

export const defaultStory = makeStory(conf, {
  dom: (container) => render(ccLink('https://example.com', 'This is an outside link using the link styles'), container),
});

export const innerLink = makeStory(conf, {
  dom: (container) => render(ccLink('/other-page', 'This is an inside link using the link styles'), container),
});

export const skeleton = makeStory(conf, {
  dom: (container) => render(ccLink('https://example.com', 'This is a link using the link styles', true), container),
});
