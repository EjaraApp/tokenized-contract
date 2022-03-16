import { TezosToolkit, WalletContract } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

interface transferObj {
    address: string;
    bondId: number;
    amount: number;
}

export interface transferDTO extends transferObj {
    transferType: 'deposit' | 'withdrawal';
}

interface transferDestination {
    to: string;
    bond_id: number;
    amount: number;
}

interface smartContractTransfer {
    from: string;
    txs: Array<transferDestination>;
}

export class TokenizedClient {
    private tezos: TezosToolkit = new TezosToolkit('https://hangzhounet.smartpy.io');
    private contract?: WalletContract;
    private signerSet: boolean = false;
    private bondMinters: Map<number, string> = new Map();
    
    constructor(privateKey?: string) {
        if (privateKey !== undefined)
        this.setSigner(privateKey);
    }

    setPrivateKey(privateKey: string) {
        this.setSigner(privateKey);
    }

    async transfer(contractAddress: string, transfers: Array<transferDTO>) : Promise<string> {
        const txs: Array<any> = [];
        for (const transfer of transfers) {
            const minter: string = await this.getMinter(contractAddress, transfer);
            let from: string;
            let to: string;
            switch (transfer.transferType) {
                case 'deposit':
                    from = minter;
                    to = transfer.address;
                    break;
                case 'withdrawal':
                    from = transfer.address;
                    to = minter;
                    break;
                default:
                    throw new Error(`Invalid transfer type ${transfer.transferType}`);
            }
            // const sc: smartContractTransfer = {
            //     from,
            //     txs: [{
            //         to_dest: to,
            //         bond_id_dest: transfer.bondId,
            //         bond_amount_dest: transfer.amount,
            //     }],
            // }
            const sc: Array<any> = [from, [{
                        to: to,
                        bond_id: transfer.bondId,
                        amount: transfer.amount,
                    }]]
            console.log(sc);
            txs.push(sc);
        }
        console.log(txs);
        
        const txHash : string = await this.smartContractTransfer(contractAddress, txs);
        return txHash;
    }

    hasSigner() : boolean {
        return this.signerSet;
    }

    private async smartContractTransfer(contractAddress: string, txs: Array<any>) : Promise<string> {
        await this.setContract(contractAddress);
        const op = await this.contract?.methods.transfer(txs).send();
        await op?.confirmation();
        return op!.opHash;
    }

    private setSigner(privateKey: string) {
        this.tezos.setSignerProvider(new InMemorySigner(privateKey));
        this.signerSet = true;
    }

    private async getMinter(contractAddress: string, transfer: transferDTO) : Promise<string> {
        if (this.bondMinters.get(transfer.bondId) !== undefined) return this.bondMinters.get(transfer.bondId)!;
        await this.setContract(contractAddress);
        const st = (await this.contract?.storage()) as any;
        const bond_meta = await st.bond_metadata.get(transfer.bondId);        
        return bond_meta.bond_minter;
    }

    private async setContract(contractAddress: string) {
        if (this.contract === undefined ) this.contract = await this.tezos.wallet.at(contractAddress);
    }
}