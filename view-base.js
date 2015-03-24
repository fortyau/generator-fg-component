'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('./util.js');

var Generator = module.exports = function Generator() {
  yeoman.generators.NamedBase.apply(this, arguments);

  // @duanearnett
  // Not sure if this is the best way to do this.....?
  this.options.jade = true;

  try {
    this.appname = require(path.join(process.cwd(), 'bower.json')).name;
  } catch (e) {
    this.appname = path.basename(process.cwd());
  }
  this.appname = this._.slugify(this._.humanize(this.appname));
  this.scriptAppName = this._.camelize(this.appname) + angularUtils.appName(this);

  this.cameledName = this._.camelize(this.name);
  this.classedName = this._.classify(this.name);

  if (typeof this.env.options.appPath === 'undefined') {
    try {
      this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
    } catch (e) {}
    this.env.options.appPath = this.env.options.appPath || 'app';
  }

  this.env.options.jade = this.options.jade;
  if (typeof this.env.options.jade === 'undefined') {
    this.option('jade');

    // attempt to detect if user is using CS or not
    // if cml arg provided, use that; else look for the existence of cs
    if (!this.options.jade &&
      this.expandFiles(path.join(this.env.options.appPath, '/views/**/*.jade'), {}).length > 0) {
      this.options.jade = true;
    }

    this.env.options.jade = this.options.jade;
  }
};

util.inherits(Generator, yeoman.generators.NamedBase);
