# tokenized-contract
Smart contract for tokenized bond

Specification https://app.clickup.com/20509715/v/dc/khx0k-5404/khx0k-3664 

The implementation forked and modified this code https://gitlab.com/tezos-paris-hub/rarible/rarible-nft-contracts/-/blob/main/contracts/multiple-nft-public/multiple-nft-fa2-public-collection.arl

## Completium Cli Commands

### deploy contract
`completium-cli deploy tokenized-bond.arl --parameters '{ "owner" : "tz3cF8X5V6DGBdZCC1hoqLzjtq95BcDvDKqe" }' --metadata-storage metadata.json`

### add minter
`completium-cli call tokenized-bond --entry add_minter --arg '{"aminter": "tz1Pi9pWrbrya2woZyG6Tja2z7pHFCTVnDQK"}'`

### mint bond
`completium-cli call tokenized-bond --entry mint --arg '{"itokenid": 1, "rate": [1, 20], "iamount": 1000000000, "expiration": "2022-03-31T12:00:00Z", custodial: true, "itokenMetadata": [{"key": "", "value": ""}]}'`

### transfer
`completium-cli call tokenized-bond --entry transfer --arg '{"txs": [["tz1Pi9pWrbrya2woZyG6Tja2z7pHFCTVnDQK", [["tz1RgtiSzRaYUgVsamm65repNdgXasMxokB9", 1, 1 ]]]]}'`

### set_minter_as_operator
`completium-cli call tokenized-bond --entry set_minter_as_operator --arg '{"itoken_id": 1}'`

### pause_inter_transfer
`completium-cli call tokenized-bond --entry pause_inter_transfer --arg '{"itoken_id": 1}'`

## Testnet Deployments

|version | url |
|--|--|
|v1.0.0|https://better-call.dev/hangzhou2net/KT1VCgCds84Y4pfxk56sm5fE1PkR1DRewmMV|
|v1.2.1|https://better-call.dev/hangzhou2net/KT1Rq67pDu4jJf56VPT8bmbr1wnGuCZCAHm6|
|v1.2.1-ithaca|https://better-call.dev/ithacanet/KT1SoexX6YLLkntCRNEjFoC1q99eHg188sfJ|


## Mainnet Deployments
|version | url |
|--|--|
|v1.0.0|https://better-call.dev/mainnet/KT1TN1Ja1VYgezMyxBLCVhtZi9QiPcoW7keY|


###### To Do

- update tests to reflect changes from forked code.