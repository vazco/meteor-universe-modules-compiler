UniverseModulesCompiler = class UniverseModulesCompiler extends BabelCompiler {

    constructor ({extraFeatures, _autoExecRegex, extraTransformers = []} = {}) {

        // pass options to MDG BabelCompiler
        super(extraFeatures);

        // @todo transformers should be easily extensible per app/package config
        // this will be added in future releases
        this._transformers = _.union([
            'es6.modules',
            'es7.decorators',
            'regenerator'
        ], extraTransformers);

        // modules that will pass this regex will be executed right after registration
        // this is kind of internal hack and may change in the future without major version bump!
        this._autoExecRegex = _autoExecRegex;

        // this is also an internal implementation that is subject to change
        this._moduleIdPrefix = '/_modules_/';
    }

    processFilesForTarget (inputFiles) {
        inputFiles.forEach(this.processFile, this);
    }

    processFile (inputFile) {

        // Full contents of the file as a string
        const source = inputFile.getContentsAsString();

        // Relative path of file to the package or app root directory (always uses forward slashes)
        const filePath = inputFile.getPathInPackage();

        // Options from api.addFile
        const fileOptions = inputFile.getFileOptions();

        // Get moduleId, this could be extended with custom logic
        const moduleId = this.getModuleId(inputFile);

        // Get options from original MDG Babel compilier
        const babelDefaultOptions = Babel.getDefaultOptions(this.extraFeatures);

        const babelOptions = _({}).extend(babelDefaultOptions, {
            sourceMap: true,
            filename: filePath,
            sourceFileName: '/' + filePath,
            sourceMapName: '/' + filePath + '.map',
            modules: 'system',
            moduleIds: true,
            moduleId,
            whitelist: this.getTransformers(inputFile)
        });

        try {
            var result = Babel.compile(source, babelOptions);
        } catch (e) {
            if (e.loc) {
                inputFile.error({
                    message: e.message,
                    sourcePath: filePath,
                    line: e.loc.line,
                    column: e.loc.column
                });
                return;
            }
            throw e;
        }

        if (this._autoExecRegex && this._autoExecRegex.test(moduleId)) {
            // @todo find better way to auto execute code
            // strange thing, its getting added twice on the server, bug or build plugin intended behavior?
            result.code += `System.import('${moduleId}');`;
        }

        inputFile.addJavaScript({
            sourcePath: filePath,
            path: filePath,
            data: result.code,
            hash: result.hash,
            sourceMap: result.map,
            bare: !!fileOptions.bare
        });
    }

    getModuleId (inputFile) {
        const filePath = inputFile.getPathInPackage();
        const packageName = inputFile.getPackageName();

        const moduleId = filePath.replace('.' + inputFile.getExtension(), '');

        // prefix module name accordingly
        if (packageName) {
            // inside package
            return this._moduleIdPrefix + 'packages/' + packageName.replace(':', '/') + '/' + moduleId;
        }

        // inside main app
        return this._moduleIdPrefix + 'app/' + moduleId;
    }

    getTransformers (inputFile) {
        const {whitelist} = Babel.getDefaultOptions(this.extraFeatures);
        const fileOptions = inputFile.getFileOptions();
        
        let extraWhitelist = [];
        
        if(fileOptions && Array.isArray(fileOptions.babelWhitelist)) {
            extraWhitelist = fileOptions.babelWhitelist;
        }

        // add react for every jsx file
        if (/jsx$/.test(inputFile.getExtension())) {
            extraWhitelist.push('react');
        }

        return _.union(whitelist, this._transformers, extraWhitelist);
    }
};
