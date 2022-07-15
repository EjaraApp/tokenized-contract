import { deploy, getAccount, getValueFromBigMap, setQuiet, expectToThrow, exprMichelineToJson, setMockupNow, getEndpoint, isMockup, setEndpoint } from '@completium/completium-cli';
import { errors, mkTransferPermit, mkApproveForAllSingle, mkDeleteApproveForAllSingle, mkTransferGaslessArgs } from './utils';
import assert from 'assert';

import 'mocha/package.json';
import mochaLogger from 'mocha-logger';

setQuiet('true');

const mockup_mode = true;

// contracts
let tb;

// accounts
const ama  = getAccount(mockup_mode ? 'alice'      : 'alice');
const kofi    = getAccount(mockup_mode ? 'bob'        : 'bob');
const abena   = getAccount(mockup_mode ? 'carl'       : 'carl');
const kwame = getAccount(mockup_mode ? 'bootstrap1' : 'bootstrap1');

//set endpointhead 
setEndpoint(mockup_mode ? 'mockup' : 'https://ithacanet.smartpy.io');

const amount = 100;
let tokenId = 0;
const testAmount_1 = 1;
const testAmount_2 = 11;
let alicePermitNb = 0;
let carlPermitNb = 0;

// permits
let permit;

async function expectToThrowMissigned(f, e) {
    const m = 'Failed to throw' + (e !== undefined ? e : '');
    try {
        await f();
        throw new Error(m);
    } catch (ex) {
        if ((ex.message && e !== undefined) || (ex && e !== undefined)) {
            if (ex.message)
                assert(
                    ex.message.includes(e),
                    `${e} was not found in the error message`
                );
            else
                assert(
                    ex.includes(e),
                    `${e} was not found in the error message`
                );
        } else if (ex.message === m) {
            throw e;
        }
    }
}

describe('[Tokenized Bond] Contract deployment', async () => {
    it('TB private collection contract deployment should succeed', async () => {
        [tb, _] = await deploy(
            './contract/tokenized-bond.arl',
            {
                parameters: {
                    owner: ama.pkh,
                },
                as: ama.pkh,
            }
        );
    });
});

describe('[Tokenized Bond] Add Minter', async () => {
    it('Add minter as non owner should fail', async () => {
        await expectToThrow(async () => {
            await tb.add_minter({
                argMichelson: `"${kofi.pkh}"`,
                as: kofi.pkh,
            });
        }, errors.INVALID_CALLER);
    });

    it('Add minter as owner should succeed', async () => {
        let storage = await tb.getStorage();
        assert(storage.minters.length == 0);
        await tb.add_minter({
            argMichelson: `"${kofi.pkh}"`,
            as: ama.pkh,
        });
        storage = await tb.getStorage();
        assert(storage.minters.length == 1);
        assert(storage.minters[0] == kofi.pkh);
    });
});

describe('[Tokenized Bond] Remove Minter', async () => {
    it('Remove minter as non owner should fail', async () => {
        await expectToThrow(async () => {
            await tb.remove_minter({
                argMichelson: `"${kofi.pkh}"`,
                as: kofi.pkh,
            });
        }, errors.INVALID_CALLER);
    });

    it('Remove non existing minter as owner should succeed', async () => {
        let storage = await tb.getStorage();
        assert(storage.minters.length == 1);
        await tb.remove_minter({
            argMichelson: `"${abena.pkh}"`,
            as: ama.pkh,
        });
        storage = await tb.getStorage();
        assert(storage.minters.length == 1);
    });

    it('Remove minter as owner should succeed', async () => {
        let storage = await tb.getStorage();
        assert(storage.minters.length == 1);
        await tb.remove_minter({
            argMichelson: `"${kofi.pkh}"`,
            as: ama.pkh,
        });
        storage = await tb.getStorage();
        assert(storage.minters.length == 0);
    });
});

describe('[Tokenized Bond] Minting', async () => {
    it('Mint tokens on TB Private collection contract as owner for ourself should succeed', async () => {
        await tb.mint({
            arg: {
                itokenid: tokenId,
                iowner: ama.pkh,
                iamount: amount,
                itokenMetadata: [{ key: '', value: '0x' }],
                iroyalties: [
                    [ama.pkh, 1000],
                    [kofi.pkh, 500],
                ],
            },
            as: ama.pkh,
        });
        const storage = await tb.getStorage();
        var balance = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId} "${ama.pkh}")`),
            exprMichelineToJson(`(pair nat address)'`)
        );
        assert(parseInt(balance.int) == amount);
    });

    it('Mint tokens on TB Private collection contract as non owner for ourself should fail', async () => {
        await expectToThrow(async () => {
            await tb.mint({
                arg: {
                    itokenid: tokenId + 1,
                    iowner: kofi.pkh,
                    iamount: amount,
                    itokenMetadata: [{ key: '', value: '0x' }],
                    iroyalties: [
                        [ama.pkh, 1000],
                        [kofi.pkh, 500],
                    ],
                },
                as: kofi.pkh,
            });
        }, errors.INVALID_CALLER);
    });

    it('Mint tokens on TB Private collection contract as non owner for someone else should fail', async () => {
        await expectToThrow(async () => {
            await tb.mint({
                arg: {
                    itokenid: tokenId + 2,
                    iowner: abena.pkh,
                    iamount: amount,
                    itokenMetadata: [{ key: '', value: '0x' }],
                    iroyalties: [
                        [ama.pkh, 1000],
                        [kofi.pkh, 500],
                    ],
                },
                as: kofi.pkh,
            });
        }, errors.INVALID_CALLER);
    });

    it('Mint tokens on TB Private collection contract as owner for someone else should succeed', async () => {
        await tb.mint({
            arg: {
                itokenid: tokenId + 3,
                iowner: abena.pkh,
                iamount: amount,
                itokenMetadata: [{ key: '', value: '0x' }],
                iroyalties: [
                    [ama.pkh, 1000],
                    [kofi.pkh, 500],
                ],
            },
            as: ama.pkh,
        });
        const storage = await tb.getStorage();
        var balance = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId + 3} "${abena.pkh}")`),
            exprMichelineToJson(`(pair nat address)'`)
        );
        assert(parseInt(balance.int) == amount);
    });

    it('Re-Mint tokens on TB Private collection contract should fail', async () => {
        await expectToThrow(async () => {
            await tb.mint({
                arg: {
                    itokenid: tokenId,
                    iowner: ama.pkh,
                    iamount: amount,
                    itokenMetadata: [{ key: '', value: '0x' }],
                    iroyalties: [
                        [ama.pkh, 1000],
                        [kofi.pkh, 500],
                    ],
                },
                as: ama.pkh,
            });
        }, errors.TOKEN_METADATA_KEY_EXISTS);
    });

    it('Mint tokens on TB Private contract as minter should succeed', async () => {
        await tb.add_minter({
            argMichelson: `"${kofi.pkh}"`,
            as: ama.pkh,
        });
        await tb.mint({
            arg: {
                itokenid: tokenId + 1,
                iowner: ama.pkh,
                iamount: amount,
                itokenMetadata: [{ key: '', value: '0x' }],
                iroyalties: [
                    [ama.pkh, 1000],
                    [kofi.pkh, 500],
                ],
            },
            as: kofi.pkh,
        });
        const storage = await tb.getStorage();
        var balance = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId + 1} "${ama.pkh}")`),
            exprMichelineToJson(`(pair nat address)'`)
        );
        assert(parseInt(balance.int) == amount);
    });
});

describe('[Tokenized Bond] Update operators', async () => {
    it('Add an operator for ourself should succeed', async () => {
        const storage = await tb.getStorage();
        var initialOperators = await getValueFromBigMap(
            parseInt(storage.operator),
            exprMichelineToJson(
                `(Pair "${tb.address}" (Pair ${tokenId} "${ama.pkh}"))`
            ),
            exprMichelineToJson(`(pair address (pair nat address))'`)
        );
        assert(initialOperators == null);
        await tb.update_operators({
            argMichelson: `{Left (Pair "${ama.pkh}" "${tb.address}" ${tokenId})}`,
            as: ama.pkh,
        });
        var operatorsAfterAdd = await getValueFromBigMap(
            parseInt(storage.operator),
            exprMichelineToJson(
                `(Pair "${tb.address}" (Pair ${tokenId} "${ama.pkh}"))`
            ),
            exprMichelineToJson(`(pair address (pair nat address))'`)
        );
        assert(operatorsAfterAdd.prim == 'Unit');
    });

    it('Remove a non existing operator should succeed', async () => {
        await tb.update_operators({
            argMichelson: `{Right (Pair "${ama.pkh}" "${kofi.pkh}" ${tokenId})}`,
            as: ama.pkh,
        });
    });

    it('Remove an existing operator for another user should fail', async () => {
        await expectToThrow(async () => {
            await tb.update_operators({
                argMichelson: `{Right (Pair "${ama.pkh}" "${tb.address}" ${tokenId})}`,
                as: kofi.pkh,
            });
        }, errors.CALLER_NOT_OWNER);
    });

    it('Add operator for another user should fail', async () => {
        await expectToThrow(async () => {
            await tb.update_operators({
                argMichelson: `{Left (Pair "${kofi.pkh}" "${tb.address}" ${tokenId})}`,
                as: ama.pkh,
            });
        }, errors.CALLER_NOT_OWNER);
    });

    it('Remove an existing operator should succeed', async () => {
        const storage = await tb.getStorage();
        var initialOperators = await getValueFromBigMap(
            parseInt(storage.operator),
            exprMichelineToJson(
                `(Pair "${tb.address}" (Pair ${tokenId} "${ama.pkh}"))`
            ),
            exprMichelineToJson(`(pair address (pair nat address))'`)
        );
        assert(initialOperators.prim == 'Unit');
        await tb.update_operators({
            argMichelson: `{Right (Pair "${ama.pkh}" "${tb.address}" ${tokenId})}`,
            as: ama.pkh,
        });
        var operatorsAfterRemoval = await getValueFromBigMap(
            parseInt(storage.operator),
            exprMichelineToJson(
                `(Pair "${tb.address}" (Pair ${tokenId} "${ama.pkh}"))`
            ),
            exprMichelineToJson(`(pair address (pair nat address))'`)
        );
        assert(operatorsAfterRemoval == null);
    });
});

describe('[Tokenized Bond] Update operators for all', async () => {
    it('Add an operator for all for ourself should succeed', async () => {
        const storage = await tb.getStorage();
        var initialOperators = await getValueFromBigMap(
            parseInt(storage.operator_for_all),
            exprMichelineToJson(
                `(Pair "${tb.address}" "${ama.pkh}"))`
            ),
            exprMichelineToJson(`(pair address address)'`)
        );
        assert(initialOperators == null);
        await tb.update_operators_for_all({
            argJsonMichelson: mkApproveForAllSingle(tb.address),
            as: ama.pkh
        });
        var operatorsAfterAdd = await getValueFromBigMap(
            parseInt(storage.operator_for_all),
            exprMichelineToJson(
                `(Pair "${tb.address}" "${ama.pkh}")`
            ),
            exprMichelineToJson(`(pair address address)'`)
        );
        assert(operatorsAfterAdd.prim == 'Unit');
    });

    it('Remove a non existing operator should succeed', async () => {
        await tb.update_operators_for_all({
            argJsonMichelson: mkDeleteApproveForAllSingle(kofi.pkh),
            as: ama.pkh
        });
    });

    it('Remove an existing operator should succeed', async () => {
        const storage = await tb.getStorage();
        var initialOperators = await getValueFromBigMap(
            parseInt(storage.operator_for_all),
            exprMichelineToJson(
                `(Pair "${tb.address}" "${ama.pkh}")`
            ),
            exprMichelineToJson(`(pair address address)'`)
        );
        assert(initialOperators.prim == "Unit");
        await tb.update_operators_for_all({
            argJsonMichelson: mkDeleteApproveForAllSingle(tb.address),
            as: ama.pkh
        });
        var operatorsAfterRemoval = await getValueFromBigMap(
            parseInt(storage.operator_for_all),
            exprMichelineToJson(
                `(Pair "${tb.address}" "${ama.pkh}")`
            ),
            exprMichelineToJson(`(pair address address)'`)
        );
        assert(operatorsAfterRemoval == null);
    });
});

describe('[Tokenized Bond] Add permit', async () => {
    it('Add a permit with the wrong signature should fail', async () => {
        await expectToThrowMissigned(async () => {
            permit = await mkTransferPermit(
                ama,
                kofi,
                tb.address,
                amount,
                tokenId,
                alicePermitNb
            );
            const argM = `(Pair "${ama.pubk}" (Pair "edsigu3QDtEZeSCX146136yQdJnyJDfuMRsDxiCgea3x7ty2RTwDdPpgioHWJUe86tgTCkeD2u16Az5wtNFDdjGyDpb7MiyU3fn" 0x${permit.hash}))`;
            await tb.permit({
                argMichelson: argM,
                as: kofi.pkh,
            });
        }, errors.MISSIGNED);
    });

    it('Add a permit with the wrong hash should fail', async () => {
        await expectToThrowMissigned(async () => {
            permit = await mkTransferPermit(
                ama,
                kofi,
                tb.address,
                amount,
                tokenId,
                alicePermitNb
            );
            const argM = `(Pair "${ama.pubk}" (Pair "${permit.sig.prefixSig}" 0x9aabe91d035d02ffb550bb9ea6fe19970f6fb41b5e69459a60b1ae401192a2dc))`;
            await tb.permit({
                argMichelson: argM,
                as: kofi.pkh,
            });
        }, errors.MISSIGNED);
    });

    it('Add a permit with the wrong public key should fail', async () => {
        await expectToThrowMissigned(async () => {
            permit = await mkTransferPermit(
                ama,
                kofi,
                tb.address,
                amount,
                tokenId,
                alicePermitNb
            );
            const argM = `(Pair "${kofi.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;
            await tb.permit({
                argMichelson: argM,
                as: kofi.pkh,
            });
        }, errors.MISSIGNED);
    });

    it('Add a permit with the good hash, signature and public key should succeed', async () => {
        permit = await mkTransferPermit(
            ama,
            kofi,
            tb.address,
            amount,
            tokenId,
            alicePermitNb
        );
        const argM = `(Pair "${ama.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;

        const storage = await tb.getStorage();
        var initialPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );
        assert(initialPermit == null);

        await tb.permit({
            argMichelson: argM,
            as: kofi.pkh,
        });
        alicePermitNb++;

        var addedPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );
        assert(
            addedPermit.args.length == 3 &&
            addedPermit.prim == 'Pair' &&
            addedPermit.args[0].int == '' + alicePermitNb &&
            addedPermit.args[1].prim == 'None' &&
            addedPermit.args[2][0].prim == 'Elt' &&
            addedPermit.args[2][0].args[0].bytes == permit.hash &&
            addedPermit.args[2][0].args[1].prim == 'Pair' &&
            addedPermit.args[2][0].args[1].args[0].prim == 'Some' &&
            addedPermit.args[2][0].args[1].args[0].args[0].int == '31556952'
        );
    });

    it('Add a duplicated permit should succeed', async () => {
        const storage = await tb.getStorage();
        var initialPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );
        assert(
            initialPermit.args.length == 3 &&
            initialPermit.prim == 'Pair' &&
            initialPermit.args[0].int == '' + alicePermitNb &&
            initialPermit.args[1].prim == 'None' &&
            initialPermit.args[2][0].prim == 'Elt' &&
            initialPermit.args[2][0].args[0].bytes == permit.hash &&
            initialPermit.args[2][0].args[1].prim == 'Pair' &&
            initialPermit.args[2][0].args[1].args[0].prim == 'Some' &&
            initialPermit.args[2][0].args[1].args[0].args[0].int == '31556952'
        );

        permit = await mkTransferPermit(
            ama,
            kofi,
            tb.address,
            amount,
            tokenId,
            alicePermitNb
        );
        const argM = `(Pair "${ama.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;
        await tb.permit({
            argMichelson: argM,
            as: kofi.pkh,
        });
        alicePermitNb++;

        var addedPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );
        assert(
            addedPermit.args.length == 3 &&
            addedPermit.prim == 'Pair' &&
            addedPermit.args[0].int == '' + alicePermitNb &&
            addedPermit.args[1].prim == 'None' &&
            addedPermit.args[2][0].prim == 'Elt' &&
            addedPermit.args[2][0].args[0].bytes == permit.hash &&
            addedPermit.args[2][0].args[1].prim == 'Pair' &&
            addedPermit.args[2][0].args[1].args[0].prim == 'Some' &&
            addedPermit.args[2][0].args[1].args[0].args[0].int == '31556952'
        );
    });

    it('Expired permit are removed when a new permit is added should succeed', async () => {
        const expiry = 1;
        const storage = await tb.getStorage();
        const now = new Date();
        if (isMockup()) setMockupNow(now);
        permit = await mkTransferPermit(
            ama,
            kofi,
            tb.address,
            amount,
            tokenId,
            alicePermitNb
        );
        const argM = `(Pair "${ama.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;
        await tb.permit({
            argMichelson: argM,
            as: kofi.pkh,
        });

        const firstPermit = permit.hash;

        alicePermitNb++;

        var addedPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );
        assert(
            addedPermit.args.length == 3 &&
            addedPermit.prim == 'Pair' &&
            addedPermit.args[0].int == '' + alicePermitNb &&
            addedPermit.args[1].prim == 'None' &&
            addedPermit.args[2][0].prim == 'Elt' &&
            addedPermit.args[2][0].args[0].bytes == firstPermit &&
            addedPermit.args[2][0].args[1].prim == 'Pair' &&
            addedPermit.args[2][0].args[1].args[0].prim == 'Some' &&
            addedPermit.args[2][0].args[1].args[0].args[0].int == '31556952'
        );

        const argMExp = `(Pair (Some ${expiry}) (Some 0x${firstPermit}))`;

        await tb.set_expiry({
            argMichelson: argMExp,
            as: ama.pkh,
        });

        var expiryRes = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );

        assert(
            expiryRes.args.length == 3 &&
            expiryRes.prim == 'Pair' &&
            expiryRes.args[0].int == '' + alicePermitNb &&
            expiryRes.args[1].prim == 'None' &&
            expiryRes.args[2][0].prim == 'Elt' &&
            expiryRes.args[2][0].args[0].bytes == firstPermit &&
            expiryRes.args[2][0].args[1].prim == 'Pair' &&
            expiryRes.args[2][0].args[1].args[0].prim == 'Some' &&
            expiryRes.args[2][0].args[1].args[0].args[0].int == '' + expiry
        );

        if (isMockup()) setMockupNow(new Date(Date.now() + 1100));

        permit = await mkTransferPermit(
            ama,
            abena,
            tb.address,
            amount,
            10,
            alicePermitNb
        );
        const argM2 = `(Pair "${ama.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;
        await tb.permit({
            argMichelson: argM2,
            as: kofi.pkh,
        });
        alicePermitNb++;

        var afterSecondPermitRes = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );
        assert(
            afterSecondPermitRes.args.length == 3 &&
            afterSecondPermitRes.prim == 'Pair' &&
            afterSecondPermitRes.args[0].int == '' + alicePermitNb &&
            afterSecondPermitRes.args[1].prim == 'None' &&
            afterSecondPermitRes.args[2].length == 1 &&
            afterSecondPermitRes.args[2][0].prim == 'Elt' &&
            afterSecondPermitRes.args[2][0].args[0].bytes == permit.hash &&
            afterSecondPermitRes.args[2][0].args[1].prim == 'Pair' &&
            afterSecondPermitRes.args[2][0].args[1].args[0].prim == 'Some' &&
            afterSecondPermitRes.args[2][0].args[1].args[0].args[0].int == '31556952'
        );
    });
});

describe('[Tokenized Bond] Transfers', async () => {
    it('Transfer a token not owned should fail', async () => {
        await expectToThrow(async () => {
            await tb.transfer({
                arg: {
                    txs: [[ama.pkh, [[kofi.pkh, 666, 1]]]],
                },
                as: ama.pkh,
            });
        }, errors.FA2_NOT_OPERATOR);
    });

    it('Transfer a token from another user without a permit or an operator should fail', async () => {
        await expectToThrow(async () => {
            await tb.transfer({
                arg: {
                    txs: [[ama.pkh, [[kofi.pkh, tokenId, 1]]]],
                },
                as: kofi.pkh,
            });
        }, errors.FA2_NOT_OPERATOR);
    });

    it('Transfer more tokens that owned should fail', async () => {
        await expectToThrow(async () => {
            await tb.transfer({
                arg: {
                    txs: [[ama.pkh, [[kofi.pkh, tokenId, 666]]]],
                },
                as: ama.pkh,
            });
        }, errors.FA2_INSUFFICIENT_BALANCE);
    });

    it('Transfer tokens without operator and an expired permit should fail', async () => {
        if (isMockup()) setMockupNow(new Date());

        permit = await mkTransferPermit(
            ama,
            kofi,
            tb.address,
            amount,
            tokenId,
            alicePermitNb
        );
        const argM = `(Pair "${ama.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;
        await tb.permit({
            argMichelson: argM,
            as: kofi.pkh,
        });

        alicePermitNb++;

        const argMExp = `(Pair (Some 1) (Some 0x${permit.hash}))`;

        await tb.set_expiry({
            argMichelson: argMExp,
            as: ama.pkh,
        });

        if (isMockup()) setMockupNow(new Date(Date.now() + 1100));

        await expectToThrow(async () => {
            await tb.transfer({
                arg: {
                    txs: [[ama.pkh, [[kofi.pkh, tokenId, amount]]]],
                },
                as: abena.pkh,
            });
        }, errors.EXPIRED_PERMIT);
    });

    it('Transfer tokens with an operator and with permit (permit not consumed) should succeed', async () => {
        const storage = await tb.getStorage();

        permit = await mkTransferPermit(
            ama,
            abena,
            tb.address,
            amount,
            tokenId,
            alicePermitNb
        );
        const argM = `(Pair "${ama.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;
        await tb.permit({
            argMichelson: argM,
            as: abena.pkh,
        });

        alicePermitNb++;

        var initState = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );

        const permits_nb = initState.args[2].length

        await tb.update_operators({
            argMichelson: `{Left (Pair "${ama.pkh}" "${abena.pkh}" ${tokenId})}`,
            as: ama.pkh,
        });

        var aliceBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId} "${ama.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(aliceBalances.int == amount);
        var bobBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId} "${kofi.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(bobBalances == null);

        await tb.transfer({
            arg: {
                txs: [[ama.pkh, [[kofi.pkh, tokenId, amount]]]],
            },
            as: abena.pkh,
        });

        var addedPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );

        assert(
            permits_nb == addedPermit.args[2].length &&
            JSON.stringify(initState.args[2]) == JSON.stringify(addedPermit.args[2])
        );

        var alicePostTransferBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId} "${ama.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(alicePostTransferBalances == null);
        var bobPostTransferBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId} "${kofi.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(bobPostTransferBalances.int == amount);
    });

    it('Transfer tokens without an operator and a valid permit (permit consumed)', async () => {
        // permit to transfer from payer to usdsReceiver
        const storage = await tb.getStorage();

        await tb.mint({
            arg: {
                itokenid: tokenId + 10,
                iowner: ama.pkh,
                itokenMetadata: [{ key: '', value: '0x' }],
                iamount: amount,
                iroyalties: [
                    [ama.pkh, 1000],
                    [kofi.pkh, 500],
                ],
            },
            as: ama.pkh,
        });

        permit = await mkTransferPermit(
            ama,
            kofi,
            tb.address,
            amount,
            tokenId + 10,
            alicePermitNb
        );
        const argM = `(Pair "${ama.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;
        await tb.permit({
            argMichelson: argM,
            as: ama.pkh,
        });

        var initState = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );
        const permits_nb = initState.args[2].length

        alicePermitNb++;

        var aliceBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId + 10} "${ama.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(aliceBalances.int == amount);
        var bobBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId + 10} "${kofi.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(bobBalances == null);

        await tb.update_operators({
            argMichelson: `{Right (Pair "${ama.pkh}" "${kofi.pkh}" ${tokenId + 10})}`,
            as: ama.pkh,
        });

        await tb.transfer({
            arg: {
                txs: [[ama.pkh, [[kofi.pkh, tokenId + 10, amount]]]],
            },
            as: kofi.pkh,
        });

        var addedPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${ama.pkh}"`),
            exprMichelineToJson(`address'`)
        );

        assert(
            permits_nb > addedPermit.args[2].length
        );

        var alicePostTransferBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId + 10} "${ama.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(alicePostTransferBalances == null);
        var bobPostTransferBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${tokenId + 10} "${kofi.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(bobPostTransferBalances.int == amount);
    });
});


describe('[Tokenized Bond] Set metadata', async () => {
    it('Set metadata with empty content should succeed', async () => {
        const argM = `(Pair "key" 0x)`;
        const storage = await tb.getStorage();
        await tb.set_metadata({
            argMichelson: argM,
            as: ama.pkh,
        });
        var metadata = await getValueFromBigMap(
            parseInt(storage.metadata),
            exprMichelineToJson(`""`),
            exprMichelineToJson(`string'`)
        );
        assert(metadata.bytes == '');
    });

    it('Set metadata called by not owner should fail', async () => {
        await expectToThrow(async () => {
            const argM = `(Pair "key" 0x)`;
            await tb.set_metadata({
                argMichelson: argM,
                as: kofi.pkh,
            });
        }, errors.INVALID_CALLER);
    });

    it('Set metadata with valid content should succeed', async () => {
        const bytes =
            '0x05070707070a00000016016a5569553c34c4bfe352ad21740dea4e2faad3da000a00000004f5f466ab070700000a000000209aabe91d035d02ffb550bb9ea6fe19970f6fb41b5e69459a60b1ae401192a2dc';
        const argM = `(Pair "" ${bytes})`;
        const storage = await tb.getStorage();

        await tb.set_metadata({
            argMichelson: argM,
            as: ama.pkh,
        });

        var metadata = await getValueFromBigMap(
            parseInt(storage.metadata),
            exprMichelineToJson(`""`),
            exprMichelineToJson(`string'`)
        );
        assert('0x' + metadata.bytes == bytes);
    });
});

describe('[Tokenized Bond] Set expiry', async () => {

    it('Set global expiry with too big value should fail', async () => {
        const argMExp = `(Pair (Some 999999999999999999999999999999999999999) (None))`;
        await expectToThrow(async () => {
            await tb.set_expiry({
                argMichelson: argMExp,
                as: ama.pkh,
            });
        }, errors.EXPIRY_TOO_BIG);
    });

    it('Set expiry for an existing permit with too big value should fail', async () => {
        await expectToThrow(async () => {
            const testAmount = 11;
            permit = await mkTransferPermit(
                ama,
                kofi,
                tb.address,
                testAmount,
                tokenId,
                alicePermitNb
            );
            const argM = `(Pair "${ama.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;
            await tb.permit({
                argMichelson: argM,
                as: ama.pkh,
            });
            alicePermitNb++;
            const argMExp = `(Pair (Some 999999999999999999999999999999999999999) (Some 0x${permit.hash}))`;

            await tb.set_expiry({
                argMichelson: argMExp,
                as: kofi.pkh,
            });
        }, errors.EXPIRY_TOO_BIG);
    });

    it('Set expiry with 0 (permit get deleted) should succeed', async () => {
        const testAmount = testAmount_2;
        const storage = await tb.getStorage();
        permit = await mkTransferPermit(
            abena,
            ama,
            tb.address,
            testAmount,
            tokenId,
            carlPermitNb
        );
        const argM = `(Pair "${abena.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;

        var initialPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${abena.pkh}"`),
            exprMichelineToJson(`address'`)
        );
        assert(initialPermit == null);

        await tb.permit({
            argMichelson: argM,
            as: ama.pkh,
        });
        carlPermitNb++;

        var addedPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${abena.pkh}"`),
            exprMichelineToJson(`address'`)
        );

        assert(
            addedPermit.args.length == 3 &&
            addedPermit.prim == 'Pair' &&
            addedPermit.args[0].int == '' + carlPermitNb &&
            addedPermit.args[1].prim == 'None' &&
            addedPermit.args[2].length == 1 &&
            addedPermit.args[2][0].prim == 'Elt' &&
            addedPermit.args[2][0].args[0].bytes == permit.hash &&
            addedPermit.args[2][0].args[1].prim == 'Pair' &&
            addedPermit.args[2][0].args[1].args[0].prim == 'Some' &&
            addedPermit.args[2][0].args[1].args[0].args[0].int == '31556952'
        );

        const argMExp = `(Pair (Some 0) (Some 0x${permit.hash}))`;

        await tb.set_expiry({
            argMichelson: argMExp,
            as: abena.pkh,
        });

        var finalPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${abena.pkh}"`),
            exprMichelineToJson(`address'`)
        );

        assert(
            finalPermit.args.length == 3 &&
            finalPermit.prim == 'Pair' &&
            finalPermit.args[0].int == '' + carlPermitNb &&
            finalPermit.args[1].prim == 'None' &&
            finalPermit.args[2].length == 0
        );

    });

    it('Set expiry with a correct value should succeed', async () => {
        const testAmount = 11;
        const expiry = 8;
        const storage = await tb.getStorage();

        permit = await mkTransferPermit(
            abena,
            kofi,
            tb.address,
            testAmount,
            tokenId,
            carlPermitNb
        );
        const argM = `(Pair "${abena.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;

        var initialPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${abena.pkh}"`),
            exprMichelineToJson(`address'`)
        );
        assert(
            initialPermit.args.length == 3 &&
            initialPermit.prim == 'Pair' &&
            initialPermit.args[0].int == '' + carlPermitNb &&
            initialPermit.args[1].prim == 'None' &&
            initialPermit.args[2].length == 0
        );
        await tb.permit({
            argMichelson: argM,
            as: ama.pkh,
        });

        carlPermitNb++;

        var createdAt = await await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${abena.pkh}"`),
            exprMichelineToJson(`address'`)
        );

        assert(
            createdAt.args.length == 3 &&
            createdAt.prim == 'Pair' &&
            createdAt.args[0].int == '' + carlPermitNb &&
            createdAt.args[1].prim == 'None' &&
            createdAt.args[2].length == 1 &&
            createdAt.args[2][0].prim == 'Elt' &&
            createdAt.args[2][0].args[0].bytes == permit.hash &&
            createdAt.args[2][0].args[1].prim == 'Pair' &&
            createdAt.args[2][0].args[1].args[0].prim == 'Some' &&
            createdAt.args[2][0].args[1].args[0].args[0].int == '31556952'
        );

        var creationDate = createdAt.args[2][0].args[1].args[1].string;

        const argMExp = `(Pair (Some ${expiry}) (Some 0x${permit.hash}))`;

        await tb.set_expiry({
            argMichelson: argMExp,
            as: abena.pkh,
        });

        var addedPermit = await getValueFromBigMap(
            parseInt(storage.permits),
            exprMichelineToJson(`"${abena.pkh}"`),
            exprMichelineToJson(`address'`)
        );
        assert(
            addedPermit.args.length == 3 &&
            addedPermit.prim == 'Pair' &&
            addedPermit.args[0].int == '' + carlPermitNb &&
            addedPermit.args[1].prim == 'None' &&
            addedPermit.args[2].length == 1 &&
            addedPermit.args[2][0].prim == 'Elt' &&
            addedPermit.args[2][0].args[0].bytes == permit.hash &&
            addedPermit.args[2][0].args[1].prim == 'Pair' &&
            addedPermit.args[2][0].args[1].args[0].prim == 'Some' &&
            addedPermit.args[2][0].args[1].args[0].args[0].int == expiry &&
            addedPermit.args[2][0].args[1].args[1].string == creationDate
        );
    });
});

describe('[Tokenized Bond] Burn', async () => {
    it('Burn without tokens should fail', async () => {
        await expectToThrow(async () => {
            await tb.burn({
                argMichelson: `(Pair ${tokenId} 1))`,
                as: kwame.pkh,
            });
        }, errors.FA2_INSUFFICIENT_BALANCE);
    });

    it('Burn tokens with not enough tokens should fail', async () => {
        await expectToThrow(async () => {
            await tb.burn({
                argMichelson: `(Pair ${tokenId} 666)`,
                as: ama.pkh,
            });
        }, errors.FA2_INSUFFICIENT_BALANCE);
    });

    it('Burn tokens with enough tokens should succeed', async () => {
        const test_tokenid = tokenId + 111
        await tb.mint({
            arg: {
                itokenid: test_tokenid,
                iowner: ama.pkh,
                iamount: amount,
                itokenMetadata: [{ key: '', value: '0x' }],
                iroyalties: [
                    [ama.pkh, 1000],
                    [kofi.pkh, 500],
                ],
            },
            as: ama.pkh,
        });
        const storage = await tb.getStorage();
        const burnAmount = 2;
        var aliceTransferBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${test_tokenid} "${ama.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(
            parseInt(aliceTransferBalances.int) == amount
        );
        await tb.burn({
            argMichelson: `(Pair ${test_tokenid} ${burnAmount}))`,
            as: ama.pkh,
        });

        var alicePostTransferBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${test_tokenid} "${ama.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(alicePostTransferBalances.int == ""+(amount - burnAmount));
    });

    it('Burn tokens with enough tokens and with operator a second time should succeed', async () => {
        const test_tokenid = tokenId + 112

        await tb.mint({
            arg: {
                itokenid: test_tokenid,
                iowner: ama.pkh,
                iamount: amount,
                itokenMetadata: [{ key: '', value: '0x' }],
                iroyalties: [
                    [ama.pkh, 1000],
                    [kofi.pkh, 500],
                ],
            },
            as: ama.pkh,
        });

        const storage = await tb.getStorage();
        var aliceTransferBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${test_tokenid} "${ama.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(
            parseInt(aliceTransferBalances.int) == amount
        );
        await tb.burn({
            argMichelson: `(Pair ${test_tokenid} ${amount})`,
            as: ama.pkh,
        });

        var alicePostTransferBalances = await getValueFromBigMap(
            parseInt(storage.ledger),
            exprMichelineToJson(`(Pair ${test_tokenid} "${ama.pkh}")`),
            exprMichelineToJson(`(pair nat address))'`)
        );
        assert(alicePostTransferBalances == null);
    });
});

describe('[Tokenized Bond] Pause', async () => {
    it('Set pause should succeed', async () => {
        await tb.pause({
            as: ama.pkh,
        });
        const storage = await tb.getStorage();
        assert(storage.paused == true);
    });

    it('Minting is not possible when contract is paused should fail', async () => {
        await expectToThrow(async () => {
            await tb.mint({
                arg: {
                    itokenid: tokenId,
                    iowner: ama.pkh,
                    iamount: amount,
                    itokenMetadata: [{ key: '', value: '0x' }],
                    iroyalties: [
                        [ama.pkh, 1000],
                        [kofi.pkh, 500],
                    ],
                },
                as: ama.pkh,
            });
        }, errors.CONTRACT_PAUSED);
    });

    it('Update operators is not possible when contract is paused should fail', async () => {
        await expectToThrow(async () => {
            await tb.update_operators({
                argMichelson: `{Left (Pair "${ama.pkh}" "${kofi.pkh}" ${tokenId})}`,
                as: ama.pkh,
            });
        }, errors.CONTRACT_PAUSED);
    });

    it('Add permit is not possible when contract is paused should fail', async () => {
        await expectToThrow(async () => {
            permit = await mkTransferPermit(
                ama,
                kofi,
                tb.address,
                amount,
                tokenId,
                alicePermitNb
            );
            const argM = `(Pair "${ama.pubk}" (Pair "${permit.sig.prefixSig}" 0x${permit.hash}))`;

            await tb.permit({
                argMichelson: argM,
                as: kofi.pkh,
            });
        }, errors.CONTRACT_PAUSED);
    });

    it('Transfer is not possible when contract is paused should fail', async () => {
        await expectToThrow(async () => {
            await tb.transfer({
                arg: {
                    txs: [[ama.pkh, [[kofi.pkh, tokenId, 666]]]],
                },
                as: ama.pkh,
            });
        }, errors.CONTRACT_PAUSED);
    });

    it('Set metadata is not possible when contract is paused should fail', async () => {
        await expectToThrow(async () => {
            const bytes =
            '0x05070707070a00000016016a5569553c34c4bfe352ad21740dea4e2faad3da000a00000004f5f466ab070700000a000000209aabe91d035d02ffb550bb9ea6fe19970f6fb41b5e69459a60b1ae401192a2dc';
            const argM = `(Pair "" ${bytes})`;
            await tb.set_metadata({
                argMichelson: argM,
                as: ama.pkh,
            });
        }, errors.CONTRACT_PAUSED);
    });

    it('Set expiry is not possible when contract is paused should fail', async () => {
        const testAmount = 11;
        const expiry = 8;

        permit = await mkTransferPermit(
            abena,
            kofi,
            tb.address,
            testAmount,
            tokenId,
            carlPermitNb
        );
        
        const argMExp = `(Pair (Some ${expiry}) (Some 0x${permit.hash}))`;
        
        await expectToThrow(async () => {
            await tb.set_expiry({
                argMichelson: argMExp,
                as: ama.pkh,
            });
        }, errors.CONTRACT_PAUSED);
    });

    it('Burn is not possible when contract is paused should fail', async () => {
        await expectToThrow(async () => {
            await tb.burn({
                argMichelson: `(Pair ${tokenId} 1))`,
                as: ama.pkh,
            });
        }, errors.CONTRACT_PAUSED);
    });

    it('Transfer ownership when contract is paused should succeed', async () => {
        let storage = await tb.getStorage();
        assert(storage.owner == ama.pkh);
        await tb.declare_ownership({
            argMichelson: `"${ama.pkh}"`,
            as: ama.pkh,
        });
        storage = await tb.getStorage();
        assert(storage.owner == ama.pkh);
    });

    it('Add minter when contract is paused should fail', async () => {
        await expectToThrow(async () => {
            await tb.add_minter({
                argMichelson: `"${kofi.pkh}"`,
                as: ama.pkh,
            });
        }, errors.CONTRACT_PAUSED);
    });

    it('Remove minter when contract is paused should fail', async () => {
        await expectToThrow(async () => {
            await tb.remove_minter({
                argMichelson: `"${kofi.pkh}"`,
                as: ama.pkh,
            });
        }, errors.CONTRACT_PAUSED);
    });
});

describe('[Tokenized Bond] Transfer ownership', async () => {
    it('Transfer ownership as non owner should fail', async () => {
        await tb.unpause({
            as: ama.pkh,
        });
        await expectToThrow(async () => {
            await tb.declare_ownership({
                argMichelson: `"${kofi.pkh}"`,
                as: kofi.pkh,
            });
        }, errors.INVALID_CALLER);
    });

    it('Transfer ownership as owner should succeed', async () => {
        let storage = await tb.getStorage();
        assert(storage.owner == ama.pkh);
        await tb.declare_ownership({
            argMichelson: `"${kofi.pkh}"`,
            as: ama.pkh,
        });
        await tb.claim_ownership({
            as: kofi.pkh,
        });
        storage = await tb.getStorage();
        assert(storage.owner == kofi.pkh);
    });
});
