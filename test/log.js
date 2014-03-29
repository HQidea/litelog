/*!
 * litelog: test/log.js
 * Authors  : fish <zhengxinlin@gmail.com> (https://github.com/fishbar)
 * Create   : 2014-03-29 16:52:44
 * CopyRight 2014 (c) Fish And Other Contributors
 */
var jsc = require('jscoverage');
require = jsc.mock(module);
var Log = require('../log', true);
var fs = require('xfs');
var expect = require('expect.js');
var path = require('path');

describe('test log', function () {
  var log = Log.create({
    sys : {
      level: 'DEBUG',
      file : './logs/abc.%year%-%month%.log',
      duration: 2
    },
    std : {
      level: 'DEBUG'
    },
    level : {
      level : 'INFO',
      file : './logs/abcd.%year%-%month%.log'
    }
  });
  describe('create log object, test default first log', function () {
    it('check every level', function (done) {
      log.debug('debug');
      log.info('info');
      log.trace('trace');
      log.warn('warn');
      log.error('error');
      log.fatal("fatal");
      log.literal('literal');
      log.get('abc');
      var st = log.getStream();
      st.write('write from stream');
      setTimeout(function () {
        var dd = new Date();
        var y = dd.getFullYear();
        var m = dd.getMonth() + 1;
        m  = m > 9 ? m : '0' + m;
        var file =  './logs/abc.' + y + '-' + m + '.log';
        var err = fs.readFileSync(file, 'utf-8').toString();
        expect(err).to.be.match(/WARN/);
        expect(err).to.be.match(/ERROR/);
        expect(err).to.be.match(/DEBUG/);
        expect(err).to.be.match(/TRACE/);
        expect(err).to.be.match(/FATAL/);
        expect(err).to.be.match(/INFO/);
        expect(err).to.be.match(/write from stream/);
        fs.unlinkSync(file);
        done();
      }, 100);
    });
    it('check level setting', function (done) {
      var ll = log.get('level');
      ll.debug('debug');
      ll.info('info');
      ll.trace('trace');
      ll.warn('warn');
      ll.error('error');
      ll.fatal("fatal");
      setTimeout(function () {
        var dd = new Date();
        var y = dd.getFullYear();
        var m = dd.getMonth() + 1;
        m  = m > 9 ? m : '0' + m;
        var file = './logs/abcd.' + y + '-' + m + '.log';
        var err = fs.readFileSync(file, 'utf-8');
        expect(err).to.match(/WARN/);
        expect(err).to.match(/ERROR/);
        expect(err).to.not.match(/DEBUG/);
        expect(err).to.not.match(/TRACE/);
        expect(err).to.be.match(/FATAL/);
        expect(err).to.be.match(/INFO/);
        fs.unlinkSync(file);
        done();
      }, 100);
    });
    it('get with unknow name', function () {
      var ll = log.get('abc');
      expect(typeof ll.info).to.be('function');
    });
    it('check end log', function () {
      var ll = log.get('sys');
      ll.end();
      ll.debug('test');
      if (ll._stream.stream._writableState) {
        expect(ll._stream.stream._writableState.ended).to.be(true);
      } else {
        expect(ll._stream.stream.writable).to.be(false);
      }
    });
    it('create by config file', function (done) {
      fs.writeFileSync('./logs/config.json', '{"fff":{"level":"ERROR","file":"./logs/fff.log"}}', 'utf-8');
      var llog = Log.create('./logs/config.json').get('fff');
      llog.error('abc');
      setTimeout(function () {
        var data = fs.readFileSync('./logs/fff.log');
        expect(data.toString()).to.match(/abc/);
        expect(data.toString()).to.match(/ERROR/);
        fs.unlinkSync('./logs/config.json');
        fs.unlinkSync('./logs/fff.log');
        done();
      }, 100);
    });

    it('check stdout', function () {
      var ll = log.get('std');
      process.stdout.on('data', function (data) {
        console.log('>>', data);
      });
      ll.debug('this is show in std');
    });
  });
});
