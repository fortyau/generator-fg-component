'use strict';
var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var angularUtils = require('../util.js');



var Generator = module.exports = function Generator() {

  // Add some things for the generator to have access to.
  yeoman.generators.Base.apply(this, arguments);
    this.argument('appname', { type: String, required: false });
    this.appname = path.basename(process.cwd());
    this.appname = this._.camelize(this._.slugify(this._.humanize(this.appname)));

    this.option('app-suffix', {
      desc: 'Allow a custom suffix to be added to the module name',
      type: String,
      required: 'false'
    });

    // Set the scriptAppName
    this.scriptAppName = this.appname + angularUtils.appName(this);


};

util.inherits(Generator, yeoman.generators.Base);

Generator.prototype.setupEnv = function setupEnv() {
  // Copies the contents of the generator `templates`
  // directory into your users new application path
  if (this.env.options.jade) {
    this.sourceRoot(path.join(__dirname, '../templates/common'));
    this.directory('rootJade', '.', true);
    this.copy('gitignore', '.gitignore');
  } else {
    this.sourceRoot(path.join(__dirname, '../templates/common'));
    this.directory('root', '.', true);
    this.copy('gitignore', '.gitignore');
  }
};
