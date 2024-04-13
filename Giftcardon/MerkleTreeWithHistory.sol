// based on https://github.com/tornadocash/tornado-core/blob/master/contracts/MerkleTreeWithHistory.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

interface IHasher {
    function MiMCSponge(
        uint256 in_xL,
        uint256 in_xR,
        uint256 k
    ) external pure returns (uint256 xL, uint256 xR);
}

contract MerkleTreeWithHistory {
    uint256 public constant FIELD_SIZE =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint256 public constant ZERO_VALUE =
        4077715598027421868978385919369681856828022829195508714057868878450163495635; // = keccak256("ETHDam2024") % FIELD_SIZE
    IHasher public immutable hasher;

    uint32 public levels;

    mapping(uint256 => bytes32[]) public levelHashes;

    mapping(uint256 => bytes32) public filledSubtrees;
    mapping(uint256 => bytes32) public roots;
    uint32 public constant ROOT_HISTORY_SIZE = 30;
    uint32 public currentRootIndex = 0;
    uint32 public nextIndex = 0;

    constructor(uint32 _levels, IHasher _hasher) {
        require(_levels > 0, "_levels should be greater than zero");
        require(_levels < 32, "_levels should be less than 32");
        levels = _levels;
        hasher = _hasher;

        for (uint32 i = 0; i < _levels; i++) {
            filledSubtrees[i] = zeros(i);
        }

        roots[0] = zeros(levels);
    }

    /**
    @dev Hash 2 tree leaves, returns MiMC(_left, _right)
    */
    function hashLeftRight(
        uint256 _left,
        uint256 _right
    ) public view returns (bytes32) {
        require(
            _left < FIELD_SIZE,
            "_left should be inside the field"
        );
        require(
            _right < FIELD_SIZE,
            "_right should be inside the field"
        );
        uint256 R = _left;
        uint256 C = 0;
        (R, C) = hasher.MiMCSponge(R, C, 0);
        R = addmod(R, _right, FIELD_SIZE);
        (R, C) = hasher.MiMCSponge(R, C, 0);
        return bytes32(R);
    }

    function _insert(bytes32 _leaf) internal returns (uint32 index) {

        uint32 _nextIndex = nextIndex;
        require(
            _nextIndex != uint32(2) ** levels,
            "Merkle tree is full. No more leaves can be added"
        );
        uint32 currentIndex = _nextIndex;
        bytes32 currentLevelHash = _leaf;
        bytes32 left;
        bytes32 right;

        for (uint32 i = 0; i < levels; i++) {
            if (currentIndex % 2 == 0) {
                left = currentLevelHash;
                right = zeros(i);
                filledSubtrees[i] = currentLevelHash;
            } else {
                left = filledSubtrees[i];
                right = currentLevelHash;
            }
            currentLevelHash = hashLeftRight(uint256(left), uint256(right));
            currentIndex /= 2;
        }

        uint32 newRootIndex = (currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        currentRootIndex = newRootIndex;
        roots[newRootIndex] = currentLevelHash;
        nextIndex = _nextIndex + 1;

        return _nextIndex;
    }

    function getLevelHashes(uint256 level) public view returns (bytes32[] memory) {
        require(level < levels, "Invalid level");
        return levelHashes[level];
    }

    /**
    @dev Whether the root is present in the root history
    */
    function isKnownRoot(bytes32 _root) public view returns (bool) {
        if (_root == 0) {
            return false;
        }
        uint32 _currentRootIndex = currentRootIndex;
        uint32 i = _currentRootIndex;
        do {
            if (_root == roots[i]) {
                return true;
            }
            if (i == 0) {
                i = ROOT_HISTORY_SIZE;
            }
            i--;
        } while (i != _currentRootIndex);
        return false;
    }

    /**
    @dev Returns the last root
    */
    function getLastRoot() public view returns (bytes32) {
        return roots[currentRootIndex];
    }

    /// @dev provides Zero (Empty) elements for a MiMC MerkleTree. Up to 32 levels
    function zeros(uint256 i) public pure returns (bytes32) {
        if (i == 0)
            return
                bytes32(
                    0x0903e7bdc502c4d52b3c43ddff037314df39504822a23a621ec1a8557280b2d3
                );
        else if (i == 1)
            return
                bytes32(
                    0x1219ff6c0ead9bffc74dd33da006f53f3ee8a087f05f23a370d35110dd5844eb
                );
        else if (i == 2)
            return
                bytes32(
                    0x0f3e9a3fbdfc9dde9f728a6ac3a89d11f84d856d1d9e62823dae739b94209cfb
                );
        else if (i == 3)
            return
                bytes32(
                    0x0d7080281f9a22db4dbf1c888be0af270729abda8e041531f88cf4ae31df0002
                );
        else if (i == 4)
            return
                bytes32(
                    0x06c841475f5b1a399a24944f8a624123d4b986c710330a32ac05c92991050559
                );
        else if (i == 5)
            return
                bytes32(
                    0x3032cdf0d1a73a468b8497a0c915b8a80d6ea9a68fb29552416410b39fe27f0d
                );
        else if (i == 6)
            return
                bytes32(
                    0x2f1e64b3d777a1d625efa8f8a4af9f8879ed23ae4c2f66553780ab8d26096da2
                );
        else if (i == 7)
            return
                bytes32(
                    0x1e08f611fc6bc8f145e0858c9e194d392689103009865007db2fa780e7fc59d9
                );
        else if (i == 8)
            return
                bytes32(
                    0x096d646390dfa9b8ca1d68656f83f3a475c20073cecd0e6a47e2b10aa3073c07
                );
        else if (i == 9)
            return
                bytes32(
                    0x28e2e238d079cf137a432c24f6ccaa550c036aebbd1fb4e52f1d7ba21d59c622
                );
        else if (i == 10)
            return
                bytes32(
                    0x0dd9f315c0601b9c708c5b91058d486080e8e5ddc11eb941edd959ca2034c14d
                );
        else if (i == 11)
            return
                bytes32(
                    0x28938a99ed9ec38d181443a2c6897b71a224a50d03a8d293d236efd7dd73f8c5
                );
        else if (i == 12)
            return
                bytes32(
                    0x0514211a326ab8bcd8bedade0e42d92c6a65e06b8b8582cea00353f253f6ac27
                );
        else if (i == 13)
            return
                bytes32(
                    0x15cff5a1f44624a70d25f1b41e9fdcbf94df117baf408797b962aeb8426a7843
                );
        else if (i == 14)
            return
                bytes32(
                    0x2413d9a51c8fc5b1c4787caa41bdf2d5f999a96215018cb2aafa0ee370e9df5f
                );
        else if (i == 15)
            return
                bytes32(
                    0x2789575cb2f50dbe7ed4e3a3b8e6f5ca93c31abbb7684fa4e1799d16f35e79aa
                );
        else if (i == 16)
            return
                bytes32(
                    0x1c32b292faf5405ce5844fb29713b73ce88e0565da2f9a95c6934de3e5e7b8f5
                );
        else if (i == 17)
            return
                bytes32(
                    0x1970af231984fb013f72b3f18527357e4f48ac8044deaef2359d4b6466f05202
                );
        else if (i == 18)
            return
                bytes32(
                    0x144b7aefc39cdf8a59e57ccb320b0744761bc97dd4ca0cd1d23d557373f114a0
                );
        else if (i == 19)
            return
                bytes32(
                    0x26a58b7d8d0353ad50f1a156b23074468979f85e9cfae85ac8be9f19a593acc9
                );
        else if (i == 20)
            return
                bytes32(
                    0x217d7faf429f2bdf256a6aa613fdd96e3c5e062e8540b097fc338c3c73dec084
                );
        else if (i == 21)
            return
                bytes32(
                    0x098e613018a59d5c96d3b3cdb7f23207165848ee687479b697b7995b3e0255ba
                );
        else if (i == 22)
            return
                bytes32(
                    0x037d68dddb1726e68638b8df295e954f47abd83811bf3460175c23acf1355aa9
                );
        else if (i == 23)
            return
                bytes32(
                    0x02676a5d67c9ac25ea2185b416d285e763415cdbbe0164657d878747cb20a515
                );
        else if (i == 24)
            return
                bytes32(
                    0x16d154e7ad5c15a2846c4fc7981b284551057b333a532a38aa7a9ad25d8b10bb
                );
        else if (i == 25)
            return
                bytes32(
                    0x0e349b82ea892073bc0ddd8b9b66de4d8e21791dcd552f8486017932fced7b8b
                );
        else if (i == 26)
            return
                bytes32(
                    0x0ab5214cdf7d4d504c948ec4e6d537efcc26f6399b1a0b26eaf8d4a7e17d4555
                );
        else if (i == 27)
            return
                bytes32(
                    0x0c63f57f3bd7a8338a07bcaae1e3632cd14959acab59a8b44ab212125f8affa3
                );
        else if (i == 28)
            return
                bytes32(
                    0x059e6c3ee81610f82582b210df9b5fd64e99045a11a98b9ae702cc36a19c2547
                );
        else if (i == 29)
            return
                bytes32(
                    0x25afde9dd6b1b02e38247fb909e95ae8d8f31e3862340bfd0012a2a45ebb7500
                );
        else if (i == 30)
            return
                bytes32(
                    0x1b5e83c87cf0e78e05f3f6df2b2f00b93755c289ef8921719ddb9a63412d09fd
                );
        else if (i == 31)
            return
                bytes32(
                    0x092c79e7eec7c829ed5d0a2d0f06f7561fbce1ecb85505ca9d471a1e72d48d96
                );
        else revert("Index out of bounds");
    }
}
