import fs from 'fs';
import path from 'path';

/**
 * Removes the dist directory.
 *
 * @async
 * @returns {Promise<void>}
 */
async function clean() {
  await new Promise((resolve, reject) => {
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
 * @async
 * @param {Target.src} src
 * @param {Target.dest} dest
 * @returns {Promise<void>}
 */
async function copyFiles(src, dest) {
  await new Promise((resolve, reject) => {
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
 * @async
 * @param {string} pathToFile
 * @param {string} data
 * @returns {Promise<void>}
 */
async function writeFile(pathToFile, data) {
  await new Promise((resolve, reject) => {
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
 * @async
 * @param {Config} config
 * @returns {Promise<Data>} data
 */
async function getData(config) {
  const data = await config.client.getData(config.sources);

  return data;
}

/**
 * Renders a target.
 *
 * @async
 * @param {Config} config
 * @param {Target} target
 * @param {Object} ctx
 * @returns {Promise<void>}
 */
async function renderTarget(config, target, ctx) {
  const template = path.normalize(target.template);
  const dest = path.normalize(target.dest);
  
  const res = await config.engine.render(template, ctx);

  await writeFile(dest, res);
}

/**
 * Builds a target.
 *
 * @async
 * @param {Config} config
 * @param {Data} data
 * @param {Target} target
 * @returns {Promise<void>}
 */
async function buildTarget(config, data, target) {
  if (target.src) {
    await copyFiles(target.src, target.dest);
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

    await renderTarget(config, target, ctx);
  }
}

/**
 * Builds all targets recursively.
 *
 * @async
 * @param {Config} config
 * @param {Data} data
 * @param {(Target | TargetFn)[]} targets
 * @returns {Promise<void>}
 */
async function buildTargets(config, data, targets) {
  for (const target of targets) {
    if (typeof target === 'function') {
      const newTarget = await target(data);
      const newTargetArr = Array.isArray(newTarget) ? newTarget : [newTarget];

      await buildTargets(config, data, newTargetArr);
    } else {
      await buildTarget(config, data, target);
    }
  }
}

/**
 * Reads the config file from the directory in which npm
 * was invoked.
 * 
 * @async
 * @returns {Promise<Config>}
 */
async function getConfig() {
  const npmDir = process.cwd();
  const pathToConfig = path.resolve(npmDir, 'config.js');

  try {
    const mod = await import(pathToConfig);
  } catch (err) {
    throw new Error('Config file is missing');
  }

  return {
    sources: [],
    targets: [],
    ...mod.default
  };
}

/**
 * Builds the static site.
 *
 * @async
 * @returns {Promise<void>}
 */
async function build() {
  await clean();

  const config = await getConfig();
  const data = await getData(config);

  await buildTargets(config, data, config.targets);
}

build();
