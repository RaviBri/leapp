module.exports = {
  cli: {
    name: 'nightly',
    description: 'Release the leapp Desktop app under the branch Nightly',
    version: '0.1',
  },
  deps: [],
  arguments: [
    {name: '<platform-version>', choices: ['mac', 'linux', 'win', 'all']},
  ],
  run: async (args) => {
    const path = await gushio.import('path')
    const shellJs = await gushio.import('shelljs')
    const readPackageJsonFunction = require('../../../gushio/read-package-json-func')
    const writePackageJsonFunction = require('../../../gushio/write-package-json-func')
    const leappCoreBootstrap = require('../../../gushio/leapp-core-bootstrap')
    const getNightlyVersion = require('../../../gushio/get-nightly-version')

    let desktopAppPackage;
    let originalPackage;

    try {
      console.log('Reading leapp Desktop app package.json... ')
      desktopAppPackage = await readPackageJsonFunction(path, "desktop-app");
      originalPackage = JSON.parse(JSON.stringify(desktopAppPackage));

      const nightlyVersion = desktopAppPackage["version"] + `-nightly.${getNightlyVersion()}`;
      await fs.writeFile(path.join(__dirname, '..', 'nightly-version'), nightlyVersion)
      desktopAppPackage["version"] = nightlyVersion;

      await writePackageJsonFunction(path, "desktop-app", desktopAppPackage);
      await leappCoreBootstrap("desktop-app", () => `npm:@mush-ko-li/leapp-core-nightly@latest`);

      await gushio.run(path.join(__dirname, './target-release.js'), ["\"configuration production\"", args[0]])
    } catch (e) {
      e.message = e.message.red
      throw e
    } finally {
      await writePackageJsonFunction(path, "desktop-app", originalPackage);
    }
  }
}
