import {TokenizedClient, transferDTO} from './tokenized-client';


(async () => {
    const privateKey: string = 'edskRuXRepxMstUyQhBYYG999yfwivm9S7TLxBUQi9jd54SrTwuRGSyjsfhkoHkNe2FwZVFMEokQefjnUWAN12qkmUAVkKbRJt';
    const contractAddress: string = 'KT1VCgCds84Y4pfxk56sm5fE1PkR1DRewmMV';
    const transfer: transferDTO = {
        address: 'tz1RgtiSzRaYUgVsamm65repNdgXasMxokB9',
        bondId: 2,
        amount: 2,
        transferType: 'deposit',
    }

    const tk: TokenizedClient = new TokenizedClient(privateKey);

    await tk.transfer(contractAddress, [transfer]);
})()