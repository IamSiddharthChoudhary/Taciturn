// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Izknft.sol";
import "./ImarketPlace.sol";
import "./InewBasicNft.sol";
import "./MIMCSponge.sol";

interface IVerifier {
    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[2] calldata _pubSignals) external returns (bool);
}

contract NftMarketplace is ReentrancyGuard, INftMarketPlace{
    error PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
    error ItemNotForSale(address nftAddress, uint256 tokenId);
    error NotListed(address nftAddress, uint256 tokenId);
    error AlreadyListed(address nftAddress, uint256 tokenId);
    error NoProceeds();
    error NotOwner();
    error NotApprovedForMarketplace();
    error PriceMustBeAboveZero();
    error TransactionFailed();
    error NullifierAlreadyUsed();
    error CommitmentAlreadyUsed();
    error InvalidProof();
    error NotAuthority();
    error InsufficientBalance();

    struct Listing {
        uint256 price;
        uint256 seller;
    }

    event ItemListed(
        uint256 seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCanceled(
        uint256 seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    event ItemBought(
        uint256 buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemConverted(
        address zkNftAddress,
        uint256 indexed tokenID,
        address ercNftAddress
    );

    Hasher hasher;
    uint256 creationFee = 0;
    uint256 marketFee = 0;
    uint256 conversionFee = 0;
    address verifier;
    address private authority;
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(uint256 => uint256) private s_proceeds;
    mapping(uint256 => bool) private nullifiers;
    mapping(uint256 => bool) private commitments;

    constructor(address _hasher, address _verifier) {
        hasher = Hasher(_hasher);
        verifier = _verifier;
        authority = msg.sender;
    }

    modifier notListed(
        address nftAddress,
        uint256 tokenId
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        uint256 spenderCom
    ) {
        IZkNFT nft = IZkNFT(nftAddress);
        uint256 ownerCom = nft.ownerOf(tokenId);
        if (spenderCom!=ownerCom) {
            revert NotOwner();
        } 
        _;
    }

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        uint256 com
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, com)
    {
        if(commitments[com]){
            revert CommitmentAlreadyUsed();
        }
        if (price <= 0) {
            revert PriceMustBeAboveZero();
        }
        IZkNFT nft = IZkNFT(nftAddress);
        if (nft.getApprovedAdd(tokenId) != address(this)) {
            revert NotApprovedForMarketplace();
        }
        s_listings[nftAddress][tokenId] = Listing(price, com);
        console.log("Shukar");
        emit ItemListed(com, nftAddress, tokenId, price);

        commitments[com] = true;
    }

    function cancelListing(address nftAddress, uint256 tokenId, uint256 com)
        external
        isOwner(nftAddress, tokenId, com)
        isListed(nftAddress, tokenId)
    {
        delete(s_listings[nftAddress][tokenId]);
        commitments[com] = false;
        emit ItemCanceled(com, nftAddress, tokenId);
    }

    function buyItem(address nftAddress, uint256 tokenId, uint256 com)
        external
        payable
        isListed(nftAddress, tokenId)
        nonReentrant
    {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < (listedItem.price + marketFee)) {
            revert PriceNotMet(nftAddress, tokenId, listedItem.price);
        }
        s_proceeds[listedItem.seller] += msg.value;
        delete (s_listings[nftAddress][tokenId]);
        IZkNFT(nftAddress).transferNFT(tokenId,com,msg.sender);
        emit ItemBought(com, nftAddress, tokenId, listedItem.price);

        if(commitments[com]){
            revert CommitmentAlreadyUsed();
        }
        commitments[com] = true;
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice,
        uint256 com
    )
        external
        isListed(nftAddress, tokenId)
        nonReentrant
        isOwner(nftAddress, tokenId, com)
    {
        if (newPrice <= 0) {
            revert PriceMustBeAboveZero();
        }
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(com, nftAddress, tokenId, newPrice);
    }

    function withdrawReward(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB, 
        uint[2] calldata _pC, 
        uint nul,
        uint256 com,
        uint price
    ) 
        override external 
    {

        if(nullifiers[nul]){
            revert NullifierAlreadyUsed();
        }

        uint256 _addr = uint256(uint160(msg.sender));

        (bool verifyOK, ) = verifier.call(abi.encodeCall(IVerifier.verifyProof, (_pA, _pB, _pC, [com, _addr])));

        if(!verifyOK){
            revert InvalidProof();
        }


        uint256 proceeds = s_proceeds[com];
        if (proceeds <= 0) {
            revert NoProceeds();
        }
        if(price > proceeds){
            revert InsufficientBalance();
        }
        uint256 remainingBal = proceeds-price;
        if (remainingBal==0){
            commitments[com] = false;
            nullifiers[nul] = true;
        }
        s_proceeds[com] = remainingBal;
        (bool success, ) = payable(msg.sender).call{value: (price - creationFee)}("");
        
        if(!success){
            revert TransactionFailed();
        }
    }

    function setCreationFee(uint256 _fee) public {
        if(msg.sender != authority){
            revert NotAuthority();
        }
        creationFee = _fee;
    }

    function setBuyerFee(uint256 _fee) public {
        if(msg.sender != authority){
            revert NotAuthority();
        }
        marketFee = _fee;
    }

    function setConversionFee(uint256 _fee) public {
        if(msg.sender != authority){
            revert NotAuthority();
        }
        conversionFee = _fee;
    }

    function convertToERC721(address zkNftAddress, address convertableNft,uint256 tokenId, uint256 com) public payable {

        (bool success, ) = payable(msg.sender).call{value: conversionFee}("");
        if(!success){
            revert TransactionFailed();
        }
        string memory tokenURI = IZkNFT(zkNftAddress).getTokenURI(tokenId);
        IZkNFT(zkNftAddress).deleteZkNft(tokenId,com,msg.sender);   
        INewBasicNFT(convertableNft).mintNft(msg.sender,tokenURI);

        emit ItemConverted(zkNftAddress,tokenId,convertableNft);
    }

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(uint256 sellerCom) external view returns (uint256) {
        return s_proceeds[sellerCom];
    }
}