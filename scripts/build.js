import 'dotenv/config';

import fs from 'fs';
import path from 'path';

/**
 * Synchronously iterates over each element in an array,
 * allowing execution of asynchronous code in the iteratee.
 * 
 * @example
 * 
 * iterate(items, (item, next) => {
 *   doSomethingAsync(item, () => {
 *     next();
 *   });
 * }, () => {
 *   // Done
 * })
 * 
 * @param {Array} arr
 * @param {Function} iteratee
 * @param {Function} done
 */
function iterate(arr, iteratee, done) {
  const iterator = (i) => {
    if (i in arr) {
      iteratee(arr[i], () => {
        iterator(i + 1);
      });
    } else {
      done();
    }
  };

  iterator(0);
}

/**
 * Removes the dist directory.
 *
 * @returns {Promise<void>}
 */
function clean() {
  return new Promise((resolve, reject) => {
    fs.rm('dist', { recursive: true }, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Copies files from src to dest recursively.
 *
 * @param {Target.src} src
 * @param {Target.dest} dest
 * @returns {Promise<void>}
 */
function copyFiles(src, dest) {
  return new Promise((resolve, reject) => {
    fs.cp(src, dest, { recursive: true }, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        console.log(`Copied "${src}" to "${dest}"`);
        resolve();
      }
    });
  });
}

/**
 * Writes a file.
 *
 * @param {string} pathToFile
 * @param {string} data
 * @returns {Promise<void>}
 */
function writeFile(pathToFile, data) {
  return new Promise((resolve, reject) => {
    const dirname = path.dirname(pathToFile);

    fs.mkdir(dirname, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      } else {
        fs.writeFile(pathToFile, data, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log(`Wrote file "${pathToFile}"`);
            resolve();
          }
        });
      }
    });
  });
}

/**
 * Gets data from the CMS client.
 * 
 * @param {Config} config
 * @returns {Promise<Data> | void} data
 */
function getData(config) {
  if (config.sources) {
    return config.client.getData(config.sources).then((data) => {
      return data;
    });
  }
}

/**
 * Renders a target.
 *
 * @param {Config} config
 * @param {Target} target
 * @param {Object} ctx
 * @returns {Promise<void>}
 */
function renderTarget(config, target, ctx) {
  const template = path.normalize(target.template);
  const dest = path.normalize(target.dest);
  const render = config.engine.render;

  return (
    render(template, ctx)
      .then((res) => writeFile(dest, res))
  );
}

/**
 * Builds a target.
 *
 * @param {Config} config
 * @param {Data} data
 * @param {Target} target
 * @returns {Promise<void>}
 */
function buildTarget(config, data, target) {
  if (target.src) {
    return copyFiles(target.src, target.dest);
  } else {
    const ctx = {};

    // Apply included data.
    if (target.include) {
      target.include.forEach((key) => {
        ctx[key] = data[key];
      });
    }

    // Apply extra context.
    if (target.extraContext) {
      Object.assign(ctx, target.extraContext);
    }

    return renderTarget(config, target, ctx);
  }
}

/**
 * Builds all targets recursively.
 *
 * @param {Config} config
 * @param {Data} data
 * @param {(Target | TargetFn)[]} [targets]
 * @returns {Promise<void>}
 */
function buildTargets(config, data, targets = config.targets ?? []) {
  return new Promise((resolve) => {
    iterate(targets, (target, next) => {
      if (typeof target === 'function') {
        const newTarget = target(data);
        const newTargetArr = Array.isArray(newTarget) ? newTarget : [newTarget];

        buildTargets(config, data, newTargetArr).then(next);
      } else {
        buildTarget(config, data, target).then(next);
      }
    }, resolve);
  });
}

/**
 * Reads the config file from the directory in which npm
 * was invoked.
 * 
 * @returns {Promise<Config>}
 */
function getConfig() {
  const pathToConfig = path.join(process.cwd(), 'config.js');

  return import(pathToConfig).then((exp) => {
    return exp.default;
  });
}

/**
 * Builds the static site.
 *
 * @returns {Promise<void>}
 */
function build() {
  return (
    clean()
      .then(() => getConfig())
      .then((config) => {
        return (
          getData(config)
            .then((data) => buildTargets(config, data))
        );
      })
  );
}

build();
