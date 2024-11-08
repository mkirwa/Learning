## Common Errors ##

### Error 1 ###
⠙ Generating browser application bundles (phase: building)...node:internal/crypto/hash:79
  this[kHandle] = new _Hash(algorithm, xofLen, algorithmId, getHashCache());
                  ^

Error: error:0308010C:digital envelope routines::unsupported
    at new Hash (node:internal/crypto/hash:79:19)
    at Object.createHash (node:crypto:139:10)
    at BulkUpdateDecorator.hashFactory (/Users/mahlonkirwa/Desktop/GithubRepoLearning/cafe/Frontend/node_modules/@angular-devkit/build-angular/node_modules/webpack/lib/util/createHash.js:145:18)
    at BulkUpdateDecorator.update (/Users/mahlonkirwa/Desktop/GithubRepoLearning/cafe/Frontend/node_modules/@angular-devkit/build-angular/node_modules/webpack/lib/util/createHash.js:46:50)
    at /Users/mahlonkirwa/Desktop/GithubRepoLearning/cafe/Frontend/node_modules/@angular-devkit/build-angular/node_modules/webpack/lib/FileSystemInfo.js:2677:9
    at processTicksAndRejections (node:internal/process/task_queues:82:21)
    at runNextTicks (node:internal/process/task_queues:64:3)
    at process.processImmediate (node:internal/timers:454:9) {
  opensslErrorStack: [
    'error:03000086:digital envelope routines::initialization error',
    'error:0308010C:digital envelope routines::unsupported'
  ],
  library: 'digital envelope routines',
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
}

Node.js v20.16.0

### Error 1 Solution ###

#### Option 1: Use Legacy OpenSSL Provider ####
You can tell Node.js to fall back to the legacy OpenSSL provider. This is the simplest solution if you want to keep using Node.js v17 and above.

Modify your package.json to add a script for starting the Angular project with the legacy provider flag.

In package.json, under the "scripts" section, update the "start" script to include:

json

```json
"start": "NODE_OPTIONS=--openssl-legacy-provider ng serve"
```

#### Alternatively, you can run the command directly: ####

```bash
NODE_OPTIONS=--openssl-legacy-provider ng serve
```