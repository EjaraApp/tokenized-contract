# Architecture Document

Purpose

This document gives an overview and architecture of the Ejara Tokenized Bonds. It is meant to also be a source of truth for the product. Everything in here is debatable, questionable and open to modification, but whatever is agreed on is what is meant to be implemented dito dito. Source of truth doesn’t mean absolute dictatorship, it just means that if at any moment the implementer does have a doubt, concern or suggestion, such should be discussed among relevant parties and necessary changes be made to the document. This ensures transparency and accountability and best of all prevents unnecessary improvisation where a simple solution could have been offered by someone else.

  

Background
==========

  

Requirements
============

Functional Requirements
=======================

1.  Split and digitise bonds on smart contracts.
2.  Ejara users should be able to buy preset values of bonds on the smart contract.
3.  An admin portal which allows one to observe real time transactions on the smart contract as well as have a general overview of all necessary operations.
4.  A backend application to also keep track of all transactions in the system.

  

Flow Overview
=============

1.  Ejara buys bonds from the government.
2.  Ejara tokenises the bond and puts that on a managed smart contract.
3.  Users buy bonds from Ejara and it reflects on databases and smart contracts as well.
4.  Users can withdraw their deposit at a penalty.
5.  Users earn interest on their deposit.

  

Here are the top level functions within this project

Tokenising
----------

1.  Ejara can buy and tokenise bonds from the government.

Buying
------

1.  Users can only buy from Ejara.
2.  Only Ejara users can buy it.

  

Withdrawal (penalty model)
--------------------------

1.  Users can sell bonds before maturity at a penalty.
2.    
    

  

Interest (interest model)
-------------------------

1.  Users earn daily interest on their bond deposit.
2.    
    

Non Functional Requirements
===========================

Who are the users?
------------------

*   Ejara users who will buy bonds using the ejara app.
*   Government/Admins officials who will have a real time dashboard of the whole system. They will see statistics and any other exploratory data we want to show them.

  

What kind of data are we storing?
---------------------------------

  

  

Overall Architecture

  

Here is a high level diagram of the overall architecture.

  

  

Components
==========

Mobile App Interface
--------------------

[https://www.figma.com/file/ZmYyLAyCVZJI10wqgovoS7/Ejara-App?node-id=137%3A556](https://www.figma.com/file/ZmYyLAyCVZJI10wqgovoS7/Ejara-App?node-id=137%3A556)

Realtime Dashboard
------------------

[https://www.figma.com/file/RsjQgBGuTlsNXepmHZ08hv/Dashboard---Tokenized-bonds?node-id=29%3A193](https://www.figma.com/file/RsjQgBGuTlsNXepmHZ08hv/Dashboard---Tokenized-bonds?node-id=29%3A193)

  

### Functionalities

1.  Show real time transactions in the system.
2.  Should have different types of users with different access scopes.
3.  Show some statistics & Kpis (near real time).
4.    
    

  

### Implementation Considerations

1.  Server sent events to receive data from the server.
2.    
    

  

### Technology Stack

1.  React
2.    
    

  

Tokenized Bond Backend Application
----------------------------------

### Functionalities

1.  Handle recording of all transactions.
2.  Communicate with the smart contract to assign bonds to user addresses.
3.  Provide statistics, and data for the realtime dashboard.
4.  Compute daily interest on all deposits and send out alerts.
5.  Deploy tokenization smart contract.
6.    
    

  

### Implementation Considerations

1.  Dashboard latency
    1.  Websockets (uses more resources than necessary)
    2.  **Server sent events ( ideal since the dashboard only receives info from the frontend)**
2.  Communication with smart contract
    1.  Manual
3.  Recording data
    1.  All tables should have a history counterpart.
    2.  There will be a lot of history data.
    3.  How long to keep this data.
    4.  Checkpointing of data.
    5.    
        
4.  Separate services \*
5.    
    

  

### Technology Stack

  

1.  Database
    1.  Postgresql
    2.  All tables will be append only and this should be enforced on the level of the database
    3.  [https://stackoverflow.com/questions/28415081/postgresql-prevent-updating-columns-everyone](https://stackoverflow.com/questions/28415081/postgresql-prevent-updating-columns-everyone) .
2.  Server framework
    1.  Nestjs

  

Smart Contract
--------------

### Functionalities

*   Bond is tokenized using the blockchain
*   Mint new bonds on the blockchain by multisig users.
*   Burn bonds on the blockchain by multisig users.
*     
    

  

### Implementation Considerations

1.  No Fee Implementation
2.  Custodial

### Technology Stack

*   Tezos

  

  

Components Details

  

Tokenized Bond Backend Application
==================================

  

Data Schema
===========

All schemas will have a timestamp column. All rows are final and cannot be modified.

User
----

Stores data related to users. Every user is uniquely identified by their Ejara username and a custodial blockchain address will be assigned to them. The user schema should have the following columns

  

*   **Username** (Ejara username) - required
*   **Address** (Blockchain Address) - required

Transaction
-----------

Stores events relating to any transactions in the system. This table is used as a write ahead log and appends only tables with database level restrictions to prevent modification of already entered data. There are two main types of transactions identified in this system. A deposit transaction and a withdrawal transaction. There are two more that could be added like interest transaction and penalty transaction. However, these can still be classified as a deposit and withdrawal. The transaction table should have the following columns

  

*   **User** ( user transaction is related to) - required
*   **Type** (type of the transaction | deposit | withdrawal | interest | penalty |) - required
*   **Reference** (unique uuid of transaction) - required
*   **Status** (status of the transaction | pending | success | failed | )
*   **Message** (message associated with the event) - required
*   **Amount** (amount associated the the transaction) - required
*   **Fees** (transaction fees) - required
*   **Bond** (Bond transaction is related to) - required
*     
    

  

Bond
----

Since there will be a different bond season after season, there will be the need to keep track of that. Every bond has a smart contract associated with it and that should be stored. Also a bond should define its interest and penalty model parameters at the time of creation.

  

*   **Total Value** (integer ? )
*   **Duration** (duration of bond)
*   **Status**
*   **Smart Contract**
*     
    

Smart Contract
--------------

*   **Hash** (hash of smart contract) - required
*     
    

  

Penalty
-------

Penalty rules related to the the 

*   **Bond** (related bond)
*   …

  

Interest
--------

*   **Bond** (related bond)
*   **Period** ( how frequently is interest calculated )
*   **Period Type** ( hour | day | week | month | year )
*   **Value**
*   **Type** ( fixed | percentage )
*   **Category** ( users | amount )
*   **Category Value** ( depending on the category )
*   **Active** (boolean)
*   …

Api Endpoints
=============

This gives a rough overview of the possible api endpoints.

Transactions
------------

### Endpoint to get bonds a user has purchased (token required)

### Endpoint to get user transactions with filtering (token required)

### Endpoint create a transaction for a user (token required)

Interest
--------

### Endpoint to create interest scheme

Withdraw Penalty
----------------

### Endpoint to create withdraw penalty

### Endpoint to get all withdraw penalty

Bond
----

### Endpoint to create bond (admin)

### Endpoint to get all bonds

Cron Jobs
=========

  

Interest Man
------------

*   Compute and create interest transactions.

Smart Contract Sync
-------------------

*   Detects new tokens to be minted, record them somewhere and alerts smart contract admins.

  

Payments Sync
-------------

Detects pending transactions, checks for their payment statuses and updates transaction status. Also notify 

Smart Contract
==============

This is a simple digital asset smart contract that defines mint and burn functionalities as well as interest and penalty models. There is no functionality to transfer between users.

Entry Points Definitions
------------------------

Entry points within the smart contract that can be invoked by clients

Data Types Definitions
----------------------

Definition of all the possible data types within the smart contract

  

General

Scaling
=======

The backend system is stateless such that scaling efforts can be both vertical and horizontal.

Security
========

Special attention has been given to important security processes surrounding the database. In this design the database is rigged to prevent modification of already existent data. This forces the schema design to deal with an append only database system. Also the smart contract implements a multisig system to minting new tokens.

Tech Stack
==========

1.  Nestjs
2.  Flutter
3.  React
4.  Tezos
5.  Jaeger for tracing
6.  ELK Stack for logging
7.    
    

Environments
============

It is important that we have both a test and production environment for our merchants to speed up testing and integration and to separate test data from production data.

Test Environment
----------------

In the test environment all components must be in testing mode.

Production Environment
----------------------

This space should be sacred and only be touched when there is a solid well tested update to be made.

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