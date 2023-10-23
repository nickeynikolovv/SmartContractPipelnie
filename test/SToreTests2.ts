import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { any } from "hardhat/internal/core/params/argumentTypes";

//Deploys store contract
describe("Store", function () {
    async function deployStore() {

        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();

        const store = await ethers.deployContract("Store");

        return { store, owner, otherAccount, otherAccount2 };
    }

    it("Owner Should be able to add new product", async function () {
        console.log("Test started... Owner Should be able to add new product")
        let name = "NewPoduct";
        let quantity = 10;

        //loading Store contract fixture
        const { store } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);
    })

    it("Owner Should not be able to add new  with 0 quantity", async function () {
        console.log("Test started... Owner Should be able to add new product")
        let name = "NewPoduct";
        let quantity = 0;

        //loading Store contract fixture
        const { store } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the qnatity can be 0
        await expect(store.addProduct(name, quantity))
            .to.be.revertedWith("Quantity can't be 0!");
    })

    it("otherAccount Should not be able to add new product", async function () {
        console.log("Test started... otherAccount Should not be able to add new product")
        let name = "NewPoduct";
        let quantity = 10;

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.connect(otherAccount).addProduct(name, quantity))
            .to.be.reverted;
    })

    it("If the product exists, only the quantity to be updated", async function () {
        console.log("Test started... If the product exists, only the quantity to be updated")
        let name = "NewPoduct";
        let quantity = 10;

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
        let name = "NewPoduct";
        let quantity = 10;
        let newQuantity = 20;

        //loading Store contract fixture
        const { store } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        // Calling updateProductQuantity with id - 0, because it is the only product available
        await expect(store.updateProductQuantity(0, newQuantity))
            .to.emit(store, "ProductUpdated")
            .withArgs(0, name, newQuantity);
    })

    it("Other user should NOT be able to update existing product quantity", async function () {
        console.log("Test started... Other user should NOT be able to update existing product quantity")
        let name = "NewPoduct";
        let quantity = 10;
        let newQuantity = 20;


        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling and Asserting addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if otherAccount would be able to update product quantity. The call should be reverted.
        await expect(store.connect(otherAccount).updateProductQuantity(0, quantity)).to.be.reverted;

        // await expect(store.updateProductQuantity(0, newQuantity))
        //     .to.emit(store, "ProductUpdated")
        //     .withArgs(0, name, newQuantity);

        // const CheckProduct = store.getProductByName(name);
        // console.log("Product id is " + (await (CheckProduct)));
    })

    it("Client should be able to see and buy existing products", async function () {
        console.log("Test started... Client should be able to see and buy existing products")
        let name = "NewPoduct";
        let quantity = 10;
        let productId = 0; //because it is the first and only added product

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy the product    
        await expect(store.connect(otherAccount).buyProduct(productId))
            .to.emit(store, "ProductBought")
            .withArgs(productId, otherAccount.address);

    })

    it("Client should not be able to buya a product twice", async function () {
        console.log("Test started... Client should not be able to buya a product twice")
        let name = "NewPoduct";
        let quantity = 10;
        let productId = 0; //because it is the first and only added product

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy the product    
        await expect(store.connect(otherAccount).buyProduct(productId))
            .to.emit(store, "ProductBought")
            .withArgs(productId, otherAccount.address);

        //Calling and Asserting again to check if the otherAccount can buy the product twice. The call should be reverted
        await expect(store.connect(otherAccount).buyProduct(productId)).to.be.revertedWith("You cannot buy the same product more than once!");

    })

    it("Client should be able to refeund a product", async function () {
        console.log("Test started... Client should be able to refeund a product")
        let name = "NewPoduct";
        let quantity = 10;
        let productId = 0; //because it is the first and only added product

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy the product    
        await expect(store.connect(otherAccount).buyProduct(productId))
            .to.emit(store, "ProductBought")
            .withArgs(productId, otherAccount.address);

        //Calling and Asserting if the otherAccount can buy the product    
        await expect(store.connect(otherAccount).refundProduct(productId))
            .to.emit(store, "ProductRefund")
            .withArgs(productId);
    })


    it("Client should not be able to refund a product that he didn't buy", async function () {
        console.log("Test started... Client should not be able to refund a product that he didn't buy")
        let name = "NewPoduct";
        let quantity = 10;
        let productId = 0; //because it is the first and only added product

        //loading Store contract fixtureq
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy the product    
        await expect(store.connect(otherAccount).refundProduct(productId))
            .to.be.revertedWith("You've already returned your product or didn't even bought it.");
    })


    it("OPTIONAL: Clients should not be able to a product with more quantity than available in the store", async function () {
        console.log("Test started... Client should not be able to buya a product twice")
        let name = "NewPoduct";
        let quantity = 1;
        let productId = 0; //because it is the first and only added product

        //loading Store contract fixture
        const { store, otherAccount, otherAccount2 } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy the product    
        await expect(store.connect(otherAccount).buyProduct(productId))
            .to.emit(store, "ProductBought")
            .withArgs(productId, otherAccount.address);

        //Calling and Asserting again to check if the otherAccount can buy the product twice. The call should be reverted
        await expect(store.connect(otherAccount2).buyProduct(productId)).to.be.revertedWith("Quantity can't be 0!");

    })

    it("Buyers should not be able to return products after a certain period in blocktime: 100 blocks", async function () {
        console.log("Test started... Client should be able to refeund a product")
        let name = "NewPoduct";
        let quantity = 10;
        let productId = 0; //because it is the first and only added product
        let boughtBlockNumber = 10;
        let blocksCountElibiblePeriod = 100;
        const blockTimeToCloseTheRefund = boughtBlockNumber + blocksCountElibiblePeriod;

        //loading Store contract fixture
        const { store, otherAccount } = await loadFixture(deployStore);

        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        //Calling and Asserting if the otherAccount can buy the product    
        await expect(store.connect(otherAccount).buyProduct(productId))
            .to.emit(store, "ProductBought")
            .withArgs(productId, otherAccount.address);

        //Calling and Asserting if the otherAccount can buy the product    
        await expect(store.connect(otherAccount).refundProduct(productId))
            .to.emit(store, "ProductRefund")
            .withArgs(productId);
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















    //Finding the index of the product that is equal to the ID 
    //TODO: To implement index finding into other tests
    it("Test", async function () {
        console.log("Test started... test")
        let name = "NewPoduct";
        let quantity = 10;

        let name1 = "NewPoduct1";
        let quantity1 = 11;

        let name2 = "NewPoduct2";
        let quantity2 = 12;

        let name3 = "NewPoduct3";
        let quantity3 = 13;
        //loading Store contract fixtureq
        const { store, otherAccount } = await loadFixture(deployStore);




        //Calling addProduct with given name and quantity and assert if the event ProductAdded is successfully emitted with the given args
        await expect(store.addProduct(name, quantity))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name, quantity);

        await expect(store.addProduct(name1, quantity1))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name1, quantity1);

        await expect(store.addProduct(name2, quantity2))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name2, quantity2);

        await expect(store.addProduct(name3, quantity3))
            .to.emit(store, "ProductAdded")
            .withArgs(anyValue, name3, quantity3);



        //Calling and Asserting if the otherAccount can buy the product    
        // await expect(store.connect(otherAccount).buyProduct(4))
        //     .to.emit(store, "ProductBought")
        //     .withArgs(4, otherAccount.address);



        //finding the index of the object and pass it as productId

        let productIndex;


        const allProducts = store.getAllProducts();
        console.log("SEGAAA .. . .. . . ")
        async function getIndexFromArray(array: any, _name: string): Promise<number> {
            (await allProducts).forEach(async (product: { name: any; quantity: any; }, index: any) => {
                console.log(`Index ${index}: Name: ${product.name}, Quantity: ${product.quantity}`);
                for (let i = 0; i < array.length; i++) {
                    if (product.name === (_name)) {
                        console.log("PRAVILNIQ INDEX OTNOVO E " + i)
                        return i;
                    } else {
                        return -1;
                    }
                }
                return -1;
            }
            )
            return -1;
        }

        const index = getIndexFromArray(await allProducts, name3).then();
        // console.log("ARE BE BATE" + ind);
        // function resolve(array: any, name: string) {
        //     const index = getIndexFromArray(allProducts, name3);
        //     return index;
        // }




        //  console.log("INDESAAA EEEEEEEE e " + resolve(allProducts, name3));


        // console.log("LETSE SSEEEE");
        // (await allProducts).forEach(async (product: { name: any; quantity: any; }, index: any) => {
        //     console.log(`Index ${index}: Name: ${product.name}, Quantity: ${product.quantity}`);
        // });



        // async function getIndexOfTheProduct(nameOfTheProduct: string, productsArray: any[]) {
        //     (await productsArray).forEach(async (product: { name: any; quantity: any; }, index: any) => {
        //         let newIndex;
        //         if (product.name === name1) {
        //             console.log("PRAVILNIQ INDEX E " + index)
        //             newIndex = index;
        //             return newIndex;
        //         } else {
        //             console.log("NQMA PRAVILEN INDEX ")
        //         }
        //     });
        // }

        // let index = getIndexFromArray(await allProducts, name2);
        // console.log("NAJ NAKRAQ INDEKSAAA EEEEEE " + Number(index));

        // console.log("LETSE SSEEEE2");
        // (await allProducts).forEach(async (product: { name: any; quantity: any; }, index: any) => {
        //     if (product.name === name1) {
        //         console.log("PRAVILNIQ INDEX E " + index)
        //     } else {
        //         console.log("NQMA PRAVILEN INDEX ")
        //     }
        // });




        // //console.log("INDESAAA EEEEEEEE e " + indexOftheProduct)

        // async function getIndexFromArray(array: any) {
        //     (await allProducts).forEach(async (product: { name: any; quantity: any; }, index: any) => {
        //         console.log(`Index ${index}: Name: ${product.name}, Qu§antity: ${product.quantity}`);
        //         const indexOfTheProduct = index;
        //         return indexOfTheProduct;
        //     }




        //const indexOfTheProduct = getIndexFromArray(await allProducts){



        //console.log((await indexOfTheProduct).)
        //const getIndex = 

        // const arrayAsString = (await allProducts).join('-')
        // console.log(arrayAsString);

        // store.getProductByName



        // async function getIndexFromArray(array: any[], element: any): Promise<number> {
        //     for (let i = 0; i < array.length; i++) {
        //         if (array[i] === element) {
        //             return i;
        //         }
        //     }
        //     return -1; // Element not found
        // }

        //const indexOfNewProduct = getIndexFromArray(await allProducts, name3);

        //  console.log("INDESAAA EEEEEEEE e " + (await indexOfNewProduct).valueOf);



        // async function getIndexOfProduct(elementToFind: string): Promise<number> {
        //     const allProducts = store.getAllProducts();
        //     const index = (await allProducts).findIndex((product) => product.name === elementToFind);
        //     return index;
        // }

        // // const allProducts = store.getAllProducts();
        // // const index = (await allProducts).findIndex(name2);



        // const indexOfProduct = getIdndexFromArray(allProducts, name2);
        // console.log("Indexcheto e " + indexOfProduct);




        //const productToUpdate = store.getProductByName(name2);
        // const indexOfProduct = productToUpdate.indexOf(name2);







        //(await allProducts).indexOf(name2);
        // console.log((await productToUpdate).name)



        // async function findProductIdFromIndexByName(_name: string): Promise<number> {
        //     const productToUpdate = await store.getProductByName(_name);
        //     const indexOfProduct = productToUpdate.indexOf(name);
        //     return indexOfProduct;
        // }

        //const prodductId = await findProductIdFromIndexByName(name2);


        // async function getProductId(_name: string): Promise<number> {
        //     const productToUpdate = store.getProductByName(_name);
        //     const productIndex = (await productToUpdate).indexOf(_name);
        //     return productIndex;
        // };

        // const idOfTheProduct = getProductId(name);
        //console.log("Product Index isssss " + (indexOfProduct));

        //Calling and Asserting if the otherAccount can buy the product    
        // await expect(store.connect(otherAccount).refundProduct(productId))
        //     .to.be.revertedWith("You've already returned your product or didn't even bought it.")
    })
})
