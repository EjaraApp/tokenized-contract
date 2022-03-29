

# Smart Contract

Summary
-------

  

A smart contract to power the Ejara tokenized bond project.

In summary, we want to be able to represent on a smart contract a tokenized bond. That is a bond broken down into the barest pieces such that we could sell off any amount of it.

  

At Ejara we break down the bond into pieces of 1 CFA each. Which means if Ejara bought a 10 million CFA worth of bond, the smart contract will have 10 million tokens each worth 1 CFA.

  

In thinking about what kind of smart contract would be appropriate, the following factors were taken into consideration.

  

1.  Existing solutions.
2.  Flexibility and future expansion.
3.  Compliance with existing defi ecosystem.
4.  Compliance with law.

  

In considering these, it was decided that the FA2 smart contract specification would be a great fit for our use case. There was no need to develop an entirely new class of smart contract.

  

From the time Ejara actually buys the bonds to the maturity period, the smart contract should be able to provide means of achieving these functions.

  

1.  Tokenize
2.  Deposit
3.  Withdraw
4.  Transfer
5.  Mature

  

Tokenize
--------

  

Anytime Ejara purchases a bond, its next goal is to tokenize this bond on a blockchain smart contract.

Hence, the smart contract should have a functionality to make record of this tokenization process.

  

By using an FA2 contract, this tokenization process can be achieved by using a `mint` entry point. This way you get to specify all the metadata associated with the bond as well as the owner address. This address can be owned by a single user or controlled by a multisig account.

  

The address that receives the newly minted bond must be controlled by Ejara. In the context of this writing we shall call this address the **root bond address.** The root bond address is the only address that will be able to transfer bonds to users. Also it is this address that will be able to receive bonds upon maturity and beyond.

  

### Owner & Minters

  

In this contract, and Ejara controlled account will be the owner.

  

  

Deposit
-------

  

After bond is tokenized on the Ejara platform, we refer to deposit here as when a user purchases a fraction of the bond. In this case we look at it as the user is making a deposit and in return getting a bond as proof of their deposit.

  

Withing the framework of the smart contract, we should be able to enable this functionality. The approach will be to transfer the token equivalent of the user's deposit from the root bond address to the user's address.

  

  

Withdraw
--------

  

When a user deposits, withing the lifetime of the bond, they are allowed to withdraw with penalties. How this will be handled in the smart contract is to initiate a transfer from the user's address to the root bond address.

  

Transfer
--------

  

By transfer we mean the freedom allowed to users to move their tokens among themselves. Normally, FA2 tokens allow transfer between all addresses but there will be the need to have configurations in place to limit transfers. Transfer in the context of this writing is different from deposit and withdraw according to their definitions given above.

  

However, from the view point of the FA2 contract, they will all use the same transfer entry point with some extra configs enabled. With these configs it will be possible to pause and resume transfers, withdrawals and deposit as the contract owner sees fit.

  

Mature
------

  

Since we are dealing with bonds here we need to find a way to handle the maturity of the bond. As of now the chosen method is to only allow withdrawals once the bond matures.

  

Hence within the smart contract, no transfer or deposit will be possible for a bond once it matures. This will not be configurable as it is related to the very nature of a bond.

  

One thing that can be done here is to also allow a transfer between bonds. So if a particular bond is matured and a customer wants to just move to a new bond.

  

  

  

Contract Specification
======================

  

This section will give a not very detailed specification of the contract spanning the following areas.

  

1.  Data Structures & Entry Points
2.  Architecture
3.  Contract Management & Ownership

  

Data Structures & Entry Points
------------------------------

  

This section will define the data structures and entry points that the contract will have. Now note that by contract here we could mean a collection of contracts working together to provide all these entry points. The specific architecture considerations will be discussed further.

  

### Data Structures

  

On the data the contract will store and their structure. This is mainly what you will find in an FA2 contract with a few additions.

  

```
owner: Address // owner of the contract (In this case an Ejara Controlled Address)

owner_candidate: Address | None // allows owner to select new owner.

paused: Bool // whether contract executions is paused 

operator: Map<(Address, Int+, Address) , Unit> // use to store operator info

operator_for_all: Map<(Address, Address) , Unit> // use to store operator info allowed for all tokens

metadata: Map<String, bytes> // store contract metadata

token_metadata: Map<Int+, (Int+, Map<String, Bytes>)> // store metadata for each token. This will contain a format to record interest and withdrawal models for the corresponding bond.

permits: ? // for permit handling. This allows for things like gasless transfer

ledger: BigMap<(Int+, Address), Int+> // ledger used to keep track of each token, our case each tokenized bond

minters: Map<>

inter_transfer_paused: 
```

  

### Entry Points

  

Entry points the smart contract will have. This is also mainly FA2 with some

  

```
balance_of: // fa2

// transfers

transfer: // fa2 + configs to allow or stop inter transfer + deposit & withdraw semantics as explained above. 

transfer_gasless: // fa2 transfer with permit

update_operators: // fa2

update_operators_for_all: // fa2

// minting
// minters in our context are entities that can tokenize bond on ejara
// ejara itself should have a minting account
// unless configured a mint will have unlimited minting capabilities on the sc.
// with

mint: // fa2

add_minter: // 

replace_minter: // 

// permit TZIP-17

permit: // 

set_expiry: //

set_default_expiry: //

// owner / contract management

unpause: //

pause: //

transfer_ownership: //

accept_ownership: //

pause_inter_transfer: //

resume_inter_transfer: //
```

  

Architecture
------------

  

This section will discuss two main things.

  

1.  Monolithic approach vs Micro-contracts approach
2.  Upgrade mechanism

  

### Upgrade Mechanism

  

This is a question of how upgrades will be handled within the smart contract. As much as one can try to predetermine what could happen on a contract, there might be a possibility of necessary update. In such a case there are two mechanisms that have been proposed here [https://opentezos.com/tezos-basics/smart-contracts#smart-contracts-versioning](https://opentezos.com/tezos-basics/smart-contracts#smart-contracts-versioning) .

  

1.  lambda pattern
2.  data proxy pattern

  

Concisely, the lambda pattern seems to be more averted towards a monolithic contract approach, whereas the data proxy pattern is more averted toward a micro-contract approach.

  

Monolithic approach vs Micro-contracts approach
-----------------------------------------------

  

Ultimately we do not want to loose data and want to reduce or prevent the difficulty of migration. Migrations usually mainly involves moving the data to another smart contract or changing the logic. This is the problem both the lambda pattern and the data proxy pattern seeks to solve.

  

In the data proxy pattern you could basically have the data proxy smart contract that provides an interface that is then fulfilled by another smart contract or group of smart contracts.

  

For instance in the case of the entry points defined above we could have a seperate smart contract per each entry point. This way, changes in the logic would just mean an upgraded smart contract is deployed and the data proxy is pointed to it to provide that functionality.

  

In the case of the lambda pattern the implementation of each entry point is rather stored in smart contracts storage. In effect we would have a monolith.

  

Considering the evolution that this product would have to go through it might be best to go with the data proxy pattern as it seems much more natural to implement. In addition you get to implement each smart contract separately and there is not risk of pushing bad code to storage. All you need to do is point to the address of the implementation smart contract.

  

To implement the data proxy pattern other entry points and data storage will need to be allocated to manage all these other smart contracts.

  

In personal opinion data proxy approach might be best considering possible updates. However, implementation might cost some time to ensure its safe and secure. On the other hand, monolithic implementations already exists and could be used even as is with little modification.

  

  

Contract Management & Ownership
-------------------------------

  

The contract has an owner user who is basically in charge of the contract. There are certain entry points in the contract that can only be handled by the owner. In order to ensure maximum security, this owner address will be restricted to being only a multisig contract address.

  

In order to have fine grained control over each bond minted, there are extra checks put in place. These can be turned on or off by the owner of the smart contract. These rules are as follows;

  

*   Inter transfer allowed.
*   Minter is receiver after expiry.
*   Pause bond operations.
*   Minter is operator

  

### Inter Transfer Allowed.

  

This checks to ensure if the bond can be transferred among normal users. By normal user here we refer henceforth to a user who is not a minter. So if inter transfer is turned off for a particular bond, then transfers can only happen between a minter and a normal user. At least a minter must be part of the transfer either as receiver or sender. This is turned off by default and can only be enabled by owner of the smart contract.

  

### Minter is receiver after expiry.

  

This control ensures that bond can only be transferred to its minter after the expiration period.

  

  

### Pause bond operations.

  

This pauses any operations at all on the bond. In other words it freezes that particular bond.

  

### Minter is operator

  

This flag makes the minter of the bond also operator for any address holding that bond.

  

Custodial vs Non Custodial
--------------------------

  

The various properties listed above could be seen as falling into two various areas, custodial and non-custodial.

  

#### Custodial Properties

  

*   Minter is operator
*   Inter transfer not allowed

  

#### Non Custodial Properties

  

*   Minter is not operator
*   Inter transfer allowed

  

When minting a bond a new property is added `custodial` which is a boolean that determines if the bond is custodial or not by default. Of course after minting a bond, there are entrypoints to modify each of these properties.

  

Transfer Rules
--------------

  

Since this is tokenized bond, we have a slightly different rules of transfer. In FA2 specification if a transfer is initiated without sender, it is assumed a mint and similarly if without a receiver is assumed a burn. In this tokenized bond contract, there shall be no burn activity, and there is a separate entry point for mint. Hence if a transfer is made without sender, it will be considered deposit and if a transfer is made without receiver it shall be considered a withdrawal.

  

### Deposit

*   As already defined deposit is when a normal contract user wants to buy some tokens of a bond. In this case the bond can only be transfer from the mint to the user.
*   Hence if a transfer is made without a sender, it should be assumed a deposit from the mint to the user. Of course the caller should be the mint or have a permit from the mint.

  

### Withdrawal

Similarly for withdrawal;

*   If the destination address is not specified it will be assumed to be a withdrawal where the destination address will be set to the current mint address of the bond.

  

### Mint

*   For every bond there is assumed to be one and only one mint.
*   A mint can have several bonds but a bond can have only one mint.
*   Owner of the contract can change the mint of a bond.
*   Owner of the contract can remove a mint but in case the mint is linked to any active bonds, it would need to replace the mints of those bonds.
*   Hence there should be a replace mint entry point which takes a list of bonds and their new mints. This entry point can only be called by the owner.
*   Also owner can burn the tokens of a particular mint.
*   Same bond cannot be minted twice.

  

### Programming Language choice

  

#### Archetype for smart contract development

[https://opentezos.com/archetype](https://opentezos.com/archetype)

  

#### Taquito for client interaction with smart contract

[https://opentezos.com/dapp/taquito](https://opentezos.com/dapp/taquito)

  

Testing and Auditing
--------------------

The archetype language provides out of the box means of testing and auditing smart contracts.

  

  

### References

  

[https://gitlab.com/tezos-paris-hub/rarible/rarible-nft-contracts](https://gitlab.com/tezos-paris-hub/rarible/rarible-nft-contracts)

  

[https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md)

  

[https://github.com/tqtezos/stablecoin/blob/master/docs/specification.md](https://github.com/tqtezos/stablecoin/blob/master/docs/specification.md)

  

[https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-17/tzip-17.md](https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-17/tzip-17.md)

  

[https://github.com/Hover-Labs/multisig-timelock](https://github.com/Hover-Labs/multisig-timelock)