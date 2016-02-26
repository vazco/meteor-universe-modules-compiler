Package.describe({
    name: 'universe:modules-compiler',
    version: '1.0.5',
    summary: 'Compiler based on babel-compiler with enabled modules',
    git: 'https://github.com/vazco/meteor-universe-modules-compiler',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.0.2');

    api.use([
        'babel-compiler@6.4.0-modules.8',
        'caching-compiler@1.0.0',
        'ecmascript',
        'underscore'
    ], 'server');

    api.addFiles('compiler.js', 'server');

    api.export('UniverseModulesCompiler', 'server');
});