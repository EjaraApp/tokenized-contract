import {TokenizedClient, transferDTO} from './tokenized-client';


(async () => {
    const privateKey: string = 'edskSA2gg3UGrhD7MgURwEfiX9mEbLw27UJQzzpxKqUh1QwWWuoZDfLhYgvf6UokuGiQFkaAHj2upA5w5NuiwXtJmSA1viM355';
    const contractAddress: string = 'KT1SoexX6YLLkntCRNEjFoC1q99eHg188sfJ';
    const transfer: transferDTO = {
        address: 'tz1RgtiSzRaYUgVsamm65repNdgXasMxokB9',
        tokenId: 2,
        amount: 100,
        transferType: 'deposit',
    };

    const transfer1: transferDTO = {
        address: 'tz1MNpN5ext8VPVNWnYtfvgcttKbEJC5M5fD',
        tokenId: 2,
        amount: 68,
        transferType: 'deposit',
    };

    const tk: TokenizedClient = new TokenizedClient(privateKey);

    await tk.transfer(contractAddress, [transfer, transfer1, {...transfer, amount: 99, transferType: 'withdrawal'}, {...transfer1, amount: 27, transferType: 'withdrawal'}]);
})()