import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";


//Deploys store contract and returns store, owner, otherAccount and otherAccount2 for the upcomming tests
describe("Store", function () {
    async function deployStore() {

        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();

        const store = await ethers.deployContract("Store");

        return { store, owner, otherAccount, otherAccount2 };
    }

    it("Owner Should be able to add new product", async function () {
        console.log("Test started... Owner Should be able to add new product")
        const name = "NewPoduct";
        const quantity = 10;

        //loading Store contract fixture
        const { store } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);
    })

    it("Owner Should not be able to add new  with 0 quantity", async function () {
        console.log("Test started... Owner Should not be able to add new  with 0 quantity")
        const name = "NewPoduct";
        const quantity = 0;

        //loading Store contract fixture
        const { store } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the quantity can be 0. Expects the action to be reverted with the given message
        await expect(store.addProduct(name, quantity))
            .to.be.revertedWith("Quantity can't be 0!");
    })

    it("otherAccount Should not be able to add new product", async function () {
        console.log("Test started... otherAccount Should not be able to add new product")
        const name = "NewPoduct";
        const quantity = 10;

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct from anotherAccount that is not the owner. Expects the action to be reverted
        await expect(store.connect(otherAccount).addProduct(name, quantity))
            .to.be.reverted;
    })

    it("If the product exists, only the quantity to be updated", async function () {
        console.log("Test started... If the product exists, only the quantity to be updated")
        const name = "NewPoduct";
        const quantity = 10;

        //loading Store contract fixture
        const { store } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);
        //Calling again addProduct with the same name and quantity and assert if the event ProductUpdated is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductUpdated")
            .withArgs(anyValue, name, quantity);
    })

    it("Owner should be able to update existing product quantity", async function () {
        console.log("Test started... Owner should be able to update existing product quantity")
        const name = "NewPoduct";
        const quantity = 10;
        const newQuantity = 20;
        const productId = 0; //The product id is related to its index in the products array. Here we have only one product and its index hence productId is equal to 0

        //loading Store contract fixture
        const { store } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        // Calling updateProductQuantity with productId and newQuantity and assert if the ProductUpdated event is successfully emitted with the given args
        await expect(store.updateProductQuantity(productId, newQuantity))
            .to.emit(store, "ProductUpdated")
            .withArgs(0, name, newQuantity);
    })

    it("Other user should NOT be able to update existing product quantity", async function () {
        console.log("Test started... Other user should NOT be able to update existing product quantity")
        const name = "NewPoduct";
        const quantity = 10;
        const productId = 0; //The product id is related to its index in the products array. Here we have only one product and its index hence productId is equal to 0

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling and Asserting addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if otherAccount would be able to update product quantity. Expect the action to be reverted
        await expect(store.connect(otherAccount).updateProductQuantity(productId, quantity)).to.be.reverted;
    })

    it("Client should be able to see and buy existing products", async function () {
        console.log("Test started... Client should be able to see and buy existing products")
        const name = "NewPoduct";
        const quantity = 10;
        const productId = 0; //The product id is related to its index in the products array. Here we have only one product and its index hence productId is equal to 0

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy a product and check if the ProductBought event is successfully emitted with the given args    
        await expect(store.connect(otherAccount).buyProduct(productId))
            .to.emit(store, "ProductBought")
            .withArgs(productId, otherAccount.address);

    })

    it("Client should not be able to buya a product twice", async function () {
        console.log("Test started... Client should not be able to buya a product twice")
        const name = "NewPoduct";
        const quantity = 10;
        const productId = 0; //The product id is related to its index in the products array. Here we have only one product and its index hence productId is equal to 0

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy a product and check if the ProductBought event is successfully emitted with the given args   
        await expect(store.connect(otherAccount).buyProduct(productId))
            .to.emit(store, "ProductBought")
            .withArgs(productId, otherAccount.address);

        //Calling and Asserting again to check if the otherAccount can buy the product twice. Expect the action to be reverted with the given message
        await expect(store.connect(otherAccount).buyProduct(productId)).to.be.revertedWith("You cannot buy the same product more than once!");

    })

    it("Client should be able to refeund a product", async function () {
        console.log("Test started... Client should be able to refeund a product")
        const name = "NewPoduct";
        const quantity = 10;
        const productId = 0; //The product id is related to its index in the products array. Here we have only one product and its index hence productId is equal to 0

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy a product and check if the ProductBought event is successfully emitted with the given args     
        await expect(store.connect(otherAccount).buyProduct(productId))
            .to.emit(store, "ProductBought")
            .withArgs(productId, otherAccount.address);

        //Calling and Asserting if the otherAccount can refund product successfully and verify that ProductRefund event is successfully emmited with the given args   
        await expect(store.connect(otherAccount).refundProduct(productId))
            .to.emit(store, "ProductRefund")
            .withArgs(productId);
    })


    it("Client should not be able to refund a product that he didn't buy", async function () {
        console.log("Test started... Client should not be able to refund a product that he didn't buy")
        const name = "NewPoduct";
        const quantity = 10;
        const productId = 0; //The product id is related to its index in the products array. Here we have only one product and its index hence productId is equal to 0

        //loading Store contract fixtureq
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can refeund a product that he didint buy. Expect the action to be reverted with the given message.
        await expect(store.connect(otherAccount).refundProduct(productId))
            .to.be.revertedWith("You've already returned your product or didn't even bought it.");
    })


    it("OPTIONAL: Clients should not be able to a product with more quantity than available in the store", async function () {
        console.log("Test started... Clients should not be able to a product with more quantity than available in the store")
        const name = "NewPoduct";
        const quantity = 1; //Quantity of the product
        const productId = 0; //The product id is related to its index in the products array. Here we have only one product and its index hence productId is equal to 0

        //loading Store contract fixture
        const { store, otherAccount, otherAccount2 } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity of 1 and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy a product and check if the ProductBought event is successfully emitted with the given args  
        await expect(store.connect(otherAccount).buyProduct(productId))
            .to.emit(store, "ProductBought")
            .withArgs(productId, otherAccount.address);

        //Calling and Asserting if the otherAccount2 can buy a the same product that is not available anymore. Expect the action to be reverted with the given message.  
        await expect(store.connect(otherAccount2).buyProduct(productId)).to.be.revertedWith("Quantity can't be 0!");

    })

    it("OPTIONAL: Buyers should not be able to return products after a certain period in blocktime: 100 blocks", async function () {
        console.log("Test started... Buyers should not be able to return products after a certain period in blocktime: 100 blocks")
        const name = "NewPoduct";
        const quantity = 10;
        const productId = 0; //The product id is related to its index in the products array. Here we have only one product and its index hence productId is equal to 0
        const blocksTimeToRefund = 99; // Blocks time to be able to refund a product. 
        //QUESTION? - Is it also counting the 1st block? Shouldn't it be 100 instead of 99?? Now the range is 1-99

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy a product and check if the ProductBought event is successfully emitted with the given args    
        await expect(store.connect(otherAccount).buyProduct(productId))
            .to.emit(store, "ProductBought")
            .withArgs(productId, otherAccount.address);

        //Function to mine additional blocks
        async function mineNBlocks(n: number) {
            for (let index = 0; index < n; index++) {
                await ethers.provider.send('evm_mine');
            }
        }

        await mineNBlocks(blocksTimeToRefund);

        //Calling and Asserting if the otherAccount can refund a product after the blocks time to refund has passed. Expect the action to be reverted with the given message.  
        await expect(store.connect(otherAccount).refundProduct(productId))
            .to.be.revertedWith("Sorry, your request for refund has been denied.");
    })
})
