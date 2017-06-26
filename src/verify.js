import kbpgp from 'kbpgp';
import log from 'loglevel';
import fs from 'fs';


// PGP keys from:
// https://github.com/ethereumproject/volunteer/tree/master/Volunteer-Public-Keys
//
// TODO move to separate files

var splixPgp = "-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n" +
"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\n" +
"adpYEwT7ZDoRcND0\n"+
    "=hCZx\n" +
"-----END PGP PUBLIC KEY BLOCK-----";

var whileiPgp = "-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n"+
"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\n" +
"l16zjJ8vYKGy6UcLBCejWr421IyDqOUriA==\n" +
"    =VzoR\n" +
"-----END PGP PUBLIC KEY BLOCK-----";

export class Verify {
    init() {
        const kms = [];
        const pgps = [splixPgp, whileiPgp];
        pgps.forEach((armored) => {
            kbpgp.KeyManager.import_from_armored_pgp({armored}, (err, key) => {
                if (!err) {
                    log.debug("key is loaded", key.get_pgp_fingerprint().toString('hex'));
                    kms.push(key);
                } else {
                    log.error("key is not loaded", err);
                }
            });
        });

        const ring = new kbpgp.keyring.KeyRing();
        kms.forEach(km => {
            ring.add_key_manager(km);
        });
        this.ring = ring;
    }

    verify(path, armored) {
        const data = fs.readFileSync(path);
        return new Promise((resolve, reject) => {
            kbpgp.unbox({keyfetch: this.ring, data, armored}, (err, literals) => {
                if (err !== null) {
                    reject(err);
                } else {
                    let km = null;
                    const ds = literals[0].get_data_signer();
                    if (ds) {
                        km = ds.get_key_manager();
                    }
                    if (km) {
                        log.info("Signed by PGP fingerprint", km.get_pgp_fingerprint().toString('hex'));
                        resolve(path)
                    } else {
                        reject("no_key")
                    }
                }
            });
        });

    }
}


