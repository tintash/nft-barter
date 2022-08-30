const truffleAssert = require("truffle-assertions");
const { BN, balance } = require("@openzeppelin/test-helpers");
const { assert } = require("chai");
const {
  checkDataFromEvent,
  ERROR_PERMISSION_DENIED,
  ERROR_INVALID_SWAP,
  ERROR_INVALID_TOKEN_ID,
  EVENT_SWAP_INITIATED,
  EVENT_SWAP_UPDATED,
  EVENT_SWAP_CANCELED,
  EVENT_SWAP_ACCEPTED,
  INVALID_BALANCE_TRANSFERRED,
} = require("./test-helpers");
const nft_barter = artifacts.require("NFTBarter");

contract("NFT Barter", (accounts) => {
  const name = "Rupees";
  const symbol = "Rs";
  const valueDifference = 20000000;
  const swapId = 1,
    invalidSwapId = 100;
  const invalidTokenId = 100,
    takerTokenId = 1,
    makerTokenId = 3;
  const [takerAddress, makerAddress, address3] = accounts;
  let tokenInstance;
  let contractTracker;
  beforeEach("initializing token instance", async () => {
    tokenInstance = await nft_barter.new(name, symbol);
    contractTracker = await balance.tracker(tokenInstance.address);

    // minting token id for maker address
    await tokenInstance.mint(makerTokenId, {
      from: makerAddress,
    });

    // minting token id for taker address
    await tokenInstance.mint(takerTokenId, {
      from: takerAddress,
    });

    // initiate a fixed swap
    await tokenInstance.initiateFixedSwap(
      makerTokenId,
      takerTokenId,
      valueDifference,
      {
        from: makerAddress,
      }
    );
  });

  it("Testing if name & symbol are correct", async () => {
    const _name = await tokenInstance.name.call();
    const _symbol = await tokenInstance.symbol.call();
    assert.equal(name, _name);
    assert.equal(symbol, _symbol);
  });

  it("initiateFixedSwap", async () => {
    // Maker to Taker Swap
    const makerToTakerSwap = await tokenInstance.initiateFixedSwap(
      makerTokenId,
      takerTokenId,
      valueDifference,
      {
        from: makerAddress,
      }
    );
    const expectedSwap1 = {
      swapId: BN(2),
      makerTokenId: BN(makerTokenId),
      takerTokenId: BN(takerTokenId),
      makerAddress,
      takerAddress,
      valueDifference: BN(valueDifference),
    };

    checkDataFromEvent(
      makerToTakerSwap,
      "swap",
      expectedSwap1,
      EVENT_SWAP_INITIATED
    );

    // Taker to Maker Swap
    const takerToMakerValueDifference = -3;
    const takerToMakerSwap = await tokenInstance.initiateFixedSwap(
      makerTokenId,
      takerTokenId,
      takerToMakerValueDifference,
      {
        from: makerAddress,
        value: Math.abs(takerToMakerValueDifference),
      }
    );
    const expectedSwap2 = {
      swapId: BN(3),
      makerTokenId: BN(makerTokenId),
      takerTokenId: BN(takerTokenId),
      makerAddress,
      takerAddress,
      valueDifference: BN(takerToMakerValueDifference),
    };

    checkDataFromEvent(
      takerToMakerSwap,
      "swap",
      expectedSwap2,
      EVENT_SWAP_INITIATED
    );
  });

  it("initiateFixedSwap - failure cases", async () => {
    // invalid token id
    await truffleAssert.reverts(
      tokenInstance.initiateFixedSwap.call(
        makerTokenId,
        invalidTokenId,
        valueDifference
      ),
      ERROR_INVALID_TOKEN_ID
    );

    // access denied
    await truffleAssert.reverts(
      tokenInstance.initiateFixedSwap.call(
        makerTokenId,
        takerTokenId,
        valueDifference,
        {
          from: address3,
        }
      ),
      ERROR_PERMISSION_DENIED
    );

    // invalid swap
    await truffleAssert.reverts(
      tokenInstance.initiateFixedSwap.call(
        makerTokenId,
        takerTokenId,
        valueDifference,
        {
          from: takerAddress,
        }
      ),
      ERROR_INVALID_SWAP
    );

    // invalid balance transfer
    const negativeValueDifference = -5;
    await truffleAssert.reverts(
      tokenInstance.initiateFixedSwap.call(
        makerTokenId,
        takerTokenId,
        negativeValueDifference,
        {
          from: makerAddress,
        }
      ),
      INVALID_BALANCE_TRANSFERRED
    );
  });

  /**
   * Tests for updating Swap order
   */

  it("updateSwapValue", async () => {
    // positive value to negative value update
    const negativeValueDifference = -100000000000;
    const postiveToNegativeUpdate = await tokenInstance.updateSwapValue(
      swapId,
      negativeValueDifference,
      {
        from: makerAddress,
        value: Math.abs(negativeValueDifference),
      }
    );
    const expectedSwap = {
      swapId: BN(1),
      makerTokenId: BN(makerTokenId),
      takerTokenId: BN(takerTokenId),
      makerAddress,
      takerAddress,
      valueDifference: BN(negativeValueDifference),
    };

    // checking event here
    checkDataFromEvent(
      postiveToNegativeUpdate,
      "updatedSwap",
      expectedSwap,
      EVENT_SWAP_UPDATED
    );

    // check contract's balance here. It should be equal to negativeValueDifference
    let cBalance = await contractTracker.get();
    assert.equal(cBalance, Math.abs(negativeValueDifference));

    // lower to higher -ve value update
    const lowerToHigherValueDifference = -150000000000;
    const lowerToHigherNegative = await tokenInstance.updateSwapValue(
      swapId,
      lowerToHigherValueDifference,
      {
        from: makerAddress,
        value: Math.abs(lowerToHigherValueDifference - negativeValueDifference),
      }
    );
    expectedSwap.valueDifference = BN(lowerToHigherValueDifference);

    // checking event here
    checkDataFromEvent(
      lowerToHigherNegative,
      "updatedSwap",
      expectedSwap,
      EVENT_SWAP_UPDATED
    );

    // check contract's balance here. It should be equal to lowerToHigherValueDifference
    cBalance = await contractTracker.get();
    assert.equal(cBalance, Math.abs(lowerToHigherValueDifference));

    // higher to lower -ve value update
    const higherToLowerValueDifference = -90000000000;
    const higherToLowerNegative = await tokenInstance.updateSwapValue(
      swapId,
      higherToLowerValueDifference,
      {
        from: makerAddress,
      }
    );

    expectedSwap.valueDifference = BN(higherToLowerValueDifference);

    // checking event here
    checkDataFromEvent(
      higherToLowerNegative,
      "updatedSwap",
      expectedSwap,
      EVENT_SWAP_UPDATED
    );

    // check contract's balance here. It should be equal to lowerToHigherValueDifference
    cBalance = await contractTracker.get();
    assert.equal(cBalance, Math.abs(higherToLowerValueDifference));

    // -ve to +ve update
    const postiveValueDifference = 90000000000;
    const negativeToPositive = await tokenInstance.updateSwapValue(
      swapId,
      postiveValueDifference,
      {
        from: makerAddress,
      }
    );
    expectedSwap.valueDifference = BN(postiveValueDifference);

    // checking event here
    checkDataFromEvent(
      negativeToPositive,
      "updatedSwap",
      expectedSwap,
      EVENT_SWAP_UPDATED
    );

    // check contract's balance here. It should be equal to lowerToHigherValueDifference
    cBalance = await contractTracker.get();
    assert.equal(cBalance, 0);
  });

  it("updateSwapValue - failure cases", async () => {
    // invalid swap id
    await truffleAssert.reverts(
      tokenInstance.updateSwapValue.call(invalidSwapId, valueDifference),
      ERROR_INVALID_SWAP
    );

    // permission denied
    await truffleAssert.reverts(
      tokenInstance.updateSwapValue.call(swapId, valueDifference, {
        from: address3,
      }),
      ERROR_PERMISSION_DENIED
    );

    // updating positive value to negative without transferring amount
    const negativeValueDifference = -100000000000;
    await truffleAssert.reverts(
      tokenInstance.updateSwapValue.call(swapId, negativeValueDifference, {
        from: makerAddress,
      }),
      INVALID_BALANCE_TRANSFERRED
    );

    // updating lower to negative value without transferring funds
    await tokenInstance.updateSwapValue(
      swapId,
      negativeValueDifference,
      {
        from: makerAddress,
        value: Math.abs(negativeValueDifference),
      }
    );
    const higherNegativeValue = -200000000000;
    await truffleAssert.reverts(
      tokenInstance.updateSwapValue.call(swapId, higherNegativeValue, {
        from: makerAddress,
      }),
      INVALID_BALANCE_TRANSFERRED
    );
  });

  it("updateSwapMakerToken", async () => {
    const differentMakerTokenId = 10;
    // minting different token with maker
    await tokenInstance.mint(differentMakerTokenId, {
      from: makerAddress,
    });
    const response = await tokenInstance.updateSwapMakerToken(
      swapId,
      differentMakerTokenId,
      {
        from: makerAddress,
      }
    );
    const expectedSwap = {
      swapId: BN(1),
      makerTokenId: BN(differentMakerTokenId),
      takerTokenId: BN(takerTokenId),
      makerAddress,
      takerAddress,
      valueDifference: BN(valueDifference),
    };

    checkDataFromEvent(
      response,
      "updatedSwap",
      expectedSwap,
      EVENT_SWAP_UPDATED
    );
  });

  it("updateSwapMakerToken - failure cases", async () => {
    // invalid swap
    await truffleAssert.reverts(
      tokenInstance.updateSwapMakerToken.call(invalidSwapId, makerTokenId, {
        from: makerAddress,
      }),
      ERROR_INVALID_SWAP
    );

    // invalid token id
    await truffleAssert.reverts(
      tokenInstance.updateSwapMakerToken.call(swapId, invalidTokenId, {
        from: makerAddress,
      }),
      ERROR_INVALID_TOKEN_ID
    );

    // permission denied
    await truffleAssert.reverts(
      tokenInstance.updateSwapMakerToken.call(swapId, makerTokenId, {
        from: address3,
      }),
      ERROR_PERMISSION_DENIED
    );
  });

  it("updateSwapTakerToken", async () => {
    const differentTokenId = 2;
    await tokenInstance.mint(differentTokenId, { from: takerAddress });

    const response = await tokenInstance.updateSwapTakerToken(
      swapId,
      differentTokenId,
      { from: makerAddress }
    );
    const expectedSwap = {
      swapId: BN(1),
      makerTokenId: BN(makerTokenId),
      takerTokenId: BN(differentTokenId),
      makerAddress,
      takerAddress,
      valueDifference: BN(valueDifference),
    };

    checkDataFromEvent(
      response,
      "updatedSwap",
      expectedSwap,
      EVENT_SWAP_UPDATED
    );
  });

  it("updateSwapTakerToken - failue cases", async () => {
    // invalid swap
    await truffleAssert.reverts(
      tokenInstance.updateSwapMakerToken.call(invalidSwapId, makerTokenId, {
        from: makerAddress,
      }),
      ERROR_INVALID_SWAP
    );

    // invalid token id
    await truffleAssert.reverts(
      tokenInstance.updateSwapMakerToken.call(swapId, invalidTokenId, {
        from: makerAddress,
      }),
      ERROR_INVALID_TOKEN_ID
    );

    // permission denied
    await truffleAssert.reverts(
      tokenInstance.updateSwapMakerToken.call(swapId, makerTokenId, {
        from: address3,
      }),
      ERROR_PERMISSION_DENIED
    );
  });

  /**
   * Tests for Swap actions
   */
  it("cancelSwap", async () => {
    // positive value difference
    let cBalance = await contractTracker.get();
    assert.equal(cBalance, 0);
    const canceledSwap = await tokenInstance.cancelSwap(swapId, {
      from: makerAddress,
    });
    cBalance = await contractTracker.get();
    assert.equal(cBalance, 0);

    let expectedSwap = {
      swapId: BN(1),
      makerTokenId: BN(makerTokenId),
      takerTokenId: BN(takerTokenId),
      makerAddress,
      takerAddress,
      valueDifference: BN(valueDifference),
    };

    checkDataFromEvent(canceledSwap, "swap", expectedSwap, EVENT_SWAP_CANCELED);

    // negative value difference 
    const negativeValueDifference = -100000000000;
    await tokenInstance.initiateFixedSwap(
      makerTokenId,
      takerTokenId,
      negativeValueDifference,
      {
        from: makerAddress,
        value: Math.abs(negativeValueDifference)
      }
    );
    cBalance = await contractTracker.get();
    assert.equal(cBalance, Math.abs(negativeValueDifference));
    // cancelling swap
    const canceledSwap1 = await tokenInstance.cancelSwap(2, {
      from: makerAddress,
    });
    cBalance = await contractTracker.get();
    assert.equal(cBalance, 0);

    expectedSwap.swapId = BN(2);
    expectedSwap.valueDifference = BN(negativeValueDifference);

    checkDataFromEvent(canceledSwap1, "swap", expectedSwap, EVENT_SWAP_CANCELED);
  });

  it("cancelSwap - failure cases", async () => {
    // invalid swap
    await truffleAssert.reverts(
      tokenInstance.cancelSwap.call(invalidSwapId),
      ERROR_INVALID_SWAP
    );
    // permission denied
    await truffleAssert.reverts(
      tokenInstance.cancelSwap.call(swapId, { from: address3 }),
      ERROR_PERMISSION_DENIED
    );
  });

  it("acceptSwap", async () => {
    // accepting the swap - with positive value
    let cBalance = await contractTracker.get();
    assert.equal(cBalance, 0);
    const acceptedSwapPositiveVD = await tokenInstance.acceptSwap(swapId, takerTokenId, {
      from: takerAddress,
      value: valueDifference
    });
    cBalance = await contractTracker.get();
    assert.equal(cBalance, 0);

    let expectedSwap = {
      swapId: BN(1),
      makerTokenId: BN(makerTokenId),
      takerTokenId: BN(takerTokenId),
      makerAddress,
      takerAddress,
      valueDifference: BN(valueDifference),
    };

    checkDataFromEvent(acceptedSwapPositiveVD, "swap", expectedSwap, EVENT_SWAP_ACCEPTED);
    
    // accepting the swap - with negative value
    const negativeValueDifference = -100000000000;
    await tokenInstance.initiateFixedSwap(
      takerTokenId,
      makerTokenId,
      negativeValueDifference,
      {
        from: makerAddress,
        value: Math.abs(negativeValueDifference)
      }
    );

    cBalance = await contractTracker.get();
    assert.equal(cBalance, Math.abs(negativeValueDifference));

    const acceptedSwapNegativeVD = await tokenInstance.acceptSwap(2, makerTokenId, {
      from: takerAddress,
    });

    cBalance = await contractTracker.get();
    assert.equal(cBalance, 0);

    expectedSwap.swapId = BN(2);
    expectedSwap.valueDifference = BN(negativeValueDifference);
    expectedSwap.makerTokenId = BN(takerTokenId);
    expectedSwap.takerTokenId = BN(makerTokenId);

    checkDataFromEvent(acceptedSwapNegativeVD, "swap", expectedSwap, EVENT_SWAP_ACCEPTED);
  });

  it("acceptSwap - failure cases", async () => {
    // invalid swapId
    await truffleAssert.reverts(
      tokenInstance.acceptSwap.call(invalidSwapId, takerTokenId),
      ERROR_INVALID_SWAP
    );
    // invalid takerTokenId
    await truffleAssert.reverts(
      tokenInstance.acceptSwap.call(swapId, invalidTokenId),
      ERROR_INVALID_TOKEN_ID
    );
    // permission denied
    await truffleAssert.reverts(
      tokenInstance.acceptSwap.call(swapId, takerTokenId, { from: address3 }),
      ERROR_PERMISSION_DENIED
    );
    // insufficient balance
    await truffleAssert.reverts(
      tokenInstance.acceptSwap.call(swapId, takerTokenId, {
        from: takerAddress,
      }),
      INVALID_BALANCE_TRANSFERRED
    );
  });

  it("isSwapPossible", async () => {
    const isSwapPossible = await tokenInstance.isSwapPossible.call(swapId);
    assert.isTrue(isSwapPossible);

    await tokenInstance.acceptSwap(swapId, takerTokenId, {
      from: takerAddress,
      value: valueDifference
    });

    const swapShouldNotBePossible = await tokenInstance.isSwapPossible.call(
      swapId
    );
    assert.isFalse(swapShouldNotBePossible);
  });

  it("isSwapPossible - failure cases", async () => {
    await truffleAssert.reverts(
      tokenInstance.isSwapPossible.call(invalidSwapId),
      ERROR_INVALID_SWAP
    );

    // stale swap
    const addr3TokenId = 5,
      swapAddr3AndMaker = 2;
    // minting another token id
    await tokenInstance.mint(addr3TokenId, {
      from: address3,
    });
    // initiating another swap with makerToken and addr3TokenId
    await tokenInstance.initiateFixedSwap(
      makerTokenId,
      addr3TokenId,
      valueDifference,
      {
        from: makerAddress,
      }
    );
    // accepting the swap to invalidate the first swap
    await tokenInstance.acceptSwap(swapAddr3AndMaker, addr3TokenId, {
      from: address3,
      value: valueDifference
    });

    const isInitialSwapPossible = await tokenInstance.isSwapPossible.call(
      swapId
    );
    assert.isFalse(isInitialSwapPossible);
  });
});
