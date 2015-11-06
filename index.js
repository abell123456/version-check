var hooks = require('./node_modules/git-hooks/src/index');

hooks.install('verCheck', 'pre-push', true);