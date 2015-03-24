'use strict';
var fs = require('fs');
var path = require('path');
var util = require('util');
var angularUtils = require('../util.js');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var wiredep = require('wiredep');


var Generator = module.exports = function Generator(args, options) {
  yeoman.generators.Base.apply(this, arguments);
  this.argument('appname', { type: String, required: false });
  this.appname = this.appname || path.basename(process.cwd());
  this.appname = this._.camelize(this._.slugify(this._.humanize(this.appname)));

  this.option('app-suffix', {
    desc: 'Allow a custom suffix to be added to the module name',
    type: String,
    required: 'false'
  });
  this.scriptAppName = this.appname + angularUtils.appName(this);

  args = ['main'];

  if (typeof this.env.options.appPath === 'undefined') {
    try {
      this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
    } catch (e) {}
    this.env.options.appPath = this.env.options.appPath || 'app';
  }

  this.appPath = this.env.options.appPath;

  if (typeof this.env.options.coffee === 'undefined') {
    this.option('coffee', {
      desc: 'Generate CoffeeScript instead of JavaScript'
    });

    // attempt to detect if user is using CS or not
    // if cml arg provided, use that; else look for the existence of cs
    if (!this.options.coffee &&
      this.expandFiles(path.join(this.appPath, '/scripts/**/*.coffee'), {}).length > 0) {
      this.options.coffee = true;
    }

    this.env.options.coffee = this.options.coffee;
  }

  if (typeof this.env.options.stylus === 'undefined') {
    this.option('stylus', {
      desc: 'Generate Stylus instead of Pure CSS'
    });

    this.env.options.stylus = this.options.stylus;
  }

  if (typeof this.env.options.jade === 'undefined') {
    this.option('jade', {
      desc: 'Generate Jade instead of HTML'
    });

    this.env.options.jade = this.options.jade;
  }

  this.hookFor('angular-jade-stylus:common', {
    args: args
  });

  this.hookFor('angular-jade-stylus:main', {
    args: args
  });

  this.hookFor('angular-jade-stylus:controller', {
    args: args
  });


  this.on('end', function () {
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      callback: this._injectDependencies.bind(this)
    });

    var enabledComponents = [];

    if (this.resourceModule) {
      enabledComponents.push('angular-resource/angular-resource.js');
    }

    if (this.cookiesModule) {
      enabledComponents.push('angular-cookies/angular-cookies.js');
    }

    if (this.sanitizeModule) {
      enabledComponents.push('angular-sanitize/angular-sanitize.js');
    }

    if (this.routeModule) {
      enabledComponents.push('angular-route/angular-route.js');
    }

    this.invoke('karma:app', {
      options: {
        coffee: this.options.coffee,
        travis: true,
        'skip-install': this.options['skip-install'],
        components: [
          'angular/angular.js',
          'angular-mocks/angular-mocks.js'
        ].concat(enabledComponents)
      }
    });
  });

  this.pkg = require('../package.json');
};

util.inherits(Generator, yeoman.generators.Base);


Generator.prototype.welcome = function welcome() {
  // welcome message
  if (!this.options['skip-welcome-message']) {
    console.log(this.yeoman);
    console.log(
      'Out of the box I include Bootstrap and some AngularJS recommended modules.\n'
    );

    // Removed notice for minsafe
    if (this.options.minsafe) {
      console.warn(
        '\n** The --minsafe flag has been removed. For more information, see ' +
        'https://github.com/yeoman/generator-angular#minification-safe. **\n'
      );
    }
  }
};


Generator.prototype.askForBootstrap = function askForBootstrap() {
  var cb = this.async();

  this.prompt([{
    type: 'confirm',
    name: 'bootstrap',
    message: 'Would you like to include Bootstrap?',
    default: true
  }], function (props) {
    this.bootstrap = props.bootstrap;

    cb();
  }.bind(this));
};


/**
 * Decision tree for the generator!
 */
Generator.prototype.askForUtilities = function askForUtilities() {
  var cb = this.async();

  var prompts = [{
    type: 'checkbox',
    name: 'utilities',
    message: 'Which utility scripts would you like to include?',
    choices: [{
      value: 'underscoreUtil',
      name: 'underscorejs',
      checked: true
    }, {
      value: 'lodashUtil',
      name: 'lodash',
      checked: false
    }, {
      value: 'momentjsUtil',
      name: 'momentjs',
      checked: false
    }, {
      value: 'humanizeUtil',
      name: 'humanize-plus',
      checked: false
    }]
  }];

  this.prompt(prompts, function (props) {
    var hasMod = function (mod) { return props.modules.indexOf(mod) !== -1; };
    this.underscoreUtil = props.underscoreUtil;
    this.lodashUtil = props.lodashUtil;
    this.momentjsUtil = props.momentjsUtil;
    this.humanizeUtil = props.humanizeUtil;

    cb();
  }.bind(this));
};



Generator.prototype.askForModules = function askForModules() {
  var cb = this.async();

  var prompts = [{
    type: 'checkbox',
    name: 'modules',
    message: 'Which modules would you like to include?',
    choices: [{
      value: 'resourceModule',
      name: 'angular-resource.js',
      checked: true
    }, {
      value: 'cookiesModule',
      name: 'angular-cookie',
      checked: true
    }, {
      value: 'sanitizeModule',
      name: 'angular-sanitize.js',
      checked: true
    }, {
      value: 'routeModule',
      name: 'angular-route.js',
      checked: true
    }]
  }];

  this.prompt(prompts, function (props) {
    var hasMod = function (mod) { return props.modules.indexOf(mod) !== -1; };
    this.resourceModule = hasMod('resourceModule');
    this.cookiesModule = hasMod('cookiesModule');
    this.sanitizeModule = hasMod('sanitizeModule');
    this.routeModule = hasMod('routeModule');

    var angMods = [];

    if (this.cookiesModule) {
      angMods.push("'ipCookie'");
    }

    if (this.resourceModule) {
      angMods.push("'ngResource'");
    }
    if (this.sanitizeModule) {
      angMods.push("'ngSanitize'");
    }
    if (this.routeModule) {
      angMods.push("'ngRoute'");
      this.env.options.ngRoute = true;
    }
    if (angMods.length) {
      this.env.options.angularDeps = '\n    ' + angMods.join(',\n    ') + '\n  ';
    }

    cb();
  }.bind(this));
};

Generator.prototype.readIndex = function readIndex() {
  this.ngRoute = this.env.options.ngRoute;
  if (this.env.options.jade) {
    this.indexFile = this.engine(this.read('../../templates/common/index.jade'), this);
  } else {
    this.indexFile = this.engine(this.read('../../templates/common/index.html'), this);
  }
};

Generator.prototype.bootstrapFiles = function bootstrapFiles() {
  var stylus = this.env.options.stylus;
  if (stylus) {
    var mainFile = 'main.styl';
  } else {
    var mainFile = 'main.css';
  }

  if (this.bootstrap) {
    this.copy('fonts/glyphicons-halflings-regular.eot', 'app/fonts/glyphicons-halflings-regular.eot');
    this.copy('fonts/glyphicons-halflings-regular.ttf', 'app/fonts/glyphicons-halflings-regular.ttf');
    this.copy('fonts/glyphicons-halflings-regular.svg', 'app/fonts/glyphicons-halflings-regular.svg');
    this.copy('fonts/glyphicons-halflings-regular.woff', 'app/fonts/glyphicons-halflings-regular.woff');
  }

  this.copy('styles/' + mainFile, 'app/styles/' + mainFile);
};

Generator.prototype.viewFiles = function viewFiles() {
  var stylus = this.env.options.stylus;
  if (stylus) {
    var mainFile = 'main.styl';
  } else {
    var mainFile = 'main.css';
  }
};

Generator.prototype.appJs = function appJs() {
  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'js',
    optimizedPath: 'scripts/scripts.js',
    sourceFileList: ['scripts/app.js', 'scripts/controllers/main.js'],
    searchPath: ['.tmp', 'app']
  });
};

Generator.prototype.createIndexHtml = function createIndexHtml() {
  this.indexFile = this.indexFile.replace(/&apos;/g, "'");
  var jade = this.env.options.jade;
  if (jade) {
    this.write(path.join(this.appPath, 'index.jade'), this.indexFile);
  } else {
    this.write(path.join(this.appPath, 'index.html'), this.indexFile);
  }
};

Generator.prototype.packageFiles = function () {
  this.coffee = this.env.options.coffee;
  this.jade = this.env.options.jade;
  this.stylus = this.env.options.stylus;
  this.template('../../templates/common/_bower.json', 'bower.json');
  this.template('../../templates/common/_package.json', 'package.json');
  this.template('../../templates/common/Gruntfile.js', 'Gruntfile.js');

  this.template('../../templates/common/_server_package.json', 'app/package.json');
  this.template('../../templates/common/_Procfile', 'app/Procfile');
  this.template('../../templates/common/_web.js', 'app/web.js');
  this.template('../../templates/common/_wercker.yml', 'wercker.yml');
};

Generator.prototype.imageFiles = function () {
  this.sourceRoot(path.join(__dirname, 'templates'));
  this.directory('images', 'app/images', true);
};

Generator.prototype._injectDependencies = function _injectDependencies() {
  var howToInstall =
    '\nAfter running `npm install & bower install`, inject your front end dependencies into' +
    '\nyour HTML by running:' +
    '\n' +
    chalk.yellow.bold('\n  grunt bowerInstall');

  if (this.options['skip-install']) {
    console.log(howToInstall);
  } else {
    wiredep({
      directory: 'app/bower_components',
      bowerJson: JSON.parse(fs.readFileSync('./bower.json')),
      ignorePath: 'app/',
      src: 'app/index.jade',
      fileTypes: {
        html: {
          replace: {
            css: '<link rel="stylesheet" href="{{filePath}}">'
          }
        },
        jade: {
          replace: {
            css: 'link(rel="stylesheet", href="{{filePath}}")'
          }
        }
      }
    });
  }
};
