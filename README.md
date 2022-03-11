# tokenized-contract
Smart contract for tokenized bond

Specification https://app.clickup.com/20509715/v/dc/khx0k-5404/khx0k-3664 

## Completium Cli Commands

### deploy contract
completium-cli deploy tokenized-bond.arl --parameters '{ "owner" : "tz1UKHNxMwjQs2J2chJxadKz15qpCAZD5YZ1" }' --metadata-storage metadata.json

### add minter
completium-cli call tokenized-bond --entry add_minter --arg '{"aminter": "tz1Pi9pWrbrya2woZyG6Tja2z7pHFCTVnDQK"}'

### mint bond
completium-cli call tokenized-bond --entry mint --arg '{"ibondid": 1, "rate": [1, 20], "iamount": 1000000000, "iduration": 604800, "ibondMetadata": [{"key": "", "value": ""}]}'

### transfer
completium-cli call tokenized-bond --entry transfer --arg '{"txs": [["tz1Pi9pWrbrya2woZyG6Tja2z7pHFCTVnDQK", [["tz1RgtiSzRaYUgVsamm65repNdgXasMxokB9", 1, 1 ]]]]}'


## HangZhou Testnet Deployments

|version | url |
|--|--|
|v1.0.0|https://better-call.dev/hangzhou2net/KT1VCgCds84Y4pfxk56sm5fE1PkR1DRewmMV/operations|


## Mainnet Deployments



###### Temple Wallet

pizza jungle grace early arena wolf cluster debate north stable select sheriff