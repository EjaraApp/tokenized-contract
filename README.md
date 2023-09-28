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


### Mainnet Initial Mint

### mint bond
1.
`completium-cli call tokenized-bond --entry mint --arg '{"itokenid": 1, "rate": [13, 20], "iamount": 300000000, "expiration": "2024-07-16T00:00:00Z", "custodial": true, "itokenMetadata": [{"key": "", "value": "68747470733a2f2f746f6b656e697a65642d626f6e642d6173736574732e73332e75732d656173742d322e616d617a6f6e6177732e636f6d2f5444324130303030303632382e6a736f6e"}]}'`
2.
`completium-cli call tokenized-bond --entry mint --arg '{"itokenid": 2, "rate": [3, 50], "iamount": 50000000, "expiration": "2026-07-09T00:00:00Z", "custodial": true, "itokenMetadata": [{"key": "", "value": ""}]}'`
3.
`completium-cli call tokenized-bond --entry mint --arg '{"itokenid": 3, "rate": [55, 1000], "iamount": 30000000, "expiration": "2026-07-20T00:00:00Z", "custodial": true, "itokenMetadata": [{"key": "", "value": ""}]}'`