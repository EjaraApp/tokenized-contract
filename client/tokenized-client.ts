import { TezosToolkit, WalletContract } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';

interface transferObj {
    address: string;
    tokenId: number;
    amount: number;
}

export interface transferDTO extends transferObj {
    transferType: 'deposit' | 'withdrawal';
}

export class TokenizedClient {
    private tezos: TezosToolkit = new TezosToolkit('https://hangzhounet.smartpy.io');
    private contract?: WalletContract;
    private signerSet: boolean = false;
    private tokenMinters: Map<number, string> = new Map();
    
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
            const sc: Array<any> = [from, [{
                        to: to,
                        token_id: transfer.tokenId,
                        amount: transfer.amount,
                    }]]
            txs.push(sc);
        }
        
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
        if (this.tokenMinters.get(transfer.tokenId) !== undefined) return this.tokenMinters.get(transfer.tokenId)!;
        await this.setContract(contractAddress);
        const st = (await this.contract?.storage()) as any;
        const token_meta = await st.token_metadata.get(transfer.tokenId);        
        return token_meta.token_minter;
    }

    private async setContract(contractAddress: string) {
        if (this.contract === undefined ) this.contract = await this.tezos.wallet.at(contractAddress);
    }
}