import { Dashicon } from '@wordpress/components';
import { registerPlugin } from '@wordpress/plugins';
import { createElement } from 'react';

import { Plugin } from './Plugin';

let name = 'stripe-retreats-plugin';
let icon = 'bank' as Dashicon.Icon;

registerPlugin(name, {
  icon,
  render: () => createElement(Plugin, { name, icon }),
});
