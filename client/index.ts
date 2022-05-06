import {TokenizedClient, transferDTO} from './tokenized-client';


(async () => {
    const privateKey: string = 'edskRuXRepxMstUyQhBYYG999yfwivm9S7TLxBUQi9jd54SrTwuRGSyjsfhkoHkNe2FwZVFMEokQefjnUWAN12qkmUAVkKbRJt';
    const contractAddress: string = 'KT1Rq67pDu4jJf56VPT8bmbr1wnGuCZCAHm6';
    const transfer: transferDTO = {
        address: 'tz1RgtiSzRaYUgVsamm65repNdgXasMxokB9',
        tokenId: 3,
        amount: 100,
        transferType: 'deposit',
    };

    const transfer1: transferDTO = {
        address: 'tz1MNpN5ext8VPVNWnYtfvgcttKbEJC5M5fD',
        tokenId: 3,
        amount: 68,
        transferType: 'deposit',
    };

    const tk: TokenizedClient = new TokenizedClient(privateKey);

    await tk.transfer(contractAddress, [transfer, transfer1, {...transfer, amount: 99, transferType: 'withdrawal'}, {...transfer1, amount: 27, transferType: 'withdrawal'}]);
})()