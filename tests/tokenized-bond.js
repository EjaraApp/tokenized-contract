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

