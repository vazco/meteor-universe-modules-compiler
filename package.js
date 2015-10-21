Package.describe({
    name: 'universe:modules-compiler',
    version: '1.0.0',
    summary: 'Compiler based on babel-compiler with enabled modules',
    git: '',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.0.2');

    api.use([
        'babel-compiler@5.8.24_1',
        'ecmascript',
        'underscore'
    ], 'server');

    api.addFiles('compiler.js', 'server');

    api.export('UniverseModulesCompiler', 'server');
});