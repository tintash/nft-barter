# Preamble

Title: nft-barter Proposal document 

## Simple Summary
This is a proposal document to describe nft-barter.

## Abstract 
This nft-barter is an open market where you can mint, buy, sell and swap NFTs within collection. The mint, buy and sell funtionality will be
the standard mplementation of ERC-721 with some add-ons. NFT-barter comes in where user can list item for swap, propose swap,
execute swap and pay-receive.

## Motivation
This idea is a widespread use case of trading / exchanging goods in both virtual and real world

#### Real world example: 
You have an iphone13 and you decide to switch to android,
  1. You put up your iphone available for exchange with samsung on an online marketplace where you also find someone having a samsung s20 willing to swap with iphone.
  2. To be noted in this case your iphone has more monetary value than the other party's samsung 20 thus along with the swap you would also want to receive money with it that both parties agree upon. 
  3. NFT swap and pay-receive should be able to perform this kind of deal for NFT in a non custodial way.

#### Virtual example:

In gaming items buy / sell / trade is very common too. Dmarket is one of the markets for this purpose. Here is a video explaining the same use case for game skins. [Link](https://www.youtube.com/watch?v=F45Ni6x9q0k)

## Reference 

* [NFTrade](https://nftrade.com/swaps) is website that allows nft swaps.

* 0x protocol NFT swap standard
0x is an open-source, decentralized exchange infrastructure that enables the exchange of tokenized assets on multiple blockchains.
They have launched an nft swap standard on polygon as per below blog [post](https://bitcoinist.com/ethereum-ox-deploys-nft-swap-standard-on-polygon/#:~:text=The%20NFTr%20Swap%20standard%2C%20according,the%20sector%20across%20multiple%20blockchains).

## Implementation
As in the real world this would be a 3 step procedure.

  1. Initiate 
  2. Offer
  3. Accept

Let's say Alex wants to swap an NFT, it can be done in two ways.
 1. Swap with a specific NFT
 2. Swap with any NFT 
### case 1: 
Alex **Initiates** the swap and **Offer** an NFT. The will be saved in contract state. Bob sees his NFT listed as swap with two options
i) Accept ii) Reject. If Bob **Accept** the swap the NFTs will be swaped. 
Bob can also reject the swap. In that case NFT swap will be reset. So, Alex will have to reinitiate the swap if he wants to.  Alex can also cancel the swap 
anytime before the reject and accept.
### case 2:
Alex puts his nft to swap by **Initiating**. Multiple persons see Alex's swap listed, they can **Offer** the exchange with their on NFTs.  Alex **Accept** any NFT and nft will be swaped. Alex can also cancel his swap anytime before the transfer. 

