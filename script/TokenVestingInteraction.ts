


import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function main() {
    
    const [owner, otherAccount, otherAccount1] = await hre.ethers.getSigners();

    const amountMintToContract = hre.ethers.parseUnits("1000000000000", 18);
  
    const amountToclaim = hre.ethers.parseUnits("100000", 18);
  
    const vestToken = await hre.ethers.getContractFactory("VestToken");
    const vestTokenx = await vestToken.deploy(owner.address);
  
    const tokenVesting = await hre.ethers.getContractFactory("TokenVesting");
    const tokenVestingx = await tokenVesting.deploy(vestTokenx);
  
    const tokenVestingInstance = await hre.ethers.getContractAt(
      "TokenVesting",
      tokenVestingx
    );
    const vestTokenInstance = await hre.ethers.getContractAt(
      "VestToken",
      vestTokenx
    );
  
    console.log("###### Miniting token to TokenVesting  contract #######");

  const mintToContract = await vestTokenInstance
    .connect(owner)
    .mint(tokenVestingInstance.getAddress(), amountMintToContract);

  mintToContract.wait();

  console.log({ MintVestToken: mintToContract });


  console.log("####### Adding Beneficiary ####");

  await tokenVestingInstance.addBeneficiary(
    otherAccount.address,
    120,
    3600,
    amountToclaim
  );

  console.log("checking User balance before claiming");

  const userAcctBal = await vestTokenInstance
    .connect(otherAccount)
    .balanceOf(otherAccount.address);


  console.log({ "user celo balance before claim": userAcctBal.toString() });


  console.log(
    "##### getting user releasable amount after 2min of vesting period  #####"
  );

  await time.increaseTo((await time.latest()) + 120);

  const otherAccountReleasableAmount = await tokenVestingInstance
    .connect(otherAccount)
    .getReleasableAmount(otherAccount.address);

  console.log({ "OtherAccount releasable amount": otherAccountReleasableAmount.toString() });


  console.log("########## user claiming after 2min  #######");

  await time.increaseTo((await time.latest()) + 4000);

  const claimingVt = await tokenVestingInstance.connect(otherAccount).claimTokens();

  claimingVt.wait();

  const otherAccountBalAfterClaiming = await vestTokenInstance
    .connect(otherAccount)
    .balanceOf(otherAccount.address);

  console.log({
    "user bal after  claiming": otherAccountBalAfterClaiming.toString(),
  });


  
  const otherAcctBalAfterClaim = await vestTokenInstance
    .connect(otherAccount)
    .balanceOf(otherAccount.address);

  console.log({
    "user1 balance after claiming All": otherAcctBalAfterClaim.toString(),
  });

  


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });